// Enchanted night-forest props: dark trees, a glowing magic tree, bioluminescent
// mushrooms, fairies, fireflies, an owl, a gnome, a fairy house, crystals…
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, line } from "./artkit";

const LEAF_NIGHT = { a: "#3c8c78", b: "#2a6c5c", c: "#1e5448", d: "#143c34", t: "#6a4838", u: "#463024", v: "#2e2018" };

// ── Dark round trees ─────────────────────────────────────────────────────────
function nightTreeRows(seed: number): string[] {
  const g = blank(30, 34);
  rect(g, 12, 23, 6, 10, "t"); rect(g, 15, 23, 3, 10, "u");
  put(g, 11, 32, "t"); put(g, 18, 32, "u"); rect(g, 13, 26, 1, 3, "u");
  const j = seed % 2;
  blobs(g, [
    { x: 15, y: 14, rx: 14, ry: 11.5 }, { x: 15, y: 6, rx: 8, ry: 6 },
    { x: 7 + j, y: 11, rx: 6.5 }, { x: 23 - j, y: 11, rx: 6.5 },
    { x: 15, y: 13, rx: 7, ry: 5.5 }, { x: 8, y: 18, rx: 6.5, ry: 5.5 },
    { x: 22, y: 18, rx: 6.5, ry: 5.5 }, { x: 15, y: 20, rx: 7.5, ry: 4.5 },
  ], "abcd");
  // owl-eye knot hole on the trunk
  if (seed % 2 === 0) { put(g, 13, 28, "y"); put(g, 16, 28, "y"); }
  return rowsOf(g);
}
export const TREE_NIGHT = defineProp({
  rows: nightTreeRows(0),
  pal: { ...LEAF_NIGHT, y: "#ffe888" },
  solid: { x: 11, y: 28, w: 10, h: 8 },
});
export const TREE_NIGHT_B = defineProp({
  rows: nightTreeRows(1),
  pal: { ...LEAF_NIGHT, y: "#ffe888" },
  solid: { x: 11, y: 28, w: 10, h: 8 },
});

/** Tall dark pine. */
export const PINE_NIGHT = defineProp({
  rows: (() => {
    const g = blank(18, 40);
    rect(g, 7, 33, 4, 6, "t"); rect(g, 9, 33, 2, 6, "u");
    const tiers = [{ y: 0, h: 11, w: 9 }, { y: 8, h: 13, w: 13 }, { y: 17, h: 14, w: 17 }];
    for (const t of tiers) for (let yy = 0; yy < t.h; yy++) {
      const half = Math.round(((yy + 1) / t.h) * (t.w / 2));
      for (let xx = -half; xx <= half; xx++) {
        const c = xx < -half / 3 ? "b" : xx < half / 3 ? "c" : "d";
        put(g, 9 + xx, t.y + yy, yy === t.h - 1 ? "d" : c);
      }
    }
    return rowsOf(g);
  })(),
  pal: { b: "#2e7060", c: "#1e5448", d: "#123830", t: "#6a4838", u: "#463024" },
  solid: { x: 6, y: 33, w: 8, h: 8 },
});

// ── The magic tree (centerpiece): glowing blue-violet leaves ─────────────────
export const MAGIC_TREE = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(58, 60);
    // roots + trunk
    rect(g, 23, 38, 12, 20, "t"); rect(g, 30, 38, 5, 20, "u");
    line(g, 23, 56, 17, 59, "t"); line(g, 34, 56, 41, 59, "u");
    rect(g, 26, 44, 1, 8, "u");
    rect(g, 27, 46, 4, 7, "v"); // hollow
    rect(g, 28, 47, 2, 5, "y");
    blobs(g, [
      { x: 29, y: 24, rx: 27, ry: 19 }, { x: 29, y: 10, rx: 14, ry: 9 },
      { x: 12, y: 22, rx: 11, ry: 9 }, { x: 46, y: 22, rx: 11, ry: 9 },
      { x: 20, y: 14, rx: 10, ry: 8 }, { x: 38, y: 14, rx: 10, ry: 8 },
      { x: 29, y: 28, rx: 20, ry: 9 },
    ], "abcd");
    // glow sparkles on the leaves
    const sp: [number, number][] = [[10, 18], [22, 8], [36, 10], [48, 20], [16, 28], [30, 22], [42, 30], [25, 16], [8, 26], [50, 28]];
    sp.forEach(([x, y], i) => { if (g[y]?.[x] !== ".") put(g, x, y, (i + f) % 2 ? "w" : "g"); });
    return rowsOf(g);
  }),
  fps: 1.2,
  pal: { a: "#a8a0ff", b: "#7a70e0", c: "#5a50b8", d: "#3c3488", t: "#6a4838", u: "#463024", v: "#241810", y: "#ffe888", w: "#ffffff", g: "#c8f4ff" },
  solid: { x: 14, y: 46, w: 30, h: 14 },
});

