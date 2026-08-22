"use client";
import { IconoDoc } from "@/components/Iconos";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Los papeles del carnet.
 *
 * Aquí van la identificación, la póliza del seguro, las recetas, la cartilla
 * de vacunación. Cosas que en una emergencia alguien va a pedir y que hoy
 * viven en un cajón o en el celular perdidas entre fotos.
 *
 * Cada papel se puede marcar para que salga en la ficha pública o no: la
 * póliza del seguro sí conviene que la vea un hospital; la credencial de
 * elector no tiene por qué verla cualquiera que escanee.
 */

const TIPOS = [
  { v: "identificacion", t: "Identificación" },
  { v: "seguro", t: "Póliza de seguro" },
  { v: "receta", t: "Receta médica" },
  { v: "estudio", t: "Estudio o análisis" },
  { v: "vacunas", t: "Cartilla de vacunación" },
  { v: "otro", t: "Otro" },
];


function pesa(b: number) {
  if (!b) return "";
  return b > 1_000_000 ? `${(b / 1_048_576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
}

export default function Documentos({ carnetId, inicial, esMascota }:
  { carnetId: string; inicial: any[]; esMascota: boolean }) {
  const r = useRouter();
  const [docs, setDocs] = useState<any[]>(inicial || []);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [quitando, setQuitando] = useState("");
  const [nuevo, setNuevo] = useState({ tipo: "identificacion", titulo: "",
    enFicha: false, vence: "" });
  const [abierto, setAbierto] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  const subir = async (e: any) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setSubiendo(true); setError("");
    try {
      const fd = new FormData();
      fd.append("file", archivo);
      fd.append("identity_id", carnetId);
      fd.append("doc_type", nuevo.tipo);
      fd.append("title", nuevo.titulo);
      fd.append("visible_en_emergencia", String(nuevo.enFicha));
      if (nuevo.vence) fd.append("vence", nuevo.vence);
      const res = await fetch("/api/documentos", { method: "POST", body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "No se pudo subir");
      setDocs((l) => [d, ...l]);
      setNuevo({ tipo: "identificacion", titulo: "", enFicha: false, vence: "" });
      setAbierto(false);
      r.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setSubiendo(false); }
  };

  const quitar = async (id: string) => {
    try {
      await fetch(`/api/documentos?id=${id}`, { method: "DELETE" });
      setDocs((l) => l.filter((x) => x.id !== id));
      setQuitando("");
      r.refresh();
    } catch { setError("No se pudo quitar"); }
  };

  const cambiarFicha = async (doc: any) => {
    const nuevoValor = !doc.visible_en_emergencia;
    setDocs((l) => l.map((x) =>
      x.id === doc.id ? { ...x, visible_en_emergencia: nuevoValor } : x));
    try {
      await fetch("/api/documentos", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doc.id, visible_en_emergencia: nuevoValor }),
      });
      r.refresh();
    } catch {
      // se regresa a como estaba si falló
      setDocs((l) => l.map((x) =>
        x.id === doc.id ? { ...x, visible_en_emergencia: !nuevoValor } : x));
    }
  };

  return (
    <div className="card">
      {docs.length === 0 && !abierto && (
        <div style={{ padding: "4px 0 15px" }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Sin papeles todavía</div>
          <div className="sub" style={{ marginTop: 5, lineHeight: 1.55 }}>
            {esMascota
              ? "La cartilla de vacunación, el certificado del veterinario, su registro."
              : "Tu identificación, la póliza del seguro, tus recetas. Lo que en una urgencia alguien va a pedir."}
          </div>
        </div>
      )}

      {docs.length > 0 && (
        <div style={{ marginBottom: 15 }}>
          {docs.map((d, i) => (
            <div key={d.id} style={{ padding: "12px 0",
              borderBottom: i < docs.length - 1 ? "1px solid var(--linea-suave)" : "none" }}>
              {quitando === d.id ? (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                    ¿Quitar {d.title}?
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn ghost sm" style={{ flex: 1 }}
                      onClick={() => setQuitando("")}>Mejor no</button>
                    <button className="btn danger sm" style={{ flex: 1 }}
                      onClick={() => quitar(d.id)}>Sí, quitar</button>
                  </div>
                </div>
              ) : (<>
                <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: "var(--pulso-claro)", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    <IconoDoc tipo={d.doc_type} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a href={d.file_url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 14.5, fontWeight: 700, color: "var(--tinta)",
                        display: "block", overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap" }}>
                      {d.title}
                    </a>
                    <div className="sub" style={{ fontSize: 12.5, marginTop: 1 }}>
                      {[TIPOS.find((t) => t.v === d.doc_type)?.t, pesa(d.tamano)]
                        .filter(Boolean).join(" · ")}
                      {d.vence && (
                        <span style={{ color: new Date(d.vence) < new Date()
                          ? "var(--alta)" : "var(--ambar)", fontWeight: 700 }}>
                          {" · "}
                          {new Date(d.vence) < new Date() ? "vencido"
                            : `vence ${new Date(d.vence).toLocaleDateString("es-MX",
                                { day: "numeric", month: "short" })}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setQuitando(d.id)}
                    style={{ background: "none", border: "none", cursor: "pointer",
                      color: "var(--gris-claro)", fontSize: 12.5, fontWeight: 600,
                      fontFamily: "inherit", flexShrink: 0 }}>Quitar</button>
                </div>

                <label className="row" style={{ marginTop: 9, marginLeft: 50, gap: 8,
                  cursor: "pointer" }}>
                  <input type="checkbox" checked={!!d.visible_en_emergencia}
                    onChange={() => cambiarFicha(d)}
                    style={{ width: 17, height: 17, accentColor: "var(--marco)" }} />
                  <span style={{ fontSize: 12.5, color: "var(--gris)", fontWeight: 600 }}>
                    Que salga en la ficha de emergencia
                  </span>
                </label>
              </>)}
            </div>
          ))}
        </div>
      )}

      {abierto ? (
        <div className="grid" style={{ gap: 10 }}>
          <select className="input" value={nuevo.tipo}
            onChange={(e) => setNuevo((s) => ({ ...s, tipo: e.target.value }))}>
            {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.t}</option>)}
          </select>
          <input className="input" value={nuevo.titulo} placeholder="Cómo le quieres llamar"
            onChange={(e) => setNuevo((s) => ({ ...s, titulo: e.target.value }))} />
          <div>
            <div className="label">
              ¿Vence?
              <span style={{ fontWeight: 500, color: "var(--gris-claro)" }}>
                {" "}· te avisamos antes
              </span>
            </div>
            <input className="input" type="date" value={nuevo.vence}
              onChange={(e) => setNuevo((s) => ({ ...s, vence: e.target.value }))} />
          </div>
          <label className="row" style={{ gap: 9, cursor: "pointer" }}>
            <input type="checkbox" checked={nuevo.enFicha}
              onChange={(e) => setNuevo((s) => ({ ...s, enFicha: e.target.checked }))}
              style={{ width: 18, height: 18, accentColor: "var(--marco)" }} />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
              Que lo vea quien escanee el código
            </span>
          </label>

          {error && (
            <div style={{ color: "var(--alta)", fontSize: 13.5, fontWeight: 600 }}>{error}</div>
          )}

          <div className="row" style={{ gap: 8 }}>
            <button className="btn ghost" style={{ flex: 1 }}
              onClick={() => { setAbierto(false); setError(""); }}>Cancelar</button>
            <button className="btn" style={{ flex: 2 }} disabled={subiendo}
              onClick={() => campo.current?.click()}>
              {subiendo ? "Subiendo…" : "Elegir archivo"}
            </button>
          </div>
          <input ref={campo} type="file" hidden accept="image/*,application/pdf"
            onChange={subir} />
          <div className="sub" style={{ fontSize: 12, textAlign: "center" }}>
            Fotos o PDF, hasta 8 MB
          </div>
        </div>
      ) : (
        <button className="btn ghost" onClick={() => setAbierto(true)}>
          {docs.length ? "Subir otro" : "Subir un documento"}
        </button>
      )}
    </div>
  );
}
