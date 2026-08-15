import { sql, sqlArmada } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";

// Toca la base en cada llamada: no se puede precalcular al compilar.
export const dynamic = "force-dynamic";

// Los únicos campos que se pueden tocar. El nombre de columna nunca viene de
// fuera: se toma de esta lista, y los valores van siempre como parámetros.
const CAMPOS = [
  "display_name", "kind", "species", "breed", "color", "sex", "birth_date",
  "blood_type", "weight", "height", "organ_donor", "microchip", "owner_name",
  "owner_phone", "reward_note", "public_note", "photo_url", "national_id", "is_active",
] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await clerkAuth();
  if (!userId) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  const propio = await sql`
    select id from identities
    where id=${params.id} and owner_clerk_user_id=${userId}` as any[];
  if (!propio.length)
    return NextResponse.json({ error: "Ese carnet no es tuyo" }, { status: 403 });

  const b = await req.json();
  const tocados = CAMPOS.filter((f) => f in b);
  if (!tocados.length) return NextResponse.json({ ok: true, sinCambios: true });

  // Una sola escritura, no una por campo: antes esto hacía hasta 18 viajes a
  // la base para guardar un carnet, y si fallaba a la mitad quedaba a medias.
  const sets = tocados.map((f, i) => `${f}=$${i + 1}`).join(", ");
  const valores = tocados.map((f) => (b[f] === "" ? null : b[f]));

  await sqlArmada(
    `update identities set ${sets}, updated_at=now()
     where id=$${tocados.length + 1} and owner_clerk_user_id=$${tocados.length + 2}`,
    [...valores, params.id, userId]
  );

  return NextResponse.json({ ok: true, campos: tocados.length });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await clerkAuth();
  if (!userId) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  await sql`
    delete from identities
    where id=${params.id} and owner_clerk_user_id=${userId}`;
  return NextResponse.json({ ok: true });
}
