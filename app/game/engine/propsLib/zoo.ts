// Zoo props: enclosure fences (log fence, iron railing, low stone wall, cage
// mesh, bamboo), the animals (giraffe, zebra, elephant, lions on their rock,
// hippos, flamingos, pandas, a snake in the reptile house), enclosure
// furniture (acacia, hay feeder, trough, climbing frame, bamboo) and visitor
// stuff (entrance gate, ticket booth, carts, zoo map, animal signs, train).
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { flipRows, pad } from "./artkit";
import { ellipse, line, rod, text, textWidth, outlineWith, inEllipse } from "./pixkit";
import { hash2 } from "../terrain";

const at = (g: CharGrid, x: number, y: number) => g[y]?.[x] ?? ".";

/** Shaded bar (limb, neck, trunk, log) lit from the top-left. */
function bar(g: CharGrid, ax: number, ay: number, bx: number, by: number, half: number, ramp: string) {
  rod(g, ax, ay, bx, by, half, (_t, s) => (s < -half * 0.3 ? ramp[0] : s < half * 0.45 ? ramp[1] : ramp[2]));
}

// ════════════════════════════════════════════════════════════════════════════
// Fences & walls
// ════════════════════════════════════════════════════════════════════════════

// ── Rustic log fence (savanna / elephants): round posts + two log rails ─────
const LOG_PAL = { a: "#f0c890", b: "#c89058", c: "#9c6838", d: "#704828", e: "#e8b070" };
export const LOG_FENCE_H = defineProp({
  rows: [
    ".ea.............",
    "eabc............",
    "abbc............",
    "abbceeeeeeeeeeee",
    "abbcbbbbbbbbbbbb",
    "abbccccccccccccc",
    "abbcdddddddddddd",
    "abbc............",
    "abbceeeeeeeeeeee",
    "abbcbbbbbbbbbbbb",
    "abbccccccccccccc",
    "abbcdddddddddddd",
    "abbc............",
    "dddd............",
  ],
  pal: LOG_PAL,
  solid: { x: 0, y: 8, w: 18, h: 8 },
});
export const LOG_POST = defineProp({
  rows: [".ea.", "eabc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "dddd"],
  pal: LOG_PAL,
  solid: { x: 0, y: 8, w: 6, h: 8 },
});
/** Vertical run (16px): post on top + log rail seen from above. */
export const LOG_FENCE_V = defineProp({
  rows: [
    ".ea.", "eabc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "abbc", "dddd",
    ".ec.", ".bc.", ".bc.", ".bc.", ".bc.", ".bc.", ".bc.",
  ],
  pal: LOG_PAL,
  solid: { x: 0, y: 0, w: 6, h: 19 },
  baseY: 11,
});

// ── Green iron railing with spear tips (pond / pandas) ──────────────────────
const RAIL_PAL = { a: "#88d0a0", b: "#48a070", c: "#307850", d: "#205838", y: "#f8d050", Y: "#c09030" };
function railRows(): string[] {
  const g = blank(16, 13);
  for (let x = 0; x < 16; x += 3) {
    put(g, x, 0, "y"); put(g, x, 1, "Y");
    for (let y = 2; y < 12; y++) put(g, x, y, x === 0 ? "a" : "b");
  }
  for (let x = 0; x < 16; x++) { put(g, x, 3, "a"); put(g, x, 4, "c"); put(g, x, 10, "b"); put(g, x, 11, "d"); }
  return rowsOf(g);
}
export const RAIL_H = defineProp({ rows: railRows(), pal: RAIL_PAL, solid: { x: 0, y: 7, w: 18, h: 8 } });
export const RAIL_POST = defineProp({
  rows: ["y", "Y", "a", "a", "a", "a", "a", "a", "a", "a", "a", "a", "d"],
  pal: RAIL_PAL, solid: { x: 0, y: 7, w: 3, h: 8 },
});
export const RAIL_V = defineProp({
  rows: ["y", "Y", "a", "a", "a", "a", "a", "a", "a", "a", "a", "d", "b", "b", "b", "b", "b"],
  pal: RAIL_PAL, solid: { x: 0, y: 0, w: 3, h: 19 }, baseY: 13,
});

// ── Low stone wall (lion moat / penguin pool) ───────────────────────────────
const WALL_PAL = { a: "#f0ece0", b: "#d0c8b8", c: "#aca494", d: "#847c70", e: "#e0d8c8", m: "#988f80" };
function wallRows(w: number): string[] {
  const g = blank(w, 11);
  for (let x = 0; x < w; x++) {
    put(g, x, 0, "a"); put(g, x, 1, "e"); put(g, x, 2, x % 8 === 7 ? "c" : "e"); put(g, x, 3, "c");
  }
  for (let y = 4; y < 11; y++) {
    const course = y < 7 ? 0 : 1;
    for (let x = 0; x < w; x++) {
      const lx = (x + course * 3) % 6;
      let c = lx === 5 ? "m" : "b";
      if (y === 6 || y === 10) c = "d";
      else if ((y === 4 || y === 7) && lx < 5) c = "e";
      else if (lx === 4) c = "c";
      put(g, x, y, c);
    }
  }
  return rowsOf(g);
}
export const WALL_H = defineProp({ rows: wallRows(16), pal: WALL_PAL, solid: { x: 0, y: 4, w: 18, h: 9 } });
export const WALL_V = defineProp({
  rows: (() => {
    const g = blank(7, 18);
    for (let y = 0; y < 18; y++) for (let x = 0; x < 7; x++) {
      let c = x === 0 ? "a" : x >= 5 ? "c" : "e";
      if (y % 6 === 5) c = x === 0 ? "e" : "c";
      if (x === 6) c = "d";
      put(g, x, y, c);
    }
    return rowsOf(g);
  })(),
  pal: WALL_PAL, solid: { x: 0, y: 0, w: 9, h: 20 }, baseY: 12,
});

// ── Monkey cage mesh: tall green posts + see-through diamond wire ───────────
const MESH_PAL = { a: "#a8c8b8", b: "#688878", c: "#486858", p: "#58a068", P: "#387848", q: "#90d098", d: "#284838" };
function meshRows(w: number): string[] {
  const H = 20;
  const g = blank(w, H);
  for (let y = 2; y < H - 1; y++) for (let x = 0; x < w; x++) {
    if ((x + y) % 4 === 0 || (x - y + 400) % 4 === 0) put(g, x, y, (x + y) % 8 < 4 ? "a" : "b");
  }
  for (let x = 0; x < w; x++) { put(g, x, 0, "q"); put(g, x, 1, "P"); put(g, x, H - 2, "p"); put(g, x, H - 1, "d"); }
  for (let y = 0; y < H; y++) { put(g, 0, y, "q"); put(g, 1, y, "p"); put(g, 2, y, "P"); }
  return rowsOf(g);
}
export const MESH_H = defineProp({ rows: meshRows(16), pal: MESH_PAL, outline: false, solid: { x: 0, y: 12, w: 16, h: 8 } });
export const MESH_POST = defineProp({
  rows: Array.from({ length: 20 }, (_, y) => (y === 19 ? "ddd" : "qpP")),
  pal: MESH_PAL, outline: false, solid: { x: 0, y: 12, w: 3, h: 8 },
});
export const MESH_V = defineProp({
  rows: Array.from({ length: 28 }, (_, y) => (y < 20 ? (y === 19 ? "ddd" : "qpP") : ".a.")),
  pal: MESH_PAL, outline: false, solid: { x: 0, y: 8, w: 3, h: 20 }, baseY: 20,
});

// ── Bamboo fence (pandas) ───────────────────────────────────────────────────
const BAMF_PAL = { a: "#e8f0a0", b: "#c0d070", c: "#90a848", d: "#687830", r: "#a07040" };
export const BAMBOO_FENCE_H = defineProp({
  rows: (() => {
    const g = blank(16, 13);
    for (let x = 0; x < 16; x += 4) {
      for (let y = (x % 8 ? 1 : 0); y < 13; y++) {
        const node = y % 5 === 3;
        put(g, x, y, node ? "c" : "a"); put(g, x + 1, y, node ? "d" : "b"); put(g, x + 2, y, node ? "d" : "c");
      }
    }
    for (let x = 0; x < 16; x++) { put(g, x, 4, "r"); put(g, x, 9, "r"); }
    return rowsOf(g);
  })(),
  pal: BAMF_PAL, solid: { x: 0, y: 7, w: 18, h: 8 },
});

// ════════════════════════════════════════════════════════════════════════════
// Savanna: giraffes, zebras, acacia, hay feeder
// ════════════════════════════════════════════════════════════════════════════

const GIRAFFE_PAL = {
  a: "#fff4c0", b: "#f8d478", c: "#e0b050", d: "#b88838",
  p: "#c86c30", P: "#94481c", q: "#e08c48",
  m: "#8c4c24", h: "#5c3820", n: "#f8e4b8", k: "#2c2020", e: "#ffffff",
};
/** Giraffe facing left. headDy: 0/1 (bob), tail: -1/0/1, legPhase: stride. */
function giraffeFrame(headDy: number, tail: number, chew: number): string[] {
  const W = 26, H = 46;
  const g = blank(W, H);
  // legs (far legs darker)
  for (const [lx, far] of [[9, 1], [12, 0], [18, 1], [21, 0]] as const) {
    for (let y = 29; y < 44; y++) {
      put(g, lx, y, far ? "c" : y < 36 ? "a" : "b");
      put(g, lx + 1, y, far ? "d" : "c");
    }
    put(g, lx - (far ? 0 : 1), 37, far ? "c" : "b"); // knee
    put(g, lx, 44, "h"); put(g, lx + 1, 44, "h");
  }
  // body: high withers, sloping back
  blobs(g, [{ x: 17, y: 27.5, rx: 7.5, ry: 4 }, { x: 12, y: 25.5, rx: 5, ry: 5 }], "abcd", { crease: false });
  // neck
  const hy = headDy;
  bar(g, 11, 24, 6.5, 9 + hy, 2.4, "abc");
  // mane along the back of the neck
  for (let y = 9 + hy; y < 23; y++) {
    let rx = -1;
    for (let x = W - 1; x >= 0; x--) if (at(g, x, y) !== "." && x < 16) { rx = x; break; }
    if (rx > 0 && rx < 15) put(g, rx + 1, y, y % 2 ? "m" : "h");
  }
  // tail
  const tx = 24 + tail;
  line(g, 24, 26, tx, 32, "d");
  stamp(g, tx - 1, 32, ["mm", "hm", ".h"]);
  // reticulated patches (voronoi cells, thin pale lines between)
  const pts: [number, number][] = [];
  for (let cy = 0; cy < 12; cy++) for (let cx = 0; cx < 7; cx++) {
    pts.push([cx * 4 + (hash2(cx, cy, 5) % 3), cy * 3.6 + (hash2(cx, cy, 9) % 3)]);
  }
  for (let y = 11 + hy; y < 36; y++) for (let x = 0; x < W; x++) {
    const c = at(g, x, y);
    if (!"abc".includes(c) || c === ".") continue;
    let d1 = 1e9, d2 = 1e9;
    for (const [px, py] of pts) {
      const d = Math.hypot(x + 0.5 - px, (y + 0.5 - py) * 1.1);
      if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
    }
    if (d2 - d1 > 1.05) put(g, x, y, c === "a" ? "q" : c === "b" ? "p" : "P");
  }
  // head: long tapered skull, pale muzzle, ossicones with dark knobs, ear
  const H0 = 5 + hy;
  blobs(g, [{ x: 6.5, y: H0 + 0.8, rx: 3.8, ry: 2.9 }], "abcd", { crease: false });
  blobs(g, [{ x: 2.8, y: H0 + 2, rx: 2.8, ry: 2.1 }], "nnnc", { crease: false });
  put(g, 1, H0 + 1, "d"); // nostril
  put(g, 1 + chew, H0 + 3, "d"); put(g, 2 + chew, H0 + 3, "d"); // mouth line
  for (const ox of [6, 8]) { put(g, ox, H0 - 4, "h"); put(g, ox, H0 - 3, "d"); put(g, ox, H0 - 2, "c"); }
  put(g, 7, H0 - 4, "m");
  stamp(g, 9, H0 - 1, ["bcc", ".dd"]);
  put(g, 5, H0, "k"); put(g, 4, H0, "e"); put(g, 5, H0 - 1, "d");
  return rowsOf(g);
}
const GIRAFFE_FRAMES = [
  giraffeFrame(0, 0, 0), giraffeFrame(0, 1, 1), giraffeFrame(0, 1, 0), giraffeFrame(1, 0, 1),
  giraffeFrame(1, -1, 0), giraffeFrame(0, -1, 1),
];
const GIRAFFE_SOLID = { x: 7, y: 36, w: 18, h: 11 };
export const GIRAFFE = defineProp({ frames: GIRAFFE_FRAMES, fps: 2, pal: GIRAFFE_PAL, solid: GIRAFFE_SOLID });
export const GIRAFFE_R = defineProp({ frames: GIRAFFE_FRAMES.map(flipRows), fps: 1.7, pal: GIRAFFE_PAL, solid: { x: 3, y: 36, w: 18, h: 11 } });

const ZEBRA_PAL = { a: "#ffffff", b: "#f0f0f8", c: "#d0d0e0", d: "#a8a8c0", k: "#303040", K: "#4c4c60", n: "#585060", h: "#383038", e: "#ffffff" };
/** Zebra facing left; graze = head down to the grass. */
function zebraFrame(graze: number, tail: number, leg: number): string[] {
  const W = 25, H = 19;
  const g = blank(W, H);
  for (const [lx, far] of [[6, 1], [8, 0], [16, 1], [18, 0]] as const) {
    const off = !far && leg ? (lx < 12 ? -1 : 1) : 0;
    for (let y = 11; y < 17; y++) put(g, lx + (y > 14 ? off : 0), y, y % 2 ? (far ? "K" : "k") : far ? "d" : "b");
    put(g, lx + off, 17, "h");
  }
  blobs(g, [{ x: 13, y: 8, rx: 8, ry: 4.2 }], "abcd", { crease: false });
  // stripes: vertical on the barrel, curving back on the rump
  for (let y = 3; y < 13; y++) for (let x = 5; x < 22; x++) {
    const c = at(g, x, y);
    if (!"abcd".includes(c) || c === ".") continue;
    const k = x < 16 ? Math.floor(x + y * 0.25) : Math.floor(x - y * 0.6);
    if (k % 3 === 0) put(g, x, y, c === "d" || c === "c" ? "K" : "k");
  }
  // neck + head
  const neckPaint = (t: number, sv: number) =>
    sv < -1.3 ? (Math.floor(t) % 2 ? "k" : "a") : Math.floor(t + 0.5) % 3 === 0 ? (sv < 0.8 ? "k" : "K") : sv < 0.8 ? "b" : "c";
  if (graze) {
    rod(g, 8, 7, 3, 13, 2.3, neckPaint);
    blobs(g, [{ x: 2.8, y: 14, rx: 2.8, ry: 2.2 }], "abcd", { crease: false });
    stamp(g, 0, 14, ["nn", "nn"]);
    put(g, 3, 13, "k"); put(g, 4, 15, "K");
    stamp(g, 5, 11, ["k", "kk"]);
  } else {
    rod(g, 8, 7.5, 4.5, 3.5, 2.3, neckPaint);
    blobs(g, [{ x: 3.2, y: 3.6, rx: 3.1, ry: 2.4 }], "abcd", { crease: false });
    stamp(g, 0, 3, ["nn", "nn", ".n"]);
    for (let y = 1; y < 6; y++) for (let x = 3; x < 7; x++) if (x % 2 === 0 && "abcd".includes(at(g, x, y)) && at(g, x, y) !== ".") put(g, x, y, "K");
    put(g, 3, 2, "k"); put(g, 2, 2, "a"); // eye
    stamp(g, 4, -1, ["a.k", "kkk"].map((r) => r)); // ears
    stamp(g, 4, 0, ["kak"]);
  }
  // tail
  line(g, 21, 6, 22 + tail, 11, "d");
  stamp(g, 21 + tail, 12, ["kk", ".k"]);
  return rowsOf(g);
}
const ZEBRA_FRAMES = [zebraFrame(0, 0, 0), zebraFrame(0, 1, 0), zebraFrame(1, 1, 0), zebraFrame(1, 0, 1), zebraFrame(1, -1, 0), zebraFrame(0, 0, 1)];
export const ZEBRA = defineProp({ frames: ZEBRA_FRAMES, fps: 1.6, pal: ZEBRA_PAL, solid: { x: 2, y: 10, w: 22, h: 10 } });
export const ZEBRA_R = defineProp({ frames: [...ZEBRA_FRAMES.slice(3), ...ZEBRA_FRAMES.slice(0, 3)].map(flipRows), fps: 1.4, pal: ZEBRA_PAL, solid: { x: 3, y: 10, w: 22, h: 10 } });

// ── Acacia: flat umbrella canopy on a forked trunk ───────────────────────────
const ACACIA_PAL = { a: "#c8e078", b: "#98c050", c: "#70a038", d: "#4c7828", t: "#a87850", T: "#7c5434", u: "#5c3c24", s: "#c09848" };
export const ACACIA = defineProp({
  rows: (() => {
    const g = blank(54, 44);
    // trunk + fork
    bar(g, 27, 43, 26, 26, 2.4, "ttT");
    bar(g, 26, 28, 16, 13, 1.6, "ttT");
    bar(g, 27, 27, 38, 12, 1.6, "ttT");
    bar(g, 26.5, 22, 27.5, 12, 1.2, "tTT");
    stamp(g, 23, 42, ["uu.....uu", ".uuuuuuu."]);
    blobs(g, [
      { x: 10, y: 11, rx: 9, ry: 4 }, { x: 22, y: 8, rx: 11, ry: 5 }, { x: 36, y: 8.5, rx: 11, ry: 5 },
      { x: 45, y: 12, rx: 8, ry: 3.6 }, { x: 18, y: 13, rx: 9, ry: 3.5 }, { x: 33, y: 13.5, rx: 10, ry: 3.6 },
    ], "abcd");
    // leaf speckle
    for (let y = 3; y < 18; y++) for (let x = 0; x < 54; x++) {
      if (at(g, x, y) === "b" && hash2(x, y, 3) % 9 === 0) put(g, x, y, "a");
      if (at(g, x, y) === "c" && hash2(x, y, 4) % 7 === 0) put(g, x, y, "d");
    }
    return rowsOf(g);
  })(),
  pal: ACACIA_PAL,
  solid: { x: 23, y: 37, w: 10, h: 8 },
});

// ── Hay feeder on a tall pole (for giraffes) ────────────────────────────────
const FEEDER_PAL = { ...LOG_PAL, y: "#f8e070", Y: "#d8b040", z: "#a88028", w: "#c89860", W: "#906838" };
export const HAY_FEEDER = defineProp({
  rows: (() => {
    const g = blank(14, 40);
    for (let y = 8; y < 39; y++) { put(g, 6, y, "a"); put(g, 7, y, "c"); }
    stamp(g, 4, 39, ["dddddd"]);
    // basket
    for (let y = 5; y < 11; y++) for (let x = 1; x < 13; x++) {
      const inset = y - 5 > 3 ? 1 : 0;
      if (x < 1 + inset || x > 12 - inset) continue;
      put(g, x, y, (x + y) % 3 === 0 ? "W" : "w");
    }
    stamp(g, 0, 0, [
      "..y.Y..y.y....",
      ".yYyyY.yYy.y..",
      "yyYyzyYyyYyYy.",
      "YyzYyYyzYyYzY.",
      ".zYzYzzYzYzz..",
    ]);
    put(g, 0, 7, "Y"); put(g, 13, 8, "y");
    return rowsOf(g);
  })(),
  pal: FEEDER_PAL,
  solid: { x: 4, y: 32, w: 8, h: 10 },
});

// ════════════════════════════════════════════════════════════════════════════
// Elephants
// ════════════════════════════════════════════════════════════════════════════
const ELE_PAL = {
  a: "#e0e0f0", b: "#b8b8d0", c: "#9898b4", d: "#787898", e: "#5c5c7c",
  t: "#fff8e8", T: "#d8d0b8", k: "#282838", n: "#e8e0d0", p: "#e8a8b8",
};
/** Elephant facing left. trunk: 0 down, 1 forward, 2 raised; ear: 0/1 flap. */
function elephantFrame(trunk: number, ear: number, small = false): string[] {
  const s = small ? 0.64 : 1;
  const W = Math.round(38 * s), H = Math.round(30 * s);
  const g = blank(W, H);
  const S = (v: number) => v * s;
  const legW = small ? 3 : 5;
  // legs
  for (const [lx, far] of [[9, 1], [14, 0], [25, 1], [30, 0]] as const) {
    const x0 = Math.round(S(lx));
    for (let y = Math.round(S(18)); y < H - 1; y++) for (let i = 0; i < legW; i++) {
      put(g, x0 + i, y, far ? (i === 0 ? "c" : "d") : i === 0 ? "b" : i === legW - 1 ? "d" : "c");
    }
    for (let i = 0; i < legW; i++) put(g, x0 + i, H - 1, i % 2 ? (far ? "d" : "c") : "n");
  }
  // body + head
  blobs(g, [{ x: S(23), y: S(12.5), rx: S(13), ry: S(9) }], "abcd", { crease: false });
  blobs(g, [{ x: S(10), y: S(10), rx: S(7.2), ry: S(7.5) }], "abcd", { crease: false });
  // trunk
  const tip = trunk === 0 ? [S(4), S(27)] : trunk === 1 ? [S(1), S(23)] : [S(1.5), S(10)];
  const mid = trunk === 2 ? [S(2), S(18)] : [S(4.5), S(20)];
  bar(g, S(6.5), S(13), mid[0], mid[1], small ? 1.6 : 2.4, "bcd");
  bar(g, mid[0], mid[1], tip[0], tip[1], small ? 1.3 : 1.9, "bcd");
  // trunk rings
  for (let y = Math.round(S(15)); y < H; y += 2) for (let x = 0; x < Math.round(S(9)); x++) {
    if (at(g, x, y) === "c" && hash2(x, y, 1) % 2 === 0) put(g, x, y, "d");
  }
  if (trunk === 2) put(g, Math.round(tip[0]), Math.round(tip[1]) - 1, "p");
  // tusk
  if (!small) stamp(g, 3, 16, ["...tT", "..tT.", "tTT..", ".T..."]);
  // ear (flaps)
  const earG = blank(W, H);
  blobs(earG, [{ x: S(14.5 + ear * 0.6), y: S(10.5), rx: S(5 + ear), ry: S(6.5) }], "bccd", { crease: false });
  const inEar = (x: number, y: number) => at(earG, x, y) !== ".";
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inEar(x, y)) continue;
    const edge = !inEar(x + 1, y) || !inEar(x, y + 1);
    put(g, x, y, edge ? "e" : at(earG, x, y));
  }
  // eye + wrinkles + tail
  put(g, Math.round(S(8)), Math.round(S(8)), "k");
  put(g, Math.round(S(7)), Math.round(S(7)), "c");
  for (const [wx, wy] of [[20, 15], [27, 9], [31, 14], [24, 19]]) put(g, Math.round(S(wx)), Math.round(S(wy)), "c");
  const tx = Math.round(S(36)), ty = Math.round(S(10));
  line(g, tx - 1, ty, tx, ty + Math.round(S(8)), "d");
  put(g, tx, ty + Math.round(S(8)) + 1, "e");
  return rowsOf(g);
}
const ELE_FRAMES = [elephantFrame(0, 0), elephantFrame(0, 1), elephantFrame(1, 0), elephantFrame(2, 1), elephantFrame(1, 0), elephantFrame(0, 1)];
export const ELEPHANT = defineProp({ frames: ELE_FRAMES, fps: 1.6, pal: ELE_PAL, solid: { x: 2, y: 18, w: 36, h: 14 } });
export const ELEPHANT_R = defineProp({ frames: ELE_FRAMES.map(flipRows), fps: 1.4, pal: ELE_PAL, solid: { x: 2, y: 18, w: 36, h: 14 } });
const BABY_FRAMES = [elephantFrame(0, 0, true), elephantFrame(1, 1, true), elephantFrame(2, 0, true), elephantFrame(1, 1, true)];
export const ELEPHANT_BABY = defineProp({ frames: BABY_FRAMES, fps: 2.2, pal: ELE_PAL, solid: { x: 1, y: 12, w: 24, h: 9 } });
export const ELEPHANT_BABY_R = defineProp({ frames: BABY_FRAMES.map(flipRows), fps: 2, pal: ELE_PAL, solid: { x: 1, y: 12, w: 24, h: 9 } });

