/**
 * What each page offers an editor, and in what order.
 *
 * The forms are generated from this rather than written out one by one, so a
 * new field is one line here and appears with the right label, help text and
 * validation hints.
 */

export type FieldKind =
  | "text"
  | "textarea"
  | "rich" // text that may carry [g] / [gg] / [b] markers
  | "url"
  | "email"
  | "lines" // one value per line, stored as string[]
  | "link" // a page key or an absolute URL
  | "icon"
  | "image"
  | "number"
  | "checkbox"
  | "robots";

export type Field = {
  /** Path within the object being edited, e.g. ["hero", "title"]. */
  path: (string | number)[];
  label: string;
  kind: FieldKind;
  help?: string;
  placeholder?: string;
  rows?: number;
};

export type Repeater = {
  path: (string | number)[];
  label: string;
  /** What one row is called, for the add/remove buttons. */
  itemLabel: string;
  help?: string;
  /** Which field to show as the row's heading when collapsed. */
  titleKey: string;
  fields: Field[];
  /** A blank row, used by "Add". */
  blank: Record<string, unknown>;
};

export type Section = {
  id: string;
  title: string;
  help?: string;
  fields?: Field[];
  repeaters?: Repeater[];
};

const richHelp =
  "Wrap words in [g]…[/g] for the brand gradient, or [gg]…[/gg] to add the hero glow.";

const ctaSection = (): Section => ({
  id: "cta",
  title: "Closing call to action",
  help: "The band above the footer.",
  fields: [
    { path: ["cta", "label"], label: "Small label", kind: "text" },
    { path: ["cta", "title"], label: "Heading", kind: "rich", help: richHelp, rows: 2 },
    { path: ["cta", "subtitle"], label: "Supporting text", kind: "textarea", rows: 2 },
    { path: ["cta", "buttonLabel"], label: "Button label", kind: "text" },
    { path: ["cta", "buttonTo"], label: "Button links to", kind: "link" },
  ],
});

const pageHeroSection = (): Section => ({
  id: "hero",
  title: "Page hero",
  help: "The heading block at the top of the page.",
  fields: [
    { path: ["hero", "eyebrow"], label: "Eyebrow", kind: "text" },
    { path: ["hero", "title"], label: "Heading (H1)", kind: "rich", help: richHelp, rows: 2 },
    { path: ["hero", "subtitle"], label: "Subtitle", kind: "textarea", rows: 2 },
  ],
});

