// Undersea props: corals (brain, fan, staghorn, tube sponges), anemones, tall
// swaying kelp, sea rocks, a sunken ship, open treasure chest, anchor,
// amphoras, giant clams with pearls, fish and schools, a turtle, an octopus,
// crabs, jellyfish, seahorses, rising bubbles and a yellow submarine.
import { defineProp, type PropDef } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import type { Pal } from "../sprite";
import { ellipse, tube, bezier, line } from "./beach";
import { flipRows } from "./artkit";
import { rod } from "./pixkit";

const get = (g: CharGrid, x: number, y: number) => g[y]?.[x] ?? ".";
const setIf = (g: CharGrid, x: number, y: number, ch: string) => {
  if (g[y] && x >= 0 && x < g[y].length) g[y][x] = ch;
};

// ── Flat shadows (for things floating above the sand) ────────────────────────
export const SEA_SHADOW_COLOR = "#78acb4";
function shadow(w: number, h: number): PropDef {
  const g = blank(w, h);
  ellipse(g, w / 2, h / 2, w / 2, h / 2, () => "s");
  return defineProp({ rows: rowsOf(g), pal: { s: SEA_SHADOW_COLOR }, flat: true, outline: false });
}
export const SHADOW_S = shadow(8, 3);
export const SHADOW_M = shadow(14, 4);
export const SHADOW_L = shadow(24, 6);
export const SHADOW_XL = shadow(46, 9);

// ── Brain coral ──────────────────────────────────────────────────────────────
function brainRows(): string[] {
  const W = 22, H = 16;
  const g = blank(W, H);
  ellipse(g, 11, 8.5, 10.5, 7.2, (l, x, y, nx, ny) => {
    // meandering grooves
    const v = Math.sin(x * 0.95 + Math.sin(y * 0.75) * 2.4 + y * 0.35);
    let k = l;
    if (Math.abs(v) < 0.32) k = Math.min(4, l + 2);
    else if (v > 0.32 && v < 0.7 && k > 0) k = k - 1;
    if (ny > 0.55) k = Math.max(k, 3);
    return "abcde"[k];
  }, 0.4);
  // sand-dark base so it sits on the floor
  return rowsOf(g);
}
const BRAIN_ROWS = brainRows();
export const BRAIN_CORAL_PINK = defineProp({
  rows: BRAIN_ROWS,
  pal: { a: "#ffd0e0", b: "#f898b8", c: "#e06890", d: "#b04070", e: "#7c2c58" },
  solid: { x: 1, y: 6, w: 22, h: 12 },
});
export const BRAIN_CORAL_GREEN = defineProp({
  rows: BRAIN_ROWS,
  pal: { a: "#e8f8a0", b: "#b8e070", c: "#88c050", d: "#5c9840", e: "#3c6c38" },
  solid: { x: 1, y: 6, w: 22, h: 12 },
});
export const BRAIN_CORAL_YELLOW = defineProp({
  rows: BRAIN_ROWS,
  pal: { a: "#fff8c0", b: "#f8e070", c: "#e0b848", d: "#b08830", e: "#7c5c28" },
  solid: { x: 1, y: 6, w: 22, h: 12 },
});

// ── Sea fan (gorgonian), sways ───────────────────────────────────────────────
function fanFrame(f: number): string[] {
  const W = 26, H = 28;
  const g = blank(W, H);
  const cx = 13, by = 25;
  const sway = [0, 1, 0, -1][f];
  // main branches radiating from the base, then a lattice between them
  const inFan = (x: number, y: number) => {
    const nx = (x + 0.5 - cx) / 12, ny = (y + 0.5 - by) / 22;
    return ny <= 0 && nx * nx + ny * ny <= 1;
  };
  for (let y = 2; y < by; y++) {
    const t = 1 - (by - y) / 22; // 1 at base … 0 at top
    const off = Math.round(sway * (1 - t) * 2);
    for (let x = 0; x < W; x++) {
      const sx = x - off;
      if (!inFan(sx, y)) continue;
      const nx = (sx + 0.5 - cx) / 12, ny = (y + 0.5 - by) / 22;
      const r2 = nx * nx + ny * ny;
      const ang = Math.atan2(y + 0.5 - by, sx + 0.5 - cx);
      const rib = Math.abs(((ang * 7) % 1 + 1) % 1 - 0.5) < 0.12;
      const lattice = (sx + y) % 3 === 0 || (sx - y + 30) % 3 === 0;
      if (r2 > 0.86) { put(g, x, y, nx < 0.1 ? "a" : "c"); continue; }
      if (rib) { put(g, x, y, nx < -0.2 ? "a" : "b"); continue; }
      if (lattice) put(g, x, y, nx < -0.3 && ny < -0.4 ? "b" : nx > 0.35 ? "d" : "c");
    }
  }
  // stalk + holdfast
  rect(g, 12, by - 3, 2, 4, "d"); put(g, 12, by - 3, "c");
  stamp(g, 9, 26, [".eeeeeee."]);
  return rowsOf(g);
}
const FAN_FRAMES = [0, 1, 2, 3].map(fanFrame);
export const FAN_CORAL_PURPLE = defineProp({
  frames: FAN_FRAMES, fps: 1.5,
  pal: { a: "#f0c0ff", b: "#c878f0", c: "#9850d0", d: "#6c30a0", e: "#6aa0aa" },
  solid: { x: 8, y: 22, w: 12, h: 7 },
});
export const FAN_CORAL_RED = defineProp({
  frames: FAN_FRAMES, fps: 1.5,
  pal: { a: "#ffc0b0", b: "#f87060", c: "#d84048", d: "#a02838", e: "#6aa0aa" },
  solid: { x: 8, y: 22, w: 12, h: 7 },
});

