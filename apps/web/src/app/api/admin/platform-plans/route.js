import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const plans =
      await sql`SELECT tier, price_cents, description, is_active, created_at FROM platform_plans ORDER BY price_cents ASC`;
    return Response.json({ plans });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to list plans" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tier, price_cents, description, is_active = true } = body;
    if (!tier || typeof price_cents !== "number") {
      return Response.json(
        { error: "tier and price_cents required" },
        { status: 400 },
      );
    }
    const [plan] = await sql`
      INSERT INTO platform_plans (tier, price_cents, description, is_active)
      VALUES (${tier.toLowerCase()}, ${price_cents}, ${description || null}, ${is_active})
      ON CONFLICT (tier) DO UPDATE SET price_cents = EXCLUDED.price_cents, description = EXCLUDED.description, is_active = EXCLUDED.is_active
      RETURNING tier, price_cents, description, is_active, created_at
    `;
    return Response.json({ plan });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to upsert plan" }, { status: 500 });
  }
}
