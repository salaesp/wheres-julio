// Props for El Bosque Encantado. Two kinds of pieces:
//  • "hero" props drawn by hand (magic tree, fairy cottage, glow mushrooms,
//    crystals, owl, gnomes, lanterns, signs, fairies…) with 4–6 tones each;
//  • the trees, bushes, rocks, logs, fences, tents… that the other worlds
//    already use, re-tinted with the blue-teal night palette so the forest
//    reads as one family with the rest of the game.
import { defineProp, type PropDef } from "../props";
import { blank, put, rect, rowsOf, stamp, type CharGrid } from "../shapes";
import { ellipse, line, text, textWidth } from "./pixkit";
import { hash2 } from "../terrain";
import { nightPal } from "../terrains/enchanted";
import type { Pal } from "../sprite";
import { TREE, TREE_B, TREE_SMALL, PINE, BUSH, BUSH_FLOWER, ROCK, ROCK_BIG, STUMP, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX } from "./nature";
import { JUNGLE_TREE, JUNGLE_TREE_B, FERN, MOSSY_ROCK, MOSSY_ROCK_BIG, LOG, BIG_LEAVES } from "./jungle";
import { BENCH, LILYPAD } from "./park";
import { WELL, REEDS } from "./farm";
import { LOG_FENCE_H, LOG_POST, LOG_FENCE_V } from "./zoo";
import { TENT_ORANGE, CAMPFIRE, BRIDGE_POST, CRATES, BACKPACKS } from "./volcano";

// ════════════════════════════════════════════════════════════════════════════
// Re-tinted props from other worlds
// ════════════════════════════════════════════════════════════════════════════
function retint(P: PropDef, o: { dark?: number; keep?: string[]; over?: Pal } = {}): PropDef {
  return defineProp({
    rows: P.rows, frames: P.frames, fps: P.fps,
    pal: { ...nightPal(P.pal as Record<string, string>, o.dark ?? 0.74, o.keep), ...o.over },
    solid: P.solid, flat: P.flat, outline: P.outline, baseY: P.baseY,
  });
}
const LEAFY_KEEP = ["p", "y", "r", "R", "w", "m", "M"];

export const TREE_N = retint(TREE, { dark: 0.78 });
export const TREE_N_B = retint(TREE_B, { dark: 0.74 });
export const TREE_N_S = retint(TREE_SMALL, { dark: 0.78 });
export const PINE_N = retint(PINE, { dark: 0.72 });
export const OLD_TREE = retint(JUNGLE_TREE, { dark: 0.72, keep: ["p", "y"] });
export const OLD_TREE_B = retint(JUNGLE_TREE_B, { dark: 0.68, keep: ["p", "y"] });
export const BUSH_N = retint(BUSH, { dark: 0.8 });
export const BUSH_N_FLOWER = retint(BUSH_FLOWER, { dark: 0.8, keep: ["r", "R"], over: { r: "#f890d8", R: "#b04a8c" } });
export const FERN_N = retint(FERN, { dark: 0.8 });
export const BIG_LEAVES_N = retint(BIG_LEAVES, { dark: 0.78, keep: LEAFY_KEEP });
export const ROCK_N = retint(ROCK, { dark: 0.62 });
export const ROCK_BIG_N = retint(ROCK_BIG, { dark: 0.6 });
export const MOSSY_ROCK_N = retint(MOSSY_ROCK, { dark: 0.7, keep: ["m", "M"], over: { m: "#4cb8a0", M: "#2c8478" } });
export const MOSSY_ROCK_BIG_N = retint(MOSSY_ROCK_BIG, { dark: 0.7, keep: ["m", "M"], over: { m: "#4cb8a0", M: "#2c8478" } });
export const STUMP_N = retint(STUMP, { dark: 0.78 });
export const LOG_N = retint(LOG, { dark: 0.78, keep: ["r", "R", "w"], over: { m: "#4cb8a0", M: "#2c8478", r: "#f890d8", R: "#b04a8c" } });
export const BENCH_N = retint(BENCH, { dark: 0.8 });
export const WELL_N = retint(WELL, { dark: 0.78, keep: ["w", "W"], over: { w: "#4a98dc", W: "#8cd4f8" } });
export const REEDS_N = retint(REEDS, { dark: 0.8, keep: ["m", "M"] });
export const LILYPAD_N = retint(LILYPAD, { dark: 0.8, over: { g: "#1f6a62", G: "#3a9884" } });
export const FENCE_H = retint(LOG_FENCE_H, { dark: 0.8 });
export const FENCE_POST = retint(LOG_POST, { dark: 0.8 });
export const FENCE_V = retint(LOG_FENCE_V, { dark: 0.8 });
export const TENT_N = retint(TENT_ORANGE, { dark: 0.9, over: { a: "#d8a8f8", b: "#a870e0", c: "#7c48b4", d: "#4e2c80" } });
export const CAMPFIRE_N = retint(CAMPFIRE, { dark: 1, keep: ["r", "Y", "L"] });
export const POST_N = retint(BRIDGE_POST, { dark: 0.9 });
export const CRATES_N = retint(CRATES, { dark: 0.78 });
export const BACKPACKS_N = retint(BACKPACKS, { dark: 0.85, keep: ["r", "R"] });
export const FLOWERS_PINK = retint(FLOWERS_MIX, { dark: 0.9, keep: ["r", "R", "y", "Y", "w", "W", "p", "P"], over: { g: "#1f6a62", r: "#f890d8", R: "#b04a8c", p: "#9ad8f8", P: "#4a98c8" } });
export const FLOWERS_GLOW_Y = retint(FLOWERS_YELLOW, { dark: 0.9, keep: ["y", "Y"], over: { g: "#1f6a62" } });
export const FLOWERS_GLOW_R = retint(FLOWERS_RED, { dark: 0.9, keep: ["r", "R"], over: { g: "#1f6a62", r: "#f890d8", R: "#b04a8c" } });