// ── Staghorn coral ───────────────────────────────────────────────────────────
function staghornRows(seed: number): string[] {
  const W = 28, H = 24;
  const g = blank(W, H);
  const branch = (x: number, y: number, ang: number, len: number, depth: number) => {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    tube(g, [[x, y], [x2, y2]], depth > 1 ? 1.6 : 1.2, "abcd");
    if (depth > 0) {
      branch(x2, y2, ang - 0.5 - (seed % 3) * 0.05, len * 0.7, depth - 1);
      branch(x2, y2, ang + 0.45, len * 0.65, depth - 1);
    } else {
      put(g, Math.round(x2), Math.round(y2), "a");
    }
  };
  branch(14, 21, -Math.PI / 2 - 0.65, 7, 2);
  branch(14, 21, -Math.PI / 2 + 0.6, 7, 2);
  branch(14, 21, -Math.PI / 2, 6, 1);
  stamp(g, 9, 22, [".eeeeeeeeee."]);
  return rowsOf(g);
}
export const STAGHORN_ORANGE = defineProp({
  rows: staghornRows(1),
  pal: { a: "#ffe0a0", b: "#f8a848", c: "#e07830", d: "#a84c20", e: "#6aa0aa" },
  solid: { x: 8, y: 16, w: 14, h: 9 },
});
export const STAGHORN_YELLOW = defineProp({
  rows: flipRows(staghornRows(2)),
  pal: { a: "#fffcc8", b: "#f8e060", c: "#d8b438", d: "#a07c28", e: "#6aa0aa" },
  solid: { x: 6, y: 16, w: 14, h: 9 },
});
export const STAGHORN_BLUE = defineProp({
  rows: staghornRows(3),
  pal: { a: "#d8f8ff", b: "#78d0f8", c: "#4898e0", d: "#2c64a8", e: "#6aa0aa" },
  solid: { x: 8, y: 16, w: 14, h: 9 },
});

// ── Tube sponges ─────────────────────────────────────────────────────────────
function tubesRows(): string[] {
  const g = blank(20, 22);
  const tubeAt = (x: number, top: number, w: number) => {
    for (let y = top + 2; y < 20; y++) for (let xx = 0; xx < w; xx++) {
      const c = xx === 0 ? "a" : xx < w * 0.45 ? "b" : xx < w - 1 ? "c" : "d";
      put(g, x + xx, y, (y - top) % 5 === 0 && xx > 0 && xx < w - 1 ? "c" : c);
    }
    // rim + dark opening
    ellipse(g, x + w / 2, top + 2, w / 2, 2, (l) => (l <= 1 ? "a" : "b"));
    ellipse(g, x + w / 2, top + 2.2, w / 2 - 1.2, 1.1, () => "k");
  };
  tubeAt(1, 6, 6);
  tubeAt(12, 9, 6);
  tubeAt(6, 0, 7);
  stamp(g, 1, 20, ["eeeeeeeeeeeeeeeeee"]);
  return rowsOf(g);
}
export const TUBE_SPONGE = defineProp({
  rows: tubesRows(),
  pal: { a: "#f8b8f0", b: "#d870d0", c: "#a848b0", d: "#783088", k: "#401848", e: "#6aa0aa" },
  solid: { x: 0, y: 12, w: 22, h: 12 },
});
export const TUBE_SPONGE_ORANGE = defineProp({
  rows: tubesRows(),
  pal: { a: "#ffd8a0", b: "#f8a050", c: "#d07030", d: "#984820", k: "#4c2418", e: "#6aa0aa" },
  solid: { x: 0, y: 12, w: 22, h: 12 },
});

// ── Sea anemone with clownfish (animated) ────────────────────────────────────
function anemoneFrame(f: number, withFish: boolean): string[] {
  const W = 24, H = 20;
  const g = blank(W, H);
  const cx = 12, cy = 10;
  // column (stalk) under the crown
  ellipse(g, cx, 15, 6, 4, (l) => "rstu"[Math.min(3, l + 1)]);
  // tentacles: back ones first (darker), front ones last (lighter)
  const tent: [number, number][] = [];
  for (let i = 0; i < 18; i++) tent.push([(i / 18) * Math.PI * 2, 6 + (i % 3)]);
  tent.sort((a, b) => Math.sin(a[0]) - Math.sin(b[0]));
  for (const [ang, len] of tent) {
    const w = Math.sin(f * Math.PI / 2 + ang * 3) * 1.2;
    const front = Math.sin(ang) > 0;
    for (let s = 1; s <= len; s++) {
      const x = Math.round(cx + Math.cos(ang) * s + w * (s / len));
      const y = Math.round(cy + Math.sin(ang) * s * 0.62 - (s / len) * 2.5);
      put(g, x, y, s === len ? "a" : front ? "b" : "c");
    }
  }
  // oral disc
  ellipse(g, cx, cy, 2.5, 1.6, (l) => (l === 0 ? "o" : "O"));
  if (withFish) {
    const fx = [3, 6, 15, 18][f], fy = [3, 2, 2, 4][f];
    const fr = f < 2 ? ["..wn.", "nwnwnn", ".nkn."] : [".nw..", "nnwnwn", ".nkn."];
    const fish = f < 2 ? ["..nwnn.", "nnwnnwk", "..nwnn."] : [".nnwn..", "kwnnwnn", ".nnwn.."];
    void fr;
    stamp(g, fx, fy, fish);
  }
  return rowsOf(g);
}
const ANEMONE_PAL: Pal = {
  a: "#ffe0f0", b: "#f890c8", c: "#d060a8", r: "#e8a0d0", s: "#c070b0", t: "#985090", u: "#683870",
  o: "#fff0a0", O: "#f8c858", n: "#f88828", w: "#ffffff", k: "#302020",
};
export const ANEMONE = defineProp({
  frames: [0, 1, 2, 3].map((f) => anemoneFrame(f, true)), fps: 2.5,
  pal: ANEMONE_PAL,
  solid: { x: 5, y: 12, w: 16, h: 9 },
});
export const ANEMONE_GREEN = defineProp({
  frames: [0, 1, 2, 3].map((f) => anemoneFrame(f, false)), fps: 2,
  pal: { ...ANEMONE_PAL, a: "#e8ffc0", b: "#90e070", c: "#58b058", o: "#f8a0c8", O: "#d86098", r: "#a8d888", s: "#78b070", t: "#508858", u: "#386848" },
  solid: { x: 5, y: 12, w: 16, h: 9 },
});

