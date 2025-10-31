// src/lib/useSubscription.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useSubscription(user) {
  const [status, setStatus] = useState("checking"); // "checking" | "active" | "inactive" | "none"
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user) {
        setStatus("none");
        setProfile(null);
        return;
      }

      // Ensure a profile row exists (safe upsert)
      // If you already do this elsewhere, you can remove this block.
      await supabase
        .from("profiles")
        .upsert(
          { id: user.id, email: user.email, subscription_status: "inactive" },
          { onConflict: "id" }
        )
        .select()
        .single()
        .then(async ({ data }) => {
          // Re-fetch to be sure we have latest status (webhook may have updated)
          const { data: p } = await supabase
            .from("profiles")
            .select("id,email,subscription_status,subscription_id")
            .eq("id", user.id)
            .single();

          if (cancelled) return;
          setProfile(p);
          setStatus(p?.subscription_status === "active" ? "active" : "inactive");
        })
        .catch(() => {
          if (!cancelled) setStatus("inactive");
        });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { status, profile };
}
