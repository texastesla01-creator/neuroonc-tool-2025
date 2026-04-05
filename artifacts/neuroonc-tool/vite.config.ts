import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isVercel = process.env.VERCEL === "1";
const isReplit = process.env.REPL_ID !== undefined;

// On Vercel: PORT and BASE_PATH are not set — use sensible defaults
const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;
const basePath = process.env.BASE_PATH ?? "/";

const plugins: any[] = [react(), tailwindcss()];

// Replit-specific plugins — only load in Replit dev environment
if (!isVercel && isReplit && process.env.NODE_ENV !== "production") {
  try {
    const { default: runtimeErrorOverlay } = await import(
      "@replit/vite-plugin-runtime-error-modal"
    );
    plugins.push(runtimeErrorOverlay());

    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(
      cartographer({ root: path.resolve(import.meta.dirname, "..") })
    );

    const { devBanner } = await import("@replit/vite-plugin-dev-banner");
    plugins.push(devBanner());
  } catch {
    // Replit plugins not available — skip silently
  }
}

export default defineConfig({
  base: basePath,
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