// ════════════════════════════════════════════════════════════════════════════
// Drawing helpers
// ════════════════════════════════════════════════════════════════════════════
const DARKER: Record<string, string> = { t: "u", u: "v", v: "k", k: "k" };
const LIGHTER: Record<string, string> = { k: "v", v: "u", u: "t", t: "t" };
/** Shaded bark block lit from the left, with vertical streaks. */
function bark(g: CharGrid, x0: number, x1: number, y0: number, y1: number, seed = 0) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const rel = (x - x0) / Math.max(1, x1 - x0 - 1);
    let c = rel < 0.2 ? "t" : rel < 0.5 ? "u" : rel < 0.8 ? "v" : "k";
    if ((x * 13 + seed) % 5 === 0 && (y + x * 3) % 7 < 4) c = DARKER[c];
    else if ((x * 7 + y * 5 + seed) % 29 === 0) c = LIGHTER[c];
    put(g, x, y, c);
  }
}
/** Mirror the left half; the right half is shaded one step darker. */
function mirrorShaded(rows: readonly string[], map: Record<string, string>, fromRow = 0, toRow = rows.length): string[] {
  return rows.map((r, i) => {
    const right = r.split("").reverse().map((ch) => (i >= fromRow && i < toRow ? map[ch] ?? ch : ch)).join("");
    return r + right;
  });
}
const CAP_SHADE: Record<string, string> = { a: "b", b: "c", c: "d" };

