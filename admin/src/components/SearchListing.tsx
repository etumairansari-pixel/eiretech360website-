import { useId } from "react";
import type { Path, Route, Seo } from "../api";

/**
 * The search-engine panel: the fields that decide how a page appears in
 * results, with a preview of the listing and the length guidance Google's
 * truncation actually follows.
 */

const TITLE_RANGE = [50, 60] as const;
const DESCRIPTION_RANGE = [150, 160] as const;

function Counter({ value, range }: { value: string; range: readonly [number, number] }) {
  const n = value.trim().length;
  const [min, max] = range;
  const state = n === 0 ? "empty" : n < min ? "short" : n > max ? "long" : "ok";

  const tone = state === "ok" ? "text-good" : state === "empty" ? "text-ink-soft" : "text-warn";

  const note =
    state === "ok"
      ? "good length"
      : state === "empty"
        ? "required"
        : state === "short"
          ? `${min - n} short of ${min}`
          : `${n - max} over ${max}`;

  return (
    <span className={`font-mono text-[11px] ${tone}`}>
      {n}/{max} · {note}
    </span>
  );
}

export function SearchListing({
  route,
  seo,
  siteUrl,
  isHome,
  isContact,
  onRoute,
  onSeo,
}: {
  route: Route;
  seo: Seo;
  siteUrl: string;
  isHome: boolean;
  isContact: boolean;
  onRoute: (path: Path, value: unknown) => void;
  onSeo: (path: Path, value: unknown) => void;
}) {
  const ids = {
    title: useId(),
    description: useId(),
    slug: useId(),
    canonical: useId(),
    ogImage: useId(),
    robots: useId(),
  };

  const base = siteUrl.replace(/\/$/, "");
  const shownUrl =
    route.slug === "" ? `${base}/` : isContact ? `${base}/${route.slug}/` : `${base}/${route.slug}`;

  const noindex = /noindex/i.test(seo.robots ?? "");

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">Search engine listing</h2>
        {noindex ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-warn">
            Hidden from search
          </span>
        ) : null}
      </div>

      {/* A rough rendering of the result, so an editor sees where it truncates. */}
      <div className="mb-5 rounded-xl border border-line bg-white p-4">
        <div className="truncate text-[13px] text-[#4d5156]">{shownUrl}</div>
        <div className="mt-1 truncate text-[19px] leading-tight text-[#1a0dab]">
          {seo.title || "Untitled page"}
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-[1.58] text-[#4d5156]">
          {seo.description || "No meta description yet."}
        </p>
      </div>

      <div className="grid gap-4">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label className="label" htmlFor={ids.title}>
              Meta title
            </label>
            <Counter value={seo.title ?? ""} range={TITLE_RANGE} />
          </div>
          <input
            id={ids.title}
            className="field"
            value={seo.title ?? ""}
            onChange={(e) => onSeo(["title"], e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label className="label" htmlFor={ids.description}>
              Meta description
            </label>
            <Counter value={seo.description ?? ""} range={DESCRIPTION_RANGE} />
          </div>
          <textarea
            id={ids.description}
            className="field"
            rows={3}
            value={seo.description ?? ""}
            onChange={(e) => onSeo(["description"], e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label" htmlFor={ids.slug}>
              URL slug
            </label>
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-[13px] text-ink-soft">{base}/</span>
              <input
                id={ids.slug}
                className="field"
                value={route.slug}
                disabled={isHome}
                onChange={(e) =>
                  onRoute(
                    ["slug"],
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                  )
                }
              />
            </div>
            <p className="hint">
              {isHome
                ? "The home page always lives at the site root."
                : "Changing this changes the page's address. Anything already linking to the old one will need updating."}
            </p>
          </div>

          <div>
            <label className="label" htmlFor={ids.robots}>
              Search engine visibility
            </label>
            <select
              id={ids.robots}
              className="field"
              value={seo.robots ?? "index, follow"}
              onChange={(e) => onSeo(["robots"], e.target.value)}
            >
              <option value="index, follow">Show in search results</option>
              <option value="noindex, follow">Hide from search results</option>
              <option value="index, nofollow">Index, but do not follow links</option>
              <option value="noindex, nofollow">Hide and do not follow links</option>
            </select>
            <p className="hint">Hidden pages are also left out of the sitemap.</p>
          </div>
        </div>

        <details className="rounded-xl border border-line bg-surface px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold">Advanced</summary>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="label" htmlFor={ids.canonical}>
                Canonical URL
              </label>
              <input
                id={ids.canonical}
                className="field"
                placeholder={shownUrl}
                value={seo.canonical ?? ""}
                onChange={(e) => onSeo(["canonical"], e.target.value || undefined)}
              />
              <p className="hint">Leave empty to use this page's own address.</p>
            </div>
            <div>
              <label className="label" htmlFor={ids.ogImage}>
                Social share image
              </label>
              <input
                id={ids.ogImage}
                className="field"
                placeholder="Uses the site default"
                value={seo.ogImage ?? ""}
                onChange={(e) => onSeo(["ogImage"], e.target.value || undefined)}
              />
              <p className="hint">
                A path such as /og-image.png, or a full URL. 1200×630 works best.
              </p>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
