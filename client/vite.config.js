import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
      },
      manifest: {
        name: "LearnHub",
        short_name: "LearnHub",
        description: "A production-grade LMS SaaS",
        theme_color: "#4f46e5",
        background_color: "#111827",
        display: "standalone",
      },
    }),
  ],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
});
