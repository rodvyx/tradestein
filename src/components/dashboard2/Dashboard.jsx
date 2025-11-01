import React, { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Quote, Plus, ChevronDown, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useSupabaseTrades } from "../../lib/useSupabaseTrades";
import CumulativeGraph from "./CumulativeGraph";
import RecentTradesModern from "./RecentTradesModern";
import AddTradeModal from "./AddTradeModal";
import NeonLoader from "../ui/NeonLoader";

export default function Dashboard() {
  // ─────────────────────────── ROUTER & STATE
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const menuRef = useRef(null);

  // ✅ Call the custom hook UNCONDITIONALLY (even if user is null)
  const { trades, syncStatus, saveTrade } = useSupabaseTrades(user?.id);

  // ─────────────────────────── DATA DERIVED FROM TRADES
  // (Call useMemo BEFORE any possible early return so hooks order is stable)
  const flatTrades = useMemo(() => {
    if (!trades) return [];
    return Object.values(trades).flat();
  }, [trades]);

  // ─── Metrics
  const totalProfit = flatTrades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const totalTrades = flatTrades.length;
  const winningTrades = flatTrades.filter((t) => Number(t.pnl) > 0).length;
  const avgRR =
    flatTrades.reduce((s, t) => s + (Number(t.final_rr) || 0), 0) /
    (totalTrades || 1);
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // ─── Daily Snapshot
  const today = new Date().toISOString().split("T")[0];
  const todayTrades = flatTrades.filter((t) => t.date === today);
  const todayPL = todayTrades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const hour = new Date().getUTCHours();
  const session =
    hour >= 6 && hour < 15 ? "London" : hour >= 12 && hour < 21 ? "New York" : "Asia";

  // ─── Psychology
  const lastTrade = flatTrades[flatTrades.length - 1];
  const lastEmotion = lastTrade?.emotions || "😊 Calm / Focused";
  const discipline = lastTrade ? "✅" : "—";

  // ─── Quote
  const quotes = [
    "Stay consistent, not perfect.",
    "Discipline is your true edge.",
    "Process first. Profit follows.",
    "Small edges, compounded daily.",
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  // ─────────────────────────── EFFECTS (NO HOOKS INSIDE CONDITIONS)
  // Show success/renewal banner if redirected with state
  useEffect(() => {
    if (location.state?.showRenewalBanner) {
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 4000);
      // clear the state so it doesn't persist
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch current user once
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchUser();
  }, []);

  // Check subscription when user loads
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) return; // wait for user
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_status, updated_at")
        .eq("email", user.email)
        .single();

      if (error) {
        console.error("Error checking subscription:", error);
        setLoading(false);
        return;
      }

      if (data?.subscription_status === "active") {
        setLoading(false);

        // Banner if recently renewed/updated
        const recentlyRenewed = sessionStorage.getItem("recentlyRenewed");
        const updatedAt = new Date(data?.updated_at || new Date());
        const hoursSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60);

        if (recentlyRenewed === "true" || hoursSinceUpdate < 24) {
          setShowBanner(true);
          sessionStorage.removeItem("recentlyRenewed");
          setTimeout(() => setShowBanner(false), 4000);
        }
      } else if (data?.subscription_status === "cancelled") {
        setRedirecting(true);
        // keep SPA navigation
        setTimeout(() => navigate("/cancelled", { replace: true }), 1200);
      } else {
        // non-active but not explicitly cancelled → gate behind RequireSubscription anyway
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user, navigate]);

  // Realtime subscription updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime:profiles")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `email=eq.${user.email}`,
        },
        (payload) => {
          const newStatus = payload.new.subscription_status;
          if (newStatus === "active") {
            sessionStorage.setItem("recentlyRenewed", "true");
            setRedirecting(true);
            setTimeout(() => navigate("/renewed", { replace: true }), 1200);
          } else if (newStatus !== "active") {
            setRedirecting(true);
            setTimeout(() => navigate("/cancelled", { replace: true }), 1200);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  // Close avatar menu on outside click
  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ─────────────────────────── HANDLERS
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  // ─────────────────────────── OPTIONAL LOADERS (hooks already ran above)
  if (redirecting) return <NeonLoader text="Checking subscription..." />;
  if (loading) return <NeonLoader text="Loading dashboard..." />;

  // ─────────────────────────── UI
  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white p-6 flex flex-col overflow-hidden">
      {/* ✅ ACCESS RESTORED BANNER */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-slate-900 font-semibold px-6 py-2 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.45)] z-[100]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={18} />
              🎉 Pro Access Restored — Welcome back!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-emerald-400 drop-shadow">Tradestein</h1>

        <div className="flex items-center gap-4">
          <SyncStatusIndicator status={syncStatus} />

          {user && (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-3 glass-card px-3 py-2 rounded-2xl hover:border-emerald-500/40 transition"
              >
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium leading-tight">
                    {user.email?.split("@")[0]}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-tight">Active Trader</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-2 w-44 glass-card rounded-xl border border-neutral-800 overflow-hidden z-20"
                  >
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <ItemBtn>View Profile</ItemBtn>
                    </Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)}>
                      <ItemBtn>Settings</ItemBtn>
                    </Link>
                    <div className="h-px bg-white/10" />
                    <ItemBtn danger onClick={handleLogout}>Logout</ItemBtn>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Metric title="Total Profit" value={`$${totalProfit.toFixed(2)}`} />
        <Metric title="Win Rate" value={`${winRate.toFixed(1)}%`}>
          <WinRateRing percentage={winRate} />
        </Metric>
        <Metric title="Avg R:R" value={avgRR.toFixed(2)} />
        <Metric title="Total Trades" value={totalTrades} />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CumulativeGraph trades={flatTrades} />
        </Card>
        <Card>
          <RecentTradesModern trades={flatTrades} />
        </Card>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto">
        <Card>
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Daily Snapshot</h2>
          <div className="space-y-2 text-sm">
            <p>
              Today’s P/L:{" "}
              <span
                className={`font-semibold ${
                  todayPL >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {todayPL >= 0 ? "+" : ""}${todayPL.toFixed(2)}
              </span>
            </p>
            <p>Trades Today: {todayTrades.length}</p>
            <p>Session: {session}</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Psychology</h2>
          <div className="space-y-2 text-sm">
            <p>
              Last Trade Emotion:{" "}
              <span className="text-yellow-400 font-medium">{lastEmotion}</span>
            </p>
            <p>
              Discipline: <span className="text-emerald-400 font-medium">{discipline}</span>
            </p>
          </div>
        </Card>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-card rounded-2xl p-5 flex items-center justify-between border border-emerald-400/20"
        >
          <div className="flex items-center gap-3">
            <Quote className="text-emerald-400 w-5 h-5" />
            <p className="italic text-gray-200 text-sm">{quote}</p>
          </div>
          <p className="text-emerald-500 font-bold text-xl">★</p>
        </motion.div>
      </div>

      {/* ADD TRADE */}
      <AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          className="fixed bottom-6 right-6 bg-emerald-500 text-white rounded-full shadow-lg p-4 hover:bg-emerald-600 focus:outline-none"
          onClick={() => setShowAdd(true)}
          aria-label="Add Trade"
          title="Add Trade"
        >
          <Plus size={24} />
        </motion.button>
      </AnimatePresence>

      <AddTradeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={async (payload) => {
          await saveTrade(payload);
          setShowAdd(false);
        }}
      />
    </div>
  );
}

/* ───────── Components ───────── */
const Metric = ({ title, value, children }) => (
  <div className="glass-card rounded-2xl p-5 border border-neutral-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all relative overflow-hidden">
    <div>
      <h2 className="text-gray-400 text-sm">{title}</h2>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <p className="text-xs text-emerald-400 mt-1">Live</p>
    </div>
    {children}
  </div>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`glass-card p-5 rounded-2xl border border-neutral-800 hover:border-emerald-500/40 transition-all ${className}`}
  >
    {children}
  </div>
);

const ItemBtn = ({ children, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 text-sm ${
      danger ? "text-red-400 hover:bg-red-500/10" : "hover:bg-white/5"
    }`}
  >
    {children}
  </button>
);

