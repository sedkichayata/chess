import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { email, username } = await request.json();
    if (!email || !username) {
      return Response.json(
        { error: "email and username required" },
        { status: 400 },
      );
    }

    // Normalize username and talk to Chess.com directly (avoid internal self-fetch)
    const uname = String(username).toLowerCase();
    const headers = {
      "User-Agent": `ChessMastersApp/1.0 (${process.env.APP_URL || "https://createanything.com"})`,
      Accept: "application/json",
    };

    // Helper to add a timeout to fetch so we don't hang
    // Also never throw: on any network error, return a Response-like object with status 0
    const fetchWithTimeout = async (url, opts = {}, timeoutMs = 12000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...opts, signal: controller.signal });
        return res;
      } catch (err) {
        console.warn(
          "fetchWithTimeout network error:",
          err?.name || err?.message || err,
        );
        // Return a minimal Response-like object so callers can branch on ok/status
        return new Response(null, { status: 0, statusText: "NetworkError" });
      } finally {
        clearTimeout(id);
      }
    };

    let rapid = null;
    let blitz = null;
    let bullet = null;
    let warning = null;

    try {
      // Fetch profile & stats safely (won't throw on socket errors)
      const [profileRes, statsRes] = await Promise.all([
        fetchWithTimeout(`https://api.chess.com/pub/player/${uname}`, {
          headers,
        }),
        fetchWithTimeout(`https://api.chess.com/pub/player/${uname}/stats`, {
          headers,
        }),
      ]);

      if (profileRes.status === 404) {
        return Response.json(
          { error: "Chess.com profile not found" },
          { status: 404 },
        );
      }

      // If profile is not ok (rate limit / server error / network error), allow linking but with a warning
      if (!profileRes.ok) {
        const st = profileRes.status;
        if (st === 429 || st === 403) {
          warning =
            "Linked account, but Chess.com rate-limited requests. Ratings will sync later.";
        } else if (st === 0) {
          warning =
            "Linked account, but Chess.com could not be reached. Ratings will sync later.";
        } else {
          warning = `Linked ${uname}, but Chess.com is unavailable (status ${st}). Ratings will sync later.`;
        }
      } else {
        // Parse stats only if available
        if (statsRes.ok) {
          const statsRaw = await statsRes.json();
          rapid = statsRaw?.chess_rapid?.last?.rating ?? null;
          blitz = statsRaw?.chess_blitz?.last?.rating ?? null;
          bullet = statsRaw?.chess_bullet?.last?.rating ?? null;
        } else if (statsRes.status === 429 || statsRes.status === 403) {
          warning =
            "Linked account, but Chess.com rate-limited stats. They will appear soon.";
        } else if (statsRes.status === 0) {
          warning =
            "Linked account, but Chess.com stats could not be reached. They will sync later.";
        } else if (!warning) {
          warning = `Linked account, but failed to load stats (status ${statsRes.status}).`;
        }
      }
    } catch (err) {
      // Network/socket/timeout issues — still link the username, set ratings later
      console.error("Chess.com link fetch error:", err);
      if (err?.name === "AbortError") {
        warning =
          "Linked account, but Chess.com timed out. Ratings will sync later.";
      } else {
        warning =
          "Linked account, but Chess.com could not be reached. Ratings will sync later.";
      }
    }

    const up = await sql`
      INSERT INTO users (email, name, chesscom_username, chess_rapid_elo, chess_blitz_elo, chess_bullet_elo, last_chess_sync_at)
      VALUES (${email}, 'Chess Student', ${uname}, ${rapid}, ${blitz}, ${bullet}, NOW())
      ON CONFLICT (email) DO UPDATE SET 
        chesscom_username = EXCLUDED.chesscom_username,
        chess_rapid_elo = EXCLUDED.chess_rapid_elo,
        chess_blitz_elo = EXCLUDED.chess_blitz_elo,
        chess_bullet_elo = EXCLUDED.chess_bullet_elo,
        last_chess_sync_at = NOW()
      RETURNING id, email, chesscom_username, chess_rapid_elo, chess_blitz_elo, chess_bullet_elo, last_chess_sync_at
    `;

    return Response.json({ user: up[0], warning });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to link chess.com" },
      { status: 500 },
    );
  }
}
