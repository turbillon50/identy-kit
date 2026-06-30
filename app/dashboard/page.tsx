import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getCarnetByUserId } from "@/lib/db";
import Link from "next/link";
import { PersonIcon, MedicalIcon, AcademicIcon, DocsIcon, ContactsIcon, QRIcon } from "@/components/icons";

export default async function Dashboard() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const [user, carnet] = await Promise.all([
    currentUser(),
    getCarnetByUserId(userId),
  ]);

  const nombre = carnet?.nombre || user?.firstName || "Usuario";
  const apellidos = carnet?.apellidos || user?.lastName || "";
  const iniciales = `${nombre[0] || ""}${apellidos[0] || ""}`.toUpperCase() || "ID";
  const progreso = [
    carnet?.curp, carnet?.tipo_sangre, carnet?.alergias,
    carnet?.contacto_emergencia_nombre, carnet?.escuela
  ].filter(Boolean).length * 20;

  return (
    <main className="flex flex-col min-h-screen">
      <div className="halo" />
      <header className="glass flex items-center gap-4 p-4 mx-4 mt-4">
        <div className="w-14 h-14 rounded-full bg-[rgba(31,209,184,0.15)] flex items-center justify-center text-[#1FD1B8] font-semibold text-lg">
          {iniciales}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-[#1FD1B8]">{nombre} {apellidos}</h1>
          <p className="text-sm text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
        <Link href="/api/auth/sign-out" className="text-xs text-gray-500 hover:text-gray-300">Salir</Link>
      </header>

      {/* Progress bar */}
      <div className="mx-4 mt-3 px-4 py-3 glass">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Perfil completado</span>
          <span className="text-[#1FD1B8] font-medium">{progreso}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div className="bg-[#1FD1B8] h-1.5 rounded-full transition-all" style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <section className="flex flex-col gap-3 p-4 mt-2">
        {[
          { href: "/personales", icon: <PersonIcon className="w-6 h-6" />, title: "Datos Personales", sub: carnet?.curp ? `CURP: ${carnet.curp}` : "Completa tu información" },
          { href: "/medico", icon: <MedicalIcon className="w-6 h-6" />, title: "Historial Médico", sub: carnet?.tipo_sangre ? `Sangre ${carnet.tipo_sangre} · ${carnet.alergias || "Sin alergias"}` : "Alergias, vacunas, padecimientos" },
          { href: "/academico", icon: <AcademicIcon className="w-6 h-6" />, title: "Historial Académico", sub: carnet?.escuela || "Escuela, grado, certificados" },
          { href: "/documentos", icon: <DocsIcon className="w-6 h-6" />, title: "Documentos", sub: "INE, pasaporte, acta de nacimiento" },
          { href: "/contactos", icon: <ContactsIcon className="w-6 h-6" />, title: "Contactos de Emergencia", sub: carnet?.contacto_emergencia_nombre ? `${carnet.contacto_emergencia_nombre} · ${carnet.contacto_emergencia_tel}` : "Familia y médico de cabecera" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="glass flex items-center gap-4 p-4 hover:bg-white/10 transition">
            <div className="text-[#1FD1B8]">{item.icon}</div>
            <div>
              <div className="font-medium text-white">{item.title}</div>
              <div className="text-xs text-gray-400">{item.sub}</div>
            </div>
          </Link>
        ))}

        <Link href="/emergencia" className="glass v-pulse flex items-center justify-center gap-2 py-4 mt-2 text-base font-semibold text-[#1FD1B8]">
          <QRIcon className="w-6 h-6" />
          Generar QR de Emergencia
        </Link>
      </section>
    </main>
  );
}
