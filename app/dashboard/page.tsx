import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import AppShell from "../../components/AppShell";

export const dynamic = "force-dynamic";
const label: Record<string,string> = { person:"Persona", pet:"Mascota", other:"Otro" };

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();
  const ids = await sql`select i.*, (select count(*) from found_events f where f.identity_id=i.id) as founds
    from identities i where owner_clerk_user_id=${userId} order by created_at desc` as any[];
  const recientes = await sql`select f.*, i.display_name, i.kind from found_events f
    join identities i on i.id=f.identity_id
    where i.owner_clerk_user_id=${userId} order by f.created_at desc limit 4` as any[];

  const total = ids.length;
  const avisos = ids.reduce((a:number,i:any)=>a+Number(i.founds||0),0);
  const personas = ids.filter((i:any)=>i.kind==="person").length;
  const mascotas = ids.filter((i:any)=>i.kind==="pet").length;
  const nombre = user?.firstName || "";

  return (
    <AppShell active="inicio" title="Inicio">
      <div className="h1" style={{fontSize:24}}>Hola{nombre?`, ${nombre}`:""} 👋</div>
      <div className="sub" style={{marginBottom:18}}>Este es el estado de tus carnets de emergencia.</div>

      <div className="kpigrid">
        <div className="kpi"><span className="bar"/><div className="kl">Carnets activos</div><div className="kv">{total}</div><span className="ki"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18"/></svg></span></div>
        <div className="kpi"><span className="bar"/><div className="kl">Avisos recibidos</div><div className="kv" style={{color:avisos>0?"var(--danger)":undefined}}>{avisos}</div><span className="ki" style={{background:avisos>0?"#fff1f0":undefined,color:avisos>0?"var(--danger)":undefined}}>🆘</span></div>
        <div className="kpi"><span className="bar"/><div className="kl">Personas</div><div className="kv">{personas}</div><span className="ki">🧑</span></div>
        <div className="kpi"><span className="bar"/><div className="kl">Mascotas</div><div className="kv">{mascotas}</div><span className="ki">🐾</span></div>
      </div>

      <div className="seclabel">Tus carnets<Link href="/admin">Administrar</Link></div>
      {total === 0 ? (
        <div className="card empty">
          <div style={{ fontSize: 42 }}>🪪</div>
          <b style={{ display: "block", marginTop: 8, color: "var(--ink)" }}>Crea tu primer carnet</b>
          <div style={{ marginTop: 4 }}>Toca el botón azul de abajo para empezar.</div>
        </div>
      ) : ids.map((i:any) => (
        <Link key={i.id} href={`/carnet/${i.id}`} className="idcard">
          <div className="avatar">{i.photo_url ? <img src={i.photo_url} alt=""/> : (i.kind==="pet"?"🐾":i.kind==="other"?"📦":"🧑")}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{i.display_name}</div>
            <div className="row" style={{ gap: 6, marginTop: 3 }}>
              <span className={`pill ${i.kind}`}>{label[i.kind]}</span>
              {i.blood_type && <span className="pill">🩸 {i.blood_type}</span>}
              {Number(i.founds)>0 && <span className="pill" style={{ background:"#fff1f0", color:"var(--danger)" }}>🆘 {i.founds}</span>}
            </div>
          </div>
          <span style={{ color: "var(--muted)", fontSize: 22 }}>›</span>
        </Link>
      ))}

      {recientes.length>0 && (<>
        <div className="seclabel">Actividad reciente<Link href="/actividad">Ver todo</Link></div>
        {recientes.map((f:any)=>(
          <div key={f.id} className="acti">
            <div className="ic">🆘</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14.5,color:"var(--brand-ink)"}}>Escanearon el carnet de {f.display_name}</div>
              <div className="sub" style={{marginTop:2}}>{new Date(f.created_at).toLocaleString("es-MX")}{f.finder_note?` · "${f.finder_note}"`:""}</div>
              {f.lat && <a target="_blank" href={`https://maps.google.com/?q=${f.lat},${f.lng}`} style={{color:"var(--accent)",fontWeight:700,fontSize:13}}>Ver ubicación en mapa</a>}
            </div>
          </div>
        ))}
      </>)}
    </AppShell>
  );
}
