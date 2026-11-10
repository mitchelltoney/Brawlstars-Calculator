// Guards for the translated page content (docs/i18n/<lang>/) and the
// generated /es/ and /pt/ pages built from it. When English notes or map
// texts change, these fail until the translations catch up:
//
//   node scripts/i18n-content.mjs extract <dir>   (then translate the chunks)
//   node scripts/i18n-content.mjs merge <dir>
//   npm run generate:maps && npm run generate

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { counters } from "../docs/counters.js";
import { HTML_LANG } from "../docs/i18n.js";
import { CONTENT_LANGS, contentStatus, protectedNames, mentions } from "../scripts/lib/content-i18n.mjs";

const DOCS = join(dirname(fileURLToPath(import.meta.url)), "..", "docs");
const HINT = "run node scripts/i18n-content.mjs extract/merge (see the file header)";
const sample = list => list.slice(0, 8).join("\n  ");

for (const lang of CONTENT_LANGS) {
  test(`${lang}: every English note and map text has a current translation`, async () => {
    const { status, orphans } = await contentStatus(lang);
    const missing = [...status].filter(([, s]) => s === "missing").map(([k]) => k);
    const stale = [...status].filter(([, s]) => s === "stale").map(([k]) => k);
    assert.equal(missing.length, 0, `${missing.length} missing ${lang} translation(s) — ${HINT}:\n  ${sample(missing)}`);
    assert.equal(stale.length, 0, `${stale.length} ${lang} translation(s) older than their English — ${HINT}:\n  ${sample(stale)}`);
    assert.equal(orphans.length, 0, `${orphans.length} ${lang} translation(s) with no English source:\n  ${sample(orphans)}`);
  });

  test(`${lang}: translations keep brawler, gadget, star power, map and mode names verbatim`, async () => {
    const { en, entries } = await contentStatus(lang);
    const problems = [];
    for (const [k, text] of entries) {
      const source = en.get(k);
      if (!source) continue;
      for (const name of protectedNames) {
        if (mentions(source, name) && !text.includes(name)) problems.push(`${k}: "${name}"`);
      }
    }
    assert.deepEqual(problems.slice(0, 20), [], `names altered in ${lang} translations`);
  });

  test(`${lang}: generated pages are in ${lang}, link their siblings, and use the translations`, async () => {
    const { entries } = await contentStatus(lang);
    const page = readFileSync(join(DOCS, lang, "counters", "8bit", "index.html"), "utf8");
    assert.ok(page.includes(`<html lang="${HTML_LANG[lang]}">`));
    assert.ok(page.includes(`<link rel="canonical" href="https://brawlcalculator.com/${lang}/counters/8bit/">`));
    for (const [hl, href] of [["en", "/counters/8bit/"], ["es", "/es/counters/8bit/"], ["pt-BR", "/pt/counters/8bit/"], ["x-default", "/counters/8bit/"]]) {
      assert.ok(page.includes(`<link rel="alternate" hreflang="${hl}" href="https://brawlcalculator.com${href}">`), `hreflang ${hl}`);
    }
    // A translated note renders (first sentence before any inline loadout icon).
    const note = entries.get(`m|8bit|${counters["8bit"].direct[0]}`);
    assert.ok(note && page.includes(note.split(/[,.]/)[0].replace(/&/g, "&amp;")), "translated matchup note on page");

    const mapPage = readFileSync(join(DOCS, lang, "maps", "brace-for-impact", "index.html"), "utf8");
    assert.ok(mapPage.includes(`<html lang="${HTML_LANG[lang]}">`));
    assert.ok(mapPage.includes(`href="/${lang}/counters/mr-p/"`), "map picks link to same-language counter pages");
    assert.ok(mapPage.includes(`href="/?lang=${lang}"`), "calculator links keep the language");
  });
}
