// Static generator for the maps feature: docs/maps/index.html (interactive
// browser: search-as-you-type, mode filter chips, URL state) plus one SEO
// page per map under docs/maps/<slug>/. Data source: docs/map-data.js.
//
//   npm run generate:maps
//
// Map images are hotlinked from the Brawlify CDN (explicitly permitted);
// mode icons and brawler icons are self-hosted.

import { mkdir, writeFile, rm, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { maps, modes, mapsUpdated } from "../docs/map-data.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "maps");
const SITE = "https://brawlcalculator.com";

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const brawlerIcon = n => "/icons/" + n.toLowerCase().replace(/[\s.'-]/g, "_") + ".webp";
const brawlerSlug = n => n.toLowerCase().replace(/[\s.'-]+/g, "-");

// Limited-time / niche modes collapse behind a "More modes" chip on the
// index and their cards hide from the default All view (still searchable
// and directly linkable). Confirmed with the site owner 2026-07-15.
const NICHE_MODES = new Set([
  "Present Plunder", "Love Bombing", "Hawkins Hunt", "Combat Cooking",
  "Food Fight", "Paint Brawl", "Spirit Wars", "Token Run", "Shadow Smash",
  "Super Ball", "Volley Brawl", "Dodgebrawl", "Subway Run", "Soul Collector",
  "Safe Blast", "Mecha Guard", "Upside Showdown", "Duo Mega Boss",
  "Treasure Hunt", "Loaded Showdown", "Loaded Duo Showdown",
  "Trio Wipeout", "Trio Gem Grab",
]);

const CONFIDENCE = {
  high:   { label: "Strong data",        blurb: "Backed by multiple competitive sources.",              cls: "conf-high" },
  medium: { label: "Decent data",        blurb: "Based on limited competitive sources.",                cls: "conf-med" },
  low:    { label: "Early estimates",    blurb: "Little map-specific data exists so far.",              cls: "conf-low" },
  none:   { label: "Not enough data",    blurb: "Not enough competitive data exists yet for this map.", cls: "conf-none" },
};

function nav(active) {
  return `<nav class="site-nav">
  <a class="brand" href="/">
    <img src="/loading_chester.png" alt="" width="26" height="26" decoding="async">
    <span>Brawl Calculator</span>
  </a>
  <div class="nav-links">
    <a class="nav-quiet${active === "maps" ? " nav-active" : ""}" href="/maps/">Maps</a>
    <a class="nav-quiet${active === "counters" ? " nav-active" : ""}" href="/counters/">Counters</a>
    <a class="nav-cta" href="/">Open Calculator</a>
  </div>
</nav>`;
}

function pageShell({ title, description, canonical, body, scripts = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="robots" content="index, follow">
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:site_name" content="Brawlstars Calculator">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/og-image.jpg">
<link rel="icon" type="image/x-icon" href="/chester-favicon.ico">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/lilitaone-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/maps/maps.css">
</head>
<body>
${body}
<footer>
  <p>Map picks researched from competitive sources · updated ${esc(mapsUpdated)}</p>
  <p><a href="/">Open the counterpick calculator</a> · <a href="/counters/">Counters by brawler</a> · <a href="/maps/">All maps</a></p>
  <p class="disclaimer">This material is unofficial and is not endorsed by Supercell. For more information
    see <a href="https://supercell.com/en/fan-content-policy/" rel="noopener">Supercell's Fan Content Policy</a>.</p>
</footer>
${scripts}
</body>
</html>
`;
}

function modeChip(m, { link = true } = {}) {
  const icon = m.icon ? `<img src="/mode-icons/${m.icon}" alt="" width="18" height="18" loading="lazy" decoding="async">` : "";
  const inner = `${icon}<span>${esc(m.name)}</span>`;
  return link
    ? `<a class="mode-tag" href="/maps/?mode=${m.slug}">${inner}</a>`
    : `<span class="mode-tag">${inner}</span>`;
}

function pickChip(name) {
  return `<a class="pick-chip-link" href="/counters/${brawlerSlug(name)}/">
    <img src="${brawlerIcon(name)}" alt="" width="34" height="34" loading="lazy" decoding="async">
    <span>${esc(name)}</span>
  </a>`;
}

// ── Per-map page ────────────────────────────────────────────────────────────
function mapPage(m) {
  const canonical = `${SITE}/maps/${m.slug}/`;
  const conf = CONFIDENCE[m.confidence] ?? CONFIDENCE.none;
  const modeMeta = modes.find(x => x.name === m.mode);
  const sNames = (m.picks.S ?? []).map(p => p.name);

  const description = m.confidence === "none"
    ? `${m.name} (${m.mode}) — not enough competitive data yet for reliable pick suggestions. Browse other Brawl Stars maps on Brawl Calculator.`
    : `Best brawlers for ${m.name} (${m.mode}) in Brawl Stars: ${sNames.slice(0, 3).join(", ")}${sNames.length > 3 ? " and more" : ""}. ${m.ranked ? "Plus the top bans for ranked drafts. " : ""}Updated ${mapsUpdated}.`;

  const tierSection = m.confidence === "none" ? `
<section class="no-data-block">
  <h2>Best brawlers</h2>
  <p class="note">${esc(conf.blurb)} Check back after this map has seen more competitive play — or open the
  <a href="/">counterpick calculator</a> to draft around your opponents instead.</p>
</section>` : `
<section>
  <h2>S tier — best picks</h2>
  <ul class="counter-list">
${(m.picks.S ?? []).map(p => `  <li>
    ${pickChip(p.name)}
    <p class="why">${esc(p.why ?? "")}</p>
  </li>`).join("\n")}
  </ul>
</section>
${(m.picks.A ?? []).length ? `<section>
  <h2>A tier — strong picks</h2>
  <div class="chip-row">${m.picks.A.map(pickChip).join("\n")}</div>
</section>` : ""}
${(m.picks.B ?? []).length ? `<section>
  <h2>B tier — solid picks</h2>
  <div class="chip-row">${m.picks.B.map(pickChip).join("\n")}</div>
</section>` : ""}
${m.ranked && (m.bans ?? []).length ? `<section>
  <h2>Best bans</h2>
  <ul class="counter-list">
${m.bans.map(b => `  <li>
    ${pickChip(b.name)}
    <p class="why">${esc(b.why ?? "")}</p>
  </li>`).join("\n")}
  </ul>
</section>` : ""}`;

  const body = `${nav("maps")}
<nav class="crumbs"><a href="/">Calculator</a> › <a href="/maps/">Maps</a> › <span>${esc(m.name)}</span></nav>
<header class="map-header">
  <img class="map-art" src="${m.image}" alt="${esc(m.name)} map layout" loading="eager" decoding="async">
  <div class="map-head-text">
    ${modeMeta ? modeChip(modeMeta) : ""}
    <h1>${esc(m.name)}</h1>
    <p class="subtitle">${m.summary ? esc(m.summary) : `Best brawlers for ${esc(m.name)} in ${esc(m.mode)}.`}</p>
    <p class="conf-badge ${conf.cls}" title="${esc(conf.blurb)}">${esc(conf.label)}</p>
  </div>
</header>
<main>
${tierSection}
<a class="cta" href="/">Drafting right now? Open the counterpick calculator</a>
</main>`;

  return pageShell({
    title: m.confidence === "none"
      ? `${m.name} (${m.mode}) — Brawl Stars Map`
      : `Best Brawlers for ${m.name} (${m.mode}) — Picks & Bans`,
    description,
    canonical,
    body,
  });
}

// ── Interactive index ───────────────────────────────────────────────────────
function mapsIndex() {
  const canonical = `${SITE}/maps/`;
  const researched = maps.filter(m => m.confidence !== "none").length;

  const standardModes = modes.filter(m => !NICHE_MODES.has(m.name));
  const nicheModes = modes.filter(m => NICHE_MODES.has(m.name));
  const standardCount = maps.filter(m => !NICHE_MODES.has(m.mode)).length;
  const nicheCount = maps.length - standardCount;

  const chip = (m, extra = "") => `  <button class="mode-chip${extra}" data-mode="${m.slug}">
    ${m.icon ? `<img src="/mode-icons/${m.icon}" alt="" width="18" height="18" loading="lazy" decoding="async">` : ""}
    ${esc(m.name)} <span class="count">${m.count}</span>
  </button>`;

  const chips = `<div class="mode-chips" id="modeChips">
  <button class="mode-chip active" data-mode="all">All <span class="count">${standardCount}</span></button>
${standardModes.map(m => chip(m)).join("\n")}
  <button class="mode-chip" id="nicheToggle" aria-expanded="false"
          title="Limited-time and event modes">More modes <span class="count">${nicheModes.length}</span></button>
${nicheModes.map(m => chip(m, " niche-chip")).join("\n")}
</div>`;

  const cards = maps.map(m => {
    const conf = CONFIDENCE[m.confidence] ?? CONFIDENCE.none;
    const modeMeta = modes.find(x => x.name === m.mode);
    return `  <a class="map-card" href="/maps/${m.slug}/" data-mode="${m.modeSlug}"
     data-niche="${NICHE_MODES.has(m.mode) ? "1" : "0"}"
     data-name="${esc(m.name.toLowerCase())}">
    <img src="${m.image}" alt="" loading="lazy" decoding="async">
    <div class="map-card-body">
      <h3>${esc(m.name)}</h3>
      <p class="map-card-mode">
        ${modeMeta?.icon ? `<img src="/mode-icons/${modeMeta.icon}" alt="" width="15" height="15" loading="lazy" decoding="async">` : ""}
        ${esc(m.mode)}
      </p>
      <span class="conf-dot ${conf.cls}" title="${esc(conf.label)}: ${esc(conf.blurb)}"></span>
    </div>
  </a>`;
  }).join("\n");

  const body = `${nav("maps")}
<nav class="crumbs"><a href="/">Calculator</a> › <span>Maps</span></nav>
<header>
  <h1>Best Brawlers by Map</h1>
  <p class="subtitle">Pick a map to see the strongest picks and bans · ${researched} of ${maps.length} maps researched · updated ${esc(mapsUpdated)}</p>
</header>
<main class="maps-main">
  <div class="page-search">
    <input id="mapSearch" type="search" placeholder="Search maps…"
           aria-label="Search maps" autocomplete="off" autocapitalize="off" spellcheck="false">
  </div>
${chips}
  <div class="map-grid" id="mapGrid">
${cards}
  </div>
  <p class="note search-empty" hidden>No maps match. Try a different search or mode.</p>
</main>`;

  const scripts = `<script>
(function () {
  var input = document.getElementById('mapSearch');
  var chips = [].slice.call(document.querySelectorAll('.mode-chip[data-mode]'));
  var cards = [].slice.call(document.querySelectorAll('.map-card'));
  var empty = document.querySelector('.search-empty');
  var nicheToggle = document.getElementById('nicheToggle');
  var mode = 'all';

  function apply(updateUrl) {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (c) {
      var modeHit = mode === 'all' ? (q ? true : c.dataset.niche === '0')
                                   : c.dataset.mode === mode;
      // In the All view, niche maps stay hidden while browsing but join
      // the results as soon as the user searches by name.
      var hit = modeHit && (!q || c.dataset.name.indexOf(q) !== -1);
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    if (empty) empty.hidden = shown > 0;
    if (updateUrl !== false) {
      var url = new URL(location.href);
      if (mode !== 'all') url.searchParams.set('mode', mode); else url.searchParams.delete('mode');
      if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    }
  }

  function expandNiche(open) {
    document.getElementById('modeChips').classList.toggle('niche-open', open);
    if (nicheToggle) {
      nicheToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nicheToggle.classList.toggle('active', open);
    }
  }

  if (nicheToggle) nicheToggle.addEventListener('click', function () {
    expandNiche(!document.getElementById('modeChips').classList.contains('niche-open'));
  });

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      mode = chip.dataset.mode;
      chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      apply();
    });
  });
  input.addEventListener('input', function () { apply(); });

  // Restore state from URL (?mode=&q=)
  var params = new URLSearchParams(location.search);
  var m0 = params.get('mode'), q0 = params.get('q');
  if (q0) input.value = q0;
  if (m0) {
    var chip = chips.filter(function (c) { return c.dataset.mode === m0; })[0];
    if (chip) {
      mode = m0;
      chips.forEach(function (c) { c.classList.toggle('active', c === chip); });
      if (chip.classList.contains('niche-chip')) expandNiche(true);
    }
  }
  apply(false);
})();
</script>`;

  return pageShell({
    title: `Best Brawlers for Every Map — Brawl Stars Picks & Bans (${mapsUpdated})`,
    description: `Best brawlers and bans for every Brawl Stars map, filterable by game mode — ${maps.length} maps with tiered picks researched from competitive data.`,
    canonical,
    body,
    scripts,
  });
}

// ── Stylesheet ──────────────────────────────────────────────────────────────
const css = `/* Generated with docs/maps/ pages by scripts/generate-map-pages.mjs.
 * Edit the generator, not this file. */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0c0c10;
  --surface: rgba(255,255,255,0.045);
  --surface-hi: rgba(255,255,255,0.075);
  --border: rgba(255,255,255,0.07);
  --border-hi: rgba(255,255,255,0.14);
  --gold: #ffd60a;
  --text: #f5f5f7;
  --text-2: rgba(245,245,247,0.48);
  --text-3: rgba(245,245,247,0.28);
}
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 1.25rem 4rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
  background:
    radial-gradient(ellipse 70% 40% at 15% 0%, rgba(255,214,10,0.07) 0%, transparent 100%),
    radial-gradient(ellipse 60% 50% at 85% 100%, rgba(80,80,220,0.06) 0%, transparent 100%),
    var(--bg);
  background-attachment: fixed;
}
.site-nav { width: 100%; max-width: 1080px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2.25rem; }
.brand { display: inline-flex; align-items: center; gap: 0.55rem; font-family: 'Brawl Stars', sans-serif; font-size: 1.05rem; color: var(--text); text-decoration: none; }
.brand img { display: block; }
.nav-links { display: flex; align-items: center; gap: 1rem; }
.nav-quiet { font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-3); text-decoration: none; transition: color 0.15s ease; }
.nav-quiet:hover { color: var(--text); }
.nav-active { color: var(--gold); }
.nav-cta { display: inline-flex; align-items: center; gap: 0.45rem; font-size: 0.82rem; font-weight: 700; white-space: nowrap; padding: 0.5rem 1.05rem; border-radius: 100px; color: var(--gold); text-decoration: none; background: rgba(255,214,10,0.08); border: 1px solid rgba(255,214,10,0.35); transition: background 0.15s ease, border-color 0.15s ease; }
.nav-cta:hover { background: rgba(255,214,10,0.14); border-color: rgba(255,214,10,0.55); }
.crumbs { width: 100%; max-width: 1080px; font-size: 0.78rem; color: var(--text-3); margin-bottom: 1.75rem; }
.crumbs a { color: var(--text-2); text-decoration: none; }
.crumbs a:hover { color: var(--text); }
header { text-align: center; margin-bottom: 2rem; max-width: 640px; }
h1 { font-family: 'Brawl Stars', sans-serif; font-size: clamp(1.6rem, 4.5vw, 2.4rem); line-height: 1.12; margin-bottom: 0.5rem;
  background: linear-gradient(160deg, #ffffff 30%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.subtitle { font-size: 0.92rem; color: var(--text-2); line-height: 1.55; text-wrap: balance; }
main, .maps-main { width: 100%; max-width: 1080px; display: flex; flex-direction: column; gap: 1.5rem; }
main { max-width: 760px; gap: 2rem; }
section h2 { font-size: 0.85rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-3); margin-bottom: 0.9rem; }
.note { font-size: 0.92rem; color: var(--text-2); line-height: 1.6; }
.note a { color: var(--text); }

/* search + chips */
.page-search { display: flex; justify-content: center; }
.page-search input { width: 100%; max-width: 460px; background: var(--surface); border: 1px solid var(--border-hi); border-radius: 100px; color: var(--text); font-family: inherit; font-size: 1rem; padding: 0.7rem 1.2rem; outline: none; transition: border-color 0.15s ease; }
.page-search input::placeholder { color: var(--text-3); }
.page-search input:focus { border-color: var(--gold); }
.mode-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
.mode-chip { display: inline-flex; align-items: center; gap: 0.35rem; font-family: inherit; font-size: 0.78rem; font-weight: 600; color: var(--text-2); background: var(--surface); border: 1px solid var(--border); border-radius: 100px; padding: 0.35rem 0.75rem; cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.mode-chip img { border-radius: 3px; }
.mode-chip .count { font-size: 0.68rem; color: var(--text-3); }
.mode-chip:hover { background: var(--surface-hi); color: var(--text); }
.mode-chip.active { border-color: var(--gold); background: rgba(255,214,10,0.1); color: var(--gold); }
.mode-chip.active .count { color: rgba(255,214,10,0.6); }
.niche-chip { display: none; }
.mode-chips.niche-open .niche-chip { display: inline-flex; }
#nicheToggle { border-style: dashed; }

/* map grid */
.map-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 0.8rem; }
.map-card { display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; text-decoration: none; color: var(--text); transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease; }
.map-card:hover { border-color: var(--border-hi); background: var(--surface-hi); transform: translateY(-2px); }
.map-card > img { width: 100%; height: 150px; object-fit: cover; object-position: top; background: #101016; }
.map-card-body { position: relative; padding: 0.6rem 0.75rem 0.7rem; }
.map-card h3 { font-size: 0.88rem; line-height: 1.25; margin-bottom: 0.2rem; padding-right: 14px; }
.map-card-mode { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; color: var(--text-3); }
.map-card-mode img { width: 15px; height: 15px; border-radius: 3px; }
.conf-dot { position: absolute; top: 0.7rem; right: 0.7rem; width: 9px; height: 9px; border-radius: 50%; }
.conf-high  { background: #4cd964; }
.conf-med   { background: var(--gold); }
.conf-low   { background: #ff9f43; }
.conf-none  { background: rgba(245,245,247,0.22); }
.search-empty { text-align: center; }

/* per-map page */
.map-header { display: flex; align-items: center; gap: 1.75rem; text-align: left; max-width: 760px; width: 100%; margin-bottom: 2rem; }
.map-art { width: 220px; max-height: 300px; object-fit: contain; border-radius: 14px; background: #101016; border: 1px solid var(--border); }
.map-head-text { display: flex; flex-direction: column; align-items: flex-start; gap: 0.55rem; min-width: 0; }
.map-head-text h1 { text-align: left; margin: 0; }
.map-head-text .subtitle { text-align: left; }
.mode-tag { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.74rem; font-weight: 600; color: var(--text-2); background: var(--surface); border: 1px solid var(--border-hi); border-radius: 100px; padding: 0.28rem 0.7rem; text-decoration: none; }
.mode-tag:hover { color: var(--text); }
.mode-tag img { border-radius: 3px; }
.conf-badge { display: inline-block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em; padding: 0.3rem 0.75rem; border-radius: 100px; color: #0c0c10; }
p.conf-none { color: var(--text); background: rgba(255,91,91,0.25); }

/* tiers */
.counter-list { list-style: none; display: flex; flex-direction: column; gap: 0.55rem; }
.counter-list li { display: flex; align-items: center; gap: 1rem; padding: 0.65rem 0.9rem; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; }
.pick-chip-link { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; flex: 0 0 84px; text-decoration: none; color: var(--text); font-size: 0.75rem; font-weight: 600; text-align: center; }
.pick-chip-link img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: var(--surface); }
.pick-chip-link:hover { color: var(--gold); }
.counter-list .why { font-size: 0.88rem; color: var(--text-2); line-height: 1.55; min-width: 0; }
.chip-row { display: flex; flex-wrap: wrap; gap: 0.65rem; }
.no-data-block .note { max-width: 560px; }
.cta { align-self: center; margin-top: 0.5rem; padding: 0.75rem 1.6rem; border-radius: 100px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.1); color: #fff; text-decoration: none; font-size: 0.9rem; font-weight: 600; transition: background 0.15s ease; }
.cta:hover { background: rgba(255,255,255,0.16); }

footer { margin-top: 4rem; font-size: 0.7rem; color: var(--text-3); text-align: center; line-height: 1.7; max-width: 560px; }
footer p + p { margin-top: 0.5rem; }
footer a { color: var(--text-2); }
footer a:hover { color: var(--text); }
footer .disclaimer { font-size: 0.64rem; }

@media (max-width: 640px) {
  .nav-quiet { display: inline; } /* keep Maps/Counters reachable on mobile */
  .brand span { display: none; }
  .map-header { flex-direction: column; text-align: center; }
  .map-head-text { align-items: center; }
  .map-head-text h1, .map-head-text .subtitle { text-align: center; }
  .map-art { width: 170px; }
  .map-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
}
`;

// ── Emit ────────────────────────────────────────────────────────────────────
// Wipe generated map dirs (keep nothing stale), then write everything.
try {
  for (const entry of await readdir(OUT, { withFileTypes: true })) {
    await rm(join(OUT, entry.name), { recursive: true, force: true });
  }
} catch { /* first run */ }
await mkdir(OUT, { recursive: true });

await writeFile(join(OUT, "maps.css"), css);
await writeFile(join(OUT, "index.html"), mapsIndex());
for (const m of maps) {
  const dir = join(OUT, m.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), mapPage(m));
}
console.log(`Generated ${maps.length} map pages + interactive index (updated: ${mapsUpdated}).`);
