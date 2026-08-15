import { neon } from "@neondatabase/serverless";

/**
 * La conexión a la base.
 *
 * El `cache: "no-store"` NO es un detalle: el driver de Neon habla por HTTP
 * usando fetch, y Next guarda en caché los fetch por su cuenta. Eso hacía que
 * la app sirviera datos viejos aunque la página fuera dinámica.
 *
 * Se descubrió con el peor caso posible: al apagar un carnet, su ficha de
 * emergencia SEGUÍA mostrando el tipo de sangre, las alergias y los teléfonos.
 * La consulta filtraba bien; era Next devolviendo la respuesta guardada.
 */
export const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: { cache: "no-store" },
});

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
