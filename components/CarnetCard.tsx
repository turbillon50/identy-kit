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
      <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-[rgba(31,209,184,0.12)] text-accent shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-base">{title}</h3>
        <p className="text-sm text-gray-400 truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
    </Link>
  );
}
