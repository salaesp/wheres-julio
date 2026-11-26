// Pirate-ship props: masts with sails, cannons, barrels, crates, helm,
// treasure chest, jolly roger, hatches, quarterdeck railing…
import { defineProp } from "../props";
import { blank, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, line } from "./beach";

const WOOD = { t: "#c88850", u: "#a06434", v: "#6c3c1c", T: "#e8b070" };
const SAIL = { a: "#fffcf0", b: "#f2ead0", c: "#dcd0ae", d: "#bcae88" };
const IRON = { i: "#9898b0", j: "#686880", k: "#2c2c3c", K: "#181824", l: "#484860" };

const SKULL = [
  "....kkkkk....",
  "...kkkkkkk...",
  "..kkkkkkkkk..",
  "..kkWWkWWkk..",
  "..kkWWkWWkk..",
  "...kkkWkkk...",
  "....kkkkk....",
  "....kWkWk....",
  "kk.........kk",
  ".kkk.....kkk.",
  "...kkk.kkk...",
  ".....kkk.....",
  "...kkk.kkk...",
  ".kkk.....kkk.",
  "kk.........kk",
];
const SKULL_SMALL = [
  "..www..",
  ".wwwww.",
  ".wkwkw.",
  "..www..",
  "w.w.w.w",
  ".w...w.",
  "..w.w..",
  ".w...w.",
];

function flag(g: CharGrid, x: number, y: number, w: number, h: number, f: number, skull = true) {
  for (let xx = 0; xx < w; xx++) {
    const wave = Math.round(Math.sin((xx + f * 3) * 0.7) * 1);
    for (let yy = 0; yy < h; yy++) put(g, x + xx, y + yy + wave, yy === h - 1 || xx === w - 1 ? "K" : "k");
  }
  if (skull) stamp(g, x + Math.floor(w / 2) - 3, y + Math.floor(h / 2) - 4 + (f % 2 ? 0 : 0), SKULL_SMALL);
}

function pole(g: CharGrid, x: number, y0: number, y1: number) {
  rect(g, x, y0, 4, y1 - y0, "u");
  rect(g, x, y0, 1, y1 - y0, "T");
  rect(g, x + 1, y0, 1, y1 - y0, "t");
  rect(g, x + 3, y0, 1, y1 - y0, "v");
}

function yard(g: CharGrid, x0: number, x1: number, y: number) {
  rect(g, x0 + 1, y, x1 - x0 - 2, 1, "T");
  rect(g, x0, y + 1, x1 - x0, 1, "t");
  rect(g, x0 + 1, y + 2, x1 - x0 - 2, 1, "v");
}

function sail(g: CharGrid, x0: number, x1: number, top: number, bottom: number, billow: number) {
  const w = x1 - x0;
  for (let x = x0; x < x1; x++) {
    const t = (x - x0) / (w - 1);
    const bot = Math.round(bottom + billow * Math.sin(Math.PI * t));
    for (let y = top; y <= bot; y++) {
      const nx = t * 2 - 1;
      let c = nx < -0.45 ? "a" : nx < 0.35 ? "b" : nx < 0.8 ? "c" : "d";
      if ((x - x0) % 9 === 8 && c !== "d") c = c === "a" ? "b" : "c";
      if (y < top + 2) c = "c";
      if (y >= bot - 1) c = y === bot ? "d" : "c";
      if (x === x0) c = "c";
      put(g, x, y, c);
    }
  }
}

