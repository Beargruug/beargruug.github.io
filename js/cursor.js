/* Cursor position and word motions. */

function pos(n = state.cur){ return n ? (state.pos[n] ||= {l: 0, c: 0, want: 0}) : {l: 0, c: 0, want: 0}; }
function curText(){ return plain(lines(state.cur)[pos().l] || ""); }
function clampCol(){ const p = pos(); p.c = Math.max(0, Math.min(p.want, curText().length - 1)); }
function setLine(l){ if (!state.cur) return; const p = pos(); p.l = Math.max(0, Math.min(l, lines(state.cur).length - 1)); clampCol(); }
function setCol(c){ if (!state.cur) return; const p = pos(); p.want = c; clampCol(); p.want = p.c; }
function firstNonBlank(){ return (curText().match(/^\s*/) || [""])[0].length; }
function wordFwd(){
  const L = lines(state.cur); const p = pos(); let l = p.l, c = p.c + 1;
  while (l < L.length){
    const t = plain(L[l]);
    for (; c < t.length; c++) if (/\S/.test(t[c]) && (c === 0 || /\s/.test(t[c - 1]))) { p.l = l; setCol(c); return; }
    l++; c = 0;
  }
}
function wordBack(){
  const L = lines(state.cur); const p = pos(); let l = p.l, c = p.c - 1;
  while (l >= 0){
    const t = plain(L[l]); if (c === undefined || c >= t.length) c = t.length - 1;
    for (; c >= 0; c--) if (/\S/.test(t[c]) && (c === 0 || /\s/.test(t[c - 1]))) { p.l = l; setCol(c); return; }
    l--; c = undefined;
  }
}
