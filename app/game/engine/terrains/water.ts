// Seaside + pool terrains (beach sand, dune grass, docks, pool water & tiles)
// and a small "baker" that turns a per-pixel function into unique tiles, for
// organic coastlines and ship hulls that a 16×16 grid can't express.
import { defineTerrain, TILE, type Terrain, type TileArt } from "../terrain";
import type { Pal } from "../sprite";
import { SEA } from "./common";

// ── Sea pattern (identical to common.ts SEA so baked tiles stay in sync) ────
const SEA_W0 = [
  "cccccccccccccccc",
  "cccccccccccccccc",
  "ccccbbbccccccccc",
  "cccbbccbbccccccc",
  "cccccccccccccccc",
  "cccccccccccccccc",
  "cccccccccccccccc",
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
const shift = (rows: string[], dx: number) => rows.map((r) => r.slice(-dx) + r.slice(0, r.length - dx));
export const SEA_FRAMES: string[][] = [
  SEA_W0,
  shift(SEA_W0, 2),
  shift(SEA_W0, 4).map((r, i) => (i === 3 ? r.replace("bb", "ab") : r)),
  shift(SEA_W0, 2),
];
export const SEA_FPS = 1.5;
export const SEA_COLORS = { a: "#c8e0ff", b: "#6890e8", c: "#4870d0", d: "#3858b8" };

/** Sea pattern letter (a/b/c/d) at world pixel (x, y) for a frame. */
export function seaChar(x: number, y: number, f: number): string {
  return SEA_FRAMES[f & 3][((y % TILE) + TILE) % TILE][((x % TILE) + TILE) % TILE];
}

/** Cheap deterministic noise in [0, 1). */
export function noise(x: number, y: number, s = 0): number {
  let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/** Ordered dither threshold in [0, 1) for a pixel. */
export function bayer(x: number, y: number): number {
  return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
}

// ── Baker ────────────────────────────────────────────────────────────────────
export type BakeSpec = {
  id: string;
  cols: number;
  rows: number;
  pal: Pal;
  /** A ready-made terrain for this tile, or null to bake it from `px`. */
  base: (tx: number, ty: number) => Terrain | null;
  /** Palette letter for world pixel (x, y) at animation frame f. */
  px: (x: number, y: number, f: number) => string;
  frames?: number;
  fps?: number;
  walkable?: (tx: number, ty: number) => boolean;
  /** Optional leg-hiding overlay (like tall grass) built from frame 0. */
  cover?: (tx: number, ty: number, rows: string[]) => string[] | null;
  level?: number;
  group?: string;
};

/** Build a map + legend where every baked tile is its own terrain. */
export function bakeMap(spec: BakeSpec): { map: string[]; legend: Record<string, Terrain> } {
  const nF = spec.frames ?? 4;
  const legend: Record<string, Terrain> = {};
  const charOf = new Map<Terrain, string>();
  let next = 0;
  const assign = (t: Terrain) => {
    let ch = charOf.get(t);
    if (!ch) {
      ch = String.fromCharCode(0x4e00 + next++);
      charOf.set(t, ch);
      legend[ch] = t;
    }
    return ch;
  };
  const map: string[] = [];
  for (let ty = 0; ty < spec.rows; ty++) {
    let row = "";
    for (let tx = 0; tx < spec.cols; tx++) {
      let t = spec.base(tx, ty);
      if (!t) {
        const frames: string[][] = [];
        for (let f = 0; f < nF; f++) {
          const rows: string[] = [];
          for (let ly = 0; ly < TILE; ly++) {
            let r = "";
            for (let lx = 0; lx < TILE; lx++) r += spec.px(tx * TILE + lx, ty * TILE + ly, f);
            rows.push(r);
          }
          frames.push(rows);
        }
        const animated = frames.some((fr) => fr.join() !== frames[0].join());
        const cover = spec.cover?.(tx, ty, frames[0]);
        t = defineTerrain({
          id: `${spec.id}-${tx}-${ty}`,
          level: spec.level ?? 1,
          group: spec.group ?? spec.id,
          walkable: spec.walkable ? spec.walkable(tx, ty) : false,
          pal: spec.pal,
          variants: [{ rows: frames[0] }],
          frames: animated ? frames.map((rows) => [{ rows }]) : undefined,
          fps: spec.fps ?? SEA_FPS,
          cover: cover ? { rows: cover } : undefined,
          // wading in the surf: only the head shows — too hard for Julio
          noJulio: !!cover,
        });
      }
      row += assign(t);
    }
    map.push(row);
  }
  return { map, legend };
}

// ── Tile art helpers ─────────────────────────────────────────────────────────
type Stamp = readonly [number, number, readonly string[]];
function tile(fill: string, stamps: readonly Stamp[] = []): string[] {
  const g = Array.from({ length: TILE }, () => Array<string>(TILE).fill(fill));
  for (const [x, y, rows] of stamps) {
    rows.forEach((r, yy) => {
      for (let xx = 0; xx < r.length; xx++) {
        if (r[xx] !== "." && g[y + yy] && x + xx < TILE) g[y + yy][x + xx] = r[xx];
      }
    });
  }
  return g.map((r) => r.join(""));
}

// ── Beach sand (no lip: shore transitions are baked) ─────────────────────────
export const SAND_COLORS = {
  a: "#fff8d8", b: "#f8e8b0", c: "#e8d090", d: "#d0b070",
  s: "#f8a8a0", S: "#d07068", w: "#ffffff", W: "#d8d0c0", o: "#f8a048", O: "#c86828",
};
const DOT: Stamp[] = [[3, 4, ["c"]], [11, 10, ["c"]], [6, 13, ["ac"]]];
export const BEACH_SAND = defineTerrain({
  id: "beach-sand",
  level: 1,
  group: "beach",
  pal: SAND_COLORS,
  shade: ["#e0c888"],
  variants: [
    { weight: 6, rows: tile("b", DOT) },
    { weight: 5, rows: tile("b", [[9, 3, ["ac"]], [2, 9, ["c"]], [13, 13, ["c"]]]) },
    { weight: 3, rows: tile("b", [[4, 3, [".c.c", "c.c.", ".c.c"]], [10, 11, ["ac"]]]) },
    { weight: 2, rows: tile("b", [[5, 5, ["cc..", ".cc.", "..cc"]], [12, 2, ["c"]]]) },
    { weight: 0.6, rows: tile("b", [[6, 6, [".w.", "wWw", "WW."]], [2, 12, ["c"]]]) }, // shell
    { weight: 0.5, rows: tile("b", [[5, 5, ["..o..", "ooooo", ".oOo.", ".o.o."]], [12, 12, ["c"]]]) }, // starfish
    { weight: 0.5, rows: tile("b", [[4, 7, [".ss.", "sSSs", ".SS."]], [11, 2, ["ac"]]]) }, // pink shell
    // footprints
    { weight: 1, rows: tile("b", [[3, 1, ["cc", "cc", ".c"]], [8, 5, ["cc", "cc", "c."]], [3, 9, ["cc", "cc", ".c"]], [8, 13, ["cc", "cc"]]]) },
  ],
});

// ── Dune grass: hides legs like tall grass, sand shows between tufts ─────────
const DUNE_STRIP = [
  "sasssasssasssass",
  "abasabasabasabas",
  "bbbabbbabbbabbba",
  "bcbbbcbbbcbbbcbb",
  "cccbcccbcccbcccb",
  "dcdcdcdcdcdcdcdc",
  "dddddddddddddddd",
  "edddedddedddeddd",
];
const DUNE_ROWS = [...DUNE_STRIP, ...shift(DUNE_STRIP, 2)];
export const DUNE_GRASS = defineTerrain({
  id: "dune-grass",
  level: 3,
  pal: { a: "#e8f8a8", b: "#b8d868", c: "#90b848", d: "#6a9038", e: "#d8c078", s: "#f0dca0", ".": null },
  lip: { fill: "#b8d868", outline: "#4c7028", bumpy: true },
  shade: [],
  variants: [{ rows: DUNE_ROWS }],
  cover: { rows: DUNE_ROWS.map((r) => r.replace(/[se]/g, ".")) },
});

// ── Wooden dock (vertical pier: planks run across) ───────────────────────────
const PLANK_PAL = { a: "#f8d8a0", b: "#e0b070", c: "#c89050", d: "#80502c", n: "#5a3420", k: "#a87040" };
function plankTile(joints: number[], knot = -1): string[] {
  const rows: string[] = [];
  for (let y = 0; y < TILE; y++) {
    const p = Math.floor(y / 4), k = y % 4;
    let r = "";
    for (let x = 0; x < TILE; x++) {
      const j = joints[p];
      let c = k === 0 ? "a" : k === 3 ? "d" : "b";
      if (k === 2 && (x * 5 + p * 7) % 13 === 0) c = "c";
      if (x === j) c = "d";
      if (x === j + 1 && k !== 3) c = "a";
      if ((x === j - 2 || x === j + 3) && k === 1) c = "n";
      if (knot >= 0 && p === 2 && (x === knot || x === knot + 1) && k === 1) c = "k";
      r += c;
    }
    rows.push(r);
  }
  return rows;
}
export const DOCK = defineTerrain({
  id: "dock",
  level: 2,
  pal: PLANK_PAL,
  lip: { fill: "#9c6034", outline: "#3c2414", depth: 3 },
  shade: ["#c09060"],
  variants: [
    { weight: 3, rows: plankTile([5, -9, 11, -9]) },
    { weight: 2, rows: plankTile([-9, 9, -9, 3], 4) },
    { weight: 2, rows: plankTile([12, -9, 6, -9]) },
    { weight: 2, rows: plankTile([-9, 2, -9, 13], 9) },
  ],
});
const transpose = (rows: string[]) => rows[0].split("").map((_, x) => rows.map((r) => r[x]).join(""));
/** Horizontal boardwalk: planks run vertically. */
export const BOARDWALK = defineTerrain({
  id: "boardwalk",
  level: 2,
  pal: PLANK_PAL,
  lip: { fill: "#9c6034", outline: "#3c2414", depth: 2 },
  shade: ["#c09060"],
  variants: DOCK.variants.map((v) => ({ weight: v.weight, rows: transpose([...v.rows]).map((r) => r.replace(/a/g, "b")) })),
});

// ── Pool water (light cyan, visible floor tiles, animated caustics) ─────────
const POOL_PAL = { a: "#f0ffff", b: "#a8f0ff", c: "#68d8f8", d: "#50c4f0", e: "#40b0e8" };
function poolFrame(f: number): string[] {
  // floor grid every 8px + caustic squiggles that drift
  const caustics: [number, number][] = [[2, 3], [9, 1], [12, 9], [4, 11], [7, 6], [14, 14]];
  const g = Array.from({ length: TILE }, (_, y) => Array.from({ length: TILE }, (_, x): string => (x % 8 === 7 || y % 8 === 7 ? "d" : "c")));
  caustics.forEach(([cx, cy], i) => {
    const o = (f + i) % 4;
    const x = (cx + o) % TILE, y = (cy + (i % 2 ? o >> 1 : 0)) % TILE;
    g[y][x] = "b"; g[y][(x + 1) % TILE] = "b";
    if (i % 2 === 0) g[(y + 1) % TILE][(x + 2) % TILE] = "b";
    if (i === 1 && f % 2 === 0) g[y][(x + 2) % TILE] = "a";
  });
  return g.map((r) => r.join(""));
}
const POOL_FRAMES = [0, 1, 2, 3].map(poolFrame);
export const POOL_WATER = defineTerrain({
  id: "pool-water",
  level: 0,
  walkable: false,
  group: "pool",
  pal: POOL_PAL,
  shade: ["#2c90d0", "#40a8e8", "#58c0f0"],
  variants: [{ rows: POOL_FRAMES[0] }],
  frames: POOL_FRAMES.map((rows) => [{ rows }]),
  fps: 2,
});

/** Jacuzzi / hot tub: bubbling water. */
function bubbleFrame(f: number): string[] {
  const g = Array.from({ length: TILE }, (_, y) => Array.from({ length: TILE }, (_, x): string => ((x + y) % 5 === 0 ? "d" : "c")));
  const pts: [number, number][] = [[3, 3], [10, 2], [6, 8], [13, 10], [2, 12], [9, 13]];
  pts.forEach(([x, y], i) => {
    const s = (f + i) % 3;
    const yy = (y - s + TILE) % TILE;
    if (s === 0) { g[yy][x] = "a"; }
    else if (s === 1) { g[yy][x] = "b"; g[yy][x + 1] = "a"; g[(yy + 1) % TILE][x] = "b"; g[(yy + 1) % TILE][x + 1] = "b"; }
    else { g[yy][x] = "b"; }
  });
  return g.map((r) => r.join(""));
}
export const BUBBLE_WATER = defineTerrain({
  id: "bubble-water",
  level: 0,
  walkable: false,
  group: "pool",
  pal: { a: "#ffffff", b: "#c8f8ff", c: "#80e0f8", d: "#68d0f0" },
  shade: ["#2c90d0", "#48b0e8"],
  variants: [{ rows: bubbleFrame(0) }],
  frames: [0, 1, 2].map((f) => [{ rows: bubbleFrame(f) }]),
  fps: 4,
});

// ── Poolside tiles. The lip is the white coping stone around pools. ─────────
const POOLTILE_PAL = { a: "#fcf8ec", b: "#f4eee0", c: "#ebe3d0", d: "#d6cab0", e: "#d4e8ec", f: "#b8d8e4", g: "#9aa4b4" };
function floorTile(alt: boolean, extra: readonly Stamp[] = []): string[] {
  const rows: string[] = [];
  for (let y = 0; y < TILE; y++) {
    let r = "";
    for (let x = 0; x < TILE; x++) {
      const cell = ((x >> 3) + (y >> 3)) & 1;
      let c = cell ^ (alt ? 1 : 0) ? "c" : "b";
      if (x % 8 === 7 || y % 8 === 7) c = "d";
      else if (x % 8 === 0 && y % 8 === 0 && c === "b") c = "a";
      r += c;
    }
    rows.push(r);
  }
  const g = rows.map((r) => r.split(""));
  for (const [x, y, st] of extra) st.forEach((s, yy) => { for (let xx = 0; xx < s.length; xx++) if (s[xx] !== ".") g[y + yy][x + xx] = s[xx]; });
  return g.map((r) => r.join(""));
}
export const POOL_TILE = defineTerrain({
  id: "pool-tile",
  level: 1,
  pal: POOLTILE_PAL,
  shade: ["#c8bca0"],
  lip: { fill: "#ffffff", outline: "#5a7898", depth: 2 },
  variants: [
    { weight: 6, rows: floorTile(false) },
    { weight: 0.6, rows: floorTile(false, [[2, 3, [".ee.", "effe", "eeef", ".ee."]]]) }, // wet spot
    { weight: 0.7, rows: floorTile(false, [[9, 9, ["eeee", "egge", "egge", "eeee"].map((r) => r.replace(/e/g, "d"))]]) }, // drain
  ],
});
/** Blue mosaic band (for kids' area / showers). */
export const POOL_TILE_BLUE = defineTerrain({
  id: "pool-tile-blue",
  level: 1,
  group: "pooltile",
  pal: { a: "#e0f4ff", b: "#b4e0fa", c: "#a0d4f6", d: "#80b8e4", e: "#ffffff" },
  shade: ["#4880c0"],
  lip: { fill: "#ffffff", outline: "#4a6890", depth: 2 },
  variants: [{ rows: floorTile(true) }, { rows: floorTile(false) }],
});

// ── Baked beach shoreline ────────────────────────────────────────────────────
const SHORE_PAL: Pal = {
  ...SEA_COLORS,
  e: "#80c0f0", f: "#58a0e8", g: "#4888d8", // mid-depth
  h: "#b0f0f8", i: "#78d8f0", j: "#60c0e8", // shallow
  F: "#ffffff", G: "#d8f8ff",               // foam, swash
  V: "#e8cc90", W: "#d4b078",               // wet sand
  S: "#f8e8b0", T: "#e8d090", U: "#fff8d8", // dry sand (BEACH_SAND colors)
};
const MID: Record<string, string> = { a: "a", b: "e", c: "f", d: "g" };
const SHALLOW: Record<string, string> = { a: "G", b: "h", c: "i", d: "j" };
const SWASH = [0, 1, 2, 1];
const CREST = [14, 10, 6, -99];

/** Pixel of a sandy shore whose waterline is at y = shoreY(x) (sea above). */
export function shorePx(shoreY: (x: number) => number) {
  return (x: number, y: number, f: number): string => {
    const d = y - shoreY(x);
    const wl = SWASH[f & 3];
    const nz = noise(x >> 1, 3) > 0.55 ? 1 : 0;
    if (d >= 10) return noise(x, y, 9) < 0.025 ? "T" : noise(x, y, 4) < 0.01 ? "U" : "S";
    if (d >= 7) return bayer(x, y) < (d - 7) / 3 ? "S" : "V";
    if (d >= wl + 1) return d < wl + 2 ? "W" : "V";
    if (d >= wl - 1 - nz) return "F";
    const depth = -d;
    if (depth + wl < 4 + nz) return noise(x, y + f, 2) < 0.12 ? "F" : "G";
    const cd = CREST[f & 3] - wl;
    if (Math.abs(depth - cd) < 0.8 && noise(x >> 2, f, 5) > 0.3) return "F";
    if (depth - cd >= 0.8 && depth - cd < 1.8 && noise(x >> 2, f, 5) > 0.3) return "h";
    const s = seaChar(x, y, f);
    // wavy band edges with a single checker row (cleaner than full dithering)
    const band = (edge: number) => {
      const e = edge + 2.2 * Math.sin(x * 0.16 + edge) + 1.2 * Math.sin(x * 0.41 + edge * 2);
      return depth > e + 0.5 ? 1 : depth > e - 0.5 ? ((x + y) & 1) : 0;
    };
    if (band(34)) return s;
    if (band(20)) return MID[s];
    return SHALLOW[s];
  };
}

/**
 * Map for a beach with the sea at the top. `override(tx, ty)` may return a
 * terrain (dock, boardwalk…) for any tile; otherwise tiles are sea, sand or a
 * baked shore tile.
 */
export function bakeShore(o: {
  cols: number;
  rows: number;
  shoreY: (x: number) => number;
  override?: (tx: number, ty: number) => Terrain | null;
  land?: Terrain;
}) {
  const land = o.land ?? BEACH_SAND;
  const W = o.cols * TILE;
  const ys = Array.from({ length: W }, (_, x) => o.shoreY(x));
  const range = (tx: number) => {
    let lo = Infinity, hi = -Infinity;
    for (let x = tx * TILE; x < tx * TILE + TILE; x++) { lo = Math.min(lo, ys[x]); hi = Math.max(hi, ys[x]); }
    return [lo, hi];
  };
  return bakeMap({
    id: "shore",
    cols: o.cols,
    rows: o.rows,
    pal: SHORE_PAL,
    level: 1,
    group: "beach",
    px: shorePx((x) => ys[Math.max(0, Math.min(W - 1, x))]),
    base: (tx, ty) => {
      const ov = o.override?.(tx, ty);
      if (ov) return ov;
      const [lo, hi] = range(tx);
      if (ty * TILE + 15 - lo < -46) return SEA;
      if (ty * TILE - hi >= 11) return land;
      return null;
    },
    // the surf is shallow enough to wade in: legs hide under the water
    walkable: (tx, ty) => ty * TILE - range(tx)[1] >= -20,
    cover: (tx, ty, rows) => {
      if (ty * TILE - range(tx)[1] >= 4 || ty * TILE - range(tx)[1] < -20) return null;
      return rows.map((r) => r.replace(/[STUVW]/g, "."));
    },
  });
}

export type { TileArt };
