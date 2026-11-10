/* Draws the buffer, statusline, intro screen and command-line messages. */

function renderBuf(opts = {}){
  const el = $("#buf");
  const L = state.cur ? lines(state.cur) : [""];
  const p = pos();
  const signs = state.cur && B[state.cur].signs ? B[state.cur].signs() : {};
  const showCursor = state.mode === "NORMAL" || state.mode === "HARPOON";
  let html = `<div class="lines">`;
  L.forEach((ln, i) => {
    const nr = i === p.l ? i + 1 : Math.abs(i - p.l);
    const sg = signs[i];
    html += `<div class="ln real" data-i="${i}"><span class="sg ${sg ? sg[1] : ""}">${sg ? sg[0] : ""}</span><span class="nr${i === p.l ? " cnr" : ""}">${nr}</span><span class="tx">${render(ln, i === p.l && showCursor ? p.c : -1)}</span></div>`;
  });
  const rows = Math.ceil(el.clientHeight / LH());
  for (let i = L.length; i < rows; i++) html += `<div class="ln eob">~</div>`;
  el.innerHTML = html + "</div>";
  $("#intro").hidden = !!state.cur;
  if (state.cur) scrollFix(opts.center);
}
function scrollFix(center){
  const el = $("#buf"), lh = LH(), row = el.querySelector(".ln[data-i='" + pos().l + "']");
  if (!row) return;
  const top = row.offsetTop, h = el.clientHeight, so = Math.min(8 * lh, (h - lh) / 2);
  if (center) el.scrollTop = top - h / 2 + lh / 2;
  else if (top - el.scrollTop < so) el.scrollTop = top - so;
  else if (el.scrollTop + h - (top + lh) < so) el.scrollTop = top + lh + so - h;
}
function rulerPct(){
  if (!state.cur) return "All";
  const el = $("#buf"), n = lines(state.cur).length, lh = LH();
  const vis = Math.floor(el.clientHeight / lh);
  if (n <= vis) return "All";
  const first = Math.round(el.scrollTop / lh);
  if (first <= 0) return "Top";
  if (first + vis >= n) return "Bot";
  return Math.round(first / (n - vis) * 100) + "%";
}
function renderStatus(){
  const p = pos();
  const name = state.cur ? title(state.cur) : "[No Name]";
  const mod = state.cur === "coffee.lua" && state.touched ? " [+]" : "";
  const lvl = Math.round(state.coffee);
  const harp = state.harpoon.map((f, i) => {
    const s = f.startsWith(".") ? f : f.replace(/\.\w+$/, "");
    return `<button class="hp${f === state.cur ? " on" : ""}" data-harp="${i}" title="${f}">${i + 1}<span class="hn"> ${s}</span></button>`;
  }).join("");
  const walking = $(".walker");
  const ruler = state.cur ? `${p.l + 1},${p.c + 1}` : "0,0-1";
  $("#status").innerHTML =
    `<span>${esc(name)}${mod}</span><span class="fill"></span>${harp}` +
    `<span class="hide-sm">${walking ? "        " : "=^-.-^= z"}</span>` +
    `<span class="${lvl < 20 ? "low" : ""}" title="coffee level">☕ ${lvl}%</span>` +
    `<span>${ruler.padEnd(10)}${rulerPct().padStart(3)}</span>`;
  if (walking) $("#status").appendChild(walking);
}
function renderIntro(){
  const items = [
    ["e about.md", ":e about.md<Enter>", "to read about me", "about me"],
    ["e projects.lua", ":e projects.lua<Enter>", "for things I've built", "projects"],
    ["e bootdev.md", ":e bootdev.md<Enter>", "for my boot.dev journey", "boot.dev"],
    ["Monkeytype", ":Monkeytype<Enter>", "to race me", "typing test"],
    ["e contact.md", ":e contact.md<Enter>", "to say hello", "contact"],
    ["Harpoon", "<C-e>", "for harpoon", "harpoon"],
    ["Oil", "-", "to browse files", "all files"],
    ["help", ":help<Enter>", "if you are new!", "help"],
    ["q!", ":q!<Enter>", "to exit", "exit"],
  ];
  $("#intro").innerHTML = `
    <div class="in-name">Fabian Scheid</div>
    <div class="in-sub">developer at refine studio, germany</div>
    <div class="in-sub">coffee, cats, husband, father of three </div>
    <div class="in-list">${items.map(([c, k, d, m]) => `<button data-cmd="${c}"><span class="d">type  </span><span class="k">${esc(k.padEnd(24))}</span><span class="d">${d}</span><span class="mlbl">${m}</span></button>`).join("")}</div>`;
}
function renderCmd(){
  const m = $("#msg");
  if (state.mode === "INSERT"){ m.textContent = "-- INSERT --"; m.className = "mode"; }
  $("#showcmd").textContent = (state.count + state.seq).replace(/ /g, "<Space>").slice(-10);
}
function renderAll(opts){ renderTabs(); renderBuf(opts); renderStatus(); renderCmd(); }

function msg(text, err = false){ const m = $("#msg"); m.textContent = text; m.className = err ? "err" : ""; }
const err = t => msg(t, true);
