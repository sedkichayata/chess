import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const codes =
      await sql`SELECT code, referrer_email, discount_percent, usage_limit, used_count, expires_at FROM referrals ORDER BY code ASC`;
    return Response.json({ codes });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to list referral codes" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      code,
      referrer_email,
      discount_percent = 0,
      usage_limit = null,
      expires_at = null,
    } = body;
    if (!code) {
      return Response.json({ error: "code required" }, { status: 400 });
    }
    const [row] = await sql`
      INSERT INTO referrals (code, referrer_email, discount_percent, usage_limit, expires_at)
      VALUES (${code}, ${referrer_email || null}, ${discount_percent}, ${usage_limit}, ${expires_at})
      ON CONFLICT (code) DO UPDATE SET referrer_email = EXCLUDED.referrer_email, discount_percent = EXCLUDED.discount_percent, usage_limit = EXCLUDED.usage_limit, expires_at = EXCLUDED.expires_at
      RETURNING code, referrer_email, discount_percent, usage_limit, used_count, expires_at
    `;
    return Response.json({ code: row });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to upsert referral code" },
      { status: 500 },
    );
  }
}
