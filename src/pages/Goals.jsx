import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { PlusCircle, Calendar, Target, Award, TrendingUp, RefreshCcw } from "lucide-react";
import confetti from "canvas-confetti";
import ParticlesBg from "../components/ParticlesBg";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState("");
  const [sortBy, setSortBy] = useState("deadline");

  const quotes = [
    "Discipline equals freedom.",
    "Progress is built one percent at a time.",
    "Focus on consistency, not perfection.",
    "You’re closer than you think.",
    "Small wins make big waves.",
  ];

  // Rotate quotes automatically
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    const interval = setInterval(() => {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch goals
  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", auth.user.id)
      .order(sortBy === "deadline" ? "deadline" : "progress", { ascending: true });
    if (!error) setGoals(data || []);
  };

  // Add goal
  const addGoal = async () => {
    if (!title) return alert("Please enter a goal title.");
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return alert("Please sign in.");

    const { error } = await supabase.from("goals").insert([
      {
        user_id: auth.user.id,
        title,
        description,
        progress,
        deadline,
      },
    ]);

    setLoading(false);
    if (error) {
      alert("Failed to add goal");
      console.error(error);
    } else {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      setTitle("");
      setDescription("");
      setDeadline("");
      setProgress(0);
      fetchGoals();
    }
  };

  // Update progress
  const updateProgress = async (id, newProgress) => {
    const { error } = await supabase
      .from("goals")
      .update({
        progress: newProgress,
        completed: newProgress >= 100,
      })
      .eq("id", id);

    if (!error) {
      if (newProgress >= 100) {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      }
      fetchGoals();
    }
  };

  // Delete goal
  const deleteGoal = async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (!error) fetchGoals();
  };

  // Stats
  const total = goals.length;
  const completed = goals.filter((g) => g.completed).length;
  const avgProgress =
    total > 0 ? Math.round(goals.reduce((a, b) => a + b.progress, 0) / total) : 0;

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white px-5 py-8 flex flex-col items-center">
      <ParticlesBg />

      {/* Header */}
      <motion.h1
        className="text-3xl font-bold text-emerald-400 mb-6 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Target className="text-emerald-400" /> Goals Tracker
      </motion.h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
        <StatCard icon={<Award />} label="Total Goals" value={total} />
        <StatCard icon={<TrendingUp />} label="Completed" value={completed} />
        <StatCard icon={<RefreshCcw />} label="Avg Progress" value={`${avgProgress}%`} />
      </div>

      {/* Add Goal Form */}
      <motion.div
        className="bg-[#101418]/90 w-full max-w-3xl rounded-2xl border border-emerald-400/10 p-6 backdrop-blur-lg shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          <PlusCircle className="text-emerald-400" /> Add New Goal
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 rounded-xl bg-[#0A0A0B] border border-white/10 focus:border-emerald-400 outline-none"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="p-3 rounded-xl bg-[#0A0A0B] border border-white/10 focus:border-emerald-400 outline-none"
          />
        </div>

        <textarea
          placeholder="Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 rounded-xl bg-[#0A0A0B] border border-white/10 focus:border-emerald-400 outline-none mb-3"
        />

        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            placeholder="Progress %"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="p-3 w-24 rounded-xl bg-[#0A0A0B] border border-white/10 focus:border-emerald-400 outline-none"
          />
          <span className="text-sm text-gray-400">Progress %</span>
        </div>

        <button
          onClick={addGoal}
          disabled={loading}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition"
        >
          {loading ? "Adding..." : "Add Goal"}
        </button>
      </motion.div>

      {/* Sort Controls */}
      <div className="flex justify-between items-center w-full max-w-3xl mt-8 mb-4">
        <h2 className="text-lg font-semibold text-emerald-400">My Goals</h2>
        <select
          className="bg-[#101418]/90 border border-emerald-400/20 rounded-lg px-3 py-1 text-sm text-gray-300"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="deadline">Sort by Deadline</option>
          <option value="progress">Sort by Progress</option>
        </select>
      </div>

      {/* Goals List */}
      <div className="grid gap-4 w-full max-w-3xl mb-20">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            className="bg-[#0d1218]/80 border border-white/5 p-5 rounded-2xl relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-emerald-400">{goal.title}</h3>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-gray-500 hover:text-red-400 transition"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-3">{goal.description}</p>
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-emerald-400" />
              {goal.deadline || "No deadline"}
            </p>

            {/* Progress Ring */}
            <div className="flex items-center gap-3">
              <ProgressRing
                progress={goal.progress}
                onClick={() =>
                  updateProgress(goal.id, Math.min(goal.progress + 10, 100))
                }
              />
              <p className="text-sm text-gray-400">
                Click ring to increase progress → {goal.progress}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <motion.p
        className="text-center text-emerald-400/80 italic text-sm mt-auto pb-10"
        key={quote}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        “{quote}”
      </motion.p>
    </div>
  );
}

// 🔵 Small component for stats
function StatCard({ icon, label, value }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center bg-[#101418]/70 border border-white/10 rounded-2xl p-5 shadow-[0_0_25px_rgba(16,185,129,0.05)]"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-emerald-400 mb-1">{icon}</div>
      <h3 className="text-xl font-bold text-white">{value}</h3>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}

// 🟢 Fancy animated progress ring
function ProgressRing({ progress, onClick }) {
  const strokeWidth = 6;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      onClick={onClick}
      className="w-14 h-14 cursor-pointer"
      viewBox="0 0 50 50"
    >
      <circle
        className="text-gray-700"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx="25"
        cy="25"
      />
      <motion.circle
        className="text-emerald-400"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx="25"
        cy="25"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
      <text
        x="50%"
        y="52%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="text-[10px] fill-emerald-400 font-semibold"
      >
        {progress}%
      </text>
    </svg>
  );
}
