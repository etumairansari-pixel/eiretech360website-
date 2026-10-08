import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const site = read("content/site.json");
const services = read("content/services.json").filter((service) => !service.parent);
assert.deepEqual(
  new Set(site.footer.capabilities.map((line) => line.split("|")[1].trim())),
  new Set(services.map((service) => service.slug)),
  "Footer must cover all nine services",
);
const home = fs.readFileSync("dist-static/index.html", "utf8");
for (const testimonial of read("content/testimonials.json")) {
  if (!testimonial.approved)
    assert.ok(!home.includes(testimonial.quote), "Unapproved testimonials must not be published");
}
for (const project of read("content/projects.json").slice(0, 4)) {
  assert.ok(
    project.outcome && home.includes(project.outcome),
    "Featured projects must carry a delivered outcome",
  );
  const page = fs.readFileSync(`dist-static/services/${project.service}/index.html`, "utf8");
  assert.ok(page.includes(project.outcome), "Project detail must also contain the outcome");
}
const contactHtml = fs.readFileSync("dist-static/contact/index.html", "utf8");
for (const name of ["goal", "market", "timeline", "budget", "website"])
  assert.ok(contactHtml.includes(`name="${name}"`));
for (const line of site.footer.address)
  assert.ok(contactHtml.includes(line), "Contact and footer addresses must match");
const source = ts.transpileModule(fs.readFileSync("src/lib/contact-submit.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
let reply = true;
let call;
const context = {
  exports: {},
  fetch: async (url, options) => {
    call = { url, options };
    return { ok: reply, status: reply ? 200 : 500 };
  },
};
vm.runInNewContext(source, context);
const form = new FormData();
for (const [name, value] of Object.entries({
  fullName: "Example Name",
  email: "example@example.com",
  service: "Digital Marketing",
  goal: "Generate more qualified leads",
  market: "Ireland",
  website: "https://example.com",
  timeline: "Within 1–3 months",
  budget: "Discuss a budget with us",
  message: "A project with clear business goals.",
}))
  form.set(name, value);
const payload = context.exports.contactPayload(form);
assert.ok(payload.message.includes("Business goal: Generate more qualified leads"));
assert.ok(payload.message.includes("https://example.com"));
assert.ok(payload.message.includes("Target market: Ireland"));
assert.ok(payload.message.includes("A project with clear business goals."));
assert.equal(payload.email, "example@example.com");
assert.ok(!("goal" in payload), "Use the existing backend fields");
await context.exports.submitContact(payload);
assert.equal(call.options.method, "POST");
assert.deepEqual(JSON.parse(call.options.body), JSON.parse(JSON.stringify(payload)));
reply = false;
await assert.rejects(context.exports.submitContact(payload), /500/);
context.fetch = async () => {
  throw new Error("Network unavailable");
};
await assert.rejects(context.exports.submitContact(payload), /Network unavailable/);
form.set("message", "x".repeat(6000));
assert.ok(
  context.exports.contactPayload(form).message.length <= 5000,
  "Respect the backend message limit",
);
console.log(
  "Review checks passed: nine-service footer, approved-only quotes, project outcomes, shared address and qualified contact payload, including error handling.",
);
