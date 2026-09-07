import { routeTree } from "./routeTree.gen";

/**
 * __root.tsx declares a shellComponent that renders <html>/<head>/<body>. That
 * belongs to the SSR build, which produces the whole document. This static
 * build owns the document itself (index.html) and mounts into #root, so the
 * shell has to be off in both places that render the tree here:
 *
 *   - the prerender (src/entry-prerender.tsx), or the built page would carry a
 *     second full document inside #root;
 *   - the browser (src/main.tsx), where the router renders the shell while
 *     hydrating — putting an <html> element inside a <div>, which is invalid,
 *     duplicates every head tag, and fails hydration outright.
 *
 * This is a function rather than a top-level statement on purpose: the package
 * is marked `"sideEffects": false`, so a bare assignment in this module gets
 * tree-shaken away and the shell quietly comes back.
 *
 * The SSR entry never calls this, so its shell is untouched.
 */
export function disableDocumentShell() {
  (routeTree.options as { shellComponent?: unknown }).shellComponent = undefined;
  return routeTree;
}
