import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
  LineChart, Line, ReferenceLine, PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Listbox } from "@headlessui/react";
import { ChevronUpDownIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabaseClient";

const COLORS = {
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  orange: "#f97316",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
};
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [filters, setFilters] = useState({ pair: "All", session: "All", weekday: "All" });
  const [trades, setTrades] = useState([]);

  // === Auto-detect system theme ===
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) return setTheme(stored);
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(systemDark ? "dark" : "light");
  }, []);

  // === Persist theme ===
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // === Supabase user ===
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    })();
  }, []);

  // === Fetch trades ===
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("trades").select("*").eq("user_id", user.id);
      setTrades(data || []);
    })();
  }, [user]);

  // === Helpers ===
  const sessionOf = (time) => {
    if (!time) return "Unknown";
    const [h] = time.split(":").map(Number);
    if (h >= 7 && h < 12) return "Morning";
    if (h >= 12 && h < 16) return "Midday";
    if (h >= 16 && h <= 23) return "Afternoon/NY";
    return "Overnight";
  };

  const allPairs = useMemo(
    () => Array.from(new Set(trades.map((t) => (t.ticker || "").toUpperCase()).filter(Boolean))),
    [trades]
  );

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const sess = sessionOf(t.entry_time);
      const wd = weekdays[new Date(t.date).getDay()];
      const pair = (t.ticker || "").toUpperCase();
      return (
        (filters.pair === "All" || pair === filters.pair) &&
        (filters.session === "All" || sess === filters.session) &&
        (filters.weekday === "All" || wd === filters.weekday)
      );
    });
  }, [trades, filters]);

  // === Stats ===
  const totalPnL = filtered.reduce((a, t) => a + (Number(t.pnl) || 0), 0);
  const wins = filtered.filter((t) => t.pnl > 0).length;
  const winRate = filtered.length ? (wins / filtered.length) * 100 : 0;
  const avgRR =
    filtered.length > 0
      ? filtered.reduce((a, t) => a + (Number(t.final_rr) || 0), 0) / filtered.length
      : 0;
  const byPair = {};
  filtered.forEach((t) => {
    const k = (t.ticker || "").toUpperCase();
    byPair[k] = (byPair[k] || 0) + (Number(t.pnl) || 0);
  });
  const bestPair = Object.entries(byPair).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  const weakestPair = Object.entries(byPair).sort((a, b) => a[1] - b[1])[0]?.[0] || "-";

  // === Chart Data ===
  const pnlByPair = Object.entries(byPair).map(([name, value]) => ({ name, value }));
  const pnlBySession = ["Morning", "Midday", "Afternoon/NY", "Overnight"].map((s) => ({
    name: s,
    value: filtered
      .filter((t) => sessionOf(t.entry_time) === s)
      .reduce((a, t) => a + (Number(t.pnl) || 0), 0),
  }));
  const pnlByWeekday = weekdays.map((d) => ({
    name: d,
    value: filtered
      .filter((t) => weekdays[new Date(t.date).getDay()] === d)
      .reduce((a, t) => a + (Number(t.pnl) || 0), 0),
  }));
  const equityCurve = filtered.map((t, i) => ({
    date: t.date,
    equity: filtered.slice(0, i + 1).reduce((a, x) => a + (Number(x.pnl) || 0), 0),
  }));

  // === Insights ===
  const bestDay = pnlByWeekday.sort((a, b) => b.value - a.value)[0];
  const avgWinSize = wins > 0 ? totalPnL / wins : 0;
  const consistencyScore = Math.min(100, Math.max(0, Math.round(winRate * 0.8 + avgRR * 5)));

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const gradient = [COLORS.violet, COLORS.cyan];

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Please log in to access analytics.
      </div>
    );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`min-h-screen px-4 sm:px-6 py-6 transition-colors duration-700 ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        {/* === Header === */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm opacity-70">{user.email}</p>
          </div>

          {/* Filters + Theme */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-3">
            <FilterDropdown
              label="Pair"
              options={["All", ...allPairs]}
              value={filters.pair}
              onChange={(v) => setFilters((f) => ({ ...f, pair: v }))}
              theme={theme}
            />
            <FilterDropdown
              label="Session"
              options={["All", "Morning", "Midday", "Afternoon/NY", "Overnight"]}
              value={filters.session}
              onChange={(v) => setFilters((f) => ({ ...f, session: v }))}
              theme={theme}
            />
            <FilterDropdown
              label="Weekday"
              options={["All", ...weekdays]}
              value={filters.weekday}
              onChange={(v) => setFilters((f) => ({ ...f, weekday: v }))}
              theme={theme}
            />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border hover:scale-105 transition"
              style={{
                background: theme === "dark" ? "rgba(255,255,255,0.08)" : "#fff",
                borderColor:
                  theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
              }}
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* === Summary Cards === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Stat title="Total PnL" value={`$${Math.abs(totalPnL).toFixed(2)}`} color={totalPnL >= 0 ? COLORS.green : COLORS.red} />
          <Stat title="Win Rate" value={`${winRate.toFixed(1)}%`} color={COLORS.cyan} />
          <Stat title="Average R:R" value={avgRR.toFixed(2)} color={COLORS.violet} />
          <Stat title="Best Pair" value={bestPair} color={COLORS.orange} />
        </div>
                {/* === Charts === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <BarChartCard title="PnL by Pair" data={pnlByPair} gradient={gradient} theme={theme} />
          <BarChartCard title="Performance by Session" data={pnlBySession} gradient={gradient} theme={theme} />
          <BarChartCard title="Performance by Weekday" data={pnlByWeekday} gradient={gradient} theme={theme} />
          <LineChartCard title="Equity Curve" data={equityCurve} stroke={gradient[0]} theme={theme} />
        </div>

        {/* === Bottom Section === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 pb-10">
          <WinLossChart wins={wins} total={filtered.length} theme={theme} />
          <InsightsCard
            bestDay={bestDay}
            avgWinSize={avgWinSize}
            weakestPair={weakestPair}
            bestPair={bestPair}
            score={consistencyScore}
            theme={theme}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ================================================================
// ✅ Subcomponents
function Stat({ title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-5 rounded-2xl shadow border backdrop-blur"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <p className="text-xs sm:text-sm text-gray-400">{title}</p>
      <h2 className="text-lg sm:text-2xl font-bold mt-1" style={{ color }}>
        {value}
      </h2>
    </motion.div>
  );
}

function FilterDropdown({ label, options, value, onChange, theme }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs opacity-70 mb-1">{label}</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative w-32 sm:w-36">
          <Listbox.Button
            className="w-full border rounded-xl px-3 py-2 text-left shadow-sm flex items-center justify-between"
            style={{
              background:
                theme === "dark" ? "rgba(255,255,255,0.05)" : "#fff",
              borderColor:
                theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            }}
          >
            <span className="truncate">{value}</span>
            <ChevronUpDownIcon className="h-4 w-4 opacity-70" />
          </Listbox.Button>
          <Listbox.Options
            className="absolute mt-1 w-full rounded-xl border shadow-lg z-10 max-h-60 overflow-auto"
            style={{
              background:
                theme === "dark" ? "rgba(20,24,33,0.95)" : "#fff",
              borderColor:
                theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
            }}
          >
            {options.map((opt, i) => (
              <Listbox.Option
                key={i}
                value={opt}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  value === opt
                    ? theme === "dark"
                      ? "bg-green-900 text-green-200"
                      : "bg-green-100 text-green-900"
                    : "hover:bg-green-50 dark:hover:bg-green-950"
                }`}
              >
                {opt}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}

