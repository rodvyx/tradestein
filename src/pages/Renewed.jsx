import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import NeonLoader from "../components/ui/NeonLoader";
import ParticlesBg from "../components/ParticlesBg";

export default function Renewed() {
  // ✅ Automatically redirect to dashboard after animation
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A0A0B] overflow-hidden text-white">
      <ParticlesBg />

      {/* Subtle glowing background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 to-transparent blur-3xl" />

      {/* Animated success badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-md px-6 py-10 bg-[#0f141b]/80 backdrop-blur-xl rounded-3xl border border-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-400/20">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-emerald-400">
          Subscription Reactivated
        </h1>
        <p className="text-white/70 text-sm mb-6 leading-relaxed">
          Welcome back, Trader! Your access has been restored and your account is
          now fully active. Redirecting you to your dashboard...
        </p>

        {/* Optional spinner loader */}
        <NeonLoader text="Loading your dashboard..." />
      </motion.div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs text-white/40">
        © {new Date().getFullYear()} Tradestein — Welcome back to discipline
      </p>
    </div>
  );
}
