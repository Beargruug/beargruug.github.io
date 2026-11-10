/* Shared basics: DOM helper, editor state, themes. */

const $ = s => document.querySelector(s);
const GH = "https://github.com/Beargruug";
const t0 = performance.now();
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--lh")) || 23;

const state = {
  open: [], tabs: [null], tab: 0, cur: null, pos: {}, mode: "NORMAL", seq: "", count: "",
  harpoon: ["about.md", "projects.lua", "bootdev.md", "monkeytype.lua", "contact.md", "coffee.lua"],
  theme: "kanagawa", coffee: 72, cups: 0, touched: false, warned: false,
  zen: 0, hardtime: true, lsp: false, hard: {k: "", n: 0, t: 0}, history: []
};

const THEMES = {"kanagawa":"kanagawa","kanagawa-wave":"kanagawa","kanagawa-dragon":"dragon","kanagawa-lotus":"lotus","rose-pine-moon":"rosepine","rose-pine":"rosepine"};