// ── Glow mushrooms (2-frame pulse) ───────────────────────────────────────────
function mushRows(size: "s" | "m" | "l", f: number): string[] {
  const dims = { s: [10, 10, 4], m: [16, 16, 6], l: [26, 24, 9] }[size];
  const [W, H, cap] = dims;
  const g = blank(W, H);
  const stemW = Math.max(2, Math.floor(W / 4));
  const sx = Math.floor((W - stemW) / 2);
  rect(g, sx, cap, stemW, H - cap, "s");
  rect(g, sx + stemW - 1, cap, 1, H - cap, "S");
  blobs(g, [{ x: W / 2, y: cap + 1, rx: W / 2 - 0.5, ry: cap }], "abcd", { crease: false });
  // flatten the underside of the cap
  for (let y = cap + 1; y < H; y++) for (let x = 0; x < W; x++) if (y > cap + 1 && (x < sx || x >= sx + stemW) && g[y][x] !== ".") g[y][x] = ".";
  // spots
  const spots: [number, number][] = size === "s" ? [[3, 2], [6, 3]] : size === "m" ? [[4, 3], [8, 2], [11, 4]] : [[6, 5], [12, 3], [18, 6], [9, 9]];
  spots.forEach(([x, y], i) => { if (g[y]?.[x] !== ".") put(g, x, y, (i + f) % 2 ? "w" : "g"); });
  return rowsOf(g);
}
const MUSH_BLUE = { a: "#b8f0ff", b: "#68c8f0", c: "#3c98d0", d: "#2468a0", s: "#e8f0f8", S: "#a8b8d0", w: "#ffffff", g: "#e8ffff" };
const MUSH_PINK = { a: "#ffc8f0", b: "#f888d0", c: "#d058a8", d: "#983878", s: "#f8f0e8", S: "#c8b8b0", w: "#ffffff", g: "#fff0fa" };
const MUSH_VIOLET = { a: "#e8d0ff", b: "#b890f0", c: "#8c64c8", d: "#60408c", s: "#f0e8f8", S: "#b8a8c8", w: "#ffffff", g: "#f8f0ff" };
export const MUSHROOM_S = defineProp({ frames: [mushRows("s", 0), mushRows("s", 1)], fps: 1, pal: MUSH_BLUE, solid: { x: 2, y: 5, w: 7, h: 6 } });
export const MUSHROOM_M = defineProp({ frames: [mushRows("m", 0), mushRows("m", 1)], fps: 1, pal: MUSH_PINK, solid: { x: 3, y: 9, w: 11, h: 8 } });
export const MUSHROOM_L = defineProp({ frames: [mushRows("l", 0), mushRows("l", 1)], fps: 0.8, pal: MUSH_VIOLET, solid: { x: 6, y: 14, w: 16, h: 12 } });
export const MUSHROOM_M_BLUE = defineProp({ frames: [mushRows("m", 1), mushRows("m", 0)], fps: 1, pal: MUSH_BLUE, solid: { x: 3, y: 9, w: 11, h: 8 } });

