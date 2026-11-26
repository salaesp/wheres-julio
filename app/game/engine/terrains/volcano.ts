// Volcanic island terrains: animated lava (flows downhill), dark volcanic rock
// with glowing cracks and pumice, grey ash fields, mineral sinter around the
// hot springs, steaming hot-spring water, prehistoric grass, giant ferns
// (hide legs) and a rope bridge laid across the lava.
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

const shiftY = (rows: readonly string[], dy: number) =>
  rows.map((_, i) => rows[(i - dy + rows.length) % rows.length]);
const shiftX = (rows: readonly string[], dx: number) =>
  rows.map((r) => r.slice(r.length - dx) + r.slice(0, r.length - dx));

/** Swap single pixels (bubble pops) in some rows. */
function poke(rows: readonly string[], pts: readonly [number, number, string][]): string[] {
  const g = rows.map((r) => r.split(""));
  for (const [x, y, c] of pts) if (g[y] && g[y][x] !== undefined) g[y][x] = c;
  return g.map((r) => r.join(""));
}

// ════════════════════════════════════════════════════════════════════════════
// LAVA — level 0 like water, flows downwards, crust floes drift along.
// ════════════════════════════════════════════════════════════════════════════
const LAVA_PAL = {
  a: "#fff8c0", b: "#f8d848", c: "#f89830", d: "#e86020", e: "#b83820", k: "#6a2a24", K: "#4a1c1c",
};
const LAVA_A = [
  "ccccdcccccccbccc",
  "cccdcccccccbbccc",
  "ccdccbbccccbcccc",
  "ccdcbbacccccdccc",
  "cccccbbcccccdccc",
  "ccccccccccccdccc",
  "cbccccccdddccccc",
  "cbbcccccdcdccbcc",
  "ccbcccccccccbbcc",
  "ccccccccccccbccc",
  "cccccccccccccccd",
  "dccccccbbccccccd",
  "cdcccccbaccccccc",
  "ccdccccccccbbccc",
  "cccccdddcccbcccc",
  "cccccdcdcccccccc",
];
const LAVA_B = tile((x, y) => LAVA_A[(y + 8) % 16][(x + 5) % 16], [
  [5, 3, [".eke.", "ekKke", ".eee."]],
  [11, 11, ["ek", "ee"]],
]);
const LAVA_C = tile((x, y) => LAVA_A[(y + 4) % 16][(x + 10) % 16], [
  [2, 9, [".ee..", "ekkee", "eKkke", ".eee."]],
]);
const lavaFrames = [0, 4, 8, 12].map((dy, f) => [
  { rows: poke(shiftY(LAVA_A, dy), f % 2 ? [[4, 9, "a"], [10, 3, "b"]] : [[4, 9, "b"]]), weight: 5 },
  { rows: poke(shiftY(LAVA_B, dy), f % 2 ? [[12, 5, "a"]] : [[2, 13, "a"]]), weight: 2 },
  { rows: poke(shiftY(LAVA_C, dy), f === 2 ? [[11, 4, "a"], [12, 4, "b"]] : []), weight: 2 },
]);
export const LAVA = defineTerrain({
  id: "lava",
  level: 0,
  walkable: false,
  group: "lava",
  pal: LAVA_PAL,
  // glowing embers right under the bank (like foam on water)
  shade: ["#fff4a0", "#f8c040"],
  variants: lavaFrames[0],
  frames: lavaFrames,
  fps: 3,
});

