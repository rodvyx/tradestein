import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import NeonLoader from "../components/ui/NeonLoader";
import ParticlesBg from "../components/ParticlesBg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setMessage("✅ Password updated successfully! Redirecting to login...");
      await supabase.auth.signOut();

      setRedirecting(true);
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌈 Neon loader for transitions
  if (loading || redirecting) {
    return (
      <NeonLoader
        text={redirecting ? "Redirecting to login..." : "Updating password..."}
      />
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white overflow-hidden">
      <ParticlesBg />

      {/* 💫 Password Reset Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#0D1117]/80 backdrop-blur-2xl border border-emerald-500/20 
          rounded-2xl p-8 w-[90%] max-w-md text-center shadow-[0_0_40px_rgba(16,185,129,0.15)]"
      >
        <h1 className="text-3xl font-bold text-emerald-400 mb-6">
          Reset Password
        </h1>

        <form onSubmit={handlePasswordReset} className="space-y-5">
          <div className="text-left">
            <label className="text-sm text-gray-400 mb-2 block">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#10151C] border border-emerald-400/30 
                rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-gray-500"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-purple-500 
              hover:from-emerald-400 hover:to-purple-400 text-black font-semibold py-2 
              rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>

        {/* 🔔 Message + Fallback Login Button */}
        {message && (
          <div className="mt-6">
            <p className="text-sm text-gray-300 mb-3">{message}</p>

            {!redirecting && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/auth")}
                className="px-5 py-2 bg-transparent border border-emerald-400/40 
                  rounded-lg text-emerald-400 hover:bg-emerald-500 hover:text-black 
                  transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              >
                Return to Login
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
