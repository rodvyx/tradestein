import React from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2 } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-[#0F131A] border border-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.2)] rounded-3xl p-10 max-w-lg w-full"
      >
        <h1 className="text-3xl font-bold text-emerald-400 mb-4">
          Upgrade to Tradestein Pro
        </h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          Gain full access to your <span className="text-emerald-400">trading journal</span>, 
          advanced analytics, goals tracking, and performance psychology tools.
        </p>

        <div className="flex flex-col items-center mb-8">
          <h2 className="text-4xl font-extrabold text-white">$3.99<span className="text-gray-400 text-lg">/month</span></h2>
          <p className="text-gray-400 text-sm mt-2">No free trial. Serious traders only.</p>
        </div>

        <div className="space-y-3 text-gray-300 text-left mb-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
            <span>Unlimited journal entries</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
            <span>Advanced analytics & trade insights</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
            <span>Goal tracking & performance metrics</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
            <span>Full psychology dashboard access</span>
          </div>
        </div>

        <a
          href="https://tradestein.lemonsqueezy.com/buy/9150a66d-7fb8-4438-96bc-84e6fd350d59"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/20 w-full"
        >
          <CreditCard size={18} />
          Subscribe Now
        </a>

        <p className="text-xs text-gray-500 mt-6">
          Cancel anytime. No hidden fees. Your access is tied to your active subscription.
        </p>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-gray-600 text-sm"
      >
        © {new Date().getFullYear()} Tradestein. Built for traders, not tourists.
      </motion.footer>
    </div>
  );
}
