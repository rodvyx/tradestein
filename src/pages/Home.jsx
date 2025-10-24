import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import RecentTrades from "../components/RecentTrades";

const data = [
  { date: "Mon", profit: 120 },
  { date: "Tue", profit: 200 },
  { date: "Wed", profit: 150 },
  { date: "Thu", profit: 300 },
  { date: "Fri", profit: 280 },
];

export default function Home() {
  return (
    <div className="p-5 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700">
          + Add Trade
        </button>
      </div>

      {/* Profit Chart */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-medium mb-3">Equity Curve</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="date" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-sm text-gray-500">Win Rate</h3>
          <p className="text-xl font-semibold text-green-600">74%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-sm text-gray-500">Total Trades</h3>
          <p className="text-xl font-semibold">58</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-sm text-gray-500">Avg Profit</h3>
          <p className="text-xl font-semibold text-blue-600">$240</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow text-center">
          <h3 className="text-sm text-gray-500">Equity</h3>
          <p className="text-xl font-semibold text-purple-600">$15,340</p>
        </div>
      </div>

      {/* Recent Trades Section */}
      <RecentTrades />
    </div>
  );
}
