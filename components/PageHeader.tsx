import Link from "next/link";
import { ArrowLeft } from "@/components/icons";

export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex items-center gap-3 p-4">
      <Link href="/" className="text-accent"><ArrowLeft className="w-5 h-5" /></Link>
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
