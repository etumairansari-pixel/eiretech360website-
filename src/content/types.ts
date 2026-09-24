/**
 * The shape of the files under content/.
 *
 * The admin panel writes them and the site reads them at build time, so the two
 * ends share these types. Anything optional here is genuinely optional in the
 * JSON — the templates fall back rather than render a gap.
 */

/** A heading or paragraph that may carry [g], [gg] and [b] highlight markers. */
export type RichText = string;

export type Seo = {
  title: string;
  description: string;
  /** Overrides the URL derived from the page's slug. */
  canonical?: string;
  /** Overrides site.ogImage for this page. */
  ogImage?: string;
  robots?: string;
};

/** One entry in content/site.json's `routes`. */
export type RouteEntry = {
  key: string;
  /** The URL path, without slashes. The home page uses an empty string. */
  slug: string;
  navLabel: string;
  footerLabel: string;
};

export type SiteSettings = {
  site: {
    url: string;
    name: string;
    tagline: string;
    ogImage: string;
    themeColor: string;
  };
  contact: { email: string; phone: string; phoneHref: string };
  social: { label: string; href: string }[];
  nav: { ctaLabel: string };
  footer: {
    blurb: string;
    capabilities: string[];
    ctaLabel: string;
    visitTitle: string;
    visitLine: string;
    address: string[];
  };
  routes: RouteEntry[];
};

export type Stat = {
  value: number;
  suffix: string;
  label: string;
  accent: boolean;
};

export type Cta = {
  label: string;
  title: RichText;
  subtitle: string;
  buttonLabel: string;
  /** A page key, or an absolute URL. */
  buttonTo: string;
};

export type PageHero = {
  eyebrow: string;
  title: RichText;
  subtitle: string;
};

export type Reason = {
  number: string;
  title: string;
  text: string;
};

export type IconItem = {
  icon: string;
  title: string;
  text: string;
};

export type HomeContent = {
  seo: Seo;
  hero: {
    badge: string;
    /** One chunk per entry; each animates in on its own and they wrap like words. */
    headline: RichText[];
    primaryLabel: string;
    primaryTo: string;
    secondaryLabel: string;
    secondaryTo: string;
    stats: Stat[];
  };
  marquee: string[];
  mission: { label: string; title: RichText; body: RichText };
  servicesSection: { label: string; title: RichText; intro: string; buttonLabel: string };
  why: {
    label: string;
    title: RichText;
    body: string;
    reasons: Reason[];
    captionEyebrow: string;
    captionTitle: string;
  };
  process: { label: string; title: RichText; steps: IconItem[] };
  serve: { label: string; title: RichText; body: string };
  testimonialsSection: { label: string; title: RichText; badge: string };
  cta: Cta;
};

export type ServicesContent = {
  seo: Seo;
  hero: PageHero;
  serviceLinkLabel: string;
  cta: Cta;
};

export type PlatformsContent = {
  seo: Seo;
  hero: PageHero;
  outro: string;
  cta: Cta;
};

export type AboutContent = {
  seo: Seo;
  hero: PageHero;
  story: { label: string; title: RichText; paragraphs: string[] };
  differences: { label: string; items: IconItem[] };
  mission: { label: string; title: RichText; body: string };
  cta: Cta;
};

export type ContactContent = {
  seo: Seo;
  hero: PageHero;
  form: {
    title: string;
    hint: string;
    buttonLabel: string;
    sendingLabel: string;
    privacyNote: string;
    successMessage: string;
    errorMessage: string;
    serviceOptions: string[];
  };
  aside: { eyebrow: string; title: string; body: string; footnote: string };
  footerBlurb: string;
};

export type Service = {
  icon: string;
  title: string;
  tag: string;
  /** A key in the image registry, e.g. "svc-web". */
  image: string;
  desc: string;
  points: string[];
};

export type Platform = {
  icon: string;
  title: string;
  tools: string[];
};

export type Testimonial = {
  initials: string;
  name: string;
  role: string;
  quote: string;
};
