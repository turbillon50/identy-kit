import { sql } from "../../../lib/db";
import { ageFrom } from "../../../lib/util";
import { notFound } from "next/navigation";
import FoundActions from "./FoundActions";

import { IconoTipo, IconoDoc } from "@/components/Iconos";

export const dynamic = "force-dynamic";

/**
 * La ficha de emergencia — el corazón del producto.
 *
 * Quien llega aquí no es el titular: es un desconocido que acaba de escanear
 * un QR, o un paramédico con prisa. Puede estar nervioso, con las manos
 * temblando, con mala luz.
 *
 * Por eso esta pantalla rompe con el resto de la app: no lleva menú, no lleva
 * marca arriba compitiendo por atención, y no esconde nada detrás de un toque.
 * Lo que puede salvar una vida va primero y va grande: tipo de sangre,
 * alergias, y a quién llamar.
 */


export default async function Emergencia({ params }: { params: { qr: string } }) {
  const filas = await sql`
    select * from identities where qr_token=${params.qr} and is_active=true` as any[];
  if (!filas.length) notFound();

  const id = filas[0];
  const med = (await sql`
    select * from medical_info where identity_id=${id.id} limit 1` as any[])[0] || {};
  const contactos = await sql`
    select * from emergency_contacts where identity_id=${id.id}
    order by is_primary desc, created_at` as any[];
  // Solo los papeles que el titular marcó para que se vean aquí: su póliza
  // del seguro sí conviene que la abra un hospital, su identificación no.
  const papeles = await sql`
    select id, title, doc_type, file_url from documents
    where identity_id=${id.id} and visible_en_emergencia
    order by created_at` as any[];

  const esMascota = id.kind === "pet";
  const edad = ageFrom(id.birth_date);
  const meta = [
    esMascota ? id.breed || id.species : edad,
    id.sex, id.color,
  ].filter(Boolean).join(" · ");

  // Lo que alguien tiene que saber ANTES de tocar a esta persona.
  // Los tres campos suelen traslaparse — la gente escribe "diabetes" en
  // padecimientos y otra vez en la nota — así que se quita lo repetido para
  // que no salga el mismo dato dos veces en la parte que más se mira.
  const partes: string[] = [];
  for (const t of [med.allergies, med.conditions, id.public_note]) {
    const limpio = String(t || "").trim();
    if (!limpio) continue;
    // Se compara por palabras significativas, no por texto exacto: alguien
    // escribe "Diabetes tipo 1" en padecimientos y "Diabética tipo 1, puede
    // requerir insulina" en la nota, y es el mismo dato dicho de otro modo.
    const clave = (t: string) => new Set(
      t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, " ").split(/\s+/)
        .filter((w) => w.length > 3).map((w) => w.slice(0, 5)));
    const nueva = clave(limpio);
    const yaEsta = partes.some((p) => {
      const previa = clave(p);
      if (!nueva.size || !previa.size) return false;
      const comunes = [...nueva].filter((w) => previa.has(w)).length;
      return comunes >= Math.min(nueva.size, previa.size) * 0.6;
    });
    if (!yaEsta) partes.push(limpio);
  }
  const critico = partes.join(" · ");

  const hayMedico = med.medications || med.implants || med.insurance ||
    med.preferred_hospital || med.doctor_name || med.dnr;

  return (
    <div className="e-wrap">
      <div className={`e-banda${esMascota ? " mascota" : ""}`}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {esMascota
            ? <><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/>
                <circle cx="20" cy="16" r="2"/><circle cx="9" cy="17" r="4"/></>
            : <><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z"/><path d="M12 8v6M9 11h6"/></>}
        </svg>
        {esMascota ? "Mascota perdida" : "Ficha de emergencia"}
      </div>

      {/* Quién es. El nombre lleva el ancho completo: un nombre largo partido
          en tres renglones se lee peor que uno en dos, y aquí se lee de prisa. */}
      <div className="e-cabeza">
        <div className="row" style={{ alignItems: "center", gap: 14 }}>
          {id.photo_url
            ? <img className="e-foto" src={id.photo_url} alt={`Foto de ${id.display_name}`} />
            : <div className="e-foto"><IconoTipo kind={id.kind} size={30} /></div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="e-nombre">{id.display_name}</h1>
            {meta && <div className="e-meta">{meta}</div>}
          </div>
        </div>

        {/* Los signos que se buscan primero, en su propio renglón */}
        {(id.blood_type || id.organ_donor) && (
          <div className="e-signos">
            {id.blood_type && (
              <div className="e-sangre">
                <span className="n">{id.blood_type}</span>
                <span className="t">Sangre</span>
              </div>
            )}
            {id.organ_donor && (
              <div className="e-donante">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 21s-7.5-4.6-9.5-9A5.4 5.4 0 0 1 12 6.6 5.4 5.4 0 0 1 21.5 12c-2 4.4-9.5 9-9.5 9z"/>
                </svg>
                Donante de órganos
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lo que hay que saber antes de actuar. En una persona va en rojo
          porque puede matarla; en una mascota perdida no hay urgencia médica
          que justifique alarmar a quien la encontró. */}
      {critico && (
        <div className={`e-critico${esMascota ? " calmo" : ""}`}>
          <div className="t">{esMascota ? `Sobre ${id.display_name}` : "Antes de atender"}</div>
          <div className="c">{critico}</div>
        </div>
      )}

      {/* A quién llamar — botones grandes, para pulgares nerviosos */}
      <h3>{esMascota ? "Avisar a su familia" : "Llamar ahora"}</h3>
      {contactos.map((c: any) => (
        <a key={c.id} href={`tel:${c.phone}`} className="e-llamar">
          <span>
            <span className="quien">{c.name}</span>
            <span className="rel">{c.relationship || "Contacto"} · {c.phone}</span>
          </span>
          <span className="accion">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>
            </svg>
            Llamar
          </span>
        </a>
      ))}

      {!esMascota && (
        <a href="tel:911" className="e-llamar emergencias">
          <span>
            <span className="quien">Emergencias 911</span>
            <span className="rel">Ambulancia, bomberos, policía</span>
          </span>
          <span className="accion">911</span>
        </a>
      )}

      {/* El detalle, para quien tenga tiempo de leerlo */}
      {hayMedico && (<>
        <h3>Información médica</h3>
        <div className="card">
          {med.medications && (
            <div className="kv"><span className="k">Medicamentos</span>
              <span className="v">{med.medications}</span></div>)}
          {med.implants && (
            <div className="kv"><span className="k">Implantes o aparatos</span>
              <span className="v">{med.implants}</span></div>)}
          {id.weight && (
            <div className="kv"><span className="k">Peso</span>
              <span className="v">{id.weight}</span></div>)}
          {med.preferred_hospital && (
            <div className="kv"><span className="k">Hospital</span>
              <span className="v">{med.preferred_hospital}</span></div>)}
          {med.doctor_name && (
            <div className="kv"><span className="k">{esMascota ? "Veterinario" : "Médico"}</span>
              <span className="v">{med.doctor_name}
                {med.doctor_phone ? ` · ${med.doctor_phone}` : ""}</span></div>)}
          {med.insurance && (
            <div className="kv"><span className="k">Seguro</span>
              <span className="v">{med.insurance}</span></div>)}
          {med.dnr && (
            <div className="kv"><span className="k">Voluntad anticipada</span>
              <span className="v" style={{ color: "var(--alta)" }}>No reanimar</span></div>)}
        </div>
      </>)}

      {esMascota && (id.microchip || med.vaccinations || id.reward_note) && (<>
        <h3>Datos de la mascota</h3>
        <div className="card">
          {id.microchip && (
            <div className="kv"><span className="k">Microchip</span>
              <span className="v">{id.microchip}</span></div>)}
          {med.vaccinations && (
            <div className="kv"><span className="k">Vacunas</span>
              <span className="v">{med.vaccinations}</span></div>)}
          {id.reward_note && (
            <div className="kv"><span className="k">Recompensa</span>
              <span className="v" style={{ color: "var(--ok)" }}>{id.reward_note}</span></div>)}
        </div>
      </>)}

      {papeles.length > 0 && (<>
        <h3>Documentos</h3>
        <div className="card">
          {papeles.map((d: any, i: number) => (
            <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer"
              className="row" style={{ gap: 12, padding: "12px 0",
                borderBottom: i < papeles.length - 1 ? "1px solid var(--linea-suave)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                background: "var(--pulso-claro)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 17 }}>
                <IconoDoc tipo={d.doc_type} size={18} />
              </div>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700,
                color: "var(--tinta)" }}>{d.title}</span>
              <span style={{ color: "var(--gris-claro)", fontSize: 19 }}>›</span>
            </a>
          ))}
        </div>
      </>)}

      <FoundActions qr={id.qr_token} name={id.display_name} isPet={esMascota} />

      <div className="e-pie">
        <img src="/marca-192.png" alt="" width={19} height={19} />
        Protegido con Identy-Kit
      </div>
    </div>
  );
}
