import { useMemo, useState } from "react";
import type { BlogPost, Loaded, Path } from "../api";
import { ImagePicker, RichEditor, type LinkTarget } from "./RichEditor";
import { blankPost, postProblems, slugify } from "../blog-post";

/**
 * The Blog view: the list of articles, and the editor for one of them.
 *
 * Articles live in content/blog.json. Save keeps them in the browser like every
 * other edit; Commit publishes them, and the build gives each published article
 * its own page at /blog/<address>, adds it to the sitemap and checks it.
 */

/** Everything an internal link in an article may point at. */
function linkTargets(data: Loaded, currentSlug: string): LinkTarget[] {
  const pages = data.site.routes.map((route) => ({
    group: "Pages",
    label: route.navLabel,
    href: route.slug === "" ? "/" : route.key === "contact" ? `/${route.slug}/` : `/${route.slug}`,
  }));
  const services = data.services.map((service) => {
    const title = String(service.title ?? "");
    const slug = String(service.slug ?? "").trim() || slugify(title);
    return { group: "Services", label: title, href: `/services/${slug}` };
  });
  const articles = (data.blog ?? [])
    .filter((post) => post.slug && post.slug !== currentSlug && !post.draft)
    .map((post) => ({ group: "Blog articles", label: post.title, href: `/blog/${post.slug}` }));
  return [...pages, ...services, ...articles];
}