/** The sections for a page, by its key. */
export const pageSchema: Record<string, Section[]> = {
  home: [
    {
      id: "hero",
      title: "Hero",
      help: "The video panel at the top of the homepage.",
      fields: [
        { path: ["hero", "badge"], label: "Badge text", kind: "text" },
        {
          path: ["hero", "headline"],
          label: "Headline (H1)",
          kind: "lines",
          help:
            "One chunk per line. Each animates in on its own and they wrap like words. " + richHelp,
        },
        { path: ["hero", "primaryLabel"], label: "Primary button label", kind: "text" },
        { path: ["hero", "primaryTo"], label: "Primary button links to", kind: "link" },
        { path: ["hero", "secondaryLabel"], label: "Secondary button label", kind: "text" },
        { path: ["hero", "secondaryTo"], label: "Secondary button links to", kind: "link" },
      ],
      repeaters: [
        {
          path: ["hero", "stats"],
          label: "Statistics",
          itemLabel: "statistic",
          titleKey: "label",
          fields: [
            { path: ["value"], label: "Number", kind: "number" },
            { path: ["suffix"], label: "Suffix", kind: "text", placeholder: "%, K+, …" },
            { path: ["label"], label: "Caption", kind: "text" },
            { path: ["accent"], label: "Paint with the brand gradient", kind: "checkbox" },
          ],
          blank: { value: 0, suffix: "", label: "", accent: false },
        },
      ],
    },
    {
      id: "marquee",
      title: "Scrolling strip",
      fields: [{ path: ["marquee"], label: "Phrases", kind: "lines", help: "One per line." }],
    },
    {
      id: "mission",
      title: "Mission",
      fields: [
        { path: ["mission", "label"], label: "Section label", kind: "text" },
        { path: ["mission", "title"], label: "Heading", kind: "rich", help: richHelp, rows: 2 },
        {
          path: ["mission", "body"],
          label: "Body copy",
          kind: "rich",
          help: "Wrap a phrase in [b]…[/b] to emphasise it.",
          rows: 5,
        },
      ],
    },
    {
      id: "servicesSection",
      title: "Services showcase",
      help: "The expanding panels. The services themselves are edited under Services.",
      fields: [
        { path: ["servicesSection", "label"], label: "Section label", kind: "text" },
        {
          path: ["servicesSection", "title"],
          label: "Heading",
          kind: "rich",
          help: richHelp,
          rows: 2,
        },
        { path: ["servicesSection", "intro"], label: "Intro paragraph", kind: "textarea", rows: 3 },
        { path: ["servicesSection", "buttonLabel"], label: "Button label", kind: "text" },
      ],
    },
    {
      id: "why",
      title: "Why Eire Tech",
      fields: [
        { path: ["why", "label"], label: "Section label", kind: "text" },
        { path: ["why", "title"], label: "Heading", kind: "rich", help: richHelp, rows: 2 },
        { path: ["why", "body"], label: "Body copy", kind: "textarea", rows: 3 },
        { path: ["why", "captionEyebrow"], label: "Image caption eyebrow", kind: "text" },
        { path: ["why", "captionTitle"], label: "Image caption heading", kind: "text" },
      ],
      repeaters: [
        {
          path: ["why", "reasons"],
          label: "Reasons",
          itemLabel: "reason",
          titleKey: "title",
          fields: [
            { path: ["number"], label: "Number", kind: "text", placeholder: "01" },
            { path: ["title"], label: "Title", kind: "text" },
            { path: ["text"], label: "Description", kind: "textarea", rows: 2 },
          ],
          blank: { number: "", title: "", text: "" },
        },
      ],
    },
    {
      id: "process",
      title: "How we work",
      fields: [
        { path: ["process", "label"], label: "Section label", kind: "text" },
        { path: ["process", "title"], label: "Heading", kind: "rich", help: richHelp, rows: 2 },
      ],
      repeaters: [
        {
          path: ["process", "steps"],
          label: "Steps",
          itemLabel: "step",
          titleKey: "title",
          fields: [
            { path: ["icon"], label: "Icon", kind: "icon" },
            { path: ["title"], label: "Title", kind: "text" },
            { path: ["text"], label: "Description", kind: "textarea", rows: 2 },
          ],
          blank: { icon: "sparkles", title: "", text: "" },
        },
      ],
    },
    {
      id: "serve",
      title: "Who we serve",
      fields: [
        { path: ["serve", "label"], label: "Section label", kind: "text" },
        { path: ["serve", "title"], label: "Heading", kind: "rich", help: richHelp, rows: 2 },
        { path: ["serve", "body"], label: "Body copy", kind: "textarea", rows: 3 },
      ],
    },
    {
      id: "testimonialsSection",
      title: "Client feedback",
      help: "The quotes themselves are edited under Testimonials.",
      fields: [
        { path: ["testimonialsSection", "label"], label: "Section label", kind: "text" },
        {
          path: ["testimonialsSection", "title"],
          label: "Heading",
          kind: "rich",
          help: richHelp,
          rows: 2,
        },
        { path: ["testimonialsSection", "badge"], label: "Badge text", kind: "text" },
      ],
    },
    ctaSection(),
  ],

  services: [
    pageHeroSection(),
    {
      id: "list",
      title: "Service cards",
      help: "The services themselves are edited under Services in the sidebar.",
      fields: [{ path: ["serviceLinkLabel"], label: "Per-service link label", kind: "text" }],
    },
    ctaSection(),
  ],

  platforms: [
    pageHeroSection(),
    {
      id: "outro",
      title: "Closing paragraph",
      help: "Sits under the platform grid. The groups are edited under Platforms.",
      fields: [{ path: ["outro"], label: "Paragraph", kind: "textarea", rows: 3 }],
    },
    ctaSection(),
  ],

  about: [
    pageHeroSection(),
    {
      id: "story",
      title: "Our story",
      fields: [
        { path: ["story", "label"], label: "Section label", kind: "text" },
        { path: ["story", "title"], label: "Heading", kind: "rich", help: richHelp },
        {
          path: ["story", "paragraphs"],
          label: "Paragraphs",
          kind: "lines",
          help: "One paragraph per line.",
        },
      ],
    },
    {
      id: "differences",
      title: "What makes us different",
      fields: [{ path: ["differences", "label"], label: "Section label", kind: "text" }],
      repeaters: [
        {
          path: ["differences", "items"],
          label: "Cards",
          itemLabel: "card",
          titleKey: "title",
          fields: [
            { path: ["icon"], label: "Icon", kind: "icon" },
            { path: ["title"], label: "Title", kind: "text" },
            { path: ["text"], label: "Description", kind: "textarea", rows: 2 },
          ],
          blank: { icon: "sparkles", title: "", text: "" },
        },
      ],
    },
    {
      id: "mission",
      title: "Our mission",
      fields: [
        { path: ["mission", "label"], label: "Section label", kind: "text" },
        { path: ["mission", "title"], label: "Statement", kind: "rich", help: richHelp, rows: 3 },
        { path: ["mission", "body"], label: "Supporting text", kind: "textarea", rows: 3 },
      ],
    },
    ctaSection(),
  ],

  contact: [
    pageHeroSection(),
    {
      id: "form",
      title: "Enquiry form",
      help: "Submissions still go to Supabase — only the wording is edited here.",
      fields: [
        { path: ["form", "title"], label: "Form heading", kind: "text" },
        { path: ["form", "hint"], label: "Hint under the heading", kind: "text" },
        {
          path: ["form", "serviceOptions"],
          label: "Service dropdown options",
          kind: "lines",
          help: "One option per line.",
        },
        { path: ["form", "buttonLabel"], label: "Submit button label", kind: "text" },
        { path: ["form", "sendingLabel"], label: "Label while sending", kind: "text" },
        { path: ["form", "privacyNote"], label: "Reassurance next to the button", kind: "text" },
        { path: ["form", "successMessage"], label: "Success message", kind: "textarea", rows: 2 },
        { path: ["form", "errorMessage"], label: "Error message", kind: "textarea", rows: 2 },
      ],
    },
    {
      id: "aside",
      title: "Sidebar",
      fields: [
        { path: ["aside", "eyebrow"], label: "Eyebrow", kind: "text" },
        { path: ["aside", "title"], label: "Heading", kind: "text" },
        { path: ["aside", "body"], label: "Body copy", kind: "textarea", rows: 3 },
        { path: ["aside", "footnote"], label: "Footnote", kind: "text" },
      ],
    },
    {
      id: "footer",
      title: "Page footer",
      help: "This page ships as its own document and has a shorter footer.",
      fields: [{ path: ["footerBlurb"], label: "Footer paragraph", kind: "textarea", rows: 2 }],
    },
  ],
};

