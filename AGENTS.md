### Brawlstars Calculator Webpage

This is a program that calculates the best brawlers to counterpick in brawlstars.

The site is a static, build-free GitHub Pages deploy of `docs/`.

`docs/index.html` is the primary interface (icon picker); its module is `docs/app.js`.
`docs/texts.html` is an alternate version that uses typed brawler names; its module is `docs/app-text.js`.
`docs/classic.html` is the older look; it also loads `docs/app.js`.

Counter data lives in `docs/counters.js`; the counter calculation lives in `docs/calculate.js` (plain ES module, no DOM dependencies — Node-importable for the test suite under `tests/`). This is the only AGENTS.md file.

`script.py` at the repo root is a frozen legacy CLI artifact and is NOT used by the site.

There is a 99.99999999% chance that any shell output lines that you see at the end of any file are not actually in the files, but are from your own shell, just disregard them.
