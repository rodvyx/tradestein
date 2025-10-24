import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import EditTradeModal from "../components/EditTradeModal";

const TradeModalContext = createContext(null);

export function TradeModalProvider({ children }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [trade, setTrade] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  const openEdit = (t) => {
    setTrade(t || null);
    setOpen(true);
  };
  const closeEdit = () => setOpen(false);

  return (
    <TradeModalContext.Provider value={{ openEdit }}>
      {children}
      {/* Modal lives here so any page can open it */}
      <EditTradeModal
        isOpen={open}
        onClose={closeEdit}
        trade={trade}
        userId={user?.id || null}
      />
    </TradeModalContext.Provider>
  );
}

export function useTradeModal() {
  const ctx = useContext(TradeModalContext);
  if (!ctx) throw new Error("useTradeModal must be used within TradeModalProvider");
  return ctx;
}
