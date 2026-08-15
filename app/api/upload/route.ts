import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// Toca la base en cada llamada: no se puede precalcular al compilar.
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "no auth" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: "too big" }, { status: 400 });
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const blob = await put(`ik/${userId}/${Date.now()}.${ext}`, file, { access: "public", addRandomSuffix: true });
  return NextResponse.json({ url: blob.url });
}