export function BlogForm({
  data,
  selected,
  onSelect,
  onChange,
}: {
  data: Loaded;
  selected: number | null;
  onSelect: (index: number | null) => void;
  onChange: (path: Path, value: unknown) => void;
}) {
  const posts = data.blog ?? [];
  const post = selected === null ? null : posts[selected];

  if (selected !== null && post) {
    return (
      <PostEditor
        key={selected}
        data={data}
        post={post}
        index={selected}
        onBack={() => onSelect(null)}
        onChange={onChange}
        onDelete={() => {
          if (
            !confirm(
              `Delete "${post.title || "this article"}"? This cannot be undone after Commit.`,
            )
          )
            return;
          onChange(
            ["blog"],
            posts.filter((_, i) => i !== selected),
          );
          onSelect(null);
        }}
      />
    );
  }

  const ordered = posts
    .map((p, index) => ({ p, index }))
    .sort((a, b) => b.p.date.localeCompare(a.p.date) || a.index - b.index);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Blog</h1>
          <p className="font-mono text-xs text-ink-soft">content/blog.json</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onChange(["blog"], [...posts, blankPost(data.site.site.name + " Team")]);
            onSelect(posts.length);
          }}
        >
          + New article
        </button>
      </div>

      <p className="hint">
        The blog page and its heading are edited under Pages, Blog. New articles start as drafts:
        switch them to Published when they are ready, then Save and Commit.
      </p>

      {ordered.length ? (
        <div className="space-y-2">
          {ordered.map(({ p, index }) => {
            const problems = postProblems(p, posts);
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(index)}
                className="card flex w-full items-center gap-4 p-3 text-left transition-colors hover:border-[#cbd5e1]"
              >
                <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface text-xl">
                  {p.cover ? (
                    <img src={p.cover} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "📝"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.title || "Untitled article"}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {p.date} · {p.category || "No category"} · /blog/{p.slug || "…"}
                  </p>
                  {problems.length ? (
                    <p className="mt-1 truncate text-xs text-warn">⚠ {problems[0]}</p>
                  ) : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    p.draft ? "bg-[#fef3c7] text-warn" : "bg-[#dcfce7] text-good"
                  }`}
                >
                  {p.draft ? "Draft" : "Published"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="card p-10 text-center">
          <p className="font-semibold">No articles yet</p>
          <p className="hint">Press “New article” to write the first one.</p>
        </div>
      )}
    </>
  );
}

function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.trim().length;
  const tone = n === 0 ? "text-ink-soft" : n < min || n > max ? "text-warn" : "text-good";
  return (
    <span className={`text-[11px] font-semibold ${tone}`}>
      {n} / {min}–{max}
    </span>
  );
}

function PostEditor({
  data,
  post,
  index,
  onBack,
  onChange,
  onDelete,
}: {
  data: Loaded;
  post: BlogPost;
  index: number;
  onBack: () => void;
  onChange: (path: Path, value: unknown) => void;
  onDelete: () => void;
}) {
  const set = (field: keyof BlogPost | ["seo", "title" | "description"], value: unknown) =>
    onChange(["blog", index, ...(Array.isArray(field) ? field : [field])], value);

  // A new article's address follows its title until someone edits it by hand.
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(
    !post.slug || post.slug === slugify(post.title),
  );
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [tagsText, setTagsText] = useState(post.tags.join(", "));

  const targets = useMemo(() => linkTargets(data, post.slug), [data, post.slug]);
  const categories = useMemo(
    () => [...new Set((data.blog ?? []).map((p) => p.category).filter(Boolean))],
    [data.blog],
  );
  const problems = postProblems(post, data.blog ?? []);
  const base = data.site.site.url.replace(/\/$/, "");
  const seoTitle = post.seo.title || `${post.title} | ${data.site.site.name}`;
  const seoDescription = post.seo.description || post.excerpt;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn" onClick={onBack}>
          ← All articles
        </button>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-lg border border-line bg-white p-0.5"
            role="group"
            aria-label="Status"
          >
            {[
              [true, "Draft"],
              [false, "Published"],
            ].map(([draft, label]) => (
              <button
                key={String(label)}
                type="button"
                aria-pressed={Boolean(post.draft) === draft}
                onClick={() => set("draft", draft)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                  Boolean(post.draft) === draft
                    ? draft
                      ? "bg-[#fef3c7] text-warn"
                      : "bg-[#dcfce7] text-good"
                    : "text-ink-soft"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="btn text-bad" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      {problems.length ? (
        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3">
          <p className="text-sm font-semibold text-warn">
            {post.draft ? "To finish before publishing:" : "Fix before you Commit:"}
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-warn">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="blog-post-layout">
        <div className="blog-post-writing">
          <div>
            <label className="label" htmlFor="post-title">
              Title (H1)
            </label>
            <input
              id="post-title"
              className="field text-lg font-bold"
              value={post.title}
              placeholder="A clear, specific headline"
              onChange={(e) => {
                set("title", e.target.value);
                if (slugFollowsTitle) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <section className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-bold">Article</h2>
              <span className="hint m-0">
                Use Heading 2 for sections. Select text, then 🔗 Link for internal or external
                links.
              </span>
            </div>
            <RichEditor
              value={post.body}
              onChange={(html) => set("body", html)}
              linkTargets={targets}
            />
          </section>
        </div>
        <aside className="blog-post-settings" aria-label="Post settings">
          <details className="blog-post-details" open>
            <summary>Post settings</summary>
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="post-slug">
                  Page address
                </label>
                <div className="flex items-center overflow-hidden rounded-[9px] border border-line bg-surface focus-within:border-[#1e9bf0]">
                  <span className="hidden">{base}/blog/</span>
                  <input
                    id="post-slug"
                    className="min-w-0 flex-1 border-0 bg-white px-2 py-[9px] font-mono text-[13px] outline-none"
                    value={post.slug}
                    onChange={(e) => {
                      setSlugFollowsTitle(false);
                      set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                  />
                </div>
                <p className="hint">
                  Lower-case words joined by hyphens. Changing it after publishing breaks links to
                  the old address.
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="label" htmlFor="post-date">
                    Publication date
                  </label>
                  <input
                    id="post-date"
                    type="date"
                    className="field"
                    value={post.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="post-category">
                    Category
                  </label>
                  <input
                    id="post-category"
                    className="field"
                    list="post-categories"
                    value={post.category}
                    placeholder="e.g. E-commerce"
                    onChange={(e) => set("category", e.target.value)}
                  />
                  <datalist id="post-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="label" htmlFor="post-author">
                    Author
                  </label>
                  <input
                    id="post-author"
                    className="field"
                    value={post.author}
                    onChange={(e) => set("author", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="post-tags">
                  Tags
                </label>
                <input
                  id="post-tags"
                  className="field"
                  value={tagsText}
                  placeholder="Web design, SEO, Shopify"
                  onChange={(e) => {
                    setTagsText(e.target.value);
                    set(
                      "tags",
                      e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    );
                  }}
                />
                <p className="hint">Separate with commas.</p>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label className="label" htmlFor="post-excerpt">
                    Summary
                  </label>
                  <Counter value={post.excerpt} min={70} max={200} />
                </div>
                <textarea
                  id="post-excerpt"
                  className="field"
                  rows={2}
                  value={post.excerpt}
                  placeholder="One or two sentences that make someone want to read on."
                  onChange={(e) => set("excerpt", e.target.value)}
                />
                <p className="hint">Shown on the blog page and under the title.</p>
              </div>
            </div>
          </details>
          <details className="blog-post-details">
            <summary>Featured image</summary>
            <div>
              <p className="hint mb-4 mt-1">
                Shown at the top of the article, on the blog page and when the article is shared. A
                wide image (16:9) works best.
              </p>
              <ImagePicker
                value={post.cover}
                onChange={(src) => set("cover", src)}
                busy={coverBusy}
                setBusy={setCoverBusy}
                onError={setCoverError}
              />
              {coverError ? <p className="mt-2 text-sm text-bad">{coverError}</p> : null}
              <div className="mt-4">
                <label className="label" htmlFor="post-cover-alt">
                  Cover alt text
                </label>
                <input
                  id="post-cover-alt"
                  className="field"
                  value={post.coverAlt}
                  placeholder="What the image shows"
                  onChange={(e) => set("coverAlt", e.target.value)}
                />
              </div>
              {post.cover ? (
                <button
                  type="button"
                  className="btn mt-3 text-bad"
                  onClick={() => set("cover", "")}
                >
                  Remove cover
                </button>
              ) : null}
            </div>
          </details>
          <details className="blog-post-details">
            <summary>Search engine listing</summary>
            <div>
              <p className="hint mb-4 mt-1">
                Leave empty to use the title and summary. Shown in Google and when the article is
                shared.
              </p>
              <div className="mb-5 rounded-xl border border-line p-4">
                <p className="truncate text-[12px] text-ink-soft">
                  {base}/blog/{post.slug}
                </p>
                <p className="mt-0.5 truncate text-[18px] text-[#1a0dab]">{seoTitle}</p>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-[#4d5156]">{seoDescription}</p>
              </div>
              <div className="grid gap-4">
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="label" htmlFor="post-seo-title">
                      Meta title
                    </label>
                    <Counter value={seoTitle} min={30} max={60} />
                  </div>
                  <input
                    id="post-seo-title"
                    className="field"
                    value={post.seo.title}
                    placeholder={`${post.title} | ${data.site.site.name}`}
                    onChange={(e) => set(["seo", "title"], e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label className="label" htmlFor="post-seo-description">
                      Meta description
                    </label>
                    <Counter value={seoDescription} min={120} max={160} />
                  </div>
                  <textarea
                    id="post-seo-description"
                    className="field"
                    rows={2}
                    value={post.seo.description}
                    placeholder={post.excerpt}
                    onChange={(e) => set(["seo", "description"], e.target.value)}
                  />
                </div>
              </div>
            </div>
          </details>
        </aside>
      </div>
    </>
  );
}
