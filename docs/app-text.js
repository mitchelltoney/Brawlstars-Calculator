
const brawlerNames = [
    "8bit","Amber","Angelo","Ash","Barley","Bea","Belle","Berry","Bibi","Bo","Bonnie","Brock",
    "Bull","Buster","Buzz","Byron","Carl","Charlie","Chester","Chuck","Clancy","Colette","Colt",
    "Cordelius","Crow","Darryl","Doug","Draco","Dynamike","Edgar","El Primo","Emz","Eve","Fang","Finx",
    "Frank","Gale","Gene","Gray","Griff","Grom","Gus","Hank","Jacky","Jae Young","Janet","Jessie","Juju","Kaze",
    "Kenji","Kit","Larry","Leon","Lily","Lola","Lou","Lumi","Maisie","Mandy","Max","Meeple","Meg",
    "Melodie","Mico","Moe","Mortis","Mr P","Nani","Nita","Ollie", "Otis","Pam","Pearl","Penny","Piper",
    "Poco","RT","Rico","Rosa","Ruffs","Sam","Sandy","Shade","Shelly","Spike","Sprout","Squeak",
    "Stu","Surge","Tara","Tick","Willow"
    ];
/* ---------- load Pyodide + python once ---------- */
const pyReady = (async () => {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage("micropip");
  const src = await (await fetch("pycode.py")).text();
  pyodide.runPython(src);
  return pyodide;
})();

/* ---------- build datalist ---------- */
const datalist = document.getElementById("brawlers");
brawlerNames.forEach(n => {
  const opt = document.createElement("option");
  opt.value = n;
  datalist.appendChild(opt);
});

/* ---------- calc & render ---------- */
const out = document.getElementById("output");

function makeCard(name){
    const card=document.createElement("div");
    card.className="counter-card";
    const img=document.createElement("img");
    img.src=`icons/${fileName(name)}`;
    img.alt=name;
    const span=document.createElement("span");
    span.className="name";span.textContent=name;
    card.append(img,span);
    return card;
  }
  

async function runCalc() {
  const picks = [
    document.getElementById("b1").value.trim(),
    document.getElementById("b2").value.trim(),
    document.getElementById("b3").value.trim()
  ].filter(Boolean);

  if (!picks.length) { alert("Enter at least one brawler"); return; }

  const py   = await pyReady;
  const calc = py.globals.get("calculate");
  const data = JSON.parse(calc(picks));

  out.innerHTML = "";                     // clear previous
  data.results.forEach(g => {
    const row = document.createElement("div"); row.className = "row";
    row.innerHTML =
      `<img class="subject-icon" src="icons/${g.brawler.toLowerCase().replace(/[\\s.']/g,'_')}.png" alt="${g.brawler}">
       <h3>${g.brawler}<br>Counters :</h3>`;
    const grid = document.createElement("div"); grid.className = "output-grid";
    g.counters.forEach(c => grid.appendChild(makeCard(c)));
    row.appendChild(grid);
    out.appendChild(row);
  });
}
    //pressing go
    document.getElementById("go").addEventListener("click", runCalc);
    //for enter key
    ['b1','b2','b3'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            runCalc();
        }
        });
    });