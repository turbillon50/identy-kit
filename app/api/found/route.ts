import { sql } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const idr = await sql`select id from identities where qr_token=${b.qr}` as any[];
  if (!idr.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  const ua = req.headers.get("user-agent") || "";
  await sql`insert into found_events (identity_id, lat, lng, accuracy, finder_note, user_agent)
    values (${idr[0].id}, ${b.lat ?? null}, ${b.lng ?? null}, ${b.accuracy ?? null}, ${b.note || null}, ${ua})`;
  return NextResponse.json({ ok: true });
}
