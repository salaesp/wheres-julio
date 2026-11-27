// Terrains for El Espacio: a Pokémon-style moon base. Deep space with a
// twinkling starfield, lunar dust with craters (sunken pits), a rocky plateau
// with a cliff face, paving slabs, a concrete launch pad, and the station
// interior (metal plates, grating, lab tile, blue control carpet, hangar
// steel) plus the station hull wall — several of them re-tinted from the
// museum / boards terrains.
import { defineTerrain, hash2, type Terrain } from "../terrain";
import { MARBLE, CARPET, WALL, WALL_LOW } from "./museum";
import { STEEL } from "./boards";

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

/** Copy a terrain from another world without its sprite cache, with changes. */
function recolor(t: Terrain, over: Partial<Terrain> & { id: string }): Terrain {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _sprites, _cover, ...rest } = t;
  return defineTerrain({ ...rest, ...over });
}

// ════════════════════════════════════════════════════════════════════════════
// DEEP SPACE
// ════════════════════════════════════════════════════════════════════════════

const STAR_PAL = {
  k: "#0a0a2e", K: "#12124a", n: "#1a1458", N: "#241a6c",
  w: "#ffffff", y: "#f8e888", b: "#7aa8f8", p: "#c07af8", s: "#4a5ab0",
};
/** Deep space: sparse stars that twinkle between frames + faint nebula dither. */
function stars(seed: number, frame: number): string[] {
  const nebula = seed % 2 === 0;
  const base = gen16((x, y) => {
    const h = hash2(x, y, seed) % 1000;
    if (h < 14) return frame === 0 ? "w" : frame === 1 ? "s" : "w";
    if (h < 22) return frame === 1 ? "w" : "b";
    if (h < 27) return frame === 2 ? "p" : "y";
    if (h < 32) return frame === 2 ? "s" : "y";
    if (nebula) {
      const d = (x + 2 * y + seed * 3) % 20;
      if (d < 4 && (x + y) % 2 === 0) return d < 2 ? "N" : "n";
    }
    return h % 11 === 0 ? "K" : "k";
  });
  if (seed === 3) {
    // a four-point sparkle star
    const sp = frame === 1 ? ["...", ".s.", "..."] : [".w.", "www", ".w."];
    const g = base.map((r) => r.split(""));
    sp.forEach((r, yy) => { for (let xx = 0; xx < 3; xx++) if (r[xx] !== ".") g[6 + yy][9 + xx] = r[xx]; });
    return g.map((r) => r.join(""));
  }
  return base;
}
const STAR_VARIANTS = [1, 2, 3, 4, 6];
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

// ════════════════════════════════════════════════════════════════════════════
// LUNAR SURFACE
// ════════════════════════════════════════════════════════════════════════════

const MOON_PAL = { a: "#eceaf6", b: "#cac8de", c: "#a9a7c6", d: "#8987ab", e: "#6a688e", f: "#4e4c70" };
const dust = (seed: number, dens = 4) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < dens ? "c" : h > 96 ? "a" : h === 50 ? "d" : "b";
};
// Little craters lit from the top-left: dark inner rim up-left, bright lip down-right.
const CRATER_S = [".dddd.", "dccbba", "dcbbaa", ".daaa."];
const CRATER_M = ["..eeeee..", ".edccccb.", "edccbbbba", "edcbbbbaa", ".dcbbbaa.", "..daaaa.."];
const CRATER = ["..ddddddd..", ".eddcccccb.", "edccbbbbbba", "edcbbbbbbaa", "dcbbbbbbbaa", ".dcbbbbbaa.", "..ddaaaaa.."];
const PEBBLES = [["bb.", "cdd"], ["ab", "dd"]] as const;
const FOOT = ["cc.cc", "cc.cc", ".....", "cc.cc"];

