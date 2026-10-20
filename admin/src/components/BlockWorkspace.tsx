import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditorState, type Editor } from "@tiptap/react";
import { NodeSelection, Selection } from "@tiptap/pm/state";
import type { Attrs } from "@tiptap/pm/model";
import { blockLabel, blockOptions } from "./BlogBlocks";

export function BlockWorkspace({
  editor,
  onImage,
}: {
  editor: Editor;
  onImage: (gallery?: boolean) => void;
}) {
  const [panel, setPanel] = useState<"insert" | "list" | "settings" | null>(null);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [dismissedSlash, setDismissedSlash] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      const { selection, doc } = editor.state;
      const pos = selection.$from.depth > 0 ? selection.$from.before(1) : selection.from;
      const blocks: {
        pos: number;
        size: number;
        type: string;
        text: string;
        attrs: Attrs;
      }[] = [];
      doc.forEach((node, at) =>
        blocks.push({
          pos: at,
          size: node.nodeSize,
          type: node.type.name,
          text: node.textContent,
          attrs: node.attrs,
        }),
      );
      const currentIndex = Math.max(
        0,
        blocks.findIndex((block) => block.pos === pos),
      );
      const { $from } = selection;
      const before = $from.parent.isTextblock
        ? $from.parent.textBetween(0, $from.parentOffset)
        : "";
      const slash =
        selection.empty && $from.parent.type.name === "paragraph" && /^\/[a-z0-9 -]*$/i.test(before)
          ? {
              from: $from.start(),
              to: selection.from,
              query: before.slice(1),
              key: `${$from.start()}:${before}`,
            }
          : null;
      return { blocks, currentIndex, slash };
    },
  });
  const current = state.blocks[state.currentIndex];
  const slash = state.slash && state.slash.key !== dismissedSlash ? state.slash : null;
  const showInserter = panel === "insert" || Boolean(slash);
  const term = slash ? slash.query : query;
  const options = blockOptions.filter((block) =>
    `${block.label} ${block.description}`.toLowerCase().includes(term.toLowerCase()),
  );
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    setHighlight(0);
  }, [term]);
  useEffect(() => {
    if (!state.slash) setDismissedSlash("");
  }, [state.slash]);
  useEffect(() => {
    if (panel === "insert") search.current?.focus();
  }, [panel]);

  const select = (pos: number) => {
    const node = editor.state.doc.nodeAt(pos);
    if (!node) return;
    const selection =
      node.isAtom || node.type.name === "blogGallery"
        ? NodeSelection.create(editor.state.doc, pos)
        : Selection.near(editor.state.doc.resolve(pos + 1));
    editor.view.dispatch(editor.state.tr.setSelection(selection).scrollIntoView());
    editor.view.focus();
  };

  const insert = (type: string) => {
    const activeSlash = slash;
    if (activeSlash)
      editor.chain().focus().deleteRange({ from: activeSlash.from, to: activeSlash.to }).run();
    const { selection } = editor.state;
    const pos = selection.$from.depth ? selection.$from.before(1) : selection.from;
    const node = editor.state.doc.nodeAt(pos);
    const replace = node?.type.name === "paragraph" && node.content.size === 0;
    const from = replace ? pos : pos + (node?.nodeSize ?? 0);
    const range = replace ? { from, to: from + node!.nodeSize } : from;
    const paragraph = { type: "paragraph" };
    const text = (value: string) => ({ type: "text", text: value });
    const heading = (value: string) => ({
      type: "heading",
      attrs: { level: 2 },
      content: [text(value)],
    });
    const content =
      type === "featurePattern"
        ? {
            type: "blogColumns",
            content: ["Your first benefit", "Your second benefit"].map((label) => ({
              type: "blogColumn",
              content: [
                heading(label),
                { type: "paragraph", content: [text("Explain what this means for your reader.")] },
              ],
            })),
          }
        : type === "ctaPattern"
          ? [
              heading("Ready to take the next step?"),
              {
                type: "paragraph",
                content: [text("Tell your reader how you can help and what to do next.")],
              },
              { type: "blogButton" },
            ]
          : type === "heading"
            ? { type, attrs: { level: 2 } }
            : type === "bulletList" || type === "orderedList"
              ? { type, content: [{ type: "listItem", content: [paragraph] }] }
              : type === "blockquote"
                ? { type, content: [paragraph] }
                : type === "blogColumns"
                  ? {
                      type,
                      content: [
                        { type: "blogColumn", content: [paragraph] },
                        { type: "blogColumn", content: [paragraph] },
                      ],
                    }
                  : { type: type === "image" ? "paragraph" : type };
    editor.chain().focus().insertContentAt(range, content).run();
    select(from);
    setPanel(
      type === "blogButton" || type === "blogGallery" || type === "blogColumns" ? "settings" : null,
    );
    setQuery("");
    if (type === "image") onImage();
  };
  const insertRef = useRef(insert);
  insertRef.current = insert;

  useEffect(() => {
    if (!showInserter) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPanel(null);
        setDismissedSlash(state.slash?.key ?? "");
        editor.commands.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const length = optionsRef.current.length;
        if (length)
          setHighlight((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + length) % length);
      } else if (event.key === "Enter" && !event.shiftKey && optionsRef.current.length) {
        event.preventDefault();
        event.stopPropagation();
        insertRef.current(
          optionsRef.current[Math.min(highlight, optionsRef.current.length - 1)].type,
        );
      }
    };
    const dom = editor.view.dom;
    dom.addEventListener("keydown", handle, true);
    const input = search.current;
    input?.addEventListener("keydown", handle);
    return () => {
      dom.removeEventListener("keydown", handle, true);
      input?.removeEventListener("keydown", handle);
    };
  }, [showInserter, highlight, state.slash?.key, editor]);

  const move = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= state.blocks.length ||
      toIndex < 0 ||
      toIndex >= state.blocks.length ||
      fromIndex === toIndex
    )
      return;
    const source = state.blocks[fromIndex];
    const target = state.blocks[toIndex];
    const node = editor.state.doc.nodeAt(source.pos)!;
    const destination = toIndex > fromIndex ? target.pos + target.size - source.size : target.pos;
    const tr = editor.state.tr
      .delete(source.pos, source.pos + source.size)
      .insert(destination, node);
    tr.setSelection(
      node.isAtom || node.type.name === "blogGallery"
        ? NodeSelection.create(tr.doc, destination)
        : Selection.near(tr.doc.resolve(destination + 1)),
    );
    editor.view.dispatch(tr.scrollIntoView());
    editor.view.focus();
  };

  const update = (attrs: Record<string, unknown>) => {
    if (!current) return;
    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(current.pos, undefined, { ...current.attrs, ...attrs }),
    );
  };
  const remove = () => {
    if (!current) return;
    if (state.blocks.length === 1) editor.chain().focus().setContent("<p></p>").run();
    else
      editor
        .chain()
        .focus()
        .deleteRange({ from: current.pos, to: current.pos + current.size })
        .run();
  };
  const duplicate = () => {
    if (!current) return;
    const node = editor.state.doc.nodeAt(current.pos)!;
    editor
      .chain()
      .focus()
      .insertContentAt(current.pos + current.size, node.toJSON())
      .run();
    select(current.pos + current.size);
  };

  return (
    <div className="block-workspace">
      <div className="block-topbar">
        <button
          type="button"
          className="block-insert-toggle"
          aria-label="Add block"
          aria-expanded={showInserter}
          onClick={() => {
            setPanel(panel === "insert" ? null : "insert");
            setQuery("");
          }}
        >
          ＋ <span>Add block</span>
        </button>
        <button
          type="button"
          className="rich-tool"
          aria-label="List view"
          aria-pressed={panel === "list"}
          onClick={() => setPanel(panel === "list" ? null : "list")}
        >
          ☷ List view
        </button>
        <span className="block-count">{state.blocks.length} blocks</span>
        <button
          type="button"
          className="rich-tool"
          aria-label="Block settings"
          aria-pressed={panel === "settings"}
          onClick={() => setPanel(panel === "settings" ? null : "settings")}
        >
          ⚙ Settings
        </button>
      </div>
      <div className={`block-layout ${panel || slash ? "has-panel" : ""}`}>
        <div className="block-canvas">
          <div
            className="block-selection-tools"
            role="toolbar"
            aria-label="Selected block controls"
          >
            <strong>{current ? blockLabel(current.type) : "Block"}</strong>
            <button
              type="button"
              aria-label="Move block up"
              disabled={state.currentIndex === 0}
              onClick={() => move(state.currentIndex, state.currentIndex - 1)}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="Move block down"
              disabled={state.currentIndex === state.blocks.length - 1}
              onClick={() => move(state.currentIndex, state.currentIndex + 1)}
            >
              ↓
            </button>
            <button type="button" aria-label="Duplicate block" onClick={duplicate}>
              Duplicate
            </button>
            <button type="button" aria-label="Delete block" onClick={remove}>
              Delete
            </button>
          </div>
          <EditorContent editor={editor} />
          <button
            type="button"
            className="block-appender"
            onClick={() => {
              select(state.blocks[state.blocks.length - 1].pos);
              setPanel("insert");
              setQuery("");
            }}
          >
            ＋ Add a block <span>or type / in an empty paragraph</span>
          </button>
        </div>
        {(panel || slash) && (
          <aside
            className="block-panel"
            aria-label={
              showInserter
                ? "Block inserter"
                : panel === "list"
                  ? "Block list"
                  : "Block settings panel"
            }
          >
            <div className="block-panel-heading">
              <strong>
                {showInserter ? "Add a block" : panel === "list" ? "List view" : "Block settings"}
              </strong>
              <button
                type="button"
                aria-label="Close block panel"
                onClick={() => {
                  setPanel(null);
                  setDismissedSlash(state.slash?.key ?? "");
                }}
              >
                ×
              </button>
            </div>
            {showInserter ? (
              <>
                <label className="sr-only" htmlFor="block-search">
                  Search blocks
                </label>
                <input
                  id="block-search"
                  ref={search}
                  className="field"
                  placeholder="Search blocks…"
                  value={term}
                  onChange={(event) => {
                    if (slash) {
                      editor
                        .chain()
                        .focus()
                        .insertContentAt(
                          { from: slash.from, to: slash.to },
                          "/" + event.target.value,
                        )
                        .run();
                    } else setQuery(event.target.value);
                  }}
                />
                <div className="block-options" role="listbox" aria-label="Available blocks">
                  {options.map((block, index) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === highlight}
                      className={index === highlight ? "is-highlighted" : ""}
                      key={block.type}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => insert(block.type)}
                    >
                      <span className="block-option-icon">{block.icon}</span>
                      <span>
                        <strong>{block.label}</strong>
                        <small>{block.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
                {!options.length && <p className="hint">No matching blocks.</p>}
              </>
            ) : panel === "list" ? (
              <>
                <p className="hint">
                  Select a block, or drag it to reorder. You can also use the move buttons.
                </p>
                <ol className="block-outline">
                  {state.blocks.map((block, index) => (
                    <li
                      key={block.pos}
                      draggable
                      onDragStart={(event) =>
                        event.dataTransfer.setData("application/x-blog-block", String(index))
                      }
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const value = event.dataTransfer.getData("application/x-blog-block");
                        if (/^\d+$/.test(value)) move(Number(value), index);
                      }}
                    >
                      <button
                        type="button"
                        aria-current={index === state.currentIndex ? "true" : undefined}
                        onClick={() => select(block.pos)}
                      >
                        <span aria-hidden>⠿</span>
                        <span>
                          <strong>{blockLabel(block.type)}</strong>
                          <small>{block.text.slice(0, 55) || "Empty block"}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              current && (
                <>
                  <p className="block-type-label">{blockLabel(current.type)}</p>
                  {current.type === "heading" && (
                    <label className="block-setting">
                      Heading level
                      <select
                        className="field"
                        value={current.attrs.level}
                        onChange={(event) => update({ level: Number(event.target.value) })}
                      >
                        {[2, 3, 4].map((level) => (
                          <option key={level} value={level}>
                            Heading {level}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {["paragraph", "heading", "blockquote", "image", "blogButton"].includes(
                    current.type,
                  ) && (
                    <label className="block-setting">
                      Alignment
                      <select
                        className="field"
                        value={current.attrs.blockAlign || "left"}
                        onChange={(event) => update({ blockAlign: event.target.value })}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                  )}
                  {current.type === "blogButton" && (
                    <>
                      <label className="block-setting">
                        Button text
                        <input
                          className="field"
                          value={current.attrs.text}
                          onChange={(event) => update({ text: event.target.value })}
                        />
                      </label>
                      <label className="block-setting">
                        Link address
                        <input
                          className="field"
                          value={current.attrs.href}
                          onChange={(event) => update({ href: event.target.value })}
                          placeholder="/contact/ or https://…"
                        />
                      </label>
                      <p className="hint">
                        Use a site path, full web address, email or telephone link.
                      </p>
                    </>
                  )}
                  {current.type === "image" && (
                    <>
                      <label className="block-setting">
                        Alternative text
                        <input
                          className="field"
                          value={current.attrs.alt || ""}
                          onChange={(event) => update({ alt: event.target.value })}
                        />
                      </label>
                      <label className="block-setting">
                        Caption
                        <input
                          className="field"
                          value={current.attrs.caption || ""}
                          onChange={(event) => update({ caption: event.target.value })}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          select(current.pos);
                          onImage();
                        }}
                      >
                        Replace image
                      </button>
                    </>
                  )}
                  {current.type === "blogGallery" && (
                    <>
                      <label className="block-setting">
                        Columns
                        <select
                          className="field"
                          value={current.attrs.columns}
                          onChange={(event) => update({ columns: Number(event.target.value) })}
                        >
                          <option value={2}>Two</option>
                          <option value={3}>Three</option>
                        </select>
                      </label>
                      <button type="button" className="btn" onClick={() => onImage(true)}>
                        Add gallery image
                      </button>
                      <p className="hint">
                        Click an image on the canvas, then use Image in the toolbar to edit its alt
                        text, caption or remove it.
                      </p>
                    </>
                  )}
                  {current.type === "blogColumns" && (
                    <p className="hint">
                      Click inside either column to write, format text or insert an image using the
                      toolbar.
                    </p>
                  )}
                  <div className="block-setting">
                    <button type="button" className="btn" onClick={duplicate}>
                      Duplicate block
                    </button>
                    <button type="button" className="btn text-bad" onClick={remove}>
                      Delete block
                    </button>
                  </div>
                </>
              )
            )}
          </aside>
        )}
      </div>
      <div className="block-editor-help">
        Use + to insert blocks. Use List view to select and reorder them. Changes publish through
        Save and Commit.
      </div>
    </div>
  );
}
