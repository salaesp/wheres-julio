// Terrains for El Bosque Encantado: the classic grass / tall-grass / stone /
// sand / water / bridge tiles of the other worlds, re-tinted with a blue-teal
// night palette (Viridian-forest-at-midnight), plus a dense tree-wall tile for
// the borders and a glowing violet moss for the magic-tree clearing.
import { defineTerrain, type Terrain } from "../terrain";
import { GRASS, GRASS_DARK, TALL_GRASS, STONE, PATH, SAND, WATER } from "./common";
import { BRIDGE, JUNGLE_TALL } from "./nature2";
import { hexToRgb, rgbToHex } from "../color";

// ── Night re-tint helper (also used by the props) ───────────────────────────
// Greens slide towards deep teal; every other colour is darkened with a cool
// blue cast. `lift` keeps glowing things (flowers, windows) readable.
export function nightHex(hex: string, dark = 0.72): string {
  const [r, g, b] = hexToRgb(hex);
  const foliage = g > r * 1.08 && g >= b;
  if (foliage) {
    return rgbToHex([r * 0.34 * dark + 6, g * 0.78 * dark + 12, b * 0.6 * dark + g * 0.22 * dark + 18]);
  }
  return rgbToHex([r * 0.74 * dark + 12, g * 0.78 * dark + 16, b * 0.86 * dark + 34]);
}
export function nightPal(pal: Record<string, string | null | undefined>, dark = 0.72, keep: string[] = []) {
  const out: Record<string, string | null | undefined> = {};
  for (const [k, v] of Object.entries(pal)) out[k] = v && !keep.includes(k) ? nightHex(v, dark) : v;
  return out;
}

