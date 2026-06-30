import PageHeader from "@/components/PageHeader";

export default function Page() {
  return (
    <main>
      <PageHeader title="Historial Académico" />
      <section className="flex flex-col gap-3 mx-4">
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Educación superior</p>
          <p>Lic. en Administración Turística — Universidad de Quintana Roo (2003–2007)</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Certificaciones</p>
          <p>Primeros Auxilios Cruz Roja (2024), Manejo de Crisis Hotelera (2023)</p>
        </div>
        <div className="glass p-4">
          <p className="text-xs text-gray-400 mb-1">Idiomas</p>
          <p>Español (nativo), Inglés (avanzado), Maya (nativo)</p>
        </div>
      </section>
    </main>
  );
}
