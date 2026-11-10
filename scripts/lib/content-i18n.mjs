// Shared plumbing for translated page content (matchup notes, reverse notes,
// map texts). Every English sentence gets a flat key:
//
//   m|Defender|Counter   docs/matchup-notes.js  matchupNotes[Defender][Counter]
//   r|Owner|Target       docs/reverse-notes.js  reverseNotes[Owner][Target]
//   s|map-slug           docs/map-data.js       summary
//   p|map-slug|Brawler   docs/map-data.js       S-tier pick "why"
//   b|map-slug|Brawler   docs/map-data.js       ban "why"
//
// Translations live in docs/i18n/<lang>/{matchup-notes,reverse-notes,map-text}.js
// with the same nesting. scripts/i18n/sources-<lang>.json records a hash of
// the English each translation was made from, so an edited English sentence
// shows up as stale instead of silently keeping an outdated translation.

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

import { counters } from "../../docs/counters.js";
import { matchupNotes } from "../../docs/matchup-notes.js";
import { reverseNotes } from "../../docs/reverse-notes.js";
import { loadoutIcons } from "../../docs/loadout-icons.js";
import { maps, modes } from "../../docs/map-data.js";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const CONTENT_LANGS = ["es", "pt"];

export const hash8 = s => createHash("sha1").update(s).digest("hex").slice(0, 8);

// English source, flattened, in a stable order (notes first, then maps).
export function englishEntries() {
  const out = new Map();
  for (const [d, o] of Object.entries(matchupNotes)) for (const [c, t] of Object.entries(o)) out.set(`m|${d}|${c}`, t);
  for (const [d, o] of Object.entries(reverseNotes)) for (const [c, t] of Object.entries(o)) out.set(`r|${d}|${c}`, t);
  for (const m of maps) {
    if (m.summary) out.set(`s|${m.slug}`, m.summary);
    for (const tier of Object.values(m.picks)) {
      for (const p of tier) if (typeof p === "object" && p.why) out.set(`p|${m.slug}|${p.name}`, p.why);
    }
    for (const b of m.bans ?? []) if (b.why) out.set(`b|${m.slug}|${b.name}`, b.why);
  }
  return out;
}

// Names that must survive translation verbatim: brawlers, gadgets/star
// powers (renderNote matches these to inline their icons), maps, modes.
export const protectedNames = [...new Set([
  ...Object.keys(counters), ...Object.keys(loadoutIcons),
  ...maps.map(m => m.name), ...modes.map(m => m.name),
])].sort((a, b) => b.length - a.length);

const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const mentions = (text, name) =>
  new RegExp(`(^|[^A-Za-z0-9])${reEsc(name)}(?![A-Za-z0-9])`).test(text);

export function contentPaths(lang) {
  const dir = join(ROOT, "docs", "i18n", lang);
  return {
    dir,
    matchup: join(dir, "matchup-notes.js"),
    reverse: join(dir, "reverse-notes.js"),
    maps: join(dir, "map-text.js"),
    sources: join(ROOT, "scripts", "i18n", `sources-${lang}.json`),
  };
}

async function importIfExists(file) {
  return existsSync(file) ? import(pathToFileURL(file).href) : {};
}

// Translated content for one language, flattened to the same keys as
// englishEntries(), plus the recorded source hashes.
export async function translatedEntries(lang) {
  const p = contentPaths(lang);
  const { matchupNotes: tm = {} } = await importIfExists(p.matchup);
  const { reverseNotes: tr = {} } = await importIfExists(p.reverse);
  const { mapText = {} } = await importIfExists(p.maps);
  const out = new Map();
  for (const [d, o] of Object.entries(tm)) for (const [c, t] of Object.entries(o)) out.set(`m|${d}|${c}`, t);
  for (const [d, o] of Object.entries(tr)) for (const [c, t] of Object.entries(o)) out.set(`r|${d}|${c}`, t);
  for (const [slug, mt] of Object.entries(mapText)) {
    if (mt.summary) out.set(`s|${slug}`, mt.summary);
    for (const [n, t] of Object.entries(mt.picks ?? {})) out.set(`p|${slug}|${n}`, t);
    for (const [n, t] of Object.entries(mt.bans ?? {})) out.set(`b|${slug}|${n}`, t);
  }
  const sources = existsSync(p.sources) ? JSON.parse(readFileSync(p.sources, "utf8")) : {};
  return { entries: out, sources };
}

// Per key: "ok", "missing" (no translation) or "stale" (English changed
// since it was translated). Orphans are translations with no English key.
export async function contentStatus(lang) {
  const en = englishEntries();
  const { entries, sources } = await translatedEntries(lang);
  const status = new Map();
  for (const [k, text] of en) {
    if (!entries.has(k)) status.set(k, "missing");
    else if (sources[k] !== hash8(text)) status.set(k, "stale");
    else status.set(k, "ok");
  }
  const orphans = [...entries.keys()].filter(k => !en.has(k));
  return { en, entries, sources, status, orphans };
}

// What the generators render: the translation when it is current, else the
// English sentence (a stale or missing translation never ships as if fresh).
export async function localizedContent(lang) {
  if (lang === "en") {
    const en = englishEntries();
    return key => en.get(key);
  }
  const { en, entries, status } = await contentStatus(lang);
  return key => (status.get(key) === "ok" ? entries.get(key) : en.get(key));
}
