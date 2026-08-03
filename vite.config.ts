import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Relative asset paths so a single build works both at the site root (local
  // preview) and under a GitHub Pages project path (/<repo>/).
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    // The fonts are the only sizeable asset left after the image pipeline; keep
    // them as separate files rather than inlined base64 in the CSS.
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        // Three chunks that change at different rates: the framework almost
        // never, the animation library rarely, this site constantly. Splitting
        // them means a copy edit does not invalidate 300 KB of cached vendor
        // code, and it makes the cost of each dependency legible in the build
        // output rather than hidden inside one number.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules[/\\](react|react-dom|scheduler)[/\\]/.test(id)) return "react";
          if (/node_modules[/\\](motion|framer-motion|motion-dom|motion-utils)[/\\]/.test(id)) {
            return "motion";
          }
          return undefined;
        },
      },
    },
  },
});
