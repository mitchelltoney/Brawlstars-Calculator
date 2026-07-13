// Pure, DOM-free counter calculation. Mirrors the original pycode.py's
// calculate()/handleCases() behavior, with one corrected difference:
// overlaps are counted over `direct` counters only, never over class names.
// (The previous Python implementation also counted class markers, which
// then leaked into the rendered overlap rows as broken image cards.)

import { counters, rarityOrder, dataUpdated } from "./counters.js?v=2026-07-13.4";

// brawlerNames in case-preserving "alphabetical" order, equivalent to the
// historical brawlers.js `brawlerNames` (curated, places "RT" before "Rico").
export const brawlersAlphabetical = Object.keys(counters);

// Re-export rarityOrder and dataUpdated so callers have a single import surface.
export { rarityOrder, dataUpdated };

// Normalize a name for lookup: lowercase and strip spaces, dots, apostrophes,
// and hyphens, so "8-Bit", "Mr. P", "jae yong", and "El Primo" all resolve to
// their canonical roster keys regardless of punctuation style.
function normalizeName(raw) {
  return String(raw).toLowerCase().replace(/[\s.'-]/g, "");
}

// Normalized lookup index for punctuation/case-insensitive name resolution.
const normalToCanonical = new Map(
  brawlersAlphabetical.map(n => [normalizeName(n), n])
);

// Maximum opponents the picker can hold at once. Both the icon-click and
// the type-a-name paths share this limit via the helpers below.
export const MAX_PICKS = 3;

// Resolve a user-typed name to a canonical key in `counters`, or null.
// Mirrors pycode.py's handleCases(): direct case-insensitive match wins,
// otherwise a handful of nickname substrings map to canonical names.
export function resolveName(raw) {
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  const direct = normalToCanonical.get(normalizeName(trimmed));
  if (direct) return direct;

  const n = trimmed.toLowerCase();
  if (n.includes("primo"))  return "El Primo";
  if (n.includes("miko"))   return "Mico";
  if (n.includes("mike"))   return "Dynamike";
  if (n.includes("barry"))  return "Berry";
  if (n.includes("damien")) return "Damian"; // pre-July-2026 misspelling

  return null;
}

// Brawlers whose canonical name starts with `typed` (case-insensitive), in
// roster (brawlersAlphabetical) order. Used both for the autocomplete
// dropdown and the unique-prefix fallback below.
export function prefixMatches(typed) {
  const normal = normalizeName(String(typed).trim());
  if (!normal) return [];
  return brawlersAlphabetical.filter(n => normalizeName(n).startsWith(normal));
}

// If `typed` is a strict case-insensitive prefix of exactly one roster name,
// return that name. Otherwise null. Lets "Br" expand to "Brock" on confirm.
export function resolveUniquePrefix(typed) {
  const matches = prefixMatches(typed);
  return matches.length === 1 ? matches[0] : null;
}

// Compute counterpicks for up to three opposing brawlers.
//
// Returns:
//   {
//     results:        [{ brawler, counters: string[], classes: string[] }],
//     doubleOverlaps: string[],   // direct counters shared by exactly 2 picks
//     tripleOverlaps: string[],   // direct counters shared by exactly 3 picks
//   }
//
// Empty/blank inputs are ignored. Duplicate or unknown inputs are skipped
// silently. Result order matches the order brawlers were successfully picked.
export function calculate(inputs) {
  const selected = [];
  const counts = new Map();

  for (const raw of inputs) {
    if (raw == null || String(raw).trim() === "") continue;
    const name = resolveName(raw);
    if (!name) continue;
    if (selected.includes(name)) continue;
    selected.push(name);
    for (const counter of counters[name].direct) {
      counts.set(counter, (counts.get(counter) ?? 0) + 1);
    }
  }

  const results = selected.map(name => ({
    brawler: name,
    counters: counters[name].direct.slice(),
    classes: counters[name].classes.slice(),
  }));

  const doubleOverlaps = [];
  const tripleOverlaps = [];
  for (const [name, n] of counts) {
    if (n === 2) doubleOverlaps.push(name);
    else if (n === 3) tripleOverlaps.push(name);
  }

  return { results, doubleOverlaps, tripleOverlaps };
}

// Pure pick-queue helpers. Both the icon-click and the type-a-name paths in
// the UI go through these so the queue stays a single source of truth.
// Each helper returns a NEW array; callers diff against their current state
// to drive DOM highlight changes.

// Additive: if `name` is already present, return an unchanged copy (no-op).
// Otherwise append `name`; if that would exceed MAX_PICKS, FIFO-evict the
// oldest entry first.
export function addPick(picks, name) {
  if (picks.includes(name)) return picks.slice();
  const next = picks.slice();
  if (next.length >= MAX_PICKS) next.shift();
  next.push(name);
  return next;
}

// Toggle: if `name` is present, remove it; otherwise behave like addPick.
// This is the icon-click behavior, preserved from the pre-refactor code.
export function togglePick(picks, name) {
  if (picks.includes(name)) {
    return picks.filter(p => p !== name);
  }
  return addPick(picks, name);
}
