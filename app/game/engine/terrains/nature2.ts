// Countryside, polar and jungle terrains (farm fields, wheat, mud, snow, ice,
// frozen sea, jungle floor, jungle tall grass, river, ruins, bridge).
import { defineTerrain, hash2 } from "../terrain";

type Mark = readonly [number, number, readonly string[]];

/** A 16×16 tile from a base letter (or a generator) plus stamped details. */
function tile(base: string | ((x: number, y: number) => string), marks: readonly Mark[] = []): string[] {
  const g: string[][] = [];
  for (let y = 0; y < 16; y++) {
    const r: string[] = [];
    for (let x = 0; x < 16; x++) r.push(typeof base === "string" ? base : base(x, y));
    g.push(r);
  }
  for (const [mx, my, rows] of marks) {
    rows.forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) {
        const ch = row[xx];
        const x = mx + xx, y = my + yy;
        if (ch !== "." && ch !== " " && x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = ch;
      }
    });
  }
  return g.map((r) => r.join(""));
}

const shiftX = (rows: readonly string[], dx: number) =>
  rows.map((r) => r.slice(r.length - dx) + r.slice(0, r.length - dx));
const shiftY = (rows: readonly string[], dy: number) =>
  rows.map((_, i) => rows[(i - dy + rows.length) % rows.length]);

// ════════════════════════════════════════════════════════════════════════════
// FARM
// ════════════════════════════════════════════════════════════════════════════

// ── Plowed field: horizontal furrows of rich brown soil ──────────────────────
function furrow(seed: number) {
  return (x: number, y: number) => {
    const h = hash2(x, y, seed) % 100;
    switch (y % 8) {
      case 0: return h < 18 ? "b" : "a";
      case 1: return h < 12 ? "a" : "b";
      case 2: case 3: return "b";
      case 4: return h < 25 ? "b" : "c";
      case 5: return h < 15 ? "c" : "d";
      case 6: return h < 30 ? "d" : "c";
      default: return h < 20 ? "c" : "b";
    }
  };
}
export const FIELD = defineTerrain({
  id: "field",
  level: 1,
  pal: {
    a: "#d8a068", b: "#b87c48", c: "#946036", d: "#744628",
    g: "#88d050", G: "#4c9830", s: "#e8c898",
  },
  shade: ["#8a5a34"],
  lip: { fill: "#b87c48", outline: "#6a4024" },
  variants: [
    { weight: 4, rows: tile(furrow(1)) },
    { weight: 3, rows: tile(furrow(2), [[3, 0, ["s"]], [11, 9, ["s"]]]) },
    { weight: 2, rows: tile(furrow(3), [[2, 7, ["g.g", ".G."]], [10, 15, ["g.g"]], [11, 0, ["G"]]]) },
    { weight: 2, rows: tile(furrow(4), [[9, 7, ["g.g", ".G."]], [4, 15, ["g.g"]], [5, 0, ["G"]]]) },
  ],
});

// ── Wheat (tall golden crop: hides legs like tall grass) ─────────────────────
const WHEAT_UNIT = [
  "dadd",
  "dabd",
  "aabc",
  "abcd",
  "bccb",
  "cbcd",
  "ccdc",
  "dddd",
];
const WHEAT_ROWS = Array.from({ length: 16 }, (_, y) => {
  const u = WHEAT_UNIT[y % 8];
  const off = y < 8 ? 0 : 2;
  let r = "";
  for (let x = 0; x < 16; x++) r += u[(x + off) % 4];
  return r;
});
export const WHEAT = defineTerrain({
  id: "wheat",
  level: 3,
  pal: { a: "#fff0a0", b: "#f0c858", c: "#d0a038", d: "#a07028" },
  lip: { fill: "#e8c050", outline: "#805818", bumpy: true },
  shade: [],
  variants: [{ rows: WHEAT_ROWS }],
  cover: { rows: WHEAT_ROWS.map((r, i) => (i % 8 === 0 || i % 8 === 1 ? r.replace(/d/g, ".") : r)) },
});

