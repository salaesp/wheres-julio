// Circus props, mostly drawn by hand in ASCII: the big top and small striped
// tents (hand-set silhouettes + stamped doors, curtains, flags), hand-drawn
// clowns / strongman / lion wagon / high striker / cotton-candy stall /
// cannon, a red-and-white ring fence, a "CIRCO" entrance arch, bunting, signs,
// and re-tinted copies of the zoo's gate, booth, carts, train, cages and
// elephant so the fair shares the look of the other worlds.
import { defineProp, type PropDef } from "../props";
import { blank, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, line, flipRows } from "./artkit";
import { rod, text, textWidth } from "./pixkit";
import {
  ELEPHANT as ZOO_ELEPHANT, GATE_PILLAR_L, GATE_PILLAR_R, TICKET_BOOTH as ZOO_BOOTH,
  POPCORN_CART as ZOO_POPCORN, TRAIN_LOCO, TRAIN_WAGON, TRAIN_WAGON_Y,
  MESH_H as ZOO_MESH_H, MESH_V as ZOO_MESH_V, MESH_POST as ZOO_MESH_POST,
} from "./zoo";

/** Re-tint a defined prop: same rows, new palette letters. */
function retint(p: PropDef, pal: Record<string, string>, extra: Partial<Parameters<typeof defineProp>[0]> = {}): PropDef {
  return defineProp({ rows: p.rows, frames: p.frames, fps: p.fps, pal: { ...p.pal, ...pal }, solid: p.solid, flat: p.flat, outline: p.outline, baseY: p.baseY, ...extra });
}

/** Mirror a left half; the right half is shaded one step darker through `shade`. */
function sym(half: readonly string[], shade: Record<string, string> = {}): string[] {
  return half.map((r) => r + r.split("").reverse().map((c) => shade[c] ?? c).join(""));
}

// ════════════════════════════════════════════════════════════════════════════
// Tents
// ════════════════════════════════════════════════════════════════════════════
const RED = "rRQ", WHT = "wWv"; // light, base, dark

type Cone = { cx: number; y0: number; y1: number; hw0: number; hw1: number; N: number; gamma?: number };
function cone(g: CharGrid, c: Cone) {
  const gamma = c.gamma ?? 1;
  for (let y = c.y0; y <= c.y1; y++) {
    const t = (y - c.y0) / Math.max(1, c.y1 - c.y0);
    const hw = c.hw0 + (c.hw1 - c.hw0) * Math.pow(t, gamma);
    for (let x = Math.ceil(c.cx - hw); x <= Math.floor(c.cx + hw - 0.5); x++) {
      const u = (x + 0.5 - c.cx) / (hw + 0.5);
      const p = (u + 1) * c.N;
      const stripe = Math.floor(p), f = p - stripe;
      let k = f < 0.2 ? 0 : f > 0.8 ? 2 : 1;
      if (u > 0.45) k = Math.min(2, k + 1);
      put(g, x, y, (stripe % 2 === 0 ? RED : WHT)[k]);
    }
  }
}

/** Scalloped valance: one rounded flap per stripe. */
function valance(g: CharGrid, xa: number, xb: number, y: number, sw: number) {
  for (let x = xa; x < xb; x++) {
    const s = Math.floor((x - xa) / sw), lx = (x - xa) % sw;
    const L = s % 2 === 0 ? RED : WHT;
    const dark = x > xb - sw * 1.4 ? 1 : 0;
    put(g, x, y, L[Math.min(2, 0 + dark)]);
    put(g, x, y + 1, L[Math.min(2, 1 + dark)]);
    if (lx >= 1 && lx <= sw - 2) put(g, x, y + 2, L[Math.min(2, 1 + dark)]);
    if (lx >= 2 && lx <= sw - 3) put(g, x, y + 3, L[2]);
  }
}

function walls(g: CharGrid, xa: number, xb: number, y0: number, y1: number, sw: number) {
  for (let y = y0; y <= y1; y++) for (let x = xa; x < xb; x++) {
    const s = Math.floor((x - xa) / sw), lx = (x - xa) % sw;
    const L = s % 2 === 0 ? RED : WHT;
    let k = lx === 0 ? 0 : lx === sw - 1 ? 2 : 1;
    if (x > xb - sw * 1.5) k = Math.min(2, k + 1);
    if (y >= y1 - 1) k = 2;
    put(g, x, y, L[k]);
  }
}

/** Arched doorway with a glowing interior, tied-back curtains and a carpet. */
function door(g: CharGrid, cx: number, y0: number, y1: number, dw: number) {
  const dh = y1 - y0 + 1;
  const xa = Math.round(cx - dw / 2), xb = xa + dw - 1;
  const arch = [Math.round(dw * 0.24), Math.round(dw * 0.13), Math.round(dw * 0.07), 1];
  const inset = (i: number) => (i < arch.length ? arch[i] : 0);
  for (let i = 0; i < dh; i++) {
    const y = y0 + i;
    for (let x = xa + inset(i); x <= xb - inset(i); x++) {
      const edge = x === xa + inset(i) || x === xb - inset(i) || i === 0;
      put(g, x, y, edge ? "Y" : i > dh - 4 ? "c" : i > dh - 8 ? "K" : "k");
    }
  }
  // carpet runner inside the doorway
  for (let y = y1 - 2; y <= y1; y++) for (let x = xa + 1; x < xb; x++) put(g, x, y, x === xa + 1 || x === xb - 1 ? "y" : x === cx || x === cx - 1 ? "c" : "m");
  // curtains
  const tie = y0 + Math.round(dh * 0.5);
  for (let i = 1; i < dh - 3; i++) {
    const y = y0 + i;
    const c0 = Math.max(3, Math.round(dw * 0.2));
    const cw = y <= tie ? c0 : c0 + Math.min(3, Math.floor((y - tie) / 3));
    for (let j = 0; j < cw; j++) {
      const lx = xa + 1 + j, rx = xb - 1 - j;
      if (lx >= xa + inset(i) + 1) put(g, lx, y, j === 0 ? "M" : j % 2 ? "m" : "N");
      if (rx <= xb - inset(i) - 1) put(g, rx, y, j === 0 ? "N" : j % 2 ? "m" : "M");
    }
  }
  for (const x of [xa + 1, xa + 2, xa + 3, xb - 1, xb - 2, xb - 3]) put(g, x, tie, "y");
  put(g, xa + 2, tie + 1, "Y"); put(g, xb - 2, tie + 1, "Y");
  put(g, xa + 2, tie + 2, "y"); put(g, xb - 2, tie + 2, "y");
}

