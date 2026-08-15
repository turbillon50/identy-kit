import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import AppShell from "../../components/AppShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Todo lo que ha pasado con tus carnets.
 *
 * Antes solo mostraba escaneos. Pero ahora también hay auxilios pedidos y
 * gente entrando por accesos compartidos, y eso es justo lo que un titular
 * querría revisar: quién vio qué y cuándo.
 *
 * Va todo en una sola línea de tiempo, porque separarlo obligaría a revisar
 * tres pantallas para saber qué pasó ayer.
 */
export default async function Actividad() {
  const { userId } = await auth();

  const escaneos = await sql`
    select f.id, f.created_at as cuando, f.lat, f.lng, f.finder_note as nota,
      i.display_name as quien, i.id as carnet, 'escaneo' as tipo
    from found_events f join identities i on i.id = f.identity_id
    where i.owner_clerk_user_id = ${userId}
    order by f.created_at desc limit 60` as any[];

  const auxilios = await sql`
    select s.id, s.triggered_at as cuando, s.lat, s.lng, s.mensaje as nota,
      s.avisados, s.cerrado_at, i.display_name as quien, i.id as carnet, 'auxilio' as tipo
    from sos_events s join identities i on i.id = s.identity_id
    where i.owner_clerk_user_id = ${userId}
    order by s.triggered_at desc limit 40` as any[];

  const visitas = await sql`
    select a.token as id, a.ultimo_uso as cuando, a.label as nota, a.usos,
      i.display_name as quien, i.id as carnet, 'acceso' as tipo
    from access_grants a left join identities i on i.id = a.identity_id
    where a.owner_clerk_user_id = ${userId} and a.ultimo_uso is not null
    order by a.ultimo_uso desc limit 40` as any[];

  const todo = [...escaneos, ...auxilios, ...visitas]
    .filter((e: any) => e.cuando)
    .sort((a: any, b: any) => +new Date(b.cuando) - +new Date(a.cuando));

  const PINTA: Record<string, any> = {
    escaneo: { fondo: "var(--alta-fondo)", color: "var(--alta)", que: "Escanearon el carnet de" },
    auxilio: { fondo: "var(--alta-fondo)", color: "var(--alta)", que: "Se pidió ayuda desde el carnet de" },
    acceso: { fondo: "var(--pulso-claro)", color: "var(--marco)", que: "Entraron al carnet de" },
  };

  return (
    <AppShell active="actividad" title="Actividad">
      <div className="h1">Actividad</div>
      <div className="sub" style={{ marginBottom: 20 }}>
        Cada vez que alguien escanea, pide ayuda o entra con un acceso compartido.
      </div>

      {todo.length === 0 ? (
        <div className="empty">
          <b style={{ display: "block", fontSize: 16, color: "var(--tinta)" }}>
            Todavía no ha pasado nada
          </b>
          <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.55 }}>
            Y ojalá siga así. Cuando alguien escanee un carnet o entre con un
            acceso que hayas compartido, lo vas a ver aquí.
          </div>
        </div>
      ) : (
        <div className="card">
          {todo.map((e: any, i: number) => {
            const p = PINTA[e.tipo];
            return (
              <div key={`${e.tipo}-${e.id}`} className="acti"
                style={{ borderBottom: i < todo.length - 1
                  ? "1px solid var(--linea-suave)" : "none" }}>
                <div className="ic" style={{ background: p.fondo, color: p.color }}>
                  {e.tipo === "auxilio" ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                  ) : e.tipo === "acceso" ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                      strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <path d="M14 14h3v3M20 20h.01M17 20h.01M20 17h.01" />
                    </svg>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                    {p.que} {e.quien}
                    {e.tipo === "auxilio" && !e.cerrado_at && (
                      <span className="pill alta" style={{ marginLeft: 8, fontSize: 11 }}>
                        Sin cerrar
                      </span>
                    )}
                  </div>
                  <div className="sub" style={{ fontSize: 13, marginTop: 2 }}>
                    {new Date(e.cuando).toLocaleString("es-MX", {
                      day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                    {e.tipo === "acceso" && e.usos > 1 && ` · ${e.usos} veces en total`}
                    {e.tipo === "auxilio" && (e.avisados > 0
                      ? " · se avisó por correo" : " · no salió el correo")}
                  </div>
                  {e.nota && (
                    <div style={{ fontSize: 13.5, color: "var(--tinta)", marginTop: 5,
                      lineHeight: 1.45, fontStyle: e.tipo === "acceso" ? "normal" : "italic" }}>
                      {e.tipo === "acceso" ? `Acceso: ${e.nota}` : `"${e.nota}"`}
                    </div>
                  )}
                  <div className="row" style={{ gap: 14, marginTop: 6 }}>
                    {e.lat && (
                      <a target="_blank" rel="noreferrer"
                        href={`https://maps.google.com/?q=${e.lat},${e.lng}`}
                        style={{ color: "var(--marco)", fontWeight: 700, fontSize: 13 }}>
                        Ver dónde fue
                      </a>
                    )}
                    {e.carnet && (
                      <Link href={`/carnet/${e.carnet}`}
                        style={{ color: "var(--gris)", fontWeight: 700, fontSize: 13 }}>
                        Abrir carnet
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
