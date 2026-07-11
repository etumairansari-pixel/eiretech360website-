import sharp from "sharp";
import fs from "node:fs";

const SOURCE = "src/assets/eiretech-mark-real.png";
const OUT = "public";
const BRAND_DARK = "#05070a";

// Transparent favicons so the mark sits on whatever the browser chrome uses.
const transparent = [
  ["favicon-16x16.png", 16],
  ["favicon-32x32.png", 32],
  ["favicon-96x96.png", 96],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

for (const [name, size] of transparent) {
  await sharp(SOURCE)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${name}`);
}

// iOS strips alpha and composites on black, so ship the mark on the brand dark.
await sharp(SOURCE)
  .resize(160, 160, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: BRAND_DARK })
  .flatten({ background: BRAND_DARK })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/apple-touch-icon.png`);

// favicon.ico: browsers request /favicon.ico by default. An ICO may wrap a PNG
// payload directly, so build the 6-byte header + 16-byte entry around one.
const icoSize = 48;
const png = await sharp(SOURCE)
  .resize(icoSize, icoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count

const entry = Buffer.alloc(16);
entry.writeUInt8(icoSize, 0); // width
entry.writeUInt8(icoSize, 1); // height
entry.writeUInt8(0, 2); // palette colors
entry.writeUInt8(0, 3); // reserved
entry.writeUInt16LE(1, 4); // color planes
entry.writeUInt16LE(32, 6); // bits per pixel
entry.writeUInt32LE(png.length, 8); // payload size
entry.writeUInt32LE(header.length + entry.length, 12); // payload offset

fs.writeFileSync(`${OUT}/favicon.ico`, Buffer.concat([header, entry, png]));

// Social preview card: the mark centered on the brand dark background.
const OG_W = 1200;
const OG_H = 630;
const mark = await sharp(SOURCE).resize(300, 300, { fit: "contain" }).toBuffer();
await sharp({
  create: { width: OG_W, height: OG_H, channels: 4, background: BRAND_DARK },
})
  .composite([{ input: mark, gravity: "centre" }])
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}/og-image.png`);

for (const f of fs.readdirSync(OUT).sort()) {
  console.log(`${f.padEnd(24)} ${(fs.statSync(`${OUT}/${f}`).size / 1024).toFixed(1)}KB`);
}
