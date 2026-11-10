// UI strings for the calculator pages (index.html / classic.html via app.js).
// Plain ES module with no DOM dependencies, so tests/ can import it.
//
// Brawler, star power and gadget names are never translated: Spanish and
// Brazilian players use the official in-game English names. Keys ending in
// "Html" are inserted with innerHTML (trusted, authored here); every other key
// is plain text.
// {name}-style placeholders are filled by translate().

export const LANGS = ["en", "es", "pt"];
export const DEFAULT_LANG = "en";

// <html lang> per UI language. "pt" is Brazilian Portuguese; pt-PT browsers
// get it too until there is a European Portuguese table.
export const HTML_LANG = { en: "en", es: "es", pt: "pt-BR" };

export const strings = {
  en: {
    pageTitle: "Brawl Stars Ranked Counterpick Calculator",
    langToggleLabel: "Language",
    navMaps: "Maps",
    navClassic: "Classic view",
    navCounters: "Counters by Brawler",
    heroTitleHtml: "Brawler Counterpick<br>Calculator",
    heroSubtitle: "Click on the brawlers your opponents have picked, the results will show which brawlers counter them so you can make the best pick.",
    iconSize: "Icon size",
    iconSmall: "Small icons",
    iconMedium: "Medium icons",
    iconLarge: "Large icons",
    pickHeading: "Pick up to three brawlers",
    bans: "Bans",
    bansCount: "Bans ({n})",
    banTitle: "Ban mode: tap brawlers to mark them banned — they're hidden from results",
    banHintHtml: "Ban mode is on — tap brawlers to mark them banned; they'll be hidden from results. Tap <strong>Bans</strong> again to finish.",
    sortRarity: "Rarity",
    sortAlpha: "Alphabetical",
    nameAddPlaceholder: "Add a brawler by name…",
    nameAddLabel: "Add a brawler by name",
    nameAddBtn: "Add",
    calculate: "Calculate",
    calcHint: "Select at least one brawler first — tap an icon above or type a name.",
    removePick: "Remove {name}",
    clearPicks: "Clear",
    guideLinkTitle: "{name}'s full counter guide",
    countersLabel: "Counters:",
    allCountersBanned: "All of {name}'s counters are banned.",
    noCounterData: "{name} is brand new — no curated counter data yet. It will be added with the next data update.",
    alsoWeakTo: "Also weak to: {list}",
    doubleOverlapsHtml: "Double<br>Overlaps:",
    tripleOverlapsHtml: "Triple<br>Overlaps:",
    banNoteOne: "{n} banned counter hidden from results.",
    banNoteOther: "{n} banned counters hidden from results.",
    shareLink: "Copy link to these picks",
    shareCopied: "Link copied",
    shareTitle: "Brawl Stars counterpicks",
    featureCountersTitle: "Counters by Brawler",
    featureCountersText: "Every brawler's full counter guide: who beats them, who they beat, and why each matchup works.",
    featureCountersGo: "Browse all {n}",
    featureMapsTitle: "Best Brawlers by Map",
    featureMapsText: "Tiered picks and the smartest bans for every map, researched from competitive play.",
    featureMapsGo: "Browse maps",
    widthHandleLabel: "Layout width",
    widthHandleTitle: "Drag to adjust layout width (double-click to reset)",
    footerSourceHtml: "Counterpicks determined primarily from <strong>SpenLC</strong> ranking data · data updated <span id=\"dataFreshness\">{date}</span>",
    footerBrowse: "Browse counters brawler-by-brawler",
    disclaimerHtml: "This material is unofficial and is not endorsed by Supercell. For more information see <a href=\"https://supercell.com/en/fan-content-policy/\" rel=\"noopener\">Supercell's Fan Content Policy</a>.",
    feedbackOpen: "Feedback",
    feedbackHeading: "Send Feedback",
    close: "Close",
    fbType: "Type",
    fbTypePlaceholder: "Select a type…",
    fbSuggestion: "Suggestion",
    fbBug: "Bug report",
    fbData: "Wrong counter data",
    fbOther: "Other",
    fbMessage: "Message",
    fbMessagePlaceholder: "What's on your mind?",
    fbEmail: "Email",
    fbEmailOptional: "(optional — if you want a reply)",
    fbEmailPlaceholder: "you@example.com",
    fbSubmit: "Send Feedback",
    fbSending: "Sending…",
    fbError: "Something went wrong — please try again.",
    fbThanksHtml: "Thanks for the feedback!<br>It helps make the calculator better.",
    classicTitle: "Brawler Counterpick Calculator",
    classicGo: "Go",
    classicSourceHtml: "Counterpicks determined primarily from <strong>SpenLC</strong> ranking data.",
    classicNewUi: "New UI",
    classes: {
      "Sniper": "Sniper",
      "Thrower": "Thrower",
      "Tank": "Tank",
      "Anti-Tank": "Anti-Tank",
      "Assassin": "Assassin",
      "Knockback": "Knockback",
      "Spawner": "Spawner",
      "Wallbreaker": "Wallbreaker",
      "Healer": "Healer",
    },
  },

  es: {
    pageTitle: "Calculadora de counterpicks para ranked de Brawl Stars",
    langToggleLabel: "Idioma",
    navMaps: "Mapas",
    navClassic: "Vista clásica",
    navCounters: "Counters por brawler",
    heroTitleHtml: "Calculadora de<br>Counterpicks",
    heroSubtitle: "Toca los brawlers que han elegido tus rivales y verás qué brawlers les hacen counter, para que hagas el mejor pick.",
    iconSize: "Tamaño de los iconos",
    iconSmall: "Iconos pequeños",
    iconMedium: "Iconos medianos",
    iconLarge: "Iconos grandes",
    pickHeading: "Elige hasta tres brawlers",
    bans: "Baneos",
    bansCount: "Baneos ({n})",
    banTitle: "Modo baneo: toca brawlers para marcarlos como baneados; se ocultan de los resultados",
    banHintHtml: "El modo baneo está activado: toca brawlers para marcarlos como baneados y se ocultarán de los resultados. Toca <strong>Baneos</strong> otra vez para terminar.",
    sortRarity: "Rareza",
    sortAlpha: "Alfabético",
    nameAddPlaceholder: "Añade un brawler por nombre…",
    nameAddLabel: "Añadir un brawler por nombre",
    nameAddBtn: "Añadir",
    calculate: "Calcular",
    calcHint: "Primero elige al menos un brawler: toca un icono de arriba o escribe un nombre.",
    removePick: "Quitar a {name}",
    clearPicks: "Borrar",
    guideLinkTitle: "Guía completa de counters de {name}",
    countersLabel: "Counters:",
    allCountersBanned: "Todos los counters de {name} están baneados.",
    noCounterData: "{name} acaba de salir: todavía no hay datos de counters. Se añadirán en la próxima actualización.",
    alsoWeakTo: "También es débil contra: {list}",
    doubleOverlapsHtml: "Coincidencias<br>dobles:",
    tripleOverlapsHtml: "Coincidencias<br>triples:",
    banNoteOne: "{n} counter baneado oculto de los resultados.",
    banNoteOther: "{n} counters baneados ocultos de los resultados.",
    shareLink: "Copiar enlace a estos picks",
    shareCopied: "Enlace copiado",
    shareTitle: "Counterpicks de Brawl Stars",
    featureCountersTitle: "Counters por brawler",
    featureCountersText: "La guía completa de counters de cada brawler: quién le gana, a quién gana y por qué funciona cada enfrentamiento.",
    featureCountersGo: "Ver los {n}",
    featureMapsTitle: "Mejores brawlers por mapa",
    featureMapsText: "Picks por tiers y los baneos más inteligentes para cada mapa, basados en el juego competitivo.",
    featureMapsGo: "Ver mapas",
    widthHandleLabel: "Ancho del diseño",
    widthHandleTitle: "Arrastra para ajustar el ancho (doble clic para restablecer)",
    footerSourceHtml: "Counterpicks basados principalmente en los datos de ranking de <strong>SpenLC</strong> · datos actualizados en <span id=\"dataFreshness\">{date}</span>",
    footerBrowse: "Ver counters brawler por brawler",
    disclaimerHtml: "Este material no es oficial y Supercell no lo respalda. Para más información, consulta la <a href=\"https://supercell.com/en/fan-content-policy/\" rel=\"noopener\">Política de contenido de fans de Supercell</a>.",
    feedbackOpen: "Comentarios",
    feedbackHeading: "Enviar comentarios",
    close: "Cerrar",
    fbType: "Tipo",
    fbTypePlaceholder: "Elige un tipo…",
    fbSuggestion: "Sugerencia",
    fbBug: "Reporte de error",
    fbData: "Datos de counters incorrectos",
    fbOther: "Otro",
    fbMessage: "Mensaje",
    fbMessagePlaceholder: "¿Qué nos quieres contar?",
    fbEmail: "Correo",
    fbEmailOptional: "(opcional, si quieres una respuesta)",
    fbEmailPlaceholder: "tu@ejemplo.com",
    fbSubmit: "Enviar comentarios",
    fbSending: "Enviando…",
    fbError: "Algo salió mal. Inténtalo de nuevo.",
    fbThanksHtml: "¡Gracias por tus comentarios!<br>Nos ayudan a mejorar la calculadora.",
    classicTitle: "Calculadora de Counterpicks",
    classicGo: "Ir",
    classicSourceHtml: "Counterpicks basados principalmente en los datos de ranking de <strong>SpenLC</strong>.",
    classicNewUi: "Nueva interfaz",
    classes: {
      "Sniper": "Francotirador",
      "Thrower": "Lanzador",
      "Tank": "Tanque",
      "Anti-Tank": "Anti-tanque",
      "Assassin": "Asesino",
      "Knockback": "Empuje",
      "Spawner": "Invocador",
      "Wallbreaker": "Rompemuros",
      "Healer": "Sanador",
    },
  },

  pt: {
    pageTitle: "Calculadora de counterpicks para o Ranqueado do Brawl Stars",
    langToggleLabel: "Idioma",
    navMaps: "Mapas",
    navClassic: "Versão clássica",
    navCounters: "Counters por brawler",
    heroTitleHtml: "Calculadora de<br>Counterpicks",
    heroSubtitle: "Toque nos brawlers que seus adversários escolheram e os resultados vão mostrar quais brawlers dão counter neles, para você fazer o melhor pick.",
    iconSize: "Tamanho dos ícones",
    iconSmall: "Ícones pequenos",
    iconMedium: "Ícones médios",
    iconLarge: "Ícones grandes",
    pickHeading: "Escolha até três brawlers",
    bans: "Bans",
    bansCount: "Bans ({n})",
    banTitle: "Modo de ban: toque nos brawlers para marcá-los como banidos; eles ficam ocultos nos resultados",
    banHintHtml: "O modo de ban está ativado: toque nos brawlers para marcá-los como banidos e eles vão sumir dos resultados. Toque em <strong>Bans</strong> de novo para terminar.",
    sortRarity: "Raridade",
    sortAlpha: "Alfabética",
    nameAddPlaceholder: "Adicione um brawler…",
    nameAddLabel: "Adicionar um brawler pelo nome",
    nameAddBtn: "Adicionar",
    calculate: "Calcular",
    calcHint: "Escolha pelo menos um brawler primeiro: toque em um ícone acima ou digite um nome.",
    removePick: "Remover {name}",
    clearPicks: "Limpar",
    guideLinkTitle: "Guia completo de counters: {name}",
    countersLabel: "Counters:",
    allCountersBanned: "Todos os counters de {name} estão banidos.",
    noCounterData: "{name} acabou de chegar: ainda não há dados de counters. Eles serão adicionados na próxima atualização.",
    alsoWeakTo: "Também perde para: {list}",
    doubleOverlapsHtml: "Sobreposições<br>duplas:",
    tripleOverlapsHtml: "Sobreposições<br>triplas:",
    banNoteOne: "{n} counter banido oculto dos resultados.",
    banNoteOther: "{n} counters banidos ocultos dos resultados.",
    shareLink: "Copiar link destes picks",
    shareCopied: "Link copiado",
    shareTitle: "Counterpicks de Brawl Stars",
    featureCountersTitle: "Counters por brawler",
    featureCountersText: "O guia completo de counters de cada brawler: quem ganha dele, de quem ele ganha e por que cada confronto funciona.",
    featureCountersGo: "Ver todos os {n}",
    featureMapsTitle: "Melhores brawlers por mapa",
    featureMapsText: "Picks por tier e os bans mais inteligentes para cada mapa, com base no cenário competitivo.",
    featureMapsGo: "Ver mapas",
    widthHandleLabel: "Largura do layout",
    widthHandleTitle: "Arraste para ajustar a largura (clique duplo para redefinir)",
    footerSourceHtml: "Counterpicks baseados principalmente nos dados de ranking do <strong>SpenLC</strong> · dados atualizados em <span id=\"dataFreshness\">{date}</span>",
    footerBrowse: "Ver counters brawler por brawler",
    disclaimerHtml: "Este material não é oficial e não é endossado pela Supercell. Para mais informações, consulte a <a href=\"https://supercell.com/en/fan-content-policy/\" rel=\"noopener\">Política de Conteúdo de Fãs da Supercell</a>.",
    feedbackOpen: "Feedback",
    feedbackHeading: "Enviar feedback",
    close: "Fechar",
    fbType: "Tipo",
    fbTypePlaceholder: "Selecione um tipo…",
    fbSuggestion: "Sugestão",
    fbBug: "Relatar bug",
    fbData: "Dados de counter errados",
    fbOther: "Outro",
    fbMessage: "Mensagem",
    fbMessagePlaceholder: "O que você quer nos contar?",
    fbEmail: "E-mail",
    fbEmailOptional: "(opcional, se quiser uma resposta)",
    fbEmailPlaceholder: "voce@exemplo.com",
    fbSubmit: "Enviar feedback",
    fbSending: "Enviando…",
    fbError: "Algo deu errado. Tente novamente.",
    fbThanksHtml: "Valeu pelo feedback!<br>Ele ajuda a melhorar a calculadora.",
    classicTitle: "Calculadora de Counterpicks",
    classicGo: "Ir",
    classicSourceHtml: "Counterpicks baseados principalmente nos dados de ranking do <strong>SpenLC</strong>.",
    classicNewUi: "Nova interface",
    classes: {
      "Sniper": "Atirador de elite",
      "Thrower": "Arremessador",
      "Tank": "Tanque",
      "Anti-Tank": "Antitanque",
      "Assassin": "Assassino",
      "Knockback": "Empurrão",
      "Spawner": "Invocador",
      "Wallbreaker": "Quebra-paredes",
      "Healer": "Curandeiro",
    },
  },
};

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July",
       "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
       "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  pt: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
       "agosto", "setembro", "outubro", "novembro", "dezembro"],
};

