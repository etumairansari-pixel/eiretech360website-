import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, type Plugin } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Tailwind emits a single ~100 KB stylesheet, and as a plain <link> it is a
 * render-blocking request sitting one round trip behind the document — worth
 * ~300 ms of first paint on a throttled mobile connection. The whole sheet is
 * critical (the app has no above-the-fold subset), so inlining it removes the
 * round trip without changing a single rule.
 *
 * This runs in writeBundle rather than transformIndexHtml because Vite injects
 * the <link> while generating the bundle, after the HTML transform hooks.
 */
function inlineStylesheet(): Plugin {
  return {
    name: "inline-stylesheet",
    apply: "build",
    enforce: "post",
    writeBundle(options, bundle) {
      const outDir = options.dir;
      if (!outDir) return;

      const linked = new Set<string>();

      for (const [fileName, asset] of Object.entries(bundle)) {
        if (!fileName.endsWith(".html") || asset.type !== "asset") continue;

        const htmlPath = path.join(outDir, fileName);
        const html = fs.readFileSync(htmlPath, "utf8");

        const next = html.replace(
          /<link[^>]*rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g,
          (tag, href: string) => {
            const css = bundle[href];
            if (!css || css.type !== "asset") return tag;
            linked.add(href);
            return `<style>${css.source.toString()}</style>`;
          },
        );

        if (next !== html) fs.writeFileSync(htmlPath, next);
      }

      // Drop the now-unreferenced stylesheets so the deploy has no dead weight.
      for (const href of linked) {
        const cssPath = path.join(outDir, href);
        if (fs.existsSync(cssPath)) fs.rmSync(cssPath);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    inlineStylesheet(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  build: {
    outDir: "dist-static",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, "index.html"),
        contact: path.resolve(rootDir, "contact/index.html"),
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@tanstack")) return "vendor-router";
          if (id.includes("react")) return "vendor-react";
          if (id.includes("motion") || id.includes("lucide-react")) return "vendor-ui";
          return "vendor";
        },
      },
    },
  },
});
