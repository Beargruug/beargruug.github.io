/* Every "file" you can open. Each buffer returns its lines in {cls|text} markup. */

function sha(str){ let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(16).padStart(8, "0").slice(0, 7); }
const xpBar = (cur, max, w = 20) => { const f = Math.round(cur / max * w); return "█".repeat(f) + "░".repeat(w - f); };

const field = (k, v, w = 5) => `{v|${k}}${" ".repeat(Math.max(0, w - k.length))} {o|=} ${v},`;
function projectLines(p){
  return [
    "    {",
    "        " + field("name", `{s|"${p.name}"}`),
    p.about ? "        " + field("about", `{s|"${p.about}"}`) : "        {v|about} {o|=} {x|nil}, {c|-- read the source}",
    "        " + field("lang", `{s|"${p.lang}"}`) + ` {v|stars} {o|=} {n|${p.stars}},`,
    "        " + field("url", `{A:${GH}/${p.name}|"github.com/Beargruug/${p.name}"}`),
    "    },",
  ];
}
function H(title, tag){ return `{h|${title}}` + " ".repeat(Math.max(1, 78 - title.length - tag.length - 2)) + `{t|*${tag}*}`; }

const FILES = [".cat", "about.md", "bootdev.md", "coffee.lua", "contact.md", "monkeytype.lua", "projects.lua"];
const ICON = f => f.endsWith(".lua") ? "{il|☾}" : f.endsWith(".md") ? "{im|#}" : "{it|·}";

