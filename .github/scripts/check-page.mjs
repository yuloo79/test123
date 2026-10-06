// CI check for the single-file app. Run locally with: node .github/scripts/check-page.mjs
// Enforces the project's own rules: one self-contained index.html, no external
// resources, no browser storage, no native dialogs, and JavaScript that parses.

import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FILE = "index.html";
const failures = [];
const fail = (message) => failures.push(message);

if (!existsSync(FILE)) {
  console.error(`FAIL: ${FILE} is missing`);
  process.exit(1);
}

const html = readFileSync(FILE, "utf8");
// Comments may mention forbidden things by name, so check the code without them.
const code = html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

// 1. Basic structure
if (!/^<!DOCTYPE html>/i.test(html.trimStart())) fail("missing <!DOCTYPE html>");
if (!/<title>[^<]+<\/title>/.test(html)) fail("missing <title>");
if ((html.match(/<style\b/g) || []).length !== 1) fail("expected exactly one <style> block");

// 2. No external resources: no CDN scripts, stylesheets, fonts or image files
const external = [
  [/<script\b[^>]*\bsrc=/i, "<script src=…> (scripts must be inline)"],
  [/<link\b[^>]*\brel=["']?(stylesheet|preload|icon)/i, "<link> to an external file"],
  [/<img\b/i, "<img> (use inline SVG or Unicode glyphs)"],
  [/@import\b/i, "CSS @import"],
  [/url\(\s*["']?(https?:)?\/\//i, "CSS url() pointing at another host"],
];
for (const [pattern, label] of external) if (pattern.test(code)) fail(`external resource: ${label}`);

// 3. The only outside host the page may talk to is FormSubmit
const hosts = new Set([...code.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1].toLowerCase()));
for (const host of hosts) if (host !== "formsubmit.co") fail(`unexpected outside host: ${host}`);

// 4. No persistence and no native dialogs
const forbidden = [
  [/\b(localStorage|sessionStorage|indexedDB)\b/, "browser storage API"],
  [/document\.cookie/, "cookies"],
  [/\b(alert|confirm|prompt)\s*\(/, "native alert/confirm/prompt dialog"],
  [/!important/, "!important in CSS"],
];
for (const [pattern, label] of forbidden) if (pattern.test(code)) fail(`not allowed: ${label}`);

// 5. The FormSubmit endpoint is configured in exactly one place
const endpoints = code.match(/const\s+FORMSUBMIT_ENDPOINT\s*=/g) || [];
if (endpoints.length !== 1) fail(`expected one FORMSUBMIT_ENDPOINT constant, found ${endpoints.length}`);

// 6. The inline script parses
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
if (scripts.length === 0) fail("no inline <script> block found");
const dir = mkdtempSync(join(tmpdir(), "check-page-"));
scripts.forEach((source, i) => {
  const path = join(dir, `inline-${i}.js`);
  writeFileSync(path, source);
  try {
    execFileSync(process.execPath, ["--check", path], { stdio: "pipe" });
  } catch (error) {
    fail(`JavaScript syntax error in inline script ${i + 1}:\n${error.stderr?.toString() || error.message}`);
  }
});

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL: ${message}`));
  process.exit(1);
}
console.log(`OK: ${FILE} passed all checks (${(html.length / 1024).toFixed(1)} KB, ${scripts.length} inline script)`);
