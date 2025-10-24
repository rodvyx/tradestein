import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesBg from "../components/ParticlesBg";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BarChart3,
  LineChart,
} from "lucide-react";

export default function Replay() {
  const [trades, setTrades] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // ✅ Fetch user's trades
  useEffect(() => {
    const fetchTrades = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("date", { ascending: true });

      if (error) console.error("Error fetching trades:", error);
      else setTrades(data || []);
      setLoading(false);
    };

    fetchTrades();
  }, []);

  // 🎬 Auto play
  useEffect(() => {
    if (playing && trades.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % trades.length);
      }, 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, trades]);

  const currentTrade = trades[current];

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#0A0A0B] text-white">
        <ParticlesBg />
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-emerald-400">Loading trades...</h1>
          <div className="border-4 border-emerald-400/30 border-t-emerald-400 rounded-full h-10 w-10 mx-auto animate-spin" />
        </div>
      </div>
    );
  }

  if (!trades.length) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A0A0B] text-gray-400">
        <ParticlesBg />
        <h2 className="text-2xl font-semibold text-emerald-400 mb-3">
          No Trades Found
        </h2>
        <p>Add some trades in your Journal to replay them here.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white overflow-hidden flex flex-col items-center justify-center p-6">
      <ParticlesBg />

      <motion.h1
        className="text-4xl font-bold text-emerald-400 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Trade Replay Mode
      </motion.h1>

      <div className="relative z-10 w-full max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrade?.id}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -30 }}
            transition={{ duration: 0.6 }}
            className="bg-[#101418]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          >
            <h2 className="text-2xl font-semibold mb-2 text-center text-emerald-400">
              {currentTrade.ticker}
            </h2>
            <p className="text-gray-400 text-center mb-4">
              {new Date(currentTrade.date).toDateString()}
            </p>

            {/* 🔢 Trade Stats */}
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-gray-400 text-sm">P&L</p>
                <p
                  className={`font-bold ${
                    currentTrade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  ${Number(currentTrade.pnl).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">R:R</p>
                <p className="font-bold text-emerald-400">
                  {currentTrade.final_rr ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Emotion</p>
                <p className="font-bold text-yellow-400">
                  {currentTrade.emotions || "—"}
                </p>
              </div>
            </div>

            {/* 📊 Mini Charts */}
            {(currentTrade.entry_chart || currentTrade.htf_chart) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
              >
                {currentTrade.entry_chart && (
                  <div className="relative bg-[#0b0e13]/60 rounded-xl border border-white/10 overflow-hidden">
                    <div className="absolute top-2 left-3 flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <LineChart className="h-3 w-3" /> Entry Chart
                    </div>
                    <img
                      src={currentTrade.entry_chart}
                      alt="Entry Chart"
                      className="rounded-xl w-full h-48 object-cover"
                    />
                  </div>
                )}
                {currentTrade.htf_chart && (
                  <div className="relative bg-[#0b0e13]/60 rounded-xl border border-white/10 overflow-hidden">
                    <div className="absolute top-2 left-3 flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                      <BarChart3 className="h-3 w-3" /> HTF Chart
                    </div>
                    <img
                      src={currentTrade.htf_chart}
                      alt="HTF Chart"
                      className="rounded-xl w-full h-48 object-cover"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* 🧠 Trade Notes */}
            <div className="bg-[#0b0e13]/60 p-4 rounded-xl border border-white/5 text-sm text-gray-300 leading-relaxed">
              <p>
                <strong className="text-emerald-400">Done Right:</strong>{" "}
                {currentTrade.done_right || "—"}
              </p>
              <p>
                <strong className="text-red-400">Done Wrong:</strong>{" "}
                {currentTrade.done_wrong || "—"}
              </p>
              <p>
                <strong className="text-yellow-400">Improve:</strong>{" "}
                {currentTrade.what_to_improve || "—"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 🎛️ Controls */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={() =>
              setCurrent((prev) => (prev === 0 ? trades.length - 1 : prev - 1))
            }
            className="p-3 bg-[#0d1218]/80 rounded-full hover:bg-emerald-500/20 transition"
          >
            <SkipBack className="h-6 w-6 text-emerald-400" />
          </button>

          <button
            onClick={() => setPlaying(!playing)}
            className="p-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full transition"
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>

          <button
            onClick={() => setCurrent((prev) => (prev + 1) % trades.length)}
            className="p-3 bg-[#0d1218]/80 rounded-full hover:bg-emerald-500/20 transition"
          >
            <SkipForward className="h-6 w-6 text-emerald-400" />
          </button>
        </div>

        <p className="text-gray-500 text-center mt-3 text-sm">
          {current + 1} / {trades.length} trades
        </p>
      </div>
    </div>
  );
}
