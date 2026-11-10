/* Live data: Monkeytype profile and GitHub star counts. */

const MT = {state: "idle", data: null, error: ""};
const MT_URL = "https://monkeytype.com/profile/Beargruug";
const clean = v => String(v ?? "").replace(/[{}|]/g, "");
const bestPB = arr => Array.isArray(arr) && arr.length ? arr.reduce((a, b) => b.wpm > a.wpm ? b : a) : null;
const mtLevel = xp => Math.floor((1 / 98) * (-151 + Math.sqrt(392 * xp + 22801)) + 1);
const dur = sec => { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h ? `${h}h ${m}m` : `${m}m`; };
const rankOf = v => v == null ? null : typeof v === "number" ? v : v.rank;
async function loadMT(){
  if (MT.state === "loading" || MT.state === "ok") return;
  MT.state = "loading";
  const d = notify("fetching profile", "monkeytype", "", 0), fm = d.querySelector(".fm");
  try {
    const r = await fetch("https://api.monkeytype.com/users/Beargruug/profile?isUid=false");
    if (!r.ok) throw new Error("HTTP " + r.status);
    MT.data = (await r.json()).data;
    if (!MT.data) throw new Error("empty response");
    MT.state = "ok"; fm.textContent = "fetching profile ✔";
  } catch (e){
    MT.state = "error"; MT.error = e.message || String(e);
    fm.textContent = "couldn't reach the api"; d.classList.add("warn");
  }
  setTimeout(() => fadeOut(d), 1800);
  if (state.cur === "monkeytype.lua" && state.mode === "NORMAL") renderAll();
  if (MTT) renderMT();
}
const mtPB = (mode, k) => MT.state === "ok" ? bestPB(MT.data.personalBests?.[mode]?.[k]) : null;

const GHS = {state: "idle"};
async function loadGH(){
  if (GHS.state === "loading" || GHS.state === "ok") return;
  GHS.state = "loading";
  const d = notify("fetching stars", "github", "", 0), fm = d.querySelector(".fm");
  try {
    const r = await fetch("https://api.github.com/users/Beargruug/repos?per_page=100");
    if (!r.ok) throw new Error("HTTP " + r.status);
    const repos = await r.json();
    if (!Array.isArray(repos)) throw new Error("unexpected response");
    const stars = new Map(repos.map(x => [x.name, x.stargazers_count]));
    for (const p of PROJECTS) if (stars.has(p.name)) p.stars = stars.get(p.name);
    GHS.state = "ok"; fm.textContent = "fetching stars ✔";
  } catch (e){
    GHS.state = "error";
    fm.textContent = "couldn't reach the api"; d.classList.add("warn");
  }
  setTimeout(() => fadeOut(d), 1800);
  if (state.cur === "projects.lua" && state.mode === "NORMAL") renderAll();
}
