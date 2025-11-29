import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "rapid";

  // Map type to column name
  const eloColumnMap = {
    rapid: "chess_rapid_elo",
    blitz: "chess_blitz_elo",
    bullet: "chess_bullet_elo",
  };

  const eloColumn = eloColumnMap[type];

  if (!eloColumn) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    // We use sql function notation for dynamic column ordering to be safe,
    // but since we mapped it from a strict allowlist above, we can also just interpolate carefully
    // or use a safe dynamic query approach.
    // However, `sql` template tag doesn't support dynamic identifiers easily for columns in ORDER BY
    // without potentially using unsafe interpolation if not careful.
    // simpler approach: write the query to select where the column is not null

    // For safety with this specific sql helper, we'll use a switch or if/else to pick the query
    // This is verbose but safe against injection if the sql helper doesn't support identifier escaping easily.

    let users;

    if (type === "rapid") {
      users = await sql`
        SELECT id, name, chesscom_username, chess_rapid_elo as elo
        FROM users 
        WHERE chess_rapid_elo IS NOT NULL 
        ORDER BY chess_rapid_elo DESC 
        LIMIT 50
      `;
    } else if (type === "blitz") {
      users = await sql`
        SELECT id, name, chesscom_username, chess_blitz_elo as elo
        FROM users 
        WHERE chess_blitz_elo IS NOT NULL 
        ORDER BY chess_blitz_elo DESC 
        LIMIT 50
      `;
    } else {
      users = await sql`
        SELECT id, name, chesscom_username, chess_bullet_elo as elo
        FROM users 
        WHERE chess_bullet_elo IS NOT NULL 
        ORDER BY chess_bullet_elo DESC 
        LIMIT 50
      `;
    }

    return Response.json({ users });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return Response.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
