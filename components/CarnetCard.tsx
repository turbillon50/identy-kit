import Link from "next/link";
import { ReactNode } from "react";
import { ChevronRight } from "@/components/icons";

export default function CarnetCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="glass flex items-center p-4 gap-4 active:scale-[0.98] transition-transform"
    >
      <div
        className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0"
        style={{ background: "rgba(30,99,208,0.1)", color: "var(--accent)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-base" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
      </div>
      <ChevronRight className="w-5 h-5 shrink-0" style={{ color: "var(--text-secondary)" }} />
    </Link>
  );
}