// ── tile helpers ────────────────────────────────────────────────────────────
type Mark = readonly [number, number, readonly string[]];
/** Stamp hand-drawn marks on 16x16 rows ('.' keeps the base). */
function marked(base: readonly string[], marks: readonly Mark[]): string[] {
  const g = base.map((r) => r.split(""));
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
const flat = (c: string): string[] => Array.from({ length: 16 }, () => c.repeat(16));
const shiftX = (rows: readonly string[], dx: number) =>
  rows.map((r) => r.slice(r.length - dx) + r.slice(0, r.length - dx));

// ════════════════════════════════════════════════════════════════════════════
// Night grass
// ════════════════════════════════════════════════════════════════════════════
const NG_PAL = {
  a: "#45a08a", b: "#2f7c6c", c: "#266a5e", d: "#1c5148",
  r: "#f890d8", R: "#b04a8c",   // glowing pink flower
  y: "#f8f090", Y: "#c8b048",   // yellow bloom
  w: "#e8f4ff", W: "#8ab0d0",   // white flower
  u: "#78e4f8", U: "#3c98c4",   // blue glow-cap mushroom
  e: "#7a9cb4", E: "#506c88",   // pebble
};
const G0 = flat("b");
export const NIGHT_GRASS: Terrain = defineTerrain({
  id: "night-grass",
  level: 2,
  pal: NG_PAL,
  lip: { fill: "#2f7c6c", outline: "#123834", bumpy: true },
  variants: [
    { weight: 6, rows: G0 },
    ...GRASS.variants.slice(1, 3).map((v) => ({ weight: 4, rows: v.rows })),
    { weight: 0.9, rows: GRASS.variants[3].rows },
    { weight: 0.7, rows: marked(G0, [[4, 5, [".u.", "uuu", ".U."]], [5, 8, ["c"]], [11, 11, ["."]]]) },
    { weight: 0.5, rows: marked(G0, [[9, 3, ["ee.", "eEE", ".EE"]], [3, 11, ["a.a", "c.c"]]]) },
    { weight: 0.5, rows: marked(G0, [[3, 3, [".y.", "yYy", ".y.", ".c."]], [10, 10, [".r.", "rRr", ".r.", ".c."]]]) },
  ],
});

// Forest floor in the shade of the border: a little darker and "raised" a
// notch so it gets a soft ledge against the open grass.
export const NIGHT_UNDERGROWTH: Terrain = defineTerrain({
  id: "night-undergrowth",
  level: 2.5,
  pal: { a: "#2f8070", b: "#236a5e", c: "#1c5a50", d: "#154640", u: "#78e4f8", U: "#3c98c4", p: "#e8a0f0", P: "#a85ab4", t: "#6c5870", T: "#4c3c54" },
  lip: { fill: "#236a5e", outline: "#0e302e", bumpy: true },
  shade: ["#1a5048"],
  variants: [
    { weight: 6, rows: flat("b") },
    { weight: 4, rows: GRASS_DARK.variants[1].rows.map((r) => r.replace(/a/g, "a")) },
    { weight: 3, rows: GRASS_DARK.variants[2].rows },
    { weight: 0.8, rows: marked(flat("b"), [[3, 4, [".p.", "pPp", ".d."]], [11, 10, [".u.", "uUu", ".d."]]]) },
    { weight: 0.8, rows: marked(flat("b"), [[2, 9, ["tt..", "tTTt", ".TT."]], [10, 3, ["a.a", "c.c"]]]) },
  ],
});

// Tall grass (hides legs) — same art as the other worlds, in night teal.
export const NIGHT_TALL: Terrain = defineTerrain({
  ...TALL_GRASS,
  id: "night-tall-grass",
  pal: { a: "#4cb89c", b: "#2e8a78", c: "#226a60", d: "#17504a", ".": null },
  lip: { fill: "#2e8a78", outline: "#0c302e", bumpy: true },
  _sprites: undefined, _cover: undefined,
} as Terrain);

// Glowing violet moss: the garden island under the magic tree.
const MOSS_PAL = {
  a: "#8c88f0", b: "#6660c8", c: "#504aa4", d: "#3c3684",
  u: "#a8f0ff", w: "#ffffff", p: "#f8a8f0",
};
export const NIGHT_MOSS: Terrain = defineTerrain({
  id: "night-moss",
  level: 2,
  group: "moss",
  pal: MOSS_PAL,
  lip: { fill: "#6660c8", outline: "#262060", bumpy: true },
  variants: [
    { weight: 6, rows: flat("b") },
    { weight: 4, rows: marked(flat("b"), [[2, 3, ["a.a", "c.c"]], [10, 9, ["a...a", "c.a.c", ".c.c."]]]) },
    { weight: 3, rows: marked(flat("b"), [[7, 2, ["a.a", "c.c"]], [3, 10, [".a...", "a.a.a", "cacac", ".ccc."]]]) },
    { weight: 3, rows: marked(flat("b"), [[1, 7, ["a.a.a", "c.a.c", ".c.c."]], [9, 2, ["a.a", "c.c"]], [12, 12, ["a.a", "c.c"]]]) },
    { weight: 1, rows: marked(flat("b"), [[4, 4, [".u.", "uwu", ".u."]], [11, 11, [".p.", "pup", ".p."]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Luminous stone road, night dirt trail, moon sand
// ════════════════════════════════════════════════════════════════════════════
const STONE_PAL = {
  a: "#f0f4ff", b: "#c4d0f4", c: "#97a6dc", d: "#7280c0",
  m: "#58b8a8", M: "#38887c", u: "#b8f4ff", w: "#ffffff", p: "#f8b0f0",
};
const S0 = STONE.variants[0].rows;
export const NIGHT_STONE: Terrain = defineTerrain({
  id: "night-stone",
  level: 1,
  pal: STONE_PAL,
  shade: ["#8090cc"],
  lip: { fill: "#c4d0f4", outline: "#4a58a0" },
  variants: [
    { weight: 5, rows: S0 },
    { weight: 2, rows: marked(S0, [[1, 1, ["mm", "mM"]], [11, 5, ["m"]], [4, 10, [".m", "mM", "M."]]]) },
    { weight: 1.6, rows: marked(S0, [[5, 3, ["u", "w"]], [12, 11, ["u"]], [2, 12, ["w"]]]) },
    { weight: 1.2, rows: marked(S0, [[9, 9, ["mm.", "MMm", ".Mm"]], [3, 2, ["p"]], [12, 13, ["m"]]]) },
  ],
});

export const NIGHT_TRAIL: Terrain = defineTerrain({
  ...PATH,
  id: "night-trail",
  pal: { a: "#9c90a4", b: "#7a6e88", c: "#625874", d: "#4a4260" },
  shade: ["#564e6a"],
  lip: { fill: "#7a6e88", outline: "#2a2440" },
  _sprites: undefined, _cover: undefined,
} as Terrain);

export const MOON_SAND: Terrain = defineTerrain({
  ...SAND,
  id: "moon-sand",
  pal: { a: "#b8cce0", b: "#8aa4c2", c: "#728cac", d: "#5a7294", s: "#f4b8e8", S: "#c47cb4" },
  shade: ["#667ea0"],
  lip: { fill: "#8aa4c2", outline: "#3a5072", bumpy: true },
  _sprites: undefined, _cover: undefined,
} as Terrain);

// ════════════════════════════════════════════════════════════════════════════
// Water & bridge
// ════════════════════════════════════════════════════════════════════════════
export const NIGHT_POND: Terrain = defineTerrain({
  ...WATER,
  id: "night-pond",
  pal: { a: "#c0f4ff", b: "#4c98dc", c: "#3a72c4", d: "#2c54a4" },
  shade: ["#a8e8fa", "#5ca4e0"],
  _sprites: undefined, _cover: undefined,
} as Terrain);

// Plank bridge (the jungle's, with warm lantern-lit wood).
export const NIGHT_BRIDGE: Terrain = defineTerrain({
  ...BRIDGE,
  id: "night-bridge",
  pal: { a: "#e8c490", b: "#c49458", c: "#9a6c3c", d: "#4e301c", e: "#7a4c2c" },
  lip: { fill: "#9a6c3c", outline: "#2c1a10" },
  _sprites: undefined, _cover: undefined,
} as Terrain);

// ════════════════════════════════════════════════════════════════════════════
// Tree wall: dense dark canopy for the borders (not walkable). Big trees are
// planted on top of it, so what you see between them is deep foliage.
// ════════════════════════════════════════════════════════════════════════════
const WALL_ROWS = JUNGLE_TALL.variants[0].rows;
const EYES = [[3, 5, ["u.u"]], [9, 11, ["u.u"]]] as const;
export const TREE_WALL: Terrain = defineTerrain({
  id: "night-tree-wall",
  level: 4,
  walkable: false,
  noJulio: true,
  pal: { a: "#2e7868", b: "#1f5650", c: "#17443f", d: "#0f322f", u: "#f8f090" },
  lip: { fill: "#1f5650", outline: "#082220", bumpy: true },
  variants: [
    { weight: 8, rows: WALL_ROWS },
    { weight: 2, rows: shiftX(WALL_ROWS, 3) },
    { weight: 0.5, rows: marked(WALL_ROWS, [[EYES[0][0], EYES[0][1], EYES[0][2]]]) },
    { weight: 0.4, rows: marked(WALL_ROWS, [[EYES[1][0], EYES[1][1], EYES[1][2]]]) },
  ],
});
