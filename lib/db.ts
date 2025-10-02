import postgres from 'postgres';

// Database connection
const sql = process.env.DATABASE_URL 
  ? postgres(process.env.DATABASE_URL, {
      // Connection options
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === 'production' || (process.env.NODE_ENV as string) === 'staging' ? 'require' : false,
      debug: process.env.NODE_ENV === 'development',
    })
  : null;

// Export a function that checks for database availability
export const getDb = () => {
  if (!sql) {
    throw new Error('Database connection not configured - DATABASE_URL environment variable is not set');
  }
  return sql;
};

export default sql!;