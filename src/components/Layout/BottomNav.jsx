import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  BarChart3,
  Calendar,
  BookOpen,
  User,
  Settings,
  Eye,
  EyeOff,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const [showToggle, setShowToggle] = useState(true);
  const [scrollDir, setScrollDir] = useState("up");

  // 🧭 Scroll direction detection (hide nav on scroll down)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastScrollY) < 10) {
        ticking = false;
        return;
      }
      setScrollDir(scrollY > lastScrollY ? "down" : "up");
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 👁️ Auto-hide Eye button
  useEffect(() => {
    let hideTimer;
    const handleMove = () => {
      setShowToggle(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setShowToggle(false), 3000);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchstart", handleMove);
    hideTimer = setTimeout(() => setShowToggle(false), 3000);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchstart", handleMove);
      clearTimeout(hideTimer);
    };
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/journal", label: "Journal", icon: BookOpen },
    { path: "/goals", label: "Goals", icon: Target },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* 👁️ Toggle visibility */}
      <AnimatePresence>
        {showToggle && (
          <motion.button
            onClick={() => setVisible(!visible)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-4 z-[80] p-3 rounded-full bg-[#0b0e13]/80 backdrop-blur-lg 
            border border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-[#101318] transition"
          >
            {visible ? (
              <EyeOff className="text-emerald-400 h-5 w-5" />
            ) : (
              <Eye className="text-emerald-400 h-5 w-5" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 🌌 Floating Bottom Navigation */}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="nav-container"
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: scrollDir === "down" ? 120 : 0,
              opacity: scrollDir === "down" ? 0 : 1,
            }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="fixed bottom-6 left-0 w-full flex justify-center z-[70]"
          >
            <div
              className="relative w-[98vw] sm:w-[95vw] md:w-[74vw] lg:w-[45vw]
              flex items-center justify-between px-4 py-2 rounded-2xl
              bg-[#0A0A0B]/95 backdrop-blur-xl border border-emerald-400/15 
              shadow-[0_0_30px_rgba(16,185,129,0.25)] mx-auto"
            >
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path;

                // 🌟 Glowing Goals Button
                if (label === "Goals") {
                  return (
                    <button
                      key={path}
                      onClick={() => navigate("/goals")}
                      className="flex flex-col items-center justify-center text-[11px] sm:text-xs relative min-w-[36px]"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-emerald-500/25 blur-lg"
                      />
                      <Icon className="relative z-10 h-5 w-5 mb-0.5 text-emerald-400" />
                      <span className="relative z-10 font-medium text-emerald-400">
                        {label}
                      </span>
                    </button>
                  );
                }

                // Default nav buttons
                return (
                  <NavLink
                    key={path}
                    to={path}
                    className="flex flex-col items-center justify-center text-[11px] sm:text-xs relative min-w-[36px]"
                  >
                    {active && (
                      <motion.span
                        layoutId="active-ring"
                        className="absolute inset-0 m-auto h-7 w-7 rounded-full bg-emerald-400/10 ring-2 ring-emerald-400/40"
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                      />
                    )}
                    <Icon
                      className={`relative z-10 h-5 w-5 mb-0.5 transition-all ${
                        active
                          ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`relative z-10 font-medium ${
                        active ? "text-emerald-400" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
