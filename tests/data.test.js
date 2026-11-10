// Data-integrity guards for docs/counters.js and the generated artifacts
// that depend on it (icons, per-brawler pages, sitemap). These are the
// checks that catch a half-finished roster update: a renamed brawler whose
// icon wasn't renamed, a new brawler missing from rarityOrder, or a
// counters.js edit without a matching `npm run generate` run.

import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { counters, rarityOrder, dataUpdated } from "../docs/counters.js";
import { matchupNotes } from "../docs/matchup-notes.js";
import { maps as siteMaps } from "../docs/map-data.js";

const DOCS = join(dirname(fileURLToPath(import.meta.url)), "..", "docs");
const roster = Object.keys(counters);

// Keep in sync with fileName() in docs/app.js / docs/app-text.js.
const iconFile = n => n.toLowerCase().replace(/[\s.'-]/g, "_") + ".webp";
// Keep in sync with slug() in scripts/generate-counter-pages.mjs.
const slug = n => n.toLowerCase().replace(/[\s.'-]+/g, "-");
// Generated trees: English at docs/counters/, translations at docs/<lang>/counters/.
const PAGE_LANGS = ["en", "es", "pt"];
const langDir = (lang, section) => join(DOCS, ...(lang === "en" ? [] : [lang]), section);
const langUrl = (lang, path) => `https://brawlcalculator.com${lang === "en" ? "" : `/${lang}`}${path}`;

test("every direct counter references a real roster brawler", () => {
  for (const [name, { direct }] of Object.entries(counters)) {
    for (const c of direct) {
      assert.ok(c in counters, `${name} lists unknown counter "${c}"`);
    }
  }
});

test("no brawler counters itself and no duplicate entries in a counter list", () => {
  for (const [name, { direct }] of Object.entries(counters)) {
    assert.ok(!direct.includes(name), `${name} lists itself as a counter`);
    assert.equal(new Set(direct).size, direct.length, `${name} has duplicate counters`);
  }
});

test("rarityOrder is a permutation of the roster with no duplicates", () => {
  assert.equal(rarityOrder.length, roster.length);
  assert.equal(new Set(rarityOrder).size, rarityOrder.length);
  assert.deepEqual(new Set(rarityOrder), new Set(roster));
});

test("every roster brawler has a WebP icon; no orphaned icons", () => {
  const icons = new Set(readdirSync(join(DOCS, "icons")).filter(f => f.endsWith(".webp")));
  for (const name of roster) {
    assert.ok(icons.has(iconFile(name)), `missing icon for ${name} (${iconFile(name)})`);
  }
  const used = new Set(roster.map(iconFile));
  for (const f of icons) {
    assert.ok(used.has(f), `orphaned icon file: ${f}`);
  }
});

test("generated counter pages are in sync with the roster (run: npm run generate)", () => {
  for (const lang of PAGE_LANGS) {
    for (const name of roster) {
      const page = join(langDir(lang, "counters"), slug(name), "index.html");
      assert.ok(existsSync(page), `missing generated ${lang} page for ${name} — run npm run generate`);
    }
    // No stale directories for renamed/removed brawlers.
    const dirs = readdirSync(langDir(lang, "counters"), { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    const expected = new Set(roster.map(slug));
    for (const d of dirs) {
      assert.ok(expected.has(d), `stale generated ${lang} page dir: ${d} — run npm run generate`);
    }
  }
});

test("sitemap covers home and every counters/maps page in every language", () => {
  const xml = readFileSync(join(DOCS, "sitemap.xml"), "utf8");
  assert.ok(xml.includes("<loc>https://brawlcalculator.com/</loc>"));
  for (const lang of PAGE_LANGS) {
    const paths = ["/counters/", "/maps/", ...roster.map(n => `/counters/${slug(n)}/`), ...siteMaps.map(m => `/maps/${m.slug}/`)];
    for (const path of paths) {
      const loc = `<loc>${langUrl(lang, path)}</loc>`;
      assert.ok(xml.includes(loc), `sitemap missing ${loc} — run npm run generate`);
    }
  }
  assert.ok(xml.includes(`<xhtml:link rel="alternate" hreflang="pt-BR" href="${langUrl("pt", "/counters/edgar/")}"/>`));
});

test("matchup notes only reference real (defender, counter) pairs", () => {
  for (const [d, notes] of Object.entries(matchupNotes)) {
    assert.ok(d in counters, `note defender "${d}" is not on the roster`);
    for (const [c, note] of Object.entries(notes)) {
      assert.ok(
        counters[d].direct.includes(c),
        `${d} <- ${c}: note exists but ${c} is not a listed counter of ${d}`
      );
      assert.equal(typeof note, "string");
      assert.ok(note.length >= 20 && note.length <= 200, `${d} <- ${c}: note length ${note.length}`);
    }
  }
});

test("map data: unique slugs, roster-valid picks/bans, generated pages in sync", () => {
  const slugs = siteMaps.map(m => m.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate map slugs");
  for (const m of siteMaps) {
    assert.ok(["high", "medium", "low", "none"].includes(m.confidence), `${m.slug}: confidence`);
    const names = [
      ...(m.picks?.S ?? []).map(p => p.name),
      ...(m.picks?.A ?? []),
      ...(m.picks?.B ?? []),
      ...(m.bans ?? []).map(b => b.name),
    ];
    for (const n of names) {
      assert.ok(n in counters, `${m.slug}: non-roster brawler "${n}"`);
    }
    if (!m.ranked) assert.equal((m.bans ?? []).length, 0, `${m.slug}: bans on non-ranked map`);
    // Generated page exists — run npm run generate:maps after data changes.
    for (const lang of PAGE_LANGS) {
      assert.ok(
        existsSync(join(langDir(lang, "maps"), m.slug, "index.html")),
        `missing generated ${lang} page for map ${m.slug} — run npm run generate:maps`
      );
    }
  }
  // No stale generated map dirs.
  const expected = new Set(slugs);
  for (const lang of PAGE_LANGS) {
    const dirs = readdirSync(langDir(lang, "maps"), { withFileTypes: true })
      .filter(d => d.isDirectory()).map(d => d.name);
    for (const d of dirs) {
      assert.ok(expected.has(d), `stale generated ${lang} map dir: ${d} — run npm run generate:maps`);
    }
  }
});

test("generated pages carry the current freshness stamp", () => {
  const idx = readFileSync(join(DOCS, "counters", "index.html"), "utf8");
  assert.ok(
    idx.includes(`updated ${dataUpdated}`),
    `counters index page stamp doesn't match dataUpdated ("${dataUpdated}") — run npm run generate`
  );
});
