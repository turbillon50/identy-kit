import { sql } from "@/lib/db";
import { ageFrom } from "@/lib/util";

export const dynamic = "force-dynamic";

const EMOJI: Record<string, string> = { person: "🧑", pet: "🐾", other: "📦" };
const ICONO = (t: string) =>
  t === "seguro" ? "🛡️" : t === "receta" ? "💊" : t === "vacunas" ? "💉"
  : t === "estudio" ? "🔬" : t === "identificacion" ? "🪪" : "📄";

/**
 * Lo que ve quien recibió un acceso compartido.
 *
 * Antes esta pantalla mostraba TODOS los carnets del dueño: si le dabas acceso
 * a la escuela para ver el de tu hijo, veía también el tuyo, el de tu papá y
 * el del perro. Ahora muestra solo el carnet que se compartió, y los
 * documentos solo si se marcó ese permiso.
 *
 * Es una vista de lectura. Quien entra aquí no puede cambiar nada.
 */
export default async function Espacio({ params }: { params: { token: string } }) {
  const filas = await sql`
    select * from access_grants where token = ${params.token} limit 1` as any[];

  const acceso = filas[0];
  const vencido = acceso?.vence && new Date(acceso.vence) < new Date();

  if (!acceso || !acceso.is_active || vencido) {
    return (
      <div className="wrap" style={{ paddingTop: 90, textAlign: "center", maxWidth: 400 }}>
        <img src="/icon-192.png" width={48} height={48} alt=""
          style={{ borderRadius: 13, opacity: .5 }} />
        <div style={{ fontSize: 19, fontWeight: 800, marginTop: 16, color: "var(--tinta)" }}>
          {vencido ? "Este acceso ya venció" : "Este acceso no está disponible"}
        </div>
        <p className="sub" style={{ marginTop: 8, lineHeight: 1.6 }}>
          {vencido
            ? "El plazo terminó. Pídele a quien te lo compartió que te dé uno nuevo."
            : "La liga no es correcta, o quien te la compartió quitó el acceso."}
        </p>
      </div>
    );
  }

  // Solo el carnet que se compartió, no todos los del dueño
  const carnets = acceso.identity_id
    ? await sql`select * from identities where id = ${acceso.identity_id}` as any[]
    : [];

  if (!carnets.length) {
    return (
      <div className="wrap" style={{ paddingTop: 90, textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Ese carnet ya no existe</div>
      </div>
    );
  }

  const c = carnets[0];
  const med = (await sql`
    select * from medical_info where identity_id = ${c.id} limit 1` as any[])[0] || {};
  const contactos = await sql`
    select * from emergency_contacts where identity_id = ${c.id}
    order by is_primary desc` as any[];
  const docs = acceso.ve_documentos
    ? await sql`select * from documents where identity_id = ${c.id}
        order by created_at desc` as any[]
    : [];

  // Se deja constancia de que entró: el dueño lo ve en su pantalla
  try {
    await sql`
      update access_grants set usos = coalesce(usos,0) + 1, ultimo_uso = now()
      where token = ${params.token}`;
  } catch { /* que falle el conteo no debe tumbar la vista */ }

  const esMascota = c.kind === "pet";
  const meta = [esMascota ? (c.breed || c.species) : ageFrom(c.birth_date),
    c.sex, c.color].filter(Boolean).join(" · ");

  return (
    <div className="wrap" style={{ paddingTop: 16, maxWidth: 560 }}>
      <div className="row" style={{ gap: 10, marginBottom: 18 }}>
        <img src="/icon-192.png" width={32} height={32} alt="" style={{ borderRadius: 9 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-.02em" }}>
            Identy·kit
          </div>
          <div className="sub" style={{ fontSize: 12 }}>
            Acceso compartido contigo · {acceso.label}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ gap: 14 }}>
          <div className="avatar" style={{ width: 58, height: 58, fontSize: 26 }}>
            {c.photo_url
              ? <img src={c.photo_url} alt="" style={{ width: "100%", height: "100%",
                  objectFit: "cover", borderRadius: 15 }} />
              : EMOJI[c.kind] || "🧑"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.02em" }}>
              {c.display_name}
            </div>
            {meta && <div className="sub" style={{ fontSize: 13.5 }}>{meta}</div>}
          </div>
          {c.blood_type && (
            <div className="e-sangre" style={{ minWidth: 66, padding: "9px 8px" }}>
              <span className="n" style={{ fontSize: 25 }}>{c.blood_type}</span>
              <span className="t" style={{ fontSize: 8.5 }}>Sangre</span>
            </div>
          )}
        </div>
      </div>

      {(med.allergies || med.conditions || c.public_note) && (
        <div className="e-critico" style={{ marginTop: 14 }}>
          <div className="t">Antes de atender</div>
          <div className="c">
            {[med.allergies, med.conditions, c.public_note].filter(Boolean).join(" · ")}
          </div>
        </div>
      )}

      {contactos.length > 0 && (<>
        <h3>A quién llamar</h3>
        {contactos.map((k: any) => (
          <a key={k.id} href={`tel:${k.phone}`} className="e-llamar" style={{ minHeight: 58 }}>
            <span>
              <span className="quien" style={{ fontSize: 15.5 }}>{k.name}</span>
              <span className="rel">{[k.relationship, k.phone].filter(Boolean).join(" · ")}</span>
            </span>
            <span className="accion">Llamar</span>
          </a>
        ))}
      </>)}

      {(med.medications || med.implants || med.preferred_hospital || med.doctor_name
        || med.insurance || med.vaccinations) && (<>
        <h3>Información médica</h3>
        <div className="card">
          {med.medications && <div className="kv"><span className="k">Medicamentos</span>
            <span className="v">{med.medications}</span></div>}
          {med.implants && <div className="kv"><span className="k">Implantes</span>
            <span className="v">{med.implants}</span></div>}
          {med.vaccinations && <div className="kv"><span className="k">Vacunas</span>
            <span className="v">{med.vaccinations}</span></div>}
          {med.preferred_hospital && <div className="kv"><span className="k">Hospital</span>
            <span className="v">{med.preferred_hospital}</span></div>}
          {med.doctor_name && (
            <div className="kv"><span className="k">{esMascota ? "Veterinario" : "Médico"}</span>
              <span className="v">{med.doctor_name}
                {med.doctor_phone ? ` · ${med.doctor_phone}` : ""}</span></div>)}
          {med.insurance && <div className="kv"><span className="k">Seguro</span>
            <span className="v">{med.insurance}</span></div>}
        </div>
      </>)}

      {docs.length > 0 && (<>
        <h3>Documentos</h3>
        <div className="card">
          {docs.map((d: any, i: number) => (
            <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer"
              className="row" style={{ gap: 12, padding: "12px 0",
                borderBottom: i < docs.length - 1 ? "1px solid var(--linea-suave)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                background: "var(--pulso-claro)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 17 }}>{ICONO(d.doc_type)}</div>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 700 }}>{d.title}</span>
              <span style={{ color: "var(--gris-claro)", fontSize: 19 }}>›</span>
            </a>
          ))}
        </div>
      </>)}

      <div className="e-pie" style={{ marginTop: 26, flexDirection: "column", gap: 5 }}>
        <span>Solo lectura · no puedes cambiar nada desde aquí</span>
        {acceso.vence && (
          <span style={{ fontSize: 11.5 }}>
            Este acceso vence el {new Date(acceso.vence).toLocaleDateString("es-MX",
              { day: "numeric", month: "long", year: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
}
