"use client";
import { IconoTipo } from "@/components/Iconos";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

/**
 * Achica la foto antes de mandarla.
 *
 * Una foto de teléfono pesa entre 3 y 8 megas, y para un carnet no hace falta
 * más de 900 píxeles. Sin esto, alguien con datos móviles espera medio minuto
 * o de plano falla.
 */
async function achicar(archivo: File): Promise<File> {
  if (!archivo.type.startsWith("image/") || archivo.size < 400_000) return archivo;
  try {
    const img = await createImageBitmap(archivo);
    const lado = 900;
    const escala = Math.min(1, lado / Math.max(img.width, img.height));
    if (escala === 1 && archivo.size < 1_200_000) return archivo;

    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(img.width * escala);
    lienzo.height = Math.round(img.height * escala);
    lienzo.getContext("2d")!.drawImage(img, 0, 0, lienzo.width, lienzo.height);

    const blob: Blob = await new Promise((r) =>
      lienzo.toBlob((b) => r(b!), "image/jpeg", 0.86));
    if (!blob || blob.size >= archivo.size) return archivo;
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    return archivo;
  }
}

export default function IdentityForm({ identity }: { identity: any }) {
  const r = useRouter();
  const [f, setF] = useState<any>({
    ...identity,
    birth_date: identity.birth_date ? String(identity.birth_date).slice(0, 10) : "",
  });
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [foto, setFoto] = useState(identity.photo_url || "");
  const [subiendo, setSubiendo] = useState(false);
  const campoArchivo = useRef<HTMLInputElement>(null);

  const up = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  const esMascota = f.kind === "pet";

  const elegirFoto = async (e: any) => {
    const original = e.target.files?.[0];
    e.target.value = "";
    if (!original) return;
    setSubiendo(true); setError("");
    try {
      const listo = await achicar(original);
      const fd = new FormData();
      fd.append("file", listo);
      fd.append("identity_id", identity.id);   // se guarda al momento
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo subir");
      setFoto(d.url); up("photo_url", d.url);
      setEstado("Foto guardada");
      r.refresh();
      setTimeout(() => setEstado(""), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally { setSubiendo(false); }
  };

  const guardar = async () => {
    setEstado("Guardando…"); setError("");
    const cuerpo: any = {
      display_name: f.display_name, kind: f.kind, species: f.species, breed: f.breed,
      color: f.color, sex: f.sex, birth_date: f.birth_date || null,
      blood_type: f.blood_type, weight: f.weight, organ_donor: !!f.organ_donor,
      microchip: f.microchip, owner_name: f.owner_name, owner_phone: f.owner_phone,
      reward_note: f.reward_note, public_note: f.public_note,
      national_id: f.national_id, photo_url: foto,
    };
    try {
      const res = await fetch(`/api/identities/${identity.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      setEstado("Guardado");
      r.refresh();
      setTimeout(() => setEstado(""), 2000);
    } catch (e: any) {
      setEstado(""); setError(e.message);
    }
  };

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 16, gap: 14 }}>
        <div className="avatar" style={{ width: 62, height: 62, fontSize: 27 }}>
          {foto
            ? <img src={foto} alt="" style={{ width: "100%", height: "100%",
                objectFit: "cover", borderRadius: 15 }} />
            : <IconoTipo kind={esMascota ? "pet" : "person"} size={27} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button className="btn ghost sm" disabled={subiendo}
            onClick={() => campoArchivo.current?.click()}>
            {subiendo ? "Subiendo…" : foto ? "Cambiar foto" : "Subir foto"}
          </button>
          <input ref={campoArchivo} type="file" accept="image/*" hidden
            onChange={elegirFoto} />
          <div className="sub" style={{ fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>
            {esMascota
              ? "Ayuda a confirmar que es tu mascota."
              : "Para confirmar que el carnet es tuyo."}
          </div>
        </div>
      </div>

      <div className="field">
        <label className="label">Nombre</label>
        <input className="input" value={f.display_name || ""}
          onChange={(e) => up("display_name", e.target.value)} />
      </div>

      <div className="grid2">
        <div className="field">
          <label className="label">Nacimiento</label>
          <input className="input" type="date" value={f.birth_date || ""}
            onChange={(e) => up("birth_date", e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Sexo</label>
          <input className="input" value={f.sex || ""}
            onChange={(e) => up("sex", e.target.value)}
            placeholder={esMascota ? "Macho o hembra" : "M o F"} />
        </div>
      </div>

      {esMascota ? (<>
        <div className="grid2">
          <div className="field">
            <label className="label">Especie o raza</label>
            <input className="input" value={f.breed || f.species || ""}
              onChange={(e) => up("breed", e.target.value)} placeholder="Labrador" />
          </div>
          <div className="field">
            <label className="label">Color y señas</label>
            <input className="input" value={f.color || ""}
              onChange={(e) => up("color", e.target.value)} placeholder="Dorado, mancha blanca" />
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label className="label">Microchip</label>
            <input className="input" value={f.microchip || ""}
              onChange={(e) => up("microchip", e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Tu teléfono</label>
            <input className="input" type="tel" value={f.owner_phone || ""}
              onChange={(e) => up("owner_phone", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label">Recompensa</label>
          <input className="input" value={f.reward_note || ""}
            onChange={(e) => up("reward_note", e.target.value)}
            placeholder="Se ofrece recompensa" />
        </div>
      </>) : (<>
        <div className="field">
          <label className="label">Tipo de sangre</label>
          <div className="blood">
            {SANGRE.map((s) => (
              <button key={s} type="button"
                className={f.blood_type === s ? "on" : ""}
                onClick={() => up("blood_type", f.blood_type === s ? "" : s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="label">Peso</label>
          <input className="input" value={f.weight || ""}
            onChange={(e) => up("weight", e.target.value)} placeholder="70 kg" />
        </div>
        <label className="row" style={{ margin: "4px 0 15px", cursor: "pointer", gap: 10 }}>
          <input type="checkbox" checked={!!f.organ_donor}
            onChange={(e) => up("organ_donor", e.target.checked)}
            style={{ width: 20, height: 20, accentColor: "var(--marco)" }} />
          <span style={{ fontWeight: 600, fontSize: 14.5 }}>Soy donante de órganos</span>
        </label>
      </>)}

      <div className="field">
        <label className="label">
          Algo que deban saber de inmediato
          <span style={{ fontWeight: 500, color: "var(--gris-claro)" }}> · sale en la ficha</span>
        </label>
        <textarea className="input" rows={2} value={f.public_note || ""}
          onChange={(e) => up("public_note", e.target.value)}
          placeholder={esMascota
            ? "Es nervioso con extraños, necesita medicamento diario"
            : "No mover el cuello, uso marcapasos"} />
      </div>

      {error && (
        <div style={{ color: "var(--alta)", fontSize: 13.5, fontWeight: 600,
          marginBottom: 11 }}>{error}</div>
      )}

      <button className="btn" onClick={guardar} disabled={!!estado}>
        {estado || "Guardar cambios"}
      </button>

      {/* Apagar un carnet es lo que se hace cuando se pierde la tarjeta, o
          cuando el código ya anda circulando y no se quiere que abra más. */}
      <div style={{ marginTop: 18, paddingTop: 16,
        borderTop: "1px solid var(--linea-suave)" }}>
        <label className="row" style={{ gap: 11, cursor: "pointer",
          alignItems: "flex-start" }}>
          <input type="checkbox" checked={f.is_active !== false}
            onChange={async (e) => {
              const activo = e.target.checked;
              up("is_active", activo);
              try {
                await fetch(`/api/identities/${identity.id}`, {
                  method: "PATCH", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ is_active: activo }),
                });
                setEstado(activo ? "Código encendido" : "Código apagado");
                r.refresh();
                setTimeout(() => setEstado(""), 2200);
              } catch { up("is_active", !activo); setError("No se pudo cambiar"); }
            }}
            style={{ width: 20, height: 20, accentColor: "var(--marco)", marginTop: 1 }} />
          <span style={{ minWidth: 0 }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, display: "block" }}>
              El código funciona
            </span>
            <span className="sub" style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              Si lo apagas, quien escanee ya no verá nada. Úsalo si perdiste la
              tarjeta o ya no quieres que abra.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
}
