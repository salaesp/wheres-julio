// Jungle props: giant trees with lianas, palms, ferns, tropical flowers,
// mossy rocks, a waterfall, monkeys, parrots, temple ruins and logs.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, flipRows, line, pad } from "./artkit";

const JLEAF = {
  a: "#94d860", b: "#56a840", c: "#368034", d: "#205a2a",
  t: "#a8784c", u: "#80563a", v: "#5a3a26",
  l: "#5c9c34", L: "#8cc850", p: "#f878b8", y: "#f8e060",
};

/** Hang a liana from (x, y0) down `len` px with alternating leaves. */
function liana(g: CharGrid, x: number, y0: number, len: number, seed = 0) {
  for (let k = 0; k < len; k++) {
    const xx = x + (Math.floor((k + seed) / 5) % 2 === 0 ? 0 : 1);
    if (g[y0 + k]?.[xx] === undefined) continue;
    put(g, xx, y0 + k, "l");
    if ((k + seed) % 4 === 1) put(g, xx - 1, y0 + k, "L");
    if ((k + seed) % 4 === 3) put(g, xx + 1, y0 + k, "L");
  }
}

// ── Giant jungle tree with buttress roots and lianas ─────────────────────────
function jungleTreeRows(v: number): string[] {
  const W = 52, H = 62;
  const g = blank(W, H);
  // buttress roots + trunk
  for (let y = 34; y < H - 1; y++) {
    const spread = y > 50 ? Math.round((y - 50) * 1.3) : 0;
    for (let x = 20 - spread; x <= 31 + spread; x++) {
      const rel = (x - (20 - spread)) / (11 + spread * 2);
      let c = rel < 0.25 ? "t" : rel < 0.7 ? "u" : "v";
      if (spread > 2 && (x === 20 - spread + 3 || x === 31 + spread - 4)) c = "v";
      if ((x === 23 || x === 27) && y < 52 && y % 5 !== 0) c = "v";
      put(g, x, y, c);
    }
  }
  for (const [x, w] of [[12, 3], [36, 3]] as const) rect(g, x, H - 3, w, 2, "u");
  const j = v ? 2 : 0;
  blobs(g, [
    { x: 26, y: 21, rx: 25, ry: 15 },
    { x: 13 - j, y: 15, rx: 12, ry: 10 },
    { x: 39 + j, y: 15, rx: 12, ry: 10 },
    { x: 26, y: 10, rx: 13, ry: 9.5 },
    { x: 9, y: 27, rx: 9, ry: 7 },
    { x: 43, y: 27, rx: 9, ry: 7 },
    { x: 26, y: 26, rx: 13, ry: 8 },
    { x: 18 + j, y: 19, rx: 7, ry: 6 },
    { x: 34 - j, y: 20, rx: 7, ry: 6 },
  ], "abcd");
  // lianas from the canopy edge
  liana(g, 5, 28, 18, 0);
  liana(g, 13, 32, 12, 2);
  liana(g, 38, 32, 16, 1);
  liana(g, 46, 28, 12, 3);
  if (v) {
    for (const [x, y] of [[10, 12], [33, 7], [41, 22], [20, 26]]) {
      put(g, x, y, "p"); put(g, x + 1, y, "p"); put(g, x, y + 1, "p"); put(g, x + 1, y + 1, "y");
    }
  }
  return rowsOf(g);
}
export const JUNGLE_TREE = defineProp({
  rows: jungleTreeRows(0),
  pal: JLEAF,
  solid: { x: 14, y: 50, w: 24, h: 13 },
});
export const JUNGLE_TREE_B = defineProp({
  rows: jungleTreeRows(1),
  pal: { ...JLEAF, a: "#a8e070", b: "#66b448", c: "#3c8c38", d: "#24622c" },
  solid: { x: 14, y: 50, w: 24, h: 13 },
});

