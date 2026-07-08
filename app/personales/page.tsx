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
      <section className="glass mx-4 p-4 flex flex-col" style={{ borderTop: "none" }}>
        {datos.map((d, i) => (
          <div
            key={d.label}
            className="py-3"
            style={{
              borderBottom: i < datos.length - 1 ? "1px solid #e5e9f0" : "none",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{d.label}</p>
            <p className="text-base" style={{ color: "var(--text-primary)" }}>{d.value}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
