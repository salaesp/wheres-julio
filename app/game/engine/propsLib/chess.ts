// Giant chess set + table-top clutter for "El Tablero".
import { defineProp, type PropDef } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";

// ── Lathe: draw a solid of revolution from a half-width profile ─────────────
// Shaded as a cylinder lit from the left; the exposed top of a wider ring is
// lighter and the row tucked under a wider ring is darker.
export function lathe(g: CharGrid, cx: number, y0: number, prof: readonly number[], ramp = "abcd") {
  prof.forEach((hw, i) => {
    if (hw <= 0) return;
    const y = y0 + i;
    const up = i > 0 ? prof[i - 1] : 0;
    const under = up > hw + 0.6;
    for (let x = Math.floor(cx - hw); x < Math.ceil(cx + hw); x++) {
      const nx = (x + 0.5 - cx) / hw;
      let k = nx < -0.8 ? 1 : nx < -0.4 ? 0 : nx < 0.2 ? 1 : nx < 0.66 ? 2 : 3;
      if (hw < 2.5) k = nx < 0 ? 1 : 2;
      const ax = Math.abs(x + 0.5 - cx);
      if (hw > up + 0.6 && ax > up - 0.5) k = Math.max(0, k - 1); // ledge top
      if (under) k = Math.min(3, k + 1);
      put(g, x, y, ramp[k]);
    }
  });
}

/** Rotate a char grid 90° clockwise (left side → top: lit side stays lit). */
export function rotateCW(rowsIn: readonly string[]): string[] {
  const h = rowsIn.length, w = Math.max(...rowsIn.map((r) => r.length));
  const out: string[] = [];
  for (let x = 0; x < w; x++) {
    let s = "";
    for (let y = h - 1; y >= 0; y--) s += rowsIn[y][x] ?? ".";
    out.push(s);
  }
  return out;
}

const WHITE = { a: "#ffffff", b: "#f2ecdc", c: "#d4cab4", d: "#a89c88", k: "#5c5048", r: "#e05050" };
const BLACK = { a: "#a49cc4", b: "#655c84", c: "#463e62", d: "#2e2846", k: "#f8f0e0", r: "#e05050" };

// Common base: wide foot + ring.
const BASE = [8.5, 10, 10.5, 11, 11, 11, 11, 10.5];

function pawnRows(): string[] {
  const g = blank(22, 34);
  lathe(g, 11, 12, [4.5, 6, 7, 7, 6, 4, 4, 4, 4.5, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, ...BASE.map((v) => v)]);
  blobs(g, [{ x: 11, y: 7, rx: 6, ry: 6 }], "abcd", { hi: 0.35 });
  return rowsOf(g).slice(0, 34);
}

function rookRows(): string[] {
  const g = blank(24, 40);
  lathe(g, 12, 0, [
    10, 10, 10, 10, 10, 10, 10, 9.5, 8.5, 7.5, 7, 7, 7, 7, 7, 7, 7.5, 7.5, 7.5, 8, 8, 8, 8.5, 8.5, 9,
    7, 9, 10, 10, 9,
    ...[9.5, 10.5, 11, 12, 12, 12, 12, 11.5],
  ]);
  // crenellations: three merlons, gaps darker interior seen behind
  for (let y = 0; y < 3; y++) {
    for (const gx of [7, 8, 15, 16]) put(g, gx, y, ".");
  }
  for (const gx of [7, 8, 15, 16]) put(g, gx, 3, "d");
  for (const mx of [[2, 7], [9, 15], [17, 22]]) for (let x = mx[0]; x < mx[1]; x++) {
    put(g, x, 0, x < mx[0] + 2 ? "a" : "b");
  }
  // stone joints on the tower
  for (const [x, y] of [[8, 13], [9, 13], [14, 17], [15, 17], [10, 21], [11, 21]]) put(g, x, y, "c");
  return rowsOf(g);
}

