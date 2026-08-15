import { sql } from "../../../lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const DE = process.env.MAIL_FROM || "Identy-Kit <avisos@vforge.site>";

/**
 * El botón de auxilio.
 *
 * Es distinto al escaneo: ahí un desconocido encuentra a alguien; aquí la
 * persona misma pide ayuda. Se le avisa a TODOS sus contactos de golpe, con
 * su ubicación, sin que tenga que llamar uno por uno.
 *
 * Está pensado para usarse con miedo: un solo toque, y el aviso sale aunque
 * la ubicación no cargue.
 */

function textoAviso(nombre: string, mensaje: string | null, mapa: string | null) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#F5F7FB;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:26px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:460px;background:#fff;border-radius:18px;overflow:hidden;
        border:2px solid #D92B1F">
        <tr><td style="background:#D92B1F;padding:17px 24px;color:#fff;
          font-size:15px;font-weight:800;letter-spacing:.1em;text-transform:uppercase">
          ${nombre} pidió ayuda
        </td></tr>
        <tr><td style="padding:24px">
          <div style="font-size:19px;font-weight:800;color:#00265E;line-height:1.35">
            ${nombre} activó su botón de auxilio.
          </div>
          <div style="font-size:15px;color:#5A6B85;line-height:1.6;margin-top:10px">
            Estás en su lista de contactos de emergencia. Llámale ahora.
          </div>
          ${mensaje ? `
          <div style="background:#FEF2F1;border-left:4px solid #D92B1F;border-radius:10px;
            padding:14px 16px;margin-top:16px">
            <div style="font-size:11px;font-weight:800;letter-spacing:.1em;
              text-transform:uppercase;color:#D92B1F;margin-bottom:5px">Dejó dicho</div>
            <div style="font-size:15.5px;color:#7F1D1D;line-height:1.5;font-weight:600">
              ${mensaje.replace(/[<>]/g, "")}
            </div>
          </div>` : ""}
          ${mapa ? `
          <a href="${mapa}" style="display:block;text-align:center;background:#D92B1F;
            color:#fff;padding:16px;border-radius:13px;font-size:16px;font-weight:800;
            text-decoration:none;margin-top:18px">Ver dónde está</a>`
          : `<div style="background:#FFFBEB;border-radius:10px;padding:13px 15px;
              margin-top:16px;font-size:14px;color:#B45309;line-height:1.5">
              No se pudo obtener su ubicación.
            </div>`}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });

    const b = await req.json().catch(() => ({}));
    const carnetId = String(b.identity_id || "");

    const filas = await sql`
      select id, display_name from identities
      where id = ${carnetId} and owner_clerk_user_id = ${userId} and is_active` as any[];
    if (!filas.length)
      return NextResponse.json({ error: "Ese carnet no es tuyo" }, { status: 403 });
    const carnet = filas[0];

    const contactos = await sql`
      select name, phone from emergency_contacts
      where identity_id = ${carnet.id} order by is_primary desc` as any[];

    // Se registra primero: el auxilio queda constando aunque no salga ni un correo
    const [evento] = await sql`
      insert into sos_events (identity_id, lat, lng, accuracy, mensaje, disparado_por)
      values (${carnet.id}, ${b.lat ?? null}, ${b.lng ?? null}, ${b.accuracy ?? null},
        ${String(b.mensaje || "").slice(0, 400) || null}, ${userId})
      returning id` as any[];

    // Aviso a quien tenga correo. Los teléfonos se marcan desde la app.
    const mapa = b.lat != null && b.lng != null
      ? `https://maps.google.com/?q=${b.lat},${b.lng}` : null;

    let avisados = 0;
    const key = process.env.RESEND_API_KEY;
    if (key) {
      try {
        const r = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
          headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
          signal: AbortSignal.timeout(6000),
        });
        const u = r.ok ? await r.json() : null;
        const correo = u?.email_addresses?.[0]?.email_address;
        if (correo) {
          const env = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: DE, to: [correo],
              subject: `${carnet.display_name} pidió ayuda`,
              html: textoAviso(carnet.display_name, b.mensaje || null, mapa),
            }),
            signal: AbortSignal.timeout(8000),
          });
          if (env.ok) avisados++;
        }
      } catch { /* el auxilio ya quedó registrado */ }
    }

    if (avisados > 0) {
      await sql`update sos_events set avisados = ${avisados} where id = ${evento.id}`;
    }

    return NextResponse.json({
      ok: true, id: evento.id, avisados,
      // Para que la app pueda ofrecer marcar directo
      contactos: contactos.map((c: any) => ({ nombre: c.name, telefono: c.phone })),
    });
  } catch {
    return NextResponse.json({ error: "No se pudo enviar el auxilio" }, { status: 500 });
  }
}

/** Dar por terminada la emergencia. */
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });
    const { id } = await req.json();
    await sql`
      update sos_events set cerrado_at = now()
      where id = ${id} and identity_id in (
        select id from identities where owner_clerk_user_id = ${userId})`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo cerrar" }, { status: 500 });
  }
}