export const MOON_DUST = defineTerrain({
  id: "moon-dust",
  level: 2,
  group: "moon",
  pal: MOON_PAL,
  lip: { fill: "#cac8de", outline: "#46446a", bumpy: true },
  shade: ["#8987ab"],
  variants: [
    { weight: 5, rows: tile(dust(21)) },
    { weight: 3, rows: tile(dust(22, 3), [[2, 3, CRATER_S], [10, 11, [".aa.", "acca", ".cc."]]]) },
    { weight: 3, rows: tile(dust(23), [[8, 2, CRATER_S]]) },
    { weight: 2, rows: tile(dust(24, 6), [[11, 9, PEBBLES[0]], [3, 11, PEBBLES[1]]]) },
    { weight: 1, rows: tile(dust(25, 2), [[3, 4, CRATER]]) },
    { weight: 1, rows: tile(dust(27, 3), [[4, 5, CRATER_M]]) },
    { weight: 0.8, rows: tile(dust(26), [[3, 12, ["cc", "dd"]], [8, 7, ["cc.", "dcc"]]]) },
    { weight: 0.7, rows: tile(dust(28), [[4, 4, FOOT], [8, 9, FOOT]]) },
  ],
});

// Sunken crater: a dark bowl; the lip of the dust above it makes the rim.
const PIT_PAL = { a: "#7a789e", b: "#5e5c84", c: "#4a4870", d: "#383658", e: "#2a2844", r: "#9694b8" };
const pit = (seed: number) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < 9 ? "c" : h < 12 ? "d" : h > 95 ? "a" : "b";
};
export const CRATER_PIT = defineTerrain({
  id: "moon-crater",
  level: 1,
  walkable: false,
  noJulio: true,
  group: "crater",
  pal: PIT_PAL,
  shade: ["#2a2844", "#383658"],
  variants: [
    { weight: 5, rows: tile(pit(31)) },
    { weight: 3, rows: tile(pit(32)) },
    { weight: 1.5, rows: tile(pit(33), [[4, 7, [".rr..", "rbbc.", ".ccd."]]]) },
    { weight: 1, rows: tile(pit(34), [[9, 3, ["rr.", "bbc"]], [3, 10, ["rb", "cd"]]]) },
  ],
});

// Rocky plateau (walkable top) and its stratified cliff face (not walkable).
const HILL_PAL = { a: "#f2f0fa", b: "#dcdaee", c: "#bebcd8", d: "#9d9bbd", e: "#7e7ca0", f: "#585676" };
const hillTop = (seed: number) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < 4 ? "c" : h > 95 ? "a" : "b";
};
export const MOON_HILL = defineTerrain({
  id: "moon-hill",
  level: 3,
  group: "moon-hill",
  pal: HILL_PAL,
  lip: { fill: "#dcdaee", outline: "#4a4868", depth: 1 },
  shade: ["#8a88ac"],
  variants: [
    { weight: 5, rows: tile(hillTop(41)) },
    { weight: 2, rows: tile(hillTop(42), [[3, 5, CRATER_S.map((r) => r.replace(/d/g, "c"))]]) },
    { weight: 1, rows: tile(hillTop(43), [[9, 8, ["aa.", "bcc"]], [3, 3, ["cc", "dd"]]]) },
  ],
});

function hillFace(seed: number): string[] {
  const crackX = [hash2(seed, 1) % 12 + 2, hash2(seed, 2) % 12 + 2];
  return gen16((x, y) => {
    if (y <= 1) return "a";
    if (y === 2) return "b";
    if (y === 3) return "c";
    if (y >= 14) return "f";
    if (y === 13) return "e";
    // strata bands with vertical cracks
    const band = y < 8 ? 0 : 1;
    if (y === 8) return "d";
    if (crackX.includes(x) && y > 3 && y < 13 && (x + y + band) % 3 !== 0) return "e";
    if (y === 12) return "d";
    return (x + y * 2 + seed) % 9 === 0 ? "c" : y < 8 ? "b" : "c";
  });
}
export const HILL_FACE = defineTerrain({
  id: "moon-hill-face",
  level: 3,
  walkable: false,
  noJulio: true,
  group: "moon-hill",
  pal: HILL_PAL,
  lip: { fill: "#7e7ca0", outline: "#3a3858", depth: 1 },
  variants: [{ weight: 3, rows: hillFace(1) }, { weight: 3, rows: hillFace(2) }, { weight: 2, rows: hillFace(3) }],
});

