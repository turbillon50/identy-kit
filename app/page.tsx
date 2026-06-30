"use client";

import CarnetCard from "@/components/CarnetCard";
import ProfileProgress from "@/components/ProfileProgress";
import { SkeletonCard } from "@/components/Skeleton";
import { useFakeLoad } from "@/hooks/useFakeLoad";
import { PersonIcon, MedicalIcon, AcademicIcon, DocsIcon, ContactsIcon, QRIcon } from "@/components/icons";
import Link from "next/link";

export default function Home() {
  const loading = useFakeLoad(600);

  return (
    <main className="flex flex-col min-h-screen">
      <header className="glass flex items-center gap-4 p-4 mx-4 mt-4">
        <div className="w-14 h-14 rounded-full bg-[rgba(31,209,184,0.15)] flex items-center justify-center text-accent font-semibold text-lg">
          MT
        </div>
        <div>
          <h1 className="text-xl font-semibold text-accent">Marisol Tun</h1>
          <p className="text-sm text-gray-400">Carnet ID 8723-A-94 · Cancún, QR</p>
        </div>
      </header>

      <ProfileProgress percent={83} />

      <section className="flex flex-col gap-3 p-4 mt-2">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <CarnetCard href="/personales" icon={<PersonIcon className="w-6 h-6" />} title="Datos Personales" subtitle="CURP, nacimiento, tipo de sangre" />
            <CarnetCard href="/medico" icon={<MedicalIcon className="w-6 h-6" />} title="Historial Médico" subtitle="Alergias, vacunas, padecimientos" />
            <CarnetCard href="/academico" icon={<AcademicIcon className="w-6 h-6" />} title="Historial Académico" subtitle="Escuela, grado, certificados" />
            <CarnetCard href="/documentos" icon={<DocsIcon className="w-6 h-6" />} title="Documentos" subtitle="INE, pasaporte, acta de nacimiento" />
            <CarnetCard href="/contactos" icon={<ContactsIcon className="w-6 h-6" />} title="Contactos de Emergencia" subtitle="Familia y médico de cabecera" />
          </>
        )}

        <Link
          href="/emergencia"
          className="glass v-pulse flex items-center justify-center gap-2 py-4 mt-2 text-base font-semibold text-accent"
        >
          <QRIcon className="w-6 h-6" />
          Generar QR de Emergencia
        </Link>
      </section>
    </main>
  );
}
