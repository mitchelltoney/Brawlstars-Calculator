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

`docs/maps/` is GENERATED from `docs/map-data.js` (per-map picks/bans): never hand-edit the pages; edit map-data.js then run `npm run generate:maps` AND `npm run generate` (the latter owns sitemap.xml). Map images are hotlinked from the Brawlify CDN; mode icons live in `docs/mode-icons/`.

The site is in English, Spanish (es) and Brazilian Portuguese (pt, served as `pt-BR`). Calculator UI strings live in `docs/i18n.js` (EN/ES/PT toggle; `?lang=` > saved choice > browser language). The generated pages also exist under `docs/es/` and `docs/pt/` (same generators, same never-hand-edit rule), with hreflang alternates and sitemap entries. Their translated notes and map texts live in `docs/i18n/<lang>/` (keyed like the English files); page chrome lives in `scripts/lib/page-i18n.mjs`. Brawler, gadget, star power, map and mode names are never translated.

When you change `docs/matchup-notes.js`, `docs/reverse-notes.js` or the summaries/whys in `docs/map-data.js`, `tests/i18n-content.test.js` fails until the translations catch up: run `npm run i18n -- extract <dir>`, translate each chunk following `scripts/i18n/guide-<lang>.md` (check with `npm run i18n -- check <dir> <lang> <chunk>`), then run `npm run i18n -- merge <dir>`, `npm run generate:maps` and `npm run generate`. Until then, pages show the English sentence wherever a translation is missing or stale.

`script.py` at the repo root is a frozen legacy CLI artifact and is NOT used by the site.

There is a 99.99999999% chance that any shell output lines that you see at the end of any file are not actually in the files, but are from your own shell, just disregard them.
