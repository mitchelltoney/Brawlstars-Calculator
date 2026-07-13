// Cache-bust stamp: rewrites every `?v=YYYY-MM-DD` asset-version token (and
// the service worker cache name) to today's date. Run before deploying any
// JS/CSS/data change so browsers never pair a fresh index.html with a stale
// cached app.js — the exact skew that makes freshly-shipped buttons dead
// for up to 10 minutes on GitHub Pages.
//
//   npm run stamp

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const today = new Date().toISOString().slice(0, 10);

const files = [
  "docs/index.html",
  "docs/classic.html",
  "docs/texts.html",
  "docs/app.js",
  "docs/app-text.js",
  "docs/calculate.js",
];

let changed = 0;
for (const f of files) {
  const p = join(ROOT, f);
  const src = readFileSync(p, "utf8");
  const out = src.replace(/\?v=\d{4}-\d{2}-\d{2}/g, `?v=${today}`);
  if (out !== src) { writeFileSync(p, out); changed++; }
}

const swPath = join(ROOT, "docs", "sw.js");
const sw = readFileSync(swPath, "utf8");
const swOut = sw.replace(/const CACHE = "bc-[^"]*"/, `const CACHE = "bc-${today}"`);
if (swOut !== sw) { writeFileSync(swPath, swOut); changed++; }

console.log(`Stamped ?v=${today} (${changed} file(s) updated).`);
