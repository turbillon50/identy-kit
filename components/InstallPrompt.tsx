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
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(30,99,208,0.1)", color: "var(--accent)" }}
          >
            <DownloadIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Instala Identy-Kit</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Acceso directo, funciona sin internet</p>
          </div>
          <button onClick={install} className="text-sm font-semibold shrink-0" style={{ color: "var(--accent)" }}>Instalar</button>
          <button onClick={() => setVisible(false)} className="text-sm shrink-0" style={{ color: "var(--text-secondary)" }}>×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