// ════════════════════════════════════════════════════════════════════════════
// VOLCANIC ROCK — dark basalt with lit bumps, glowing cracks, pumice.
// ════════════════════════════════════════════════════════════════════════════
const ROCK_PAL = {
  a: "#958487", b: "#6a5d60", c: "#564a50", d: "#42383f", e: "#2e2630",
  o: "#f87828", y: "#f8d048", r: "#c03828",
  p: "#c8bcae", P: "#a09284", q: "#7c7064",
  s: "#b8705c", S: "#8c4c40", t: "#5c3430",
};
const speck = (seed: number, dens = 6) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  if (h < dens) return "c";
  if (h < dens + 2 && y > 0 && hash2(x, y - 1, seed) % 100 >= dens) return "a";
  return "b";
};
const BUMP: readonly string[] = [".aa.", "abbc", ".cd."];
const BUMP2: readonly string[] = [".a.", "abc", ".d."];
export const VROCK = defineTerrain({
  id: "vrock",
  level: 2,
  group: "vrock",
  pal: ROCK_PAL,
  lip: { fill: "#4a4048", outline: "#1e1820", depth: 2 },
  shade: ["#463c44"],
  variants: [
    { weight: 5, rows: tile(speck(31)) },
    { weight: 4, rows: tile(speck(32, 4), [[2, 3, BUMP], [10, 10, BUMP2], [12, 2, ["d"]]]) },
    { weight: 3, rows: tile(speck(33, 4), [[9, 4, BUMP], [3, 11, BUMP2], [1, 6, ["d"]]]) },
    // glowing cracks (several shapes so they don't repeat)
    { weight: 0.6, rows: tile(speck(34, 3), [[3, 5, [
      "d.......",
      "rd......",
      ".od.....",
      ".yodd...",
      "..ryod..",
      "....oyd.",
      ".....rd.",
    ]]]) },
    { weight: 0.6, rows: tile(speck(35, 3), [[7, 1, [
      ".....d",
      "....od",
      "..dyo.",
      ".doy..",
      "dor...",
      "d.....",
    ]], [2, 11, BUMP2]]) },
    { weight: 0.6, rows: tile(speck(37, 3), [[1, 8, [
      "dd..........",
      ".rodd...dd..",
      "...oyyoodor.",
      "......dd....",
    ]], [10, 2, BUMP2]]) },
    // rubble
    { weight: 2, rows: tile(speck(38, 3), [[2, 9, [".aa..", "abbc.", ".cdaa", "..abc", "...d."]], [10, 3, [".a.", "abc"]], [12, 12, ["ac"]]]) },
    // reddish scoria pebbles
    { weight: 1, rows: tile(speck(39, 3), [[4, 4, [".s.", "sSt"]], [11, 8, ["sS", "tt"]], [6, 12, ["s", "t"]]]) },
    // pumice stones
    { weight: 1.3, rows: tile(speck(36, 3), [
      [3, 3, [".pp.", "ppPP", "pPqP", ".qq."]],
      [11, 9, [".pp", "pPq", ".q."]],
      [6, 12, ["pP"]],
    ]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// ASH — soft grey cinder fields and trails (the walkable "path" level).
// ════════════════════════════════════════════════════════════════════════════
const ASH_PAL = {
  a: "#e0dcd8", b: "#c4c0bc", c: "#aaa6a4", d: "#8c8888", k: "#5c5458", o: "#e87830",
};
const ashy = (seed: number, dens = 4) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < dens ? "c" : h > 97 ? "a" : "b";
};
export const ASH = defineTerrain({
  id: "ash",
  level: 1,
  pal: ASH_PAL,
  lip: { fill: "#b4b0ac", outline: "#6c6868", bumpy: true },
  shade: ["#a49f9c"],
  variants: [
    { weight: 5, rows: tile(ashy(41)) },
    { weight: 3, rows: tile(ashy(42, 2), [[3, 4, ["aa..", "cccc"]], [9, 11, [".aaa", "cccc"]]]) },
    { weight: 2, rows: tile(ashy(43, 3), [[4, 3, ["k"]], [11, 6, ["kd"]], [6, 12, ["d"]], [13, 13, ["k"]]]) },
    { weight: 1.2, rows: tile(ashy(44, 1), [
      // boot prints
      [3, 1, ["cc", "dc", ".d"]], [8, 5, ["cc", "dc", ".d"]], [3, 9, ["cc", "dc", ".d"]], [8, 13, ["cc", "dc"]],
    ]) },
    { weight: 0.8, rows: tile(ashy(45, 2), [[6, 6, [".kk.", "kodk", ".kk."]], [12, 12, ["d"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// SINTER — pale mineral crust (travertine) around the hot springs.
// ════════════════════════════════════════════════════════════════════════════
export const SINTER = defineTerrain({
  id: "sinter",
  level: 1.5,
  pal: { a: "#fffaf0", b: "#f4e4cc", c: "#e0c8a8", d: "#c4a484", o: "#e8a868", O: "#c88048" },
  lip: { fill: "#ecdcc0", outline: "#a08060", depth: 2 },
  shade: ["#d8c0a0"],
  variants: [
    { weight: 4, rows: tile((x, y) => {
      const h = hash2(x, y, 51) % 100;
      if (y % 6 === 5 && h < 70) return "c";
      return h < 4 ? "a" : "b";
    }) },
    { weight: 2, rows: tile((x, y) => (y % 7 === 3 && hash2(x, y, 52) % 100 < 60 ? "c" : "b"), [
      [3, 8, ["oo", ".O"]], [11, 2, ["o"]],
    ]) },
    { weight: 2, rows: tile((x, y) => (hash2(x, y, 53) % 100 < 5 ? "a" : "b"), [
      [2, 3, ["acc..", ".aaccc"]], [8, 11, ["accc", ".aac"]],
    ]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// HOT SPRING — light-blue thermal water with slow ripples.
// ════════════════════════════════════════════════════════════════════════════
const SPRING_BASE = [
  "cccccccccccccccc",
  "cccccccccccccccc",
  "cccbbbcccccccccc",
  "ccbccbbccccccccc",
  "cccccccccccccccc",
  "cccccccccccdcccc",
  "ccccccccccdcdccc",
  "cccccccccccccccc",
  "cccccccccccccccc",
  "cccccccbbbcccccc",
  "ccccccbbccbccccc",
  "cccccccccccccccc",
  "ccdccccccccccccc",
  "cdcdccccccccbbcc",
  "ccccccccccccacbc",
  "cccccccccccccccc",
];
export const HOT_SPRING = defineTerrain({
  id: "hot-spring",
  level: 0,
  walkable: false,
  group: "spring",
  pal: { a: "#ffffff", b: "#c8f8ff", c: "#78d8f0", d: "#50b8e0" },
  shade: ["#f0ffff", "#a8ecf8"],
  variants: [{ rows: SPRING_BASE }],
  frames: [
    [{ rows: SPRING_BASE }],
    [{ rows: poke(shiftX(SPRING_BASE, 1), [[7, 3, "a"]]) }],
    [{ rows: shiftX(SPRING_BASE, 2) }],
    [{ rows: poke(shiftX(SPRING_BASE, 1), [[12, 10, "a"]]) }],
  ],
  fps: 2,
});

// ════════════════════════════════════════════════════════════════════════════
// PREHISTORIC GRASS & GIANT FERNS
// ════════════════════════════════════════════════════════════════════════════
const PG_PAL = {
  a: "#b8e070", b: "#84bc48", c: "#669e3c", d: "#4a7e30",
  o: "#f89838", O: "#c06020", y: "#f8e060", s: "#a89c90", S: "#7c7068",
};
export const PREHISTORIC_GRASS = defineTerrain({
  id: "prehistoric-grass",
  level: 2.3,
  group: "pgrass",
  pal: PG_PAL,
  lip: { fill: "#84bc48", outline: "#2e5a20", bumpy: true },
  shade: ["#5a8c34"],
  variants: [
    { weight: 5, rows: tile("b") },
    { weight: 4, rows: tile("b", [[2, 2, ["a...a", "c.a.c", ".c.c."]], [10, 10, ["a.a", "c.c"]]]) },
    { weight: 3, rows: tile("b", [[9, 2, ["a.a", "c.c"]], [2, 9, [".a...", "a.a.a", "cacac", ".ccc."]]]) },
    { weight: 1, rows: tile("b", [[3, 4, [".o.", "oyo", ".O.", ".c."]], [11, 11, ["o", "c"]], [12, 3, ["a", "c"]]]) },
    { weight: 1, rows: tile("b", [[4, 10, [".ss", "sSS"]], [11, 3, ["s", "S"]], [12, 12, ["a.a", "c.c"]]]) },
  ],
});

// Giant ferns: curled fronds; hides legs like tall grass.
const FERN_UNIT = [
  "ddddaddd",
  "ddaabadd",
  "dabbcbad",
  "abbccbba",
  "bbcdcdbb",
  "bcdcccdc",
  "cdcdcdcd",
  "dddddddd",
];
const FERN_ROWS = Array.from({ length: 16 }, (_, y) => {
  const u = FERN_UNIT[y % 8];
  const off = y < 8 ? 0 : 4;
  let r = "";
  for (let x = 0; x < 16; x++) r += u[(x + off) % 8];
  return r;
});
export const GIANT_FERNS = defineTerrain({
  id: "giant-ferns",
  level: 3,
  pal: { a: "#b0e068", b: "#70b040", c: "#4c8c34", d: "#2e6428" },
  lip: { fill: "#70b040", outline: "#204a1c", bumpy: true },
  shade: [],
  variants: [{ rows: FERN_ROWS }],
  cover: { rows: FERN_ROWS.map((r, i) => (i % 8 === 0 ? r.replace(/d/g, ".") : r)) },
});

// ════════════════════════════════════════════════════════════════════════════
// ROPE BRIDGE — wooden slats tied with rope, crossing the lava east–west.
// ════════════════════════════════════════════════════════════════════════════
const ROPE_BRIDGE_ROWS = tile((x, y) => {
  if (y === 0) return x % 4 === 1 ? "R" : "r";
  if (y === 1) return x % 4 === 3 ? "R" : "u";
  if (y === 15) return x % 4 === 1 ? "R" : "r";
  if (y === 14) return x % 4 === 3 ? "R" : "u";
  if (y === 2 || y === 13) return "g";
  const px = x % 4;
  if (px === 3) return "g";
  if (px === 0) return y === 3 ? "a" : "b";
  if (px === 2) return "c";
  return y === 12 ? "c" : "b";
}, [[5, 6, ["e"]], [13, 9, ["e"]], [1, 4, ["e"]], [9, 11, ["e"]]]);
export const ROPE_BRIDGE = defineTerrain({
  id: "rope-bridge",
  level: 1,
  pal: {
    a: "#f0c888", b: "#d4a060", c: "#ac7840", e: "#8c5a30", g: "#4a2418",
    r: "#e8d098", R: "#a88850", u: "#c8a868",
  },
  lip: { fill: "#ac7840", outline: "#4c2c18" },
  variants: [{ rows: ROPE_BRIDGE_ROWS }],
});
