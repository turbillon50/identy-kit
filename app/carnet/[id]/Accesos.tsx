"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Compartir el carnet con alguien de confianza.
 *
 * El código QR lo ve cualquiera y muestra solo lo de emergencia. Esto es otra
 * cosa: darle acceso al médico, a la escuela, al veterinario o a quien cuida a
 * tu papá, para que vea también los documentos, por el tiempo que tú decidas.
 *
 * Cada quien tiene su propia liga: así puedes quitarle el acceso a uno sin
 * afectar a los demás, y ves cuándo entró cada uno por última vez.
 */

const PLAZOS = [
  { d: 1, t: "Un día" },
  { d: 7, t: "Una semana" },
  { d: 30, t: "Un mes" },
  { d: 180, t: "Seis meses" },
  { d: 365, t: "Un año" },
];

export default function Accesos({ carnetId, inicial }:
  { carnetId: string; inicial: any[] }) {
  const r = useRouter();
  const [lista, setLista] = useState<any[]>(inicial || []);
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ label: "", dias: 30, docs: true });
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [quitando, setQuitando] = useState("");

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const liga = (t: string) => `${base}/espacio/${t}`;

  const crear = async () => {
    if (!f.label.trim()) { setError("Ponle un nombre para saber de quién es"); return; }
    setCreando(true); setError("");
    try {
      const res = await fetch("/api/accesos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_id: carnetId, label: f.label,
          dias: f.dias, ve_documentos: f.docs }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo crear");
      setLista((l) => [d, ...l]);
      setF({ label: "", dias: 30, docs: true });
      setAbierto(false);
      r.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setCreando(false); }
  };

  const quitar = async (token: string) => {
    try {
      await fetch(`/api/accesos?token=${token}`, { method: "DELETE" });
      setLista((l) => l.map((x) => x.token === token ? { ...x, is_active: false } : x));
      setQuitando("");
      r.refresh();
    } catch { setError("No se pudo quitar"); }
  };

  const compartir = async (a: any) => {
    const url = liga(a.token);
    try {
      if (navigator.share) await navigator.share({ title: "Acceso al carnet", url });
      else { await navigator.clipboard.writeText(url); setAviso("Liga copiada");
        setTimeout(() => setAviso(""), 2200); }
    } catch { /* si cancela, no hay nada que decir */ }
  };

  const activos = lista.filter((a) => a.is_active);

  return (
    <div className="card">
      {activos.length === 0 && !abierto && (
        <div style={{ padding: "4px 0 15px" }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>No has compartido con nadie</div>
          <div className="sub" style={{ marginTop: 5, lineHeight: 1.55 }}>
            Puedes darle acceso a tu médico, a la escuela o a quien cuide de esta
            persona, para que vean también los documentos. Tú decides por cuánto
            tiempo, y lo puedes quitar cuando quieras.
          </div>
        </div>
      )}

      {lista.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          {lista.map((a, i) => {
            const vencido = a.vence && new Date(a.vence) < new Date();
            const vivo = a.is_active && !vencido;
            return (
              <div key={a.token} style={{ padding: "13px 0",
                borderBottom: i < lista.length - 1 ? "1px solid var(--linea-suave)" : "none",
                opacity: vivo ? 1 : .55 }}>
                {quitando === a.token ? (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                      ¿Quitarle el acceso a {a.label}? Su liga deja de servir enseguida.
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <button className="btn ghost sm" style={{ flex: 1 }}
                        onClick={() => setQuitando("")}>Mejor no</button>
                      <button className="btn danger sm" style={{ flex: 1 }}
                        onClick={() => quitar(a.token)}>Sí, quitar</button>
                    </div>
                  </div>
                ) : (<>
                  <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{a.label}</div>
                      <div className="sub" style={{ fontSize: 12.5, marginTop: 2 }}>
                        {!a.is_active ? "Acceso quitado"
                          : vencido ? "Ya venció"
                          : `Vence el ${new Date(a.vence).toLocaleDateString("es-MX",
                              { day: "numeric", month: "long" })}`}
                        {a.usos > 0 && ` · entró ${a.usos} ${a.usos === 1 ? "vez" : "veces"}`}
                      </div>
                      {a.ultimo_uso && (
                        <div className="sub" style={{ fontSize: 12, marginTop: 1 }}>
                          Última vez: {new Date(a.ultimo_uso).toLocaleString("es-MX",
                            { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                    {vivo && (
                      <button onClick={() => setQuitando(a.token)}
                        style={{ background: "none", border: "none", cursor: "pointer",
                          color: "var(--gris-claro)", fontSize: 12.5, fontWeight: 600,
                          fontFamily: "inherit", flexShrink: 0 }}>Quitar</button>
                    )}
                  </div>
                  {vivo && (
                    <button className="btn ghost sm" style={{ marginTop: 9, width: "100%" }}
                      onClick={() => compartir(a)}>Compartir la liga</button>
                  )}
                </>)}
              </div>
            );
          })}
        </div>
      )}

      {aviso && (
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--ok)",
          fontWeight: 700, marginBottom: 11 }}>{aviso}</div>
      )}

      {abierto ? (
        <div className="grid" style={{ gap: 10 }}>
          <input className="input" value={f.label} autoFocus
            placeholder="¿Para quién? Dra. Ana, la escuela, mi hermana"
            onChange={(e) => { setF((s) => ({ ...s, label: e.target.value })); setError(""); }} />
          <div>
            <div className="label">¿Por cuánto tiempo?</div>
            <select className="input" value={f.dias}
              onChange={(e) => setF((s) => ({ ...s, dias: Number(e.target.value) }))}>
              {PLAZOS.map((p) => <option key={p.d} value={p.d}>{p.t}</option>)}
            </select>
          </div>
          <label className="row" style={{ gap: 9, cursor: "pointer" }}>
            <input type="checkbox" checked={f.docs}
              onChange={(e) => setF((s) => ({ ...s, docs: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: "var(--marco)" }} />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
              Que también vea los documentos
            </span>
          </label>

          {error && (
            <div style={{ color: "var(--alta)", fontSize: 13.5, fontWeight: 600 }}>{error}</div>
          )}

          <div className="row" style={{ gap: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }}
              onClick={() => { setAbierto(false); setError(""); }}>Cancelar</button>
            <button className="btn" style={{ flex: 2 }} onClick={crear} disabled={creando}>
              {creando ? "Creando…" : "Crear acceso"}
            </button>
          </div>
        </div>
      ) : (
        <button className="btn ghost" onClick={() => setAbierto(true)}>
          {activos.length ? "Compartir con alguien más" : "Compartir con alguien"}
        </button>
      )}
    </div>
  );
}
