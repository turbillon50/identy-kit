import { cookies } from "next/headers";

/**
 * Acceso a la administración, aparte de Clerk.
 *
 * Clerk maneja a los titulares — la gente que hace su carnet. La administración
 * es otra cosa: es de la casa, y no queremos que dependa de una cuenta de
 * usuario, ni que se enrede con verificaciones de correo o segundo factor.
 *
 * Aquí es un usuario y una contraseña nuestros, guardados como variables del
 * proyecto, y una galleta firmada que dura 12 horas.
 */

const COOKIE = "ik_admin";
const HORAS = 12;

function llave() {
  const s = process.env.ADMIN_SECRET || process.env.CLERK_SECRET_KEY || "";
  return new TextEncoder().encode(s);
}

/** Firma para que nadie pueda fabricarse una sesión escribiendo la galleta. */
async function firmar(texto: string) {
  const k = await crypto.subtle.importKey(
    "raw", llave(), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const f = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(texto));
  return Buffer.from(f).toString("base64url");
}

export async function crearSesion(usuario: string) {
  const vence = Date.now() + HORAS * 3600_000;
  const cuerpo = `${usuario}|${vence}`;
  const valor = `${Buffer.from(cuerpo).toString("base64url")}.${await firmar(cuerpo)}`;
  (await cookies()).set(COOKIE, valor, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: HORAS * 3600,
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

/** Quién entró a la administración, o null si nadie. */
export async function adminActual(): Promise<string | null> {
  try {
    const galleta = (await cookies()).get(COOKIE)?.value;
    if (!galleta) return null;
    const [datos, firma] = galleta.split(".");
    if (!datos || !firma) return null;

    const cuerpo = Buffer.from(datos, "base64url").toString();
    if (firma !== (await firmar(cuerpo))) return null;   // alguien la manipuló

    const [usuario, vence] = cuerpo.split("|");
    if (!usuario || Date.now() > Number(vence)) return null;
    return usuario;
  } catch {
    return null;
  }
}

/**
 * Revisa el usuario y la contraseña.
 * Se comparan sin atajos para no filtrar información por el tiempo que tarda.
 */
export function credencialesValidas(usuario: string, clave: string) {
  const u = process.env.ADMIN_USER || "";
  const c = process.env.ADMIN_PASS || "";
  if (!u || !c) return false;

  const igual = (a: string, b: string) => {
    if (a.length !== b.length) return false;
    let dif = 0;
    for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return dif === 0;
  };
  return igual(usuario.trim().toLowerCase(), u.toLowerCase()) && igual(clave, c);
}
