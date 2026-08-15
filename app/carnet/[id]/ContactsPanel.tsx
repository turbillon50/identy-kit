"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Los contactos de emergencia.
 *
 * Es lo que más pesa en si el carnet sirve: sin un teléfono al que llamar,
 * todo lo demás da igual. Por eso cuando no hay ninguno la pantalla lo dice
 * de frente, y quitar uno pide confirmación — perder un contacto sin querer
 * es exactamente la falla que no puede pasar.
 */

/** Un teléfono sirve si se puede marcar. Se acepta como lo escriba la gente. */
function telefonoValido(t: string) {
  const solo = t.replace(/[^\d]/g, "");
  return solo.length >= 10 && solo.length <= 15;
}

export default function ContactsPanel({ identityId, initial }: any) {
  const r = useRouter();
  const [lista, setLista] = useState<any[]>(initial || []);
  const [f, setF] = useState({ name: "", relationship: "", phone: "" });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [quitando, setQuitando] = useState("");

  const up = (k: string, v: string) => { setF((s) => ({ ...s, [k]: v })); setError(""); };

  const agregar = async () => {
    if (!f.name.trim()) { setError("Falta el nombre"); return; }
    if (!telefonoValido(f.phone)) {
      setError("Ese teléfono no se ve completo. Van los diez dígitos.");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity_id: identityId, ...f, phone: f.phone.trim() }),
      });
      const d = await res.json();
      if (!d.id) throw new Error(d.error || "No se pudo agregar");
      setLista((l) => [...l, d]);
      setF({ name: "", relationship: "", phone: "" });
      r.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const quitar = async (id: string) => {
    try {
      await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
      setLista((l) => l.filter((x) => x.id !== id));
      setQuitando("");
      r.refresh();
    } catch { setError("No se pudo quitar"); }
  };

  return (
    <div className="card">
      {lista.length === 0 ? (
        <div style={{ padding: "6px 0 16px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ambar)" }}>
            Todavía no hay a quién llamar
          </div>
          <div className="sub" style={{ marginTop: 5, lineHeight: 1.55 }}>
            Es lo más importante del carnet. Si alguien lo escanea y no encuentra
            un teléfono, no va a poder avisarle a nadie.
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {lista.map((c, i) => (
            <div key={c.id} style={{ padding: "12px 0",
              borderBottom: i < lista.length - 1 ? "1px solid var(--linea-suave)" : "none" }}>
              {quitando === c.id ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                    ¿Quitar a {c.name}?
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn ghost sm" style={{ flex: 1 }}
                      onClick={() => setQuitando("")}>Mejor no</button>
                    <button className="btn danger sm" style={{ flex: 1 }}
                      onClick={() => quitar(c.id)}>Sí, quitar</button>
                  </div>
                </div>
              ) : (
                <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</div>
                    <div className="sub" style={{ fontSize: 13, marginTop: 1 }}>
                      {[c.relationship, c.phone].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <button onClick={() => setQuitando(c.id)}
                    style={{ background: "none", border: "none", cursor: "pointer",
                      color: "var(--gris-claro)", fontSize: 13, fontWeight: 600,
                      fontFamily: "inherit", flexShrink: 0 }}>
                    Quitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid" style={{ gap: 10 }}>
        <input className="input" placeholder="Nombre" value={f.name}
          onChange={(e) => up("name", e.target.value)} />
        <div className="grid2" style={{ gap: 10 }}>
          <input className="input" placeholder="Parentesco" value={f.relationship}
            onChange={(e) => up("relationship", e.target.value)} />
          <input className="input" type="tel" inputMode="tel" placeholder="Teléfono"
            value={f.phone} onChange={(e) => up("phone", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && agregar()} />
        </div>

        {error && (
          <div style={{ color: "var(--alta)", fontSize: 13.5, fontWeight: 600 }}>{error}</div>
        )}

        <button className="btn ghost" onClick={agregar} disabled={guardando}>
          {guardando ? "Agregando…" : lista.length ? "Agregar otro" : "Agregar contacto"}
        </button>
      </div>

      {lista.length === 1 && (
        <div className="sub" style={{ fontSize: 12.5, marginTop: 11, lineHeight: 1.5 }}>
          Vale la pena poner un segundo, por si el primero no contesta.
        </div>
      )}
    </div>
  );
}
