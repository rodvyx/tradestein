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

import BottomNav from "./components/Layout/BottomNav";
import AnimatedPageWrapper from "./components/Layout/AnimatedPageWrapper";
import { useAuth } from "./lib/useAuth";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [recoveryMode, setRecoveryMode] = useState(false);
  const [redirected, setRedirected] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // ✅ Handle password recovery links
  useEffect(() => {
    const handleRecoveryLink = async () => {
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        setRecoveryMode(true);
        const params = new URLSearchParams(hash.replace("#", "?"));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error) navigate("/reset-password", { replace: true });
        }
      }
    };
    handleRecoveryLink();
  }, [navigate]);

  // ✅ Only redirect ONCE after login — no bouncing on Replay etc.
  useEffect(() => {
    if (!loading && user && !redirected && !recoveryMode) {
      setRedirected(true);
      if (location.pathname === "/auth" || location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, redirected, navigate, recoveryMode, location.pathname]);

  // ✅ Smooth loading animation between pages
  useEffect(() => {
    setPageLoading(true);
    const timer = setTimeout(() => setPageLoading(false), 600); // slightly longer for fade
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // ✅ Global loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0A0B] text-gray-400">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  // ✅ Page loading fade-in/out (on route change)
  if (pageLoading && user) {
    return (
      <motion.div
        key="page-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center h-screen bg-[#0A0A0B]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-10 w-10 border-2 border-emerald-400 border-t-transparent rounded-full mb-4"
        />
        <p className="text-sm text-gray-400">
          Loading {location.pathname.replace("/", "") || "dashboard"}...
        </p>
      </motion.div>
    );
  }

  // ✅ Normal app content
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white relative flex flex-col">
      <AnimatePresence mode="wait">
        <AnimatedPageWrapper key={location.pathname}>
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            {user ? (
              <>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/replay" element={<Replay />} /> {/* ✅ Replay stays stable */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
              </>
            ) : (
              <Route path="*" element={<Navigate to="/auth" replace />} />
            )}
          </Routes>
        </AnimatedPageWrapper>
      </AnimatePresence>

      {/* ✅ Bottom Nav for logged-in users */}
      {user && !recoveryMode && <BottomNav />}
    </div>
  );
}
