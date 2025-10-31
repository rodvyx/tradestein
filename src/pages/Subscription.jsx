import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle, Loader2 } from "lucide-react";

export default function Subscription() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const LEMON_CHECKOUT = "https://tradestein.lemonsqueezy.com/buy/9150a66d-7fb8-4438-96bc-84e6fd350d59";

  // ✅ Check if user exists and has a valid subscription (Supabase placeholder)
  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Replace with your subscription tracking table in Supabase later
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .eq("active", true)
        .single();

      if (data && !error) {
        setIsSubscribed(true);
      } else {
        setIsSubscribed(false);
      }
      setChecking(false);
    };

    checkSubscription();
  }, []);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-white">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mb-4" />
        <p>Checking your subscription status...</p>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-white text-center px-6">
        <CheckCircle className="text-emerald-400 h-14 w-14 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">You’re already subscribed 🎉</h1>
        <p className="text-gray-400 mb-6">Enjoy unlimited access to your Tradestein Pro tools.</p>
        <motion.button
          onClick={() => navigate("/dashboard")}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all"
        >
          Go to Dashboard
        </motion.button>
      </div>
    );
  }

  // 🧭 Payment Screen (for non-subscribers)
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-[#0D1117]/70 border border-emerald-400/20 rounded-3xl p-8 text-center backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.25)]"
      >
        <CreditCard className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Subscribe to Tradestein Pro</h1>
        <p className="text-gray-400 mb-6">
          Gain full access to all analytics, journal insights, and goal tracking for just{" "}
          <span className="text-emerald-400 font-semibold">$3.99/month</span>.
        </p>

        <motion.a
          href={LEMON_CHECKOUT}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all"
        >
          <CreditCard size={18} />
          Subscribe Now
        </motion.a>

        <p className="text-xs text-gray-500 mt-4">
          Secure payments powered by Lemon Squeezy.
        </p>
      </motion.div>
    </div>
  );
}