// ── Stone water trough (animated shimmer) ───────────────────────────────────
const TROUGH_PAL = { a: "#e8e4dc", b: "#c8c0b4", c: "#a49c90", d: "#7c7468", w: "#88c8f8", W: "#5898e0", x: "#e0f4ff" };
function troughRows(f: number): string[] {
  const g = blank(34, 14);
  rect(g, 0, 2, 34, 12, "b");
  rect(g, 0, 2, 34, 1, "a"); rect(g, 0, 2, 1, 12, "a");
  rect(g, 0, 11, 34, 3, "c"); rect(g, 0, 13, 34, 1, "d");
  for (let x = 5; x < 34; x += 7) put(g, x, 12, "d");
  rect(g, 2, 4, 30, 6, "W");
  rect(g, 2, 4, 30, 1, "d");
  for (let x = 3; x < 31; x++) if ((x + f * 2) % 7 < 3) put(g, x, 6, "w");
  for (let x = 4; x < 31; x++) if ((x + 3 + f * 2) % 9 < 2) put(g, x, 8, "x");
  rect(g, 33, 3, 1, 9, "c");
  // tap
  stamp(g, 28, 0, ["ccc", "..c"]);
  return rowsOf(g);
}
export const TROUGH_STONE = defineProp({ frames: [troughRows(0), troughRows(1), troughRows(2)], fps: 3, pal: TROUGH_PAL, solid: { x: 0, y: 4, w: 36, h: 12 } });

