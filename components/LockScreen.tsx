"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LogoMark from "@/components/LogoMark";
import { FingerprintIcon, AlertIcon } from "@/components/icons-extra";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [checking, setChecking] = useState(false);

  async function handleUnlock() {
    setChecking(true);
    try {
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        // Plataforma soporta biometria (Face ID / huella) via WebAuthn.
        // Aqui se dispararia navigator.credentials.get(...) con el reto real del backend.
      }
    } catch {
      // sin soporte o cancelado, seguimos con fallback visual
    }
    setTimeout(() => {
      setChecking(false);
      onUnlock();
    }, 900);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-between bg-bg px-6 py-10">
      <div className="halo" />

      <div className="relative z-10 w-full flex flex-col items-center pt-6">
        <div className="w-16 h-16 mb-3">
          <LogoMark className="w-full h-full" />
        </div>
        <p className="text-sm text-gray-400">Carnet protegido de</p>
        <h1 className="text-xl font-semibold text-[#F3FFFC]">Marisol Tun</h1>
      </div>

      <div className="relative z-10 w-full glass p-4 border border-red-500/30">
        <div className="flex items-center gap-2 mb-2 text-red-400">
          <AlertIcon className="w-4 h-4" />
          <p className="text-xs font-semibold tracking-wide">VISIBLE SIN DESBLOQUEAR · USO EN EMERGENCIA</p>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 rounded-xl bg-red-500/10 border border-red-500/30 p-3">
            <p className="text-[11px] text-red-300">Tipo de sangre</p>
            <p className="text-2xl font-bold text-red-200">O+</p>
          </div>
          <div className="flex-1 rounded-xl bg-red-500/10 border border-red-500/30 p-3">
            <p className="text-[11px] text-red-300">Alergias</p>
            <p className="text-sm font-medium text-red-200 leading-tight">Penicilina, mariscos</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.button
          onClick={handleUnlock}
          whileTap={{ scale: 0.92 }}
          className="w-20 h-20 rounded-full glass flex items-center justify-center text-accent"
        >
          <motion.div
            animate={checking ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, repeat: checking ? Infinity : 0 }}
          >
            <FingerprintIcon className="w-9 h-9" />
          </motion.div>
        </motion.button>
        <p className="text-sm text-gray-400">
          {checking ? "Verificando…" : "Toca para desbloquear con huella / Face ID"}
        </p>
      </div>
    </div>
  );
}
