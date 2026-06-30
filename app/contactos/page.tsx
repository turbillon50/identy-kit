import PageHeader from "@/components/PageHeader";

const contactos = [
  { nombre: "Luis Tun (padre)", tel: "+52 998 234 5678" },
  { nombre: "Carmen Canul (madre)", tel: "+52 998 345 6789" },
  { nombre: "Dra. Ana Méndez (médico)", tel: "+52 998 456 7890" },
];

export default function Page() {
  return (
    <main>
      <PageHeader title="Contactos de Emergencia" />
      <section className="flex flex-col gap-3 mx-4">
        {contactos.map((c) => (
          <a key={c.tel} href={`tel:${c.tel}`} className="glass p-4 flex items-center justify-between">
            <div>
              <p>{c.nombre}</p>
              <p className="text-xs text-gray-400">{c.tel}</p>
            </div>
            <span className="text-accent text-sm">Llamar</span>
          </a>
        ))}
      </section>
    </main>
  );
}
