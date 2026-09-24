import { useId, type ReactNode } from "react";
import type { Catalog, Path } from "../api";
import type { Field, Repeater } from "../schema";

/**
 * The field renderers the generated forms are built from.
 *
 * Every control reports its change as a value plus the path it belongs at, so
 * the editor can hold the whole content tree in one piece of state.
 */

export type Ctx = {
  catalog: Catalog;
  /** Page keys a link field may point at. */
  pageKeys: { key: string; label: string }[];
  onChange: (path: Path, value: unknown) => void;
};

function Wrap({
  id,
  label,
  help,
  children,
  right,
}: {
  id: string;
  label: string;
  help?: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        {right}
      </div>
      {children}
      {help ? <p className="hint">{help}</p> : null}
    </div>
  );
}

/** Inserts a highlight marker around the current selection. */
function wrapSelection(el: HTMLTextAreaElement | HTMLInputElement, open: string, close: string) {
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const value = el.value;
  return {
    next: value.slice(0, start) + open + value.slice(start, end) + close + value.slice(end),
    caret: end + open.length + close.length,
  };
}

function MarkerButtons({
  targetId,
  onApply,
}: {
  targetId: string;
  onApply: (value: string, caret: number) => void;
}) {
  const apply = (open: string, close: string) => {
    const el = document.getElementById(targetId) as HTMLTextAreaElement | null;
    if (!el) return;
    const { next, caret } = wrapSelection(el, open, close);
    onApply(next, caret);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <span className="flex gap-1.5">
      <button
        type="button"
        className="chip"
        onClick={() => apply("[g]", "[/g]")}
        title="Brand gradient"
      >
        [g]
      </button>
      <button
        type="button"
        className="chip"
        onClick={() => apply("[gg]", "[/gg]")}
        title="Gradient + glow"
      >
        [gg]
      </button>
      <button type="button" className="chip" onClick={() => apply("[b]", "[/b]")} title="Emphasis">
        [b]
      </button>
    </span>
  );
}

/** Renders marker syntax the way the site will paint it. */
export function MarkerPreview({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /\[(gg|g|b)\]([\s\S]*?)\[\/\1\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = re.exec(text))) {
    if (match.index > last)
      parts.push(<span key={`t${i++}`}>{text.slice(last, match.index)}</span>);
    parts.push(
      <span
        key={`m${i++}`}
        className={match[1] === "b" ? "font-semibold text-ink" : "gradient-text font-extrabold"}
      >
        {match[2]}
      </span>,
    );
    last = match.index + match[0].length;
    if (re.lastIndex === match.index) re.lastIndex += 1;
  }
  if (last < text.length) parts.push(<span key={`t${i++}`}>{text.slice(last)}</span>);

  return <>{parts}</>;
}

