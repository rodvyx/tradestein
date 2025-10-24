import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlayCircle, BookOpen, LineChart } from "lucide-react";

export default function ReplayMenu({ open, onClose, onSelect }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Popup card */}
          <motion.div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[95] w-[95%] max-w-md
              bg-[#0D1117]/90 border border-white/10 rounded-t-3xl backdrop-blur-xl shadow-[0_0_35px_rgba(16,185,129,0.25)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-emerald-400">Replay Options</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect("playAll")}
                className="flex items-center gap-3 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 rounded-xl px-4 py-3 text-left"
              >
                <PlayCircle className="text-emerald-400" size={22} />
                <span className="font-medium text-white">Play All Trades</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect("notes")}
                className="flex items-center gap-3 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 rounded-xl px-4 py-3 text-left"
              >
                <BookOpen className="text-emerald-400" size={22} />
                <span className="font-medium text-white">Notes View</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect("curve")}
                className="flex items-center gap-3 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 rounded-xl px-4 py-3 text-left"
              >
                <LineChart className="text-emerald-400" size={22} />
                <span className="font-medium text-white">Equity Curve</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
