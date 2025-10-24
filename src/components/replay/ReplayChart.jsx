import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

export default function ReplayChart({ trades, activeIndex }) {
  const data = useMemo(() => {
    let balance = 0;
    return trades.map((t, i) => {
      balance += Number(t.pnl) || 0;
      return {
        name: t.ticker || `Trade ${i + 1}`,
        balance: balance.toFixed(2),
      };
    });
  }, [trades]);

  if (!data || data.length === 0) return null;

  const activeTrade = data[activeIndex] || {};
  const profit = Number(trades[activeIndex]?.pnl || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0D1117]/70 border border-white/10 backdrop-blur-xl rounded-3xl p-4 shadow-[0_0_25px_rgba(16,185,129,0.1)]"
    >
      <h3 className="text-lg font-semibold mb-3 text-center text-emerald-400">
        Equity Curve
      </h3>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(17,17,17,0.85)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelStyle={{ color: "#10b981" }}
            formatter={(value) => [`$${value}`, "Balance"]}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke={profit >= 0 ? "#10b981" : "#ef4444"}
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 6,
              fill: profit >= 0 ? "#10b981" : "#ef4444",
              strokeWidth: 0,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Active Trade Info */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Viewing:{" "}
          <span className="text-white font-medium">
            {activeTrade.name || "—"}
          </span>
        </p>
        <p
          className={`text-lg font-semibold ${
            profit >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {profit >= 0 ? "+" : ""}
          {profit.toFixed(2)}$
        </p>
      </div>
    </motion.div>
  );
}
