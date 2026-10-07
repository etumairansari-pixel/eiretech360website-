import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise both document layouts without adding a test framework.
const source = fs.readFileSync(
  new URL("../src/components/site/SectionLink.tsx", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
let elements = new Map();
let reducedMotion = false;
let scrolled = [];
const target = { scrollIntoView: (options) => scrolled.push(options) };
const exports = {};
vm.runInNewContext(compiled, {
  exports,
  require: () => ({ jsx: (tag, props) => ({ tag, props }) }),
  document: { getElementById: (id) => elements.get(id) ?? null },
  CSS: { escape: (id) => id },
  window: { matchMedia: () => ({ matches: reducedMotion }) },
});
const link = exports.SectionLink({
  to: "local-seo-services-for-businesses",
  children: "Local SEO",
});
assert.equal(link.tag, "a");
assert.equal(link.props.href, "#local-seo-services-for-businesses");
const click = (overrides = {}) => {
  let prevented = false;
  link.props.onClick({
    button: 0,
    preventDefault: () => {
      prevented = true;
    },
    ...overrides,
  });
  return prevented;
};
// SSR: no #root; the target is part of the document itself.
elements.set("local-seo-services-for-businesses", target);
assert.equal(click(), true);
assert.equal(scrolled.at(-1).behavior, "smooth");
assert.equal(scrolled.at(-1).block, "start");
// Client rendering and the visible prerendered shell.
elements = new Map([["root", { querySelector: () => target }]]);
assert.equal(click(), true);
elements = new Map([["shell", { querySelector: () => target }]]);
assert.equal(click(), true);
reducedMotion = true;
assert.equal(click(), true);
assert.equal(scrolled.at(-1).behavior, "auto");
const count = scrolled.length;
for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
  assert.equal(click(modifiers), false);
}
assert.equal(scrolled.length, count);
elements = new Map();
assert.equal(click(), false, "Missing targets keep native anchor behavior");
console.log("Section links verified: SSR, client, shell, reduced motion and native fallback.");

const content = JSON.parse(
  fs.readFileSync(new URL("../content/services.json", import.meta.url), "utf8"),
);
const seo = content.find((service) => service.slug === "seo-services");
const html = fs.readFileSync(
  new URL("../dist-static/services/seo-services/index.html", import.meta.url),
  "utf8",
);
for (const title of seo.points) {
  const id = title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  assert.ok(html.includes(`href="#${id}"`), `Missing link: ${title}`);
  assert.ok(html.includes(`id="${id}"`), `Missing destination: ${title}`);
}
console.log(
  `Verified all ${seo.points.length} SEO links and their matching destinations in the built page.`,
);

const navigationSource = fs.readFileSync(
  new URL("../src/content/service-navigation.ts", import.meta.url),
  "utf8",
);
const navigationExports = {};
vm.runInNewContext(
  ts.transpileModule(navigationSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: navigationExports, require: () => ({ default: content }) },
);
const menu = navigationExports.serviceNavigation;
assert.equal(menu.length, content.filter((service) => !service.parent).length);
assert.equal(menu.find((service) => service.slug === "digital-marketing").children.length, 4);
for (const service of menu) {
  for (const entry of [{ slug: service.slug, section: "" }, ...service.children]) {
    const page = fs.readFileSync(
      new URL(`../dist-static/services/${entry.slug}/index.html`, import.meta.url),
      "utf8",
    );
    if (entry.section)
      assert.ok(
        page.includes(`id="${entry.section}"`),
        `Missing submenu destination: ${entry.slug}#${entry.section}`,
      );
  }
}
console.log(`Verified all ${menu.length} services and every nested navigation destination.`);

const headerSource = fs.readFileSync(
  new URL("../src/lib/header-scroll.ts", import.meta.url),
  "utf8",
);
const headerExports = {};
vm.runInNewContext(
  ts.transpileModule(headerSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  { exports: headerExports },
);
const visibility = headerExports.headerVisibleAfterScroll;
assert.equal(visibility(200, 180, false), true, "Scroll up reveals the header");
assert.equal(visibility(180, 200, true), false, "Scroll down hides the header");
assert.equal(visibility(200, 198, true), true, "Tiny scroll movements do not flicker");
assert.equal(visibility(200, 202, false), false, "Tiny movements keep a hidden header hidden");
assert.equal(visibility(30, 0, false), true, "Header is available at the top of the page");
console.log(
  "Verified header direction: up reveals, down hides, no jitter and top-of-page recovery.",
);
