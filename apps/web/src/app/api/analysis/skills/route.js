import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    if (!email) {
      return Response.json({ error: "email is required" }, { status: 400 });
    }

    const rows =
      await sql`SELECT skill_key, skill_label, score, tip, created_at FROM skill_assessments WHERE user_email = ${email} ORDER BY created_at ASC`;

    const byKey = new Map();
    for (const r of rows) {
      const key = r.skill_key;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          label: r.skill_label || key,
          points: [],
        });
      }
      const entry = byKey.get(key);
      entry.points.push({
        date: r.created_at,
        value: r.score ?? 0,
        tip: r.tip || null,
      });
    }

    return Response.json({ skills: Array.from(byKey.values()) });
  } catch (err) {
    console.error("GET /api/analysis/skills error", err);
    return Response.json(
      { error: "Failed to fetch skill history" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, username, skills } = body || {};

    if (!email || !Array.isArray(skills) || skills.length === 0) {
      return Response.json(
        { error: "email and skills are required" },
        { status: 400 },
      );
    }

    // Build a single INSERT statement for all skills
    const values = [];
    const valueTuples = [];
    for (let i = 0; i < skills.length; i++) {
      const s = skills[i] || {};
      values.push(email); // $1, $7, ...
      values.push(username || null);
      values.push(
        String(s.key || s.skill_key || s.label || `skill_${i}`).toLowerCase(),
      );
      values.push(s.label || null);
      values.push(typeof s.score === "number" ? s.score : null);
      values.push(s.tip || null);
      const base = i * 6;
      valueTuples.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`,
      );
    }

    const query = `INSERT INTO skill_assessments (user_email, username, skill_key, skill_label, score, tip) VALUES ${valueTuples.join(", ")} RETURNING id`;
    const inserted = await sql(query, values);

    return Response.json({ ok: true, inserted: inserted.length });
  } catch (err) {
    console.error("POST /api/analysis/skills error", err);
    return Response.json(
      { error: "Failed to save skills snapshot" },
      { status: 500 },
    );
  }
}
