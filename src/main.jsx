import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// ✅ Register service worker using Vite PWA plugin
import { registerSW } from "virtual:pwa-register";

// Automatically handle updates & offline
registerSW({
  onNeedRefresh() {
    if (confirm("🚀 New version available! Refresh now?")) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log("✅ App ready to work offline!");
  },
});

// ✅ Global Toast Notifications Provider
import { ToastProvider } from "./components/ui/ToastProvider.jsx";

// ✅ Render app
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
