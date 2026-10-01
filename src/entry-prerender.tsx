/**
 * Build-time prerender entry. Renders a route's real React tree to HTML so the
 * served document carries that page's own content instead of a copy of the
 * homepage. Consumed only by the prerender step in vite.static.config.ts — it
 * never reaches the client bundle.
 */
import { renderToString } from "react-dom/server";
import { RouterProvider, createRouter, createMemoryHistory } from "@tanstack/react-router";

import { disableDocumentShell } from "./spa-route-tree";

const routeTree = disableDocumentShell();

export async function render(url: string): Promise<string> {
  const router = createRouter({
    routeTree,
    context: {},
    history: createMemoryHistory({ initialEntries: [url] }),
  });

  await router.load();

  return renderToString(<RouterProvider router={router} />);
}

/**
 * The homepage below its hero, plus the footer. The homepage ships a
 * hand-written hero shell for speed; this fills in the rest so crawlers that
 * do not run JavaScript still read the whole page.
 */
export async function renderHomeBody(): Promise<string> {
  const flags = globalThis as { __EIRE_HOME_BODY__?: boolean };
  flags.__EIRE_HOME_BODY__ = true;
  try {
    return await render("/");
  } finally {
    delete flags.__EIRE_HOME_BODY__;
  }
}