// ── Main mast: crow's nest, flag, big sail with skull ────────────────────────
function mainMast(f: number): string[] {
  const W = 62, H = 108;
  const g = blank(W, H);
  pole(g, 29, 2, 104);
  // ropes from the nest to the yard ends
  line(g, 22, 14, 4, 22, "r"); line(g, 39, 14, 57, 22, "r");
  // crow's nest
  rect(g, 21, 9, 20, 7, "u"); rect(g, 21, 9, 20, 1, "T"); rect(g, 21, 10, 1, 6, "t");
  rect(g, 39, 10, 2, 6, "v"); rect(g, 21, 15, 20, 1, "v"); rect(g, 22, 12, 18, 1, "r");
  rect(g, 22, 8, 18, 1, "k");
  // flag on top
  rect(g, 30, 0, 2, 9, "u"); put(g, 30, 0, "T");
  flag(g, 32, 0, 14, 9, f);
  // yard + sail
  yard(g, 2, 60, 21);
  sail(g, 5, 57, 24, 60, 5);
  stamp(g, 25, 33, SKULL);
  // pole visible between sail top and yard is covered; base collar
  ellipse(g, 31, 104, 7, 3, (l) => "tuvv"[l]);
  rect(g, 29, 98, 4, 6, "u"); rect(g, 29, 98, 1, 6, "T");
  put(g, 25, 103, "T"); put(g, 37, 103, "T");
  return rowsOf(g);
}
export const MAST_MAIN = defineProp({
  frames: [0, 1].map(mainMast),
  fps: 2.5,
  pal: { ...WOOD, ...SAIL, k: "#282030", K: "#141018", W: "#fffcf0", w: "#ffffff", r: "#d8c898" },
  solid: { x: 22, y: 99, w: 20, h: 10 },
  baseY: 108,
});

// ── Fore mast: top sail + furled main sail + red pennant ─────────────────────
function foreMast(f: number): string[] {
  const W = 50, H = 88;
  const g = blank(W, H);
  pole(g, 23, 2, 84);
  // pennant
  for (let xx = 0; xx < 14; xx++) {
    const h = Math.max(1, 4 - Math.floor(xx / 4));
    const wave = Math.round(Math.sin((xx + f * 3) * 0.8));
    for (let yy = 0; yy < h; yy++) put(g, 27 + xx, 2 + yy + wave + Math.floor((4 - h) / 2), yy === h - 1 ? "R" : "q");
  }
  // top sail
  yard(g, 10, 40, 7);
  sail(g, 12, 38, 10, 28, 3);
  // furled sail on the lower yard
  yard(g, 2, 48, 40);
  for (let x = 4; x < 46; x++) {
    const bump = (x % 6 < 3) ? 0 : 1;
    put(g, x, 43, "b"); put(g, x, 44, bump ? "c" : "a"); put(g, x, 45, "c"); put(g, x, 46, bump ? "d" : "c");
  }
  for (const x of [8, 17, 30, 39]) { put(g, x, 43, "r"); put(g, x, 44, "r"); put(g, x, 45, "r"); put(g, x, 46, "r"); }
  ellipse(g, 25, 84, 6, 3, (l) => "tuvv"[l]);
  rect(g, 23, 78, 4, 6, "u"); rect(g, 23, 78, 1, 6, "T");
  return rowsOf(g);
}
export const MAST_FORE = defineProp({
  frames: [0, 1].map(foreMast),
  fps: 2.5,
  pal: { ...WOOD, ...SAIL, q: "#f05048", R: "#a82830", r: "#a08868" },
  solid: { x: 17, y: 80, w: 18, h: 9 },
  baseY: 88,
});

// ── Cannon (on its carriage) ─────────────────────────────────────────────────
const CANNON_ROWS = [
  ".ii...............",
  "ijjiiiiiiiiiii....",
  "Kjjjjjjjjjjjjjji..",
  "Kjllllllllllllljj.",
  "ijllllllllllllllkk",
  "ikkkkkkkkkkkkkkk..",
  ".kk.tttttttttttt..",
  "....tTTTTTTTTTTu..",
  "....tuuuuuuuuuuv..",
  "...vvvv....vvvv...",
  "...vuuv....vuuv...",
  "...vvvv....vvvv...",
];
const CANNON_PAL = { ...WOOD, ...IRON };
export const CANNON_L = defineProp({ rows: CANNON_ROWS, pal: CANNON_PAL, solid: { x: 0, y: 2, w: 20, h: 12 } });
export const CANNON_R = defineProp({
  rows: CANNON_ROWS.map((r) => r.split("").reverse().join("")),
  pal: CANNON_PAL,
  solid: { x: 0, y: 2, w: 20, h: 12 },
});
export const CANNONBALLS = defineProp({
  rows: [
    "....ij....",
    "...ijlk...",
    "...jllk...",
    ".ijkkijk..",
    ".jlkjjlk..",
    "ijlkijlkij",
    "jllkjllkjl",
    "kkkkkkkkkk",
  ].map((r) => r.slice(0, 10)),
  pal: IRON,
  solid: { x: 0, y: 3, w: 12, h: 7 },
});

