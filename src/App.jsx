import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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
import Landing from "./pages/Landing";

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
  const [showLanding, setShowLanding] = useState(false);
  const [bootingUp, setBootingUp] = useState(false);

  // ✅ Show landing once per session
  useEffect(() => {
    const hasSeenLanding = sessionStorage.getItem("hasSeenLanding");
    if (!hasSeenLanding) {
      setShowLanding(true);
      sessionStorage.setItem("hasSeenLanding", "true");
    }
  }, []);

  // ✅ Handle Supabase verification & recovery
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace("#", "?"));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const type = params.get("type");

    if (type) window.history.replaceState({}, document.title, window.location.pathname);

    if (type === "signup" && access_token) {
      setSuppressRedirect(true);
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => navigate("/verified", { replace: true }))
        .catch((err) => {
          console.error("❌ Failed to set session:", err);
          navigate("/auth");
        });
    }

    if (type === "recovery" && access_token) {
      setSuppressRedirect(true);
      setRecoveryMode(true);
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(() => navigate("/reset-password", { replace: true }))
        .catch(console.error);
    }
  }, [navigate]);

  // ✅ Smooth redirect after login (with boot animation)
  useEffect(() => {
    if (
      !loading &&
      user &&
      !redirected &&
      !recoveryMode &&
      !suppressRedirect &&
      !["/verified", "/reset-password"].includes(location.pathname)
    ) {
      if (location.pathname === "/auth" || location.pathname === "/") {
        setRedirected(true);
        setBootingUp(true);

        // Simulate “system boot”
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
          setBootingUp(false);
        }, 2200);
      }
    }
  }, [user, loading, redirected, navigate, recoveryMode, suppressRedirect, location.pathname]);

  // ✅ Page loader — smoother transition (extended to 1.2s)
  useEffect(() => {
    setPageLoading(true);

    const t = setTimeout(() => setPageLoading(false), 1200); // 🔥 smoother load timing
    return () => clearTimeout(t);
  }, [location.pathname]);

  // ✅ Loader while checking auth
  if (loading) return <NeonLoader text="Checking authentication..." />;

  // ✅ Landing screen (smooth fade into Auth)
  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[#0A0A0B]"
          >
            <Landing
              onFinish={() => {
                // Smooth fade delay before showing auth
                setTimeout(() => setShowLanding(false), 300);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ✅ Boot loader before dashboard
  if (bootingUp) return <NeonLoader text="Initializing Trading Environment..." />;

  // ✅ Page loader between routes
  if (pageLoading && user) {
    const current = location.pathname.replace("/", "") || "dashboard";
    return <NeonLoader text={`Loading ${current}...`} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col transition-all duration-500">
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

            {/* Fallback */}
            {!user && (
              <Route
                path="*"
                element={
                  location.pathname === "/verified" ? <Verified /> : <Navigate to="/auth" replace />
                }
              />
            )}
          </Routes>
        </AnimatedPageWrapper>
      </AnimatePresence>

      {/* ✅ Bottom nav */}
      {user &&
        !recoveryMode &&
        !["/auth", "/verified", "/reset-password"].includes(location.pathname) && <BottomNav />}
    </div>
  );
}
