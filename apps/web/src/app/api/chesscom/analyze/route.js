export async function POST(request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    // Normalize username and set headers Chess.com expects
    const uname = String(username).toLowerCase();
    const headers = {
      "User-Agent": `ChessMastersApp/1.0 (${process.env.APP_URL || "https://createanything.com"})`,
      Accept: "application/json",
    };

    // Ensure OpenAI API key is configured
    const OPENAI_API_KEY = process.env.OPEN_AI_API_KEY; // key is stored in secrets as OPEN_AI_API_KEY
    if (!OPENAI_API_KEY) {
      console.error("Missing OPEN_AI_API_KEY secret");
      return Response.json(
        { error: "AI key is not configured" },
        { status: 500 },
      );
    }

    // Small helper to add a timeout to fetch
    // Never throw: on network errors, return a Response with status 0
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
        return new Response(null, { status: 0, statusText: "NetworkError" });
      } finally {
        clearTimeout(id);
      }
    };

    // 1. Fetch archives (with headers + timeout)
    const archivesRes = await fetchWithTimeout(
      `https://api.chess.com/pub/player/${uname}/games/archives`,
      { headers },
    );
    if (!archivesRes.ok) {
      const status = archivesRes.status;
      if (status === 404) {
        return Response.json(
          { error: "Chess.com profile not found" },
          { status: 404 },
        );
      }
      if (status === 429 || status === 403) {
        return Response.json(
          {
            error:
              "Chess.com temporarily blocked requests. Please try again in a minute.",
          },
          { status },
        );
      }
      if (status === 0) {
        return Response.json(
          { error: "Chess.com could not be reached. Please try again later." },
          { status: 502 },
        );
      }
      throw new Error(`Could not fetch archives: ${status}`);
    }
    const archivesData = await archivesRes.json();
    const archives = archivesData.archives || [];

    if (archives.length === 0) {
      return Response.json({
        analysis: "No games found to analyze.",
        skills: [],
        generatedAt: new Date().toISOString(),
      });
    }

    // 2. Fetch games from the last few archives until we have enough
    let gamesToAnalyze = [];
    // Go backwards from the last archive
    for (let i = archives.length - 1; i >= 0; i--) {
      if (gamesToAnalyze.length >= 50) break; // Limit to 50 games for token limits

      const res = await fetchWithTimeout(archives[i], { headers });
      if (res.ok) {
        const data = await res.json();
        const games = (data.games || []).filter(Boolean);
        // Add to our list (reversed so we get latest first)
        gamesToAnalyze = [...games.reverse(), ...gamesToAnalyze];
      } else if (res.status === 429 || res.status === 403) {
        // Respect rate limiting and stop further requests
        break;
      } else if (res.status === 0) {
        // Network unavailable; stop trying further archives gracefully
        break;
      }
    }

    // Slice to max 50 recent games
    gamesToAnalyze = gamesToAnalyze.slice(0, 50);

    if (gamesToAnalyze.length === 0) {
      return Response.json({
        analysis: "No games found to analyze.",
        skills: [],
        generatedAt: new Date().toISOString(),
      });
    }

    // 3. Prepare prompt
    // We'll send a simplified summary of each game to save tokens
    const gamesSummary = gamesToAnalyze
      .map((g, index) => {
        const whiteUser = g.white?.username?.toLowerCase?.() || "";
        const blackUser = g.black?.username?.toLowerCase?.() || "";
        const isWhite = whiteUser === uname;
        const result = isWhite ? g.white?.result : g.black?.result;
        const opponentRating = isWhite ? g.black?.rating : g.white?.rating;
        // Truncate PGN to first ~40 tokens to save space but give opening context
        const pgnSnippet = g.pgn ? g.pgn.split(" ").slice(0, 40).join(" ") : "";
        return `Game ${index + 1}: Played as ${isWhite ? "White" : "Black"} (${result}) vs rating ${opponentRating}. PGN Start: ${pgnSnippet}...`;
      })
      .join("\n");

    const analysisPrompt = `
      You are a chess coach. Analyze these recent games for player "${uname}".
      Identify 3-5 major weaknesses or patterns in their play, referencing openings or middlegame/endgame themes when helpful.
      Give concrete, actionable drills or study tips for each weakness.

      Recent Games Summary:
      ${gamesSummary}
    `;

    // Ask for a structured JSON result as well
    const jsonInstruction = `
      Return ONLY valid JSON with this shape (no extra text):
      {
        "summary": string, // 3-6 sentences overview
        "skills": [
          {
            "key": string,               // kebab or snake case, e.g. "openings", "tactics", "endgame", "time_management", "blunders"
            "label": string,            // human label, e.g. "Openings"
            "score": number,            // 0-100, where higher is better skill level
            "tip": string,              // 1-2 sentences actionable advice
            "icon": string              // one of: "BookOpen", "Target", "Hourglass", "AlertTriangle", "Puzzle", "Brain", "Flag"
          }
        ]
      }
    `;

    // 4. Call OpenAI using fetch
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful chess grandmaster coach.",
          },
          { role: "user", content: analysisPrompt },
          { role: "user", content: jsonInstruction },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const completion = await response.json();
    const raw = completion.choices?.[0]?.message?.content ?? "";

    // Robust JSON parsing: handle markdown code fences and extra text
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      let cleaned = String(raw).trim();
      // strip leading ```json or ``` and trailing ``` if present
      cleaned = cleaned
        .replace(/^```\s*json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (e2) {
        const first = cleaned.indexOf("{");
        const last = cleaned.lastIndexOf("}");
        if (first !== -1 && last !== -1 && last > first) {
          const candidate = cleaned.slice(first, last + 1);
          try {
            parsed = JSON.parse(candidate);
          } catch (e3) {
            return Response.json({
              analysis: raw || "No analysis returned.",
              skills: [],
              generatedAt: new Date().toISOString(),
            });
          }
        } else {
          return Response.json({
            analysis: raw || "No analysis returned.",
            skills: [],
            generatedAt: new Date().toISOString(),
          });
        }
      }
    }

    const analysis = parsed?.summary || "No analysis returned.";
    const skills = Array.isArray(parsed?.skills)
      ? parsed.skills.slice(0, 5)
      : [];

    return Response.json({
      analysis,
      skills,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    // Map abort error to a clearer message
    if (error?.name === "AbortError") {
      return Response.json(
        { error: "Request to Chess.com timed out. Please try again." },
        { status: 504 },
      );
    }
    if (error?.message?.includes("fetch failed")) {
      return Response.json(
        { error: "Could not reach Chess.com. Please try again later." },
        { status: 502 },
      );
    }
    return Response.json({ error: "Failed to analyze games" }, { status: 500 });
  }
}
