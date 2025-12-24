import { Pool, PoolClient, QueryResult } from 'pg';
import 'dotenv/config';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

export const query = (
  text: string,
  params?: any[]
): Promise<QueryResult> => {
  return pool.query(text, params);
};

export const getClient = (): Promise<PoolClient> => {
  return pool.connect();
};