function plaque(g: CharGrid, cx: number, y: number, label: string) {
  const w = textWidth(label) + 5;
  const x = Math.round(cx - w / 2);
  rect(g, x, y, w, 8, "Y");
  rect(g, x + 1, y + 1, w - 2, 6, "k");
  rect(g, x, y, w, 1, "y");
  text(g, x + 2, y + 1, label, "y");
}

const FLAG = ["ffffff.", "fffffffF", ".ffffFF.", "..fFF..."];
function flag(g: CharGrid, cx: number, y: number, poleLen: number) {
  rect(g, Math.floor(cx), y, 1, poleLen, "s");
  put(g, Math.floor(cx), y - 1, "y");
  stamp(g, Math.floor(cx) + 1, y, FLAG);
}

const TENT_PAL = {
  r: "#ff6a64", R: "#e03840", Q: "#a82434",
  w: "#ffffff", W: "#e8e8f4", v: "#b8b8d4",
  k: "#5a2848", K: "#3c1830", c: "#d8a040", m: "#e8505c", M: "#ff8a8a", N: "#901c34",
  y: "#ffe060", Y: "#c8902c", s: "#d8d8e8", f: "#ffe060", F: "#c8902c",
};

function bigTopRows(): string[] {
  const W = 112, H = 90;
  const g = blank(W, H);
  const cx = W / 2;
  // lower skirt of the roof, then the upper cone on top of it
  cone(g, { cx, y0: 30, y1: 52, hw0: 20, hw1: 55, N: 7, gamma: 1.25 });
  cone(g, { cx, y0: 9, y1: 34, hw0: 1.5, hw1: 27, N: 5, gamma: 1.15 });
  // gold trim where the cone meets the skirt
  for (let x = Math.round(cx - 27); x < Math.round(cx + 27); x++) { put(g, x, 35, x % 4 === 0 ? "y" : "Y"); put(g, x, 36, "Y"); }
  for (let i = 0; i < 6; i++) { put(g, Math.round(cx - 26 + i * 10.4), 37, "y"); put(g, Math.round(cx - 26 + i * 10.4), 38, "Y"); }
  // gold rim at the skirt edge, scalloped valance, walls
  for (let x = 1; x < W - 1; x++) put(g, x, 53, x % 3 === 0 ? "y" : "Y");
  valance(g, 1, W - 1, 54, 7);
  walls(g, 3, W - 3, 58, 87, 7);
  // wall posts / ground line
  for (const x of [3, W - 4]) rect(g, x, 58, 1, 30, "Y");
  rect(g, 3, 88, W - 6, 1, "K");
  // door + sign
  door(g, cx, 66, 87, 26);
  plaque(g, cx, 57, "CIRCO");
  // flag + finial
  flag(g, cx, 0, 12);
  rect(g, Math.round(cx) - 1, 9, 3, 2, "y");
  return rowsOf(g);
}
export const BIG_TOP = defineProp({
  rows: bigTopRows(),
  pal: TENT_PAL,
  solid: { x: 4, y: 58, w: 106, h: 32 },
});

function tentRows(W: number, cone0: number, wallH: number, dw: number): string[] {
  const coneH = Math.round(W * 0.42);
  const vy = cone0 + coneH;
  const wy = vy + 4;
  const H = wy + wallH + 1;
  const g = blank(W, H);
  const cx = W / 2;
  cone(g, { cx, y0: cone0, y1: vy - 1, hw0: 1.2, hw1: W / 2 - 1, N: 4, gamma: 1.12 });
  for (let x = 1; x < W - 1; x++) put(g, x, vy, x % 3 === 0 ? "y" : "Y");
  valance(g, 1, W - 1, vy + 1, 5);
  walls(g, 3, W - 3, wy, wy + wallH - 1, 5);
  rect(g, 3, wy + wallH, W - 6, 1, "K");
  door(g, cx, wy + 2, wy + wallH - 1, dw);
  flag(g, cx, 0, cone0 + 4);
  return rowsOf(g);
}
const TENT_SOLID = { x: 3, y: 24, w: 44, h: 26 };
export const TENT_RED = defineProp({ rows: tentRows(50, 8, 18, 14), pal: TENT_PAL, solid: TENT_SOLID });
export const TENT_BLUE = defineProp({
  rows: tentRows(50, 8, 18, 14),
  pal: { ...TENT_PAL, r: "#6cb0ff", R: "#3c80e8", Q: "#2850b0", w: "#fff4b0", W: "#f0d870", v: "#c8a850", f: "#ff6868", F: "#c83838" },
  solid: TENT_SOLID,
});
export const TENT_PURPLE = defineProp({
  rows: tentRows(50, 8, 18, 14),
  pal: { ...TENT_PAL, r: "#c890ff", R: "#9c58e0", Q: "#6c38a8", w: "#ffe0f4", W: "#f4b0dc", v: "#c880b0", f: "#58d8f0", F: "#2898c0" },
  solid: TENT_SOLID,
});

