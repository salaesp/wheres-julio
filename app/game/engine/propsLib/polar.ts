// Polar props: igloos, snowmen, snowy pines, penguins, seals, polar bears,
// sled, log cabin, ice crystals, floes, the North Pole marker…
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put } from "../shapes";
import { pineRows } from "./nature";
import { ellipse, flipRows, line, pad } from "./artkit";

const SNOWBALL = { a: "#ffffff", b: "#eef3ff", c: "#c8d6f2", d: "#98ace0" };

// ── Snowy pines ──────────────────────────────────────────────────────────────
export const SNOW_PINE = defineProp({
  rows: pineRows(true),
  pal: { b: "#4c9c78", c: "#2e7860", d: "#1e5848", t: "#946038", u: "#5e3c24", w: "#ffffff", s: "#d0dcf4" },
  solid: { x: 7, y: 27, w: 10, h: 8 },
});

/** Smaller, rounder snow-laden fir. */
export const SNOW_FIR = defineProp({
  rows: (() => {
    const g = blank(16, 24);
    rect(g, 7, 19, 3, 4, "t"); rect(g, 9, 19, 1, 4, "u");
    const tiers = [{ y: 0, h: 8, w: 7 }, { y: 5, h: 8, w: 11 }, { y: 10, h: 10, w: 15 }];
    for (const t of tiers) {
      for (let yy = 0; yy < t.h; yy++) {
        const half = Math.round(((yy + 1) / t.h) * (t.w / 2));
        for (let xx = -half; xx <= half; xx++) {
          let c = xx < -half / 3 ? "b" : xx < half / 3 ? "c" : "d";
          if (yy < 2 + (Math.abs(xx + yy) % 2)) c = yy === 0 || xx < 0 ? "w" : "s";
          if (yy === t.h - 1 && (xx + t.y) % 3 === 0) c = "s";
          put(g, 8 + xx, t.y + yy, c);
        }
      }
    }
    return rowsOf(g);
  })(),
  pal: { b: "#58a888", c: "#38846c", d: "#246250", t: "#946038", u: "#5e3c24", w: "#ffffff", s: "#d0dcf4" },
  solid: { x: 4, y: 19, w: 10, h: 7 },
});

// ── Igloo ────────────────────────────────────────────────────────────────────
export const IGLOO = defineProp({
  rows: (() => {
    const W = 42, H = 28;
    const g = blank(W, H);
    blobs(g, [{ x: 21, y: 26, rx: 20.5, ry: 24 }], "abcd", { crease: false, hi: 0.25 });
    // flat bottom
    for (let y = 27; y < H; y++) for (let x = 0; x < W; x++) g[y][x] = g[y][x] !== "." ? "d" : ".";
    // ice-block seams
    for (let y = 3; y < H - 1; y++) for (let x = 0; x < W; x++) {
      const c = g[y][x];
      if (c === ".") continue;
      const band = Math.floor((y - 2) / 5);
      const seamRow = (y - 2) % 5 === 4;
      const seamCol = (x + band * 5) % 10 === 0;
      if (seamRow || seamCol) g[y][x] = c === "a" || c === "b" ? "c" : "d";
    }
    // entrance tunnel
    blobs(g, [{ x: 21, y: 27, rx: 8.5, ry: 11 }], "abcd", { crease: false, hi: 0.1 });
    for (let x = 13; x < 30; x++) { if (g[17][x] !== ".") g[17][x] = "c"; }
    ellipse(g, 21, 28, 5, 8.5, "k");
    ellipse(g, 21.5, 28.5, 3.8, 7, "K");
    for (let x = 0; x < W; x++) if (g[H - 1][x] === "k" || g[H - 1][x] === "K") g[H - 1][x] = "K";
    return rowsOf(g);
  })(),
  pal: { ...SNOWBALL, k: "#3c4c78", K: "#28345c" },
  solid: { x: 1, y: 10, w: 42, h: 20 },
});

