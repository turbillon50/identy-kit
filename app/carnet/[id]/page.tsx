import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { sql } from "../../../lib/db";
import { qrSvg } from "../../../lib/qr";
import { completeness, ageFrom } from "../../../lib/util";
import IdentityForm from "./IdentityForm";
import MedicalForm from "./MedicalForm";
import ContactsPanel from "./ContactsPanel";
import QrShare from "./QrShare";
import AppShell from "../../../components/AppShell";

export const dynamic = "force-dynamic";
const label: Record<string,string> = { person:"Persona", pet:"Mascota", other:"Otro" };

export default async function Carnet({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const rows = await sql`select * from identities where id=${params.id} and owner_clerk_user_id=${userId}` as any[];
  if (!rows.length) notFound();
  const id = rows[0];
  const med = (await sql`select * from medical_info where identity_id=${id.id} limit 1` as any[])[0] || {};
  const contacts = await sql`select * from emergency_contacts where identity_id=${id.id} order by is_primary desc, created_at` as any[];
  const found = await sql`select * from found_events where identity_id=${id.id} order by created_at desc limit 5` as any[];
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://identykit.xyz";
  const url = `${base}/e/${id.qr_token}`;
  const svg = await qrSvg(url, { color: "#0e2a5c" });
  const pct = completeness(id, med, contacts.length);
  const isPet = id.kind === "pet";

  return (
    <AppShell active="carnets" title="Carnet">
      <Link href="/dashboard" className="sub" style={{display:"inline-block",marginBottom:12}}>‹ Mis carnets</Link>

      {found.length > 0 && (
        <div className="alertbox" style={{ marginBottom: 16 }}>
          <b>🆘 Alguien escaneó este carnet</b>
          {found.map((f:any)=>(
            <div key={f.id} className="sub" style={{ marginTop: 6 }}>
              {new Date(f.created_at).toLocaleString("es-MX")} {f.finder_note?`· "${f.finder_note}"`:""}
              {f.lat && <> · <a style={{color:"var(--accent)",fontWeight:700}} target="_blank" href={`https://maps.google.com/?q=${f.lat},${f.lng}`}>Ver ubicación en mapa</a></>}
            </div>
          ))}
        </div>
      )}

      <div className="card center" style={{ gap: 12 }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: 34 }}>
          {id.photo_url ? <img src={id.photo_url} alt=""/> : (isPet?"🐾":id.kind==="other"?"📦":"🧑")}
        </div>
        <div><div className="h1" style={{ fontSize: 23 }}>{id.display_name}</div>
          <div className="sub">{[isPet?(id.breed||id.species):ageFrom(id.birth_date), id.blood_type&&`Sangre ${id.blood_type}`].filter(Boolean).join(" · ")}</div>
        </div>
        <div style={{ width: "100%", marginTop: 4 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}><span className="sub">Perfil completo</span><b style={{ color: pct>=80?"var(--ok)":"var(--warn)" }}>{pct}%</b></div>
          <div className="meter"><i style={{ width: `${pct}%` }} /></div>
        </div>
        <div dangerouslySetInnerHTML={{ __html: svg }} style={{ width: 200, height: 200, marginTop: 6 }} />
        <div className="sub">Escanea para ver la ficha de emergencia</div>
        <QrShare url={url} svg={svg} />
        <Link href={`/carnet/${id.id}/imprimir`} className="btn dark" style={{width:"100%"}}>Imprimir tarjeta con QR</Link>
      </div>

      <h3 style={{ marginTop: 24 }}>Datos del carnet</h3>
      <IdentityForm identity={id} />

      <h3 style={{ marginTop: 24 }}>Ficha médica</h3>
      <MedicalForm identityId={id.id} initial={med} isPet={isPet} />

      <h3 style={{ marginTop: 24 }}>Contactos de emergencia</h3>
      <ContactsPanel identityId={id.id} initial={contacts} />
    </AppShell>
  );
}
