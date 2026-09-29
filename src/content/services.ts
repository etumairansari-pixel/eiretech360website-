/**
 * The services list, resolved into the shape the components consume.
 *
 * Imported by the homepage, the services page and the service detail pages —
 * the places that render it — so the About and Platforms bundles never carry it.
 */
import type { LucideIcon } from "lucide-react";
import raw from "../../content/services.json";
import { iconFor } from "./icons";
import { imageFor } from "./images";
import type { Service as ServiceContent } from "./types";

export type ServiceSection = {
  title: string;
  /** The element id on the detail page, so a bullet point can link to it. */
  anchor: string;
  body: string;
};

export type GalleryItem = {
  img: string;
  title: string;
  brand: string;
  /** The artwork is drawn for a dark background. */
  dark: boolean;
};

export type GalleryGroup = { brand: string; items: GalleryItem[] };

export type Service = {
  icon: LucideIcon;
  title: string;
  slug: string;
  path: string;
  tag: string;
  img: string;
  desc: string;
  points: string[];
  seo: { title: string; description: string };
  intro: string[];
  sections: ServiceSection[];
  benefits: string[];
  faqs: { question: string; answer: string }[];
  /** Portfolio artwork, grouped by brand in the order first listed. */
  gallery: GalleryGroup[];
  galleryPoint: string;
};

function parseGallery(lines: string[]): GalleryGroup[] {
  const groups: GalleryGroup[] = [];
  for (const line of lines) {
    const [key = "", title = "", brand = "", tone = ""] = line.split("|").map((part) => part.trim());
    const img = imageFor(key);
    // An unknown image key would render a broken image, so it is skipped.
    if (!img) continue;
    const item = { img, title, brand, dark: tone.toLowerCase() === "dark" };
    const group = groups.find((g) => g.brand === brand);
    if (group) group.items.push(item);
    else groups.push({ brand, items: [item] });
  }
  return groups;
}

/** Lower-case, hyphenated form of a heading, for URLs and element ids. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\[\/?(gg|g|b)\]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const services: Service[] = (raw as ServiceContent[]).map((service) => {
  const slug = service.slug?.trim() || slugify(service.title);
  const details = service.details ?? [];

  return {
    icon: iconFor(service.icon),
    title: service.title,
    slug,
    path: `/services/${slug}`,
    tag: service.tag,
    img: imageFor(service.image),
    desc: service.desc,
    points: service.points,
    seo: {
      title: service.seo?.title || `${service.title} Services – Eire Tech`,
      description: service.seo?.description || service.desc,
    },
    intro: (service.intro ?? "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    sections: service.points.map((point, i) => ({
      title: point,
      anchor: slugify(point),
      body: details[i] ?? "",
    })),
    benefits: service.benefits ?? [],
    faqs: (service.faqs ?? [])
      .map((line) => {
        const at = line.indexOf("|");
        return at === -1
          ? null
          : { question: line.slice(0, at).trim(), answer: line.slice(at + 1).trim() };
      })
      .filter((faq): faq is { question: string; answer: string } => !!faq?.question),
    gallery: parseGallery(service.gallery ?? []),
    galleryPoint: service.galleryPoint ?? "",
  };
});

export function serviceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/** A bullet point's link: the detail page, scrolled to that point's section. */
export function pointHref(service: Service, point: string): string {
  return `${service.path}#${slugify(point)}`;
}