function bishopRows(): string[] {
  const g = blank(22, 46);
  lathe(g, 11, 20, [
    7, 8.5, 8.5, 7.5, 5, 4, 4, 4, 4, 4.5, 4.5, 5, 5, 5.5, 6, 6.5, 7, 7.5, 8,
    ...BASE.slice(0, 7),
  ]);
  // mitre
  blobs(g, [
    { x: 11, y: 13, rx: 6.5, ry: 7.5 },
    { x: 11, y: 7.5, rx: 4, ry: 4.5 },
  ], "abcd", { crease: false, hi: 0.3 });
  // slit
  for (let i = 0; i < 6; i++) { put(g, 14 - i, 7 + i, "d"); put(g, 14 - i, 8 + i, "d"); put(g, 13 - i, 7 + i, i < 3 ? "c" : "d"); }
  // top ball
  blobs(g, [{ x: 11, y: 3, rx: 2.6, ry: 2.6 }], "abcd", { hi: 0.2 });
  return rowsOf(g);
}

function crownedRows(king: boolean): string[] {
  const W = 26, H = king ? 56 : 52;
  const g = blank(W, H);
  const top = king ? 10 : 10;
  // crown cup flaring outward
  const cup = king ? [8, 8.5, 8, 7.5, 7, 6.5, 6, 5.5] : [9.5, 9, 8.5, 7.5, 6.5, 6, 5.5, 5];
  const collar = [7.5, 9, 9, 8, 5.5];
  const body = [4.5, 4.5, 4.5, 4.5, 5, 5, 5, 5.5, 5.5, 6, 6, 6.5, 6.5, 7, 7.5, 8, 8.5, 9];
  const prof = [...cup, ...collar, ...body, 9, 10.5, 11, 11.5, 12, 12, 12, 12, 11.5];
  lathe(g, 13, top, prof.slice(0, H - top));
  // crown rim band
  for (let x = 0; x < W; x++) if (g[top + 1][x] !== ".") {
    g[top + 1][x] = g[top + 1][x] === "a" ? "b" : g[top + 1][x] === "b" ? "c" : "d";
  }
  if (king) {
    // dome + cross
    blobs(g, [{ x: 13, y: top + 0.5, rx: 6, ry: 3.5 }], "abcd", { crease: false, hi: 0.2 });
    stamp(g, 10, 0, [
      "..aab..",
      "..abc..",
      "aaabbcc",
      "abbbbcd",
      "..abc..",
      "..abc..",
      "..abc..",
    ]);
    for (const px of [5, 21]) { put(g, px, top, "a"); put(g, px, top - 1, "b"); }
  } else {
    // zig-zag crown teeth rising from the rim, each tipped with a pearl
    const pts = [4, 8.5, 13, 17.5, 22];
    const cylShade = (x: number) => {
      const nx = (x + 0.5 - 13) / 10;
      return nx < -0.4 ? "a" : nx < 0.2 ? "b" : nx < 0.66 ? "c" : "d";
    };
    for (let x = 3; x < 23; x++) {
      const d = Math.min(...pts.map((p) => Math.abs(x + 0.5 - p)));
      const hgt = Math.max(0, Math.round(5 - d * 2));
      for (let k = 1; k <= hgt; k++) put(g, x, top - k, cylShade(x));
    }
    // center orb
    blobs(g, [{ x: 13, y: top - 6.5, rx: 2.5, ry: 2.5 }], "abcd", { crease: false, hi: 0.1 });
    // jewels on the band
    put(g, 9, top + 1, "r"); put(g, 13, top + 1, "r"); put(g, 17, top + 1, "r");
  }
  return rowsOf(g);
}

