import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";

export const metadata = {
  title: "Identy-Kit — Identidad de emergencia con QR",
  description: "Un carnet digital con QR para personas, mascotas y más. Datos vitales accesibles en segundos.",
  manifest: "/manifest.json",
  themeColor: "#032F6E",
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
          colorPrimary: "#032F6E",
          colorText: "#00265E",
          colorTextSecondary: "#5A6B85",
          borderRadius: "12px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
        },
        elements: {
          formButtonPrimary: { fontSize: "15px", fontWeight: "700", textTransform: "none" },
          card: { boxShadow: "0 18px 50px rgba(3,47,110,.16)", borderRadius: "20px" },
          headerTitle: { fontWeight: "800", letterSpacing: "-.02em" },
          logoImage: { width: "108px" },
          footerActionLink: { color: "#032F6E", fontWeight: "700" },
        },
        layout: { logoImageUrl: "/logo.png", logoPlacement: "inside" },
      }}
    >
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
