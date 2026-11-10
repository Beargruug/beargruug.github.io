/* Clocks, coffee drain, and startup. Loaded last. */

function tick(){
  const d = new Date();
  const day = d.toLocaleDateString("en-US", {weekday: "short"}), mon = d.toLocaleDateString("en-US", {month: "short"});
  const t = d.toTimeString().slice(0, 8);
  // tmux-dotbar status-right-text: " %a %b %e - %H:%M:%S "
  $("#clock").innerHTML = `<span class="hide-sm">${day} ${mon} ${String(d.getDate()).padStart(2)} - </span>${t}`;
}
setInterval(tick, 1000); tick();

setInterval(() => {
  state.coffee = Math.max(0, state.coffee - 1); state.touched = true;
  if (state.coffee < 20 && !state.warned){ state.warned = true; notify("coffee is running low, try :coffee", "caffeine", "warn", 5000); }
  renderTabs();
  if (state.mode === "NORMAL" && (state.cur === "coffee.lua" || state.cur === "checkhealth")) renderBuf();
  renderStatus();
}, 12000);

addEventListener("resize", () => renderBuf());

setTheme("kanagawa");
renderIntro();
renderAll();
klammerShow();
setTimeout(() => klammerSay("Hello, there 👋"), 400);
notify(`loaded in ${Math.max(1, Math.round(performance.now() - t0))}ms`, "fabian.nvim");
