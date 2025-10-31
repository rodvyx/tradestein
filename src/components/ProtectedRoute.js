// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // not logged in
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // check subscription status
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        setAuthorized(false);
      } else {
        setAuthorized(data?.subscription_status === "active");
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return <div className="text-center text-white mt-20">Loading...</div>;

  return authorized ? children : <Navigate to="/cancelled" replace />;
}
