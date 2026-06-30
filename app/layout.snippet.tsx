// app/layout.tsx — MOLDE MAESTRO APROBADO. ES por defecto + tokens + splash + barra glass fija.
import "../styles/tokens.css";
import BottomNav from "../components/BottomNav";
import Splash from "../components/Splash";
export const metadata = { title: "Vulcano App", manifest: "/manifest.webmanifest" };
export const viewport = { viewportFit: "cover" as const, width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark">
      <body>
        <Splash brand="VMOMENTUM" />
        <div className="app-shell">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
