import type { ReactNode } from "react";

declare module "@tanstack/react-router" {
  interface HistoryState {
    /**
     * The section a link should open at. It travels in history state rather
     * than the URL hash, so the address bar keeps the clean page URL.
     */
    section?: string;
  }
}

/**
 * The section's element on the live page. Scoped to #root because the
 * prerendered overlay carries the same ids until React replaces it.
 */
function sectionElement(id: string) {
  return document.getElementById("root")?.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
}

/** Smoothly scrolls to a section on the current page without touching the URL. */
export function scrollToSection(id: string) {
  sectionElement(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Opens a section right after a page load or navigation.
 *
 * Web fonts and images land after the first jump and reflow the text above
 * the section (on a phone by hundreds of pixels), so this keeps re-aligning
 * while the layout settles and stops as soon as the visitor scrolls. Returns
 * a cleanup function.
 */
export function openSection(id: string): () => void {
  const target = sectionElement(id);
  if (!target) return () => {};

  let settled = false;
  const jump = () => {
    if (!settled) target.scrollIntoView({ block: "start" });
  };
  const stop = () => {
    settled = true;
  };
  const events = ["wheel", "touchstart", "keydown"] as const;
  for (const name of events) window.addEventListener(name, stop, { passive: true });
  const observer = new ResizeObserver(jump);
  observer.observe(document.body);
  const start = window.setTimeout(jump, 150);
  const end = window.setTimeout(stop, 3000);

  return () => {
    stop();
    observer.disconnect();
    window.clearTimeout(start);
    window.clearTimeout(end);
    for (const name of events) window.removeEventListener(name, stop);
  };
}

/** A link to a section on the same page that leaves the URL unchanged. */
export function SectionLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={() => scrollToSection(to)} className={className}>
      {children}
    </button>
  );
}