// "es-MX" / "ES" / "es" → "es", "pt-PT" → "pt"; unsupported or empty → null.
export function normalizeLang(code) {
  if (typeof code !== "string") return null;
  const primary = code.trim().toLowerCase().split(/[-_]/)[0];
  return LANGS.includes(primary) ? primary : null;
}

// First supported language in the browser's preference list
// (navigator.languages, or a single navigator.language string).
export function detectLang(preferred) {
  const list = Array.isArray(preferred) ? preferred : [preferred];
  for (const code of list) {
    const lang = normalizeLang(code);
    if (lang) return lang;
  }
  return DEFAULT_LANG;
}

// Precedence: explicit ?lang= param, then the saved toggle choice, then the
// browser's languages.
export function pickLang({ param, stored, preferred } = {}) {
  return normalizeLang(param) || normalizeLang(stored) || detectLang(preferred);
}

export function translate(lang, key, vars = {}) {
  const table = strings[lang] || strings[DEFAULT_LANG];
  let text = table[key] ?? strings[DEFAULT_LANG][key] ?? key;
  for (const [k, v] of Object.entries(vars)) text = text.split(`{${k}}`).join(String(v));
  return text;
}

export function translateClass(lang, cls) {
  return (strings[lang] || strings[DEFAULT_LANG]).classes[cls] ?? cls;
}

// counters.js stamps freshness as English "October 2026"; Spanish and
// Portuguese share the "octubre de 2026" / "outubro de 2026" pattern.
// Anything unparseable passes through unchanged.
export function formatMonthYear(text, lang) {
  const m = /^([A-Za-z]+) (\d{4})$/.exec(String(text).trim());
  if (!m || lang === "en" || !MONTHS[lang]) return text;
  const idx = MONTHS.en.findIndex(name => name.toLowerCase() === m[1].toLowerCase());
  return idx === -1 ? text : `${MONTHS[lang][idx]} de ${m[2]}`;
}