// ════════════════════════════════════════════════════════════════════════════
// Clowns (hand-drawn left half, mirrored)
// ════════════════════════════════════════════════════════════════════════════
const CLOWN_HALF = [
  "......ab",
  "....abbb",
  "..abbbbb",
  ".abbbfff",
  ".abbbfkf",
  ".abbcmfn",
  ".abbcfmm",
  "..abcfff",
  "...bc.ff",
  "...wwwww",
  "..wWwWwW",
  "..ssssSS",
  ".ssTSSuS",
  ".ssTSSSy",
  ".sSTSuSS",
  ".sSTSSSS",
  ".sSTSSSy",
  ".gGTSuSS",
  ".gG.SSSS",
  "...ppppp",
  "...pppPP",
  "...pppP.",
  "...pppP.",
  "..oooOO.",
  ".oooooO.",
  ".OOOOOO.",
];
const CLOWN_SHADE = { a: "b", b: "c", s: "S", S: "T", f: "F", g: "G", w: "W", p: "P", o: "O" };
const CLOWN_ROWS = sym(CLOWN_HALF, CLOWN_SHADE);
/** Head bobs down one pixel (swallows one ruffle row). */
const clownBob = (rows: string[]) => ["................", ...rows.slice(0, 9), ...rows.slice(10)];
const clownPal = (wig: string[], suit: string[], dots: string, pants: string[], shoes: string[]) => ({
  a: wig[0], b: wig[1], c: wig[2],
  s: suit[0], S: suit[1], T: suit[2], u: dots, y: "#ffe060",
  p: pants[0], P: pants[1], o: shoes[0], O: shoes[1],
  f: "#fff0e0", F: "#e8c4b4", k: "#2a1a30", n: "#f03838", m: "#e03048",
  w: "#ffffff", W: "#c8d0ec", g: "#ffffff", G: "#c0c8e4",
});
const CLOWN_SOLID = { x: 2, y: 18, w: 14, h: 11 };
const CLOWN_A = clownPal(["#ffa098", "#f05050", "#b02c3c"], ["#9cd0ff", "#4a90f0", "#2c58b8"], "#fff088", ["#ffe060", "#c89830"], ["#f05050", "#a02030"]);
const CLOWN_B = clownPal(["#b8dcff", "#5c98f0", "#3464c0"], ["#ffa0a0", "#f05050", "#b02838"], "#ffffff", ["#5c98f0", "#2c64c0"], ["#ffe060", "#c89830"]);
const CLOWN_C = clownPal(["#ffc8ec", "#f070c0", "#b83890"], ["#fff6a8", "#f8d848", "#c89830"], "#9c60e0", ["#9c60e0", "#6038a8"], ["#f89838", "#b45818"]);
const CLOWN_D = clownPal(["#ffd8a0", "#f89038", "#b85818"], ["#d8b0ff", "#9c60e0", "#6c38a8"], "#ffffff", ["#ff7088", "#c83858"], ["#58b8ff", "#2c78c0"]);
export const CLOWN_RED = defineProp({ frames: [CLOWN_ROWS, clownBob(CLOWN_ROWS)], fps: 2, pal: CLOWN_A, solid: CLOWN_SOLID });
export const CLOWN_BLUE = defineProp({ frames: [clownBob(CLOWN_ROWS), CLOWN_ROWS], fps: 2.5, pal: CLOWN_B, solid: CLOWN_SOLID });
export const CLOWN_PINK = defineProp({ frames: [CLOWN_ROWS, clownBob(CLOWN_ROWS)], fps: 1.8, pal: CLOWN_C, solid: CLOWN_SOLID });
export const CLOWN_ORANGE = defineProp({ frames: [clownBob(CLOWN_ROWS), CLOWN_ROWS], fps: 2.2, pal: CLOWN_D, solid: CLOWN_SOLID });

/** A clown tossing three balls overhead. */
function jugglerFrame(f: number): string[] {
  const top = 11;
  const g = blank(16, top + CLOWN_ROWS.length);
  stamp(g, 0, top, f % 2 ? clownBob(CLOWN_ROWS) : CLOWN_ROWS);
  const arc: [number, number][] = [[1, 7], [3, 3], [6, 1], [9, 1], [12, 3], [14, 7]];
  ["x", "z", "v"].forEach((c, i) => {
    const [bx, by] = arc[(f + i * 2) % arc.length];
    stamp(g, bx - 1, by, [`${c}${c}`, `${c}${c}`]);
  });
  return rowsOf(g);
}
export const CLOWN_JUGGLER = defineProp({
  frames: [0, 1, 2, 3, 4, 5].map(jugglerFrame), fps: 4,
  pal: { ...CLOWN_A, x: "#ff5050", z: "#ffe060", v: "#58b0ff" },
  solid: { x: 2, y: 29, w: 14, h: 11 },
});

// ════════════════════════════════════════════════════════════════════════════
// Strongman (hand-drawn left half, mirrored): moustache, striped leotard
// ════════════════════════════════════════════════════════════════════════════
const STRONG_HALF = [
  ".fff...fffff",
  ".ffFf..fffff",
  ".fffF..fkfff",
  ".ffF...hfffF",
  "..fF...hhhhh",
  "..fF..hhhhhh",
  "..fFF..fffFF",
  "...fF....fFF",
  ".fffffffffff",
  "fffffFfffffF",
  "ffffFrrrrrrr",
  "ffffFrrrrrrr",
  ".fffFwwwwwww",
  "..ffFwwwwwww",
  "...fFrrrrrrr",
  "....Frrrrrrr",
  "....Fwwwwwww",
  "....Fwwwwwww",
  "....yyyyyyyy",
  "....rrrrrrrr",
  ".....rrrrrr.",
  ".....rrrrrr.",
  ".....rrrrrr.",
  ".....wwwwww.",
  "....kkkkkkk.",
  "....kkkkkkk.",
];
export const STRONGMAN = defineProp({
  rows: sym(STRONG_HALF, { f: "F", r: "R", w: "W", y: "Y" }),
  pal: {
    f: "#ffc8a0", F: "#d89870", h: "#4a2a18", k: "#2a1a30",
    r: "#ff6a64", R: "#c83840", w: "#ffffff", W: "#d0d0e8", y: "#ffe060", Y: "#c8902c",
  },
  solid: { x: 5, y: 18, w: 16, h: 10 },
});

