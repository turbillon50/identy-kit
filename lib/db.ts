import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

/**
 * Consulta con la sentencia armada en código, para los casos donde el nombre
 * de la columna es variable. El driver la expone, pero sus tipos no la
 * declaran, de ahí el puente.
 *
 * Los nombres de columna JAMÁS deben venir de fuera: se toman de una lista
 * fija en el código. Los valores sí van como parámetros.
 */
export async function sqlArmada<T = any>(texto: string, valores: unknown[] = []) {
  return (sql as any).query(texto, valores) as Promise<T[]>;
}
