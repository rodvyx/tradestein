import React from "react";
import { supabase } from "../lib/supabaseClient";

export default function LogoutButton({ className = "" }) {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Simple, robust redirect—no Router dependency required
      window.location.href = "/auth";
    } catch (e) {
      console.error(e);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl shadow hover:bg-black"
      }
    >
      Logout
    </button>
  );
}
