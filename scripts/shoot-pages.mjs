/**
 * Screenshots pages from dist-static in light and dark mode, side by side.
 *
 *   node scripts/shoot-pages.mjs <out-dir> [path ...]
 *
 * Needs a local Chrome; set CHROME_PATH to point at one. Used to check a
 * change by looking at it rather than by reading the stylesheet.
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const fold = process.argv.includes("--fold");
const out = process.argv[2];
const pages = process.argv.slice(3).filter((a) => a !== "--fold");
if (!out || !pages.length) throw new Error("usage: shoot-pages.mjs <out-dir> <path ...>");
fs.mkdirSync(out, { recursive: true });

const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const root = "dist-static";
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(root, url);
  if (!path.extname(file)) file = path.join(file, "index.html");
  if (!fs.existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const base = `http://127.0.0.1:${server.address().port}`;
console.log("serving", root, "at", base);

const browser = await puppeteer.launch({
  executablePath: chrome,
  args: ["--no-sandbox", "--hide-scrollbars"],
});

async function shoot(urlPath, dark) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: dark ? "dark" : "light" },
    // Motion-driven reveals would otherwise screenshot mid-animation.
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);
  await page.goto(base + urlPath, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
  const buffer = await page.screenshot({ fullPage: !fold, type: "png" });
  await page.close();
  return buffer;
}

for (const urlPath of pages) {
  const name = (urlPath.replace(/\//g, "_") || "_home").replace(/^_/, "");
  const [light, dark] = [await shoot(urlPath, false), await shoot(urlPath, true)];
  const COL = fold ? 900 : 560;
  const panes = await Promise.all(
    [light, dark].map((b) => sharp(b).resize({ width: COL }).toBuffer()),
  );
  const sizes = await Promise.all(panes.map((b) => sharp(b).metadata()));
  const height = Math.max(...sizes.map((m) => m.height));
  const label = (text, left) =>
    Buffer.from(
      `<svg width="${COL}" height="30"><rect width="${COL}" height="30" fill="#888"/>` +
        `<text x="8" y="21" font-family="sans-serif" font-size="17" fill="#fff">${text}</text></svg>`,
    );
  const file = path.join(out, `${name || "home"}.png`);
  await sharp({
    create: { width: COL * 2 + 12, height: height + 30, channels: 3, background: "#888888" },
  })
    .composite([
      { input: label(`LIGHT ${urlPath}`), left: 0, top: 0 },
      { input: label(`DARK ${urlPath}`), left: COL + 12, top: 0 },
      { input: panes[0], left: 0, top: 30 },
      { input: panes[1], left: COL + 12, top: 30 },
    ])
    .png()
    .toFile(file);
  console.log(file, `${height}px tall`);
}

await browser.close();
server.close();
