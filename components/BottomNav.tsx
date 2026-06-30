"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MedicalIcon, AcademicIcon, DocsIcon, EmergencyIcon } from "@/components/icons";

const items = [
  { href: "/", label: "Inicio", Icon: HomeIcon },
  { href: "/medico", label: "Médico", Icon: MedicalIcon },
  { href: "/academico", label: "Académico", Icon: AcademicIcon },
  { href: "/documentos", label: "Documentos", Icon: DocsIcon },
  { href: "/emergencia", label: "Emergencia", Icon: EmergencyIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      data-vulcano-bottomnav
      className="glass fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center h-16"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 text-[11px]"
            style={{ color: active ? "var(--accent)" : "#8a8a93" }}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
