# Contact form safeguard

The production contact page is deliberately a **standalone static form**. This
prevents the page from becoming unresponsive while a visitor is typing.

## Non-negotiable rule

`/contact/` must not load the React application bundle. It may contain the
shared navigation and footer, native form fields, and the small submit handler
inserted by `makeContactStandalone()` in `vite.static.config.ts`.

Do not add any of these back to the generated `dist-static/contact/index.html`:

- `<script type="module">`
- `modulepreload`
- `<div id="root">`

The React source in `src/routes/contact.tsx` remains necessary to render the
static markup during the build. It is not a reason to re-enable React in the
published contact page.

## Automatic protection

`npm run build` and `npm run build:static` automatically run
`scripts/verify-static.mjs`. The build fails when the contact page is missing
its native form or standalone submit handler, or when the React runtime/root
is added back.

Before publishing a contact-page change, run:

```bash
npm run build
```

Then inspect `dist-static/contact/index.html` or run this PowerShell check:

```powershell
$html = Get-Content dist-static/contact/index.html -Raw
$html -match '<script type="module"|modulepreload|id="root"'
```

It must return `False`. The live-page equivalent is
`https://eiretech360.com/contact/` after the deployment completes.
