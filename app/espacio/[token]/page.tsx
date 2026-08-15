import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function pct(id: any, hasMed: boolean, contacts: number) {
  const fields = [
    !!id.photo_url,
    !!id.blood_type,
    !!id.birth_date,
    !!(id.public_note || id.national_id),
    hasMed,
    contacts > 0,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function fechaCorta(d: any) {
  try {
    return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default async function Espacio({ params }: { params: { token: string } }) {
  const grant = (await sql`
    select owner_clerk_user_id, label from access_grants
    where token=${params.token} and is_active=true limit 1
  `) as any[];

  if (!grant.length) {
    return (
      <div className="app">
        <div className="app-in" style={{ paddingTop: 90, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <h1 style={{ fontSize: 20, color: "var(--brand-ink)", fontWeight: 800 }}>Acceso no válido</h1>
          <p style={{ color: "#6b7688", fontSize: 14, marginTop: 6 }}>La liga no es correcta o el acceso fue desactivado.</p>
        </div>
      </div>
    );
  }

  const owner = grant[0].owner_clerk_user_id;
  const label = grant[0].label || "Tu espacio";

  const ids = (await sql`select * from identities where owner_clerk_user_id=${owner} order by created_at asc`) as any[];
  const medRows = (await sql`select distinct identity_id from medical_info where identity_id in (select id from identities where owner_clerk_user_id=${owner})`) as any[];
  const conRows = (await sql`select identity_id, count(*)::int n from emergency_contacts where identity_id in (select id from identities where owner_clerk_user_id=${owner}) group by identity_id`) as any[];
  const avisos = (await sql`
    select fe.finder_note, fe.lat, fe.lng, fe.created_at, i.display_name, i.kind
    from found_events fe join identities i on i.id=fe.identity_id
    where i.owner_clerk_user_id=${owner} order by fe.created_at desc limit 8
  `) as any[];

  const medSet = new Set(medRows.map((r) => r.identity_id));
  const conMap = new Map(conRows.map((r) => [r.identity_id, r.n]));

  const personas = ids.filter((i) => i.kind === "person").length;
  const mascotas = ids.filter((i) => i.kind === "pet").length;
  const prom = ids.length
    ? Math.round(ids.reduce((a, i) => a + pct(i, medSet.has(i.id), conMap.get(i.id) || 0), 0) / ids.length)
    : 0;

  const kindLabel = (k: string) => (k === "person" ? "Persona" : k === "pet" ? "Mascota" : "Otro");

  return (
    <div className="app">
      <div className="apptop">
        <div className="app-in" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/icon-192.png" alt="" style={{ width: 34, height: 34, borderRadius: 9 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--brand-ink)", lineHeight: 1.1 }}>Tu espacio</div>
            <div style={{ fontSize: 11, color: "#6b7688" }}>Identy-Kit · {label}</div>
          </div>
        </div>
      </div>

      <div className="app-in" style={{ paddingTop: 18 }}>
        <div className="kpigrid">
          <div className="kpi"><span className="bar" /><div className="ki">🪪</div><div className="kv">{ids.length}</div><div>Carnets</div></div>
          <div className="kpi"><span className="bar" /><div className="ki">📈</div><div className="kv">{prom}%</div><div>Perfil promedio</div></div>
          <div className="kpi"><span className="bar" /><div className="ki">👥</div><div className="kv">{personas}</div><div>Personas</div></div>
          <div className="kpi"><span className="bar" /><div className="ki">🐾</div><div className="kv">{mascotas}</div><div>Mascotas</div></div>
        </div>

        <div className="seclabel" style={{ marginTop: 22 }}>Tus carnets</div>
        {ids.map((i) => {
          const p = pct(i, medSet.has(i.id), conMap.get(i.id) || 0);
          const col = p >= 80 ? "#16a765" : p >= 50 ? "#e0a412" : "#e0574a";
          return (
            <div key={i.id} style={{ background: "#fff", border: "1px solid #e6ebf2", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "#eef4ff", color: "#1e63d0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                  {(i.display_name || "?").slice(0, 1).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--brand-ink)" }}>{i.display_name || "Sin nombre"}</div>
                  <div style={{ fontSize: 11, color: "#6b7688" }}>{kindLabel(i.kind)}{i.blood_type ? " · " + i.blood_type : ""}</div>
                </div>
                {i.qr_token && (
                  <a href={`https://identykit.xyz/e/${i.qr_token}`} style={{ fontSize: 12, color: "#1e63d0", fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>Ver ficha ›</a>
                )}
              </div>
              <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 7, background: "#eef2f7", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: p + "%", height: "100%", background: col, borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: col, minWidth: 32, textAlign: "right" }}>{p}%</div>
              </div>
            </div>
          );
        })}

        <div className="seclabel" style={{ marginTop: 22 }}>Avisos recientes</div>
        {avisos.length === 0 && (
          <div style={{ color: "#6b7688", fontSize: 13, padding: "10px 2px" }}>Aún no hay avisos. Aquí verás cuando alguien escanee un QR.</div>
        )}
        {avisos.map((a, k) => (
          <div key={k} className="acti" style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: "1px solid #eef2f7" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#fff3f2", color: "#e0574a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📍</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, color: "var(--brand-ink)", fontWeight: 700 }}>{a.display_name}</div>
              <div style={{ fontSize: 11.5, color: "#5b6675" }}>{a.finder_note}</div>
              <div style={{ fontSize: 10.5, color: "#9aa4b2", marginTop: 2 }}>
                {fechaCorta(a.created_at)}
                {a.lat && a.lng ? (
                  <> · <a href={`https://maps.google.com/?q=${a.lat},${a.lng}`} style={{ color: "#1e63d0" }}>ver mapa</a></>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", color: "#9aa4b2", fontSize: 10.5, margin: "26px 0 8px" }}>
          Identy-Kit · Espacio privado · acceso protegido por clave personal
        </div>
      </div>
    </div>
  );
}
