import { Fragment, type ReactNode } from "react";
import { pathFor } from "@/content";

/**
 * Renders a headline or paragraph written in the admin panel.
 *
 * Editors write plain text and mark the parts that need treatment:
 *
 *   [g]…[/g]   the brand gradient
 *   [gg]…[/gg] the gradient plus the hero's glow
 *   [b]…[/b]   emphasised body copy
 *   [label](target) an internal page key or safe external URL
 *
 * A newline becomes a line break. Nothing else is interpreted, so the fields
 * stay data-only — links are allow-listed and React escapes every segment.
 */

const RULES = [
  { open: "[gg]", close: "[/gg]", className: "brand-gradient-text text-glow" },
  { open: "[g]", close: "[/g]", className: "brand-gradient-text" },
  { open: "[b]", close: "[/b]", className: "font-semibold text-brand-text" },
] as const;

const TOKEN = /\[(gg|g|b)\]([\s\S]*?)\[\/\1\]|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

function hrefFor(target: string): string | null {
  if (/^(https?:|mailto:|tel:)/i.test(target)) return target;
  if (target.startsWith("/")) return target;
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(target)) return pathFor(target);
  return null;
}

function parse(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN.exec(text))) {
    if (match.index > last) {
      out.push(
        <Fragment key={`${keyPrefix}-t${index}`}>
          {withBreaks(text.slice(last, match.index), `${keyPrefix}-${index}`)}
        </Fragment>,
      );
      index += 1;
    }

    if (match[1]) {
      const rule = RULES.find((item) => item.open === `[${match[1]}]`)!;
      out.push(<span key={`${keyPrefix}-m${index}`} className={rule.className}>{withBreaks(match[2], `${keyPrefix}-m${index}`)}</span>);
    } else {
      const href = hrefFor(match[4]);
      if (!href) {
        out.push(<Fragment key={`${keyPrefix}-t${index}`}>{match[0]}</Fragment>);
      } else {
        const external = /^(https?:|mailto:|tel:)/i.test(href);
        out.push(
          <a key={`${keyPrefix}-a${index}`} href={href} {...(external && /^https?:/i.test(href) ? { target: "_blank", rel: "noreferrer" } : {})} className="underline decoration-brand-primary/40 underline-offset-4 hover:text-brand-primary-text">
            {match[3]}
          </a>,
        );
      }
    }
    index += 1;
    last = TOKEN.lastIndex;
  }

  if (last < text.length) out.push(<Fragment key={`${keyPrefix}-t${index}`}>{withBreaks(text.slice(last), `${keyPrefix}-${index}`)}</Fragment>);

  return out;
}

function withBreaks(text: string, keyPrefix: string): ReactNode {
  if (!text.includes("\n")) return text;

  return text.split("\n").map((line, i, all) => (
    <Fragment key={`${keyPrefix}-l${i}`}>
      {line}
      {i < all.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

export function Highlight({ text }: { text: string }) {
  return <>{parse(text, "h")}</>;
}
