import React from "react";
import { motion } from "framer-motion";

export default function MetricsCard({ title, value, change }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 shadow-lg hover:shadow-emerald-500/10 transition-all"
    >
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      <p
        className={`text-sm mt-1 ${
          change.startsWith("+") ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {change}
      </p>
    </motion.div>
  );
}
