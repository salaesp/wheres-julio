// Terrains for the "giant objects" worlds: a giant chessboard on a wooden
// table (El Tablero) and a motherboard (Adentro de la Compu).
import { defineTerrain, type TileArt } from "../terrain";

// Tiny deterministic RNG so tile variants are stable between builds.
function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

type G = string[][];
const grid = (ch = "b"): G => Array.from({ length: 16 }, () => Array<string>(16).fill(ch));
const rows = (g: G) => g.map((r) => r.join(""));
const set = (g: G, x: number, y: number, ch: string) => {
  if (y >= 0 && y < 16 && x >= 0 && x < 16) g[y][x] = ch;
};

// ════════════════════════════════════════════════════════════════════════════
// EL TABLERO
// ════════════════════════════════════════════════════════════════════════════

// ── Wooden table: honey-oak planks, 8 px each, with grain streaks ──────────
function plankTile(seed: number, joints: boolean, knot = false): string[] {
  const r = rng(seed + 11);
  const g = grid("b");
  for (let p = 0; p < 2; p++) {
    const y0 = p * 8;
    for (let x = 0; x < 16; x++) {
      set(g, x, y0, "a");
      set(g, x, y0 + 7, "d");
      set(g, x, y0 + 6, r() < 0.25 ? "c" : "b");
    }
    // grain streaks
    const n = 2 + Math.floor(r() * 2);
    for (let k = 0; k < n; k++) {
      const y = y0 + 1 + Math.floor(r() * 5);
      const x0 = Math.floor(r() * 14);
      const len = 3 + Math.floor(r() * 6);
      for (let x = x0; x < x0 + len; x++) set(g, x % 16, y, r() < 0.15 ? "e" : "c");
    }
    if (joints && (p === 0 ? r() < 0.8 : r() < 0.5)) {
      const jx = 2 + Math.floor(r() * 12);
      for (let y = y0; y < y0 + 7; y++) { set(g, jx, y, "d"); set(g, jx + 1, y, y === y0 ? "a" : "e"); }
    }
  }
  if (knot) {
    const kx = 4 + Math.floor(r() * 7), ky = 2 + Math.floor(r() * 2);
    set(g, kx, ky, "c"); set(g, kx + 1, ky, "e"); set(g, kx + 2, ky, "c");
    set(g, kx - 1, ky + 1, "c"); set(g, kx, ky + 1, "e"); set(g, kx + 1, ky + 1, "d");
    set(g, kx + 2, ky + 1, "e"); set(g, kx + 3, ky + 1, "c");
    set(g, kx, ky + 2, "c"); set(g, kx + 1, ky + 2, "e"); set(g, kx + 2, ky + 2, "c");
  }
  return rows(g);
}

export const TABLE = defineTerrain({
  id: "chess-table",
  level: 1,
  pal: { a: "#f8d8a0", b: "#e8b878", c: "#d49c5c", d: "#a86c3c", e: "#c08850" },
  shade: ["#b88048"],
  lip: { fill: "#e8b878", outline: "#8a5428" },
  variants: [
    { weight: 4, rows: plankTile(1, false) },
    { weight: 4, rows: plankTile(2, false) },
    { weight: 3, rows: plankTile(3, true) },
    { weight: 3, rows: plankTile(4, true) },
    { weight: 1, rows: plankTile(5, false, true) },
  ],
});

