import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";

export const metadata = {
  title: "Identy-Kit — Identidad de emergencia con QR",
  description: "Un carnet digital con QR para personas, mascotas y más. Datos vitales accesibles en segundos.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Identy-Kit" },
  icons: { icon: "/favicon-32.png", apple: "/icon-192.png" },
  metadataBase: new URL("https://identykit.xyz"),
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://identykit.xyz",
    siteName: "Identy-Kit",
    title: "Identy-Kit — Tu identidad, segura en un QR",
    description:
      "Si algo te pasa, alguien va a saber a quién llamar. Un carnet con QR para ti, tu familia y tus mascotas.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Identy-Kit — Tu identidad, segura en un QR" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Identy-Kit — Tu identidad, segura en un QR",
    description: "Si algo te pasa, alguien va a saber a quién llamar.",
    images: ["/og.jpg"],
  },
};

export const viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover",
  themeColor: "#032F6E",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={{
        ...esES,
        signIn: { ...esES.signIn, start: { ...esES.signIn?.start,
          subtitle: "para entrar a tu carnet" } },
        signUp: { ...esES.signUp, start: { ...esES.signUp?.start,
          subtitle: "para crear tu carnet de emergencia" } },
      }}
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