// ── Snowman ──────────────────────────────────────────────────────────────────
export const SNOWMAN = defineProp({
  rows: (() => {
    const g = blank(20, 29);
    blobs(g, [{ x: 10, y: 21.5, rx: 7, ry: 6.5 }], "abcd", { crease: false });
    blobs(g, [{ x: 10, y: 13.5, rx: 5.2, ry: 4.8 }], "abcd", { crease: false });
    blobs(g, [{ x: 10, y: 7.5, rx: 4.2, ry: 4 }], "abcd", { crease: false });
    // hat
    rect(g, 7, 0, 6, 4, "k"); rect(g, 7, 0, 1, 4, "K"); rect(g, 7, 3, 6, 1, "r");
    rect(g, 5, 4, 10, 1, "k");
    // face
    put(g, 8, 7, "k"); put(g, 11, 7, "k");
    put(g, 10, 8, "o"); put(g, 11, 8, "o"); put(g, 12, 8, "O");
    put(g, 8, 10, "k"); put(g, 9, 10, "k"); put(g, 10, 10, "k"); put(g, 11, 10, "k");
    // scarf
    rect(g, 6, 11, 9, 2, "r"); rect(g, 6, 12, 9, 1, "R");
    stamp(g, 11, 13, ["rr", "rR", "Rr", "r."]);
    // buttons
    put(g, 9, 15, "k"); put(g, 9, 18, "k"); put(g, 9, 21, "k");
    // arms
    line(g, 5, 14, 1, 10, "u"); put(g, 0, 10, "u"); put(g, 1, 9, "u");
    line(g, 15, 14, 19, 10, "u"); put(g, 18, 9, "u");
    return rowsOf(g);
  })(),
  pal: { ...SNOWBALL, k: "#303040", K: "#585868", r: "#e84848", R: "#a83038", o: "#f88830", O: "#c05818", u: "#8a5a30" },
  solid: { x: 3, y: 17, w: 16, h: 13 },
});

// ── Penguins ─────────────────────────────────────────────────────────────────
const PENGUIN_PAL = { k: "#283048", K: "#485070", w: "#ffffff", W: "#c8d4ec", y: "#f8a830", e: "#ffffff" };
export const PENGUIN = defineProp({
  frames: [
    [
      "...kkkk...",
      "..kKkkkk..",
      ".kKekkekk.",
      ".kkkyykkk.",
      ".kkwwwwkk.",
      "kkwwwwwwkk",
      "kKwwwwwwkk",
      "kKwwwwwwWk",
      ".kwwwwwwk.",
      "..wwwwwW..",
      "..WwwwWW..",
      "..yy..yy..",
    ],
    [
      "...kkkk...",
      "..kKkkkk..",
      ".kKekkekk.",
      ".kkkyykkk.",
      "kkkwwwwkkk",
      "k.wwwwww.k",
      "..wwwwww..",
      ".kwwwwwwWk",
      ".kwwwwwwk.",
      "..wwwwwW..",
      "..WwwwWW..",
      ".yy....yy.",
    ],
  ],
  fps: 2,
  pal: PENGUIN_PAL,
  solid: { x: 1, y: 8, w: 10, h: 6 },
});

const PENGUIN_SIDE_ROWS = [
  [
    "..kkk....",
    ".kKkkk...",
    "yyekkk...",
    ".kkkkk...",
    ".wwkkkk..",
    ".wwwkkkk.",
    ".wwwkKkk.",
    ".wwwwKkk.",
    ".wwwwkkkk",
    "..WwwkK..",
    "..yy.y...",
  ],
  [
    ".........",
    "..kkk....",
    ".kKkkk...",
    "yyekkk...",
    ".kkkkk...",
    ".wwkkkkk.",
    ".wwwkKkk.",
    ".wwwwKkk.",
    ".wwwwkkkk",
    "..WwwkK..",
    "...y.yy..",
  ],
];
export const PENGUIN_L = defineProp({
  frames: PENGUIN_SIDE_ROWS, fps: 2, pal: PENGUIN_PAL, solid: { x: 1, y: 7, w: 9, h: 6 },
});
export const PENGUIN_R = defineProp({
  frames: PENGUIN_SIDE_ROWS.map(flipRows), fps: 2, pal: PENGUIN_PAL, solid: { x: 1, y: 7, w: 9, h: 6 },
});
/** Little penguin chick (fluffy grey). */
export const PENGUIN_CHICK = defineProp({
  frames: [
    [".kkk.", "kekek", "kWyWk", ".WWW.", ".WWW.", ".y.y."],
    [".kkk.", "kekek", "kWyWk", "WWWWW", ".WWW.", ".y.y."],
  ],
  fps: 2.5,
  pal: { k: "#383c50", e: "#ffffff", W: "#a8b0c8", y: "#f8a830" },
  solid: null,
});

