import sql from "@/app/api/utils/sql";

// Get all available sessions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const masterId = searchParams.get("masterId");
    const sessionType = searchParams.get("type");

    let query = `
      SELECT s.*, m.name as master_name, m.title as master_title, m.profile_image as master_image
      FROM sessions s
      JOIN masters m ON s.master_id = m.id
      WHERE s.status = 'available'
    `;
    const values = [];
    let paramCount = 1;

    if (masterId) {
      query += ` AND s.master_id = $${paramCount}`;
      values.push(masterId);
      paramCount++;
    }

    if (sessionType) {
      query += ` AND s.session_type = $${paramCount}`;
      values.push(sessionType);
      paramCount++;
    }

    query += ` ORDER BY s.scheduled_at ASC`;

    const sessions = await sql(query, values);

    return Response.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}
