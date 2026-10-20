/**
 * The blog body is HTML written by the content admin's rich text editor and
 * stored in content/blog.json. It is rendered with dangerouslySetInnerHTML, so
 * everything that reaches the page goes through sanitizeBlogHtml() first: an
 * allowlist of tags and attributes, and links and images limited to safe
 * schemes. Anything else is dropped, so a pasted <script>, an onclick or a
 * javascript: link can never reach a visitor.
 *
 * It works on strings, not the DOM, because the same call runs in the browser
 * and in the build-time prerender, where there is no document.
 */

const ALLOWED_TAGS = new Set([
  "div",
  "p",
  "br",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "hr",
  "img",
  "figure",
  "figcaption",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

/** Removed together with everything inside them. */
const DROP_WITH_CONTENT =
  /<(script|style|iframe|object|embed|noscript|template|svg|math|textarea|select|title)\b[\s\S]*?<\/\1\s*>/gi;

const TOKEN =
  /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g;

const ATTRIBUTE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * A link or image address, or null when it is not one we will render.
 *
 * Site-relative paths ("/services/web"), in-page anchors and http(s) are
 * allowed everywhere; mailto: and tel: only for links.
 */
export function safeUrl(raw: string, kind: "link" | "image"): string | null {
  // Browsers ignore control characters inside an address, which is how
  // "java\tscript:" slips past a naive check. Only allowlisted starts pass.
  const value = decodeEntities(raw)
    // eslint-disable-next-line no-control-regex -- matching control characters is the point
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  if (!value) return null;
  // "//host" and "/\host" both leave the site, despite the leading slash.
  if (value.startsWith("/") && !/^\/[/\\]/.test(value)) return value;
  if (kind === "link" && value.startsWith("#")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (kind === "link" && /^(mailto|tel):/i.test(value)) return value;
  return null;
}

/** True for an address that leaves the site, which then opens in a new tab. */
export function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

function cleanAttributes(tag: string, source: string) {
  const found: Record<string, string> = {};
  for (const match of source.matchAll(ATTRIBUTE)) {
    const name = match[1].toLowerCase();
    found[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }

  const out: [string, string][] = [];

  // Block layouts use a small fixed vocabulary, never arbitrary styles/classes.
  if (tag === "div" && ["columns", "column", "gallery"].includes(found["data-blog-block"])) {
    out.push(["data-blog-block", found["data-blog-block"]]);
    if (
      ["columns", "gallery"].includes(found["data-blog-block"]) &&
      ["2", "3"].includes(found["data-columns"])
    ) {
      out.push(["data-columns", found["data-columns"]]);
    }
  }
  if (tag === "p" && found["data-blog-block"] === "button") out.push(["data-blog-block", "button"]);
  if (
    ["p", "h2", "h3", "h4", "blockquote", "img", "figure"].includes(tag) &&
    ["left", "center", "right"].includes(found["data-align"])
  ) {
    out.push(["data-align", found["data-align"]]);
  }

  if (tag === "a") {
    const href = found.href ? safeUrl(found.href, "link") : null;
    if (href) {
      out.push(["href", href]);
      if (isExternal(href)) {
        out.push(["target", "_blank"], ["rel", "noopener noreferrer"]);
      }
    }
    if (found.title) out.push(["title", decodeEntities(found.title)]);
  } else if (tag === "img") {
    const src = found.src ? safeUrl(found.src, "image") : null;
    if (!src) return null;
    out.push(["src", src], ["alt", decodeEntities(found.alt ?? "")]);
    if (found.title) out.push(["title", decodeEntities(found.title)]);
    for (const size of ["width", "height"]) {
      if (/^\d{1,5}$/.test(found[size] ?? "")) out.push([size, found[size]]);
    }
    out.push(["loading", "lazy"], ["decoding", "async"]);
  }

  return out.map(([name, value]) => ` ${name}="${escapeAttribute(value)}"`).join("");
}

/** Returns blog HTML reduced to the tags and attributes the site allows. */
export function sanitizeBlogHtml(html: string): string {
  let out = "";
  const source = String(html ?? "").replace(DROP_WITH_CONTENT, "");

  for (const match of source.matchAll(TOKEN)) {
    const [token, closing, rawTag, attributes] = match;

    if (token.startsWith("<!--")) continue;

    if (rawTag === undefined) {
      // Text, or a "<" that did not start a tag. Text from the editor is
      // already escaped; a stray "<" is escaped here so it cannot open one.
      out += token === "<" ? "&lt;" : token.replace(/>/g, "&gt;");
      continue;
    }

    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) continue;

    if (closing) {
      if (!VOID_TAGS.has(tag)) out += `</${tag}>`;
      continue;
    }

    const cleaned = cleanAttributes(tag, attributes ?? "");
    if (cleaned === null) continue;
    out += `<${tag}${cleaned}>`;
  }

  // The editor leaves empty paragraphs behind blank lines; spacing is the
  // stylesheet's job, so they would only add uneven gaps.
  return out.replace(/<p>(?:\s|&nbsp;|<br>)*<\/p>/g, "");
}

/** The body as plain text, for reading time and descriptions. */
export function blogPlainText(html: string): string {
  return decodeEntities(
    String(html ?? "")
      .replace(DROP_WITH_CONTENT, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** Minutes to read, at a typical 220 words a minute, never less than one. */
export function readingMinutes(html: string): number {
  const words = blogPlainText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
