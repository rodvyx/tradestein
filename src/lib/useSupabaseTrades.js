import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import dayjs from "dayjs";

/**
 * useSupabaseTrades — Handles trade syncing, real-time updates, and streak tracking.
 * Ensures safe execution order (no hook violations) and graceful fallbacks.
 */
export function useSupabaseTrades(userId) {
  const [trades, setTrades] = useState({});
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error

  // ✅ Fetch trades for current user
  const fetchTrades = useCallback(async () => {
    if (!userId) return;
    setSyncStatus("syncing");

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("❌ Error fetching trades:", error);
      setSyncStatus("error");
      return;
    }

    // Group by date
    const formatted = data.reduce((acc, t) => {
      const dateKey = dayjs(t.date).format("YYYY-MM-DD");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(t);
      return acc;
    }, {});

    setTrades(formatted);
    localStorage.setItem("trades", JSON.stringify(formatted));
    setSyncStatus("synced");
    setTimeout(() => setSyncStatus("idle"), 1200);
  }, [userId]);

  // ✅ Initial + real-time sync
  useEffect(() => {
    if (!userId) return;

    fetchTrades();

    const channel = supabase
      .channel("trades-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchTrades()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, fetchTrades]);

  // ✅ Save a new trade
  const saveTrade = useCallback(
    async (trade) => {
      if (!userId) return;
      setSyncStatus("syncing");

      const newTrade = {
        user_id: userId,
        date: trade.date || dayjs().format("YYYY-MM-DD"),
        ticker: trade.ticker || "N/A",
        entry_time: trade.entry_time || null,
        exit_time: trade.exit_time || null,
        pnl: trade.pnl ?? 0,
        final_rr: trade.final_rr ?? null,
        confluences: trade.confluences || null,
        emotions: trade.emotions || null,
        done_right: trade.done_right || null,
        done_wrong: trade.done_wrong || null,
        what_to_improve: trade.what_to_improve || trade.note || null,
        entry_chart: trade.entry_chart || null,
        htf_chart: trade.htf_chart || null,
        screenshot_url: trade.screenshot_url || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("trades").insert([newTrade]);

      if (error) {
        console.error("❌ Supabase insert error:", error);
        setSyncStatus("error");
      } else {
        console.log("✅ Trade saved successfully");
        await updateUserStreak(userId);
        fetchTrades();
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 1200);
      }
    },
    [userId, fetchTrades]
  );

  return { trades, saveTrade, syncStatus };
}

/* ───────── 🔥 Utility Function: Update user streaks ───────── */
async function updateUserStreak(userId) {
  const { data: tradesData, error } = await supabase
    .from("trades")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error || !tradesData) {
    console.error("Error fetching trades for streak:", error);
    return;
  }

  const uniqueDates = [...new Set(tradesData.map((t) => t.date))].sort();
  if (uniqueDates.length === 0) return;

  let currentStreak = 1;
  let maxStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = dayjs(uniqueDates[i - 1]);
    const curr = dayjs(uniqueDates[i]);
    const diff = curr.diff(prev, "day");

    if (diff === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diff > 1) {
      currentStreak = 1;
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      current_streak: currentStreak,
      max_streak: maxStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError)
    console.error("⚠️ Error updating streaks:", updateError);
  else
    console.log("🔥 Updated streaks:", { currentStreak, maxStreak });
}
