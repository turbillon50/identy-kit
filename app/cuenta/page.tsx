import { currentUser, auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import AppShell from "../../components/AppShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * La cuenta.
 *
 * Antes era una lista de ligas, una de ellas rota — apuntaba a /e/demo, un
 * código que no existe — y otra a la administración, que ya no se entra desde
 * aquí. Ahora dice lo que de verdad le sirve saber al titular: cuánto tiene
 * guardado, qué está por vencer, y cómo se protege su información.
 */
export default async function Cuenta() {
  const { userId } = await auth();
  const user = await currentUser();

  const [k] = await sql`
    select
      (select count(*) from identities where owner_clerk_user_id = ${userId}) as carnets,
      (select count(*) from identities where owner_clerk_user_id = ${userId}
        and is_active) as activos,
      (select count(*) from documents d join identities i on i.id = d.identity_id
        where i.owner_clerk_user_id = ${userId}) as documentos,
      (select count(*) from access_grants
        where owner_clerk_user_id = ${userId} and is_active
        and (vence is null or vence > now())) as accesos,
      (select count(*) from found_events f join identities i on i.id = f.identity_id
        where i.owner_clerk_user_id = ${userId}) as escaneos` as any[];

  // Lo que está por caducar: un documento vencido no sirve en una urgencia
  const porVencer = await sql`
    select d.title, d.vence, i.display_name, i.id as carnet
    from documents d join identities i on i.id = d.identity_id
    where i.owner_clerk_user_id = ${userId} and d.vence is not null
      and d.vence < now() + interval '60 days'
    order by d.vence limit 6` as any[];

  const accesosPorVencer = await sql`
    select a.label, a.vence, i.display_name, i.id as carnet
    from access_grants a left join identities i on i.id = a.identity_id
    where a.owner_clerk_user_id = ${userId} and a.is_active
      and a.vence is not null and a.vence < now() + interval '14 days'
      and a.vence > now()
    order by a.vence limit 5` as any[];

  const correo = user?.emailAddresses?.[0]?.emailAddress || "";
  const nombre = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Tu cuenta";

  return (
    <AppShell active="cuenta" title="Cuenta">
      <div className="card">
        <div className="row" style={{ gap: 14 }}>
          <div style={{ transform: "scale(1.4)", transformOrigin: "left center",
            marginLeft: 6 }}>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.02em" }}>
              {nombre}
            </div>
            {correo && (
              <div className="sub" style={{ fontSize: 13, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{correo}</div>
            )}
          </div>
        </div>
      </div>

      <div className="kpigrid" style={{ marginTop: 12 }}>
        <div className="kpi">
          <div className="n">{k.carnets}</div>
          <div className="l">{Number(k.carnets) === 1 ? "Carnet" : "Carnets"}</div>
        </div>
        <div className="kpi">
          <div className="n">{k.documentos}</div>
          <div className="l">Documentos</div>
        </div>
        <div className="kpi">
          <div className="n">{k.accesos}</div>
          <div className="l">Compartidos</div>
        </div>
        <div className="kpi">
          <div className="n" style={{ color: Number(k.escaneos) > 0 ? "var(--alta)" : undefined }}>
            {k.escaneos}
          </div>
          <div className="l">Escaneos</div>
        </div>
      </div>

      {(porVencer.length > 0 || accesosPorVencer.length > 0) && (<>
        <h3>Ojo con esto</h3>
        <div className="card">
          {porVencer.map((d: any, i: number) => {
            const vencido = new Date(d.vence) < new Date();
            return (
              <Link key={i} href={`/carnet/${d.carnet}`} className="kv">
                <span className="k" style={{ color: "var(--tinta)", fontWeight: 700 }}>
                  {d.title}
                </span>
                <span className="v" style={{ color: vencido ? "var(--alta)" : "var(--ambar)" }}>
                  {vencido ? "Ya venció" : `Vence ${new Date(d.vence).toLocaleDateString("es-MX",
                    { day: "numeric", month: "short" })}`}
                </span>
              </Link>
            );
          })}
          {accesosPorVencer.map((a: any, i: number) => (
            <Link key={`a${i}`} href={`/carnet/${a.carnet}`} className="kv">
              <span className="k" style={{ color: "var(--tinta)", fontWeight: 700 }}>
                Acceso de {a.label}
              </span>
              <span className="v" style={{ color: "var(--ambar)" }}>
                Vence {new Date(a.vence).toLocaleDateString("es-MX",
                  { day: "numeric", month: "short" })}
              </span>
            </Link>
          ))}
        </div>
      </>)}

      <h3>Tu información</h3>
      <div className="card">
        <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--gris)" }}>
          El código QR solo muestra lo que marcaste como visible en emergencia.
          Tus documentos, tu domicilio y lo demás quedan detrás de tu cuenta.
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.65, color: "var(--gris)", marginTop: 12 }}>
          Puedes apagar un carnet cuando quieras y su código deja de abrir en ese
          momento. Los accesos que compartes vencen solos, y los puedes quitar
          antes desde el carnet.
        </div>
      </div>

      <h3>Ir a</h3>
      <div className="grid">
        <Link href="/dashboard" className="idcard">
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15 }}>Mis carnets</b>
            <div className="sub" style={{ fontSize: 13 }}>
              {k.activos} {Number(k.activos) === 1 ? "activo" : "activos"}
            </div>
          </div>
          <span style={{ color: "var(--gris-claro)", fontSize: 20 }}>›</span>
        </Link>
        <Link href="/actividad" className="idcard">
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 15 }}>Actividad</b>
            <div className="sub" style={{ fontSize: 13 }}>Escaneos, auxilios y accesos</div>
          </div>
          <span style={{ color: "var(--gris-claro)", fontSize: 20 }}>›</span>
        </Link>
      </div>

      <div style={{ marginTop: 22 }}>
        <SignOutButton redirectUrl="/">
          <button className="btn ghost" style={{ color: "var(--alta)",
            borderColor: "rgba(217,43,31,.25)" }}>Cerrar sesión</button>
        </SignOutButton>
      </div>
    </AppShell>
  );
}
