import { currentUser, auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import AppShell from "../../components/AppShell";
import Link from "next/link";


export const dynamic = "force-dynamic";

export default async function Cuenta() {
  const { userId } = await auth();
  const user = await currentUser();
  const c = (await sql`select count(*)::int n from identities where owner_clerk_user_id=${userId}` as any[])[0]?.n ?? 0;
  const email = user?.emailAddresses?.[0]?.emailAddress || "";
  const nombre = [user?.firstName,user?.lastName].filter(Boolean).join(" ") || "Mi cuenta";

  return (
    <AppShell active="cuenta" title="Cuenta">
      <div className="card center" style={{gap:10}}>
        <div style={{transform:"scale(1.5)",margin:"6px 0"}}><UserButton afterSignOutUrl="/"/></div>
        <div className="h1" style={{fontSize:20}}>{nombre}</div>
        {email && <div className="sub">{email}</div>}
        <div className="pill" style={{marginTop:4}}>{c} carnet{c!==1?"s":""}</div>
      </div>

      <div className="seclabel">Ajustes</div>
      <Link href="/dashboard" className="idcard"><div style={{flex:1}}><b>Mis carnets</b><div className="sub">Ver y editar tus carnets</div></div><span style={{color:"var(--muted)"}}>›</span></Link>
      <Link href="/admin" className="idcard"><div style={{flex:1}}><b>Administración</b><div className="sub">Métricas y gestión</div></div><span style={{color:"var(--muted)"}}>›</span></Link>
      <a href="/e/demo" target="_blank" className="idcard"><div style={{flex:1}}><b>Cómo se ve mi QR</b><div className="sub">Vista de la ficha pública</div></div><span style={{color:"var(--muted)"}}>›</span></a>

      <div style={{marginTop:20}}>
        <SignOutButton redirectUrl="/"><button className="btn ghost" style={{color:"var(--danger)",borderColor:"#f3c9c4"}}>Cerrar sesión</button></SignOutButton>
      </div>
    </AppShell>
  );
}
