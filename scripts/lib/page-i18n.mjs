// Page chrome for the generated /counters/ and /maps/ pages in every site
// language. English pages live at /counters/…, translated ones under
// /es/… and /pt/…; each page links its siblings with hreflang.
//
// Brawler, gadget, star power, map and mode names stay in their official
// English form in every language.

import { HTML_LANG, formatMonthYear, translateClass, strings as uiStrings } from "../../docs/i18n.js";

export const PAGE_LANGS = ["en", "es", "pt"];
export const SITE = "https://brawlcalculator.com";

// "/counters/edgar/" → "/es/counters/edgar/" etc.
export const localPath = (lang, path) => (lang === "en" ? path : `/${lang}${path}`);

// Calculator links carry ?lang= so the calculator opens in the page's language.
export function calcHref(lang, picks) {
  const q = [lang !== "en" && `lang=${lang}`, picks && `p=${encodeURIComponent(picks)}`].filter(Boolean);
  return q.length ? `/?${q.join("&")}` : "/";
}

export function hreflangLinks(path) {
  return [
    ...PAGE_LANGS.map(l => `<link rel="alternate" hreflang="${HTML_LANG[l]}" href="${SITE}${localPath(l, path)}">`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}${path}">`,
  ].join("\n");
}

export function langSwitch(lang, path) {
  const label = { en: "EN", es: "ES", pt: "PT" };
  return `<nav class="lang-switch" aria-label="${pageText[lang].language}">
${PAGE_LANGS.map(l => `  <a href="${localPath(l, path)}" hreflang="${HTML_LANG[l]}" lang="${HTML_LANG[l]}"${l === lang ? ' aria-current="page"' : ""}>${label[l]}</a>`).join("\n")}
</nav>`;
}

export { HTML_LANG, formatMonthYear, translateClass };
export const disclaimerHtml = lang => uiStrings[lang].disclaimerHtml;

const more = { en: " and more", es: " y más", pt: " e mais" };

