import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Star,
  User,
  Calendar,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [stats, setStats] = useState({ total: 0, wins: 0, rr: 0 });
  const [equityData, setEquityData] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const { data: trades } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", auth.user.id);

      if (trades && trades.length > 0) {
        const total = trades.length;
        const wins = trades.filter((t) => Number(t.pnl) > 0).length;
        const rrSum = trades.reduce(
          (a, t) => a + (Number(t.final_rr) || 0),
          0
        );
        const rr = (rrSum / total).toFixed(2);

        const cumulative = [];
        let balance = 0;
        trades
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .forEach((t) => {
            balance += Number(t.pnl) || 0;
            cumulative.push({ date: t.date, equity: balance });
          });

        setStats({ total, wins, rr });
        setEquityData(cumulative);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const winRate =
    stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0;

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading profile...
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-start pt-12 overflow-hidden">
      {/* ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -100],
              x: Math.sin(i) * 50,
            }}
            transition={{
              duration: 8 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.3,
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
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-3xl bg-[#0D1117]/70 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
      >
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500/40 to-emerald-700/20 flex items-center justify-center shadow-lg ring-2 ring-emerald-500/40">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="rounded-full h-28 w-28 object-cover"
                />
              ) : (
                <User size={50} className="text-emerald-400" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-4 text-emerald-400">
            {profile.username || "Trader"}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {profile.bio || "Focused on consistency and growth 📈"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Joined{" "}
            {new Date(profile.created_at || Date.now()).toDateString()}
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 text-center mt-8">
          <StatCard
            icon={<Trophy className="text-yellow-400" size={22} />}
            label="Win Rate"
            value={`${winRate}%`}
          />
          <StatCard
            icon={
              Number(stats.rr) >= 1 ? (
                <TrendingUp className="text-emerald-400" size={22} />
              ) : (
                <TrendingDown className="text-red-400" size={22} />
              )
            }
            label="Avg R:R"
            value={stats.rr}
          />
          <StatCard
            icon={<Star className="text-cyan-400" size={22} />}
            label="Total Trades"
            value={stats.total}
          />
        </div>

        {/* Equity Curve */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3 text-emerald-400">
            Equity Curve
          </h3>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10">
            {equityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={equityData}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(17,17,17,0.8)",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#10b981" }}
                    formatter={(value) => [`$${value}`, "Equity"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm text-center py-10">
                No trade history yet.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <motion.div
      className="bg-[#10151C]/70 border border-white/10 rounded-xl p-4 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.05)]"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex flex-col items-center justify-center">
        {icon}
        <p className="text-gray-400 text-sm mt-2">{label}</p>
        <p className="text-lg font-bold mt-1 text-white">{value}</p>
      </div>
    </motion.div>
  );
}
