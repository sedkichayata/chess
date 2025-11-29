import sql from "@/app/api/utils/sql";

export async function PUT(request, { params: { code } }) {
  try {
    const body = await request.json();
    const { referrer_email, discount_percent, usage_limit, expires_at } = body;
    const updated = await sql`
      UPDATE referrals SET 
        referrer_email = ${referrer_email || null},
        discount_percent = ${typeof discount_percent === "number" ? discount_percent : null},
        usage_limit = ${usage_limit === null ? null : usage_limit},
        expires_at = ${expires_at || null}
      WHERE code = ${code}
      RETURNING code, referrer_email, discount_percent, usage_limit, used_count, expires_at
    `;
    if (!updated.length) {
      return Response.json({ error: "Referral not found" }, { status: 404 });
    }
    return Response.json({ code: updated[0] });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to update referral" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params: { code } }) {
  try {
    const res =
      await sql`DELETE FROM referrals WHERE code = ${code} RETURNING code`;
    if (!res.length)
      return Response.json({ error: "Not Found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json(
      { error: "Failed to delete referral" },
      { status: 500 },
    );
  }
}