/** Canopy-only crown peeking in from the map edge (no trunk). */
export const CANOPY = defineProp({
  rows: (() => {
    const g = blank(48, 30);
    blobs(g, [
      { x: 24, y: 12, rx: 24, ry: 12 },
      { x: 10, y: 14, rx: 10, ry: 9 },
      { x: 38, y: 14, rx: 10, ry: 9 },
      { x: 24, y: 18, rx: 12, ry: 7 },
    ], "abcd");
    liana(g, 7, 20, 9, 1);
    liana(g, 30, 23, 7, 0);
    liana(g, 41, 20, 10, 2);
    return rowsOf(g);
  })(),
  pal: JLEAF,
  solid: null,
});

// ── Palm tree ────────────────────────────────────────────────────────────────
function frond(g: CharGrid, cx: number, cy: number, dx: number, dy: number, L: number, droop: number, thick = false) {
  for (let s = 0; s <= L; s += 0.5) {
    const t = s / L;
    const x = Math.round(cx + dx * s);
    const y = Math.round(cy + dy * s + droop * t * t * L * 0.5);
    put(g, x, y - 1, "a");
    put(g, x, y, "b");
    if (thick && t < 0.75) put(g, x, y + 1, "b");
    const o = thick && t < 0.75 ? 1 : 0;
    if (Math.round(s * 2) % 3 !== 0) {
      put(g, x, y + 1 + o, "c");
      if (t > 0.2 && t < 0.92) put(g, x, y + 2 + o, "d");
      if (thick && t > 0.3 && t < 0.8 && Math.round(s * 2) % 3 === 1) put(g, x, y + 3 + o, "d");
    }
  }
}
function palmRows(lean: number): string[] {
  const W = 44, H = 52;
  const g = blank(W, H);
  const top = 14;
  for (let y = top; y < H; y++) {
    const t = (H - y) / (H - top);
    const cx = Math.round(21 + lean * t * t * 6);
    const ring = y % 4 === 0;
    put(g, cx - 2, y, ring ? "u" : "t");
    put(g, cx - 1, y, ring ? "t" : "t");
    put(g, cx, y, ring ? "v" : "u");
    put(g, cx + 1, y, ring ? "v" : "u");
    if (y > H - 4) { put(g, cx - 3, y, "t"); put(g, cx + 2, y, "v"); }
  }
  const cx = 21 + lean * 6, cy = 13;
  stamp(g, Math.round(cx) - 3, cy + 1, [".oOo", "oOoO", ".Oo."]);
  frond(g, cx, cy, -1, -0.1, 19, 0.9, true);
  frond(g, cx, cy, 1, -0.1, 19, 0.9, true);
  frond(g, cx, cy, -0.8, -0.6, 13, 0.8, true);
  frond(g, cx, cy, 0.8, -0.6, 13, 0.8, true);
  frond(g, cx, cy, -0.6, 0.4, 13, 0.7, true);
  frond(g, cx, cy, 0.6, 0.4, 13, 0.7, true);
  frond(g, cx, cy, 0.1, -1, 9, 0.3);
  stamp(g, Math.round(cx) - 1, cy - 1, ["ab", "bc"]);
  return rowsOf(g);
}
const PALM_PAL = {
  a: "#a8e070", b: "#60b448", c: "#3c8c38", d: "#28642c",
  t: "#d8a868", u: "#a87848", v: "#7c5434", o: "#946038", O: "#6a4024",
};
export const PALM = defineProp({ rows: palmRows(1), pal: PALM_PAL, solid: { x: 16, y: 46, w: 10, h: 8 } });
export const PALM_L = defineProp({ rows: flipRows(palmRows(1)), pal: PALM_PAL, solid: { x: 18, y: 46, w: 10, h: 8 } });

// ── Undergrowth ──────────────────────────────────────────────────────────────
export const FERN = defineProp({
  rows: (() => {
    const g = blank(22, 13);
    frond(g, 11, 11, -1, -0.45, 10, 0.9);
    frond(g, 11, 11, 1, -0.45, 10, 0.9);
    frond(g, 11, 11, -0.5, -1, 7, 0.6);
    frond(g, 11, 11, 0.5, -1, 7, 0.6);
    frond(g, 11, 11, 0, -1, 6, 0.1);
    return rowsOf(g);
  })(),
  pal: { a: "#a8e070", b: "#58b040", c: "#3a8834", d: "#24622a" },
  solid: null,
});

