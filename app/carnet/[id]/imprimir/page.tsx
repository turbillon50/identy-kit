import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { sql } from "../../../../lib/db";
import { qrSvg } from "../../../../lib/qr";
import Link from "next/link";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

/**
 * La hoja para imprimir.
 *
 * Antes daba una sola tarjeta. Pero nadie usa una: se quiere una en la
 * cartera, una pegada atrás del celular, y si es mascota, una chiquita para
 * el collar. Por eso esta hoja trae las tres medidas listas para recortar,
 * en una sola impresión.
 */
export default async function Imprimir({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  const filas = await sql`
    select * from identities
    where id=${params.id} and owner_clerk_user_id=${userId}` as any[];
  if (!filas.length) notFound();

  const id = filas[0];
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://identykit.xyz";
  const url = `${base}/e/${id.qr_token}`;
  const grande = await qrSvg(url, { color: "#032F6E", margin: 0 });
  const chico = await qrSvg(url, { color: "#032F6E", margin: 0 });
  const esMascota = id.kind === "pet";

  return (
    <div className="wrap" style={{ maxWidth: 460, paddingTop: 16 }}>
      <div className="top no-print">
        <Link href={`/carnet/${id.id}`} className="sub" style={{ fontWeight: 600 }}>
          ‹ Volver
        </Link>
        <b style={{ fontSize: 16 }}>Imprimir</b>
        <span />
      </div>

      <p className="sub no-print" style={{ marginBottom: 18, lineHeight: 1.55 }}>
        Imprime esta hoja y recorta lo que necesites. Si puedes, usa papel
        grueso o mándala a plastificar — va a andar en la cartera mucho tiempo.
      </p>

      {/* Tamaño cartera, proporción de tarjeta bancaria */}
      <div className="p-tarjeta">
        <div className="p-banda">
          <img src="/icon-192.png" width={19} height={19} alt="" style={{ borderRadius: 5 }} />
          Identy·kit
          <span style={{ marginLeft: "auto", fontSize: 9.5, letterSpacing: ".1em", opacity: .9 }}>
            {esMascota ? "MASCOTA" : "EMERGENCIA"}
          </span>
        </div>
        <div className="p-cuerpo">
          <div className="p-qr" dangerouslySetInnerHTML={{ __html: grande }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="p-nombre">{id.display_name}</div>
            {id.blood_type && (
              <div className="p-sangre">Sangre {id.blood_type}</div>
            )}
            <div className="p-txt">
              {esMascota
                ? "Si me encuentras, escanea este código para hablarle a mi familia."
                : "Escanea este código para ver mis datos y a quién llamar."}
            </div>
          </div>
        </div>
      </div>

      {/* Para pegar atrás del celular o en el collar */}
      <div className="p-titulo no-print">Para pegar</div>
      <div className="p-chicos">
        {[0, 1, 2].map((i) => (
          <div key={i} className="p-chico">
            <div className="p-qr-chico" dangerouslySetInnerHTML={{ __html: chico }} />
            <div className="p-chico-txt">
              {esMascota ? "Escanéame" : "Emergencia"}
            </div>
          </div>
        ))}
      </div>

      <div className="p-liga">{url}</div>

      <div className="grid2 no-print" style={{ marginTop: 22 }}>
        <PrintButton />
        <Link href={`/carnet/${id.id}`} className="btn ghost">Listo</Link>
      </div>
    </div>
  );
}