// ── Barrel / crate ───────────────────────────────────────────────────────────
function barrelRows(): string[] {
  const g = blank(12, 15);
  for (let y = 3; y < 15; y++) {
    const half = 5.1 + 0.9 * Math.sin((Math.PI * (y - 3)) / 11);
    for (let x = 0; x < 12; x++) {
      const nx = (x + 0.5 - 6) / half;
      if (Math.abs(nx) > 1) continue;
      let c = nx < -0.5 ? "a" : nx < 0.3 ? "b" : nx < 0.75 ? "c" : "d";
      if (y === 5 || y === 12) c = nx < 0.2 ? "m" : "n";
      if (y === 14) c = "d";
      put(g, x, y, c);
    }
  }
  ellipse(g, 6, 3, 5.6, 2.6, (l, x, y, nx, ny) => (Math.hypot(nx, ny) > 0.75 ? "n" : ny < 0 ? "e" : "a"));
  return rowsOf(g);
}
export const BARREL = defineProp({
  rows: barrelRows(),
  pal: { a: "#d89858", b: "#b87440", c: "#965830", d: "#6c3c1c", e: "#e8b878", m: "#b0b0c0", n: "#6c6c80" },
  solid: { x: 0, y: 5, w: 14, h: 12 },
});

export const CRATE = defineProp({
  rows: [
    "aaaaaaaaaaaaaa",
    "abbbbbbbbbbbbc",
    "abbbbbbbbbbbbc",
    "cccccccccccccc",
    "dfffffffffffed",
    "dfeggggggggfed",
    "dgfeggggggfegd",
    "dggfeggggfeggd",
    "dgggfeggfegggd",
    "dggggfeffegggd",
    "dggggeffeggggd",
    "dgggfeggfegggd",
    "dggfeggggfeggd",
    "dfeggggggggfed",
    "dddddddddddddd",
  ],
  pal: { a: "#f0c888", b: "#dcac70", c: "#a87444", d: "#7c4c28", e: "#a87444", f: "#e8b878", g: "#c89058" },
  solid: { x: 0, y: 4, w: 16, h: 13 },
});

// ── Helm (ship's wheel on a pedestal) ────────────────────────────────────────
export const HELM = defineProp({
  rows: (() => {
    const g = blank(22, 26);
    rect(g, 9, 17, 4, 7, "u"); rect(g, 9, 17, 1, 7, "T"); rect(g, 12, 17, 1, 7, "v");
    rect(g, 6, 23, 10, 3, "v"); rect(g, 6, 23, 10, 1, "t");
    // spokes + handles
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      const x1 = 11 + Math.cos(a) * 10.5, y1 = 9 + Math.sin(a) * 10.5;
      line(g, 11, 9, Math.round(x1), Math.round(y1), "t");
      put(g, Math.round(x1), Math.round(y1), "u");
    }
    ellipse(g, 11, 9, 7.5, 7.5, (l, x, y, nx, ny) => (Math.hypot(nx, ny) > 0.7 ? "TtuV"[l] : null));
    ellipse(g, 11, 9, 2.5, 2.5, (l) => "yyYY"[l]);
    return rowsOf(g);
  })(),
  pal: { ...WOOD, V: "#6c3c1c", y: "#f8d048", Y: "#c09020" },
  solid: { x: 5, y: 18, w: 14, h: 9 },
});

