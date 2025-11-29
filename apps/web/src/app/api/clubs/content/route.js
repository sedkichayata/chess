import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { track_id, title, type, url, body_text, is_locked } = body;

    if (!track_id || !title || !type) {
      return Response.json(
        { error: "Track ID, Title, and Type are required" },
        { status: 400 },
      );
    }

    const [content] = await sql`
      INSERT INTO club_content (track_id, title, type, url, body_text, is_locked)
      VALUES (${track_id}, ${title}, ${type}, ${url}, ${body_text}, ${is_locked ?? true})
      RETURNING *
    `;

    return Response.json({ content, message: "Content added successfully" });
  } catch (error) {
    console.error("Error adding content:", error);
    return Response.json({ error: "Failed to add content" }, { status: 500 });
  }
}