// ════════════════════════════════════════════════════════════════════════════
// Lion wagon (cage on gilded wheels)
// ════════════════════════════════════════════════════════════════════════════
const LION_HALF = [
  ".mm....",
  "mNNmmmm",
  "mMMMMMM",
  "mMMffff",
  "mMffkff",
  "mMNffff",
  "mMNfwoo",
  ".MNfwkw",
  ".MNNfww",
  "..MNNff",
  "...NNNN",
];
const LION_HEAD = sym(LION_HALF, { f: "g", m: "M", M: "N" });
function lionWagonRows(): string[] {
  const W = 46, H = 46;
  const g = blank(W, H);
  const cx = W / 2;
  // gilded roof
  for (let i = 0; i < 6; i++) {
    const inset = (5 - i) * 2;
    for (let x = 2 + inset; x < W - 2 - inset; x++) {
      const band = Math.floor((x + 40) / 4) % 2 === 0;
      put(g, x, 3 + i, i === 0 ? "s" : band ? (x > W - 12 ? "Q" : "r") : (x > W - 12 ? "R" : "R"));
    }
  }
  rect(g, 1, 9, W - 2, 2, "y"); rect(g, 1, 10, W - 2, 1, "Y");
  for (let x = 3; x < W - 3; x += 4) { put(g, x, 11, "y"); put(g, x, 12, "Y"); }
  rect(g, Math.floor(cx) - 1, 0, 2, 3, "y"); put(g, Math.floor(cx) - 1, 0, "z");
  // cage interior
  rect(g, 3, 11, W - 6, 17, "i");
  rect(g, 3, 11, W - 6, 1, "I");
  stamp(g, Math.round(cx - 7), 14, LION_HEAD);
  // bars
  for (let x = 6; x < W - 4; x += 4) { rect(g, x, 12, 1, 16, "b"); put(g, x, 12, "B"); }
  rect(g, 3, 20, W - 6, 1, "b");
  rect(g, 3, 27, W - 6, 2, "B");
  // gold corner posts
  for (const x of [1, W - 3]) { rect(g, x, 11, 2, 19, "y"); rect(g, x + 1, 11, 1, 19, "Y"); }
  // carved body panel
  rect(g, 1, 29, W - 2, 8, "p"); rect(g, 1, 29, W - 2, 1, "P"); rect(g, 1, 36, W - 2, 1, "q");
  rect(g, cx - 15, 29, 30, 7, "y"); rect(g, cx - 14, 30, 28, 5, "k");
  text(g, Math.round(cx - textWidth("FIERAS") / 2), 30, "FIERAS", "y");
  rect(g, 1, 37, W - 2, 1, "K");
  // wheels
  for (const wx of [8, W - 9]) {
    const wy = 40.5;
    ellipse(g, wx, wy, 5.2, 5.2, "K"); ellipse(g, wx, wy, 4.3, 4.3, "y"); ellipse(g, wx, wy, 3.1, 3.1, "K");
    line(g, wx - 3, wy - 0.5, wx + 3, wy - 0.5, "y"); line(g, wx, wy - 3, wx, wy + 3, "y"); line(g, wx - 2, wy - 2, wx + 2, wy + 2, "y"); line(g, wx + 2, wy - 2, wx - 2, wy + 2, "y");
    ellipse(g, wx, wy, 1.3, 1.3, "r");
  }
  return rowsOf(g);
}
export const LION_WAGON = defineProp({
  rows: lionWagonRows(),
  pal: {
    r: "#ff6a64", R: "#e03840", Q: "#a82434", s: "#ffa0a0", y: "#ffe060", Y: "#c8902c", z: "#ffffff",
    i: "#2e2038", I: "#1a1020", b: "#b8b8d0", B: "#7c7c98", k: "#4a1428", p: "#d03850", P: "#ff7088", q: "#901c34", K: "#2a1a30",
    m: "#ffa030", M: "#e07820", N: "#a84e14", f: "#ffd890", g: "#e0b068", o: "#e86060", w: "#fff4e0",
  },
  solid: { x: 2, y: 24, w: 44, h: 24 },
});

// ════════════════════════════════════════════════════════════════════════════
// High striker ("test your strength") — hand-drawn
// ════════════════════════════════════════════════════════════════════════════
const STRIKER_BELL = [
  "........y",
  ".......yy",
  "......yyy",
  ".....yyyy",
  "....yyyyy",
  "....yyyyy",
  "...yyyyyY",
  "...yYYYYY",
];
function strikerRows(): string[] {
  const g = blank(20, 58);
  stamp(g, 1, 0, sym(STRIKER_BELL, { y: "Y" }).map((r) => r.slice(0, 18)));
  put(g, 10, 0, "y"); put(g, 9, 0, "y");
  // tower: s r y K K y r Q
  const tower = "srykkyrQ";
  for (let y = 8; y < 48; y++) {
    const tick = (y - 8) % 6 === 0;
    const row = tower.split("");
    if (tick) { row[2] = "w"; row[5] = "w"; }
    stamp(g, 6, y, [row.join("")]);
  }
  // red ball in the slot + a star top plate
  stamp(g, 8, 13, ["oo", "oo"]);
  rect(g, 5, 8, 10, 2, "Q"); rect(g, 5, 8, 10, 1, "r");
  // base platform
  rect(g, 2, 48, 16, 3, "d"); rect(g, 2, 48, 16, 1, "c");
  rect(g, 1, 51, 18, 5, "D"); rect(g, 1, 51, 18, 1, "d"); rect(g, 1, 55, 18, 1, "E");
  // pad + hammer
  stamp(g, 3, 49, ["rrr", "RRR"]);
  stamp(g, 12, 47, ["WWWWW.", "WRRRRW", "WRRRRW", ".WWWW."].map((r) => r.slice(0, 6)));
  line(g, 16, 51, 19, 49, "d");
  return rowsOf(g);
}
export const HIGH_STRIKER = defineProp({
  rows: strikerRows(),
  pal: {
    y: "#ffe060", Y: "#c8902c", s: "#ff8a8a", r: "#f04850", Q: "#a82434", k: "#2e1a30", w: "#ffffff",
    o: "#ff5050", d: "#d8a468", c: "#f4c888", D: "#8c5c30", E: "#5c3c20", R: "#e03840", W: "#fff0d8",
  },
  solid: { x: 2, y: 46, w: 18, h: 12 },
});

