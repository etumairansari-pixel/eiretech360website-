# Eire Tech — eiretech360.com

Marketing site for Eire Tech, a digital growth and automation agency.

Built with TanStack Start (SSR + file-based routing), React 19, Tailwind CSS v4,
Motion for animation, and Supabase for contact-form submissions. Deploys to
Cloudflare via Nitro.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev                  # http://localhost:8080
```

## Scripts

| Script                  | What it does                                                |
| ----------------------- | ----------------------------------------------------------- |
| `npm run dev`           | Dev server                                                   |
| `npm run build`         | Static build into `dist-static/` — this is what ships        |
| `npm run build:ssr`     | SSR build (Nitro → Cloudflare) into `.output/`               |
| `npm run preview`       | Preview a production build                                   |
| `npm run lint`          | ESLint + Prettier                                            |
| `npm run optimize:images` | Re-encode `src/assets` images in place (lossy, safe to re-run) |

## Environment

Both are client-side (`VITE_`) and safe to expose; the contact form degrades to
an error message when they are absent.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Layout

```
src/
  routes/          file-based routes (index, about, services, platforms, contact)
  components/site/ site chrome: Nav, Footer, Shell, primitives, shared data
  components/ui/   shadcn/ui primitives
  lib/             supabase client, theme, error reporting
  entry-prerender.tsx  build-time route renderer (static build only)
public/            favicons, og image, manifest, robots, sitemap
supabase/          edge function + migration for contact submissions
scripts/           image + icon generation
```

Contact details, social links, and the (currently unused) office address all
live in one place: `src/components/site/data.ts`.

## How the static build produces each page

`vite.static.config.ts` does three things after the bundle is written, in order:

1. **inlineStylesheet** folds Tailwind's ~100 KB sheet into a `<style>` tag and
   deletes the now-unreferenced file.
2. **emitStaticRouteMetaPages** writes `about/`, `services/` and `platforms/`
   `index.html` from the homepage HTML, swapping in each route's title,
   description, canonical and og tags, and dropping the homepage-only hero
   preload.
3. **prerenderRoutes** renders each route's React tree through an SSR build of
   `src/entry-prerender.tsx` and injects the markup into that page's `#root`,
   so the served HTML carries the page's own content. `src/main.tsx` hydrates
   that markup instead of re-rendering from scratch.

The build fails if prerendered markup references an asset the client build did
not emit, so a hashing mismatch between the two passes cannot ship.

Titles and descriptions therefore live in two places: `staticRouteMeta` in
`vite.static.config.ts` (what ships) and each route's `head:` export (used by
the SSR build). Change both.
