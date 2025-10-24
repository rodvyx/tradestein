import React, { useMemo, useState } from "react";
import { Sparkles, Loader2, Clipboard } from "lucide-react";

/**
 * Offline AI Reflection Panel
 * - Works without OpenAI key or internet
 * - Generates insights and performance summaries locally
 */

export default function AIReflectionPanel({ tradesByDate, n = 10 }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [copied, setCopied] = useState(false);

  const allTrades = useMemo(() => {
    const flat = Object.entries(tradesByDate || {})
      .flatMap(([date, list]) =>
        Array.isArray(list) ? list.map((t) => ({ ...t, date })) : []
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return flat;
  }, [tradesByDate]);

  const lastN = useMemo(() => allTrades.slice(0, n), [allTrades, n]);

  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      const result = localAnalyze(lastN, allTrades);
      setInsights(result);
      setLoading(false);
    }, 500);
  };

  const copyToClipboard = async () => {
    if (!insights) return;
    const text = formatInsightsPlain(insights);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-5 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Insights (Offline)</h2>
        <button
          onClick={analyze}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Sparkles size={16} />
          )}
          {loading ? "Analyzing..." : `Analyze My Journal (${lastN.length} trades)`}
        </button>
      </div>

      {!insights ? (
        <p className="text-gray-500 mt-3">
          Click “Analyze My Journal” to generate local insights from your last {n} trades.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          <section>
            <h3 className="text-sm font-semibold text-gray-600">Performance Summary</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-800 space-y-1">
              <li>
                Win rate: <b>{insights.winRate.toFixed(1)}%</b> · Avg PnL:{" "}
                <b>{fmt(insights.avgPnl)}$</b> · Total:{" "}
                <b>{fmt(insights.totalPnl)}$</b>
              </li>
              <li>
                Best instrument: <b>{insights.bestTicker}</b> · Best day:{" "}
                <b>{insights.bestDay}</b>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-600">Behavior Patterns</h3>
            <p className="mt-2 text-sm text-gray-800">{insights.behavior}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-600">Recommendations</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-800 space-y-1">
              {insights.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </section>

          <div className="flex justify-end">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50"
            >
              <Clipboard size={14} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Local Analysis Logic ---------- */
function localAnalyze(trades, allTrades) {
  if (trades.length === 0)
    return {
      winRate: 0,
      avgPnl: 0,
      totalPnl: 0,
      bestTicker: "-",
      bestDay: "-",
      behavior: "No trades yet to analyze.",
      recommendations: ["Add more trades to improve accuracy."],
    };

  const total = trades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const wins = trades.filter((t) => t.pnl > 0).length;
  const losses = trades.filter((t) => t.pnl < 0).length;
  const winRate = (wins / trades.length) * 100;
  const avgPnl = total / trades.length;

  const bestTicker = Object.entries(
    trades.reduce((acc, t) => {
      acc[t.ticker] = (acc[t.ticker] || 0) + (Number(t.pnl) || 0);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0];

  const bestDay = trades.sort((a, b) => b.pnl - a.pnl)[0]?.date;

  const behavior =
    winRate > 60
      ? "You’re showing strong consistency — keep following your setups."
      : "Win rate is below average — focus on trade selection and risk control.";

  const recommendations = [];
  if (winRate < 40)
    recommendations.push("Tighten your strategy and cut out low-quality setups.");
  if (avgPnl < 0)
    recommendations.push("Losses outweigh gains — revisit your entry conditions.");
  if (winRate > 60 && avgPnl > 0)
    recommendations.push("Performance trend is strong — keep journaling and scaling safely.");

  return {
    winRate,
    avgPnl,
    totalPnl: total,
    bestTicker,
    bestDay,
    behavior,
    recommendations,
  };
}

function fmt(n) {
  return (Number(n) || 0).toFixed(2);
}

function formatInsightsPlain(ins) {
  return `Win rate: ${ins.winRate.toFixed(1)}%\nAvg PnL: ${fmt(
    ins.avgPnl
  )}$\nTotal: ${fmt(ins.totalPnl)}$\nBehavior: ${ins.behavior}\nRecommendations:\n- ${ins.recommendations.join(
    "\n- "
  )}`;
}
