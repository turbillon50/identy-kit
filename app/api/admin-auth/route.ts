import { NextResponse } from "next/server";
import { credencialesValidas, crearSesion, cerrarSesion } from "../../../lib/admin";

export const dynamic = "force-dynamic";

/** Entrar a la administración. */
export async function POST(req: Request) {
  try {
    const { usuario, clave } = await req.json();
    if (!usuario || !clave)
      return NextResponse.json({ error: "Falta el usuario o la clave" }, { status: 400 });

    if (!credencialesValidas(String(usuario), String(clave))) {
      // Un momento de espera para que no se pueda probar clave tras clave a toda velocidad
      await new Promise((r) => setTimeout(r, 700));
      return NextResponse.json({ error: "Usuario o clave incorrectos" }, { status: 401 });
    }

    await crearSesion(String(usuario).trim().toLowerCase());
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo entrar" }, { status: 500 });
  }
}

/** Salir. */
export async function DELETE() {
  await cerrarSesion();
  return NextResponse.json({ ok: true });
}
