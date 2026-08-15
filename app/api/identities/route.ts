import { auth } from "@clerk/nextjs/server";
import { sql } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "no auth" }, { status: 401 });
  const b = await req.json();
  const rows = await sql`
    insert into identities (owner_clerk_user_id, kind, display_name, species, birth_date, blood_type, national_id, public_note)
    values (${userId}, ${b.kind||'person'}, ${b.display_name}, ${b.species||null}, ${b.birth_date||null}, ${b.blood_type||null}, ${b.national_id||null}, ${b.public_note||null})
    returning id` as any[];
  return NextResponse.json({ id: rows[0].id });
}