// ════════════════════════════════════════════════════════════════════════════
// Lions
// ════════════════════════════════════════════════════════════════════════════
const LION_PAL = {
  a: "#ffe8b0", b: "#f0c070", c: "#d89c48", d: "#b07830",
  m: "#d87028", M: "#a04818", N: "#f09840", O: "#7c3410",
  f: "#fff0d0", k: "#2c1c14", r: "#904038",
  // rock
  s: "#e0d4c0", S: "#c0b098", t: "#a08c74", T: "#7c6a58", u: "#5c4c40", g: "#88b850", G: "#5c8c38",
};
/** Male lion lying down, facing left. f: breath/tail phase. */
function lionLying(f: number, maneOnly = true): string[] {
  const g = blank(34, 19);
  const br = f % 2 ? 0.4 : 0;
  // tail
  const tailUp = f === 2;
  line(g, 30, 13, 33, tailUp ? 9 : 15, "c");
  stamp(g, 32, tailUp ? 7 : 15, ["MM", "MO"]);
  // body + haunch + paws
  blobs(g, [{ x: 20, y: 12, rx: 11, ry: 4.8 + br }], "abcd", { crease: false });
  blobs(g, [{ x: 26.5, y: 11.5, rx: 4.8, ry: 4.5 + br }], "abcd");
  rect(g, 3, 15, 12, 3, "b");
  rect(g, 3, 17, 12, 1, "d"); rect(g, 3, 15, 12, 1, "a");
  for (const x of [5, 7, 10, 12]) put(g, x, 17, "c");
  // mane
  if (maneOnly) {
    blobs(g, [{ x: 10, y: 8, rx: 7.5, ry: 7.2 }], "NmMO", { crease: false });
    for (let a = 0; a < 18; a++) {
      const ang = (a / 18) * Math.PI * 2;
      const x = Math.round(10 + Math.cos(ang) * 8), y = Math.round(8 + Math.sin(ang) * 7.6);
      if (y < 15 && hash2(a, 1, 2) % 2) put(g, x, y, Math.sin(ang) < 0 ? "m" : "M");
    }
  }
  // face (3/4 view)
  blobs(g, [{ x: 8.5, y: 9, rx: 4, ry: 4 }], "abcd", { crease: false });
  ellipse(g, 7.5, 11.4, 2.6, 1.6, "f");
  put(g, 6, 7, "k"); put(g, 9, 7, "k");
  put(g, 7, 10, "r"); put(g, 8, 10, "r"); put(g, 7, 11, "d");
  if (f === 3) put(g, 7, 12, "r"); // tiny yawn
  // ears
  if (!maneOnly) { stamp(g, 5, 4, ["cd"]); stamp(g, 10, 4, ["cd"]); }
  return rowsOf(g);
}
const LION_FRAMES = [lionLying(0), lionLying(1), lionLying(0), lionLying(1), lionLying(2), lionLying(1), lionLying(0), lionLying(3)];
export const LION = defineProp({ frames: LION_FRAMES, fps: 1.5, pal: LION_PAL, solid: { x: 2, y: 10, w: 32, h: 10 } });
export const LION_R = defineProp({ frames: LION_FRAMES.map(flipRows), fps: 1.3, pal: LION_PAL, solid: { x: 2, y: 10, w: 32, h: 10 } });
const LIONESS_FRAMES = [lionLying(0, false), lionLying(1, false), lionLying(2, false), lionLying(1, false)];
export const LIONESS = defineProp({ frames: LIONESS_FRAMES, fps: 1.2, pal: LION_PAL, solid: { x: 2, y: 10, w: 32, h: 10 } });
export const LIONESS_R = defineProp({ frames: LIONESS_FRAMES.map(flipRows), fps: 1.1, pal: LION_PAL, solid: { x: 2, y: 10, w: 32, h: 10 } });

