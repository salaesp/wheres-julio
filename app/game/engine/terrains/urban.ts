// Town / school terrains: asphalt road (with painted lines, crosswalks and a
// checkered start line), tiled sidewalk, school patio and a sports court.
import { defineTerrain, type TileArt } from "../terrain";
import { gen, remap, rng } from "../propsLib/pixkit";

// ── helpers ──────────────────────────────────────────────────────────────────
/** Flat base with a few random specks (light `hi`, dark `lo`). */
function specks(seed: number, n: number, base = "b", hi = "a", lo = "c", crack = 0): string[] {
  const r = rng(seed);
  const g = Array.from({ length: 16 }, () => Array<string>(16).fill(base));
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * 15), y = Math.floor(r() * 15);
    const c = r() < 0.5 ? hi : lo;
    g[y][x] = c;
    if (r() < 0.4) g[y][x + 1] = c;
  }
  for (let i = 0; i < crack; i++) {
    let x = 3 + Math.floor(r() * 9), y = 3 + Math.floor(r() * 9);
    for (let k = 0; k < 5; k++) {
      g[y][x] = "d";
      x += r() < 0.5 ? 1 : 0;
      y += 1;
      if (y > 15 || x > 15) break;
    }
  }
  return g.map((row) => row.join(""));
}

const over = (rows: readonly string[], fn: (x: number, y: number) => string | null) =>
  remap(rows, (x, y, ch) => fn(x, y) ?? ch);

// ── Asphalt road ─────────────────────────────────────────────────────────────
const ROAD_PAL = {
  a: "#a8acbc", b: "#90949f", c: "#7c8090", d: "#686c7c",
  w: "#f8f8f0", W: "#c8c8c0", y: "#f8d050", Y: "#c89830",
  k: "#383848", K: "#f4f4ec",
};
const ROAD_BASE: TileArt[] = [
  { weight: 5, rows: specks(11, 4) },
  { weight: 3, rows: specks(12, 8) },
  { weight: 2, rows: specks(13, 6, "b", "a", "c", 1) },
  { weight: 1, rows: specks(14, 10, "b", "c", "c") },
];
const roadWith = (fn: (x: number, y: number) => string | null): TileArt[] =>
  ROAD_BASE.map((v) => ({ weight: v.weight, rows: over(v.rows, fn) }));

const ROAD_COMMON = {
  level: 1,
  group: "road",
  pal: ROAD_PAL,
  shade: ["#5c6070"],
  lip: { fill: "#90949f", outline: "#505464" },
};

export const ROAD = defineTerrain({ id: "road", ...ROAD_COMMON, variants: ROAD_BASE });

/** Dashed center line (vertical road). */
export const ROAD_CENTER = defineTerrain({
  id: "road-center", ...ROAD_COMMON,
  variants: roadWith((x, y) => (y >= 2 && y <= 11 ? (x === 7 || x === 8 ? "w" : null) : y === 12 && (x === 7 || x === 8) ? "W" : null)),
});

/** Dashed center line (horizontal road). */
export const ROAD_CENTER_H = defineTerrain({
  id: "road-center-h", ...ROAD_COMMON,
  variants: roadWith((x, y) => (x >= 2 && x <= 11 ? (y === 7 ? "w" : y === 8 ? "W" : null) : null)),
});

/** Solid edge lines. */
export const ROAD_EDGE_L = defineTerrain({
  id: "road-edge-l", ...ROAD_COMMON,
  variants: roadWith((x) => (x === 3 || x === 4 ? "w" : x === 5 ? "W" : null)),
});
export const ROAD_EDGE_R = defineTerrain({
  id: "road-edge-r", ...ROAD_COMMON,
  variants: roadWith((x) => (x === 11 || x === 12 ? "w" : x === 13 ? "W" : null)),
});
export const ROAD_EDGE_T = defineTerrain({
  id: "road-edge-t", ...ROAD_COMMON,
  variants: roadWith((_x, y) => (y === 3 ? "w" : y === 4 ? "W" : null)),
});
export const ROAD_EDGE_B = defineTerrain({
  id: "road-edge-b", ...ROAD_COMMON,
  variants: roadWith((_x, y) => (y === 11 ? "w" : y === 12 ? "W" : null)),
});

/** Zebra crossing over a vertical road (2 tiles tall: top + bottom). */
const zebraV = (x: number, y: number, y0: number, y1: number) => {
  if (y < y0 || y > y1) return null;
  const m = (x + 1) % 8;
  if (m >= 1 && m <= 4) return y === y1 || m === 4 ? "W" : "w";
  return null;
};
export const ROAD_ZEBRA_TOP = defineTerrain({
  id: "road-zebra-top", ...ROAD_COMMON,
  variants: roadWith((x, y) => zebraV(x, y, 3, 15)),
});
export const ROAD_ZEBRA_BOTTOM = defineTerrain({
  id: "road-zebra-bottom", ...ROAD_COMMON,
  variants: roadWith((x, y) => zebraV(x, y, 0, 12)),
});
/** Zebra crossing over a horizontal road (stack vertically, any height). */
export const ROAD_ZEBRA_H = defineTerrain({
  id: "road-zebra-h", ...ROAD_COMMON,
  variants: roadWith((x, y) => {
    if (x < 2 || x > 13) return null;
    const m = (y + 1) % 8;
    if (m >= 1 && m <= 4) return m === 4 || x === 13 ? "W" : "w";
    return null;
  }),
});

