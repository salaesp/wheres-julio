// Natural-history museum terrains: polished marble slabs, a herringbone parquet
// for the gift shop, red exhibition carpet with a gold trim, the back wall
// (plaster + wood wainscot), stone exhibition plinths and the sandy dig pit.
import { defineTerrain } from "../terrain";
import { gen, remap, rng } from "../propsLib/pixkit";

const over = (rows: readonly string[], fn: (x: number, y: number) => string | null) =>
  remap(rows, (x, y, ch) => fn(x, y) ?? ch);

// ── Marble floor: 8×8 two-tone slabs with a soft bevel and wandering veins ───
function marble(seed: number, opts: { veins?: number; scuff?: boolean; crack?: boolean } = {}): string[] {
  const r = rng(seed);
  let rows = gen(16, 16, (x, y) => {
    const mx = x % 8, my = y % 8;
    const dark = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 1;
    if (mx === 7 || my === 7) return "g";
    if (mx === 0 || my === 0) return dark ? "B" : "a";
    if (mx === 6 || my === 6) return dark ? "C" : "c";
    return dark ? "D" : "b";
  });
  for (let v = 0; v < (opts.veins ?? 0); v++) {
    const sq = Math.floor(r() * 4);
    const ox = (sq % 2) * 8, oy = Math.floor(sq / 2) * 8;
    let x = 1 + Math.floor(r() * 3), y = 1 + Math.floor(r() * 2);
    const dark = (sq === 1 || sq === 2);
    for (let k = 0; k < 6; k++) {
      if (x > 5 || y > 5) break;
      rows = over(rows, (xx, yy) => (xx === ox + x && yy === oy + y ? (dark ? "v" : "V") : null));
      if (r() < 0.6) x++; else y++;
    }
  }
  if (opts.scuff) {
    const sx = 2 + Math.floor(r() * 3), sy = 9 + Math.floor(r() * 3);
    rows = over(rows, (x, y) => (y === sy && x >= sx && x < sx + 3 ? "w" : null));
  }
  if (opts.crack) {
    rows = over(rows, (x, y) => (x >= 9 && x <= 13 && y === 13 - Math.floor((x - 9) * 0.7) ? "g" : null));
  }
  return rows;
}

export const MARBLE = defineTerrain({
  id: "museum-marble",
  level: 1,
  group: "museum-floor",
  pal: {
    w: "#fffcf4", a: "#fcf6e8", b: "#f0e6d0", c: "#e2d4b8", V: "#d8c8b0",
    B: "#e8dcc4", D: "#dccdb0", C: "#cfbe9e", v: "#c4b090", g: "#bca888",
  },
  shade: ["#c8b898", "#dccbaa"],
  lip: { fill: "#f0e6d0", outline: "#8c7c68", depth: 2 },
  variants: [
    { weight: 6, rows: marble(1) },
    { weight: 3, rows: marble(2, { veins: 1 }) },
    { weight: 2, rows: marble(3, { veins: 2 }) },
    { weight: 1, rows: marble(4, { scuff: true, veins: 1 }) },
    { weight: 0.7, rows: marble(5, { crack: true }) },
  ],
});

// ── Parquet (gift shop): herringbone of 2×6 planks ───────────────────────────
function parquet(seed: number, opts: { knot?: boolean; scratch?: boolean } = {}): string[] {
  const r = rng(seed);
  let rows = gen(16, 16, (x, y) => {
    // herringbone: diagonal bands, plank orientation alternates
    const u = (x + y) % 16, band = Math.floor(u / 4);
    const horiz = band % 2 === 0;
    const k = horiz ? (x + Math.floor(y / 2) * 2) % 8 : (y + Math.floor(x / 2) * 2) % 8;
    const tone = ((Math.floor((x + y) / 4) + Math.floor((x - y + 32) / 8)) % 3);
    if (u % 4 === 3) return "d";
    if (k === 7) return "c";
    if (u % 4 === 0) return tone === 0 ? "a" : "A";
    return tone === 0 ? "b" : tone === 1 ? "B" : "e";
  });
  if (opts.knot) {
    const kx = 4 + Math.floor(r() * 8), ky = 4 + Math.floor(r() * 8);
    rows = over(rows, (x, y) => (x === kx && y === ky ? "d" : x === kx + 1 && y === ky ? "c" : null));
  }
  if (opts.scratch) {
    const sy = 3 + Math.floor(r() * 9);
    rows = over(rows, (x, y) => (y === sy && x >= 5 && x <= 8 ? "a" : null));
  }
  return rows;
}

export const PARQUET = defineTerrain({
  id: "museum-parquet",
  level: 1.4,
  pal: {
    a: "#f0c488", A: "#e4b478", b: "#d89c5c", B: "#cc9050", e: "#c48448",
    c: "#a86c34", d: "#8c5428",
  },
  shade: ["#9c6434"],
  lip: { fill: "#e8c060", outline: "#7c5420", depth: 1 },
  variants: [
    { weight: 5, rows: parquet(1) },
    { weight: 1.5, rows: parquet(2, { knot: true }) },
    { weight: 1.5, rows: parquet(3, { scratch: true }) },
  ],
});

