/* The : command line input, history and tab completion. */

const cmdin = $("#cmdin");
let hIdx = 0;
function openCmd(){
  state.mode = "COMMAND"; $("#cmd").classList.add("active"); $("#cmd .p").textContent = ":";
  cmdin.value = ""; hIdx = state.history.length; cmdin.focus(); renderBuf(); renderCmd();
}
function closeCmd(){
  if (state.mode !== "COMMAND") return;
  state.mode = "NORMAL"; $("#cmd").classList.remove("active"); $("#cmd .p").textContent = "";
  cmdin.blur(); renderBuf(); renderCmd();
}
const COMPLETE = {
  e: () => FILES, edit: () => FILES,
  colorscheme: () => Object.keys(THEMES), colo: () => Object.keys(THEMES),
  Telescope: () => Object.keys(PICKERS), Hardtime: () => ["toggle", "enable", "disable"],
  Git: () => ["log"], G: () => ["log"],
  "": () => ["Monkeytype", "Git", "checkhealth", "coffee", "cat", "colorscheme", "help", "Telescope", "Oil", "Harpoon", "ZenMode", "Hardtime", "VimBeGood", "Lazy"],
};
cmdin.addEventListener("keydown", e => {
  e.stopPropagation();
  if (e.key === "Enter"){
    const v = cmdin.value; if (v.trim()) state.history.push(v);
    closeCmd(); msg(""); runCmd(v);
  } else if (e.key === "Escape" || (e.ctrlKey && e.key === "c") || (e.key === "Backspace" && !cmdin.value)){
    closeCmd(); msg("");
  } else if (e.key === "Tab"){
    const v = cmdin.value, m = v.match(/^(\S+) (\S*)$/);
    const [head, part] = m ? [m[1], m[2]] : ["", v];
    const opts = (COMPLETE[head] || (() => []))().filter(o => o.startsWith(part));
    if (opts.length) cmdin.value = (head ? head + " " : "") + opts[0];
  } else if (e.key === "ArrowUp" && state.history.length){
    hIdx = Math.max(0, hIdx - 1); cmdin.value = state.history[hIdx];
  } else if (e.key === "ArrowDown"){
    hIdx = Math.min(state.history.length, hIdx + 1); cmdin.value = state.history[hIdx] || "";
  } else return;
  e.preventDefault();
});
cmdin.addEventListener("blur", closeCmd);
$("#cmd").addEventListener("click", () => { if (state.mode === "NORMAL") openCmd(); });
