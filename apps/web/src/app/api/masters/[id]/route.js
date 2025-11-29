import sql from "@/app/api/utils/sql";

// Get single master with their content and sessions
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const [masterResult, contentRows, sessions] = await sql.transaction([
      sql`SELECT * FROM masters WHERE id = ${id}`,
      sql`SELECT * FROM content WHERE master_id = ${id} ORDER BY created_at DESC`,
      sql`SELECT * FROM sessions WHERE master_id = ${id} AND status = 'available' ORDER BY scheduled_at ASC`,
    ]);

    if (masterResult.length === 0) {
      return Response.json({ error: "Master not found" }, { status: 404 });
    }

    let content = contentRows;
    if (email) {
      const [platformRows, subs] = await sql.transaction([
        sql`SELECT 1 FROM platform_subscriptions WHERE student_email = ${email} AND status = 'active' LIMIT 1`,
        sql`SELECT master_id FROM subscriptions WHERE student_email = ${email} AND status = 'active'`,
      ]);
      const platformActive = platformRows.length > 0;
      const allowedMasters = new Set(subs.map((s) => s.master_id));
      content = contentRows.map((item) => ({
        ...item,
        accessible:
          item.is_free ||
          (platformActive && allowedMasters.has(item.master_id)),
      }));
    }

    return Response.json({
      master: masterResult[0],
      content,
      sessions,
    });
  } catch (error) {
    console.error("Error fetching master:", error);
    return Response.json({ error: "Failed to fetch master" }, { status: 500 });
  }
}