// ════════════════════════════════════════════════════════════════════════════
// THE MAGIC TREE (centrepiece): violet-blue crown that twinkles, a hollow door
// glowing from inside, hanging glow orbs, big roots.
// ════════════════════════════════════════════════════════════════════════════
const MT_W = 72, MT_H = 88;
const MT_C = 36;
const MT_LOBES: [number, number, number, number][] = ([
  [31, 24, 28, 19], [31, 9, 15, 8], [11, 25, 11, 11], [51, 25, 11, 11], [19, 12, 12, 9],
  [43, 12, 12, 9], [31, 34, 22, 10], [15, 36, 11, 7], [47, 36, 11, 7], [6, 32, 6, 6], [56, 32, 6, 6],
] as [number, number, number, number][]).map(([x, y, rx, ry]) => [MT_C + (x - 31) * 1.17, y * 1.1, rx * 1.17, ry * 1.1]);
function magicTreeRows(f: number): string[] {
  const g = blank(MT_W, MT_H);
  const cx = MT_C;
  // trunk
  for (let y = 42; y < MT_H - 2; y++) {
    const hw = y < 64 ? 9 + (y > 56 ? 1 : 0) : Math.round(10 + (y - 64) * 0.5);
    bark(g, cx - hw, cx + hw, y, y + 1, y > 64 ? 3 : 0);
  }
  // glowing moss, knots and runes on the bark
  for (const [mx, my] of [[-6, 50], [5, 56], [-4, 63], [7, 66], [-8, 72], [9, 76]] as const) stamp(g, cx + mx, my, ["m.m", "mqm"]);
  for (const [mx, my] of [[-3, 47], [3, 60], [-6, 68]] as const) stamp(g, cx + mx, my, [".kk.", "kvvk", ".kk."]);
  // buttress roots
  for (let i = 0; i < 3; i++) {
    line(g, cx - 13 - i, 74 + i * 3, cx - 21 - i * 3, 83 + i, "u");
    line(g, cx - 12 - i, 75 + i * 3, cx - 20 - i * 3, 84 + i, "v");
    line(g, cx + 13 + i, 74 + i * 3, cx + 21 + i * 3, 83 + i, "v");
    line(g, cx + 12 + i, 75 + i * 3, cx + 20 + i * 3, 84 + i, "k");
  }
  // glowing hollow door
  const door = [
    "..kkkk..", ".kkFFkk.", "kkFFYYFk", "kFFYYYYF", "kFYYYYYF", "kFYYYYYF", "kFYYYYYF",
    "kFYYYYYF", "kFYYYYYF", "kFFYYYFF", "kFFFFFFF", "kkkkkkkk",
  ].map((r) => (f ? r.replace(/Y/g, "y") : r));
  stamp(g, cx - 4, 70, door);
  rect(g, cx - 6, 82, 12, 1, "k");
  // leaf clumps
  const inside = (x: number, y: number, grow = 0) =>
    MT_LOBES.some(([lx, ly, rx, ry]) => ((x + 0.5 - lx) / (rx + grow)) ** 2 + ((y + 0.5 - ly) / (ry + grow)) ** 2 <= 1);
  const ramp = "habcde";
  const centers: [number, number, number][] = [];
  for (let r = -1; r < 12; r++) for (let c = -1; c < 12; c++) {
    const jx = (hash2(c, r, 1) % 3) - 1, jy = (hash2(c, r, 2) % 3) - 1;
    centers.push([c * 8 + (r & 1) * 4 + 4 + jx, r * 6 + 3 + jy, hash2(c, r, 3) % 100]);
  }
  for (let y = 0; y < 56; y++) for (let x = 0; x < MT_W; x++) {
    if (!inside(x, y, 2.5)) continue;
    let best = 1e9, bi = 0;
    for (let i = 0; i < centers.length; i++) {
      const [ccx, ccy] = centers[i];
      if (Math.abs(ccx - x) > 7 || Math.abs(ccy - y) > 6) continue;
      const d = ((x + 0.5 - ccx) / 4.6) ** 2 + ((y + 0.5 - ccy) / 3.4) ** 2;
      if (d < best) { best = d; bi = i; }
    }
    // scalloped silhouette: the outer rim only keeps whole leaf clumps
    if (!inside(x, y, -2.5) && !(best <= 0.85 && inside(x, y, 1.5))) continue;
    const [ccx, ccy, rnd] = centers[bi];
    const nx = (x - MT_C) / 35, ny = (y - 24) / 28;
    let tone = 2.5 + (nx * 0.55 + ny * 0.95) * 1.5;
    const dx = x + 0.5 - ccx, dy = y + 0.5 - ccy;
    tone += Math.round(-(dx * 0.12 + dy * 0.42) * 0.85);
    if (best > 0.72 && dy > 0.8) tone += 1;
    if (rnd < 18) tone -= 1; else if (rnd > 86) tone += 1;
    g[y][x] = ramp[Math.max(0, Math.min(5, Math.round(tone)))];
  }
  // twinkles
  const sc = (l: [number, number][]) => l.map(([x, y]) => [Math.round(MT_C + (x - 31) * 1.17), Math.round(y * 1.1)] as [number, number]);
  const A = sc([[10, 20], [22, 8], [38, 10], [50, 22], [17, 31], [31, 21], [43, 32], [27, 14], [8, 27], [54, 30], [35, 28], [46, 12]]);
  const B = sc([[14, 15], [30, 5], [45, 16], [24, 26], [38, 38], [52, 28], [12, 36], [31, 33], [20, 20], [40, 22]]);
  (f ? B : A).forEach(([x, y]) => {
    if (g[y]?.[x] !== ".") { put(g, x, y, "w"); if (g[y][x - 1] !== ".") put(g, x - 1, y, "g"); if (g[y][x + 1] !== ".") put(g, x + 1, y, "g"); put(g, x, y - 1, g[y - 1]?.[x] !== "." ? "g" : "."); }
  });
  (f ? A : B).forEach(([x, y]) => { if (g[y]?.[x] !== ".") put(g, x, y, "h"); });
  // hanging glow orbs
  const orbs: [number, number, number][] = [[14, 45, 5], [28, 50, 4], [44, 50, 5], [58, 44, 4], [8, 37, 3], [64, 38, 3]];
  orbs.forEach(([x, y, l], i) => {
    for (let k = 1; k <= l; k++) put(g, x, y - k, "k");
    const on = (i + f) % 2 === 0;
    stamp(g, x - 1, y, on ? [".g.", "gwg", ".g."] : [".q.", "qgq", ".q."]);
  });
  return rowsOf(g);
}
export const MAGIC_TREE = defineProp({
  frames: [magicTreeRows(0), magicTreeRows(1)],
  fps: 1.1,
  pal: {
    h: "#e6e0ff", a: "#b9adff", b: "#8f81f2", c: "#6c5ed2", d: "#4b3fa6", e: "#362e82",
    t: "#8c6a56", u: "#6c4e44", v: "#4c363a", k: "#2a1e26", m: "#3c9c90",
    w: "#ffffff", g: "#c4f4ff", q: "#6cc8ec", Y: "#fff2a8", y: "#ffe070", F: "#f8a844",
  },
  solid: { x: 20, y: 70, w: 32, h: 17 },
});

