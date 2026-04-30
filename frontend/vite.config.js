console.log("VITE CONFIG LOADED");
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  plugins: [
    react(),
  ],

  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: "all",
    headers: {
      // Bypass ngrok's browser interstitial page so assets load correctly
      "ngrok-skip-browser-warning": "true",
    },
    proxy: {
      "/v1": {
        target: "http://api:8000",
        changeOrigin: true,
      },
    },
  },

  // 🔥 THIS is what you're missing
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
    "whoops-latticed-judgingly.ngrok-free.dev"
  ],
  },
});