import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// Exact copy from Eire_Tech_SEO_Meta_Tags.pdf, kept independent of the renderer.
const pages = [
  [
    "",
    "Eire Tech | Digital Growth & Automation Partner",
    "Eire Tech helps businesses grow, automate & innovate with expert web development, digital marketing, app development, branding & AI solutions.",
    "Grow.Automate.Innovate.",
  ],
  [
    "services",
    "Our Services | Web, Marketing, Apps & AI – Eire Tech",
    "Explore Eire Tech's full range of services-web design, digital marketing, app development, branding & AI automation built to grow your business.",
    "Full-spectrum digital solutions, under one roof.",
  ],
  [
    "platforms",
    "Digital Platforms & Tools | Eire Tech Solutions",
    "Discover Eire Tech's powerful digital platforms designed to streamline operations, automate workflows & drive smarter business growth.",
    "The technology behind our work.",
  ],
  [
    "about",
    "About Us | Eire Tech – Your Digital Growth Partner",
    "Learn about Eire Tech, a full-service digital solutions company committed to helping businesses grow, automate & innovate with one trusted partner.",
    "We build digital ecosystems, not just projects.",
  ],
  [
    "contact",
    "Contact Eire Tech | Get a Free Consultation",
    "Ready to grow your business? Contact Eire Tech today to discuss your web, marketing, app or AI project and get started with a free consultation.",
    "Let's build something exceptional together.",
  ],
];

const decode = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"');
const plain = (value) =>
  decode(value.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
const outDir = path.resolve(process.argv[2] ?? "dist-static");

for (const [route, title, description, heading] of pages) {
  const html = fs.readFileSync(path.join(outDir, route, "index.html"), "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const titles = [...head.matchAll(/<title>(.*?)<\/title>/g)].map((match) => decode(match[1]));
  assert.deepEqual(titles, [title], `${route || "/"}: exact title`);
  for (const key of ['name="description"', 'property="og:description"']) {
    const tags = [...head.matchAll(new RegExp(`<meta\\s+${key}\\s+content="([^"]*)"`, "g"))];
    assert.deepEqual(
      tags.map((match) => decode(match[1])),
      [description],
      `${route || "/"}: ${key}`,
    );
  }
  const canonical = `https://eiretech360.com/${route}${route === "contact" ? "/" : ""}`;
  assert.ok(head.includes(`rel="canonical" href="${canonical}"`), `${route || "/"}: canonical`);
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((match) =>
    plain(match[1]),
  );
  assert.deepEqual(headings, [heading], `${route || "/"}: real route content without JavaScript`);
  if (route && route !== "contact") {
    assert.ok(
      !html.includes("Grow.Automate.Innovate.") && !html.includes('as="image"'),
      `${route}: no homepage fallback or hero preload`,
    );
  }
  if (!route) {
    assert.ok(
      html.includes('id="shell" class="shell-fallback"'),
      "Keep the selected commit's lightweight homepage shell",
    );
  }
  if (route === "contact") {
    assert.ok(html.includes("<form"), "Contact must remain a standalone form");
    assert.ok(
      !html.includes('id="root"') && !html.includes('id="prerendered"'),
      "Contact must not mount the SPA redirect",
    );
  }
  console.log(`Verified /${route}: PDF metadata and route content`);
}

const rewrites = fs.readFileSync(path.join(outDir, ".htaccess"), "utf8");
assert.ok(
  rewrites.includes("RewriteRule ^(about|platforms|services)/?$ $1/index.html [L]"),
  "Serve each crawler route directly",
);
console.log("Static SEO checks passed; contact stays a separate document.");
