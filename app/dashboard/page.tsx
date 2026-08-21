import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import AppShell from "../../components/AppShell";


export const dynamic = "force-dynamic";

const TIPO: Record<string, string> = { person: "Persona", pet: "Mascota", other: "Otro" };
const EMOJI: Record<string, string> = { person: "🧑", pet: "🐾", other: "📦" };

/**
 * Qué tan útil sería este carnet si alguien lo escaneara ahorita.
 *
 * Un carnet a medias da falsa seguridad: el titular cree que está protegido y
 * quien lo escanee no va a encontrar lo que necesita. Por eso el panel no
 * felicita por tenerlo creado — avisa de lo que falta.
 */
function loQueFalta(i: any, tieneContactos: boolean) {
  const faltan: string[] = [];
  if (!tieneContactos) faltan.push("a quién llamar");
  if (i.kind !== "pet" && !i.blood_type) faltan.push("tipo de sangre");
  if (!i.alergias_o_condiciones && i.kind !== "pet") faltan.push("alergias o padecimientos");
  if (i.kind === "pet" && !i.owner_phone) faltan.push("tu teléfono");
  return faltan;
}

export default async function Panel() {
  const { userId } = await auth();
  const user = await currentUser();

  const carnets = await sql`
    select i.*,
      (select count(*) from found_events f where f.identity_id = i.id) as escaneos,
      (select count(*) from emergency_contacts c where c.identity_id = i.id) as contactos,
      (select coalesce(m.allergies,'') || coalesce(m.conditions,'')
         from medical_info m where m.identity_id = i.id limit 1) as alergias_o_condiciones
    from identities i
    where owner_clerk_user_id = ${userId}
    order by created_at desc` as any[];

  const recientes = await sql`
    select f.*, i.display_name, i.kind
    from found_events f join identities i on i.id = f.identity_id
    where i.owner_clerk_user_id = ${userId}
    order by f.created_at desc limit 4` as any[];

  const total = carnets.length;
  const escaneos = carnets.reduce((a: number, i: any) => a + Number(i.escaneos || 0), 0);
  const incompletos = carnets.filter(
    (i: any) => loQueFalta(i, Number(i.contactos) > 0).length > 0).length;
  const nombre = user?.firstName || "";

  return (
    <AppShell active="inicio" title="Inicio">
      <h1 className="h1">Hola{nombre ? `, ${nombre}` : ""}</h1>
      <div className="sub" style={{ marginBottom: 20 }}>
        {total === 0
          ? "Vamos a crear tu primer carnet."
          : incompletos > 0
            ? `Tienes ${incompletos === 1 ? "un carnet" : `${incompletos} carnets`} sin terminar.`
            : "Tus carnets están completos."}
      </div>

      {total > 0 && (
        <div className="kpigrid">
          <div className="kpi">
            <div className="n">{total}</div>
            <div className="l">{total === 1 ? "Carnet" : "Carnets"}</div>
          </div>
          <div className="kpi">
            <div className="n" style={{ color: escaneos > 0 ? "var(--alta)" : undefined }}>
              {escaneos}
            </div>
            <div className="l">{escaneos === 1 ? "Escaneo" : "Escaneos"}</div>
          </div>
        </div>
      )}

      <h3>{total === 0 ? "Empieza aquí" : "Tus carnets"}</h3>

      {total === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 40, marginBottom: 10 }}>🪪</div>
          <b style={{ display: "block", fontSize: 16, color: "var(--tinta)" }}>
            Todavía no tienes ningún carnet
          </b>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.55 }}>
            Toca el botón azul de abajo. Se hace en cinco minutos y te va a pedir
            solo lo que de verdad sirve en una emergencia.
          </div>
        </div>
      ) : (
        <div className="grid">
          {carnets.map((i: any) => {
            const faltan = loQueFalta(i, Number(i.contactos) > 0);
            const listo = faltan.length === 0;
            return (
              <Link key={i.id} href={`/carnet/${i.id}`} className="idcard">
                <div className="avatar">
                  {i.photo_url
                    ? <img src={i.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 15 }} />
                    : EMOJI[i.kind] || "🧑"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-.015em" }}>
                    {i.display_name}
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                    <span className="pill">{TIPO[i.kind]}</span>
                    {i.blood_type && <span className="pill alta">{i.blood_type}</span>}
                    {Number(i.escaneos) > 0 && (
                      <span className="pill ambar">
                        {i.escaneos} {Number(i.escaneos) === 1 ? "escaneo" : "escaneos"}
                      </span>
                    )}
                    {!i.is_active && <span className="pill">Apagado</span>}
                  </div>
                  {!listo && (
                    <div style={{ fontSize: 12.5, color: "var(--ambar)", marginTop: 7,
                      fontWeight: 600, lineHeight: 1.45 }}>
                      Falta {faltan.join(", ")}
                    </div>
                  )}
                </div>
                <span style={{ color: "var(--gris-claro)", fontSize: 21, flexShrink: 0 }}>›</span>
              </Link>
            );
          })}
        </div>
      )}

      {recientes.length > 0 && (<>
        <h3>Quién ha escaneado</h3>
        <div className="card">
          {recientes.map((f: any) => (
            <div key={f.id} className="acti">
              <div className="ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <path d="M14 14h3v3M20 20h.01M17 20h.01M20 17h.01" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                  Escanearon el carnet de {f.display_name}
                </div>
                <div className="sub" style={{ fontSize: 13, marginTop: 2 }}>
                  {new Date(f.created_at).toLocaleString("es-MX", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {f.finder_note ? ` · "${f.finder_note}"` : ""}
                </div>
                {f.lat && (
                  <a target="_blank" rel="noreferrer"
                    href={`https://maps.google.com/?q=${f.lat},${f.lng}`}
                    className="accion-linea" style={{ color: "var(--marco)", marginTop: 3 }}>
                    Ver dónde fue
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <Link href="/actividad" className="btn ghost" style={{ marginTop: 12 }}>
          Ver todo el historial
        </Link>
      </>)}
    </AppShell>
  );
}