// ════════════════════════════════════════════════════════════════════════════
// Cotton-candy stall
// ════════════════════════════════════════════════════════════════════════════
const FLOSS = [
  "..pppp...",
  ".pPpppP..",
  "pPpppPpp.",
  "pppPpppPp",
  ".pPpppPp.",
  "..pPPPp..",
  "....t....",
  "....t....",
];
function candyStallRows(): string[] {
  const W = 42, H = 48;
  const g = blank(W, H);
  // striped awning, peaked, with scallops
  for (let y = 0; y < 8; y++) {
    const inset = Math.round((7 - y) * 1.1);
    for (let x = inset; x < W - inset; x++) {
      const stripe = Math.floor(x / 5) % 2 === 0;
      const dark = x > W - 11;
      put(g, x, y, stripe ? (y === 0 ? "u" : dark ? "U" : "b") : (dark ? "W" : "w"));
    }
  }
  for (let x = 0; x < W; x++) {
    const stripe = Math.floor(x / 5) % 2 === 0, lx = x % 5;
    put(g, x, 8, stripe ? "U" : "W");
    if (lx >= 1 && lx <= 3) put(g, x, 9, stripe ? "U" : "W");
    if (lx === 2) put(g, x, 10, stripe ? "U" : "W");
  }
  rect(g, 15, 0, 12, 1, "y");
  // posts and sign
  rect(g, 2, 8, 2, 31, "d"); rect(g, W - 4, 8, 2, 31, "D");
  rect(g, 6, 11, 30, 9, "Y"); rect(g, 7, 12, 28, 7, "k");
  text(g, 8, 13, "ALGODON", "y");
  // back wall with floss on sticks
  rect(g, 4, 20, W - 8, 11, "m");
  rect(g, 4, 20, W - 8, 1, "M");
  stamp(g, 6, 21, FLOSS); stamp(g, 17, 21, FLOSS.map((r) => r.replace(/p/g, "q").replace(/P/g, "Q")));
  stamp(g, 27, 21, FLOSS);
  // counter
  rect(g, 2, 31, W - 4, 3, "x"); rect(g, 2, 31, W - 4, 1, "z");
  rect(g, 3, 34, W - 6, 9, "p"); rect(g, 3, 34, W - 6, 1, "P");
  for (let x = 3; x < W - 3; x += 4) { stamp(g, x, 36, ["w", "ww"].map((r) => r.slice(0, 2))); put(g, x + 1, 38, "w"); }
  rect(g, 3, 42, W - 6, 1, "Q");
  // wheels
  for (const wx of [8, W - 9]) { ellipse(g, wx, 44, 3.4, 3.4, "K"); ellipse(g, wx, 44, 1.4, 1.4, "s"); }
  return rowsOf(g);
}
export const CANDY_STALL = defineProp({
  rows: candyStallRows(),
  pal: {
    b: "#6cb0ff", u: "#a8d4ff", U: "#3c80e8", w: "#ffffff", W: "#dcdcf0",
    y: "#ffe060", Y: "#c8902c", k: "#3c1c40", d: "#d8a468", D: "#8c5c30",
    m: "#ffe4f4", M: "#f4b0d8", p: "#ff9cc8", P: "#e060a0", q: "#a8d4ff", Q: "#6ca0e8", t: "#f0e8d8",
    x: "#fff0d8", z: "#ffffff", s: "#a8a8bc", K: "#2c2838",
  },
  solid: { x: 2, y: 30, w: 38, h: 20 },
});

// ════════════════════════════════════════════════════════════════════════════
// Human cannon
// ════════════════════════════════════════════════════════════════════════════
function cannonRows(): string[] {
  const W = 40, H = 30;
  const g = blank(W, H);
  // barrel: thick shaded tube going up-right, with red/white bands
  rod(g, 9, 19, 29, 6, 5.2, (t, s) => {
    const band = Math.floor(t / 5) % 2 === 0;
    const k = s < -2.6 ? 0 : s < 1.8 ? 1 : 2;
    return (band ? "rRQ" : "wWv")[k];
  });
  // muzzle ring + dark mouth
  rod(g, 28, 7, 31, 5, 6.2, (_t, s) => (s < -3 ? "y" : "Y"));
  rod(g, 31, 5, 32, 4.4, 4.2, () => "K");
  // carriage
  rect(g, 5, 19, 20, 4, "d"); rect(g, 5, 19, 20, 1, "e"); rect(g, 5, 22, 20, 1, "D");
  rect(g, 8, 23, 4, 3, "D");
  // big spoked wheel
  const wx = 13, wy = 24;
  ellipse(g, wx, wy, 6.2, 6.2, "K"); ellipse(g, wx, wy, 5.2, 5.2, "y"); ellipse(g, wx, wy, 3.8, 3.8, "D");
  for (const [dx, dy] of [[0, 4], [4, 0], [3, 3], [3, -3]]) { line(g, wx - dx, wy - dy, wx + dx, wy + dy, "e"); }
  ellipse(g, wx, wy, 1.4, 1.4, "y");
  // trail leg
  rect(g, 22, 22, 8, 2, "D"); rect(g, 29, 21, 2, 4, "D");
  // star on the carriage
  stamp(g, 17, 20, [".y.", "yyy", ".y."]);
  return rowsOf(g);
}
export const CANNON = defineProp({
  rows: cannonRows(),
  pal: {
    r: "#ff6a64", R: "#e03840", Q: "#a82434", w: "#ffffff", W: "#e8e8f4", v: "#b8b8d4",
    y: "#ffe060", Y: "#c8902c", K: "#2a1a30", d: "#8a90b8", e: "#b8c0e0", D: "#4c5278",
  },
  solid: { x: 4, y: 18, w: 28, h: 14 },
});

