import { sql } from "../../../lib/db";
import { NextResponse } from "next/server";
import { avisarEscaneo } from "../../../lib/correo";

export const dynamic = "force-dynamic";

/**
 * Alguien escaneó un carnet y quiere avisarle a la familia.
 *
 * Primero se guarda el hecho y luego se intenta avisar por correo: si el correo
 * falla, el escaneo NO se pierde. A quien lo encontró se le contesta que sí
 * quedó registrado, porque él ya hizo su parte.
 */
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}));

    const filas = await sql`
      select i.id, i.display_name, i.kind, i.owner_clerk_user_id
      from identities i where i.qr_token = ${b.qr} and i.is_active` as any[];
    if (!filas.length)
      return NextResponse.json({ error: "Ese código ya no está activo" }, { status: 404 });

    const id = filas[0];
    const ua = req.headers.get("user-agent") || "";

    await sql`
      insert into found_events (identity_id, lat, lng, accuracy, finder_note, user_agent)
      values (${id.id}, ${b.lat ?? null}, ${b.lng ?? null}, ${b.accuracy ?? null},
        ${String(b.note || "").slice(0, 500) || null}, ${ua})`;

    // El aviso va después de guardar, y su falla no tumba la respuesta
    let aviso: any = { enviado: false };
    try {
      aviso = await avisarEscaneo({
        clerkUserId: id.owner_clerk_user_id,
        nombreCarnet: id.display_name,
        esMascota: id.kind === "pet",
        nota: b.note,
        lat: b.lat, lng: b.lng,
      });
    } catch { /* el escaneo ya quedó guardado */ }

    return NextResponse.json({ ok: true, avisado: !!aviso.enviado });
  } catch (e: any) {
    return NextResponse.json({ error: "No se pudo registrar" }, { status: 500 });
  }
}
