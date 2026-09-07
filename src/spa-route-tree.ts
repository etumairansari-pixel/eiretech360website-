import { routeTree } from "./routeTree.gen";

/**
 * The inner-page prerender is inserted into an existing HTML document, so its
 * build-time tree must not include the root's full <html>/<head>/<body> shell.
 * This is called only by entry-prerender.tsx. The browser keeps the selected
 * commit's original rendering path; main.tsx removes duplicate static head tags
 * after React commits. The full SSR entry also keeps its document shell.
 *
 * Keep this explicit: package.json declares sideEffects:false, so a standalone
 * module-level assignment could be tree-shaken away.
 */
export function disableDocumentShell() {
  (routeTree.options as { shellComponent?: unknown }).shellComponent = undefined;
  return routeTree;
}