// ── Seal (lying on the ice) ──────────────────────────────────────────────────
function sealFrame(f: number): string[] {
  const g = blank(22, 10);
  blobs(g, [
    { x: 12.5, y: 6, rx: 9, ry: 3.5 },
    { x: 5, y: 4.5 - f, rx: 4, ry: 3.3 },
  ], "abcd", { crease: false });
  stamp(g, 19, 3, ["cc.", ".cd", "cdd"]);
  stamp(g, 8, 8, ["dd", "d."]);
  put(g, 3, 3 - f, "k"); put(g, 1, 5 - f, "k"); put(g, 0, 5 - f, "c");
  put(g, 12, 5, "c"); put(g, 15, 6, "c"); put(g, 10, 7, "c"); put(g, 17, 5, "c");
  return rowsOf(g);
}
const SEAL_PAL = { a: "#d8e0f0", b: "#a8b4cc", c: "#8090ac", d: "#5c6888", k: "#202838" };
export const SEAL = defineProp({
  frames: [sealFrame(0), sealFrame(0), sealFrame(1), sealFrame(0)], fps: 1.2, pal: SEAL_PAL,
  solid: { x: 1, y: 3, w: 22, h: 9 },
});
export const SEAL_R = defineProp({
  frames: [sealFrame(0), sealFrame(1), sealFrame(0), sealFrame(0)].map(flipRows), fps: 1.2, pal: SEAL_PAL,
  solid: { x: 1, y: 3, w: 22, h: 9 },
});

// ── Polar bear ───────────────────────────────────────────────────────────────
function bearFrame(f: number): string[] {
  const g = blank(28, 17);
  const legs = f === 0 ? [[7, 0], [11, 1], [19, 0], [23, 1]] : [[8, 0], [10, 1], [20, 0], [22, 1]];
  for (const [lx, far] of legs) {
    rect(g, lx, 10, 3, 5, far ? "c" : "b");
    rect(g, lx, 15, 3, 1, "d");
    if (!far) put(g, lx, 10, "a");
  }
  blobs(g, [{ x: 16, y: 7.5, rx: 10.5, ry: 5.8 }, { x: 21, y: 6, rx: 5, ry: 4.5 }], "abcd", { crease: false });
  blobs(g, [{ x: 6, y: 6.5, rx: 4.8, ry: 4 }], "abcd", { crease: false });
  blobs(g, [{ x: 2.5, y: 7.5, rx: 2.5, ry: 1.8 }], "abcd", { crease: false });
  stamp(g, 5, 1, ["cc", "cd"]);
  put(g, 4, 5, "k"); put(g, 0, 7, "k"); put(g, 0, 6, "k");
  put(g, 26, 6, "c");
  return rowsOf(g);
}
const BEAR_PAL = { a: "#ffffff", b: "#f6f2e2", c: "#dcd4bc", d: "#b0a68c", k: "#202028" };
export const POLAR_BEAR = defineProp({
  frames: [bearFrame(0), bearFrame(1)], fps: 1.5, pal: BEAR_PAL,
  solid: { x: 1, y: 8, w: 28, h: 10 },
});
export const POLAR_BEAR_R = defineProp({
  frames: [bearFrame(0), bearFrame(1)].map(flipRows), fps: 1.5, pal: BEAR_PAL,
  solid: { x: 1, y: 8, w: 28, h: 10 },
});
/** Cub sitting down. */
export const BEAR_CUB = defineProp({
  rows: (() => {
    const g = blank(13, 12);
    blobs(g, [{ x: 6.5, y: 8, rx: 5.5, ry: 4 }], "abcd", { crease: false });
    blobs(g, [{ x: 6.5, y: 4, rx: 4, ry: 3.5 }], "abcd", { crease: false });
    put(g, 3, 0, "c"); put(g, 3, 1, "c"); put(g, 9, 0, "c"); put(g, 9, 1, "c");
    put(g, 5, 3, "k"); put(g, 8, 3, "k"); put(g, 6, 5, "k"); put(g, 7, 5, "k");
    rect(g, 3, 11, 2, 1, "d"); rect(g, 8, 11, 2, 1, "d");
    return rowsOf(g);
  })(),
  pal: BEAR_PAL,
  solid: { x: 1, y: 6, w: 13, h: 7 },
});