/** Big heart-shaped elephant-ear leaves. */
export const BIG_LEAVES = defineProp({
  rows: (() => {
    const g = blank(26, 18);
    blobs(g, [{ x: 7, y: 8, rx: 6.5, ry: 5.5 }], "abcd", { crease: false });
    blobs(g, [{ x: 19, y: 7, rx: 6.5, ry: 5.5 }], "abcd", { crease: false });
    blobs(g, [{ x: 13, y: 11, rx: 7, ry: 5.5 }], "abcd", { crease: false });
    line(g, 3, 6, 9, 10, "d"); line(g, 23, 5, 17, 9, "d"); line(g, 13, 7, 13, 15, "c");
    put(g, 7, 3, "."); put(g, 19, 2, "."); put(g, 13, 6, ".");
    rect(g, 12, 15, 2, 3, "s"); line(g, 9, 11, 12, 16, "s"); line(g, 17, 11, 14, 16, "s");
    return rowsOf(g);
  })(),
  pal: { a: "#b0ec80", b: "#68c050", c: "#40983c", d: "#2a6c2e", s: "#3c7c30" },
  solid: { x: 8, y: 13, w: 12, h: 6 },
});

/** Giant rafflesia flower lying on the forest floor. */
export const RAFFLESIA = defineProp({
  rows: (() => {
    const g = blank(22, 14);
    blobs(g, [
      { x: 4.5, y: 7.5, rx: 4.5, ry: 3.6 },
      { x: 17.5, y: 7.5, rx: 4.5, ry: 3.6 },
      { x: 7, y: 3.5, rx: 4.2, ry: 3.2 },
      { x: 15, y: 3.5, rx: 4.2, ry: 3.2 },
      { x: 11, y: 10, rx: 4.8, ry: 3.4 },
    ], "abcd", { crease: true, hi: 0.4 });
    ellipse(g, 11, 6.5, 4, 2.8, "y");
    ellipse(g, 11, 6.5, 3, 1.9, "k");
    ellipse(g, 11, 7, 2, 1, "K");
    for (const [x, y] of [[3, 7], [5, 9], [18, 6], [16, 8], [6, 3], [14, 2], [16, 4], [9, 11], [12, 12], [2, 8], [19, 9]]) put(g, x, y, "w");
    return rowsOf(g);
  })(),
  pal: { a: "#ff9080", b: "#e84c40", c: "#c03430", d: "#8c2428", y: "#f8d8b0", k: "#601c24", K: "#3c1018", w: "#fff0e8" },
  solid: null,
  flat: true,
});

/** Hibiscus bush with big pink & red flowers. */
export const HIBISCUS = defineProp({
  rows: (() => {
    const g = blank(20, 15);
    blobs(g, [
      { x: 10, y: 9, rx: 9.5, ry: 5.5 },
      { x: 6, y: 7, rx: 5.5, ry: 4.5 },
      { x: 14, y: 6.5, rx: 5.5, ry: 4.5 },
      { x: 10, y: 10, rx: 6, ry: 4 },
    ], "abcd");
    const fl = (x: number, y: number, c: string, C: string) =>
      stamp(g, x, y, [`.${c}${c}.`, `${c}${c}y${C}`, `${C}${c}${C}${C}`, `.${C}.`]);
    fl(3, 4, "p", "P"); fl(11, 3, "r", "R"); fl(14, 8, "p", "P"); fl(6, 9, "r", "R");
    return rowsOf(g);
  })(),
  pal: { a: "#90d860", b: "#52a83e", c: "#348034", d: "#205a2a", p: "#ff88c8", P: "#d04c98", r: "#ff5850", R: "#c02c38", y: "#f8e060" },
  solid: { x: 1, y: 7, w: 20, h: 10 },
});

