import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import NeonLoader from "../components/ui/NeonLoader";
import ParticlesBg from "../components/ParticlesBg";

export default function Verified() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // checking | success | error
  const [showPulse, setShowPulse] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      console.log("📬 Verified page opened, current hash:", window.location.hash);

      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace("#", "?"));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      try {
        if (access_token && refresh_token) {
          console.log("🔑 Found tokens, setting session...");
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
        } else {
          console.warn("⚠️ No tokens in URL. Assuming verified link without session.");
        }

        // Fetch user (optional, just to confirm)
        const { data } = await supabase.auth.getUser();

        if (data?.user) {
          console.log("✅ Verified user:", data.user.email);
          // Optional: sign out immediately after verification
          await supabase.auth.signOut();
        }

        setTimeout(() => setStatus("success"), 600);
      } catch (err) {
        console.error("❌ Verification error:", err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, []);

  // ✅ Neon loader while verifying or redirecting
  if (status === "checking" || redirecting) {
    return (
      <NeonLoader
        text={
          redirecting
            ? import.meta.env.DEV
              ? "Returning to Auth..."
              : "Redirecting to Dashboard..."
            : "Verifying your email..."
        }
      />
    );
  }

  // ❌ Error state
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0B] text-center text-gray-300 px-4">
        <h1 className="text-2xl font-semibold text-red-500 mb-2">
          Verification Failed
        </h1>
        <p className="text-sm text-gray-400 mb-6 max-w-sm">
          The verification link may have expired or is invalid. Please try signing in again.
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-all shadow-[0_0_10px_#10b981]"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // ✅ Success state (even without token)
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-[#0A0A0B] overflow-hidden text-center px-4">
      <ParticlesBg />

      {/* 💥 Neon Pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1],
          opacity: [0, 1, 0.4],
          boxShadow: [
            "0 0 0px #10b981",
            "0 0 80px #10b981",
            "0 0 0px #a855f7",
          ],
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        onAnimationComplete={() => setShowPulse(false)}
        className="absolute w-64 h-64 rounded-full bg-transparent border-4 border-emerald-500 blur-3xl"
      />

      {/* 🎉 Confetti */}
      {!showPulse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(40)].map((_, i) => {
            const isEmerald = Math.random() > 0.5;
            const color = isEmerald ? "#10b981" : "#a855f7";
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}`,
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 600,
                  y: (Math.random() - 0.5) * 600,
                  opacity: 0,
                  scale: 0.5,
                }}
                transition={{
                  duration: 2.2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
              />
            );
          })}
        </motion.div>
      )}

      {/* ✅ Success Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showPulse ? 0 : 1, y: showPulse ? 20 : 0 }}
        transition={{ duration: 0.6, delay: showPulse ? 1.2 : 0 }}
        className="bg-[#111113]/80 backdrop-blur-lg border border-emerald-500/50 rounded-2xl shadow-[0_0_25px_#10b981] p-8 max-w-md w-full relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 12,
            delay: 1.2,
          }}
          className="text-5xl mb-4"
        >
          ✅
        </motion.div>
        <h1 className="text-2xl font-semibold text-emerald-400 mb-2">
          Email Verified Successfully
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Your account is now active. You can continue to your dashboard.
        </p>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: [
              "0 0 10px #10b981",
              "0 0 20px #10b981",
              "0 0 10px #10b981",
            ],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          onClick={() => {
            setRedirecting(true);
            setTimeout(() => {
              import.meta.env.DEV ? navigate("/auth") : navigate("/dashboard");
            }, 1000);
          }}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-400 hover:to-emerald-400 rounded-lg text-white font-medium transition-all shadow-[0_0_10px_#10b981]"
        >
          {import.meta.env.DEV ? "Return to Auth" : "Go to Dashboard"}
        </motion.button>
      </motion.div>
    </div>
  );
}