// ── Tall kelp (sways) ────────────────────────────────────────────────────────
function kelpFrame(f: number, flip: boolean): string[] {
  const W = 28, H = 58;
  const g = blank(W, H);
  const stalks: [number, number, number][] = [[9, 54, 0], [19, 44, 2.6]];
  for (const [bx, len, ph] of stalks) {
    const cx = (s: number) => {
      const t = s / len;
      return bx + Math.sin(s * 0.12 + ph) * 1.1 + Math.sin(f * Math.PI / 2 + ph) * 2.2 * t * t;
    };
    // stipe: 2px, lit on the left
    for (let s = 0; s <= len; s++) {
      const x = Math.round(cx(s)), y = H - 2 - s;
      put(g, x, y, "b"); put(g, x + 1, y, "c");
    }
    // broad leaves on alternating sides, pointing up and out
    let side = ph > 1 ? 1 : -1;
    for (let s = 7; s < len - 3; s += 7) {
      const x0 = cx(s) + (side > 0 ? 1.5 : 0.5), y0 = H - 2 - s + 0.5;
      const L = 8 - Math.floor((s / len) * 3);
      const sway = Math.sin(f * Math.PI / 2 + ph) * 1.2 * (s / len);
      const ex = x0 + side * L * 0.8 + sway, ey = y0 - L * 0.55;
      rod(g, x0, y0, ex, ey, 2.2, (t, sd, ln) => {
        const wv = 2.1 * Math.sin(Math.PI * Math.min(1, (t / ln) * 1.05)) + 0.2;
        if (Math.abs(sd) > wv) return null;
        if (Math.abs(sd) < 0.5 && t > 1) return "c";
        return sd < 0 ? "a" : "b";
      });
      put(g, Math.round(x0), Math.round(y0) + 1, "o");
      side = -side;
    }
    const tx = Math.round(cx(len)), ty = H - 2 - len;
    stamp(g, tx - 1, ty - 3, [".a", "ab", "ab", "bc"]);
  }
  // holdfast
  stamp(g, 5, H - 2, ["..dd.dd..d..dd.dd..", ".ddddddddddddddddd."]);
  const rows = rowsOf(g);
  return flip ? flipRows(rows) : rows;
}
const KELP_PAL: Pal = { a: "#e8e080", b: "#b8b040", c: "#888828", d: "#5c5c20", o: "#f0c858" };
export const KELP = defineProp({
  frames: [0, 1, 2, 3].map((f) => kelpFrame(f, false)), fps: 1.4,
  pal: KELP_PAL,
  solid: { x: 6, y: 54, w: 18, h: 6 },
});
export const KELP_B = defineProp({
  frames: [0, 1, 2, 3].map((f) => kelpFrame(f, true)), fps: 1.2,
  pal: { ...KELP_PAL, a: "#d0f0a0", b: "#8cc058", c: "#5c9440", d: "#3c6830", o: "#e8e070" },
  solid: { x: 6, y: 54, w: 18, h: 6 },
});

// ── Sea rocks with barnacles & algae ─────────────────────────────────────────
function rockRows(big: boolean): string[] {
  const W = big ? 34 : 20, H = big ? 24 : 15;
  const g = blank(W, H);
  if (big) {
    blobs(g, [
      { x: 17, y: 14, rx: 16, ry: 9.5 },
      { x: 11, y: 10, rx: 9, ry: 8 },
      { x: 23, y: 12, rx: 9, ry: 7.5 },
      { x: 18, y: 17, rx: 10, ry: 6 },
    ], "abcd");
  } else {
    blobs(g, [{ x: 10, y: 8.5, rx: 9.5, ry: 6.2 }, { x: 7, y: 7, rx: 5.5, ry: 4.5 }], "abcd");
  }
  // algae caps on the lit top, barnacles and coralline crust
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    if (get(g, x, y) === "." || get(g, x, y - 1) !== ".") continue;
    if ((x * 7) % 5 < 3) { put(g, x, y, "g"); if (get(g, x, y + 1) !== ".") put(g, x, y + 1, (x % 3) ? "G" : "g"); }
  }
  const bar = big ? [[8, 12], [13, 15], [26, 14], [20, 19], [5, 15]] : [[5, 9], [13, 10]];
  for (const [x, y] of bar) { stamp(g, x, y, ["w.", "Ww"]); }
  const crust = big ? [[22, 7], [10, 18]] : [[11, 5]];
  for (const [x, y] of crust) stamp(g, x, y, [".pp", "pPp", ".P."]);
  return rowsOf(g);
}
const SEAROCK_PAL: Pal = {
  a: "#c8cce4", b: "#9ca2c4", c: "#767ca4", d: "#52587e",
  g: "#78c890", G: "#4c9870", w: "#ffffff", W: "#b0b0c8", p: "#f8a0c0", P: "#c86890",
};
export const REEF_STONE = defineProp({ rows: rockRows(false), pal: SEAROCK_PAL, solid: { x: 1, y: 6, w: 20, h: 10 } });
export const REEF_STONE_BIG = defineProp({ rows: rockRows(true), pal: SEAROCK_PAL, solid: { x: 1, y: 10, w: 34, h: 15 } });

export const URCHIN = defineProp({
  rows: [
    "k...k...k",
    ".k..k..k.",
    "..kKKKk..",
    "kkKpKKKkk",
    "..KKKKK..",
    ".k.kKk.k.",
    "k..k.k..k",
  ],
  pal: { k: "#3c2c58", K: "#6c50a0", p: "#c8a8f0" },
  solid: null,
});

// ── Little floor critters & details (flat) ───────────────────────────────────
const starfish = (a: string, b: string, c: string) => defineProp({
  rows: [
    "....a....",
    "...aba...",
    "...aba...",
    "aaabbbccc",
    ".abwbwbc.",
    "..bbbbc..",
    ".bbc.bcc.",
    ".bc...cc.",
  ],
  pal: { a, b, c, w: "#fff0d0" },
  flat: true,
});
export const STARFISH_RED = starfish("#ff9080", "#f04848", "#b02838");
export const STARFISH_ORANGE = starfish("#ffc070", "#f88828", "#c05818");
export const STARFISH_PURPLE = starfish("#e8b0ff", "#a868e8", "#7040b0");

export const SHELL = defineProp({
  rows: [
    "...aa...",
    "..abba..",
    ".abcbca.",
    "abcbcbca",
    ".dcdcdc.",
    "..dddd..",
  ],
  pal: { a: "#fff0f0", b: "#f8c8c8", c: "#e09898", d: "#b87078" },
  flat: true,
});
export const CONCH = defineProp({
  rows: [
    "....aab.",
    "..aabbbc",
    ".abbcwwc",
    "abbbcwpc",
    ".cccccc.",
  ],
  pal: { a: "#fff8e0", b: "#f8d8a8", c: "#c89868", w: "#ffd0d8", p: "#f890a8" },
  flat: true,
});

export const COINS = defineProp({
  rows: [
    "ab......ab",
    "bc..ab..bc",
    "....bc....",
    ".ab....ab.",
    ".bc....bc.",
  ],
  pal: { a: "#fff0a0", b: "#f8c838", c: "#b88820" },
  flat: true,
});

export const CHAIN = defineProp({
  rows: [
    ".aa.............",
    "a..b.aa.........",
    ".bb.a..b........",
    ".....bb..aa.....",
    "........a..b.aa.",
    ".........bb.a..b",
    ".............bb.",
  ],
  pal: { a: "#a8a0a0", b: "#685c60" },
  flat: true,
});

