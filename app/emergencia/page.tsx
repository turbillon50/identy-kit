import PageHeader from "@/components/PageHeader";
import { ShareIcon } from "@/components/icons";

const payload = encodeURIComponent(
  "Marisol Tun Canul | O+ | Alergias: Penicilina, polen | Contacto: Luis Tun +52 998 234 5678"
);
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&color=1FD1B8&bgcolor=08080c&data=${payload}`;

export default function Page() {
  return (
    <main className="flex flex-col items-center">
      <PageHeader title="QR de Emergencia" />
      <img src={qrUrl} alt="QR de emergencia" className="rounded-2xl glass p-3 w-[280px] h-[280px]" />

      <section className="glass mx-4 mt-6 p-4 w-[calc(100%-2rem)]">
        <p className="text-sm font-medium mb-2">Información incluida</p>
        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
          <li>Nombre completo y tipo de sangre</li>
          <li>Alergias principales</li>
          <li>Contacto de emergencia prioritario</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          Solo se comparte lo que tú autorizaste. Para más detalle médico/legal se requiere desbloqueo con huella o Face ID.
        </p>
      </section>

      <button className="glass mt-6 flex items-center gap-2 px-5 py-3 text-accent font-medium">
        <ShareIcon className="w-5 h-5" />
        Compartir
      </button>
    </main>
  );
}
