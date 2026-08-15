import { clerkClient } from "@clerk/nextjs/server";

/**
 * El aviso al titular cuando alguien escanea su carnet.
 *
 * Sin esto el producto queda a medias: alguien escanea el carnet de tu papá en
 * un hospital y tú te enteras cuando se te ocurre abrir la app. El escaneo se
 * guardaba, pero nadie se enteraba en el momento — que es justo cuando importa.
 *
 * Si el correo falla, NO se cae el registro del escaneo: primero se guarda el
 * hecho, luego se intenta avisar.
 */

const DE = process.env.MAIL_FROM || "Identy-Kit <avisos@vforge.site>";

function urlMapa(lat: any, lng: any) {
  if (lat == null || lng == null) return null;
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export async function avisarEscaneo(opts: {
  clerkUserId: string;
  nombreCarnet: string;
  esMascota: boolean;
  nota?: string | null;
  lat?: any; lng?: any;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { enviado: false, motivo: "sin servicio de correo" };

  let correo = "", nombre = "";
  try {
    const cliente = await clerkClient();
    const u = await cliente.users.getUser(opts.clerkUserId);
    correo = u.emailAddresses?.[0]?.emailAddress || "";
    nombre = u.firstName || "";
  } catch {
    return { enviado: false, motivo: "no encontré al titular" };
  }
  if (!correo) return { enviado: false, motivo: "el titular no tiene correo" };

  const mapa = urlMapa(opts.lat, opts.lng);
  const quien = opts.nombreCarnet;
  const asunto = opts.esMascota
    ? `Alguien encontró a ${quien}`
    : `Escanearon el carnet de ${quien}`;

  const cuerpo = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#F5F7FB;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7FB;padding:28px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:460px;background:#fff;border-radius:18px;overflow:hidden;
        border:1px solid #E3E9F2">

        <tr><td style="background:${opts.esMascota ? "#032F6E" : "#D92B1F"};
          padding:15px 24px;color:#fff;font-size:13px;font-weight:800;
          letter-spacing:.12em;text-transform:uppercase">
          ${opts.esMascota ? "Mascota encontrada" : "Escanearon un carnet"}
        </td></tr>

        <tr><td style="padding:26px 24px 8px">
          <div style="font-size:21px;font-weight:800;color:#00265E;
            letter-spacing:-.02em;line-height:1.25">
            ${opts.esMascota
              ? `Alguien encontró a ${quien}`
              : `Alguien abrió la ficha de ${quien}`}
          </div>
          <div style="font-size:15px;color:#5A6B85;line-height:1.6;margin-top:10px">
            ${nombre ? `${nombre}, e` : "E"}sto acaba de pasar. Si no lo esperabas,
            vale la pena que ${opts.esMascota ? "revises dónde anda" : "hables con esa persona"}.
          </div>
        </td></tr>

        ${opts.nota ? `
        <tr><td style="padding:12px 24px">
          <div style="background:#F5F7FB;border-left:4px solid #01B3F4;
            border-radius:10px;padding:14px 16px">
            <div style="font-size:11px;font-weight:800;letter-spacing:.1em;
              text-transform:uppercase;color:#8798AF;margin-bottom:5px">
              Quien lo escaneó dejó este mensaje
            </div>
            <div style="font-size:15px;color:#00265E;line-height:1.5">
              ${String(opts.nota).replace(/[<>]/g, "")}
            </div>
          </div>
        </td></tr>` : ""}

        ${mapa ? `
        <tr><td style="padding:12px 24px 4px">
          <a href="${mapa}" style="display:block;text-align:center;
            background:#032F6E;color:#fff;padding:15px;border-radius:13px;
            font-size:15px;font-weight:700;text-decoration:none">
            Ver dónde fue
          </a>
        </td></tr>` : ""}

        <tr><td style="padding:${mapa ? "10" : "12"}px 24px 26px">
          <a href="https://identykit.xyz/dashboard" style="display:block;
            text-align:center;background:#fff;color:#032F6E;padding:14px;
            border-radius:13px;font-size:14.5px;font-weight:700;
            text-decoration:none;border:1.5px solid #E3E9F2">
            Abrir Identy-Kit
          </a>
        </td></tr>

        <tr><td style="padding:16px 24px;background:#F5F7FB;
          font-size:12px;color:#8798AF;text-align:center;line-height:1.5">
          Te llega este correo porque alguien escaneó un carnet tuyo.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: DE, to: [correo], subject: asunto, html: cuerpo }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return { enviado: false, motivo: `correo rechazado (${r.status})` };
    return { enviado: true };
  } catch (e: any) {
    return { enviado: false, motivo: String(e?.message || e).slice(0, 80) };
  }
}
