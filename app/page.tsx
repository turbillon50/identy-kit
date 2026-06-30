import Link from "next/link";

export default function Landing() {
  return (
    <main className="flex flex-col min-h-screen bg-[#08080c] text-white">
      <div className="halo" />

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-12 z-10">
        <div className="mb-3 text-xs font-semibold tracking-widest text-[#1FD1B8] uppercase">Identy-Kit</div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Tu identidad digital,<br />siempre contigo
        </h1>
        <p className="text-gray-400 max-w-sm mb-8 text-base">
          Carnet digital de emergencia con datos médicos, contactos y QR instantáneo. Disponible offline, siempre.
        </p>

        {/* Mockup carnet */}
        <div className="glass w-full max-w-xs p-5 mb-10 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[rgba(31,209,184,0.15)] flex items-center justify-center text-[#1FD1B8] font-bold text-lg">MT</div>
            <div>
              <div className="font-semibold text-white">Marisol Tun</div>
              <div className="text-xs text-gray-400">Carnet ID 8723-A · Cancún, QR</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div><span className="text-gray-500">Sangre</span><br />O+</div>
            <div><span className="text-gray-500">Alergias</span><br />Penicilina</div>
            <div><span className="text-gray-500">Contacto</span><br />Pedro Tun</div>
            <div><span className="text-gray-500">Tel</span><br />998 123 4567</div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[#1FD1B8] text-xs font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zm6 10v6h-6v-2h4v-4h2zm-10 6H4v-6h2v4h4v2z"/>
            </svg>
            QR de emergencia activo
          </div>
        </div>

        <Link
          href="/sign-up"
          className="px-8 py-3 bg-[#1FD1B8] text-black font-semibold rounded-full hover:opacity-90 transition"
        >
          Crear mi carnet gratis
        </Link>
        <Link href="/sign-in" className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition">
          Ya tengo cuenta →
        </Link>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-16 max-w-4xl mx-auto w-full z-10">
        {[
          {
            title: "Emergencia médica",
            desc: "Datos críticos visibles al instante para socorristas. Sin login.",
            icon: <svg className="w-7 h-7 text-[#1FD1B8]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          },
          {
            title: "QR instantáneo",
            desc: "Genera tu código QR con un toque. Compártelo con médicos o familiares.",
            icon: <svg className="w-7 h-7 text-[#1FD1B8]" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zm6 10v6h-6v-2h4v-4h2zm-10 6H4v-6h2v4h4v2z"/></svg>
          },
          {
            title: "Siempre disponible",
            desc: "En la nube y offline. Tu información donde la necesites, cuando la necesites.",
            icon: <svg className="w-7 h-7 text-[#1FD1B8]" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
          },
        ].map((f) => (
          <div key={f.title} className="glass p-5">
            <div className="mb-3">{f.icon}</div>
            <div className="font-semibold mb-1">{f.title}</div>
            <div className="text-sm text-gray-400">{f.desc}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
