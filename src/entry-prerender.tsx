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
