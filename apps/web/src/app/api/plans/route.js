import sql from "@/app/api/utils/sql";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await sql`
      SELECT tier, price_cents, description 
      FROM platform_plans 
      WHERE is_active = true 
      ORDER BY price_cents ASC
    `;
    return Response.json({ plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    // Return fallback plans if DB fails
    const fallbackPlans = [
      { tier: "free", price_cents: 0, description: "Basic access" },
      { tier: "starter", price_cents: 999, description: "Starter Plan" },
      { tier: "pro", price_cents: 1999, description: "Pro Plan" },
    ];
    return Response.json({ plans: fallbackPlans });
  }
}
