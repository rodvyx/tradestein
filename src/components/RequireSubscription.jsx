import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import NeonLoader from "./ui/NeonLoader";

export default function RequireSubscription({ user }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    async function check() {
      if (!user) {
        setStatus("none");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("email", user.email)
        .single();

      if (error || !data) {
        console.error("❌ Error loading subscription:", error);
        setStatus("inactive");
        return;
      }

      setStatus(data.subscription_status || "inactive");
    }

    check();
  }, [user]);

  if (status === "checking") {
    return <NeonLoader text="Checking subscription status..." />;
  }

  if (status !== "active") {
    console.warn("⛔ Subscription inactive, redirecting...");
    return <Navigate to="/subscribe" replace />;
  }

  return <Outlet />;
}
