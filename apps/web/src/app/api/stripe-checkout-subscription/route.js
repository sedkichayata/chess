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

  try {
    const {
      masterId,
      studentEmail,
      redirectURL,
      tier = "starter",
      referralCode,
    } = await request.json();

    if (!masterId || !studentEmail || !redirectURL) {
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

    // Get master details
    const masters = await sql`SELECT * FROM masters WHERE id = ${masterId}`;
    if (masters.length === 0) {
      return Response.json({ error: "Master not found" }, { status: 404 });
    }
    const master = masters[0];

    // Get or create customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      studentEmail,
      "Chess Student",
    );

    // Determine if platform subscription is already active
    const activePlatform = await sql`
      SELECT 1 FROM platform_subscriptions 
      WHERE student_email = ${studentEmail} AND status = 'active' LIMIT 1`;

    const includePlatform = activePlatform.length === 0;

    // Optional referral coupon
    const { discounts, couponId } = await getReferralDiscount(referralCode);

    const line_items = [];

    if (includePlatform) {
      // Check DB for plan price
      const plans =
        await sql`SELECT * FROM platform_plans WHERE tier = ${tier} AND is_active = true`;
      let priceCents = 0;
      let description = "Platform Plan";

      if (plans.length > 0) {
        priceCents = plans[0].price_cents;
        description = plans[0].description || `${tier} Plan`;
      } else {
        const p = getTierPrice(tier);
        priceCents = p.cents;
        description = p.name;
      }

      // Only add line item if price > 0
      if (priceCents > 0) {
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: { name: description },
            recurring: { interval: "month" },
            unit_amount: priceCents,
          },
          quantity: 1,
        });
      }
    }

    // Master subscription line item
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: `${master.name} - Monthly Subscription`,
          description: `Access exclusive content and priority booking for ${master.name}`,
        },
        recurring: { interval: "month" },
        unit_amount: Math.round(parseFloat(master.monthly_price) * 100),
      },
      quantity: 1,
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items,
      mode: "subscription",
      subscription_data: includePlatform
        ? { trial_period_days: 30 }
        : undefined,
      ...(discounts ? { discounts } : {}),
      success_url: `${successCancelBase}?session_id={CHECKOUT_SESSION_ID}&type=subscription&master_id=${masterId}&include_platform=${includePlatform ? "1" : "0"}&tier=${tier}`,
      cancel_url: successCancelBase,
      metadata: {
        type: "subscription",
        master_id: String(masterId),
        include_platform: includePlatform ? "1" : "0",
        platform_tier: includePlatform ? tier : "",
        user_email: studentEmail,
        referral_code: referralCode || "",
        coupon_id: couponId || "",
      },
    });

    return Response.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    const safe = {
      message: error?.message || "Unknown Stripe error",
      type: error?.type || error?.name || "",
      statusCode: error?.statusCode || error?.status || 500,
    };
    console.error("Stripe session booking error details:", safe);
    return Response.json(
      { error: "Payment processing failed", details: safe.message },
      { status: 500 },
    );
  }
}
