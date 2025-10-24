import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddTradeModal({ open, onClose, onSave }) {
  const [date, setDate] = useState("");
  const [ticker, setTicker] = useState("");
  const [pnl, setPnl] = useState("");
  const [finalRR, setFinalRR] = useState("");

  useEffect(() => {
    if (!open) return;
    // defaults
    setDate(new Date().toISOString().split("T")[0]);
    setTicker("");
    setPnl("");
    setFinalRR("");
  }, [open]);

  const handleSave = async () => {
    if (!date || !ticker) return alert("Date and Ticker are required.");
    await onSave({
      date,
      ticker: ticker.toUpperCase(),
      pnl: Number(pnl || 0),
      final_rr: finalRR === "" ? null : Number(finalRR),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          ></div>

          {/* Modal */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="relative w-[92%] max-w-md glass-card p-6 border border-neutral-800"
          >
            <h3 className="text-lg font-semibold mb-4">Add Trade</h3>

            <div className="space-y-3">
              <Field label="Date">
                <input
                  type="date"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>

              <Field label="Ticker / Pair">
                <input
                  type="text"
                  placeholder="EURUSD / NAS100 / AAPL"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                />
              </Field>

              <Field label="PnL ($)">
                <input
                  type="number"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2"
                  value={pnl}
                  onChange={(e) => setPnl(e.target.value)}
                />
              </Field>

              <Field label="Final R:R (optional)">
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2"
                  value={finalRR}
                  onChange={(e) => setFinalRR(e.target.value)}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
              >
                Save Trade
              </button>
            </div>
          </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-sm text-gray-300">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);
