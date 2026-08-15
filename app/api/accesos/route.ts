import { sql } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

/**
 * Accesos compartidos.
 *
 * Es distinto al código QR: ese lo ve cualquiera y muestra solo lo de
 * emergencia. Esto es dar acceso a alguien de confianza — el médico, la
 * escuela, el veterinario, la persona que cuida a tu papá — para que vea
 * TAMBIÉN los documentos, por un tiempo que tú decides.
 *
 * Cada acceso es su propia liga, así se puede quitar el de uno sin tocar los
 * demás, y se ve cuándo lo usó cada quien por última vez.
 */

function nuevaLlave() {
  const abc = "abcdefghijkmnpqrstuvwxyz23456789";  // sin letras que se confunden
  return Array.from(crypto.getRandomValues(new Uint8Array(14)))
    .map((n) => abc[n % abc.length]).join("");
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });
    const carnetId = new URL(req.url).searchParams.get("identity_id") || "";

    const accesos = await sql`
      select token, label, is_active, vence, ultimo_uso, usos, ve_documentos, created_at
      from access_grants
      where owner_clerk_user_id = ${userId} and identity_id = ${carnetId}
      order by created_at desc` as any[];
    return NextResponse.json({ accesos });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar" }, { status: 500 });
  }
}

/** Crear un acceso para alguien. */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });

    const { identity_id, label, dias, ve_documentos } = await req.json();
    const nombre = String(label || "").trim();
    if (!nombre)
      return NextResponse.json({ error: "Ponle un nombre para saber de quién es" }, { status: 400 });

    const propio = await sql`
      select id from identities
      where id = ${identity_id} and owner_clerk_user_id = ${userId}` as any[];
    if (!propio.length)
      return NextResponse.json({ error: "Ese carnet no es tuyo" }, { status: 403 });

    // Un acceso sin vencimiento es un acceso que se olvida: por eso hay tope
    const d = Math.min(365, Math.max(1, parseInt(dias) || 30));
    const vence = new Date(Date.now() + d * 86400_000).toISOString();

    const [a] = await sql`
      insert into access_grants (token, owner_clerk_user_id, identity_id, label,
        is_active, vence, ve_documentos)
      values (${nuevaLlave()}, ${userId}, ${identity_id}, ${nombre.slice(0, 80)},
        true, ${vence}, ${ve_documentos !== false})
      returning *` as any[];

    return NextResponse.json(a);
  } catch {
    return NextResponse.json({ error: "No se pudo crear el acceso" }, { status: 500 });
  }
}

/** Quitarle el acceso a alguien, sin tocar los demás. */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });
    const token = new URL(req.url).searchParams.get("token") || "";

    // Se apaga en vez de borrarse: así queda constando que existió y quién lo usó
    await sql`
      update access_grants set is_active = false
      where token = ${token} and owner_clerk_user_id = ${userId}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo quitar" }, { status: 500 });
  }
}