// Paving slabs (walkways between the base, pad and airlock).
const ROAD_PAL = { a: "#d6def2", b: "#b6bfdc", c: "#9aa4c8", d: "#7d87ae", y: "#f4d048", k: "#3a4064" };
const slabs = (seed: number) => (x: number, y: number) => {
  const row = Math.floor(y / 8);
  const sx = (x + (row % 2) * 5) % 10;
  const sy = y % 8;
  if (sy === 7) return "d";
  if (sx === 9) return "c";
  if (sy === 0 || sx === 0) return "a";
  const h = hash2(x, y, seed) % 100;
  return h < 4 ? "c" : "b";
};
export const MOON_ROAD = defineTerrain({
  id: "moon-road",
  level: 2.4,
  group: "moon-road",
  pal: ROAD_PAL,
  lip: { fill: "#b6bfdc", outline: "#444c78", depth: 1 },
  shade: ["#8a94bc"],
  variants: [
    { weight: 6, rows: tile(slabs(51)) },
    { weight: 2, rows: tile(slabs(52), [[3, 3, ["kk", "kk"]]]) },
    { weight: 1.2, rows: tile(slabs(53), [[5, 4, [".a.", "aca", ".a."]]]) },
    { weight: 1, rows: tile(slabs(54), [[2, 10, ["yyyyy"]]]) },
  ],
});

// Launch pad: dark concrete with scorch marks and yellow corner brackets.
const PAD_PAL = { a: "#aeb4cc", b: "#939bb8", c: "#7a82a2", d: "#60688a", e: "#464e6e", y: "#f8d848", Y: "#c8a028", k: "#2c3250", o: "#f08a30" };
const concrete = (seed: number) => (x: number, y: number) => {
  const sx = x % 8, sy = y % 8;
  if (sx === 0 || sy === 0) return "c";
  const h = hash2(x, y, seed) % 100;
  return h < 5 ? "c" : h > 95 ? "a" : "b";
};
export const LAUNCH_PAD = defineTerrain({
  id: "launch-pad",
  level: 3,
  group: "pad",
  pal: PAD_PAL,
  lip: { fill: "#939bb8", outline: "#2c3250", depth: 1 },
  shade: ["#60688a"],
  variants: [
    { weight: 5, rows: tile(concrete(61)) },
    { weight: 2, rows: tile(concrete(62), [[3, 3, ["dddd.", "ddddd", ".dddd"]], [9, 9, ["dd", "dd"]]]) },
    { weight: 1.5, rows: tile(concrete(63), [[1, 1, ["yyy", "y..", "y.."]], [12, 12, ["..y", "..y", "yyy"]]]) },
    { weight: 1, rows: tile(concrete(64), [[5, 5, ["eeeeee", "ebbbbd", "ebccbd", "ebccbd", "ebbbbd", "eddddd"]]]) },
  ],
});

