import sql from "@/app/api/utils/sql";

const STRIPE_KEY = process.env.STRIPE || process.env.STRIPE_SECRET_KEY;

export async function GET() {
  const started = Date.now();

  // Database check
  let database = { ok: true };
  try {
    const rows = await sql`SELECT 1 as ok`;
    if (!rows || rows.length !== 1 || rows[0]?.ok !== 1) {
      database = { ok: false, error: "Unexpected database check result" };
    }
  } catch (e) {
    console.error("Health DB check failed:", e);
    database = { ok: false, error: "Database error" };
  }

  // Stripe check (do not expose secrets)
  const stripeConfigured = Boolean(STRIPE_KEY);
  const stripeMode = !STRIPE_KEY
    ? "absent"
    : STRIPE_KEY.startsWith("sk_live_")
      ? "live"
      : STRIPE_KEY.startsWith("sk_test_")
        ? "test"
        : "unknown";

  const ok = database.ok; // app is up; degrade if DB is down

  const payload = {
    status: ok ? "ok" : "degraded",
    ok,
    uptimeSec: Math.round(process.uptime()),
    responseTimeMs: Date.now() - started,
    timestamp: new Date().toISOString(),
    env: process.env.ENV || process.env.NODE_ENV || "unknown",
    appUrlPresent: Boolean(process.env.APP_URL),
    database,
    stripe: {
      configured: stripeConfigured,
      mode: stripeMode,
    },
  };

  return Response.json(payload, { status: ok ? 200 : 503 });
}
