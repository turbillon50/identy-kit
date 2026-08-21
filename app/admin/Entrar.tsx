"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * La puerta de la administración.
 *
 * A propósito no dice de qué es este acceso ni qué se ve adentro: si alguien
 * llega aquí sin tener nada que hacer, mejor que no se entere.
 */
export default function Entrar() {
  const r = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [entrando, setEntrando] = useState(false);

  const entrar = async () => {
    if (!usuario.trim() || !clave) { setError("Escribe tu usuario y tu clave"); return; }
    setEntrando(true); setError("");
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo entrar");
      r.refresh();
    } catch (e: any) {
      setError(e.message);
      setClave("");
      setEntrando(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 22 }}>
      <div style={{ width: "100%", maxWidth: 350 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <img src="/logo.png" alt="Identy-Kit" width={112} height={124} />
          <div style={{ fontSize: 17, fontWeight: 800, marginTop: 11,
            letterSpacing: "-.02em" }}>Administración</div>
        </div>

        <div className="card">
          <div className="field">
            <label className="label" htmlFor="u">Usuario</label>
            <input id="u" className="input" value={usuario} autoFocus
              autoComplete="username"
              onChange={(e) => { setUsuario(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && entrar()} />
          </div>
          <div className="field">
            <label className="label" htmlFor="c">Clave</label>
            <input id="c" className="input" type="password" value={clave}
              autoComplete="current-password"
              onChange={(e) => { setClave(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && entrar()} />
          </div>

          {error && (
            <div style={{ color: "var(--alta)", fontSize: 13.5, fontWeight: 600,
              marginBottom: 12 }}>{error}</div>
          )}

          <button className="btn" onClick={entrar} disabled={entrando}>
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
