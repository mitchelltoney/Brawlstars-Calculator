import {
  calculate,
  brawlersAlphabetical,
  rarityOrder,
  dataUpdated,
  resolveName,
  resolveUniquePrefix,
  prefixMatches,
  addPick,
  togglePick,
} from "./calculate.js?v=2026-07-13.4";
import { matchupNotes } from "./matchup-notes.js?v=2026-07-13.4";

const freshnessEl = document.getElementById("dataFreshness");
if (freshnessEl) freshnessEl.textContent = dataUpdated;

const grid = document.getElementById("iconGrid");
const picks = [];
// Ranked bans: 3 per team, both teams may ban the same brawler → at most 6
// distinct names. Bans are display-side only: banned brawlers are marked in
// the grid, can't be picked, and are hidden from results.
const bans = new Set();
const MAX_BANS = 6;
let banMode = false;
let currentList = rarityOrder;
// Results go live (re-render on every pick/ban change) only after the user
// has explicitly calculated once, so the first experience stays button-driven.
let hasCalculated = false;

function fileName(n) {
  return n.toLowerCase().replace(/[\s.'-]/g, "_") + ".webp";
}

// Each grid entry is a real <button> whose padding extends the clickable
// area into the gap between icons; the inner img is pointer-events: none so
// every click lands on the button.
function buildGrid(list) {
  grid.innerHTML = "";
  list.forEach(n => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "icon-cell";
    cell.dataset.name = n;
    cell.title = n;
    cell.setAttribute("aria-label", n);
    cell.setAttribute("aria-pressed", picks.includes(n) ? "true" : "false");
    if (picks.includes(n)) cell.classList.add("selected");
    if (bans.has(n)) cell.classList.add("banned");
    const img = document.createElement("img");
    img.src = `icons/${fileName(n)}`;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    cell.appendChild(img);
    grid.appendChild(cell);
  });
}

buildGrid(currentList);

const sortBtn = document.getElementById("sortToggle");
if (sortBtn) {
  sortBtn.textContent = "Rarity";
  sortBtn.addEventListener("click", () => {
    currentList = currentList === brawlersAlphabetical ? rarityOrder : brawlersAlphabetical;
    sortBtn.textContent = currentList === brawlersAlphabetical ? "Alphabetical" : "Rarity";
    buildGrid(currentList);
  });
}

// Sync `picks` and `.selected` highlights to `next`. This is the SINGLE point
// where pick state mutates: both the click handler and the text input go
// through one of the pure helpers and then through here.
function applyPicks(next) {
  for (const old of picks) {
    if (!next.includes(old)) {
      const cell = grid.querySelector(`.icon-cell[data-name="${old}"]`);
      if (cell) {
        cell.classList.remove("selected");
        cell.setAttribute("aria-pressed", "false");
      }
    }
  }
  for (const name of next) {
    if (!picks.includes(name)) {
      const cell = grid.querySelector(`.icon-cell[data-name="${name}"]`);
      if (cell) {
        cell.classList.add("selected");
        cell.setAttribute("aria-pressed", "true");
      }
    }
  }
  picks.length = 0;
  picks.push(...next);
  onPicksChanged();
}

function onPicksChanged() {
  if (picks.length) showCalcHint(false);
  renderTray();
  syncUrl();
  if (hasCalculated) renderResults({ scroll: false });
}

// ── Ban mode ───────────────────────────────────────────────────────────────

const banToggle = document.getElementById("banToggle");

function updateBanToggle() {
  if (!banToggle) return;
  banToggle.textContent = bans.size ? `Bans (${bans.size})` : "Bans";
  banToggle.classList.toggle("active", banMode);
  banToggle.setAttribute("aria-pressed", banMode ? "true" : "false");
}

function toggleBan(name) {
  const cell = grid.querySelector(`.icon-cell[data-name="${name}"]`);
  if (bans.has(name)) {
    bans.delete(name);
    if (cell) cell.classList.remove("banned");
  } else {
    if (bans.size >= MAX_BANS) return;
    bans.add(name);
    if (cell) cell.classList.add("banned");
    // A banned brawler can't stay picked.
    if (picks.includes(name)) applyPicks(picks.filter(p => p !== name));
  }
  updateBanToggle();
  if (hasCalculated) renderResults({ scroll: false });
}

const banHint = document.getElementById("banHint");

if (banToggle) {
  banToggle.addEventListener("click", () => {
    banMode = !banMode;
    grid.classList.toggle("ban-mode", banMode);
    if (banHint) banHint.hidden = !banMode;
    updateBanToggle();
  });
}

// ── Grid interaction (mouse + keyboard) ────────────────────────────────────

function handleGridActivate(cell) {
  const name = cell.dataset.name;
  if (banMode) {
    toggleBan(name);
    return;
  }
  // Outside ban mode, tapping a banned brawler unbans it (least surprise) —
  // it can't be picked while banned.
  if (bans.has(name)) {
    toggleBan(name);
    return;
  }
  applyPicks(togglePick(picks, name));
}

// Native <button> cells: click covers mouse, touch, AND keyboard
// (Enter/Space fire click on buttons; the global Enter shortcut already
// ignores buttons).
grid.addEventListener("click", e => {
  const cell = e.target.closest(".icon-cell");
  if (!cell) return;
  handleGridActivate(cell);
});

// ── Pick tray ──────────────────────────────────────────────────────────────

const trayEl = document.getElementById("pickTray");

function renderTray() {
  if (!trayEl) return;
  trayEl.innerHTML = "";
  if (!picks.length) {
    trayEl.hidden = true;
    return;
  }
  trayEl.hidden = false;
  picks.forEach(name => {
    const chip = document.createElement("span");
    chip.className = "pick-chip";
    const img = document.createElement("img");
    img.src = `icons/${fileName(name)}`;
    img.alt = "";
    img.decoding = "async";
    const label = document.createElement("span");
    label.textContent = name;
    const rm = document.createElement("button");
    rm.type = "button";
    rm.className = "chip-remove";
    rm.setAttribute("aria-label", `Remove ${name}`);
    rm.textContent = "✕";
    rm.addEventListener("click", () => applyPicks(picks.filter(p => p !== name)));
    chip.append(img, label, rm);
    trayEl.appendChild(chip);
  });
  const count = document.createElement("span");
  count.className = "pick-count";
  count.textContent = `${picks.length}/3`;
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "chip-clear";
  clear.textContent = "Clear";
  clear.addEventListener("click", () => applyPicks([]));
  trayEl.append(count, clear);
}

// ── Shareable URL state (?p=Name,Name) ─────────────────────────────────────

function syncUrl() {
  const url = new URL(window.location.href);
  if (picks.length) url.searchParams.set("p", picks.join(","));
  else url.searchParams.delete("p");
  history.replaceState(null, "", url);
}

// Type-a-name input: additive, no toggling. Confirms on Enter or Add click.
// Suggestions show only after the user starts typing and are filtered by
// case-insensitive PREFIX (not substring); on confirm, a unique prefix
// expands to its only match (so "Br" → Brock).
const nameInput  = document.getElementById("nameAdd");
const nameAddBtn = document.getElementById("nameAddBtn");
const suggestEl  = document.getElementById("nameSuggestions");

const MAX_SUGGESTIONS = 8;
let currentMatches = [];
let activeIndex = -1;

function setExpanded(open) {
  if (nameInput) nameInput.setAttribute("aria-expanded", open ? "true" : "false");
}

function renderSuggestions() {
  suggestEl.innerHTML = "";
  currentMatches.forEach((name, idx) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.dataset.name = name;
    li.setAttribute("role", "option");
    if (idx === activeIndex) {
      li.classList.add("active");
      li.setAttribute("aria-selected", "true");
    }
    suggestEl.appendChild(li);
  });
}

