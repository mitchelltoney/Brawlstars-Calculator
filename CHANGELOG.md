# Refactor: drop Pyodide, single data source, dedupe CSS, add tests

Branch: `refactor/drop-pyodide` (not pushed; deploy is the user's call).
No user-facing features changed.

## What moved where

| Before | After |
|---|---|
| `docs/pycode.py` (in-browser via Pyodide) — `key` dict | `docs/counters.js` (pure ES module) — `counters` dict with `{direct, classes}` per brawler |
| `docs/pycode.py` — `calculate()`, `handleCases()`, `countBrawler()` | `docs/calculate.js` — `calculate()`, internal `resolveName()` |
| `docs/brawlers.js` — `brawlerNames`, `brawlerNamesRarity` | `docs/calculate.js` — `brawlersAlphabetical` (derived as `Object.keys(counters)`); `docs/counters.js` — `rarityOrder` |
| `docs/pycode.py` — `returnBrawlerString` (commented-out) | removed |
| Pyodide CDN load + `micropip` + `fetch("pycode.py?v=2")` + bot-detection IIFE in three HTML shells | direct `<script type="module" src="…">`; no runtime CDN, no WASM, no bot gate |
| `loading_chester.png` + `#loading-screen` markup + `@keyframes spin` in three shells | re-added. Markup is in each shell's `<body>` so it's visible from first paint; `docs/loader.js` fades it out on `window.load`. Warm-cache loads show only a brief flicker, slow loads see Chester spin. CSS + keyframes in `docs/styles.css`. |
| `@font-face` duplicated in three shells | `docs/styles.css`, linked from all three |
| Body / `.card` / form / output styling duplicated between `docs/classic.html` and `docs/texts.html` | `docs/legacy.css`, linked from both |
| `docs/index.html` 800 LOC; `classic.html` 254; `texts.html` 197 | 756 / 123 / 64 |
| No tests | `tests/calculate.test.js` (14 tests via `node:test`); dev-only `package.json` |
| `notbeingused.html` (self-labeled dead) | deleted (was untracked) |
| `test.py` (unrelated kana scratch) | deleted (was untracked) |
| `script.py` (terminal CLI) | header comment marks it a frozen legacy artifact; logic untouched |
| Counter overlaps tallied over all of `key[b]` including `T>` markers (bug — broken images in overlap rows) | tallied over `direct` only; class markers can no longer appear in `doubleOverlaps` / `tripleOverlaps` |
| `T>Thrower` / `T>Throwers`, `T>Anti-Tanks` / `T>Anti-tanks`, etc. | normalized to singular `Thrower`, `Anti-Tank`, `Assassin`, `Tank`, `Wallbreaker`, `Healer`, `Sniper`; stored in `classes` field separately from `direct` |

## Loading overlay

The `#loading-screen` element lives in each shell's HTML and is visible from
first paint. `docs/loader.js` adds `.fading` on `window.load` (after all icon
PNGs and fonts finish loading), which transitions opacity to 0 and removes
the element. On a warm cache that's near-instant — Chester flickers very
briefly. On a slow first visit he spins until the assets settle.

`HARD_TIMEOUT_MS` (default `10000`) at the top of `docs/loader.js` is an
unconditional dismiss so a single hung asset can never trap the user behind
the spinner.

`prefers-reduced-motion: reduce` suppresses the spin animation in
`docs/styles.css`; a static Chester is shown instead.

## Preserved behavior

- `handleCases` aliases: `primo → El Primo`, `miko → Mico`, `mike → Dynamike`, `barry → Berry` (substring on lowercased input, after direct case-insensitive lookup fails).
- Case-insensitive brawler name resolution.
- Up to 3 picks; FIFO eviction of the oldest when a 4th icon is selected.
- `calculate` invoked with a 3-element array padded with empty strings; empty/blank/duplicate/unknown inputs are silently skipped.
- Result order matches successful-pick order.
- Per-brawler counter rows render direct counters only (now structural, not filtered at render time).
- `localStorage["iconSize"]` persistence in `index.html` is unchanged.
- `doubleOverlaps`: counter shared by exactly 2 picks. `tripleOverlaps`: shared by exactly 3.

## Data equivalence

A throwaway Node check reconstructed the original `key` dict from `counters.js` (concatenating `direct` with `classes.map(c => "T>" + c)` and re-normalizing the original's irregular casings) and compared against the canonical extraction from the pre-refactor `pycode.py`:

> EQUIVALENCE OK: 101 brawlers, all direct lists byte-equivalent in order, all class sets equivalent after normalization, rarityOrder matches brawlers.js.

## Tests

```
$ npm test
✔ calculate returns the documented object shape
✔ rosters expose the expected 101 brawlers
✔ single-brawler matchup returns that brawler's direct counters in order
✔ alias resolution: primo → El Primo, miko → Mico, mike → Dynamike, barry → Berry
✔ case-insensitivity: 'penny', 'PENNY', 'Penny' behave identically
✔ empty and blank inputs are ignored; fewer than 3 real picks works
✔ doubleOverlaps: two picks sharing a direct counter list it once
✔ tripleOverlaps: three picks sharing a direct counter list it in triples
✔ REGRESSION: picks sharing only a class do not leak class tokens into overlaps
✔ results.counters contains only real brawler names (no class tokens)
✔ results.classes contains normalized singular class names
✔ unknown brawler name is handled gracefully (no throw, no entry)
✔ duplicate picks are ignored after the first
✔ result order follows successful-pick order
ℹ tests 14   ℹ pass 14   ℹ fail 0
```

## Manual QA checklist (run before deploying)

Serve with `python3 -m http.server -d docs 8000`.

- [ ] **All three pages load instantly.** No spinner, no Pyodide CDN request in DevTools → Network (filter for `pyodide` / `cdn.jsdelivr.net` — zero hits expected).
- [ ] **`index.html`:** click 3 brawler icons, click **Calculate**. Each row shows the subject's icon + its direct counters as real Brawl Stars icons (no broken-image cards).
- [ ] **FIFO eviction:** click 4 icons in sequence. The first one selected un-highlights when the 4th is clicked.
- [ ] **Toggle Rarity ↔ Alphabetical** (`#sortToggle`) — grid reorders; previously selected icons stay selected.
- [ ] **Icon size persists:** click S / M / L, reload the page — size is remembered.
- [ ] **Regression / class-marker leak:** select Penny, Jessie, and Mandy (or any three brawlers with the same class). Overlap rows must show real icons — **no card labeled "Thrower" or "T>Thrower"**.
- [ ] **`classic.html`:** retro yellow-button look unchanged. Sort toggle still in the upper-left; icon-grid background gray (`#545454`).
- [ ] **`texts.html`:** the 3 text fields with `<datalist>` autocomplete still work; counters render with white icon backgrounds (`#fff`). Direct typing and the **Go** button (Enter key, too) calculate correctly.
- [ ] **Aliases:** type `primo` (no caps, no space) into a text field — resolves to El Primo. Same for `miko`, `mike`, `barry`.
- [ ] **Feedback modal** (`index.html`) — open, close (X, backdrop click, Escape), submit (still posts to Formspree).
- [ ] **Mobile:** on a phone (or DevTools narrow viewport), the icon grid wraps, the feedback / classic-view buttons sit at the document bottom, and selected icons show the gold halo.
