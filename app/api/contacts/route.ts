import { auth } from "@clerk/nextjs/server";
import { sql } from "../../../lib/db";
import { NextResponse } from "next/server";

// Toca la base en cada llamada: no se puede precalcular al compilar.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "no auth" }, { status: 401 });
  const b = await req.json();
  const own = await sql`select id from identities where id=${b.identity_id} and owner_clerk_user_id=${userId}` as any[];
  if (!own.length) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const rows = await sql`insert into emergency_contacts (identity_id, name, relationship, phone) values (${b.identity_id}, ${b.name}, ${b.relationship||null}, ${b.phone}) returning *` as any[];
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "no auth" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  await sql`delete from emergency_contacts c using identities i where c.id=${id} and c.identity_id=i.id and i.owner_clerk_user_id=${userId}`;
  return NextResponse.json({ ok: true });
}
