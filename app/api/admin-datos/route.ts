import { sql } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { adminActual } from "../../../lib/admin";

export const dynamic = "force-dynamic";

/**
 * Lo que la administración puede hacer sobre los datos de la plataforma.
 *
 * Todo pasa por la sesión propia de administración, no por Clerk.
 *
 * Deliberadamente NO se puede editar el contenido de un carnet ajeno: los
 * datos médicos de alguien son suyos, y que la casa pueda cambiarlos sería
 * un problema, no una función. Lo que sí se puede es apagar un carnet — por
 * si hay abuso o alguien lo reporta — y eso queda registrado.
 */

export async function GET(req: NextRequest) {
  try {
    if (!(await adminActual()))
      return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

    const url = new URL(req.url);
    const que = url.searchParams.get("que") || "";
    const usuario = url.searchParams.get("usuario") || "";

    if (que === "titular" && usuario) {
      const carnets = await sql`
        select i.*,
          (select count(*) from emergency_contacts c where c.identity_id = i.id)::int as contactos,
          (select count(*) from documents d where d.identity_id = i.id)::int as documentos,
          (select count(*) from found_events f where f.identity_id = i.id)::int as escaneos
        from identities i where i.owner_clerk_user_id = ${usuario}
        order by i.created_at desc` as any[];
      return NextResponse.json({ carnets });
    }

    return NextResponse.json({ error: "No sé qué pides" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar" }, { status: 500 });
  }
}

/** Apagar o encender un carnet desde la administración. */
export async function PATCH(req: Request) {
  try {
    const admin = await adminActual();
    if (!admin) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

    const { id, activo, motivo } = await req.json();
    if (!id) return NextResponse.json({ error: "Falta el carnet" }, { status: 400 });
    if (!activo && !String(motivo || "").trim())
      return NextResponse.json({ error: "Escribe por qué lo apagas" }, { status: 400 });

    await sql`update identities set is_active = ${!!activo}, updated_at = now()
      where id = ${id}`;

    // Queda constando quién lo hizo y por qué: apagar el carnet de alguien
    // le quita su protección, y eso no puede pasar sin rastro.
    try {
      await sql`
        insert into sos_events (identity_id, mensaje, disparado_por)
        values (${id}, ${`[admin] ${activo ? "encendido" : "apagado"}: ${motivo || "—"}`},
          ${`admin:${admin}`})`;
    } catch { /* el registro es deseable, no bloqueante */ }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo cambiar" }, { status: 500 });
  }
}