function knightRows(flip = false): string[] {
  const g = blank(26, 46);
  const X = (x: number) => (flip ? 25 - x : x);
  const BX = (x: number) => (flip ? 26 - x : x);
  // head & neck from overlapping blobs
  blobs(g, [
    { x: BX(15), y: 22, rx: 8, ry: 8 },     // chest / neck
    { x: BX(13), y: 11, rx: 7.5, ry: 6.5 }, // skull
    { x: BX(7.5), y: 15, rx: 5.5, ry: 4 },  // muzzle
    { x: BX(16), y: 3.5, rx: 2.2, ry: 3.5 }, // ear
  ], "abcd", { hi: 0.25 });
  // throat notch
  for (const [x, y] of [[3, 19], [4, 19], [5, 19], [6, 19], [7, 19], [4, 20], [5, 20], [6, 20], [7, 20], [5, 21], [6, 21], [7, 21]]) put(g, X(x), y, ".");
  for (const [x, y] of [[4, 18], [5, 18], [6, 18], [8, 20], [8, 21], [7, 22]]) put(g, X(x), y, "c");
  // mane: dark ridge with notches down the back
  for (let y = 6; y < 27; y++) {
    const row = g[y];
    const filled = row.map((c, i) => (c !== "." ? i : -1)).filter((i) => i >= 0);
    if (!filled.length) continue;
    const edge = flip ? filled[0] : filled[filled.length - 1];
    const dir = flip ? 1 : -1;
    if (y % 3 !== 0) { put(g, edge + dir, y, flip ? "b" : "d"); put(g, edge + dir * 2, y, flip ? "a" : "c"); }
    else if (flip) put(g, edge + dir, y, "c");
  }
  // eye, nostril, mouth
  put(g, X(10), 10, "k"); put(g, X(11), 10, "k"); put(g, X(10), 11, "k");
  put(g, X(3), 15, "k"); put(g, X(3), 16, "c");
  for (let x = 3; x < 9; x++) put(g, X(x), 18, "c");
  // collar + base
  lathe(g, 13, 29, [9, 10.5, 10.5, 9.5, 8, ...[9.5, 10.5, 11, 12, 12, 12, 12, 11.5]]);
  return rowsOf(g).slice(0, 42);
}

function piece(rows: string[], pal: Record<string, string>): PropDef {
  const w = rows[0].length + 2, h = rows.length + 2;
  return defineProp({ rows, pal, solid: { x: 3, y: h - 9, w: w - 6, h: 8 } });
}

const P = pawnRows(), R = rookRows(), B = bishopRows(), N = knightRows();
const Q = crownedRows(false), K = crownedRows(true);

export const W_PAWN = piece(P, WHITE);
export const W_ROOK = piece(R, WHITE);
export const W_BISHOP = piece(B, WHITE);
export const W_KNIGHT = piece(N, WHITE);
export const W_QUEEN = piece(Q, WHITE);
export const W_KING = piece(K, WHITE);
export const B_PAWN = piece(P, BLACK);
export const B_ROOK = piece(R, BLACK);
export const B_BISHOP = piece(B, BLACK);
export const B_KNIGHT = piece(knightRows(true), BLACK);
export const B_QUEEN = piece(Q, BLACK);
export const B_KING = piece(K, BLACK);

// Knocked-over pieces (lying on their side, head to the right).
function fallen(rows: string[], pal: Record<string, string>): PropDef {
  const r = rotateCW(rows);
  const w = r[0].length + 2, h = r.length + 2;
  return defineProp({ rows: r, pal, solid: { x: 2, y: 4, w: w - 4, h: h - 5 } });
}
export const W_PAWN_DOWN = fallen(P, WHITE);
export const B_PAWN_DOWN = fallen(P, BLACK);
export const B_BISHOP_DOWN = fallen(B, BLACK);
export const W_KING_DOWN = fallen(K, WHITE);

// ── Chess clock (red retro, analog dials, animated running hand) ───────────
function disc(g: CharGrid, cx: number, cy: number, r: number, ch: string) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    if (dx * dx + dy * dy <= r * r) put(g, x, y, ch);
  }
}

function line(g: CharGrid, x0: number, y0: number, x1: number, y1: number, ch: string) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) put(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), ch);
}

