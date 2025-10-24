import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 2500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 40, x: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-500/15 border border-red-500/40 text-red-400"
                : "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
            }`}
          >
            {toast.type === "error" ? (
              <XCircle size={20} className="drop-shadow-[0_0_8px_#f87171]" />
            ) : (
              <CheckCircle size={20} className="drop-shadow-[0_0_8px_#10b981]" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
