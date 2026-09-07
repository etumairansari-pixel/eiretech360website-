import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { disableDocumentShell } from "./spa-route-tree";

import "./styles.css";
import { getRouter } from "./router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

// The document already has its SEO tags; don't mount a second document head.
disableDocumentShell();
const router = getRouter();
// Initial metadata is already in the static HTML. Keep the original startup
// path and only update the head after navigation to another URL.
let lastHeadUrl = window.location.href;
router.subscribe("onResolved", () => {
  if (window.location.href === lastHeadUrl) return;
  lastHeadUrl = window.location.href;
  void import("./components/StaticRouteHead").then(({ syncStaticRouteHead }) => {
    syncStaticRouteHead(router.state.matches);
  });
});

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

/**
 * createRoot() empties its container, so while React worked through its first
 * render the page went blank — on a throttled phone that was seconds of white
 * between the pre-rendered shell and React's first paint, and it was the main
 * thing driving Speed Index up.
 *
 * The shell now sits outside #root as a fixed overlay, so React mounts behind
 * it and it is only dropped once React has actually committed and painted. If
 * React never gets that far the shell simply stays, which is the same no-JS
 * fallback as before.
 */
const shell = document.getElementById("shell");

if (shell) {
  let frames = 0;

  const dropShell = () => {
    if (!rootElement.firstElementChild) {
      // Stop polling after ~10s. A shell that stays beats a blank page, and
      // this keeps a failed mount from spinning rAF forever.
      if (frames++ < 600) requestAnimationFrame(dropShell);
      return;
    }
    // One more frame so React's paint is on screen before the shell goes.
    requestAnimationFrame(() => shell.remove());
  };

  requestAnimationFrame(dropShell);
}
