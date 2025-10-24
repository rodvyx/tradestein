import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Handle Login / Sign Up
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("✅ Logged in successfully!");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("✅ Check your email to confirm your account!");
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
    setLoading(false);
  };

  // ✅ Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("⚠️ Please enter your email before resetting your password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password", // 👈 key redirect
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("📨 Password reset link sent! Check your inbox.");
    }

    setLoading(false);
  };

  // ✅ Handle Google Login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) alert("Google login failed: " + error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white relative overflow-hidden">
      {/* ✨ Ambient particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, -100], x: Math.sin(i) * 60 }}
            transition={{ duration: 6 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 🌌 Auth Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 bg-[#0D1117]/80 backdrop-blur-2xl border border-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.15)] 
        rounded-2xl p-8 w-[90%] max-w-md flex flex-col items-center"
      >
        <h1 className="text-3xl font-bold text-emerald-400 mb-6">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <form onSubmit={handleAuth} className="w-full space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#10151C] border border-emerald-400/30 rounded-xl px-4 py-2 
              focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-gray-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="text-sm text-gray-400 mb-1 flex items-center gap-2">
              <Lock size={16} /> Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#10151C] border border-emerald-400/30 rounded-xl px-4 py-2 
              focus:ring-2 focus:ring-emerald-500 outline-none text-white placeholder-gray-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-emerald-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 
            rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition"
          >
            {loading
              ? "Processing..."
              : isLogin
              ? "Sign In"
              : "Sign Up"}
          </motion.button>
        </form>

        {/* Forgot Password (only for login) */}
        {isLogin && (
          <button
            onClick={handleForgotPassword}
            className="mt-2 text-sm text-emerald-400 hover:underline"
          >
            Forgot password?
          </button>
        )}

        {/* Google Sign-In */}
        <div className="mt-5 w-full">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 
            rounded-xl py-2 font-medium hover:bg-gray-100 transition shadow"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Sign in with Google
          </button>
        </div>

        {/* Switch Mode (Login / Sign Up) */}
        <p className="text-sm text-gray-400 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

        {/* Status Message */}
        {message && (
          <p className="mt-4 text-sm text-center text-gray-300">{message}</p>
        )}
      </motion.div>
    </div>
  );
}