/** Toadstool fairy ring (flat on the ground). */
export const FAIRY_RING = defineProp({
  rows: (() => {
    const g = blank(34, 18);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const x = Math.round(16 + Math.cos(a) * 14), y = Math.round(8 + Math.sin(a) * 6);
      put(g, x, y, "r"); put(g, x + 1, y, "r"); put(g, x, y - 1, "R"); put(g, x + 1, y - 1, "w");
      put(g, x, y + 1, "s");
    }
    return rowsOf(g);
  })(),
  pal: { r: "#f06080", R: "#c03858", w: "#ffffff", s: "#f0e8d8" },
  outline: false,
  flat: true,
});

// ── Fairy (animated wings) ───────────────────────────────────────────────────
function fairyRows(f: number): string[] {
  const g = blank(14, 16);
  // wings
  if (f === 0) {
    stamp(g, 0, 3, ["ww....", "wWw...", ".wWw..", "..ww.."]);
    stamp(g, 8, 3, ["....ww", "...wWw", "..wWw.", "..ww.."]);
  } else {
    stamp(g, 1, 6, ["ww...", "wWww.", ".wWw."]);
    stamp(g, 8, 6, ["...ww", ".wwWw", ".wWw."]);
  }
  rect(g, 5, 2, 4, 4, "k"); rect(g, 5, 2, 4, 1, "K"); // hair
  rect(g, 6, 3, 2, 3, "f");
  put(g, 6, 4, "e"); put(g, 7, 4, "e");
  rect(g, 5, 6, 4, 4, "d"); rect(g, 5, 6, 1, 4, "D");
  rect(g, 6, 10, 1, 3, "f"); rect(g, 7, 10, 1, 3, "f");
  put(g, 6, 0, "y"); put(g, 7, 1, "y");
  return rowsOf(g);
}
export const FAIRY = defineProp({
  frames: [fairyRows(0), fairyRows(1)],
  fps: 4,
  pal: { w: "#d8f4ff", W: "#88c8f8", k: "#a05cd8", K: "#c890f8", f: "#ffd8c0", e: "#303050", d: "#f87cc0", D: "#c85098", y: "#fff8a0" },
  solid: null,
  baseY: 20,
});
export const FAIRY_PINK = defineProp({
  frames: [fairyRows(1), fairyRows(0)],
  fps: 3.5,
  pal: { w: "#ffe0f4", W: "#f8a0d8", k: "#f8c848", K: "#fff088", f: "#ffd8c0", e: "#303050", d: "#58c8f0", D: "#3898c8", y: "#fff8a0" },
  solid: null,
  baseY: 20,
});

// ── Fireflies (drifting glow dots) ───────────────────────────────────────────
export const FIREFLIES = defineProp({
  frames: [
    [".....y.......", "..y.......y..", ".........y...", "y.....y......", "......y....y."],
    ["..y.......y..", ".....y.......", "y.......y....", ".....y.....y.", "...y......y.."],
    ["...y.....y...", ".y.......y...", ".......y.....", "...y.....y...", "y.....y....y."],
  ],
  fps: 1.4,
  pal: { y: "#f8f878" },
  outline: false,
  solid: null,
  baseY: 40,
});

// ── Owl on a stump ───────────────────────────────────────────────────────────
export const OWL_STUMP = defineProp({
  rows: (() => {
    const g = blank(18, 28);
    rect(g, 2, 16, 14, 11, "t"); rect(g, 2, 16, 14, 2, "T"); rect(g, 12, 16, 4, 11, "u");
    rect(g, 4, 20, 1, 4, "u"); rect(g, 9, 22, 1, 3, "u");
    // owl
    blobs(g, [{ x: 9, y: 9, rx: 5.2, ry: 6.5 }], "abcd", { crease: false });
    rect(g, 3, 1, 3, 2, "c"); rect(g, 12, 1, 3, 2, "c"); // ear tufts
    ellipse(g, 6.5, 7, 2.4, 2.4, "w"); ellipse(g, 11.5, 7, 2.4, 2.4, "w");
    put(g, 6, 7, "k"); put(g, 7, 7, "k"); put(g, 11, 7, "k"); put(g, 12, 7, "k");
    put(g, 6, 6, "y"); put(g, 12, 6, "y");
    rect(g, 9, 9, 1, 2, "o");
    stamp(g, 7, 12, ["bbbb", "bcbc"]);
    rect(g, 6, 15, 2, 2, "o"); rect(g, 11, 15, 2, 2, "o");
    return rowsOf(g);
  })(),
  pal: { a: "#d8b898", b: "#b08c68", c: "#846448", d: "#5c4430", w: "#fff8e0", k: "#201810", y: "#ffd848", o: "#f8a030", t: "#7a5a40", T: "#a88060", u: "#4e3828" },
  solid: { x: 1, y: 18, w: 16, h: 10 },
});

