import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Papa from "papaparse";
import { Download, Upload, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DataBackup({ userId }) {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 📤 Export trades to CSV
  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      if (!data?.length) return showToast("No trades found to export.", "error");

      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "trades_backup.csv";
      link.click();

      showToast("✅ Export successful! CSV downloaded.");
    } catch (err) {
      console.error(err);
      showToast("❌ Export failed. Please try again.", "error");
    }
  };

  // 📥 Import trades from CSV
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv"))
      return showToast("⚠️ Please upload a valid CSV file.", "error");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const trades = result.data.map((t) => ({
            ...t,
            user_id: userId,
          }));

          const { error } = await supabase.from("trades").upsert(trades);
          if (error) throw error;

          showToast("✅ Import successful! Trades restored.");
        } catch (err) {
          console.error(err);
          showToast("❌ Import failed. Please check your file.", "error");
        }
      },
    });
  };

  return (
    <div className="relative bg-[#0E121A]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-md mt-8 flex flex-col items-center text-center shadow-lg shadow-emerald-500/10">
      <h3 className="text-lg font-semibold text-emerald-400 mb-2">
        Backup & Restore
      </h3>
      <p className="text-sm text-gray-400 mb-5">
        Export your trade data as CSV or restore from a saved file.
      </p>

      <div className="flex gap-4">
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-400/40 text-emerald-400 
          hover:bg-emerald-400/10 hover:shadow-[0_0_12px_#10b98160] transition"
        >
          <Download
            size={18}
            className="text-emerald-400 animate-pulse drop-shadow-[0_0_6px_#10b981]"
          />
          Export CSV
        </button>

        {/* Import Button */}
        <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-400/40 text-cyan-400 
        hover:bg-cyan-400/10 hover:shadow-[0_0_12px_#06b6d460] transition cursor-pointer">
          <Upload
            size={18}
            className="text-cyan-400 animate-pulse drop-shadow-[0_0_6px_#06b6d4]"
          />
          Import CSV
          <input type="file" accept=".csv" hidden onChange={handleImport} />
        </label>
      </div>

      {/* 🌟 Floating Toast (Top-right corner) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 80, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className={`fixed top-6 right-6 z-[200] px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg backdrop-blur-md border
              ${
                toast.type === "error"
                  ? "bg-red-500/20 border-red-400/40 text-red-300"
                  : "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
              }`}
          >
            {toast.type === "error" ? (
              <XCircle size={16} className="text-red-400" />
            ) : (
              <CheckCircle size={16} className="text-emerald-400" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
