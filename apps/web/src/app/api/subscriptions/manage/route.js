import sql from "@/app/api/utils/sql";
import Stripe from "stripe";

// Prefer user-provided STRIPE secret, fallback to platform default
const STRIPE_KEY = process.env.STRIPE || process.env.STRIPE_SECRET_KEY;

export async function POST(request) {
  // Early validation for Stripe key
  if (!STRIPE_KEY) {
    console.error("Stripe not configured: missing secret key");
    return Response.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(STRIPE_KEY);
  try {
    const { action, email, tier, stripe_subscription_id } =
      await request.json();
    if (!action) {
      return Response.json({ error: "action required" }, { status: 400 });
    }

    if (action === "cancel_platform") {
      if (!stripe_subscription_id)
        return Response.json(
          { error: "stripe_subscription_id required" },
          { status: 400 },
        );
      await stripe.subscriptions.update(stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      await sql`UPDATE platform_subscriptions SET status = 'cancelled' WHERE stripe_subscription_id = ${stripe_subscription_id}`;
      return Response.json({ ok: true });
    }

    if (action === "change_tier") {
      if (!email || !tier)
        return Response.json(
          { error: "email and tier required" },
          { status: 400 },
        );
      const subs =
        await sql`SELECT * FROM platform_subscriptions WHERE student_email = ${email} AND status = 'active' ORDER BY started_at DESC LIMIT 1`;
      if (!subs.length)
        return Response.json(
          { error: "No active platform subscription" },
          { status: 400 },
        );
      const current = subs[0];

      // Find price for target tier
      const rows =
        await sql`SELECT price_cents FROM platform_plans WHERE LOWER(tier) = ${tier.toLowerCase()} AND is_active = true`;
      if (!rows.length)
        return Response.json({ error: "Plan not found" }, { status: 400 });
      const priceCents = rows[0].price_cents;

      // Change subscription by updating price through Stripe by creating a new price on the fly
      const price = await stripe.prices.create({
        unit_amount: priceCents,
        currency: "usd",
        recurring: { interval: "month" },
        product_data: { name: `${tier} Plan` },
      });

      const sub = await stripe.subscriptions.retrieve(
        current.stripe_subscription_id,
      );
      const itemId = sub.items.data[0].id;
      await stripe.subscriptionItems.update(itemId, {
        price: price.id,
        proration_behavior: "create_prorations",
      });

      await sql`UPDATE platform_subscriptions SET tier = ${tier} WHERE id = ${current.id}`;
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to manage subscription" },
      { status: 500 },
    );
  }
}
