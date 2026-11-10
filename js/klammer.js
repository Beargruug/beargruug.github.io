/* ai-klammer.nvim's paperclip in the bottom-right corner.
   Ported from lua/ai_klammer/ui/avatar.lua and bubble.lua in Beargruug/ai-klammer.nvim. */

const KLAMMER_EYES = {neutral: "@  @ ", blink: "-  - "};
const KLAMMER_BODY = [
  " __  ",
  "/  \\ ",
  "|  | ",
  null, // eyes
  "|  | ",
  "|| |/",
  "|| ||",
  "|\\_/|",
  "\\___/",
];
const KLAMMER_BLANK = "     ";

const KL = {blinking: false, hopping: false, typing: 0, fade: null};

// One empty row of headroom on top, so it can hop without moving its box.
function renderKlammer(){
  const rows = KLAMMER_BODY.map(l => l ?? (KL.blinking ? KLAMMER_EYES.blink : KLAMMER_EYES.neutral));
  if (KL.hopping) rows.push(KLAMMER_BLANK); else rows.unshift(KLAMMER_BLANK);
  $("#klammer").textContent = rows.join("\n");
}

function klammerBlink(times){
  KL.blinking = true;
  renderKlammer();
  setTimeout(() => {
    KL.blinking = false;
    renderKlammer();
    if (times > 1) setTimeout(() => klammerBlink(times - 1), 120);
  }, 150);
}

// A blink somewhere between two and eight seconds, now and then a double one.
function klammerTick(){
  klammerBlink(Math.random() < 0.2 ? 2 : 1);
  setTimeout(klammerTick, 2000 + Math.random() * 6000);
}

// A little hop when it has something to say.
function klammerHop(){
  if (KL.hopping || reduced) return;
  KL.hopping = true;
  renderKlammer();
  setTimeout(() => { KL.hopping = false; renderKlammer(); }, 150);
}

// Shows `text` in the bubble, typed in 2 characters every 15ms, and fades it `ms` after it's done.
function klammerSay(text, ms = 3000){
  const bubble = $("#kbubble"), out = bubble.querySelector(".kb-text");
  const chars = Array.from(text); // never cut an emoji in half
  const token = ++KL.typing;
  clearTimeout(KL.fade);
  // the hidden copy gives the box its final size, so nothing jumps while typing
  bubble.querySelector(".kb-size").textContent = text;
  bubble.classList.remove("out");
  bubble.hidden = false;
  klammerHop();

  const fadeLater = () => {
    KL.fade = setTimeout(() => {
      bubble.classList.add("out");
      KL.fade = setTimeout(() => { bubble.hidden = true; }, 450);
    }, ms);
  };
  if (reduced){
    out.textContent = text;
    return fadeLater();
  }
  let shown = 0;
  const step = () => {
    if (token !== KL.typing) return;
    shown = Math.min(chars.length, shown + 2);
    out.textContent = chars.slice(0, shown).join("");
    if (shown < chars.length) setTimeout(step, 15); else fadeLater();
  };
  out.textContent = "";
  setTimeout(step, 15);
}

function klammerShow(){
  renderKlammer();
  setTimeout(klammerTick, 2000 + Math.random() * 6000);
}
