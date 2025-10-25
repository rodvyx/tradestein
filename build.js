import { build } from "vite";

(async () => {
  try {
    console.log("🚀 Starting Vite production build...");
    await build();
    console.log("✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
})();
