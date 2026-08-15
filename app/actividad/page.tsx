import { auth } from "@clerk/nextjs/server";
import { sql } from "../../lib/db";
import AppShell from "../../components/AppShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Actividad() {
  const { userId } = await auth();
  const ev = await sql`select f.*, i.display_name, i.kind, i.id as cid from found_events f
    join identities i on i.id=f.identity_id
    where i.owner_clerk_user_id=${userId} order by f.created_at desc limit 60` as any[];

  return (
    <AppShell active="actividad" title="Actividad">
      <div className="h1" style={{fontSize:22}}>Avisos de emergencia</div>
      <div className="sub" style={{marginBottom:18}}>Cada vez que alguien escanea un QR y avisa, aparece aquí.</div>
      {ev.length===0 ? (
        <div className="card empty">
          <div style={{fontSize:42}}>📭</div>
          <b style={{display:"block",marginTop:8,color:"var(--ink)"}}>Sin avisos todavía</b>
          <div style={{marginTop:4}}>Cuando alguien escanee un carnet, lo verás aquí al instante.</div>
        </div>
      ) : ev.map((f:any)=>(
        <div key={f.id} className="acti">
          <div className="ic">🆘</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:15,color:"var(--brand-ink)"}}>{f.display_name}</div>
            <div className="sub" style={{marginTop:2}}>{new Date(f.created_at).toLocaleString("es-MX")}</div>
            {f.finder_note && <div className="sub" style={{marginTop:4,fontStyle:"italic"}}>"{f.finder_note}"</div>}
            <div className="row" style={{gap:12,marginTop:8}}>
              {f.lat && <a target="_blank" href={`https://maps.google.com/?q=${f.lat},${f.lng}`} style={{color:"var(--accent)",fontWeight:700,fontSize:13}}>📍 Ver ubicación</a>}
              <Link href={`/carnet/${f.cid}`} style={{color:"var(--brand)",fontWeight:700,fontSize:13}}>Abrir carnet</Link>
            </div>
          </div>
        </div>
      ))}
    </AppShell>
  );
}
