// Candy-land props: lollipop trees, candy canes, gingerbread houses, gummy
// bears, cupcakes, donuts, cotton-candy trees and bushes, ice creams,
// marshmallows, a chocolate fountain, chocolate benches and small sweets.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, flipRows, line } from "./artkit";
import { rng } from "./pixkit";

type Ramp = readonly [string, string, string]; // hi, base, shadow

const at = (g: CharGrid, x: number, y: number) => g[y]?.[x] ?? ".";

/** Lit value of an offset (nx, ny) inside a unit disc (light from top-left). */
const litOf = (nx: number, ny: number) => -(nx * 0.55 + ny * 0.85);

// ════════════════════════════════════════════════════════════════════════════
// Lollipop trees (spiral discs on a white stick)
// ════════════════════════════════════════════════════════════════════════════
const BAND_HI = "ABCD", BAND_BASE = "EFGH", BAND_SH = "IJKL";

function lollipopRows(nBands: number, R: number, stickH: number, bow: boolean): string[] {
  const W = R * 2 + 4, cx = W / 2, cy = R + 1;
  const H = Math.round(cy + R + stickH);
  const g = blank(W, H);
  // stick
  for (let y = Math.round(cy); y < H; y++) {
    put(g, Math.floor(cx) - 1, y, "w");
    put(g, Math.floor(cx), y, "W");
  }
  put(g, Math.floor(cx) - 1, H - 1, "W");
  // disc
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    const r = Math.hypot(dx, dy);
    if (r > R) continue;
    const ang = Math.atan2(dy, dx) / (Math.PI * 2) + 0.5;
    const f = (((ang * 1 + r / (R * 0.55)) % 1) + 1) % 1;
    const band = Math.floor(f * nBands * 2) % nBands;
    const lit = litOf(dx / R, dy / R);
    let s = BAND_BASE[band];
    if (r > R - 1.6 && lit < -0.1) s = BAND_SH[band];
    else if (lit < -0.55 && r > R * 0.55) s = BAND_SH[band];
    else if (lit > 0.45 && r > R * 0.45 && r < R - 1) s = BAND_HI[band];
    put(g, x, y, s);
  }
  // glossy glint
  const gx = Math.round(cx - R * 0.5), gy = Math.round(cy - R * 0.55);
  stamp(g, gx, gy, ["hh.", "h.."]);
  put(g, gx + 3, gy - 1, "h");
  if (bow) {
    const by = Math.round(cy + R) + 1, bx = Math.floor(cx) - 4;
    stamp(g, bx, by, ["rr...rr", "rRrqrRr", ".r.R.r.", "...R..."]);
  }
  return rowsOf(g);
}
const STICK = { w: "#ffffff", W: "#d0c8dc", h: "#ffffff", r: "#f85888", R: "#b82858", q: "#ffd0e0" };
function lolliPal(bands: readonly Ramp[]) {
  const pal: Record<string, string> = { ...STICK };
  bands.forEach((b, i) => {
    pal[BAND_HI[i]] = b[0]; pal[BAND_BASE[i]] = b[1]; pal[BAND_SH[i]] = b[2];
  });
  return pal;
}
const PINK: Ramp = ["#ffc0dc", "#f86ca8", "#c83c80"];
const WHITE: Ramp = ["#ffffff", "#fff4fa", "#dcc8e0"];
const MINTR: Ramp = ["#c8ffe8", "#58d8a8", "#30a080"];
const LEMON: Ramp = ["#fff8c0", "#f8d840", "#c8a018"];
const ORANGE: Ramp = ["#ffd0a0", "#f89838", "#c86818"];
const SKY: Ramp = ["#d0ecff", "#68b8f8", "#3880d0"];
const GRAPE: Ramp = ["#ecd0ff", "#b070f0", "#7840c0"];
const RED: Ramp = ["#ffa8a8", "#f04848", "#b02838"];

const LOLLI_R = 12, LOLLI_STICK = 24;
const lolliSolid = { x: LOLLI_R - 1, y: LOLLI_R * 2 + LOLLI_STICK - 6, w: 6, h: 6 };
export const LOLLIPOP_PINK = defineProp({
  rows: lollipopRows(2, LOLLI_R, LOLLI_STICK, true), pal: lolliPal([PINK, WHITE]), solid: lolliSolid,
});
export const LOLLIPOP_RAINBOW = defineProp({
  rows: lollipopRows(4, LOLLI_R, LOLLI_STICK, false), pal: lolliPal([RED, LEMON, MINTR, SKY]), solid: lolliSolid,
});
export const LOLLIPOP_MINT = defineProp({
  rows: lollipopRows(2, LOLLI_R, LOLLI_STICK, true), pal: { ...lolliPal([MINTR, WHITE]), r: "#68a8f8", R: "#3868c0", q: "#d0ecff" }, solid: lolliSolid,
});
export const LOLLIPOP_GRAPE = defineProp({
  rows: lollipopRows(3, LOLLI_R, LOLLI_STICK, false), pal: lolliPal([GRAPE, ORANGE, WHITE]), solid: lolliSolid,
});
export const LOLLIPOP_SMALL = defineProp({
  rows: lollipopRows(2, 5, 9, false), pal: lolliPal([ORANGE, LEMON]), solid: { x: 4, y: 16, w: 6, h: 4 },
});
export const LOLLIPOP_SMALL_B = defineProp({
  rows: lollipopRows(2, 5, 9, false), pal: lolliPal([SKY, WHITE]), solid: { x: 4, y: 16, w: 6, h: 4 },
});

// ════════════════════════════════════════════════════════════════════════════
// Candy cane (hook to the left), diagonal red/white stripes
// ════════════════════════════════════════════════════════════════════════════
function caneRows(H: number, flip = false): string[] {
  const W = 14;
  const g = blank(W, H);
  const cx = 6.5, cy = 6.5, rc = 4; // hook centre line radius
  const paint = (x: number, y: number, offX: number, offY: number) => {
    const stripe = Math.floor((x + y) / 3) % 2 === 0;
    const lit = -(offX * 0.55 + offY * 0.85);
    const tone = lit > 0.35 ? 0 : lit < -0.45 ? 2 : 1;
    put(g, x, y, (stripe ? "rst" : "wxy")[tone]);
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x + 0.5, py = y + 0.5;
    if (py <= cy) {
      const dx = px - cx, dy = py - cy, d = Math.hypot(dx, dy);
      if (Math.abs(d - rc) <= 2) paint(x, y, (dx / d) * (d - rc) / 2, (dy / d) * (d - rc) / 2);
    } else if (px >= cx + rc - 2 && px <= cx + rc + 2) {
      paint(x, y, (px - (cx + rc)) / 2, 0);
    } else if (py <= cy + 3 && px >= cx - rc - 2 && px <= cx - rc + 2) {
      paint(x, y, (px - (cx - rc)) / 2, 0);
    }
  }
  const rows = rowsOf(g);
  return flip ? flipRows(rows) : rows;
}
const CANE_PAL = {
  r: "#ff8080", s: "#e82838", t: "#a81830",
  w: "#ffffff", x: "#f4eef4", y: "#c8bcd0",
};
export const CANDY_CANE = defineProp({ rows: caneRows(34), pal: CANE_PAL, solid: { x: 8, y: 30, w: 6, h: 6 } });
export const CANDY_CANE_R = defineProp({ rows: caneRows(30, true), pal: CANE_PAL, solid: { x: 2, y: 26, w: 6, h: 6 } });
export const CANDY_CANE_GREEN = defineProp({
  rows: caneRows(26), pal: { ...CANE_PAL, r: "#a8f0b8", s: "#38b860", t: "#208040" }, solid: { x: 8, y: 22, w: 6, h: 6 },
});