// ── Sunken ship ──────────────────────────────────────────────────────────────
const SHIP_PAL: Pal = {
  a: "#d0b890", b: "#ae9670", c: "#8c7656", d: "#6c5a44", e: "#4c3e34", X: "#2a2030", Y: "#3c3040",
  h: "#7c6c5c", H: "#5c5048", J: "#443a38",
  p: "#d8b850", P: "#987830", q: "#3a5068", Q: "#78a0b8",
  g: "#80c068", G: "#4c8c50", s: "#e0e0d0", S: "#b0b0a0", T: "#888878",
  w: "#ffffff", W: "#b8b8c8", o: "#f88838", O: "#b85828",
};
function shipRows(): string[] {
  const W = 110, H = 70;
  const g = blank(W, H);
  const cy = 26;
  // deck half-height along x (stern at left, pointed bow at right)
  const half = (x: number) => {
    if (x < 6 || x > 104) return -1;
    if (x < 14) return 15 + (x - 6) * 0.25 - (x < 8 ? (8 - x) * 1.5 : 0);
    if (x < 66) return 17;
    const t = (x - 66) / 38;
    return 17 * Math.sqrt(Math.max(0, 1 - t * t));
  };
  const side = (x: number) => (x < 88 ? 11 : Math.max(2, 11 - (x - 88) * 0.6));
  for (let x = 0; x < W; x++) {
    const hh = half(x);
    if (hh < 0) continue;
    const top = Math.round(cy - hh), bot = Math.round(cy + hh * 0.85);
    for (let y = top; y <= bot; y++) {
      // bulwark rim
      if (y <= top + 1 || y >= bot - 1) { put(g, x, y, y <= top ? "a" : y >= bot ? "d" : "b"); continue; }
      // planks running along the hull
      const pr = (y - top) % 4;
      const joint = (x + Math.floor((y - top) / 4) * 13) % 26 === 0;
      let c = pr === 0 ? "d" : pr === 1 ? "b" : "c";
      if (joint) c = "d";
      put(g, x, y, c);
    }
    // hull side (3/4 view), with a rim line, portholes and weed at the bottom
    const sd = Math.round(side(x));
    for (let k = 1; k <= sd; k++) {
      const y = bot + k;
      let c = k === 1 ? "h" : k < sd - 1 ? "H" : "J";
      if (k === 4 && x > 10 && x < 90) c = "h";
      put(g, x, y, c);
    }
    put(g, x, bot + 1, "a");
  }
  // portholes
  for (const px of [16, 30, 62, 76]) {
    stamp(g, px, 44, [".pp.", "pqQp", "pqqp", ".PP."]);
  }
  // stern cabin (raised quarterdeck)
  rect(g, 8, 13, 18, 26, "c");
  for (let y = 13; y < 39; y++) for (let x = 8; x < 26; x++) {
    const pr = (x - 8) % 4;
    put(g, x, y, pr === 0 ? "d" : pr === 1 ? "a" : "b");
  }
  rect(g, 8, 13, 18, 1, "a"); rect(g, 25, 13, 1, 26, "e"); rect(g, 8, 38, 18, 1, "e");
  rect(g, 26, 14, 2, 25, "J");
  // cabin skylight
  stamp(g, 13, 22, ["eeeeeee", "eqQqQqe", "eqqqqqe", "eeeeeee"]);
  // broken hole in the deck
  for (let y = 18; y < 36; y++) for (let x = 38; x < 60; x++) {
    const nx = (x + 0.5 - 49) / 10, ny = (y + 0.5 - 27) / 8;
    const jag = Math.sin(x * 2.1) * 0.12 + Math.sin(y * 1.7) * 0.1;
    const r = nx * nx + ny * ny + jag;
    if (r < 0.75) put(g, x, y, y < 22 ? "Y" : "X");
    else if (r < 0.95 && get(g, x, y) !== ".") put(g, x, y, ny < 0 ? "e" : "a");
  }
  // broken plank ends sticking into the hole
  for (const [x, y, n] of [[41, 23, 4], [53, 30, 5], [45, 32, 3]] as const) rect(g, x, y, n, 1, "b");
  // fore mast stump
  ellipse(g, 74, 26, 3.5, 3, (l) => "abcd"[l]);
  ellipse(g, 74, 26, 1.5, 1.2, () => "e");
  // fallen main mast lying diagonally, out over the side onto the sand
  tube(g, [[64, 14], [100, 62]], 2.2, "abcd");
  rect(g, 70, 20, 1, 1, "e");
  // yard + torn sail draped across it
  tube(g, [[72, 40], [92, 30]], 1.2, "bccd");
  for (let i = 0; i < 18; i++) {
    const x0 = 74 + i, y0 = 40 - Math.round(i * 0.5);
    const len = 6 + Math.round(Math.sin(i * 1.3) * 2) + (i > 12 ? -2 : 0);
    for (let k = 1; k <= len; k++) put(g, x0, y0 + k, k === len ? "T" : i % 5 === 0 ? "S" : k < 3 ? "s" : "S");
  }
  // rope
  line(g, 74, 28, 66, 16, "P");
  // algae patches and hanging weed
  for (const [x, y, r] of [[30, 12, 3], [88, 18, 2.5], [12, 36, 2.5], [62, 38, 3], [96, 30, 2]] as const) {
    ellipse(g, x, y, r + 1, r, (l) => (l < 2 ? "g" : "G"));
  }
  for (const x of [12, 24, 37, 49, 57, 71, 84]) {
    const len = 3 + (x % 4);
    for (let k = 0; k < len; k++) put(g, x + (k % 3 === 2 ? 1 : 0), 41 + k, k === 0 ? "g" : k % 2 ? "G" : "g");
  }
  // barnacles + a starfish on the hull
  for (const [x, y] of [[22, 47], [47, 49], [70, 46], [86, 48], [35, 54], [60, 54]]) stamp(g, x, y, ["w", "W"]);
  stamp(g, 36, 45, ["..o..", "ooooo", ".oOo.", ".o.o."]);
  return rowsOf(g);
}
export const SHIPWRECK = defineProp({
  rows: shipRows(),
  pal: SHIP_PAL,
  solid: { x: 6, y: 16, w: 100, h: 42 },
  baseY: 58,
});

