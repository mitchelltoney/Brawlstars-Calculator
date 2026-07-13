import { calculate, brawlersAlphabetical } from "./calculate.js?v=2026-07-13.3";

function fileName(n) {
  return n.toLowerCase().replace(/[\s.'-]/g, "_") + ".webp";
}

const dl = document.getElementById("brawlers");
brawlersAlphabetical.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n;
  dl.appendChild(opt);
});

const out = document.getElementById("output");
const inputs = ["b1", "b2", "b3"].map(id => document.getElementById(id));

function makeCard(name) {
  const card = document.createElement("div");
  card.className = "counter-card";
  card.innerHTML = `
    <img src="icons/${fileName(name)}" alt="${name}">
    <span class="name">${name}</span>`;
  return card;
}

function runCalc() {
  const picks = inputs.map(i => i.value.trim()).filter(Boolean);
  if (!picks.length) { alert("Enter at least one brawler"); return; }

  const data = calculate(picks);

  out.innerHTML = "";
  data.results.forEach(g => {
    const row = document.createElement("div"); row.className = "row";
    row.innerHTML = `
      <img class="subject-icon" src="icons/${fileName(g.brawler)}" alt="${g.brawler}">
      <h3>${g.brawler}<br>Counters :</h3>`;
    const grid = document.createElement("div"); grid.className = "output-grid";
    g.counters.forEach(c => grid.appendChild(makeCard(c)));
    row.appendChild(grid);
    out.appendChild(row);
  });

  const renderOverlap = (title, list) => {
    if (!list.length) return;
    const r = document.createElement("div"); r.className = "row";
    r.innerHTML = `<h3>${title.replace(" ", "<br>")}</h3>`;
    const g = document.createElement("div"); g.className = "output-grid";
    list.forEach(n => g.appendChild(makeCard(n)));
    r.appendChild(g);
    out.appendChild(r);
  };
  renderOverlap("Double Overlaps:", data.doubleOverlaps);
  renderOverlap("Triple Overlaps:", data.tripleOverlaps);
}

document.getElementById("go").addEventListener("click", runCalc);
["b1", "b2", "b3"].forEach(id => {
  document.getElementById(id).addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCalc();
    }
  });
});
