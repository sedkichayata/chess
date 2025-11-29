import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, rapid, blitz, bullet } = body;

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Ensure user exists
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    let user;
    if (existing.length === 0) {
      const inserted = await sql`
        INSERT INTO users (email, name)
        VALUES (${email}, 'Chess Student')
        RETURNING *
      `;
      user = inserted[0];
    } else {
      user = existing[0];
    }

    // Update ratings (nullable)
    await sql`
      UPDATE users
      SET chess_rapid_elo = ${rapid ?? null},
          chess_blitz_elo = ${blitz ?? null},
          chess_bullet_elo = ${bullet ?? null}
      WHERE email = ${email}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving user ELO:", error);
    return Response.json({ error: "Failed to save user ELO" }, { status: 500 });
  }
}
