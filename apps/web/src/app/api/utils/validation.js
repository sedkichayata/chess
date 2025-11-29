/**
 * Validation utility functions for API endpoints
 */

/**
 * Validates an email address format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a redirect URL against a whitelist
 * Allows localhost for development and specific production domains
 * @param {string} url
 * @param {string} baseUrl - The current request base URL
 * @returns {boolean}
 */
export function isValidRedirectURL(url, baseUrl = '') {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsedUrl = new URL(url, baseUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    // Allow localhost and 127.0.0.1 in development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) {
      return true;
    }

    // Allow same-origin redirects
    if (baseUrl) {
      const parsedBase = new URL(baseUrl);
      if (parsedUrl.origin === parsedBase.origin) {
        return true;
      }
    }

    // Whitelist of allowed domains (add your production domains here)
    const allowedDomains = [
      'create.xyz',
      'createanything.com',
      // Add your production domains here
    ];

    return allowedDomains.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Validates Stripe tier
 * @param {string} tier
 * @returns {boolean}
 */
export function isValidTier(tier) {
  const validTiers = ['starter', 'pro', 'elite'];
  return validTiers.includes((tier || '').toLowerCase());
}

/**
 * Gets the base URL from request
 * @param {Request} request
 * @returns {string}
 */
export function getBaseUrl(request) {
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
}

/**
 * Sanitizes user input by trimming and limiting length
 * @param {string} input
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeString(input, maxLength = 255) {
  if (!input || typeof input !== 'string') return '';
  return input.trim().substring(0, maxLength);
}

/**
 * Validates that required fields exist in a request body
 * @param {object} body
 * @param {string[]} requiredFields
 * @returns {{valid: boolean, missing: string[]}}
 */
export function validateRequiredFields(body, requiredFields) {
  const missing = requiredFields.filter(field => !body || !body[field]);
  return {
    valid: missing.length === 0,
    missing,
  };
}
