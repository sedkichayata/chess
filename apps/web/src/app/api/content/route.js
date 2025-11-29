import sql from "@/app/api/utils/sql";

// Get all content (feed)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const masterId = searchParams.get("masterId");
    const freeOnly = searchParams.get("freeOnly") === "true";
    const email = searchParams.get("email");

    let query = `
      SELECT c.*, m.name as master_name, m.title as master_title, m.profile_image as master_image
      FROM content c
      JOIN masters m ON c.master_id = m.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (masterId) {
      query += ` AND c.master_id = $${paramCount}`;
      values.push(masterId);
      paramCount++;
    }

    if (freeOnly) {
      query += ` AND c.is_free = true`;
    }

    query += ` ORDER BY c.created_at DESC`;

    const content = await sql(query, values);

    if (!email) {
      return Response.json({
        content: content.map((c) => ({ ...c, accessible: !!c.is_free })),
      });
    }

    // Determine access rights
    const [platformRows, subs] = await sql.transaction([
      sql`SELECT 1 FROM platform_subscriptions WHERE student_email = ${email} AND status = 'active' LIMIT 1`,
      sql`SELECT master_id FROM subscriptions WHERE student_email = ${email} AND status = 'active'`,
    ]);
    const platformActive = platformRows.length > 0;
    const allowedMasters = new Set(subs.map((s) => s.master_id));

    const withAccess = content.map((item) => {
      const accessible =
        item.is_free || (platformActive && allowedMasters.has(item.master_id));
      return { ...item, accessible };
    });

    return Response.json({ content: withAccess });
  } catch (error) {
    console.error("Error fetching content:", error);
    return Response.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
