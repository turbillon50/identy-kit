import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Identy-Kit — Carnet de Identidad Digital",
  description: "Tu información esencial protegida, lista para una emergencia.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#08080c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="halo" />
        <div className="relative z-10 pb-16">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
