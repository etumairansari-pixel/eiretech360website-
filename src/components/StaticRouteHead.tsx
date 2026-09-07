import type { getRouter } from "../router";

/** The static document owns <head>; update its existing tags on SPA navigation. */
export function syncStaticRouteHead(matches: ReturnType<typeof getRouter>["state"]["matches"]) {
  for (const match of matches) {
    for (const meta of match.meta ?? []) {
      if (!meta) continue;
      if (typeof meta.title === "string") document.title = meta.title;
      const attribute = meta.name ? "name" : meta.property ? "property" : null;
      if (!attribute || typeof meta.content !== "string") continue;
      const key = String(meta[attribute]);
      let tag = Array.from(document.head.querySelectorAll("meta")).find(
        (element) => element.getAttribute(attribute) === key,
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.append(tag);
      }
      tag.content = meta.content;
    }

    for (const link of match.links ?? []) {
      if (!link || link.rel !== "canonical" || !link.href) continue;
      const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (canonical) canonical.href = link.href;
      const ogUrl = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]');
      if (ogUrl) ogUrl.content = link.href;
    }
  }
  // Home declares Twitter tags too; don't leave its copy on the next route.
  const twitterTitle = document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
  const twitterDescription = document.head.querySelector<HTMLMetaElement>(
    'meta[name="twitter:description"]',
  );
  if (twitterTitle) twitterTitle.content = document.title;
  if (twitterDescription) {
    twitterDescription.content =
      document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content ?? "";
  }
}
