/**
 * Talking to the admin server.
 *
 * Everything is a file under content/ — there is no database, so "load" reads
 * the JSON the site imports and "save" writes it straight back.
 *
 * Two backends answer these calls. Locally it is the Node server in
 * scripts/admin-server.mjs, which edits the working tree directly. Deployed, it
 * is api.php on the host, which reads and commits the same files on GitHub and
 * asks the build workflow to publish them. __ADMIN_API__ decides which, and is
 * the only difference between the two builds.
 */

// Replaced at build time by scripts/build-admin.mjs. Vite does not honour a
// define for import.meta.env keys, so this is a plain global instead.
declare const __ADMIN_API__: string | undefined;

const API_BASE = typeof __ADMIN_API__ === "string" ? __ADMIN_API__ : "/api/";

/** The URL for one endpoint, in whichever shape the current backend wants. */
function endpoint(name: string): string {
  return `${API_BASE}${name}`;
}

export type Route = {
  key: string;
  slug: string;
  navLabel: string;
  footerLabel: string;
};

export type Seo = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  robots?: string;
};

export type Content = {
  site: {
    site: { url: string; name: string; tagline: string; ogImage: string; themeColor: string };
    contact: { email: string; phone: string; phoneHref: string };
    social: { label: string; href: string }[];
    nav: { ctaLabel: string };
    footer: {
      blurb: string;
      capabilities: string[];
      ctaLabel: string;
      visitTitle: string;
      visitLine: string;
      address: string[];
    };
    routes: Route[];
  };
  pages: Record<string, Record<string, unknown>>;
  services: Record<string, unknown>[];
  platforms: Record<string, unknown>[];
  testimonials: Record<string, unknown>[];
};

export type Catalog = {
  icons: { name: string; label: string }[];
  images: string[];
};

export type Loaded = Content & { catalog: Catalog; siteUrl: string };

/** Thrown when the server says there is no valid session. */
export class NotSignedIn extends Error {
  constructor() {
    super("Not signed in");
    this.name = "NotSignedIn";
  }
}

export async function checkSession(): Promise<boolean> {
  const response = await fetch(endpoint("session"));
  if (!response.ok) return false;
  const body = await response.json();
  return Boolean(body.signedIn);
}

export async function signIn(
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch(endpoint("login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const body = await response.json().catch(() => ({}));
  return response.ok ? { ok: true } : { ok: false, error: body.error ?? "Could not sign in." };
}

export async function signOut(): Promise<void> {
  await fetch(endpoint("logout"), { method: "POST" });
}

/** True when the editor is served by the local Node server rather than the host. */
export const isLocal = API_BASE.startsWith("/api");

export async function loadContent(): Promise<Loaded> {
  const response = await fetch(endpoint("content"));
  if (response.status === 401) throw new NotSignedIn();

  if (!response.ok) {
    // The server explains why — a stale token, an unreachable GitHub — and that
    // is far more use than the status code on its own.
    const body = await response.json().catch(() => null);
    const reason = body && Array.isArray(body.errors) ? body.errors.join(" ") : "";
    throw new Error(reason || `Could not load the content (${response.status}).`);
  }

  return response.json();
}

export type SaveResult = { ok: true } | { ok: false; errors: string[] };

export async function saveContent(content: Content): Promise<SaveResult> {
  const response = await fetch(endpoint("content"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });

  if (response.status === 401) throw new NotSignedIn();

  const body = await response.json().catch(() => ({ ok: false, errors: ["Unexpected reply"] }));
  return body as SaveResult;
}

export type BuildResult = { ok: boolean; code: number; output: string };

export async function runBuild(): Promise<BuildResult> {
  const response = await fetch(endpoint("build"), { method: "POST" });
  return response.json();
}

/* ------------------------------------------------------------------
   Immutable updates by path

   The editor holds the whole content tree in one piece of state, and every
   field writes through here, so a change never mutates what React is holding.
------------------------------------------------------------------ */

export type Path = (string | number)[];

export function getAt(source: unknown, path: Path): unknown {
  return path.reduce<unknown>(
    (node, key) => (node == null ? undefined : (node as Record<string | number, unknown>)[key]),
    source,
  );
}

export function setAt<T>(source: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;

  const [key, ...rest] = path;

  if (Array.isArray(source)) {
    const copy = source.slice();
    copy[key as number] = setAt(copy[key as number], rest, value);
    return copy as unknown as T;
  }

  const copy = { ...(source as Record<string, unknown>) };
  copy[key as string] = setAt(copy[key as string], rest, value);
  return copy as unknown as T;
}