function hideSuggestions() {
  suggestEl.hidden = true;
  setExpanded(false);
  activeIndex = -1;
}

function refreshSuggestions() {
  const raw = nameInput.value;
  const matches = prefixMatches(raw).slice(0, MAX_SUGGESTIONS);
  currentMatches = matches;
  activeIndex = -1;
  if (!matches.length) {
    hideSuggestions();
    return;
  }
  renderSuggestions();
  suggestEl.hidden = false;
  setExpanded(true);
}

function moveActive(delta) {
  if (!currentMatches.length) return;
  if (activeIndex === -1) {
    activeIndex = delta > 0 ? 0 : currentMatches.length - 1;
  } else {
    activeIndex = (activeIndex + delta + currentMatches.length) % currentMatches.length;
  }
  renderSuggestions();
  const el = suggestEl.children[activeIndex];
  if (el) el.scrollIntoView({ block: "nearest" });
}

function flashInvalid() {
  if (!nameInput) return;
  nameInput.classList.remove("invalid");
  // Reflow so the animation restarts even on repeated invalids.
  void nameInput.offsetWidth;
  nameInput.classList.add("invalid");
}

function handleNameAdd() {
  if (!nameInput) return;
  const raw = nameInput.value;
  if (!raw.trim()) return;

  // Resolution order:
  //   1. If the user is navigating with arrow keys, use the highlighted row.
  //   2. resolveName: exact punctuation-insensitive match + aliases.
  //   3. Unique-prefix fallback: "Br" → Brock when Brock is the only roster
  //      name starting with "Br".
  let resolved = null;
  if (activeIndex >= 0 && currentMatches[activeIndex]) {
    resolved = currentMatches[activeIndex];
  } else {
    resolved = resolveName(raw) || resolveUniquePrefix(raw);
  }
  if (!resolved) { flashInvalid(); return; }
  if (bans.has(resolved)) { flashInvalid(); return; }
  if (!grid.querySelector(`.icon-cell[data-name="${resolved}"]`)) { flashInvalid(); return; }

  applyPicks(addPick(picks, resolved));
  nameInput.value = "";
  nameInput.classList.remove("invalid");
  hideSuggestions();
}