// ── Sunken treasure chest (open, sparkling) ──────────────────────────────────
export const SUNKEN_CHEST = defineProp({
  frames: [0, 1, 2].map((f) => {
    const g = blank(26, 24);
    // lid tilted back
    rect(g, 3, 0, 20, 7, "u"); rect(g, 3, 0, 20, 1, "t");
    rect(g, 5, 1, 16, 5, "m"); rect(g, 5, 1, 16, 1, "M");
    rect(g, 3, 0, 2, 7, "y"); rect(g, 21, 0, 2, 7, "Y");
    // box
    rect(g, 2, 10, 22, 12, "t"); rect(g, 2, 10, 22, 1, "T");
    rect(g, 2, 14, 22, 1, "u"); rect(g, 2, 18, 22, 1, "u"); rect(g, 2, 21, 22, 1, "v");
    rect(g, 2, 10, 2, 12, "y"); rect(g, 22, 10, 2, 12, "Y");
    rect(g, 11, 12, 4, 4, "y"); rect(g, 12, 13, 2, 2, "k");
    // gold heap with gems and a pearl necklace
    ellipse(g, 13, 9, 11, 3.8, (l) => "oyYO"[l]);
    for (const [x, y, c] of [[5, 8, "o"], [10, 7, "o"], [16, 7, "o"], [19, 9, "Y"], [7, 10, "Y"], [12, 8, "r"], [17, 8, "g"], [8, 8, "b"], [14, 10, "Y"]] as const) put(g, x, y, c);
    for (let i = 0; i < 9; i++) put(g, 3 + i, 11 + Math.round(Math.sin(i * 0.5) * 2) + (i > 5 ? 2 : 0), i % 2 ? "W" : "w");
    // algae on the corners
    stamp(g, 0, 15, ["g.", "gg", "Gg", ".G", "gG"]);
    stamp(g, 23, 2, [".g", "gG", "g."]);
    // spilled coins
    stamp(g, 0, 22, ["yY"]); stamp(g, 22, 23, ["oy"]);
    const sp = [[[5, 6], [19, 8]], [[13, 6], [7, 9]], [[17, 6], [10, 7]]][f];
    for (const [x, y] of sp) { put(g, x, y, "W"); put(g, x - 1, y, "w"); put(g, x + 1, y, "w"); put(g, x, y - 1, "w"); put(g, x, y + 1, "w"); }
    return rowsOf(g);
  }),
  fps: 3,
  pal: {
    t: "#a87c58", T: "#c8a070", u: "#7c5840", v: "#5a3c2c",
    y: "#f8d048", Y: "#c89820", O: "#a87018", o: "#fff0a0", W: "#ffffff", w: "#fff8c8",
    k: "#4a2820", m: "#2c6880", M: "#4890a8", r: "#f04858", g: "#58c870", G: "#3c8c50", b: "#58a8f8",
  },
  solid: { x: 0, y: 10, w: 28, h: 15 },
});

// ── Anchor stuck in the sand ─────────────────────────────────────────────────
export const ANCHOR_SUNK = defineProp({
  rows: (() => {
    const g = blank(22, 26);
    // shank (tilted)
    tube(g, [[7, 3], [13, 20]], 1.3, "abcd");
    // ring
    ellipse(g, 6, 2, 2.5, 2.5, (l) => "abcd"[l]);
    ellipse(g, 6, 2, 1, 1, () => ".");
    // stock (cross bar)
    tube(g, [[3, 8], [14, 4]], 1, "abcd");
    // arms + flukes, half buried
    tube(g, [[5, 18], [9, 22], [13, 21], [17, 22], [20, 17]], 1.3, "abcd");
    stamp(g, 3, 15, ["aa.", "abb", ".bc"]);
    stamp(g, 18, 14, [".aa", "bbc", "cc."]);
    // rust and weed
    for (const [x, y] of [[10, 12], [12, 17], [8, 7], [15, 21]]) put(g, x, y, "r");
    stamp(g, 11, 9, ["g", "gG", ".g"]);
    // sand mound
    stamp(g, 4, 23, [".ssssssssssssss.", "sssssssssssssssss"]);
    return rowsOf(g);
  })(),
  pal: { a: "#b8c0d0", b: "#8890a8", c: "#646c88", d: "#464c68", r: "#b8704c", g: "#78c890", G: "#4c9870", s: "#88c0c0" },
  solid: { x: 3, y: 18, w: 20, h: 8 },
});

// ── Amphoras ─────────────────────────────────────────────────────────────────
const AMPH_PAL: Pal = { a: "#f8c890", b: "#e09858", c: "#c07040", d: "#8c4c2c", e: "#5c3020", k: "#3a2018", g: "#78c890", G: "#4c9870", w: "#ffffff" };
export const AMPHORA = defineProp({
  rows: [
    "....kkk....",
    "...dbbbd...",
    "....bbc....",
    ".dd.abc.dd.",
    "d..dbbbd..d",
    "d.dabbbcd.d",
    ".dabbbbccd.",
    ".abbabbccd.",
    "dabbbbbbccd",
    "dabbbbbbccd",
    "dbbdddddccd",
    "dbbbbbbbccd",
    ".abbbbbccd.",
    ".gbbbbbccG.",
    "..ggbbccd..",
    "...Gbccd...",
    "....cdd....",
    "....ddd....",
  ],
  pal: AMPH_PAL,
  solid: { x: 1, y: 12, w: 11, h: 8 },
});
export const AMPHORA_BROKEN = defineProp({
  rows: (() => {
    const g = blank(24, 13);
    // body lying on its side, neck to the right
    ellipse(g, 10, 6, 9, 5, (l) => "abcd"[l], 0.4);
    rect(g, 18, 4, 3, 4, "b"); rect(g, 18, 7, 3, 1, "c"); rect(g, 18, 4, 3, 1, "a");
    rect(g, 21, 3, 2, 6, "c"); rect(g, 21, 3, 1, 6, "b");
    // handles
    stamp(g, 15, 0, ["dd..", "..d.", "...d"]);
    stamp(g, 15, 11, ["...d", "ddd."]);
    // broken end: dark opening with jagged rim
    ellipse(g, 3, 6, 2.6, 4, () => "k");
    for (const [x, y, c] of [[2, 2, "a"], [4, 2, "a"], [5, 3, "b"], [1, 4, "a"], [5, 8, "c"], [1, 9, "d"], [3, 10, "c"], [5, 5, "e"]] as const) put(g, x, y, c);
    // band + weed
    for (let y = 1; y < 12; y++) if (get(g, 12, y) !== ".") put(g, 12, y, "e");
    stamp(g, 8, 8, ["g.g", "gGg"]);
    // shards on the floor
    stamp(g, 0, 11, [".ab", "bc."]);
    return rowsOf(g);
  })(),
  pal: AMPH_PAL,
  solid: { x: 0, y: 3, w: 25, h: 11 },
});