function dial(g: CharGrid, cx: number, cy: number, ang: number, flagUp: boolean) {
  disc(g, cx, cy, 9.5, "n");     // chrome bezel (dark)
  disc(g, cx - 0.5, cy - 0.5, 9, "m");
  disc(g, cx, cy, 8, "w");
  // bezel highlight top-left
  for (let i = 0; i < 6; i++) put(g, Math.round(cx - 7 + i), Math.round(cy - 6 - (i < 3 ? 2 - i : 0)), "o");
  // inner shading bottom-right of the face
  for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
    const px = Math.floor(cx - 10) + x, py = Math.floor(cy - 10) + y;
    const dx = px + 0.5 - cx, dy = py + 0.5 - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 6.2 && d <= 8 && dx + dy > 3 && g[py]?.[px] === "w") put(g, px, py, "x");
  }
  // ticks
  const cxi = Math.floor(cx), cyi = Math.floor(cy);
  for (const [dx, dy] of [[0, -7], [7, 0], [0, 6], [-7, 0]]) { put(g, cxi + dx, cyi + dy, "k"); }
  for (const [dx, dy] of [[5, -5], [5, 4], [-5, 4], [-5, -5]]) put(g, cxi + dx, cyi + dy, "x");
  // hands
  line(g, cxi, cyi, cxi, cyi - 4, "k");
  line(g, cxi, cyi, Math.round(cxi + Math.sin(ang) * 6.5), Math.round(cyi - Math.cos(ang) * 6.5), "r");
  put(g, cxi, cyi, "k");
  // flag at ~11 o'clock
  if (flagUp) stamp(g, cxi + 1, cyi - 8, ["rr", "rR", "R."]);
}

function clockFrame(f: number): string[] {
  const g = blank(60, 42);
  // top face (lighter), slight trapezoid
  rect(g, 3, 8, 54, 7, "a");
  rect(g, 2, 9, 56, 6, "a");
  rect(g, 2, 14, 56, 1, "b");
  for (let x = 4; x < 56; x += 1) put(g, x, 8, x < 20 ? "h" : "a");
  // front face
  rect(g, 1, 15, 58, 24, "b");
  rect(g, 1, 15, 2, 24, "a");
  rect(g, 56, 15, 3, 24, "c");
  rect(g, 1, 37, 58, 2, "c");
  rect(g, 0, 39, 60, 2, "d");
  rect(g, 1, 15, 58, 1, "h");
  // brand plate
  rect(g, 24, 33, 12, 4, "m");
  rect(g, 24, 33, 12, 1, "o");
  rect(g, 26, 35, 8, 1, "n");
  // dials
  const ang = (f / 8) * Math.PI * 2;
  dial(g, 15, 25, ang, false);
  dial(g, 45, 25, Math.PI * 0.35, true);
  // plunger buttons: left pressed down, right up
  stamp(g, 9, 6, [
    ".yyyyyyyyyy.",
    "yYYYYYYYYYYY",
    ".mmmmmmmmmn.",
  ]);
  stamp(g, 39, 0, [
    "..yyyyyyyy..",
    ".yzzyyyyyyY.",
    "yyyyyyyyyyYY",
    "YYYYYYYYYYYY",
    "..mmnn.mmn..",
    "..mmmmmmmn..",
    "..mmmmmmmn..",
    "..mmmmmmnn..",
    ".mmmmmmmmmn.",
  ]);
  return rowsOf(g);
}

export const CHESS_CLOCK = defineProp({
  frames: Array.from({ length: 8 }, (_, i) => clockFrame(i)),
  fps: 1,
  pal: {
    h: "#ff9890", a: "#f87068", b: "#d84840", c: "#a83030", d: "#702028",
    w: "#fffbe8", x: "#e0d8c0", k: "#383040", r: "#e03838", R: "#a02028",
    m: "#c8ccd8", n: "#888ca8", o: "#ffffff", y: "#f8d048", Y: "#c89828", z: "#fff8c0",
  },
  solid: { x: 1, y: 14, w: 60, h: 29 },
});

