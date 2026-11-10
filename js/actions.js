/* Tabs, buffers, links, harpoon marks, coffee, cat, theme, zen, hardtime. */

function openBuf(n, line){
  if (!B[n]) return;
  if (!state.open.includes(n)) state.open.push(n);
  let t = state.tabs.indexOf(n);
  if (t < 0){ state.tabs.push(n); t = state.tabs.length - 1; }
  setTab(t, false);
  if (line != null){ setLine(line); setCol(0); }
  closeFloats();
  $("#buf").scrollTop = 0;
  renderAll();
  if (n !== "oil"){
    const L = lines(n);
    msg(`"${title(n)}" ${L.length}L, ${L.map(plain).join("\n").length}B`);
  } else msg("");
  if (B[n].ft === "lua") lspProgress();
  if (n === "monkeytype.lua") loadMT();
  if (n === "projects.lua") loadGH();
}
function openOil(){
  const from = state.cur;
  openBuf("oil");
  const i = FILES.indexOf(from);
  if (i >= 0){ setLine(i); renderAll(); }
  pos().want = 2; clampCol(); renderBuf();
}
function setTab(i, render = true){
  state.tab = Math.max(0, Math.min(i, state.tabs.length - 1));
  state.cur = state.tabs[state.tab];
  if (render){ closeFloats(); renderAll(); msg(""); }
}
function closeTab(i = state.tab){
  if (state.tabs.length === 1) return err("E784: Cannot close last tab page");
  const n = state.tabs[i];
  state.tabs.splice(i, 1);
  if (n && !state.tabs.includes(n)) state.open.splice(state.open.indexOf(n), 1);
  setTab(i < state.tab || state.tab >= state.tabs.length ? state.tab - (i < state.tab ? 1 : 0) : state.tab);
}
function closeBuf(n = state.cur){ const i = state.tabs.indexOf(n); closeTab(i < 0 ? state.tab : i); }
function cycle(d){ setTab((state.tab + d + state.tabs.length) % state.tabs.length); }
function openIntro(){ const i = state.tabs.indexOf(null); if (i >= 0) setTab(i); else { state.tabs.push(null); setTab(state.tabs.length - 1); } }
function renderTabs(){
  $("#tabline").innerHTML = state.tabs.map((b, i) => {
    const label = b === null ? "intro" : b === "oil" ? "oil" : b === "gitlog" ? "git log" : b;
    const mod = b === "coffee.lua" && state.touched ? "+ " : "";
    return `<span class="tab${i === state.tab ? " on" : ""}"><button data-tab="${i}">${mod}${esc(label)}</button>` +
      (state.tabs.length > 1 && b !== null ? `<button class="tcl" data-tabclose="${i}" aria-label="Close ${esc(label)}">×</button>` : "") + `</span>`;
  }).join("");
  $("#tabline .on")?.scrollIntoView({inline: "nearest", block: "nearest"});
}
function openLine(){
  if (!state.cur) return;
  const raw = lines(state.cur)[pos().l] || "";
  if (state.cur === "oil"){ const f = plain(raw).slice(2); if (B[f]) openBuf(f); return; }
  const u = urlOf(raw);
  if (u && u.startsWith("buf:")) return openBuf(u.slice(4));
  if (u) window.open(u, "_blank", "noopener"); else err("E447: No link under cursor");
}
function harpoonSelect(i){
  const f = state.harpoon[i];
  if (f) openBuf(f); else notify(`no mark at ${i + 1}`, "harpoon");
}
function harpoonAdd(){
  if (!state.cur || state.cur === "oil") return;
  if (state.harpoon.includes(state.cur)) return notify(`${state.cur} is already marked`, "harpoon");
  state.harpoon.push(state.cur); renderStatus();
  notify(`added ${state.cur} as mark ${state.harpoon.length}`, "harpoon");
}
function refill(){
  state.coffee = 100; state.cups++; state.warned = false;
  notify(state.cups === 1 ? "brewed a fresh cup" : `cup number ${state.cups}. no judgement.`, "coffee.lua");
  renderAll();
}
function walkCat(){
  if (reduced){ msg("the cat is asleep in the statusline. better not."); return; }
  if (state.zen){ msg("the cat doesn't do zen mode."); return; }
  if ($(".walker")) { msg("the cat is already out."); return; }
  const w = document.createElement("span");
  w.className = "walker"; w.textContent = "=^..^=";
  w.addEventListener("animationend", () => { w.remove(); renderStatus(); notify("the cat went back to sleep", ".cat"); });
  $("#status").appendChild(w); renderStatus();
  msg("meow.");
}
function setTheme(name){ state.theme = name; document.documentElement.dataset.theme = THEMES[name]; }
function zen(level){
  state.zen = state.zen === level ? 0 : level;
  const n = $("#nvim");
  n.classList.toggle("zen", !!state.zen);
  n.classList.toggle("nonu", state.zen === 2);
  n.classList.toggle("nocc", state.zen === 2);
  renderAll();
}
function hardtimeOk(k){
  if (!state.hardtime) return true;
  const h = state.hard, now = performance.now();
  if (h.k === k && now - h.t < 1000) h.n++; else h.n = 1;
  h.k = k; h.t = now;
  if (h.n > 3){ h.n = 0; notify(`You pressed the ${k} key too soon!`, "hardtime", "warn", 2200); return false; }
  return true;
}
const ro = () => err("E45: 'readonly' option is set (it's a website)");
const nomod = () => err("E21: Cannot make changes, 'modifiable' is off");
