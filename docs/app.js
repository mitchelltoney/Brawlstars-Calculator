/* ----------  same master list  ---------- */
import { brawlerNames, brawlerNamesRarity } from "./brawlers.js";
console.log("gallion5.0 loaded")
    /* ----------  load Pyodide and python ---------- */
    const pyReady=(async()=>{
      const pyodide=await loadPyodide();
      await pyodide.loadPackage("micropip");
      const src=await (await fetch("pycode.py")).text();
      pyodide.runPython(src);
      return pyodide;
    })();

    pyReady.then(() => {
        const screen = document.getElementById('loading-screen');
        if (screen) screen.remove();
    });
    
    /* ----------  build the icon grid  ---------- */
    const grid=document.getElementById("iconGrid");
    const picks = [];
    const MAX = 3;
    let currentList = brawlerNames;

    function fileName(n){
      return n.toLowerCase().replace(/[\s.']/g,"_")+".png";
    }

    function buildGrid(list){
      grid.innerHTML="";
      list.forEach(n=>{
        const img=document.createElement("img");
        img.src=`icons/${fileName(n)}`;
        img.alt=img.title=n;
        img.dataset.name=n;
        if(picks.includes(n)) img.classList.add("selected");
        grid.appendChild(img);
      });
    }

    buildGrid(currentList);

    const sortBtn = document.getElementById("sortToggle");
    if (sortBtn) {
      sortBtn.textContent = "Alphabetical";
      sortBtn.addEventListener("click", () => {
        currentList = currentList === brawlerNames ? brawlerNamesRarity : brawlerNames;
        sortBtn.textContent = currentList === brawlerNames ? "Alphabetical" : "Rarity";
        buildGrid(currentList);
      });
    }
    
    grid.addEventListener("click", e => {
      const img  = e.target.closest("img");
      if (!img) return;
    
      const name = img.dataset.name;
      const i    = picks.indexOf(name);
    
      if (i !== -1) {                     // already selected ⇒ un-select
        picks.splice(i, 1);
        img.classList.remove("selected");
        return;
      }
    
      /* -------- select a new one -------- */
      if (picks.length === MAX) {
        /* drop the oldest (FIFO) */
        const oldest = picks.shift();
        const oldImg = grid.querySelector(`img[data-name="${oldest}"]`);
        if (oldImg) oldImg.classList.remove("selected");
      }
    
      picks.push(name);                   // add newest to the end
      img.classList.add("selected");
    });
    
    /* ----------  calculation & output  ---------- */
    const outputEl=document.getElementById("output");
    
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
    
    async function runCalc(){
      if(!picks.length){alert("Select at least one brawler");return;}
      const py=await pyReady;
      const calc=py.globals.get("calculate");
    
      /* pad with empty strings */
      const arr  = [...picks, "", "", ""].slice(0, 3);
      const raw  = calc(arr);
      const data=JSON.parse(raw);
    
      outputEl.innerHTML="";
      data.results.forEach(group=>{
        const row=document.createElement("div");row.className="row";
        const sImg=document.createElement("img");
        sImg.className="subject-icon";
        sImg.src=`icons/${fileName(group.brawler)}`;
        sImg.alt=group.brawler;
        row.appendChild(sImg);
    
        const label=document.createElement("h3");
        label.innerHTML=`${group.brawler}<br>Counters :`;
        row.appendChild(label);
    
        const grid=document.createElement("div");
        grid.className="output-grid";
        group.counters.forEach(c=>grid.appendChild(makeCard(c)));
        row.appendChild(grid);
        outputEl.appendChild(row);
      });
    
      function renderOverlap(title,list){
        if(!list.length) return;
        const row=document.createElement("div");row.className="row";
        const label=document.createElement("h3");
        label.innerHTML=title.replace(" ","<br>");
        row.appendChild(label);
        const g=document.createElement("div");g.className="output-grid";
        list.forEach(n=>g.appendChild(makeCard(n)));
        row.appendChild(g);
        outputEl.appendChild(row);
      }
      renderOverlap("Double Overlaps:",data.doubleOverlaps);
      renderOverlap("Triple Overlaps:",data.tripleOverlaps);
    }
    
    document.getElementById("go").addEventListener("click",runCalc);
    //for enter key
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          runCalc();
        }
      });
      