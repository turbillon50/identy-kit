import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { sql } from "../../../lib/db";

export const dynamic = "force-dynamic";

// Lo que de verdad se puede guardar. El navegador dice que solo manda
// imágenes, pero eso se puede saltar: aquí se revisa de nuevo.
const PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png",
  "image/webp": "webp", "image/heic": "heic", "image/heif": "heif",
};
const MAX = 5 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Necesitas entrar" }, { status: 401 });

    const form = await req.formData();
    const archivo = form.get("file") as File | null;
    const carnetId = String(form.get("identity_id") || "");

    if (!archivo) return NextResponse.json({ error: "No llegó ninguna foto" }, { status: 400 });
    if (archivo.size > MAX)
      return NextResponse.json({ error: "La foto pesa demasiado" }, { status: 400 });

    const ext = PERMITIDOS[archivo.type];
    if (!ext)
      return NextResponse.json({ error: "Solo se aceptan fotos" }, { status: 400 });

    const blob = await put(`ik/${userId}/${Date.now()}.${ext}`, archivo, {
      access: "public", addRandomSuffix: true,
    });

    // Se guarda de una vez: antes la foto quedaba subida pero sin asignar
    // hasta que el usuario le diera a guardar, y si salía de la pantalla se
    // perdía sin avisarle.
    if (carnetId) {
      await sql`
        update identities set photo_url = ${blob.url}, updated_at = now()
        where id = ${carnetId} and owner_clerk_user_id = ${userId}`;
    }

    return NextResponse.json({ url: blob.url, guardada: !!carnetId });
  } catch (e: any) {
    return NextResponse.json({ error: "No se pudo subir la foto" }, { status: 500 });
  }
}
