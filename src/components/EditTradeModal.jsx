import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/** Trader-Tech Style Edit Modal
 * - Frosted dark backdrop, neon accents
 * - Save Changes (no auto-save)
 * - Delete from cloud
 * - Success toast: "Trade updated successfully"
 */
export default function EditTradeModal({ isOpen, onClose, trade, userId }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (trade) {
      // Normalize field names (handles our camel_case vs snake_case)
      setForm({
        id: trade.id,
        date: trade.date || "",
        ticker: trade.ticker || "",
        entry_time: trade.entry_time ?? trade.entryTime ?? "",
        exit_time: trade.exit_time ?? trade.exitTime ?? "",
        pnl: trade.pnl ?? 0,
        final_rr: trade.final_rr ?? trade.finalRR ?? "",
        confluences: trade.confluences ?? "",
        emotions: trade.emotions ?? trade.emortions ?? "",
        done_right: trade.done_right ?? "",
        done_wrong: trade.done_wrong ?? "",
        what_to_do: trade.what_to_do ?? "",
        what_happened: trade.what_happened ?? "",
        note: trade.note ?? "",
        entry_chart: trade.entry_chart ?? null,
        htf_chart: trade.htf_chart ?? null,
      });
    } else {
      setForm(null);
    }
  }, [trade]);

  if (!isOpen || !form) return null;

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!userId || !form.id) return;
    setSaving(true);
    const payload = {
      date: form.date,
      ticker: (form.ticker || "").toUpperCase(),
      entry_time: form.entry_time || null,
      exit_time: form.exit_time || null,
      pnl: Number(form.pnl) || 0,
      final_rr: form.final_rr === "" ? null : Number(form.final_rr),
      confluences: form.confluences || null,
      emotions: form.emotions || null,
      done_right: form.done_right || null,
      done_wrong: form.done_wrong || null,
      what_to_do: form.what_to_do || null,
      what_happened: form.what_happened || null,
      note: form.note || null,
      entry_chart: form.entry_chart || null,
      htf_chart: form.htf_chart || null,
    };

    const { error } = await supabase
      .from("trades")
      .update(payload)
      .eq("id", form.id)
      .eq("user_id", userId);

    setSaving(false);
    if (error) {
      console.error(error);
      showToast("Failed to update trade");
      return;
    }
    showToast("Trade updated successfully");
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleDelete = async () => {
    if (!userId || !form.id) return;
    const ok = confirm("Delete this trade from the cloud? This cannot be undone.");
    if (!ok) return;
    setSaving(true);
    const { error } = await supabase
      .from("trades")
      .delete()
      .eq("id", form.id)
      .eq("user_id", userId);
    setSaving(false);
    if (error) {
      console.error(error);
      showToast("Delete failed");
      return;
    }
    showToast("Trade deleted");
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(17,24,39,0.85), rgba(3,7,18,0.85))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h3 className="text-white text-lg font-semibold">
                Edit Trade — <span className="text-cyan-400">{form.ticker || "—"}</span>
              </h3>
              <p className="text-xs text-gray-300/80">
                Make changes and press <span className="text-cyan-300">Save Changes</span>.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Field label="Date">
              <input
                type="date"
                value={form.date || ""}
                onChange={(e) => set("date", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>
            <Field label="Pair">
              <input
                type="text"
                placeholder="AAPL, EURUSD"
                value={form.ticker || ""}
                onChange={(e) => set("ticker", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400 uppercase"
              />
            </Field>

            <Field label="Entry Time">
              <input
                type="time"
                value={form.entry_time || ""}
                onChange={(e) => set("entry_time", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>
            <Field label="Exit Time">
              <input
                type="time"
                value={form.exit_time || ""}
                onChange={(e) => set("exit_time", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>

            <Field label="PnL ($)">
              <input
                type="number"
                value={form.pnl ?? 0}
                onChange={(e) => set("pnl", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>
            <Field label="Final R:R">
              <input
                type="number"
                step="0.01"
                value={form.final_rr ?? ""}
                onChange={(e) => set("final_rr", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>

            <Field label="Confluences" full>
              <textarea
                rows={3}
                value={form.confluences || ""}
                onChange={(e) => set("confluences", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>
            <Field label="Emotions" full>
              <textarea
                rows={3}
                value={form.emotions || ""}
                onChange={(e) => set("emotions", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>

            <Field label="Done Right">
              <textarea
                rows={3}
                value={form.done_right || ""}
                onChange={(e) => set("done_right", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>
            <Field label="Done Wrong">
              <textarea
                rows={3}
                value={form.done_wrong || ""}
                onChange={(e) => set("done_wrong", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>

            <Field label="What to Improve" full>
              <textarea
                rows={3}
                value={form.what_to_do || ""}
                onChange={(e) => set("what_to_do", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>
            <Field label="Notes">
              <textarea
                rows={3}
                value={form.note || ""}
                onChange={(e) => set("note", e.target.value)}
                className="w-full bg-black/30 text-white px-3 py-2 rounded-lg border border-white/10 outline-none focus:ring-2 ring-cyan-400"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-red-300 hover:text-red-200 border border-red-400/40 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition"
            >
              Delete Trade
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={saving}
                className="text-gray-200 hover:text-white border border-white/20 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-white border border-cyan-400/40 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 ring-1 ring-cyan-400/30 transition"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[110] bg-black/80 text-white border border-white/10 px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
