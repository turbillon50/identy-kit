import { Pool, QueryResultRow } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export async function getCarnetByUserId(userId: string) {
  const result = await query("SELECT * FROM carnets WHERE user_id = \$1", [userId]);
  return (result.rows[0] as Record<string, string>) ?? null;
}
