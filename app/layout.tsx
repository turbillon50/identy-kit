import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";

export const metadata = {
  title: "Identy-Kit — Identidad de emergencia con QR",
  description: "Un carnet digital con QR para personas, mascotas y más. Datos vitales accesibles en segundos.",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Identy-Kit" },
  icons: { icon: "/favicon-32.png", apple: "/icon-192.png" },
};

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={{
        variables: {
          colorPrimary: "#1e63d0",
          colorText: "#0e2a5c",
          colorTextSecondary: "#5b6b84",
          borderRadius: "12px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
        },
        elements: {
          formButtonPrimary: { fontSize: "15px", fontWeight: "700", textTransform: "none" },
          card: { boxShadow: "0 20px 60px rgba(16,24,40,.14)", borderRadius: "20px" },
          headerTitle: { fontWeight: "800", letterSpacing: "-.02em" },
          logoImage: { width: "44px" },
          footerActionLink: { color: "#1e63d0", fontWeight: "700" },
        },
        layout: { logoImageUrl: "/icon-192.png", logoPlacement: "inside" },
      }}
    >
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
