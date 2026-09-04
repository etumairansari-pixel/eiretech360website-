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

const staticRouteMeta = [
  {
    path: "services",
    title: "Our Services | Web, Marketing, Apps & AI - Eire Tech",
    description:
      "Explore Eire Tech's full range of services-web design, digital marketing, app development, branding & AI automation built to grow your business.",
    url: "https://eiretech360.com/services",
  },
  {
    path: "platforms",
    title: "Digital Platforms & Tools | Eire Tech Solutions",
    description:
      "Discover Eire Tech's powerful digital platforms designed to streamline operations, automate workflows & drive smarter business growth.",
    url: "https://eiretech360.com/platforms",
  },
  {
    path: "about",
    title: "About Us | Eire Tech - Your Digital Growth Partner",
    description:
      "Learn about Eire Tech, a full-service digital solutions company committed to helping businesses grow, automate & innovate with one trusted partner.",
    url: "https://eiretech360.com/about",
  },
] as const;

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function withRouteMeta(html: string, route: (typeof staticRouteMeta)[number]) {
  const title = escapeHtmlAttribute(route.title);
  const description = escapeHtmlAttribute(route.description);
  const url = escapeHtmlAttribute(route.url);

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
      `<link rel="canonical" href="${url}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:title" content="${title}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:url" content="${url}" />`,
    );
}

function emitStaticRouteMetaPages(): Plugin {
  return {
    name: "emit-static-route-meta-pages",
    apply: "build",
    enforce: "post",
    writeBundle(options) {
      const outDir = options.dir;
      if (!outDir) return;

      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;

      const indexHtml = fs.readFileSync(indexPath, "utf8");
      for (const route of staticRouteMeta) {
        const routeDir = path.join(outDir, route.path);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), withRouteMeta(indexHtml, route));
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
    emitStaticRouteMetaPages(),
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