// ── Board frame: dark mahogany with a gold inlay. Directional tiles. ──────
// inX / inY say where the board is (-1 = left/up, 1 = right/down).
function frameTile(inX: -1 | 0 | 1, inY: -1 | 0 | 1, seed: number): string[] {
  const r = rng(seed + 101);
  const g = grid("b");
  const along = inX === 0 ? "h" : "v"; // grain direction
  // grain streaks
  for (let k = 0; k < 5; k++) {
    const a = Math.floor(r() * 16), b0 = Math.floor(r() * 12), len = 3 + Math.floor(r() * 7);
    for (let t = b0; t < b0 + len; t++) {
      if (along === "h") set(g, t % 16, a, r() < 0.2 ? "e" : "c");
      else set(g, a, t % 16, r() < 0.2 ? "e" : "c");
    }
  }
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const dY = inY === 1 ? 15 - y : inY === -1 ? y : -99;
    const dX = inX === 1 ? 15 - x : inX === -1 ? x : -99;
    const depth = Math.max(dX, dY);
    if (depth === 4) set(g, x, y, "g");
    else if (depth === 5) set(g, x, y, "G");
    else if (depth === 3) set(g, x, y, "c");
    // inner edge bevel: lit when it faces up/left, darker when it faces down
    if (depth === 0) set(g, x, y, (dY === 0 && inY === 1) ? "c" : "a");
  }
  // outer edges
  for (let i = 0; i < 16; i++) {
    if (inY === 1) { set(g, i, 0, "a"); }
    if (inX === -1) { set(g, 14, i, "c"); set(g, 15, i, "d"); }
    if (inX === 1) { set(g, 0, i, "a"); }
    if (inY === -1) { set(g, i, 13, "c"); set(g, i, 14, "d"); set(g, i, 15, "d"); }
  }
  // fix corner overlaps
  if (inY === 1 && inX === -1) { set(g, 14, 0, "c"); set(g, 15, 0, "d"); }
  if (inY === -1 && inX === -1) { for (let y = 13; y < 16; y++) { set(g, 14, y, "d"); set(g, 15, y, "d"); } }
  return rows(g);
}

const FRAME_PAL = {
  a: "#c8704c", b: "#9c4c34", c: "#7c3828", d: "#58241c", e: "#8c4030",
  g: "#f8d868", G: "#c89838",
};
const FRAME_LIP = { fill: "#9c4c34", outline: "#401810" };
const frame = (id: string, inX: -1 | 0 | 1, inY: -1 | 0 | 1) => defineTerrain({
  id: `chess-frame-${id}`,
  level: 3,
  group: "chess-frame",
  pal: FRAME_PAL,
  lip: FRAME_LIP,
  variants: [
    { weight: 2, rows: frameTile(inX, inY, 1) },
    { weight: 2, rows: frameTile(inX, inY, 2) },
    { weight: 1, rows: frameTile(inX, inY, 3) },
  ],
});

export const FRAME_T = frame("t", 0, 1);
export const FRAME_B = frame("b", 0, -1);
export const FRAME_L = frame("l", 1, 0);
export const FRAME_R = frame("r", -1, 0);
export const FRAME_TR = frame("tr", -1, 1);
export const FRAME_BR = frame("br", -1, -1);
export const FRAME_TL = frame("tl", 1, 1);
export const FRAME_BL = frame("bl", 1, -1);

// ── Board squares (2×2 tiles each). Same group → no borders between them. ──
function squareVariants(): TileArt[] {
  const plain = grid("b");
  const specks = grid("b");
  [[3, 4], [11, 2], [7, 11], [13, 13], [1, 14]].forEach(([x, y]) => set(specks, x, y, "c"));
  set(specks, 12, 2, "a");
  const specks2 = grid("b");
  [[9, 6], [2, 9], [14, 10], [5, 1]].forEach(([x, y]) => set(specks2, x, y, "c"));
  // glossy lacquer glint (short diagonal)
  const gloss = grid("b");
  for (let i = 0; i < 5; i++) { set(gloss, 4 + i, 9 - i, "a"); if (i < 3) set(gloss, 6 + i, 10 - i, "a"); }
  set(gloss, 12, 12, "c");
  // tiny scuff
  const scuff = grid("b");
  for (let i = 0; i < 4; i++) set(scuff, 6 + i, 7 + (i >> 1), "c");
  set(scuff, 7, 6, "d");
  return [
    { weight: 8, rows: rows(plain) },
    { weight: 3, rows: rows(specks) },
    { weight: 3, rows: rows(specks2) },
    { weight: 1, rows: rows(gloss) },
    { weight: 0.6, rows: rows(scuff) },
  ];
}

