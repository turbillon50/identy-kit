import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// /admin NO va aquí: tiene su propio acceso con usuario y clave nuestros,
// aparte de las cuentas de los titulares que maneja Clerk.
const esPrivada = createRouteMatcher([
  "/dashboard(.*)",
  "/carnet(.*)",
  "/actividad(.*)",
  "/cuenta(.*)",
  "/api/identities(.*)",
  "/api/medical(.*)",
  "/api/contacts(.*)",
  "/api/upload(.*)",
]);

const esApi = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const host = (req.headers.get("host") || "").toLowerCase();

  // Espacio privado por subdominio del cliente (marisol.identykit.xyz/<token>)
  if (host.startsWith("marisol.")) {
    const url = req.nextUrl.clone();
    const p = url.pathname;
    if (p.startsWith("/_next") || p.startsWith("/api") || p.includes(".") ||
        p.startsWith("/espacio")) {
      return NextResponse.next();
    }
    url.pathname = "/espacio" + (p === "/" ? "" : p);
    return NextResponse.rewrite(url);
  }

  if (!esPrivada(req)) return;

  const { userId } = await auth();
  if (userId) return;

  // Sin esto, Clerk contesta "no existe" a quien no ha entrado: alguien que
  // abre una liga compartida sin sesión veía un 404 en vez de que le
  // pidieran entrar. Las APIs sí devuelven error, que es lo que espera el
  // código que las llama.
  if (esApi(req)) {
    return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });
  }

  const entrar = req.nextUrl.clone();
  entrar.pathname = "/sign-in";
  // Para regresarlo a donde iba una vez que entre
  entrar.searchParams.set("redirect_url", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(entrar);
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|e/).*)", "/api/(.*)"],
};
