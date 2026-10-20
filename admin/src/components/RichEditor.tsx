import { useEffect, useRef, useState, type ReactNode } from "react";
import { useEditor, useEditorState, type Editor } from "@tiptap/react";
import { mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { uploadImage, UPLOAD_TYPES } from "../api";
import { Columns, Column, Gallery, ButtonBlock, BlockPresentation } from "./BlogBlocks";
import { BlockWorkspace } from "./BlockWorkspace";
import { sanitizeBlogHtml } from "../../../src/lib/blog-html";

/**
 * The blog's rich text editor.
 *
 * It writes plain HTML into content/blog.json. Only what the toolbar offers is
 * kept, and the site runs the HTML through its own allowlist sanitizer
 * (src/lib/blog-html.ts) before rendering, so nothing pasted here can put a
 * script or an unsafe link on the live site.
 */

/** A page an internal link may point at. */
export type LinkTarget = { label: string; href: string; group: string };

/**
 * Images become a <figure> when they carry a caption. The caption and alt
 * text are edited through the image dialog rather than inline, which keeps
 * the stored HTML predictable.
 */
const Figure = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: "", rendered: false },
    };
  },
  parseHTML() {
    return [
      {
        tag: "figure",
        priority: 70,
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector("img");
          if (!img?.getAttribute("src")) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") ?? "",
            title: img.getAttribute("title"),
            caption: (element as HTMLElement).querySelector("figcaption")?.textContent ?? "",
          };
        },
      },
      { tag: "img[src]" },
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const img = ["img", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)] as const;
    const caption = String(node.attrs.caption ?? "").trim();
    return caption ? ["figure", {}, img, ["figcaption", {}, caption]] : img;
  },
});

/** The editor's HTML, with an empty document stored as "". */
function htmlOf(editor: Editor) {
  return editor.isEmpty ? "" : editor.getHTML();
}

