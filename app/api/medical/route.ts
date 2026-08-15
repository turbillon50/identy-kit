import { auth } from "@clerk/nextjs/server";
import { sql } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "no auth" }, { status: 401 });
  const b = await req.json();
  const own = await sql`select id from identities where id=${b.identity_id} and owner_clerk_user_id=${userId}` as any[];
  if (!own.length) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const ex = await sql`select id from medical_info where identity_id=${b.identity_id}` as any[];
  const v = (x:any)=> x===""||x===undefined ? null : x;
  if (ex.length) {
    await sql`update medical_info set allergies=${v(b.allergies)}, conditions=${v(b.conditions)}, medications=${v(b.medications)}, implants=${v(b.implants)}, insurance=${v(b.insurance)}, preferred_hospital=${v(b.preferred_hospital)}, doctor_name=${v(b.doctor_name)}, doctor_phone=${v(b.doctor_phone)}, vaccinations=${v(b.vaccinations)}, dnr=${!!b.dnr}, notes=${v(b.notes)}, updated_at=now() where identity_id=${b.identity_id}`;
  } else {
    await sql`insert into medical_info (identity_id, allergies, conditions, medications, implants, insurance, preferred_hospital, doctor_name, doctor_phone, vaccinations, dnr, notes) values (${b.identity_id}, ${v(b.allergies)}, ${v(b.conditions)}, ${v(b.medications)}, ${v(b.implants)}, ${v(b.insurance)}, ${v(b.preferred_hospital)}, ${v(b.doctor_name)}, ${v(b.doctor_phone)}, ${v(b.vaccinations)}, ${!!b.dnr}, ${v(b.notes)})`;
  }
  return NextResponse.json({ ok: true });
}
