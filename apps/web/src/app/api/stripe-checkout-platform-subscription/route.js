import {
  stripe,
  getTierPrice,
  getBaseUrl,
  makeAbsolute,
  getOrCreateStripeCustomer,
  getReferralDiscount,
} from "@/app/api/utils/stripe-helpers";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  if (!stripe) {
    console.error("Stripe not configured: missing secret key");
    return Response.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { studentEmail, tier = "starter", redirectURL, referralCode } = body;

    if (!studentEmail || !redirectURL) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const baseUrl = getBaseUrl(request);
    const successCancelBase = makeAbsolute(redirectURL, baseUrl);

    if (!/^https?:\/\//i.test(successCancelBase)) {
      return Response.json(
        { error: "redirectURL must be absolute" },
        { status: 400 },
      );
    }

    // Special handling for Free tier to be more resilient
    if (tier.toLowerCase() === "free") {
      try {
        await sql`
          INSERT INTO platform_subscriptions (student_email, tier, status, started_at)
          VALUES (${studentEmail}, ${tier}, 'active', NOW())
          ON CONFLICT (student_email) 
          DO UPDATE SET tier = EXCLUDED.tier, status = 'active', expires_at = NULL, stripe_subscription_id = NULL
        `;
      } catch (dbError) {
        console.error(
          "Database error recording free subscription (proceeding anyway):",
          dbError,
        );
        // We proceed to return success even if DB write fails, to unblock the user
      }
      return Response.json({ success: true });
    }

    // Check plan in DB
    let plan;
    try {
      const plans =
        await sql`SELECT * FROM platform_plans WHERE tier = ${tier} AND is_active = true`;
      if (plans.length > 0) {
        plan = plans[0];
      }
    } catch (dbError) {
      console.error("Database error fetching plans:", dbError);
      // Fallback if DB fails but tier is standard
      if (tier === "starter")
        plan = { price_cents: 999, description: "Starter Plan" };
      else if (tier === "pro")
        plan = { price_cents: 1999, description: "Pro Plan" };
    }

    if (!plan) {
      return Response.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Handle Free Tier (from DB check)
    if (plan.price_cents === 0) {
      try {
        await sql`
          INSERT INTO platform_subscriptions (student_email, tier, status, started_at)
          VALUES (${studentEmail}, ${tier}, 'active', NOW())
          ON CONFLICT (student_email) 
          DO UPDATE SET tier = EXCLUDED.tier, status = 'active', expires_at = NULL, stripe_subscription_id = NULL
        `;
      } catch (dbError) {
        console.error("Database error recording free subscription:", dbError);
        // Proceed anyway
      }
      return Response.json({ success: true });
    }

    // Get or create customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      studentEmail,
      "Chess Student",
    );

    // Optional referral coupon
    const { discounts, couponId } = await getReferralDiscount(referralCode);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: plan.description || `${tier} Plan` },
            recurring: { interval: "month" },
            unit_amount: plan.price_cents,
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 30,
      },
      ...(discounts ? { discounts } : {}),
      success_url: `${successCancelBase}?session_id={CHECKOUT_SESSION_ID}&type=platform&tier=${tier}`,
      cancel_url: successCancelBase,
      metadata: {
        type: "platform",
        platform_tier: tier,
        user_email: studentEmail,
        referral_code: referralCode || "",
        coupon_id: couponId || "",
      },
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    const safe = {
      message: error?.message || "Unknown Stripe error",
      type: error?.type || error?.name || "",
      statusCode: error?.statusCode || error?.status || 500,
    };
    console.error("Stripe platform subscription error details:", safe);
    return Response.json(
      { error: "Payment processing failed", details: safe.message },
      { status: 500 },
    );
  }
}
