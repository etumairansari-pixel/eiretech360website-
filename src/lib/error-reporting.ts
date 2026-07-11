type ErrorContext = Record<string, unknown>;

/**
 * Single funnel for errors caught by React error boundaries. Point this at a
 * monitoring service (Sentry, etc.) when one is added; until then it logs.
 */
export function reportError(error: unknown, context: ErrorContext = {}) {
  if (typeof window === "undefined") return;
  console.error("[eiretech] unhandled error", error, {
    source: "react_error_boundary",
    route: window.location.pathname,
    ...context,
  });
}
