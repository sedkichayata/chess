import sql from "@/app/api/utils/sql";
import Stripe from "stripe";

// Use the user-provided STRIPE secret if available, fallback to platform default
const STRIPE_KEY = process.env.STRIPE || process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null;

export const getTierPrice = (tier) => {
  switch ((tier || "starter").toLowerCase()) {
    case "starter":
      return { name: "Starter Plan", cents: 999 };
    case "pro":
      return { name: "Pro Plan", cents: 1999 };
    case "elite":
      return { name: "Elite Plan", cents: 2999 };
    default:
      return { name: "Starter Plan", cents: 999 };
  }
};

export const getBaseUrl = (request) => {
  const envBase = process.env.APP_URL?.replace(/\/$/, "");
  if (envBase) return envBase;

  const hdrOrigin = request.headers.get("origin")?.replace(/\/$/, "");
  if (hdrOrigin) return hdrOrigin;

  try {
    const u = new URL(request.url);
    return u.origin;
  } catch (_) {
    return "";
  }
};

export const makeAbsolute = (url, baseUrl) => {
  if (!url) return baseUrl || "";
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return baseUrl ? `${baseUrl}${path}` : path;
};

export const getOrCreateStripeCustomer = async (email, name) => {
  if (!stripe) throw new Error("Stripe is not configured");

  let users;
  try {
    users = await sql`SELECT * FROM users WHERE email = ${email}`;
  } catch (error) {
    console.error("Database error in getOrCreateStripeCustomer:", error);
    // If the error suggests HTML response, it's likely a bad DATABASE_URL
    if (error.message && error.message.includes("Unexpected token")) {
      throw new Error(
        "Database connection failed (received HTML instead of JSON). Please check your DATABASE_URL environment variable.",
      );
    }
    throw error;
  }
  let user;

  if (users.length === 0) {
    try {
      const newUsers = await sql`
        INSERT INTO users (email, name) 
        VALUES (${email}, ${name || "Chess Student"})
        RETURNING *
      `;
      user = newUsers[0];
    } catch (error) {
      console.error("Database error creating user:", error);
      throw error;
    }
  } else {
    user = users[0];
  }

  let stripeCustomerId = user.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      name: user.name,
    });
    stripeCustomerId = customer.id;

    try {
      await sql`
        UPDATE users 
        SET stripe_customer_id = ${stripeCustomerId}
        WHERE id = ${user.id}
      `;
    } catch (error) {
      console.error("Database error updating stripe_customer_id:", error);
      // We don't throw here to avoid failing the flow, as the customer was created on Stripe
    }
  }

  return stripeCustomerId;
};

export const getReferralDiscount = async (referralCode) => {
  if (!stripe || !referralCode) return { discounts: undefined, couponId: null };

  try {
    const rows = await sql`
      SELECT * FROM referrals 
      WHERE code = ${referralCode}
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (usage_limit IS NULL OR used_count < usage_limit)
    `;
    const ref = rows[0];

    if (ref && ref.discount_percent > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: ref.discount_percent,
        duration: "once",
        name: `Referral ${referralCode}`,
      });
      return {
        discounts: [{ coupon: coupon.id }],
        couponId: coupon.id,
      };
    }
  } catch (error) {
    console.error("Error applying referral code:", error);
    // If DB fails, we simply ignore the referral code rather than blocking checkout
  }

  return { discounts: undefined, couponId: null };
};

export { stripe };
