import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NotSignedIn,
  checkSession,
  isLocal,
  getAt,
  loadContent,
  runBuild,
  saveContent,
  setAt,
  signOut,
  type BuildResult,
  type Loaded,
  type Path,
  type Route,
  type Seo,
} from "./api";
import { Login } from "./Login";
import { collectionSchema, globalSchema, pageSchema, type Section } from "./schema";
import { FieldInput, RepeaterList, type Ctx } from "./components/Fields";
import { SearchListing } from "./components/SearchListing";

type View =
  { kind: "page"; key: string } | { kind: "collection"; key: string } | { kind: "global" };

export default function App() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: "page", key: "home" });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(true);

  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    checkSession().then(setSignedIn);
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    loadContent()
      .then(setData)
      .catch((error) => {
        if (error instanceof NotSignedIn) {
          setSignedIn(false);
          return;
        }
        setLoadError(String(error.message ?? error));
      });
  }, [signedIn]);

  const leave = useCallback(async () => {
    await signOut();
    setData(null);
    setDirty(false);
    setSignedIn(false);
  }, []);

  // Leaving with unsaved edits would silently lose them.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const update = useCallback((path: Path, value: unknown) => {
    setData((current) => (current ? setAt(current, path, value) : current));
    setDirty(true);
    setStatus(null);
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setErrors([]);

    const { catalog, siteUrl, ...content } = data;
    void catalog;
    void siteUrl;

    try {
      const result = await saveContent(content);

      if (result.ok) {
        setDirty(false);
        setStatus(`Saved at ${new Date().toLocaleTimeString()}`);
        // The dev server reloads on the file change; nudge the preview too.
        previewRef.current?.contentWindow?.location.reload();
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      // The session expired or the server restarted. The edits are still in
      // state, so signing back in returns to them rather than losing them.
      if (error instanceof NotSignedIn) {
        setSignedIn(false);
        setErrors(["Your session ended. Sign in again and press Save."]);
      } else {
        setErrors([String((error as Error).message ?? error)]);
      }
    } finally {
      setSaving(false);
    }
  }, [data]);

  // Ctrl/Cmd+S is what anyone editing text will reach for.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const publish = useCallback(async () => {
    setBuilding(true);
    setBuildResult(null);
    const result = await runBuild();
    setBuilding(false);
    setBuildResult(result);
  }, []);

  const ctx: Ctx | null = useMemo(() => {
    if (!data) return null;
    return {
      catalog: data.catalog,
      pageKeys: data.site.routes.map((route) => ({ key: route.key, label: route.navLabel })),
      onChange: update,
    };
  }, [data, update]);

  if (signedIn === null) {
    return <div className="grid h-full place-items-center text-sm text-ink-soft">Loading…</div>;
  }

  if (!signedIn) {
    return (
      <Login
        onSignedIn={() => {
          setLoadError(null);
          setSignedIn(true);
        }}
      />
    );
  }

  if (loadError) {
    return (
      <div className="grid h-full place-items-center p-8">
        <div className="card max-w-lg p-6">
          <h1 className="text-lg font-bold">Could not load the content</h1>
          <p className="mt-2 text-sm text-bad">{loadError}</p>
          <p className="hint mt-3">
            {isLocal ? (
              <>
                Make sure the admin server is running: <code>npm run admin</code>
              </>
            ) : (
              <>
                The editor reads the content from GitHub. This usually means the access token has
                expired or lost permission — rebuild the editor with a new one.
              </>
            )}
          </p>
          <button type="button" className="btn mt-4" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !ctx) {
    return <div className="grid h-full place-items-center text-sm text-ink-soft">Loading…</div>;
  }

  const routeFor = (key: string) => data.site.routes.find((r) => r.key === key) as Route;
  const previewPath = (() => {
    if (view.kind !== "page") return "/";
    const route = routeFor(view.key);
    if (!route || route.slug === "") return "/";
    return view.key === "contact" ? `/${route.slug}/` : `/${route.slug}`;
  })();

  return (
    <div className="flex h-full flex-col">
      <Header
        dirty={dirty}
        saving={saving}
        status={status}
        building={building}
        onSave={save}
        onPublish={publish}
        onSignOut={leave}
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((v) => !v)}
      />

      {errors.length > 0 ? (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3">
          <p className="text-sm font-semibold text-bad">
            Not saved — {errors.length === 1 ? "one problem" : `${errors.length} problems`} to fix:
          </p>
          <ul className="mt-1.5 list-disc pl-5 text-sm text-bad">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {buildResult ? (
        <BuildBanner result={buildResult} onDismiss={() => setBuildResult(null)} />
      ) : null}

      <div className="flex min-h-0 flex-1">
        <Sidebar data={data} view={view} onSelect={setView} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-5 p-6">
            {view.kind === "page" ? (
              <PageForm data={data} pageKey={view.key} ctx={ctx} onChange={update} />
            ) : view.kind === "collection" ? (
              <CollectionForm data={data} collection={view.key} ctx={ctx} />
            ) : (
              <GlobalForm data={data} ctx={ctx} />
            )}
          </div>
        </main>

        {previewOpen ? (
          <Preview
            ref={previewRef}
            siteUrl={data.siteUrl}
            path={previewPath}
            onReload={() => previewRef.current?.contentWindow?.location.reload()}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * The live preview of the page being edited.
 *
 * It points at the site's own dev server, so what it shows is the real page,
 * not an approximation. When that server is not running the frame would just
 * fail silently, so the panel checks first and explains what to start.
 */
function Preview({
  ref,
  siteUrl,
  path,
  onReload,
}: {
  ref: React.RefObject<HTMLIFrameElement | null>;
  siteUrl: string;
  path: string;
  onReload: () => void;
}) {
  const [reachable, setReachable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      // The dev server is a different origin, so the response is opaque; the
      // request either resolves (it is up) or rejects (it is not).
      fetch(siteUrl, { mode: "no-cors" })
        .then(() => !cancelled && setReachable(true))
        .catch(() => !cancelled && setReachable(false));
    };

    check();
    const timer = window.setInterval(check, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [siteUrl]);

  return (
    <aside className="hidden w-[460px] shrink-0 border-l border-line bg-white xl:block">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="truncate font-mono text-xs text-ink-soft">
          {siteUrl}
          {path}
        </span>
        <button type="button" className="btn px-2 py-1" onClick={onReload} disabled={!reachable}>
          Reload
        </button>
      </div>

      {reachable === false ? (
        <div className="grid h-[calc(100%-42px)] place-items-center p-8 text-center">
          <div>
            <p className="text-sm font-semibold">The site preview is not running</p>
            <p className="hint mt-2">
              Open another terminal and run <code className="font-mono">npm run dev</code>. The
              preview appears here on its own once it starts.
            </p>
          </div>
        </div>
      ) : (
        <iframe
          ref={ref}
          title="Site preview"
          src={siteUrl + path}
          className="h-[calc(100%-42px)] w-full"
        />
      )}
    </aside>
  );
}

function Header({
  dirty,
  saving,
  status,
  building,
  onSave,
  onPublish,
  onSignOut,
  previewOpen,
  onTogglePreview,
}: {
  dirty: boolean;
  saving: boolean;
  status: string | null;
  building: boolean;
  onSave: () => void;
  onPublish: () => void;
  onSignOut: () => void;
  previewOpen: boolean;
  onTogglePreview: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-line bg-white px-5 py-3">
      <div>
        <h1 className="text-sm font-extrabold tracking-tight">Eire Tech — Content</h1>
        <p className="text-[11px] text-ink-soft">
          Edits are written to <code>content/</code>. Publish rebuilds the site.
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {status ? <span className="text-xs text-good">{status}</span> : null}
        {dirty ? <span className="text-xs font-semibold text-warn">Unsaved changes</span> : null}

        <button type="button" className="btn hidden xl:inline-flex" onClick={onTogglePreview}>
          {previewOpen ? "Hide preview" : "Show preview"}
        </button>

        <button type="button" className="btn" onClick={onPublish} disabled={building || dirty}>
          {building ? "Building…" : "Publish"}
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={!dirty || saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          type="button"
          className="btn"
          title="Sign out"
          onClick={() => {
            if (dirty && !confirm("You have unsaved changes. Sign out anyway?")) return;
            onSignOut();
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

function BuildBanner({ result, onDismiss }: { result: BuildResult; onDismiss: () => void }) {
  return (
    <div
      className={`border-b px-5 py-3 ${result.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${result.ok ? "text-good" : "text-bad"}`}>
            {result.ok
              ? "Build finished. dist-static/ is ready to upload."
              : `Build failed (exit ${result.code}).`}
          </p>
          <details className="mt-1">
            <summary className="cursor-pointer text-xs text-ink-soft">Show output</summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-white p-3 font-mono text-[11px] leading-relaxed">
              {result.output.trim()}
            </pre>
          </details>
        </div>
        <button type="button" className="btn shrink-0 px-2 py-1" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

function Sidebar({
  data,
  view,
  onSelect,
}: {
  data: Loaded;
  view: View;
  onSelect: (view: View) => void;
}) {
  const item = (active: boolean, label: string, sub: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left transition-colors ${
        active ? "bg-white shadow-sm ring-1 ring-line" : "hover:bg-white/70"
      }`}
    >
      <span className="block text-sm font-semibold">{label}</span>
      <span className="block truncate text-[11px] text-ink-soft">{sub}</span>
    </button>
  );

  return (
    <nav className="w-60 shrink-0 overflow-y-auto border-r border-line bg-surface p-3">
      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        Pages
      </p>
      <div className="space-y-0.5">
        {data.site.routes.map((route) =>
          item(
            view.kind === "page" && view.key === route.key,
            route.navLabel,
            route.slug === "" ? "/" : `/${route.slug}`,
            () => onSelect({ kind: "page", key: route.key }),
          ),
        )}
      </div>

      <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        Lists
      </p>
      <div className="space-y-0.5">
        {Object.entries(collectionSchema).map(([key, schema]) =>
          item(
            view.kind === "collection" && view.key === key,
            schema.label,
            `${(data[key as "services" | "platforms" | "testimonials"] ?? []).length} ${schema.itemLabel}s`,
            () => onSelect({ kind: "collection", key }),
          ),
        )}
      </div>

      <p className="px-3 pb-2 pt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        Site-wide
      </p>
      <div className="space-y-0.5">
        {item(view.kind === "global", "Settings", "Contact, social, footer", () =>
          onSelect({ kind: "global" }),
        )}
      </div>
    </nav>
  );
}

function SectionCard({
  section,
  source,
  basePath,
  ctx,
}: {
  section: Section;
  source: unknown;
  basePath: Path;
  ctx: Ctx;
}) {
  return (
    <section className="card p-5">
      <h2 className="text-base font-bold">{section.title}</h2>
      {section.help ? <p className="hint mb-4 mt-1">{section.help}</p> : <div className="mb-4" />}

      <div className="grid gap-4">
        {section.fields?.map((field) => (
          <FieldInput
            key={field.path.join(".")}
            field={field}
            value={getAt(source, field.path)}
            basePath={basePath}
            ctx={ctx}
          />
        ))}
      </div>

      {section.repeaters?.map((repeater) => (
        <div key={repeater.path.join(".")} className="mt-6">
          <RepeaterList
            repeater={repeater}
            rows={(getAt(source, repeater.path) as Record<string, unknown>[]) ?? []}
            basePath={basePath}
            ctx={ctx}
          />
        </div>
      ))}
    </section>
  );
}

function PageForm({
  data,
  pageKey,
  ctx,
  onChange,
}: {
  data: Loaded;
  pageKey: string;
  ctx: Ctx;
  onChange: (path: Path, value: unknown) => void;
}) {
  const routeIndex = data.site.routes.findIndex((r) => r.key === pageKey);
  const route = data.site.routes[routeIndex];
  const page = data.pages[pageKey];
  const sections = pageSchema[pageKey] ?? [];

  if (!route || !page) {
    return <p className="text-sm text-ink-soft">That page is not in the content file.</p>;
  }

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">{route.navLabel}</h1>
        <span className="font-mono text-xs text-ink-soft">content/pages/{pageKey}.json</span>
      </div>

      <SearchListing
        route={route}
        seo={page.seo as Seo}
        siteUrl={data.site.site.url}
        isHome={pageKey === "home"}
        isContact={pageKey === "contact"}
        onRoute={(path, value) => onChange(["site", "routes", routeIndex, ...path], value)}
        onSeo={(path, value) => onChange(["pages", pageKey, "seo", ...path], value)}
      />

      <section className="card p-5">
        <h2 className="text-base font-bold">Navigation labels</h2>
        <p className="hint mb-4 mt-1">How this page is named in the header and footer menus.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <FieldInput
            field={{ path: ["navLabel"], label: "Header label", kind: "text" }}
            value={route.navLabel}
            basePath={["site", "routes", routeIndex]}
            ctx={ctx}
          />
          <FieldInput
            field={{ path: ["footerLabel"], label: "Footer label", kind: "text" }}
            value={route.footerLabel}
            basePath={["site", "routes", routeIndex]}
            ctx={ctx}
          />
        </div>
      </section>

      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          source={page}
          basePath={["pages", pageKey]}
          ctx={ctx}
        />
      ))}
    </>
  );
}

function CollectionForm({ data, collection, ctx }: { data: Loaded; collection: string; ctx: Ctx }) {
  const repeater = collectionSchema[collection];
  const rows = (data[collection as "services" | "platforms" | "testimonials"] ?? []) as Record<
    string,
    unknown
  >[];

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">{repeater.label}</h1>
        <span className="font-mono text-xs text-ink-soft">content/{collection}.json</span>
      </div>
      <section className="card p-5">
        <RepeaterList repeater={repeater} rows={rows} basePath={[]} ctx={ctx} />
      </section>
    </>
  );
}

function GlobalForm({ data, ctx }: { data: Loaded; ctx: Ctx }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">Site-wide settings</h1>
        <span className="font-mono text-xs text-ink-soft">content/site.json</span>
      </div>
      {globalSchema.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          source={data.site}
          basePath={["site"]}
          ctx={ctx}
        />
      ))}
    </>
  );
}