/** The site-wide settings form. */
export const globalSchema: Section[] = [
  {
    id: "brand",
    title: "Site",
    fields: [
      { path: ["site", "name"], label: "Site name", kind: "text" },
      {
        path: ["site", "url"],
        label: "Site URL",
        kind: "url",
        help: "Used for canonical URLs and the sitemap.",
      },
      {
        path: ["site", "tagline"],
        label: "Tagline",
        kind: "text",
        help: "Shown in the footer strip and given to search engines.",
      },
      {
        path: ["site", "ogImage"],
        label: "Default share image",
        kind: "text",
        help: "A path such as /og-image.png, or a full URL.",
      },
      { path: ["site", "themeColor"], label: "Theme colour", kind: "text" },
    ],
  },
  {
    id: "contact",
    title: "Contact details",
    help: "Used in the footer, on the contact page and in the structured data search engines read.",
    fields: [
      { path: ["contact", "email"], label: "Email address", kind: "email" },
      {
        path: ["contact", "phone"],
        label: "Phone number",
        kind: "text",
        help: "As it should read on screen.",
      },
      {
        path: ["contact", "phoneHref"],
        label: "Phone link",
        kind: "text",
        help: "The dialable form, e.g. tel:+353899427009",
      },
    ],
  },
  {
    id: "nav",
    title: "Header",
    fields: [{ path: ["nav", "ctaLabel"], label: "Header button label", kind: "text" }],
  },
  {
    id: "footer",
    title: "Footer",
    fields: [
      { path: ["footer", "blurb"], label: "Intro paragraph", kind: "textarea", rows: 3 },
      {
        path: ["footer", "capabilities"],
        label: "Capabilities column",
        kind: "lines",
        help: "One per line. Each links to the services page.",
      },
      { path: ["footer", "ctaLabel"], label: "Button label", kind: "text" },
      { path: ["footer", "visitTitle"], label: "Visit heading", kind: "text" },
      { path: ["footer", "visitLine"], label: "Visit subheading", kind: "text" },
      {
        path: ["footer", "address"],
        label: "Address",
        kind: "lines",
        help: "One line per line. Leave empty to hide the block.",
      },
    ],
  },
  {
    id: "social",
    title: "Social links",
    repeaters: [
      {
        path: ["social"],
        label: "Profiles",
        itemLabel: "profile",
        titleKey: "label",
        help: "LinkedIn and Facebook have their own icons; anything else uses the LinkedIn glyph.",
        fields: [
          { path: ["label"], label: "Network", kind: "text" },
          { path: ["href"], label: "URL", kind: "url" },
        ],
        blank: { label: "", href: "" },
      },
    ],
  },
];

