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
} from "./calculate.js";

const freshnessEl = document.getElementById("dataFreshness");
if (freshnessEl) freshnessEl.textContent = dataUpdated;

const grid = document.getElementById("iconGrid");
const picks = [];
let currentList = rarityOrder;

function fileName(n) {
  return n.toLowerCase().replace(/[\s.'-]/g, "_") + ".png";
}

function buildGrid(list) {
  grid.innerHTML = "";
  list.forEach(n => {
    const img = document.createElement("img");
    img.src = `icons/${fileName(n)}`;
    img.alt = img.title = n;
    img.dataset.name = n;
    if (picks.includes(n)) img.classList.add("selected");
    grid.appendChild(img);
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
      const img = grid.querySelector(`img[data-name="${old}"]`);
      if (img) img.classList.remove("selected");
    }
  }
  for (const name of next) {
    if (!picks.includes(name)) {
      const img = grid.querySelector(`img[data-name="${name}"]`);
      if (img) img.classList.add("selected");
    }
  }
  picks.length = 0;
  picks.push(...next);
  if (picks.length) showCalcHint(false);
}

grid.addEventListener("click", e => {
  const img = e.target.closest("img");
  if (!img) return;
  applyPicks(togglePick(picks, img.dataset.name));
});

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
  //   2. resolveName: exact case-insensitive + primo/miko/mike/barry aliases.
  //   3. Unique-prefix fallback: "Br" → Brock when Brock is the only roster
  //      name starting with "Br".
  let resolved = null;
  if (activeIndex >= 0 && currentMatches[activeIndex]) {
    resolved = currentMatches[activeIndex];
  } else {
    resolved = resolveName(raw) || resolveUniquePrefix(raw);
  }
  if (!resolved) { flashInvalid(); return; }
  if (!grid.querySelector(`img[data-name="${resolved}"]`)) { flashInvalid(); return; }

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

const outputEl = document.getElementById("output");

function makeCard(name) {
  const card = document.createElement("div");
  card.className = "counter-card";
  const img = document.createElement("img");
  img.src = `icons/${fileName(name)}`;
  img.alt = name;
  const span = document.createElement("span");
  span.className = "name";
  span.textContent = name;
  card.append(img, span);
  return card;
}

const calcHint = document.getElementById("calcHint");

function showCalcHint(show) {
  if (calcHint) calcHint.hidden = !show;
}

function runCalc() {
  if (!picks.length) { showCalcHint(true); return; }
  showCalcHint(false);

  const arr = [...picks, "", "", ""].slice(0, 3);
  const data = calculate(arr);

  outputEl.innerHTML = "";
  data.results.forEach(group => {
    const row = document.createElement("div"); row.className = "row";
    const sImg = document.createElement("img");
    sImg.className = "subject-icon";
    sImg.src = `icons/${fileName(group.brawler)}`;
    sImg.alt = group.brawler;
    row.appendChild(sImg);

    const label = document.createElement("h3");
    label.innerHTML = `${group.brawler}<br>Counters:`;
    row.appendChild(label);

    const cards = document.createElement("div");
    cards.className = "output-grid";
    if (group.counters.length) {
      group.counters.forEach(c => cards.appendChild(makeCard(c)));
    } else {
      const note = document.createElement("p");
      note.className = "no-data";
      note.textContent = `${group.brawler} is brand new — no curated counter data yet. It will be added with the next data update.`;
      cards.appendChild(note);
    }
    row.appendChild(cards);
    outputEl.appendChild(row);
  });

  function renderOverlap(title, list, cls) {
    if (!list.length) return;
    const row = document.createElement("div"); row.className = `row ${cls}`;
    const label = document.createElement("h3");
    label.innerHTML = title.replace(" ", "<br>");
    row.appendChild(label);
    const g = document.createElement("div"); g.className = "output-grid";
    list.forEach(n => g.appendChild(makeCard(n)));
    row.appendChild(g);
    outputEl.appendChild(row);
  }
  renderOverlap("Double Overlaps:", data.doubleOverlaps, "overlap-double");
  renderOverlap("Triple Overlaps:", data.tripleOverlaps, "overlap-triple");
}

document.getElementById("go").addEventListener("click", runCalc);
// Global Enter shortcut for keyboard users — but never when the user is
// interacting with a form control, link, or the feedback modal (Enter must
// keep its native behavior there: submitting the form, pressing the button).
document.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const t = e.target;
  if (t instanceof Element &&
      t.closest("input, textarea, select, button, a, .modal-backdrop")) return;
  e.preventDefault();
  runCalc();
});
