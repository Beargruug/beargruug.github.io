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
/* ---------- statusline: lualine, theme = "kanagawa", default sections ---------- */
// | a: mode > b: branch, diff > c: filename      x: harpoon, cat, coffee, fileformat, filetype < y: progress < z: location |
// Harpoon, cat and coffee are website extras: the harpoon numbers are the mouse navigation.
// Colors per mode live in css/style.css under "statusline".

const LUALINE_MODE = {NORMAL: "normal", HARPOON: "normal", INSERT: "insert", COMMAND: "command"};

// Only touches the mode block, so mode switches don't need a full statusline redraw.
function renderMode(){
  const mode = LUALINE_MODE[state.mode] || "normal";
  $("#status").dataset.mode = mode;
  const el = $("#status .sl-mode");
  if (el) el.textContent = mode.toUpperCase();
}

// lualine "diff": counts this buffer's gutter signs, like gitsigns would
function gitDiff(){
  const signs = state.cur && B[state.cur].signs ? Object.values(B[state.cur].signs()) : [];
  const count = cls => signs.filter(s => s[1] === cls).length;
  return [["+", count("s-add"), "sl-add"], ["~", count("s-chg"), "sl-chg"]]
    .filter(([, n]) => n)
    .map(([sym, n, cls]) => `<span class="${cls}">${sym}${n}</span>`)
    .join(" ");
}

// Nerd Font icons, redrawn as inline SVG / plain glyphs (the web font has no Nerd Font glyphs).
const SL_ICON = {
  // nf-dev-git_branch, in front of the branch name
  branch: `<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="4.5" cy="3.5" r="1.8"/><circle cx="4.5" cy="12.5" r="1.8"/><circle cx="11.5" cy="5" r="1.8"/><path d="M4.5 5.3v5.4M11.5 6.8c0 3-7 2.2-7 4"/></svg>`,
  // lualine "fileformat" for unix: Tux
  unix: `<svg class="ic" viewBox="0 0 16 16" aria-label="unix"><mask id="tuxm"><rect width="16" height="16" fill="#fff"/><ellipse cx="8" cy="10.8" rx="2.4" ry="3.2" fill="#000"/><circle cx="6.8" cy="4.2" r=".7" fill="#000"/><circle cx="9.2" cy="4.2" r=".7" fill="#000"/></mask><g fill="currentColor" mask="url(#tuxm)"><ellipse cx="8" cy="4.6" rx="3" ry="3.4"/><ellipse cx="8" cy="10.2" rx="4.6" ry="4.8"/></g><g fill="currentColor"><ellipse cx="4.8" cy="15" rx="2.4" ry="1"/><ellipse cx="11.2" cy="15" rx="2.4" ry="1"/></g></svg>`,
};
// nvim-web-devicons stand-ins for lualine "filetype"
const FT_ICON = {lua: "☾", markdown: "#", oil: "≡", git: "±", help: "?", checkhealth: "+", text: "·"};

// lualine "progress": based on the cursor line, not the scroll position
function cursorProgress(){
  if (!state.cur) return "Top";
  const cur = pos().l + 1, total = lines(state.cur).length;
  if (cur === 1) return "Top";
  if (cur === total) return "Bot";
  return String(Math.floor(cur / total * 100)).padStart(2) + "%";
}

// lualine "location": "%3l:%-2v"
function cursorLocation(){
  const p = pos();
  return state.cur ? `${String(p.l + 1).padStart(3)}:${String(p.c + 1).padEnd(2)}` : "  1:1 ";
}

function renderStatus(){
  const name = state.cur ? title(state.cur) : "[No Name]";
  const mod = state.cur === "coffee.lua" && state.touched ? " [+]" : "";
  const lvl = Math.round(state.coffee);
  const ft = state.cur ? B[state.cur].ft : "";
  const diff = gitDiff();
  const walking = $(".walker");

  const harp = state.harpoon.map((f, i) => {
    const s = f.startsWith(".") ? f : f.replace(/\.\w+$/, "");
    return `<button class="hp${f === state.cur ? " on" : ""}" data-harp="${i}" title="${f}">${i + 1}<span class="hn"> ${s}</span></button>`;
  }).join("");

  // Separators: "pl" is a section arrow ("ab" = from section a into b), "cs" a thin component arrow.
  // On small screens sections b and y are hidden, so "ac"/"ca" arrows join a and c directly.
  const right = cls => `<span class="pl r ${cls}"></span>`;
  const left = cls => `<span class="pl l ${cls}"></span>`;
  const cs = (cls = "") => `<span class="cs ${cls}"></span>`;

  $("#status").innerHTML =
    // left: a > b > c
    `<span class="sl-a sl-mode"></span>` +
    right("ab hide-sm") +
    `<span class="sl-b hide-sm">${SL_ICON.branch} main</span>` +
    (diff ? cs("sl-b hide-sm") + `<span class="sl-b hide-sm">${diff}</span>` : "") +
    right("bc hide-sm") +
    right("ac show-sm") +
    `<span class="sl-c sl-name">${esc(name)}${mod}</span>` +
    `<span class="fill"></span>` +
    // right: x < y < z
    `<span class="sl-harp">${harp}</span>` +
    cs("hide-sm") + `<span class="hide-sm">${walking ? "        " : "=^-.-^= z"}</span>` +
    cs() + `<span class="${lvl < 20 ? "low" : ""}" title="coffee level">☕ ${lvl}%</span>` +
    cs("hide-sm") + `<span class="hide-sm">${SL_ICON.unix}</span>` +
    (ft ? cs("hide-sm") + `<span class="hide-sm">${FT_ICON[ft] || "·"} ${ft}</span>` : "") +
    left("cb hide-sm") +
    `<span class="sl-b hide-sm">${cursorProgress()}</span>` +
    left("ba hide-sm") +
    left("ca show-sm") +
    `<span class="sl-a">${cursorLocation()}</span>`;
  renderMode();
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
  renderMode();
  $("#showcmd").textContent = (state.count + state.seq).replace(/ /g, "<Space>").slice(-10);
}
function renderAll(opts){ renderTabs(); renderBuf(opts); renderStatus(); renderCmd(); }

function msg(text, err = false){ const m = $("#msg"); m.textContent = text; m.className = err ? "err" : ""; }
const err = t => msg(t, true);
