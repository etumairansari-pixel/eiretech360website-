/**
 * The blog articles, resolved into the shape the blog routes consume.
 *
 * Imported only by the blog routes, so no other page bundles the articles.
 * Drafts never get this far: the build strips them from content/blog.json
 * (see blogDraftsPlugin in scripts/content-html.mjs), so an unpublished
 * article is not even in the JavaScript a visitor downloads.
 */
import raw from "../../content/blog.json";
import { site } from "./index";
import type { BlogPost as BlogPostContent } from "./types";
import { blogPlainText, readingMinutes, sanitizeBlogHtml } from "@/lib/blog-html";

export type BlogPost = {
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  author: string;
  date: string;
  /** e.g. "15 October 2026". */
  dateLabel: string;
  category: string;
  tags: string[];
  /** Sanitized HTML, safe to render. */
  html: string;
  minutes: number;
  seo: { title: string; description: string };
};

const SITE_URL = site.url.replace(/\/$/, "");

/** "2026-10-15" as "15 October 2026", without the visitor's time zone moving the day. */
function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Newest first; the editor's order breaks ties. */
export const posts: BlogPost[] = (raw as BlogPostContent[])
  .filter((post) => !post.draft && post.slug)
  .map((post, index) => ({ post, index }))
  .sort((a, b) => b.post.date.localeCompare(a.post.date) || a.index - b.index)
  .map(({ post }) => {
    const html = sanitizeBlogHtml(post.body);
    return {
      slug: post.slug,
      path: `/blog/${post.slug}`,
      title: post.title,
      excerpt: post.excerpt || blogPlainText(html).slice(0, 180),
      cover: post.cover,
      coverAlt: post.coverAlt || post.title,
      author: post.author || site.name,
      date: post.date,
      dateLabel: formatDate(post.date),
      category: post.category,
      tags: post.tags ?? [],
      html,
      minutes: readingMinutes(html),
      seo: {
        title: post.seo?.title || `${post.title} | ${site.name}`,
        description: post.seo?.description || post.excerpt,
      },
    };
  });

export function postBySlug(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}

/** An absolute URL for an image path, for share tags and structured data. */
export function absoluteUrl(path: string) {
  return /^https?:/i.test(path) ? path : `${SITE_URL}${path}`;
}

/** Other articles, same category first. */
export function relatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const others = posts.filter((p) => p.slug !== post.slug);
  return [
    ...others.filter((p) => p.category === post.category),
    ...others.filter((p) => p.category !== post.category),
  ].slice(0, count);
}
