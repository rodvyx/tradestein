import React from "react";
import { motion } from "framer-motion";

export default function RecentTradesModern({ trades = [] }) {
  const safeTrades = Array.isArray(trades) ? trades : [];

  if (safeTrades.length === 0)
    return <p className="text-gray-500">No recent trades.</p>;

  // Sort by date descending and take last 5 trades
  const sorted = [...safeTrades]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-300">
        Recent Trades
      </h2>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {sorted.map((trade, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="flex justify-between items-center bg-[#161616] p-4 rounded-xl border border-neutral-800 hover:border-emerald-500/40 transition-all"
          >
            <div>
              <p className="font-medium">
                {trade.ticker || "Unknown Symbol"}
              </p>
              <p className="text-xs text-gray-500">
                {trade.date || "No Date"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  Number(trade.pnl) >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                ${Number(trade.pnl || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                R:R {Number(trade.final_rr || 0).toFixed(2)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
