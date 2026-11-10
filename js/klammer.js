/* ai-klammer.nvim's paperclip in the bottom-right corner.
   Ported from lua/ai_klammer/ui/avatar.lua and bubble.lua in Beargruug/ai-klammer.nvim. */

const KLAMMER_EYES = {
    blink: "-  - ",
    thinking: "o  o ",
    annoyed: ">  < ",
    happy: "^  ^ ",
    surprised: "O  O ",
    dead: "x  x ",
    left: "◐  ◐ ",
    right: "◑  ◑ ",
};

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

// How long without any activity before the Klammer nods off (the plugin's sleep_after).
const KLAMMER_SLEEP_AFTER = 5 * 60 * 1000;

const KL = {
  blinking: false, hopping: false,
  gaze: "left",               // "left" | "right": there is no straight-ahead, it always looks to a side
  reaction: null,             // a passing expression, like "surprised" when it wakes up
  reactionToken: null,
  asleep: false, snore: 0,    // snore: 0 quiet, 1 a z beside the head, 2 a Z above it
  lastActive: performance.now(),
  timer: null,
  typing: 0, fade: null,
};

// Blink beats sleep beats reaction beats gaze, like the plugin (which also has moods).
function klammerEyes(){
  if (KL.blinking || KL.asleep) return KLAMMER_EYES.blink;
  if (KL.reaction) return KLAMMER_EYES[KL.reaction];
  return KLAMMER_EYES[KL.gaze];
}

// One empty row of headroom on top, so it can hop without moving its box.
// Each eye sits in a 1ch box: ◐ and ◑ can come from a wider fallback font and would tear the wire apart.
function renderKlammer(){
  const eyes = [...klammerEyes()].map(ch => ch === " " ? " " : `<span class="ke${"◐◑".includes(ch) ? " round" : ""}"><span>${esc(ch)}</span></span>`).join("");
  const rows = KLAMMER_BODY.map(l => l === null ? eyes : esc(l));
  // the free column right of the head, where the z drifts up
  if (KL.asleep && KL.snore === 1) rows[1] = rows[1].slice(0, 4) + "z";
  else if (KL.asleep && KL.snore === 2) rows[0] = rows[0].slice(0, 4) + "Z";
  if (KL.hopping) rows.push(KLAMMER_BLANK); else rows.unshift(KLAMMER_BLANK);
  $("#klammer").innerHTML = rows.join("\n");
}

// A passing expression over the gaze, gone again after `ms`.
function klammerReact(name, ms = 1500){
  if (!KLAMMER_EYES[name]) return;
  const token = {};
  KL.reaction = name;
  KL.reactionToken = token;
  renderKlammer();
  setTimeout(() => {
    if (KL.reactionToken !== token) return;
    KL.reaction = null;
    renderKlammer();
  }, ms);
}

// Thirds of the screen: the eyes go where x is (the plugin's gaze_for).
function klammerGazeFor(x, width){
  if (x <= width / 3) return "left";
  if (x > width * 2 / 3) return "right";
  return null;
}

function klammerLook(direction){
  // the middle third keeps the side it last looked at; only redraw when the gaze actually changes
  if (!direction || direction === KL.gaze) return;
  KL.gaze = direction;
  renderKlammer();
}

/* ---------- sleep ---------- */

function klammerSleep(){
  KL.asleep = true;
  KL.snore = 0;
  renderKlammer();
  // snoring runs on a one-second beat, not on the next blink up to eight seconds away
  klammerSchedule(1000);
}

// You are there. If the Klammer had nodded off, it wakes with a start.
function klammerPoke(){
  KL.lastActive = performance.now();
  if (!KL.asleep) return;
  KL.asleep = false;
  KL.snore = 0;
  klammerReact("surprised", 800);
}

/* ---------- activity ---------- */

// Follows the vim cursor after every key, and the mouse pointer when it moves.
// Registered after keys.js and mouse.js, so the cursor has already moved when this runs.
function klammerLookAtCursor(){
  klammerPoke();
  const cu = state.cur && $("#buf .cu");
  if (!cu) return;
  const win = $("#win").getBoundingClientRect();
  klammerLook(klammerGazeFor(cu.getBoundingClientRect().left - win.left, win.width));
}
document.addEventListener("keydown", klammerLookAtCursor);
document.addEventListener("click", klammerLookAtCursor);
document.addEventListener("mousemove", e => {
  klammerPoke();
  klammerLook(klammerGazeFor(e.clientX, innerWidth));
}, {passive: true});
addEventListener("wheel", klammerPoke, {passive: true});
addEventListener("focus", klammerPoke);

/* ---------- the one timer for the whole face ---------- */

function klammerBlink(times){
  KL.blinking = true;
  renderKlammer();
  setTimeout(() => {
    KL.blinking = false;
    renderKlammer();
    if (times > 1) setTimeout(() => { if (!KL.asleep) klammerBlink(times - 1); }, 120);
  }, 150);
}

// Somewhere between two and eight seconds, like a face and unlike a metronome.
const klammerNextBlink = () => 2000 + Math.random() * 6000;

function klammerSchedule(ms){
  clearTimeout(KL.timer);
  KL.timer = setTimeout(klammerTick, ms);
}

// A blink at a random moment while awake, the next frame of the snoring every second while asleep.
function klammerTick(){
  if (!KL.asleep && performance.now() - KL.lastActive >= KLAMMER_SLEEP_AFTER) klammerSleep();
  if (KL.asleep){
    KL.snore = KL.snore % 2 + 1;
    renderKlammer();
    return klammerSchedule(1000);
  }
  // now and then a double blink, which is most of what makes it look alive
  klammerBlink(Math.random() < 0.2 ? 2 : 1);
  klammerSchedule(klammerNextBlink());
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
  klammerPoke();
  renderKlammer();
  klammerSchedule(klammerNextBlink());
}
