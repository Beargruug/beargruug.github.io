/* :q! drops you into a fake zsh. */

const PROMPT = "fabian@macbook ~ % ";
function quit(){
  closeFloats();
  const sh = $("#shell");
  sh.hidden = false; $("#twin").textContent = "zsh";
  sh.innerHTML = `<div><span class="pr">${PROMPT}</span>nvim</div><div class="dim">type nvim to go back</div><div id="shout"></div><div class="row"><span class="pr">${PROMPT}</span><input id="shin" aria-label="Shell" autocomplete="off" autocapitalize="off" spellcheck="false"></div>`;
  const inp = $("#shin"); inp.focus();
  inp.addEventListener("keydown", e => {
    e.stopPropagation();
    if (e.key !== "Enter") return;
    const v = inp.value.trim(), [c, ...a] = v.split(/\s+/); inp.value = "";
    let out = "";
    if (["nvim", "vim", "vi", "v"].includes(c)) return reopen();
    if (!c) out = "";
    else if (c === "ls") out = FILES.join("  ");
    else if (c === "cat"){
      const f = a[0];
      out = !f ? "" : B[f] && FILES.includes(f) ? lines(f).map(plain).join("\n") : `cat: ${f}: No such file or directory`;
    }
    else if (c === "clear"){ $("#shout").innerHTML = ""; return; }
    else if (c === "exit") out = "nice try. this tmux pane is load-bearing.";
    else if (c === "tmux-sessionizer"){ reopen(); return PICKERS.sessionizer(); }
    else if (c === "whoami") out = "fabian";
    else out = `zsh: command not found: ${c}`;
    $("#shout").insertAdjacentHTML("beforeend", `<div><span class="pr">${PROMPT}</span>${esc(v)}</div>${out ? `<div>${esc(out)}</div>` : ""}`);
    $("#shell").scrollTop = 1e9;
  });
}
function reopen(){
  $("#shell").hidden = true; $("#twin").textContent = "nvim";
  state.open = []; state.tabs = [null]; state.tab = 0; state.cur = null; state.mode = "NORMAL";
  renderAll(); msg("");
  notify("welcome back", "nvim");
}
$("#shell").addEventListener("click", () => $("#shin")?.focus());
