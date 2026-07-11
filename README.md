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
| `npm run build`         | SSR build (Nitro → Cloudflare) into `.output/`               |
| `npm run build:static`  | Static SPA build into `dist-static/`                         |
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
public/            favicons, og image, manifest, robots, sitemap
supabase/          edge function + migration for contact submissions
scripts/           image + icon generation
```

Contact details, social links, and the (currently unused) office address all
live in one place: `src/components/site/data.ts`.
