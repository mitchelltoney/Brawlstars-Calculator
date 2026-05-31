import {
  calculate,
  brawlersAlphabetical,
  rarityOrder,
  resolveName,
  addPick,
  togglePick,
} from "./calculate.js";

const grid = document.getElementById("iconGrid");
const picks = [];
let currentList = rarityOrder;

function fileName(n) {
  return n.toLowerCase().replace(/[\s.']/g, "_") + ".png";
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

// Populate the type-a-name datalist from the canonical roster.
const datalist = document.getElementById("brawlerList");
brawlersAlphabetical.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n;
  datalist.appendChild(opt);
});

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
}

grid.addEventListener("click", e => {
  const img = e.target.closest("img");
  if (!img) return;
  applyPicks(togglePick(picks, img.dataset.name));
});

// Type-a-name input: additive, no toggling. Confirms on Enter or Add click.
const nameInput = document.getElementById("nameAdd");
const nameAddBtn = document.getElementById("nameAddBtn");

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
  const resolved = resolveName(raw);
  if (!resolved) { flashInvalid(); return; }
  // The grid must contain this brawler's icon; if it doesn't (roster /
  // grid out of sync — shouldn't happen), bail without mutating picks.
  if (!grid.querySelector(`img[data-name="${resolved}"]`)) { flashInvalid(); return; }
  applyPicks(addPick(picks, resolved));
  nameInput.value = "";
  nameInput.classList.remove("invalid");
}

if (nameInput) {
  nameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      // Add the brawler and prevent the global Enter→Calculate path below.
      e.preventDefault();
      e.stopPropagation();
      handleNameAdd();
    }
  });
  nameInput.addEventListener("input", () => nameInput.classList.remove("invalid"));
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

function runCalc() {
  if (!picks.length) { alert("Select at least one brawler"); return; }

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
    group.counters.forEach(c => cards.appendChild(makeCard(c)));
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
document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    runCalc();
  }
});
