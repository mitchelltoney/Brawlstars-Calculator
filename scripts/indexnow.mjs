// Submit every sitemap URL to IndexNow (Bing, Yandex, Seznam, Naver — not
// Google, which only takes sitemaps/Search Console). Run after a deploy
// that adds or meaningfully changes pages:
//
//   npm run indexnow
//
// The key file lives at docs/<key>.txt (created on first run) and must be
// deployed before pinging, since IndexNow fetches it to verify ownership.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = join(ROOT, "docs");
const HOST = "brawlcalculator.com";

// Find or create the key file (32 hex chars).
let key = readdirSync(DOCS).map(f => /^([a-f0-9]{32})\.txt$/.exec(f)?.[1]).find(Boolean);
if (!key) {
  key = randomBytes(16).toString("hex");
  writeFileSync(join(DOCS, `${key}.txt`), key);
  console.log(`created key file docs/${key}.txt — DEPLOY IT, then rerun.`);
  process.exit(0);
}

const urls = [...readFileSync(join(DOCS, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`submitting ${urls.length} URLs for ${HOST}…`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: urls }),
});
console.log(`IndexNow response: ${res.status} ${res.statusText}`);
if (!res.ok) console.log(await res.text());