// ════════════════════════════════════════════════════════════════════════════
// Gummy bears (giant, translucent-looking jelly)
// ════════════════════════════════════════════════════════════════════════════
function gummyRows(wave: boolean): string[] {
  const g = blank(22, 26);
  blobs(g, [
    { x: 6, y: 22, rx: 3.6, ry: 3.2 },   // feet
    { x: 16, y: 22, rx: 3.6, ry: 3.2 },
    { x: 11, y: 17, rx: 7.2, ry: 6.5 },  // body
    { x: 4, y: wave ? 10 : 15, rx: 2.6, ry: 3.4 }, // arms
    { x: 18, y: 15, rx: 2.6, ry: 3.4 },
    { x: 5, y: 3.5, rx: 2.8, ry: 2.6 },  // ears
    { x: 17, y: 3.5, rx: 2.8, ry: 2.6 },
    { x: 11, y: 8, rx: 7, ry: 5.8 },     // head
    { x: 11, y: 10.5, rx: 3.2, ry: 2.2 },  // snout
  ], "abcd", { crease: true });
  // belly glow (inner light of the jelly) and glints
  for (let y = 15; y < 21; y++) for (let x = 8; x < 15; x++) {
    const nx = (x + 0.5 - 11) / 3.5, ny = (y + 0.5 - 18) / 3;
    if (nx * nx + ny * ny <= 1 && at(g, x, y) !== ".") put(g, x, y, "b");
  }
  stamp(g, 7, 15, ["hh", "h."]);
  stamp(g, 6, 4, ["h"]); stamp(g, 7, 5, ["h"]);
  put(g, 13, 2 + 3, "h");
  // face
  put(g, 8, 8, "e"); put(g, 14, 8, "e");
  stamp(g, 10, 9, ["ee", ".."]);
  stamp(g, 10, 11, ["c.c"]);
  put(g, 11, 12, "c");
  return rowsOf(g);
}
const gummyPal = (a: string, b: string, c: string, d: string, e: string) => ({ a, b, c, d, e, h: "#ffffff" });
const GUMMY_SOLID = { x: 2, y: 20, w: 20, h: 8 };
export const GUMMY_RED = defineProp({ rows: gummyRows(false), pal: gummyPal("#ff98a0", "#f04858", "#c82840", "#901830", "#601020"), solid: GUMMY_SOLID });
export const GUMMY_GREEN = defineProp({ rows: gummyRows(true), pal: gummyPal("#c8ff90", "#78e050", "#48b038", "#2c8030", "#1c5020"), solid: GUMMY_SOLID });
export const GUMMY_YELLOW = defineProp({ rows: flipRows(gummyRows(true)), pal: gummyPal("#fff8b0", "#f8e050", "#e0b020", "#b08018", "#704c10"), solid: GUMMY_SOLID });
export const GUMMY_ORANGE = defineProp({ rows: gummyRows(false), pal: gummyPal("#ffd098", "#f89838", "#d86c20", "#a84c18", "#6c3010"), solid: GUMMY_SOLID });
export const GUMMY_BLUE = defineProp({ rows: flipRows(gummyRows(false)), pal: gummyPal("#c8e8ff", "#70b0f8", "#4078d8", "#2c50a8", "#1c3070"), solid: GUMMY_SOLID });

// ════════════════════════════════════════════════════════════════════════════
// Cupcakes
// ════════════════════════════════════════════════════════════════════════════
function cupcakeRows(seed: number): string[] {
  const W = 30, H = 36;
  const g = blank(W, H);
  // wrapper (trapezoid with pleats)
  for (let y = 22; y < H; y++) {
    const t = (y - 22) / (H - 23);
    const half = Math.round(12 - t * 3);
    for (let x = 15 - half; x < 15 + half; x++) {
      const rel = (x - (15 - half)) / (half * 2);
      const pleat = (x - (15 - half)) % 3 === 0;
      let c = pleat ? "q" : "p";
      if (rel < 0.15) c = pleat ? "p" : "o";
      if (rel > 0.8) c = pleat ? "Q" : "q";
      if (y === 22) c = "Q";
      put(g, x, y, c);
    }
  }
  // frosting swirl tiers (back to front, bottom to top)
  blobs(g, [
    { x: 15, y: 20, rx: 14, ry: 4.5 },
    { x: 15, y: 15, rx: 11.5, ry: 4.6 },
    { x: 15, y: 10, rx: 8.5, ry: 4.2 },
    { x: 15, y: 6, rx: 5, ry: 3.2 },
  ], "abcd", { crease: true, hi: 0.35 });
  // cherry
  ellipse(g, 15.5, 3, 2.6, 2.4, "r");
  put(g, 14, 2, "h"); put(g, 16, 4, "R"); put(g, 17, 3, "R");
  line(g, 16, 0, 18, -2, "k");
  put(g, 16, 0, "k"); put(g, 17, 0, "k");
  // sprinkles
  const R = rng(seed);
  const cols = "12345";
  for (let i = 0; i < 22; i++) {
    const x = Math.floor(2 + R() * 26), y = Math.floor(6 + R() * 17);
    const c = at(g, x, y);
    if (c === "a" || c === "b" || c === "c") {
      const s = cols[Math.floor(R() * cols.length)];
      put(g, x, y, s);
      if (R() < 0.5 && "abc".includes(at(g, x + 1, y))) put(g, x + 1, y, s);
    }
  }
  return rowsOf(g);
}
const SPRINK = { "1": "#f85888", "2": "#f8d838", "3": "#58c8f8", "4": "#70e080", "5": "#ffffff" };
const CHERRY = { r: "#f03848", R: "#a01830", h: "#ffc8c8", k: "#4c8030" };
export const CUPCAKE_PINK = defineProp({
  rows: cupcakeRows(3),
  pal: { a: "#fff0f8", b: "#fcb8d8", c: "#f088b8", d: "#c85890", o: "#c8ecff", p: "#80c4f8", q: "#5098e0", Q: "#3068b0", ...CHERRY, ...SPRINK },
  solid: { x: 3, y: 26, w: 26, h: 12 },
});
export const CUPCAKE_CHOCO = defineProp({
  rows: cupcakeRows(8),
  pal: { a: "#d0a078", b: "#a06c44", c: "#7c4c2c", d: "#583220", o: "#ffd8ec", p: "#f890c0", q: "#d86098", Q: "#a83c70", ...CHERRY, ...SPRINK, "5": "#fff4c8" },
  solid: { x: 3, y: 26, w: 26, h: 12 },
});
export const CUPCAKE_MINT = defineProp({
  rows: cupcakeRows(15),
  pal: { a: "#f0fff8", b: "#b0f0d0", c: "#78d4b0", d: "#48a888", o: "#fff8c8", p: "#f8d850", q: "#d8a828", Q: "#a87818", ...CHERRY, ...SPRINK, "4": "#c878f0" },
  solid: { x: 3, y: 26, w: 26, h: 12 },
});