// ── Treasure chest (open, sparkling) ─────────────────────────────────────────
export const TREASURE = defineProp({
  frames: [0, 1, 2].map((f) => {
    const g = blank(22, 22);
    // lid (open, tilted back): we see its red velvet inside
    rect(g, 2, 0, 18, 7, "u"); rect(g, 2, 0, 18, 1, "T");
    rect(g, 4, 1, 14, 5, "m"); rect(g, 4, 1, 14, 1, "M");
    rect(g, 2, 0, 2, 7, "y"); rect(g, 18, 0, 2, 7, "Y");
    // box
    rect(g, 1, 10, 20, 11, "t"); rect(g, 1, 10, 20, 1, "T");
    rect(g, 1, 14, 20, 1, "u"); rect(g, 1, 18, 20, 1, "u"); rect(g, 1, 20, 20, 1, "v");
    rect(g, 1, 10, 2, 11, "y"); rect(g, 19, 10, 2, 11, "Y");
    rect(g, 9, 12, 4, 4, "y"); rect(g, 10, 13, 2, 2, "k"); put(g, 9, 12, "o");
    // gold heap spilling over the rim
    ellipse(g, 11, 9, 10, 3.6, (l) => "oyYO"[l]);
    for (const [x, y, c] of [[4, 8, "W"], [9, 7, "o"], [14, 7, "o"], [17, 9, "Y"], [6, 10, "Y"], [11, 8, "r"], [15, 8, "g"], [7, 8, "b"], [12, 10, "Y"]] as const) put(g, x, y, c);
    // coins on the floor
    stamp(g, 0, 20, ["yY"]); stamp(g, 19, 21, ["oy"]);
    // sparkles
    const sp = [[[4, 6], [17, 8]], [[12, 6], [6, 9]], [[15, 6], [9, 7]]][f];
    for (const [x, y] of sp) { put(g, x, y, "W"); put(g, x - 1, y, "w"); put(g, x + 1, y, "w"); put(g, x, y - 1, "w"); }
    return rowsOf(g);
  }),
  fps: 3,
  pal: { ...WOOD, y: "#f8d048", Y: "#d09820", O: "#a87018", o: "#fff0a0", W: "#ffffff", w: "#fff8c8", k: "#5a2c20", m: "#c03048", M: "#e05868", r: "#f04858", g: "#48d870", b: "#58a8f8" },
  solid: { x: 0, y: 10, w: 24, h: 13 },
});

// ── Jolly Roger on a tall pole ───────────────────────────────────────────────
export const JOLLY_ROGER = defineProp({
  frames: [0, 1, 2].map((f) => {
    const g = blank(28, 52);
    rect(g, 2, 3, 3, 48, "u"); rect(g, 2, 3, 1, 48, "T"); rect(g, 4, 3, 1, 48, "v");
    ellipse(g, 3.5, 2, 2.5, 2, (l) => "yyYY"[l]);
    for (let xx = 0; xx < 22; xx++) {
      const wave = Math.round(Math.sin((xx + f * 2.5) * 0.45) * 1.5 * (xx / 22));
      for (let yy = 0; yy < 15; yy++) put(g, 5 + xx, 4 + yy + wave, yy === 14 || xx === 21 ? "K" : yy === 0 ? "j" : "k");
    }
    const sw = Math.round(Math.sin((10 + f * 2.5) * 0.45) * 1.5 * 0.45);
    stamp(g, 12, 7 + sw, SKULL_SMALL);
    rect(g, 0, 50, 7, 2, "v");
    return rowsOf(g);
  }),
  fps: 3,
  pal: { ...WOOD, k: "#282030", K: "#141018", j: "#484058", w: "#fffcf0", y: "#f8d048", Y: "#c09020" },
  solid: { x: 0, y: 46, w: 9, h: 8 },
  baseY: 53,
});

// ── Deck details (flat) ──────────────────────────────────────────────────────
export const HATCH = defineProp({
  rows: (() => {
    const g = blank(26, 20);
    rect(g, 0, 0, 26, 20, "v"); rect(g, 0, 0, 26, 1, "t"); rect(g, 0, 0, 1, 20, "t");
    rect(g, 2, 2, 22, 16, "k");
    for (let x = 2; x < 24; x += 4) rect(g, x, 2, 2, 16, "u");
    for (let y = 2; y < 18; y += 4) rect(g, 2, y, 22, 1, "u");
    for (let x = 2; x < 24; x += 4) rect(g, x, 2, 1, 16, "t");
    return rowsOf(g);
  })(),
  pal: { ...WOOD, k: "#2c1810" },
  flat: true,
  solid: { x: 1, y: 1, w: 26, h: 20 },
});