// ── Old brass diving helmet ──────────────────────────────────────────────────
export const DIVE_HELMET = defineProp({
  rows: (() => {
    const g = blank(16, 15);
    ellipse(g, 8, 7, 7.5, 7, (l) => "abcd"[l], 0.35);
    ellipse(g, 8, 7.5, 3.5, 3.2, (l) => (l === 0 ? "Q" : "q"));
    ellipse(g, 8, 7.5, 4.3, 4, (l, x, y, nx, ny) => (nx * nx + ny * ny > 0.62 ? "e" : null));
    put(g, 7, 6, "w");
    ellipse(g, 2, 8, 1.5, 1.8, () => "e"); ellipse(g, 14, 8, 1.5, 1.8, () => "e");
    rect(g, 2, 13, 12, 2, "d"); rect(g, 2, 13, 12, 1, "c");
    for (const x of [3, 6, 9, 12]) put(g, x, 14, "a");
    return rowsOf(g);
  })(),
  pal: { a: "#fff0a0", b: "#e8c050", c: "#c09030", d: "#8c6420", e: "#6c4c20", q: "#284058", Q: "#5888a8", w: "#ffffff" },
  solid: { x: 1, y: 7, w: 16, h: 10 },
});

// ── Giant clam with a pearl (opens & closes) ─────────────────────────────────
function clamFrame(open: number, shine: number): string[] {
  const W = 26, H = 20;
  const g = blank(W, H);
  const cx = 13;
  // lower (front) shell with radial ridges
  ellipse(g, cx, 13, 12, 6, (l, x) => {
    const ridge = Math.abs(((x - cx) + 40) % 4) < 1;
    return ridge ? "c" : "abcd"[Math.min(3, l)];
  }, 0.3);
  // scalloped rim
  for (let x = 2; x < 24; x++) if ((x - cx + 40) % 4 === 1) put(g, x, 18, get(g, x, 17) !== "." ? "d" : ".");
  // mantle + pearl visible between the shells
  const gap = open;
  if (gap > 0) {
    ellipse(g, cx, 10, 10, gap, (l, x, y) => ((x + y) % 4 === 0 ? "M" : l < 2 ? "m" : "n"));
    if (gap >= 2.5) {
      ellipse(g, cx, 10, 2.4, 2.2, (l) => (l === 0 ? "w" : l < 3 ? "W" : "V"));
      if (shine) { put(g, cx - 1, 8, "w"); put(g, cx + 2, 6, "w"); put(g, cx + 3, 7, "w"); put(g, cx + 2, 7, "W"); put(g, cx + 1, 7, "w"); }
    }
  }
  // upper (back) shell tilted open
  const top = 10 - gap;
  ellipse(g, cx, top - 1.5, 11, 4, (l, x) => {
    const ridge = Math.abs(((x - cx) + 40) % 4) < 1;
    return ridge ? "b" : "abcd"[Math.min(3, l)];
  }, 0.3);
  for (let x = 3; x < 23; x++) if ((x - cx + 40) % 4 === 1 && get(g, x, Math.round(top + 2)) === ".") put(g, x, Math.round(top + 2), "c");
  return rowsOf(g);
}
export const GIANT_CLAM = defineProp({
  frames: [clamFrame(4, 1), clamFrame(4, 0), clamFrame(4, 0), clamFrame(2, 0), clamFrame(0.6, 0), clamFrame(2, 0), clamFrame(4, 0), clamFrame(4, 1)],
  fps: 2,
  pal: {
    a: "#e8e0f8", b: "#c0b8e0", c: "#9890c0", d: "#6c6898",
    m: "#58c8e8", M: "#c0f8ff", n: "#2c88c0", w: "#ffffff", W: "#f0e8f0", V: "#c8b8d0",
  },
  solid: { x: 1, y: 8, w: 26, h: 13 },
});

// ── Fish ─────────────────────────────────────────────────────────────────────
// Facing left. a/b/c body ramp, s stripe, t tail/fins, w eye white, k pupil.
function fishFrames(rowsA: readonly string[], rowsB: readonly string[], flip: boolean): string[][] {
  const H = 9;
  const frames = [0, 1, 2, 3].map((f) => {
    const src = f % 2 ? rowsB : rowsA;
    const bob = f === 1 || f === 2 ? 1 : 0;
    const g = blank(src[0].length, H);
    stamp(g, 0, bob, src);
    const rows = rowsOf(g);
    return flip ? flipRows(rows) : rows;
  });
  return frames;
}
const FISH_A = [
  "....tt.....",
  "..abbbb..tt",
  ".abbsbbbtt.",
  "awkbsbbbbt.",
  ".bbbsbccctt",
  "..cccc...t.",
  "....t......",
];
const FISH_B = [
  "....tt.....",
  "..abbbb....",
  ".abbsbbbttt",
  "awkbsbbbbtt",
  ".bbbsbccctt",
  "..cccc.....",
  "....t......",
];
const fish = (pal: Pal, flip = false) => defineProp({
  frames: fishFrames(FISH_A, FISH_B, flip), fps: 3, pal: { w: "#ffffff", k: "#202030", ...pal }, solid: null,
});
export const FISH_YELLOW = fish({ a: "#fffcb0", b: "#f8e040", c: "#d0a828", s: "#f8e040", t: "#f8c830" });
export const FISH_BLUE = fish({ a: "#a8e0ff", b: "#3880e8", c: "#2858b0", s: "#283868", t: "#f8d038" }, true);
export const FISH_CLOWN = fish({ a: "#ffc890", b: "#f88828", c: "#c85818", s: "#ffffff", t: "#f88828" });
export const FISH_PINK = fish({ a: "#ffd8f0", b: "#f888c8", c: "#c85898", s: "#b860e0", t: "#b860e0" }, true);
export const FISH_GREEN = fish({ a: "#d0ffd8", b: "#40c8a0", c: "#289078", s: "#f8e040", t: "#2890c8" });

/** A school of small silver-blue fish wheeling in place. */
export const FISH_SCHOOL = defineProp({
  frames: [0, 1, 2, 3, 4, 5].map((f) => {
    const g = blank(46, 26);
    const t = (f / 6) * Math.PI * 2;
    const spots = [[2, 8], [12, 3], [13, 13], [23, 8], [24, 18], [34, 3], [35, 13]];
    spots.forEach(([bx, by], i) => {
      const x = Math.round(bx + Math.cos(t + i * 0.9) * 2);
      const y = Math.round(by + Math.sin(t + i * 1.3) * 1.2);
      const tail = (f + i) % 2 === 0;
      stamp(g, x, y, [
        "..aaa...",
        tail ? ".abbbb.t" : ".abbbbtt",
        "wkbbbbtt",
        tail ? ".cccdd.t" : ".cccddt.",
        "..cc....",
      ]);
    });
    return rowsOf(g);
  }),
  fps: 3,
  pal: { a: "#ffffff", b: "#c0e0f8", c: "#5c88c8", d: "#4870b0", t: "#88b0e0", k: "#182838", w: "#ffffff" },
  solid: null,
});

