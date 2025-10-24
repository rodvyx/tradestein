import React, { useEffect, useMemo, useState } from "react";
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabaseClient";
import { chatWithAI } from "../lib/aiClient";

function compactTrade(t) {
  return {
    date: t.date,
    ticker: (t.ticker || "").toUpperCase(),
    pnl: Number(t.pnl ?? 0),
    entry_time: t.entry_time || "",
    exit_time: t.exit_time || "",
    final_rr: t.final_rr ?? null,
    note: t.confluences || t.what_to_do || t.note || "",
  };
}

function summarizeTrades(trades) {
  if (!trades.length) return "No trades available.";
  const totalPnL = trades.reduce((a, b) => a + (Number(b.pnl) || 0), 0);
  const wins = trades.filter((t) => Number(t.pnl) > 0).length;
  const wr = (wins / trades.length) * 100;
  const rrVals = trades
    .map((t) => Number(t.final_rr))
    .filter((x) => Number.isFinite(x) && x !== 0);
  const avgRR = rrVals.length
    ? rrVals.reduce((a, b) => a + b, 0) / rrVals.length
    : 0;

  return `Summary:
- Trades: ${trades.length}
- Win rate: ${wr.toFixed(1)}%
- Total PnL: ${totalPnL.toFixed(2)}$
- Avg R:R: ${avgRR.toFixed(2)}

Recent trades (max 30):
${trades
  .slice(-30)
  .reverse()
  .map(
    (t) =>
      `• ${t.date} ${t.ticker} | ${t.pnl.toFixed(2)}$ | R:R ${
        t.final_rr == null ? "—" : t.final_rr.toFixed(2)
      } | ${t.entry_time || ""}→${t.exit_time || ""}${
        t.note ? ` | Note: ${t.note.slice(0, 60)}` : ""
      }`
  )
  .join("\n")}`;
}

export default function AISidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [tradesByDate, setTradesByDate] = useState({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to **Tradestein AI** — your personal trading coach. Ask me anything about your trades, discipline, or strategy.",
    },
  ]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user || null;
      setUser(u);

      if (u) {
        const { data: rows } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", u.id);
        if (rows) {
          const grouped = rows.reduce((acc, t) => {
            const d = t.date || t.created_at?.slice(0, 10) || "";
            acc[d] = acc[d] || [];
            acc[d].push(t);
            return acc;
          }, {});
          setTradesByDate(grouped);
          localStorage.setItem("trades", JSON.stringify(grouped));
        }
      } else {
        const saved = localStorage.getItem("trades");
        if (saved) setTradesByDate(JSON.parse(saved));
      }
    })();
  }, []);

  const flatTrades = useMemo(() => {
    return Object.entries(tradesByDate)
      .flatMap(([d, list]) =>
        (Array.isArray(list) ? list : []).map((t) => ({ ...t, date: d }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(compactTrade);
  }, [tradesByDate]);

  async function send() {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);

    const system = [
      {
        role: "system",
        content:
          "You are Tradestein AI, a professional trading mentor. Give specific insights from journal data. Be concise, motivational, and data-driven.",
      },
      {
        role: "system",
        content: summarizeTrades(flatTrades),
      },
    ];

    try {
      const reply = await chatWithAI([...system, ...messages, userMsg]);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "⚠️ Couldn't reach the AI service. Check your OpenAI API key in `.env`.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-50 rounded-full p-3 bg-[#0d1117] border border-blue-500 shadow-lg hover:shadow-blue-500/30 text-blue-400 hover:text-white transition-all duration-300"
        title="Open Tradestein AI"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#0d1117] border-l border-blue-500 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-blue-900/60 flex items-center justify-between bg-[#0d1117]">
              <div>
                <h3 className="font-semibold text-blue-400">
                  Tradestein AI Mentor
                </h3>
                <p className="text-xs text-gray-400">
                  GPT-4 • Trading Coach Mode
                </p>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-blue-900/20 text-blue-400"
                onClick={() => setOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-gray-100">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    m.role === "assistant"
                      ? "bg-blue-900/30 text-gray-200"
                      : "bg-blue-600 text-white ml-auto"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {busy && (
                <p className="text-xs text-blue-300 animate-pulse">Thinking...</p>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-blue-900/60 bg-[#0d1117] flex items-center gap-2">
              <input
                className="flex-1 bg-[#111827] border border-blue-900/50 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="Ask about performance, mindset, or trade patterns..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button
                onClick={send}
                disabled={busy}
                className="px-3 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-blue-500/30 shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
