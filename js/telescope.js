/* Fuzzy picker and all telescope pickers. */

// The open picker, or null. Shape:
//   {title, items, preview, previewTitle, onMove, onCancel}  passed to openPicker()
//   {idx, list, prevTheme}                                   managed here
// Each item is {label, preview?: () => lines, run?: () => void}.
let picker = null;

// Matches q's characters in order inside s. Returns null if they don't all appear.
// Lower score is better: tight, early matches win.
function fuzzy(q, s){
  if (!q) return {score: 0, hits: []};
  const low = s.toLowerCase(), hits = [];
  let j = 0;
  for (let i = 0; i < low.length && j < q.length; i++){
    if (low[i] === q[j]){
      hits.push(i);
      j++;
    }
  }
  if (j < q.length) return null;
  const spread = hits[hits.length - 1] - hits[0];
  return {score: spread + hits[0] * 0.1, hits};
}

function openPicker(opts){
  closeFloats();
  picker = {preview: true, ...opts, idx: 0, list: [], prevTheme: state.theme};
  state.mode = "INSERT";
  $("#tele").hidden = false;
  $("#ttitle").textContent = picker.title;
  $("#ptitle").textContent = picker.previewTitle || "Preview";
  $(".tp").classList.toggle("nopreview", !picker.preview);
  $("#tin").value = "";
  filterPicker();
  renderBuf();
  renderCmd();
  $("#tin").focus();
}

// Re-runs the fuzzy match against the prompt text and re-renders.
function filterPicker(){
  const q = $("#tin").value.toLowerCase().replace(/\s/g, "");
  picker.list = picker.items
    .map((it, i) => ({it, i, m: fuzzy(q, it.label)}))
    .filter(x => x.m)
    .sort((a, b) => a.m.score - b.m.score || a.i - b.i);
  picker.idx = Math.min(picker.idx, Math.max(0, picker.list.length - 1));
  renderPicker();
}

function renderPicker(){
  const ul = $("#tlist");
  const rows = picker.list.map((x, i) => {
    const sel = i === picker.idx;
    const label = [...x.it.label]
      .map((ch, k) => x.m.hits.includes(k) ? `<span class="hl">${esc(ch)}</span>` : esc(ch))
      .join("");
    return `<li class="${sel ? "sel" : ""}" data-t="${i}"><span class="car">${sel ? "> " : "  "}</span>${label}</li>`;
  });
  // best match sits at the bottom, next to the prompt, like telescope
  ul.innerHTML = rows.reverse().join("");
  $("#tcnt").textContent = `${picker.list.length} / ${picker.items.length}`;
  ul.querySelector(".sel")?.scrollIntoView({block: "nearest"});

  const cur = picker.list[picker.idx];
  $("#tprev").innerHTML = cur && cur.it.preview ? cur.it.preview().map(l => render(l)).join("\n") : "";
  if (cur && picker.onMove) picker.onMove(cur.it);
}

function closePicker(cancel){
  if (!picker) return;
  if (cancel && picker.onCancel) picker.onCancel(picker);
  $("#tele").hidden = true;
  picker = null;
  state.mode = "NORMAL";
  msg("");
  renderAll();
}

// Closes the picker and runs the chosen item.
function pickItem(i){
  const x = picker && picker.list[i];
  const run = x && x.it.run;
  picker.onCancel = null;
  closePicker();
  if (run) run();
}

$("#tin").addEventListener("input", () => {
  picker.idx = 0;
  filterPicker();
});

// Up moves toward the top of the screen, which is a worse match (the list is reversed).
$("#tin").addEventListener("keydown", e => {
  e.stopPropagation();
  const k = e.key;
  if (k === "Escape" || (e.ctrlKey && k === "c")) closePicker(true);
  else if (k === "Enter") pickItem(picker.idx);
  else if (k === "ArrowUp" || (e.ctrlKey && k === "p")){
    picker.idx = Math.min(picker.idx + 1, picker.list.length - 1);
    renderPicker();
  }
  else if (k === "ArrowDown" || (e.ctrlKey && k === "n")){
    picker.idx = Math.max(picker.idx - 1, 0);
    renderPicker();
  }
  else return;
  e.preventDefault();
});

$("#tele").addEventListener("click", e => {
  const li = e.target.closest("[data-t]");
  if (li) pickItem(+li.dataset.t);
  else if (e.target.id === "tele") closePicker(true);
});

/* ---------- pickers ---------- */

const fileItem = f => ({label: f, preview: () => lines(f), run: () => openBuf(f)});

const PICKERS = {
  git_files: () => openPicker({
    title: "Git Files",
    items: FILES.map(fileItem),
  }),

  find_files: () => openPicker({
    title: "Find Files",
    items: FILES.filter(f => !f.startsWith(".")).map(fileItem),
  }),

  buffers: () => openPicker({
    title: "Buffers",
    items: state.open.map((b, i) => ({
      label: `${i + 1} ${title(b)}`,
      preview: () => lines(b),
      run: () => openBuf(b),
    })),
  }),

  // one item per *tag* in help.txt, previewing from that line down
  help_tags: () => {
    const L = lines("help.txt");
    const items = [];
    L.forEach((l, i) => {
      const tag = plain(l).match(/\*([^*]+)\*/);
      if (tag) items.push({label: tag[1], preview: () => L.slice(i), run: () => openBuf("help.txt", i)});
    });
    openPicker({title: "Help Tags", items});
  },

  current_buffer_fuzzy_find: () => {
    if (!state.cur) return err("E37: no buffer to search");
    const L = lines(state.cur);
    const items = L
      .map((l, i) => ({
        label: `${String(i + 1).padStart(3)}  ${plain(l)}`,
        run: () => {
          openBuf(state.cur);
          setLine(i);
          renderAll({center: true});
        },
      }))
      .filter(x => x.label.trim().length > 5); // skip blank lines
    openPicker({title: "Current Buffer Fuzzy", preview: false, items});
  },

  // live preview: moving the selection applies the theme, cancelling restores it
  colorscheme: () => openPicker({
    title: "Change Colorscheme",
    previewTitle: "coffee.lua",
    items: ["kanagawa", "kanagawa-dragon", "kanagawa-lotus", "rose-pine-moon"].map(t => ({
      label: t,
      preview: () => lines("coffee.lua"),
      run: () => setTheme(t),
    })),
    onMove: it => document.documentElement.dataset.theme = THEMES[it.label],
    onCancel: p => setTheme(p.prevTheme),
  }),

  // <C-f>: my projects, opening the repo on GitHub
  sessionizer: () => {
    loadGH();
    openPicker({
      title: "tmux-sessionizer",
      previewTitle: "projects.lua",
      items: PROJECTS.map(p => ({
        label: `~/personal/${p.name}`,
        preview: () => projectLines(p).map(l => l.slice(4)),
        run: () => window.open(`${GH}/${p.name}`, "_blank", "noopener"),
      })),
    });
  },
};

// :Telescope with no argument lists the other pickers (sessionizer is <C-f> only)
PICKERS.builtin = () => openPicker({
  title: "Telescope Builtin",
  preview: false,
  items: Object.keys(PICKERS)
    .filter(k => k !== "builtin" && k !== "sessionizer")
    .map(k => ({label: k, run: () => PICKERS[k]()})),
});