// ── Gnome ────────────────────────────────────────────────────────────────────
export const GNOME = defineProp({
  rows: (() => {
    const g = blank(12, 20);
    stamp(g, 3, 0, [".rr.", ".rrr", "rrRr", "rrRR"]);
    rect(g, 2, 4, 8, 1, "R");
    rect(g, 3, 5, 6, 3, "f"); put(g, 4, 6, "k"); put(g, 7, 6, "k");
    rect(g, 2, 8, 8, 5, "w"); rect(g, 3, 9, 6, 4, "W"); // beard
    put(g, 6, 7, "n");
    rect(g, 2, 13, 8, 4, "b"); rect(g, 2, 13, 8, 1, "B");
    rect(g, 3, 17, 2, 2, "k"); rect(g, 7, 17, 2, 2, "k");
    return rowsOf(g);
  })(),
  pal: { r: "#e84848", R: "#a02838", f: "#f8c8a0", k: "#302020", w: "#ffffff", W: "#d8dcec", n: "#e89080", b: "#4878d8", B: "#6c98f0" },
  solid: { x: 2, y: 12, w: 8, h: 8 },
});

// ── Fairy house in a stump with glowing window ───────────────────────────────
export const FAIRY_HOUSE = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(34, 36);
    rect(g, 4, 12, 26, 22, "t"); rect(g, 4, 12, 4, 22, "T"); rect(g, 24, 12, 6, 22, "u");
    for (let y = 14; y < 32; y += 4) rect(g, 8, y, 1, 2, "u");
    line(g, 3, 33, 0, 35, "t"); line(g, 30, 33, 33, 35, "u");
    // roof (mushroom cap)
    blobs(g, [{ x: 17, y: 11, rx: 17, ry: 10 }], "abcd", { crease: false });
    for (let y = 12; y < 16; y++) for (let x = 0; x < 34; x++) if (g[y][x] !== "." && (x < 3 || x > 30)) g[y][x] = ".";
    [[8, 5], [16, 3], [24, 6], [12, 9], [21, 10]].forEach(([x, y]) => put(g, x, y, "w"));
    // door & window
    rect(g, 13, 22, 8, 12, "d"); rect(g, 14, 23, 6, 11, "D"); put(g, 19, 29, "y");
    rect(g, 7, 17, 5, 5, f ? "y" : "z"); rect(g, 9, 17, 1, 5, "u"); rect(g, 7, 19, 5, 1, "u");
    rect(g, 22, 17, 5, 5, f ? "z" : "y"); rect(g, 24, 17, 1, 5, "u"); rect(g, 22, 19, 5, 1, "u");
    // chimney
    rect(g, 26, 0, 4, 5, "s"); rect(g, 26, 0, 4, 1, "S");
    return rowsOf(g);
  }),
  fps: 0.7,
  pal: { a: "#ffb0c8", b: "#f06c98", c: "#c84878", d: "#8a3058", t: "#9a7050", T: "#c09068", u: "#5e4030", w: "#ffffff", D: "#4c3020", y: "#fff088", z: "#ffd058", s: "#a09088", S: "#6c6058" },
  solid: { x: 3, y: 22, w: 28, h: 14 },
});

