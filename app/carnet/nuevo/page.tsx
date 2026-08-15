"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SANGRE = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

/**
 * Crear un carnet.
 *
 * Antes pedía seis campos de entrada, incluida la CURP y la fecha de
 * nacimiento, antes de dejarte ver nada. Eso hace que la gente abandone en la
 * primera pantalla.
 *
 * Ahora solo pide lo mínimo para que el carnet exista. Lo demás se llena en el
 * carnet mismo, que ya va diciendo qué falta y por qué importa.
 */
export default function Nuevo() {
  const r = useRouter();
  const [tipo, setTipo] = useState("person");
  const [nombre, setNombre] = useState("");
  const [sangre, setSangre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const crear = async () => {
    if (!nombre.trim()) { setError("Ponle un nombre para reconocerlo"); return; }
    setGuardando(true); setError("");
    try {
      const res = await fetch("/api/identities", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: tipo, display_name: nombre.trim(),
          blood_type: tipo === "person" ? sangre || null : null,
        }),
      });
      const d = await res.json();
      if (!d.id) throw new Error(d.error || "No se pudo crear");
      r.push(`/carnet/${d.id}`);
    } catch (e: any) {
      setError(e.message || "No se pudo crear. Intenta de nuevo.");
      setGuardando(false);
    }
  };

  return (
    <div className="wrap" style={{ paddingTop: 16 }}>
      <div className="top">
        <Link href="/dashboard" className="sub" style={{ fontWeight: 600 }}>‹ Cancelar</Link>
        <b style={{ fontSize: 16 }}>Nuevo carnet</b>
        <span />
      </div>

      <div className="card">
        <div className="label">¿Para quién es?</div>
        <div className="typegrid">
          {[["person", "🧑", "Persona"], ["pet", "🐾", "Mascota"],
            ["other", "📦", "Otro"]].map(([v, e, t]) => (
            <button key={v} type="button"
              className={`typeopt${tipo === v ? " on" : ""}`}
              onClick={() => setTipo(v)}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{e}</div>
              {t}
            </button>
          ))}
        </div>

        <div className="field">
          <label className="label" htmlFor="nombre">
            {tipo === "pet" ? "¿Cómo se llama?" : "Nombre completo"}
          </label>
          <input id="nombre" className="input" value={nombre} autoFocus
            onChange={(e) => { setNombre(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && crear()}
            placeholder={tipo === "pet" ? "Firulais" : "María Fernanda López"} />
        </div>

        {tipo === "person" && (
          <div className="field">
            <div className="label">Tipo de sangre <span
              style={{ fontWeight: 500, color: "var(--gris-claro)" }}>· si lo sabes</span></div>
            <div className="blood">
              {SANGRE.map((s) => (
                <button key={s} type="button"
                  className={sangre === s ? "on" : ""}
                  onClick={() => setSangre(sangre === s ? "" : s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: "var(--alta)", fontSize: 13.5, fontWeight: 600,
            marginBottom: 11 }}>{error}</div>
        )}

        <button className="btn" onClick={crear} disabled={guardando}>
          {guardando ? "Creando…" : "Crear carnet"}
        </button>

        <p className="sub" style={{ fontSize: 13, marginTop: 12, marginBottom: 0,
          lineHeight: 1.5, textAlign: "center" }}>
          Enseguida te vamos guiando con lo que falta.
        </p>
      </div>
    </div>
  );
}
