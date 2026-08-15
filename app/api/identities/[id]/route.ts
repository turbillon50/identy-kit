import { sql } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";

const FIELDS = ["display_name","kind","species","breed","color","sex","birth_date","blood_type","weight","height","organ_donor","microchip","owner_name","owner_phone","reward_note","public_note","photo_url","national_id"];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await clerkAuth();
  if (!userId) return NextResponse.json({ error: "no auth" }, { status: 401 });
  const own = await sql`select id from identities where id=${params.id} and owner_clerk_user_id=${userId}` as any[];
  if (!own.length) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json();
  for (const f of FIELDS) {
    if (f in b) {
      await sql.query(`update identities set ${f}=$1, updated_at=now() where id=$2`, [b[f] === "" ? null : b[f], params.id]);
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await clerkAuth();
  if (!userId) return NextResponse.json({ error: "no auth" }, { status: 401 });
  await sql`delete from identities where id=${params.id} and owner_clerk_user_id=${userId}`;
  return NextResponse.json({ ok: true });
}
