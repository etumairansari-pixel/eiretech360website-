import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ChevronRight, Clock } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { FinalCTA } from "@/components/site/FinalCTA";
import { Reveal } from "@/components/site/primitives";
import { headFor, pathFor, route, site } from "@/content";
import { absoluteUrl, postBySlug, relatedPosts, type BlogPost } from "@/content/blog";
import blogPage from "../../content/pages/blog.json";

const SITE_URL = site.url.replace(/\/$/, "");

export const Route = createFileRoute("/blog_/$slug")({
  loader: ({ params }) => {
    if (!postBySlug(params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const post = postBySlug(params.slug);
    if (!post) return {};
    return headFor("blog", {
      ...post.seo,
      canonical: `${SITE_URL}${post.path}`,
      ogImage: post.cover || undefined,
    });
  },
  component: BlogPostPage,
});

/** Article and breadcrumb structured data, so search results can show the date and image. */
function structuredData(post: BlogPost) {
  const url = `${SITE_URL}${post.path}`;
  const graph = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.seo.description,
      url,
      mainEntityOfPage: url,
      datePublished: post.date,
      dateModified: post.date,
      ...(post.cover ? { image: absoluteUrl(post.cover) } : {}),
      author: { "@type": "Organization", name: post.author, url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: site.name,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
      },
      ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
      ...(post.category ? { articleSection: post.category } : {}),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: route("home").navLabel, item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: route("blog").navLabel,
          item: `${SITE_URL}${pathFor("blog")}`,
        },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  // "<" is escaped so no string in the content can close the script element.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
    /</g,
    "\\u003c",
  );
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const post = postBySlug(slug)!;
  const related = relatedPosts(post);
  const { cta, post: copy } = blogPage;

  return (
    <Shell>
      <article>
        <header className="relative overflow-hidden pb-12 pt-36">
          <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 size-[620px] -translate-x-1/2 rounded-full bg-brand-primary/12 blur-[130px]" />
          <div className="mx-auto max-w-3xl px-6">
            <nav
              aria-label="Breadcrumb"
              className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-brand-muted"
            >
              <Link to="/" className="hover:text-brand-primary-text">
                {route("home").navLabel}
              </Link>
              <ChevronRight className="size-3.5" />
              <Link to={pathFor("blog")} className="hover:text-brand-primary-text">
                {route("blog").navLabel}
              </Link>
              <ChevronRight className="size-3.5" />
              <span aria-current="page" className="line-clamp-1 text-brand-text">
                {post.title}
              </span>
            </nav>
            {post.category ? (
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-primary-text">
                {post.category}
              </p>
            ) : null}
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-5 text-lg leading-relaxed text-brand-muted">{post.excerpt}</p>
            ) : null}
            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-muted">
              <span className="font-semibold text-brand-text">{post.author}</span>
              <span aria-hidden>·</span>
              <time dateTime={post.date}>{post.dateLabel}</time>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {post.minutes} min read
              </span>
            </div>
          </div>
        </header>

        {post.cover ? (
          <div className="mx-auto max-w-5xl px-6">
            <img
              src={post.cover}
              alt={post.coverAlt}
              decoding="async"
              className="aspect-[16/9] w-full rounded-3xl border border-brand-line object-cover"
            />
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl px-6 py-14">
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />

          {post.tags.length ? (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-brand-line px-3 py-1 text-xs text-brand-muted"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-12 border-t border-brand-line pt-8">
            <Link
              to={pathFor("blog")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary-text"
            >
              <ArrowLeft className="size-4" /> {copy.backLabel}
            </Link>
          </div>
        </div>
      </article>

      {related.length ? (
        <section className="bg-brand-surface py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-8 text-3xl font-extrabold tracking-tight">{copy.relatedTitle}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((other, i) => (
                <Reveal key={other.slug} delay={i * 0.06} className="h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-brand-line bg-brand-bg transition-colors hover:border-brand-primary/40">
                    {other.cover ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={other.cover}
                          alt={other.coverAlt}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="mb-3 text-xs text-brand-muted">
                        {other.dateLabel} · {other.minutes} min read
                      </p>
                      <h3 className="text-lg font-bold tracking-tight">
                        <Link
                          to="/blog/$slug"
                          params={{ slug: other.slug }}
                          className="after:absolute after:inset-0 after:content-['']"
                        >
                          {other.title}
                        </Link>
                      </h3>
                      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-primary-text">
                        {blogPage.listing.readMoreLabel} <ArrowUpRight className="size-4" />
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <FinalCTA {...cta} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData(post) }}
      />
    </Shell>
  );
}