// ════════════════════════════════════════════════════════════════════════════
// Donuts: one lying on the ground, one giant standing sculpture
// ════════════════════════════════════════════════════════════════════════════
function donutFlatRows(seed: number): string[] {
  const W = 26, H = 17;
  const g = blank(W, H);
  const cx = 13, cy = 8.5;
  // dough (with darker underside)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / 12.5, ny = (y + 0.5 - cy) / 8;
    if (nx * nx + ny * ny > 1) continue;
    put(g, x, y, ny > 0.45 ? "v" : ny > 0.1 ? "u" : "t");
  }
  // icing (wavy edge)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const wav = Math.sin(x * 1.3) * 0.06;
    const nx = (x + 0.5 - cx) / 11, ny = (y + 0.5 - (cy - 1.2)) / (6 + wav * 10);
    const r2 = nx * nx + ny * ny;
    if (r2 > 1) continue;
    const lit = litOf(nx, ny);
    put(g, x, y, lit > 0.45 && r2 > 0.3 ? "a" : lit < -0.55 ? "c" : "b");
  }
  // hole
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / 4, ny = (y + 0.5 - (cy - 1.5)) / 2.4;
    const r2 = nx * nx + ny * ny;
    if (r2 <= 1) put(g, x, y, ny < -0.2 ? "v" : ".");
  }
  const R = rng(seed);
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(2 + R() * 22), y = Math.floor(1 + R() * 12);
    if ("ab".includes(at(g, x, y))) put(g, x, y, "12345"[Math.floor(R() * 5)]);
  }
  return rowsOf(g);
}
const DOUGH = { t: "#f8c880", u: "#e09850", v: "#b06830" };
export const DONUT_PINK = defineProp({
  rows: donutFlatRows(4), pal: { a: "#ffd8ec", b: "#f890c0", c: "#d06098", ...DOUGH, ...SPRINK },
  solid: { x: 1, y: 6, w: 26, h: 12 },
});
export const DONUT_CHOCO = defineProp({
  rows: donutFlatRows(9), pal: { a: "#b08060", b: "#7c4c2c", c: "#5a3420", ...DOUGH, ...SPRINK },
  solid: { x: 1, y: 6, w: 26, h: 12 },
});
export const DONUT_WHITE = defineProp({
  rows: donutFlatRows(13), pal: { a: "#ffffff", b: "#f4f0f8", c: "#d0c8e0", ...DOUGH, ...SPRINK, "5": "#c878f0" },
  solid: { x: 1, y: 6, w: 26, h: 12 },
});

/** Giant upright donut on a little frosting pedestal. */
export const DONUT_GIANT = defineProp({
  rows: (() => {
    const W = 34, H = 38;
    const g = blank(W, H);
    const cx = 17, cy = 16, R = 16, r = 6;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const d = Math.hypot(dx, dy);
      if (d > R || d < r) continue;
      // torus tube shading: centre line at (R+r)/2
      const mid = (R + r) / 2, half = (R - r) / 2;
      const off = (d - mid) / half; // -1 inner .. 1 outer
      const ox = (dx / d) * off, oy = (dy / d) * off;
      const lit = -(ox * 0.55 + oy * 0.85);
      // icing covers the top part, with drips
      const drip = [0, 2, 1, 3, 0, 1, 2, 0][Math.floor(x / 4) % 8];
      const icing = dy < 2 + drip - Math.abs(dx) * 0.08;
      if (icing) put(g, x, y, lit > 0.4 ? "a" : lit < -0.45 ? "c" : "b");
      else put(g, x, y, lit > 0.4 ? "t" : lit < -0.45 ? "v" : "u");
    }
    const R2 = rng(21);
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(R2() * W), y = Math.floor(R2() * 20);
      if ("ab".includes(at(g, x, y)) && "ab".includes(at(g, x + 1, y))) {
        const s = "12345"[Math.floor(R2() * 5)];
        put(g, x, y, s); if (R2() < 0.5) put(g, x + 1, y, s);
      }
    }
    // pedestal (frosting puff)
    blobs(g, [{ x: 17, y: 34, rx: 10, ry: 3.6 }], "efgk", { crease: false });
    rect(g, 13, 31, 8, 1, "f");
    return rowsOf(g);
  })(),
  pal: {
    a: "#ffd8ec", b: "#f880b8", c: "#c85090", ...DOUGH,
    e: "#ffffff", f: "#f4eef8", g: "#d4c8e4", k: "#a898c0", ...SPRINK,
  },
  solid: { x: 6, y: 30, w: 24, h: 10 },
});

// ════════════════════════════════════════════════════════════════════════════
// Cotton candy: bushes and trees (cloud on a striped paper cone)
// ════════════════════════════════════════════════════════════════════════════
const COTTON_PINK = { a: "#fff4fa", b: "#fcc8e4", c: "#f09cc8", d: "#cc6ca4" };
const COTTON_BLUE = { a: "#f4fcff", b: "#c4e4fc", c: "#94c4f0", d: "#6c98d4" };
const COTTON_LILAC = { a: "#faf0ff", b: "#e0c8fc", c: "#bc98f0", d: "#9068cc" };
function cottonBushRows(v: number): string[] {
  const g = blank(30, 20);
  blobs(g, v ? [
    { x: 15, y: 13, rx: 14, ry: 6.5 },
    { x: 8, y: 9, rx: 7, ry: 6 },
    { x: 20, y: 8, rx: 8, ry: 6.5 },
    { x: 13, y: 6, rx: 5.5, ry: 5 },
  ] : [
    { x: 15, y: 13, rx: 14, ry: 6.5 },
    { x: 10, y: 8, rx: 8, ry: 6.5 },
    { x: 21, y: 9, rx: 7, ry: 6 },
  ], "abcd", { hi: 0.35 });
  return rowsOf(g);
}
export const COTTON_BUSH = defineProp({ rows: cottonBushRows(0), pal: COTTON_PINK });
export const COTTON_BUSH_BLUE = defineProp({ rows: cottonBushRows(1), pal: COTTON_BLUE });
export const COTTON_BUSH_LILAC = defineProp({ rows: cottonBushRows(1), pal: COTTON_LILAC });

