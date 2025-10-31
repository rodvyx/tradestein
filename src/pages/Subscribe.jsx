// src/pages/Subscribe.jsx
import React from "react";
import { motion } from "framer-motion";
import ParticlesBg from "../components/ParticlesBg";

const CHECKOUT_URL =
  "https://tradestein.lemonsqueezy.com/buy/9150a66d-7fb8-4438-96bc-84e6fd350d59";

export default function Subscribe() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
      <ParticlesBg />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#0E1218]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
      >
        <h1 className="text-3xl font-bold text-emerald-400 mb-2">
          Tradestein Pro
        </h1>
        <p className="text-gray-300 mb-6">
          Access analytics, goals tracking, and psychology tools. To continue,
          activate your subscription.
        </p>

        <ul className="text-sm text-gray-300 space-y-2 mb-8 list-disc pl-5">
          <li>Full access to Dashboard, Journal, Analytics, Calendar, Goals</li>
          <li>Cancel anytime</li>
          <li>Secure checkout via Lemon Squeezy</li>
        </ul>

        <a
          href={CHECKOUT_URL}
          className="inline-flex items-center justify-center w-full rounded-xl px-4 py-3 bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition shadow-[0_0_20px_rgba(16,185,129,0.35)]"
        >
          Continue to Secure Checkout – $3.99/mo
        </a>

        <p className="text-xs text-gray-500 mt-4">
          After purchase, click the button on the confirmation modal to return
          to the app. Your access becomes active as soon as the payment
          processes (handled by the webhook).
        </p>
      </motion.div>
    </div>
  );
}