export function FieldInput({
  field,
  value,
  basePath,
  ctx,
}: {
  field: Field;
  value: unknown;
  basePath: Path;
  ctx: Ctx;
}) {
  const id = useId();
  const path = [...basePath, ...field.path];
  const set = (next: unknown) => ctx.onChange(path, next);

  switch (field.kind) {
    case "checkbox":
      return (
        <label className="flex items-center gap-2 text-sm font-medium" htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => set(e.target.checked)}
            className="size-4 accent-[#1e9bf0]"
          />
          {field.label}
        </label>
      );

    case "number":
      return (
        <Wrap id={id} label={field.label} help={field.help}>
          <input
            id={id}
            className="field"
            type="number"
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </Wrap>
      );

    case "lines": {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <Wrap id={id} label={field.label} help={field.help}>
          <textarea
            id={id}
            className="field font-mono text-[13px]"
            rows={Math.max(3, list.length + 1)}
            value={list.join("\n")}
            onChange={(e) =>
              set(
                e.target.value
                  .split("\n")
                  .map((line) => line.trimEnd())
                  .filter((line, index, all) => line !== "" || index < all.length - 1),
              )
            }
          />
        </Wrap>
      );
    }

    case "icon":
      return (
        <Wrap id={id} label={field.label} help={field.help}>
          <select
            id={id}
            className="field"
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
          >
            {ctx.catalog.icons.map((icon) => (
              <option key={icon.name} value={icon.name}>
                {icon.label}
              </option>
            ))}
          </select>
        </Wrap>
      );

    case "image":
      return (
        <Wrap id={id} label={field.label} help={field.help}>
          <select
            id={id}
            className="field"
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
          >
            {ctx.catalog.images.map((image) => (
              <option key={image} value={image}>
                {image}
              </option>
            ))}
          </select>
        </Wrap>
      );

    case "link":
      return (
        <Wrap
          id={id}
          label={field.label}
          help={field.help ?? "A page on this site, or type a full URL."}
        >
          <input
            id={id}
            className="field"
            list={`${id}-pages`}
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder="contact"
          />
          <datalist id={`${id}-pages`}>
            {ctx.pageKeys.map((page) => (
              <option key={page.key} value={page.key}>
                {page.label}
              </option>
            ))}
          </datalist>
        </Wrap>
      );

    case "robots":
      return (
        <Wrap id={id} label={field.label} help={field.help}>
          <select
            id={id}
            className="field"
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
          >
            <option value="index, follow">Show in search results</option>
            <option value="noindex, follow">Hide from search results</option>
            <option value="index, nofollow">Index, but do not follow links</option>
            <option value="noindex, nofollow">Hide and do not follow links</option>
          </select>
        </Wrap>
      );

    case "rich": {
      const text = String(value ?? "");
      return (
        <Wrap
          id={id}
          label={field.label}
          help={field.help}
          right={<MarkerButtons targetId={id} onApply={(next) => set(next)} />}
        >
          <textarea
            id={id}
            className="field"
            rows={field.rows ?? 2}
            value={text}
            onChange={(e) => set(e.target.value)}
            placeholder={field.placeholder}
          />
          {/\[(gg|g|b)\]/.test(text) ? (
            <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-[15px] leading-snug">
              <MarkerPreview text={text} />
            </p>
          ) : null}
        </Wrap>
      );
    }

    case "textarea":
      return (
        <Wrap id={id} label={field.label} help={field.help}>
          <textarea
            id={id}
            className="field"
            rows={field.rows ?? 3}
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={field.placeholder}
          />
        </Wrap>
      );

    default:
      return (
        <Wrap id={id} label={field.label} help={field.help}>
          <input
            id={id}
            className="field"
            type={field.kind === "email" ? "email" : field.kind === "url" ? "url" : "text"}
            value={String(value ?? "")}
            onChange={(e) => set(e.target.value)}
            placeholder={field.placeholder}
          />
        </Wrap>
      );
  }
}

export function RepeaterList({
  repeater,
  rows,
  basePath,
  ctx,
}: {
  repeater: Repeater;
  rows: Record<string, unknown>[];
  basePath: Path;
  ctx: Ctx;
}) {
  const path = [...basePath, ...repeater.path];

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    const next = rows.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    ctx.onChange(path, next);
  };

  const remove = (index: number) => {
    ctx.onChange(
      path,
      rows.filter((_, i) => i !== index),
    );
  };

  const add = () => ctx.onChange(path, [...rows, structuredClone(repeater.blank)]);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label">{repeater.label}</span>
        <span className="text-xs text-ink-soft">
          {rows.length} {rows.length === 1 ? repeater.itemLabel : repeater.itemLabel + "s"}
        </span>
      </div>
      {repeater.help ? <p className="hint mb-2">{repeater.help}</p> : null}

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-semibold">
                {String(row[repeater.titleKey] || `Untitled ${repeater.itemLabel}`)}
              </span>
              <span className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  className="btn px-2 py-1"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn px-2 py-1"
                  onClick={() => move(index, index + 1)}
                  disabled={index === rows.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn px-2 py-1 text-bad"
                  onClick={() => remove(index)}
                  title={`Remove this ${repeater.itemLabel}`}
                >
                  Remove
                </button>
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {repeater.fields.map((field) => (
                <div
                  key={field.path.join(".")}
                  className={
                    field.kind === "textarea" || field.kind === "lines" ? "md:col-span-2" : ""
                  }
                >
                  <FieldInput
                    field={field}
                    value={row[field.path[0] as string]}
                    basePath={[...path, index]}
                    ctx={ctx}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn mt-3" onClick={add}>
        + Add {repeater.itemLabel}
      </button>
    </div>
  );
}
