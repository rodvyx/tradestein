import React, { createContext, useContext, useState, useCallback } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);

  const show = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2200);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {msg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-xl shadow bg-black text-white text-sm">
            {msg}
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
