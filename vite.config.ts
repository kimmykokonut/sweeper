import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
// https://vite-pwa-org.netlify.app/guide/#configuring-vite-plugin-pwa
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Sweeper - Scopa Scorecard",
        short_name: "Sweeper",
        description: "Scopa card game scoring calculator",
        theme_color: "#022c22",
        background_color: "#064e3b",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  base: "/sweeper/",
});
