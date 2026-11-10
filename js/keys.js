/* Normal-mode keymaps and the global keydown handler. */

// Keys that would edit text. They only print an error: the website is read-only.
const NOMOD_KEYS = ["i", "a", "o", "O", "A", "I", "x", "p", "dd", "cc"];

// Normal-mode mappings. A leading space means <leader>.
// Each handler gets (count, hadCount): "5j" calls MAP.j(5, true), plain "j" calls MAP.j(1, false).
const MAP = {
  // hjkl, policed by hardtime
  "j": n => { if (hardtimeOk("j")) setLine(pos().l + n); },
  "k": n => { if (hardtimeOk("k")) setLine(pos().l - n); },
  "h": n => { if (hardtimeOk("h")) setCol(pos().c - n); },
  "l": n => { if (hardtimeOk("l")) setCol(pos().c + n); },

  // arrow keys, not policed
  "<ArrowDown>":  n => setLine(pos().l + n),
  "<ArrowUp>":    n => setLine(pos().l - n),
  "<ArrowLeft>":  n => setCol(pos().c - n),
  "<ArrowRight>": n => setCol(pos().c + n),

  // words and lines
  "w": n => { for (let i = 0; i < n; i++) wordFwd(); },
  "b": n => { for (let i = 0; i < n; i++) wordBack(); },
  "0": () => setCol(0),
  "^": () => setCol(firstNonBlank()),
  "$": () => { pos().want = Infinity; clampCol(); },

  // jumps
  "gg": (n, had) => { setLine(had ? n - 1 : 0);        setCol(firstNonBlank()); },
  "G":  (n, had) => { setLine(had ? n - 1 : Infinity); setCol(firstNonBlank()); },
  "zz": () => scrollFix(true),

  // tabs and links
  "gt": n => cycle(n),
  "gT": n => cycle(-n),
  "gx":      openLine,
  "<Enter>": openLine,

  // oil and telescope
  "-":   openOil,
  " sf": openOil,
  " vf": () => PICKERS.find_files(),
  " cb": () => PICKERS.buffers(),
  " /":  () => PICKERS.current_buffer_fuzzy_find(),
  " vh": () => PICKERS.help_tags(),

  // zen, harpoon, lsp
  " zz": () => zen(1),
  " zZ": () => zen(2),
  " a":  harpoonAdd,
  " zl": () => runCmd("LspRestart"),

  // command line and help
  ":": openCmd,
  "?": () => openBuf("help.txt"),

  // things that do nothing, or refuse politely
  "Q":  () => {},
  "u":  () => msg("Already at oldest change"),
  "ZZ": ro,
  ...Object.fromEntries(NOMOD_KEYS.map(k => [k, nomod])),
};

// Mappings that render on their own (or open something), so normalKey skips its redraw.
const NO_RERENDER = new Set(["gt", "gT", ":", "-", " sf", " vf", " cb", " /", " vh", " zz", " zZ", "gx", "<Enter>", "?"]);

// Mappings that still run on the intro screen, when no buffer is open.
const WORKS_WITHOUT_BUFFER = new Set(["Q", "u", "ZZ", ...NOMOD_KEYS]);

function resetPending(){
  state.seq = "";
  state.count = "";
}

// Builds up a key sequence (count + keys) until it matches a mapping.
function normalKey(e){
  const k = e.key;
  const tok = k.length === 1 ? k : `<${k}>`;

  if (k === "Escape"){
    resetPending();
    renderCmd();
    return;
  }

  // ignore special keys we have no mapping for (Shift, F5, ...)
  if (k.length > 1 && !MAP[tok]) return;

  // a count: 1-9 starts it, 0 only continues it ("0" alone is a motion)
  const startsCount = /^[1-9]$/.test(k);
  const continuesCount = k === "0" && state.count;
  if (!state.seq && (startsCount || continuesCount)){
    state.count += k;
    renderCmd();
    e.preventDefault();
    return;
  }

  // a special key cancels a half-typed sequence
  if (state.seq && k.length > 1) state.seq = "";
  state.seq += tok;
  const s = state.seq;

  if (MAP[s]){
    const had = !!state.count;
    const n = parseInt(state.count || "1");
    resetPending();
    e.preventDefault();

    const moving = !NO_RERENDER.has(s);
    if (!state.cur && moving && !WORKS_WITHOUT_BUFFER.has(s)){
      renderCmd();
      return;
    }

    MAP[s](n, had);
    if (moving && state.mode === "NORMAL"){
      renderBuf({center: s === "zz"});
      renderStatus();
    }
    renderCmd();
    return;
  }

  // a prefix of a longer mapping (like "g" before "gg"): wait for the next key
  if (Object.keys(MAP).some(x => x.startsWith(s))){
    e.preventDefault();
    renderCmd();
    return;
  }

  resetPending();
  renderCmd();
}

// Ctrl mappings. A handler that returns false lets the browser keep the key.
function ctrlKey(e){
  const k = e.key.toLowerCase();
  const half = Math.max(1, Math.floor($("#buf").clientHeight / LH() / 2));
  const halfPage = dir => {
    setLine(pos().l + dir * half);
    renderBuf({center: true});
    renderStatus();
  };

  const act = {
    p: () => PICKERS.git_files(),
    f: () => PICKERS.sessionizer(),
    e: openHarpoon,
    t: () => harpoonSelect(0),
    g: () => harpoonSelect(1),
    b: () => harpoonSelect(2),
    n: () => harpoonSelect(3),
    d: () => halfPage(1),
    u: () => halfPage(-1),
    c: () => {
      // let <C-c> copy if the visitor selected text
      if (window.getSelection().toString()) return false;
      msg("Type  :qa!  and press <Enter> to abandon all changes and exit Nvim");
    },
  }[k];

  if (!act) return;
  if (act() !== false) e.preventDefault();
}

// Routes every keypress that isn't typed into an input.
document.addEventListener("keydown", e => {
  if (e.target.matches("input")) return;
  if (!$("#shell").hidden){
    $("#shin")?.focus();
    return;
  }
  if (e.metaKey || e.altKey) return;
  if (state.mode === "HARPOON") return harpoonKey(e);
  if (state.mode !== "NORMAL") return;
  if (e.ctrlKey) return ctrlKey(e);
  normalKey(e);
});
