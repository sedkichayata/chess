export async function GET(request, { params: { username } }) {
  try {
    const uname = username.toLowerCase();

    const headers = {
      "User-Agent": `ChessMastersApp/1.0 (${process.env.APP_URL || "https://createanything.com"})`,
      Accept: "application/json",
    };

    const archivesRes = await fetch(
      `https://api.chess.com/pub/player/${uname}/games/archives`,
      { headers },
    );
    if (!archivesRes.ok) {
      return Response.json(
        { error: "Archives not found" },
        { status: archivesRes.status },
      );
    }
    const archives = await archivesRes.json();
    const urls = archives.archives || [];
    const last = urls[urls.length - 1];
    if (!last) return Response.json({ games: [] });
    const gamesRes = await fetch(last, { headers });
    if (!gamesRes.ok) return Response.json({ games: [] });
    const gamesJson = await gamesRes.json();

    const games = (gamesJson.games || []).map((g) => ({
      url: g.url,
      time_control: g.time_control,
      end_time: g.end_time,
      white: g.white?.username,
      black: g.black?.username,
      white_result: g.white?.result,
      black_result: g.black?.result,
      pgn: g.pgn,
    }));

    return Response.json({ games, source: last });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