// ── Sea turtle (swimming, top-down) ──────────────────────────────────────────
function turtleFrame(f: number): string[] {
  const W = 30, H = 30;
  const g = blank(W, H);
  const cx = 15;
  const sw = [0, 1, 2, 1][f];
  // flippers (behind the shell)
  const fl = (sx: number, sy: number, ex: number, ey: number, r: number) => tube(g, [[sx, sy], [(sx + ex) / 2, (sy + ey) / 2 - 1], [ex, ey]], r, "pqrs");
  fl(10, 11, 2, 6 + sw * 3, 2);
  fl(20, 11, 28, 6 + sw * 3, 2);
  fl(11, 21, 6, 25 - sw, 1.4);
  fl(19, 21, 24, 25 - sw, 1.4);
  // head + tail
  ellipse(g, cx, 4.5, 3.2, 3.6, (l) => "pqrs"[l]);
  put(g, cx - 2, 3, "k"); put(g, cx + 2, 3, "k");
  stamp(g, cx - 1, 25, ["qr", ".r"]);
  // shell with plates
  ellipse(g, cx, 15, 8, 9.5, (l, x, y) => {
    const dx = x - cx, dy = y - 15;
    const plate = Math.abs(dx) === 3 || (Math.abs(dy) % 5 === 2 && Math.abs(dx) < 7);
    if (plate) return "d";
    return "abce"[l];
  }, 0.35);
  // rim
  const src = g.map((r) => [...r]);
  for (let y = 5; y < 26; y++) for (let x = 6; x < 25; x++) {
    if (get(src, x, y) === "." || "abcde".indexOf(get(src, x, y)) < 0) continue;
    const nb = [get(src, x - 1, y), get(src, x + 1, y), get(src, x, y - 1), get(src, x, y + 1)];
    if (nb.some((c) => "abcde".indexOf(c) < 0)) put(g, x, y, y < 12 ? "n" : "m");
  }
  return rowsOf(g);
}
export const TURTLE = defineProp({
  frames: [0, 1, 2, 3].map(turtleFrame), fps: 2.5,
  pal: {
    a: "#d8e898", b: "#a8c060", c: "#7c9840", e: "#5c7430", d: "#4c5c2c", m: "#a88c50", n: "#d8c088",
    p: "#d8f0c0", q: "#98c890", r: "#689870", s: "#48705c", k: "#182020",
  },
  solid: null,
});

// ── Octopus (on the floor, curling tentacles) ────────────────────────────────
function octoFrame(f: number): string[] {
  const W = 32, H = 26;
  const g = blank(W, H);
  const cx = 16, cy = 9;
  // eight tentacles spreading around and below the mantle
  for (let i = 0; i < 8; i++) {
    const ang = Math.PI * (0.05 + (i / 7) * 0.9);
    const pts: [number, number][] = [];
    for (let s = 0; s <= 12; s++) {
      const t = s / 12;
      const a = ang + Math.sin(t * 4 + f * Math.PI / 2 + i) * 0.35 * t + (i < 4 ? 1 : -1) * t * t * 0.9;
      pts.push([cx + Math.cos(a) * (3 + s * 1.1), cy + 3 + Math.sin(a) * (2 + s * 0.85)]);
    }
    pts.forEach(([x, y], s) => {
      const r = s < 4 ? 1.4 : s < 9 ? 1 : 0.6;
      ellipse(g, x, y, r, r, (l) => "bcdd"[l]);
      if (s % 2 === 0 && s > 2) put(g, Math.round(x), Math.round(y) + 1, "o");
    });
  }
  // mantle (head)
  ellipse(g, cx, cy, 7, 7.5, (l) => "abcd"[l], 0.35);
  for (const [x, y] of [[13, 6], [18, 4], [15, 3], [19, 8]]) put(g, x, y, "c");
  // eyes
  stamp(g, cx - 4, cy + 3, ["ww.", "wk."]);
  stamp(g, cx + 2, cy + 3, ["ww", "kw"]);
  return rowsOf(g);
}
export const OCTOPUS = defineProp({
  frames: [0, 1, 2, 3].map(octoFrame), fps: 2,
  pal: { a: "#ffb0a0", b: "#f07060", c: "#c84848", d: "#903040", o: "#ffd8c8", w: "#ffffff", k: "#201818" },
  solid: { x: 8, y: 6, w: 18, h: 12 },
});

// ── Crab (scuttling) ─────────────────────────────────────────────────────────
export const SEA_CRAB = defineProp({
  frames: [
    [
      ".rr.......rr.",
      "rRr.......rRr",
      ".rr.w...w.rr.",
      "..r.k...k.r..",
      "...rrrrrrr...",
      "..rarrrrrRr..",
      ".r.rRRRRRr.r.",
      "r..r.....r..r",
    ],
    [
      "rr.........rr",
      "rRr.......rRr",
      ".rr.w...w.rr.",
      "...rk...kr...",
      "...rrrrrrr...",
      "..rarrrrrRr..",
      "r..rRRRRRr..r",
      ".r.r.....r.r.",
    ],
  ],
  fps: 3,
  pal: { r: "#f86040", R: "#b83028", a: "#ffa080", w: "#ffffff", k: "#202020" },
  solid: null,
});
export const SEA_CRAB_BLUE = defineProp({
  frames: SEA_CRAB.frames!,
  fps: 2.5,
  pal: { r: "#5898f0", R: "#2c58b0", a: "#a8d0ff", w: "#ffffff", k: "#202020" },
  solid: null,
});