// ── Mossy rocks ──────────────────────────────────────────────────────────────
function mossy(g: CharGrid, w: number, h: number) {
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      if (g[y][x] !== ".") {
        const depth = 1 + ((x * 5) % 3 === 0 ? 2 : (x * 3) % 4 === 0 ? 1 : 0);
        for (let k = 0; k < depth && y + k < h; k++) if (g[y + k][x] !== ".") g[y + k][x] = k === 0 && x < w / 2 ? "m" : "M";
        break;
      }
    }
  }
}
export const MOSSY_ROCK = defineProp({
  rows: (() => {
    const g = blank(16, 11);
    blobs(g, [{ x: 8, y: 6.5, rx: 7.5, ry: 4.5 }, { x: 6, y: 5, rx: 4.5, ry: 3.5 }], "efgh", { hi: 0.3 });
    mossy(g, 16, 11);
    return rowsOf(g);
  })(),
  pal: { e: "#d0ccc0", f: "#a8a498", g: "#848074", h: "#605c54", m: "#8cc850", M: "#56a03c" },
  solid: { x: 1, y: 4, w: 16, h: 8 },
});
export const MOSSY_ROCK_BIG = defineProp({
  rows: (() => {
    const g = blank(30, 19);
    blobs(g, [
      { x: 15, y: 11, rx: 14, ry: 7.5 },
      { x: 9, y: 8, rx: 7.5, ry: 6 },
      { x: 20, y: 8.5, rx: 7.5, ry: 6.5 },
    ], "efgh", { hi: 0.3 });
    mossy(g, 30, 19);
    stamp(g, 23, 12, ["Mm", "M."]);
    return rowsOf(g);
  })(),
  pal: { e: "#d0ccc0", f: "#a8a498", g: "#848074", h: "#605c54", m: "#8cc850", M: "#56a03c" },
  solid: { x: 1, y: 7, w: 30, h: 13 },
});

// ── Fallen log with mushrooms ────────────────────────────────────────────────
export const LOG = defineProp({
  rows: pad([
    ".mMm.......rr...........",
    "ttttttttttrRRrtttttt.aaa.",
    "tuuuuuuuuuuwwuuuuuuuuabbba",
    "uuuuvuuuuuuuuuuuvuuuuabcba",
    "uuuuuuuuuvuuuuuuuuuuuabbba",
    "vvvvvvvvvvvvvvvvvvvvv.aaa.",
    ".MmM......MmmM...........",
  ]),
  pal: {
    t: "#b8885c", u: "#906440", v: "#684628", a: "#c89868", b: "#e0b888", c: "#a87848",
    m: "#8cc850", M: "#56a03c", r: "#f05040", R: "#c03030", w: "#fff0e0",
  },
  solid: { x: 0, y: 1, w: 28, h: 8 },
});

// ── Waterfall (cliff + animated falling water + foam) ────────────────────────
function waterfallFrame(f: number): string[] {
  const W = 76, H = 46;
  const g = blank(W, H);
  const x0 = 18, x1 = 57; // water columns
  // rocky cliff of mossy boulders
  blobs(g, [
    { x: 9, y: 22, rx: 10, ry: 12 }, { x: 66, y: 22, rx: 10, ry: 12 },
    { x: 14, y: 8, rx: 12, ry: 9 }, { x: 61, y: 8, rx: 12, ry: 9 },
    { x: 4, y: 6, rx: 6, ry: 7 }, { x: 71, y: 6, rx: 6, ry: 7 },
    { x: 20, y: 26, rx: 8, ry: 9 }, { x: 55, y: 26, rx: 8, ry: 9 },
    { x: 10, y: 33, rx: 9, ry: 4 }, { x: 65, y: 33, rx: 9, ry: 4 },
  ], "qrRS", { hi: 0.4 });
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      if (g[y][x] !== ".") {
        const d = 1 + ((x * 5) % 4 === 0 ? 2 : (x * 7) % 3 === 0 ? 1 : 0);
        for (let k = 0; k < d; k++) if (g[y + k]?.[x] && g[y + k][x] !== ".") g[y + k][x] = k === 0 ? "m" : "M";
        break;
      }
    }
  }
  for (let y = 0; y < 36; y++) for (let x = 14; x < 62; x++) if (g[y][x] === ".") g[y][x] = "S";
  // water
  const offs = [0, 3, 6, 1, 4, 7, 2, 5];
  for (let y = 0; y < 38; y++) for (let x = x0; x <= x1; x++) {
    const k = (y - f * 3 + offs[x % 8] * 2 + 64) % 10;
    let c = k < 2 ? "w" : k < 5 ? "b" : "c";
    if (x === x0 || x === x1) c = "d";
    else if (x === x0 + 1) c = k < 4 ? "b" : "c";
    g[y][x] = c;
  }
  // rocks splitting the stream
  blobs(g, [{ x: 38, y: 13, rx: 3.5, ry: 2.5 }], "qrRR", { crease: false });
  put(g, 37, 12, "m"); put(g, 38, 12, "m");
  // foam at the base (animated)
  const foam = [
    [20, 38, 4], [28, 39, 4.5], [37, 38.5, 5], [46, 39, 4.5], [54, 38, 4],
    [24, 41.5, 3], [33, 42, 3.5], [42, 42, 3.5], [51, 41.5, 3],
  ];
  foam.forEach(([fx, fy, r], i) => {
    const o = ((f + i) % 3) - 1;
    ellipse(g, fx + o, fy, r, r * 0.65, i % 2 ? "W" : "w");
  });
  foam.forEach(([fx, fy, r], i) => { if (i % 3 === f) put(g, Math.round(fx), Math.round(fy - r * 0.5), "b"); });
  return rowsOf(g);
}
export const WATERFALL = defineProp({
  frames: [waterfallFrame(0), waterfallFrame(1), waterfallFrame(2)],
  fps: 6,
  pal: {
    q: "#c8c4b4", r: "#9c9888", R: "#767264", S: "#565448", m: "#7cc048", M: "#4c9038",
    w: "#ffffff", W: "#d8f4f0", b: "#a8e8e0", c: "#68c4c4", d: "#4098a8",
  },
  solid: { x: 0, y: 0, w: 78, h: 40 },
  baseY: 36,
});

