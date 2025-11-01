import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabaseClient";

// Pages
import Auth from "./pages/Auth";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import Dashboard from "./components/dashboard2/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import Verified from "./pages/Verified";
import Landing from "./pages/Landing";
import Goals from "./pages/Goals";
import Cancelled from "./pages/Cancelled";
import Subscribe from "./pages/Subscribe";
import Renewed from "./pages/Renewed";

// Layout + UI
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

  // ✅ Show landing once per session (but NOT on /verified)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/verified") return; // Skip intro for verified route

    const hasSeenLanding = sessionStorage.getItem("hasSeenLanding");
    if (!hasSeenLanding) {
      setShowLanding(true);
      sessionStorage.setItem("hasSeenLanding", "true");
    }
  }, []);

  // ✅ Handle Supabase verification & recovery links
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

  // ✅ Listen for Supabase auth state change
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
          setBootingUp(false);
        }, 2200);
      }
    }
  }, [user, loading, redirected, navigate, recoveryMode, suppressRedirect, location.pathname]);

  // ✅ Page loader transition
  useEffect(() => {
    setPageLoading(true);
    const t = setTimeout(() => setPageLoading(false), 1200);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // ✅ Loader while checking auth
  if (loading) return <NeonLoader text="Checking authentication..." />;

  // ✅ Landing screen
  if (showLanding && location.pathname !== "/verified") {
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
                setTimeout(() => setShowLanding(false), 300);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ✅ Boot loader before dashboard (skip for verified route)
  if (bootingUp && location.pathname !== "/verified") {
    return <NeonLoader text="Initializing Trading Environment..." />;
  }

  // ✅ Page loader between routes
  if (pageLoading && user && location.pathname !== "/verified") {
    const current = location.pathname.replace("/", "") || "dashboard";
    return <NeonLoader text={`Loading ${current}...`} />;
  }

  // ✅ MAIN ROUTES
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
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/cancelled" element={<Cancelled />} />
            <Route path="/renewed" element={<Renewed />} />

            {/* Authenticated routes */}
            {user && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/goals" element={<Goals />} />
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
        !["/auth", "/verified", "/reset-password", "/cancelled", "/subscribe"].includes(
          location.pathname
        ) && <BottomNav />}
    </div>
  );
}
