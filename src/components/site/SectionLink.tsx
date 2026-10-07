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
 * Resolve the visible document, including SSR pages without a #root wrapper
 * and the prerendered shell shown before the client takes over.
 */
function sectionElement(id: string) {
  const selector = `[id="${CSS.escape(id)}"]`;
  return (
    document.getElementById("shell")?.querySelector<HTMLElement>(selector) ??
    document.getElementById("root")?.querySelector<HTMLElement>(selector) ??
    document.getElementById(id)
  );
}

/** Smoothly scrolls to a section on the current page without touching the URL. */
export function scrollToSection(id: string) {
  sectionElement(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
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

/** Native fragment links also work before JavaScript loads or when it is disabled. */
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
    <a
      href={`#${encodeURIComponent(to)}`}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        if (!sectionElement(to)) return;
        event.preventDefault();
        scrollToSection(to);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
