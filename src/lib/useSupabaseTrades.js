import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import dayjs from "dayjs";

/**
 * Handles trades syncing with Supabase.
 * Keeps local and remote states unified and reacts to real-time DB changes.
 */
export function useSupabaseTrades(userId) {
  const [trades, setTrades] = useState({});
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error

  useEffect(() => {
    if (!userId) return;

    const fetchTrades = async () => {
      try {
        setSyncStatus("syncing");
        const { data, error } = await supabase
          .from("trades")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: true });

        if (error) throw error;

        const formatted = data.reduce((acc, t) => {
          const dateKey = dayjs(t.date).format("YYYY-MM-DD");
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(t);
          return acc;
        }, {});

        setTrades(formatted);
        localStorage.setItem("trades", JSON.stringify(formatted));
        setSyncStatus("synced");
        setTimeout(() => setSyncStatus("idle"), 1000);
      } catch (err) {
        console.error("Error fetching trades:", err);
        setSyncStatus("error");
      }
    };

    fetchTrades();

    const channel = supabase
      .channel("trades-hook")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `user_id=eq.${userId}`,
        },
        fetchTrades
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId]);

  const saveTrade = async (trade) => {
    if (!userId) return;
    setSyncStatus("syncing");

    const newTrade = {
      user_id: userId,
      date: trade.date || dayjs().format("YYYY-MM-DD"),
      ticker: trade.ticker,
      entry_time: trade.entry_time || null,
      exit_time: trade.exit_time || null,
      pnl: trade.pnl ?? 0,
      final_rr: trade.final_rr ?? null,
      confluences: trade.confluences || null,
      done_right: trade.done_right || null,
      done_wrong: trade.done_wrong || null,
      what_to_improve: trade.what_to_improve || trade.note || null,
      entry_chart: trade.entry_chart || null,
      htf_chart: trade.htf_chart || null,
      emotions: trade.emotions || null,
      screenshot_url: trade.screenshot_url || null,
      created_at: dayjs().toISOString(),
    };

    const { error } = await supabase.from("trades").insert([newTrade]);

    if (error) {
      console.error("Supabase insert error:", error);
      setSyncStatus("error");
    } else {
      await updateUserStreak(userId);
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 1000);
    }
  };

  const updateUserStreak = async (userId) => {
    try {
      const { data: tradesData, error } = await supabase
        .from("trades")
        .select("date")
        .eq("user_id", userId)
        .order("date", { ascending: true });

      if (error || !tradesData) throw error;

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
        } else if (diff > 1) currentStreak = 1;
      }

      await supabase
        .from("profiles")
        .update({
          current_streak: currentStreak,
          max_streak: maxStreak,
          updated_at: new Date(),
        })
        .eq("id", userId);

      console.log("🔥 Updated streaks:", { currentStreak, maxStreak });
    } catch (err) {
      console.error("Error updating streaks:", err);
    }
  };

  return { trades, saveTrade, syncStatus };
}
