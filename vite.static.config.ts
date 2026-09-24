import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig, type Plugin } from "vite";
import { applyContent, readContent, staticRoutes } from "./scripts/content-html.mjs";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Replace only inner pages' fallback; keep the selected commit's homepage intact.
const STATIC_SHELL =
  /<div id="shell" class="shell-fallback">[\s\S]*?(?=\s*(?:<script type="module"|<\/body>))/;

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

/**
 * The inner pages, read from content/site.json so the admin panel owns their
 * slugs and metadata. Home and contact are excluded: each ships as its own
 * hand-written document and is filled by fillDocuments() below.
 */
const staticRouteMeta = staticRoutes(readContent());

/**
 * Substitutes content/site.json into the two hand-written documents.
 *
 * transformIndexHtml runs for every HTML entry, in build and in dev, so the
 * tokens never reach a browser.
 */
function fillDocuments(): Plugin {
  return {
    name: "fill-documents",
    enforce: "pre",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const which = ctx.path.includes("contact") ? "contact" : "home";
        return applyContent(html, which);
      },
    },
  };
}

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
  const ogImage = escapeHtmlAttribute(route.ogImage);
  const robots = escapeHtmlAttribute(route.robots);

  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/,
      `<meta name="robots" content="${robots}" />`,
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
    )
    .replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${ogImage}" />`,
    )
    .replace(
      /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
      `<meta name="twitter:image" content="${ogImage}" />`,
    );
}

/**
 * The hero poster preload belongs to the homepage. Every other route now
 * prerenders its own content, so keeping it would spend a high-priority
 * request on an image that page never renders.
 */
function stripHeroPreload(html: string) {
  return html.replace(
    /\n\s*<!-- WebP saves[\s\S]*?-->(?:\s*<link\s+rel="preload"\s+as="image"[\s\S]*?\/>)+/,
    "",
  );
}

/**
 * Rewrites the files that describe the site's URLs — .htaccess, robots.txt and
 * sitemap.xml — from content/site.json.
 *
 * These live in public/ and are copied verbatim, so renaming a page in the
 * admin panel would otherwise leave Apache rewriting the old slug and the
 * sitemap advertising a URL that no longer exists.
 */
function generateRoutingFiles(): Plugin {
  return {
    name: "generate-routing-files",
    apply: "build",
    enforce: "post",
    writeBundle(options) {
      const outDir = options.dir;
      if (!outDir) return;

      const content = readContent();
      const base = content.site.url.replace(/\/$/, "");
      const slugs = staticRouteMeta.map((route) => route.slug);

      const htaccess = path.join(outDir, ".htaccess");
      if (fs.existsSync(htaccess)) {
        fs.writeFileSync(
          htaccess,
          fs.readFileSync(htaccess, "utf8").replace(/%%ROUTE_SLUGS%%/g, slugs.join("|")),
        );
      }

      const robots = path.join(outDir, "robots.txt");
      if (fs.existsSync(robots)) {
        fs.writeFileSync(
          robots,
          fs.readFileSync(robots, "utf8").replace(/%%SITE_URL%%/g, base),
        );
      }

      // Priorities follow the order the pages are listed in: the first page is
      // the most important, and the rest step down without going below 0.5.
      const today = new Date().toISOString().slice(0, 10);
      const urls = content.routes
        .filter((route) => !/noindex/i.test(content.pages[route.key]?.seo?.robots ?? ""))
        .map((route, index) => {
          const loc =
            route.slug === ""
              ? `${base}/`
              : route.key === "contact"
                ? `${base}/${route.slug}/`
                : `${base}/${route.slug}`;
          const priority = index === 0 ? "1.0" : Math.max(0.5, 0.9 - (index - 1) * 0.1).toFixed(1);

          return [
            "  <url>",
            `    <loc>${loc}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>${index === 0 ? "weekly" : "monthly"}</changefreq>`,
            `    <priority>${priority}</priority>`,
            "  </url>",
          ].join("\n");
        });

      fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
      );
    },
  };
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
        const routeDir = path.join(outDir, route.slug);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(
          path.join(routeDir, "index.html"),
          stripHeroPreload(withRouteMeta(indexHtml, route)),
        );
      }
    },
  };
}