// ════════════════════════════════════════════════════════════════════════════
// Ring fence: red & white boards between gold-capped posts
// ════════════════════════════════════════════════════════════════════════════
const FENCE_PAL = {
  r: "#ff6a64", R: "#e03840", Q: "#a82434", s: "#ffa0a0",
  w: "#ffffff", W: "#e8e8f4", v: "#b8b8d4", x: "#ffffff",
  y: "#ffe060", Y: "#c8902c", k: "#3c2236",
};
function fenceRows(): string[] {
  const g = blank(16, 15);
  const rail = (y0: number) => {
    for (let x = 0; x < 16; x++) {
      const red = Math.floor(x / 4) % 2 === 0;
      put(g, x, y0, red ? "s" : "x");
      put(g, x, y0 + 1, red ? "r" : "w");
      put(g, x, y0 + 2, red ? "R" : "W");
      put(g, x, y0 + 3, red ? "Q" : "v");
    }
  };
  rail(3); rail(9);
  // post at the left end (3 wide) with a gold cap
  for (let y = 1; y < 15; y++) { put(g, 0, y, "x"); put(g, 1, y, "w"); put(g, 2, y, "v"); }
  stamp(g, 0, 0, ["yyY", "yyY"].map((r) => r));
  put(g, 0, 14, "k"); put(g, 1, 14, "Q"); put(g, 2, 14, "Q");
  return rowsOf(g);
}
export const RING_FENCE_H = defineProp({ rows: fenceRows(), pal: FENCE_PAL, solid: { x: 0, y: 8, w: 18, h: 9 } });
export const RING_POST = defineProp({
  rows: ["yyY", "yyY", "xwv", "xwv", "xwv", "xwv", "xwv", "xwv", "xwv", "xwv", "xwv", "xwv", "xwv", "xwv", "kQQ"],
  pal: FENCE_PAL, solid: { x: 0, y: 8, w: 5, h: 9 },
});
export const RING_FENCE_V = defineProp({
  rows: (() => {
    const g = blank(4, 18);
    stamp(g, 0, 0, ["yyY.", "yyY."]);
    for (let y = 2; y < 18; y++) {
      const red = Math.floor((y - 2) / 4) % 2 === 0;
      const row = red ? "sRRQ" : "xwwv";
      stamp(g, 0, y, [y < 5 ? "xwv." : row]);
    }
    return rowsOf(g);
  })(),
  pal: FENCE_PAL, solid: { x: 0, y: 0, w: 6, h: 20 }, baseY: 11,
});

// ── Cage mesh, re-tinted red & gold (zoo mesh, circus wagon colors) ──────────
const MESH_RED = { a: "#d8d8e8", b: "#9898b4", c: "#686884", p: "#ff6a64", P: "#c83840", q: "#ffa0a0", d: "#601828" };
export const CAGE_H = retint(ZOO_MESH_H, MESH_RED);
export const CAGE_V = retint(ZOO_MESH_V, MESH_RED);
export const CAGE_POST = retint(ZOO_MESH_POST, MESH_RED);

// ════════════════════════════════════════════════════════════════════════════
// Pedestal drum, striped ball, circus elephant (zoo elephant + hat & blanket)
// ════════════════════════════════════════════════════════════════════════════
function drumRows(): string[] {
  const W = 34, H = 20;
  const g = blank(W, H);
  const cx = W / 2;
  // side with vertical stripes and a rounded bottom
  for (let y = 5; y < 18; y++) for (let x = 1; x < W - 1; x++) {
    const e = Math.pow((x + 0.5 - cx) / (cx - 1), 2);
    const by = 16 + Math.sqrt(Math.max(0, 1 - e)) * 3;
    if (y > by) continue;
    const s = Math.floor((x - 1) / 5) % 2 === 0, lx = (x - 1) % 5;
    const k = lx === 0 ? 0 : lx === 4 ? 2 : 1;
    put(g, x, y, (s ? RED : WHT)[x > W - 9 ? Math.min(2, k + 1) : k]);
  }
  // gold top face
  ellipse(g, cx, 5, cx - 1, 4.6, "Y");
  ellipse(g, cx, 4.4, cx - 2.2, 3.7, "y");
  ellipse(g, cx, 4.2, cx - 6, 2.2, "z");
  for (let x = 4; x < W - 4; x += 3) put(g, x, 9, "y");
  return rowsOf(g);
}
export const DRUM = defineProp({
  rows: drumRows(),
  pal: { ...TENT_PAL, z: "#fff4b0" },
  solid: { x: 2, y: 8, w: 34, h: 14 },
  baseY: 2,
});

function ballRows(r: number): string[] {
  const D = r * 2;
  const g = blank(D, D);
  const cx = r, cy = r;
  const pals = ["rRQ", "wWv", "yYZ"];
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const nx = (x + 0.5 - cx) / r, ny = (y + 0.5 - cy) / r;
    if (nx * nx + ny * ny > 1) continue;
    const stripe = Math.floor(((x + 0.5 + (y + 0.5) * 0.7) / D) * 6) % 3;
    const lit = -(nx * 0.6 + ny * 0.8);
    const k = lit > 0.35 ? 0 : lit > -0.35 ? 1 : 2;
    put(g, x, y, pals[stripe][k]);
  }
  put(g, Math.round(r * 0.55), Math.round(r * 0.5), "x");
  return rowsOf(g);
}
export const BIG_BALL = defineProp({
  rows: ballRows(11),
  pal: { ...TENT_PAL, y: "#ffe060", Y: "#e8b830", Z: "#a87818", x: "#ffffff" },
  solid: { x: 1, y: 11, w: 22, h: 12 },
});
export const SMALL_BALL = defineProp({
  rows: ballRows(5),
  pal: { ...TENT_PAL, y: "#ffe060", Y: "#e8b830", Z: "#a87818", x: "#ffffff" },
  solid: { x: 0, y: 4, w: 12, h: 8 },
});