if (nameInput) {
  nameInput.addEventListener("input", () => {
    nameInput.classList.remove("invalid");
    refreshSuggestions();
  });
  nameInput.addEventListener("focus", () => {
    if (nameInput.value.trim()) refreshSuggestions();
  });
  nameInput.addEventListener("blur", () => {
    // Delay so a click on a suggestion can land before we hide.
    setTimeout(hideSuggestions, 150);
  });
  nameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleNameAdd();
      return;
    }
    if (e.key === "Escape") {
      hideSuggestions();
      return;
    }
    if (e.key === "ArrowDown" && !suggestEl.hidden) {
      e.preventDefault();
      moveActive(1);
      return;
    }
    if (e.key === "ArrowUp" && !suggestEl.hidden) {
      e.preventDefault();
      moveActive(-1);
      return;
    }
  });
}

if (suggestEl) {
  // mousedown (not click) so we beat the input's blur handler.
  suggestEl.addEventListener("mousedown", e => {
    const li = e.target.closest("li");
    if (!li) return;
    e.preventDefault();
    nameInput.value = li.dataset.name;
    activeIndex = -1;
    currentMatches = [];
    handleNameAdd();
  });
}

if (nameAddBtn) nameAddBtn.addEventListener("click", handleNameAdd);

// ── Results ────────────────────────────────────────────────────────────────

const outputEl = document.getElementById("output");
const calcHint = document.getElementById("calcHint");

function showCalcHint(show) {
  if (calcHint) calcHint.hidden = !show;
}

function makeCard(name, why) {
  const card = document.createElement("div");
  card.className = "counter-card";
  const img = document.createElement("img");
  img.src = `icons/${fileName(name)}`;
  img.alt = name;
  img.decoding = "async";
  const span = document.createElement("span");
  span.className = "name";
  span.textContent = name;
  if (why) card.title = why; // hover explains the matchup
  card.append(img, span);
  return card;
}

