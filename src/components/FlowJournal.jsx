import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FlowJournal.jsx
 * Mobile-first "guided journaling" experience.
 * Displays 2–3 related questions per step with smooth transitions.
 * Reuses Journal data structure (same fields as full Journal).
 */

export default function FlowJournal({ onSave }) {
  const [step, setStep] = useState(0);

  // State values for form fields
  const [form, setForm] = useState({
    date: "",
    pair: "",
    entryTime: "",
    balanceBefore: "",
    balanceAfter: "",
    projectedRR: "",
    confluences: "",
    doneRight: "",
    doneWrong: "",
    whatToDo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    const before = parseFloat(form.balanceBefore) || 0;
    const after = parseFloat(form.balanceAfter) || 0;
    const pnl = after - before;

    const trade = {
      id: Date.now(),
      ticker: form.pair,
      date: form.date,
      entryTime: form.entryTime,
      confluences: form.confluences,
      doneRight: form.doneRight,
      doneWrong: form.doneWrong,
      whatToDo: form.whatToDo,
      balanceBefore: before,
      balanceAfter: after,
      pnl,
      projectedRR: parseFloat(form.projectedRR) || 0,
      note: form.whatToDo || form.confluences,
    };

    onSave(trade);
  };

  const steps = [
    {
      title: "📈 Trade Setup",
      fields: [
        { label: "Date", name: "date", type: "date" },
        { label: "Pair", name: "pair", placeholder: "EURUSD, NAS100, etc." },
        { label: "Entry Time", name: "entryTime", type: "time" },
      ],
    },
    {
      title: "💰 Performance",
      fields: [
        {
          label: "Balance Before Trade ($)",
          name: "balanceBefore",
          type: "number",
        },
        {
          label: "Balance After Trade ($)",
          name: "balanceAfter",
          type: "number",
        },
        { label: "Projected RR", name: "projectedRR", type: "number" },
      ],
    },
    {
      title: "🧠 Reflection",
      fields: [
        {
          label: "Confluences",
          name: "confluences",
          textarea: true,
          placeholder: "Why did you take this trade?",
        },
        {
          label: "Done Right",
          name: "doneRight",
          textarea: true,
          placeholder: "What did you execute well?",
        },
        {
          label: "Done Wrong",
          name: "doneWrong",
          textarea: true,
          placeholder: "What needs improvement?",
        },
      ],
    },
    {
      title: "🚀 Lessons Learned",
      fields: [
        {
          label: "What will you do differently next time?",
          name: "whatToDo",
          textarea: true,
          placeholder: "Reflect on improvement...",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            {steps[step].title}
          </h2>

          <div className="space-y-4">
            {steps[step].fields.map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {f.label}
                </label>
                {f.textarea ? (
                  <textarea
                    name={f.name}
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                  />
                ) : (
                  <input
                    name={f.name}
                    type={f.type || "text"}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleChange}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={prev}
              disabled={step === 0}
              className="text-gray-500 text-sm disabled:opacity-40"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={next}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700"
              >
                Save Journal
              </button>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Step {step + 1} of {steps.length}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
