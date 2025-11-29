// Proxy to Chess.com Public API for profiles and stats

export async function GET(request, { params: { username } }) {
  try {
    const uname = username.toLowerCase();

    // Chess.com Public API recommends including a descriptive User-Agent
    const headers = {
      "User-Agent": `ChessMastersApp/1.0 (${process.env.APP_URL || "https://createanything.com"})`,
      Accept: "application/json",
    };

    const [profileRes, statsRes] = await Promise.all([
      fetch(`https://api.chess.com/pub/player/${uname}`, { headers }),
      fetch(`https://api.chess.com/pub/player/${uname}/stats`, { headers }),
    ]);

    if (!profileRes.ok) {
      return Response.json(
        { error: "Profile not found" },
        { status: profileRes.status },
      );
    }

    const profile = await profileRes.json();
    const statsRaw = statsRes.ok ? await statsRes.json() : {};

    const rapid = statsRaw?.chess_rapid?.last?.rating || null;
    const blitz = statsRaw?.chess_blitz?.last?.rating || null;
    const bullet = statsRaw?.chess_bullet?.last?.rating || null;

    // Return a compact stats shape
    return Response.json({ profile, stats: { rapid, blitz, bullet } });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to fetch chess.com data" },
      { status: 500 },
    );
  }
}
