/**
 * The content admin.
 *
 * Serves the editor UI from admin/ and a small API over the files in content/.
 * There is no database: the editor reads and writes the same JSON the site
 * imports at build time, so a save is a file change, and the site picks it up
 * on the next dev-server reload or production build.
 *
 * Runs on localhost only. It writes to the working tree, so it is a local tool,
 * not something to expose.
 *
 * Start with: npm run admin
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { iconCatalog } from "./icon-catalog.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(rootDir, "content");
const pagesDir = path.join(contentDir, "pages");

const PORT = Number(process.env.ADMIN_PORT ?? 5174);
const SITE_URL = process.env.SITE_DEV_URL ?? "http://localhost:8080";

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");

/* ------------------------------------------------------------------
   Reading
------------------------------------------------------------------ */

function loadContent() {
  const site = readJson(path.join(contentDir, "site.json"));

  return {
    site,
    pages: Object.fromEntries(
      site.routes.map((route) => [route.key, readJson(path.join(pagesDir, route.key + ".json"))]),
    ),
    services: readJson(path.join(contentDir, "services.json")),
    platforms: readJson(path.join(contentDir, "platforms.json")),
    testimonials: readJson(path.join(contentDir, "testimonials.json")),
  };
}

/** The images an editor can pick for a service card. */
function imageCatalog() {
  const dir = path.join(rootDir, "src/assets");
  return fs
    .readdirSync(dir)
    .filter((file) => /^svc-.*\.jpg$/.test(file))
    .map((file) => file.replace(/\.jpg$/, ""))
    .sort();
}

/* ------------------------------------------------------------------
   Validation

   The site imports these files directly, so a bad save would break the build
   rather than show an error in the UI. Everything is checked before a byte is
   written, and the response says exactly which field is wrong.
------------------------------------------------------------------ */

function validate(next) {
  const errors = [];

  const require = (value, where) => {
    if (typeof value !== "string" || value.trim() === "") errors.push(`${where} cannot be empty`);
  };

  if (!next.site || !Array.isArray(next.site.routes)) {
    return ["site.routes is missing"];
  }

  require(next.site.site?.url, "Site URL");
  require(next.site.site?.name, "Site name");

  if (next.site.site?.url && !/^https?:\/\/[^\s/]+/.test(next.site.site.url)) {
    errors.push("Site URL must start with http:// or https://");
  }
  if (next.site.contact?.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(next.site.contact.email)) {
    errors.push("Contact email is not a valid address");
  }

  const seenSlug = new Map();
  const seenKey = new Set();

  for (const route of next.site.routes) {
    require(route.key, "A page key");
    require(route.navLabel, `${route.key}: navigation label`);
    require(route.footerLabel, `${route.key}: footer label`);

    if (seenKey.has(route.key)) errors.push(`Two pages share the key "${route.key}"`);
    seenKey.add(route.key);

    // The home page is the only one allowed an empty slug.
    if (route.slug === "") {
      if (route.key !== "home")
        errors.push(`${route.key}: only the home page may have an empty slug`);
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route.slug)) {
      errors.push(
        `${route.key}: the slug "${route.slug}" must be lower-case letters, numbers and single hyphens`,
      );
    }

    if (seenSlug.has(route.slug)) {
      errors.push(
        `"${route.slug || "/"}" is used by both ${seenSlug.get(route.slug)} and ${route.key}`,
      );
    }
    seenSlug.set(route.slug, route.key);

    const page = next.pages?.[route.key];
    if (!page) {
      errors.push(`${route.key}: page content is missing`);
      continue;
    }

    require(page.seo?.title, `${route.key}: meta title`);
    require(page.seo?.description, `${route.key}: meta description`);

    if (page.seo?.canonical && !/^https?:\/\//.test(page.seo.canonical)) {
      errors.push(`${route.key}: canonical URL must start with http:// or https://`);
    }

    if (route.key === "home") {
      if (!Array.isArray(page.hero?.headline) || page.hero.headline.length === 0) {
        errors.push("home: the headline needs at least one line");
      }
    } else {
      require(page.hero?.title, `${route.key}: page heading`);
    }
  }

  if (!seenKey.has("home")) errors.push("The home page cannot be removed");
  if (!seenKey.has("contact")) errors.push("The contact page cannot be removed");

  for (const [list, label] of [
    [next.services, "services"],
    [next.platforms, "platforms"],
    [next.testimonials, "testimonials"],
  ]) {
    if (!Array.isArray(list)) errors.push(`${label} must be a list`);
  }

  for (const service of next.services ?? []) require(service.title, "A service title");
  for (const group of next.platforms ?? []) require(group.title, "A platform group title");
  for (const quote of next.testimonials ?? []) {
    require(quote.name, "A testimonial name");
    require(quote.quote, `${quote.name || "A testimonial"}: the quote`);
  }

  // Unresolvable link targets would render as a link to nowhere.
  const keys = new Set(next.site.routes.map((r) => r.key));
  const checkLink = (value, where) => {
    if (!value) return;
    if (/^(https?:)?\/\//.test(value)) return;
    if (!keys.has(value)) errors.push(`${where}: "${value}" is not a page key or a URL`);
  };

  for (const route of next.site.routes) {
    const page = next.pages?.[route.key];
    if (!page) continue;
    checkLink(page.cta?.buttonTo, `${route.key}: call-to-action link`);
    checkLink(page.hero?.primaryTo, `${route.key}: primary button link`);
    checkLink(page.hero?.secondaryTo, `${route.key}: secondary button link`);
  }

  return errors;
}