const HAT_ROWS = [
  "...y...",
  "...r...",
  "..rrR..",
  "..rwR..",
  ".rrrRR.",
  ".rwrRR.",
  "yyyyyyY",
];
function circusElephant(rows: readonly string[]): string[] {
  const PAD = 7;
  const g = blank(rows[0].length, rows.length + PAD);
  rows.forEach((r, y) => r.split("").forEach((c, x) => put(g, x, y + PAD, c)));
  // red & gold blanket on the back (only over body pixels)
  for (let y = PAD + 4; y <= PAD + 11; y++) for (let x = 19; x <= 33; x++) {
    const c = g[y]?.[x];
    if (!c || !"abcd".includes(c)) continue;
    const edge = y === PAD + 11;
    put(g, x, y, edge ? ((x + y) % 2 ? "y" : "Y") : y === PAD + 4 ? "s" : x > 28 ? "R" : "r");
  }
  for (let x = 21; x <= 31; x += 3) { const y = PAD + 8; if ("abcdrR".includes(g[y]?.[x] ?? "")) put(g, x, y, "y"); }
  stamp(g, 7, 0, HAT_ROWS);
  return rowsOf(g);
}
const ELE_FRAMES_C = (ZOO_ELEPHANT.frames ?? []).map(circusElephant);
export const CIRCUS_ELEPHANT = defineProp({
  frames: ELE_FRAMES_C, fps: ZOO_ELEPHANT.fps,
  pal: { ...ZOO_ELEPHANT.pal, r: "#ff6a64", R: "#b82c3c", s: "#ffa0a0", y: "#ffe060", Y: "#c8902c", w: "#ffffff" },
  solid: { x: 2, y: 25, w: 36, h: 14 },
});

// ════════════════════════════════════════════════════════════════════════════
// Entrance: re-tinted gate pillars, "CIRCO" arch, ticket booth, carts, train
// ════════════════════════════════════════════════════════════════════════════
const PILLAR_TINT = {
  a: "#fff4e4", b: "#ffd0b8", c: "#e8a088", d: "#b87060", e: "#784838",
  g: "#ffe880", G: "#f8b030", H: "#c07818",
};
export const GATE_L = retint(GATE_PILLAR_L, PILLAR_TINT, { solid: { x: 0, y: 40, w: 18, h: 12 } });
export const GATE_R = retint(GATE_PILLAR_R, { ...PILLAR_TINT, o: "#58a8ff", O: "#2c68c0" });

function gateSignRows(): string[] {
  const W = 84, H = 30;
  const g = blank(W, H);
  for (let x = 0; x < W; x++) {
    const top = Math.round(8 - Math.sin((x / (W - 1)) * Math.PI) * 8);
    for (let y = top; y < 26; y++) {
      const stripe = Math.floor(x / 5) % 2 === 0;
      let c = stripe ? "r" : "w";
      if (y === top) c = "y";
      else if (y === top + 1) c = "Y";
      else if (y >= 24) c = y === 25 ? "Q" : stripe ? "R" : "W";
      put(g, x, y, c);
    }
  }
  // lettering panel
  rect(g, 14, 8, 56, 14, "k"); rect(g, 15, 9, 54, 12, "n");
  rect(g, 15, 20, 54, 1, "N");
  const label = "CIRCO";
  text(g, 42 - Math.floor(textWidth(label, 2) / 2), 11, label, "r", 2, "R");
  // stars and bulbs
  for (const sx of [6, 77]) stamp(g, sx - 1, 12, [".y.", "yyy", ".y."]);
  for (let x = 16; x < 68; x += 6) { put(g, x, 7, "y"); put(g, x + 1, 7, "z"); }
  return rowsOf(g);
}
export const GATE_SIGN = defineProp({
  rows: gateSignRows(),
  pal: {
    r: "#ff6a64", R: "#b82c3c", Q: "#a82434", w: "#ffffff", W: "#dcdcf0", y: "#ffe060", Y: "#c8902c",
    k: "#3c2236", n: "#fff4d0", N: "#e0c890", z: "#ffffff",
  },
  solid: null, baseY: 40,
});

export const TICKET_BOOTH = retint(ZOO_BOOTH, { t: "#5898ff", T: "#2c58c0", y: "#ffe060" });
export const POPCORN_CART = ZOO_POPCORN;

const TRAIN_TINT = { g: "#9c68e8", G: "#6c3cb0", h: "#c8a0ff" };
export const TRAIN_LOCO_C = retint(TRAIN_LOCO, TRAIN_TINT);
export const TRAIN_WAGON_C = retint(TRAIN_WAGON, { b: "#ff7088", B: "#c03858", c: "#ffa8b8" });
export const TRAIN_WAGON_Y2 = TRAIN_WAGON_Y;

// ════════════════════════════════════════════════════════════════════════════
// Bunting, pennant pole, signs, little props
// ════════════════════════════════════════════════════════════════════════════
export const BUNTING = defineProp({
  rows: (() => {
    const W = 46, H = 12;
    const g = blank(W, H);
    const cols = "rybprybp";
    for (let x = 0; x < W; x++) put(g, x, Math.round(Math.sin((x / (W - 1)) * Math.PI) * 2), "s");
    for (let i = 0; i < 7; i++) {
      const x0 = 2 + i * 6;
      const sag = Math.round(Math.sin(((x0 + 2) / (W - 1)) * Math.PI) * 2);
      const c = cols[i];
      stamp(g, x0, sag + 1, [c.repeat(5), c.repeat(5), "." + c.repeat(3), "." + c.repeat(3), ".." + c]);
    }
    return rowsOf(g);
  })(),
  pal: { s: "#f0e8d8", r: "#ff5a58", y: "#ffe060", b: "#58a8ff", p: "#f070c0" },
  outline: false, solid: null,
});