export const ROPE_COIL = defineProp({
  rows: (() => {
    const g = blank(16, 10);
    for (const [r, c] of [[1, "r"], [0.78, "R"], [0.6, "r"], [0.42, "R"], [0.24, "k"]] as const) {
      ellipse(g, 8, 5, 7.5 * r, 4.5 * r, () => c);
    }
    put(g, 14, 2, "r"); put(g, 15, 1, "r");
    return rowsOf(g);
  })(),
  pal: { r: "#e8d098", R: "#b89c68", k: "#8a6c40" },
  flat: true,
});

export const ANCHOR = defineProp({
  rows: [
    "......jij.......",
    ".....j...j......",
    "......jij.......",
    "...iiiiiiiiii...",
    "...jjjjijjjjj...",
    ".......ij.......",
    ".......ij.......",
    ".......ij.......",
    ".......ij.......",
    ".......ij.......",
    ".......ij.......",
    "i......ij......i",
    "ij.....ij.....ij",
    ".ij....ij....ij.",
    "..ijj..ij..jji..",
    "....jjjijjjj....",
    "......jjjj......",
  ],
  pal: IRON,
  flat: true,
  solid: { x: 0, y: 2, w: 18, h: 17 },
});

export const STAIRS = defineProp({
  rows: (() => {
    const g = blank(32, 12);
    for (let s = 0; s < 4; s++) {
      const y = s * 3;
      rect(g, 0, y, 32, 1, "a"); rect(g, 0, y + 1, 32, 1, "b"); rect(g, 0, y + 2, 32, 1, "c");
    }
    rect(g, 0, 0, 2, 12, "c"); rect(g, 30, 0, 2, 12, "c");
    return rowsOf(g);
  })(),
  pal: { a: "#fae0a8", b: "#e0b478", c: "#a87444" },
  flat: true,
});

/** Quarterdeck railing segment (16 px wide). */
export const BALUSTRADE = defineProp({
  rows: [
    "tttttttttttttttt",
    "uuuuuuuuuuuuuuuu",
    ".Tu..Tu..Tu..Tu.",
    ".Tu..Tu..Tu..Tu.",
    ".Tu..Tu..Tu..Tu.",
    ".Tu..Tu..Tu..Tu.",
    "vvvvvvvvvvvvvvvv",
  ],
  pal: WOOD,
  solid: { x: 0, y: 2, w: 18, h: 7 },
});

export const LANTERN = defineProp({
  frames: [0, 1].map((f) => [
    "..vv....",
    "..vu....",
    "..vu.kk.",
    "..vuuuk.",
    "..vu.k..",
    "..vu.kkk",
    "..vu.kyk",
    "..vu.k" + (f ? "w" : "y") + "k",
    "..vu.kkk",
    "..vu....",
    "..vu....",
    "..vu....",
    "..vu....",
    "..vu....",
    "..vu....",
    "..vu....",
    ".vvuu...",
  ].map((r) => r.padEnd(8, "."))),
  fps: 2,
  pal: { ...WOOD, k: "#3c3448", y: "#f8c840", w: "#fff8b0" },
  solid: { x: 1, y: 14, w: 7, h: 5 },
});

export const PARROT = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(14, 24);
    rect(g, 6, 9, 2, 14, "u"); rect(g, 6, 9, 1, 14, "T");
    rect(g, 2, 8, 10, 2, "t"); rect(g, 2, 9, 10, 1, "v");
    rect(g, 3, 22, 8, 2, "v");
    const hy = f ? 1 : 0;
    stamp(g, 4, hy, [
      "..rrr.",
      ".rrwkr",
      ".rrrrYy",
      "rrrrr.",
      "rgrrr.",
      "rgGrr.",
      ".gGbr.",
      "..Gb..",
    ].map((r) => r));
    put(g, 5, 8, "o"); put(g, 8, 8, "o");
    return rowsOf(g);
  }),
  fps: 1.5,
  pal: { ...WOOD, r: "#f04040", w: "#ffffff", k: "#181818", y: "#f8d048", Y: "#383030", g: "#48c858", G: "#2c9040", b: "#4888f0", o: "#f8a030" },
  solid: { x: 2, y: 20, w: 10, h: 5 },
});

