import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { sql } from "../../../../lib/db";
import { qrSvg } from "../../../../lib/qr";
import Link from "next/link";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

export default async function Print({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const rows = await sql`select * from identities where id=${params.id} and owner_clerk_user_id=${userId}` as any[];
  if (!rows.length) notFound();
  const id = rows[0];
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://identykit.xyz";
  const svg = await qrSvg(`${base}/e/${id.qr_token}`, { color: "#0a1220" });
  const isPet = id.kind === "pet";
  return (
    <div className="wrap" style={{ maxWidth: 420 }}>
      <div className="top noprint"><Link href={`/carnet/${id.id}`} className="sub">‹ Volver</Link><b>Imprimir</b><span/></div>
      <div className="printcard card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#1e63d0,#2fa8e6)", color: "#fff", padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
          <img src="/icon-192.png" width={22} height={22} alt=""/> Identy-Kit
        </div>
        <div style={{ padding: 20, display: "flex", gap: 16, alignItems: "center" }}>
          <div dangerouslySetInnerHTML={{ __html: svg }} style={{ width: 120, height: 120, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{id.display_name}</div>
            <div className="sub">{isPet ? "Mascota" : "Ficha de emergencia"}</div>
            {id.blood_type && <div style={{ marginTop: 6 }}><span className="tag red">🩸 {id.blood_type}</span></div>}
            <div className="sub" style={{ marginTop: 8, fontSize: 12 }}>Escanea este código para ver datos vitales y a quién llamar.</div>
          </div>
        </div>
        <div style={{ padding: "0 20px 16px", fontSize: 11, color: "#8a94a1", wordBreak: "break-all" }}>{base}/e/{id.qr_token}</div>
      </div>
      <div className="grid2 noprint" style={{ marginTop: 18 }}>
        <PrintButton/>
        <Link href={`/carnet/${id.id}`} className="btn ghost">Listo</Link>
      </div>
      <p className="sub noprint" style={{ marginTop: 14, textAlign: "center" }}>Imprime y recorta. Ponlo en la cartera, el collar, la mochila o pégalo en casa.</p>
    </div>
  );
}