function cottonTreeRows(v: number): string[] {
  const W = 40, H = 54;
  const g = blank(W, H);
  // paper cone stem (striped)
  for (let y = 26; y < H; y++) {
    const half = 1 + Math.round((H - y) * 0.06);
    for (let x = 20 - half - 1; x <= 20 + half; x++) {
      const rel = (x - (20 - half - 1)) / (half * 2 + 1);
      const stripe = Math.floor((y + x * 0.5) / 3) % 2 === 0;
      let c = stripe ? "s" : "w";
      if (rel > 0.65) c = stripe ? "S" : "W";
      put(g, x, y, c);
    }
  }
  const j = v ? 2 : 0;
  blobs(g, [
    { x: 20, y: 20, rx: 19, ry: 10 },
    { x: 10 + j, y: 15, rx: 9, ry: 8 },
    { x: 30 - j, y: 14, rx: 9.5, ry: 8.5 },
    { x: 20, y: 9, rx: 11, ry: 8.5 },
    { x: 14, y: 22, rx: 8, ry: 5 },
    { x: 27, y: 23, rx: 8, ry: 5 },
  ], "abcd", { hi: 0.35 });
  return rowsOf(g);
}
export const COTTON_TREE = defineProp({
  rows: cottonTreeRows(0), pal: { ...COTTON_PINK, s: "#68b8f8", S: "#3c88d0", w: "#ffffff", W: "#d0d4e8" },
  solid: { x: 15, y: 44, w: 12, h: 10 },
});
export const COTTON_TREE_BLUE = defineProp({
  rows: cottonTreeRows(1), pal: { ...COTTON_BLUE, s: "#f86ca8", S: "#c83c80", w: "#ffffff", W: "#d0d4e8" },
  solid: { x: 15, y: 44, w: 12, h: 10 },
});
export const COTTON_TREE_LILAC = defineProp({
  rows: cottonTreeRows(0), pal: { ...COTTON_LILAC, s: "#f8d040", S: "#c8a018", w: "#ffffff", W: "#d0d4e8" },
  solid: { x: 15, y: 44, w: 12, h: 10 },
});

// ════════════════════════════════════════════════════════════════════════════
// Giant ice cream cones stuck in the ground + ice cream cart
// ════════════════════════════════════════════════════════════════════════════
function coneRows(scoops: number): string[] {
  const W = 22, H = 40;
  const g = blank(W, H);
  // waffle cone (point down)
  for (let y = 18; y < H; y++) {
    const half = Math.max(1, Math.round((H - y) * 0.42));
    for (let x = 11 - half; x < 11 + half; x++) {
      const k = (x + y) % 4 === 0 || (x - y + 40) % 4 === 0;
      const rel = (x - (11 - half)) / (half * 2);
      let c = k ? "l" : "k";
      if (rel > 0.65) c = k ? "m" : "l";
      if (rel < 0.2 && !k) c = "j";
      put(g, x, y, c);
    }
  }
  const list = scoops === 2
    ? [{ x: 11, y: 17, rx: 9.5, ry: 5 }, { x: 11, y: 9.5, rx: 8, ry: 6.5 }]
    : [{ x: 11, y: 15, rx: 9.5, ry: 6.5 }];
  // lower scoop: ramp efgh, upper: abcd
  blobs(g, [list[0]], "efgh", { crease: false, hi: 0.35 });
  if (scoops === 2) blobs(g, [list[1]], "abcd", { crease: false, hi: 0.35 });
  // drips on the cone
  for (const [x, len] of [[5, 3], [9, 2], [14, 4], [16, 2]] as const) {
    for (let k = 0; k < len; k++) if (at(g, x, 20 + k) !== ".") put(g, x, 20 + k, "f");
    put(g, x, 20 + len, "g");
  }
  // wafer stick + cherry on top
  const top = scoops === 2 ? 3 : 8;
  rect(g, 14, top - 5, 3, 6, "n"); put(g, 14, top - 5, "N"); put(g, 16, top - 1, "o");
  ellipse(g, 9.5, top, 2.2, 2, "r"); put(g, 8, top - 1, "h");
  return rowsOf(g);
}
const CONE = { j: "#f8d898", k: "#e0a858", l: "#b87838", m: "#8c5428", n: "#f8e8b8", N: "#fff8e0", o: "#d0a868", r: "#f03848", h: "#ffc8c8" };
export const ICECREAM_STRAWBERRY = defineProp({
  rows: coneRows(2),
  pal: { ...CONE, a: "#ffe0ec", b: "#f8a0c4", c: "#e070a0", d: "#b04878", e: "#fffcf0", f: "#fff0d0", g: "#e0cca0", h: "#ffffff" },
  solid: { x: 5, y: 34, w: 14, h: 8 },
});
export const ICECREAM_MINT = defineProp({
  rows: coneRows(2),
  pal: { ...CONE, a: "#e8fff4", b: "#a8ecc8", c: "#70d0a8", d: "#44a080", e: "#c89870", f: "#9c6840", g: "#6c4428", h: "#ffffff" },
  solid: { x: 5, y: 34, w: 14, h: 8 },
});
export const ICECREAM_BLUE = defineProp({
  rows: coneRows(1),
  pal: { ...CONE, e: "#e0f4ff", f: "#98d0f8", g: "#60a0e0", h: "#3c70b8" },
  solid: { x: 5, y: 34, w: 14, h: 8 },
});

/** Ice cream cart with striped umbrella. */
export const ICECREAM_CART = defineProp({
  rows: (() => {
    const W = 36, H = 44;
    const g = blank(W, H);
    // pole
    rect(g, 17, 10, 2, 22, "w"); rect(g, 18, 10, 1, 22, "W");
    // umbrella canopy (shallow dome, scalloped edge)
    for (let y = 0; y < 14; y++) for (let x = 0; x < W; x++) {
      const nx = (x + 0.5 - 18) / 17.5, ny = (y + 0.5 - 12) / 11;
      if (nx * nx + ny * ny > 1 || y > 11) continue;
      const seg = Math.floor((Math.atan2(y + 0.5 - 20, x + 0.5 - 18) + Math.PI) / (Math.PI / 8)) % 2;
      const lit = nx < -0.35 ? 0 : nx > 0.45 ? 2 : 1;
      put(g, x, y, (seg ? "pPq" : "wxy")[lit]);
    }
    for (let x = 1; x < W - 1; x++) {
      const seg = Math.floor((x - 1) / 4) % 2;
      if ((x - 1) % 4 !== 3) put(g, x, 12, seg ? "q" : "y");
    }
    put(g, 17, -0, "P"); put(g, 18, 0, "P");
    // cart box
    for (let y = 24; y < 38; y++) for (let x = 4; x < 32; x++) {
      let c = "B";
      if (y < 26) c = y === 24 ? "A" : "a";
      else if (x < 6) c = "a";
      else if (x > 29) c = "C";
      else if (y > 35) c = "C";
      put(g, x, y, c);
    }
    // stripes on cart front + label heart
    for (let x = 6; x < 30; x++) if (Math.floor(x / 3) % 2 === 0) for (let y = 29; y < 32; y++) put(g, x, y, "p");
    stamp(g, 16, 28, [".r.r.", "rrrrr", ".rrr.", "..r.."]);
    // scoop tubs on top
    ellipse(g, 9, 22.5, 3.3, 2.2, "1"); put(g, 8, 21, "5");
    ellipse(g, 15, 22.5, 3.3, 2.2, "3"); put(g, 14, 21, "5");
    ellipse(g, 24, 22.5, 3.3, 2.2, "4"); put(g, 23, 21, "5");
    // wheels
    for (const wx of [9, 26]) {
      ellipse(g, wx, 39.5, 3.5, 3.5, "k");
      ellipse(g, wx, 39.5, 1.6, 1.6, "K");
      put(g, wx - 2, 37, "K");
    }
    return rowsOf(g);
  })(),
  pal: {
    w: "#f0f0f8", W: "#b0b0c8",
    p: "#f86ca8", P: "#ffb0d4", q: "#c83c80", x: "#ffffff", y: "#d8d0e8",
    A: "#ffffff", a: "#fff8e8", B: "#f4ead0", C: "#d0c0a0",
    r: "#e83848", k: "#5a4868", K: "#c8c0d8",
    ...SPRINK, "1": "#f8a0c4", "3": "#a8ecc8", "4": "#c89870", "5": "#ffffff",
  },
  solid: { x: 4, y: 30, w: 30, h: 14 },
});

