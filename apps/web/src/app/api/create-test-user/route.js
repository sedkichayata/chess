import { hash } from "argon2";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const email = "testuser@chessmaster.com";
    const password = "password123";
    const name = "Test Chess Student";

    // 1. Create or Update App User (public.users)
    let appUser = (await sql`SELECT * FROM users WHERE email = ${email}`)[0];

    if (!appUser) {
      const inserted = await sql`
        INSERT INTO users (email, name)
        VALUES (${email}, ${name})
        RETURNING *
      `;
      appUser = inserted[0];
    } else {
      // Optional: Update name if needed
      const updated = await sql`
            UPDATE users SET name = ${name} WHERE id = ${appUser.id} RETURNING *
        `;
      appUser = updated[0];
    }

    // 2. Handle Stripe Customer (if Stripe is configured)
    const stripeKey = process.env.STRIPE || process.env.STRIPE_SECRET_KEY;
    let stripeData = { created: false, mode: "absent", id: null };

    if (stripeKey) {
      if (appUser.stripe_customer_id) {
        stripeData = {
          created: false,
          id: appUser.stripe_customer_id,
          mode: stripeKey.startsWith("sk_live_") ? "live" : "test",
        };
      } else {
        try {
          const form = new URLSearchParams();
          form.set("email", email);
          form.set("name", name);

          const stripeRes = await fetch("https://api.stripe.com/v1/customers", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: form.toString(),
          });

          if (stripeRes.ok) {
            const customer = await stripeRes.json();
            await sql`
                    UPDATE users SET stripe_customer_id = ${customer.id} WHERE id = ${appUser.id}
                `;
            stripeData = {
              created: true,
              id: customer.id,
              mode: stripeKey.startsWith("sk_live_") ? "live" : "test",
            };
          } else {
            console.error("Stripe creation failed:", await stripeRes.text());
            // Don't fail the whole process, just log
            stripeData.error = "Stripe creation failed";
          }
        } catch (err) {
          console.error("Stripe error:", err);
          stripeData.error = "Stripe error";
        }
      }
    }

    // 3. Create or Update Auth User (public.auth_users)
    let authUser = (
      await sql`SELECT * FROM auth_users WHERE email = ${email}`
    )[0];

    if (!authUser) {
      const inserted = await sql`
        INSERT INTO auth_users (name, email, "emailVerified", image)
        VALUES (${name}, ${email}, NOW(), NULL)
        RETURNING *
      `;
      authUser = inserted[0];
    }

    // 4. Create or Update Auth Account (public.auth_accounts)
    // We need to ensure a credentials account exists for this user
    const existingAccount = (
      await sql`
      SELECT * FROM auth_accounts 
      WHERE "userId" = ${authUser.id} AND provider = 'credentials'
    `
    )[0];

    const hashedPassword = await hash(password);
    const providerAccountId = authUser.id.toString(); // Usually UUID, but here using ID

    if (!existingAccount) {
      await sql`
        INSERT INTO auth_accounts (
          "userId", type, provider, "providerAccountId", 
          password, token_type
        ) VALUES (
          ${authUser.id}, 'credentials', 'credentials', ${providerAccountId},
          ${hashedPassword}, 'bearer'
        )
      `;
    } else {
      await sql`
        UPDATE auth_accounts 
        SET password = ${hashedPassword}
        WHERE id = ${existingAccount.id}
      `;
    }

    return Response.json({
      success: true,
      credentials: {
        email,
        password,
      },
      appUser,
      stripe: stripeData,
      message:
        "Test user created successfully! You can now sign in with the provided credentials.",
    });
  } catch (error) {
    console.error("Create test user error:", error);
    return Response.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