// ── Animals ──────────────────────────────────────────────────────────────────
const MONKEY_PAL = { b: "#9a6038", B: "#c08050", c: "#6c3e24", f: "#f0c890", F: "#d0a070", k: "#2c1c18", n: "#c07858" };
const MONKEY_ROWS = [
  [
    "...bbbbb.....",
    "..bBbbbbc....",
    ".fbfffffcf...",
    ".fbkffkfcf...",
    "..bfffffc....",
    "..bffnffc....",
    "...cfffc.....",
    "..bbbbbcc..c.",
    ".bbbffbbcc..c",
    ".fbbfffbcf..c",
    "..bbfffbc..c.",
    "..bbbbbbccc..",
    ".ff.....ff...",
  ],
  [
    "...bbbbb.....",
    "..bBbbbbc....",
    ".fbfffffcf...",
    ".fbkffkfcf...",
    "..bfffffc..c.",
    "..bffnffc.c.c",
    "...cfffc..c..",
    "..bbbbbccf...",
    ".bbbffbbcc...",
    ".fbbfffbc....",
    "..bbfffbc....",
    "..bbbbbbccc..",
    ".ff.....ff...",
  ],
];
export const MONKEY = defineProp({
  frames: [MONKEY_ROWS[0], MONKEY_ROWS[0], MONKEY_ROWS[1], MONKEY_ROWS[0]], fps: 2,
  pal: MONKEY_PAL, solid: { x: 1, y: 8, w: 12, h: 7 },
});
export const MONKEY_R = defineProp({
  frames: [MONKEY_ROWS[0], MONKEY_ROWS[1], MONKEY_ROWS[0], MONKEY_ROWS[0]].map(flipRows), fps: 2,
  pal: MONKEY_PAL, solid: { x: 1, y: 8, w: 12, h: 7 },
});

