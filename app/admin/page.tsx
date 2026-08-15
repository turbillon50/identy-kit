import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import AppShell from "../../components/AppShell";

export const dynamic = "force-dynamic";
const label: Record<string,string> = { person:"Persona", pet:"Mascota", other:"Otro" };

function pctOf(i:any){
  const f=[!!i.photo_url,!!i.blood_type,!!i.birth_date,!!(i.public_note||i.national_id),i.hasmed,Number(i.contacts)>0];
  return Math.round(f.filter(Boolean).length/f.length*100);
}

export default async function Admin() {
  const { userId } = await auth();
  const ids = await sql`select i.*,
    (select count(*) from found_events f where f.identity_id=i.id)::int founds,
    (select count(*) from emergency_contacts c where c.identity_id=i.id)::int contacts,
    exists(select 1 from medical_info m where m.identity_id=i.id) hasmed
    from identities i where owner_clerk_user_id=${userId} order by created_at desc` as any[];

  const total=ids.length;
  const avisos=ids.reduce((a:number,i:any)=>a+Number(i.founds||0),0);
  const conAviso=ids.filter((i:any)=>Number(i.founds)>0).length;
  const prom = total? Math.round(ids.reduce((a:number,i:any)=>a+pctOf(i),0)/total):0;
  const personas=ids.filter((i:any)=>i.kind==="person").length;
  const mascotas=ids.filter((i:any)=>i.kind==="pet").length;
  const otros=ids.filter((i:any)=>i.kind==="other").length;

  return (
    <AppShell active="admin" title="Administración">
      <div className="h1" style={{fontSize:22}}>Panel de control</div>
      <div className="sub" style={{marginBottom:18}}>Todo tu ecosistema de carnets en un lugar.</div>

      <div className="kpigrid">
        <div className="kpi"><span className="bar"/><div className="kl">Carnets totales</div><div className="kv">{total}</div><span className="ki">🪪</span></div>
        <div className="kpi"><span className="bar"/><div className="kl">Perfil promedio</div><div className="kv">{prom}%</div><span className="ki">📊</span></div>
        <div className="kpi"><span className="bar"/><div className="kl">Avisos totales</div><div className="kv" style={{color:avisos>0?"var(--danger)":undefined}}>{avisos}</div><span className="ki" style={{background:avisos>0?"#fff1f0":undefined,color:avisos>0?"var(--danger)":undefined}}>🆘</span></div>
        <div className="kpi"><span className="bar"/><div className="kl">Con avisos</div><div className="kv">{conAviso}</div><span className="ki">📍</span></div>
      </div>

      <div className="card" style={{padding:16,marginBottom:18}}>
        <div className="kl" style={{fontWeight:700,color:"var(--brand-ink)",marginBottom:12}}>Distribución por tipo</div>
        {[["Personas",personas,"🧑"],["Mascotas",mascotas,"🐾"],["Otros",otros,"📦"]].map(([n,v,e]:any)=>(
          <div key={n} style={{marginBottom:10}}>
            <div className="row" style={{justifyContent:"space-between",marginBottom:4}}><span className="sub">{e} {n}</span><b style={{color:"var(--brand-ink)"}}>{v}</b></div>
            <div className="meter"><i style={{width:`${total?Math.round(v/total*100):0}%`}}/></div>
          </div>
        ))}
      </div>

      <div className="seclabel">Gestión de carnets</div>
      {total===0 ? (
        <div className="card empty"><div style={{fontSize:38}}>🗂️</div><b style={{display:"block",marginTop:8,color:"var(--ink)"}}>Aún no hay carnets</b></div>
      ) : ids.map((i:any)=>{
        const pct=pctOf(i);
        return (
          <Link key={i.id} href={`/carnet/${i.id}`} className="idcard" style={{alignItems:"flex-start"}}>
            <div className="avatar">{i.photo_url ? <img src={i.photo_url} alt=""/> : (i.kind==="pet"?"🐾":i.kind==="other"?"📦":"🧑")}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className="row" style={{justifyContent:"space-between"}}>
                <div style={{fontWeight:700,fontSize:15}}>{i.display_name}</div>
                {Number(i.founds)>0 && <span className="pill" style={{background:"#fff1f0",color:"var(--danger)"}}>🆘 {i.founds}</span>}
              </div>
              <div className="row" style={{gap:6,margin:"4px 0 8px"}}>
                <span className={`pill ${i.kind}`}>{label[i.kind]}</span>
                {i.blood_type && <span className="pill">🩸 {i.blood_type}</span>}
                <span className="pill">{i.contacts} contacto{i.contacts!==1?"s":""}</span>
              </div>
              <div className="row" style={{justifyContent:"space-between",marginBottom:4}}><span className="sub" style={{fontSize:12}}>Completado</span><b style={{fontSize:12,color:pct>=80?"var(--ok)":"var(--warn)"}}>{pct}%</b></div>
              <div className="meter"><i style={{width:`${pct}%`}}/></div>
            </div>
          </Link>
        );
      })}
    </AppShell>
  );
}