/** Lion cub walking (small, playful). */
function cubFrame(f: number): string[] {
  return pad([
    ".cd.cd..........",
    ".bbbbc..........",
    "bkbkbbc.........",
    "bbffbbcbbbbbb..c",
    ".frfbbbbbbbbbc.c",
    "..ffbbbbbbbbbcc.",
    "...cbbbbbbbbcc..",
    f ? "...bc.bc..bc.bc." : "..bc..bc.bc..bc.",
    f ? "...dd.dd..dd.dd." : "..dd..dd.dd..dd.",
  ]);
}
export const LION_CUB = defineProp({ frames: [cubFrame(0), cubFrame(1)], fps: 3, pal: LION_PAL, solid: { x: 1, y: 5, w: 16, h: 6 } });

/** Big flat-topped rock with the king lion lounging on top. */
function prideRock(f: number): string[] {
  const g = blank(52, 38);
  blobs(g, [
    { x: 14, y: 26, rx: 13, ry: 10 }, { x: 36, y: 27, rx: 15, ry: 10 },
    { x: 24, y: 21, rx: 20, ry: 8 }, { x: 24, y: 31, rx: 18, ry: 6 },
  ], "sStT");
  // flat top ledge
  for (let x = 6; x < 46; x++) for (let y = 13; y < 17; y++) if (at(g, x, y) !== ".") put(g, x, y, y === 13 ? "s" : "S");
  // cracks and strata
  for (let x = 4; x < 50; x++) { if (at(g, x, 24) === "S" && x % 5 !== 0) put(g, x, 24, "t"); if (at(g, x, 31) !== "." && x % 4 !== 1) put(g, x, 31, "T"); }
  line(g, 20, 18, 22, 24, "t"); line(g, 34, 25, 31, 31, "T"); line(g, 12, 27, 14, 33, "T");
  for (let y = 0; y < 38; y++) for (let x = 0; x < 52; x++) if (at(g, x, y) === "T" && y > 34) put(g, x, y, "u");
  // grass tufts at base
  stamp(g, 2, 33, ["g.g", "gGg"]); stamp(g, 44, 34, [".g.g", "gGgG"]);
  // lion on top
  stamp(g, 10, 0, lionLying(f));
  return rowsOf(g);
}
export const PRIDE_ROCK = defineProp({
  frames: [0, 1, 0, 1, 2, 1, 0, 3].map(prideRock), fps: 1.4, pal: LION_PAL,
  solid: { x: 2, y: 18, w: 50, h: 20 },
});

// ════════════════════════════════════════════════════════════════════════════
// Hippos & flamingos
// ════════════════════════════════════════════════════════════════════════════
const HIPPO_PAL = {
  a: "#c8b0d0", b: "#a088b0", c: "#806898", d: "#604c78", e: "#3c2c50",
  p: "#f8a8b8", P: "#d07890", t: "#ffffff", k: "#281828",
  r: "#e8fff0", R: "#a8e0d0",
};
/** Hippo half-submerged (head + back above the water line). */
function hippoSwim(f: number): string[] {
  const g = blank(32, 15);
  const k = f === 3 ? 1 : 0; // sinks a little
  blobs(g, [{ x: 23, y: 10 + k, rx: 8, ry: 4.2 }], "abcd", { crease: false });
  blobs(g, [{ x: 12.5, y: 8 + k, rx: 6.4, ry: 4.8 }], "abcd", { crease: false });
  blobs(g, [{ x: 6, y: 9 + k, rx: 5.6, ry: 3.9 }], "abcd", { crease: false });
  // nostril bumps
  for (const nx of [2, 6]) { put(g, nx, 6 + k, "a"); put(g, nx + 1, 6 + k, "c"); put(g, nx, 7 + k, "k"); }
  // mouth line + pink lip
  line(g, 1, 11 + k, 8, 11 + k, "d"); put(g, 1, 10 + k, "P"); put(g, 2, 10 + k, "p"); put(g, 3, 10 + k, "p");
  // eye bumps: white eye + black pupil under a dark brow
  for (const ex of [10, 14]) {
    put(g, ex, 3 + k, "d"); put(g, ex + 1, 3 + k, "d");
    put(g, ex, 4 + k, "t"); put(g, ex + 1, 4 + k, f === 4 ? "d" : "k");
  }
  // ears (wiggle)
  const ey = f === 1 ? 0 : 1;
  stamp(g, 16, ey + k, ["c", "p"]);
  stamp(g, 18, ey + 1 + k - (f === 2 ? 1 : 0), ["c", "P"]);
  // cut at the water line + ripple ring
  for (let y = 12; y < 15; y++) for (let x = 0; x < 32; x++) put(g, x, y, ".");
  outlineWith(g, (c) => c !== "r" && c !== "R", "e");
  for (let x = 0; x < 32; x++) {
    if (at(g, x, 11) !== "." && at(g, x, 11) !== "e") put(g, x, 12, (x + f) % 4 ? "r" : "R");
  }
  put(g, 0, 12, "R"); put(g, 31, 12, "R");
  if (f === 2) { put(g, 27, 3, "r"); put(g, 29, 2, "R"); }
  return rowsOf(g);
}
export const HIPPO_SWIM = defineProp({
  frames: [0, 1, 0, 4, 2, 0, 3].map(hippoSwim), fps: 1.6, pal: HIPPO_PAL, outline: false, solid: null,
});
export const HIPPO_SWIM_R = defineProp({
  frames: [0, 4, 1, 0, 3, 2].map(hippoSwim).map(flipRows), fps: 1.4, pal: HIPPO_PAL, outline: false, solid: null,
});

/** Hippo on the bank, facing left; open = big yawn. */
function hippoLand(open: number): string[] {
  const g = blank(32, 22);
  for (const [lx, far] of [[9, 1], [12, 0], [22, 1], [25, 0]] as const) {
    rect(g, lx, 15, 3, 6, far ? "d" : "c");
    put(g, lx, 15, far ? "c" : "b");
    rect(g, lx, 20, 3, 1, far ? "e" : "d");
  }
  blobs(g, [{ x: 19, y: 11, rx: 12, ry: 7 }], "abcd", { crease: false });
  if (!open) {
    blobs(g, [{ x: 8, y: 10, rx: 6, ry: 5 }], "abcd", { crease: false });
    blobs(g, [{ x: 4, y: 12.5, rx: 4.5, ry: 3.5 }], "abcd", { crease: false });
    put(g, 1, 11, "k"); put(g, 3, 11, "k");
    line(g, 1, 14, 6, 14, "d");
    put(g, 8, 7, "k"); stamp(g, 9, 4, ["cp"]);
  } else {
    // lower jaw
    blobs(g, [{ x: 5, y: 15, rx: 5, ry: 2.6 }], "abcd", { crease: false });
    // mouth inside
    for (let y = 8; y < 15; y++) for (let x = 1; x < 10; x++) if (inEllipse(x, y, 5.5, 12, 5, 4)) put(g, x, y, y < 12 ? "P" : "p");
    put(g, 2, 13, "t"); put(g, 8, 13, "t"); put(g, 2, 9, "t"); put(g, 7, 9, "t");
    // upper jaw tilted up
    blobs(g, [{ x: 9, y: 6.5, rx: 5, ry: 4 }], "abcd", { crease: false });
    blobs(g, [{ x: 4, y: 5, rx: 3.8, ry: 2.6 }], "abcd", { crease: false });
    put(g, 2, 3, "k"); put(g, 4, 3, "k");
    put(g, 10, 4, "k"); stamp(g, 11, 2, ["cp"]);
    put(g, 2, 7, "t"); put(g, 6, 8, "t");
  }
  put(g, 31, 10, "d"); put(g, 31, 11, "e");
  return rowsOf(g);
}
export const HIPPO = defineProp({
  frames: [0, 0, 0, 1, 1, 0].map(hippoLand), fps: 1.2, pal: HIPPO_PAL, solid: { x: 2, y: 12, w: 30, h: 11 },
});
export const HIPPO_R = defineProp({
  frames: [0, 0, 1, 1, 0, 0].map(hippoLand).map(flipRows), fps: 1, pal: HIPPO_PAL, solid: { x: 2, y: 12, w: 30, h: 11 },
});

