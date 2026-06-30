import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppGate from "@/components/AppGate";

export const metadata: Metadata = {
  title: "Identy-Kit — Carnet de Identidad Digital",
  description: "Tu información esencial protegida, lista para una emergencia.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon-32.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#08080c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppGate>{children}</AppGate>
      </body>
    </html>
  );
}