/** Monkey swinging from a liana (hang it from a canopy; drawn in front). */
function hangFrame(dx: number): string[] {
  const g = blank(16, 34);
  for (let y = 0; y < 18; y++) {
    const x = 7 + Math.round((y / 18) * dx);
    put(g, x, y, "l");
    if (y % 4 === 1) put(g, x - 1, y, "L");
    if (y % 4 === 3) put(g, x + 1, y, "L");
  }
  stamp(g, 3 + dx, 16, [
    "...ff.....",
    "...bf.....",
    "..bbbbb...",
    ".bBbbbbc..",
    "fbfffffcf.",
    "fbkffkfcf.",
    ".bfffffc..",
    ".bffnffc..",
    "..cfffcc..",
    ".bbbffbbc.",
    "fbbbffbbcf",
    "..bbbbbc..",
    "..bc..bc..",
    "..ff..ff..",
    ".......cc.",
    "........c.",
  ]);
  return rowsOf(g);
}
export const MONKEY_HANG = defineProp({
  frames: [hangFrame(0), hangFrame(1), hangFrame(2), hangFrame(1)], fps: 2.5,
  pal: { ...MONKEY_PAL, l: "#5c9c34", L: "#8cc850" },
  solid: null,
  baseY: 70,
});

const PARROT_PAL = {
  r: "#f04038", R: "#b02830", Y: "#f8e8b0", w: "#ffffff", k: "#202020",
  y: "#f8d038", b: "#3878e0", B: "#2850a8", g: "#58c048", G: "#38903c", u: "#8a5a34", U: "#5c3a20",
};
const PARROT_ROWS = [
  [
    "..rrr...",
    ".rrrrr..",
    "YwkrrR..",
    "YYwrrR..",
    ".Y.rrR..",
    "...rrR..",
    "..yyrR..",
    "..bbyR..",
    "..bbbR..",
    "...bbr..",
    "..kk.rr.",
    "....rb..",
    "....br..",
    ".....b..",
  ],
  [
    "..rrr...",
    ".rrrrr..",
    "YwkrrR..",
    "YYwrrRyb",
    ".Y.rryyb",
    "...rrybB",
    "...rrRbB",
    "...rrR..",
    "...rrR..",
    "...rbr..",
    "..kk.rr.",
    "....rb..",
    "....br..",
    ".....b..",
  ],
];
/** Macaw perched in a tree canopy (drawn in front of the tree). */
export const PARROT = defineProp({
  frames: [PARROT_ROWS[0], PARROT_ROWS[0], PARROT_ROWS[0], PARROT_ROWS[1]], fps: 2,
  pal: PARROT_PAL, solid: null, baseY: 60,
});
export const PARROT_R = defineProp({
  frames: [PARROT_ROWS[0], PARROT_ROWS[1], PARROT_ROWS[0], PARROT_ROWS[0]].map(flipRows), fps: 2,
  pal: PARROT_PAL, solid: null, baseY: 60,
});
/** Blue-and-yellow macaw on a wooden perch stand. */
export const PARROT_STAND = defineProp({
  frames: [0, 1].map((f) => pad([
    ...PARROT_ROWS[f].slice(0, 11).map((r) => "..." + r),
    "..uuuuuuuuuu.",
    "...UUUuUUUU..",
    "......uU.....",
    "......uU.....",
    "......uU.....",
    "......uU.....",
    "......uU.....",
    "......uU.....",
    "......uU.....",
    "....uuuUUU...",
  ])),
  fps: 1.5,
  pal: { ...PARROT_PAL, r: "#4888f0", R: "#2c58b0", b: "#f8d038", B: "#c8a020", y: "#f8e060" },
  solid: { x: 3, y: 17, w: 9, h: 5 },
});

