"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoMark from "@/components/LogoMark";
import LockScreen from "@/components/LockScreen";
import BottomNav from "@/components/BottomNav";
import SOSButton from "@/components/SOSButton";
import InstallPrompt from "@/components/InstallPrompt";
import PageTransition from "@/components/PageTransition";

type Stage = "splash" | "lock" | "app";

export default function AppGate({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>("splash");

  useEffect(() => {
    const t = setTimeout(() => setStage("lock"), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>
        {stage === "splash" && (
          <motion.div
            key="splash"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.95, 0.55] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-[60vw] h-[60vw] max-w-[420px] max-h-[420px] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(31,209,184,0.45) 0%, rgba(31,209,184,0) 70%)" }}
            />
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative w-28 h-28"
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <LogoMark className="w-full h-full drop-shadow-[0_0_24px_rgba(31,209,184,0.55)]" />
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative mt-6 text-lg font-semibold tracking-wider text-[#F3FFFC]"
            >
              IDENTY<span className="text-accent">-KIT</span>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "lock" && <LockScreen onUnlock={() => setStage("app")} />}

      <div style={{ visibility: stage === "app" ? "visible" : "hidden" }}>
        <div className="halo" />
        <div className="relative z-10 pb-16">
          <PageTransition>{children}</PageTransition>
        </div>
        {stage === "app" && <SOSButton />}
        {stage === "app" && <InstallPrompt />}
        <BottomNav />
      </div>
    </>
  );
}