// ── Sled loaded with presents ────────────────────────────────────────────────
export const SLED = defineProp({
  rows: pad([
    "....gggG...........",
    "....gyyG.rrrrR.....",
    "....yyyy.ryyrR.....",
    "....gyGG.ryyrR.....",
    "aaaaaaaaaaaaaaaaaa..",
    "abbbbbbbbbbbbbbbbbc.",
    "aaaaaaaaaaaaaaaaaac.",
    "abbbbbbbbbbbbbbbbbc..R",
    "cccccccccccccccccc..R.",
    "..m......m......m..R..",
    "..m......m......m.R...",
    "rrrrrrrrrrrrrrrrrrr...",
    ".RRRRRRRRRRRRRRRRR....",
  ]),
  pal: {
    a: "#e8b878", b: "#c88c50", c: "#94603a", m: "#7c5034",
    r: "#e84848", R: "#a02c30", g: "#58b848", G: "#2c7c34", y: "#f8d848",
  },
  solid: { x: 0, y: 5, w: 24, h: 10 },
});

export const PRESENTS = defineProp({
  rows: pad([
    "......yy.yy.......",
    ".......yyy........",
    ".....bbbybbb......",
    ".....bBbyBbB......",
    ".....yyyyyyy......",
    ".....bBbyBbB......",
    "rrrryrrrr.gggyggg.",
    "rRrRyrRrR.gGgyGgG.",
    "yyyyyyyyy.yyyyyyy.",
    "rRrRyrRrR.gGgyGgG.",
    "rRrRyrRrR.gGgyGgG.",
    "RRRRYRRRR.GGGYGGG.",
  ]),
  pal: {
    r: "#f05050", R: "#b03038", g: "#58c058", G: "#2c8038", b: "#5888f0", B: "#3058c0",
    y: "#f8e060", Y: "#c8a030",
  },
  solid: { x: 0, y: 6, w: 20, h: 8 },
});

// ── Log cabin with snowy roof and chimney smoke ──────────────────────────────
function cabinFrame(f: number): string[] {
  const W = 58, H = 64;
  const g = blank(W, H);
  // chimney + smoke
  rect(g, 41, 10, 7, 12, "o"); rect(g, 46, 10, 2, 12, "O");
  for (let y = 12; y < 22; y += 3) for (let x = 41 + (y % 2) * 2; x < 46; x += 4) put(g, x, y, "O");
  rect(g, 40, 8, 9, 3, "a"); rect(g, 40, 10, 9, 1, "c");
  const puffs = [
    [[43, 4, 2.2], [46, 1, 1.6]],
    [[44, 3, 2.4], [42, 0.5, 1.4]],
    [[43, 5, 1.8], [45, 2, 2]],
  ][f];
  for (const [x, y, r] of puffs) ellipse(g, x, y, r, r * 0.9, "S");
  for (const [x, y, r] of puffs) put(g, Math.round(x - r / 2), Math.round(y - r / 2), "s");
  // snowy roof
  const roofTop = 12, roofBot = 36;
  for (let y = roofTop; y <= roofBot; y++) {
    const ry = y - roofTop;
    const inset = Math.max(0, 4 - Math.floor(ry / 2));
    for (let x = inset; x < W - inset; x++) {
      let c = "b";
      if (ry === 0) c = "c";
      else if (ry % 6 === 5) c = (x + ry) % 9 < 6 ? "c" : "b";
      if (x <= inset + 1 && ry > 0) c = "a";
      if (x >= W - inset - 2) c = "c";
      g[y][x] = c;
    }
  }
  // wavy snow lip + wooden eave + icicles
  for (let x = 0; x < W; x++) {
    const bump = [0, 1, 1, 2, 1, 1, 0, 0, 1, 2, 2, 1][x % 12];
    for (let k = 0; k < bump; k++) g[roofBot + 1 + k][x] = k === bump - 1 ? "c" : "b";
    if (bump === 0) g[roofBot + 1][x] = "t";
    g[roofBot][x] = x % 12 < 6 ? "b" : "c";
  }
  // walls of logs
  const wallTop = roofBot + 1;
  for (let y = wallTop; y < H; y++) for (let x = 2; x < W - 2; x++) {
    if (g[y][x] !== ".") continue;
    const ly = (y - wallTop) % 4;
    let c = ly === 0 ? "l" : ly === 3 ? "M" : "m";
    if (y === wallTop) c = "M";
    if ((x === 2 || x === W - 3) && ly !== 3) c = "e";
    g[y][x] = c;
  }
  // icicles
  for (const ix of [3, 9, 14, 22, 30, 37, 45, 51, 55]) {
    const len = 2 + (ix % 3);
    for (let k = 0; k < len; k++) put(g, ix, wallTop + 1 + k, k === len - 1 ? "j" : "i");
  }
  // door
  rect(g, 24, 46, 10, H - 46, "u");
  rect(g, 25, 47, 8, H - 47, "v");
  for (let x = 27; x < 33; x += 2) rect(g, x, 47, 1, H - 47, "V");
  put(g, 31, 55, "y");
  // wreath
  stamp(g, 27, 48, [".gg.", "grRg", "g..g", ".gg."]);
  // warm windows
  for (const wx of [7, 40]) {
    rect(g, wx, 44, 11, 10, "u");
    rect(g, wx + 1, 45, 9, 8, "y");
    rect(g, wx + 5, 45, 1, 8, "u");
    rect(g, wx + 1, 48, 9, 1, "u");
    put(g, wx + 1, 45, "Y"); put(g, wx + 2, 45, "Y"); put(g, wx + 1, 46, "Y");
    rect(g, wx - 1, 53, 13, 2, "b"); rect(g, wx - 1, 54, 13, 1, "c");
  }
  // snow drifts at the base
  stamp(g, 0, H - 3, ["bb...", "bbbb.", "cccbb"]);
  stamp(g, W - 6, H - 3, ["..bbb.", ".bbbbb", "bbccc."]);
  return rowsOf(g);
}
export const CABIN = defineProp({
  frames: [cabinFrame(0), cabinFrame(1), cabinFrame(2)],
  fps: 2,
  pal: {
    a: "#ffffff", b: "#eaf0ff", c: "#c0d0f0", t: "#6a4228",
    l: "#c88c58", m: "#a46c40", M: "#784828", e: "#e0b080",
    o: "#a8a4b0", O: "#7c7888", s: "#ffffff", S: "#d8dce8",
    u: "#5c3820", v: "#8c5a30", V: "#6c4224", y: "#f8d860", Y: "#fff4c0",
    g: "#3c9048", r: "#e84848", R: "#f8d848", i: "#c8f0ff", j: "#88c8f0",
  },
  solid: { x: 1, y: 40, w: 58, h: 26 },
});