// ════════════════════════════════════════════════════════════════════════════
// Marshmallows and small sweets
// ════════════════════════════════════════════════════════════════════════════
function mallowRows(stack: number): string[] {
  const W = 12, unit = 8;
  const H = unit * stack + 4;
  const g = blank(W, H);
  for (let s = stack - 1; s >= 0; s--) {
    const top = H - (s + 1) * unit - 3 + (s === 0 ? 0 : 1);
    const letter = s % 2 === 0 ? ["a", "b", "c", "d"] : ["e", "f", "g", "h"];
    for (let y = top; y < top + unit + 3; y++) for (let x = 0; x < W; x++) {
      const nx = (x + 0.5 - 6) / 6;
      if (Math.abs(nx) > 1) continue;
      const edge = Math.abs(nx) > 0.83 && (y === top || y === top + unit + 2);
      if (edge) continue;
      let c = letter[1];
      if (y < top + 3) c = y === top ? letter[1] : letter[0]; // top face
      else if (nx < -0.5) c = letter[0];
      else if (nx > 0.5) c = letter[2];
      if (y === top + 3) c = letter[2];
      if (y >= top + unit + 1 && nx > -0.3) c = letter[3];
      put(g, x, y, c);
    }
  }
  return rowsOf(g);
}
const MALLOW = { a: "#ffffff", b: "#f8f0f8", c: "#dcd0e4", d: "#c0b0d0", e: "#ffe0f0", f: "#fcc0dc", g: "#e898c0", h: "#c87098" };
export const MARSHMALLOW = defineProp({ rows: mallowRows(1), pal: MALLOW, solid: { x: 0, y: 4, w: 14, h: 10 } });
export const MARSHMALLOW_STACK = defineProp({ rows: mallowRows(3), pal: MALLOW, solid: { x: 0, y: 20, w: 14, h: 10 } });
export const MARSHMALLOW_PINK = defineProp({ rows: mallowRows(2), pal: { ...MALLOW, a: "#ffe0f0", b: "#fcc0dc", c: "#e898c0", d: "#c87098", e: "#ffffff", f: "#f8f0f8", g: "#dcd0e4", h: "#c0b0d0" }, solid: { x: 0, y: 12, w: 14, h: 10 } });

/** Gumdrop (sugar-coated): little cone with sparkles. */
function gumdropRows(): string[] {
  const g = blank(10, 9);
  for (let y = 0; y < 9; y++) for (let x = 0; x < 10; x++) {
    const nx = (x + 0.5 - 5) / 5, ny = (y + 0.5 - 8) / 8;
    if (nx * nx + ny * ny > 1 || y > 8) continue;
    const lit = litOf(nx, ny * 0.8);
    put(g, x, y, lit > 0.5 ? "a" : lit < -0.15 ? "c" : "b");
  }
  rect(g, 0, 8, 10, 1, "d");
  put(g, 3, 2, "w"); put(g, 6, 5, "w"); put(g, 2, 5, "a");
  return rowsOf(g);
}
export const GUMDROP_RED = defineProp({ rows: gumdropRows(), pal: { a: "#ffa0b0", b: "#f04860", c: "#b82840", d: "#801830", w: "#ffffff" }, solid: { x: 0, y: 4, w: 12, h: 7 } });
export const GUMDROP_GREEN = defineProp({ rows: gumdropRows(), pal: { a: "#c8ffa0", b: "#68d048", c: "#389030", d: "#246824", w: "#ffffff" }, solid: { x: 0, y: 4, w: 12, h: 7 } });
export const GUMDROP_PURPLE = defineProp({ rows: gumdropRows(), pal: { a: "#e8c8ff", b: "#a868e8", c: "#7040b8", d: "#502c88", w: "#ffffff" }, solid: { x: 0, y: 4, w: 12, h: 7 } });
export const GUMDROP_YELLOW = defineProp({ rows: gumdropRows(), pal: { a: "#fff8b8", b: "#f8d838", c: "#c8a018", d: "#906c10", w: "#ffffff" }, solid: { x: 0, y: 4, w: 12, h: 7 } });

/** Wrapped bonbon lying on the ground (flat). */
function wrapRows(): string[] {
  return [
    "e.....aab.....e",
    "fe..aabbbbc..ef",
    "ffeabbbsbbbcef.",
    "fefbbbbbbbbcfef",
    "ffeabbbbbbccef.",
    "fe..bccccc...ef",
    "e....ccd......e",
  ].map((r) => r.slice(0, 15));
}
export const BONBON_RED = defineProp({ rows: wrapRows(), pal: { a: "#ffb0b8", b: "#f04858", c: "#b82840", d: "#801830", s: "#ffffff", e: "#ffe0e4", f: "#f8a8b4" }, flat: true });
export const BONBON_BLUE = defineProp({ rows: wrapRows(), pal: { a: "#c8e4ff", b: "#5898f0", c: "#3060c0", d: "#203c88", s: "#ffffff", e: "#e0f0ff", f: "#a8ccf8" }, flat: true });
export const BONBON_YELLOW = defineProp({ rows: wrapRows(), pal: { a: "#fff8c8", b: "#f8d040", c: "#c89818", d: "#8c6810", s: "#ffffff", e: "#fffce0", f: "#f8e898" }, flat: true });

/** Scatter of sprinkles on the floor (flat). */
export const SPRINKLES = defineProp({
  rows: [
    "1...........3...",
    "1....4..........",
    "..........22....",
    "..5.............",
    "........1.....4.",
    "3.............4.",
    "3....22.........",
    "...........5....",
    ".4.......3......",
    "..4......3...11.",
  ],
  pal: { ...SPRINK, "5": "#c878f0" },
  flat: true, outline: false,
});

