/**
 * Writes src/content/service-photography.ts.
 *
 * The service detail pages need a photograph for the hero, the overview and
 * every bullet point section. Drawing them from one small pool made the same
 * dozen pictures appear on every page, so this allocates the pool instead:
 * the slots a visitor sees first are unique across the whole site, no page
 * repeats a photograph, and each page draws from the themes that suit it.
 *
 * Run it after adding photographs or changing a service's bullet points:
 *   node scripts/assign-service-photos.mjs
 */
import fs from "node:fs";

const services = JSON.parse(fs.readFileSync("content/services.json", "utf8"));

/** The photographs, grouped by the kind of section they suit. */
const pool = {
  team: {
    workshop: "A collaborative workshop",
    planning: "A team planning meeting",
    campaign: "Campaign planning in progress",
    laptop: "A digital team at work",
    presentation: "Colleagues working through a presentation",
    "team-01": "A team reviewing notes around a meeting table",
    "team-02": "Colleagues seated in a workshop session",
    "team-04": "Colleagues with laptops in a board meeting",
    "team-05": "A project team seated around a table",
    "team-06": "Colleagues gathered around a laptop",
    "team-07": "A planning session around a shared table",
    "team-09": "A client meeting in progress",
    "team-10": "Colleagues working at laptops together",
    "team-11": "A bright meeting room during a working session",
    "team-13": "A team reviewing work together",
    "team-15": "Two specialists working through a task",
    "team-16": "A working discussion at a desk",
    "team-17": "An open-plan studio at work",
    "team-18": "A team working across a long table",
    "team-20": "Colleagues working side by side at their screens",
    "team-21": "A workshop session at a whiteboard",
  },
  plan: {
    strategy: "Business strategy and documents",
    research: "Digital research and planning",
    "plan-02": "Two people mapping ideas on a whiteboard",
    "plan-03": "Diagrams drawn on a glass whiteboard",
    "plan-05": "Wireframes and sticky notes on a glass wall",
    "plan-06": "A content calendar planned out on a board",
    "plan-07": "A roadmap sketched on a whiteboard",
    "plan-08": "A planning board of grouped sticky notes",
    "plan-09": "Sketching a process on a whiteboard",
    "plan-10": "A workflow mapped out step by step",
    "plan-11": "The word audience written on a whiteboard",
    "plan-12": "A weekly content plan on a board",
  },
  data: {
    analytics: "Marketing analytics",
    "data-01": "A search performance report",
    "data-02": "A campaign dashboard with cost and quality figures",
    "data-03": "Working through reports on a laptop",
    "data-04": "A performance trend line on screen",
    "data-05": "A site overview report",
    "data-06": "An analytics view on a screen",
    "data-07": "Search impressions and click figures",
    "data-10": "Searching on a laptop at a cafe table",
  },
  mob: {
    mobile: "A mobile digital experience",
    social: "Social media applications",
    "mob-01": "Social media apps on a phone screen",
    "mob-02": "A social feed open on a phone",
    "mob-03": "Working across a phone and a laptop",
    "mob-04": "A social folder open on a phone",
    "mob-05": "Browsing a profile grid on a phone",
    "mob-06": "A photo grid on a phone beside a laptop",
    "mob-07": "An advertising app open on a phone",
    "mob-08": "Running a search on a phone",
  },
  desk: {
    creative: "A creative workspace",
    writing: "Writing and research",
    content: "A content workspace",
    design: "A design workspace",
    workspace: "A professional workspace",
    "desk-01": "A working desk with laptop and monitor",
    "desk-02": "A studio desk and screen",
    "desk-03": "A desk set up for writing and planning",
    "desk-04": "A quiet office desk",
    "desk-05": "A design workstation",
    "desk-07": "A desk by a window",
    "desk-08": "Printed colour swatches and palettes",
    "desk-09": "A designer working across two screens",
    "desk-10": "The word create set out in wooden letters",
    "desk-11": "An editing timeline open on a laptop",
  },
  vid: {
    camera: "A content production camera",
    "vid-01": "A film crew working on a lit set",
    "vid-02": "A production crew setting up a shoot",
    "vid-03": "A videographer checking a shot",
    "vid-04": "A production camera recording in a studio",
    "vid-05": "A clapperboard on set",
    "vid-06": "Filming on location",
    "vid-07": "A production video camera",
    "vid-09": "Filming an interview",
  },
  code: {
    "code-01": "Lines of markup on screen",
    "code-02": "Application code on a monitor",
    "code-03": "Source code on a screen",
    "code-04": "A monitor and laptop open on a build",
    "code-05": "Markup for a web project",
    "code-06": "A two-screen development setup",
    "code-07": "A code editor in a dark theme",
    "code-08": "A laptop open on a codebase",
    "code-10": "Component code in an editor",
    "code-11": "A laptop set up for development",
    "code-12": "A developer at work",
    "code-13": "Back-end code in a dark workspace",
  },
  app: {
    "app-01": "A phone held in the hand",
    "app-02": "Using an app on a phone",
    "app-03": "A phone on a plain surface",
    "app-04": "An app open on a phone",
    "app-05": "Testing a screen against its sketch",
    "app-06": "Working on a tablet at a table",
    "app-07": "Sketching an interface on paper",
    "app-08": "Drawing up app screens",
    "app-09": "Wireframes drawn on paper",
    "app-10": "App screens laid out on a desk",
  },
  ooh: {
    "ooh-01": "A street advertising panel in the city",
    "ooh-02": "An empty billboard against the sky",
    "ooh-03": "A roadside billboard",
    "ooh-09": "A billboard lit against the night sky",
    "ooh-10": "A billboard carrying a short message",
    "ooh-11": "A bus stop advertising panel",
    "ooh-12": "City streets lined with advertising",
  },
  ai: {
    "ai-02": "A team working at their computers",
    "ai-03": "Three colleagues in an open office",
    "ai-04": "A working floor of computers",
    "ai-05": "Working late at a screen",
    "ai-06": "A laptop running an automation tool",
    "ai-07": "A relaxed studio office",
  },
  atl: {
    "atl-traditional": { alt: "Television advertising at home", file: "photo-traditional-media" },
    "atl-outdoor": { alt: "Printed newspapers and press", file: "photo-outdoor-print" },
    "atl-events": { alt: "A live event audience", file: "photo-integrated-campaigns" },
    "atl-planning": { alt: "Planning a campaign at a desk", file: "photo-campaign-planning" },
  },
  mark: {
    "mark-01": "A row of review stars",
    "mark-03": "Filling in a form on a laptop",
    "mark-05": "Branded stationery laid out together",
    "mark-08": "A brand sign on a building",
    "mark-09": "Printed brand cards laid out",
    "mark-10": "A brand guidelines book open on a spread",
  },
};

