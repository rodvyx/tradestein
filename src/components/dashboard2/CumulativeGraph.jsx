import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CumulativeGraph({ trades = [] }) {
  const safeTrades = Array.isArray(trades) ? trades : [];

  if (safeTrades.length === 0)
    return <p className="text-gray-500">No trade data available.</p>;

  // Sort trades by date ascending
  const sortedTrades = [...safeTrades].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Compute running balance
  let runningTotal = 0;
  const chartData = sortedTrades.map((t) => {
    const profit = Number(t.pnl) || 0;
    runningTotal += profit;
    return {
      date: t.date || "N/A",
      balance: runningTotal,
    };
  });

  // Detect max balance to scale axis nicely
  const maxBalance = Math.max(...chartData.map((d) => d.balance), 0);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-300">
        Cumulative Balance
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="date" stroke="#555" />
          <YAxis stroke="#555" domain={[0, maxBalance * 1.2]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              border: "1px solid #222",
              borderRadius: "10px",
            }}
            formatter={(value) => [`$${value.toFixed(2)}`, "Balance"]}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="url(#colorBalance)"
            strokeWidth={3}
            dot={{ r: 3, stroke: "#10b981", strokeWidth: 1 }}
            activeDot={{ r: 5 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

