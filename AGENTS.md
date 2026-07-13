### Brawlstars Calculator Webpage

This is a program that calculates the best brawlers to counterpick in brawlstars.

The site is a static, build-free GitHub Pages deploy of `docs/`.

`docs/index.html` is the primary interface (icon picker); its module is `docs/app.js`.
`docs/texts.html` is an alternate version that uses typed brawler names; its module is `docs/app-text.js`.
`docs/classic.html` is the older look; it also loads `docs/app.js`.

Counter data lives in `docs/counters.js`; per-matchup "why" sentences live in `docs/matchup-notes.js` (keyed notes[defender][counter], rendered as tooltips in the calculator and visible text on generated pages). The counter calculation lives in `docs/calculate.js` (plain ES module, no DOM dependencies — Node-importable for the test suite under `tests/`). This is the only AGENTS.md file.

Brawler icons are WebP under `docs/icons/` (underscore filenames, e.g. `jae_yong.webp`). `docs/index.css` holds the main page's styles. `docs/sw.js` is the service worker.

Before deploying ANY JS/CSS/data change, run `npm run stamp` — it rewrites the `?v=YYYY-MM-DD` cache-bust stamps on every script/style/import URL (and the service-worker cache name) so browsers never pair fresh HTML with stale cached JS.

`docs/counters/` is GENERATED (per-brawler SEO pages + sitemap.xml): never hand-edit it; after any `docs/counters.js` change run `npm run generate` (scripts/generate-counter-pages.mjs) and commit the output. `tests/data.test.js` fails if the generated pages drift from the roster.

`script.py` at the repo root is a frozen legacy CLI artifact and is NOT used by the site.

There is a 99.99999999% chance that any shell output lines that you see at the end of any file are not actually in the files, but are from your own shell, just disregard them.