/**
 * The themes each service's photography is drawn from, best fit first. Every
 * service ranks all of them, so when a close theme runs out the next pick is
 * still the next best one rather than whatever happens to be left.
 */
const taste = {
  "digital-marketing": [
    "team",
    "plan",
    "data",
    "mob",
    "desk",
    "mark",
    "ai",
    "vid",
    "code",
    "app",
    "ooh",
    "atl",
  ],
  "seo-services": [
    "data",
    "plan",
    "code",
    "desk",
    "team",
    "mob",
    "ai",
    "mark",
    "app",
    "vid",
    "ooh",
    "atl",
  ],
  "ppc-management": [
    "data",
    "plan",
    "mob",
    "team",
    "desk",
    "ai",
    "mark",
    "app",
    "code",
    "vid",
    "ooh",
    "atl",
  ],
  "social-media-marketing": [
    "mob",
    "vid",
    "plan",
    "desk",
    "team",
    "app",
    "mark",
    "data",
    "ai",
    "code",
    "ooh",
    "atl",
  ],
  "content-marketing": [
    "desk",
    "plan",
    "vid",
    "team",
    "mob",
    "mark",
    "data",
    "app",
    "ai",
    "code",
    "ooh",
    "atl",
  ],
  "marketing-business-automation": [
    "data",
    "ai",
    "team",
    "plan",
    "desk",
    "code",
    "mob",
    "mark",
    "app",
    "vid",
    "ooh",
    "atl",
  ],
  "crm-integration": [
    "data",
    "ai",
    "team",
    "desk",
    "plan",
    "code",
    "mob",
    "mark",
    "app",
    "vid",
    "ooh",
    "atl",
  ],
  "lead-nurturing": [
    "team",
    "plan",
    "data",
    "desk",
    "mob",
    "ai",
    "mark",
    "app",
    "code",
    "vid",
    "ooh",
    "atl",
  ],
  "workflow-automation": [
    "plan",
    "ai",
    "data",
    "desk",
    "code",
    "team",
    "mob",
    "mark",
    "app",
    "vid",
    "ooh",
    "atl",
  ],
  "brand-management": [
    "mark",
    "desk",
    "team",
    "plan",
    "mob",
    "data",
    "vid",
    "ooh",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "brand-positioning": [
    "plan",
    "team",
    "mark",
    "desk",
    "data",
    "mob",
    "ooh",
    "vid",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "brand-guidelines-voice": [
    "mark",
    "desk",
    "plan",
    "team",
    "mob",
    "data",
    "ooh",
    "vid",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "brand-consistency": [
    "mark",
    "desk",
    "mob",
    "team",
    "plan",
    "ooh",
    "data",
    "vid",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "reputation-management": [
    "mark",
    "team",
    "mob",
    "desk",
    "plan",
    "data",
    "ai",
    "ooh",
    "vid",
    "code",
    "app",
    "atl",
  ],
  "email-marketing": [
    "desk",
    "data",
    "team",
    "plan",
    "mob",
    "mark",
    "ai",
    "code",
    "app",
    "vid",
    "ooh",
    "atl",
  ],
  "atl-ttl-campaigns": [
    "ooh",
    "vid",
    "team",
    "plan",
    "mark",
    "desk",
    "mob",
    "data",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "traditional-media-advertising": [
    "vid",
    "ooh",
    "team",
    "plan",
    "mark",
    "desk",
    "mob",
    "data",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "outdoor-print-advertising": [
    "ooh",
    "mark",
    "vid",
    "desk",
    "plan",
    "team",
    "mob",
    "data",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "integrated-marketing-campaigns": [
    "team",
    "plan",
    "ooh",
    "vid",
    "data",
    "mark",
    "desk",
    "mob",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "campaign-planning-execution": [
    "plan",
    "team",
    "data",
    "desk",
    "mark",
    "ooh",
    "vid",
    "mob",
    "ai",
    "code",
    "app",
    "atl",
  ],
  "website-development": [
    "code",
    "desk",
    "data",
    "team",
    "plan",
    "app",
    "mob",
    "ai",
    "mark",
    "vid",
    "ooh",
    "atl",
  ],
  "app-development": [
    "app",
    "code",
    "mob",
    "desk",
    "team",
    "plan",
    "data",
    "ai",
    "mark",
    "vid",
    "ooh",
    "atl",
  ],
  "custom-ai-development": [
    "ai",
    "code",
    "data",
    "desk",
    "team",
    "plan",
    "mob",
    "mark",
    "app",
    "vid",
    "ooh",
    "atl",
  ],
  "graphic-design": [
    "desk",
    "mark",
    "plan",
    "team",
    "mob",
    "vid",
    "app",
    "data",
    "code",
    "ai",
    "ooh",
    "atl",
  ],
  "video-editing-animation": [
    "vid",
    "desk",
    "mob",
    "team",
    "plan",
    "mark",
    "app",
    "ooh",
    "data",
    "code",
    "ai",
    "atl",
  ],
};

/** Pages whose hero is a particular photograph rather than whatever fits. */
const lead = {
  "traditional-media-advertising": "atl-traditional",
  "outdoor-print-advertising": "atl-outdoor",
  "integrated-marketing-campaigns": "atl-events",
  "campaign-planning-execution": "atl-planning",
};

const alt = {};
const theme = {};
const file = {};
for (const [group, members] of Object.entries(pool)) {
  for (const [name, entry] of Object.entries(members)) {
    alt[name] = typeof entry === "string" ? entry : entry.alt;
    file[name] = typeof entry === "string" ? `detail-${name}` : entry.file;
    theme[name] = group;
  }
}

const slots = new Map();
for (const service of services) {
  if (!taste[service.slug]) continue;
  // The hero, the overview photograph, then one per bullet point section.
  slots.set(service.slug, service.points.length + 2);
}
const missing = Object.keys(taste).filter((slug) => !slots.has(slug));
if (missing.length) throw new Error(`taste names services that are gone: ${missing.join(", ")}`);

/** How often each photograph has been handed out so far. */
const used = new Map(Object.keys(alt).map((name) => [name, 0]));
const order = new Map([...slots.keys()].map((slug) => [slug, []]));

/**
 * The next photograph for a service: the best fitting theme first, and within
 * a theme the one handed out least. `cap` holds back photographs that have
 * already been used that often, so a page only falls back to a looser theme
 * once the closer ones are genuinely spent.
 */
function take(slug, cap) {
  const taken = new Set(order.get(slug));
  const rank = (name) => {
    const at = taste[slug].indexOf(theme[name]);
    return at === -1 ? taste[slug].length : at;
  };
  const left = [...used.keys()].filter((name) => !taken.has(name));
  const free = left.filter((name) => used.get(name) < cap);
  const pick = (free.length ? free : left).sort(
    (a, b) => rank(a) - rank(b) || used.get(a) - used.get(b) || a.localeCompare(b),
  )[0];
  used.set(pick, used.get(pick) + 1);
  order.get(slug).push(pick);
}

// The hero, the overview and the first two sections are what a visitor sees
// before scrolling, so every page gets its own before any photograph repeats.
for (const [slug, name] of Object.entries(lead)) {
  if (!slots.has(slug)) throw new Error(`lead names a service that is gone: ${slug}`);
  if (!(name in alt)) throw new Error(`lead names a photograph that is gone: ${name}`);
  used.set(name, used.get(name) + 1);
  order.get(slug).push(name);
}
const VISIBLE = 4;
for (let position = 0; position < VISIBLE; position++) {
  for (const slug of slots.keys())
    if (order.get(slug).length <= position && position < slots.get(slug)) take(slug, 1);
}
// 162 slots over 82 photographs: twice each is the most anything should appear.
const CAP = Math.ceil([...slots.values()].reduce((a, b) => a + b, 0) / used.size);
// Filled a position at a time rather than a page at a time, so no page is left
// picking over what the others have finished with.
const longest = Math.max(...slots.values());
for (let position = VISIBLE; position < longest; position++) {
  for (const slug of slots.keys()) if (position < slots.get(slug)) take(slug, CAP);
}

const names = [...used.keys()].sort();
const ident = (name) => "p" + name.replace(/[^a-z0-9]/gi, "_");
const lines = [
  "/**",
  " * The photography on the service detail pages.",
  " *",
  " * Generated by scripts/assign-service-photos.mjs: the slots a visitor sees",
  " * before scrolling are unique across the site and no page repeats a",
  " * photograph, so the pages stop looking like the same few pictures. Re-run",
  " * that script after adding photographs or changing a service's bullet points.",
  " */",
  ...names.map((name) => `import ${ident(name)} from "@/assets/${file[name]}.webp";`),
  "",
  "const photos: Record<string, { src: string; alt: string }> = {",
  ...names.map(
    (name) => `  "${name}": { src: ${ident(name)}, alt: ${JSON.stringify(alt[name])} },`,
  ),
  "};",
  "",
  "const orders: Record<string, string[]> = {",
  ...[...order.entries()].map(
    ([slug, list]) => `  "${slug}": [${list.map((n) => `"${n}"`).join(", ")}],`,
  ),
  "};",
  "",
  "/**",
  " * The photograph for a slot: 0 is the hero, 1 the overview, then one per",
  " * bullet point section. A service that gains a bullet point in the admin",
  " * panel reuses its own photographs rather than leaving a gap.",
  " */",
  "export function servicePhoto(slug: string, position: number) {",
  "  const list = orders[slug];",
  '  if (!list?.length) return { src: "", alt: "" };',
  "  return photos[list[position % list.length]];",
  "}",
  "",
];
const previous = fs.readFileSync("src/content/service-photography.ts", "utf8");
const marker = "// Additional campaign photographs";
const extra = previous.includes(marker) ? previous.slice(previous.indexOf(marker)) : "";
fs.writeFileSync("src/content/service-photography.ts", lines.join("\n") + "\n" + extra);

const counts = [...used.values()];
console.log(
  `${[...slots.values()].reduce((a, b) => a + b, 0)} slots across ${slots.size} pages, ` +
    `${names.length} photographs, each used ${Math.min(...counts)}-${Math.max(...counts)} times`,
);
