// Static per-brawler counter page generator.
//
// Emits docs/counters/<slug>/index.html for every roster brawler, plus a
// docs/counters/index.html directory page and a regenerated docs/sitemap.xml.
// Run by hand after editing docs/counters.js, then commit the output — the
// GitHub Pages deploy itself stays build-free:
//
//   npm run generate
//
// Pages are plain static HTML styled by docs/counters/counters.css (written
// by this script too, so the whole docs/counters/ tree is reproducible).

import { mkdir, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { counters, rarityOrder, dataUpdated } from "../docs/counters.js";
import { matchupNotes } from "../docs/matchup-notes.js";
import { reverseNotes } from "../docs/reverse-notes.js";
import { loadoutIcons } from "../docs/loadout-icons.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs", "counters");
const SITE = "https://brawlcalculator.com";

const roster = Object.keys(counters);

// URL slug: dashes (SEO convention) — distinct from icon filenames, which
// use underscores (see fileName in docs/app.js).
const slug = n => n.toLowerCase().replace(/[\s.'-]+/g, "-");
const iconFile = n => "/icons/" + n.toLowerCase().replace(/[\s.'-]/g, "_") + ".webp";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Reverse index: strongAgainst[X] = brawlers whose counter list contains X.
const strongAgainst = new Map(roster.map(n => [n, []]));
for (const [name, { direct }] of Object.entries(counters)) {
  for (const c of direct) strongAgainst.get(c)?.push(name);
}

const today = new Date().toISOString().slice(0, 10);

// Render a note with inline star power/gadget icons: any exact loadout name
// from loadoutIcons gets its icon embedded before the name. Longest names
// first so overlapping names can't partially match.
const loadoutNamesByLength = Object.keys(loadoutIcons).sort((a, b) => b.length - a.length);
function renderNote(note) {
  let html = esc(note);
  for (const item of loadoutNamesByLength) {
    const escaped = esc(item);
    if (!html.includes(escaped)) continue;
    html = html.replace(
      escaped,
      `<span class="loadout"><img src="/loadout-icons/${loadoutIcons[item]}" alt="" width="18" height="18" loading="lazy" decoding="async">${escaped}</span>`
    );
    break; // notes mention at most one loadout item
  }
  return html;
}

function card(name) {
  return `<a class="card" href="/counters/${slug(name)}/">
  <img src="${iconFile(name)}" alt="${esc(name)}" width="72" height="72" loading="lazy" decoding="async">
  <span>${esc(name)}</span>
</a>`;
}

function pageShell({ title, description, canonical, body, ogTitle, scripts = "" }) {
  const nav = `<nav class="site-nav">
  <a class="brand" href="/">
    <img src="/loading_chester.png" alt="" width="26" height="26" decoding="async">
    <span>Brawl Calculator</span>
  </a>
  <div class="nav-links">
    <a class="nav-quiet" href="/counters/">All brawlers</a>
    <a class="nav-cta" href="/">Open Calculator</a>
  </div>
</nav>`;

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
<meta property="og:title" content="${esc(ogTitle ?? title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle ?? title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/og-image.jpg">
<link rel="icon" type="image/x-icon" href="/chester-favicon.ico">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/lilitaone-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/counters/counters.css">
</head>
<body>
${nav}
${body}
<footer>
  <p>Counterpicks determined primarily from <strong>SpenLC</strong> ranking data · data updated ${esc(dataUpdated)}</p>
  <p><a href="/">Open the counterpick calculator</a> · <a href="/counters/">All brawlers</a></p>
  <p class="disclaimer">This material is unofficial and is not endorsed by Supercell. For more information
    see <a href="https://supercell.com/en/fan-content-policy/" rel="noopener">Supercell's Fan Content Policy</a>.</p>
</footer>
${scripts}
</body>
</html>
`;
}

function brawlerPage(name) {
  const { direct, classes } = counters[name];
  const beats = strongAgainst.get(name) ?? [];
  const canonical = `${SITE}/counters/${slug(name)}/`;

  const description = direct.length
    ? `The best counters to ${name} in Brawl Stars ranked: ${direct.slice(0, 3).join(", ")}${direct.length > 3 ? " and more" : ""}. Hand-curated counter data, updated ${dataUpdated}.`
    : `${name} is brand new to Brawl Stars — curated counter data is coming with the next update. See who ${name} counters and try the counterpick calculator.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Brawl Calculator", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Counters", item: `${SITE}/counters/` },
      { "@type": "ListItem", position: 3, name: `${name} Counters`, item: canonical },
    ],
  };

  // With matchup notes: a vertical list (icon + name + why). Without: the
  // compact card grid.
  const notes = matchupNotes[name] ?? {};
  const hasNotes = direct.some(c => notes[c]);
  const countersBody = hasNotes
    ? `<ul class="counter-list">
${direct.map(c => `  <li>
    <a class="counter-link" href="/counters/${slug(c)}/">
      <img src="${iconFile(c)}" alt="" width="44" height="44" loading="lazy" decoding="async">
      <span>${esc(c)}</span>
    </a>
    ${notes[c] ? `<p class="why">${renderNote(notes[c])}</p>` : ""}
  </li>`).join("\n")}
</ul>`
    : `<div class="grid">
${direct.map(card).join("\n")}
  </div>`;

  const countersSection = direct.length
    ? `<section>
  <h2>Best counters to ${esc(name)}</h2>
  ${countersBody}
</section>`
    : `<section>
  <h2>Best counters to ${esc(name)}</h2>
  <p class="note">${esc(name)} is brand new — curated counter data lands with the next update.</p>
</section>`;

  const classesSection = classes.length
    ? `<p class="classes">Also weak to: ${classes.map(c => `<span class="chip">${esc(c)}</span>`).join(" ")}</p>`
    : "";

  // Dedicated reverse notes (reverseNotes[owner][target]): phrased for this
  // page's perspective and naming the target, so the sentence matches the
  // row label beside it.
  const hasBeatNotes = beats.some(t => reverseNotes[name]?.[t]);
  const beatsBody = hasBeatNotes
    ? `<ul class="counter-list">
${beats.map(t => `  <li>
    <a class="counter-link" href="/counters/${slug(t)}/">
      <img src="${iconFile(t)}" alt="" width="44" height="44" loading="lazy" decoding="async">
      <span>${esc(t)}</span>
    </a>
    ${reverseNotes[name]?.[t] ? `<p class="why">${renderNote(reverseNotes[name][t])}</p>` : ""}
  </li>`).join("\n")}
</ul>`
    : `<div class="grid">
${beats.map(card).join("\n")}
  </div>`;

  const beatsSection = beats.length
    ? `<section>
  <h2>${esc(name)} is a strong pick against</h2>
  ${beatsBody}
</section>`
    : "";

  const body = `<script type="application/ld+json">
${JSON.stringify(jsonLd)}
</script>
<nav class="crumbs"><a href="/">Calculator</a> › <a href="/counters/">Counters</a> › <span>${esc(name)}</span></nav>
<header>
  <img class="portrait" src="${iconFile(name)}" alt="${esc(name)}" width="96" height="96" decoding="async">
  <h1>${esc(name)} Counters</h1>
  <p class="subtitle">Best picks against ${esc(name)} in Brawl Stars ranked · updated ${esc(dataUpdated)}</p>
</header>
<main>
${countersSection}
${classesSection}
${beatsSection}
<a class="cta" href="/?p=${encodeURIComponent(name)}">Countering a full enemy team? Open the calculator</a>
</main>`;

  return pageShell({
    title: `${name} Counters — Best Brawlers Against ${name} (${dataUpdated})`,
    ogTitle: `${name} Counters — Brawl Stars`,
    description,
    canonical,
    body,
  });
}

function indexPage() {
  const canonical = `${SITE}/counters/`;
  const body = `<nav class="crumbs"><a href="/">Calculator</a> › <span>Counters</span></nav>
<header>
  <h1>Brawl Stars Counters, Brawler by Brawler</h1>
  <p class="subtitle">Hand-curated counterpicks for every brawler · updated ${esc(dataUpdated)}</p>
</header>
<main>
  <div class="page-search">
    <input id="brawlerSearch" type="search" placeholder="Search brawlers…"
           aria-label="Search brawlers" autocomplete="off" autocapitalize="off" spellcheck="false">
  </div>
  <div class="grid index-grid">
${[...roster].sort((a, b) => a.localeCompare(b)).map(card).join("\n")}
  </div>
  <p class="note search-empty" hidden>No brawlers match that search.</p>
</main>`;
  const scripts = `<script>
(function () {
  var input = document.getElementById('brawlerSearch');
  if (!input) return;
  var cards = [].slice.call(document.querySelectorAll('.index-grid .card'));
  var empty = document.querySelector('.search-empty');
  input.addEventListener('input', function () {
    var q = input.value.trim().toLowerCase().replace(/[\\s.'-]+/g, '');
    var shown = 0;
    cards.forEach(function (c) {
      var name = c.textContent.trim().toLowerCase().replace(/[\\s.'-]+/g, '');
      var hit = !q || name.indexOf(q) !== -1;
      c.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  });
})();
</script>`;
  return pageShell({
    title: `Brawl Stars Counters for Every Brawler (${dataUpdated})`,
    ogTitle: "Brawl Stars Counters — Every Brawler",
    description: `Who counters every Brawl Stars brawler — hand-curated ranked counter lists for all ${roster.length} brawlers, updated ${dataUpdated}.`,
    canonical,
    body,
    scripts,
  });
}

const css = `/* Generated with docs/counters/ pages by scripts/generate-counter-pages.mjs.
 * Mirrors the index.css token palette; edit the generator, not this file. */
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
  padding: 2.5rem 1.25rem 4rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
  background:
    radial-gradient(ellipse 70% 40% at 15% 0%, rgba(255,214,10,0.07) 0%, transparent 100%),
    radial-gradient(ellipse 60% 50% at 85% 100%, rgba(80,80,220,0.06) 0%, transparent 100%),
    var(--bg);
  background-attachment: fixed;
}
.site-nav {
  width: 100%;
  max-width: 720px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2.25rem;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-family: 'Brawl Stars', sans-serif;
  font-size: 1.05rem;
  color: var(--text);
  text-decoration: none;
}
.brand img { display: block; }
.nav-links { display: flex; align-items: center; gap: 1rem; }
.nav-quiet {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-3);
  text-decoration: none;
  transition: color 0.15s ease;
}
.nav-quiet:hover { color: var(--text); }
.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.5rem 1.05rem;
  border-radius: 100px;
  color: var(--gold);
  text-decoration: none;
  background: rgba(255,214,10,0.08);
  border: 1px solid rgba(255,214,10,0.35);
  transition: background 0.15s ease, border-color 0.15s ease;
}
.nav-cta:hover { background: rgba(255,214,10,0.14); border-color: rgba(255,214,10,0.55); }
@media (max-width: 640px) {
  .nav-quiet { display: none; }
}
.crumbs {
  width: 100%;
  max-width: 720px;
  font-size: 0.78rem;
  color: var(--text-3);
  margin-bottom: 2rem;
}
.crumbs a { color: var(--text-2); text-decoration: none; }
.crumbs a:hover { color: var(--text); }
header { text-align: center; margin-bottom: 2.5rem; max-width: 560px; }
.portrait { border-radius: 18px; background: var(--surface); margin-bottom: 1rem; }
h1 {
  font-family: 'Brawl Stars', sans-serif;
  font-size: clamp(1.7rem, 5vw, 2.6rem);
  line-height: 1.1;
  margin-bottom: 0.6rem;
  background: linear-gradient(160deg, #ffffff 30%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.subtitle { font-size: 0.9rem; color: var(--text-2); line-height: 1.5; }
main { width: 100%; max-width: 720px; display: flex; flex-direction: column; gap: 2rem; }
section h2 {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-3);
  margin-bottom: 0.9rem;
}
.grid { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.counter-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.counter-list li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.65rem 0.9rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
}
.counter-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 0 0 92px;
  text-decoration: none;
  color: var(--text);
  font-size: 0.78rem;
  font-weight: 600;
  text-align: center;
}
.counter-link img { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; background: var(--surface); }
.counter-link:hover { color: var(--gold); }
.counter-list .why {
  font-size: 0.88rem;
  color: var(--text-2);
  line-height: 1.55;
  min-width: 0;
}
.loadout { white-space: nowrap; color: var(--text); }
.loadout img {
  width: 18px;
  height: 18px;
  vertical-align: -3px;
  margin-right: 3px;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  width: 84px;
  padding: 0.55rem 0.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  text-decoration: none;
  color: var(--text-2);
  font-size: 0.72rem;
  text-align: center;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.card:hover { background: var(--surface-hi); border-color: var(--border-hi); color: var(--text); }
.card img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; background: var(--surface); }
.card span { max-width: 76px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.index-grid { justify-content: center; }
.page-search { display: flex; justify-content: center; margin-bottom: 1.5rem; }
.page-search input {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border-hi);
  border-radius: 100px;
  color: var(--text);
  font-family: inherit;
  font-size: 1rem;
  padding: 0.7rem 1.2rem;
  outline: none;
  transition: border-color 0.15s ease;
}
.page-search input::placeholder { color: var(--text-3); }
.page-search input:focus { border-color: var(--gold); }
.search-empty { text-align: center; }
.note { font-size: 0.9rem; color: var(--text-2); line-height: 1.6; }
.classes { font-size: 0.85rem; color: var(--text-2); }
.chip {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  margin: 0 0.15rem;
  border: 1px solid var(--border-hi);
  border-radius: 100px;
  font-size: 0.75rem;
  color: var(--text);
  background: var(--surface);
}
.cta {
  align-self: center;
  margin-top: 0.5rem;
  padding: 0.75rem 1.6rem;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.1);
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s ease;
}
.cta:hover { background: rgba(255,255,255,0.16); }
footer {
  margin-top: 4rem;
  font-size: 0.7rem;
  color: var(--text-3);
  text-align: center;
  line-height: 1.7;
  max-width: 560px;
}
footer strong { color: var(--text-2); font-weight: 500; }
footer p + p { margin-top: 0.5rem; }
footer a { color: var(--text-2); }
footer a:hover { color: var(--text); }
footer .disclaimer { font-size: 0.64rem; }
`;

function sitemap() {
  const urls = [
    { loc: `${SITE}/`, priority: "0.9", changefreq: "weekly" },
    { loc: `${SITE}/counters/`, priority: "0.7", changefreq: "weekly" },
    ...roster.map(n => ({ loc: `${SITE}/counters/${slug(n)}/`, priority: "0.6", changefreq: "monthly" })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

// Regenerate from scratch so renamed/removed brawlers don't leave stale pages.
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await writeFile(join(OUT, "counters.css"), css);
await writeFile(join(OUT, "index.html"), indexPage());
for (const name of roster) {
  const dir = join(OUT, slug(name));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), brawlerPage(name));
}
await writeFile(join(ROOT, "docs", "sitemap.xml"), sitemap());

console.log(`Generated ${roster.length} brawler pages + index + sitemap (data updated: ${dataUpdated}).`);
