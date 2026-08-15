"use client";
import { useState } from "react";

/**
 * El botón de auxilio, del lado de quien lo necesita.
 *
 * Se diseña para usarse con miedo: un toque para abrirlo, otro para mandarlo,
 * y nada más en medio. No se pide llenar nada.
 *
 * Se manda aunque la ubicación no cargue — se espera 6 segundos por ella y si
 * no llega, el aviso sale igual. Un aviso sin ubicación sirve; un aviso que
 * nunca salió, no.
 */
export default function BotonAuxilio({ carnetId, nombre }:
  { carnetId: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState<any>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const ubicacion = (): Promise<any> =>
    new Promise((r) => {
      if (!navigator.geolocation) return r({});
      const listo = setTimeout(() => r({}), 6000);
      navigator.geolocation.getCurrentPosition(
        (p) => { clearTimeout(listo); r({
          lat: p.coords.latitude, lng: p.coords.longitude,
          accuracy: p.coords.accuracy }); },
        () => { clearTimeout(listo); r({}); },
        { enableHighAccuracy: true, timeout: 5500 }
      );
    });

  const mandar = async () => {
    setEnviando(true); setError("");
    try {
      const pos = await ubicacion();
      const res = await fetch("/api/sos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_id: carnetId, mensaje, ...pos }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo enviar");
      setHecho({ ...d, conUbicacion: pos.lat != null });
    } catch (e: any) {
      setError(e.message);
    } finally { setEnviando(false); }
  };

  if (hecho) return (
    <div className="card" style={{ borderLeft: "4px solid var(--alta)" }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: "var(--alta)" }}>
        Ya avisamos
      </div>
      <div className="sub" style={{ marginTop: 6, lineHeight: 1.55 }}>
        {hecho.conUbicacion
          ? "Se mandó tu aviso con tu ubicación."
          : "Se mandó tu aviso. No se pudo obtener tu ubicación, así que diles dónde estás."}
      </div>

      {hecho.contactos?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".1em",
            textTransform: "uppercase", color: "var(--gris-claro)", marginBottom: 9 }}>
            Márcales tú también
          </div>
          {hecho.contactos.map((c: any, i: number) => (
            <a key={i} href={`tel:${c.telefono}`} className="e-llamar"
              style={{ minHeight: 56 }}>
              <span>
                <span className="quien" style={{ fontSize: 15.5 }}>{c.nombre}</span>
                <span className="rel">{c.telefono}</span>
              </span>
              <span className="accion">Llamar</span>
            </a>
          ))}
          <a href="tel:911" className="e-llamar emergencias" style={{ minHeight: 56 }}>
            <span>
              <span className="quien" style={{ fontSize: 15.5 }}>Emergencias 911</span>
              <span className="rel">Ambulancia, bomberos, policía</span>
            </span>
            <span className="accion">911</span>
          </a>
        </div>
      )}

      <button className="btn ghost" style={{ marginTop: 12 }}
        onClick={async () => {
          try { await fetch("/api/sos", { method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: hecho.id }) }); } catch {}
          setHecho(null); setAbierto(false); setMensaje("");
        }}>
        Ya estoy bien
      </button>
    </div>
  );

  if (!abierto) return (
    <button
      onClick={() => setAbierto(true)}
      style={{ width: "100%", padding: "18px", borderRadius: 17, border: "none",
        cursor: "pointer", fontFamily: "inherit",
        background: "var(--alta)", color: "#fff",
        boxShadow: "0 6px 22px rgba(217,43,31,.28)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 11 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
      <span style={{ fontSize: 16.5, fontWeight: 800 }}>Pedir ayuda</span>
    </button>
  );

  return (
    <div className="card" style={{ borderLeft: "4px solid var(--alta)" }}>
      <div style={{ fontSize: 16.5, fontWeight: 800 }}>Pedir ayuda</div>
      <div className="sub" style={{ marginTop: 5, lineHeight: 1.55, marginBottom: 13 }}>
        Se le avisa de golpe a todos tus contactos, con tu ubicación.
      </div>

      <input className="input" value={mensaje} maxLength={200}
        onChange={(e) => setMensaje(e.target.value)}
        placeholder="Si puedes, di qué pasa (opcional)"
        style={{ marginBottom: 12 }} />

      {error && (
        <div style={{ color: "var(--alta)", fontSize: 13.5, fontWeight: 600,
          marginBottom: 11 }}>{error}</div>
      )}

      <div className="row" style={{ gap: 9 }}>
        <button className="btn ghost" style={{ flex: 1 }}
          onClick={() => { setAbierto(false); setMensaje(""); setError(""); }}>
          Cancelar
        </button>
        <button className="btn danger" style={{ flex: 2 }}
          onClick={mandar} disabled={enviando}>
          {enviando ? "Enviando…" : "Mandar ayuda"}
        </button>
      </div>
    </div>
  );
}