const FLAMINGO_PAL = {
  a: "#ffe0ea", b: "#ffa8c4", c: "#f07ca0", d: "#c85078", k: "#282028", w: "#f8f0e0",
  l: "#f088a8", L: "#c06080", r: "#e8fff0", R: "#a8e0d0",
};
/** Flamingo on one leg; pose 0 head up, 1 preening, 2 head tilted. */
function flamingo(pose: number, wade = false): string[] {
  const g = blank(13, 25);
  // legs
  for (let y = 13; y < 24; y++) put(g, 7, y, "l");
  stamp(g, 6, 24, ["LLL"]);
  stamp(g, 8, 13, ["l.", ".l", ".l", "l.", "l.", "L."]);
  put(g, 7, 17, "L");
  // body
  blobs(g, [{ x: 8, y: 10.5, rx: 4.6, ry: 2.8 }], "abcd", { crease: false });
  stamp(g, 10, 9, ["ccd", ".dd", "..k"]);
  if (pose === 1) {
    // preening: neck curves down into the back feathers
    stamp(g, 3, 4, [".bb..", "b..b.", "b..bb", ".b.bb", "..bbc", "..bc."]);
    stamp(g, 6, 8, ["wkk"]);
  } else {
    const hx = pose === 2 ? 1 : 0;
    // S-neck
    const neck: [number, number][] = [[4, 9], [3, 8], [3, 7], [4, 6], [5, 5], [5, 4], [4, 3], [3 + hx, 2]];
    for (const [x, y] of neck) { put(g, x, y, "b"); put(g, x + 1, y, x > 3 ? "c" : "b"); }
    // head + bent beak
    stamp(g, 1 + hx, 0, [".bba", "bbbk", "wk..", "k..."]);
  }
  if (wade) {
    for (let y = 19; y < 25; y++) for (let x = 0; x < 13; x++) put(g, x, y, ".");
    stamp(g, 3, 19, ["rRrrRr..", ".R..R..."]);
  }
  return rowsOf(g);
}
const FLAM_FRAMES = [0, 0, 2, 0, 1, 1, 0, 2].map((p) => flamingo(p));
export const FLAMINGO = defineProp({ frames: FLAM_FRAMES, fps: 1.6, pal: FLAMINGO_PAL, solid: { x: 4, y: 20, w: 8, h: 6 } });
export const FLAMINGO_R = defineProp({ frames: [...FLAM_FRAMES.slice(4), ...FLAM_FRAMES.slice(0, 4)].map(flipRows), fps: 1.4, pal: FLAMINGO_PAL, solid: { x: 3, y: 20, w: 8, h: 6 } });
export const FLAMINGO_WADE = defineProp({
  frames: [0, 2, 0, 1].map((p) => flamingo(p, true)), fps: 1.2, pal: FLAMINGO_PAL, solid: null,
});

// ════════════════════════════════════════════════════════════════════════════
// Pandas & bamboo
// ════════════════════════════════════════════════════════════════════════════
const PANDA_PAL = {
  w: "#ffffff", W: "#e4e4ee", V: "#b8b8cc", k: "#2c2c38", K: "#4c4c5c", e: "#ffffff",
  g: "#a8d860", G: "#68a838", h: "#3c7828", n: "#e8a0a8",
};
/** Panda sitting, munching a bamboo stalk. chew: 0/1. */
function pandaSit(chew: number, tilt: number): string[] {
  const g = blank(20, 20);
  // legs (front-facing, splayed)
  blobs(g, [{ x: 4.5, y: 16.5, rx: 3.2, ry: 2.6 }, { x: 15.5, y: 16.5, rx: 3.2, ry: 2.6 }], "KkkK", { crease: false });
  put(g, 3, 17, "n"); put(g, 16, 17, "n");
  // body
  blobs(g, [{ x: 10, y: 13, rx: 6.2, ry: 5 }], "wWVV", { crease: false });
  // shoulder band
  for (let x = 4; x < 17; x++) for (let y = 9; y < 12; y++) if (at(g, x, y) !== "." && Math.abs(y - 10 + (x - 10) * 0.05) < 1.4) put(g, x, y, y === 9 ? "K" : "k");
  // bamboo stalk
  const by = chew ? -1 : 0;
  bar(g, 13.5, 18 + by, 7, 3 + by, 0.9, "ggG");
  for (const t of [8, 13]) put(g, 13 - Math.round((t - 3) * 0.43), 18 + by - (18 - t), "h");
  stamp(g, 3, 1 + by, ["gg.", ".Gg", "..G"]);
  // head
  const hx = tilt;
  blobs(g, [{ x: 10 + hx, y: 6, rx: 5.2, ry: 4.4 }], "wWWV", { crease: false });
  ellipse(g, 5.6 + hx, 2.4, 1.7, 1.6, "k"); ellipse(g, 14.4 + hx, 2.4, 1.7, 1.6, "k");
  ellipse(g, 8 + hx, 6, 1.3, 1.6, "k"); ellipse(g, 12 + hx, 6, 1.3, 1.6, "k");
  put(g, 8 + hx, 5, "e"); put(g, 12 + hx, 5, "e");
  put(g, 10 + hx, 7, "k"); put(g, 10 + hx, 8 + chew, "K");
  // paws holding the stalk
  ellipse(g, 9.5, 11 + by, 1.6, 1.4, "k"); ellipse(g, 12.5, 13 + by, 1.6, 1.4, "k");
  return rowsOf(g);
}
export const PANDA = defineProp({
  frames: [pandaSit(0, 0), pandaSit(1, 0), pandaSit(0, 0), pandaSit(1, 0), pandaSit(0, -1), pandaSit(0, 0)],
  fps: 2.4, pal: PANDA_PAL, solid: { x: 1, y: 12, w: 20, h: 10 },
});
/** Panda lying on its belly (side view) — sleepy. */
function pandaLie(f: number): string[] {
  const g = blank(26, 13);
  blobs(g, [{ x: 15, y: 7.5 - (f ? 0.3 : 0), rx: 9, ry: 4.6 }], "wWVV", { crease: false });
  // black legs + shoulder band
  blobs(g, [{ x: 20.5, y: 10.5, rx: 3.5, ry: 2 }, { x: 10, y: 10.5, rx: 3.5, ry: 2 }], "KkkK", { crease: false });
  for (let y = 3; y < 12; y++) for (let x = 8; x < 12; x++) if (at(g, x, y) !== "." && x - (y * 0.3) > 7.4 && x - (y * 0.3) < 9.8) put(g, x, y, "k");
  blobs(g, [{ x: 5.5, y: 7.5, rx: 4.6, ry: 4 }], "wWWV", { crease: false });
  ellipse(g, 6.5, 3.6, 1.5, 1.3, "k");
  ellipse(g, 3.4, 7.2, 1.3, 1.3, "k");
  put(g, 3, 7, f ? "k" : "e");
  put(g, 1, 9, "k");
  put(g, 24, 6, "w");
  return rowsOf(g);
}
export const PANDA_LIE = defineProp({ frames: [pandaLie(0), pandaLie(1)], fps: 0.8, pal: PANDA_PAL, solid: { x: 1, y: 6, w: 26, h: 9 } });

const BAMBOO_PAL = { a: "#d8f090", b: "#a0d058", c: "#70a838", d: "#4c8030", l: "#88c848", L: "#4c9030", e: "#c8e870" };
function bambooRows(f: number): string[] {
  const g = blank(22, 42);
  const stalks = [[4, 6], [9, 0], [13, 4], [17, 9]];
  for (const [sx, top] of stalks) {
    for (let y = top; y < 41; y++) {
      const node = (y + sx) % 7 === 0;
      const sw = f && y < 14 ? 1 : 0;
      put(g, sx + sw, y, node ? "c" : "a"); put(g, sx + 1 + sw, y, node ? "d" : "b");
    }
    // leaf sprays
    const lx = sx + (f ? 1 : 0);
    stamp(g, lx - 4, top + 1, ["ll......", ".lLl..lL", "...lLl.."]);
    stamp(g, lx, top + 7, ["...lll", ".lLL..", "lL...."]);
  }
  stamp(g, 2, 40, ["dddddddddddddddddd"]);
  return rowsOf(g);
}
export const BAMBOO = defineProp({ frames: [bambooRows(0), bambooRows(1)], fps: 1, pal: BAMBOO_PAL, solid: { x: 3, y: 34, w: 18, h: 10 } });

// ════════════════════════════════════════════════════════════════════════════
// Monkey climbing frame
// ════════════════════════════════════════════════════════════════════════════
const CLIMB_PAL = { ...LOG_PAL, r: "#e8d098", R: "#b89858", t: "#484858", T: "#686878", p: "#d8a868", P: "#a87848" };
function climbRows(f: number): string[] {
  const g = blank(46, 48);
  const sw = [0, 1, 2, 1][f];
  // ropes (drawn first, no outline)
  for (let y = 7; y < 31; y++) put(g, 15 + Math.round(((y - 7) / 24) * sw), y, y % 3 ? "r" : "R");
  stamp(g, 14 + sw, 31, ["RrR", ".R."]);
  // rope swag between posts
  for (let x = 8; x < 39; x++) {
    const y = Math.round(34 + Math.sin(((x - 8) / 30) * Math.PI) * 5);
    put(g, x, y, x % 3 ? "r" : "R");
  }
  // tire swing
  const tx = 32 - sw;
  line(g, 30, 7, tx - 2, 24, "R"); line(g, 34, 7, tx + 2, 24, "R");
  ellipse(g, tx, 27, 4, 3.4, "t");
  ellipse(g, tx, 27, 1.8, 1.2, ".");
  put(g, tx - 3, 26, "T"); put(g, tx - 2, 25, "T");
  // logs
  bar(g, 4.5, 4, 4.5, 47, 2.2, "abc");
  bar(g, 41.5, 4, 41.5, 47, 2.2, "abc");
  bar(g, 2, 5.5, 44, 5.5, 2.2, "abc");
  // platform
  rect(g, 6, 22, 16, 3, "p"); rect(g, 6, 22, 16, 1, "a");
  for (let x = 9; x < 22; x += 4) put(g, x, 23, "P");
  rect(g, 6, 25, 16, 1, "d");
  bar(g, 20, 25, 20, 37, 1.2, "bcd");
  // ladder rungs on left post
  for (let y = 28; y < 46; y += 4) rect(g, 6, y, 4, 1, "c");
  outlineWith(g, (c) => "abcdepPtT".includes(c), "u");
  return rowsOf(g);
}
export const CLIMB_FRAME = defineProp({
  frames: [0, 1, 2, 3].map(climbRows), fps: 2, pal: { ...CLIMB_PAL, u: "#4c3020" }, outline: false,
  solid: { x: 0, y: 40, w: 46, h: 8 },
});

