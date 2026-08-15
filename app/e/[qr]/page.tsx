import { sql } from "../../../lib/db";
import { ageFrom } from "../../../lib/util";
import { notFound } from "next/navigation";
import FoundActions from "./FoundActions";

export const dynamic = "force-dynamic";

export default async function Emergency({ params }: { params: { qr: string } }) {
  const rows = await sql`select * from identities where qr_token=${params.qr} and is_active=true` as any[];
  if (!rows.length) notFound();
  const id = rows[0];
  const med = (await sql`select * from medical_info where identity_id=${id.id} limit 1` as any[])[0] || {};
  const contacts = await sql`select * from emergency_contacts where identity_id=${id.id} order by is_primary desc, created_at` as any[];
  const isPet = id.kind === "pet";
  const age = ageFrom(id.birth_date);
  const emoji = isPet ? "🐾" : id.kind === "other" ? "📦" : "🧑";
  const meta = [isPet ? id.breed || id.species : (age || null), id.sex, id.color].filter(Boolean).join(" · ");
  const critical = [id.public_note, med.conditions].filter(Boolean).join(" — ");

  return (
    <div className="wrap" style={{ paddingTop: 14 }}>
      <div className="ehero">
        <div className="band"><span>🚨</span> FICHA DE EMERGENCIA{isPet ? " · MASCOTA" : ""}</div>
        <div className="body">
          <div className="row" style={{ alignItems: "flex-start" }}>
            {id.photo_url
              ? <img className="ephoto" src={id.photo_url} alt="" />
              : <div className="ephoto">{emoji}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ename">{id.display_name}</div>
              {meta && <div className="sub" style={{ marginTop: 2 }}>{meta}</div>}
              <div className="row" style={{ flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {id.blood_type && <span className="tag red">🩸 {id.blood_type}</span>}
                {id.organ_donor && <span className="tag teal">💚 Donante</span>}
                {med.allergies && <span className="tag amber">⚠️ Alergias</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {critical && (
        <div className="alertbox" style={{ marginTop: 14 }}>
          <b>⚠️ Atención</b>
          <div style={{ marginTop: 4, fontWeight: 600 }}>{critical}</div>
        </div>
      )}

      <h3 style={{ marginTop: 20 }}>{isPet ? "Contactar al dueño" : "Llamar en emergencia"}</h3>
      <div>
        {contacts.map((c: any) => (
          <a key={c.id} href={`tel:${c.phone}`} className="callbtn">
            <span>
              <span style={{ display: "block", fontSize: 16 }}>{c.name}</span>
              <span style={{ opacity: .85, fontWeight: 600, fontSize: 13 }}>{c.relationship || "Contacto"}</span>
            </span>
            <span>📞 Llamar</span>
          </a>
        ))}
        <a href="tel:911" className="callbtn call911">
          <span><span style={{ display: "block", fontSize: 16 }}>Emergencias 911</span>
          <span style={{ opacity: .85, fontWeight: 600, fontSize: 13 }}>Servicios de emergencia</span></span>
          <span>📞 911</span>
        </a>
      </div>

      {(med.allergies || med.conditions || med.medications || med.implants || med.insurance || med.preferred_hospital || med.doctor_name) && <>
        <h3 style={{ marginTop: 20 }}>Información médica</h3>
        <div className="card">
          {med.allergies && <div className="kv"><span className="k">Alergias</span><span className="v" style={{color:"var(--danger)"}}>{med.allergies}</span></div>}
          {med.conditions && <div className="kv"><span className="k">Padecimientos</span><span className="v">{med.conditions}</span></div>}
          {med.medications && <div className="kv"><span className="k">Medicamentos</span><span className="v">{med.medications}</span></div>}
          {med.implants && <div className="kv"><span className="k">Implantes/aparatos</span><span className="v">{med.implants}</span></div>}
          {id.weight && <div className="kv"><span className="k">Peso</span><span className="v">{id.weight}</span></div>}
          {med.insurance && <div className="kv"><span className="k">Seguro</span><span className="v">{med.insurance}</span></div>}
          {med.preferred_hospital && <div className="kv"><span className="k">Hospital</span><span className="v">{med.preferred_hospital}</span></div>}
          {med.doctor_name && <div className="kv"><span className="k">{isPet?"Veterinario":"Médico"}</span><span className="v">{med.doctor_name}{med.doctor_phone?` · ${med.doctor_phone}`:""}</span></div>}
          {med.dnr && <div className="kv"><span className="k">Voluntad</span><span className="v" style={{color:"var(--danger)"}}>No reanimar (DNR)</span></div>}
        </div>
      </>}

      {isPet && (id.microchip || id.vaccinations || id.reward_note) && <>
        <h3 style={{ marginTop: 20 }}>Datos de la mascota</h3>
        <div className="card">
          {id.microchip && <div className="kv"><span className="k">Microchip</span><span className="v">{id.microchip}</span></div>}
          {med.vaccinations && <div className="kv"><span className="k">Vacunas</span><span className="v">{med.vaccinations}</span></div>}
          {id.reward_note && <div className="kv"><span className="k">Recompensa</span><span className="v" style={{color:"var(--brand-ink)"}}>{id.reward_note}</span></div>}
        </div>
      </>}

      <FoundActions qr={id.qr_token} name={id.display_name} isPet={isPet} />

      <div className="foot"><img src="/icon-192.png" width={20} height={20} alt="" /> Protegido con Identy-Kit</div>
    </div>
  );
}