// ── Temple ruins ─────────────────────────────────────────────────────────────
function templeRows(): string[] {
  const W = 84, H = 70;
  const g = blank(W, H);
  const tiers = 4, th = 12;
  for (let k = 0; k < tiers; k++) {
    const w = W - k * 16;
    const xL = (W - w) / 2, yB = H - 1 - k * th, yT = yB - th + 1;
    for (let y = yT; y <= yB; y++) for (let x = xL; x < xL + w; x++) {
      const ry = y - yT;
      let c: string;
      if (ry <= 2) c = ry === 0 ? "a" : ry === 1 ? "f" : "d";
      else {
        const row = Math.floor((ry - 3) / 5);
        const by = (ry - 3) % 5;
        const bx = (x + row * 4) % 9;
        c = by === 4 || bx === 0 ? "d" : by === 0 ? "a" : "b";
      }
      if (x >= xL + w - 3 && ry > 1) c = c === "d" ? "e" : "c";
      if (x <= xL + 1 && ry > 1) c = c === "d" ? "c" : "a";
      g[y][x] = c;
    }
  }
  // central stairway
  const sx = 34, sw = 16;
  for (let y = H - 1 - tiers * th + 1; y < H; y++) for (let x = sx; x < sx + sw; x++) {
    let c = (y % 3 === 0) ? "c" : (y % 3 === 1 ? "a" : "b");
    if (x === sx || x === sx + sw - 1) c = "d";
    if (x === sx + 1) c = "c";
    g[y][x] = c;
  }
  // shrine on top
  const shY = H - tiers * th - 18;
  rect(g, 28, shY + 4, 28, 15, "b");
  rect(g, 28, shY + 4, 2, 15, "a");
  rect(g, 54, shY + 4, 2, 15, "c");
  rect(g, 26, shY, 32, 3, "a");
  rect(g, 26, shY + 3, 32, 2, "d");
  for (let x = 28; x < 56; x += 4) put(g, x, shY + 1, "d");
  rect(g, 37, shY + 8, 10, 11, "k");
  rect(g, 38, shY + 9, 8, 10, "K");
  rect(g, 36, shY + 7, 12, 1, "d");
  put(g, 41, shY + 13, "o"); put(g, 42, shY + 13, "o");
  rect(g, 30, shY + 8, 4, 10, "c"); rect(g, 50, shY + 8, 4, 10, "c");
  rect(g, 30, shY + 8, 1, 10, "a"); rect(g, 50, shY + 8, 1, 10, "a");
  // glyph carvings on tier faces
  for (const [x, y] of [[10, 60], [70, 60], [18, 48], [62, 48], [26, 36], [54, 36]]) {
    stamp(g, x, y, ["dd.dd", "d.d.d", "ddddd"]);
  }
  // moss & vines
  for (const [x, y, w] of [[3, 58, 9], [64, 58, 7], [12, 46, 6], [58, 46, 9], [22, 34, 8], [51, 34, 5], [30, shY, 7], [48, shY, 6]]) {
    for (let k = 0; k < w; k++) { put(g, x + k, y, "m"); if (k % 3 !== 2) put(g, x + k, y + 1, "M"); }
  }
  for (const [x, y, len] of [[6, 59, 8], [75, 59, 7], [16, 47, 9], [66, 47, 6], [25, 35, 10], [57, 35, 8], [33, shY + 2, 12]]) {
    liana(g, x, y, len, x);
  }
  return rowsOf(g);
}
export const TEMPLE = defineProp({
  rows: templeRows(),
  pal: {
    a: "#f4e4b8", f: "#e0cc98", b: "#cfb886", c: "#a89266", d: "#80704c", e: "#5c4e34",
    k: "#2c2830", K: "#1c1820", o: "#f8c838",
    m: "#88c850", M: "#56a03c", l: "#4c8c30", L: "#88c850",
  },
  solid: { x: 1, y: 22, w: 84, h: 50 },
});

export const RUIN_PILLAR = defineProp({
  rows: (() => {
    const g = blank(14, 28);
    for (let y = 3; y < 24; y++) for (let x = 2; x < 12; x++) {
      const c = x < 4 ? "a" : x < 8 ? "b" : x < 10 ? "c" : "d";
      g[y][x] = (x === 5 || x === 8) && y > 4 ? "c" : c;
    }
    // broken top
    const top = [3, 2, 1, 2, 4, 5, 3, 2, 4, 6];
    top.forEach((t, i) => { for (let y = 0; y < t + 3; y++) g[y][i + 2] = "."; });
    top.forEach((t, i) => put(g, i + 2, t + 3, "a"));
    rect(g, 0, 23, 14, 2, "a"); rect(g, 0, 25, 14, 2, "c"); rect(g, 12, 23, 2, 4, "d");
    rect(g, 1, 27, 12, 1, "d");
    liana(g, 9, 6, 12, 1);
    stamp(g, 2, 21, ["mM", "Mmm"]);
    return rowsOf(g);
  })(),
  pal: { a: "#e8e0c0", b: "#c4ba98", c: "#a09676", d: "#7c7258", m: "#88c850", M: "#56a03c", l: "#4c8c30", L: "#88c850" },
  solid: { x: 0, y: 21, w: 16, h: 9 },
});

