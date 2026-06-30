import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <main>
      <PageHeader title="Historial Médico" />
      <section className="flex flex-col gap-3 mx-4">
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Alergias</p>
          <p>Penicilina, polen, mariscos</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Padecimientos crónicos</p>
          <p>Asma leve (controlada)</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Medicamentos actuales</p>
          <p>Salbutamol (inhalador, según necesidad)</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Vacunas</p>
          <p>COVID-19 (esquema completo), Tétanos 2024, Influenza 2025</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Médico de cabecera</p>
          <p>Dra. Ana Méndez · Hospital Galenia, Cancún</p>
        </div>
      </section>
    </main>
  );
}
