import { sql } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put, del } from "@vercel/blob";

export const dynamic = "force-dynamic";

// Lo que se puede guardar. Se revisa aquí y no solo en el navegador.
const TIPOS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/heic": "heic", "application/pdf": "pdf",
};
const MAX = 8 * 1024 * 1024;

/** Los papeles de un carnet. */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });
    const carnetId = new URL(req.url).searchParams.get("identity_id") || "";

    const docs = await sql`
      select d.* from documents d
      join identities i on i.id = d.identity_id
      where d.identity_id = ${carnetId} and i.owner_clerk_user_id = ${userId}
      order by d.created_at desc` as any[];
    return NextResponse.json({ documentos: docs });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar" }, { status: 500 });
  }
}

/** Subir un papel. */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });

    const form = await req.formData();
    const archivo = form.get("file") as File | null;
    const carnetId = String(form.get("identity_id") || "");
    const tipo = String(form.get("doc_type") || "otro");
    const titulo = String(form.get("title") || "").trim();
    const vence = String(form.get("vence") || "") || null;
    const enEmergencia = String(form.get("visible_en_emergencia")) === "true";

    if (!archivo) return NextResponse.json({ error: "No llegó ningún archivo" }, { status: 400 });
    if (archivo.size > MAX)
      return NextResponse.json({ error: "El archivo pesa demasiado" }, { status: 400 });
    const ext = TIPOS[archivo.type];
    if (!ext)
      return NextResponse.json({ error: "Solo se aceptan fotos o PDF" }, { status: 400 });

    const propio = await sql`
      select id from identities
      where id = ${carnetId} and owner_clerk_user_id = ${userId}` as any[];
    if (!propio.length)
      return NextResponse.json({ error: "Ese carnet no es tuyo" }, { status: 403 });

    const blob = await put(`ik/${userId}/docs/${Date.now()}.${ext}`, archivo, {
      access: "public", addRandomSuffix: true,
    });

    const [doc] = await sql`
      insert into documents (identity_id, doc_type, title, file_url,
        visible_en_emergencia, vence, tamano)
      values (${carnetId}, ${tipo}, ${titulo || archivo.name.slice(0, 120)},
        ${blob.url}, ${enEmergencia}, ${vence}, ${archivo.size})
      returning *` as any[];

    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: "No se pudo guardar el documento" }, { status: 500 });
  }
}

/** Quitar un papel: se borra el archivo, no solo el registro. */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });
    const id = new URL(req.url).searchParams.get("id") || "";

    const filas = await sql`
      select d.id, d.file_url from documents d
      join identities i on i.id = d.identity_id
      where d.id = ${id} and i.owner_clerk_user_id = ${userId}` as any[];
    if (!filas.length)
      return NextResponse.json({ error: "Ese documento no es tuyo" }, { status: 403 });

    // Primero el registro; si el archivo no se puede borrar, al menos no
    // queda listado. Dejarlo al revés dejaría un renglón apuntando a la nada.
    await sql`delete from documents where id = ${id}`;
    try { await del(filas[0].file_url); } catch { /* el blob queda huérfano */ }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo quitar" }, { status: 500 });
  }
}

/** Cambiar si sale en la ficha de emergencia. */
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });
    const { id, visible_en_emergencia } = await req.json();

    await sql`
      update documents set visible_en_emergencia = ${!!visible_en_emergencia}
      where id = ${id} and identity_id in (
        select id from identities where owner_clerk_user_id = ${userId})`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo cambiar" }, { status: 500 });
  }
}
