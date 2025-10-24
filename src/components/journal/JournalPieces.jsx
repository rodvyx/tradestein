import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X as XIcon } from "lucide-react";

/* ------------------------------- Theme ------------------------------- */
export const NEON = {
  teal: "rgba(16,185,129,.9)",
  cyan: "rgba(34,211,238,.9)",
};

/* ------------------------- Ambient Glow Particles -------------------- */
export function NeonParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full blur-xl"
          style={{
            width: Math.random() * 10 + 8 + "px",
            height: Math.random() * 10 + 8 + "px",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            background: Math.random() > 0.5 ? NEON.teal : "rgba(99,102,241,.8)",
            opacity: 0.25,
            animation: `floatY ${10 + Math.random() * 10}s ease-in-out ${
              Math.random() * 5
            }s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0px); opacity:.12 }
          50% { transform: translateY(-18px); opacity:.25 }
          100% { transform: translateY(0px); opacity:.12 }
        }
      `}</style>
    </div>
  );
}

/* ----------------------------- Field Shell -------------------------- */
export function FieldShell({ label, icon, children }) {
  return (
    <div className="relative">
      <div className="mb-2 flex items-center gap-2 text-[13px] tracking-wide">
        <span className="h-3 w-1 rounded bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,.8)]" />
        <span className="text-emerald-200/90">{label}</span>
      </div>
      <div
        className="rounded-2xl border border-white/10 bg-[rgba(15,23,42,.6)] p-2 pl-3
        focus-within:border-emerald-400/40 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,.18)]
        transition-all"
        style={{ backdropFilter: "blur(10px)" }}
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Image Lightbox -------------------------- */
export function ImageLightbox({ src, onClose }) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.img
            src={src}
            alt="preview"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          />
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/5 p-2 text-white/90 hover:bg-white/10"
            aria-label="Close lightbox"
          >
            <XIcon size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* --------------------------- Styled Select -------------------------- */
export function StyledSelect({ value, options, onChange }) {
  return (
    <motion.select
      className="rounded-lg border border-white/10 bg-slate-800/90 text-white/90 
      px-3 py-2 outline-none shadow-[0_0_10px_rgba(16,185,129,.08)] focus:border-emerald-400/50 
      transition-all duration-150"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
    >
      {options.map((opt) => (
        <option
          key={(opt.value ?? opt).toString()}
          value={opt.value ?? opt}
          className="bg-slate-800 text-white"
        >
          {opt.label ?? opt}
        </option>
      ))}
    </motion.select>
  );
}

/* ------------------------------ Date Picker -------------------------- */
/* NOTE: Stays open until user presses "Done" (no outside-click close) */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

export function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const init = value ? new Date(value) : new Date();
  const [m, setM] = useState(init.getMonth());
  const [d, setD] = useState(init.getDate());
  const [y, setY] = useState(init.getFullYear());

  useEffect(() => {
    onChange(`${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }, [m, d, y, onChange]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-xl bg-transparent px-3 py-2 text-left text-white/90 placeholder-white/40 outline-none"
      >
        {value || "Select date"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-50 mt-2 grid w-[min(22rem,90vw)] grid-cols-3 gap-2 rounded-xl 
            border border-white/10 bg-slate-900/95 p-3 shadow-xl"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            style={{ backdropFilter: "blur(12px)" }}
          >
            <StyledSelect value={m} onChange={(v) => setM(parseInt(v))} options={MONTHS.map((mm, i) => ({ label: mm, value: i }))} />
            <StyledSelect
              value={d}
              onChange={(v) => setD(parseInt(v))}
              options={Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1).map((n) => ({ label: n, value: n }))}
            />
            <StyledSelect value={y} onChange={(v) => setY(parseInt(v))} options={YEARS.map((yy) => ({ label: yy, value: yy }))} />
            <div className="col-span-3 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-sm text-slate-900 hover:bg-emerald-400"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ Time Picker -------------------------- */
/* NOTE: Stays open until user presses "Done" (no outside-click close) */
export function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [h, setH] = useState(() => (value ? parseInt(value.split(":")[0]) : 9));
  const [m, setM] = useState(() => (value ? parseInt(value.split(":")[1]) : 30));

  useEffect(() => {
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }, [h, m, onChange]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-xl bg-transparent px-3 py-2 text-left text-white/90 placeholder-white/40 outline-none"
      >
        {value || "Select time"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-50 mt-2 grid w-[min(18rem,85vw)] grid-cols-2 gap-2 rounded-xl 
            border border-white/10 bg-slate-900/95 p-3 shadow-xl"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            style={{ backdropFilter: "blur(12px)" }}
          >
            <StyledSelect value={h} onChange={(v) => setH(parseInt(v))} options={Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: i }))} />
            <StyledSelect value={m} onChange={(v) => setM(parseInt(v))} options={Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: i }))} />
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                type="button"
                className="rounded-lg bg-cyan-400/90 px-3 py-1.5 text-sm text-slate-900 hover:bg-cyan-300"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------- Expanding Text Area (Auto rows) ------------------- */
export function TextAreaAuto({ value, onChange, placeholder }) {
  const [rows, setRows] = useState(3);
  return (
    <textarea
      rows={rows}
      onChange={(e) => {
        onChange(e.target.value);
        setRows(Math.min(10, Math.max(3, Math.ceil(e.target.value.length / 60))));
      }}
      value={value}
      placeholder={placeholder}
      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/90 placeholder-white/40 outline-none focus:border-emerald-400/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,.18)]"
    />
  );
}

/* ----------------------- Reactive Neon Underline -------------------------- */
/* B) reacts on hover & subtly with scroll */
export function ReactiveNeonUnderline() {
  const { scrollYProgress } = useScroll();
  const glow = useTransform(scrollYProgress, [0, 1], [0.25, 0.6]);
  const scaleX = useTransform(scrollYProgress, [0, 1], [0.95, 1]);

  return (
    <motion.div
      style={{ opacity: glow, scaleX }}
      className="mt-1 h-[3px] w-32 origin-left rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,.7)]"
      whileHover={{ scaleX: 1.08, filter: "drop-shadow(0 0 10px rgba(34,211,238,0.7))" }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
    />
  );
}
