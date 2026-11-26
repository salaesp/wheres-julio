// Zoo terrains: warm brick paving for the visitor walks, dry savanna grass,
// packed elephant-yard earth with footprints, a wallow of wet mud, ochre lion
// ground, a green hippo pond with a pebbly bank, and non-walkable copies of
// ice / jungle floor / lush grass for the penguin, monkey and panda pens.
import { defineTerrain, hash2, type TileArt } from "../terrain";
import { ICE, JUNGLE_GRASS, MUD } from "./nature2";
import { GRASS_DARK } from "./common";

type Mark = readonly [number, number, readonly string[]];

/** 16×16 tile from a base letter (or per-pixel generator) plus stamped marks. */
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

// ════════════════════════════════════════════════════════════════════════════
// Visitor paving: running-bond bricks (8×8 slabs, staggered), warm sandstone.
// Each variant re-tints a few slabs so the grid never reads as a repeat.
// ════════════════════════════════════════════════════════════════════════════
const PAVE_PAL = {
  a: "#fff0d0", // lit slab edge
  b: "#f0d8b0", // slab
  e: "#e8cca0", // alt slab
  f: "#f8e4c0", // pale slab
  c: "#d4b088", // mortar
  d: "#b48c68", // deep mortar / cracks
  g: "#78b850", G: "#4c8c38", // weed
  p: "#fff8e0", P: "#f0c040", // popcorn
  l: "#e09040", L: "#a85828", // leaf
  w: "#ffffff", W: "#c8c8d8", // gum / paper
};
function pave(seed: number, tints: number) {
  return (x: number, y: number) => {
    const course = Math.floor(y / 8);
    const off = course % 2 ? 4 : 0;
    const lx = (x + off) % 8, ly = y % 8;
    const id = Math.floor((x + off) / 8) + course * 3;
    if (ly === 7) return lx === 7 ? "d" : "c";
    if (lx === 7) return "c";
    const h = hash2(id, course, seed) % 100;
    const base = h < tints ? "e" : h > 100 - tints ? "f" : "b";
    if (ly === 0 && lx < 6) return base === "e" ? "b" : "a";
    if (lx === 0 && ly < 5) return base === "e" ? "b" : "a";
    if (ly === 6 && lx > 1 && hash2(x, y, seed) % 3 === 0) return base === "f" ? "b" : "e";
    return base;
  };
}
export const ZOO_PAVE = defineTerrain({
  id: "zoo-pave",
  level: 1,
  pal: PAVE_PAL,
  shade: ["#c8a47c"],
  lip: { fill: "#f0d8b0", outline: "#a07c58" },
  variants: [
    { weight: 6, rows: tile(pave(1, 12)) },
    { weight: 4, rows: tile(pave(2, 20)) },
    { weight: 2, rows: tile(pave(3, 15), [[3, 11, ["d", ".d", ".dd"]], [11, 3, ["pP"]]]) },
    { weight: 1.5, rows: tile(pave(4, 10), [[7, 6, [".g.", "gGg"]], [1, 13, ["lL"]]]) },
    { weight: 1, rows: tile(pave(5, 18), [[10, 10, ["wW"]], [4, 2, ["P", "p"]]]) },
    { weight: 1, rows: tile(pave(6, 8), [[12, 12, ["Ll", ".l"]], [2, 4, ["d.", ".d"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Savanna: dry golden grass with tufts, pebbles and sun-baked patches.
// ════════════════════════════════════════════════════════════════════════════
const SAV_PAL = {
  a: "#fff0a0", b: "#f0d070", c: "#d8b050", d: "#b08838", e: "#8a6830",
  s: "#e8c8a0", S: "#b89470", r: "#c8b8a0", R: "#908070",
};
const savanna = (seed: number) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  const h2 = hash2(x, y + 1, seed) % 100;
  if (h < 5) return "c";
  if (h2 < 5) return "d"; // blade shadow under a mark
  if (h > 96) return "a";
  return "b";
};
const TUFT = [".a.a.", "ac.ca", ".dcd.", "..d.."];
const TUFT2 = ["a..a", ".ca.", "dcdd"];
export const SAVANNA = defineTerrain({
  id: "savanna",
  level: 2,
  walkable: false,
  pal: SAV_PAL,
  shade: ["#c8a048"],
  lip: { fill: "#f0d070", outline: "#a07c30", bumpy: true },
  variants: [
    { weight: 5, rows: tile(savanna(11)) },
    { weight: 3, rows: tile(savanna(12), [[3, 3, TUFT], [10, 10, TUFT2]]) },
    { weight: 2, rows: tile(savanna(13), [[9, 2, TUFT2], [2, 10, [".ss.", "sSSs", ".SS."]]]) },
    { weight: 2, rows: tile(savanna(14), [[5, 6, TUFT], [12, 12, ["rR"]]]) },
    { weight: 1, rows: tile(savanna(15), [[3, 4, ["..ssss..", ".sSSSSs.", "sSSsSSSs", ".sSSSSs.", "..ssss.."]], [11, 11, TUFT2]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Elephant yard: packed orange earth with big round footprints.
// ════════════════════════════════════════════════════════════════════════════
const YARD_PAL = { a: "#f0c898", b: "#dca878", c: "#c48c5c", d: "#a07048", e: "#7c5434", g: "#a0c060", G: "#688838" };
const yard = (seed: number) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < 4 ? "c" : h > 96 ? "a" : "b";
};
const PRINT = [".cc.", "cddc", "cddc", ".cc."];
export const YARD = defineTerrain({
  id: "zoo-yard",
  level: 1.5,
  walkable: false,
  pal: YARD_PAL,
  shade: ["#b88458"],
  lip: { fill: "#dca878", outline: "#8c5c38" },
  variants: [
    { weight: 5, rows: tile(yard(21)) },
    { weight: 2, rows: tile(yard(22), [[2, 3, PRINT], [8, 9, PRINT]]) },
    { weight: 2, rows: tile(yard(23), [[9, 2, PRINT], [3, 11, ["ac", "cd"]]]) },
    { weight: 1, rows: tile(yard(24), [[4, 6, [".g.g", "gGgG"]], [11, 12, ["ac"]]]) },
  ],
});

// Wallow: wet dark mud with shiny puddles (lower than the yard).
export const WALLOW = defineTerrain({
  ...MUD,
  id: "zoo-wallow",
  level: 1,
  walkable: false,
  noJulio: true,
});

// ════════════════════════════════════════════════════════════════════════════
// Lion ground: reddish ochre sand with scattered stones.
// ════════════════════════════════════════════════════════════════════════════
const LION_PAL = { a: "#f8d8a0", b: "#e8b878", c: "#d09858", d: "#a87040", r: "#c0b0a0", R: "#887868", g: "#d8c060", G: "#a89038" };
const lionSand = (seed: number) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < 5 ? "c" : h > 95 ? "a" : "b";
};
export const LION_GROUND = defineTerrain({
  id: "lion-ground",
  level: 1.5,
  walkable: false,
  pal: LION_PAL,
  shade: ["#c09058"],
  lip: { fill: "#e8b878", outline: "#946038", bumpy: true },
  variants: [
    { weight: 5, rows: tile(lionSand(31)) },
    { weight: 2, rows: tile(lionSand(32), [[3, 4, [".rr.", "rrrR", ".RR."]], [11, 11, ["rR"]]]) },
    { weight: 2, rows: tile(lionSand(33), [[9, 3, [".g.g", "gGgG"]], [2, 12, ["rR"]]]) },
    { weight: 1, rows: tile(lionSand(34), [[5, 8, ["..cc..", ".cddc.", "..cc.."]], [12, 2, ["ac"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Hippo pond: green-teal water (animated ripples) + pale pebbly bank.
// ════════════════════════════════════════════════════════════════════════════
const POND_BASE = [
  "cccccccccccccccc",
  "cccccccccccccccc",
  "ccccbbbccccccccc",
  "cccbbccbbccccccc",
  "cccccccccccccccc",
  "cccccccccccdcccc",
  "cccccccccccccccc",
  "ccccccccccccbbbc",
  "cccccccccccbbccb",
  "cccccccccccccccc",
  "ccdccccccccccccc",
  "ccccccdddccccccc",
  "cccccddcddcccccc",
  "cccccccccccccccc",
  "cbbbcccccccccccc",
  "bbccbbcccccccccc",
];
const pondFrames = (rows: readonly string[]): TileArt[][] => [0, 2, 4, 2].map((dx) => [{ rows: shiftX(rows, dx) }]);
export const POND = defineTerrain({
  id: "zoo-pond",
  level: 0,
  walkable: false,
  pal: { a: "#e8fff0", b: "#88d0c0", c: "#58b0a8", d: "#409090" },
  shade: ["#d8f8e8", "#98d8c8"],
  variants: [{ rows: POND_BASE }],
  frames: pondFrames(POND_BASE),
  fps: 1.6,
});
const BANK_PAL = { a: "#f8f0d8", b: "#e8dcb8", c: "#d0c098", d: "#a89878", r: "#b8b0a8", R: "#807870", g: "#78b850", G: "#4c8c38" };
const bank = (seed: number) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < 6 ? "c" : h > 94 ? "a" : "b";
};
export const BANK = defineTerrain({
  id: "zoo-bank",
  level: 1.5,
  walkable: false,
  pal: BANK_PAL,
  shade: ["#c8b890"],
  lip: { fill: "#e8dcb8", outline: "#988860", bumpy: true },
  variants: [
    { weight: 4, rows: tile(bank(41)) },
    { weight: 2, rows: tile(bank(42), [[3, 3, ["rR", "RR"]], [10, 9, ["r"]], [12, 12, ["rR"]]]) },
    { weight: 2, rows: tile(bank(43), [[8, 4, [".g..g", "gGg.G", ".G..."]], [2, 11, ["rR"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Non-walkable pen floors (art borrowed from the polar / jungle / park sets).
// ════════════════════════════════════════════════════════════════════════════
export const PEN_ICE = defineTerrain({ ...ICE, id: "zoo-ice", level: 1, walkable: false, noJulio: true });
export const PEN_JUNGLE = defineTerrain({ ...JUNGLE_GRASS, id: "zoo-jungle", group: "zoo-jungle", walkable: false });
export const PEN_GRASS = defineTerrain({ ...GRASS_DARK, id: "zoo-lush", group: "zoo-lush", walkable: false, level: 2.5 });
