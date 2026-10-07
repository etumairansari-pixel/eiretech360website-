import fs from "node:fs/promises";
import sharp from "sharp";

// Real photography served by Unsplash, stored locally for reliable delivery.
const photos = [
  ["marketing", "photo-1522071820081-009f0129c71c", "Team collaborating around a table"],
  ["automation", "photo-1460925895917-afdab827c52f", "Business dashboards on a laptop"],
  ["brand", "photo-1542744173-8e7e53415bb0", "Team reviewing a presentation"],
  ["atl", "photo-1511578314322-379afb476865", "Live business event"],
  ["web", "photo-1498050108023-c5249f4df085", "Web developer workstation"],
  ["app", "photo-1512941937669-90a1b58e7e9c", "Mobile phone and app interface"],
  ["ai", "photo-1551288049-bebda4e38f71", "Data analytics on a computer screen"],
  ["design", "photo-1558655146-9f40138edfeb", "Designer arranging creative artwork"],
  ["video", "photo-1574717024653-61fd2cf4d44d", "Professional video editing timeline"],
  ["seo", "photo-1553877522-43269d4ea984", "Search and marketing research workspace"],
  ["ppc", "photo-1556761175-b413da4baf72", "Business team planning a campaign"],
  ["social", "photo-1432888622747-4eb9a8efeb07", "Social media on a smartphone"],
  ["content", "photo-1455390582262-044cdead277a", "Writing and content planning"],
];

await Promise.all(
  photos.map(async ([key, id, subject]) => {
    const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=85`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${key}: HTTP ${response.status}`);
    const data = Buffer.from(await response.arrayBuffer());
    await sharp(data)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(`src/assets/photo-${key}.webp`);
    console.log(`Saved ${key}: ${subject}`);
  }),
);
await fs.writeFile(
  "content/photo-sources.json",
  JSON.stringify(
    {
      provider: "Unsplash",
      license: "https://unsplash.com/license",
      photos: photos.map(([key, id, subject]) => ({
        file: `src/assets/photo-${key}.webp`,
        source: `https://images.unsplash.com/${id}`,
        subject,
      })),
    },
    null,
    2,
  ) + "\n",
);
