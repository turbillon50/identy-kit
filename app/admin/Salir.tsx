"use client";
import { useRouter } from "next/navigation";

export default function Salir() {
  const r = useRouter();
  return (
    <button className="btn ghost sm" onClick={async () => {
      await fetch("/api/admin-auth", { method: "DELETE" });
      r.refresh();
    }}>Salir</button>
  );
}