export const SQUARE_LIGHT = defineTerrain({
  id: "chess-light",
  level: 2,
  group: "chess-board",
  pal: { a: "#fffff4", b: "#f6eed2", c: "#e2d6b2", d: "#c8b890" },
  shade: ["#d6c8a0"],
  variants: squareVariants(),
});

export const SQUARE_DARK = defineTerrain({
  id: "chess-dark",
  level: 2,
  group: "chess-board",
  pal: { a: "#a8dc98", b: "#74b46c", c: "#5e9c5a", d: "#467c48" },
  shade: ["#4c8848"],
  variants: squareVariants(),
});

// ════════════════════════════════════════════════════════════════════════════
// ADENTRO DE LA COMPU — motherboard
// ════════════════════════════════════════════════════════════════════════════

const PCB_PAL = {
  a: "#7cd490", b: "#48ac64", c: "#3e9a5a", d: "#2e7c4a", e: "#246444",
  g: "#fff0a0", G: "#e8b848", h: "#b08030", k: "#183828",
  w: "#effaf0", K: "#34303c", m: "#d8dce8", p: "#f08868", y: "#f8e070",
};

/** Draw 2-px wide copper traces along a list of points; then add a 1-px
 *  shadow below/right so they look slightly raised. */
function strokeTraces(g: G, paths: number[][][]) {
  for (const path of paths) {
    for (let s = 0; s + 1 < path.length; s++) {
      const [x0, y0] = path[s], [x1, y1] = path[s + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= n; i++) {
        const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
        set(g, x, y, "g"); set(g, x + 1, y, "G"); set(g, x, y + 1, "G"); set(g, x + 1, y + 1, "G");
      }
    }
  }
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const c = g[y][x];
    if (c === "g" || c === "G" || c === "h" || c === "k") continue;
    const up = y > 0 ? g[y - 1][x] : "";
    const lf = x > 0 ? g[y][x - 1] : "";
    if (up === "g" || up === "G" || lf === "g" || lf === "G") g[y][x] = "d";
  }
}

function via(g: G, x: number, y: number) {
  set(g, x, y, "g"); set(g, x + 1, y, "G"); set(g, x + 2, y, "G");
  set(g, x, y + 1, "G"); set(g, x + 1, y + 1, "k"); set(g, x + 2, y + 1, "h");
  set(g, x, y + 2, "G"); set(g, x + 1, y + 2, "h"); set(g, x + 2, y + 2, "h");
  set(g, x + 3, y + 1, "d"); set(g, x + 3, y + 2, "d"); set(g, x + 1, y + 3, "d"); set(g, x + 2, y + 3, "d");
}

function pcbBase(seed: number, ground = false): G {
  const g = grid("b");
  const r = rng(seed + 501);
  if (ground) {
    // copper pour under the mask: faint diagonal hatching
    for (let y = 1; y < 16; y += 4) for (let x = 1; x < 16; x += 4) set(g, x + ((y >> 2) & 1) * 2, y, "c");
  } else {
    for (let i = 0; i < 3; i++) set(g, Math.floor(r() * 16), Math.floor(r() * 16), "c");
  }
  return g;
}

