import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Password updated successfully! Please log in again.");
      await supabase.auth.signOut();
      setTimeout(() => (window.location.href = "/auth"), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">
      <div className="bg-[#0D1117] border border-emerald-400/20 rounded-xl p-8 w-[90%] max-w-md shadow-[0_0_25px_rgba(16,185,129,0.15)]">
        <h1 className="text-2xl font-bold text-center text-emerald-400 mb-6">
          Reset Password
        </h1>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 bg-[#10151C] rounded-xl border border-emerald-400/30 
              focus:ring-2 focus:ring-emerald-500 outline-none text-white"
          />
          <button
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2 
              rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        {message && (
          <p className="text-center text-sm text-gray-300 mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}