function BarChartCard({ title, data, gradient, theme }) {
  return (
    <div
      className="p-4 sm:p-5 rounded-2xl border backdrop-blur shadow-lg"
      style={{
        background: theme === "dark" ? "rgba(21,25,34,0.7)" : "#fff",
        borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <defs>
            <linearGradient id={`grad-${slug(title)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradient[0]} stopOpacity={0.9} />
              <stop offset="100%" stopColor={gradient[1]} stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            vertical={false}
          />
          <XAxis dataKey="name" stroke={theme === "dark" ? "#9CA3AF" : "#4B5563"} />
          <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#4B5563"} />
          <Tooltip
            contentStyle={{
              background: theme === "dark" ? "rgba(17,24,39,0.9)" : "#f3f4f6",
              borderRadius: "8px",
              color: theme === "dark" ? "#e5e7eb" : "#111827",
              border: "none",
            }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar
            dataKey="value"
            fill={`url(#grad-${slug(title)})`}
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          >
            <LabelList
              dataKey="value"
              position="top"
              fill={theme === "dark" ? "#e5e7eb" : "#111827"}
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineChartCard({ title, data, stroke, theme }) {
  return (
    <div
      className="p-4 sm:p-5 rounded-2xl border backdrop-blur shadow-lg"
      style={{
        background: theme === "dark" ? "rgba(21,25,34,0.7)" : "#fff",
        borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid
            stroke={theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            vertical={false}
          />
          <XAxis dataKey="date" stroke={theme === "dark" ? "#9CA3AF" : "#4B5563"} />
          <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#4B5563"} />
          <Tooltip
            contentStyle={{
              background: theme === "dark" ? "rgba(17,24,39,0.9)" : "#f3f4f6",
              borderRadius: "8px",
              color: theme === "dark" ? "#e5e7eb" : "#111827",
              border: "none",
            }}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke={stroke}
            strokeWidth={3}
            dot={false}
            animationDuration={800}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function WinLossChart({ wins, total, theme }) {
  const data = [
    { name: "Wins", value: wins },
    { name: "Losses", value: total - wins },
  ];
  const COLORS = [theme === "dark" ? "#10b981" : "#16a34a", theme === "dark" ? "#ef4444" : "#dc2626"];

  return (
    <div
      className="p-4 sm:p-5 rounded-2xl border backdrop-blur shadow-lg"
      style={{
        background: theme === "dark" ? "rgba(21,25,34,0.7)" : "#fff",
        borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Win vs Loss</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: theme === "dark" ? "rgba(17,24,39,0.9)" : "#f3f4f6",
              borderRadius: "8px",
              border: "none",
              color: theme === "dark" ? "#e5e7eb" : "#111827",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: theme === "dark" ? "#9CA3AF" : "#4B5563" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function InsightsCard({ bestDay, avgWinSize, weakestPair, bestPair, score, theme }) {
  const ringColor = score > 70 ? "#10b981" : score > 40 ? "#facc15" : "#ef4444";

  return (
    <div
      className="p-4 sm:p-5 rounded-2xl border backdrop-blur shadow-lg flex flex-col items-center justify-center text-center"
      style={{
        background: theme === "dark" ? "rgba(21,25,34,0.7)" : "#fff",
        borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="text-base sm:text-lg font-semibold mb-3">Performance Insights</h2>
      <p>🔥 Best Day: <span className="font-semibold text-green-400">{bestDay?.name}</span> (${bestDay?.value.toFixed(2)})</p>
      <p>💡 Avg Win Size: <span className="font-semibold text-cyan-400">${avgWinSize.toFixed(2)}</span></p>
      <p>⚠️ Weakest Pair: <span className="font-semibold text-red-400">{weakestPair}</span></p>
      <p>🏆 Best Pair: <span className="font-semibold text-yellow-400">{bestPair}</span></p>

      <div className="mt-6 relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={ringColor}
            strokeWidth="2.5"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-lg font-bold">{score}%</span>
      </div>
      <p className="text-xs sm:text-sm mt-1 text-gray-400">Consistency Score</p>
    </div>
  );
}

