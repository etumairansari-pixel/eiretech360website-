import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const dir = "src/assets";
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f));

let before = 0;
let after = 0;

for (const file of files) {
  const src = path.join(dir, file);
  const original = fs.readFileSync(src);
  const isPng = /\.png$/i.test(file);

  const out = isPng
    ? await sharp(original).png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }).toBuffer()
    : await sharp(original).jpeg({ quality: 78, mozjpeg: true, progressive: true }).toBuffer();

  before += original.length;

  if (out.length < original.length) {
    fs.writeFileSync(src, out);
    after += out.length;
    console.log(
      `${file.padEnd(30)} ${(original.length / 1024) | 0}KB -> ${(out.length / 1024) | 0}KB  (-${Math.round((1 - out.length / original.length) * 100)}%)`,
    );
  } else {
    after += original.length;
    console.log(`${file.padEnd(30)} kept original (already smaller)`);
  }
}

console.log(
  `\nTOTAL ${(before / 1024) | 0}KB -> ${(after / 1024) | 0}KB  (-${Math.round((1 - after / before) * 100)}%)`,
);