// ── Red exhibition carpet with a woven diamond pattern ──────────────────────
function carpet(seed: number, opts: { motif?: boolean; lint?: number; wear?: boolean } = {}): string[] {
  const r = rng(seed);
  let rows = gen(16, 16, (x, y) => {
    const dx = Math.abs((x % 8) - 3.5), dy = Math.abs((y % 8) - 3.5);
    const d = dx + dy;
    if (d === 4) return "c";
    if ((x + y) % 2 === 0 && d < 2) return "b";
    return (x * 3 + y * 5) % 11 === 0 ? "c" : "b";
  });
  // brighter woven highlight rows
  rows = over(rows, (x, y) => (y % 8 === 0 && x % 2 === 0 ? "a" : null));
  if (opts.motif) {
    rows = over(rows, (x, y) => {
      const lx = x - 4, ly = y - 4;
      if (Math.abs(lx - 3.5) + Math.abs(ly - 3.5) <= 1) return "y";
      if (Math.abs(lx - 3.5) + Math.abs(ly - 3.5) === 2) return "Y";
      return null;
    });
  }
  for (let i = 0; i < (opts.lint ?? 0); i++) {
    const lx = 1 + Math.floor(r() * 14), ly = 1 + Math.floor(r() * 14);
    rows = over(rows, (x, y) => (x === lx && y === ly ? "a" : null));
  }
  if (opts.wear) {
    const wx = 3 + Math.floor(r() * 6), wy = 3 + Math.floor(r() * 6);
    rows = over(rows, (x, y) => ((x - wx) ** 2 / 9 + (y - wy) ** 2 / 4 <= 1 ? (((x + y) % 2) ? "a" : "b") : null));
  }
  return rows;
}

export const CARPET = defineTerrain({
  id: "museum-carpet",
  level: 2,
  pal: {
    a: "#e85060", b: "#c82c3c", c: "#a01c30", y: "#f8d060", Y: "#c89030",
  },
  shade: ["#8c1828"],
  lip: { fill: "#f0c048", outline: "#781428", depth: 2 },
  variants: [
    { weight: 6, rows: carpet(1) },
    { weight: 2, rows: carpet(2, { lint: 3 }) },
    { weight: 1.2, rows: carpet(3, { motif: true }) },
    { weight: 1, rows: carpet(4, { wear: true }) },
  ],
});

// ── Back wall: plaster with a crown molding (top) and a wood wainscot (low) ──
const WALL_PAL = {
  // plaster (muted teal)
  a: "#a8d4cc", b: "#8cc0b8", c: "#74aca8", d: "#5c9494",
  // molding
  m: "#fcf4dc", M: "#e8d8b0", n: "#b8a07c", k: "#3c4c58",
  // wood wainscot
  t: "#c88850", u: "#a86c3c", v: "#7c4c28", T: "#e0a868",
};

function plaster(seed: number, n: number): string[][] {
  const r = rng(seed);
  const g = Array.from({ length: 16 }, () => Array<string>(16).fill("b"));
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * 16), y = Math.floor(r() * 16);
    g[y][x] = r() < 0.5 ? "a" : "c";
  }
  return g;
}

function wallTop(seed: number): string[] {
  const g = plaster(seed, 6);
  for (let x = 0; x < 16; x++) {
    g[0][x] = "k"; g[1][x] = "k";
    g[2][x] = "n"; g[3][x] = "m"; g[4][x] = x % 4 === 0 ? "M" : "m"; g[5][x] = "M"; g[6][x] = "n";
    g[7][x] = "c";
    // pilaster stripes every 16px: a subtle vertical shading at x 0/15
    for (let y = 8; y < 16; y++) {
      if (x === 0) g[y][x] = "a";
      if (x === 15) g[y][x] = "c";
    }
  }
  return g.map((r) => r.join(""));
}

function wallLow(seed: number): string[] {
  const g = plaster(seed, 3);
  for (let x = 0; x < 16; x++) {
    if (x === 0) for (let y = 0; y < 4; y++) g[y][x] = "a";
    if (x === 15) for (let y = 0; y < 4; y++) g[y][x] = "c";
    g[4][x] = "d";
    g[5][x] = "T"; g[6][x] = "t";
    for (let y = 7; y < 14; y++) {
      const px = x % 8;
      g[y][x] = px === 0 ? "T" : px === 7 ? "v" : y === 7 ? "T" : y === 13 ? "v" : "u";
    }
    g[14][x] = "v"; g[15][x] = "k";
  }
  return g.map((r) => r.join(""));
}