// ── Snow mounds & icy rocks ──────────────────────────────────────────────────
export const SNOW_MOUND = defineProp({
  rows: (() => {
    const g = blank(18, 9);
    blobs(g, [{ x: 9, y: 6.5, rx: 8.5, ry: 4.5 }, { x: 6, y: 5, rx: 4.5, ry: 3.5 }, { x: 12, y: 6, rx: 4, ry: 3 }], "abcd", { hi: 0.3 });
    return rowsOf(g);
  })(),
  pal: SNOWBALL,
  solid: { x: 1, y: 4, w: 18, h: 7 },
});

export const SNOW_MOUND_BIG = defineProp({
  rows: (() => {
    const g = blank(32, 15);
    blobs(g, [
      { x: 16, y: 10.5, rx: 15.5, ry: 5 },
      { x: 10, y: 8, rx: 7, ry: 6 },
      { x: 20, y: 7, rx: 7, ry: 6.5 },
      { x: 26, y: 10, rx: 5, ry: 4 },
    ], "abcd", { hi: 0.3 });
    return rowsOf(g);
  })(),
  pal: SNOWBALL,
  solid: { x: 1, y: 6, w: 32, h: 10 },
});

export const SNOWY_ROCK = defineProp({
  rows: (() => {
    const g = blank(16, 11);
    blobs(g, [{ x: 8, y: 6.5, rx: 7.5, ry: 4.5 }, { x: 6, y: 5, rx: 4.5, ry: 3.5 }], "efgh", { hi: 0.3 });
    // snow cap on the upper half
    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 11; y++) {
        if (g[y][x] !== ".") {
          const depth = 2 + ((x * 7) % 3 === 0 ? 1 : 0);
          for (let k = 0; k < depth && y + k < 11; k++) if (g[y + k][x] !== ".") g[y + k][x] = k === depth - 1 ? "c" : x < 8 ? "a" : "b";
          break;
        }
      }
    }
    return rowsOf(g);
  })(),
  pal: { ...SNOWBALL, e: "#c8c8d8", f: "#a0a0b8", g: "#7c7c98", h: "#5c5c78" },
  solid: { x: 1, y: 4, w: 16, h: 8 },
});

export const ICE_CRYSTAL = defineProp({
  rows: pad([
    "......a.......",
    ".....aab......",
    "....aabbc.....",
    "....abbbc..a..",
    ".a..abbbc.aab.",
    "aab.abbbcaabbc",
    "abbcaabbcabbbc",
    "abbcabbbcabbbc",
    "aabcabbbcaabbc",
    "abbcabbbcabbbc",
    "bbccbbbccbbccd",
    ".dddddddddddd.",
  ]),
  pal: { a: "#ffffff", b: "#b0e4fa", c: "#78bcec", d: "#4c88c8" },
  solid: { x: 0, y: 5, w: 16, h: 9 },
});

