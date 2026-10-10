/**
 * Re-downloads the service detail page photographs from the sources recorded
 * in content/photo-sources.json, all at the same crop and quality so no single
 * picture arrives several times the weight of the one beside it. The hero of a
 * service page is its largest-contentful paint, so the size matters.
 *
 *   node scripts/fetch-detail-photos.mjs          # every detail-*.webp
 *   node scripts/fetch-detail-photos.mjs campaign # just the ones named
 */
import fs from "node:fs/promises";
import sharp from "sharp";

const WIDTH = 1100;
const HEIGHT = 740;
const QUALITY = 72;

const sources = JSON.parse(await fs.readFile("content/photo-sources.json", "utf8"));
const only = process.argv.slice(2);
const wanted = sources.photos.filter((photo) => {
  const name = photo.file.match(/\/detail-(.+)\.webp$/)?.[1];
  return name && (only.length === 0 || only.includes(name));
});
if (!wanted.length) throw new Error(`no detail photographs match ${only.join(", ")}`);

const results = await Promise.allSettled(
  wanted.map(async (photo) => {
    const url = `${photo.source}?auto=format&fit=crop&w=${WIDTH}&h=${HEIGHT}&q=${QUALITY}`;
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const info = await sharp(buffer).webp({ quality: QUALITY }).toFile(photo.file);
    return { file: photo.file, bytes: info.size };
  }),
);

const saved = [];
for (let i = 0; i < results.length; i++) {
  if (results[i].status === "rejected") {
    console.log("FAILED", wanted[i].file, String(results[i].reason.message ?? results[i].reason));
  } else saved.push(results[i].value);
}
const total = saved.reduce((sum, x) => sum + x.bytes, 0);
const largest = saved.sort((a, b) => b.bytes - a.bytes)[0];
console.log(
  `${saved.length}/${wanted.length} at ${WIDTH}x${HEIGHT}, ${(total / 1024).toFixed(0)} kB total, ` +
    `largest ${largest.file.split("/").pop()} at ${(largest.bytes / 1024).toFixed(0)} kB`,
);
