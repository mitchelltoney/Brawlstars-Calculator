
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
/* ---------- helper identical to app.js ---------- */
function fileName(n){
    return n.toLowerCase().replace(/[\s.']/g,"_") + ".png";
  }
  
  /* ---------- load Pyodide + Python once ---------- */
  const pyReady = (async () => {
    const pyodide = await loadPyodide();
    await pyodide.loadPackage("micropip");
    const src = await (await fetch("pycode.py")).text();
    pyodide.runPython(src);
    return pyodide;
  })();
  
  /* ---------- build the datalist for auto-complete ---------- */
  const dl = document.getElementById("brawlers");
  brawlerNames.forEach(n => {
    const opt = document.createElement("option");
    opt.value = n;
    dl.appendChild(opt);
  });
  
  /* ---------- DOM handles ---------- */
  const out = document.getElementById("output");
  const inputs = ["b1","b2","b3"].map(id => document.getElementById(id));
  
  /* ---------- card factory ---------- */
  function makeCard(name){
    const card = document.createElement("div");
    card.className = "counter-card";
    card.innerHTML = `
      <img src="icons/${fileName(name)}" alt="${name}">
      <span class="name">${name}</span>`;
    return card;
  }
  
  /* ---------- main calculation ---------- */
  async function runCalc(){
    const picks = inputs.map(i => i.value.trim()).filter(Boolean);
    if (!picks.length){ alert("Enter at least one brawler"); return; }
  
    const py   = await pyReady;
    const calc = py.globals.get("calculate");
    const data = JSON.parse(calc(picks));
  
    out.innerHTML = "";                               // clear previous
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
      r.innerHTML = `<h3>${title.replace(" ","<br>")}</h3>`;
      const g = document.createElement("div"); g.className = "output-grid";
      list.forEach(n => g.appendChild(makeCard(n)));
      r.appendChild(g);
      out.appendChild(r);
    };
    renderOverlap("Double Overlaps:",  data.doubleOverlaps);
    renderOverlap("Triple Overlaps:",  data.tripleOverlaps);
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