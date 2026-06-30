import PageHeader from "@/components/PageHeader";
import { DocsIcon } from "@/components/icons";

const docs = ["INE", "Pasaporte vigente", "Acta de nacimiento", "Cartilla de vacunación", "Póliza de seguro médico"];

export default function Page() {
  return (
    <main>
      <PageHeader title="Documentos" />
      <section className="flex flex-col gap-3 mx-4">
        {docs.map((d) => (
          <div key={d} className="glass p-4 flex items-center gap-3">
            <DocsIcon className="w-5 h-5 text-accent" />
            <p>{d}</p>
            <span className="ml-auto text-xs text-gray-500">Cargado</span>
          </div>
        ))}
      </section>
    </main>
  );
}
