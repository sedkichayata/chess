import { neon } from '@neondatabase/serverless';

// Validate DATABASE_URL at module load (startup)
if (!process.env.DATABASE_URL) {
  const error = 'FATAL: DATABASE_URL environment variable is not set. Application cannot start without a database connection.';
  console.error(error);
  throw new Error(error);
}

// Validate DATABASE_URL format
try {
  new URL(process.env.DATABASE_URL);
} catch (urlError) {
  const error = `FATAL: DATABASE_URL is not a valid URL: ${urlError.message}`;
  console.error(error);
  throw new Error(error);
}

const sql = neon(process.env.DATABASE_URL);

export default sql;