export const WALL = defineTerrain({
  id: "museum-wall",
  level: 6,
  walkable: false,
  noJulio: true,
  group: "museum-wall",
  pal: WALL_PAL,
  variants: [{ weight: 3, rows: wallTop(1) }, { weight: 2, rows: wallTop(2) }],
});

export const WALL_LOW = defineTerrain({
  id: "museum-wall-low",
  level: 6,
  walkable: false,
  noJulio: true,
  group: "museum-wall",
  pal: WALL_PAL,
  lip: { fill: "#3c4c58", outline: "#2c3440", depth: 1 },
  variants: [{ weight: 3, rows: wallLow(3) }, { weight: 2, rows: wallLow(4) }],
});

// ── Exhibition plinth (stone) ────────────────────────────────────────────────
const PLINTH_PAL = {
  a: "#e8e4f0", b: "#cccadc", c: "#b0aec8", d: "#8c8aa8", e: "#6c6a88", k: "#4c4a64",
};
function plinthTop(seed: number, n: number): string[] {
  const r = rng(seed);
  let rows = gen(16, 16, (x, y) => {
    if (y === 15 && x % 16 === 0) return "c";
    return "b";
  });
  for (let i = 0; i < n; i++) {
    const sx = Math.floor(r() * 15), sy = Math.floor(r() * 15), c = r() < 0.5 ? "a" : "c";
    rows = over(rows, (x, y) => (x === sx && y === sy ? c : null));
  }
  // faint slab seam (big 2×2-tile slabs: only on some variants)
  return rows;
}
function plinthFace(seed: number): string[] {
  const r = rng(seed);
  const off = Math.floor(r() * 8);
  return gen(16, 16, (x, y) => {
    if (y < 3) return "b";
    if (y === 3) return "a";
    if (y === 4) return "c";
    if (y >= 13) return y === 15 ? "k" : "e";
    // blocks: two courses
    const course = y < 9 ? 0 : 1;
    const bx = (x + off + course * 8) % 16;
    if (y === 8 || y === 12) return "e";
    if (bx === 0) return "e";
    if (bx === 1) return "c";
    return y === 5 || y === 9 ? "c" : "d";
  });
}

export const PLINTH = defineTerrain({
  id: "museum-plinth",
  level: 3,
  walkable: false,
  noJulio: true,
  group: "museum-plinth",
  pal: PLINTH_PAL,
  lip: { fill: "#cccadc", outline: "#4c4a64", depth: 2 },
  variants: [
    { weight: 3, rows: plinthTop(1, 4) },
    { weight: 2, rows: plinthTop(2, 7) },
  ],
});

export const PLINTH_FACE = defineTerrain({
  id: "museum-plinth-face",
  level: 3,
  walkable: false,
  noJulio: true,
  group: "museum-plinth",
  pal: PLINTH_PAL,
  lip: { fill: "#6c6a88", outline: "#3c3a54", depth: 1 },
  variants: [
    { weight: 2, rows: plinthFace(1) },
    { weight: 2, rows: plinthFace(2) },
    { weight: 1, rows: plinthFace(3) },
  ],
});

// ── Dig pit: soft sand with pebbles and bone fragments ───────────────────────
function sand(seed: number, n: number, bone = false): string[] {
  const r = rng(seed);
  let rows = gen(16, 16, (x, y) => ((x * 7 + y * 3) % 13 === 0 ? "c" : (x * 5 + y * 11) % 17 === 0 ? "a" : "b"));
  for (let i = 0; i < n; i++) {
    const sx = 1 + Math.floor(r() * 13), sy = 1 + Math.floor(r() * 13);
    rows = over(rows, (x, y) => (y === sy && (x === sx || x === sx + 1) ? "p" : y === sy + 1 && x === sx ? "d" : null));
  }
  if (bone) {
    const bx = 4 + Math.floor(r() * 5), by = 5 + Math.floor(r() * 5);
    rows = over(rows, (x, y) => {
      const lx = x - bx, ly = y - by;
      if (ly === 0 && lx >= 0 && lx <= 4) return "w";
      if ((lx === -1 || lx === 5) && (ly === -1 || ly === 1 || ly === 0)) return ly === 0 ? "W" : "w";
      if (ly === 1 && lx >= 0 && lx <= 4) return "W";
      return null;
    });
  }
  return rows;
}

export const DIG_SAND = defineTerrain({
  id: "museum-dig-sand",
  level: 0.5,
  pal: {
    a: "#fcecb8", b: "#f0d898", c: "#dcc080", d: "#b89860", p: "#c8b090",
    w: "#fcf8ec", W: "#d8ccb4",
  },
  shade: ["#c8a868", "#dcc080"],
  variants: [
    { weight: 5, rows: sand(1, 2) },
    { weight: 3, rows: sand(2, 4) },
    { weight: 1, rows: sand(3, 1, true) },
  ],
});
