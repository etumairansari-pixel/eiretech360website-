import type { BlogPost } from "./api";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Matches slugify() in src/content/services.ts. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\[\/?(gg|g|b)\]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const today = () => new Date().toISOString().slice(0, 10);

export function blankPost(author: string): BlogPost {
  return {
    slug: "",
    title: "",
    excerpt: "",
    cover: "",
    coverAlt: "",
    author,
    date: today(),
    category: "",
    tags: [],
    body: "",
    seo: { title: "", description: "" },
    draft: true,
  };
}

/** Fills in fields an older or hand-edited entry may be missing. */
export function normalizePost(raw: Partial<BlogPost>): BlogPost {
  return {
    ...blankPost(""),
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    seo: { title: raw.seo?.title ?? "", description: raw.seo?.description ?? "" },
    draft: Boolean(raw.draft),
  };
}

/** Problems that would stop the article publishing, or publish it badly. */
export function postProblems(post: BlogPost, all: BlogPost[]): string[] {
  const problems: string[] = [];
  if (!post.title.trim()) problems.push("Add a title.");
  if (!post.slug) problems.push("Add a page address.");
  else if (!SLUG.test(post.slug))
    problems.push("The page address may only use lower-case letters, numbers and single hyphens.");
  else if (all.filter((p) => p.slug === post.slug).length > 1)
    problems.push(`Another article already uses the address "${post.slug}".`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) problems.push("Set a publication date.");
  if (!post.draft) {
    if (!post.body.replace(/<[^>]*>/g, "").trim()) problems.push("The article has no text yet.");
    if (!post.excerpt.trim()) problems.push("Add a short summary for the blog page.");
    if (post.cover && !post.coverAlt.trim()) problems.push("Describe the cover image (alt text).");
  }
  if (/<img\b(?![^>]*\balt="[^"]+")[^>]*>/i.test(post.body))
    problems.push("An image in the article has no alt text. Click it and choose Image settings.");
  return problems;
}