export function RichEditor({
  value,
  onChange,
  linkTargets,
  placeholder = "Start writing…",
}: {
  value: string;
  onChange: (html: string) => void;
  linkTargets: LinkTarget[];
  placeholder?: string;
}) {
  const [mode, setMode] = useState<"visual" | "html" | "preview">("visual");
  const [source, setSource] = useState(value);
  const [dialog, setDialog] = useState<null | "link" | "image">(null);
  const [galleryTarget, setGalleryTarget] = useState<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          // The site decides target and rel when it renders, from the address.
          HTMLAttributes: { target: null, rel: null, class: null },
        },
      }),
      Figure.configure({ inline: false, allowBase64: false }),
      Columns,
      Column,
      Gallery,
      ButtonBlock,
      BlockPresentation,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: { attributes: { class: "rich-content" } },
    onUpdate: ({ editor }) => onChangeRef.current(htmlOf(editor)),
  });

  useEffect(() => {
    if (editor && mode === "visual" && value !== htmlOf(editor)) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value, mode]);

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            block: editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
                ? "h3"
                : editor.isActive("heading", { level: 4 })
                  ? "h4"
                  : "p",
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            code: editor.isActive("code"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            blockquote: editor.isActive("blockquote"),
            link: editor.isActive("link"),
            image: editor.isActive("image"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
            words: editor.getText().split(/\s+/).filter(Boolean).length,
          }
        : null,
  });

  // Leaving HTML mode applies the source; entering it shows the current HTML.
  const switchMode = (next: "visual" | "html" | "preview") => {
    if (!editor || next === mode) return;
    if (next === "html") {
      setSource(htmlOf(editor));
    } else if (mode === "html" && source !== htmlOf(editor)) {
      // Only an actual edit counts as a change; a look at the HTML does not.
      editor.commands.setContent(source, { emitUpdate: true });
    }
    setMode(next);
  };

  if (!editor || !state) {
    return <div className="rich-shell min-h-80 animate-pulse bg-surface" />;
  }

  const chain = () => editor.chain().focus();

  return (
    <div className="rich-shell">
      <div className="rich-toolbar" role="toolbar" aria-label="Formatting">
        <select
          className="rich-select"
          aria-label="Text style"
          value={state.block}
          disabled={mode !== "visual"}
          onChange={(e) => {
            const level = Number(e.target.value.slice(1));
            if (e.target.value === "p") chain().setParagraph().run();
            else
              chain()
                .setHeading({ level: level as 2 | 3 | 4 })
                .run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <Divider />
        <Tool
          label="Bold (Ctrl+B)"
          active={state.bold}
          off={mode !== "visual"}
          onClick={() => chain().toggleBold().run()}
        >
          <b>B</b>
        </Tool>
        <Tool
          label="Italic (Ctrl+I)"
          active={state.italic}
          off={mode !== "visual"}
          onClick={() => chain().toggleItalic().run()}
        >
          <i className="font-serif">I</i>
        </Tool>
        <Tool
          label="Underline (Ctrl+U)"
          active={state.underline}
          off={mode !== "visual"}
          onClick={() => chain().toggleUnderline().run()}
        >
          <u>U</u>
        </Tool>
        <Tool
          label="Strikethrough"
          active={state.strike}
          off={mode !== "visual"}
          onClick={() => chain().toggleStrike().run()}
        >
          <s>S</s>
        </Tool>
        <Tool
          label="Inline code"
          active={state.code}
          off={mode !== "visual"}
          onClick={() => chain().toggleCode().run()}
        >
          <span className="font-mono text-[12px]">{"</>"}</span>
        </Tool>

        <Divider />
        <Tool
          label="Bulleted list"
          active={state.bulletList}
          off={mode !== "visual"}
          onClick={() => chain().toggleBulletList().run()}
        >
          • List
        </Tool>
        <Tool
          label="Numbered list"
          active={state.orderedList}
          off={mode !== "visual"}
          onClick={() => chain().toggleOrderedList().run()}
        >
          1. List
        </Tool>
        <Tool
          label="Quote"
          active={state.blockquote}
          off={mode !== "visual"}
          onClick={() => chain().toggleBlockquote().run()}
        >
          “ ”
        </Tool>
        <Tool
          label="Divider line"
          off={mode !== "visual"}
          onClick={() => chain().setHorizontalRule().run()}
        >
          ―
        </Tool>

        <Divider />
        <Tool
          label={state.link ? "Edit link" : "Add link (select text first)"}
          active={state.link}
          off={mode !== "visual"}
          onClick={() => setDialog("link")}
        >
          🔗 Link
        </Tool>
        <Tool
          label="Remove link"
          off={mode !== "visual" || !state.link}
          onClick={() => chain().extendMarkRange("link").unsetLink().run()}
        >
          Unlink
        </Tool>
        <Tool
          label={state.image ? "Edit image" : "Insert image"}
          active={state.image}
          off={mode !== "visual"}
          onClick={() => setDialog("image")}
        >
          🖼 Image
        </Tool>

        <Divider />
        <Tool
          label="Undo (Ctrl+Z)"
          off={mode !== "visual" || !state.canUndo}
          onClick={() => chain().undo().run()}
        >
          ↶
        </Tool>
        <Tool
          label="Redo (Ctrl+Shift+Z)"
          off={mode !== "visual" || !state.canRedo}
          onClick={() => chain().redo().run()}
        >
          ↷
        </Tool>

        <span className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-ink-soft">{state.words} words</span>
          <button
            type="button"
            className={`rich-tool ${mode === "preview" ? "is-active" : ""}`}
            aria-pressed={mode === "preview"}
            onClick={() => switchMode(mode === "preview" ? "visual" : "preview")}
          >
            {mode === "preview" ? "Edit blocks" : "Preview"}
          </button>
          <button
            type="button"
            className={`rich-tool ${mode === "html" ? "is-active" : ""}`}
            onClick={() => switchMode(mode === "html" ? "visual" : "html")}
            title="Edit the HTML directly"
          >
            {mode === "html" ? "Back to editor" : "HTML"}
          </button>
        </span>
      </div>

      {mode === "html" ? (
        <textarea
          className="block min-h-96 w-full resize-y border-0 bg-[#0d1520] p-4 font-mono text-[12.5px] leading-relaxed text-[#e2e8f0] outline-none"
          value={source}
          spellCheck={false}
          onChange={(e) => {
            setSource(e.target.value);
            onChange(e.target.value);
          }}
        />
      ) : mode === "preview" ? (
        <div
          className="rich-content blog-prose"
          aria-label="Article preview"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(htmlOf(editor)) }}
        />
      ) : (
        <BlockWorkspace
          editor={editor}
          onImage={(gallery) => {
            if (gallery) {
              const { $from } = editor.state.selection;
              const pos = $from.depth ? $from.before(1) : editor.state.selection.from;
              setGalleryTarget(pos);
            } else setGalleryTarget(null);
            setDialog("image");
          }}
        />
      )}

      {dialog === "link" ? (
        <LinkDialog editor={editor} targets={linkTargets} onClose={() => setDialog(null)} />
      ) : null}
      {dialog === "image" ? (
        <ImageDialog
          editor={editor}
          onClose={() => {
            setDialog(null);
            setGalleryTarget(null);
          }}
          onInsert={
            galleryTarget === null
              ? undefined
              : (attrs) => {
                  const gallery = editor.state.doc.nodeAt(galleryTarget);
                  if (gallery?.type.name === "blogGallery") {
                    editor
                      .chain()
                      .focus()
                      .insertContentAt(galleryTarget + gallery.nodeSize - 1, {
                        type: "image",
                        attrs,
                      })
                      .run();
                  }
                }
          }
        />
      ) : null}
    </div>
  );
}