export const pageText = {
  en: {
    language: "Language",
    navMaps: "Maps",
    navAllBrawlers: "All brawlers",
    navCounters: "Counters",
    navOpenCalc: "Open Calculator",
    crumbCalc: "Calculator",
    crumbCounters: "Counters",
    crumbMaps: "Maps",
    footerOpenCalc: "Open the counterpick calculator",
    footerCountersByBrawler: "Counters by brawler",
    footerAllMaps: "All maps",

    // counter pages
    countersFooterSource: date => `Counterpicks determined primarily from <strong>SpenLC</strong> ranking data · data updated ${date}`,
    counterDescription: (name, top, date) => `The best counters to ${name} in Brawl Stars ranked: ${top}. Hand-curated counter data, updated ${date}.`,
    counterDescriptionNew: name => `${name} is brand new to Brawl Stars — curated counter data is coming with the next update. See who ${name} counters and try the counterpick calculator.`,
    counterCrumb: name => `${name} Counters`,
    counterItemList: name => `Best counters to ${name} in Brawl Stars`,
    strongMaps: name => `${name} shines on these maps`,
    bestCounters: name => `Best counters to ${name}`,
    brandNew: name => `${name} is brand new — curated counter data lands with the next update.`,
    alsoWeakTo: "Also weak to:",
    strongAgainst: name => `${name} is a strong pick against`,
    counterH1: name => `${name} Counters`,
    counterSubtitle: (name, date) => `Best picks against ${name} in Brawl Stars ranked · updated ${date}`,
    counterCta: "Countering a full enemy team? Open the calculator",
    counterTitle: (name, date) => `${name} Counters — Best Brawlers Against ${name} (${date})`,
    counterOgTitle: name => `${name} Counters — Brawl Stars`,
    indexH1: "Brawl Stars Counters, Brawler by Brawler",
    indexSubtitle: date => `Hand-curated counterpicks for every brawler · updated ${date}`,
    searchBrawlers: "Search brawlers…",
    searchBrawlersLabel: "Search brawlers",
    noBrawlerMatch: "No brawlers match that search.",
    indexTitle: date => `Brawl Stars Counters for Every Brawler (${date})`,
    indexOgTitle: "Brawl Stars Counters — Every Brawler",
    indexDescription: (n, date) => `Who counters every Brawl Stars brawler — hand-curated ranked counter lists for all ${n} brawlers, updated ${date}.`,

    // map pages
    mapsFooterSource: date => `Map picks researched from competitive sources · updated ${date}`,
    confidence: {
      high:   { label: "Strong data",     blurb: "Backed by multiple competitive sources." },
      medium: { label: "Decent data",     blurb: "Based on limited competitive sources." },
      low:    { label: "Early estimates", blurb: "Little map-specific data exists so far." },
      none:   { label: "Not enough data", blurb: "Not enough competitive data exists yet for this map." },
    },
    mapDescriptionNone: (map, mode) => `${map} (${mode}) — not enough competitive data yet for reliable pick suggestions. Browse other Brawl Stars maps on Brawl Calculator.`,
    mapDescription: (map, mode, top, ranked, date) => `Best brawlers for ${map} (${mode}) in Brawl Stars: ${top}. ${ranked ? "Plus the top bans for ranked drafts. " : ""}Updated ${date}.`,
    bestBrawlers: "Best brawlers",
    noDataNote: (blurb, calc) => `${blurb} Check back after this map has seen more competitive play — or open the
  <a href="${calc}">counterpick calculator</a> to draft around your opponents instead.`,
    tierS: "S tier — best picks",
    tierA: "A tier — strong picks",
    tierB: "B tier — solid picks",
    bestBans: "Best bans",
    mapItemList: (map, mode) => `Best brawlers for ${map} (${mode})`,
    mapArtAlt: map => `${map} map layout`,
    mapSubtitleFallback: (map, mode) => `Best brawlers for ${map} in ${mode}.`,
    mapCta: "Drafting right now? Open the counterpick calculator",
    mapTitleNone: (map, mode) => `${map} (${mode}) — Brawl Stars Map`,
    mapTitle: (map, mode) => `Best Brawlers for ${map} (${mode}) — Picks & Bans`,
    modeAll: "All",
    moreModes: "More modes",
    moreModesTitle: "Limited-time and event modes",
    mapsH1: "Best Brawlers by Map",
    mapsSubtitle: (r, n, date) => `Pick a map to see the strongest picks and bans · ${r} of ${n} maps researched · updated ${date}`,
    searchMaps: "Search maps…",
    searchMapsLabel: "Search maps",
    noMapMatch: "No maps match. Try a different search or mode.",
    mapsTitle: date => `Best Brawlers for Every Map — Brawl Stars Picks & Bans (${date})`,
    mapsDescription: n => `Best brawlers and bans for every Brawl Stars map, filterable by game mode — ${n} maps with tiered picks researched from competitive data.`,
  },

  es: {
    language: "Idioma",
    navMaps: "Mapas",
    navAllBrawlers: "Todos los brawlers",
    navCounters: "Counters",
    navOpenCalc: "Abrir calculadora",
    crumbCalc: "Calculadora",
    crumbCounters: "Counters",
    crumbMaps: "Mapas",
    footerOpenCalc: "Abrir la calculadora de counterpicks",
    footerCountersByBrawler: "Counters por brawler",
    footerAllMaps: "Todos los mapas",

    countersFooterSource: date => `Counterpicks basados principalmente en los datos de ranking de <strong>SpenLC</strong> · datos actualizados en ${date}`,
    counterDescription: (name, top, date) => `Los mejores counters de ${name} en ranked de Brawl Stars: ${top}. Datos de counters seleccionados a mano, actualizados en ${date}.`,
    counterDescriptionNew: name => `${name} acaba de llegar a Brawl Stars: los datos de counters llegarán con la próxima actualización. Mira a quién le hace counter ${name} y prueba la calculadora de counterpicks.`,
    counterCrumb: name => `Counters de ${name}`,
    counterItemList: name => `Mejores counters de ${name} en Brawl Stars`,
    strongMaps: name => `Mapas donde ${name} brilla`,
    bestCounters: name => `Mejores counters de ${name}`,
    brandNew: name => `${name} acaba de salir: los datos de counters llegarán con la próxima actualización.`,
    alsoWeakTo: "También es débil contra:",
    strongAgainst: name => `${name} es un buen pick contra`,
    counterH1: name => `Counters de ${name}`,
    counterSubtitle: (name, date) => `Los mejores picks contra ${name} en ranked de Brawl Stars · actualizado en ${date}`,
    counterCta: "¿Contra un equipo rival completo? Abre la calculadora",
    counterTitle: (name, date) => `Counters de ${name}: los mejores brawlers contra ${name} (${date})`,
    counterOgTitle: name => `Counters de ${name} — Brawl Stars`,
    indexH1: "Counters de Brawl Stars, brawler por brawler",
    indexSubtitle: date => `Counterpicks seleccionados a mano para cada brawler · actualizado en ${date}`,
    searchBrawlers: "Buscar brawlers…",
    searchBrawlersLabel: "Buscar brawlers",
    noBrawlerMatch: "Ningún brawler coincide con esa búsqueda.",
    indexTitle: date => `Counters de Brawl Stars para cada brawler (${date})`,
    indexOgTitle: "Counters de Brawl Stars — Todos los brawlers",
    indexDescription: (n, date) => `Quién le hace counter a cada brawler de Brawl Stars: listas de counters para ranked seleccionadas a mano para los ${n} brawlers, actualizadas en ${date}.`,

    mapsFooterSource: date => `Picks por mapa investigados en fuentes competitivas · actualizado en ${date}`,
    confidence: {
      high:   { label: "Datos sólidos",          blurb: "Respaldado por varias fuentes competitivas." },
      medium: { label: "Datos aceptables",       blurb: "Basado en pocas fuentes competitivas." },
      low:    { label: "Estimaciones iniciales", blurb: "Todavía hay pocos datos específicos de este mapa." },
      none:   { label: "Datos insuficientes",    blurb: "Todavía no hay suficientes datos competitivos para este mapa." },
    },
    mapDescriptionNone: (map, mode) => `${map} (${mode}): todavía no hay suficientes datos competitivos para recomendar picks fiables. Explora otros mapas de Brawl Stars en Brawl Calculator.`,
    mapDescription: (map, mode, top, ranked, date) => `Mejores brawlers para ${map} (${mode}) en Brawl Stars: ${top}. ${ranked ? "Además, los mejores baneos para el draft de ranked. " : ""}Actualizado en ${date}.`,
    bestBrawlers: "Mejores brawlers",
    noDataNote: (blurb, calc) => `${blurb} Vuelve cuando este mapa tenga más partidas competitivas, o abre la
  <a href="${calc}">calculadora de counterpicks</a> para draftear según tus rivales.`,
    tierS: "Tier S — mejores picks",
    tierA: "Tier A — picks fuertes",
    tierB: "Tier B — picks sólidos",
    bestBans: "Mejores baneos",
    mapItemList: (map, mode) => `Mejores brawlers para ${map} (${mode})`,
    mapArtAlt: map => `Diseño del mapa ${map}`,
    mapSubtitleFallback: (map, mode) => `Mejores brawlers para ${map} en ${mode}.`,
    mapCta: "¿Estás en el draft? Abre la calculadora de counterpicks",
    mapTitleNone: (map, mode) => `${map} (${mode}) — Mapa de Brawl Stars`,
    mapTitle: (map, mode) => `Mejores brawlers para ${map} (${mode}) — Picks y baneos`,
    modeAll: "Todos",
    moreModes: "Más modos",
    moreModesTitle: "Modos de evento y de tiempo limitado",
    mapsH1: "Mejores brawlers por mapa",
    mapsSubtitle: (r, n, date) => `Elige un mapa para ver los mejores picks y baneos · ${r} de ${n} mapas investigados · actualizado en ${date}`,
    searchMaps: "Buscar mapas…",
    searchMapsLabel: "Buscar mapas",
    noMapMatch: "Ningún mapa coincide. Prueba otra búsqueda u otro modo.",
    mapsTitle: date => `Mejores brawlers para cada mapa — Picks y baneos de Brawl Stars (${date})`,
    mapsDescription: n => `Los mejores brawlers y baneos para cada mapa de Brawl Stars, filtrables por modo de juego: ${n} mapas con picks por tiers basados en datos competitivos.`,
  },

  pt: {
    language: "Idioma",
    navMaps: "Mapas",
    navAllBrawlers: "Todos os brawlers",
    navCounters: "Counters",
    navOpenCalc: "Abrir calculadora",
    crumbCalc: "Calculadora",
    crumbCounters: "Counters",
    crumbMaps: "Mapas",
    footerOpenCalc: "Abrir a calculadora de counterpicks",
    footerCountersByBrawler: "Counters por brawler",
    footerAllMaps: "Todos os mapas",

    countersFooterSource: date => `Counterpicks baseados principalmente nos dados de ranking do <strong>SpenLC</strong> · dados atualizados em ${date}`,
    counterDescription: (name, top, date) => `Os melhores counters de ${name} no Ranqueado do Brawl Stars: ${top}. Dados de counters selecionados a dedo, atualizados em ${date}.`,
    counterDescriptionNew: name => `${name} acabou de chegar ao Brawl Stars: os dados de counters chegam na próxima atualização. Veja em quem ${name} dá counter e teste a calculadora de counterpicks.`,
    counterCrumb: name => `Counters de ${name}`,
    counterItemList: name => `Melhores counters de ${name} no Brawl Stars`,
    strongMaps: name => `Mapas onde ${name} se destaca`,
    bestCounters: name => `Melhores counters de ${name}`,
    brandNew: name => `${name} acabou de chegar: os dados de counters chegam na próxima atualização.`,
    alsoWeakTo: "Também perde para:",
    strongAgainst: name => `${name} é um bom pick contra`,
    counterH1: name => `Counters de ${name}`,
    counterSubtitle: (name, date) => `Os melhores picks contra ${name} no Ranqueado do Brawl Stars · atualizado em ${date}`,
    counterCta: "Enfrentando um time inteiro? Abra a calculadora",
    counterTitle: (name, date) => `Counters de ${name}: os melhores brawlers contra ${name} (${date})`,
    counterOgTitle: name => `Counters de ${name} — Brawl Stars`,
    indexH1: "Counters de Brawl Stars, brawler por brawler",
    indexSubtitle: date => `Counterpicks selecionados a dedo para cada brawler · atualizado em ${date}`,
    searchBrawlers: "Buscar brawlers…",
    searchBrawlersLabel: "Buscar brawlers",
    noBrawlerMatch: "Nenhum brawler corresponde a essa busca.",
    indexTitle: date => `Counters de Brawl Stars para cada brawler (${date})`,
    indexOgTitle: "Counters de Brawl Stars — Todos os brawlers",
    indexDescription: (n, date) => `Quem dá counter em cada brawler de Brawl Stars: listas de counters para o Ranqueado selecionadas a dedo para os ${n} brawlers, atualizadas em ${date}.`,

    mapsFooterSource: date => `Picks por mapa pesquisados em fontes competitivas · atualizado em ${date}`,
    confidence: {
      high:   { label: "Dados sólidos",        blurb: "Baseado em várias fontes competitivas." },
      medium: { label: "Dados razoáveis",      blurb: "Baseado em poucas fontes competitivas." },
      low:    { label: "Estimativas iniciais", blurb: "Ainda há poucos dados específicos deste mapa." },
      none:   { label: "Dados insuficientes",  blurb: "Ainda não há dados competitivos suficientes para este mapa." },
    },
    mapDescriptionNone: (map, mode) => `${map} (${mode}): ainda não há dados competitivos suficientes para recomendar picks confiáveis. Veja outros mapas de Brawl Stars no Brawl Calculator.`,
    mapDescription: (map, mode, top, ranked, date) => `Melhores brawlers para ${map} (${mode}) no Brawl Stars: ${top}. ${ranked ? "Além dos melhores bans para o draft do Ranqueado. " : ""}Atualizado em ${date}.`,
    bestBrawlers: "Melhores brawlers",
    noDataNote: (blurb, calc) => `${blurb} Volte quando este mapa tiver mais partidas competitivas, ou abra a
  <a href="${calc}">calculadora de counterpicks</a> para montar o draft contra seus adversários.`,
    tierS: "Tier S — melhores picks",
    tierA: "Tier A — picks fortes",
    tierB: "Tier B — picks sólidos",
    bestBans: "Melhores bans",
    mapItemList: (map, mode) => `Melhores brawlers para ${map} (${mode})`,
    mapArtAlt: map => `Layout do mapa ${map}`,
    mapSubtitleFallback: (map, mode) => `Melhores brawlers para ${map} em ${mode}.`,
    mapCta: "Draft rolando agora? Abra a calculadora de counterpicks",
    mapTitleNone: (map, mode) => `${map} (${mode}) — Mapa do Brawl Stars`,
    mapTitle: (map, mode) => `Melhores brawlers para ${map} (${mode}) — Picks e bans`,
    modeAll: "Todos",
    moreModes: "Mais modos",
    moreModesTitle: "Modos de evento e por tempo limitado",
    mapsH1: "Melhores brawlers por mapa",
    mapsSubtitle: (r, n, date) => `Escolha um mapa para ver os melhores picks e bans · ${r} de ${n} mapas pesquisados · atualizado em ${date}`,
    searchMaps: "Buscar mapas…",
    searchMapsLabel: "Buscar mapas",
    noMapMatch: "Nenhum mapa encontrado. Tente outra busca ou outro modo.",
    mapsTitle: date => `Melhores brawlers para cada mapa — Picks e bans do Brawl Stars (${date})`,
    mapsDescription: n => `Os melhores brawlers e bans para cada mapa do Brawl Stars, com filtro por modo de jogo: ${n} mapas com picks por tier baseados em dados competitivos.`,
  },
};

// "A, B, C and more" for meta descriptions.
export function topList(lang, names) {
  return names.slice(0, 3).join(", ") + (names.length > 3 ? more[lang] : "");
}

// Shared CSS for the crumbs row + language switch on generated pages.
export const langSwitchCss = `
.crumbs-row { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.crumbs-row .crumbs { width: auto; margin-bottom: 0; min-width: 0; }
.lang-switch { display: inline-flex; flex-shrink: 0; padding: 2px; border-radius: 100px; border: 1px solid var(--border-hi); background: var(--surface); }
.lang-switch a { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; padding: 0.25rem 0.55rem; border-radius: 100px; color: var(--text-3); text-decoration: none; transition: color 0.15s ease, background 0.15s ease; }
.lang-switch a:hover { color: var(--text); }
.lang-switch a[aria-current="page"] { color: var(--gold); background: rgba(255,214,10,0.12); }
`;
