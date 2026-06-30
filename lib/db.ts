import { Pool } from "@neondatabase/serverless";

/*
  Schema (ya creado en Neon Brain DB):
  CREATE TABLE IF NOT EXISTS carnets (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    curp TEXT, nombre TEXT, apellidos TEXT,
    fecha_nacimiento TEXT, tipo_sangre TEXT,
    alergias TEXT, padecimientos TEXT,
    contacto_emergencia_nombre TEXT, contacto_emergencia_tel TEXT,
    escuela TEXT, grado TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
*/

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T = any>(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export async function getCarnetByUserId(userId: string) {
  const result = await query("SELECT * FROM carnets WHERE user_id = $1", [userId]);
  return result.rows[0] ?? null;
}
