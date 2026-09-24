import { Fragment, type ReactNode } from "react";

/**
 * Renders a headline or paragraph written in the admin panel.
 *
 * Editors write plain text and mark the parts that need treatment:
 *
 *   [g]…[/g]   the brand gradient
 *   [gg]…[/gg] the gradient plus the hero's glow
 *   [b]…[/b]   emphasised body copy
 *
 * A newline becomes a line break. Nothing else is interpreted, so the fields
 * stay plain text — an editor cannot inject markup through them, and React
 * escapes the segments anyway.
 */

const RULES = [
  { open: "[gg]", close: "[/gg]", className: "brand-gradient-text text-glow" },
  { open: "[g]", close: "[/g]", className: "brand-gradient-text" },
  { open: "[b]", close: "[/b]", className: "font-semibold text-brand-text" },
] as const;

/** Matches any opening marker, so the scanner can find the next one cheaply. */
const OPEN = /\[(gg|g|b)\]/;

function parse(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let index = 0;

  while (rest.length > 0) {
    const match = OPEN.exec(rest);

    if (!match) {
      out.push(
        <Fragment key={`${keyPrefix}-t${index}`}>
          {withBreaks(rest, `${keyPrefix}-${index}`)}
        </Fragment>,
      );
      break;
    }

    const rule = RULES.find((r) => r.open === match[0]);
    const closeAt = rule ? rest.indexOf(rule.close, match.index + rule.open.length) : -1;

    // An unclosed marker is treated as literal text rather than swallowing the
    // rest of the field, so a half-finished edit still renders something sane.
    if (!rule || closeAt === -1) {
      out.push(
        <Fragment key={`${keyPrefix}-t${index}`}>
          {withBreaks(rest.slice(0, match.index + match[0].length), `${keyPrefix}-${index}`)}
        </Fragment>,
      );
      rest = rest.slice(match.index + match[0].length);
      index += 1;
      continue;
    }

    if (match.index > 0) {
      out.push(
        <Fragment key={`${keyPrefix}-t${index}`}>
          {withBreaks(rest.slice(0, match.index), `${keyPrefix}-${index}`)}
        </Fragment>,
      );
      index += 1;
    }

    const inner = rest.slice(match.index + rule.open.length, closeAt);
    out.push(
      <span key={`${keyPrefix}-m${index}`} className={rule.className}>
        {withBreaks(inner, `${keyPrefix}-m${index}`)}
      </span>,
    );
    index += 1;

    rest = rest.slice(closeAt + rule.close.length);
  }

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
