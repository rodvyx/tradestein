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

  // Fetch trades for the current user
  useEffect(() => {
    if (!userId) return;

    const fetchTrades = async () => {
      setSyncStatus("syncing");
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching trades:", error);
        setSyncStatus("error");
      } else {
        // group by date for journal display
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
      }
    };

    fetchTrades();

    // Supabase realtime channel
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

  /**
   * Save a new trade to Supabase
   */
  const saveTrade = async (trade) => {
    if (!userId) return;
    setSyncStatus("syncing");

    // ✅ Clean and match DB schema exactly
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
      what_to_improve: trade.what_to_do || trade.note || null,
      entry_chart: trade.entry_chart || null,
      htf_chart: trade.htf_chart || null,
      emotions: null, // optional, reserved for later
      screenshot_url: null, // optional, reserved for later
      created_at: dayjs().toISOString(),
    };

    const { error } = await supabase.from("trades").insert([newTrade]);

    if (error) {
      console.error("Supabase insert error:", error);
      setSyncStatus("error");
    } else {
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 1000);
    }
  };

  return { trades, saveTrade, syncStatus };
}
