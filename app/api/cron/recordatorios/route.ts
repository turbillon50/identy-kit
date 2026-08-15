import { sql } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DE = process.env.MAIL_FROM || "Identy-Kit <avisos@vforge.site>";

/**
 * El repaso diario.
 *
 * Nadie entra a una app de emergencias a revisar si todo sigue bien — y ese es
 * justo el problema: los carnets se llenan una vez y se olvidan. Meses después
 * la póliza venció, el teléfono del contacto cambió, y nadie se dio cuenta.
 *
 * Esto revisa cada mañana y avisa solo cuando hay algo que hacer. Si no hay
 * nada, no manda nada: un correo que llega sin motivo enseña a ignorarlos.
 */

async function correoDe(clerkUserId: string) {
  try {
    const r = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;
    const u = await r.json();
    return {
      correo: u?.email_addresses?.[0]?.email_address || null,
      nombre: u?.first_name || "",
    };
  } catch { return null; }
}

function armarCorreo(nombre: string, avisos: string[]) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;background:#F5F7FB;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:26px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:460px;background:#fff;border-radius:18px;overflow:hidden;
        border:1px solid #E3E9F2">
        <tr><td style="background:#032F6E;padding:15px 24px;color:#fff;
          font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase">
          Identy·kit
        </td></tr>
        <tr><td style="padding:26px 24px 10px">
          <div style="font-size:20px;font-weight:800;color:#00265E;letter-spacing:-.02em">
            ${nombre ? `${nombre}, hay` : "Hay"} algo por revisar
          </div>
          <div style="font-size:15px;color:#5A6B85;line-height:1.6;margin-top:9px">
            Un carnet a medias da falsa seguridad. Esto es lo que conviene atender:
          </div>
        </td></tr>
        <tr><td style="padding:6px 24px 10px">
          ${avisos.map((a) => `
            <div style="background:#F5F7FB;border-left:4px solid #01B3F4;
              border-radius:10px;padding:13px 15px;margin-bottom:9px;
              font-size:14.5px;color:#00265E;line-height:1.5">${a}</div>`).join("")}
        </td></tr>
        <tr><td style="padding:10px 24px 26px">
          <a href="https://identykit.xyz/dashboard" style="display:block;
            text-align:center;background:#032F6E;color:#fff;padding:15px;
            border-radius:13px;font-size:15px;font-weight:700;text-decoration:none">
            Abrir Identy-Kit
          </a>
        </td></tr>
        <tr><td style="padding:15px 24px;background:#F5F7FB;font-size:12px;
          color:#8798AF;text-align:center;line-height:1.5">
          Solo te escribimos cuando hay algo que hacer.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function GET(req: NextRequest) {
  // Solo lo corre la tarea programada, no cualquiera que sepa la dirección
  const esperado = process.env.CRON_SECRET;
  const traido = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (esperado && traido !== esperado)
    return NextResponse.json({ error: "no" }, { status: 401 });

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ ok: true, motivo: "sin correo configurado" });

  try {
    // 1. Carnets activos sin a quién llamar: el peor caso del producto
    const sinContactos = await sql`
      select i.owner_clerk_user_id as usuario, i.display_name
      from identities i
      where i.is_active
        and not exists (select 1 from emergency_contacts c where c.identity_id = i.id)
        and i.created_at < now() - interval '2 days'` as any[];

    // 2. Documentos que vencen pronto o ya vencieron
    const docs = await sql`
      select i.owner_clerk_user_id as usuario, d.title, d.vence, i.display_name
      from documents d join identities i on i.id = d.identity_id
      where d.vence is not null
        and d.vence between now() - interval '3 days' and now() + interval '15 days'` as any[];

    // 3. Accesos compartidos por vencer
    const accesos = await sql`
      select a.owner_clerk_user_id as usuario, a.label, a.vence, i.display_name
      from access_grants a left join identities i on i.id = a.identity_id
      where a.is_active and a.vence is not null
        and a.vence between now() and now() + interval '3 days'` as any[];

    // 4. Auxilios que quedaron sin cerrar
    const auxilios = await sql`
      select i.owner_clerk_user_id as usuario, i.display_name, s.triggered_at
      from sos_events s join identities i on i.id = s.identity_id
      where s.cerrado_at is null
        and s.triggered_at between now() - interval '3 days' and now() - interval '2 hours'
        and s.disparado_por not like 'admin:%'` as any[];

    // Se junta todo por persona: un correo con tres avisos, no tres correos
    const porPersona = new Map<string, string[]>();
    const sumar = (u: string, texto: string) => {
      if (!u) return;
      porPersona.set(u, [...(porPersona.get(u) || []), texto]);
    };

    for (const c of sinContactos)
      sumar(c.usuario, `El carnet de <b>${c.display_name}</b> no tiene a quién llamar. ` +
        `Si alguien lo escanea, no va a encontrar un teléfono.`);

    for (const d of docs) {
      const vencido = new Date(d.vence) < new Date();
      sumar(d.usuario, vencido
        ? `<b>${d.title}</b> (${d.display_name}) ya venció.`
        : `<b>${d.title}</b> (${d.display_name}) vence el ` +
          `${new Date(d.vence).toLocaleDateString("es-MX", { day: "numeric", month: "long" })}.`);
    }

    for (const a of accesos)
      sumar(a.usuario, `El acceso de <b>${a.label}</b> a ${a.display_name || "un carnet"} ` +
        `vence en unos días. Puedes renovarlo o dejar que se cierre solo.`);

    for (const s of auxilios)
      sumar(s.usuario, `Quedó abierto un auxilio de <b>${s.display_name}</b>. ` +
        `Si ya todo está bien, ciérralo desde su carnet.`);

    let enviados = 0;
    for (const [usuario, avisos] of porPersona) {
      const quien = await correoDe(usuario);
      if (!quien?.correo) continue;
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: DE, to: [quien.correo],
            subject: avisos.length === 1
              ? "Hay algo por revisar en tu carnet"
              : `${avisos.length} cosas por revisar en tus carnets`,
            html: armarCorreo(quien.nombre, avisos.slice(0, 6)),
          }),
          signal: AbortSignal.timeout(8000),
        });
        if (r.ok) enviados++;
      } catch { /* una falla no debe frenar a los demás */ }
    }

    return NextResponse.json({
      ok: true, revisados: porPersona.size, enviados,
      detalle: {
        sin_contactos: sinContactos.length, documentos: docs.length,
        accesos: accesos.length, auxilios: auxilios.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e).slice(0, 200) }, { status: 500 });
  }
}
