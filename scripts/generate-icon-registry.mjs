/**
 * Writes src/content/icons.ts with only the icons the content actually uses.
 *
 * A registry that imported every selectable icon would put all of them in a
 * shared chunk that each page downloads — around 18 kB for glyphs a given page
 * mostly does not draw. Generating it from the content keeps the bundle to what
 * is on screen, and regenerating on save keeps it correct when an editor picks
 * a different icon.
 *
 * Run with: npm run build:icons (the site build runs it first).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fallbackIcon, iconCatalog } from "./icon-catalog.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(rootDir, "content");
const target = path.join(rootDir, "src/content/icons.ts");

/** Every "icon" value anywhere in the content tree. */
function usedIconNames() {
  const names = new Set();

  const walk = (node) => {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (key === "icon" && typeof value === "string") names.add(value);
      else walk(value);
    }
  };

  const files = [
    path.join(contentDir, "services.json"),
    path.join(contentDir, "platforms.json"),
    ...fs
      .readdirSync(path.join(contentDir, "pages"))
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(contentDir, "pages", file)),
  ];

  for (const file of files) {
    walk(JSON.parse(fs.readFileSync(file, "utf8")));
  }

  return names;
}

const used = usedIconNames();
const unknown = [...used].filter((name) => !iconCatalog.some((icon) => icon.name === name));

if (unknown.length) {
  console.error(
    `content names icon(s) that are not in scripts/icon-catalog.mjs: ${unknown.join(", ")}`,
  );
  process.exit(1);
}

// The fallback is always included, so an icon cleared in the admin still draws
// something rather than leaving a hole until the next regeneration.
const needed = iconCatalog.filter((icon) => used.has(icon.name) || icon.name === fallbackIcon.name);

const imports = needed
  .map((icon) => (icon.component === "Route" ? "  Route as RouteIcon," : `  ${icon.component},`))
  .join("\n");

const entries = needed
  .map((icon) => {
    const component = icon.component === "Route" ? "RouteIcon" : icon.component;
    const key = /^[a-z][a-z0-9]*$/.test(icon.name) ? icon.name : `"${icon.name}"`;
    return `  ${key}: ${component},`;
  })
  .join("\n");

const file = `/**
 * The icons the content currently uses.
 *
 * Generated from content/ by scripts/generate-icon-registry.mjs — do not edit
 * by hand. The full set an editor can choose from lives in
 * scripts/icon-catalog.mjs; only the ones in use are imported here, so a page
 * never downloads a glyph it does not draw.
 */
import {
${imports}
  type LucideIcon,
} from "lucide-react";

export const icons = {
${entries}
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

/**
 * Resolves an icon name from the content files.
 *
 * An unknown name falls back to ${fallbackIcon.component} rather than crashing: a stale
 * registry should cost a wrong glyph, not the whole route.
 */
export function iconFor(name: string): LucideIcon {
  return icons[name as IconName] ?? ${fallbackIcon.component};
}
`;

const previous = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
if (previous !== file) {
  fs.writeFileSync(target, file);
}

console.log(
  `Icon registry: ${needed.length} of ${iconCatalog.length} icons in use (${[...used].sort().join(", ")})`,
);