const PCB_VARIANTS = (ground: boolean): TileArt[] => {
  const plain = pcbBase(1, ground);
  const plain2 = pcbBase(2, ground);
  const vias = pcbBase(3, ground); via(vias, 3, 3); via(vias, 10, 10);
  const smd = pcbBase(4, ground);
  // tiny SMD resistor + capacitor
  for (const [x, y] of [[4, 5], [5, 5]]) set(smd, x, y, "m");
  for (const [x, y] of [[6, 5], [7, 5], [8, 5]]) set(smd, x, y, "K");
  for (const [x, y] of [[9, 5]]) set(smd, x, y, "m");
  for (const [x, y] of [[4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6]]) set(smd, x, y, "d");
  for (const [x, y] of [[10, 11], [10, 12]]) set(smd, x, y, "m");
  for (const [x, y] of [[11, 11], [12, 11], [11, 12], [12, 12]]) set(smd, x, y, "p");
  for (const [x, y] of [[13, 11], [13, 12]]) set(smd, x, y, "m");
  for (let x = 10; x < 14; x++) set(smd, x, 13, "d");
  // silkscreen footprint
  const silk = pcbBase(5, ground);
  for (let x = 3; x < 12; x++) { set(silk, x, 4, "w"); set(silk, x, 10, "w"); }
  for (let y = 4; y < 11; y++) { set(silk, 3, y, "w"); set(silk, 11, y, "w"); }
  set(silk, 5, 6, "G"); set(silk, 6, 6, "G"); set(silk, 8, 8, "G"); set(silk, 9, 8, "G");
  set(silk, 5, 7, "h"); set(silk, 6, 7, "h"); set(silk, 8, 9, "h"); set(silk, 9, 9, "h");
  // short trace stub between two vias
  const stub = pcbBase(6, ground);
  strokeTraces(stub, [[[4, 9], [8, 9], [11, 6]]]);
  via(stub, 1, 8); via(stub, 11, 4);
  return [
    { weight: 7, rows: rows(plain) },
    { weight: 5, rows: rows(plain2) },
    { weight: 2, rows: rows(vias) },
    { weight: 1.2, rows: rows(smd) },
    { weight: 0.8, rows: rows(silk) },
    { weight: 1.2, rows: rows(stub) },
  ];
};

export const PCB = defineTerrain({
  id: "pcb",
  level: 1,
  group: "pcb",
  pal: PCB_PAL,
  lip: { fill: "#48ac64", outline: "#1a4a30", depth: 2 },
  shade: ["#2e7c4a"],
  variants: PCB_VARIANTS(false),
});

export const PCB_GROUND = defineTerrain({
  id: "pcb-ground",
  level: 1,
  group: "pcb",
  pal: { ...PCB_PAL, b: "#40a060", c: "#389058" },
  lip: { fill: "#40a060", outline: "#1a4a30", depth: 2 },
  shade: ["#2e7c4a"],
  variants: PCB_VARIANTS(true).slice(0, 3),
});

// ── Copper buses: 3 parallel traces. Offsets 3, 7, 11 (2 px wide). ─────────
const LANES = [3, 7, 11];
type Dir4 = "N" | "S" | "E" | "W";

/** Canonical bend W→S (concentric, 45° chamfers), then mirrored as needed. */
function bendPaths(a: Dir4, b: Dir4): number[][][] {
  const has = (d: Dir4) => a === d || b === d;
  const mx = has("E"), my = has("N");
  const ds = [5, 4, 2];
  return LANES.map((y, i) => {
    const x = LANES[2 - i], d = ds[i];
    const pts = [[-1, y], [x - d, y], [x, y + d], [x, 16]];
    return pts.map(([px, py]) => [mx ? 14 - px : px, my ? 14 - py : py]);
  });
}

function busTile(kind: "H" | "V" | Dir4[] | "X", pulse = -1): string[] {
  const g = pcbBase(kind === "H" ? 7 : kind === "V" ? 8 : 9);
  let paths: number[][][] = [];
  if (kind === "H") paths = LANES.map((y) => [[-1, y], [16, y]]);
  else if (kind === "V") paths = LANES.map((x) => [[x, -1], [x, 16]]);
  else if (kind === "X") paths = LANES.map((y) => [[-1, y], [16, y]]);
  else paths = bendPaths(kind[0], kind[1]);
  strokeTraces(g, paths);
  if (kind === "X") {
    // vertical lanes jump to the other layer through vias
    for (const x of LANES) { via(g, x - 1, -2); via(g, x - 1, 13); }
  }
  if (pulse >= 0) {
    // a little bright data packet running along the middle lane
    for (let k = 0; k < 3; k++) {
      const t = (pulse + k) % 16;
      if (kind === "H") { set(g, t, 7, "y"); set(g, t, 8, k === 1 ? "y" : "G"); }
      if (kind === "V") { set(g, 7, t, "y"); set(g, 8, t, k === 1 ? "y" : "G"); }
    }
  }
  return rows(g);
}

