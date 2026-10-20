import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../src/lib/blog-html.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports });
const clean = exports.sanitizeBlogHtml;

const layouts =
  '<div data-blog-block="columns" data-columns="2"><div data-blog-block="column"><h2 data-align="center">First column</h2><p>Useful copy.</p></div><div data-blog-block="column"><p data-blog-block="button" data-align="right"><a href="/contact/">Contact us</a></p></div></div><div data-blog-block="gallery" data-columns="3"><figure><img src="/uploads/blog/photo.webp" alt="A useful description"><figcaption>A caption</figcaption></figure></div>';
const output = clean(layouts);
assert(output.includes('data-blog-block="columns" data-columns="2"'));
assert(output.includes('data-blog-block="column"'));
assert(output.includes('data-blog-block="gallery" data-columns="3"'));
assert(output.includes('<p data-blog-block="button" data-align="right">'));
assert(output.includes('<h2 data-align="center">First column</h2>'));
assert(output.includes('<a href="/contact/">Contact us</a>'));
assert(output.includes('alt="A useful description"'));
assert(output.includes("<figcaption>A caption</figcaption>"));
assert.equal(clean(output), output, "Sanitizing saved layouts repeatedly must preserve them");

const malicious = clean(
  '<div data-blog-block="script" data-columns="99" style="position:fixed" onclick="alert(1)"><p data-align="evil" data-blog-block="button"><a href="javascript:alert(1)">Bad link</a></p><img src="javascript:alert(1)" onerror="alert(1)"><script>alert(1)</script><iframe src="https://example.com"></iframe></div>',
);
for (const forbidden of [
  "onclick",
  "onerror",
  "javascript:",
  "<script",
  "<iframe",
  "style=",
  "data-columns",
  "data-align",
  'data-blog-block="script"',
]) {
  assert(!malicious.includes(forbidden), `Unsafe attribute or markup survived: ${forbidden}`);
}
assert(!clean('<a href="java&#115;cript:alert(1)">Bad</a>').includes("href"));
assert(clean('<a href="https://example.com">External</a>').includes('rel="noopener noreferrer"'));
assert.equal(
  clean(
    "<h2>Existing heading</h2><p><strong>Bold</strong> and <em>italic</em>.</p><ul><li>Point</li></ul>",
  ),
  "<h2>Existing heading</h2><p><strong>Bold</strong> and <em>italic</em>.</p><ul><li>Point</li></ul>",
);
console.log(
  "Blog blocks verified: layout persistence, safe links, image captions, legacy content and unsafe HTML removal.",
);
