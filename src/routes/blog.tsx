import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Highlight } from "@/components/site/Highlight";
import { Reveal } from "@/components/site/primitives";
import { headFor } from "@/content";
import { posts, type BlogPost } from "@/content/blog";
import blogPage from "../../content/pages/blog.json";

export const Route = createFileRoute("/blog")({
  head: () => headFor("blog", blogPage.seo),
  component: BlogPage,
});

const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))];

function PostMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-muted">
      <time dateTime={post.date}>{post.dateLabel}</time>
      <span aria-hidden>·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" /> {post.minutes} min read
      </span>
    </div>
  );
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-line bg-brand-surface transition-colors hover:border-brand-primary/40 ${
        featured ? "lg:grid lg:grid-cols-[1.15fr_1fr]" : ""
      }`}
    >
      {post.cover ? (
        <div
          className={`relative overflow-hidden bg-brand-elevated ${featured ? "aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]" : "aspect-[16/9]"}`}
        >
          <img
            src={post.cover}
            alt={post.coverAlt}
            loading={featured ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className={`flex flex-1 flex-col ${featured ? "p-8 md:p-12" : "p-7"}`}>
        {post.category ? (
          <span className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
            {post.category}
          </span>
        ) : null}
        <h2
          className={`font-extrabold tracking-tight ${featured ? "text-3xl md:text-4xl" : "text-xl"}`}
        >
          {/* The whole card is clickable through this link's ::after. */}
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {post.title}
          </Link>
        </h2>
        <p className={`mt-3 text-brand-muted ${featured ? "text-lg" : "text-sm"}`}>
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <PostMeta post={post} />
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-primary-text">
            {blogPage.listing.readMoreLabel}
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

function BlogPage() {
  const { hero, listing, cta } = blogPage;
  const [category, setCategory] = useState("");
  const shown = category ? posts.filter((post) => post.category === category) : posts;
  const [first, ...rest] = shown;

  return (
    <Shell>
      <PageHero
        eyebrow={hero.eyebrow}
        title={<Highlight text={hero.title} />}
        subtitle={<Highlight text={hero.subtitle} />}
      />
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          {categories.length > 1 ? (
            <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
              {["", ...categories].map((name) => (
                <button
                  key={name || "all"}
                  type="button"
                  onClick={() => setCategory(name)}
                  aria-pressed={category === name}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    category === name
                      ? "border-brand-primary bg-brand-primary text-brand-on"
                      : "border-brand-line text-brand-muted hover:border-brand-primary/50 hover:text-brand-primary-text"
                  }`}
                >
                  {name || listing.allLabel}
                </button>
              ))}
            </div>
          ) : null}

          {first ? (
            <div className="space-y-6">
              <Reveal>
                <PostCard post={first} featured />
              </Reveal>
              {rest.length ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => (
                    <Reveal key={post.slug} delay={(i % 3) * 0.06} className="h-full">
                      <PostCard post={post} />
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-brand-line p-12 text-center text-brand-muted">
              {listing.emptyMessage}
            </p>
          )}
        </div>
      </section>
      <FinalCTA {...cta} />
    </Shell>
  );
}
