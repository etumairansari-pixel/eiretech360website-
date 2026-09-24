# Site content

Every word, meta tag and URL slug on the site lives in this folder. There is no
database: these files are the content, the admin panel reads and writes them,
and the build reads them to produce `dist-static/`.

That is what keeps the SEO work intact. The titles, descriptions and page copy
end up **inside the static HTML** rather than being fetched at runtime, so a
crawler with JavaScript disabled sees the same thing a visitor does, and no page
pays for an extra request.

## Editing

```bash
npm run admin:password   # once, to set the editor's password
npm run admin            # the editor, at http://localhost:5174
npm run dev              # the site, at http://localhost:8080 — the editor previews this
```

The editor asks for that password before it shows or saves anything. Only a
scrypt hash of it is stored, in `.env.local`, which git ignores — so it never
leaves the machine and is not in the repository. Forgotten it? Run
`npm run admin:password` again.

Save in the editor and the dev server updates immediately. When the changes are
ready to go live, press **Publish** (or run `npm run build`) and upload
`dist-static/`.

To edit the files by hand instead, just edit them — the editor and the build
read exactly the same JSON.

## The files

| File                     | What it holds                                                          |
| ------------------------ | ---------------------------------------------------------------------- |
| `site.json`              | Site name and URL, contact details, social links, footer, the page list |
| `pages/<key>.json`       | One page's meta tags and all of its copy                               |
| `services.json`          | The nine services, used by the homepage and the services page          |
| `platforms.json`         | The platform groups on the platforms page                              |
| `testimonials.json`      | The homepage quotes                                                    |
| `seo-baseline.json`      | The titles and descriptions as supplied in the SEO sheet — a frozen reference, never used by the site |

The pages are split into their own files on purpose: each page bundles only its
own copy, so the homepage does not download the About page's text.

### `site.json` → `routes`

This is the page list. Each entry sets a page's URL slug and how it is named in
the header and footer menus:

```json
{ "key": "services", "slug": "services", "navLabel": "Services", "footerLabel": "Services" }
```

- `key` ties the entry to `pages/<key>.json`. Changing it is a code change, not
  a content change — the route files import by key.
- `slug` is the URL. `"services"` serves the page at `/services`. The home page
  is the only one allowed an empty slug.
- Changing a slug changes the page's address, rewrites `.htaccess` and the
  sitemap, and moves the directory the build emits. Anything already linking to
  the old URL will need updating, and search engines will need to recrawl.

## Highlight markers

Headings are plain text with markers around the words that need treatment:

| Marker        | What it does                          |
| ------------- | ------------------------------------- |
| `[g]…[/g]`    | the brand gradient                    |
| `[gg]…[/gg]`  | the gradient plus the hero's glow     |
| `[b]…[/b]`    | emphasised body copy                  |

```json
"title": "We build digital [g]ecosystems[/g], not just projects."
```

The editor has buttons for these and shows a preview underneath. Nothing else in
a field is interpreted, so the text stays plain — an editor cannot inject markup
through it.

## Link fields

`buttonTo`, `primaryTo` and `secondaryTo` hold either a **page key** (`contact`)
or a full URL (`https://…`). A page key is resolved to that page's current slug,
so renaming a page does not leave a broken link behind.

## Icons

`icon` fields name an icon from `scripts/icon-catalog.mjs`. The build imports
only the ones actually in use, so adding a new option to the catalogue costs
nothing until a page uses it. Run `npm run build:icons` after changing content
by hand — `npm run build` does it for you.

## What the build checks

`npm run build` fails if the emitted HTML does not match these files: every
title, description, canonical URL and H1 is compared against the content, and an
unsubstituted `%%TOKEN%%` or a missing page directory stops the build. It also
prints — without failing — any title or description that has moved away from
`seo-baseline.json`, so a deliberate rewrite is visible and an accidental one
gets noticed.