/* ------------------------------------------------------------------
   Writing
------------------------------------------------------------------ */

function saveContent(next) {
  const errors = validate(next);
  if (errors.length) return { ok: false, errors };

  // Write to a temp file and rename, so an interrupted save cannot leave a
  // half-written file that the build would fail to parse.
  const atomic = (file, value) => {
    const tmp = file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + "\n");
    fs.renameSync(tmp, file);
  };

  atomic(path.join(contentDir, "site.json"), next.site);
  for (const route of next.site.routes) {
    atomic(path.join(pagesDir, route.key + ".json"), next.pages[route.key]);
  }
  atomic(path.join(contentDir, "services.json"), next.services);
  atomic(path.join(contentDir, "platforms.json"), next.platforms);
  atomic(path.join(contentDir, "testimonials.json"), next.testimonials);

  // Any page file left behind by a removed page would still be imported by a
  // route that no longer exists, so clear it out.
  const keep = new Set(next.site.routes.map((r) => r.key + ".json"));
  for (const file of fs.readdirSync(pagesDir)) {
    if (file.endsWith(".json") && !keep.has(file)) {
      fs.rmSync(path.join(pagesDir, file));
    }
  }

  return { ok: true };
}

/* ------------------------------------------------------------------
   Server
------------------------------------------------------------------ */

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      // Content is text; anything this large is a mistake or an attack.
      if (size > 5_000_000) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

/** Runs the production build and returns its output. */
function runBuild() {
  return new Promise((resolve) => {
    const child = spawn("npm", ["run", "build"], {
      cwd: rootDir,
      shell: true,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    let output = "";
    child.stdout.on("data", (d) => (output += d.toString()));
    child.stderr.on("data", (d) => (output += d.toString()));
    child.on("close", (code) => resolve({ ok: code === 0, code, output: output.slice(-20000) }));
  });
}

const vite = await createViteServer({
  root: path.join(rootDir, "admin"),
  configFile: path.join(rootDir, "admin/vite.config.ts"),
  server: { middlewareMode: true },
  appType: "spa",
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  try {
    if (url.pathname === "/api/content" && req.method === "GET") {
      json(res, 200, {
        ...loadContent(),
        catalog: {
          icons: iconCatalog.map(({ name, label }) => ({ name, label })),
          images: imageCatalog(),
        },
        siteUrl: SITE_URL,
      });
      return;
    }

    if (url.pathname === "/api/content" && req.method === "PUT") {
      const next = await readBody(req);
      const result = saveContent(next);
      json(res, result.ok ? 200 : 422, result);
      if (result.ok) {
        console.log(`  saved  ${new Date().toLocaleTimeString()}`);
      }
      return;
    }

    if (url.pathname === "/api/build" && req.method === "POST") {
      console.log("  running npm run build...");
      const result = await runBuild();
      console.log(result.ok ? "  build ok" : "  build failed");
      json(res, 200, result);
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      json(res, 404, { error: "unknown endpoint" });
      return;
    }
  } catch (error) {
    json(res, 400, { ok: false, errors: [String(error.message ?? error)] });
    return;
  }

  vite.middlewares(req, res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n  Eire Tech content admin\n`);
  console.log(`  Editor    http://localhost:${PORT}`);
  console.log(`  Preview   ${SITE_URL}   (run \`npm run dev\` in another terminal)`);
  console.log(`  Content   ${path.relative(process.cwd(), contentDir)}\n`);
});