// ════════════════════════════════════════════════════════════════════════════
// Fairy cottage: a hollow stump with a spotted pink mushroom roof
// ════════════════════════════════════════════════════════════════════════════
const CAP_HALF = [
  "..............aaaaaa",
  "...........aaaaabbbb",
  "........aaaabbbbbbbb",
  "......aaabbbbbbwwbbb",
  ".....aabbbbbbbwwwbbb",
  "....aabbbbbbbbbwbbbb",
  "...aabbbwwbbbbbbbbbb",
  "..aabbbwwwbbbbbbbbbb",
  "..abbbbbwbbbbbbbbbbb",
  ".aabbbbbbbbbbbbwwbbb",
  ".abbbbbbbbbbbbwwwbbb",
  "abbbbbbbbbbbbbbwbbbb",
  "abbbbbbbbbbbbbbbbbbb",
  "bcccccccccccccccccc c".replace(" ", "c"),
  "cddddddddddddddddddd",
];
function cottageRows(f: number): string[] {
  const W = 40, H = 54;
  const g = blank(W, H);
  const top = 9; // room for smoke
  // chimney behind the roof
  stamp(g, 27, top - 2, ["sSSs", "sSSs", "sSSs", "sSSs", "sSSs", "aSSs"]);
  rect(g, 26, top - 3, 6, 1, "a");
  // smoke wisps (animated)
  const smoke = f ? [[29, 4], [30, 2], [29, 0]] : [[30, 4], [29, 2], [30, 0]];
  smoke.forEach(([x, y]) => stamp(g, x - 1, y, ["zz.", ".zz"]));
  // trunk
  const body0 = top + 14;
  for (let y = body0; y < H - 1; y++) {
    const flare = y > H - 8 ? Math.round((y - (H - 8)) * 0.6) : 0;
    bark(g, 6 - flare, 34 + flare, y, y + 1, 2);
  }
  // mossy roots + base details
  line(g, 5, H - 4, 1, H - 1, "u"); line(g, 34, H - 4, 38, H - 1, "k");
  stamp(g, 8, H - 4, ["mm.m", "mMmM"]); stamp(g, 27, H - 3, ["Mm", "mM"]);
  // windows
  const win = (x: number) => {
    stamp(g, x, body0 + 3, [".kkkk.", "kYYzzk", "kYYzzk", "kkkkkk", "kYYzzk", "kYYzzk", ".kkkk."].map((r) => (f ? r.replace(/z/g, "Y") : r)));
    rect(g, x - 1, body0 + 10, 8, 1, "D"); stamp(g, x, body0 + 9, ["p.rp.p"]);
  };
  win(8); win(26);
  // little round door
  stamp(g, 16, body0 + 6, [
    "..kkkkkk..", ".kDDDDDDk.", "kDDDeDDDDk", "kDDDeDDDDk", "kDDDeDDDDk", "kDDDeDDDDk",
    "kDDDeDDDDk", "kDDDeDyDDk", "kDDDeDDDDk", "kDDDeDDDDk", "kDDDeDDDDk", "kkkkkkkkkk",
  ]);
  stamp(g, 14, body0 + 18, ["aaaaaaaaaaaa", "bbbbbbbbbbbb"]);
  // roof (mushroom cap)
  const cap = mirrorShaded(CAP_HALF, CAP_SHADE, 0, 12);
  stamp(g, 0, top, cap);
  // glowing mini mushrooms at the door
  stamp(g, 12, H - 5, [".uu.", "uUUu", ".ss."]); stamp(g, 25, H - 4, [".r.", "rRr", ".s."]);
  return rowsOf(g);
}
export const FAIRY_HOUSE = defineProp({
  frames: [cottageRows(0), cottageRows(1)],
  fps: 0.8,
  pal: {
    a: "#ffc4de", b: "#f282b0", c: "#c85a8c", d: "#8c3a68", w: "#ffffff",
    t: "#b08868", u: "#8c6850", v: "#684a3c", k: "#3a2a2c", D: "#5c4030", e: "#3c2a22", y: "#ffd860",
    Y: "#fff0a0", z: "#d4dcf0", s: "#b8b4c8", S: "#7c7898", p: "#f890d8", r: "#f05878", R: "#b8304c",
    m: "#58b8a0", M: "#2e8878", u2: "#8cd8f8", U: "#3c98c4",
  },
  solid: { x: 2, y: 36, w: 36, h: 18 },
});

