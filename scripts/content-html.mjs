/**
 * Fills the hand-written HTML documents from content/site.json.
 *
 * index.html and contact/index.html are not rendered by React — the homepage
 * shell paints before the bundle arrives, and the contact page ships as its own
 * document — so their copy and metadata have to be substituted at build time.
 * Both files carry %%TOKENS%%; this module turns them into the current content.
 *
 * Used by vite.static.config.ts for the production build and by vite.config.ts
 * so the dev server shows the same thing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(rootDir, "content");
const contentFile = path.join(contentDir, "site.json");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

/**
 * Assembles the whole content tree from its files.
 *
 * The site ships the per-page files separately so that a page only bundles its
 * own copy; the build has no such constraint, so it reads them all and works
 * with one object. Read fresh each time, so a dev-server reload picks up edits.
 */
export function readContent() {
  const site = readJson(contentFile);

  return {
    ...site,
    pages: Object.fromEntries(
      site.routes.map((route) => [
        route.key,
        readJson(path.join(contentDir, "pages", route.key + ".json")),
      ]),
    ),
    services: readJson(path.join(contentDir, "services.json")),
    platforms: readJson(path.join(contentDir, "platforms.json")),
    testimonials: readJson(path.join(contentDir, "testimonials.json")),
  };
}

/** The directory the dev server watches for content changes. */
export const contentPath = contentDir;

/** Escapes a value for use in an HTML attribute or as text. */
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A page's route entry (slug, labels) merged with its own copy file. */
function pageBy(content, key) {
  const route = content.routes.find((r) => r.key === key);
  const body = content.pages[key];
  if (!route || !body) throw new Error(`content/ has no page with key "${key}"`);
  return { ...route, ...body };
}

/** The site-relative path for a page, matching src/content/index.ts. */
export function pathFor(content, key) {
  const found = pageBy(content, key);
  if (found.slug === "") return "/";
  return key === "contact" ? `/${found.slug}/` : `/${found.slug}`;
}

/** The absolute canonical URL for a page. */
export function canonicalFor(content, key) {
  const found = pageBy(content, key);
  if (found.seo.canonical) return found.seo.canonical;
  const base = content.site.url.replace(/\/$/, "");
  const p = pathFor(content, key);
  return p === "/" ? `${base}/` : `${base}${p}`;
}

/** The absolute share image for a page. */
export function ogImageFor(content, key) {
  const found = pageBy(content, key);
  const image = found.seo.ogImage || content.site.ogImage;
  return /^https?:/.test(image) ? image : `${content.site.url.replace(/\/$/, "")}${image}`;
}

/**
 * Renders one headline chunk for a document React does not paint.
 *
 * These pages carry their own inline CSS, and the two disagree about how the
 * gradient is selected: the homepage shell styles `.shell-copy span`, while the
 * contact page styles `.gradient-text`. The caller says which to emit — getting
 * it wrong silently drops the gradient, which is exactly the kind of thing no
 * one notices until it is live.
 *
 * @param {string} text  The chunk, possibly carrying [g] or [gg] markers.
 * @param {string} className Class for the highlighted span; "" for a bare one.
 */
function shellChunk(text, className = "") {
  const marked = /\[(gg|g)\]([\s\S]*?)\[\/\1\]/;
  const match = marked.exec(text);

  if (!match) return esc(text);

  const open = className ? `<span class="${className}">` : "<span>";

  return (
    esc(text.slice(0, match.index)) +
    open +
    esc(match[2]) +
    "</span>" +
    esc(text.slice(match.index + match[0].length))
  );
}

