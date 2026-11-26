// Generic nature props usable by any outdoor world.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put } from "../shapes";

const LEAF = { a: "#b8f080", b: "#70c850", c: "#48a040", d: "#2a7834", t: "#b07040", u: "#7a4a2a", v: "#5a3420" };

// ── Big round tree (2×2 tiles) ───────────────────────────────────────────────
function treeRows(seed = 0): string[] {
  const g = blank(30, 32);
  // trunk
  rect(g, 12, 22, 6, 9, "t");
  rect(g, 15, 22, 3, 9, "u");
  put(g, 11, 30, "t"); put(g, 18, 30, "u");
  rect(g, 13, 24, 1, 3, "u");
  const j = seed % 2 === 0 ? 0 : 1;
  blobs(g, [
    { x: 15, y: 13, rx: 14, ry: 11 },
    { x: 15, y: 6, rx: 8, ry: 6 },
    { x: 7 + j, y: 10, rx: 6.5 },
    { x: 23 - j, y: 10, rx: 6.5 },
    { x: 15, y: 12, rx: 7, ry: 5.5 },
    { x: 8, y: 17, rx: 6.5, ry: 5.5 },
    { x: 22, y: 17, rx: 6.5, ry: 5.5 },
    { x: 15, y: 19, rx: 7.5, ry: 4.5 },
  ], "abcd");
  return rowsOf(g);
}

export const TREE = defineProp({
  rows: treeRows(0),
  pal: LEAF,
  solid: { x: 9, y: 24, w: 14, h: 9 },
});

export const TREE_B = defineProp({
  rows: treeRows(1),
  pal: { ...LEAF, a: "#c8f090", b: "#88d058", c: "#58b048", d: "#348838" },
  solid: { x: 9, y: 24, w: 14, h: 9 },
});

// ── Small round tree (1 tile wide, 2 tall) ───────────────────────────────────
export const TREE_SMALL = defineProp({
  rows: (() => {
    const g = blank(16, 24);
    rect(g, 6, 16, 4, 7, "t");
    rect(g, 8, 16, 2, 7, "u");
    blobs(g, [
      { x: 8, y: 9, rx: 7.5, ry: 8 },
      { x: 8, y: 6, rx: 5, ry: 4.5 },
      { x: 5, y: 11, rx: 3.5 },
      { x: 11, y: 11, rx: 3.5 },
      { x: 8, y: 13, rx: 4, ry: 3 },
    ]);
    return rowsOf(g);
  })(),
  pal: LEAF,
  solid: { x: 4, y: 18, w: 10, h: 7 },
});

// ── Pine tree ────────────────────────────────────────────────────────────────
export function pineRows(snow = false): string[] {
  const g = blank(22, 34);
  rect(g, 9, 27, 4, 6, "t");
  rect(g, 11, 27, 2, 6, "u");
  // stacked triangles, each shaded light on the left
  const tiers = [
    { y: 0, h: 10, w: 10 },
    { y: 6, h: 11, w: 15 },
    { y: 13, h: 12, w: 20 },
  ];
  for (const t of tiers) {
    for (let yy = 0; yy < t.h; yy++) {
      const half = Math.round(((yy + 1) / t.h) * (t.w / 2));
      for (let xx = -half; xx <= half; xx++) {
        const x = 11 + xx, y = t.y + yy;
        let c = xx < -half / 3 ? "b" : xx < half / 3 ? "c" : "d";
        if (yy === t.h - 1) c = (xx + yy) % 3 === 0 ? "d" : "c";
        if (snow && yy < 3 + (Math.abs(xx) % 2)) c = yy < 2 ? "w" : "s";
        put(g, x, y, c);
      }
    }
  }
  return rowsOf(g);
}

export const PINE = defineProp({
  rows: pineRows(false),
  pal: { b: "#58b058", c: "#388c48", d: "#226838", t: "#a06838", u: "#6a4228" },
  solid: { x: 7, y: 27, w: 10, h: 8 },
});

// ── Bush ─────────────────────────────────────────────────────────────────────
export const BUSH = defineProp({
  rows: (() => {
    const g = blank(16, 13);
    blobs(g, [
      { x: 8, y: 7, rx: 7.5, ry: 5.5 },
      { x: 5, y: 6, rx: 4.5, ry: 4 },
      { x: 11, y: 6, rx: 4.5, ry: 4 },
      { x: 8, y: 8.5, rx: 5, ry: 3.5 },
    ]);
    return rowsOf(g);
  })(),
  pal: LEAF,
  solid: { x: 1, y: 6, w: 16, h: 9 },
});

