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
      className="fixed bottom-0 left-0 right-0 z-20 flex justify-around items-center h-16"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid #e5e9f0",
      }}
    >
      {items.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 text-[11px] font-medium"
            style={{ color: active ? "#1e63d0" : "#5b6b84" }}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