/** Checkered start / finish line across the road. */
export const ROAD_START = defineTerrain({
  id: "road-start", ...ROAD_COMMON,
  variants: roadWith((x, y) => {
    if (y < 4 || y > 12) return null;
    if (y === 12) return "d";
    const cx = Math.floor(x / 4), cy = Math.floor((y - 4) / 4);
    return (cx + cy) % 2 === 0 ? "K" : "k";
  }),
});

// ── Sidewalk: square paving slabs with a little bevel ────────────────────────
function slabs(seed: number, opts: { stain?: number; crack?: boolean; weed?: boolean } = {}): string[] {
  const r = rng(seed);
  const stained = new Set<number>();
  for (let i = 0; i < (opts.stain ?? 0); i++) stained.add(Math.floor(r() * 4));
  const rows = gen(16, 16, (x, y) => {
    const mx = x % 8, my = y % 8;
    const sq = Math.floor(x / 8) + Math.floor(y / 8) * 2;
    if (mx === 7 || my === 7) return "c";
    if (mx === 0 || my === 0) return "a";
    if (mx === 6 || my === 6) return stained.has(sq) ? "c" : "B";
    return stained.has(sq) ? "B" : "b";
  });
  let out = rows;
  if (opts.crack) {
    const sx = 1 + Math.floor(r() * 2) * 8, sy = 1 + Math.floor(r() * 2) * 8;
    out = over(out, (x, y) => {
      const lx = x - sx, ly = y - sy;
      return lx >= 0 && ly >= 0 && ly < 6 && (lx === Math.floor(ly * 0.7) + 1) ? "d" : null;
    });
  }
  if (opts.weed) {
    const wx = 7, wy = 2 + Math.floor(r() * 10);
    out = over(out, (x, y) => {
      if (x === wx && (y === wy || y === wy + 1)) return "G";
      if ((x === wx - 1 || x === wx + 1) && y === wy) return "g";
      return null;
    });
  }
  return out;
}

const SIDEWALK_PAL = {
  a: "#fbf7ec", b: "#e8e0cc", B: "#ddd3bc", c: "#c0b49e", d: "#a0937c",
  g: "#78c058", G: "#4c9038",
};
export const SIDEWALK = defineTerrain({
  id: "sidewalk",
  level: 1.5,
  pal: SIDEWALK_PAL,
  shade: ["#b0a48c"],
  lip: { fill: "#d8d0c0", outline: "#6c6470", depth: 2 },
  variants: [
    { weight: 6, rows: slabs(1) },
    { weight: 2, rows: slabs(2, { stain: 1 }) },
    { weight: 1.5, rows: slabs(3, { crack: true }) },
    { weight: 1, rows: slabs(4, { weed: true }) },
  ],
});

// ── School patio: warm two-tone tiles ────────────────────────────────────────
function patio(seed: number, opts: { crack?: boolean; chalk?: boolean } = {}): string[] {
  const r = rng(seed);
  let rows = gen(16, 16, (x, y) => {
    const mx = x % 8, my = y % 8;
    const red = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0;
    if (mx === 7 || my === 7) return "g";
    if (mx === 0 || my === 0) return red ? "R" : "a";
    if (mx === 6 || my === 6) return red ? "s" : "c";
    return red ? "r" : "b";
  });
  if (opts.crack) {
    rows = over(rows, (x, y) => (x >= 9 && x <= 13 && y === 12 - Math.floor((x - 9) * 0.6) ? "d" : null));
  }
  if (opts.chalk) {
    const cx = 2 + Math.floor(r() * 3), cy = 2 + Math.floor(r() * 3);
    rows = over(rows, (x, y) => {
      const lx = x - cx, ly = y - cy;
      return (ly === 0 && lx >= 0 && lx <= 3) || (lx === 1 && ly >= -1 && ly <= 1) ? "w" : null;
    });
  }
  return rows;
}

export const PATIO = defineTerrain({
  id: "patio",
  level: 1.5,
  pal: {
    a: "#fcf4e2", b: "#f2e2c4", c: "#e6d0ac",
    R: "#f8d2b0", r: "#f0c09c", s: "#e2ac88",
    g: "#d4b294", d: "#a88068", w: "#ffffff",
  },
  shade: ["#c8a888"],
  lip: { fill: "#e8d0b0", outline: "#7c5c48", depth: 1 },
  variants: [
    { weight: 6, rows: patio(1) },
    { weight: 1.5, rows: patio(2, { crack: true }) },
    { weight: 0.8, rows: patio(3, { chalk: true }) },
  ],
});

// ── Sports court (lines are a flat prop drawn on top) ────────────────────────
export const COURT = defineTerrain({
  id: "court",
  level: 1.7,
  pal: { a: "#88d4bc", b: "#5cb49c", c: "#4ca08a", d: "#3c8474" },
  shade: ["#3c8474"],
  lip: { fill: "#5cb49c", outline: "#2c6458", depth: 1 },
  variants: [
    { weight: 5, rows: specks(31, 2, "b", "c", "c") },
    { weight: 3, rows: specks(32, 5, "b", "a", "c") },
  ],
});
