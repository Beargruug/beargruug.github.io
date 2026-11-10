/* Harpoon menu (<C-e>). */

let hSel = 0, hPending = "";
function openHarpoon(){
  closeFloats();
  state.mode = "HARPOON"; hSel = Math.max(0, state.harpoon.indexOf(state.cur));
  $("#harp").hidden = false; renderHarpoon();
}
function renderHarpoon(){
  $("#hlist").innerHTML = state.harpoon.length
    ? state.harpoon.map((f, i) => `<li class="${i === hSel ? "sel" : ""}" data-h="${i}"><span class="nr">${i === hSel ? i + 1 : Math.abs(i - hSel)}</span><span>${i === hSel ? `<span class="cu">${esc(f[0])}</span>${esc(f.slice(1))}` : esc(f)}</span></li>`).join("")
    : `<li><span class="nr">1</span><span class="cu"> </span></li>`;
}
function closeHarpoon(){ if (state.mode !== "HARPOON") return; $("#harp").hidden = true; state.mode = "NORMAL"; renderStatus(); }
function harpoonKey(e){
  const k = e.key; e.preventDefault();
  if (hPending === "d"){ hPending = ""; if (k === "d" && state.harpoon.length){ state.harpoon.splice(hSel, 1); hSel = Math.min(hSel, state.harpoon.length - 1); renderHarpoon(); renderStatus(); } return; }
  if (k === "j" || k === "ArrowDown") hSel = Math.min(hSel + 1, state.harpoon.length - 1);
  else if (k === "k" || k === "ArrowUp") hSel = Math.max(hSel - 1, 0);
  else if (k === "Enter"){ closeHarpoon(); return harpoonSelect(hSel); }
  else if (k === "q" || k === "Escape" || (e.ctrlKey && (k === "c" || k === "e"))) return closeHarpoon();
  else if (k === "d") hPending = "d";
  else if (/^[1-9]$/.test(k)){ closeHarpoon(); return harpoonSelect(+k - 1); }
  renderHarpoon();
}
$("#harp").addEventListener("click", e => {
  const li = e.target.closest("[data-h]");
  if (li){ closeHarpoon(); harpoonSelect(+li.dataset.h); }
  else if (e.target.id === "harp") closeHarpoon();
});
function closeFloats(){ if (picker) closePicker(true); closeHarpoon(); if (MTT) closeTest(); }