function Tool({
  label,
  active = false,
  off = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  off?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rich-tool ${active ? "is-active" : ""}`}
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={off}
      // Keep the editor's selection: a click would otherwise move focus first.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />;
}

/** A small modal, closed with Escape or by clicking outside it. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0d1520]/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card w-full max-w-lg p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold">{title}</h3>
          <button type="button" className="btn px-2 py-1" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LinkDialog({
  editor,
  targets,
  onClose,
}: {
  editor: Editor;
  targets: LinkTarget[];
  onClose: () => void;
}) {
  const current = String(editor.getAttributes("link").href ?? "");
  const isInternal = !current || current.startsWith("/") || current.startsWith("#");
  const [tab, setTab] = useState<"internal" | "external">(
    current && !isInternal ? "external" : "internal",
  );
  const [href, setHref] = useState(current);
  const [query, setQuery] = useState("");
  const { from, to } = editor.state.selection;
  const hasSelection = from !== to || editor.isActive("link");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const groups = [...new Set(targets.map((t) => t.group))];
  const matches = targets.filter((t) =>
    `${t.label} ${t.href}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const apply = () => {
    let target = href.trim();
    if (tab === "external" && target && !/^(https?:|mailto:|tel:)/i.test(target)) {
      target = `https://${target}`;
    }
    if (!target) return setError("Choose a page or enter an address.");
    if (
      tab === "external" &&
      !/^(https?:\/\/[^\s/]+\.[^\s]+|mailto:\S+@\S+|tel:[+\d\s()-]+)$/i.test(target)
    ) {
      return setError("That does not look like a full web address, e.g. https://example.com");
    }
    if (!hasSelection && !text.trim()) return setError("Enter the text to link.");

    const chain = editor.chain().focus();
    if (hasSelection) {
      chain.extendMarkRange("link").setLink({ href: target }).run();
    } else {
      chain
        .insertContent({
          type: "text",
          text: text.trim(),
          marks: [{ type: "link", attrs: { href: target } }],
        })
        .insertContent(" ")
        .run();
    }
    onClose();
  };

  return (
    <Modal title={current ? "Edit link" : "Add link"} onClose={onClose}>
      <div className="mb-4 flex gap-1 rounded-lg bg-surface p-1">
        {(
          [
            ["internal", "Page on this site"],
            ["external", "Web address"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold ${
              tab === key ? "bg-white shadow-sm" : "text-ink-soft"
            }`}
            onClick={() => {
              setTab(key);
              setError("");
              if (key === "external" && href.startsWith("/")) setHref("");
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!hasSelection ? (
        <div className="mb-4">
          <label className="label" htmlFor="link-text">
            Link text
          </label>
          <input
            id="link-text"
            className="field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. our website development service"
            autoFocus
          />
          <p className="hint">Tip: select words in the article first to turn them into a link.</p>
        </div>
      ) : null}

      {tab === "internal" ? (
        <div>
          <input
            className="field mb-2"
            placeholder="Search pages, services and articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={hasSelection}
          />
          <div className="max-h-64 overflow-y-auto rounded-lg border border-line">
            {groups.map((group) => {
              const items = matches.filter((t) => t.group === group);
              if (!items.length) return null;
              return (
                <div key={group}>
                  <p className="sticky top-0 bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                    {group}
                  </p>
                  {items.map((t) => (
                    <button
                      key={t.href}
                      type="button"
                      onClick={() => {
                        setHref(t.href);
                        setError("");
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-surface ${
                        href === t.href ? "bg-[#e8f4fe] font-semibold" : ""
                      }`}
                    >
                      <span className="truncate">{t.label}</span>
                      <span className="shrink-0 font-mono text-[11px] text-ink-soft">{t.href}</span>
                    </button>
                  ))}
                </div>
              );
            })}
            {!matches.length ? <p className="p-3 text-sm text-ink-soft">No page matches.</p> : null}
          </div>
          <p className="hint">
            Internal links open in the same tab and help search engines crawl the site.
          </p>
        </div>
      ) : (
        <div>
          <label className="label" htmlFor="link-url">
            Address
          </label>
          <input
            id="link-url"
            className="field"
            value={href}
            onChange={(e) => {
              setHref(e.target.value);
              setError("");
            }}
            placeholder="https://example.com"
            autoFocus={hasSelection}
            onKeyDown={(e) => e.key === "Enter" && apply()}
          />
          <p className="hint">
            Links to other websites open in a new tab. Email: mailto:name@example.com
          </p>
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}

      <div className="mt-5 flex justify-end gap-2">
        {current ? (
          <button
            type="button"
            className="btn mr-auto text-bad"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onClose();
            }}
          >
            Remove link
          </button>
        ) : null}
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={apply}>
          {current ? "Update link" : "Add link"}
        </button>
      </div>
    </Modal>
  );
}

