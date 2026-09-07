import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { StaticRouteHead } from "./components/StaticRouteHead";

import "./styles.css";
import { disableDocumentShell } from "./spa-route-tree";
import { getRouter } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

// Must run before getRouter() builds the router. See src/spa-route-tree.ts.
disableDocumentShell();

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={getRouter()} InnerWrap={StaticRouteHead} />
  </StrictMode>,
);

/**
 * Each page ships with its own content prerendered into #prerendered (see the
 * prerender step in vite.static.config.ts), sitting as a fixed overlay above
 * the empty #root.
 *
 * That layer is what the visitor — and any crawler that does not run JS — sees
 * first. React mounts underneath it and the layer is dropped only once React
 * has actually committed and painted, so there is never a blank frame between
 * the two. If React never gets that far the prerendered page simply stays,
 * which is a far better no-JS fallback than the old hand-written hero: it is
 * this route's real content.
 *
 * Hydrating it instead was the obvious idea, and it does not work here: the
 * router renders SafeFragment on the server and Suspense in the browser, so the
 * two trees differ by design and React discards the markup and re-renders. That
 * contract belongs to TanStack Start, which this static build does not use.
 */
const prerendered = document.getElementById("prerendered");

if (prerendered) {
  let frames = 0;

  const drop = () => {
    if (!rootElement.firstElementChild) {
      // Stop after ~10s. A page that stays beats a blank one, and this keeps a
      // failed mount from spinning rAF forever.
      if (frames++ < 600) requestAnimationFrame(drop);
      return;
    }
    // One more frame so React's paint is on screen before the layer goes, and
    // carry over any scrolling done while it was up.
    requestAnimationFrame(() => {
      const { scrollTop } = prerendered;
      prerendered.remove();
      if (scrollTop > 0) window.scrollTo(0, scrollTop);
    });
  };

  requestAnimationFrame(drop);
}
