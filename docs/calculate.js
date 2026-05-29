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

// Resolve a user-typed name to a canonical key in `counters`, or null.
// Mirrors pycode.py's handleCases(): direct case-insensitive match wins,
// otherwise a handful of nickname substrings map to canonical names.
function resolveName(raw) {
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