/** Big chocolate-chip cookie lying flat on the ground. */
export const COOKIE_FLAT = defineProp({
  rows: (() => {
    const g = blank(22, 15);
    for (let y = 0; y < 15; y++) for (let x = 0; x < 22; x++) {
      const nx = (x + 0.5 - 11) / 10.8, ny = (y + 0.5 - 7.5) / 7.3;
      const r2 = nx * nx + ny * ny;
      if (r2 > 1) continue;
      const lit = litOf(nx, ny);
      put(g, x, y, r2 > 0.72 && lit < -0.1 ? "c" : lit > 0.5 && r2 > 0.35 ? "a" : "b");
    }
    for (const [x, y] of [[5, 4], [11, 3], [15, 6], [8, 8], [13, 10], [4, 9], [17, 9]]) {
      stamp(g, x, y, ["kK", "kk"]);
    }
    for (const [x, y] of [[9, 5], [14, 4], [6, 11]]) put(g, x, y, "c");
    return rowsOf(g);
  })(),
  pal: { a: "#f8d8a0", b: "#e0a860", c: "#b87c40", k: "#4c2c1c", K: "#7c4c2c" },
  flat: true,
});

/** Cereal ring bobbing in the milk river (flat on an animated tile). */
function cerealRows(dy: number, c: string): string[] {
  const g = blank(11, 8);
  for (let y = 0; y < 7; y++) for (let x = 0; x < 11; x++) {
    const nx = (x + 0.5 - 5.5) / 5.4, ny = (y + 0.5 - 3.5) / 3.4;
    const r2 = nx * nx + ny * ny;
    if (r2 > 1) continue;
    put(g, x, y + dy, r2 < 0.2 ? (ny < 0 ? "m" : "n") : ny < -0.25 ? c.toUpperCase() : c);
  }
  return rowsOf(g);
}
const CEREAL_PAL = { m: "#c4b2e2", n: "#e6dcf4", r: "#e83848", R: "#ff9090", y: "#e8b818", Y: "#fff080", g: "#48b850", G: "#a8f090", p: "#a050d8", P: "#d8a8ff" };
export const CEREAL_RED = defineProp({ frames: [cerealRows(0, "r"), cerealRows(1, "r")], fps: 1.5, pal: CEREAL_PAL, flat: true });
export const CEREAL_YELLOW = defineProp({ frames: [cerealRows(1, "y"), cerealRows(0, "y")], fps: 1.5, pal: CEREAL_PAL, flat: true });
export const CEREAL_GREEN = defineProp({ frames: [cerealRows(0, "g"), cerealRows(1, "g")], fps: 1.2, pal: CEREAL_PAL, flat: true });
export const CEREAL_PURPLE = defineProp({ frames: [cerealRows(1, "p"), cerealRows(0, "p")], fps: 1.2, pal: CEREAL_PAL, flat: true });

/** Chocolate chunk rock. */
export const CHOCO_ROCK = defineProp({
  rows: (() => {
    const g = blank(16, 11);
    blobs(g, [{ x: 7, y: 6, rx: 6.5, ry: 4.5 }, { x: 11, y: 7, rx: 4.5, ry: 3.5 }], "abcd");
    stamp(g, 3, 3, ["e.", ".e"]);
    return rowsOf(g);
  })(),
  pal: { a: "#b88458", b: "#8c5834", c: "#6c4024", d: "#4c2c1c", e: "#d8a878" },
});

/** Macaron tower (3 macarons). */
export const MACARONS = defineProp({
  rows: (() => {
    const g = blank(12, 16);
    const layer = (y: number, L: string) => {
      ellipse(g, 6, y + 2, 6, 2.2, L[1]);
      ellipse(g, 6, y + 1.5, 4.8, 1.4, L[0]);
      rect(g, 1, y + 3, 10, 1, "f");
      ellipse(g, 6, y + 5, 6, 1.8, L[2]);
    };
    layer(9, "ABC");
    layer(4.5, "DEF");
    layer(0, "GHI");
    return rowsOf(g);
  })(),
  pal: {
    A: "#d0f8e0", B: "#88dcb0", C: "#58b088",
    D: "#ffe0ec", E: "#f8a8c8", F: "#d07898",
    G: "#fff4c0", H: "#f8d870", I: "#c8a040",
    f: "#fff8f0",
  },
  solid: { x: 0, y: 8, w: 14, h: 10 },
});

// ════════════════════════════════════════════════════════════════════════════
// Chocolate bar bench on pretzel legs
// ════════════════════════════════════════════════════════════════════════════
export const CHOCO_BENCH = defineProp({
  rows: (() => {
    const g = blank(30, 15);
    // back rest (chocolate bar standing)
    for (let y = 0; y < 7; y++) for (let x = 1; x < 29; x++) {
      const bx = (x - 1) % 7, by = y;
      let c = "b";
      if (bx === 6 || by === 6) c = "d";
      else if (bx === 0 || by === 0) c = "a";
      else if (bx === 5 || by === 5) c = "c";
      put(g, x, y, c);
    }
    // seat
    for (let y = 7; y < 11; y++) for (let x = 0; x < 30; x++) {
      put(g, x, y, y === 7 ? "a" : y === 10 ? "d" : (x % 7 === 6 ? "c" : "b"));
    }
    // pretzel legs
    for (const lx of [2, 25]) {
      stamp(g, lx, 11, ["pp.", "pq.", "qp.", "pq."]);
      put(g, lx + 1, 12, "s");
    }
    return rowsOf(g);
  })(),
  pal: { a: "#b0784c", b: "#8c5834", c: "#704428", d: "#4c2c1c", p: "#c88848", q: "#9c6030", s: "#ffffff" },
  solid: { x: 0, y: 7, w: 32, h: 9 },
});

