# Matchup explanations: 566 per-pair "why" notes (Codex-assisted pipeline)

Every counter pair now has a one-sentence explanation of why the counter
works, in `docs/matchup-notes.js` (hand-editable).

Pipeline: kit grounding pack from the Brawlify API (descriptions, star
powers, gadgets for all 107 brawlers) → 21 self-contained batches → Codex
CLI workers (`codex exec`, web search enabled) wrote the notes → automated
validation (coverage 566/566, name integrity, length/style bounds,
banned-phrase and cross-contamination checks; zero errors) → full manual
read-through + loadout-name spot-checks against kit data (all real).

Rendering: visible sentence per counter on all 105 /counters/ pages
(counter-list rows) and hover tooltips on calculator result cards. New
data test guards note keys map to real pairs.

# Polish: balanced subtitle, nav icon, no arrows, wider icon hit areas

- Subtitle rewritten + `text-wrap: balance` (was three ragged lines).
- Nav brand uses the transparent Chester art (the flattened icon tile
  clashed with the gradient background).
- Arrow glyphs removed from the nav CTAs.
- Grid icons are now real `<button>` cells whose padding extends the
  clickable area into the gutters (Playwright-verified with an
  edge-of-cell click); also better semantics for keyboard/screen readers.
- `npm run stamp` now bumps a `.N` suffix for same-day redeploys.
- Added `<link rel="icon" sizes="192x192">` so Google has a hi-res
  favicon candidate for search results.

# UI/UX pass: site nav, ban-mode clarity, cache-skew fix (`revamp/2026-07-ux-perf-seo`)

Playwright-verified on desktop (1440×900) and mobile (390×844, DPR 3):
all flows exercised (bans, picks, tray, calculate, URL state), zero
console errors, 34 tests green.

- **Bans investigation**: the feature worked in a driven browser on both
  viewports — the reported "does nothing" was HTML/JS cache skew right
  after deploy (fresh index.html + stale cached app.js has no listener).
  Fixed structurally: all script/style/module-import URLs now carry a
  `?v=YYYY-MM-DD` stamp; `npm run stamp` rewrites every stamp (and the
  service-worker cache name) to today. **Run it before deploying any
  JS/CSS/data change.**