export const STONE_HEAD = defineProp({
  rows: (() => {
    const g = blank(22, 22);
    blobs(g, [{ x: 11, y: 11, rx: 10.5, ry: 10.5 }], "abcd", { crease: false, hi: 0.35 });
    rect(g, 2, 19, 18, 3, "c"); rect(g, 2, 21, 18, 1, "d");
    // helmet band
    for (let x = 2; x < 20; x++) if (g[6][x] !== ".") { g[6][x] = "d"; g[5][x] = g[5][x] === "." ? "." : "a"; }
    // face
    stamp(g, 5, 9, ["aad...daad", "dkkd..dkkd"]);
    stamp(g, 9, 11, [".bb.", ".bb.", "dbbd", "cddc"]);
    stamp(g, 7, 16, ["dddddddd", ".cccccc."]);
    // moss
    for (const [x, y] of [[6, 1], [7, 1], [8, 0], [9, 0], [12, 1], [13, 2], [5, 2], [14, 1]]) put(g, x, y, "m");
    put(g, 3, 4, "M"); put(g, 4, 3, "m");
    return rowsOf(g);
  })(),
  pal: { a: "#d8d0b4", b: "#b0a888", c: "#8c8468", d: "#625c48", k: "#2c2830", m: "#88c850", M: "#56a03c" },
  solid: { x: 1, y: 12, w: 22, h: 12 },
});

export const RUBBLE = defineProp({
  rows: pad([
    "........aaaaaa.......",
    "..aaaaa.abbbbbc......",
    ".abbbbc.abbbbbc.aaa..",
    ".abmbbc.ammbbbc.abbc.",
    ".abbbbc.cccccccabmbc.",
    ".cccccc..dddddd.cccc.",
    "..dddd..........ddd..",
  ]),
  pal: { a: "#e8e0c0", b: "#c4ba98", c: "#a09676", d: "#7c7258", m: "#88c850" },
  solid: { x: 0, y: 2, w: 23, h: 7 },
});

/** Hanging lianas curtain (hang from the top edge). */
export const LIANAS = defineProp({
  rows: (() => {
    const g = blank(30, 34);
    for (let x = 0; x < 30; x++) { put(g, x, 0, "c"); put(g, x, 1, x % 3 ? "b" : "c"); if (x % 4 === 1) put(g, x, 2, "c"); }
    liana(g, 3, 1, 24, 0);
    liana(g, 9, 1, 14, 2);
    liana(g, 15, 1, 30, 1);
    liana(g, 21, 1, 18, 3);
    liana(g, 26, 1, 26, 2);
    put(g, 15, 31, "p"); put(g, 16, 31, "p"); put(g, 15, 32, "P");
    put(g, 26, 27, "p"); put(g, 27, 27, "p"); put(g, 26, 28, "P");
    return rowsOf(g);
  })(),
  pal: { b: "#56a840", c: "#368034", l: "#5c9c34", L: "#8cc850", p: "#f878b8", P: "#c04888" },
  solid: null,
  baseY: 6,
});

/** Tiki-style wooden totem near the temple. */
export const TOTEM = defineProp({
  rows: pad([
    "..aaaaaaaa..",
    ".abbbbbbbbc.",
    ".bwkbbbwkbc.",
    ".bbbbrrbbbc.",
    ".bbrrrrrrbc.",
    ".cccccccccc.",
    "ggabbbbbbcgg",
    ".gbybbbbybcg",
    ".abbbbbbbbc.",
    ".bbkkkkkkbc.",
    ".cccccccccc.",
    "..abbbbbbc..",
    "..bwkbbwkc..",
    "..bbbrrbbc..",
    "..cccccccc..",
    "..abbbbbbc..",
    "..bbbbbbbc..",
    ".dddddddddd.",
  ]),
  pal: { a: "#d89860", b: "#b07040", c: "#80502c", d: "#5c3a20", w: "#ffffff", k: "#2c1c18", r: "#e84838", y: "#f8d038", g: "#48a848" },
  solid: { x: 1, y: 13, w: 12, h: 7 },
});