// ════════════════════════════════════════════════════════════════════════════
// Reptile house (snake behind glass) and a small outdoor terrarium
// ════════════════════════════════════════════════════════════════════════════
const REP_PAL = {
  a: "#f8ecd0", b: "#e8d4a8", c: "#d0b480", d: "#a88858", // sandstone wall
  r: "#78c070", R: "#4c9848", q: "#a8e090", Q: "#2c6c38", // roof
  g: "#204848", G: "#2c6060", h: "#408078", x: "#c8f0f0", // glass
  s: "#a8e040", S: "#58a028", z: "#f8e048", t: "#f04040", k: "#202020", // snake
  w: "#8a5a34", W: "#5c3a20", // branch / door
  y: "#fff8e0", Y: "#f0c040", o: "#e86830",
};
function reptileHouse(f: number): string[] {
  const W = 66, H = 54;
  const g = blank(W, H);
  // roof (flat-ish hip roof with tiles)
  for (let y = 0; y < 16; y++) {
    const inset = Math.max(0, 6 - Math.floor(y / 1.5));
    for (let x = inset; x < W - inset; x++) {
      let c = y % 4 === 3 ? "R" : "r";
      if (y < 2) c = "q";
      if (x < inset + 2) c = "q";
      if (x > W - inset - 3) c = "R";
      if (y === 15) c = "Q";
      put(g, x, y, c);
    }
  }
  // sign board on the roof
  rect(g, 14, 3, 38, 9, "y"); rect(g, 14, 11, 38, 1, "Y"); rect(g, 14, 3, 38, 1, "a");
  const label = "REPTILES";
  text(g, 33 - Math.floor(textWidth(label) / 2), 5, label, "S", 1);
  // walls
  rect(g, 2, 16, W - 4, H - 17, "b");
  rect(g, 2, 16, W - 4, 2, "d");
  for (let y = 18; y < H - 1; y += 4) for (let x = 2; x < W - 2; x++) {
    put(g, x, y, (x + (y % 8 ? 0 : 4)) % 8 === 0 ? "c" : at(g, x, y));
    if ((x + (y % 8 ? 0 : 4)) % 8 === 0) for (let k = 0; k < 4; k++) put(g, x, y + k, "c");
  }
  for (let y = 18; y < H - 1; y += 4) for (let x = 2; x < W - 2; x++) put(g, x, y, "c");
  rect(g, 2, 16, 2, H - 17, "a"); rect(g, W - 4, 16, 2, H - 17, "d");
  rect(g, 2, H - 2, W - 4, 1, "d");
  // big window with snake
  const wx = 6, wy = 21, ww = 34, wh = 22;
  rect(g, wx - 1, wy - 1, ww + 2, wh + 2, "w");
  rect(g, wx, wy, ww, wh, "G");
  for (let y = wy; y < wy + wh; y++) for (let x = wx; x < wx + ww; x++) if (y > wy + wh - 5) put(g, x, y, (x + y) % 3 ? "c" : "d");
  // branch
  line(g, wx + 2, wy + 15, wx + 30, wy + 9, "w"); line(g, wx + 2, wy + 16, wx + 30, wy + 10, "W");
  line(g, wx + 18, wy + 12, wx + 22, wy + 4, "w");
  // leaves
  stamp(g, wx + 25, wy + 2, [".RR.", "RqRR", ".RR."]);
  stamp(g, wx + 1, wy + 1, ["RR", "qR"]);
  // snake coiled on the branch, head sways
  const coil: [number, number][] = [];
  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    coil.push([wx + 6 + t * 18, wy + 14 - t * 4 + Math.sin(t * Math.PI * 3 + f) * 2]);
  }
  for (const [x, y] of coil) {
    put(g, Math.round(x), Math.round(y) - 1, "s"); put(g, Math.round(x), Math.round(y), "S");
    if (Math.round(x) % 3 === 0) put(g, Math.round(x), Math.round(y) - 1, "z");
  }
  const [hx, hy0] = coil[coil.length - 1];
  const hy = Math.round(hy0) - 3 - (f === 1 ? 1 : 0);
  stamp(g, Math.round(hx) - 1, hy, [".sss", "ssks", "sSSs"]);
  for (let y = hy + 3; y < Math.round(hy0); y++) put(g, Math.round(hx), y, "S");
  if (f % 2 === 0) { put(g, Math.round(hx) + 3, hy + 1, "t"); put(g, Math.round(hx) + 4, hy + 1 + (f ? 1 : 0), "t"); }
  // glare streaks
  line(g, wx + 3, wy + 8, wx + 10, wy + 1, "h"); line(g, wx + 5, wy + 9, wx + 12, wy + 2, "x");
  line(g, wx + 27, wy + 20, wx + 33, wy + 14, "h");
  // door
  rect(g, 45, 24, 15, 29, "W"); rect(g, 46, 25, 13, 28, "w");
  rect(g, 52, 25, 1, 28, "W");
  rect(g, 47, 27, 4, 9, "G"); rect(g, 54, 27, 4, 9, "G");
  put(g, 47, 27, "x"); put(g, 54, 27, "x");
  put(g, 51, 40, "Y"); put(g, 53, 40, "Y");
  // little snake emblem over the door
  stamp(g, 48, 18, [".ssss.", "s....s", ".sss..", "....sk", "sssss."]);
  return rowsOf(g);
}
export const REPTILE_HOUSE = defineProp({
  frames: [0, 1, 2, 1].map(reptileHouse), fps: 2, pal: REP_PAL,
  solid: { x: 0, y: 18, w: 68, h: 38 },
});

// ════════════════════════════════════════════════════════════════════════════
// Visitor area: gate, ticket booth, carts, map, signs, train
// ════════════════════════════════════════════════════════════════════════════

const GATE_PAL = {
  a: "#f8f0e0", b: "#e0d0b0", c: "#c0a880", d: "#988060", e: "#706048", // stone
  w: "#d89858", W: "#a86830", v: "#784820", // wood
  g: "#88d060", G: "#58a040", H: "#3c7830", // leaves
  y: "#f8d048", Y: "#d09820", r: "#e84838", R: "#a82828", k: "#3c2414",
  o: "#f09838", O: "#c06820", f: "#fff0d0", n: "#b0b0c8", N: "#8080a0",
};
/** Stone pillar of the entrance gate with a leafy planter cap and a flag. */
function gatePillar(f: number, flagColor: string): string[] {
  const g = blank(16, 50);
  // flag
  for (let y = 0; y < 14; y++) put(g, 7, y, "e");
  const wave = f % 2;
  stamp(g, 8, 1, f ? [flagColor.repeat(5), flagColor.repeat(6), flagColor.repeat(5), flagColor.repeat(3)] : [flagColor.repeat(6), flagColor.repeat(5), flagColor.repeat(6), "." + flagColor.repeat(3)]);
  put(g, 9 + wave, 2, "f");
  // cap with plants
  blobs(g, [{ x: 4, y: 15, rx: 3.5, ry: 2.5 }, { x: 11, y: 15, rx: 3.5, ry: 2.5 }, { x: 7.5, y: 13.5, rx: 3.5, ry: 2.8 }], "gGGH");
  rect(g, 0, 17, 16, 3, "a"); rect(g, 0, 19, 16, 1, "c");
  // shaft
  for (let y = 20; y < 48; y++) for (let x = 1; x < 15; x++) {
    let c = x < 3 ? "a" : x > 12 ? "d" : "b";
    if ((y - 20) % 6 === 5) c = "c";
    else if (((y - 20) % 12 < 6 ? x === 8 : x === 4) && x > 2 && x < 13) c = "c";
    put(g, x, y, c);
  }
  rect(g, 0, 47, 16, 3, "c"); rect(g, 0, 47, 16, 1, "b"); rect(g, 0, 49, 16, 1, "e");
  return rowsOf(g);
}
export const GATE_PILLAR_L = defineProp({ frames: [gatePillar(0, "r"), gatePillar(1, "r")], fps: 2, pal: GATE_PAL, solid: { x: 0, y: 40, w: 18, h: 12 } });
export const GATE_PILLAR_R = defineProp({ frames: [gatePillar(1, "o"), gatePillar(0, "o")], fps: 2, pal: GATE_PAL, solid: { x: 0, y: 40, w: 18, h: 12 } });

/** The arch board (spans between the pillars, overhead): "ZOO" + animal faces. */
function gateSign(): string[] {
  const W = 78, H = 26;
  const g = blank(W, H);
  // arched board
  for (let x = 0; x < W; x++) {
    const top = Math.round(6 - Math.sin((x / (W - 1)) * Math.PI) * 6);
    for (let y = top; y < 22; y++) {
      let c = (x + Math.floor(y / 5)) % 9 === 0 ? "W" : "w";
      if (y === top) c = "y";
      else if (y === top + 1) c = "o";
      if (y >= 20) c = y === 21 ? "v" : "W";
      put(g, x, y, c);
    }
  }
  // panel
  rect(g, 22, 8, 34, 12, "f"); rect(g, 22, 19, 34, 1, "c");
  const label = "ZOO";
  text(g, 39 - Math.floor(textWidth(label, 2) / 2), 9, label, "G", 2, "H");
  // lion face (left)
  blobs(g, [{ x: 12, y: 13, rx: 6, ry: 6 }], "oOOv", { crease: false });
  blobs(g, [{ x: 12, y: 13.5, rx: 3.6, ry: 3.6 }], "yyYY", { crease: false });
  put(g, 11, 12, "k"); put(g, 13, 12, "k"); put(g, 12, 15, "k");
  // elephant face (right)
  blobs(g, [{ x: 66, y: 12, rx: 4, ry: 4 }], "nnNN", { crease: false });
  blobs(g, [{ x: 61.5, y: 12, rx: 2.5, ry: 4 }, { x: 70.5, y: 12, rx: 2.5, ry: 4 }], "NNNN", { crease: false });
  rect(g, 65, 15, 2, 5, "N"); put(g, 64, 19, "N");
  put(g, 65, 11, "k"); put(g, 67, 11, "k");
  // hanging vines
  for (const vx of [2, 20, 57, 75]) for (let y = 21; y < 25; y++) if (vx < W) put(g, vx, y, y % 2 ? "G" : "g");
  return rowsOf(g);
}
export const GATE_SIGN = defineProp({ rows: gateSign(), pal: GATE_PAL, solid: null, baseY: 38 });

