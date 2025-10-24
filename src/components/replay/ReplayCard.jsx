import React from "react";
import { motion } from "framer-motion";
import { ArrowUpCircle, ArrowDownCircle, Calendar, Clock } from "lucide-react";

export default function ReplayCard({ trade }) {
  if (!trade) return null;

  const profit = Number(trade.pnl || 0);
  const rr = Number(trade.final_rr || 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative bg-[#0D1117]/70 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.15)] overflow-hidden"
    >
      {/* Background pulse glow */}
      <div
        className={`absolute inset-0 blur-3xl opacity-20 ${
          profit >= 0 ? "bg-emerald-400" : "bg-red-500"
        }`}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Chart / Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          {trade.entry_chart ? (
            <img
              src={trade.entry_chart}
              alt="Entry Chart"
              className="rounded-xl border border-white/10 shadow-lg object-cover max-h-64 w-full md:w-auto"
            />
          ) : (
            <div className="h-64 w-full md:w-80 flex items-center justify-center rounded-xl bg-[#10151C] border border-white/10 text-gray-500 text-sm">
              No chart available
            </div>
          )}
        </div>

        {/* Trade Details */}
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            {trade.ticker || "Untitled Trade"}
            {profit >= 0 ? (
              <ArrowUpCircle className="text-emerald-400" size={20} />
            ) : (
              <ArrowDownCircle className="text-red-400" size={20} />
            )}
          </h2>

          <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} /> {trade.date}
            </div>
            {trade.entry_time && (
              <div className="flex items-center gap-1">
                <Clock size={14} /> {trade.entry_time}
              </div>
            )}
            {rr !== 0 && (
              <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                R:R {rr.toFixed(2)}
              </div>
            )}
          </div>

          <p
            className={`text-2xl font-bold mb-3 ${
              profit >= 0 ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {profit >= 0 ? "+" : ""}
            {profit.toFixed(2)}$
          </p>

          <div className="space-y-2 text-sm text-gray-300">
            {trade.confluences && (
              <p>
                <span className="text-gray-500">Confluences:</span>{" "}
                {trade.confluences}
              </p>
            )}
            {trade.done_right && (
              <p>
                <span className="text-gray-500">Done Right:</span>{" "}
                {trade.done_right}
              </p>
            )}
            {trade.done_wrong && (
              <p>
                <span className="text-gray-500">Done Wrong:</span>{" "}
                {trade.done_wrong}
              </p>
            )}
            {trade.what_to_do && (
              <p>
                <span className="text-gray-500">Next Time:</span>{" "}
                {trade.what_to_do}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
