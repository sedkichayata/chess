import sql from "@/app/api/utils/sql";
import Stripe from "stripe";

// Prefer user-provided STRIPE secret, fallback to platform default
const STRIPE_KEY = process.env.STRIPE || process.env.STRIPE_SECRET_KEY;

export async function POST(request) {
  if (!STRIPE_KEY) {
    console.error("Stripe not configured: missing secret key");
    return Response.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(STRIPE_KEY);

  try {
    const { sessionId, type, masterId, bookingSessionId } =
      await request.json();

    if (!sessionId || !type) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return Response.json({ success: false, status: session.payment_status });
    }

    const userEmail = session.metadata.user_email;

    // If referral code present, increment usage
    const referralCode = session.metadata?.referral_code;
    if (referralCode) {
      await sql`UPDATE referrals SET used_count = used_count + 1 WHERE code = ${referralCode}`;
    }

    if (type === "platform") {
      // Platform subscription only
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription,
      );
      const tier = session.metadata?.platform_tier || "starter";

      const existing =
        await sql`SELECT id FROM platform_subscriptions WHERE student_email = ${userEmail} AND status = 'active' LIMIT 1`;
      if (existing.length > 0) {
        await sql`
          UPDATE platform_subscriptions
          SET stripe_subscription_id = ${subscription.id}, stripe_payment_status = 'paid', status = 'active', started_at = NOW(), trial_end = ${subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null}, tier = ${tier}
          WHERE id = ${existing[0].id}
        `;
      } else {
        await sql`
          INSERT INTO platform_subscriptions (student_email, tier, stripe_subscription_id, stripe_payment_status, status, started_at, trial_end)
          VALUES (${userEmail}, ${tier}, ${subscription.id}, 'paid', 'active', NOW(), ${subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null})
        `;
      }
      return Response.json({ success: true, type: "platform" });
    }

    if (type === "subscription") {
      // Combined or master-only subscription
      const includePlatform = session.metadata?.include_platform === "1";
      const tier = session.metadata?.platform_tier || "starter";
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription,
      );

      if (!masterId) {
        return Response.json(
          { error: "Master ID required for subscription" },
          { status: 400 },
        );
      }

      // Ensure only one active master subscription per (email, master)
      await sql`UPDATE subscriptions SET status = 'cancelled' WHERE student_email = ${userEmail} AND master_id = ${masterId} AND status = 'active'`;
      await sql`
        INSERT INTO subscriptions (master_id, student_name, student_email, stripe_subscription_id, stripe_payment_status, status, started_at, expires_at)
        VALUES (${masterId}, 'Chess Student', ${userEmail}, ${subscription.id}, 'paid', 'active', NOW(), ${subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null})
      `;

      if (includePlatform) {
        const existingP =
          await sql`SELECT id FROM platform_subscriptions WHERE student_email = ${userEmail} AND status = 'active' LIMIT 1`;
        if (existingP.length > 0) {
          await sql`
            UPDATE platform_subscriptions
            SET stripe_subscription_id = ${subscription.id}, stripe_payment_status = 'paid', status = 'active', started_at = NOW(), trial_end = ${subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null}, tier = ${tier}
            WHERE id = ${existingP[0].id}
          `;
        } else {
          await sql`
            INSERT INTO platform_subscriptions (student_email, tier, stripe_subscription_id, stripe_payment_status, status, started_at, trial_end)
            VALUES (${userEmail}, ${tier}, ${subscription.id}, 'paid', 'active', NOW(), ${subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null})
          `;
        }
      }

      return Response.json({ success: true, type: "subscription" });
    } else if (type === "booking") {
      // Handle session booking payment
      if (!bookingSessionId) {
        return Response.json(
          { error: "Session ID required for booking" },
          { status: 400 },
        );
      }

      // Create booking
      const booking = await sql`
        INSERT INTO bookings (session_id, student_name, student_email, stripe_payment_intent_id, stripe_payment_status, booking_status, payment_status)
        VALUES (${bookingSessionId}, 'Chess Student', ${userEmail}, ${session.payment_intent}, 'paid', 'confirmed', 'paid')
        RETURNING *
      `;

      return Response.json({
        success: true,
        type: "booking",
        booking: booking[0],
      });
    }

    return Response.json({ error: "Invalid payment type" }, { status: 400 });
  } catch (error) {
    console.error("Payment verification error:", error);
    return Response.json(
      { error: "Payment verification failed" },
      { status: 500 },
    );
  }
}
