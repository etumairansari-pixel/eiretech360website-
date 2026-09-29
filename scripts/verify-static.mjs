/**
 * Checks that the static build carries what content/site.json says it should.
 *
 * The invariant is "what the admin panel shows is what shipped": every title,
 * description, canonical and H1 in dist-static has to match the content file.
 * That is what keeps an edit made in the admin from silently failing to reach
 * the deployed HTML.
 *
 * It also reports, without failing, where the live values have moved away from
 * the titles and descriptions originally supplied in the SEO sheet
 * (content/seo-baseline.json) — so an intentional rewrite is visible and an
 * accidental one is caught.
 *
 * Usage: node scripts/verify-static.mjs [outDir]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serviceRoutes, slugify } from "./content-html.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(rootDir, file), "utf8"));
const site = readJson("content/site.json");

/** Each route entry merged with its own copy file, in navigation order. */
const content = {
  site: site.site,
  pages: site.routes.map((route) => ({
    ...route,
    ...readJson("content/pages/" + route.key + ".json"),
  })),
};
const baseline = readJson("content/seo-baseline.json");

const outDir = path.resolve(process.argv[2] ?? path.join(rootDir, "dist-static"));
const base = content.site.url.replace(/\/$/, "");

const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const plain = (value) =>
  decode(value.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();

/** Strips the highlight markers an editor writes into headings. */
const unmark = (value) =>
  String(value)
    .replace(/\[\/?(gg|g|b)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const homeKey = "home";
const contactKey = "contact";

for (const page of content.pages) {
  const dir = page.slug === "" ? "" : page.slug;
  const file = path.join(outDir, dir, "index.html");

  assert.ok(fs.existsSync(file), `${file} was not emitted — check the page's slug`);

  const html = fs.readFileSync(file, "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const label = page.slug === "" ? "/" : `/${page.slug}`;

  assert.ok(!/%%[A-Z0-9_]+%%/.test(html), `${label}: an unsubstituted %%TOKEN%% reached the page`);

  const titles = [...head.matchAll(/<title>(.*?)<\/title>/g)].map((m) => decode(m[1]));
  assert.deepEqual(titles, [page.seo.title], `${label}: exact title`);

  for (const key of ['name="description"', 'property="og:description"']) {
    const tags = [...head.matchAll(new RegExp(`<meta\\s+${key}\\s+content="([^"]*)"`, "g"))];
    assert.deepEqual(
      tags.map((m) => decode(m[1])),
      [page.seo.description],
      `${label}: ${key}`,
    );
  }

  const canonical =
    page.seo.canonical ??
    (page.slug === ""
      ? `${base}/`
      : page.key === contactKey
        ? `${base}/${page.slug}/`
        : `${base}/${page.slug}`);
  assert.ok(head.includes(`rel="canonical" href="${canonical}"`), `${label}: canonical`);

  // The homepage shell writes the headline as separate chunks; everything else
  // renders one heading from the hero title.
  const expectedH1 =
    page.key === homeKey
      ? unmark(page.hero.headline.join("")).replace(/\s+/g, "")
      : unmark(page.hero.title).replace(/\s+/g, "");

  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => plain(m[1]));
  assert.equal(headings.length, 1, `${label}: exactly one H1`);
  assert.equal(
    headings[0].replace(/\s+/g, ""),
    expectedH1,
    `${label}: real route content without JavaScript`,
  );

  if (page.key !== homeKey && page.key !== contactKey) {
    assert.ok(
      !html.includes(unmark(content.pages[0].hero.headline.join(""))) &&
        !html.includes('as="image"'),
      `${label}: no homepage fallback or hero preload`,
    );
  }

  if (page.key === homeKey) {
    assert.ok(
      html.includes('id="shell" class="shell-fallback"'),
      "Keep the selected commit's lightweight homepage shell",
    );
  }

  if (page.key === contactKey) {
    assert.ok(html.includes("<form"), "Contact must remain a standalone form");
    assert.ok(
      !html.includes('id="root"') && !html.includes('id="prerendered"'),
      "Contact must not mount the SPA redirect",
    );
  }

  console.log(`Verified ${label}: metadata and route content match content/site.json`);
}

// Every service has its own page, carrying its own metadata and heading.
const serviceList = readJson("content/services.json");
const servicePages = serviceRoutes({ site: content.site, services: serviceList });
assert.equal(
  new Set(servicePages.map((page) => page.slug)).size,
  servicePages.length,
  "Each service needs its own page address",
);

for (const page of servicePages) {
  const file = path.join(outDir, page.slug, "index.html");
  const label = `/${page.slug}`;
  assert.ok(fs.existsSync(file), `${file} was not emitted`);

  const html = fs.readFileSync(file, "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";

  const titles = [...head.matchAll(/<title>(.*?)<\/title>/g)].map((m) => decode(m[1]));
  assert.deepEqual(titles, [page.title], `${label}: exact title`);
  const descriptions = [...head.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/g)];
  assert.deepEqual(descriptions.map((m) => decode(m[1])), [page.description], `${label}: description`);
  assert.ok(head.includes(`rel="canonical" href="${page.url}"`), `${label}: canonical`);

  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => plain(m[1]));
  assert.deepEqual(headings, [page.h1], `${label}: exactly one H1, the service title`);

  const service = serviceList.find(
    (s) => label === `/services/${String(s.slug ?? "").trim() || slugify(s.title)}`,
  );
  for (const point of service.points) {
    assert.ok(html.includes(`id="${slugify(point)}"`), `${label}: a section for "${point}"`);
  }

  console.log(`Verified ${label}: metadata, heading and a section per bullet point`);
}

// A gallery line naming an image that does not exist would silently drop out.
for (const service of serviceList) {
  for (const line of service.gallery ?? []) {
    const key = line.split("|")[0].trim();
    assert.ok(
      ["jpg", "webp", "png"].some((ext) => fs.existsSync(path.join(rootDir, "src/assets", `${key}.${ext}`))),
      `${service.title}: the portfolio image "${key}" is not in src/assets`,
    );
  }
  if (service.galleryPoint) {
    assert.ok(
      service.points.includes(service.galleryPoint),
      `${service.title}: "${service.galleryPoint}" is not one of its bullet points`,
    );
  }
}

// Every case study has to land on a real service page, next to its bullet point.
for (const project of readJson("content/projects.json")) {
  const page = servicePages.find((p) => p.slug === `services/${project.service}`);
  assert.ok(page, `${project.title}: "${project.service}" is not a service page`);
  const html = fs.readFileSync(path.join(outDir, page.slug, "index.html"), "utf8");
  assert.ok(
    html.includes(`id="work-${slugify(project.title)}"`),
    `${project.title}: the case study is missing from /${page.slug}`,
  );
  if (project.point) {
    const service = serviceList.find((s) => `services/${s.slug}` === page.slug);
    assert.ok(
      service.points.includes(project.point),
      `${project.title}: "${project.point}" is not one of ${service.title}'s bullet points`,
    );
  }
  console.log(`Verified ${project.title}: case study on /${page.slug}`);
}

const slugs = [
  ...content.pages
    .filter((page) => page.key !== homeKey && page.key !== contactKey)
    .map((page) => page.slug),
  ...servicePages.map((page) => page.slug),
];

const rewrites = fs.readFileSync(path.join(outDir, ".htaccess"), "utf8");
assert.ok(
  rewrites.includes(`RewriteRule ^(${slugs.join("|")})/?$ $1/index.html [L]`),
  "Serve each crawler route directly",
);

const sitemap = fs.readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
for (const page of content.pages) {
  if (/noindex/i.test(page.seo.robots ?? "")) continue;
  const loc =
    page.slug === ""
      ? `${base}/`
      : page.key === contactKey
        ? `${base}/${page.slug}/`
        : `${base}/${page.slug}`;
  assert.ok(sitemap.includes(`<loc>${loc}</loc>`), `sitemap.xml lists ${loc}`);
}
for (const page of servicePages) {
  assert.ok(sitemap.includes(`<loc>${page.url}</loc>`), `sitemap.xml lists ${page.url}`);
}

console.log("Static SEO checks passed; contact stays a separate document.");

// --- Drift against the supplied SEO sheet, reported but never fatal. --------
const drift = [];
for (const page of content.pages) {
  const expected = baseline.pages[page.key];
  if (!expected) continue;
  if (expected.title !== page.seo.title) {
    drift.push([`${page.key} title`, expected.title, page.seo.title]);
  }
  if (expected.description !== page.seo.description) {
    drift.push([`${page.key} description`, expected.description, page.seo.description]);
  }
}

if (drift.length) {
  console.log(`\n${drift.length} value(s) now differ from the supplied SEO sheet:`);
  for (const [what, was, now] of drift) {
    console.log(`  ${what}`);
    console.log(`    sheet: ${was}`);
    console.log(`    live:  ${now}`);
  }
  console.log("\nThat is expected once the SEO specialist has edited them.");
}