// ── Dice (3/4 view cube) ─────────────────────────────────────────────────────
function dieRows(top: number, front: number): string[] {
  const g = blank(15, 16);
  rect(g, 1, 0, 13, 1, "a");
  rect(g, 0, 1, 15, 5, "a");
  rect(g, 0, 6, 15, 1, "b");
  rect(g, 0, 6, 15, 9, "b");
  rect(g, 13, 6, 2, 9, "c");
  rect(g, 0, 14, 15, 1, "c");
  rect(g, 1, 15, 13, 1, "c");
  put(g, 0, 0, "."); put(g, 14, 0, ".");
  const topPips: Record<number, number[][]> = { 1: [[7, 3]], 2: [[3, 2], [11, 4]], 3: [[3, 2], [7, 3], [11, 4]] };
  for (const [x, y] of topPips[top] ?? []) { put(g, x, y, "p"); put(g, x + 1, y, "p"); }
  const fp: Record<number, number[][]> = {
    1: [[6, 9]], 4: [[3, 7], [9, 7], [3, 11], [9, 11]],
    5: [[2, 7], [10, 7], [6, 9], [2, 11], [10, 11]], 6: [[3, 7], [9, 7], [3, 9], [9, 9], [3, 11], [9, 11]],
  };
  for (const [x, y] of fp[front] ?? []) { put(g, x, y, "p"); put(g, x + 1, y, "p"); put(g, x, y + 1, "q"); put(g, x + 1, y + 1, "q"); }
  return rowsOf(g);
}
export const DIE_RED = defineProp({
  rows: dieRows(2, 5),
  pal: { a: "#ff8078", b: "#e84848", c: "#b02838", p: "#ffffff", q: "#f0d0d0" },
  solid: { x: 1, y: 5, w: 15, h: 12 },
});
export const DIE_WHITE = defineProp({
  rows: dieRows(3, 4),
  pal: { a: "#ffffff", b: "#ece8e0", c: "#c4bcb0", p: "#383040", q: "#686070" },
  solid: { x: 1, y: 5, w: 15, h: 12 },
});
export const DIE_BLUE = defineProp({
  rows: dieRows(1, 6),
  pal: { a: "#90c0ff", b: "#5888e8", c: "#3858b8", p: "#ffffff", q: "#d0dcf8" },
  solid: { x: 1, y: 5, w: 15, h: 12 },
});

// ── Checkers pieces (fichas de damas) ───────────────────────────────────────
function ellipse(g: CharGrid, cx: number, cy: number, rx: number, ry: number, ch: string | ((nx: number, ny: number) => string)) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
    if (nx * nx + ny * ny <= 1) put(g, x, y, typeof ch === "string" ? ch : ch(nx, ny));
  }
}

function checkerRows(stack: number): string[] {
  const h = 11 + (stack - 1) * 3;
  const g = blank(18, h);
  for (let s = stack - 1; s >= 0; s--) {
    const top = h - 11 - s * 3;
    // side band (thickness 3): lower half-ellipse shifted down
    for (let k = 3; k >= 1; k--) ellipse(g, 9, top + 4 + k, 9, 4, (nx) => (k === 3 ? "d" : nx > 0.55 ? "d" : "c"));
    // top face
    ellipse(g, 9, top + 4, 9, 4, "b");
    ellipse(g, 9, top + 4, 6, 2.6, (nx, ny) => (nx + ny < -0.3 ? "c" : "a"));
    ellipse(g, 9, top + 4, 4.5, 1.8, "b");
    put(g, 6, top + 3, "a");
  }
  return rowsOf(g);
}
export const CHECKER_RED = defineProp({
  rows: checkerRows(1),
  pal: { a: "#ffa098", b: "#f05848", c: "#c03838", d: "#882030" },
  solid: { x: 1, y: 3, w: 18, h: 10 },
});
export const CHECKER_BLACK_STACK = defineProp({
  rows: checkerRows(3),
  pal: { a: "#8880a8", b: "#585070", c: "#403858", d: "#28203a" },
  solid: { x: 1, y: 8, w: 18, h: 11 },
});
export const CHECKER_RED_STACK = defineProp({
  rows: checkerRows(2),
  pal: { a: "#ffa098", b: "#f05848", c: "#c03838", d: "#882030" },
  solid: { x: 1, y: 5, w: 18, h: 10 },
});

// ── Ludo / parchís pawns ─────────────────────────────────────────────────────
function ludoRows(): string[] {
  const g = blank(12, 18);
  lathe(g, 6, 6, [2, 2.5, 3, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6, 5.5]);
  blobs(g, [{ x: 6, y: 4, rx: 3.6, ry: 3.6 }], "abcd", { hi: 0.25 });
  return rowsOf(g);
}
const LUDO = ludoRows();
export const LUDO_YELLOW = defineProp({ rows: LUDO, pal: { a: "#fff8b0", b: "#f8d838", c: "#d8a820", d: "#a87818" } });
export const LUDO_BLUE = defineProp({ rows: LUDO, pal: { a: "#b0d8ff", b: "#58a0f0", c: "#3870d0", d: "#2850a0" } });
export const LUDO_GREEN = defineProp({ rows: LUDO, pal: { a: "#c8f8a8", b: "#68c860", c: "#48a048", d: "#2c7838" } });