- **Ban-mode clarity**: active hint line ("Ban mode is on — tap
  brawlers…"), dashed red boundary around the grid, and tapping a banned
  brawler outside ban mode now unbans it.
- **Site nav** on the calculator and all 105 generated pages: brand +
  gold "Counters by Brawler" CTA (was a buried footer link) + Classic
  view; floating classic-view pill removed.
- **Layout polish**: add-by-name input moved above the grid; dead space
  tightened (body/footer margins); subtitle to 16px on mobile;
  touch-action: manipulation on tap targets; larger chip-remove hit
  areas; nav collapses gracefully on mobile.

# Data: first counter lists for Damian, Starr Nova, Bolt, Nori (`revamp/2026-07-ux-perf-seo`)

Researched via Exa web search (~299 sources reviewed across 4 parallel
research agents; sources: PL Prodigy, noff.gg, the Brawl Stars wiki
countered-by sections, lootbar/clutchpoints/sportsdunia guides). Lists
keep only roster-valid names with explicit "counters/beats X" claims,
ordered by cross-source consensus:

- **Damian**: Cordelius, Colette, Piper, Gale, Belle, Chester, Stu ·
  classes: Anti-Tank, Sniper. (Cordelius/Colette/Piper each 3+ sources.)
- **Starr Nova**: Damian, Crow, Otis, Piper, Frank, Buster, Ash ·
  classes: Tank.
- **Bolt**: Gale, Piper, Mandy, Colette, Charlie, Willow · classes:
  Sniper, Knockback. (Gale is the only 2-source counter; rest are
  single-source — revisit in 2–4 weeks when stat sites catch up.)
- **Nori**: Bull, Otis, Chester, Shelly, Gale, Darryl, Frank, Buzz ·
  classes: Tank, Knockback. (Wiki countered-by + day-one guides; he is
  2 days old — expect churn.)

Pages/sitemap regenerated (`npm run generate`); all 34 tests pass.

# July 2026 revamp: fixes, roster, perf, UX, PWA, SEO pages (`revamp/2026-07-ux-perf-seo`)

One branch, eight commits, no behavior-breaking changes to the calculation
core (25 pre-existing tests untouched and passing; 7 new suite files/cases
added on top).

## Bug fixes
- The document-level Enter shortcut no longer hijacks Enter inside the
  feedback modal, form controls, links, or grid icons.
- `alert()` validation replaced with an inline hint under Calculate.
- Removed the permanently-pulsing "UI Update!" badge.
- Deleted unused `icons/green.png` (1 MB) and duplicate `jaeyong.png`.

## Roster / data
- **Nori added** (Legendary, live 2026-07-09), icon from the Brawlify CDN,
  counter list empty pending curation (renders a "brand new" note, not a
  blank row). Same note for Bolt, Damian, Starr Nova.
- **Damien → Damian**, **Jae Yong → Jae-Yong** (official spellings); old
  spellings still resolve via alias; name lookup is now
  punctuation-insensitive ("8-bit", "mr. p", "jae y").
- New `dataUpdated` export in `counters.js` drives the visible freshness
  stamp in the footer and on generated pages.

## Performance
- All brawler icons resized (≤176px) and converted to WebP: icon payload
  3.2 MB → 844 KB. Grid lazy-loads with async decode.
- Lilita One self-hosted as latin WOFF2 (10.7 KB) with `font-display:
  swap` + preload; unused "Brawl Stars Bold" face and nougat TTF removed.
- index.html's 655-line inline stylesheet extracted to cacheable
  `index.css`.

## UX
- Pick tray (chips with remove buttons, Clear, n/3 count).
- Results re-render live after the first calculation; Calculate
  smooth-scrolls to results.
- Grid icons keyboard-accessible (tab, Enter/Space, `aria-pressed`);
  feedback modal traps focus and restores it on close.
- Picks encoded in the URL (`?p=Frank,Piper`) — shareable, restored on
  load.
- Curated class weaknesses now rendered ("Also weak to: Thrower").
- **Ban mode**: mark up to 6 bans (ranked draft rules); banned brawlers
  grey out, can't be picked, and are filtered from results with a count.

## Compliance / meta / PWA
- Supercell Fan Content Policy disclaimer on all pages (policy
  requirement).
- Open Graph/Twitter cards with a branded og-image; apple-touch-icon;
  web manifest + service worker (installable, offline-capable;
  cache-first icons/fonts, network-first code).

## SEO
- `npm run generate` (scripts/generate-counter-pages.mjs) emits 105
  static per-brawler pages under `docs/counters/<slug>/` (best counters,
  reverse "strong against" index, class chips, calculator deep-link,
  breadcrumb JSON-LD), a `/counters/` directory page, and a full
  `sitemap.xml`. Output is committed; the deploy stays build-free.
  **Rerun after every counters.js edit** — `tests/data.test.js` fails
  loudly if pages/sitemap drift from the roster.

# Data: meta-counter merge for 87 brawlers (`feature/meta-counter-merge-2`)

Data-only edit. Second meta-counter pass — this time **UNION**ed with the
existing lists per row (not replace). For each brawler the new entries are
placed first in the given strength order, followed by any pre-existing
entries not already present. Same merge rule for `classes`.

## Effective changes (74 of 87 rows)
74 brawlers had their `direct` and/or `classes` change. The full
before→after diff lives in the commit message; full list of changed
brawlers: 8bit, Amber, Ash, Bea, Bibi, Bo, Bonnie, Buster, Byron, Charlie,
Chester, Chuck, Clancy, Colette, Colt, Crow, Dynamike, Edgar, Emz, Eve,
Fang, Frank, Gale, Gene, Gray, Griff, Grom, Gus, Hank, Jacky, Janet,
Jessie, Juju, Kenji, Kit, Larry, Leon, Lily, Lola, Lou, Maisie, Mandy,
Max, Meeple, Meg, Melodie, Mico, Moe, Mortis, Mr P, Nani, Nita, Otis, Pam,
Pearl, Penny, Piper, Poco, RT, Rico, Rosa, Ruffs, Sam, Sandy, Shade,
Shelly, Spike, Sprout, Squeak, Stu, Surge, Tara, Tick, Willow.

## Merged but no effective change (13 of 87)
The new data was already fully covered by the existing lists; these rows
are **byte-identical to main**: Angelo, Barley, Belle, Berry, Brock,
Bull, Buzz, Carl, Cordelius, Darryl, Doug, Draco, El Primo.

## New class categories
Two tags joined the class vocabulary:
- **Spawner** — Clancy, Gale, Gene, Max, Stu, Surge.
- **Knockback** — Bibi, Gus.
(Existing categories preserved: Anti-Tank, Assassin, Healer, Sniper, Tank, Thrower, Wallbreaker.)

## Spelling reconciliations
- **`Primo` → `El Primo`** in Fang and Juju (per `resolveName` alias).
- **`8Bit` → `8bit`** in Pam and Pearl. This is a pre-existing data inconsistency (those rows had the capital-B form while the roster key is lowercase `8bit`). The merge-time dedupe would otherwise have produced two distinct items (`8bit` and `8Bit`) in Pam's list, so the merge script canonicalizes all `direct` entries through a case-insensitive lookup against the roster keys. The fix is consistent with the prompt's "store the roster's spelling" rule and surfaced only because these rows were touched.

## ANOMALY-note resolutions (notes won where they conflicted with the data block)
- **Mortis**: `direct: [Jacky, Shade, Bull, Shelly, Gale]` (not the truncated `[Edgar, Bibi]`).
- **Shade**: `direct: [Lou, Jacky]`, `classes: [Tank]` (not the data-block line `[Nita, Spike, Penny]` / `classes: [—]`).
- **Surge**: `direct: [Spike]`, `classes: [Thrower, Spawner]` (not the data-block line `[Janet]` / `classes: [—]`).
- **Pearl**: `direct: [Jessie, Kenji, Bo]` — the source's `"Jessie (same as)"` annotation was dropped.

## Untouched data and tests
- All 17 brawlers absent from the data block (Alli, Bolt, Damien, Finx, Gigi, Glowy, Jae Yong, Kaze, Lumi, Mina, Najia, Ollie, Pierce, Sirius, Starr Nova, Trunk, Ziggy) are **byte-identical to main**.
- Roster size unchanged at 104; alphabetical and rarity sets still match.
- Two test assertions were updated because they reference touched brawlers' specific lists:
  - "single-brawler matchup ... Shelly" — now expects merged `["Squeak","Carl","Piper","Stu","Nita","Spike","Penny"]` + `classes: ["Thrower"]`.
  - "results.classes ... Stu" — now expects `["Thrower","Spawner","Healer","Sniper"]`.
- 25/25 tests pass.

## Deviations from the prompt
- **`8Bit` → `8bit` normalization** in Pam and Pearl was not explicitly asked for, but is necessary to avoid the merge producing both `8bit` and `8Bit` as separate items in Pam's list. Documented here per the deviation-disclosure rule. If you'd rather preserve the capital-B form, revert just those two rows and we can dedupe case-insensitively instead.

---

# Data: meta-counter update for 15 brawlers

Data-only edit (no behavior change). 15 brawlers' `direct` lists were
**replaced** (not merged) with the user-supplied meta tier-list data. The
ordering inside each `direct` array is meaningful — strongest counter
first — and matches the source verbatim.

## Replaced direct lists (old → new)

| Brawler | Old | New |
|---|---|---|
| Dynamike | Mico, Mortis, Kenji, Edgar, Darryl | **Edgar, Colette, Chester, Otis** |
| Edgar    | Surge, Doug, Jacky, Shelly | **Chester, Otis, Shelly, Griff, Bull, Stu** |
| Colette  | Belle, Stu, Bea, Griff, Jessie | **Crow, Charlie, Ruffs, Meeple, Griff** |
| Meeple   | Kenji, Frank, Ash | **Ruffs, Charlie, Lily, Squeak, Spike** |
| Mortis   | Jacky, Shade, Bull, Gale, Shelly | **Shelly, Otis, Chester, Bull, Crow** |
| Otis     | Barley, Juju, Larry, Stu, Amber | **Ruffs, Chester, Poco, Alli** |
| Lou      | Belle, Bea, Bo, Poco | **Mortis, Kenji, Edgar, Lily, Nita** |
| Nita     | Barley, Juju, Larry, Spike, Griff | **Mortis, Colette, Poco, Kenji, Lily** |
| Chester  | Janet, Amber, Stu, Gale | **Ruffs, Meeple, Emz, Charlie** |
| Crow     | Piper, Spike | **Rosa, Gus, Byron, Piper, Charlie** |
| Leon     | Crow, Stu, Pearl | **Crow, Chester, Charlie, Emz, Mortis** |
| Piper    | Nani, Tick, Kit, Kenji | **Ruffs, Charlie, Nani, Gene, Nita** |
| Sirius   | Buster, Leon, Buzz, Penny, Edgar | **Penny, Mortis, Amber, Lou** |
| Mina     | Bea, Bonnie, Finx, Shelly | **Kenji, Mortis, Stu, Shade, Meeple** |
| Griff    | Lola, Stu, Bea | **Stu, Ruffs, Chester, Meeple, Max** |

## Class changes
- **Sirius**: `classes: [] → ["Thrower"]`. (Lou's `["Thrower"]` and Crow's `["Tank"]` were preserved unchanged.)

## Spelling reconciliations
The source's spellings were normalized to canonical roster keys:
- **`Meepo` → `Meeple`** — appeared as the key for the 4th row and in the counter lists for Colette, Chester, Mina, and Griff. Brawl Stars has no brawler named "Meepo"; this is the existing Meeple.
- **`Ali` → `Alli`** (in Otis's list) — roster key has the double-l.
- The prompt also flagged a historical `Sirus → Sirius` correction; the data block in the prompt already used the canonical `Sirius`, so no further fix was needed there.

## Mechanism notes dropped
Per the product decision: source annotations like "(best)" / "(soft)" / "via super" / "gadget" were stripped — counter strength is now encoded by array order only.

## Untouched data and tests
- All 89 other brawlers' `direct` and `classes` are **byte-identical to main** (verified by diffing against `main:docs/counters.js`).
- Roster size still 104; alphabetical and rarity rosters still cover the same set.
- 25/25 tests pass without modification. None of the existing assertions reference the 15 changed lists (the regression and overlap tests use Shelly, Penny+Jessie+Mandy, and Cordelius+Doug+Draco — all untouched).

---

# Feature: add a brawler by typing its name (`feature/add-brawler-by-name`)

A second way to fill the 3-slot pick queue on `docs/index.html`: a small input + Add button placed directly above the Calculate button, with a custom autocomplete dropdown sourced from the canonical roster. Confirm with Enter, click on a suggestion, or click Add. The icon picker is untouched.

## Autocomplete behavior

- The suggestion list is empty until the user starts typing. (Native `<datalist>` shows the full roster on focus in some browsers, which is what the user wants to avoid.)
- Filtering is strict case-insensitive **prefix** match (not substring), in roster order. So typing `b` or `B` lists only brawlers whose name starts with B.
- Keyboard: `ArrowDown` / `ArrowUp` highlight a row; `Enter` confirms; `Escape` closes.
- Click on a row adds that brawler immediately.
- **Unique-prefix expansion:** if no exact / alias match is found, but exactly one roster brawler starts with what was typed, that brawler is added. So `Br` → Brock, `Pen` → Penny, `el p` → El Primo. Ambiguous prefixes (`Bo` → Bo + Bonnie) flash invalid; the user can either disambiguate by typing more, or arrow-navigate the suggestion list.

## What's shared (single source of truth)
- `docs/calculate.js` now exports two pure pick-queue helpers:
  - `addPick(picks, name) → picks` — additive; no-op if already present; FIFO-evicts the oldest at `MAX_PICKS` (3).
  - `togglePick(picks, name) → picks` — remove if present, otherwise `addPick`.
- Both helpers return new arrays; `MAX_PICKS` and `resolveName` are also exported.
- `docs/app.js` was refactored: the icon click handler and the text input both call a single `applyPicks(next)` that diffs against the current `picks` array and toggles `.selected` accordingly. There is only one picks array and one set of grid highlights.

## Text-input behavior
- Resolves the typed string through the same `resolveName` the counter calculation uses (case-insensitive direct match + `primo` / `miko` / `mike` / `barry` aliases), and falls back to `resolveUniquePrefix` if that returns null. So `primo` adds El Primo, `PENNY` adds Penny, `Br` adds Brock.
- Additive only: typing the name of an already-selected brawler is a no-op (does *not* deselect — that would be surprising for an "Add" field).
- Unknown name: brief red-border + shake on the input; nothing added; user can keep typing.
- On a successful add, the input clears.
- Enter inside the field is handled locally (`preventDefault` + `stopPropagation`) so it cannot reach the global Enter→Calculate handler.
- No `<form>` — no submit-reload risk.
- No auto-add while mid-type. The user must press Enter or click Add. (A literal exact-match like `Bo` would otherwise be mis-added while the user is typing toward `Bonnie`.)

## Tests
`tests/calculate.test.js` adds coverage for `addPick`, `togglePick`, `resolveName`, and `MAX_PICKS`:

```
$ npm test
ℹ tests 23   ℹ pass 23   ℹ fail 0
```

## Manual QA checklist
- Type `Shelly` + Enter → grid icon highlights, input clears.
- Click two icons, then type a third → all three selected; Calculate works.
- Type a 4th name → oldest pick un-highlights (FIFO), exactly like clicking a 4th icon.
- Type an already-selected brawler → no change.
- Aliases: `primo`, `miko`, `mike`, `barry` resolve.
- Case-insensitive: `penny` / `PENNY` behave the same.
- Invalid: `asdf` + Enter → red shake, nothing added.
- Mix clicking and typing → highlights stay consistent.
- Enter in the field does not trigger Calculate; page never reloads.
- Mobile: datalist suggestions appear; Add button tappable.

---

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