// ════════════════════════════════════════════════════════════════════════════
// Bioluminescent mushrooms (2 frames) in three sizes and three colours
// ════════════════════════════════════════════════════════════════════════════
const MUSH_HALF: Record<"s" | "m" | "l", { cap: string[]; stem: number; stemH: number; glow: [number, number][][] }> = {
  s: {
    cap: ["..aaa", ".aabb", "aabwb", "abbbb", "bbbbc", "ccccc"],
    stem: 1, stemH: 4,
    glow: [[[3, 1]], [[1, 3]]],
  },
  m: {
    cap: ["...aaaa", ".aaabbb", "aabbbwb", "abbbwwb", "abbbbbb", "bbwbbbc", "bbbbbcc", "ccccccc", ".ddddd."],
    stem: 2, stemH: 6,
    glow: [[[5, 2], [2, 5]], [[3, 1], [6, 4]]],
  },
  l: {
    cap: [".....aaaaaa", "...aaaaabbb", "..aaabbbbbb", ".aaabbbwwbb", ".aabbbbwwbb", "aabbbbbbbbb", "aabbwwbbbbb", "abbbwwbbbbc", "abbbbbbbbcc", "bbbbbbbbbcc", "bcccccccccc", ".ddddddddd."],
    stem: 3, stemH: 9,
    glow: [[[8, 2], [3, 5], [9, 8]], [[5, 1], [1, 6], [7, 4]]],
  },
};
function mushRows(size: "s" | "m" | "l", f: number): string[] {
  const { cap, stem, stemH, glow } = MUSH_HALF[size];
  const half = cap[0].length;
  const capRows = cap.map((r) => r.padEnd(half, ".").slice(0, half));
  const capH = capRows.length;
  const rows = mirrorShaded(capRows, CAP_SHADE, 0, capH - (size === "s" ? 1 : 2));
  const W = half * 2;
  const g = rows.map((r) => r.split(""));
  const stemRows: string[][] = [];
  for (let y = 0; y < stemH; y++) {
    const hw = stem + (y > stemH - 3 ? 1 : 0);
    const r = Array<string>(W).fill(".");
    for (let x = half - hw; x < half + hw; x++) r[x] = x < half - hw / 2 ? "s" : x < half + hw / 2 ? "S" : "T";
    stemRows.push(r);
  }
  const all = [...g, ...stemRows];
  glow[f].forEach(([x, y]) => { if (all[y][x] !== ".") all[y][x] = "g"; if (all[y][W - 1 - x] !== "." && f) all[y][W - 1 - x] = "g"; });
  return all.map((r) => r.join(""));
}
const MUSH_BLUE: Pal = { a: "#c4f6ff", b: "#6cd0f4", c: "#3c9ad0", d: "#2468a0", w: "#ffffff", g: "#f4ffff", s: "#e4f0f8", S: "#b0c4dc", T: "#8098b8" };
const MUSH_PINK: Pal = { a: "#ffd0f4", b: "#f88cd8", c: "#d05cb0", d: "#983c80", w: "#ffffff", g: "#fff4fc", s: "#f8f0ec", S: "#d4c4c4", T: "#a8949c" };
const MUSH_VIOLET: Pal = { a: "#eadcff", b: "#b894f4", c: "#8c68cc", d: "#60408e", w: "#ffffff", g: "#fbf6ff", s: "#f2eaf6", S: "#c0b0d0", T: "#9484ac" };
function mushProp(size: "s" | "m" | "l", pal: Pal, fps: number, phase = 0) {
  const fr = [mushRows(size, phase), mushRows(size, 1 - phase)];
  const dims = { s: { x: 1, y: 4, w: 8, h: 7 }, m: { x: 2, y: 8, w: 11, h: 9 }, l: { x: 3, y: 12, w: 17, h: 12 } }[size];
  return defineProp({ frames: fr, fps, pal, solid: dims });
}
export const MUSH_S_BLUE = mushProp("s", MUSH_BLUE, 1);
export const MUSH_S_PINK = mushProp("s", MUSH_PINK, 1.2, 1);
export const MUSH_M_BLUE = mushProp("m", MUSH_BLUE, 0.9);
export const MUSH_M_PINK = mushProp("m", MUSH_PINK, 1, 1);
export const MUSH_L_VIOLET = mushProp("l", MUSH_VIOLET, 0.8);
export const MUSH_L_BLUE = mushProp("l", MUSH_BLUE, 0.7, 1);
export const MUSH_L_PINK = mushProp("l", MUSH_PINK, 0.75);

/** Ring of little red toadstools lying on the ground. */
export const FAIRY_RING = defineProp({
  rows: (() => {
    const g = blank(48, 26);
    const n = 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.3;
      const x = Math.round(21 + Math.cos(a) * 19), y = Math.round(9 + Math.sin(a) * 8);
      stamp(g, x, y, i % 3 === 1 ? [".bb.", "bwbb", ".s.."] : [".rr.", "rwrR", ".s.."]);
    }
    for (const [x, y] of [[21, 13], [14, 10], [28, 14], [23, 8]] as const) put(g, x, y, "y");
    return rowsOf(g);
  })(),
  pal: { r: "#f0587c", R: "#b83454", b: "#78d8f8", w: "#ffffff", s: "#f2eadc", y: "#fff0a0" },
  flat: true,
  solid: null,
});