const B = {
  "about.md": {ft:"markdown", lines:() => [
    "{h|# Fabian Scheid}",
    "",
    "Developer at {b|**Refine Studio**}, based in Germany.",
    "I'm a husband and father of three.",
    "I like coffee, cats, and code that reads well.",
    "",
    "{h|## What I do}",
    "{m|-} Build things for the web and the terminal",
    "{m|-} Write Neovim plugins when an itch gets bad enough",
    "{m|-} Tweak my dotfiles more often than I'd admit",
    "",
    "{h|## Right now}",
    "Exploring new tools and getting a little better",
    "at the craft every day. Lately that means the",
    "courses on {a:buf:bootdev.md|boot.dev} (put the cursor here, press gx).",
    "",
    "{h|## Setup}",
    "{m|-} Neovim, telescope, harpoon and oil",
    "{m|-} Ghostty and tmux, sessions via tmux-sessionizer",
    "{m|-} macOS with AeroSpace and SketchyBar",
    "",
    "{c|<!-- new here? j and k move, :help explains the rest -->}",
  ], signs:() => ({12:["/","s-chg"],13:["+","s-add"],15:["+","s-add"],16:["+","s-add"],17:["+","s-add"],18:["+","s-add"]})},

  "projects.lua": {ft:"lua", lines:() => [
    "{c|-- things I've built. put the cursor on a url and press gx.}",
    "{c|-- course projects from boot.dev live in bootdev.md}",
    "",
    "{r|return} {",
    ...PROJECTS.flatMap(projectLines),
    "}",
  ]},

  "coffee.lua": {ft:"lua", lines:() => [
    "{c|-- fuel management}",
    "{k|local} M {o|=} {}",
    "",
    `M.{v|cups_this_visit} {o|=} {n|${state.cups}}`,
    `M.{v|level} {o|=} {n|${Math.round(state.coffee)}} {c|-- percent, see the statusline}`,
    "",
    "{c|-- a curated list of coffee resources, tools and guides}",
    `M.{v|reading} {o|=} {A:${GH}/awesome-coffee|"github.com/Beargruug/awesome-coffee"}`,
    "",
    "{k|function} M.{f|refill}()",
    "    {c|-- type :coffee to run this}",
    "    M.{v|level} {o|=} {n|100}",
    "    M.{v|cups_this_visit} {o|=} M.{v|cups_this_visit} {o|+} {n|1}",
    "{k|end}",
    "",
    "{r|return} M",
  ], signs:() => { const s = {}; if (state.cups) s[3] = ["/","s-chg"]; if (state.touched) s[4] = ["/","s-chg"]; return s; }},

  "bootdev.md": {ft:"markdown", lines:() => [
    "{h|# boot.dev}",
    "",
    "Learning backend development on boot.dev since October 2023.",
    `{c|<!-- snapshot of my profile, the live one is at -->}`,
    `{a:${BD}/u/beargruug|${BD}/u/beargruug}`,
    "",
    "{h|## Stats}",
    "{m|-} level:        {n|58} (Scholar)",
    `{m|-} next level:   {ok|${xpBar(1760, 4960)}} {n|1,760} / {n|4,960} XP`,
    "{m|-} lessons:      {n|737} solved",
    "{m|-} xp:           {n|152,240} earned",
    "{m|-} leaderboard:  top {n|8.5%}",
    "",
    "{h|## Journey}",
    "{c|<!-- try :Git log for the same thing, fugitive style -->}",
    ...JOURNEY.flatMap(j => [
      `{m|-} {ok|[x]} {n|${j.d.padEnd(10)}}  ${j.url ? `{a:${j.url}|${j.t}}` : j.t}`,
      ...(j.repo ? [`                   {m|↳} {a:${GH}/${j.repo}|github.com/Beargruug/${j.repo}}`] : []),
    ]),
  ]},

  "gitlog": {ft:"git", title:"fugitive:///home/fabian/.git//log", lines:() => [
    ...JOURNEY.slice().reverse().map((j, i) =>
      `{v|${sha(j.d + j.t)}} ${i === 0 ? "{t|(HEAD -> main)} " : ""}{n|${j.d.padEnd(10)}} ${j.url ? `{a:${j.url}|${j.t}}` : j.t}`),
    "",
    "{c|# 15 commits. press gx on a line to open the certificate.}",
  ]},

  "monkeytype.lua": {ft:"lua", lines:() => {
    const url = `{A:${MT_URL}|"monkeytype.com/profile/Beargruug"}`;
    const tail = ["", "{c|-- think you're faster? run :Monkeytype}"];
    if (MT.state !== "ok") return [
      "{c|-- live from api.monkeytype.com}",
      MT.state === "error" ? `{c|-- couldn't load it (${clean(MT.error)}), it lives here:}` : "{c|-- fetching...}",
      "",
      `{r|return} { {v|url} {o|=} ${url} }`,
      ...tail,
    ];
    const D = MT.data, ts = D.typingStats || {}, W = 15;
    const F = (k, v) => "    " + field(k, v, W);
    const pbs = mode => ["15", "30", "60", "120", "10", "25", "50", "100"]
      .map(k => [k, mtPB(mode, k)]).filter(([, b]) => b)
      .map(([k, b]) => `            [{n|${k}}] {o|=} {s|"${Math.round(b.wpm)} wpm, ${Math.round(b.acc)}% acc"},`);
    const tPB = pbs("time"), wPB = pbs("words");
    const r15 = rankOf(D.allTimeLbs?.time?.["15"]?.english), r60 = rankOf(D.allTimeLbs?.time?.["60"]?.english);
    return [
      "{c|-- live from api.monkeytype.com, fetched just now}",
      "",
      "{r|return} {",
      F("name", `{s|"${clean(D.name)}"}`),
      F("level", `{n|${mtLevel(D.xp || 0)}}`) + ` {c|-- ${(D.xp || 0).toLocaleString("en-US")} xp}`,
      ...(ts.startedTests != null ? [F("tests_started", `{n|${ts.startedTests}}`)] : []),
      ...(ts.completedTests != null ? [F("tests_done", `{n|${ts.completedTests}}`)] : []),
      ...(ts.timeTyping != null ? [F("time_typing", `{s|"${dur(ts.timeTyping)}"}`)] : []),
      ...(D.maxStreak ? [F("streak", `{n|${D.streak || 0}}`) + ` {c|-- best: ${D.maxStreak} days}`] : []),
      ...(D.details?.keyboard ? [F("keyboard", `{s|"${clean(D.details.keyboard)}"}`)] : []),
      ...(r15 ? [F("rank_15s", `{n|${r15}}`) + " {c|-- all-time, english}"] : []),
      ...(r60 ? [F("rank_60s", `{n|${r60}}`) + " {c|-- all-time, english}"] : []),
      "    {v|personal_bests} {o|=} {",
      ...(tPB.length ? ["        {v|time} {o|=} {", ...tPB, "        },"] : []),
      ...(wPB.length ? ["        {v|words} {o|=} {", ...wPB, "        },"] : []),
      ...(!tPB.length && !wPB.length ? ["        {c|-- none public yet}"] : []),
      "    },",
      F("url", url),
      "}",
      ...tail,
    ];
  }},

  "contact.md": {ft:"markdown", lines:() => [
    "{h|# Say hello}",
    "",
    "Email is the most reliable way to reach me.",
    "",
    "{m|-} mail:     {a:mailto:info@fabianmail.com|info@fabianmail.com}",
    `{m|-} github:   {a:${GH}|https://github.com/Beargruug}`,
    "{m|-} x:        {a:https://x.com/Beargruug|https://x.com/Beargruug}",
    "{m|-} sponsor:  {a:https://github.com/sponsors/Beargruug|https://github.com/sponsors/Beargruug}",
  ]},

  ".cat": {ft:"text", lines:() => [
    " /\\_/\\",
    "( -.- )  zzz",
    " > ^ <",
    "",
    "{c|this cat is asleep. :cat lets it out for a walk.}",
  ]},

  "help.txt": {ft:"help", lines:() => [
    "{t|*fabian.txt*}     For Neovim users and everyone else",
    "",
    H("MOVING AROUND", "fabian-motions"),
    "  {f|j} {f|k} {f|h} {f|l}         move (counts work, try 5j)",
    "  {f|w} {f|b} {f|0} {f|$}         words, start and end of line",
    "  {f|gg} {f|G}              top and bottom",
    "  {f|<C-d>} {f|<C-u>}       half a page, centered",
    "  {f|gt} {f|gT}              next and previous tab",
    "  {f|gx} {f|<Enter>}        open the link on this line",
    "",
    H("NAVIGATION", "fabian-navigation"),
    "  {f|<C-e>}             harpoon menu",
    "  {f|<C-t>} {f|<C-g>} {f|<C-b>} {f|<C-n>}   harpoon marks 1 to 4 (the rest are in the menu)",
    "                    {c|your browser may keep <C-t> and <C-n> for itself}",
    "  {f|<leader>a}         add this file to harpoon",
    "  {f|-} {f|<leader>sf}      oil",
    "  {f|<C-p>}             git files",
    "  {f|<leader>vf}        find files",
    "  {f|<leader>cb}        buffers",
    "  {f|<leader>/}         search this buffer",
    "  {f|<leader>vh}        help tags",
    "  {f|<C-f>}             tmux-sessionizer (my projects)",
    "  {f|<leader>zz}        zen mode ({f|<leader>zZ} for the quiet one)",
    "",
    "  {f|<leader>} is {f|<Space>}.",
    "",
    H("COMMANDS", "fabian-commands"),
    "  {f|:e} {s|about.md}              open a file",
    "  {f|:coffee}                    refill",
    "  {f|:cat}                       let the cat out",
    "  {f|:colorscheme} {s|kanagawa}       also kanagawa-dragon,",
    "                             kanagawa-lotus, rose-pine-moon",
    "  {f|:Telescope colorscheme}     try them with a live preview",
    "  {f|:Git log}                   my boot.dev journey, as commits",
    "  {f|:Monkeytype}                15s typing test against my pb",
    "  {f|:checkhealth}               see how I'm doing",
    "  {f|:Hardtime toggle}           stop the j-spam police",
    "  {f|:tabc} {f|:tabn} {f|:tabp}          close, next, previous tab",
    "  {f|:q}                         go on, try it",
    "",
    H("NOT A VIM PERSON?", "fabian-mouse"),
    "  Everything you open gets its own tab at the top. Click a tab",
    "  to switch, the × to close it. The numbers in the statusline,",
    "  links and files are all clickable too.",
    "",
    "{c|vim:tw=78:ts=8:ft=help:norl:}",
  ]},

  "checkhealth": {ft:"checkhealth", lines:() => {
    const lvl = Math.round(state.coffee);
    return [
      "{h|==============================================================================}",
      "{h|fabian:} require(\"fabian.health\").check()",
      "",
      "{h|caffeine} ~",
      lvl > 25 ? `- {ok|OK} level at ${lvl}%` : `- {er|ERROR} level at ${lvl}%`,
      ...(lvl > 25 ? [] : ["  - ADVICE:", "    - run :coffee"]),
      "",
      "{h|cats} ~",
      "- {ok|OK} one cat found, asleep in the statusline",
      "",
      "{h|editor} ~",
      "- {ok|OK} nvim (btw)",
      `- {ok|OK} hardtime.nvim is ${state.hardtime ? "watching your j key" : "off"}`,
      "",
      "{h|sleep} ~",
      "- {wa|WARNING} not measured. probably fine.",
    ];
  }},

  "oil": {ft:"oil", title:"oil:///home/fabian/", lines:() => FILES.map(f => `${ICON(f)} ${f}`)},
};
const title = n => (B[n] && B[n].title) || n;
