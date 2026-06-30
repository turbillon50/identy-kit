import PageHeader from "@/components/PageHeader";

const datos = [
  { label: "Nombre completo", value: "Marisol Tun Canul" },
  { label: "CURP", value: "TUNM850913MQRRNL04" },
  { label: "Fecha de nacimiento", value: "13/09/1985" },
  { label: "Tipo de sangre", value: "O+" },
  { label: "Dirección", value: "Av. Tulum 412, Cancún, Q. Roo" },
  { label: "Teléfono", value: "+52 998 123 4567" },
];

export default function Page() {
  return (
    <main>
      <PageHeader title="Datos Personales" />
      <section className="glass mx-4 p-4 flex flex-col divide-y divide-white/10">
        {datos.map((d) => (
          <div key={d.label} className="py-3 first:pt-0 last:pb-0">
            <p className="text-xs text-gray-400">{d.label}</p>
            <p className="text-base">{d.value}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
