import sql from "@/app/api/utils/sql";

// Create a subscription
export async function POST(request) {
  try {
    const body = await request.json();
    const { masterId, studentName, studentEmail } = body;

    if (!masterId || !studentName || !studentEmail) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if already subscribed
    const existing = await sql`
      SELECT * FROM subscriptions 
      WHERE master_id = ${masterId} AND student_email = ${studentEmail} AND status = 'active'
    `;

    if (existing.length > 0) {
      return Response.json({ error: "Already subscribed" }, { status: 400 });
    }

    // Create subscription (expires in 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const subscription = await sql`
      INSERT INTO subscriptions (master_id, student_name, student_email, expires_at)
      VALUES (${masterId}, ${studentName}, ${studentEmail}, ${expiresAt.toISOString()})
      RETURNING *
    `;

    return Response.json({ subscription: subscription[0] });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return Response.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}

// Get user's subscriptions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    const subscriptions = await sql`
      SELECT s.*, m.name, m.title, m.profile_image, m.monthly_price
      FROM subscriptions s
      JOIN masters m ON s.master_id = m.id
      WHERE s.student_email = ${email} AND s.status = 'active'
      ORDER BY s.started_at DESC
    `;

    return Response.json({ subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return Response.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 },
    );
  }
}