// ── Ticket booth ─────────────────────────────────────────────────────────────
const BOOTH_PAL = {
  a: "#fff8e8", b: "#f0e0c0", c: "#d8c098", d: "#b09870", // walls
  r: "#f05050", R: "#b83038", w: "#ffffff", W: "#d8d8e8", // awning
  g: "#305858", G: "#4c8080", x: "#c8f0f0", // glass
  s: "#f8c8a0", S: "#d89878", h: "#583820", k: "#202020", u: "#3868d8", // clerk
  y: "#f8d048", Y: "#c09020", t: "#58a040", T: "#2c6c30",
};
function boothRows(f: number): string[] {
  const g = blank(38, 42);
  // roof
  rect(g, 3, 1, 32, 4, "t"); rect(g, 3, 4, 32, 1, "T");
  // sign
  rect(g, 6, 5, 26, 7, "y"); rect(g, 6, 11, 26, 1, "Y");
  text(g, 19 - Math.floor(textWidth("TICKETS") / 2), 6, "TICKETS", "R");
  // awning scallops
  for (let x = 1; x < 37; x++) {
    const stripe = Math.floor((x - 1) / 4) % 2 ? "w" : "r";
    for (let y = 12; y < 17; y++) put(g, x, y, stripe === "w" ? (y === 16 ? "W" : "w") : y === 16 ? "R" : "r");
    if ((x - 1) % 4 === 0 || (x - 1) % 4 === 3) put(g, x, 17, stripe === "w" ? "W" : "R");
    else put(g, x, 17, stripe === "w" ? "W" : "R"), put(g, x, 18, stripe === "w" ? "W" : "R");
  }
  // walls
  rect(g, 3, 19, 32, 22, "b");
  for (let x = 3; x < 35; x += 4) rect(g, x, 19, 1, 22, "c");
  rect(g, 3, 19, 1, 22, "a"); rect(g, 34, 19, 1, 22, "d");
  rect(g, 3, 40, 32, 1, "d");
  // window with clerk
  rect(g, 8, 20, 22, 12, "g");
  rect(g, 8, 20, 22, 1, "d");
  const cx = 18 + (f === 1 ? 1 : 0);
  stamp(g, cx - 3, 22, ["..hhhh..", ".hhhhhh.", ".hssssh.", ".sksksS.", "..ssssS.", "...SS...", ".uuuuuu.", "uuuuuuuu", "uuuuuuuu"]);
  line(g, 9, 29, 13, 21, "G"); line(g, 25, 31, 29, 25, "G"); put(g, 10, 22, "x");
  // counter + tickets
  rect(g, 6, 32, 26, 2, "c"); rect(g, 6, 32, 26, 1, "a");
  stamp(g, 23, 30, ["yyy", "YYY"]);
  return rowsOf(g);
}
export const TICKET_BOOTH = defineProp({
  frames: [boothRows(0), boothRows(0), boothRows(1), boothRows(0)], fps: 1.5, pal: BOOTH_PAL,
  solid: { x: 2, y: 22, w: 36, h: 22 },
});

// ── Ice cream cart with a striped umbrella ──────────────────────────────────
const ICE_PAL = {
  a: "#ffffff", b: "#e8f0f8", c: "#c0d0e0", d: "#90a0b8",
  p: "#ff9cc0", P: "#e06890", m: "#a8e8c8", M: "#58b890", y: "#f8e0a0", Y: "#d0a050",
  u: "#f8d048", U: "#d09820", r: "#f05050", R: "#b03038", k: "#383848", K: "#606078", o: "#8a5a34",
};
export const ICECREAM_CART = defineProp({
  rows: (() => {
    const g = blank(28, 34);
    // umbrella
    for (let y = 0; y < 8; y++) {
      const half = Math.min(13, 3 + y * 2);
      for (let x = 14 - half; x < 14 + half; x++) {
        const seg = Math.floor(((x - 14) / (half + 0.01)) * 3 + 3);
        put(g, x, y, y === 7 ? (seg % 2 ? "U" : "R") : seg % 2 ? "u" : "r");
      }
    }
    put(g, 13, 0, "a"); put(g, 14, 0, "a");
    for (let y = 8; y < 16; y++) put(g, 14, y, "K");
    // cones on top
    stamp(g, 4, 11, [".pp..mm..yy.", "pPpPmMmMyYyY", ".YY..YY..YY.", "..Y...Y...Y."].map((r) => r));
    // cart box
    rect(g, 2, 15, 24, 12, "b");
    rect(g, 2, 15, 24, 2, "a"); rect(g, 2, 25, 24, 2, "c"); rect(g, 25, 15, 1, 12, "d");
    // painted cone
    stamp(g, 10, 18, [".pmp.", "pmPmp", ".YYY.", ".YoY.", "..Y.."]);
    rect(g, 2, 21, 6, 1, "p"); rect(g, 19, 21, 6, 1, "m");
    // wheels + handle
    ellipse(g, 7, 29.5, 3, 3, "k"); ellipse(g, 7, 29.5, 1, 1, "K");
    ellipse(g, 21, 29.5, 3, 3, "k"); ellipse(g, 21, 29.5, 1, 1, "K");
    line(g, 26, 17, 27, 15, "K");
    return rowsOf(g);
  })(),
  pal: ICE_PAL,
  solid: { x: 2, y: 22, w: 26, h: 14 },
});

// ── Popcorn cart ─────────────────────────────────────────────────────────────
const POP_PAL = {
  r: "#f05050", R: "#b83038", w: "#ffffff", W: "#d8d8e8", y: "#fff4c0", Y: "#f8d048", o: "#e0a030",
  g: "#c8f0f8", G: "#88c8d8", k: "#383848", K: "#606078", u: "#f8d048", U: "#c09020",
};
function popRows(f: number): string[] {
  const g = blank(22, 34);
  // roof
  stamp(g, 2, 0, ["....rrrrrrrrrr....".slice(0, 18), "..rrwwrrwwrrwwrr..", ".rrwwrrwwrrwwrrww.", "RRRRRRRRRRRRRRRRRR"].map((r) => r.slice(0, 18)));
  rect(g, 4, 4, 14, 4, "u"); rect(g, 4, 7, 14, 1, "U");
  text(g, 6, 4, "POP", "R");
  // glass case with popping corn
  rect(g, 3, 8, 16, 11, "g");
  rect(g, 3, 8, 16, 1, "G"); rect(g, 18, 8, 1, 11, "G"); rect(g, 3, 8, 1, 11, "G");
  for (let y = 13; y < 19; y++) for (let x = 4; x < 18; x++) put(g, x, y, (hash2(x, y, 4) % 4 === 0) ? "o" : (hash2(x, y, 5) % 3 ? "y" : "Y"));
  const pops = [[6, 11], [12, 10], [15, 12], [9, 12]];
  for (let i = 0; i < pops.length; i++) if ((i + f) % 2 === 0) put(g, pops[i][0], pops[i][1] - (f ? 1 : 0), "y");
  put(g, 5, 9, "w"); put(g, 6, 9, "w");
  // body
  rect(g, 2, 19, 18, 10, "r");
  for (let x = 2; x < 20; x += 4) rect(g, x, 19, 2, 10, "w");
  rect(g, 2, 19, 18, 1, "W"); rect(g, 2, 28, 18, 1, "R");
  ellipse(g, 6, 30.5, 2.6, 2.6, "k"); ellipse(g, 16, 30.5, 2.6, 2.6, "k");
  put(g, 6, 30, "K"); put(g, 16, 30, "K");
  return rowsOf(g);
}
export const POPCORN_CART = defineProp({ frames: [popRows(0), popRows(1)], fps: 3, pal: POP_PAL, solid: { x: 2, y: 22, w: 20, h: 14 } });

// ── Zoo map board ───────────────────────────────────────────────────────────
const MAP_PAL = {
  w: "#c89058", W: "#906038", v: "#5c3c24", g: "#98d070", G: "#70b050", p: "#f8e0b0", P: "#d8b880",
  b: "#68b0f0", y: "#f8d048", o: "#e8a050", r: "#f04040", R: "#a02020", k: "#303030", n: "#b0b0c8", f: "#fff8e8",
};
export const ZOO_MAP = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(34, 32);
    rect(g, 6, 22, 2, 10, "W"); rect(g, 26, 22, 2, 10, "W");
    rect(g, 0, 0, 34, 24, "w"); rect(g, 0, 0, 34, 1, "f"); rect(g, 0, 23, 34, 1, "v"); rect(g, 33, 0, 1, 24, "W");
    rect(g, 0, 0, 1, 24, "f");
    rect(g, 2, 2, 30, 20, "g");
    for (let y = 2; y < 22; y++) for (let x = 2; x < 32; x++) if (hash2(x, y, 8) % 11 === 0) put(g, x, y, "G");
    // paths
    rect(g, 15, 2, 4, 20, "p"); rect(g, 2, 9, 30, 3, "p"); rect(g, 2, 16, 30, 2, "p");
    // pond, savanna, lion, ice
    ellipse(g, 26, 14, 4, 2.4, "b");
    rect(g, 3, 3, 10, 5, "y"); rect(g, 21, 3, 9, 5, "o");
    rect(g, 3, 13, 9, 2, "o"); rect(g, 4, 19, 8, 2, "n"); rect(g, 21, 19, 9, 2, "G");
    // icons
    put(g, 6, 5, "o"); put(g, 9, 4, "o"); put(g, 25, 5, "n"); put(g, 26, 5, "n");
    // you are here (blinks)
    if (f === 0) { stamp(g, 16, 18, [".r.", "rRr", ".r."]); }
    else put(g, 17, 19, "r");
    return rowsOf(g);
  }),
  fps: 2, pal: MAP_PAL, solid: { x: 4, y: 24, w: 26, h: 10 },
});

