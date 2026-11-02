import pg from 'pg';
import { readFile } from 'node:fs/promises';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set to connect to the PostgreSQL database.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export async function initializeDatabase() {
  const setupSql = await readFile(new URL('./setup.sql', import.meta.url), 'utf8');
  await pool.query(setupSql);
  console.log('Database schema and sample data are ready.');
}

export default pool;
