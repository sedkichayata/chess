import sql from "@/app/api/utils/sql";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if club exists and get price
    const [club] = await sql`SELECT * FROM clubs WHERE id = ${id}`;
    if (!club) {
      return Response.json({ error: "Club not found" }, { status: 404 });
    }

    // Check if already a member
    const [existing] = await sql`
      SELECT * FROM club_memberships WHERE club_id = ${id} AND user_id = ${user_id}
    `;
    if (existing) {
      return Response.json({
        message: "Already a member",
        membership: existing,
      });
    }

    // Logic for paid vs free
    if (club.monthly_price_cents > 0) {
      // In a real app, we would create a Stripe Checkout Session here
      // For now, we will just return a message saying payment is required
      // The frontend should handle this by redirecting to a payment route if we implemented it

      // Let's assume for this MVP we might just allow joining for testing or return a specialized response
      return Response.json({
        requires_payment: true,
        price_cents: club.monthly_price_cents,
        message: "Payment required to join this club.",
      });
    }

    // Free club - just join
    const [membership] = await sql`
      INSERT INTO club_memberships (club_id, user_id, role, status)
      VALUES (${id}, ${user_id}, 'member', 'active')
      RETURNING *
    `;

    return Response.json({ membership, message: "Joined club successfully" });
  } catch (error) {
    console.error("Error joining club:", error);
    return Response.json({ error: "Failed to join club" }, { status: 500 });
  }
}