// Pad retaining wall: concrete with a hazard stripe.
export const PAD_FACE = defineTerrain({
  id: "launch-pad-face",
  level: 3,
  walkable: false,
  noJulio: true,
  group: "pad",
  pal: PAD_PAL,
  lip: { fill: "#60688a", outline: "#2c3250", depth: 1 },
  variants: [
    {
      weight: 1,
      rows: gen16((x, y) => {
        if (y <= 1) return "a";
        if (y === 2) return "c";
        if (y >= 3 && y <= 6) return (x + y) % 8 < 4 ? "y" : "k";
        if (y === 7) return "k";
        if (y >= 14) return "k";
        if (y === 13) return "e";
        if (x === 0 || x === 8) return "e";
        return y < 10 ? "c" : "d";
      }),
    },
    {
      weight: 1,
      rows: gen16((x, y) => {
        if (y <= 1) return "a";
        if (y === 2) return "c";
        if (y >= 3 && y <= 6) return (x + y) % 8 < 4 ? "y" : "k";
        if (y === 7) return "k";
        if (y >= 14) return "k";
        if (y === 13) return "e";
        if (y >= 9 && y <= 11 && x >= 3 && x <= 12) return y === 9 || x === 3 || x === 12 ? "e" : "k";
        return y < 10 ? "c" : "d";
      }),
    },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// STATION INTERIOR
// ════════════════════════════════════════════════════════════════════════════

const DECK_PAL = { a: "#cdd8ee", b: "#a9b8d8", c: "#8898bc", d: "#667698", e: "#475678", k: "#2c3654", g: "#58e0c8", r: "#e05858", y: "#f8d848", w: "#eef4ff", x: "#5a6a8e" };
/** Beveled 16×16 steel plate with bolts in the corners. */
const plate = (x: number, y: number) => {
  if (x === 15 || y === 15) return "e";
  if (x === 14 || y === 14) return "d";
  if (x === 0 || y === 0) return "c";
  if (x === 1 || y === 1) return "a";
  if ((x === 3 || x === 12) && (y === 3 || y === 12)) return "e";
  if ((x === 2 && y === 2) || (x === 13 && y === 2) || (x === 2 && y === 13) || (x === 13 && y === 13)) return "d";
  return "b";
};
export const DECK = defineTerrain({
  id: "deck",
  level: 2,
  group: "deck",
  pal: DECK_PAL,
  lip: { fill: "#a9b8d8", outline: "#232c48", depth: 1 },
  shade: ["#475678"],
  variants: [
    { weight: 6, rows: tile(plate) },
    // maintenance panel with a dark window and status lights
    { weight: 1.6, rows: tile(plate, [[4, 5, ["kkkkkkk", "kxxxxxk", "kxxxxxk", "kkkkkkk"]], [5, 10, ["g.r.y"]]]) },
    // floor vent
    { weight: 1.6, rows: tile(plate, [[3, 4, ["eeeeeeeeee", "kkkkkkkkkk", "dddddddddd", "kkkkkkkkkk", "dddddddddd", "kkkkkkkkkk", "eeeeeeeeee"]]]) },
    // round hatch
    { weight: 1, rows: tile(plate, [[4, 4, [".eeeeee.", "ebbbbbbd", "ebccccbd", "ebcddcbd", "ebcddcbd", "ebccccbd", "ebbbbbbd", ".dddddd."]]]) },
    // glowing floor strip
    { weight: 1, rows: tile(plate, [[2, 7, ["g.g.g.g.g.g."]]]) },
  ],
});

/** Diamond-tread plating (second metal tile type). */
const tread = (x: number, y: number) => {
  if (x === 15 || y === 15) return "e";
  if (x === 0 || y === 0) return "c";
  const u = (x + y) % 4, v = (x - y + 32) % 4;
  if (u === 0 && v === 0) return "a";
  if (u === 2 && v === 2) return "d";
  return "b";
};
export const DECK_TREAD = defineTerrain({
  id: "deck-tread",
  level: 2,
  group: "deck",
  pal: DECK_PAL,
  lip: { fill: "#a9b8d8", outline: "#232c48", depth: 1 },
  shade: ["#475678"],
  variants: [{ weight: 5, rows: tile(tread) }, { weight: 1, rows: tile(tread, [[4, 6, ["kkkkkkk", "kxxxxxk", "kkkkkkk"]]]) }],
});

// Airlock threshold: yellow/black hazard stripes with plain edges.
const HAZ = (x: number, y: number) => ((x + y) % 8 < 4 ? "y" : "k");
export const DECK_HAZARD = defineTerrain({
  id: "deck-hazard",
  level: 2,
  group: "deck",
  pal: DECK_PAL,
  lip: { fill: "#f8d848", outline: "#232c48" },
  shade: ["#475678"],
  variants: [
    { weight: 3, rows: tile((x, y) => (y < 3 || y > 12 ? plate(x, y) : HAZ(x, y))) },
    { weight: 1, rows: tile(HAZ) },
  ],
});

// Cargo-bay grating: dark mesh with light crossings.
const GRATE_PAL = { a: "#8c9cc0", b: "#5a6890", c: "#3c4870", d: "#2a3354", k: "#1a2038" };
const grate = (x: number, y: number) => {
  if (x === 0 || y === 0) return "a";
  if (x === 15 || y === 15) return "c";
  const mx = x % 4, my = y % 4;
  if (mx === 0 && my === 0) return "a";
  if (mx === 0 || my === 0) return "b";
  return (x + y) % 2 === 0 ? "d" : "k";
};
export const DECK_GRATE = defineTerrain({
  id: "deck-grate",
  level: 1.6,
  group: "grate",
  pal: GRATE_PAL,
  lip: { fill: "#5a6890", outline: "#1a2038", depth: 1 },
  shade: ["#1a2038"],
  variants: [{ weight: 5, rows: tile(grate) }, { weight: 1, rows: tile(grate, [[4, 4, ["aaaaaaaa", "a......a", "a......a", "aaaaaaaa"]]]) }],
});

// Lab tile: the museum marble slabs re-tinted to cold white-cyan.
export const LAB_TILE = recolor(MARBLE, {
  id: "lab-tile",
  level: 2.2,
  group: "lab-floor",
  pal: {
    w: "#ffffff", a: "#f4fbff", b: "#e0f0fa", c: "#c6dcee", V: "#b4cee4",
    B: "#d4e8f6", D: "#c2daec", C: "#a8c4de", v: "#90b0d0", g: "#8aa6c6",
  },
  shade: ["#8aa6c6", "#aac4de"],
  lip: { fill: "#e0f0fa", outline: "#425a7c", depth: 2 },
});

// Control room: the museum carpet re-tinted deep blue with cyan trim.
export const CONTROL_CARPET = recolor(CARPET, {
  id: "control-carpet",
  level: 2.3,
  pal: { a: "#4c78d8", b: "#34509c", c: "#283c7c", y: "#58e8e0", Y: "#2aa0b0" },
  shade: ["#1c2c60"],
  lip: { fill: "#58d8e8", outline: "#16224c", depth: 2 },
});

// Rest area carpet: purple.
export const DORM_CARPET = recolor(CARPET, {
  id: "dorm-carpet",
  level: 2.3,
  pal: { a: "#a478e0", b: "#7c54b8", c: "#5e3c98", y: "#f8c858", Y: "#c89030" },
  shade: ["#432a74"],
  lip: { fill: "#f0c048", outline: "#2c1a54", depth: 2 },
});

// Hangar steel: boards' STEEL re-leveled so it sits beside the deck plates.
export const HANGAR_STEEL = recolor(STEEL, {
  id: "hangar-steel",
  level: 1.8,
  group: "hangar",
  lip: { fill: "#b0b8cc", outline: "#2c3050", depth: 1 },
  shade: ["#7c84a0", "#a0a8c0"],
});

// Station hull: museum wall tiles re-tinted into riveted blue-grey panels.
const HULL_PAL = {
  a: "#9fb0da", b: "#8296c6", c: "#6c7fb0", d: "#556898",
  m: "#e8f0ff", M: "#bccaee", n: "#7684b0", k: "#222a48",
  t: "#6c7fb0", u: "#586a9c", v: "#404f7c", T: "#a4b4de",
};
export const HULL_WALL = recolor(WALL, { id: "hull-wall", pal: HULL_PAL });
export const HULL_WALL_LOW = recolor(WALL_LOW, {
  id: "hull-wall-low",
  pal: HULL_PAL,
  lip: { fill: "#222a48", outline: "#161c34", depth: 1 },
});
