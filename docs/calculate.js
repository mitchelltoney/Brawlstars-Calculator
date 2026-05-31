// Pure, DOM-free counter calculation. Mirrors the original pycode.py's
// calculate()/handleCases() behavior, with one corrected difference:
// overlaps are counted over `direct` counters only, never over class names.
// (The previous Python implementation also counted class markers, which
// then leaked into the rendered overlap rows as broken image cards.)

import { counters, rarityOrder } from "./counters.js";

// brawlerNames in case-preserving "alphabetical" order, equivalent to the
// historical brawlers.js `brawlerNames` (curated, places "RT" before "Rico").
export const brawlersAlphabetical = Object.keys(counters);

// Re-export rarityOrder so callers have a single import surface if they want.
export { rarityOrder };

// Lower-cased lookup index for case-insensitive name resolution.
const lowerToCanonical = new Map(
  brawlersAlphabetical.map(n => [n.toLowerCase(), n])
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

  const direct = lowerToCanonical.get(trimmed.toLowerCase());
  if (direct) return direct;

  const n = trimmed.toLowerCase();
  if (n.includes("primo")) return "El Primo";
  if (n.includes("miko"))  return "Mico";
  if (n.includes("mike"))  return "Dynamike";
  if (n.includes("barry")) return "Berry";

  return null;
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
