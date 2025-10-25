// src/components/ui/NeonLoader.jsx
import React from "react";
import { motion } from "framer-motion";

export default function NeonLoader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0A0A0B]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="h-10 w-10 border-2 border-emerald-400 border-t-transparent rounded-full mb-4 shadow-[0_0_12px_#10b981]"
      />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
}
