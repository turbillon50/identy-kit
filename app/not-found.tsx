import { IcoLupa } from "@/components/Iconos";

export default function NF() {
  return (
    <div className="wrap">
      <div className="empty" style={{ marginTop: 40 }}>
        <div className="empty-ico"><IcoLupa size={34} stroke={1.8} /></div>
        <b style={{ display: "block", fontSize: 16, color: "var(--tinta)" }}>
          Aquí no hay nada
        </b>
        <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.55 }}>
          La liga no existe, o el carnet fue apagado por su dueño.
        </div>
        <a className="btn ghost" href="/" style={{ width: "auto", display: "inline-block",
          marginTop: 16, padding: "12px 28px" }}>Ir al inicio</a>
      </div>
    </div>
  );
}