export const BUSH_FLOWER = defineProp({
  rows: (() => {
    const g = blank(16, 13);
    blobs(g, [
      { x: 8, y: 7, rx: 7.5, ry: 5.5 },
      { x: 5, y: 6, rx: 4.5, ry: 4 },
      { x: 11, y: 6, rx: 4.5, ry: 4 },
      { x: 8, y: 8.5, rx: 5, ry: 3.5 },
    ]);
    for (const [x, y] of [[4, 4], [9, 3], [12, 6], [6, 8], [10, 9], [3, 8]]) {
      put(g, x, y, "r"); put(g, x + 1, y, "r"); put(g, x, y + 1, "R"); put(g, x + 1, y + 1, "r");
    }
    return rowsOf(g);
  })(),
  pal: { ...LEAF, r: "#f86880", R: "#c83850" },
  solid: { x: 1, y: 6, w: 16, h: 9 },
});

// ── Hedge segment (tile-sized, chain them in a row) ──────────────────────────
export const HEDGE = defineProp({
  rows: (() => {
    const g = blank(16, 16);
    blobs(g, [
      { x: 8, y: 9, rx: 8.5, ry: 6.5 },
      { x: 3.5, y: 6, rx: 4, ry: 4 },
      { x: 8, y: 5, rx: 4, ry: 4 },
      { x: 12.5, y: 6, rx: 4, ry: 4 },
    ], "abcd", { crease: false });
    rect(g, 0, 13, 16, 2, "d");
    return rowsOf(g);
  })(),
  pal: { ...LEAF, a: "#a0e070", b: "#60b848", c: "#409838", d: "#287030" },
  outline: true,
  solid: { x: 0, y: 6, w: 18, h: 12 },
});

// ── Rocks ────────────────────────────────────────────────────────────────────
export const ROCK = defineProp({
  rows: (() => {
    const g = blank(14, 10);
    blobs(g, [{ x: 7, y: 5.5, rx: 6.5, ry: 4.5 }, { x: 5, y: 4, rx: 3.5, ry: 3 }], "abcd", { hi: 0.3 });
    return rowsOf(g);
  })(),
  pal: { a: "#f0f0f0", b: "#c8c8d0", c: "#a0a0b0", d: "#787890" },
  solid: { x: 1, y: 4, w: 14, h: 8 },
});

export const ROCK_BIG = defineProp({
  rows: (() => {
    const g = blank(28, 20);
    blobs(g, [
      { x: 14, y: 11, rx: 13, ry: 8.5 },
      { x: 9, y: 8, rx: 7, ry: 6 },
      { x: 19, y: 9, rx: 7, ry: 6 },
    ], "abcd", { hi: 0.3 });
    return rowsOf(g);
  })(),
  pal: { a: "#f0f0f0", b: "#c8c8d0", c: "#a0a0b0", d: "#787890" },
  solid: { x: 1, y: 8, w: 28, h: 13 },
});

// ── Flower clumps (flat decoration on grass) ─────────────────────────────────
const FLOWER_PAL = { r: "#f85868", R: "#b83048", y: "#f8e058", Y: "#c89828", w: "#ffffff", W: "#c8c8e0", g: "#3c8c34", p: "#f8a0d0", P: "#c06898" };
export const FLOWERS_RED = defineProp({
  rows: [
    ".r.....r..",
    "rRr...rRr.",
    ".r..r..r..",
    ".g.rRr.g..",
    "....r.....",
    "....g.....",
  ],
  pal: FLOWER_PAL, flat: true, outline: false,
});
export const FLOWERS_YELLOW = defineProp({
  rows: [
    "..y....y..",
    ".yYy..yYy.",
    "..y.y..y..",
    "..gyYy.g..",
    "....y.....",
    "....g.....",
  ],
  pal: FLOWER_PAL, flat: true, outline: false,
});
export const FLOWERS_MIX = defineProp({
  rows: [
    ".w.....p..",
    "wyw...pPp.",
    ".w..r..p..",
    ".g.rRr.g..",
    "....r..w..",
    "....g.wyw.",
    ".......w..",
  ],
  pal: FLOWER_PAL, flat: true, outline: false,
});

// ── Stump ────────────────────────────────────────────────────────────────────
export const STUMP = defineProp({
  rows: [
    "..aaaaaa..",
    ".abbbbbba.",
    ".abcccbba.",
    ".abbbbbba.",
    ".taaaaaau.",
    ".ttttuuuu.",
    "tttttuuuuu",
  ],
  pal: { a: "#e8c088", b: "#d0a068", c: "#b08050", t: "#a06838", u: "#6a4228" },
  solid: { x: 0, y: 3, w: 12, h: 6 },
});

void stamp;
