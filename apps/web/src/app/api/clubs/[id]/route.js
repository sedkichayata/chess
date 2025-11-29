import sql from "@/app/api/utils/sql";
import { requireAdmin, forbiddenResponse } from "@/app/api/utils/auth-helper";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Get club details
    const [club] = await sql`
      SELECT c.*, u.name as owner_name, m.name as master_name, m.profile_image as master_image
      FROM clubs c
      LEFT JOIN users u ON c.owner_id = u.id
      LEFT JOIN masters m ON c.master_profile_id = m.id
      WHERE c.id = ${id}
    `;

    if (!club) {
      return Response.json({ error: "Club not found" }, { status: 404 });
    }

    // Get tracks
    const tracks = await sql`
      SELECT * FROM club_tracks
      WHERE club_id = ${id}
      ORDER BY sort_order ASC
    `;

    // Get content
    const content = await sql`
      SELECT c.*, t.id as track_id
      FROM club_content c
      JOIN club_tracks t ON c.track_id = t.id
      WHERE t.club_id = ${id}
      ORDER BY c.created_at DESC
    `;

    // Attach content to tracks
    const tracksWithContent = tracks.map((track) => ({
      ...track,
      content: content.filter((c) => c.track_id === track.id),
    }));

    let membership = null;
    if (userId) {
      const [mem] = await sql`
        SELECT * FROM club_memberships
        WHERE club_id = ${id} AND user_id = ${userId}
      `;
      membership = mem;
    }

    return Response.json({ club, tracksWithContent, membership });
  } catch (error) {
    console.error("Error fetching club details:", error);
    return Response.json(
      { error: "Failed to fetch club details" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  // Require admin authentication
  const session = await requireAdmin(request);
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { is_verified } = body;

    const [updated] = await sql`
      UPDATE clubs
      SET is_verified = ${is_verified}
      WHERE id = ${id}
      RETURNING *
    `;

    return Response.json({ club: updated });
  } catch (error) {
    console.error("Error updating club:", error);
    return Response.json({ error: "Failed to update club" }, { status: 500 });
  }
}
