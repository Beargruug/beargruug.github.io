/* Clicks on tabs, links, lines and the statusline. */

function chWidth(){
  const s = document.createElement("span");
  s.textContent = "0".repeat(20); s.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
  $("#buf").appendChild(s); const w = s.getBoundingClientRect().width / 20; s.remove(); return w;
}
document.addEventListener("click", e => {
  const bl = e.target.closest("[data-buf]");
  if (bl){ e.preventDefault(); return openBuf(bl.dataset.buf); }
  const tcl = e.target.closest("[data-tabclose]"), tab = e.target.closest("[data-tab]");
  if (tcl) return closeTab(+tcl.dataset.tabclose);
  if (tab) return setTab(+tab.dataset.tab);
  const harp = e.target.closest("[data-harp]"), cmd = e.target.closest("[data-cmd]"), ln = e.target.closest("#buf .ln.real");
  if (harp) return harpoonSelect(+harp.dataset.harp);
  if (cmd) return runCmd(cmd.dataset.cmd);
  if (ln && state.cur && state.mode === "NORMAL"){
    const tx = ln.querySelector(".tx");
    setLine(+ln.dataset.i);
    setCol(Math.floor((e.clientX - tx.getBoundingClientRect().left) / chWidth()));
    if (state.cur === "oil" && !e.target.closest("a")) return openLine();
    renderBuf(); renderStatus();
  }
});
$("#tabline").addEventListener("auxclick", e => { const t = e.target.closest("[data-tab]"); if (e.button === 1 && t){ e.preventDefault(); closeTab(+t.dataset.tab); } });
