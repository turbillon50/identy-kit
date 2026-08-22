"use client";
import { IcoCheckCirculo } from "@/components/Iconos";
import { useState } from "react";

export default function FoundActions({ qr, name, isPet }: { qr: string; name: string; isPet: boolean }) {
  const [state, setState] = useState<"idle"|"sending"|"done"|"err">("idle");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  const send = () => {
    setState("sending");
    const post = (lat?: number, lng?: number, acc?: number) => {
      fetch("/api/found", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr, lat, lng, accuracy: acc, note }),
      }).then(r => setState(r.ok ? "done" : "err")).catch(() => setState("err"));
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => post(p.coords.latitude, p.coords.longitude, p.coords.accuracy),
        () => post(), { enableHighAccuracy: true, timeout: 8000 }
      );
    } else post();
  };

  return (
    <div className="card no-print" style={{ marginTop: 20, borderColor: "#d7f2ec", background: "#f2fbf9" }}>
      {state === "done" ? (
        <div className="center" style={{ gap: 6 }}>
          <div style={{ color: "var(--ok)" }}><IcoCheckCirculo size={40} stroke={1.8} /></div>
          <b>Aviso enviado</b>
          <div className="sub">{isPet ? "El dueño" : "Los contactos"} de {name} fueron notificados con tu ubicación. Gracias por ayudar.</div>
        </div>
      ) : (
        <>
          <b>{isPet ? `¿Encontraste a ${name}?` : `¿Encontraste a esta persona?`}</b>
          <div className="sub" style={{ margin: "4px 0 12px" }}>
            Avisa a {isPet ? "su dueño" : "sus contactos"} y comparte dónde está. Se usa tu ubicación una sola vez.
          </div>
          {open && <textarea className="input" rows={2} placeholder="Nota opcional (ej: está bien, lo tengo en…)" value={note} onChange={e => setNote(e.target.value)} style={{ marginBottom: 10 }} />}
          <button className="btn" onClick={() => open ? send() : setOpen(true)} disabled={state === "sending"}>
            {state === "sending" ? "Enviando…" : open ? "Enviar aviso con mi ubicación" : "Avisar que lo encontré"}
          </button>
          {state === "err" && <div className="sub" style={{ color: "var(--danger)", marginTop: 8 }}>No se pudo enviar. Intenta de nuevo.</div>}
        </>
      )}
    </div>
  );
}
