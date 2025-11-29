import sql from "@/app/api/utils/sql";
import Stripe from "stripe";

// Prefer user-provided STRIPE secret, fallback to platform default
const STRIPE_KEY = process.env.STRIPE || process.env.STRIPE_SECRET_KEY;

export async function POST(request) {
  // Validate Stripe key early
  if (!STRIPE_KEY) {
    console.error("Stripe not configured: missing secret key");
    return Response.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(STRIPE_KEY);

  try {
    const { sessionId, studentEmail, redirectURL } = await request.json();

    if (!sessionId || !studentEmail || !redirectURL) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get session details
    const sessions = await sql`SELECT * FROM sessions WHERE id = ${sessionId}`;
    if (sessions.length === 0) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const session = sessions[0];

    // Get master details
    const masters =
      await sql`SELECT * FROM masters WHERE id = ${session.master_id}`;
    const master = masters[0];

    // Get or create user
    let users = await sql`SELECT * FROM users WHERE email = ${studentEmail}`;
    let user;

    if (users.length === 0) {
      const newUsers = await sql`
        INSERT INTO users (email, name) 
        VALUES (${studentEmail}, 'Chess Student')
        RETURNING *
      `;
      user = newUsers[0];
    } else {
      user = users[0];
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: studentEmail,
        name: user.name,
      });
      stripeCustomerId = customer.id;

      await sql`
        UPDATE users 
        SET stripe_customer_id = ${stripeCustomerId}
        WHERE id = ${user.id}
      `;
    }

    // Create checkout session for one-time payment
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${session.title} with ${master.name}`,
              description: `${session.session_type} session - ${session.duration_minutes} minutes`,
            },
            unit_amount: Math.round(parseFloat(session.price) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}&type=booking&booking_session_id=${sessionId}`,
      cancel_url: redirectURL,
      metadata: {
        type: "booking",
        session_id: sessionId,
        user_email: studentEmail,
      },
    });

    return Response.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Stripe session booking error:", error);
    return Response.json(
      { error: "Payment processing failed" },
      { status: 500 },
    );
  }
}