// ── Glow crystals ────────────────────────────────────────────────────────────
function crystalRows(f: number): string[] {
  const g = blank(24, 22);
  const shard = (cx: number, base: number, h: number, w: number) => {
    for (let y = 0; y < h; y++) {
      const hw = Math.max(0, Math.round((w / 2) * (y < h * 0.3 ? y / (h * 0.3) : 1)));
      for (let x = -hw; x <= hw; x++) put(g, cx + x, base - h + y, x < -hw / 3 ? "a" : x < hw / 3 ? "b" : "c");
    }
    put(g, cx - 1, base - h + 2, f ? "w" : "a");
  };
  shard(6, 20, 14, 5); shard(12, 21, 20, 7); shard(18, 20, 12, 5); shard(9, 21, 9, 4);
  return rowsOf(g);
}
export const CRYSTALS = defineProp({
  frames: [crystalRows(0), crystalRows(1)],
  fps: 1,
  pal: { a: "#c8f0ff", b: "#70c0f8", c: "#3c88d0", w: "#ffffff" },
  solid: { x: 3, y: 14, w: 19, h: 10 },
});
export const CRYSTALS_PINK = defineProp({
  frames: [crystalRows(1), crystalRows(0)],
  fps: 1,
  pal: { a: "#ffd0f0", b: "#f890d8", c: "#c058b0", w: "#ffffff" },
  solid: { x: 3, y: 14, w: 19, h: 10 },
});

// ── Lantern post (warm light) ────────────────────────────────────────────────
export const LANTERN = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(10, 26);
    rect(g, 4, 7, 2, 18, "s"); rect(g, 2, 24, 6, 2, "S");
    rect(g, 1, 0, 8, 2, "S"); rect(g, 2, 2, 6, 5, f ? "y" : "z");
    rect(g, 3, 3, 2, 3, "w"); rect(g, 1, 7, 8, 1, "S");
    return rowsOf(g);
  }),
  fps: 1.5,
  pal: { s: "#6a7088", S: "#40465c", y: "#fff088", z: "#ffd058", w: "#ffffff" },
  solid: { x: 2, y: 22, w: 6, h: 6 },
});

// ── Night bushes, logs, rocks ────────────────────────────────────────────────
export const BUSH_NIGHT = defineProp({
  rows: (() => {
    const g = blank(20, 14);
    blobs(g, [{ x: 6, y: 8, rx: 6, ry: 5 }, { x: 13, y: 8, rx: 6.5, ry: 5 }, { x: 10, y: 5, rx: 6, ry: 4.5 }], "abcd");
    [[5, 5], [12, 7], [9, 3]].forEach(([x, y]) => put(g, x, y, "p"));
    return rowsOf(g);
  })(),
  pal: { ...LEAF_NIGHT, p: "#f8a0e8" },
  solid: { x: 1, y: 5, w: 20, h: 11 },
});
export const LOG_NIGHT = defineProp({
  rows: (() => {
    const g = blank(30, 12);
    rect(g, 3, 2, 24, 8, "t"); rect(g, 3, 2, 24, 2, "T"); rect(g, 3, 8, 24, 2, "u");
    for (const x of [8, 14, 20]) rect(g, x, 4, 1, 3, "u");
    ellipse(g, 3.5, 6, 3, 4, "T"); ellipse(g, 3.5, 6, 1.7, 2.6, "t"); put(g, 3, 6, "u");
    // moss + tiny mushrooms
    rect(g, 12, 1, 6, 2, "m"); put(g, 22, 1, "g"); put(g, 23, 0, "g");
    return rowsOf(g);
  })(),
  pal: { t: "#7a5a40", T: "#a88060", u: "#4e3828", m: "#4aa070", g: "#f8a0e8" },
  solid: { x: 1, y: 3, w: 29, h: 10 },
});
export const MOSS_ROCK = defineProp({
  rows: (() => {
    const g = blank(18, 13);
    blobs(g, [{ x: 7, y: 8, rx: 6.5, ry: 4.6 }, { x: 12.5, y: 8, rx: 4.5, ry: 3.8 }], "abcd");
    rect(g, 3, 2, 6, 2, "m"); rect(g, 4, 1, 3, 1, "m");
    return rowsOf(g);
  })(),
  pal: { a: "#a8b0c8", b: "#808aa8", c: "#5e6888", d: "#444e6c", m: "#4aa070" },
  solid: { x: 0, y: 4, w: 19, h: 11 },
});
