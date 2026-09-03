import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin, type PluginOption, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * `contact/` is a standalone static page, not a router route. In production
 * Apache serves it directly: /contact/ hits the directory and returns its
 * index.html, and /contact gets a 301 to /contact/ from mod_dir — the SPA is
 * never involved (see public/.htaccess).
 *
 * The dev server has no such mapping, so /contact/ fell through to the router,
 * which 307s back to /contact, which renders the SPA's ContactRedirect route,
 * which sends the browser to /contact/ again — an endless reload. Mirroring
 * Apache's two rules here makes dev match the deployed site. Dev only; the
 * production build (vite.static.config.ts) is untouched.
 */
function serveStaticContactPage(): Plugin {
  return {
    name: "serve-static-contact-page",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const [pathname] = (req.url ?? "").split("?");

        // mod_dir: a directory request without the trailing slash is redirected.
        if (pathname === "/contact") {
          const query = (req.url ?? "").slice(pathname.length);
          res.statusCode = 301;
          res.setHeader("Location", `/contact/${query}`);
          res.end();
          return;
        }

        if (pathname !== "/contact/" && pathname !== "/contact/index.html") {
          next();
          return;
        }

        const file = path.resolve(rootDir, "contact/index.html");
        fs.promises
          .readFile(file, "utf8")
          .then((html) => server.transformIndexHtml(req.url as string, html, req.originalUrl))
          .then((html) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.setHeader("Cache-Control", "no-cache");
            res.end(html);
          })
          .catch(next);
      });
    },
  };
}

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  const plugins: PluginOption[] = [
    serveStaticContactPage(),
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
  ];

  // Nitro produces the deployable server output; it is only needed for builds.
  if (command === "build") {
    const { nitro } = await import("nitro/vite");
    plugins.push(nitro({ defaultPreset: "cloudflare-module" }));
  }

  plugins.push(react());

  // Expose VITE_* vars to both the client and the SSR/Nitro runtime.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
  );

  return {
    define,
    plugins,
    // Vite runs PostCSS in dev but Lightning CSS at build; using Lightning CSS in
    // both keeps the dev preview honest about build-time CSS transforms.
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": path.resolve(rootDir, "src") },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    build: {
      rollupOptions: {
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
    server: { host: "::", port: 8080 },
  };
});
