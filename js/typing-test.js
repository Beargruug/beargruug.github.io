/* The :Monkeytype 15s typing test. */

const WORDS = "the be of and a to in he have it that for they with as not on she at by this we you do but from or which one would all will there say who make when can more if no man out other so what time up go about than into could state only new year some take come these know see use get like then first any work now may such give over think most even find day also after way many must look before great back through long where much should well people down own just because good each those feel seem how high too place little world very still nation hand old life tell write become here show house both between need mean call develop under last right move thing general school never same another begin while number part turn real leave might want point form off child few small since against ask late home interest large person end open public follow during present without again hold around possible head consider word program problem however lead system set order eye plan run keep face fact group play stand increase early course change help line".split(" ");
let MTT = null;
function startTest(){
  closeFloats();
  if (MTT) clearInterval(MTT.iv);
  const w = []; for (let i = 0; i < 60; i++) w.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  MTT = {text: w.join(" "), typed: "", keys: 0, errs: 0, start: 0, len: 15, iv: null, done: false};
  state.mode = "INSERT";
  $("#mt").hidden = false;
  $("#mtin").value = "";
  renderMT(); renderBuf(); renderStatus(); renderCmd();
  $("#mtin").focus();
  loadMT();
}
function renderMT(){
  if (!MTT) return;
  const {text, typed} = MTT;
  let h = "";
  for (let i = 0; i < text.length; i++){
    const ch = text[i];
    if (i === typed.length && !MTT.done) h += `<span class="cu" id="mtcaret">${esc(ch)}</span>`;
    else if (i >= typed.length) h += `<span class="u">${esc(ch)}</span>`;
    else if (typed[i] === ch) h += esc(ch);
    else h += ch === " " ? `<span class="wsp"> </span>` : `<span class="w">${esc(ch)}</span>`;
  }
  const box = $("#mtwords"); box.innerHTML = h;
  const c = $("#mtcaret"); if (c) box.scrollTop = Math.max(0, c.offsetTop - box.offsetTop - LH());
  const pb = mtPB("time", "15");
  const pbTxt = pb ? `fabian's 15s pb is ${Math.round(pb.wpm)} wpm` : MT.state === "loading" ? "loading fabian's pb..." : "";
  if (MTT.done){
    const {wpm, acc} = MTT.result, me = pb ? Math.round(pb.wpm) : null, won = me !== null && wpm > me;
    const info = $("#mtinfo");
    info.className = won ? "won" : "";
    info.innerHTML = me === null ? `${wpm} wpm  ${acc}% acc<span class="dim">  15s, english</span>`
      : won ? `you won.<span class="dim">  ${acc}% acc, 15s, english</span>`
      : wpm > me * 0.8 ? `so close.<span class="dim">  ${acc}% acc, 15s, english</span>`
      : `not this time.<span class="dim">  ${acc}% acc, 15s, english</span>`;
    if (me !== null){
      const max = Math.max(wpm, me, 1), W = 30;
      const bar = v => { const f = Math.max(1, Math.round(v / max * W)); return "█".repeat(f) + "░".repeat(W - f); };
      const diff = wpm - me;
      $("#mtwords").innerHTML = `<div class="mtres"><span class="lbl">you     </span><span class="${won ? "you" : "lost"}">${bar(wpm)}</span> ${String(wpm).padStart(3)} wpm
<span class="lbl">fabian  </span><span class="me">${bar(me)}</span> ${String(me).padStart(3)} wpm
<span class="dim t-c">${diff > 0 ? `+${diff} wpm. that's a new record on this website.` : diff === 0 ? "a tie. that doesn't count, sorry." : `${-diff} wpm short.`}</span></div>`;
    }
    if (won){
      const body = `I typed ${wpm} wpm (${acc}% acc) in the 15s test on your website. Your pb was ${me} wpm.`;
      const href = `mailto:info@fabianmail.com?subject=${encodeURIComponent("I beat your monkeytype pb")}&body=${encodeURIComponent(body)}`;
      $("#mthint").innerHTML = `<a class="mtsend" href="${href}">send fabian the proof</a>  <Tab> again  <Esc> quit`.replace("<Tab>", "&lt;Tab&gt;").replace("<Esc>", "&lt;Esc&gt;");
    } else $("#mthint").textContent = "<Tab> try again  <Esc> quit";
  } else {
    $("#mtinfo").className = "";
    const left = MTT.start ? Math.max(0, Math.ceil(MTT.len - (performance.now() - MTT.start) / 1000)) : MTT.len;
    $("#mtinfo").innerHTML = `${left}<span class="dim">  ${MTT.start ? "" : "start typing"}</span>`;
    $("#mthint").textContent = (pbTxt ? pbTxt + "  " : "") + "<Tab> restart  <Esc> quit";
  }
}
function endTest(){
  if (!MTT || MTT.done) return;
  clearInterval(MTT.iv);
  const secs = Math.min(MTT.len, (performance.now() - MTT.start) / 1000) || MTT.len;
  let correct = 0; for (let i = 0; i < MTT.typed.length; i++) if (MTT.typed[i] === MTT.text[i]) correct++;
  MTT.result = {
    wpm: Math.round(correct / 5 / (secs / 60)),
    acc: MTT.keys ? Math.round((MTT.keys - MTT.errs) / MTT.keys * 100) : 0,
  };
  MTT.done = true;
  renderMT();
  const pb = mtPB("time", "15");
  if (pb && MTT.result.wpm > Math.round(pb.wpm)){
    notify(`new record: ${MTT.result.wpm} wpm`, "monkeytype", "", 5000);
    walkCat();
  }
}
function closeTest(){
  if (!MTT) return;
  clearInterval(MTT.iv); MTT = null;
  $("#mt").hidden = true; $("#mtin").blur();
  state.mode = "NORMAL"; msg(""); renderAll();
}
$("#mtin").addEventListener("input", () => {
  if (!MTT || MTT.done){ $("#mtin").value = MTT ? MTT.typed : ""; return; }
  if (!MTT.start){
    MTT.start = performance.now();
    MTT.iv = setInterval(() => { if (performance.now() - MTT.start >= MTT.len * 1000) endTest(); else renderMT(); }, 200);
  }
  const v = $("#mtin").value.slice(0, MTT.text.length);
  for (let i = MTT.typed.length; i < v.length; i++){ MTT.keys++; if (v[i] !== MTT.text[i]) MTT.errs++; }
  MTT.typed = v;
  if (v.length >= MTT.text.length) endTest(); else renderMT();
});
$("#mtin").addEventListener("keydown", e => {
  e.stopPropagation();
  if (e.key === "Escape" || (e.ctrlKey && e.key === "c")){ e.preventDefault(); closeTest(); }
  else if (e.key === "Tab"){ e.preventDefault(); startTest(); }
  else if (e.key === "Enter") e.preventDefault();
});
$("#mt").addEventListener("click", e => { if (e.target.id === "mt") closeTest(); else $("#mtin").focus(); });
