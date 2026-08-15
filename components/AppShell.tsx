"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";

const I = {
  menu:<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>,
  home:(a:boolean)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.4:1.9} strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>,
  cards:(a:boolean)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.4:1.9} strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18"/></svg>,
  acti:(a:boolean)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.4:1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2 6 4-14 2 8h6"/></svg>,
  user:(a:boolean)=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.4:1.9} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>,
  plus:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  grid:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>,
  admin:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>,
  gear:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 2h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 22h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6A7 7 0 0 0 19 12z"/></svg>,
  help:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4 2c-.5 1-2 1.3-2 2.5"/><path d="M12 17h.01"/></svg>,
  out:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>,
};

export default function AppShell({ active, title, children, esDueno = false }:
  { active:string; title:string; children:React.ReactNode; esDueno?:boolean }) {
  const [drawer,setDrawer]=useState(false);
  const [sheet,setSheet]=useState(false);
  const [kind,setKind]=useState<string>("person");
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  const router=useRouter();

  async function crear(){
    if(!name.trim()||busy) return;
    setBusy(true);
    try{
      const r=await fetch("/api/identities",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,display_name:name.trim()})});
      const d=await r.json();
      if(d.id){ setSheet(false); setName(""); router.push(`/carnet/${d.id}`); }
    }finally{ setBusy(false); }
  }

  const dl=(href:string,icon:any,txt:string,on=false)=>(
    <Link href={href} className={`dlink${on?" active":""}`} onClick={()=>setDrawer(false)}>{icon}{txt}</Link>
  );

  return (
    <div className="app">
      <div className="apptop">
        <button className="iconbtn" aria-label="Menú" onClick={()=>setDrawer(true)}>{I.menu}</button>
        <span className="ttl">{title}</span>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="app-in">{children}</div>

      {/* overlay */}
      <div className={`ov${drawer||sheet?" on":""}`} onClick={()=>{setDrawer(false);setSheet(false);}} />

      {/* drawer */}
      <aside className={`drawer${drawer?" on":""}`}>
        <div className="dh"><img src="/icon-192.png" alt=""/><div><b>Identy·kit</b><div className="sub" style={{fontSize:12}}>Tu identidad, segura</div></div></div>
        {dl("/dashboard",I.home(false),"Inicio",active==="inicio")}
        {dl("/dashboard",I.cards(false),"Mis carnets",active==="carnets")}
        {dl("/actividad",I.acti(false),"Actividad",active==="actividad")}
        {esDueno && dl("/admin",I.admin,"Plataforma",active==="admin")}
        <div className="dsep"/>
        {dl("/cuenta",I.gear,"Ajustes",active==="cuenta")}
        
        <div className="dsep"/>
        <SignOutButton redirectUrl="/"><div className="dlink danger">{I.out}Cerrar sesión</div></SignOutButton>
      </aside>

      {/* composer */}
      <div className={`sheet${sheet?" on":""}`}>
        <div className="grab"/>
        <h3>Nuevo carnet</h3>
        <div className="sub">¿Para quién es este carnet?</div>
        <div className="typegrid">
          {[["person","🧑","Persona"],["pet","🐾","Mascota"],["other","📦","Otro"]].map(([k,e,n])=>(
            <div key={k} className={`typeopt${kind===k?" sel":""}`} onClick={()=>setKind(k)}>
              <div className="em">{e}</div><div className="nm">{n}</div>
            </div>
          ))}
        </div>
        <div className="field">
          <label className="label">Nombre</label>
          <input className="input" placeholder={kind==="pet"?"Ej. Rocky":"Ej. Carlos Martínez"} value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <button className="btn" disabled={busy||!name.trim()} onClick={crear} style={{opacity:busy||!name.trim()?.6:1}}>{busy?"Creando…":"Crear carnet"}</button>
        <button className="btn ghost" style={{marginTop:10}} onClick={()=>setSheet(false)}>Cancelar</button>
      </div>

      {/* tab bar */}
      <nav className="tabbar">
        <Link href="/dashboard" className={`tab${active==="inicio"?" on":""}`}>{I.home(active==="inicio")}Inicio</Link>
        <Link href="/dashboard" className={`tab${active==="carnets"?" on":""}`}>{I.cards(active==="carnets")}Carnets</Link>
        <button className="tab mid" aria-label="Crear" onClick={()=>setSheet(true)}><span className="plus">{I.plus}</span></button>
        <Link href="/actividad" className={`tab${active==="actividad"?" on":""}`}>{I.acti(active==="actividad")}Actividad</Link>
        <Link href="/cuenta" className={`tab${active==="cuenta"?" on":""}`}>{I.user(active==="cuenta")}Cuenta</Link>
      </nav>
    </div>
  );
}
