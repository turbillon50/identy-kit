/**
 * Iconos de marca. Un solo lenguaje: trazo redondeado sobre currentColor,
 * calcado del set de la barra inferior. Nada de emoji: el emoji lo pinta
 * cada sistema a su manera y con sus propios colores, y eso rompe la marca.
 */
import React from "react";

type P = { size?: number; stroke?: number };

function S({ size = 24, stroke = 1.9, children }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">{children}</svg>
  );
}

export const IcoPersona = (p: P) => (
  <S {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c.9-3.5 3.8-5.4 7.2-5.4s6.3 1.9 7.2 5.4" /></S>
);

export const IcoHuella = (p: P) => (
  <S {...p}>
    <ellipse cx="12" cy="15.4" rx="3.5" ry="3.1" />
    <circle cx="6.4" cy="11" r="1.5" /><circle cx="10" cy="7.8" r="1.5" />
    <circle cx="14" cy="7.8" r="1.5" /><circle cx="17.6" cy="11" r="1.5" />
  </S>
);

export const IcoCaja = (p: P) => (
  <S {...p}><path d="M12 3l8 4.4v9.2L12 21l-8-4.4V7.4L12 3z" /><path d="M4 7.4l8 4.4 8-4.4" /><path d="M12 11.8V21" /></S>
);

export const IcoCarnet = (p: P) => (
  <S {...p}><rect x="3" y="5" width="18" height="14" rx="2.6" /><circle cx="8.3" cy="10.6" r="1.9" /><path d="M5.8 15.6c.5-1.4 1.4-2 2.5-2s2 .6 2.5 2" /><path d="M13.6 10h4.6M13.6 13.4h4.6" /></S>
);

export const IcoLupa = (p: P) => (
  <S {...p}><circle cx="10.8" cy="10.8" r="5.8" /><path d="M15.1 15.1L20 20" /></S>
);

export const IcoEscudo = (p: P) => (
  <S {...p}><path d="M12 3l7 2.7v5.2c0 4.6-2.9 7.7-7 9.6-4.1-1.9-7-5-7-9.6V5.7L12 3z" /><path d="M9.1 11.9l2.1 2.1 3.7-4" /></S>
);

export const IcoReceta = (p: P) => (
  <S {...p}><rect x="3.6" y="9" width="16.8" height="6" rx="3" /><path d="M12 9v6" /></S>
);

export const IcoJeringa = (p: P) => (
  <S {...p}><path d="M18 2l4 4" /><path d="M17 7l3-3" /><path d="M19 9L8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5" /><path d="M9 11l4 4" /><path d="M5 19l-3 3" /></S>
);

export const IcoEstudio = (p: P) => (
  <S {...p}><path d="M10 3h4" /><path d="M10 3v6l-5 8.6A2 2 0 0 0 6.7 21h10.6a2 2 0 0 0 1.7-3.4L14 9V3" /><path d="M7.6 15h8.8" /></S>
);

export const IcoDoc = (p: P) => (
  <S {...p}><path d="M6 3h8l4 4v14H6V3z" /><path d="M14 3v4h4" /><path d="M9.2 12h5.6M9.2 15.6h5.6" /></S>
);

export const IcoPin = (p: P) => (
  <S {...p}><path d="M12 21s-6.5-5.2-6.5-10a6.5 6.5 0 0 1 13 0C18.5 15.8 12 21 12 21z" /><circle cx="12" cy="11" r="2.3" /></S>
);

export const IcoCheckCirculo = (p: P) => (
  <S {...p}><circle cx="12" cy="12" r="8.6" /><path d="M8.2 12.3l2.6 2.6 5-5.4" /></S>
);

export const IcoAlerta = (p: P) => (
  <S {...p}><path d="M12 3.6l9.2 15.9H2.8L12 3.6z" /><path d="M12 10v4.2" /><path d="M12 17.4h.01" /></S>
);

export const IcoCampana = (p: P) => (
  <S {...p}><path d="M18 9.5a6 6 0 1 0-12 0c0 5.4-2.3 6.7-2.3 6.7h16.6S18 14.9 18 9.5z" /><path d="M10.4 20a1.9 1.9 0 0 0 3.2 0" /></S>
);

/** El icono que le toca a cada tipo de carnet. */
export const IconoTipo = ({ kind, size = 24, stroke = 1.9 }:
  { kind?: string | null; size?: number; stroke?: number }) =>
  kind === "pet" ? <IcoHuella size={size} stroke={stroke} />
  : kind === "other" ? <IcoCaja size={size} stroke={stroke} />
  : <IcoPersona size={size} stroke={stroke} />;

/** El icono que le toca a cada tipo de documento. */
export const IconoDoc = ({ tipo, size = 18, stroke = 1.9 }:
  { tipo?: string | null; size?: number; stroke?: number }) =>
  tipo === "seguro" ? <IcoEscudo size={size} stroke={stroke} />
  : tipo === "receta" ? <IcoReceta size={size} stroke={stroke} />
  : tipo === "vacunas" ? <IcoJeringa size={size} stroke={stroke} />
  : tipo === "estudio" ? <IcoEstudio size={size} stroke={stroke} />
  : tipo === "identificacion" ? <IcoCarnet size={size} stroke={stroke} />
  : <IcoDoc size={size} stroke={stroke} />;