/** Upload, or point at, an image; edits the selected one when there is one. */
function ImageDialog({
  editor,
  onClose,
  onInsert,
}: {
  editor: Editor;
  onClose: () => void;
  onInsert?: (attrs: { src: string; alt: string; caption: string }) => void;
}) {
  const editing = !onInsert && editor.isActive("image");
  const attrs = editing ? editor.getAttributes("image") : {};
  const [src, setSrc] = useState(String(attrs.src ?? ""));
  const [alt, setAlt] = useState(String(attrs.alt ?? ""));
  const [caption, setCaption] = useState(String(attrs.caption ?? ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const apply = () => {
    if (!src.trim()) return setError("Upload an image or enter its address.");
    if (!alt.trim()) return setError("Describe the image for screen readers and search engines.");
    const values = { src: src.trim(), alt: alt.trim(), caption: caption.trim() };
    if (onInsert) onInsert(values);
    else if (editing) editor.chain().focus().updateAttributes("image", values).run();
    else editor.chain().focus().insertContent({ type: "image", attrs: values }).run();
    onClose();
  };

  return (
    <Modal title={editing ? "Image settings" : "Insert image"} onClose={onClose}>
      <ImagePicker
        value={src}
        onChange={(next) => {
          setSrc(next);
          setError("");
        }}
        busy={busy}
        setBusy={setBusy}
        onError={setError}
      />
      <div className="mt-4 grid gap-4">
        <div>
          <label className="label" htmlFor="img-alt">
            Alt text <span className="text-bad">*</span>
          </label>
          <input
            id="img-alt"
            className="field"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="What the image shows, e.g. Team reviewing a website on a laptop"
          />
        </div>
        <div>
          <label className="label" htmlFor="img-caption">
            Caption <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input
            id="img-caption"
            className="field"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Shown under the image"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        {editing ? (
          <button
            type="button"
            className="btn mr-auto text-bad"
            onClick={() => {
              editor.chain().focus().deleteSelection().run();
              onClose();
            }}
          >
            Remove image
          </button>
        ) : null}
        <button type="button" className="btn" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={apply} disabled={busy}>
          {editing ? "Update image" : "Insert image"}
        </button>
      </div>
    </Modal>
  );
}

/**
 * Upload by click or drop, or paste an address. Shared by the article body and
 * the cover image field.
 */
export function ImagePicker({
  value,
  onChange,
  busy,
  setBusy,
  onError,
}: {
  value: string;
  onChange: (src: string) => void;
  busy: boolean;
  setBusy: (busy: boolean) => void;
  onError: (message: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    onError("");
    try {
      onChange(await uploadImage(file));
    } catch (error) {
      onError(String((error as Error).message ?? error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        className={`grid min-h-40 place-items-center overflow-hidden rounded-xl border-2 border-dashed p-3 text-center transition-colors ${
          over ? "border-brand-strong bg-[#e8f4fe]" : "border-line bg-surface"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload(e.dataTransfer.files[0]);
        }}
      >
        {busy ? (
          <p className="text-sm text-ink-soft">Uploading…</p>
        ) : value ? (
          <div className="w-full">
            <img src={value} alt="" className="mx-auto max-h-48 rounded-lg object-contain" />
            <button type="button" className="btn mt-3" onClick={() => input.current?.click()}>
              Replace image
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">Drop an image here</p>
            <p className="hint mb-3">
              JPG, PNG, WebP or GIF, up to 8 MB. Large photos are resized.
            </p>
            <button type="button" className="btn" onClick={() => input.current?.click()}>
              Choose a file
            </button>
          </div>
        )}
        <input
          ref={input}
          type="file"
          accept={UPLOAD_TYPES.join(",")}
          className="hidden"
          onChange={(e) => {
            void upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <input
        className="field mt-2 font-mono text-[12px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image address: https://… or /uploads/blog/…"
      />
    </div>
  );
}