function pennantRows(f: number): string[] {
  const g = blank(22, 50);
  rect(g, 1, 4, 2, 44, "s"); rect(g, 1, 4, 1, 44, "S"); rect(g, 0, 48, 4, 2, "S");
  stamp(g, 0, 0, ["yy", "yy"]);
  const cols = "rybpr";
  for (let i = 0; i < 5; i++) {
    const y = 6 + i * 6, wob = (i + f) % 2, c = cols[i];
    stamp(g, 3, y + wob, [c.repeat(8), c.repeat(7), c.repeat(5), c.repeat(3), c]);
  }
  return rowsOf(g);
}
export const PENNANT_POLE = defineProp({
  frames: [pennantRows(0), pennantRows(1)], fps: 2.2,
  pal: { s: "#f0f0f8", S: "#8c8ca8", y: "#ffe060", r: "#ff5a58", b: "#58a8ff", p: "#f070c0" },
  solid: { x: 0, y: 46, w: 4, h: 6 },
});

export const PENNANT_POLE_L = defineProp({
  frames: [pennantRows(0), pennantRows(1)].map(flipRows), fps: 2.2,
  pal: { s: "#f0f0f8", S: "#8c8ca8", y: "#ffe060", r: "#ff5a58", b: "#58a8ff", p: "#f070c0" },
  solid: { x: 18, y: 46, w: 4, h: 6 },
});

/** Wooden sign with pixel text on two posts. */
function mkSign(label: string, face: string, ink: string, rim: string) {
  const w = textWidth(label) + 8;
  const g = blank(w, 22);
  rect(g, 3, 11, 2, 11, "d"); rect(g, w - 5, 11, 2, 11, "D");
  rect(g, 0, 0, w, 12, "e"); rect(g, 1, 1, w - 2, 10, "f"); rect(g, 1, 10, w - 2, 1, "g");
  rect(g, 0, 0, w, 1, rim);
  text(g, 4, 3, label, "t");
  return defineProp({
    rows: rowsOf(g),
    pal: { d: "#d8a468", D: "#8c5c30", e: "#f8e8c0", f: face, g: ink, t: "#fff8e0", [rim]: "#ffe060" },
    solid: { x: 2, y: 15, w: w - 4, h: 8 },
  });
}
export const SIGN_LIONS = mkSign("LEONES", "#c83850", "#8c1c34", "h");
export const SIGN_RING = mkSign("PISTA", "#3c78e0", "#2850a8", "h");
export const SIGN_TRAIN = mkSign("TREN", "#8c58d8", "#5c38a0", "h");
export const SIGN_TENT = mkSign("SHOW", "#e0602c", "#a03c18", "h");

/** Billboard with a striped poster ("GRAN SHOW"). */
export const POSTER = defineProp({
  rows: (() => {
    const g = blank(26, 34);
    rect(g, 3, 24, 2, 10, "d"); rect(g, 21, 24, 2, 10, "D");
    rect(g, 0, 0, 26, 26, "e"); rect(g, 1, 1, 24, 24, "f"); rect(g, 25, 0, 1, 26, "g");
    for (let y = 2; y < 24; y++) for (let x = 2; x < 24; x++) {
      const k = Math.floor(((x - 13) * 0.5 + (y - 13) * 0.0 + 40) / 2.4) % 2 === 0;
      const a = Math.abs(x - 13) + Math.abs(y - 16) * 0.4;
      put(g, x, y, a < 5 ? "w" : k ? "r" : "t");
    }
    text(g, 4, 3, "GRAN", "y");
    text(g, 4, 18, "SHOW", "y");
    stamp(g, 11, 9, [".yy.", "yooy", "yooy", ".yy."]);
    put(g, 12, 10, "k"); put(g, 13, 10, "k");
    return rowsOf(g);
  })(),
  pal: { d: "#d8a468", D: "#8c5c30", e: "#f8e8c0", f: "#fff0d8", g: "#c8a060", w: "#ffffff", r: "#ff6a64", t: "#fff0d8", y: "#3c2236", o: "#ff9040", k: "#2a1a30" },
  solid: { x: 2, y: 28, w: 22, h: 8 },
});

/** Popcorn spilled on the ground (flat decal). */
export const POPCORN_SPILL = defineProp({
  rows: ["..w.w..", ".wyww.w", "ww.wyw.", ".w.ww.."],
  pal: { w: "#fffbe0", y: "#f8d870" },
  flat: true, outline: false, solid: null,
});
/** Crumpled ticket + confetti decal. */
export const CONFETTI = defineProp({
  rows: ["r...u..y", "..y..p...", "u...r..w", "...w..y.", "p..u...r"].map((r) => r.padEnd(9, ".")),
  pal: { r: "#ff5a58", u: "#58a8ff", y: "#ffe060", p: "#f070c0", w: "#ffffff" },
  flat: true, outline: false, solid: null,
});
/** Wooden crate stack with a striped ball on it. */
export const PROP_CRATE = defineProp({
  rows: [
    "......xxxx......",
    ".....xwwrrx.....",
    ".....xwrrRx.....",
    "......xxxx......",
    "aaaaaaaaaaaaaaaa",
    "abbbbbbbbbbbbbbc",
    "abbbbbbbbbbbbbbc",
    "cccccccccccccccc",
    "dbeeeeeeeeeeeebd",
    "dbebbbbbbbbbbebd",
    "dbebbbbbbbbbbebd",
    "dddddddddddddddd",
  ],
  pal: { a: "#f4c888", b: "#d8a468", c: "#b88048", d: "#8c5c30", e: "#c89058", x: "#ffe060", w: "#ffffff", r: "#ff6a64", R: "#b82c3c" },
  solid: { x: 0, y: 6, w: 18, h: 8 },
});