/** Floating ice floe on the sea (flat, bobs gently). */
function floeFrame(f: number, w: number): string[] {
  const g = blank(w, 10);
  const cx = w / 2;
  blobs(g, [{ x: cx, y: 4 + f * 0.4, rx: cx - 0.6, ry: 3.6 }], "aabb", { crease: false, hi: 0.2 });
  for (let x = 0; x < w; x++) {
    let last = -1;
    for (let y = 0; y < 10; y++) if (g[y][x] !== ".") last = y;
    if (last >= 0) {
      put(g, x, last + 1, "c"); put(g, x, last + 2, "d");
      if ((x + f) % 5 === 0) put(g, x, last + 3, "w");
    }
  }
  return rowsOf(g);
}
export const ICE_FLOE = defineProp({
  frames: [floeFrame(0, 22), floeFrame(1, 22)], fps: 1,
  pal: { a: "#ffffff", b: "#e0f0ff", c: "#a8d8f4", d: "#78b4e4", w: "#d8f0ff" },
  flat: true, solid: null,
});
export const ICE_FLOE_S = defineProp({
  frames: [floeFrame(1, 13), floeFrame(0, 13)], fps: 1,
  pal: { a: "#ffffff", b: "#e0f0ff", c: "#a8d8f4", d: "#78b4e4", w: "#d8f0ff" },
  flat: true, solid: null,
});

/** Ice-fishing hole with a little fish on the side. */
export const FISH_HOLE = defineProp({
  rows: pad([
    "...aaaaaaa......",
    ".aabbbbbbbaa....",
    "abbkkkkkkkbba...",
    "abkKKKKKKKkba...",
    "abkKKwKKKKkba.ff",
    "abbkkkkkkkbba.fF",
    ".acbbbbbbbca..f.",
    "...ccccccc......",
  ]),
  pal: { a: "#ffffff", b: "#d4e8f8", c: "#a0c4e8", k: "#28507c", K: "#1c3c64", w: "#88c0f0", f: "#f89060", F: "#c05838" },
  flat: true,
});

// ── The North Pole marker (candy-striped, gold ball) ─────────────────────────
export const NORTH_POLE = defineProp({
  rows: (() => {
    const g = blank(14, 42);
    blobs(g, [{ x: 7, y: 4, rx: 4.5, ry: 4.2 }], "yYzZ", { crease: false, hi: 0.2 });
    for (let y = 8; y < 38; y++) for (let x = 5; x < 9; x++) {
      const red = ((y + x) % 6) < 3;
      g[y][x] = red ? (x === 8 ? "R" : "r") : (x === 8 ? "W" : "w");
    }
    // sign
    stamp(g, 0, 14, [
      "..............",
      "bbbbbbbbbbbbb.",
      "baaaaaaaaaaab.",
      "baakaaakaaabc",
      "baakkaakaaabc",
      "baakakakaaabc",
      "baakaakkaaabc",
      "baakaaakaaabc",
      "bbbbbbbbbbbbc",
      ".cccccccccccc",
    ].map((r) => r.padEnd(14, ".")));
    // snow at the base
    blobs(g, [{ x: 7, y: 39.5, rx: 6.5, ry: 2.6 }], "abcd".replace("abcd", "sstu"), { crease: false });
    return rowsOf(g);
  })(),
  pal: {
    y: "#fff4a0", Y: "#f8d040", z: "#d8a020", Z: "#a07018",
    r: "#e83838", R: "#a82030", w: "#ffffff", W: "#d0d4e8",
    a: "#fff8e8", b: "#8a5a30", c: "#5c3a1c", k: "#3058c0",
    s: "#ffffff", t: "#d4e0f8", u: "#a8bce8",
  },
  solid: { x: 3, y: 34, w: 10, h: 8 },
});

/** Snowy lamp post (warm light). */
export const SNOW_LAMP = defineProp({
  rows: [
    "..aaaa..",
    ".abbbbc.",
    "mmmmmmmm",
    "myywwyym",
    "myywwyym",
    ".mmmmmm.",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "..nnmm..",
    ".nnmmmm.",
  ],
  pal: { a: "#ffffff", b: "#e8f0ff", c: "#b8c8e8", m: "#3c4460", n: "#6c7498", y: "#f8e070", w: "#ffffff" },
  solid: { x: 1, y: 16, w: 8, h: 5 },
});

void line;