// ════════════════════════════════════════════════════════════════════════════
// Chocolate fountain (animated): pink frosting basin, two wafer bowls and
// curtains of molten chocolate.
// ════════════════════════════════════════════════════════════════════════════
function fountainRows(f: number): string[] {
  const W = 62, H = 54, cx = 31;
  const g = blank(W, H);
  const bcY = 43;
  // basin rim (frosting)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / 30, ny = (y + 0.5 - bcY) / 10;
    const r2 = nx * nx + ny * ny;
    if (r2 > 1) continue;
    const lit = litOf(nx, ny);
    put(g, x, y, lit > 0.5 ? "p" : lit < -0.4 ? "R" : "r");
  }
  // basin outer wall below the rim (side of the bowl)
  for (let y = bcY; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / 30, ny = (y + 0.5 - bcY) / 10;
    const ny2 = (y + 0.5 - (bcY + 2)) / 9;
    if (nx * nx + ny2 * ny2 <= 1 && !(nx * nx + ny * ny <= 1)) {
      put(g, x, y, nx < -0.5 ? "s" : nx > 0.5 ? "u" : "S");
    }
  }
  // icing drips on the wall
  for (let x = 3; x < W - 3; x++) {
    const nx = (x + 0.5 - cx) / 30;
    const yb = Math.round(bcY + 10 * Math.sqrt(Math.max(0, 1 - nx * nx)));
    const len = [1, 2, 0, 3, 1, 0, 2, 1][x % 8];
    for (let k = 0; k < len; k++) if (at(g, x, yb + k) !== ".") put(g, x, yb + k, "r");
  }
  // pool of chocolate
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - cx) / 26.5, ny = (y + 0.5 - (bcY - 0.5)) / 7.6;
    const r2 = nx * nx + ny * ny;
    if (r2 > 1) continue;
    let c = ny < -0.6 ? "d" : "b";
    // ripples rings (animated)
    const rr = Math.sqrt(nx * nx * 1.0 + ny * ny * 1.0);
    const ring = (rr * 6 - f * 0.7 + 6) % 2;
    if (rr > 0.45 && ring < 0.35 && ny > -0.6) c = "a";
    put(g, x, y, c);
  }
  // column (stainless steel)
  for (let y = 12; y < bcY; y++) for (let x = cx - 2; x < cx + 2; x++) {
    const rel = x - (cx - 2);
    put(g, x, y, rel === 0 ? "j" : rel === 3 ? "m" : rel === 1 ? "k" : "l");
  }
  // a sheet of chocolate falling from a bowl rim, flaring outwards
  const curtain = (rx0: number, rx1: number, y0: number, y1: number) => {
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / (y1 - y0);
      const half = rx0 + (rx1 - rx0) * Math.sqrt(t);
      for (let x = Math.floor(cx - half); x < Math.ceil(cx + half); x++) {
        const nx = (x + 0.5 - cx) / half;
        if (Math.abs(nx) > 1) continue;
        let c = (x + 64) % 3 === 0 ? "c" : "b";
        if ((y - f * 3 + ((x * 7) % 11) + 99) % 9 < 2) c = "a";
        if (nx < -0.86) c = "a";
        if (nx > 0.82) c = "c";
        put(g, x, y, c);
      }
    }
    // splash where it lands (animated)
    const half = rx1;
    for (let x = Math.floor(cx - half) - 1; x <= Math.ceil(cx + half); x++) {
      if ((x + f) % 3 === 0) put(g, x, y1, "a");
      if ((x + f * 2) % 5 === 0) put(g, x, y1 - 1, "e");
    }
  };
  const bowl = (cyB: number, rx: number, ry: number) => {
    // chocolate surface on top, steel lip + underside
    for (let y = Math.floor(cyB - ry - 1); y <= Math.ceil(cyB + ry + 3); y++) for (let x = 0; x < W; x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cyB) / ry;
      const ny2 = (y + 0.5 - (cyB + 2)) / ry;
      const inTop = nx * nx + ny * ny <= 1;
      const inBot = nx * nx + ny2 * ny2 <= 1 && y >= cyB;
      if (!inTop && !inBot) continue;
      let c: string;
      if (inTop) {
        const r2 = nx * nx + ny * ny;
        c = r2 > 0.7 ? (ny < 0 ? "j" : "k") : ny < -0.3 ? "a" : "b";
      } else c = nx < -0.6 ? "k" : nx > 0.5 ? "m" : "l";
      put(g, x, y, c);
    }
  };
  curtain(14, 18, 27, bcY - 1);
  bowl(24, 15, 4);
  for (let x = cx - 10; x <= cx + 10; x++) if (at(g, x, 24) === "b" && (x + f) % 4 === 0) put(g, x, 24, "a");
  curtain(8, 11, 13, 23);
  bowl(11.5, 9, 3);
  // top chocolate dome + bubbling (animated)
  ellipse(g, cx, 7.5, 3.8, 3.4, "b");
  put(g, cx - 2, 5, "a"); put(g, cx - 1, 5, "a"); put(g, cx - 2, 6, "a");
  put(g, cx + 2, 9, "c"); put(g, cx + 1, 10, "c");
  if (f % 2 === 0) { put(g, cx, 3, "b"); put(g, cx, 2, "a"); }
  else { put(g, cx - 1, 3, "b"); put(g, cx + 1, 3, "b"); }
  // strawberries floating in the pool
  stamp(g, cx - 19, bcY + 1, [".g.", "rrr", "rhr", ".r."]);
  stamp(g, cx + 16, bcY - 1, [".g.", "rrr", "rrh", ".r."]);
  return rowsOf(g);
}
export const CHOCO_FOUNTAIN = defineProp({
  frames: [0, 1, 2, 3].map(fountainRows),
  fps: 5,
  pal: {
    a: "#e0a070", b: "#b06838", c: "#7c3c1c", d: "#8c4c28", e: "#fff0d8",
    p: "#ffe0f0", r: "#f8a8cc", R: "#d878a8", s: "#e890bc", S: "#d070a0", u: "#a84c80",
    j: "#ffffff", k: "#dce4f0", l: "#a8b4cc", m: "#7c88a0",
    g: "#58b040", h: "#ffd0d0",
  },
  solid: { x: 2, y: 36, w: 62, h: 20 },
});

