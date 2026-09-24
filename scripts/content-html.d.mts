/** Types for scripts/content-html.mjs, which the Vite configs import. */

export type RouteEntry = { key: string; slug: string; navLabel: string; footerLabel: string };

export type PageFile = {
  seo: {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    robots?: string;
  };
  hero?: Record<string, unknown>;
  [key: string]: unknown;
};

/** What readContent() assembles: content/site.json plus every other file. */
export type SiteContentFile = {
  site: { url: string; name: string; tagline: string; ogImage: string; themeColor: string };
  contact: { email: string; phone: string; phoneHref: string };
  social: { label: string; href: string }[];
  nav: { ctaLabel: string };
  footer: Record<string, unknown>;
  routes: RouteEntry[];
  pages: Record<string, PageFile>;
  services: Record<string, unknown>[];
  platforms: Record<string, unknown>[];
  testimonials: Record<string, unknown>[];
};

export type StaticRoute = {
  key: string;
  slug: string;
  path: string;
  title: string;
  description: string;
  robots: string;
  url: string;
  ogImage: string;
  h1: string;
};

export declare const contentPath: string;

export declare function readContent(): SiteContentFile;
export declare function pathFor(content: SiteContentFile, key: string): string;
export declare function canonicalFor(content: SiteContentFile, key: string): string;
export declare function ogImageFor(content: SiteContentFile, key: string): string;
export declare function tokensFor(
  content: SiteContentFile,
  which: "home" | "contact",
): Record<string, string>;
export declare function applyContent(
  html: string,
  which: "home" | "contact",
  content?: SiteContentFile,
): string;
export declare function staticRoutes(content: SiteContentFile): StaticRoute[];
