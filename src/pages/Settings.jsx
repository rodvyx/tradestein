import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { LogOut, Camera, CreditCard } from "lucide-react";
import DataBackup from "../components/DataBackup";
import { useToast } from "../components/ui/ToastProvider";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user;
      setUser(u);

      if (u) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, bio, avatar_url")
          .eq("id", u.id)
          .single();

        if (profile) {
          setUsername(profile.username || "");
          setBio(profile.bio || "");
          setAvatarUrl(profile.avatar_url || "");
        }
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const updates = {
      id: user.id,
      username,
      bio,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      console.error("Error saving profile:", error.message);
      showToast("❌ Failed to save profile.", "error");
    } else {
      showToast("✅ Profile updated successfully!");
      localStorage.setItem("profile_cache", JSON.stringify(updates));
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const handleManageSubscription = () => {
    window.open("https://tradestein.lemonsqueezy.com/billing", "_blank");
  };

  return (
    <div className="relative min-h-screen bg-[#0B0C10] text-white flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/40 rounded-full"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -100],
              x: Math.sin(i) * 50,
            }}
            transition={{
              duration: 6 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-lg bg-[#0D1117]/70 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 flex items-center justify-center shadow-lg ring-1 ring-emerald-400/30">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="rounded-full h-24 w-24 object-cover"
                />
              ) : (
                <span className="text-5xl">👤</span>
              )}
            </div>
            <button
              className="absolute bottom-2 right-2 bg-emerald-500 text-black p-2 rounded-full hover:bg-emerald-400 transition"
              title="Change avatar"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              className="w-full bg-[#10151C] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <textarea
              className="w-full bg-[#10151C] border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Plans & Access Section */}
          <div className="mt-6 border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-3">
              Plans & Access
            </h2>
            <button
              onClick={handleManageSubscription}
              className="flex items-center justify-center gap-2 bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all w-full"
            >
              <CreditCard size={18} />
              Manage Subscription
            </button>
          </div>

          {/* Save / Logout */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </motion.div>

      {user && <DataBackup userId={user.id} />}
    </div>
  );
}
