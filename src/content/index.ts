/**
 * Site-wide content, plus the helpers every page needs.
 *
 * The content files are imported, not fetched: Vite inlines them at build time,
 * so the copy is in the bundle the browser already downloads and a page costs
 * no extra request. The admin panel edits the same files, and a rebuild carries
 * the change into the static HTML — which is what keeps the meta tags and page
 * copy visible to crawlers without JavaScript.
 *
 * Only this module and content/site.json are shared by every page. A page's own
 * copy lives in content/pages/<key>.json and is imported by that route alone,
 * so the homepage never downloads the About page's text.
 */
import raw from "../../content/site.json";
import type { Seo, SiteSettings } from "./types";

export * from "./types";

const data = raw as unknown as SiteSettings;

export const { site, contact, social, nav, footer, routes } = data;

/** A page's slug and navigation labels, by key. */
export function route(key: string) {
  const found = routes.find((r) => r.key === key);
  if (!found) {
    throw new Error(
      `content/site.json has no route with key "${key}". Routes present: ${routes
        .map((r) => r.key)
        .join(", ")}`,
    );
  }
  return found;
}

/**
 * The site-relative path for a page key.
 *
 * Home is "/", the contact page keeps its trailing slash because it ships as
 * its own document, and everything else is "/slug".
 */
export function pathFor(key: string): string {
  const found = routes.find((r) => r.key === key);
  if (!found) return /^(https?:)?\/\//.test(key) || key.startsWith("/") ? key : `/${key}`;
  if (found.slug === "") return "/";
  return found.key === "contact" ? `/${found.slug}/` : `/${found.slug}`;
}

/**
 * Resolves a link field, which holds either a page key or an absolute URL.
 *
 * @param to A page key such as "contact", or a URL starting with http.
 */
export function linkTo(to: string): string {
  return /^(https?:)?\/\//.test(to) ? to : pathFor(to);
}

/** The absolute canonical URL for a page. */
export function canonicalFor(key: string, seo?: Seo): string {
  if (seo?.canonical) return seo.canonical;

  const base = site.url.replace(/\/$/, "");
  const path = pathFor(key);
  return path === "/" ? `${base}/` : `${base}${path}`;
}

/** The share image for a page, as an absolute URL. */
export function ogImageFor(seo?: Seo): string {
  const image = seo?.ogImage || site.ogImage;
  return /^https?:/.test(image) ? image : `${site.url.replace(/\/$/, "")}${image}`;
}

/**
 * The head metadata for a page, in the shape TanStack Router's `head` wants.
 *
 * The route passes its own seo block, so importing this helper does not drag
 * every page's metadata into the shared chunk.
 */
export function headFor(key: string, seo: Seo) {
  const { title, description } = seo;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: canonicalFor(key, seo) }],
  };
}