// ── Jellyfish (pulsing) ──────────────────────────────────────────────────────
function jellyFrame(f: number): string[] {
  const W = 16, H = 26;
  const g = blank(W, H);
  const bob = [0, 1, 2, 1][f];
  const wide = [7, 6, 5.5, 6.5][f];
  ellipse(g, 8, 6 + bob, wide, 5, (l, x, y, nx, ny) => (ny > 0.45 ? null : "abcd"[l]), 0.3);
  // frilly rim
  for (let x = 0; x < W; x++) {
    const y = 8 + bob;
    if (get(g, x, y - 1) !== "." || get(g, x, y - 2) !== ".") put(g, x, y, (x + f) % 2 ? "c" : "e");
  }
  // inner glow
  ellipse(g, 8, 5 + bob, 2.2, 1.5, () => "e");
  // tentacles
  for (const [x0, ph] of [[4, 0], [7, 1.5], [9, 3], [12, 4.5]] as const) {
    for (let k = 0; k < 13 - Math.abs(x0 - 8); k++) {
      const x = Math.round(x0 + Math.sin(k * 0.6 + f * Math.PI / 2 + ph) * 1.2);
      put(g, x, 9 + bob + k, k % 3 === 2 ? "a" : "c");
    }
  }
  return rowsOf(g);
}
export const JELLYFISH = defineProp({
  frames: [0, 1, 2, 3].map(jellyFrame), fps: 2.5,
  pal: { a: "#fff0ff", b: "#f8c8f0", c: "#e898e0", d: "#c070c8", e: "#ffe8a8" },
  solid: null,
});
export const JELLYFISH_BLUE = defineProp({
  frames: [0, 1, 2, 3].map(jellyFrame), fps: 2,
  pal: { a: "#f0ffff", b: "#c0f0ff", c: "#80d0f8", d: "#5098e0", e: "#e8fff8" },
  solid: null,
});

// ── Seahorse (bobbing) ───────────────────────────────────────────────────────
const SEAHORSE_ROWS = [
  "..aab.",
  ".abkbb",
  "bbbb..",
  ".abb..",
  "..abc.",
  "f.abc.",
  "ffabc.",
  "f.abc.",
  "..bbc.",
  "...bc.",
  "..cbc.",
  "..cc..",
];
export const SEAHORSE = defineProp({
  frames: [0, 1, 2, 1].map((b) => {
    const g = blank(6, 14);
    stamp(g, 0, b, SEAHORSE_ROWS);
    return rowsOf(g);
  }),
  fps: 2,
  pal: { a: "#fff8a0", b: "#f8c838", c: "#c88820", k: "#202020", f: "#ffe8b0" },
  solid: null,
});

// ── Rising bubbles (animated column) ─────────────────────────────────────────
const BUB: Record<number, string[]> = {
  1: [".o.", "owo", ".o."],
  2: [".oo.", "owbo", "obbo", ".oo."],
  3: [".ooo.", "owwbo", "owbbo", "obbbo", ".ooo."],
};
function bubbleFrames(seed: number, H: number): string[][] {
  const W = 11, N = 8;
  const list = [
    { x: 4, p: 0.0, s: 2 }, { x: 2, p: 0.33, s: 1 }, { x: 6, p: 0.55, s: 3 },
    { x: 3, p: 0.8, s: 1 }, { x: 5, p: 0.15, s: 1 }, { x: 4, p: 0.68, s: 2 },
  ];
  return Array.from({ length: N }, (_, f) => {
    const g = blank(W, H);
    for (const b of list) {
      const t = (f / N + b.p + seed * 0.13) % 1;
      const y = Math.round((H - 5) * (1 - t));
      const x = Math.round(b.x + Math.sin(t * 9 + b.p * 6) * 1.5) - (b.s > 2 ? 1 : 0);
      const sz = t > 0.85 && b.s > 1 ? b.s - 1 : b.s;
      stamp(g, Math.max(0, Math.min(W - sz - 2, x)), y, BUB[sz]);
    }
    return rowsOf(g);
  });
}
const BUB_PAL = { o: "#4a88b0", w: "#ffffff", b: "#c0f0fc" };
export const BUBBLES = defineProp({ frames: bubbleFrames(0, 34), fps: 4, pal: BUB_PAL, outline: false, solid: null });
export const BUBBLES_TALL = defineProp({ frames: bubbleFrames(3, 48), fps: 4, pal: BUB_PAL, outline: false, solid: null });

/** Little rock vent puffing bubbles. */
export const VENT = defineProp({
  rows: [
    "....aab.....",
    "..aabbbbc...",
    ".abbkkkbbc..",
    "abbkKKKkbcc.",
    "abbbkkkbbccd",
    "abbbbbbbcccd",
    ".bbcccccccd.",
    "..dddddddd..",
  ],
  pal: { a: "#b8bcd8", b: "#9096b8", c: "#6c7298", d: "#4c5278", k: "#282840", K: "#141428" },
  solid: null,
});

// ── Yellow submarine ─────────────────────────────────────────────────────────
function subFrame(f: number): string[] {
  const W = 64, H = 36;
  const g = blank(W, H);
  // propeller at the stern (left), 3-frame spin
  const blades = [["k.", "kk", ".k", "..", ".k", "kk", "k."], ["..", "kk", "kk", "kk", "kk", "kk", ".."], [".k", "kk", "k.", "..", "k.", "kk", ".k"]][f % 3];
  stamp(g, 1, 16, blades.map((r) => r.replace(/k/g, "m")));
  rect(g, 3, 19, 4, 2, "n");
  // tail fins
  stamp(g, 5, 10, ["yy...", "yYy..", ".yYYy", "..YYY"]);
  stamp(g, 5, 26, ["..YYY", ".yYYy", "yYy..", "yy..."]);
  // hull
  ellipse(g, 34, 20, 27, 9, (l, x, y, nx, ny) => {
    if (Math.abs(nx) < 0.97 && (x === 22 || x === 46) && l < 3) return "Y";
    return "aybY"[l];
  }, 0.35);
  // stripe of rivets
  for (let x = 12; x < 58; x += 3) if (get(g, x, 24) === "y" || get(g, x, 24) === "b") put(g, x, 24, "Y");
  // portholes
  for (const px of [26, 34, 42]) stamp(g, px, 17, [".mm.", "mqQm", "mqqm", ".mm."]);
  // conning tower
  ellipse(g, 30, 10, 8, 6, (l) => "aybY"[l], 0.35);
  ellipse(g, 30, 8.5, 6, 3, (l) => (l < 2 ? "a" : "y"));
  rect(g, 27, 7, 6, 2, "Y"); stamp(g, 27, 7, ["qQqQqq"]);
  // periscope
  rect(g, 33, 0, 2, 7, "n"); rect(g, 33, 0, 1, 7, "o"); rect(g, 33, 0, 4, 2, "n"); put(g, 36, 1, "q");
  // headlight at the bow
  stamp(g, 58, 18, ["ww", "wW", "WW"]);
  return rowsOf(g);
}
export const SUBMARINE = defineProp({
  frames: [0, 1, 2].map(subFrame), fps: 6,
  pal: {
    a: "#fff8a8", y: "#f8d838", b: "#e0b020", Y: "#b07c18",
    m: "#9098b0", n: "#686e88", o: "#b8c0d8", q: "#2c4868", Q: "#88c8f0", w: "#ffffff", W: "#fff0a0", k: "#303040",
  },
  solid: { x: 6, y: 12, w: 56, h: 20 },
  baseY: 32,
});