/**
 * Renders inner routes' real React trees into their static HTML at build time.
 * The homepage keeps f53e14d's lightweight shell and performance settings.
 *
 * Without this, a route page carries the correct <head> over a copy of the
 * homepage body: anything that does not run JS reads "Grow. Automate.
 * Innovate." on /about, and every route paints the homepage hero until React
 * replaces it.
 *
 * The render goes through Vite rather than plain node because the page
 * components import images and video, and only Vite's pipeline resolves those
 * to the hashed URLs the client build emitted. So the entry is built as an SSR
 * bundle first, then imported here.
 *
 * Runs in closeBundle, by which point the per-route HTML files written during
 * writeBundle exist.
 */
/**
 * renderToString has nowhere to put the tags React hoists — <link>, <meta>,
 * <title> — so it emits them at the front of the string. In the browser React
 * puts those in <head>, never in the container, so leaving them inside #root
 * guarantees a hydration mismatch (React error #418).
 *
 * Dropping them costs nothing: they are preload hints for images the
 * prerendered markup already references, so the preload scanner finds those
 * <img> tags in the same document anyway, and React re-issues the hints into
 * <head> as it hydrates.
 */
function stripHoistedTags(markup: string) {
  let out = markup;
  for (;;) {
    const next = out.replace(
      /^\s*(?:<(?:link|meta)\b[^>]*\/?>|<(?:title|style)\b[^>]*>[\s\S]*?<\/(?:title|style)>)/,
      "",
    );
    if (next === out) return out;
    out = next;
  }
}

function prerenderRoutes(): Plugin {
  const routes = staticRouteMeta.map((route) => ({
    url: route.path,
    file: `${route.slug}/index.html`,
  }));

  return {
    name: "prerender-routes",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      const outDir = path.resolve(rootDir, "dist-static");
      if (!fs.existsSync(path.join(outDir, "index.html"))) return;

      const ssrDir = path.resolve(rootDir, "node_modules/.prerender");
      const { build } = await import("vite");

      // configFile: false keeps this nested build from re-running the plugins
      // above, this one included.
      await build({
        configFile: false,
        logLevel: "warn",
        // __root.tsx imports styles.css?url, so the SSR pass has to resolve
        // the stylesheet even though the prerender never uses it.
        plugins: [react(), tailwindcss()],
        resolve: { alias: { "@": path.resolve(rootDir, "src") } },
        build: {
          ssr: true,
          outDir: ssrDir,
          emptyOutDir: true,
          copyPublicDir: false,
          rollupOptions: {
            input: path.resolve(rootDir, "src/entry-prerender.tsx"),
            output: { entryFileNames: "entry.mjs", format: "es" },
          },
        },
      });

      const { render } = (await import(pathToFileURL(path.join(ssrDir, "entry.mjs")).href)) as {
        render: (url: string) => Promise<string>;
      };

      for (const route of routes) {
        const file = path.join(outDir, route.file);
        if (!fs.existsSync(file)) continue;

        const html = fs.readFileSync(file, "utf8");
        if (!STATIC_SHELL.test(html)) {
          throw new Error(`${route.file}: no static #shell to render into`);
        }

        const body = stripHoistedTags(await render(route.url));
        fs.writeFileSync(
          file,
          html.replace(
            STATIC_SHELL,
            `<div id="shell" style="overflow-y:auto;background:var(--bg,#fff)"><style>#shell [style*="opacity:0"]{opacity:1!important;transform:none!important}</style>${body}</div>`,
          ),
        );
      }

      // Every asset the prerendered markup points at has to exist in the client
      // build. If the two builds ever hash an asset differently, fail here
      // rather than ship a 404.
      const missing = new Set<string>();
      for (const route of routes) {
        const file = path.join(outDir, route.file);
        if (!fs.existsSync(file)) continue;
        const html = fs.readFileSync(file, "utf8");
        for (const [, url] of html.matchAll(/(?:src|srcset|href)="(\/assets\/[^"]+)"/g)) {
          if (!fs.existsSync(path.join(outDir, url))) missing.add(url);
        }
      }
      if (missing.size) {
        throw new Error(
          `prerendered HTML references assets the build did not emit:\n  ${[...missing].join("\n  ")}`,
        );
      }
    },
  };
}

export default defineConfig({
  // Tells __root.tsx not to emit a <link> to the stylesheet: this build inlines
  // it into every document and deletes the file (see inlineStylesheet).
  define: { "import.meta.env.VITE_INLINE_CSS": "true" },
  plugins: [
    fillDocuments(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    inlineStylesheet(),
    emitStaticRouteMetaPages(),
    generateRoutingFiles(),
    prerenderRoutes(),
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
