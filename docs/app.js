import { calculate, brawlersAlphabetical, rarityOrder } from "./calculate.js";

const grid = document.getElementById("iconGrid");
const picks = [];
const MAX = 3;
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

const sortBtn = document.getElementById("sortToggle");
if (sortBtn) {
  sortBtn.textContent = "Rarity";
  sortBtn.addEventListener("click", () => {
    currentList = currentList === brawlersAlphabetical ? rarityOrder : brawlersAlphabetical;
    sortBtn.textContent = currentList === brawlersAlphabetical ? "Alphabetical" : "Rarity";
    buildGrid(currentList);
  });
}

grid.addEventListener("click", e => {
  const img = e.target.closest("img");
  if (!img) return;

  const name = img.dataset.name;
  const i = picks.indexOf(name);

  if (i !== -1) {
    picks.splice(i, 1);
    img.classList.remove("selected");
    return;
  }

  if (picks.length === MAX) {
    const oldest = picks.shift();
    const oldImg = grid.querySelector(`img[data-name="${oldest}"]`);
    if (oldImg) oldImg.classList.remove("selected");
  }

  picks.push(name);
  img.classList.add("selected");
});

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
