# The content admin

The editor the site's content is changed through. It runs in two places from
one codebase:

| | Where it runs | What it edits | Who it is for |
| --- | --- | --- | --- |
| **Local** | `npm run admin` on your machine | the files in `content/` directly | you, while developing |
| **Live** | `https://eiretech360.com/<secret-path>/` | the same files, on GitHub | the SEO specialist, from anywhere |

Both show the same screens. The difference is only where the content is read
from and written to.

---

## Using it locally

```bash
npm run admin:password   # once
npm run admin            # http://localhost:5174
npm run dev              # http://localhost:8080, for the preview pane
```

Saving writes straight to `content/`. Nothing is published until you run
`npm run build` and upload, or push to `main`.

---

## Setting up the live editor

Done once. After that the specialist only ever needs the URL and the password.

### 1. Pick a secret path

The editor lives at a folder name only you and the specialist know — it is not
linked from anywhere, and it is served with `noindex`. Pick something
unguessable:

```
studio-7fa2c19e
```

Avoid `admin`, `cms`, `wp-admin` and similar: those are scanned constantly.
This is not the security boundary — the password is — but it keeps the login
page out of the way of automated traffic.

### 2. Create a GitHub token

The editor reads and writes the content through GitHub, so it needs a token.

GitHub → Settings → Developer settings → **Fine-grained personal access tokens**
→ Generate new token:

- **Repository access:** Only select repositories → this repository
- **Permissions:**
  - Contents → **Read and write** (to save content)
  - Actions → **Read and write** (so Publish can start the build)
  - Metadata → Read-only (added automatically)
- **Expiration:** whatever you are willing to renew. When it expires the editor
  says so plainly and the site keeps running.

Copy the token. It is shown once.

### 3. Set the password

```bash
npm run admin:password
```

It prints the hash to put in the repository secret. The password itself is
never stored anywhere — not in the repo, not on the server.

### 4. Add the repository secrets

GitHub → the repository → Settings → Secrets and variables → **Actions** →
New repository secret:

| Secret | Value |
| --- | --- |
| `ADMIN_PATH` | the folder name from step 1, e.g. `studio-7fa2c19e` |
| `ADMIN_PASSWORD_HASH` | the hash printed in step 3 |
| `ADMIN_GITHUB_TOKEN` | the token from step 2 |
| `FTP_HOST` | your Hostinger FTP host |
| `FTP_USER` | FTP username |
| `FTP_PASSWORD` | FTP password |
| `FTP_REMOTE_DIR` | where the site lives, usually `/public_html/` |
| `VITE_SUPABASE_URL` | the same value as in `.env.local` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | the same value as in `.env.local` |

Optional: `FTP_PROTOCOL` — `ftps` by default; set to `ftp` only if your host
does not offer FTPS.

### 5. Deploy

Push to `main`, or run the **Build and deploy** workflow by hand from the
Actions tab. When it finishes, the editor is live at:

```
https://eiretech360.com/<ADMIN_PATH>/
```

---

## What the specialist does

1. Open the URL, enter the password.
2. Edit. The left sidebar has the pages, the lists and the site-wide settings.
3. **Save** — the change is committed to GitHub.
4. **Publish** — the site rebuilds and uploads itself. About two minutes.

Save and Publish are separate on purpose: several edits can be saved and
reviewed, then published together.

---

## How it holds together

```
the browser  ──►  <secret>/api.php  ──►  GitHub (content/*.json)
                       │                      │
                  password check              ▼
                                       Build and deploy workflow
                                       npm run build → FTP → Hostinger
```

The web host stores no content of its own, so there is no second copy to drift
out of step with the repository. Every change is an ordinary commit: you can
see who changed what, and revert it like any other.

The build runs `scripts/verify-static.mjs`, which fails the deployment if the
generated HTML does not match `content/`. A bad edit stops before it reaches
the server rather than after.

---

## Security

- The password is stored only as a PBKDF2 hash. PBKDF2 because Node and PHP
  both have it built in, so one password works locally and live.
- Sign-in failures back off: the first few are free, then the delay doubles up
  to a minute. The counter is on disk, so clearing cookies does not reset it.
- The session cookie is `HttpOnly` and `SameSite=Strict`.
- `config.php` holds the token and the hash. Three things keep it private: the
  folder's `.htaccess` refuses to serve it, PHP executes rather than prints it,
  and it refuses to define anything unless `api.php` included it.
- The token never reaches the browser — every GitHub call is made by the server.

### Changing the password

```bash
npm run admin:password
```

Put the new hash in the `ADMIN_PASSWORD_HASH` secret and re-run the workflow.
Anyone signed in stays signed in until their session ends; to cut that short,
change the path as well.

### If the token leaks

Revoke it on GitHub, issue a new one, update the secret, re-run the workflow.
Nothing else needs touching.

---

## Files

| Path | What it is |
| --- | --- |
| `admin/src/` | the editor, shared by both modes |
| `admin/server/api.php` | the live backend: sign-in, GitHub read/write, publish |
| `admin/server/.htaccess` | blocks `config.php`, marks the folder `noindex` |
| `scripts/admin-server.mjs` | the local backend |
| `scripts/admin-auth.mjs` | password hashing and sessions, shared by the local server |
| `scripts/build-admin.mjs` | builds the live editor into `dist-static/<ADMIN_PATH>/` |
| `.github/workflows/deploy.yml` | build, verify, upload |