// ════════════════════════════════════════════════════════════════════════════
// Glow crystals (faceted shards, 2-frame sparkle)
// ════════════════════════════════════════════════════════════════════════════
function shard(g: CharGrid, cx: number, base: number, h: number, w: number) {
  const tip = Math.max(3, Math.round(h * 0.28));
  for (let y = 0; y < h; y++) {
    const half = y < tip ? Math.max(1, Math.round(((y + 1) / tip) * (w / 2))) : w / 2;
    for (let x = cx - half; x < cx + half; x++) {
      const rel = (x - (cx - half)) / (2 * half);
      let c = rel < 0.34 ? "a" : rel < 0.7 ? "b" : "c";
      if (y === h - 1) c = "d";
      if (x === cx - half && y > 1) c = "h";
      put(g, x, base - h + y, c);
    }
  }
  put(g, cx - 1, base - h + 2, "h");
}
function crystalRows(f: number): string[] {
  const g = blank(30, 28);
  for (const [x, y, rx, ry] of [[8, 25, 8, 2.4], [20, 25, 9, 2.6], [14, 26, 6, 1.8]] as const) ellipse(g, x, y, rx, ry, "e");
  shard(g, 7, 26, 15, 6);
  shard(g, 22, 26, 13, 6);
  shard(g, 15, 27, 24, 8);
  shard(g, 11, 27, 11, 4);
  shard(g, 19, 27, 9, 4);
  ellipse(g, 6, 26, 2, 1, "E");
  stamp(g, f ? 12 : 17, f ? 6 : 12, [".w.", "www", ".w."]);
  put(g, f ? 5 : 24, f ? 14 : 15, "w");
  return rowsOf(g);
}
const CRY_BLUE: Pal = { h: "#ffffff", a: "#c8f6ff", b: "#74d0f6", c: "#3c90d0", d: "#26609c", w: "#ffffff", e: "#5a6a88", E: "#3c4a68" };
const CRY_PINK: Pal = { h: "#ffffff", a: "#ffd4f4", b: "#f890dc", c: "#c458b4", d: "#843c84", w: "#ffffff", e: "#5a6a88", E: "#3c4a68" };
const CRY_VIOLET: Pal = { h: "#ffffff", a: "#e4d4ff", b: "#a88cf4", c: "#7458cc", d: "#483c92", w: "#ffffff", e: "#5a6a88", E: "#3c4a68" };
const crystalProp = (pal: Pal, f0: number) => defineProp({
  frames: [crystalRows(f0), crystalRows(1 - f0)], fps: 1, pal, solid: { x: 2, y: 16, w: 27, h: 12 },
});
export const CRYSTALS_BLUE = crystalProp(CRY_BLUE, 0);
export const CRYSTALS_PINK = crystalProp(CRY_PINK, 1);
export const CRYSTALS_VIOLET = crystalProp(CRY_VIOLET, 0);

// ════════════════════════════════════════════════════════════════════════════
// Owl on a stump (blinks), gnomes
// ════════════════════════════════════════════════════════════════════════════
function owlRows(blink: boolean): string[] {
  const g = blank(20, 32);
  // stump
  stamp(g, 1, 17, [
    "..aaaaaaaaaaaaaa..", ".abbbbbbbbbbbbbba.", ".abbbcccccccbbbba.", ".abbcccddddcccbba.", ".abbbcccccccbbbba.",
    ".attaaaaaaaaaauua.", ".ttttttttuuuuuuuu.", ".ttkttttuuuuukuuu.", "ttttttttuuuuuuuuuu", "ttttktttuuuuuuuuuv",
    "tttttttuuuuuuukuuv", "tttkttttuuuuuuuuvv", ".tvvvvvvvvvvvvvvv.", "..vv..........vv..",
  ].map((r) => r.slice(0, 18)));
  // body & head
  stamp(g, 4, 3, [
    "..oo..........oo..".slice(0, 12),
    ".oooo........oooo".slice(0, 12),
    "oooooooooooo",
    "ooLLLLLLLLoo",
    "oLLwwwLLwwwL",
    "oLwwkkwwkkwL",
    "oLwwkkwwkkwL",
    "oLLwwwLyLwww".slice(0, 12),
    "ooLLLLyyLLoo",
    "ooLbbLLLbbLo",
    "oobbbbbbbbbo",
    ".oobbbbbbboo",
    "..ooccccoo..",
  ]);
  if (blink) { stamp(g, 6, 7, ["LLLLLLLLLL"]); stamp(g, 6, 8, ["LkkLLLLkkL"]); stamp(g, 6, 9, ["LLLLLLLLLL"]); }
  // feet
  stamp(g, 7, 16, ["yy..yy"]);
  return rowsOf(g);
}
export const OWL_STUMP = defineProp({
  frames: [owlRows(false), owlRows(false), owlRows(false), owlRows(true)],
  fps: 0.8,
  pal: {
    a: "#c8a47c", b: "#a88058", c: "#785438", d: "#4c3426", t: "#8c6444", u: "#684830", v: "#3c281e", k: "#241812",
    o: "#a88e74", L: "#d4bc9c", b2: "#fff", w: "#fff6dc", y: "#f8b840",
  },
  solid: { x: 1, y: 22, w: 18, h: 11 },
});

