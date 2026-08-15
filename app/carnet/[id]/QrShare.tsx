"use client";
import { useState } from "react";

/**
 * Compartir el código.
 *
 * Antes eran cuatro botones del mismo tamaño y nadie sabía cuál usar. Lo que
 * la gente hace de verdad es una de dos: mandárselo a alguien de su familia, o
 * bajarlo para imprimirlo. Eso va primero; lo demás queda a la mano pero chico.
 */
export default function QrShare({ url, svg }: { url: string; svg: string }) {
  const [aviso, setAviso] = useState("");
  const decir = (t: string) => { setAviso(t); setTimeout(() => setAviso(""), 2200); };

  async function compartir() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Ficha de emergencia",
          text: "Este es mi carnet de emergencia. Guárdalo por si acaso.",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        decir("Liga copiada");
      }
    } catch { /* si cancela el usuario, no hay nada que decir */ }
  }

  function descargar() {
    try {
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "codigo-identykit.svg";
      a.click();
      URL.revokeObjectURL(a.href);
      decir("Código descargado");
    } catch { decir("No se pudo descargar"); }
  }

  return (
    <div style={{ width: "100%" }}>
      <button className="btn" onClick={compartir}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
          <path d="M16 6l-4-4-4 4M12 2v14" />
        </svg>
        Compartir con mi familia
      </button>

      <div className="row" style={{ gap: 8, marginTop: 8 }}>
        <button className="btn ghost sm" onClick={descargar} style={{ flex: 1 }}>
          Descargar
        </button>
        <a href={url} target="_blank" rel="noreferrer" className="btn ghost sm"
          style={{ flex: 1 }}>
          Ver la ficha
        </a>
        <button className="btn ghost sm" style={{ flex: 1 }}
          onClick={async () => {
            try { await navigator.clipboard.writeText(url); decir("Liga copiada"); }
            catch { decir("No se pudo copiar"); }
          }}>
          Copiar liga
        </button>
      </div>

      {aviso && (
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 13,
          color: "var(--ok)", fontWeight: 700 }}>{aviso}</div>
      )}
    </div>
  );
}
