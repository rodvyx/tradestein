import React, { useMemo } from "react";
import { X } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function TradeModal({ onClose, date, trade, tradesByDate }) {
  const dayEquity = useMemo(() => {
    // simple sparkline: last 7 days cumulative PnL ending at this date
    const all = Object.entries(tradesByDate || {})
      .map(([d, arr]) => ({ d, pnl: arr.reduce((a,t)=> a + (Number(t.pnl)||0), 0) }))
      .sort((a,b)=> new Date(a.d) - new Date(b.d));
    const idx = all.findIndex(x => x.d === date);
    const from = Math.max(0, idx - 6);
    let run = 0;
    return all.slice(from, idx + 1).map(row => {
      run += row.pnl;
      return { date: row.d.slice(5), equity: Number(run.toFixed(2)) };
    });
  }, [date, tradesByDate]);

  const rrText = trade?.amount_risked ? Number(trade.final_rr ?? 0).toFixed(2) : "—";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Trade • {trade?.ticker} • {date}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X /></button>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: mini sparkline + metrics */}
          <div className="lg:col-span-2">
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">Recent Equity</p>
              {dayEquity.length === 0 ? (
                <p className="text-gray-500 text-sm">No data.</p>
              ) : (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dayEquity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={v => `${Number(v).toFixed(2)}$`} />
                      <Line type="monotone" dataKey="equity" stroke="#22c55e" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="PnL" value={`${Number(trade?.pnl||0) >= 0 ? "+" : ""}${Number(trade?.pnl||0).toFixed(2)}$`} />
              <Metric label="R:R" value={rrText} />
              <Metric label="Entry" value={trade?.entry_time || "—"} />
              <Metric label="Exit" value={trade?.exit_time || "—"} />
              <Metric label="Risked" value={trade?.amount_risked ? `${Number(trade.amount_risked).toFixed(2)}$` : "—"} />
              <Metric label="Session" value={sessionOf(trade?.entry_time)} />
            </div>

            <div className="mt-4 space-y-2">
              {trade?.confluences && <Note title="Confluences" text={trade.confluences} />}
              {trade?.what_to_do && <Note title="What to do differently" text={trade.what_to_do} />}
              {trade?.done_right && <Note title="Done Right" text={trade.done_right} />}
              {trade?.done_wrong && <Note title="Done Wrong" text={trade.done_wrong} />}
            </div>
          </div>

          {/* Right: image viewer */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Attachment</p>
            {trade?.entry_chart || trade?.htf_chart ? (
              <div className="space-y-3">
                {trade?.entry_chart && <ImgView title="Entry Chart" src={trade.entry_chart} />}
                {trade?.htf_chart && <ImgView title="HTF Chart" src={trade.htf_chart} />}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No image attached.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function sessionOf(time) {
  if (!time) return "Unknown";
  const [h] = time.split(":").map(x => parseInt(x || "0", 10));
  if (h >= 7 && h < 12) return "Morning";
  if (h >= 12 && h < 16) return "Midday";
  if (h >= 16 && h <= 23) return "Afternoon/NY";
  return "Overnight";
}

function Metric({ label, value }) {
  return (
    <div className="p-3 border rounded-xl">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function Note({ title, text }) {
  return (
    <div className="p-3 border rounded-xl">
      <p className="text-xs font-semibold text-gray-500">{title}</p>
      <p className="text-sm mt-1 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function ImgView({ title, src }) {
  const open = () => window.open(src, "_blank");
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
      <div className="relative group cursor-zoom-in" onClick={open}>
        <img src={src} alt={title} className="rounded-lg border max-h-48 w-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
        <div className="absolute bottom-1 right-1 text-[10px] bg-white/70 px-2 py-0.5 rounded">Open</div>
      </div>
    </div>
  );
}
