import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { User, X } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [streakDays, setStreakDays] = useState(6);
  const [maxStreak, setMaxStreak] = useState(7);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      setUser(auth.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url, created_at")
        .eq("id", auth.user.id)
        .single();

      setProfile(profileData || {});
    };
    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-start pt-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md bg-[#0D1117]/70 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 flex items-center justify-center ring-2 ring-emerald-500/40">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="rounded-full h-24 w-24 object-cover"
              />
            ) : (
              <User size={40} className="text-emerald-400" />
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4 text-emerald-400">
            {profile.username || "Trader"}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {profile.bio || "Focused and growing 📈"}
          </p>
        </div>

        <div className="mt-8 bg-[#10151C]/70 p-5 rounded-2xl border border-white/10 text-center">
          <h3 className="text-gray-300 font-semibold mb-2">Daily Streak</h3>
          <div className="flex justify-center gap-3 mb-3">
            <StatCard label="Current Streak" value={`${streakDays} Days`} />
            <StatCard label="Max Streak" value={`${maxStreak} Days`} />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-emerald-400 text-sm hover:underline"
          >
            See More
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#0D1117]/90 border border-white/10 rounded-3xl p-6 max-w-md w-full relative shadow-[0_0_40px_rgba(16,185,129,0.2)]"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-xl font-semibold text-emerald-400 mb-3">
                Your Current Streak is {streakDays} Days
              </h2>

              <div className="grid grid-cols-7 gap-1">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${
                      i < streakDays ? "bg-emerald-400/80" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-400 text-xs text-center mt-4">
                Keep your consistency strong — every trade counts 🔥
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-[#10151C] px-3 py-2 rounded-xl border border-white/10">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}
