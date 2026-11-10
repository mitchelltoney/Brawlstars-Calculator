// Guards for docs/i18n.js: language detection, string-table parity, and that
// every key the pages and app.js reference actually exists.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  LANGS,
  HTML_LANG,
  strings,
  normalizeLang,
  detectLang,
  pickLang,
  translate,
  translateClass,
  formatMonthYear,
} from "../docs/i18n.js";
import { counters, dataUpdated } from "../docs/counters.js";

const DOCS = join(dirname(fileURLToPath(import.meta.url)), "..", "docs");

const placeholders = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
const tags = s => [...String(s).matchAll(/<\/?([a-z]+)/g)].map(m => m[1]).sort();

test("every language has exactly the English key set, placeholders and markup", () => {
  const en = strings.en;
  for (const lang of LANGS) {
    const table = strings[lang];
    assert.deepEqual(Object.keys(table).sort(), Object.keys(en).sort(), `${lang} key set`);
    for (const key of Object.keys(en)) {
      if (key === "classes") continue;
      assert.equal(typeof table[key], "string", `${lang}.${key}`);
      assert.ok(table[key].trim(), `${lang}.${key} is empty`);
      assert.deepEqual(placeholders(table[key]), placeholders(en[key]), `${lang}.${key} placeholders`);
      // Plain-text keys go through textContent, so markup would show literally.
      if (key.endsWith("Html")) assert.deepEqual(tags(table[key]), tags(en[key]), `${lang}.${key} tags`);
      else assert.ok(!/<[a-z/]/i.test(table[key]), `${lang}.${key} has markup but no Html suffix`);
    }
    assert.deepEqual(Object.keys(table.classes).sort(), Object.keys(en.classes).sort(), `${lang}.classes`);
  }
});

test("Html strings keep the ids and links the page scripts rely on", () => {
  for (const lang of LANGS) {
    assert.match(strings[lang].footerSourceHtml, /<span id="dataFreshness">\{date\}<\/span>/);
    assert.match(strings[lang].disclaimerHtml, /href="https:\/\/supercell\.com\/en\/fan-content-policy\/"/);
  }
});

test("every counter class used in counters.js has a label in every language", () => {
  const used = new Set(Object.values(counters).flatMap(c => c.classes));
  for (const lang of LANGS) {
    for (const cls of used) assert.ok(strings[lang].classes[cls], `${lang} label for class ${cls}`);
  }
});

