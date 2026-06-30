import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { query } from "@/lib/db";

export async function GET() {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const result = await query("SELECT * FROM carnets WHERE user_id = $1", [userId]);
  return NextResponse.json(result.rows[0] ?? {});
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = (await req.json()) as Record<string, string>;
  const fields = [
    "curp","nombre","apellidos","fecha_nacimiento","tipo_sangre",
    "alergias","padecimientos","contacto_emergencia_nombre",
    "contacto_emergencia_tel","escuela","grado",
  ];
  const values = fields.map((f) => body[f] ?? null);

  await query(
    `INSERT INTO carnets (user_id, ${fields.join(", ")})
     VALUES ($1, ${fields.map((_, i) => `$${i + 2}`).join(", ")})
     ON CONFLICT (user_id) DO UPDATE SET
     ${fields.map((f) => `${f} = EXCLUDED.${f}`).join(", ")},
     updated_at = NOW()`,
    [userId, ...values]
  );

  return new NextResponse("Saved", { status: 200 });
}
