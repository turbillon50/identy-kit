"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertIcon, PhoneIcon } from "@/components/icons-extra";

const CONTACTO_PRIORITARIO = { nombre: "Luis Tun (padre)", tel: "+529982345678" };

export default function SOSButton() {
  const [open, setOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  function handleSOS() {
    setSharing(true);

    const finish = (mapsLink?: string) => {
      const msg = mapsLink
        ? `Emergencia: necesito ayuda. Mi ubicacion: ${mapsLink}`
        : "Emergencia: necesito ayuda, no pude compartir ubicacion.";
      if (navigator.share) {
        navigator.share({ title: "SOS Identy-Kit", text: msg }).catch(() => {});
      }
      window.location.href = `tel:${CONTACTO_PRIORITARIO.tel}`;
      setSharing(false);
      setOpen(false);
    };

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          finish(`https://maps.google.com/?q=${latitude},${longitude}`);
        },
        () => finish(),
        { timeout: 4000 }
      );
    } else {
      finish();
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        animate={{ boxShadow: ["0 0 0px rgba(239,68,68,0.5)", "0 0 22px rgba(239,68,68,0.6)", "0 0 0px rgba(239,68,68,0.5)"] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="fixed right-4 bottom-20 z-30 w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm"
      >
        SOS
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 flex items-end justify-center"
            onClick={() => !sharing && setOpen(false)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              transition={{ type: "spring", damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md mx-4 mb-6 p-5"
            >
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <AlertIcon className="w-5 h-5" />
                <p className="font-semibold">Activar SOS</p>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Se compartirá tu ubicación y se llamará de inmediato a {CONTACTO_PRIORITARIO.nombre}.
              </p>
              <button
                onClick={handleSOS}
                disabled={sharing}
                className="w-full py-3 rounded-xl bg-red-600 flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
              >
                <PhoneIcon className="w-4 h-4" />
                {sharing ? "Enviando ubicación…" : "Confirmar y llamar"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 mt-2 rounded-xl text-gray-400 text-sm"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
