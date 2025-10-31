import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ParticlesBg from "../components/ParticlesBg";
import NeonLoader from "../components/ui/NeonLoader";

export default function Subscribed() {
  const navigate = useNavigate();

  // ⏱️ Auto-redirect to dashboard after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard", {
        replace: true,
        state: { showRenewalBanner: true }, // 👈 Pass one-time flag
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A0A0B] overflow-hidden text-white">
      <ParticlesBg />

      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/10 to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 max-w-md w-full text-center px-6 py-10 bg-[#0f141b]/80 backdrop-blur-xl rounded-3xl border border-emerald-400/10 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-4 rounded-full bg-emerald-500/10 border border-emerald-400/20"
          >
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </motion.div>
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-emerald-400">
          Subscription Activated
        </h1>
        <p className="text-white/70 text-sm mb-8 leading-relaxed">
          Your Tradestein Pro membership is now active. You’ll be redirected to
          your dashboard automatically in a few seconds.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            navigate("/dashboard", { state: { showRenewalBanner: true } })
          }
          className="bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold px-6 py-2.5 rounded-xl shadow-lg"
        >
          Go to Dashboard
        </motion.button>
      </motion.div>

      <p className="absolute bottom-6 text-xs text-white/40">
        © {new Date().getFullYear()} Tradestein — Empowering Traders with Discipline
      </p>
    </div>
  );
}