export const MAP_TABLE = defineProp({
  rows: (() => {
    const g = blank(28, 18);
    rect(g, 0, 0, 28, 11, "t"); rect(g, 0, 0, 28, 1, "T"); rect(g, 0, 10, 28, 1, "v");
    rect(g, 2, 1, 20, 8, "p"); rect(g, 2, 8, 20, 1, "P"); rect(g, 21, 1, 1, 8, "P");
    // dashed route + X + island blobs
    for (let x = 4; x < 17; x += 2) put(g, x, 6 - ((x >> 2) % 2), "r");
    stamp(g, 16, 2, ["r.r", ".r.", "r.r"]);
    stamp(g, 4, 2, ["gg", "gG"]);
    // compass + candle
    ellipse(g, 25, 4, 2, 2, (l) => "yyYY"[l]); put(g, 25, 4, "k");
    rect(g, 24, 7, 2, 3, "w"); put(g, 24, 6, "y");
    // legs
    rect(g, 1, 11, 2, 6, "u"); rect(g, 25, 11, 2, 6, "u");
    rect(g, 1, 11, 26, 1, "v");
    return rowsOf(g);
  })(),
  pal: { ...WOOD, p: "#f8e8c0", P: "#d8c090", r: "#d03838", g: "#68b848", G: "#3c8838", y: "#f8d048", Y: "#c09020", k: "#282030", w: "#fff8e8" },
  solid: { x: 0, y: 4, w: 30, h: 15 },
});

export const MOP_BUCKET = defineProp({
  rows: [
    "....t.....",
    "....t.....",
    "....t.....",
    "....t.....",
    "....t.....",
    "....t.....",
    "...wtw....",
    "..wwwww...",
    "..wWwWw...",
    "mmmmmmmm..",
    "naaaaaam..",
    "nbbbbbbm..",
    ".nbbbbm...",
    ".nbbbbm...",
    "..nnnn....",
  ],
  pal: { t: "#c88850", w: "#f0ead8", W: "#c8c0a8", m: "#b0b0c0", n: "#6c6c80", a: "#a8d8f8", b: "#909098" },
  solid: { x: 0, y: 9, w: 10, h: 8 },
});

export const SHARK_FIN = defineProp({
  frames: [0, 1, 2, 3].map((f) => {
    const g = blank(34, 10);
    const x = 6 + f * 6;
    stamp(g, x, 0, [
      "...g..",
      "..gG..",
      "..gGG.",
      ".ggGG.",
      ".gggGG",
      "gggGGG",
    ]);
    for (let k = 0; k < x; k += 2) put(g, k, 6 + (k % 4 === 0 ? 1 : 0), "f");
    for (let k = 0; k < 8; k++) put(g, x - 1 + k, 7, "f");
    put(g, x + 7, 6, "f");
    return rowsOf(g);
  }),
  fps: 1.5,
  pal: { g: "#8890a8", G: "#5c6078", f: "#ffffff" },
  flat: true,
  outline: false,
});

export const BOWSPRIT = defineProp({
  rows: (() => {
    const g = blank(14, 30);
    rect(g, 6, 0, 3, 30, "u"); rect(g, 6, 0, 1, 30, "T"); rect(g, 8, 0, 1, 30, "v");
    ellipse(g, 7.5, 1.5, 2, 2, (l) => "yyYY"[l]);
    line(g, 7, 2, 0, 29, "r"); line(g, 8, 2, 13, 29, "r");
    return rowsOf(g);
  })(),
  pal: { ...WOOD, y: "#f8d048", Y: "#c09020", r: "#d8c898" },
  solid: null,
});

export const X_MARK = defineProp({
  rows: [
    "rr...rr",
    ".rr.rr.",
    "..rrr..",
    ".rr.rr.",
    "rr...rr",
  ],
  pal: { r: "#d83838" },
  flat: true,
  outline: false,
});