/** Strips highlight markers, for meta tags and attributes. */
function plain(text) {
  return String(text)
    .replace(/\[\/?(gg|g|b)\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The token table for a document.
 *
 * @param {object} content Parsed content/site.json.
 * @param {"home"|"contact"} which Which document is being filled.
 */
export function tokensFor(content, which) {
  const { site } = content;
  const base = site.url.replace(/\/$/, "");

  const shared = {
    SITE_NAME: esc(site.name),
    SITE_URL: esc(base),
    THEME_COLOR: esc(site.themeColor),
  };

  if (which === "home") {
    const home = pageBy(content, "home");
    const hero = home.hero;

    return {
      ...shared,
      TITLE: esc(home.seo.title),
      DESCRIPTION: esc(home.seo.description),
      CANONICAL: esc(canonicalFor(content, "home")),
      ROBOTS: esc(home.seo.robots || "index, follow"),
      OG_IMAGE: esc(ogImageFor(content, "home")),
      SHELL_BRAND: esc(site.name === "Eire Tech" ? "Eire Tech 360" : site.name),
      // Not `.map(shellChunk)`: map would pass the index as the class name.
      SHELL_HEADLINE: hero.headline.map((chunk) => shellChunk(chunk)).join("<br />"),
      SHELL_PRIMARY_HREF: esc(pathFor(content, hero.primaryTo)),
      SHELL_PRIMARY_LABEL: esc(hero.primaryLabel),
      SHELL_SECONDARY_HREF: esc(pathFor(content, hero.secondaryTo)),
      SHELL_SECONDARY_LABEL: esc(hero.secondaryLabel),
    };
  }

  const page = pageBy(content, "contact");

  return {
    ...shared,
    TITLE: esc(page.seo.title),
    DESCRIPTION: esc(page.seo.description),
    CANONICAL: esc(canonicalFor(content, "contact")),
    ROBOTS: esc(page.seo.robots || "index, follow"),
    OG_IMAGE: esc(ogImageFor(content, "contact")),

    NAV_HOME: esc(pathFor(content, "home")),
    NAV_ABOUT: esc(pathFor(content, "about")),
    NAV_SERVICES: esc(pathFor(content, "services")),
    NAV_PLATFORMS: esc(pathFor(content, "platforms")),
    NAV_CONTACT: esc(pathFor(content, "contact")),
    NAV_HOME_LABEL: esc(pageBy(content, "home").navLabel),
    NAV_ABOUT_LABEL: esc(pageBy(content, "about").navLabel),
    NAV_SERVICES_LABEL: esc(pageBy(content, "services").navLabel),
    NAV_PLATFORMS_LABEL: esc(pageBy(content, "platforms").navLabel),
    NAV_CONTACT_LABEL: esc(pageBy(content, "contact").navLabel),
    NAV_CTA_LABEL: esc(content.nav.ctaLabel),

    HERO_EYEBROW: esc(page.hero.eyebrow),
    HERO_TITLE: shellChunk(page.hero.title, "gradient-text"),
    HERO_SUBTITLE: esc(page.hero.subtitle),

    FORM_TITLE: esc(page.form.title),
    FORM_HINT: esc(page.form.hint),
    FORM_BUTTON: esc(page.form.buttonLabel),
    FORM_SENDING: esc(page.form.sendingLabel),
    FORM_PRIVACY: esc(page.form.privacyNote),
    FORM_SUCCESS: esc(page.form.successMessage),
    FORM_ERROR: esc(page.form.errorMessage),
    FORM_SERVICE_OPTIONS: page.form.serviceOptions
      .map((option) => `<option>${esc(option)}</option>`)
      .join("\n                "),

    ASIDE_EYEBROW: esc(page.aside.eyebrow),
    ASIDE_TITLE: esc(page.aside.title),
    ASIDE_BODY: esc(page.aside.body),
    ASIDE_FOOTNOTE: esc(page.aside.footnote),

    CONTACT_EMAIL: esc(content.contact.email),
    CONTACT_PHONE: esc(content.contact.phone),
    CONTACT_PHONE_HREF: esc(content.contact.phoneHref),

    FOOTER_BLURB: esc(page.footerBlurb),
    FOOTER_YEAR: String(new Date().getFullYear()),
  };
}

/**
 * Replaces every %%TOKEN%% in a document.
 *
 * Throws on a token with no value rather than shipping "%%TITLE%%" to a
 * visitor: a missing token means the content file and the template have
 * drifted apart, which is a build error, not something to paper over.
 *
 * @param {string} html Raw document.
 * @param {"home"|"contact"} which Which document is being filled.
 * @param {object} [content] Parsed content, read from disk when omitted.
 */
export function applyContent(html, which, content = readContent()) {
  const tokens = tokensFor(content, which);
  const missing = new Set();

  const out = html.replace(/%%([A-Z0-9_]+)%%/g, (match, key) => {
    if (!(key in tokens)) {
      missing.add(key);
      return match;
    }
    return tokens[key];
  });

  if (missing.size) {
    throw new Error(
      `${which}: no content for token(s) ${[...missing].join(", ")}. ` +
        `Add them to tokensFor() in scripts/content-html.mjs or remove them from the template.`,
    );
  }

  return out;
}

/** Everything the static build needs to emit the inner route pages. */
export function staticRoutes(content) {
  return content.routes
    .filter((route) => route.key !== "home" && route.key !== "contact")
    .map((route) => pageBy(content, route.key))
    .map((page) => ({
      key: page.key,
      slug: page.slug,
      path: pathFor(content, page.key),
      title: page.seo.title,
      description: page.seo.description,
      robots: page.seo.robots || "index, follow",
      url: canonicalFor(content, page.key),
      ogImage: ogImageFor(content, page.key),
      h1: plain(page.hero.title),
    }));
}
