import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { sql } from "../../../lib/db";
import { qrSvg } from "../../../lib/qr";
import { revisar, ageFrom } from "../../../lib/util";
import IdentityForm from "./IdentityForm";
import MedicalForm from "./MedicalForm";
import ContactsPanel from "./ContactsPanel";
import QrShare from "./QrShare";
import AppShell from "../../../components/AppShell";

import { esDueno } from "../../../lib/permisos";

export const dynamic = "force-dynamic";

const EMOJI: Record<string, string> = { person: "🧑", pet: "🐾", other: "📦" };

/**
 * El carnet, del lado del titular.
 *
 * Antes esto era un muro de formularios uno tras otro. El problema es que
 * nadie sabía si su carnet ya servía o no: podía llenar la fecha de nacimiento
 * y sentirse listo, cuando lo que falta es a quién llamar.
 *
 * Ahora lo primero que se ve es si el carnet sirve, y qué le falta para servir
 * — con la razón de por qué importa cada cosa. Los formularios van después.
 */
export default async function Carnet({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const filas = await sql`
    select * from identities
    where id=${params.id} and owner_clerk_user_id=${userId}` as any[];
  if (!filas.length) notFound();

  const id = filas[0];
  const med = (await sql`
    select * from medical_info where identity_id=${id.id} limit 1` as any[])[0] || {};
  const contactos = await sql`
    select * from emergency_contacts where identity_id=${id.id}
    order by is_primary desc, created_at` as any[];
  const escaneos = await sql`
    select * from found_events where identity_id=${id.id}
    order by created_at desc limit 5` as any[];

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://identykit.xyz";
  const url = `${base}/e/${id.qr_token}`;
  const svg = await qrSvg(url, { color: "#032F6E" });

  const { pct, faltantes, sirve } = revisar(id, med, contactos.length);
  const esMascota = id.kind === "pet";

  return (
    <AppShell esDueno={await esDueno()} active="carnets" title={id.display_name}>
      <Link href="/dashboard" className="sub"
        style={{ display: "inline-block", marginBottom: 14, fontWeight: 600 }}>
        ‹ Mis carnets
      </Link>

      {/* Si alguien lo escaneó, es lo primero que quiere saber el titular */}
      {escaneos.length > 0 && (
        <div className="alertbox" style={{ marginBottom: 16 }}>
          <b style={{ display: "block", marginBottom: 6 }}>
            Alguien escaneó este carnet
          </b>
          {escaneos.map((f: any) => (
            <div key={f.id} style={{ fontSize: 13.5, marginTop: 4, opacity: .9 }}>
              {new Date(f.created_at).toLocaleString("es-MX", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              {f.finder_note ? ` · "${f.finder_note}"` : ""}
              {f.lat && (
                <> · <a target="_blank" rel="noreferrer"
                  href={`https://maps.google.com/?q=${f.lat},${f.lng}`}
                  style={{ fontWeight: 700, textDecoration: "underline" }}>
                  dónde fue
                </a></>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Qué tan útil es este carnet ahorita */}
      <div className="card">
        <div className="row" style={{ gap: 13 }}>
          <div className="avatar" style={{ width: 58, height: 58, fontSize: 26 }}>
            {id.photo_url
              ? <img src={id.photo_url} alt="" style={{ width: "100%", height: "100%",
                  objectFit: "cover", borderRadius: 15 }} />
              : EMOJI[id.kind] || "🧑"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em" }}>
              {id.display_name}
            </div>
            <div className="sub" style={{ fontSize: 13.5 }}>
              {[esMascota ? (id.breed || id.species) : ageFrom(id.birth_date),
                id.blood_type && `Sangre ${id.blood_type}`].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 15 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 700,
              color: sirve ? "var(--ok)" : "var(--ambar)" }}>
              {sirve ? "Este carnet ya sirve" : "Todavía le falta lo importante"}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--gris)" }}>{pct}%</span>
          </div>
          <div className="meter"><i style={{ width: `${pct}%` }} /></div>
        </div>

        {faltantes.length > 0 && (
          <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid var(--linea-suave)" }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".1em",
              textTransform: "uppercase", color: "var(--gris-claro)", marginBottom: 10 }}>
              Falta por poner
            </div>
            {faltantes.slice(0, 3).map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 11 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, marginTop: 7,
                  flexShrink: 0, background: f.peso >= 25 ? "var(--alta)" : "var(--ambar)" }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{f.que}</div>
                  <div style={{ fontSize: 13, color: "var(--gris)", lineHeight: 1.45,
                    marginTop: 1 }}>{f.porque}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* El código */}
      <h3>Su código</h3>
      <div className="qr">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="sub" style={{ textAlign: "center", fontSize: 13.5, lineHeight: 1.5 }}>
          Quien lo escanee ve la ficha de emergencia.<br />
          No necesita instalar nada ni tener cuenta.
        </div>
        <QrShare url={url} svg={svg} />
        <Link href={`/carnet/${id.id}/imprimir`} className="btn ghost">
          Imprimir tarjeta con el código
        </Link>
      </div>

      <h3>Contactos de emergencia</h3>
      <ContactsPanel identityId={id.id} initial={contactos} />

      <h3>Ficha médica</h3>
      <MedicalForm identityId={id.id} initial={med} isPet={esMascota} />

      <h3>Datos del carnet</h3>
      <IdentityForm identity={id} />
    </AppShell>
  );
}
