import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Landing({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [bootStage, setBootStage] = useState(0); // 0 = init message, 1 = tradestein logo

  useEffect(() => {
    // Stage 1 → Stage 2 (morph text)
    const stageTimer = setTimeout(() => setBootStage(1), 2000);

    // Fade out + transition to auth
    const fadeTimer = setTimeout(() => setFadeOut(true), 3800);
    const finishTimer = setTimeout(() => onFinish(), 4500);

    return () => {
      clearTimeout(stageTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="landing"
        initial={{ opacity: 1 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col items-center justify-center h-screen bg-[#0A0A0B] overflow-hidden text-center"
      >
        {/* 🌌 Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
              initial={{
                opacity: Math.random(),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 6 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* 💚 Glowing Pulse Core */}
        <motion.div
          className="w-64 h-64 rounded-full bg-black relative"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: [0.6, 1.05, 1],
            opacity: [0, 1, 1],
          }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-500/25 blur-[90px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.8, 0.5],
              boxShadow: [
                "0 0 60px #10b981",
                "0 0 120px #10b981",
                "0 0 80px #10b981",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* 🧠 Animated Text Sequence */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{
            opacity: [0, 1],
            scale: [0.95, 1],
            y: [15, 0],
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute text-center z-20"
        >
          {bootStage === 0 ? (
            <motion.h1
              key="init"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="text-sm tracking-[0.25em] text-gray-400"
            >
              INITIALIZING MARKET SYSTEMS...
            </motion.h1>
          ) : (
            <motion.div
              key="tradestein"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
            >
              <motion.h1
                className="text-4xl md:text-5xl font-extrabold tracking-wider text-transparent bg-clip-text 
                           bg-gradient-to-r from-emerald-400 to-purple-500 drop-shadow-[0_0_25px_#10b981]"
                animate={{
                  textShadow: [
                    "0 0 10px #10b981",
                    "0 0 20px #a855f7",
                    "0 0 10px #10b981",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                TRADESTEIN
              </motion.h1>

              <motion.p
                className="mt-2 text-xs tracking-[0.25em] text-gray-400"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                SYSTEM 2.0
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
