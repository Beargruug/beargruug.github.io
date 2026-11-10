/* Content you update by hand: projects and the boot.dev journey. */

const PROJECTS = [
  {name:"skipper.nvim",   about:"Skip through files like a pirate.", lang:"lua", stars:10},
  {name:"gitpvp",         about:"Repo vs repo, user vs user. Real stats, simulated battles.", lang:"typescript", stars:1},
  {name:"awesome-coffee", about:"A curated list of coffee resources, tools and guides.", lang:"markdown", stars:3},
  {name:"xls-viewer.nvim", about:"Opens a viewer to display xls files inside of neovim.", lang:"lua", stars:3},
  {name:"ai-klammer.nvim", about:"An ASCII paperclip that lives in the corner of your editor and has opinions about your code.", lang:"lua", stars:0},
  {name:"runx",           about:null, lang:"go", stars:0},
  {name:"nvim",           about:"My Neovim config. kanagawa, harpoon, oil, telescope.", lang:"lua", stars:2},
  {name:".dotfiles",      about:"Ghostty, tmux, AeroSpace, SketchyBar.", lang:"shell", stars:3},
];

const BD = "https://www.boot.dev";
const CERT = id => `${BD}/certificates/${id}`;
const JOURNEY = [
  {d:"2023-10-10", t:"joined boot.dev"},
  {d:"2025-12-01", t:"Learn Python for Beginners", url:CERT("86724d34-9381-49f0-9fab-3fc1c4de48ad")},
  {d:"2025-12-01", t:"Learn Linux", url:CERT("77295781-1d31-43fc-9970-50510afa9318")},
  {d:"2025-12-02", t:"Learn Git", url:CERT("a63781b6-2791-400c-91d2-2b0738030284")},
  {d:"2025-12-02", t:"Build a BookBot in Python", url:CERT("5fc51cef-e5d6-4b90-ba1e-e4202d240239"), repo:"bookbot"},
  {d:"2025-12-03", t:"Learn Object Oriented Programming in Python", url:CERT("75a7afe9-5f78-4d97-bf4f-4571f55ff4a6")},
  {d:"2025-12-04", t:"Build Asteroids using Python and Pygame", url:CERT("e92c0c73-6e75-459c-8e24-5d0a840ecff0"), repo:"asteroids"},
  {d:"2025-12-08", t:"Milestone: Master, 480 exercises done"},
  {d:"2025-12-26", t:"Gold in the Haunted Lich league, 78,382 XP"},
  {d:"2026-01-07", t:"Learn Functional Programming in Python", url:CERT("f3c89b9a-a090-4341-97d0-d01b5a8c4b20")},
  {d:"2026-01-16", t:"Build an AI Agent in Python", url:CERT("2490bf72-bc7a-4501-b282-c6729a8c3cfd"), repo:"ai_agent"},
  {d:"2026-01",    t:"Contest of the Resolute '26, studied every day in January"},
  {d:"2026-03-04", t:"First Personal Project: skipper.nvim", url:CERT("3c48c0c9-57f8-44a8-bde4-45833fc20205"), repo:"skipper.nvim"},
  {d:"2026-05-22", t:"Streak: Grandmaster, 144 days in a row"},
  {d:"2026-06-07", t:"Sharpshooter: Grandmaster, 28 sprees"},
];