const SyncStatusIndicator = ({ status }) => {
  const color =
    status === "syncing"
      ? "text-yellow-400"
      : status === "error"
      ? "text-red-400"
      : status === "synced"
      ? "text-emerald-400"
      : "text-gray-500";
  const text =
    status === "syncing"
      ? "Syncing…"
      : status === "error"
      ? "Sync Failed"
      : status === "synced"
      ? "Synced"
      : "Idle";
  return <p className={`text-sm ${color}`}>Sync status: {text}</p>;
};

const WinRateRing = ({ percentage }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="absolute right-4 top-4">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ boxShadow: "0 0 0px rgba(16,185,129,0.35)" }}
          animate={{
            boxShadow: [
              "0 0 0px rgba(16,185,129,0.35)",
              "0 0 18px rgba(16,185,129,0.25)",
              "0 0 0px rgba(16,185,129,0.35)",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <svg className="w-16 h-16" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={radius} stroke="#1f2937" strokeWidth="6" fill="none" />
          <motion.circle
            cx="30"
            cy="30"
            r={radius}
            stroke="#10b981"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <text x="50%" y="52%" textAnchor="middle" className="text-sm font-bold fill-white">
            {clamped.toFixed(0)}%
          </text>
        </svg>
      </div>
    </div>
  );
};

/* ───────── Glassmorphism Style ───────── */
const style = document.createElement("style");
style.innerHTML = `
.glass-card {
  background: rgba(18, 18, 18, 0.40);
  backdrop-filter: blur(12px);
  box-shadow: 0 0 25px rgba(0, 255, 200, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}
`;
document.head.appendChild(style);