function gnomeRows(): string[] {
  return [
    "....rr......",
    "...rrrr.....",
    "..rrrrRr....",
    "..rrrrRR....",
    ".rrrrrrRR...",
    "rrrrrrrRRR..",
    "RRRRRRRRRRR.",
    "..ffffffff..",
    "..fkfffkff..",
    "..ffffnfff..",
    ".wwwwwwwwww.",
    "wwwwwwwwwWWw",
    "wwwwwwwwwWWw",
    ".bbwwwwwWWb.",
    ".bbbwwwWWbb.",
    ".bbbbbbbbbb.",
    "bbBbbbbbbBbb",
    ".bbbbbbbbbb.",
    "..kk....kk..",
    ".kkk....kkk.",
  ];
}
export const GNOME_RED = defineProp({
  rows: gnomeRows(),
  pal: { r: "#e8505c", R: "#a02c44", f: "#f8cfa8", k: "#2c2030", w: "#ffffff", W: "#cdd4ec", n: "#ec9488", b: "#5a7ce0", B: "#8cb0f8" },
  solid: { x: 1, y: 15, w: 10, h: 7 },
});
export const GNOME_BLUE = defineProp({
  rows: gnomeRows(),
  pal: { r: "#5a8cf0", R: "#3458b4", f: "#e8b890", k: "#2c2030", w: "#f4f4ff", W: "#c4c8e4", n: "#d88478", b: "#d85c9c", B: "#f890c8" },
  solid: { x: 1, y: 15, w: 10, h: 7 },
});
export const GNOME_ORANGE = defineProp({
  rows: gnomeRows(),
  pal: { r: "#f09838", R: "#b05c20", f: "#c89068", k: "#2c2030", w: "#ececf4", W: "#b8bcd4", n: "#b86c58", b: "#8a5cd8", B: "#b890f4" },
  solid: { x: 1, y: 15, w: 10, h: 7 },
});

// ════════════════════════════════════════════════════════════════════════════
// Lanterns
// ════════════════════════════════════════════════════════════════════════════
function lanternRows(f: number): string[] {
  const g = blank(10, 34);
  stamp(g, 0, 0, [
    "...kkkk...", "..kbbbbk..", ".kkkkkkkk.", ".kYYYYYYk.", ".kYwwwwYk.", ".kYwwwwYk.", ".kYYYYYYk.", ".kkkkkkkk.", "..kbbbbk..", "...kkkk...",
  ].map((r) => (f ? r.replace(/Y/g, "F").replace(/w/g, "Y") : r)));
  for (let y = 10; y < 30; y++) { put(g, 4, y, "b"); put(g, 5, y, "p"); }
  stamp(g, 0, 30, ["...kkkk...", "..kbbbpk..", ".kbbbbppk.", ".kkkkkkkk."]);
  return rowsOf(g);
}
export const LANTERN = defineProp({
  frames: [lanternRows(0), lanternRows(1)],
  fps: 2,
  pal: { k: "#252a44", b: "#6a7aa6", p: "#3c4668", Y: "#ffe27a", w: "#ffffff", F: "#ffbe58" },
  solid: { x: 2, y: 28, w: 6, h: 8 },
});
export const LANTERN_LOW = defineProp({
  frames: [0, 1].map((f) => [
    "..kkkk..", ".kYYYYk.", "kYwwwwYk", "kYwwwwYk", ".kYYYYk.", ".kkkkkk.",
  ].map((r) => (f ? r.replace(/Y/g, "F").replace(/w/g, "Y") : r))),
  fps: 2.4,
  pal: { k: "#252a44", Y: "#ffe27a", w: "#ffffff", F: "#ffbe58" },
  solid: { x: 0, y: 3, w: 10, h: 5 },
});

/** Warm pool of lantern light on the ground (dithered, flat). */
export const LIGHT_POOL = defineProp({
  rows: (() => {
    const g = blank(40, 18);
    ellipse(g, 20, 9, 19, 8, (x, y) => ((x + y) % 2 ? "l" : "."));
    ellipse(g, 20, 9, 11, 4.6, (x, y) => ((x + y) % 2 ? "L" : "l"));
    return rowsOf(g);
  })(),
  pal: { l: "#3f9a82", L: "#58b498" },
  outline: false, flat: true, solid: null,
});

