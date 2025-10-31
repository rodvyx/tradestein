import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCcw, LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ParticlesBg from "../components/ParticlesBg";
import NeonLoader from "../components/ui/NeonLoader";

export default function Cancelled() {
  const [renewing, setRenewing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ Handle logout
  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setTimeout(() => {
      window.location.href = "/auth";
    }, 1200);
  };

  // ✅ Handle subscription renewal
  const handleRenew = () => {
    setRenewing(true);
    setTimeout(() => {
      window.location.href =
        "https://tradestein.lemonsqueezy.com/buy/9150a66d-7fb8-4438-96bc-84e6fd350d59";
    }, 1200);
  };

  // ✅ Loading states (NeonLoader for smooth UX)
  if (renewing)
    return <NeonLoader text="Redirecting to secure payment..." />;
  if (loggingOut)
    return <NeonLoader text="Logging you out..." />;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A0A0B] overflow-hidden text-white">
      <ParticlesBg />

      {/* Subtle glow background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-md w-full text-center px-6 py-10 bg-[#0f141b]/80 backdrop-blur-xl rounded-3xl border border-emerald-400/10 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-400/20">
            <AlertTriangle className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-emerald-400">
          Subscription Expired
        </h1>
        <p className="text-white/70 text-sm mb-8 leading-relaxed">
          Your subscription has ended. To continue using your trading journal,
          analytics, and goal tracking tools, please renew your membership below.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRenew}
            className="flex items-center justify-center gap-2 bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-2.5 rounded-xl shadow-lg"
          >
            <RefreshCcw size={18} />
            Renew Subscription
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium px-6 py-2.5 rounded-xl"
          >
            <LogOut size={18} />
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* Footer note */}
      <p className="absolute bottom-6 text-xs text-white/40">
        © {new Date().getFullYear()} Tradestein — Empowering Traders with Discipline
      </p>
    </div>
  );
}
