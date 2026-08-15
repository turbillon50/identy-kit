export const dynamic = "force-dynamic";

export default function EspacioIndex() {
  return (
    <div className="app">
      <div className="app-in" style={{ paddingTop: 80, textAlign: "center" }}>
        <img src="/icon-192.png" alt="Identy-Kit" style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 18px" }} />
        <h1 style={{ fontSize: 22, color: "var(--brand-ink)", fontWeight: 800, marginBottom: 8 }}>Espacio privado</h1>
        <p style={{ color: "var(--mut, #6b7688)", fontSize: 14, maxWidth: 340, margin: "0 auto" }}>
          Este es un espacio de acceso restringido. Abre la liga personal que se te compartió para entrar.
        </p>
      </div>
    </div>
  );
}
