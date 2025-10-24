import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // ⚙️ Progressive Web App Configuration
    VitePWA({
      registerType: "autoUpdate", // Auto-update SW when new version is available
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "masked-icon.svg",
      ],

      manifest: {
        name: "Tradestein Journal",
        short_name: "Tradestein",
        description:
          "A futuristic neon trading journal that helps you track, analyze, and replay your trades — powered by Tradestein.",
        theme_color: "#10b981", // Emerald glow
        background_color: "#0A0A0B", // Deep black background
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "en",
        categories: ["productivity", "finance", "trading", "journal"],

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      // 🔥 Enable advanced caching for faster loads
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],

  // 🧱 Optional: smoother local dev for mobile testing
  server: {
    host: true,
    port: 5173,
  },
});
