import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Quién manda en la plataforma.
 *
 * El rol vive en Clerk, en los datos públicos del usuario, no en una tabla
 * nuestra: así se cambia desde el panel de Clerk sin tocar código ni base, y
 * no hay dos fuentes de verdad sobre quién es dueño.
 *
 * Se marca con: public_metadata = { rol: "dueno" }
 */
export async function esDueno(): Promise<boolean> {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    // Primero de la sesión, que no cuesta una llamada
    const enSesion = (sessionClaims as any)?.metadata?.rol
      || (sessionClaims as any)?.publicMetadata?.rol;
    if (enSesion === "dueno") return true;

    // Si la sesión aún no lo trae (se acaba de asignar), se consulta
    const cliente = await clerkClient();
    const u = await cliente.users.getUser(userId);
    return (u.publicMetadata as any)?.rol === "dueno";
  } catch {
    return false;
  }
}

/** Corta la pantalla si quien entra no es dueño. */
export async function exigirDueno() {
  if (!(await esDueno())) {
    const { notFound } = await import("next/navigation");
    notFound();
  }
}
