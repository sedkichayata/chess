import sql from "@/app/api/utils/sql";

export async function PUT(request, { params: { tier } }) {
  try {
    const body = await request.json();
    const { price_cents, description, is_active } = body;
    if (
      typeof price_cents !== "number" &&
      description === undefined &&
      is_active === undefined
    ) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }
    const sets = [];
    const values = [];
    let i = 1;
    if (typeof price_cents === "number") {
      sets.push(`price_cents = $${i++}`);
      values.push(price_cents);
    }
    if (description !== undefined) {
      sets.push(`description = $${i++}`);
      values.push(description);
    }
    if (is_active !== undefined) {
      sets.push(`is_active = $${i++}`);
      values.push(is_active);
    }

    const query = `UPDATE platform_plans SET ${sets.join(", ")} WHERE LOWER(tier) = $${i} RETURNING tier, price_cents, description, is_active, created_at`;
    values.push(tier.toLowerCase());

    const updated = await sql(query, values);
    if (!updated.length) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }
    return Response.json({ plan: updated[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(request, { params: { tier } }) {
  try {
    const res =
      await sql`DELETE FROM platform_plans WHERE LOWER(tier) = ${tier.toLowerCase()} RETURNING tier`;
    if (!res.length) {
      return Response.json({ error: "Plan not found" }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}
