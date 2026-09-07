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

| Script                    | What it does                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `npm run dev`             | Dev server                                                     |
| `npm run build`           | SSR build (Nitro → Cloudflare) into `.output/`                 |
| `npm run build:static`    | Static SPA build into `dist-static/`                           |
| `npm run preview`         | Preview a production build                                     |
| `npm run lint`            | ESLint + Prettier                                              |
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
public/            favicons, og image, manifest, robots, sitemap
supabase/          edge function + migration for contact submissions
scripts/           image + icon generation
```

Contact details, social links, and the (currently unused) office address all
live in one place: `src/components/site/data.ts`.

## SEO on the f53e14d performance baseline

The homepage HTML shell, hero/video behavior, styles and standalone contact
setup are preserved from `f53e14d3a020644a8376b607196fc580bbbf89ca`.
Only About, Services and Platforms are prerendered at build time, so crawlers
receive each page's real content instead of the homepage fallback. The homepage
keeps its lightweight shell. Contact remains its own document at `/contact/`.

`StaticRouteHead` updates the existing title, description, canonical and social
tags during client navigation. Static metadata lives in `vite.static.config.ts`;
client/SSR metadata lives in the route files. Keep both aligned with the SEO PDF.

`npm run build` also checks all five pages' titles, descriptions, canonicals and
H1 content. Use `npm run verify:static` to check an existing build.

For Hostinger, upload all contents of `dist-static/`, including `.htaccess`,
`assets/` and every page directory. Preserve the standalone contact directory.
Vite preview does not execute Apache rewrites: use `/services/`, `/platforms/`
and `/about/` to inspect their static HTML locally. Production `.htaccess` also
serves the slash-less canonical URLs directly.