// ── Mud (pig pen) ────────────────────────────────────────────────────────────
export const MUD = defineTerrain({
  id: "mud",
  level: 1,
  pal: { a: "#b08860", b: "#94704c", c: "#7a5a3c", d: "#5e442c", w: "#c8d8f0", W: "#98a8c8" },
  shade: ["#6e5034"],
  lip: { fill: "#94704c", outline: "#4c3420", bumpy: true },
  variants: [
    { weight: 3, rows: tile("b", [[3, 4, ["ac"]], [11, 11, ["ac"]], [7, 13, ["c"]]]) },
    { weight: 2, rows: tile("b", [
      [3, 5, [".cccc.", "cWwwWc", "cWWWWc", ".cccc."]],
      [12, 1, ["ac"]], [10, 13, ["ac"]],
    ]) },
    { weight: 2, rows: tile("b", [
      [8, 9, [".ccc..", "cWwWcc", ".cccc."]],
      [2, 2, ["ac"]], [4, 12, ["c"]],
    ]) },
    { weight: 2, rows: tile("b", [[2, 3, ["c.c", ".c."]], [9, 10, ["c.c", ".c."]], [12, 4, ["ac"]]]) },
  ],
});

// ── Farm dirt road (warmer than town paths, with pebbles and hoof prints) ────
export const DIRT = defineTerrain({
  id: "dirt",
  level: 1,
  pal: { a: "#f0d8a8", b: "#dcbc88", c: "#c49c68", d: "#a07c50" },
  shade: ["#b89060"],
  lip: { fill: "#dcbc88", outline: "#987040" },
  variants: [
    { weight: 5, rows: tile("b") },
    { weight: 3, rows: tile("b", [[4, 3, ["ac", "cd"]], [12, 10, ["c"]], [2, 12, ["a"]]]) },
    { weight: 2, rows: tile("b", [[3, 4, ["c.c", ".c."]], [10, 10, ["c.c", ".c."]]]) },
    { weight: 2, rows: tile("b", [[10, 2, ["a", "c"]], [5, 9, ["ac"]], [13, 13, ["c"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// POLAR
// ════════════════════════════════════════════════════════════════════════════

const SNOW_PAL = {
  a: "#ffffff", b: "#eef3ff", c: "#d4e0f8", d: "#b0c4ec", e: "#8ca4d8",
  r: "#9898a8", R: "#686878",
};
/** Snow base with sparse hash-scattered speckles (breaks the flat white). */
const snowy = (seed: number, dens = 3) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < dens ? "c" : h > 97 ? "a" : "b";
};
export const SNOW = defineTerrain({
  id: "snow",
  level: 2,
  group: "snow",
  pal: SNOW_PAL,
  lip: { fill: "#eef3ff", outline: "#8094c8", bumpy: true },
  shade: ["#c8d6f4"],
  variants: [
    { weight: 3, rows: tile(snowy(11)) },
    { weight: 3, rows: tile(snowy(12, 2), [
      [1, 3, [".aaa..", "accccc", "..cc.."]], [9, 10, [".aaa.", "acccc", "..c.."]],
    ]) },
    { weight: 3, rows: tile(snowy(13), [
      [10, 2, [".aa.", "accc"]], [3, 11, ["aa.", "ccc"]],
    ]) },
    { weight: 2, rows: tile(snowy(14, 6)) },
    { weight: 1, rows: tile(snowy(15, 1), [
      // footprints
      [3, 2, ["cc", "d."]], [6, 5, ["cc", "d."]], [3, 8, ["cc", "d."]], [6, 11, ["cc", "d."]],
    ]) },
    { weight: 0.5, rows: tile(snowy(16), [
      [9, 7, [".aa..", "arRa.", "cRRRc", ".ccc."]], [3, 3, ["c"]],
    ]) },
  ],
});

// Deep snow drifts: hides legs (great hiding spot).
const DRIFT_UNIT = [
  "ddabbddd",
  "dabbbcdd",
  "abbbbbcd",
  "abbbbbbc",
  "bbbbbbbc",
  "cbbbbbcc",
  "dccccccd",
  "dddddddd",
];
const DRIFT_ROWS = Array.from({ length: 16 }, (_, y) => {
  const u = DRIFT_UNIT[y % 8];
  const off = y < 8 ? 0 : 4;
  let r = "";
  for (let x = 0; x < 16; x++) r += u[(x + off) % 8];
  return r;
});
export const DEEP_SNOW = defineTerrain({
  id: "deep-snow",
  level: 3,
  pal: { a: "#ffffff", b: "#e8f0ff", c: "#c4d4f4", d: "#9cb0e0" },
  lip: { fill: "#e8f0ff", outline: "#7088c0", bumpy: true },
  shade: [],
  variants: [{ rows: DRIFT_ROWS }],
  cover: { rows: DRIFT_ROWS.map((r, i) => (i % 8 === 0 ? r.replace(/d/g, ".") : r)) },
});

// Packed-snow trail.
export const SNOW_TRAIL = defineTerrain({
  id: "snow-trail",
  level: 1,
  pal: { a: "#e4ecfa", b: "#cad6ee", c: "#aebee2", d: "#8ea2d0" },
  shade: ["#a6b6dc"],
  lip: { fill: "#cad6ee", outline: "#7488bc" },
  variants: [
    { weight: 3, rows: tile((x, y) => (hash2(x, y, 21) % 100 < 4 ? "c" : "b")) },
    { weight: 3, rows: tile("b", [[3, 2, ["cc", "d."]], [9, 6, ["cc", "d."]], [4, 10, ["cc", "d."]], [10, 13, ["cc", "d."]]]) },
    { weight: 2, rows: tile((x, y) => (hash2(x, y, 22) % 100 < 3 ? "a" : "b"), [[12, 11, ["ac"]], [2, 13, ["c"]]]) },
  ],
});

// Frozen lake ice: walkable, glossy diagonal highlights.
const ICE_PAL = { a: "#ffffff", b: "#bfeaf8", c: "#9cd6f0", d: "#74b4e0", e: "#5090c8" };
export const ICE = defineTerrain({
  id: "ice",
  level: 1,
  pal: ICE_PAL,
  shade: ["#88c4e8", "#a8dcf4"],
  lip: { fill: "#8ccaee", outline: "#3c74ac", depth: 3 },
  variants: [
    { weight: 3, rows: tile("b", [
      [2, 2, ["....a", "...a.", "..a..", ".a...", "a...."]],
      [5, 3, ["...a", "..a.", ".a..", "a..."]],
    ]) },
    { weight: 3, rows: tile("b", [
      [9, 8, ["....a", "...a.", "..a..", ".a...", "a...."]],
      [12, 9, ["..a", ".a.", "a.."]],
      [2, 13, ["cc"]],
    ]) },
    { weight: 2, rows: tile("b", [
      [3, 4, ["d...", ".dd.", "...d", "..d.", "..d."]],
      [6, 6, ["ddd"]],
      [11, 12, ["a"]],
    ]) },
    { weight: 2, rows: tile("b", [[4, 10, ["cc"]], [11, 3, ["c"]], [12, 4, ["c"]]]) },
    { weight: 1, rows: tile("b", [
      [8, 2, [".cc.", "caac", "cacc", ".cc."]],
      [3, 11, ["...a", "..a.", ".a..", "a..."]],
    ]) },
  ],
});

// Icy arctic sea: dark, animated, with little ice bits.
const SEA_BASE = [
  "cccccccccccccccc",
  "cccccccccccccccc",
  "ccccbbbcccccccdc",
  "cccbbccbbccccccc",
  "cccccccccccccccc",
  "cccccccccccccccc",
  "ccccccccccdccccc",
  "ccccccccccccbbbc",
  "cccccccccccbbccb",
  "cccccccccccccccc",
  "cccccccccccccccc",
  "ccccccdddccccccc",
  "cccccddcddcccccc",
  "cccccccccccccccc",
  "cbbbcccccccccccc",
  "bbccbbcccccccccc",
];
export const ARCTIC_SEA = defineTerrain({
  id: "arctic-sea",
  level: 0,
  walkable: false,
  group: "water",
  pal: { a: "#f0fbff", b: "#78b0e0", c: "#4a84c4", d: "#386cac" },
  shade: ["#e8f6ff", "#a0c8ec"],
  variants: [{ rows: SEA_BASE }],
  frames: [
    [{ rows: SEA_BASE }],
    [{ rows: shiftX(SEA_BASE, 2) }],
    [{ rows: shiftX(SEA_BASE, 4) }],
    [{ rows: shiftX(SEA_BASE, 2) }],
  ],
  fps: 1.5,
});

// ════════════════════════════════════════════════════════════════════════════
// JUNGLE
// ════════════════════════════════════════════════════════════════════════════

const JG_PAL = {
  a: "#7cc050", b: "#4c9a38", c: "#3a8030", d: "#2a6424",
  o: "#d8a040", O: "#a06828", p: "#f878c0", P: "#b84888", y: "#f8e060",
};
export const JUNGLE_GRASS = defineTerrain({
  id: "jungle-grass",
  level: 2,
  group: "grass",
  pal: JG_PAL,
  lip: { fill: "#4c9a38", outline: "#1c4618", bumpy: true },
  shade: ["#2e6c26"],
  variants: [
    { weight: 5, rows: tile("b") },
    { weight: 4, rows: tile("b", [
      [2, 2, ["a...a", "c.a.c", ".c.c."]], [10, 9, ["a...a", "c.a.c", ".c.c."]],
    ]) },
    { weight: 3, rows: tile("b", [
      [8, 2, ["a.a", "c.c"]], [2, 8, [".a...", "a.a.a", "cacac", ".ccc."]],
      [12, 13, ["a", "c"]],
    ]) },
    { weight: 1.2, rows: tile("b", [
      [3, 4, [".oo", "oOO", "O.."]], [10, 11, ["oo.", "OOo", "..O"]], [12, 3, ["c"]],
    ]) },
    { weight: 0.8, rows: tile("b", [
      [3, 3, [".p.", "pyp", ".P.", ".c."]], [10, 9, [".p.", "pyp", ".P.", ".c."]],
    ]) },
  ],
});

// Jungle tall grass: broad dark leaves, hides legs.
const JT_UNIT = [
  "dddadddd",
  "ddabdadd",
  "dabbaabd",
  "abbcabbc",
  "bbccbbcc",
  "bccdbccd",
  "cdcdcdcd",
  "dddddddd",
];
const JT_ROWS = Array.from({ length: 16 }, (_, y) => {
  const u = JT_UNIT[y % 8];
  const off = y < 8 ? 0 : 4;
  let r = "";
  for (let x = 0; x < 16; x++) r += u[(x + off) % 8];
  return r;
});
export const JUNGLE_TALL = defineTerrain({
  id: "jungle-tall",
  level: 3,
  pal: { a: "#88d058", b: "#469c36", c: "#2c7628", d: "#1a5220" },
  lip: { fill: "#469c36", outline: "#143e16", bumpy: true },
  shade: [],
  variants: [{ rows: JT_ROWS }],
  cover: { rows: JT_ROWS.map((r, i) => (i % 8 === 0 ? r.replace(/d/g, ".") : r)) },
});

// River: green-teal water flowing downwards (rows scroll).
const RIVER_BASE = [
  "cccccccccccccccc",
  "ccbcccccccccbccc",
  "ccbcccccccccbccc",
  "cccccccdcccccccc",
  "cccccccdcccccccc",
  "cccccccccccccccc",
  "cccccccccccccdcc",
  "cbcccccccccccdcc",
  "cbccccbccccccccc",
  "ccccccbccccccccc",
  "ccccccaccccccccc",
  "cccccccccccbcccc",
  "cccdcccccccbcccc",
  "cccdcccccccccccc",
  "cccccccccccccccc",
  "cccccccccbcccccc",
];
export const RIVER = defineTerrain({
  id: "river",
  level: 0,
  walkable: false,
  group: "water",
  pal: { a: "#e8fff8", b: "#88dcd0", c: "#4cb4b8", d: "#3892a4" },
  shade: ["#e0fff4", "#9ce0d8"],
  variants: [{ rows: RIVER_BASE }],
  frames: [0, 4, 8, 12].map((dy) => [{ rows: shiftY(RIVER_BASE, dy) }]),
  fps: 4,
});

// Reddish jungle trail with roots and pebbles.
export const JUNGLE_PATH = defineTerrain({
  id: "jungle-path",
  level: 1,
  pal: { a: "#ecc090", b: "#d4a070", c: "#b88054", d: "#94603c", r: "#7a5030" },
  shade: ["#a87448"],
  lip: { fill: "#d4a070", outline: "#7c4c2c" },
  variants: [
    { weight: 4, rows: tile("b") },
    { weight: 3, rows: tile("b", [[3, 3, ["ac", "cd"]], [11, 10, ["a"]], [6, 13, ["c"]]]) },
    { weight: 1.5, rows: tile("b", [[1, 9, ["rr....", "..rrr.", ".....r"]], [11, 3, ["ac"]]]) },
    { weight: 2, rows: tile("b", [[10, 4, ["c"]], [4, 8, ["ac"]], [12, 13, ["c"]]]) },
  ],
});

// Mossy temple flagstones.
const RUIN_PAL = {
  a: "#c8ccc0", b: "#a8ae9e", c: "#8c927e", d: "#6a7060",
  m: "#7cb048", M: "#4c8430",
};
const slab = (x: number, y: number) => {
  const by = y % 8, row = Math.floor(y / 8);
  const bx = (x + (row % 2) * 4) % 8;
  if (by === 7 || bx === 7) return "d";
  if (by === 0 || bx === 0) return "a";
  if (by === 6 || bx === 6) return "c";
  return "b";
};
export const RUIN_FLOOR = defineTerrain({
  id: "ruin-floor",
  level: 1.5,
  pal: RUIN_PAL,
  shade: ["#7c826e"],
  lip: { fill: "#a8ae9e", outline: "#4c5244" },
  variants: [
    { weight: 4, rows: tile(slab) },
    { weight: 2, rows: tile(slab, [[2, 2, ["mm", "mMm"]], [11, 13, ["mm"]], [12, 12, ["m"]]]) },
    { weight: 2, rows: tile(slab, [[9, 2, ["d.", ".d", ".d"]], [3, 11, ["c"]]]) },
    { weight: 1.5, rows: tile(slab, [[0, 7, ["mmM", ".m"]], [12, 6, ["mmm", "Mm"]], [6, 14, ["m"]]]) },
  ],
});

// Wooden plank bridge (crossing a vertical river, walking east–west).
const BRIDGE_ROWS = tile((x, y) => {
  if (y === 0) return "d";
  if (y === 1) return "a";
  if (y === 2) return "c";
  if (y === 14) return "c";
  if (y === 15) return "d";
  if (y === 13) return "d";
  const px = x % 4;
  if (px === 3) return "d";
  if (px === 0) return "a";
  return y > 10 ? "c" : "b";
}, [[5, 6, ["e"]], [13, 9, ["e"]], [1, 4, ["e"]]]);
export const BRIDGE = defineTerrain({
  id: "bridge",
  level: 1,
  pal: { a: "#f0c888", b: "#d4a060", c: "#ac7840", d: "#6c4424", e: "#8c5a30" },
  lip: { fill: "#ac7840", outline: "#4c2c18" },
  variants: [{ rows: BRIDGE_ROWS }],
});

