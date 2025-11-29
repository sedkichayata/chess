import sql from "@/app/api/utils/sql";

// Create a booking
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, studentName, studentEmail } = body;

    if (!sessionId || !studentName || !studentEmail) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if session is available
    const sessionCheck = await sql`
      SELECT * FROM sessions WHERE id = ${sessionId} AND status = 'available'
    `;

    if (sessionCheck.length === 0) {
      return Response.json({ error: "Session not available" }, { status: 400 });
    }

    // Create booking
    const booking = await sql`
      INSERT INTO bookings (session_id, student_name, student_email)
      VALUES (${sessionId}, ${studentName}, ${studentEmail})
      RETURNING *
    `;

    return Response.json({ booking: booking[0] });
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}

// Get user's bookings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    const bookings = await sql`
      SELECT b.*, s.title, s.session_type, s.duration_minutes, s.scheduled_at,
             m.name as master_name, m.profile_image as master_image
      FROM bookings b
      JOIN sessions s ON b.session_id = s.id
      JOIN masters m ON s.master_id = m.id
      WHERE b.student_email = ${email}
      ORDER BY s.scheduled_at DESC
    `;

    return Response.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}