// ── Coffee mug (steam animates) ──────────────────────────────────────────────
function mugFrame(f: number): string[] {
  const g = blank(30, 38);
  const y0 = 10;
  lathe(g, 13, y0 + 3, Array(22).fill(11), "abcd");
  // band
  for (let x = 2; x < 24; x++) { if (g[y0 + 12][x] !== ".") g[y0 + 12][x] = "w"; if (g[y0 + 13][x] !== ".") g[y0 + 13][x] = "W"; }
  // heart on the mug
  stamp(g, 7, y0 + 16, [".r.r.", "rRrrr", ".rrr.", "..r.."]);
  // rim ellipse with coffee inside
  rect(g, 4, y0, 18, 1, "a");
  rect(g, 2, y0 + 1, 22, 4, "a");
  rect(g, 4, y0 + 1, 18, 3, "k");
  rect(g, 6, y0 + 1, 14, 1, "K");
  rect(g, 4, y0 + 4, 18, 1, "b");
  put(g, 6, y0 + 2, "j"); put(g, 7, y0 + 2, "j");
  // handle
  stamp(g, 23, y0 + 7, [
    "cccc.",
    "...cd",
    "....d",
    "....d",
    "....d",
    "...cd",
    "cccd.",
  ]);
  // steam
  const s = [
    ["..s.....s.", ".s.....s..", ".s......s.", "..s.....s.", "...s...s..", "..s.....s.", ".s......s.", ".........."],
    [".s......s.", "..s.....s.", "..s....s..", ".s......s.", ".s.....s..", "..s.....s.", "..........", ".........."],
  ][f % 2];
  stamp(g, 8, 1, s.map((r) => r.replace(/s/g, "s")));
  return rowsOf(g);
}
export const MUG = defineProp({
  frames: [mugFrame(0), mugFrame(1)],
  fps: 1.5,
  pal: {
    a: "#9cd0ff", b: "#5c9cf0", c: "#3c74d0", d: "#2a50a0", w: "#ffffff", W: "#d8e4f8",
    k: "#704028", K: "#905838", j: "#c08860", r: "#f05868", R: "#ffb0b8", s: "#ffffff",
  },
  solid: { x: 2, y: 22, w: 28, h: 18 },
});

// ── Trophy ───────────────────────────────────────────────────────────────────
export const TROPHY = defineProp({
  rows: (() => {
    const g = blank(26, 36);
    // handles
    stamp(g, 0, 4, ["..aab", ".a...", "a....", "a....", "b....", ".b...", "..cc."]);
    stamp(g, 21, 4, ["bcc..", "...c.", "....d", "....d", "....d", "...d.", ".dd.."]);
    lathe(g, 13, 2, [9, 9, 9, 8.5, 8, 7.5, 7, 6, 5, 4, 2.5, 2, 2, 2, 3, 4.5]);
    rect(g, 6, 1, 14, 1, "a");
    rect(g, 6, 2, 14, 1, "c");
    put(g, 9, 5, "w"); put(g, 9, 6, "w"); put(g, 10, 5, "w");
    // star
    stamp(g, 11, 6, ["..r..", "rrrrr", ".rrr.", ".r.r."]);
    // wooden plinth
    rect(g, 6, 18, 14, 10, "m");
    rect(g, 6, 18, 2, 10, "l");
    rect(g, 17, 18, 3, 10, "n");
    rect(g, 5, 28, 16, 3, "n");
    rect(g, 9, 21, 8, 4, "a");
    rect(g, 9, 24, 8, 1, "c");
    return rowsOf(g).slice(0, 31);
  })(),
  pal: { a: "#fff0a0", b: "#f8c838", c: "#d09820", d: "#a07018", w: "#ffffff", r: "#e85848", l: "#a06038", m: "#7c4428", n: "#582c1c" },
  solid: { x: 5, y: 19, w: 18, h: 14 },
});

