import sql from "@/app/api/utils/sql";
import { requireAdmin, forbiddenResponse } from "@/app/api/utils/auth-helper";

export async function PUT(request, { params: { id } }) {
  // Require admin authentication
  const session = await requireAdmin(request);
  if (!session) {
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const { name, title, bio, profile_image, rating, monthly_price } = body;

    const sets = [];
    const values = [];
    let i = 1;
    if (name !== undefined) {
      sets.push(`name = $${i++}`);
      values.push(name);
    }
    if (title !== undefined) {
      sets.push(`title = $${i++}`);
      values.push(title);
    }
    if (bio !== undefined) {
      sets.push(`bio = $${i++}`);
      values.push(bio);
    }
    if (profile_image !== undefined) {
      sets.push(`profile_image = $${i++}`);
      values.push(profile_image);
    }
    if (rating !== undefined) {
      sets.push(`rating = $${i++}`);
      values.push(rating);
    }
    if (monthly_price !== undefined) {
      sets.push(`monthly_price = $${i++}`);
      values.push(monthly_price);
    }

    if (!sets.length) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }

    const query = `UPDATE masters SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`;
    values.push(id);
    const updated = await sql(query, values);
    if (!updated.length)
      return Response.json({ error: "Not Found" }, { status: 404 });
    return Response.json({ master: updated[0] });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Failed to update master" }, { status: 500 });
  }
}