// ── Animal signs (icon on a wooden board) ───────────────────────────────────
const SIGN_PAL = {
  w: "#d8a868", W: "#a87840", v: "#6c4828", f: "#fff8e0",
  o: "#e88830", O: "#a85818", y: "#f8d870", Y: "#c89838", k: "#282828", n: "#a8a8c0", N: "#787890",
  g: "#78c048", G: "#3c8030", p: "#f890b0", u: "#b098c0", U: "#806890", e: "#ffffff",
};
const ICONS: Record<string, string[]> = {
  lion: ["..oOOo..", ".oOyyOo.", "oOykykOo", "oOyyyyOo", "oOykkyOo", ".oOyyOo.", "..oOOo.."],
  giraffe: [".Y.Y....", ".yyyy...", "yykyy...", "yyyyyY..", "...yYy..", "....yY..", "....yy.."],
  elephant: ["nN..Nn..", "nNnnnNn.", "nNknnNn.", "nNnnnNn.", "..nN....", "..nN....", "...N...."],
  penguin: ["..kkk...", ".kekek..", ".kkokk..", "kkeeekk.", "kkeeekk.", ".keeek..", ".o...o.."],
  monkey: [".OOOO...", "OyyyyO..", "OykykyO.", "OyyyyO..", ".yyyy...", "..OO..O.", ".O..OO.."],
  panda: ["kk...kk.", "keeeeek.", "ekkekke.", "ekeeeke.", "eeekeee.", ".eeeee..", "........"],
  snake: ["....gg..", "...gGkg.", "...g....", "..gg....", ".gG.....", "gG...gg.", ".GggGG.."],
  hippo: ["uU..Uu..", "uuuuuuu.", "ukuuuku.", "uuuuuuuu", "uUuuuuUu", ".uuuuuu.", "........"],
  flamingo: ["..pp....", ".pk.....", ".p......", "..p.ppp.", "..pppPp.", "....p...", "....p..."],
};
function signRows(kind: keyof typeof ICONS): string[] {
  const g = blank(14, 21);
  rect(g, 6, 11, 2, 10, "W"); put(g, 6, 11, "w");
  rect(g, 0, 0, 14, 12, "w");
  rect(g, 0, 0, 14, 1, "f"); rect(g, 0, 11, 14, 1, "v"); rect(g, 13, 0, 1, 12, "W");
  rect(g, 2, 2, 10, 8, "f");
  stamp(g, 3, 2, ICONS[kind]);
  return rowsOf(g);
}
const mkSign = (k: keyof typeof ICONS) => defineProp({ rows: signRows(k), pal: SIGN_PAL, solid: { x: 4, y: 15, w: 8, h: 8 } });
export const SIGN_LION = mkSign("lion");
export const SIGN_GIRAFFE = mkSign("giraffe");
export const SIGN_ELEPHANT = mkSign("elephant");
export const SIGN_PENGUIN = mkSign("penguin");
export const SIGN_MONKEY = mkSign("monkey");
export const SIGN_PANDA = mkSign("panda");
export const SIGN_SNAKE = mkSign("snake");
export const SIGN_HIPPO = mkSign("hippo");
export const SIGN_FLAMINGO = mkSign("flamingo");

// ── Zoo train: locomotive + open wagon (side view, facing left) ─────────────
const TRAIN_PAL = {
  g: "#58b848", G: "#388830", h: "#88e070", r: "#f05050", R: "#b03038", s: "#ff8080",
  y: "#f8d048", Y: "#c09020", k: "#303040", K: "#585868", w: "#ffffff", W: "#c8c8d8",
  b: "#4878e0", B: "#3050a8", c: "#88b0f8", x: "#c8f0f8",
};
function locoRows(f: number): string[] {
  const g = blank(38, 30);
  // smoke puffs
  const puffs = f ? [[6, 3, 2.2], [3, 0.8, 1.6]] : [[7, 4, 1.8], [4, 1.5, 2]];
  for (const [px, py, r] of puffs) { ellipse(g, px, py, r, r * 0.9, "W"); put(g, Math.round(px - r / 2), Math.round(py - r / 2), "w"); }
  // chimney
  rect(g, 6, 7, 5, 2, "k"); rect(g, 7, 9, 3, 5, "K");
  // boiler
  rect(g, 2, 13, 22, 8, "g"); rect(g, 2, 13, 22, 2, "h"); rect(g, 2, 19, 22, 2, "G");
  for (const x of [8, 15]) rect(g, x, 13, 1, 8, "y");
  // lamp
  rect(g, 0, 14, 2, 3, "y"); put(g, 0, 15, "w");
  // cab
  rect(g, 22, 6, 14, 16, "r"); rect(g, 22, 6, 14, 1, "s"); rect(g, 35, 6, 1, 16, "R");
  rect(g, 20, 3, 18, 3, "k"); rect(g, 20, 3, 18, 1, "K");
  rect(g, 25, 9, 8, 6, "x"); rect(g, 25, 9, 8, 1, "W");
  // chassis + wheels
  rect(g, 1, 21, 36, 2, "k");
  stamp(g, 0, 21, ["Y", "YY", "YYY"]);
  for (const [wx, r] of [[7, 3.2], [15, 3.2], [29, 4]] as const) {
    ellipse(g, wx, 25.5, r, r, "R"); ellipse(g, wx, 25.5, r - 1.3, r - 1.3, "r"); put(g, wx, 25, "y");
    put(g, wx + (f ? 1 : -1), 25 + (f ? -1 : 1), "Y");
  }
  line(g, 7, 26 + (f ? -1 : 1), 29, 26 + (f ? -1 : 1), "K");
  return rowsOf(g);
}
export const TRAIN_LOCO = defineProp({ frames: [locoRows(0), locoRows(1)], fps: 2, pal: TRAIN_PAL, solid: { x: 1, y: 20, w: 38, h: 12 } });
function wagonRows(color: "b" | "y"): string[] {
  const g = blank(32, 24);
  const C = color, D = color === "b" ? "B" : "Y";
  // canopy on poles
  rect(g, 1, 0, 30, 3, "r");
  for (let x = 1; x < 31; x += 6) rect(g, x, 0, 3, 3, "w");
  rect(g, 1, 3, 30, 1, "R");
  for (const x of [2, 29]) rect(g, x, 4, 1, 8, "K");
  // seats (backs)
  for (const x of [5, 17]) { rect(g, x, 8, 9, 4, "y"); rect(g, x, 8, 9, 1, "w"); }
  // body
  rect(g, 1, 12, 30, 8, C); rect(g, 1, 12, 30, 1, color === "b" ? "c" : "w"); rect(g, 1, 19, 30, 1, D);
  for (let x = 4; x < 30; x += 6) put(g, x, 15, "w");
  rect(g, 0, 20, 32, 1, "k");
  for (const wx of [7, 24]) { ellipse(g, wx, 21.5, 2.6, 2.6, "k"); put(g, wx, 21, "K"); }
  return rowsOf(g);
}
export const TRAIN_WAGON = defineProp({ rows: wagonRows("b"), pal: TRAIN_PAL, solid: { x: 1, y: 12, w: 32, h: 12 } });
export const TRAIN_WAGON_Y = defineProp({ rows: wagonRows("y"), pal: TRAIN_PAL, solid: { x: 1, y: 12, w: 32, h: 12 } });

// ── Free-roaming peacock (lawn distraction) ─────────────────────────────────
const PEA_PAL = {
  b: "#3878e0", B: "#2850a8", c: "#58c0f0", g: "#48b060", G: "#2c7c40", h: "#90e080",
  y: "#f8d048", o: "#e8a040", k: "#202020", e: "#ffffff", l: "#a07850",
};
function peacock(fan: number): string[] {
  const g = blank(24, 20);
  if (fan) {
    // fanned tail: big half-disc with eyes
    for (let y = 0; y < 14; y++) for (let x = 0; x < 24; x++) {
      if (inEllipse(x, y, 13, 13, 11, 13)) put(g, x, y, (Math.round(Math.atan2(13 - y, x - 13) * 6) % 2) ? "g" : "G");
    }
    for (const [ex, ey] of [[5, 7], [9, 3], [13, 2], [17, 3], [21, 7], [8, 9], [18, 9], [13, 6]]) {
      put(g, ex, ey, "b"); put(g, ex, ey - 1, "y"); put(g, ex + 1, ey, "c");
    }
  } else {
    // trailing tail
    for (let x = 12; x < 24; x++) for (let y = 12; y < 16; y++) if (y - 12 < (x - 10) / 4 + 1) put(g, x, y, (x + y) % 3 ? "g" : "G");
    put(g, 18, 13, "b"); put(g, 22, 14, "b"); put(g, 15, 13, "y");
  }
  // body
  blobs(g, [{ x: 11, y: 13, rx: 4, ry: 3 }], "cbbB", { crease: false });
  // neck & head
  for (let y = 6; y < 12; y++) put(g, 8 - Math.floor((y - 6) / 3), y, "b"), put(g, 9 - Math.floor((y - 6) / 3), y, "B");
  stamp(g, 5, 3, [".y.y", "..bb", "kebb", "o.b."]);
  // legs
  stamp(g, 10, 16, ["l.l", "l.l", "l..l", "ll.ll"].map((r) => r.slice(0, 5)));
  return rowsOf(g);
}
export const PEACOCK = defineProp({
  frames: [peacock(0), peacock(0), peacock(1), peacock(1), peacock(1), peacock(0)], fps: 1, pal: PEA_PAL,
  solid: { x: 6, y: 14, w: 14, h: 8 },
});