/** The three list-shaped collections. */
export const collectionSchema: Record<string, Repeater> = {
  services: {
    path: ["services"],
    label: "Services",
    itemLabel: "service",
    titleKey: "title",
    help: "Shown as the expanding panels on the homepage and the cards on the services page.",
    fields: [
      { path: ["title"], label: "Title", kind: "text" },
      {
        path: ["tag"],
        label: "Tag",
        kind: "text",
        help: 'The short word beside the number, e.g. "Reach".',
      },
      { path: ["icon"], label: "Icon", kind: "icon" },
      { path: ["image"], label: "Image", kind: "image" },
      { path: ["desc"], label: "Description", kind: "textarea", rows: 2 },
      { path: ["points"], label: "Bullet points", kind: "lines", help: "One per line." },
    ],
    blank: { title: "", tag: "", icon: "sparkles", image: "svc-web", desc: "", points: [] },
  },
  platforms: {
    path: ["platforms"],
    label: "Platform groups",
    itemLabel: "group",
    titleKey: "title",
    help: "The tool groups on the platforms page.",
    fields: [
      { path: ["title"], label: "Title", kind: "text" },
      { path: ["icon"], label: "Icon", kind: "icon" },
      {
        path: ["tools"],
        label: "Tools",
        kind: "lines",
        help: "One per line. Each becomes a pill.",
      },
    ],
    blank: { title: "", icon: "sparkles", tools: [] },
  },
  testimonials: {
    path: ["testimonials"],
    label: "Testimonials",
    itemLabel: "testimonial",
    titleKey: "name",
    help: "The client quotes on the homepage.",
    fields: [
      { path: ["name"], label: "Name", kind: "text" },
      {
        path: ["initials"],
        label: "Initials",
        kind: "text",
        help: 'Shown in the circle, e.g. "AM".',
      },
      { path: ["role"], label: "Role", kind: "text", help: "e.g. Founder · Consumer services" },
      { path: ["quote"], label: "Quote", kind: "textarea", rows: 4 },
    ],
    blank: { name: "", initials: "", role: "", quote: "" },
  },
};