// ── Flat clutter: score sheet + pencil, playing cards, coordinates ─────────
export const SCORESHEET = defineProp({
  rows: (() => {
    const g = blank(26, 30);
    rect(g, 0, 0, 22, 28, "w");
    rect(g, 21, 1, 1, 27, "x");
    rect(g, 0, 27, 22, 1, "x");
    rect(g, 2, 2, 18, 2, "t");
    for (let y = 6; y < 26; y += 3) { rect(g, 2, y, 18, 1, "l"); }
    rect(g, 10, 5, 1, 21, "l");
    // scribbles (moves)
    for (const [x, y, n] of [[3, 5, 4], [12, 5, 5], [3, 8, 5], [12, 8, 3], [3, 11, 3], [12, 11, 5], [3, 14, 4]]) rect(g, x, y, n, 1, "k");
    // pencil
    for (let i = 0; i < 18; i++) {
      put(g, 6 + i, 27 - Math.floor(i / 2), "y"); put(g, 6 + i, 28 - Math.floor(i / 2), "Y");
    }
    put(g, 5, 28, "p"); put(g, 4, 29, "k"); put(g, 5, 29, "p");
    put(g, 24, 18, "e"); put(g, 25, 18, "e"); put(g, 24, 19, "e"); put(g, 23, 19, "m");
    return rowsOf(g);
  })(),
  pal: { w: "#fffcf0", x: "#d8d0c0", t: "#88b0e8", l: "#c8d8f0", k: "#5c5870", y: "#f8d048", Y: "#d09828", p: "#f0c898", e: "#f090a0", m: "#a8a8b8" },
  flat: true,
});

export const CARDS = defineProp({
  rows: (() => {
    const g = blank(26, 22);
    const card = (x: number, y: number, suit: string[], col: string) => {
      rect(g, x, y, 13, 18, "w");
      rect(g, x + 12, y + 1, 1, 17, "x");
      rect(g, x, y + 17, 13, 1, "x");
      stamp(g, x + 4, y + 6, suit.map((r) => r.replace(/#/g, col)));
      put(g, x + 1, y + 1, col); put(g, x + 11, y + 16, col);
    };
    card(0, 0, [".#.#.", "#####", ".###.", "..#.."], "r");
    card(9, 3, ["..#..", ".###.", "#####", ".###.", "..#.."], "r");
    card(13, 1, ["..#..", ".###.", "#####", "#.#.#", "..#.."], "k");
    return rowsOf(g);
  })(),
  pal: { w: "#ffffff", x: "#c8c8d8", r: "#e03848", k: "#383048" },
  flat: true,
});

const FONT: Record<string, string[]> = {
  a: [".g.", "g.g", "ggg", "g.g", "g.g"],
  b: ["gg.", "g.g", "gg.", "g.g", "gg."],
  c: [".gg", "g..", "g..", "g..", ".gg"],
  d: ["gg.", "g.g", "g.g", "g.g", "gg."],
  e: ["ggg", "g..", "gg.", "g..", "ggg"],
  f: ["ggg", "g..", "gg.", "g..", "g.."],
  "1": [".g.", "gg.", ".g.", ".g.", "ggg"],
  "2": ["gg.", "..g", ".g.", "g..", "ggg"],
  "3": ["gg.", "..g", ".g.", "..g", "gg."],
  "4": ["g.g", "g.g", "ggg", "..g", "..g"],
  "5": ["ggg", "g..", "gg.", "..g", "gg."],
  "6": [".gg", "g..", "gg.", "g.g", ".g."],
  "7": ["ggg", "..g", ".g.", ".g.", ".g."],
  "8": [".g.", "g.g", ".g.", "g.g", ".g."],
};
const GOLD = { g: "#f8d868", h: "#a87828" };
/** Gold coordinate glyph engraved on the board frame (flat). */
export function coord(ch: string): PropDef {
  const glyph = FONT[ch];
  // engraved: gold glyph with a dark drop shadow pixel to the bottom-right
  const g = blank(4, 6);
  glyph.forEach((r, y) => { for (let x = 0; x < 3; x++) if (r[x] === "g") { put(g, x + 1, y + 1, "h"); } });
  glyph.forEach((r, y) => { for (let x = 0; x < 3; x++) if (r[x] === "g") put(g, x, y, "g"); });
  return defineProp({ rows: rowsOf(g), pal: GOLD, flat: true, outline: false });
}
