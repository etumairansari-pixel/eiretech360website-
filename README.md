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

## Editing content

Every word, meta tag and URL slug lives in `content/`. Nothing is fetched at
runtime — the build reads those files and writes the values into the static
HTML, which is what keeps the meta tags visible to crawlers and costs the page
no extra request.

```bash
npm run admin:password   # once, to set the editor's password
npm run admin            # the content editor, at http://localhost:5174
npm run dev              # the site, at http://localhost:8080 — the editor previews this
```

The editor is password-protected and bound to `127.0.0.1`. Only a scrypt hash
of the password is stored, in `.env.local`, which git ignores.

Save in the editor and the dev server updates straight away. **Publish** in the
editor (or `npm run build`) produces `dist-static/` to upload. See
[content/README.md](content/README.md) for the file layout, the highlight
markers and what changing a slug affects.

## Scripts

| Script                    | What it does                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `npm run admin`           | Content editor (reads and writes `content/`)                   |
| `npm run admin:password`  | Set the content editor's password                              |
| `npm run dev`             | Dev server                                                     |
| `npm run build`           | SSR build (Nitro → Cloudflare) into `.output/`                 |
| `npm run build:static`    | Static SPA build into `dist-static/`                           |
| `npm run preview`         | Preview a production build                                     |
| `npm run lint`            | ESLint + Prettier                                              |
| `npm run optimize:images` | Re-encode `src/assets` images in place (lossy, safe to re-run) |
| `npm run build:icons`     | Regenerate the icon registry from `content/` (the build runs it) |

## Environment

Both are client-side (`VITE_`) and safe to expose; the contact form degrades to
an error message when they are absent.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## Layout

```
content/           every word, meta tag and slug on the site (see its README)
admin/             the local content editor — never deployed
src/
  content/         typed access to content/, plus the icon and image registries
  routes/          file-based routes (index, about, services, platforms, contact)
  components/site/ site chrome: Nav, Footer, Shell, primitives
  components/ui/   shadcn/ui primitives
  lib/             supabase client, theme, error reporting
public/            favicons, og image, manifest, robots, sitemap
supabase/          edge function + migration for contact submissions
scripts/           content tooling, the admin server, image + icon generation
```

Contact details, social links, the footer and every page's copy live in
`content/`, edited through `npm run admin`.

## SEO on the f53e14d performance baseline

The homepage HTML shell, hero/video behavior, styles and standalone contact
setup are preserved from `f53e14d3a020644a8376b607196fc580bbbf89ca`.
Only About, Services and Platforms are prerendered at build time, so crawlers
receive each page's real content instead of the homepage fallback. The homepage
keeps its lightweight shell. Contact remains its own document at `/contact/`.

`StaticRouteHead` updates the existing title, description, canonical and social
tags during client navigation. Every one of those values comes from `content/`:
the route files, `vite.static.config.ts`, `index.html` and `contact/index.html`
all read the same JSON, so a title is only ever written in one place.

`npm run build` also checks all five pages' titles, descriptions, canonicals and
H1 content against `content/`, and reports — without failing — where they have
moved away from the values in the SEO sheet. Use `npm run verify:static` to
check an existing build.

For Hostinger, upload all contents of `dist-static/`, including `.htaccess`,
`assets/` and every page directory. Preserve the standalone contact directory.
Vite preview does not execute Apache rewrites: use `/services/`, `/platforms/`
and `/about/` to inspect their static HTML locally. Production `.htaccess` also
serves the slash-less canonical URLs directly.
