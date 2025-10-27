import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import LogoutButton from "../components/LogoutButton";

/* ------------------------------ constants ------------------------------ */

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const COLORS = {
  profit: "#00FFC6",
  profitDeep: "#14b8a6",
  loss: "#FF3355",
  lossWarm: "#fb923c",
  cyan: "#06b6d4",
  textLightOnDark: "#ffffff",
  axisOnDark: "#9CA3AF",
  gridDark: "rgba(255,255,255,0.12)",
  gridLight: "rgba(0,0,0,0.10)",
};

/* ------------------------------ helpers ------------------------------ */

function fmtMoney(n) {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(Number(n || 0)).toFixed(2)}`;
}

function toISO(d) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function getWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

function weekRangeFromKey(weekKey) {
  const [y, w] = weekKey.split("-").map((x) => parseInt(x, 10));
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dayOfWeek = simple.getUTCDay();
  const start = new Date(simple);
  if (dayOfWeek <= 4) start.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  else start.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}

/* ------------------------------ small bits ------------------------------ */

const NeonNumber = ({ value, size = "2xl" }) => {
  const positive = value >= 0;
  const color = positive ? COLORS.profit : COLORS.loss;
  const shadow = positive
    ? `0 0 12px ${COLORS.profit}, 0 0 28px rgba(0,255,198,.45)`
    : `0 0 12px ${COLORS.loss}, 0 0 28px rgba(255,51,85,.45)`;

  return (
    <motion.span
      initial={{ scale: 0.97, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`font-semibold tracking-tight text-${size}`}
      style={{ color, textShadow: shadow }}
    >
      {fmtMoney(value)}
    </motion.span>
  );
};

const PulseDot = ({ cx, cy, r = 3, positive = true }) => {
  const fill = positive ? COLORS.profit : COLORS.loss;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <circle
        cx={cx}
        cy={cy}
        r={r + 6}
        fill={fill}
        opacity={0.18}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        className="animate-pulse"
      />
    </g>
  );
};

/* -------------------------------- page -------------------------------- */

export default function Calendar() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    else setTheme(
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );
  }, []);

  const [user, setUser] = useState(null);
  const [allTrades, setAllTrades] = useState([]);
  const [tradesByDate, setTradesByDate] = useState({});
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null); // "YYYY-MM-DD"
  const [sparkKey, setSparkKey] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchTrades = async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        setAllTrades(data);
        const grouped = data.reduce((acc, t) => {
          const d = t.date || t.created_at?.split("T")[0];
          if (!acc[d]) acc[d] = [];
          acc[d].push(t);
          return acc;
        }, {});
        setTradesByDate(grouped);
        localStorage.setItem("trades", JSON.stringify(grouped));
      } else {
        const saved = localStorage.getItem("trades");
        if (saved) setTradesByDate(JSON.parse(saved));
      }
    };

    fetchTrades();

    const channel = supabase
      .channel("cal-trades-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades", filter: `user_id=eq.${user.id}` },
        fetchTrades
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  /* calendar grid data */
  const days = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay()); // to Sunday
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - last.getDay())); // to Saturday

    const out = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = toISO(d);
      out.push({
        date: new Date(d),
        iso,
        inMonth: d.getMonth() === month,
        trades: tradesByDate[iso] || [],
      });
    }
    return out;
  }, [current, tradesByDate]);

  /* summaries */
  const monthISO = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
  const monthTrades = useMemo(
    () => allTrades.filter((t) => (t.date || "").startsWith(monthISO)),
    [allTrades, monthISO]
  );
  const totalTrades = monthTrades.length;

  const pnlByWeekKey = monthTrades.reduce((acc, t) => {
    const key = getWeekKey(new Date(t.date));
    acc[key] = (acc[key] || 0) + (Number(t.pnl) || 0);
    return acc;
  }, {});
  const bestWeekKey = Object.keys(pnlByWeekKey).sort((a, b) => pnlByWeekKey[b] - pnlByWeekKey[a])[0] || null;
  const bestWeekRange = bestWeekKey ? weekRangeFromKey(bestWeekKey) : null;
  const bestWeekPnL = bestWeekKey ? pnlByWeekKey[bestWeekKey] : 0;

  const pnlByWeekday = WEEKDAYS_FULL.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
  monthTrades.forEach((t) => {
    const wd = WEEKDAYS_FULL[new Date(t.date).getDay()];
    pnlByWeekday[wd] += Number(t.pnl) || 0;
  });
  const mostProfitableDay =
    Object.entries(pnlByWeekday).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  /* charts */
  const chartPnLByWeekday = WEEKDAYS_FULL.map((name) => ({
    name: name.slice(0, 3),
    value: Number((pnlByWeekday[name] || 0).toFixed(2)),
  }));

  const chartTradeFrequency = useMemo(() => {
    const byDay = {};
    days
      .filter((d) => d.inMonth)
      .forEach((d) => {
        byDay[d.iso] = (tradesByDate[d.iso]?.length || 0);
      });
    return Object.entries(byDay).map(([iso, count]) => ({
      date: iso.slice(8, 10),
      count,
    }));
  }, [days, tradesByDate]);

  const isToday = (d) => {
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  };

  const monthLabel = current.toLocaleString(undefined, { month: "long", year: "numeric" });
  const themeBg =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100"
      : "bg-gray-50 text-gray-900";
  const cardBg = theme === "dark" ? "rgba(21,25,34,0.7)" : "#fff";
  const borderCol = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  /* selected day */
  const selectedTrades = selectedDay ? tradesByDate[selectedDay] || [] : [];
  const selectedPnL = selectedTrades.reduce((a, t) => a + (Number(t.pnl) || 0), 0);

  const sparklineData = useMemo(() => {
    if (!selectedDay) return [];
    const sorted = [...selectedTrades].sort((a, b) =>
      (a.entry_time || "").localeCompare(b.entry_time || "")
    );
    let cum = 0;
    const arr = [{ idx: 0, equity: 0 }];
    sorted.forEach((t, i) => {
      cum += Number(t.pnl) || 0;
      arr.push({ idx: i + 1, equity: Number(cum.toFixed(2)) });
    });
    return arr;
  }, [selectedDay, selectedTrades]);

  useEffect(() => {
    if (selectedDay) setSparkKey((k) => k + 1);
  }, [selectedDay]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Please log in to access your Calendar.
      </div>
    );
  }

  /* -------------------------------- UI -------------------------------- */

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${monthLabel}-${theme}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className={`min-h-screen px-4 sm:px-6 py-6 pb-28 ${themeBg}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="text-xs opacity-70">Updated live • {user.email}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Month row */}
        <div
          className="flex items-center justify-between mb-4 rounded-2xl border px-3 py-2"
          style={{ background: cardBg, borderColor: borderCol }}
        >
          <button
            className="p-2 rounded-xl hover:scale-105 transition"
            onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            title="Previous month"
          >
            <ChevronLeft />
          </button>
          <div className="text-lg font-semibold">{monthLabel}</div>
          <button
            className="p-2 rounded-xl hover:scale-105 transition"
            onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            title="Next month"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Summary chips (restored) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <SummaryCard title="Best Week" theme={theme}>
            {bestWeekKey && bestWeekRange ? (
              <>
                <div className="text-base sm:text-lg font-medium text-white">
                  {bestWeekRange.start.getUTCDate()}–{bestWeekRange.end.getUTCDate()}{" "}
                  {bestWeekRange.end.toLocaleString(undefined, { month: "short" })}
                </div>
                <div className="mt-1">
                  <NeonNumber value={bestWeekPnL} size="xl" />
                </div>
              </>
            ) : (
              <div className="opacity-70">—</div>
            )}
          </SummaryCard>

          <SummaryCard title="Most Profitable Day" theme={theme}>
            <div className="text-lg font-semibold text-white">{mostProfitableDay}</div>
          </SummaryCard>

          <SummaryCard title="Total Trades" theme={theme}>
            <div className="text-lg font-semibold text-white">{totalTrades}</div>
          </SummaryCard>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 text-center text-xs opacity-70 mb-2">
          {WEEKDAYS_SHORT.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const pnl = d.trades.reduce((a, t) => a + (Number(t.pnl) || 0), 0);
            const dotColor =
              pnl > 0 ? COLORS.profit : pnl < 0 ? COLORS.loss : "rgba(148,163,184,0.6)";
            const inMonthOpacity = d.inMonth ? 1 : 0.45;
            const glow = isToday(d.date) ? `0 0 0 2px rgba(0,255,198,.35)` : "none";

            return (
              <button
                key={d.iso}
                onClick={() => d.inMonth && setSelectedDay(d.iso)}
                className="rounded-xl border p-2 text-left transition hover:scale-[1.015] focus:outline-none"
                style={{
                  background: cardBg,
                  borderColor: borderCol,
                  opacity: inMonthOpacity,
                  boxShadow: glow,
                  minHeight: 100,
                  overflow: "hidden",            // keep pills inside
                  position: "relative",
                }}
                title={d.inMonth ? `Open ${d.iso}` : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-80">{d.date.getDate()}</span>
                  {d.trades.length > 3 && (
                    <span className="text-[10px] opacity-60">+{d.trades.length - 3}</span>
                  )}
                </div>

                <div className="mt-2">
                  <span
                    className="inline-block rounded-full"
                    style={{ width: 10, height: 10, background: dotColor }}
                    title={fmtMoney(pnl)}
                  />
                </div>

                {/* two tiny pills — confined and aligned */}
                <div className="mt-2 space-y-1">
                  {d.trades.slice(0, 2).map((t) => {
                    const pos = Number(t.pnl) >= 0;
                    return (
                      <div
                        key={t.id}
                        className="text-[11px] px-2 py-1 rounded truncate"
                        style={{
                          background: pos ? "rgba(0,255,198,0.12)" : "rgba(255,51,85,0.12)",
                          color: pos ? "#c1f3d3" : "#fecaca",
                          maxWidth: "100%",                 // never overflow
                        }}
                        title={`${t.ticker} ${fmtMoney(Number(t.pnl) || 0)}`}
                      >
                        {t.ticker} {fmtMoney(Number(t.pnl) || 0)}
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 pb-10">
          <ChartCard title="PnL by Day of Week" theme={theme}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartPnLByWeekday}>
                <defs>
                  <linearGradient id="pnlPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.profit} />
                    <stop offset="100%" stopColor={COLORS.profitDeep} />
                  </linearGradient>
                  <linearGradient id="pnlNeg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.loss} />
                    <stop offset="100%" stopColor={COLORS.lossWarm} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={COLORS.gridDark} vertical={false} />
                <XAxis dataKey="name" stroke={COLORS.axisOnDark} />
                <YAxis stroke={COLORS.axisOnDark} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    background: "rgba(17,24,39,0.9)",
                    border: "none",
                    borderRadius: 10,
                    color: COLORS.textLightOnDark,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
                  }}
                  formatter={(v) => [fmtMoney(v), "PnL"]}
                />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  isAnimationActive
                  animationDuration={800}
                  shape={(props) => {
                    const { x, y, width, height, payload } = props;
                    const fillId = payload.value >= 0 ? "pnlPos" : "pnlNeg";
                    return (
                      <rect x={x} y={y} width={width} height={height} rx={8} fill={`url(#${fillId})`} />
                    );
                  }}
                >
                  <LabelList
                    position="top"
                    formatter={(v) => (v ? fmtMoney(v) : "")}
                    fill={COLORS.textLightOnDark}   // white labels (restored)
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Trade Frequency Over Time" theme={theme}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartTradeFrequency}>
                <CartesianGrid stroke={COLORS.gridDark} vertical={false} />
                <XAxis dataKey="date" stroke={COLORS.axisOnDark} />
                <YAxis allowDecimals={false} stroke={COLORS.axisOnDark} />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    background: "rgba(17,24,39,0.9)",
                    border: "none",
                    borderRadius: 10,
                    color: COLORS.textLightOnDark,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
                  }}
                  formatter={(v) => [v, "Trades"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={COLORS.cyan}
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Modal / Drawer */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedDay(null)} />

              <motion.div
                initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: 40, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.25 }}
                className="relative w-full sm:w-[560px] rounded-t-2xl sm:rounded-2xl border shadow-xl mx-auto"
                style={{ background: cardBg, borderColor: borderCol }}
              >
                {/* header */}
                <div
                  className="flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: borderCol }}
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-xs opacity-70">{selectedDay}</div>
                    <div className="flex items-center gap-3">
                      <NeonNumber value={selectedPnL} size="3xl" />
                      <div className="text-xs opacity-70">
                        {selectedTrades.length} {selectedTrades.length === 1 ? "trade" : "trades"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="p-2 rounded-xl hover:scale-105 transition"
                    title="Close"
                  >
                    <X />
                  </button>
                </div>

                {/* content */}
                <div className="p-4 space-y-4">
                  <div className="rounded-xl border p-3" style={{ borderColor: borderCol }}>
                    <div className="text-sm mb-2 opacity-80">Intra-day Equity</div>
                    <div className="h-[170px]">
                      <ResponsiveContainer key={sparkKey} width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                          <defs>
                            <linearGradient id="sparkFillPos" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(0,255,198,0.35)" />
                              <stop offset="100%" stopColor="rgba(0,255,198,0.05)" />
                            </linearGradient>
                            <linearGradient id="sparkFillNeg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(255,51,85,0.35)" />
                              <stop offset="100%" stopColor="rgba(255,51,85,0.05)" />
                            </linearGradient>
                            <linearGradient id="sparkStrokePos" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={COLORS.profit} />
                              <stop offset="100%" stopColor={COLORS.profitDeep} />
                            </linearGradient>
                            <linearGradient id="sparkStrokeNeg" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={COLORS.loss} />
                              <stop offset="100%" stopColor={COLORS.lossWarm} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke={COLORS.gridDark} vertical={false} />
                          <XAxis dataKey="idx" hide />
                          <YAxis hide />
                          <Tooltip
                            cursor={false}
                            contentStyle={{
                              background: "rgba(17,24,39,0.9)",
                              border: "none",
                              borderRadius: 10,
                              color: COLORS.textLightOnDark,
                              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
                            }}
                            formatter={(v) => [fmtMoney(v), "Equity"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="equity"
                            stroke="none"
                            fill={selectedPnL >= 0 ? "url(#sparkFillPos)" : "url(#sparkFillNeg)"}
                            isAnimationActive
                            animationDuration={900}
                          />
                          <Line
                            type="monotone"
                            dataKey="equity"
                            stroke={selectedPnL >= 0 ? "url(#sparkStrokePos)" : "url(#sparkStrokeNeg)"}
                            strokeWidth={3}
                            dot={(props) => (
                              <PulseDot cx={props.cx} cy={props.cy} r={2.8} positive={selectedPnL >= 0} />
                            )}
                            activeDot={{ r: 5 }}
                            isAnimationActive
                            animationDuration={900}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border p-3" style={{ borderColor: borderCol }}>
                    <div className="text-sm mb-2 opacity-80">Trades</div>
                    {selectedTrades.length === 0 ? (
                      <div className="text-sm opacity-70">No trades.</div>
                    ) : (
                      <div className="space-y-2">
                        {selectedTrades
                          .sort((a, b) => (a.entry_time || "").localeCompare(b.entry_time || ""))
                          .map((t) => {
                            const pos = Number(t.pnl) >= 0;
                            return (
                              <div
                                key={t.id}
                                className="flex items-center justify-between rounded-lg px-3 py-2"
                                style={{
                                  background: pos ? "rgba(0,255,198,0.10)" : "rgba(255,51,85,0.10)",
                                  color: pos ? "#c1f3d3" : "#fecaca",
                                }}
                              >
                                <div className="text-sm">
                                  <div className="font-semibold">{t.ticker}</div>
                                  <div className="opacity-80 text-xs">
                                    {t.entry_time || "—"} • R:R {t.final_rr ?? "—"}
                                  </div>
                                </div>
                                <div className="text-sm font-semibold">{fmtMoney(Number(t.pnl) || 0)}</div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------- small components -------------------------- */

function SummaryCard({ title, children, theme }) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 backdrop-blur shadow"
      style={{
        background: theme === "dark" ? "rgba(21,25,34,0.7)" : "#fff",
        borderColor: theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
      }}
    >
      <p className="text-xs opacity-70">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ChartCard({ title, children, theme }) {
  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 backdrop-blur shadow"
      style={{
        background: theme === "dark" ? "rgba(21,25,34,0.7)" : "#fff",
        borderColor: theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
      }}
    >
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">{title}</h2>
      {children}
    </div>
  );
}
