// Static per-brawler counter page generator.
//
// Emits docs/counters/<slug>/index.html for every roster brawler, plus a
// docs/counters/index.html directory page, the same tree translated under
// docs/es/counters/ and docs/pt/counters/ (texts from docs/i18n/<lang>/, see
// scripts/i18n-content.mjs), and a regenerated docs/sitemap.xml with hreflang
// alternates for every page.
// Run by hand after editing docs/counters.js, then commit the output — the
// GitHub Pages deploy itself stays build-free:
//
//   npm run generate
//
// Pages are plain static HTML styled by docs/counters/counters.css (written
// by this script too, so the whole docs/counters/ tree is reproducible).

import { mkdir, writeFile, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { counters, rarityOrder, dataUpdated } from "../docs/counters.js";
import { matchupNotes } from "../docs/matchup-notes.js";
import { reverseNotes } from "../docs/reverse-notes.js";
import { loadoutIcons } from "../docs/loadout-icons.js";
import { maps as siteMaps } from "../docs/map-data.js";
import {
  PAGE_LANGS, SITE, HTML_LANG, pageText, localPath, calcHref, hreflangLinks,
  langSwitch, disclaimerHtml, formatMonthYear, translateClass, topList, langSwitchCss,
} from "./lib/page-i18n.mjs";
import { localizedContent } from "./lib/content-i18n.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = lang => join(ROOT, "docs", ...(lang === "en" ? [] : [lang]), "counters");

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

function card(name, lang) {
  return `<a class="card" href="${localPath(lang, `/counters/${slug(name)}/`)}">
  <img src="${iconFile(name)}" alt="${esc(name)}" width="72" height="72" loading="lazy" decoding="async">
  <span>${esc(name)}</span>
</a>`;
}

function pageShell({ lang, path, title, description, body, ogTitle, scripts = "" }) {
  const T = pageText[lang];
  const canonical = SITE + localPath(lang, path);
  const nav = `<nav class="site-nav">
  <a class="brand" href="${calcHref(lang)}">
    <img src="/loading_chester.png" alt="" width="26" height="26" decoding="async">
    <span>Brawl Calculator</span>
  </a>
  <div class="nav-links">
    <a class="nav-quiet" href="${localPath(lang, "/maps/")}">${T.navMaps}</a>
    <a class="nav-quiet" href="${localPath(lang, "/counters/")}">${T.navAllBrawlers}</a>
    <a class="nav-cta" href="${calcHref(lang)}">${T.navOpenCalc}</a>
  </div>
</nav>`;

  return `<!DOCTYPE html>
<html lang="${HTML_LANG[lang]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="robots" content="index, follow">
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${hreflangLinks(path)}
<meta property="og:site_name" content="Brawlstars Calculator">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(ogTitle ?? title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE}/share-wide.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(ogTitle ?? title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${SITE}/share-wide.jpg">
<link rel="icon" type="image/x-icon" href="/chester-favicon.ico">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/lilitaone-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${stylesHash}">
<link rel="stylesheet" href="/counters/counters.css?v=${cssHash}">
</head>
<body>
${nav}
${body.replace("<!--lang-switch-->", langSwitch(lang, path))}
<footer>
  <p>${T.countersFooterSource(esc(formatMonthYear(dataUpdated, lang)))}</p>
  <p><a href="${calcHref(lang)}">${T.footerOpenCalc}</a> · <a href="${localPath(lang, "/counters/")}">${T.navAllBrawlers}</a></p>
  <p class="disclaimer">${disclaimerHtml(lang)}</p>
</footer>
${scripts}
</body>
</html>
`;
}

function brawlerPage(name, lang, text) {
  const T = pageText[lang];
  const L = p => localPath(lang, p);
  const date = formatMonthYear(dataUpdated, lang);
  const { direct, classes } = counters[name];
  const beats = strongAgainst.get(name) ?? [];
  const path = `/counters/${slug(name)}/`;
  const canonical = SITE + L(path);

  const description = direct.length
    ? T.counterDescription(name, topList(lang, direct), date)
    : T.counterDescriptionNew(name);

  const jsonLd = [{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Brawl Calculator", item: SITE + calcHref(lang) },
      { "@type": "ListItem", position: 2, name: T.crumbCounters, item: SITE + L("/counters/") },
      { "@type": "ListItem", position: 3, name: T.counterCrumb(name), item: canonical },
    ],
  }];
  if (direct.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: T.counterItemList(name),
      itemListElement: direct.map((c, i) =>
        ({ "@type": "ListItem", position: i + 1, name: c, url: SITE + L(`/counters/${slug(c)}/`) })),
    });
  }

  // "Strong maps" cross-links, computed from the maps research: ranked-mode
  // maps (high/medium confidence) where this brawler sits in S or A tier.
  const strongMaps = siteMaps
    .filter(m => m.ranked && (m.confidence === "high" || m.confidence === "medium"))
    .map(m => {
      const inS = (m.picks.S ?? []).some(p => p.name === name);
      const inA = !inS && (m.picks.A ?? []).includes(name);
      return inS || inA ? { m, score: (inS ? 2 : 1) + (m.confidence === "high" ? 0.5 : 0) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(x => x.m);

  const strongMapsSection = strongMaps.length
    ? `<section>
  <h2>${esc(T.strongMaps(name))}</h2>
  <div class="chip-row map-links">
${strongMaps.map(m => `    <a class="map-link" href="${L(`/maps/${m.slug}/`)}">${esc(m.name)} <span>${esc(m.mode)}</span></a>`).join("\n")}
  </div>
</section>`
    : "";

  // With matchup notes: a vertical list (icon + name + why). Without: the
  // compact card grid.
  const notes = matchupNotes[name] ?? {};
  const hasNotes = direct.some(c => notes[c]);
  const countersBody = hasNotes
    ? `<ul class="counter-list">
${direct.map(c => `  <li>
    <a class="counter-link" href="${L(`/counters/${slug(c)}/`)}">
      <img src="${iconFile(c)}" alt="" width="44" height="44" loading="lazy" decoding="async">
      <span>${esc(c)}</span>
    </a>
    ${notes[c] ? `<p class="why">${renderNote(text(`m|${name}|${c}`))}</p>` : ""}
  </li>`).join("\n")}
</ul>`
    : `<div class="grid">
${direct.map(c => card(c, lang)).join("\n")}
  </div>`;

  const countersSection = direct.length
    ? `<section>
  <h2>${esc(T.bestCounters(name))}</h2>
  ${countersBody}
</section>`
    : `<section>
  <h2>${esc(T.bestCounters(name))}</h2>
  <p class="note">${esc(T.brandNew(name))}</p>
</section>`;

  const classesSection = classes.length
    ? `<p class="classes">${T.alsoWeakTo} ${classes.map(c => `<span class="chip">${esc(translateClass(lang, c))}</span>`).join(" ")}</p>`
    : "";

  // Dedicated reverse notes (reverseNotes[owner][target]): phrased for this
  // page's perspective and naming the target, so the sentence matches the
  // row label beside it.
  const hasBeatNotes = beats.some(t => reverseNotes[name]?.[t]);
  const beatsBody = hasBeatNotes
    ? `<ul class="counter-list">
${beats.map(t => `  <li>
    <a class="counter-link" href="${L(`/counters/${slug(t)}/`)}">
      <img src="${iconFile(t)}" alt="" width="44" height="44" loading="lazy" decoding="async">
      <span>${esc(t)}</span>
    </a>
    ${reverseNotes[name]?.[t] ? `<p class="why">${renderNote(text(`r|${name}|${t}`))}</p>` : ""}
  </li>`).join("\n")}
</ul>`
    : `<div class="grid">
${beats.map(t => card(t, lang)).join("\n")}
  </div>`;

  const beatsSection = beats.length
    ? `<section>
  <h2>${esc(T.strongAgainst(name))}</h2>
  ${beatsBody}
</section>`
    : "";

  const body = `<script type="application/ld+json">
${JSON.stringify(jsonLd)}
</script>
<div class="crumbs-row">
<nav class="crumbs"><a href="${calcHref(lang)}">${T.crumbCalc}</a> › <a href="${L("/counters/")}">${T.crumbCounters}</a> › <span>${esc(name)}</span></nav>
<!--lang-switch-->
</div>
<header>
  <img class="portrait" src="${iconFile(name)}" alt="${esc(name)}" width="96" height="96" decoding="async">
  <h1>${esc(T.counterH1(name))}</h1>
  <p class="subtitle">${esc(T.counterSubtitle(name, date))}</p>
</header>
<main>
${countersSection}
${classesSection}
${beatsSection}
${strongMapsSection}
<a class="cta" href="${esc(calcHref(lang, name))}">${T.counterCta}</a>
</main>`;

  return pageShell({
    lang,
    path,
    title: T.counterTitle(name, date),
    ogTitle: T.counterOgTitle(name),
    description,
    body,
  });
}

function indexPage(lang) {
  const T = pageText[lang];
  const date = formatMonthYear(dataUpdated, lang);
  const body = `<div class="crumbs-row">
<nav class="crumbs"><a href="${calcHref(lang)}">${T.crumbCalc}</a> › <span>${T.crumbCounters}</span></nav>
<!--lang-switch-->
</div>
<header>
  <h1>${esc(T.indexH1)}</h1>
  <p class="subtitle">${esc(T.indexSubtitle(date))}</p>
</header>
<main>
  <div class="page-search">
    <input id="brawlerSearch" type="search" placeholder="${esc(T.searchBrawlers)}"
           aria-label="${esc(T.searchBrawlersLabel)}" autocomplete="off" autocapitalize="off" spellcheck="false">
  </div>
  <div class="grid index-grid">
${[...roster].sort((a, b) => a.localeCompare(b)).map(n => card(n, lang)).join("\n")}
  </div>
  <p class="note search-empty" hidden>${esc(T.noBrawlerMatch)}</p>
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
    lang,
    path: "/counters/",
    title: T.indexTitle(date),
    ogTitle: T.indexOgTitle,
    description: T.indexDescription(roster.length, date),
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
.crumbs-row { max-width: 720px; margin-bottom: 2rem; }
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
.map-links { gap: 0.5rem; }
.map-link {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  background: var(--surface);
  border: 1px solid var(--border-hi);
  border-radius: 100px;
  padding: 0.4rem 0.9rem;
  transition: border-color 0.15s ease, color 0.15s ease;
}
.map-link span { font-size: 0.68rem; color: var(--text-3); font-weight: 500; }
.map-link:hover { border-color: var(--gold); color: var(--gold); }
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
${langSwitchCss}`;

// Content-hash cache busters so stylesheet changes are visible immediately
// (GitHub Pages otherwise serves stale CSS for up to 10 minutes).
const hash8 = s => createHash("sha1").update(s).digest("hex").slice(0, 8);
const cssHash = hash8(css);
const stylesHash = hash8(readFileSync(join(ROOT, "docs", "styles.css"), "utf8"));

// Every generated page exists in each PAGE_LANGS language; each <url> lists
// its siblings as xhtml:link alternates. The calculator home localizes
// client-side, so it has a single entry.
function sitemap() {
  const pages = [
    { path: "/counters/", priority: "0.7", changefreq: "weekly" },
    { path: "/maps/", priority: "0.7", changefreq: "weekly" },
    ...roster.map(n => ({ path: `/counters/${slug(n)}/`, priority: "0.6", changefreq: "monthly" })),
    ...siteMaps.map(m => ({ path: `/maps/${m.slug}/`, priority: "0.5", changefreq: "monthly" })),
  ];
  const urls = [
    { loc: `${SITE}/`, priority: "0.9", changefreq: "weekly", alternates: [] },
    ...PAGE_LANGS.flatMap(lang => pages.map(p => ({
      loc: SITE + localPath(lang, p.path),
      priority: p.priority,
      changefreq: p.changefreq,
      alternates: [
        ...PAGE_LANGS.map(l => [HTML_LANG[l], SITE + localPath(l, p.path)]),
        ["x-default", SITE + p.path],
      ],
    }))),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
${u.alternates.map(([hl, href]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${href}"/>\n`).join("")}    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

// Regenerate from scratch so renamed/removed brawlers don't leave stale pages.
for (const lang of PAGE_LANGS) {
  const out = outDir(lang);
  const text = await localizedContent(lang);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  // One shared stylesheet: every language's pages link /counters/counters.css.
  if (lang === "en") await writeFile(join(out, "counters.css"), css);
  await writeFile(join(out, "index.html"), indexPage(lang));
  for (const name of roster) {
    const dir = join(out, slug(name));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "index.html"), brawlerPage(name, lang, text));
  }
}
await writeFile(join(ROOT, "docs", "sitemap.xml"), sitemap());

console.log(`Generated ${roster.length} brawler pages + index in ${PAGE_LANGS.join("/")} + sitemap (data updated: ${dataUpdated}).`);
