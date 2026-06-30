"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadIcon } from "@/components/icons-extra";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-30 glass p-3 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-[rgba(31,209,184,0.15)] flex items-center justify-center text-accent shrink-0">
            <DownloadIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Instala Identy-Kit</p>
            <p className="text-xs text-gray-400">Acceso directo, funciona sin internet</p>
          </div>
          <button onClick={install} className="text-accent text-sm font-semibold shrink-0">Instalar</button>
          <button onClick={() => setVisible(false)} className="text-gray-500 text-sm shrink-0">×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
