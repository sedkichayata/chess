import { getToken } from '@auth/core/jwt';
import sql from './sql';

/**
 * Authenticates the request and returns the user session
 * @param {Request} request
 * @returns {Promise<{user: {id: string, email: string, name: string}} | null>}
 */
export async function authenticate(request) {
  try {
    const jwt = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL?.startsWith('https') || false,
    });

    if (!jwt) {
      return null;
    }

    return {
      user: {
        id: jwt.sub,
        email: jwt.email,
        name: jwt.name,
      },
      expires: jwt.exp?.toString(),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Checks if the authenticated user is an admin
 * @param {Request} request
 * @returns {Promise<{user: {id: string, email: string, name: string, isAdmin: boolean}} | null>}
 */
export async function requireAdmin(request) {
  const session = await authenticate(request);

  if (!session) {
    return null;
  }

  // Check if user has admin role in the database
  try {
    const [user] = await sql`
      SELECT u.*, au.is_admin
      FROM users u
      LEFT JOIN auth_users au ON LOWER(u.email) = LOWER(au.email)
      WHERE LOWER(u.email) = LOWER(${session.user.email})
    `;

    if (!user || !user.is_admin) {
      return null;
    }

    return {
      ...session,
      user: {
        ...session.user,
        isAdmin: true,
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Returns a 401 Unauthorized response
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return Response.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Returns a 403 Forbidden response
 */
export function forbiddenResponse(message = 'Forbidden - Admin access required') {
  return Response.json(
    { error: message },
    { status: 403 }
  );
}
