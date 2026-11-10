/* Toast notifications (fidget.nvim style). */

function notify(text, src = "", level = "", ms = 3200){
  const d = document.createElement("div");
  d.className = "fn " + level;
  d.innerHTML = `<span class="fm">${esc(text)}</span>  <span class="fs">${esc(src)}</span>`;
  $("#fidget").appendChild(d);
  if (ms) setTimeout(() => fadeOut(d), ms);
  return d;
}
function fadeOut(d){ d.classList.add("out"); setTimeout(() => d.remove(), 450); }
function lspProgress(){
  if (state.lsp) return; state.lsp = true;
  const d = notify("Loading workspace", "lua_ls", "", 0), fm = d.querySelector(".fm");
  const frames = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"; let i = 0;
  const iv = reduced ? null : setInterval(() => fm.textContent = "Loading workspace " + frames[i++ % frames.length], 80);
  setTimeout(() => { clearInterval(iv); fm.textContent = "Loading workspace ✔"; setTimeout(() => fadeOut(d), 1500); }, 1400);
}
