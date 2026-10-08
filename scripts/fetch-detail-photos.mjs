import fs from "node:fs/promises";
import sharp from "sharp";
const photos = [
  ["research", "photo-1516321318423-f06f85e504b3", "Digital research and planning"],
  ["analytics", "photo-1599658880436-c61792e70672", "Marketing analytics"],
  ["strategy", "photo-1454165804606-c3d57bc86b40", "Business strategy and documents"],
  ["workshop", "photo-1531482615713-2afd69097998", "Collaborative workshop"],
  ["planning", "photo-1552664730-d307ca884978", "Team planning meeting"],
  ["campaign", "photo-1557804506-669a67965ba0", "Campaign planning"],
  ["creative", "photo-1545239351-1141bd82e8a6", "Creative workspace"],
  ["laptop", "photo-1519389950473-47ba0277781c", "Digital team working"],
  ["mobile", "photo-1511707171634-5f897ff02aa9", "Mobile digital experience"],
  ["writing", "photo-1434030216411-0b793f4b4173", "Writing and research"],
  ["content", "photo-1499750310107-5fef28a66643", "Content workspace"],
  ["camera", "photo-1516035069371-29a1b244cc32", "Content production camera"],
  ["design", "photo-1523726491678-bf852e717f6a", "Design workspace"],
  ["social", "photo-1611162616305-c69b3fa7fbe0", "Social media applications"],
  ["presentation", "photo-1521737711867-e3b97375f902", "Business collaboration"],
  ["workspace", "photo-1497366754035-f200968a6e72", "Professional workspace"],
];
const results = await Promise.allSettled(
  photos.map(async ([name, id, subject]) => {
    const source = `https://images.unsplash.com/${id}`;
    const response = await fetch(`${source}?auto=format&fit=crop&w=1400&q=80`);
    if (!response.ok) throw new Error(`${name}: ${response.status}`);
    const file = `src/assets/detail-${name}.webp`;
    await sharp(Buffer.from(await response.arrayBuffer()))
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(file);
    return { file, source, subject };
  }),
);
for (let i = 0; i < results.length; i++)
  if (results[i].status === "rejected") console.log(photos[i][0], String(results[i].reason));
const saved = results.filter((x) => x.status === "fulfilled").map((x) => x.value);
const sources = JSON.parse(await fs.readFile("content/photo-sources.json", "utf8"));
sources.photos = [...sources.photos.filter((x) => !x.file.includes("/detail-")), ...saved];
await fs.writeFile("content/photo-sources.json", JSON.stringify(sources, null, 2) + "\n");
const tiles = await Promise.all(
  saved.map(async (x, i) => ({
    input: await sharp(x.file).resize(260, 160, { fit: "cover" }).toBuffer(),
    left: (i % 4) * 260,
    top: Math.floor(i / 4) * 190,
  })),
);
await sharp({
  create: {
    width: 1040,
    height: Math.ceil(saved.length / 4) * 190,
    channels: 3,
    background: "#ffffff",
  },
})
  .composite(tiles)
  .jpeg()
  .toFile("image-review.jpg");
console.log(
  `Downloaded ${saved.length} new distinct photographs. Order: ${saved.map((x) => x.file).join(", ")}`,
);