// ════════════════════════════════════════════════════════════════════════════
// Gingerbread house: icing trims, gumdrop roof, candy cane posts, chocolate
// door, sugar-glass windows and a peppermint chimney.
// ════════════════════════════════════════════════════════════════════════════
function gingerRows(v: number): string[] {
  const W = 64, H = 62;
  const g = blank(W, H);
  const wallTop = 32;
  // chimney (behind the roof)
  for (let y = 0; y < 16; y++) for (let x = 45; x < 52; x++) {
    const stripe = Math.floor((y + x) / 2) % 2 === 0;
    put(g, x, y, x === 51 ? (stripe ? "T" : "Y") : stripe ? "t" : "y");
  }
  rect(g, 44, 0, 9, 2, "w"); rect(g, 44, 2, 9, 1, "W");
  // walls
  for (let y = wallTop; y < H; y++) for (let x = 3; x < W - 3; x++) {
    let c = "g";
    if (y < wallTop + 2) c = "G";
    else if (x < 6) c = "h";
    else if (x > W - 8) c = "G";
    else if ((x * 7 + y * 13) % 29 === 0) c = "h";
    else if ((x * 11 + y * 5) % 31 === 0) c = "G";
    put(g, x, y, c);
  }
  // icing wiggle line mid wall + bottom
  for (let x = 3; x < W - 3; x++) {
    put(g, x, 50 + ((x % 4) < 2 ? 0 : 1), "w");
    put(g, x, H - 2, "W"); put(g, x, H - 1, "G");
  }
  // candy cane corner posts
  for (const px of [3, W - 6]) for (let y = wallTop; y < H; y++) for (let x = px; x < px + 3; x++) {
    const stripe = Math.floor((y + x) / 2) % 2 === 0;
    const rel = x - px;
    put(g, x, y, stripe ? (rel === 2 ? "T" : "t") : (rel === 2 ? "Y" : "y"));
  }
  // door: chocolate bar with an arch
  const dx0 = 26, dx1 = 38;
  for (let y = 40; y < H - 1; y++) for (let x = dx0; x < dx1; x++) {
    const nx = (x + 0.5 - 32) / 6, ny = (y + 0.5 - 46) / 6;
    if (y < 46 && nx * nx + ny * ny > 1) continue;
    put(g, x, y, "W");
  }
  for (let y = 41; y < H - 1; y++) for (let x = dx0 + 1; x < dx1 - 1; x++) {
    const nx = (x + 0.5 - 32) / 5, ny = (y + 0.5 - 46) / 5;
    if (y < 46 && nx * nx + ny * ny > 1) continue;
    const bx = (x - dx0 - 1) % 5, by = (y - 41) % 5;
    put(g, x, y, bx === 4 || by === 4 ? "D" : bx === 0 || by === 0 ? "c" : "C");
  }
  put(g, 35, 52, "y"); put(g, 35, 53, "Y");
  // windows (round sugar-glass with icing frame + cross)
  for (const wx of [15, 49]) {
    ellipse(g, wx, 42, 6, 6, "w");
    ellipse(g, wx, 42, 4.6, 4.6, "q");
    for (let y = 37; y < 47; y++) for (let x = wx - 5; x < wx + 5; x++) {
      if (at(g, x, y) !== "q") continue;
      const nx = x + 0.5 - wx, ny = y + 0.5 - 42;
      if (nx < 0 && ny < 0 && nx + ny > -4) put(g, x, y, "Q");
      else if (nx > 1 && ny > 1) put(g, x, y, "z");
    }
    rect(g, wx - 1, 37, 1, 10, "w"); rect(g, wx - 5, 41, 10, 1, "w");
    // gumdrop flower box
    rect(g, wx - 6, 48, 12, 2, "w");
    for (let k = 0; k < 4; k++) {
      const c = "1234"[(k + (wx > 30 ? 2 : 0)) % 4];
      stamp(g, wx - 6 + k * 3, 46, [`.${c}.`, `${c}${c}${c}`]);
    }
  }
  // roof: trapezoid with candy-button shingles
  const roofTop = 6, roofBot = 34;
  for (let y = roofTop; y <= roofBot; y++) {
    const t = (y - roofTop) / (roofBot - roofTop);
    const x0 = Math.round(10 - t * 10), x1 = Math.round(W - 11 + t * 10);
    for (let x = x0; x <= x1; x++) {
      const row = Math.floor((y - roofTop) / 4);
      const sx = (x + (row % 2) * 3) % 6, sy = (y - roofTop) % 4;
      let c = "e";
      if (sy === 3) c = "f";
      else if (sy === 0 && sx < 4) c = "E";
      else if (sx === 5) c = "f";
      if (x <= x0 + 1) c = "E";
      if (x >= x1 - 1) c = "F";
      put(g, x, y, c);
    }
  }
  // roof ridge (icing) and eave with drips
  for (let x = 10; x <= W - 11; x++) { put(g, x, roofTop - 1, "w"); put(g, x, roofTop, "w"); put(g, x, roofTop + 1, "W"); }
  for (let x = 0; x < W; x++) {
    put(g, x, roofBot, "w"); put(g, x, roofBot + 1, "w");
    const len = [0, 2, 1, 3, 0, 1, 4, 1, 0, 2][x % 10];
    for (let k = 0; k < len; k++) put(g, x, roofBot + 2 + k, k === len - 1 ? "W" : "w");
  }
  // gumdrops on the roof
  const R = rng(v * 7 + 3);
  for (let i = 0; i < 9; i++) {
    const y = Math.floor(roofTop + 4 + R() * 22);
    const t = (y - roofTop) / (roofBot - roofTop);
    const x0 = 10 - t * 10 + 3, x1 = W - 11 + t * 10 - 4;
    const x = Math.floor(x0 + R() * (x1 - x0));
    const c = "1234"[i % 4];
    const d = "5678"[i % 4];
    stamp(g, x, y, [`.${c}${c}${c}.`, `${c}w${c}${c}${d}`, `${c}${c}${c}${d}${d}`, `.${d}${d}${d}.`, ".fff."]);
  }
  return rowsOf(g);
}
const GINGER_BASE = {
  g: "#c87c40", G: "#9c5a2c", h: "#e09c5c",
  w: "#ffffff", W: "#d8d0e4",
  t: "#e83848", T: "#a81830", y: "#ffffff", Y: "#d0c4d8",
  C: "#7c4428", c: "#a06438", D: "#4c2818",
  q: "#f8e070", Q: "#fff8d0", z: "#e0a838",
  "1": "#f04860", "2": "#58c850", "3": "#f8c838", "4": "#a868e8",
  "5": "#a82840", "6": "#2c8838", "7": "#c08818", "8": "#7040b8",
};
export const GINGER_HOUSE = defineProp({
  rows: gingerRows(0),
  pal: { ...GINGER_BASE, E: "#ffc8e0", e: "#f890c0", f: "#d05c98", F: "#b04880" },
  solid: { x: 2, y: 36, w: 64, h: 28 },
});
export const GINGER_HOUSE_B = defineProp({
  rows: gingerRows(1),
  pal: { ...GINGER_BASE, E: "#b8f0d8", e: "#68d0a8", f: "#3ca080", F: "#2c8068", "2": "#f89838", "6": "#c06020" },
  solid: { x: 2, y: 36, w: 64, h: 28 },
});
export const GINGER_HOUSE_C = defineProp({
  rows: gingerRows(2),
  pal: { ...GINGER_BASE, E: "#c09068", e: "#8c5834", f: "#6c4024", F: "#4c2c1c" },
  solid: { x: 2, y: 36, w: 64, h: 28 },
});

// ════════════════════════════════════════════════════════════════════════════
// Gingerbread man statue (little landmark) and a wafer signpost
// ════════════════════════════════════════════════════════════════════════════
export const GINGERBREAD_MAN = defineProp({
  rows: [
    "......aaaa......",
    ".....abbbbb.....",
    "....abwbbwbc....",
    "....abbbbbbc....",
    "....abwwwwbc....",
    ".....bbbbbc.....",
    ".aabbbbbbbbbbcc.",
    "abwwbbbrbbbwwbbc",
    ".bbbbbbbbbbbbbc.",
    ".....bbybbc.....",
    ".....bbbbbc.....",
    "....abbrbbbc....",
    "....abbbcbbc....",
    "...abbc..bbbc...",
    "...abwc..bwbc...",
    "..abbbc..bbbbc..",
    "..aawwc..bwwcc..",
  ],
  pal: { a: "#e09c5c", b: "#c87c40", c: "#9c5a2c", w: "#ffffff", r: "#f04860", y: "#58c850" },
  solid: { x: 2, y: 12, w: 14, h: 7 },
});

export const WAFER_SIGN = defineProp({
  rows: (() => {
    const g = blank(18, 20);
    for (let y = 0; y < 11; y++) for (let x = 0; x < 18; x++) {
      const bx = x % 3, by = y % 3;
      let c = bx === 2 || by === 2 ? "c" : "b";
      if (y === 0 || x === 0) c = "a";
      if (y === 10 || x === 17) c = "d";
      put(g, x, y, c);
    }
    // heart in icing
    stamp(g, 6, 3, [".w.w.", "wwwww", ".www.", "..w.."]);
    rect(g, 8, 11, 2, 9, "p"); put(g, 9, 11, "q"); put(g, 9, 14, "q"); put(g, 9, 17, "q");
    return rowsOf(g);
  })(),
  pal: { a: "#fff0b8", b: "#f0cc78", c: "#d4a454", d: "#b07c38", w: "#f86ca8", p: "#ffffff", q: "#e83848" },
  solid: { x: 7, y: 16, w: 6, h: 6 },
});