function renderResults({ scroll = false } = {}) {
  hasCalculated = true;

  const arr = [...picks, "", "", ""].slice(0, 3);
  const data = calculate(arr);
  let hiddenByBans = 0;

  outputEl.innerHTML = "";
  data.results.forEach(group => {
    const row = document.createElement("div"); row.className = "row";
    const sImg = document.createElement("img");
    sImg.className = "subject-icon";
    sImg.src = `icons/${fileName(group.brawler)}`;
    sImg.alt = group.brawler;
    sImg.decoding = "async";
    row.appendChild(sImg);

    const label = document.createElement("h3");
    label.innerHTML = `${group.brawler}<br>Counters:`;
    row.appendChild(label);

    const body = document.createElement("div");
    body.className = "row-body";

    const cards = document.createElement("div");
    cards.className = "output-grid";
    const visible = group.counters.filter(c => !bans.has(c));
    hiddenByBans += group.counters.length - visible.length;
    if (visible.length) {
      visible.forEach(c =>
        cards.appendChild(makeCard(c, matchupNotes[group.brawler]?.[c])));
    } else {
      const note = document.createElement("p");
      note.className = "no-data";
      note.textContent = group.counters.length
        ? `All of ${group.brawler}'s counters are banned.`
        : `${group.brawler} is brand new — no curated counter data yet. It will be added with the next data update.`;
      cards.appendChild(note);
    }
    body.appendChild(cards);

    if (group.classes.length) {
      const cls = document.createElement("p");
      cls.className = "class-note";
      cls.textContent = "Also weak to: " + group.classes.join(", ");
      body.appendChild(cls);
    }

    row.appendChild(body);
    outputEl.appendChild(row);
  });

  function renderOverlap(title, list, cls) {
    const visible = list.filter(n => !bans.has(n));
    hiddenByBans += list.length - visible.length;
    if (!visible.length) return;
    const row = document.createElement("div"); row.className = `row ${cls}`;
    const label = document.createElement("h3");
    label.innerHTML = title.replace(" ", "<br>");
    row.appendChild(label);
    const g = document.createElement("div"); g.className = "output-grid";
    visible.forEach(n => g.appendChild(makeCard(n)));
    row.appendChild(g);
    outputEl.appendChild(row);
  }
  renderOverlap("Double Overlaps:", data.doubleOverlaps, "overlap-double");
  renderOverlap("Triple Overlaps:", data.tripleOverlaps, "overlap-triple");

  if (hiddenByBans > 0) {
    const note = document.createElement("p");
    note.className = "ban-note";
    note.textContent = `${hiddenByBans} banned counter${hiddenByBans === 1 ? "" : "s"} hidden from results.`;
    outputEl.appendChild(note);
  }

  if (scroll && outputEl.firstChild) {
    outputEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function runCalc() {
  if (!picks.length) { showCalcHint(true); return; }
  showCalcHint(false);
  renderResults({ scroll: true });
}

document.getElementById("go").addEventListener("click", runCalc);
// Global Enter shortcut for keyboard users — but never when the user is
// interacting with a form control, link, grid icon, or the feedback modal
// (Enter must keep its native behavior there).
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const t = e.target;
  if (t instanceof Element &&
      t.closest('input, textarea, select, button, a, [role="button"], .modal-backdrop')) return;
  e.preventDefault();
  runCalc();
});

// ── Deep links: restore picks from ?p=Name,Name and show results ──────────
(function restoreFromUrl() {
  const param = new URLSearchParams(window.location.search).get("p");
  if (!param) return;
  let next = [];
  for (const part of param.split(",")) {
    const name = resolveName(part);
    if (name) next = addPick(next, name);
  }
  if (!next.length) return;
  applyPicks(next);
  renderResults({ scroll: false });
  // Shared links exist to show the result — bring it into view after layout.
  requestAnimationFrame(() => outputEl.scrollIntoView({ block: "start" }));
})();
