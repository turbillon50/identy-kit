import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <main>
      <PageHeader title="Historial Médico" />
      <section className="flex flex-col gap-3 mx-4">
        <div className="glass p-4">
          <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Alergias</p>
          <p style={{ color: "var(--text-primary)" }}>Penicilina, polen, mariscos</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Padecimientos crónicos</p>
          <p style={{ color: "var(--text-primary)" }}>Asma leve (controlada)</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Medicamentos actuales</p>
          <p style={{ color: "var(--text-primary)" }}>Salbutamol (inhalador, según necesidad)</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Vacunas</p>
          <p style={{ color: "var(--text-primary)" }}>COVID-19 (esquema completo), Tétanos 2024, Influenza 2025</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Médico de cabecera</p>
          <p style={{ color: "var(--text-primary)" }}>Dra. Ana Méndez · Hospital Galenia, Cancún</p>
        </div>
      </section>
    </main>
  );
}
