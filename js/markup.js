/* Parses the {cls|text} / {a:url|text} markup into HTML. */

const RE = /\{(\w+)(?::([^|]+))?\|([^}]*)\}/g;
const esc = s => s.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const plain = l => l.replace(RE, "$3");
const urlOf = l => { const m = l.match(/\{[aA]:([^|]+)\|/); return m ? m[1] : null; };
function toks(line){
  const out = []; let last = 0, m; RE.lastIndex = 0;
  while ((m = RE.exec(line))){
    if (m.index > last) out.push({t: line.slice(last, m.index)});
    out.push({cls: m[1], url: m[2], t: m[3]});
    last = RE.lastIndex;
  }
  if (last < line.length) out.push({t: line.slice(last)});
  return out;
}
function render(line, col = -1){
  let html = "", x = 0, placed = false;
  for (const tk of toks(line)){
    let inner;
    if (col >= x && col < x + tk.t.length){
      const i = col - x;
      inner = esc(tk.t.slice(0, i)) + `<span class="cu">${esc(tk.t[i])}</span>` + esc(tk.t.slice(i + 1));
      placed = true;
    } else inner = esc(tk.t);
    x += tk.t.length;
    if (!tk.cls) html += inner;
    else if ((tk.cls === "a" || tk.cls === "A") && tk.url.startsWith("buf:")) html += `<a class="t-url" href="#" data-buf="${esc(tk.url.slice(4))}">${inner}</a>`;
    else if (tk.cls === "a" || tk.cls === "A") html += `<a class="${tk.cls === "a" ? "t-url" : "t-surl"}" href="${esc(tk.url)}" target="_blank" rel="noopener">${inner}</a>`;
    else html += `<span class="t-${tk.cls}">${inner}</span>`;
  }
  if (col >= 0 && !placed) html += `<span class="cu"> </span>`;
  return html;
}
const lines = n => B[n].lines();
