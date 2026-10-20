import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const Columns = Node.create({
  name: "blogColumns",
  group: "block",
  content: "blogColumn{2,3}",
  defining: true,
  addAttributes: () => ({
    columns: { default: 2, parseHTML: (el) => el.children.length, renderHTML: () => ({}) },
  }),
  parseHTML: () => [{ tag: 'div[data-blog-block="columns"]' }],
  renderHTML: ({ HTMLAttributes, node }) => [
    "div",
    mergeAttributes(HTMLAttributes, {
      "data-blog-block": "columns",
      "data-columns": node.childCount,
    }),
    0,
  ],
});

export const Column = Node.create({
  name: "blogColumn",
  content: "block+",
  defining: true,
  parseHTML: () => [{ tag: 'div[data-blog-block="column"]' }],
  renderHTML: () => ["div", { "data-blog-block": "column" }, 0],
});

export const Gallery = Node.create({
  name: "blogGallery",
  group: "block",
  content: "image*",
  defining: true,
  addAttributes: () => ({
    columns: {
      default: 2,
      parseHTML: (el) => (Number(el.getAttribute("data-columns")) === 3 ? 3 : 2),
      renderHTML: () => ({}),
    },
  }),
  parseHTML: () => [{ tag: 'div[data-blog-block="gallery"]' }],
  renderHTML: ({ node, HTMLAttributes }) => [
    "div",
    mergeAttributes(HTMLAttributes, {
      "data-blog-block": "gallery",
      "data-columns": node.attrs.columns,
    }),
    0,
  ],
});

export const ButtonBlock = Node.create({
  name: "blogButton",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes: () => ({
    text: {
      default: "Get in touch",
      parseHTML: (el) => el.textContent || "Get in touch",
      renderHTML: () => ({}),
    },
    href: {
      default: "/contact/",
      parseHTML: (el) => el.querySelector("a")?.getAttribute("href") || "/contact/",
      renderHTML: () => ({}),
    },
  }),
  parseHTML: () => [{ tag: 'p[data-blog-block="button"]', priority: 80 }],
  renderHTML: ({ node, HTMLAttributes }) => [
    "p",
    mergeAttributes(HTMLAttributes, { "data-blog-block": "button" }),
    [
      "a",
      {
        href: /^(\/[^/]|#|https?:\/\/|mailto:|tel:)/i.test(node.attrs.href) ? node.attrs.href : "#",
      },
      node.attrs.text,
    ],
  ],
});

/** Only allowlisted attributes are serialized; the public renderer validates them too. */
export const BlockPresentation = Extension.create({
  name: "blogBlockPresentation",
  addGlobalAttributes: () => [
    {
      types: ["paragraph", "heading", "image", "blockquote", "blogButton"],
      attributes: {
        blockAlign: {
          default: null,
          parseHTML: (el) =>
            ["left", "center", "right"].includes(el.getAttribute("data-align") || "")
              ? el.getAttribute("data-align")
              : null,
          renderHTML: (attrs) => (attrs.blockAlign ? { "data-align": attrs.blockAlign } : {}),
        },
      },
    },
  ],
  addProseMirrorPlugins: () => [
    new Plugin({
      props: {
        decorations(state) {
          const decorations: Decoration[] = [];
          const { $from } = state.selection;
          const active = $from.depth > 0 ? $from.before(1) : state.selection.from;
          state.doc.forEach((node, pos, index) => {
            decorations.push(
              Decoration.node(pos, pos + node.nodeSize, {
                class: pos === active ? "blog-editor-block is-selected-block" : "blog-editor-block",
                "data-block-index": String(index),
              }),
            );
          });
          return DecorationSet.create(state.doc, decorations);
        },
      },
    }),
  ],
});

export const blockOptions = [
  { type: "paragraph", label: "Paragraph", icon: "¶", description: "Start with plain text" },
  { type: "heading", label: "Heading", icon: "H", description: "Organize your article" },
  { type: "image", label: "Image", icon: "▧", description: "Upload an image with alt text" },
  {
    type: "bulletList",
    label: "Bulleted list",
    icon: "•",
    description: "A list of related points",
  },
  { type: "orderedList", label: "Numbered list", icon: "1.", description: "Steps in a sequence" },
  { type: "blockquote", label: "Quote", icon: "❝", description: "Highlight a quotation" },
  { type: "blogButton", label: "Button", icon: "↗", description: "A clear call to action" },
  { type: "blogColumns", label: "Columns", icon: "▥", description: "Two columns of content" },
  { type: "blogGallery", label: "Gallery", icon: "▦", description: "A grid of images" },
  { type: "horizontalRule", label: "Separator", icon: "—", description: "Separate two sections" },
  { type: "codeBlock", label: "Code", icon: "</>", description: "A formatted code sample" },
  {
    type: "featurePattern",
    label: "Feature layout",
    icon: "▥",
    description: "Pattern: two headings and text columns",
  },
  {
    type: "ctaPattern",
    label: "Call to action",
    icon: "↗",
    description: "Pattern: heading, text and a button",
  },
] as const;

export function blockLabel(type: string) {
  return blockOptions.find((block) => block.type === type)?.label ?? type;
}
