import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/carnet(.*)",
  "/admin(.*)",
  "/actividad(.*)",
  "/cuenta(.*)",
  "/api/identities(.*)",
  "/api/medical(.*)",
  "/api/contacts(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const host = (req.headers.get("host") || "").toLowerCase();

  // Espacio privado por subdominio de cliente (ej. marisol.identykit.xyz/<token>)
  if (host.startsWith("marisol.")) {
    const url = req.nextUrl.clone();
    const p = url.pathname;
    if (p.startsWith("/_next") || p.startsWith("/api") || p.includes(".") || p.startsWith("/espacio")) {
      return NextResponse.next();
    }
    url.pathname = "/espacio" + (p === "/" ? "" : p);
    return NextResponse.rewrite(url);
  }

  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|e/).*)", "/api/(.*)"],
};
