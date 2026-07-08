import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCarnetByUserId } from "@/lib/db";
import Link from "next/link";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, carnet] = await Promise.all([
    currentUser(),
    getCarnetByUserId(userId),
  ]);

  const nombre = carnet?.nombre || user?.firstName || "Usuario";
  const apellidos = carnet?.apellidos || user?.lastName || "";
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const iniciales = `${nombre[0] || ""}${apellidos[0] || ""}`.toUpperCase() || "ID";
  const progreso = [
    carnet?.curp, carnet?.tipo_sangre, carnet?.alergias,
    carnet?.contacto_emergencia_nombre, carnet?.escuela,
  ].filter(Boolean).length * 20;

  return (
    <main className="flex flex-col min-h-screen">
      <header className="glass flex items-center gap-4 p-4 mx-4 mt-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg"
          style={{ background: "rgba(30,99,208,0.1)", color: "var(--accent)" }}
        >
          {iniciales}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold" style={{ color: "var(--accent)" }}>{nombre} {apellidos}</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{email}</p>
        </div>
      </header>

      <div className="mx-4 mt-3 px-4 py-3 glass">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: "var(--text-secondary)" }}>Perfil completado</span>
          <span className="font-medium" style={{ color: "var(--accent)" }}>{progreso}%</span>
        </div>
        <div className="w-full rounded-full h-1.5" style={{ background: "#e5e9f0" }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${progreso}%`, background: "var(--accent)" }} />
        </div>
      </div>

      <section className="flex flex-col gap-3 p-4 mt-2">
        {[
          { href: "/personales", title: "Datos Personales", sub: carnet?.curp ? `CURP: ${carnet.curp}` : "Completa tu información" },
          { href: "/medico", title: "Historial Médico", sub: carnet?.tipo_sangre ? `Sangre ${carnet.tipo_sangre}` : "Alergias, vacunas, padecimientos" },
          { href: "/academico", title: "Historial Académico", sub: carnet?.escuela || "Escuela, grado, certificados" },
          { href: "/documentos", title: "Documentos", sub: "INE, pasaporte, acta de nacimiento" },
          { href: "/contactos", title: "Contactos de Emergencia", sub: carnet?.contacto_emergencia_nombre || "Familia y médico de cabecera" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="glass flex items-center gap-4 p-4 transition"
            style={{ color: "var(--text-primary)" }}
          >
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.sub}</div>
            </div>
          </Link>
        ))}
        <Link
          href="/emergencia"
          className="glass flex items-center justify-center gap-2 py-4 mt-2 text-base font-semibold"
          style={{ color: "var(--accent)" }}
        >
          Generar QR de Emergencia
        </Link>
      </section>
    </main>
  );
}