const bus = (id: string, kind: "H" | "V" | Dir4[] | "X", animated = false) => defineTerrain({
  id: `pcb-bus-${id}`,
  level: 1,
  group: "pcb",
  pal: PCB_PAL,
  lip: { fill: "#48ac64", outline: "#1a4a30", depth: 2 },
  shade: ["#2e7c4a"],
  variants: [{ rows: busTile(kind, animated ? 0 : -1) }],
  ...(animated ? {
    frames: [0, 4, 8, 12].map((p) => [{ rows: busTile(kind, p) }]),
    fps: 6,
  } : {}),
});

export const BUS_H = bus("h", "H", true);
export const BUS_V = bus("v", "V", true);
export const BUS_X = bus("x", "X");
export const BUS_ES = bus("es", ["E", "S"]); // ┌
export const BUS_WS = bus("ws", ["W", "S"]); // ┐
export const BUS_NE = bus("ne", ["N", "E"]); // └
export const BUS_NW = bus("nw", ["N", "W"]); // ┘

// ── Rainbow ribbon cable lying across the board (raised, walkable) ─────────
const RIBBON_PAL = {
  a: "#e8ecf4", b: "#b8c0d0", c: "#8890a8",
  r: "#f86060", R: "#c03848", o: "#f8a048", O: "#c87028", y: "#f8e060", Y: "#c8a830",
  g: "#78d868", G: "#48a048", u: "#68a8f8", U: "#3c70c8", v: "#b880f0", V: "#7c50b8",
};
function ribbonTile(crease: boolean): string[] {
  const out: string[] = [];
  const wires = ["rR", "oO", "yY", "gG", "uU", "vV"];
  out.push("aaaaaaaaaaaaaaaa");
  out.push("bbbbbbbbbbbbbbbb");
  for (const w of wires) { out.push(w[0].repeat(16)); out.push(w[1].repeat(16)); }
  out.push("bbbbbbbbbbbbbbbb");
  out.push("cccccccccccccccc");
  if (crease) return out.map((r, i) => (i > 0 && i < 15 ? r.slice(0, 9) + "c" + r.slice(10) : r));
  return out;
}
export const RIBBON = defineTerrain({
  id: "ribbon",
  level: 2,
  pal: RIBBON_PAL,
  lip: { fill: "#b8c0d0", outline: "#4c5068" },
  variants: [{ weight: 6, rows: ribbonTile(false) }, { weight: 1, rows: ribbonTile(true) }],
});

// ── Steel case floor with vent slots ────────────────────────────────────────
function steelTile(vent: boolean, seed: number): string[] {
  const g = grid("b");
  const r = rng(seed + 900);
  for (let k = 0; k < 4; k++) {
    const y = Math.floor(r() * 16), x0 = Math.floor(r() * 10);
    for (let x = x0; x < x0 + 6; x++) set(g, x, y, "c");
  }
  if (vent) {
    for (const y of [4, 10]) for (let x = 2; x < 14; x++) {
      set(g, x, y, "k"); set(g, x, y + 1, "k"); set(g, x, y + 2, "a");
      set(g, x, y - 1, "d");
    }
    for (const y of [4, 10]) { set(g, 1, y, "d"); set(g, 1, y + 1, "d"); set(g, 14, y, "a"); set(g, 14, y + 1, "a"); }
  }
  return rows(g);
}
export const STEEL = defineTerrain({
  id: "steel",
  level: 0,
  pal: { a: "#eef2fa", b: "#c4ccdc", c: "#b0b8cc", d: "#8890a8", k: "#3c4058" },
  shade: ["#7c84a0", "#a0a8c0"],
  variants: [
    { weight: 3, rows: steelTile(false, 1) },
    { weight: 2, rows: steelTile(true, 2) },
  ],
});
