import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import { exigirDueno } from "../../lib/permisos";
import AppShell from "../../components/AppShell";

export const dynamic = "force-dynamic";

const EMOJI: Record<string, string> = { person: "🧑", pet: "🐾", other: "📦" };

/**
 * Panel del dueño de la plataforma.
 *
 * Esta pantalla NO es "mis carnets con más detalle" — eso es el panel normal.
 * Aquí se ve TODA la plataforma: cuánta gente se registró, cuántos carnets hay,
 * cuáles no sirven porque están a medias, y cada escaneo que ha ocurrido.
 *
 * Solo entra quien tiene rol de dueño en Clerk. Cualquier otro ve "no existe",
 * que es mejor que "no tienes permiso": no le confirma que la pantalla existe.
 */
export default async function PanelDueno() {
  await exigirDueno();

  const [k] = await sql`
    select
      (select count(*) from identities) as carnets,
      (select count(*) from identities where is_active) as activos,
      (select count(distinct owner_clerk_user_id) from identities) as titulares,
      (select count(*) from found_events) as escaneos,
      (select count(*) from emergency_contacts) as contactos,
      (select count(*) from identities where kind='person') as personas,
      (select count(*) from identities where kind='pet') as mascotas,
      (select count(*) from identities
        where created_at > now() - interval '7 days') as nuevos_semana,
      (select count(*) from found_events
        where created_at > now() - interval '7 days') as escaneos_semana` as any[];

  // Los carnets que no sirven: sin a quién llamar es el peor caso
  const aMedias = await sql`
    select i.id, i.display_name, i.kind, i.blood_type, i.owner_clerk_user_id,
      (select count(*) from emergency_contacts c where c.identity_id = i.id)::int as contactos,
      exists(select 1 from medical_info m where m.identity_id = i.id
        and (m.allergies is not null or m.conditions is not null)) as tiene_medico
    from identities i
    where i.is_active
      and (select count(*) from emergency_contacts c where c.identity_id = i.id) = 0
    order by i.created_at desc limit 20` as any[];

  const escaneos = await sql`
    select f.*, i.display_name, i.kind, i.owner_clerk_user_id
    from found_events f join identities i on i.id = f.identity_id
    order by f.created_at desc limit 12` as any[];

  const porTitular = await sql`
    select owner_clerk_user_id as usuario, count(*)::int as carnets,
      max(created_at) as ultimo
    from identities group by owner_clerk_user_id
    order by count(*) desc limit 25` as any[];

  // Los nombres viven en Clerk, no en nuestra base
  let nombres: Record<string, string> = {};
  try {
    const cliente = await clerkClient();
    const lista = await cliente.users.getUserList({ limit: 100 });
    for (const u of lista.data) {
      nombres[u.id] = [u.firstName, u.lastName].filter(Boolean).join(" ")
        || u.emailAddresses?.[0]?.emailAddress || u.id.slice(0, 12);
    }
  } catch { /* si Clerk no responde, se muestran los identificadores */ }

  const quien = (id: string) => nombres[id] || id.slice(0, 14) + "…";

  return (
    <AppShell esDueno active="admin" title="Plataforma">
      <div className="h1">Plataforma</div>
      <div className="sub" style={{ marginBottom: 20 }}>
        Todo Identy-Kit, no solo tus carnets.
      </div>

      <div className="kpigrid">
        <div className="kpi">
          <div className="n">{k.titulares}</div>
          <div className="l">{Number(k.titulares) === 1 ? "Titular" : "Titulares"}</div>
        </div>
        <div className="kpi">
          <div className="n">{k.carnets}</div>
          <div className="l">Carnets</div>
        </div>
        <div className="kpi">
          <div className="n" style={{ color: Number(k.escaneos) > 0 ? "var(--alta)" : undefined }}>
            {k.escaneos}
          </div>
          <div className="l">Escaneos</div>
        </div>
        <div className="kpi">
          <div className="n" style={{ color: aMedias.length > 0 ? "var(--ambar)" : "var(--ok)" }}>
            {aMedias.length}
          </div>
          <div className="l">Sin contactos</div>
        </div>
      </div>

      {(Number(k.nuevos_semana) > 0 || Number(k.escaneos_semana) > 0) && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="kv">
            <span className="k">Carnets nuevos esta semana</span>
            <span className="v">{k.nuevos_semana}</span>
          </div>
          <div className="kv">
            <span className="k">Escaneos esta semana</span>
            <span className="v">{k.escaneos_semana}</span>
          </div>
          <div className="kv">
            <span className="k">Personas / mascotas</span>
            <span className="v">{k.personas} · {k.mascotas}</span>
          </div>
        </div>
      )}

      {/* Lo que de verdad hay que atender */}
      {aMedias.length > 0 && (<>
        <h3>Carnets que no servirían</h3>
        <div className="alertbox" style={{ marginBottom: 12 }}>
          Estos están activos pero <b>no tienen a quién llamar</b>. Si alguien los
          escanea, no va a encontrar un teléfono. Es lo primero que hay que
          resolverle a esa gente.
        </div>
        <div className="grid">
          {aMedias.map((i: any) => (
            <div key={i.id} className="idcard">
              <div className="avatar" style={{ background: "var(--ambar-fondo)",
                color: "var(--ambar)" }}>{EMOJI[i.kind] || "🧑"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{i.display_name}</div>
                <div className="sub" style={{ fontSize: 12.5, marginTop: 2 }}>
                  {quien(i.owner_clerk_user_id)}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ambar)", fontWeight: 600,
                  marginTop: 4 }}>
                  Sin contactos
                  {!i.blood_type && i.kind === "person" ? " · sin tipo de sangre" : ""}
                  {!i.tiene_medico && i.kind === "person" ? " · sin datos médicos" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>)}

      <h3>Titulares</h3>
      <div className="card">
        {porTitular.map((t: any) => (
          <div key={t.usuario} className="kv">
            <span className="k" style={{ fontWeight: 700, color: "var(--tinta)" }}>
              {quien(t.usuario)}
            </span>
            <span className="v">
              {t.carnets} {Number(t.carnets) === 1 ? "carnet" : "carnets"}
            </span>
          </div>
        ))}
      </div>

      <h3>Escaneos recientes</h3>
      {escaneos.length === 0 ? (
        <div className="empty">
          <b style={{ display: "block", color: "var(--tinta)" }}>Nadie ha escaneado todavía</b>
          <div style={{ marginTop: 5, fontSize: 14 }}>
            Aquí va a aparecer cada vez que alguien abra una ficha de emergencia.
          </div>
        </div>
      ) : (
        <div className="card">
          {escaneos.map((f: any) => (
            <div key={f.id} className="acti">
              <div className="ic" style={{ background: "var(--alta-fondo)", color: "var(--alta)" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <path d="M14 14h3v3M20 20h.01M17 20h.01M20 17h.01" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                  {f.display_name}
                </div>
                <div className="sub" style={{ fontSize: 12.5, marginTop: 2 }}>
                  {new Date(f.created_at).toLocaleString("es-MX", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {" · "}{quien(f.owner_clerk_user_id)}
                  {f.finder_note ? ` · "${f.finder_note}"` : ""}
                </div>
                {f.lat && (
                  <a target="_blank" rel="noreferrer"
                    href={`https://maps.google.com/?q=${f.lat},${f.lng}`}
                    style={{ color: "var(--marco)", fontWeight: 700, fontSize: 12.5,
                      display: "inline-block", marginTop: 3 }}>
                    Ver dónde fue
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 26, padding: "14px 16px", borderRadius: 13,
        background: "var(--pulso-claro)", fontSize: 13, color: "var(--marco)",
        lineHeight: 1.55 }}>
        Esta pantalla solo la ve quien tiene rol de dueño. Para dar o quitar ese
        rol, se marca <b>rol: dueno</b> en los datos públicos del usuario, desde
        el panel de Clerk.
      </div>
    </AppShell>
  );
}