// ════════════════════════════════════════════════════════════════════════════
// Fairies and fireflies (animated, walk-through)
// ════════════════════════════════════════════════════════════════════════════
function fairyRows(f: number): string[] {
  const g = blank(16, 18);
  if (f === 0) {
    stamp(g, 0, 3, ["ww....", "wWww..", ".wWWw.", "..wWw.", "...ww."]);
    stamp(g, 10, 3, ["....ww", "..wwWw", ".wWWw.", ".wWw..", ".ww..."]);
  } else {
    stamp(g, 1, 6, ["ww...", "wWww.", ".wWWw", "..wW."]);
    stamp(g, 10, 6, ["...ww", ".wwWw", "wWWw.", ".Ww.."]);
  }
  rect(g, 6, 2, 4, 5, "k"); rect(g, 6, 2, 4, 1, "K"); put(g, 5, 4, "k"); put(g, 10, 4, "k");
  rect(g, 6, 4, 4, 3, "f"); put(g, 7, 5, "e"); put(g, 9, 5, "e");
  rect(g, 6, 7, 4, 4, "d"); rect(g, 6, 7, 1, 4, "D"); rect(g, 5, 10, 6, 1, "d");
  rect(g, 7, 11, 1, 3, "f"); rect(g, 9, 11, 1, 3, "f");
  put(g, 5, 0, "y"); put(g, 7, 1, "y"); put(g, 8, 0, "y");
  return rowsOf(g);
}
export const FAIRY_PURPLE = defineProp({
  frames: [fairyRows(0), fairyRows(1)],
  fps: 4,
  pal: { w: "#e4f8ff", W: "#8ccaf8", k: "#a05cd8", K: "#cc94f8", f: "#ffdcc8", e: "#303050", d: "#f87cc4", D: "#c850a0", y: "#fff8a8" },
  solid: null, baseY: 22,
});
export const FAIRY_GOLD = defineProp({
  frames: [fairyRows(1), fairyRows(0)],
  fps: 3.5,
  pal: { w: "#ffe6f6", W: "#f8a8dc", k: "#f8c848", K: "#fff08c", f: "#ffdcc8", e: "#303050", d: "#58c8f4", D: "#3898cc", y: "#fff8a8" },
  solid: null, baseY: 22,
});
export const FIREFLIES = defineProp({
  frames: [
    [".....y.......", "..y.......y..", ".........y...", "y.....y......", "......y....y."],
    ["..y.......y..", ".....y.......", "y.......y....", ".....y.....y.", "...y......y.."],
    ["...y.....y...", ".y.......y...", ".......y.....", "...y.....y...", "y.....y....y."],
  ],
  fps: 1.4,
  pal: { y: "#fff4a0" },
  outline: false, solid: null, baseY: 40,
});

// ════════════════════════════════════════════════════════════════════════════
// Wooden signs and small flowers
// ════════════════════════════════════════════════════════════════════════════
function signRows(label: string, arrow: "l" | "r" | ""): string[] {
  const tw = textWidth(label);
  const W = tw + 8 + (arrow ? 5 : 0), H = 21;
  const g = blank(W, H);
  rect(g, 0, 1, W, 10, "b"); rect(g, 0, 1, W, 1, "a"); rect(g, 0, 10, W, 1, "c");
  rect(g, 0, 1, 1, 10, "a"); rect(g, W - 1, 1, 1, 10, "c");
  put(g, 1, 2, "k"); put(g, W - 2, 2, "k"); put(g, 1, 9, "k"); put(g, W - 2, 9, "k");
  const tx = 4 + (arrow === "l" ? 5 : 0);
  text(g, tx, 3, label, "k");
  if (arrow === "l") stamp(g, 3, 4, ["..k", ".kk", "kkk", ".kk", "..k"]);
  if (arrow === "r") stamp(g, W - 6, 4, ["k..", "kk.", "kkk", "kk.", "k.."]);
  const px = Math.floor(W / 2) - 1;
  for (let y = 11; y < H - 1; y++) { put(g, px, y, "d"); put(g, px + 1, y, "e"); put(g, px + 2, y, "e"); }
  rect(g, px - 1, H - 1, 5, 1, "e");
  return rowsOf(g);
}
const SIGN_PAL: Pal = { a: "#e8c488", b: "#c89458", c: "#946838", d: "#d8a468", e: "#6c4a2c", k: "#3c2818" };
const signProp = (label: string, arrow: "l" | "r" | "" = "") => {
  const rows = signRows(label, arrow);
  const w = rows[0].length;
  return defineProp({ rows, pal: SIGN_PAL, solid: { x: Math.floor(w / 2) - 1, y: 14, w: 5, h: 8 } });
};
export const SIGN_FAIRIES = signProp("HADAS", "l");
export const SIGN_POND = signProp("ESTANQUE", "r");
export const SIGN_GNOMES = signProp("GNOMOS", "l");
export const SIGN_WOODS = signProp("BOSQUE");

function glowFlowerRows(f: number): string[] {
  return [
    f ? ".w.." : "..p.",
    f ? "wpw." : ".ppp",
    f ? ".w.." : "..p.",
    "..s.",
    ".ss.",
    "..s.",
    "..s.",
  ];
}
const glowFlower = (pal: Pal) => defineProp({ frames: [glowFlowerRows(0), glowFlowerRows(1)], fps: 1.2, pal, solid: null, baseY: 8 });
export const GLOW_FLOWER_PINK = glowFlower({ p: "#f898dc", w: "#fff0fa", s: "#1f6a62" });
export const GLOW_FLOWER_BLUE = glowFlower({ p: "#84d8f8", w: "#eafaff", s: "#1f6a62" });
export const GLOW_FLOWER_GOLD = glowFlower({ p: "#f8d870", w: "#fffadc", s: "#1f6a62" });

/** Row of stepping stones (flat). */
export const STEPPING_STONES = defineProp({
  rows: [
    ".aaaa....aaaa...aaaa",
    "abbbbc..abbbbc.abbbc",
    ".cccc....cccc...cccc",
  ],
  pal: { a: "#c4d0f0", b: "#98a8dc", c: "#6c7cb8" },
  flat: true, solid: null,
});
