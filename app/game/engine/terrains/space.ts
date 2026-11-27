// Terrains for El Espacio.
// Terrains for the three "fantasy" worlds: space (void, moon dust, station
// deck), the enchanted night forest and the circus (sawdust, carpets, planks).
import { defineTerrain, hash2 } from "../terrain";

const gen16 = (fn: (x: number, y: number) => string): string[] => {
  const out: string[] = [];
  for (let y = 0; y < 16; y++) {
    let r = "";
    for (let x = 0; x < 16; x++) r += fn(x, y);
    out.push(r);
  }
  return out;
};

type Mark = readonly [number, number, readonly string[]];
/** Base pattern + hand-drawn stamps ('.' = keep the base). */
function tile(fn: (x: number, y: number) => string, marks: readonly Mark[] = []): string[] {
  const g = gen16(fn).map((r) => r.split(""));
  for (const [mx, my, rows] of marks) {
    rows.forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) {
        const x = mx + xx, y = my + yy;
        if (row[xx] !== "." && x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = row[xx];
      }
    });
  }
  return g.map((r) => r.join(""));
}
const shiftX = (rows: readonly string[], dx: number) =>
  rows.map((r) => r.slice(r.length - dx) + r.slice(0, r.length - dx));

// ════════════════════════════════════════════════════════════════════════════
// SPACE
// ════════════════════════════════════════════════════════════════════════════

const STAR_PAL = { k: "#0a0a2c", K: "#14144c", w: "#ffffff", y: "#f8e888", b: "#7aa8f8", p: "#c07af8", s: "#4a5ab0" };
/** Deep space: sparse stars that twinkle between frames. */
function stars(seed: number, frame: number): string[] {
  return gen16((x, y) => {
    const h = hash2(x, y, seed) % 1000;
    if (h < 14) return frame === 0 ? "w" : frame === 1 ? "s" : "w";
    if (h < 22) return frame === 1 ? "w" : "b";
    if (h < 27) return frame === 2 ? "p" : "y";
    if (h < 32) return frame === 2 ? "s" : "y";
    return h % 11 === 0 ? "K" : "k";
  });
}
const STAR_VARIANTS = [1, 2, 3, 4];
export const STARFIELD = defineTerrain({
  id: "starfield",
  level: 0,
  walkable: false,
  noJulio: true,
  pal: STAR_PAL,
  shade: ["#1c2060"],
  variants: STAR_VARIANTS.map((s) => ({ rows: stars(s, 0) })),
  frames: [0, 1, 2, 1].map((f) => STAR_VARIANTS.map((s) => ({ rows: stars(s, f) }))),
  fps: 1.2,
});

const MOON_PAL = { a: "#e4e4ee", b: "#c4c4d4", c: "#a2a2ba", d: "#82829e", e: "#686884" };
const dust = (seed: number, dens = 4) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < dens ? "c" : h > 96 ? "a" : "b";
};
const CRATER = [
  "..dddddd..",
  ".deeccccd.",
  "deccbbbbcd",
  "decbbbbbaa",
  "dcbbbbbbaa",
  ".dcbbbbaa.",
  "..daaaaa..",
];
const CRATER_S = [".dddd.", "dccbba", "dcbbaa", ".daaa."];
export const MOON_DUST = defineTerrain({
  id: "moon-dust",
  level: 2,
  group: "moon",
  pal: MOON_PAL,
  lip: { fill: "#c4c4d4", outline: "#4c4c68", bumpy: true },
  shade: ["#8a8aa6"],
  variants: [
    { weight: 4, rows: tile(dust(21)) },
    { weight: 3, rows: tile(dust(22, 3), [[2, 3, CRATER_S], [10, 10, [".aa.", "acca", ".cc."]]]) },
    { weight: 3, rows: tile(dust(23), [[9, 2, CRATER_S]]) },
    { weight: 2, rows: tile(dust(24, 6)) },
    { weight: 1, rows: tile(dust(25, 2), [[3, 4, CRATER]]) },
    { weight: 1, rows: tile(dust(26), [[3, 12, ["cc", "dd"]], [8, 7, ["cc.", "dcc"]]]) },
  ],
});

// Space-station deck: bolted metal plates.
const DECK_PAL = { a: "#b8c8e0", b: "#98a8c8", c: "#7888a8", d: "#586888", e: "#3c4a68", r: "#d85858", y: "#f8d848", k: "#303a58", g: "#58e0c8" };
const plate = (x: number, y: number) => {
  if (x === 0 || y === 0) return "c";
  if (x === 15 || y === 15) return "d";
  if (x === 1 || y === 1) return "a";
  if ((x === 3 || x === 12) && (y === 3 || y === 12)) return "e";
  return "b";
};
export const DECK = defineTerrain({
  id: "deck",
  level: 2,
  group: "deck",
  pal: DECK_PAL,
  lip: { fill: "#98a8c8", outline: "#283250", depth: 1 },
  shade: ["#586888"],
  variants: [
    { weight: 6, rows: tile(plate) },
    { weight: 2, rows: tile(plate, [[4, 6, ["eeeeeee", "ekkkkke", "ekkkkke", "eeeeeee"]]]) },
    { weight: 2, rows: tile(plate, [[3, 4, ["g.g.g"]], [3, 6, ["ddddd"]]]) },
    { weight: 1, rows: tile(plate, [[5, 5, ["eeee", "e..e", "e..e", "eeee"]]]) },
  ],
});

const HAZ = (x: number, y: number) => ((x + y) % 8 < 4 ? "y" : "k");
export const DECK_HAZARD = defineTerrain({
  id: "deck-hazard",
  level: 2,
  group: "deck",
  pal: DECK_PAL,
  lip: { fill: "#f8d848", outline: "#283250" },
  shade: ["#586888"],
  variants: [{ rows: tile((x, y) => (y < 3 || y > 12 ? plate(x, y) : HAZ(x, y))) }],
});

