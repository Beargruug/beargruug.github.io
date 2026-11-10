/* :ex commands. */

function runCmd(raw){
  const s = raw.trim(); if (!s) return;
  if (/^\d+$/.test(s)){ if (state.cur){ setLine(+s - 1); setCol(firstNonBlank()); renderAll(); } return; }
  const [c, ...rest] = s.split(/\s+/); const arg = rest.join(" ");
  const pages = {about:"about.md", projects:"projects.lua", contact:"contact.md"};
  const C = {
    q: () => err("E37: No write since last change (add ! to override)"),
    "q!": quit, "qa!": quit, "qall!": quit,
    w: ro, wq: ro, x: ro, wa: ro, "w!": ro,
    e: () => {
      if (!arg) return err("E32: No file name");
      if (arg === "." || arg === "./") return openOil();
      const f = Object.keys(B).find(k => k === arg) || FILES.find(k => k.startsWith(arg));
      f ? openBuf(f) : err(`E484: Can't open file ${arg}`);
    },
    h: () => openBuf("help.txt", arg ? tagLine(arg) : 0),
    coffee: refill, cat: walkCat,
    colorscheme: () => {
      if (!arg) return msg(state.theme);
      if (THEMES[arg]){ setTheme(arg); return msg(""); }
      err(`E185: Cannot find color scheme '${arg}'`);
    },
    checkhealth: () => openBuf("checkhealth"),
    bd: () => closeBuf(), bn: () => cycle(1), bp: () => cycle(-1),
    ls: () => msg(state.open.map((b, i) => `${i + 1}${b === state.cur ? " %a" : "   "} "${title(b)}"`).join("   ") || "no buffers"),
    Oil: openOil,
    Monkeytype: startTest,
    Git: () => /^log\b/.test(arg) ? openBuf("gitlog") : err(`fugitive: only :Git log works on this website`),
    Telescope: () => { const p = PICKERS[arg || "builtin"]; p ? p() : err(`[telescope.run_command]: Unknown command: ${arg}`); },
    Harpoon: openHarpoon,
    ZenMode: () => zen(1),
    Hardtime: () => {
      state.hardtime = arg === "enable" ? true : arg === "disable" ? false : !state.hardtime;
      notify(state.hardtime ? "Hardtime enabled" : "Hardtime disabled", "hardtime");
    },
    VimBeGood: () => notify("you're already good. hardtime agrees, mostly.", "VimBeGood"),
    Lazy: () => notify("no updates. everything is fine.", "lazy.nvim"),
    LspRestart: () => { state.lsp = false; lspProgress(); },
    intro: openIntro,
    tabnew: () => arg ? runCmd("e " + arg) : (state.tabs.push(null), setTab(state.tabs.length - 1)),
    tabn: () => cycle(1), tabp: () => cycle(-1), tabc: () => closeTab(), tabo: () => { state.tabs = [state.cur]; state.open = state.cur ? [state.cur] : []; setTab(0); },
  };
  C.MonkeyType = C.Monkeytype; C.monkeytype = C.Monkeytype; C.G = C.Git; C.qa = C.q; C.quit = C.q; C.edit = C.e; C.help = C.h; C.colo = C.colorscheme; C.bdelete = C.bd; C.tabnext = C.tabn; C.tabprevious = C.tabp; C.tabclose = C.tabc; C.tabonly = C.tabo; C.bnext = C.bn; C.bprev = C.bp; C.buffers = C.ls;
  if (C[c]) return C[c]();
  if (pages[c]) return openBuf(pages[c]);
  err(`E492: Not an editor command: ${s}`);
}
function tagLine(t){
  const L = lines("help.txt").map(plain);
  const i = L.findIndex(l => l.includes(`*${t}*`) || l.includes(`*fabian-${t}*`));
  return i < 0 ? 0 : i;
}
