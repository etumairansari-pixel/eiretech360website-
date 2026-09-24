import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const adminDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * The admin editor is a separate app from the site: it is a local tool, never
 * deployed, and nothing it imports may reach the site bundle.
 */
export default defineConfig({
  root: adminDir,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@admin": path.resolve(adminDir, "src") } },
});
