import sql from "@/app/api/utils/sql";
import { requireAdmin, forbiddenResponse } from "@/app/api/utils/auth-helper";

export async function GET(request) {
  // Require admin authentication
  const session = await requireAdmin(request);
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    let query = `
      SELECT u.id, u.email, u.name, u.chesscom_username, u.chess_rapid_elo, u.chess_blitz_elo, u.chess_bullet_elo, u.last_chess_sync_at,
             COALESCE(ps.status, 'none') AS platform_status, ps.tier as platform_tier, ps.stripe_subscription_id as platform_stripe_subscription_id
      FROM users u
      LEFT JOIN LATERAL (
        SELECT status, tier, stripe_subscription_id FROM platform_subscriptions ps2 
        WHERE ps2.student_email = u.email 
        ORDER BY started_at DESC LIMIT 1
      ) ps ON TRUE
    `;
    const values = [];
    if (q) {
      query += ` WHERE LOWER(u.email) LIKE LOWER($1)`;
      values.push(`%${q}%`);
    }
    query += ` ORDER BY u.created_at DESC LIMIT 100`;
    const rows = await sql(query, values);
    return Response.json({ users: rows });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to list users" }, { status: 500 });
  }
}

// Added POST to create or upsert a user and (optionally) create a Stripe test customer
export async function POST(request) {
  // Require admin authentication
  const session = await requireAdmin(request);
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim() || null;

    if (!email || !email.includes("@")) {
      return Response.json(
        { error: "A valid email is required" },
        { status: 400 },
      );
    }

    // 1) Create or fetch the user
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    let user = existing[0] || null;

    if (!user) {
      const inserted = await sql`
        INSERT INTO users (email, name)
        VALUES (${email}, ${name})
        RETURNING *
      `;
      user = inserted[0];
    } else if (name && user.name !== name) {
      const updated = await sql`
        UPDATE users
        SET name = ${name}
        WHERE id = ${user.id}
        RETURNING *
      `;
      user = updated[0];
    }

    // 2) Create Stripe customer in test mode (no charges)
    const stripeKey =
      process.env.STRIPE || process.env.STRIPE_SECRET_KEY || null;
    let stripe = {
      created: false,
      id: user?.stripe_customer_id || null,
      mode: "absent",
    };

    if (!stripeKey) {
      // Stripe not configured
      stripe.mode = "absent";
    } else if (user.stripe_customer_id) {
      // Already linked
      stripe = {
        created: false,
        id: user.stripe_customer_id,
        mode: stripeKey.startsWith("sk_live_")
          ? "live"
          : stripeKey.startsWith("sk_test_")
            ? "test"
            : "unknown",
      };
    } else {
      try {
        const form = new URLSearchParams();
        form.set("email", email);
        if (name) form.set("name", name);

        const resp = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.toString(),
        });

        if (!resp.ok) {
          const errTxt = await resp.text();
          console.error("Stripe create customer failed:", resp.status, errTxt);
          return Response.json(
            {
              error: "Failed to create Stripe customer",
              details: `Stripe responded ${resp.status}`,
            },
            { status: 502 },
          );
        }

        const stripeCustomer = await resp.json();

        // Save stripe_customer_id
        const updated = await sql`
          UPDATE users SET stripe_customer_id = ${stripeCustomer.id}
          WHERE id = ${user.id}
          RETURNING *
        `;
        user = updated[0];
        stripe = {
          created: true,
          id: stripeCustomer.id,
          mode: stripeKey.startsWith("sk_live_")
            ? "live"
            : stripeKey.startsWith("sk_test_")
              ? "test"
              : "unknown",
        };
      } catch (err) {
        console.error("Stripe error:", err);
        return Response.json(
          { error: "Stripe error while creating customer" },
          { status: 500 },
        );
      }
    }

    return Response.json({ user, stripe });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to create test user" },
      { status: 500 },
    );
  }
}
