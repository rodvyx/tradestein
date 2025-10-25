import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "./lib/supabaseClient";

import Auth from "./pages/Auth";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import Dashboard from "./components/dashboard2/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Replay from "./pages/Replay";
import ResetPassword from "./pages/ResetPassword";
import Verified from "./pages/Verified";

import BottomNav from "./components/Layout/BottomNav";
import AnimatedPageWrapper from "./components/Layout/AnimatedPageWrapper";
import { useAuth } from "./lib/useAuth";
import NeonLoader from "./components/ui/NeonLoader";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [recoveryMode, setRecoveryMode] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [suppressRedirect, setSuppressRedirect] = useState(false);

  // ✅ Handle Supabase verification & recovery hashes
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace("#", "?"));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    // 🔹 Ensure React Router takes over — clear the hash before render
    if (type) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // ✅ Handle signup verification
    if (type === "signup" && access_token) {
      setSuppressRedirect(true);
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => {
          console.log("✅ Supabase session set for signup verification");
          navigate("/verified", { replace: true });
        })
        .catch((err) => {
          console.error("❌ Failed to set session:", err);
          navigate("/auth");
        });
    }

    // ✅ Handle password recovery
    if (type === "recovery" && access_token) {
      setSuppressRedirect(true);
      setRecoveryMode(true);
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => navigate("/reset-password", { replace: true }))
        .catch(console.error);
    }
  }, [navigate]);

  // ✅ Redirect after login (skip if verification or recovery is ongoing)
  useEffect(() => {
    if (!loading && user && !redirected && !recoveryMode && !suppressRedirect) {
      if (location.pathname === "/auth" || location.pathname === "/") {
        setRedirected(true);
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, redirected, navigate, recoveryMode, suppressRedirect, location.pathname]);

  // ✅ Page transition loader
  useEffect(() => {
    setPageLoading(true);
    const t = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // ✅ Loader while checking auth
  if (loading) return <NeonLoader text="Checking authentication..." />;

  // ✅ Loader between routes
  if (pageLoading && user) {
    const current = location.pathname.replace("/", "") || "dashboard";
    return <NeonLoader text={`Loading ${current}...`} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col">
      <AnimatePresence mode="wait">
        <AnimatedPageWrapper key={location.pathname}>
          <Routes location={location}>
            {/* Default route */}
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />}
            />

            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verified" element={<Verified />} />

            {/* Protected routes */}
            {user && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/replay" element={<Replay />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </>
            )}

            {/* Fallbacks */}
            {!user && (
              <Route
                path="*"
                element={
                  location.pathname === "/verified" ? (
                    <Verified />
                  ) : (
                    <Navigate to="/auth" replace />
                  )
                }
              />
            )}
          </Routes>
        </AnimatedPageWrapper>
      </AnimatePresence>

      {/* Bottom nav only for logged-in users */}
      {user && !recoveryMode && <BottomNav />}
    </div>
  );
}