test("every data-i18n key in the calculator pages exists", () => {
  for (const page of ["index.html", "classic.html"]) {
    const html = readFileSync(join(DOCS, page), "utf8");
    const keys = [
      ...[...html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map(m => m[1]),
      ...[...html.matchAll(/data-i18n-attr="([^"]+)"/g)]
        .flatMap(m => m[1].split(",").map(pair => pair.split(":")[1].trim())),
    ];
    assert.ok(keys.length, `${page} has no data-i18n hooks`);
    for (const key of keys) assert.ok(key in strings.en, `${page}: unknown key ${key}`);
  }
});

test("each language toggle offers every UI language, and each has an <html lang>", () => {
  const html = readFileSync(join(DOCS, "index.html"), "utf8");
  const toggles = [...html.matchAll(/<div class="lang-toggle[^"]*"[\s\S]*?<\/div>/g)].map(m => m[0]);
  assert.equal(toggles.length, 2, "nav + header toggles");
  for (const toggle of toggles) {
    const offered = [...toggle.matchAll(/data-lang="(\w+)"/g)].map(m => m[1]);
    assert.deepEqual(offered, LANGS);
  }
  for (const lang of LANGS) assert.ok(HTML_LANG[lang], `HTML_LANG.${lang}`);
});

test("homepage declares its ?lang= language versions (page head + sitemap)", () => {
  const html = readFileSync(join(DOCS, "index.html"), "utf8");
  const xml = readFileSync(join(DOCS, "sitemap.xml"), "utf8");
  const versions = [["en", "/"], ["es", "/?lang=es"], ["pt-BR", "/?lang=pt"], ["x-default", "/"]];
  for (const [hl, path] of versions) {
    const href = `https://brawlcalculator.com${path}`;
    assert.ok(html.includes(`<link rel="alternate" hreflang="${hl}" href="${href}" />`), `index.html hreflang ${hl}`);
    assert.ok(xml.includes(`<xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>`), `sitemap hreflang ${hl}`);
  }
  for (const lang of LANGS) {
    const loc = lang === "en" ? "https://brawlcalculator.com/" : `https://brawlcalculator.com/?lang=${lang}`;
    assert.ok(xml.includes(`<loc>${loc}</loc>`), `sitemap entry ${loc}`);
  }
});

test("every t(\"key\") call in app.js exists", () => {
  const src = readFileSync(join(DOCS, "app.js"), "utf8");
  const keys = [...src.matchAll(/\bt\(\s*"(\w+)"/g)].map(m => m[1]);
  // Keys picked by a ternary: t(cond ? "a" : "b", ...)
  for (const m of src.matchAll(/\bt\([^)]*\?\s*"(\w+)"\s*:\s*"(\w+)"/g)) keys.push(m[1], m[2]);
  for (const m of src.matchAll(/renderOverlap\("(\w+)"/g)) keys.push(m[1]);
  assert.ok(keys.length > 10);
  for (const key of keys) assert.ok(key in strings.en, `app.js: unknown key ${key}`);
});

test("normalizeLang maps regional and cased codes to supported languages", () => {
  assert.equal(normalizeLang("es"), "es");
  assert.equal(normalizeLang("es-MX"), "es");
  assert.equal(normalizeLang("es_419"), "es");
  assert.equal(normalizeLang("ES"), "es");
  assert.equal(normalizeLang("en-GB"), "en");
  assert.equal(normalizeLang("pt-BR"), "pt");
  assert.equal(normalizeLang("pt-PT"), "pt");
  assert.equal(normalizeLang("PT"), "pt");
  assert.equal(normalizeLang("fr-FR"), null);
  assert.equal(normalizeLang(""), null);
  assert.equal(normalizeLang(undefined), null);
});

test("detectLang takes the first supported browser language, defaulting to English", () => {
  assert.equal(detectLang(["es-AR", "en-US"]), "es");
  assert.equal(detectLang(["en-US", "es"]), "en");
  assert.equal(detectLang(["fr-FR", "es-ES"]), "es");
  assert.equal(detectLang(["pt-BR", "en"]), "pt");
  assert.equal(detectLang(["en-US", "pt-BR"]), "en");
  assert.equal(detectLang(["de-DE", "pt-PT"]), "pt");
  assert.equal(detectLang(["de-DE", "fr"]), "en");
  assert.equal(detectLang("es-CO"), "es");
  assert.equal(detectLang(undefined), "en");
  assert.equal(detectLang([]), "en");
});

test("pickLang precedence: ?lang= param, then saved toggle, then browser", () => {
  assert.equal(pickLang({ param: "es", stored: "en", preferred: ["en-US"] }), "es");
  assert.equal(pickLang({ param: null, stored: "en", preferred: ["es-MX"] }), "en");
  assert.equal(pickLang({ param: "xx", stored: "es", preferred: ["en-US"] }), "es");
  assert.equal(pickLang({ stored: null, preferred: ["es-MX"] }), "es");
  assert.equal(pickLang({ param: "pt", stored: "es", preferred: ["en-US"] }), "pt");
  assert.equal(pickLang({ stored: "pt", preferred: ["es-MX"] }), "pt");
  assert.equal(pickLang({}), "en");
});

test("translate fills placeholders and falls back to English, then the key", () => {
  assert.equal(translate("es", "removePick", { name: "El Primo" }), "Quitar a El Primo");
  assert.equal(translate("pt", "removePick", { name: "El Primo" }), "Remover El Primo");
  assert.equal(translate("en", "bansCount", { n: 3 }), "Bans (3)");
  assert.equal(translate("xx", "calculate"), "Calculate");
  assert.equal(translate("es", "noSuchKey"), "noSuchKey");
});

test("brawler names pass through untranslated", () => {
  for (const lang of LANGS) {
    for (const name of ["Mr P", "El Primo", "8bit", "Jae-Yong"]) {
      assert.ok(translate(lang, "guideLinkTitle", { name }).includes(name), `${lang} ${name}`);
    }
  }
  assert.equal(translateClass("es", "Tank"), "Tanque");
  assert.equal(translateClass("pt", "Thrower"), "Arremessador");
  assert.equal(translateClass("es", "Unlisted"), "Unlisted");
});

test("formatMonthYear localizes the counters.js freshness stamp", () => {
  assert.equal(formatMonthYear("October 2026", "es"), "octubre de 2026");
  assert.equal(formatMonthYear("July 2026", "es"), "julio de 2026");
  assert.equal(formatMonthYear("October 2026", "pt"), "outubro de 2026");
  assert.equal(formatMonthYear("March 2027", "pt"), "março de 2027");
  assert.equal(formatMonthYear("October 2026", "en"), "October 2026");
  assert.equal(formatMonthYear("Fall 2026", "es"), "Fall 2026");
  for (const lang of ["es", "pt"]) {
    assert.match(formatMonthYear(dataUpdated, lang), /^[a-zç]+ de \d{4}$/, lang);
  }
});
