import sql from "@/app/api/utils/sql";

// Get all masters
export async function GET(request) {
  try {
    const masters = await sql`
      SELECT * FROM masters
      ORDER BY rating DESC
    `;

    return Response.json({ masters });
  } catch (error) {
    console.error("Error fetching masters:", error);
    return Response.json({ error: "Failed to fetch masters" }, { status: 500 });
  }
}
