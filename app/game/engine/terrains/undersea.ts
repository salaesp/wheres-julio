// Seabed terrains for "El Fondo del Mar": turquoise underwater sand (baked per
// pixel with ripples, diagonal light rays and shimmering caustics), reef rock,
// swaying sea grass that hides legs, dense coral beds and dark glowing trenches.
import { defineTerrain, TILE, type Terrain } from "../terrain";
import type { Pal } from "../sprite";

// ── Noise helpers ────────────────────────────────────────────────────────────
function hnoise(x: number, y: number, s = 0): number {
  let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
const shiftRows = (rows: readonly string[], dx: number) =>
  rows.map((r) => r.slice(-dx) + r.slice(0, r.length - dx));

// ── Trench (deep pit, not walkable, faint bioluminescent glow) ───────────────
const TRENCH_PAL: Pal = {
  a: "#24508a", b: "#183c70", c: "#122e5a", d: "#0c2046",
  e: "#3890b0", E: "#78e0e8", W: "#d8fff8",
};
function trenchBase(seed: number): string[] {
  const rows: string[] = [];
  for (let y = 0; y < TILE; y++) {
    let r = "";
    for (let x = 0; x < TILE; x++) {
      const v = Math.sin((x + seed * 5) * 0.55 + Math.sin((y + seed * 3) * 0.5) * 1.6) + Math.sin((y + seed * 7) * 0.4 - x * 0.2);
      r += v > 1.35 ? "b" : v < -1.25 ? "d" : "c";
    }
    rows.push(r);
  }
  return rows;
}
type Glow = readonly [number, number, number]; // x, y, phase
function trenchGlows(seed: number): Glow[] {
  const out: Glow[] = [];
  for (let i = 0; i < 3; i++) {
    out.push([1 + Math.floor(hnoise(seed, i, 1) * 14), 1 + Math.floor(hnoise(seed, i, 2) * 14), Math.floor(hnoise(seed, i, 3) * 8)]);
  }
  return out;
}
const PULSE = [0, 1, 2, 3, 2, 1, 0, 0];
function trenchFrame(rows: readonly string[], glows: Glow[], f: number): string[] {
  const g = rows.map((r) => r.split(""));
  for (const [x, y, ph] of glows) {
    const l = PULSE[(f + ph) % PULSE.length];
    if (l === 0) { g[y][x] = "e"; continue; }
    g[y][x] = l === 1 ? "e" : l === 2 ? "E" : "W";
    if (l >= 2) {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const yy = y + dy, xx = x + dx;
        if (g[yy] && g[yy][xx] !== undefined) g[yy][xx] = l === 3 ? "E" : "e";
      }
    }
  }
  return g.map((r) => r.join(""));
}
const TRENCH_SEEDS = [1, 2, 3, 4, 5];
export const TRENCH = defineTerrain({
  id: "sea-trench",
  level: 0,
  walkable: false,
  pal: TRENCH_PAL,
  // the far (north) wall of the pit, seen from above: lit rock fading to dark
  shade: ["#4c7c90", "#3c6880", "#2e5470", "#22425e", "#1a3552"],
  variants: TRENCH_SEEDS.map((sd) => ({ rows: trenchFrame(trenchBase(sd), trenchGlows(sd), 0) })),
  frames: PULSE.map((_, f) => TRENCH_SEEDS.map((sd) => ({ rows: trenchFrame(trenchBase(sd), trenchGlows(sd), f) }))),
  fps: 2.5,
});

// ── Reef rock (walkable rocky ground) ────────────────────────────────────────
const ROCK_PAL: Pal = {
  a: "#c4c8e0", b: "#9ca2c4", c: "#7c82a8", d: "#5c6088",
  g: "#78c090", G: "#4c9070", w: "#f0f0f8", W: "#b8b8d0",
  k: "#3a2c50", K: "#7458a8", p: "#f898b8", P: "#c86088",
};
const ROCK_SLAB = [
  "bbbbbbbcabbbbbbb",
  "bbbbbbbcbbbbbbbb",
  "bbbbbbccbbbbbbbb",
  "abbbbbcbbbbbbbbb",
  "cccccccbbbbbbbbb",
  "bbbbbbbcccbbbbbb",
  "bbbbbbbbbbccccbb",
  "bbabbbbbbbbbbbcc",
  "bbbbbbbbbbbbbbbb",
  "bbbbbbbbbbbbbbbb",
  "bbbbbcbbbbbbbbbb",
  "bbbbbcabbbbbbbbb",
  "ccccccbbbbbbbbbb",
  "bbbbbbcbbbbbabbb",
  "bbbbbbbcccccccbb",
  "bbbbbbbcbbbbbbcc",
];
function rockStamp(rows: readonly string[], stamps: readonly (readonly [number, number, readonly string[]])[]): string[] {
  const g = rows.map((r) => r.split(""));
  for (const [x, y, st] of stamps) st.forEach((r, yy) => {
    for (let xx = 0; xx < r.length; xx++) if (r[xx] !== "." && g[y + yy]?.[x + xx] !== undefined) g[y + yy][x + xx] = r[xx];
  });
  return g.map((r) => r.join(""));
}
const ROCK_B = shiftRows(ROCK_SLAB, 6).map((r, i, a) => a[(i + 5) % 16]);
export const REEF_ROCK = defineTerrain({
  id: "reef-rock",
  level: 2,
  pal: ROCK_PAL,
  lip: { fill: "#9ca2c4", outline: "#3a3e64", depth: 2 },
  shade: ["#7c82a8"],
  variants: [
    { weight: 4, rows: ROCK_SLAB },
    { weight: 3, rows: ROCK_B },
    { weight: 2, rows: rockStamp(ROCK_SLAB, [[2, 9, [".gg.", "gGGg", ".G.."]], [11, 2, ["ww", "W."]]]) },
    { weight: 1.2, rows: rockStamp(ROCK_B, [[9, 9, ["K.K.K", ".KkK.", "KkkkK", ".KkK.", "K.K.K"]]]) },
    { weight: 1.2, rows: rockStamp(ROCK_SLAB, [[3, 1, [".pp", "pPp", ".P."]], [10, 10, ["ww.w", "WwW."]]]) },
    { weight: 1, rows: rockStamp(ROCK_B, [[1, 3, ["g.g", "GgG"]], [12, 12, [".g", "gG"]], [7, 7, ["w"]]]) },
  ],
});

// ── Sea grass ("pasto alto" de algas): hides the legs, sways ─────────────────
const SG_STRIP = [
  "eaeeeaeeeeaeeeae",
  "eaeeaeeeeaeeeeae",
  "babeabebbabeeaba",
  "bcbbbcbbbcbbbcbb",
  "cbccbcbccbcccbcc",
  "dcdcdcdcdcdcdcdc",
  "dddddddddddddddd",
  "cdddcdddcdddcddd",
];
function swayStrip(strip: readonly string[], dx: number): string[] {
  // only the two tip rows move
  return strip.map((r, i) => (i < 2 && dx ? shiftRows([r], (dx + 16) % 16)[0] : r));
}
const sgTile = (s0: number, s1: number) => [...swayStrip(SG_STRIP, s0), ...swayStrip(shiftRows(SG_STRIP, 3), s1)];
const SG0 = sgTile(0, 0);
const SG1 = sgTile(1, 0);
const SG2 = sgTile(1, 1);
const SG3 = sgTile(0, 1);
const SG_PAL: Pal = { a: "#a8eca0", b: "#50b880", c: "#2e9068", d: "#1a6458", e: "#227460", ".": null };
export const SEA_GRASS = defineTerrain({
  id: "sea-grass",
  level: 3,
  pal: SG_PAL,
  lip: { fill: "#50b880", outline: "#124c48", bumpy: true },
  shade: [],
  variants: [{ rows: SG0 }],
  frames: [[{ rows: SG0 }], [{ rows: SG1 }], [{ rows: SG2 }], [{ rows: SG3 }]],
  fps: 1.6,
  cover: { rows: SG0.map((r, i) => (i % 8 < 2 ? r.replace(/[de]/g, ".") : r)) },
});

// ── Coral bed (dense small corals over dark rock, not walkable) ─────────────
const CORAL_PAL: Pal = {
  e: "#56608a", f: "#6a76a0", E: "#465078", k: "#262848",
  h: "#ffc0d0", i: "#f87898", j: "#d04870", l: "#902850",
  m: "#ffd898", n: "#f89840", q: "#d06828", u: "#984018",
  v: "#fff8b8", x: "#f0d850", z: "#c0a028", Z: "#806818",
  "1": "#f0c8ff", "2": "#c078e8", "3": "#9048c0", "4": "#602c88",
  "5": "#c0fff0", "6": "#50d8c8", "7": "#28a098", "8": "#18686c",
};
const CORAL_RAMPS = ["hijl", "mnqu", "vxzZ", "1234", "5678"];
function coralTile(seed: number): string[] {
  const g: string[][] = Array.from({ length: TILE }, (_, y) =>
    Array.from({ length: TILE }, (_, x) => (hnoise(x, y, seed) < 0.08 ? "f" : hnoise(x, y, seed + 1) < 0.08 ? "E" : "e")));
  const R = (k: number) => hnoise(seed, k, 77);
  const set = (x: number, y: number, c: string) => { if (x >= 1 && x < TILE - 1 && y >= 1 && y < TILE - 1) g[y][x] = c; };
  const spots: [number, number][] = [[4, 4], [11, 4], [4, 11], [11, 11], [8, 8]];
  const n = 4 + (R(0) < 0.5 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const [bx, by] = spots[i];
    const cx = bx + Math.floor(R(i * 7 + 1) * 5) - 2, cy = by + Math.floor(R(i * 7 + 2) * 5) - 2;
    const rp = CORAL_RAMPS[Math.floor(R(i * 7 + 3) * CORAL_RAMPS.length)];
    const kind = Math.floor(R(i * 7 + 4) * 4);
    if (kind === 0) {
      // brain coral dome with grooves
      for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
        const nx = (x + 0.5) / 3.4, ny = (y + 0.5) / 3;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;
        const lit = -(nx * 0.55 + ny * 0.85);
        let l = lit > 0.4 && r2 < 0.6 ? 0 : lit > -0.2 ? 1 : lit > -0.65 ? 2 : 3;
        if ((x + 3 + (y & 1 ? 1 : 0)) % 3 === 0 && l < 3 && r2 < 0.8) l = Math.min(3, l + 1);
        set(cx + x, cy + y, rp[l]);
      }
    } else if (kind === 1) {
      // staghorn: little forked branches
      for (const [x, y, l] of [[0, 2, 2], [0, 1, 1], [0, 0, 1], [-1, -1, 1], [-2, -2, 0], [1, -1, 2], [2, -2, 0],
        [-2, 1, 1], [-3, 0, 0], [2, 1, 2], [3, 0, 0], [0, -1, 1], [0, -2, 0], [-1, 2, 2], [1, 2, 3]] as const) set(cx + x, cy + y, rp[l]);
    } else if (kind === 2) {
      // tube sponges
      for (const [ox, h] of [[-2, 4], [0, 5], [2, 3]] as const) {
        for (let y = 0; y < h; y++) {
          set(cx + ox, cy + 2 - y, rp[y === h - 1 ? 0 : 1]);
          set(cx + ox + 1, cy + 2 - y, rp[y === h - 1 ? 3 : 2]);
        }
      }
    } else {
      // tiny anemone: disc + tentacle dots
      for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) set(cx + x, cy + y, rp[x + y === 0 ? 0 : 1]);
      for (const [x, y] of [[-1, -1], [2, -1], [-1, 2], [2, 2], [0, -2], [1, 3], [-2, 0], [3, 1]]) set(cx + x, cy + y, rp[x < 1 && y < 1 ? 1 : 2]);
    }
  }
  // dark outline where coral meets the rock
  const isRock = (c: string) => c === "e" || c === "f" || c === "E";
  const out = g.map((r) => [...r]);
  for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
    if (!isRock(g[y][x])) continue;
    const up = g[y - 1]?.[x], lf = g[y]?.[x - 1], rt = g[y]?.[x + 1], dn = g[y + 1]?.[x];
    if ([up, lf, rt, dn].some((c) => c && !isRock(c))) out[y][x] = "k";
  }
  return out.map((r) => r.join(""));
}
export const CORAL_BED = defineTerrain({
  id: "coral-bed",
  level: 3,
  walkable: false,
  pal: CORAL_PAL,
  lip: { fill: "#56608a", outline: "#262848", depth: 2 },
  variants: [11, 23, 37, 41, 59, 63, 71, 89].map((sd) => ({ rows: coralTile(sd) })),
});

// ── Seabed sand: baked per pixel ─────────────────────────────────────────────
export const SEABED_PAL: Pal = {
  // sand ramp
  a: "#c8eee0", b: "#9cd4cc", c: "#7cb8bc", d: "#5c98a8",
  // lit sand (light rays)
  A: "#eafff2", B: "#bce6d8", C: "#9cd0cc", D: "#7cb4b8",
  // details
  w: "#ffffff", W: "#c8d8e8", s: "#f8b0c0", S: "#d07090",
  o: "#f89850", O: "#c05838", y: "#f8e888", Y: "#c8a848",
  g: "#78b8a0", G: "#4c8c80", k: "#5c7c98",
};

/** Is world pixel (x, y) inside a light ray? Returns 0 (no) … 1 (core). */
function rayAt(x: number, y: number): number {
  const u = x * 1 + y * 0.42; // rays slant down-right from the top-left light
  const bands: [number, number][] = [[40, 22], [128, 14], [205, 28], [300, 16], [372, 24]];
  let best = 0;
  for (const [c, w] of bands) {
    const wob = Math.sin(y * 0.05 + c) * 3;
    const d = Math.abs(u - c - wob) - w / 2;
    if (d < 0) return 1;
    if (d < 3) best = Math.max(best, 1 - d / 3);
  }
  return best;
}

function rippleAt(x: number, y: number): string | null {
  const zone = Math.sin(x * 0.031 + 1.3) * Math.sin(y * 0.043 + 0.4) + 0.45 * Math.sin((x - y) * 0.019 + 2);
  if (zone < 0.05) return null;
  const ph = y + 2.4 * Math.sin(x * 0.19 + Math.sin(y * 0.06) * 1.5) + 1.1 * Math.sin(x * 0.071 + y * 0.03);
  const m = ((ph % 9) + 9) % 9;
  // dashed ridges: break the lines in short runs
  if (hnoise(Math.floor(x / 7), Math.floor(ph / 9), 3) < (zone < 0.25 ? 0.6 : 0.3)) return null;
  if (m < 1) return "a";
  if (m < 2) return "c";
  return null;
}

type Deco = Map<number, string>;
const DECOS: readonly (readonly string[])[] = [
  [".w.", "wWw", "WW."],                       // clam shell
  [".ss.", "sSSs", ".SS."],                     // pink shell
  ["..o..", "ooooo", ".oOo.", ".o.o."],         // starfish
  ["..y..", "yyyyy", ".yYy.", ".y.y."],         // yellow starfish
  ["kk.", "kkk"],                               // pebbles
  ["k.k", ".k."],
  ["g.g", "gGg", ".G."],                        // tiny sprout of sea grass
  ["..g", ".gG", "gG.", "G.."],
  [".WW.", "WwwW", ".WW."],                     // sand dollar
  ["w", "W"],
];
function buildDecos(cols: number, rows: number, seed: number): Deco {
  const m: Deco = new Map();
  for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
    const r = hnoise(tx, ty, seed);
    const n = r < 0.18 ? 2 : r < 0.6 ? 1 : 0;
    for (let k = 0; k < n; k++) {
      const pick = Math.floor(hnoise(tx, ty, seed + 11 + k) * DECOS.length);
      const st = DECOS[pick];
      const ox = tx * TILE + 2 + Math.floor(hnoise(tx, ty, seed + 21 + k) * 10);
      const oy = ty * TILE + 2 + Math.floor(hnoise(tx, ty, seed + 31 + k) * 10);
      st.forEach((row, yy) => {
        for (let xx = 0; xx < row.length; xx++) if (row[xx] !== ".") m.set((oy + yy) * 4096 + ox + xx, row[xx]);
      });
      // a little shadow under bigger shells/starfish
      if (pick <= 3 || pick === 8) for (let xx = 0; xx < st[0].length; xx++) {
        const key = (oy + st.length) * 4096 + ox + xx;
        if (!m.has(key) && xx > 0) m.set(key, "c");
      }
    }
  }
  return m;
}

const LIT: Record<string, string> = { a: "A", b: "B", c: "C", d: "D" };

function seabedPx(deco: Deco, x: number, y: number, f: number): string {
  let ch = "b";
  // big faint mottling (slightly darker patches)
  const mot = Math.sin(x * 0.07 + Math.sin(y * 0.05) * 2) + Math.sin(y * 0.09 - x * 0.02);
  if (mot > 1.55) ch = "c";
  const rp = rippleAt(x, y);
  if (rp) ch = rp;
  if (hnoise(x, y, 9) < 0.012) ch = "c";
  if (hnoise(x, y, 13) < 0.006) ch = "a";
  const dc = deco.get(y * 4096 + x);
  if (dc) return dc;
  const ray = rayAt(x, y);
  const lit = ray >= 1 || (ray > 0 && ray > bayer(x, y));
  if (!lit) return ch;
  let out = LIT[ch] ?? ch;
  if (ray >= 1) {
    // caustic net shimmering in the rays (4 frames)
    const t = (f * Math.PI) / 2;
    const v = Math.sin(x * 0.42 + t) + Math.sin(y * 0.37 - t * 0.8 + x * 0.12) + Math.sin((x + y) * 0.21 + t * 0.6);
    if (Math.abs(v) < 0.16) out = "A";
  }
  return out;
}

/**
 * Bake a seabed map: '.' (or any char missing from `forced`) is baked sand; the
 * other chars map to ready-made terrains.
 */
export function bakeSeabed(overlay: readonly string[], forced: Record<string, Terrain>, seed = 1): {
  map: string[]; legend: Record<string, Terrain>;
} {
  const rows = overlay.length, cols = overlay[0].length;
  const deco = buildDecos(cols, rows, seed);
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
  for (let ty = 0; ty < rows; ty++) {
    let row = "";
    for (let tx = 0; tx < cols; tx++) {
      let t = forced[overlay[ty][tx]];
      if (!t) {
        const frames: string[][] = [];
        for (let f = 0; f < 4; f++) {
          const rr: string[] = [];
          for (let ly = 0; ly < TILE; ly++) {
            let r = "";
            for (let lx = 0; lx < TILE; lx++) r += seabedPx(deco, tx * TILE + lx, ty * TILE + ly, f);
            rr.push(r);
          }
          frames.push(rr);
        }
        const animated = frames.some((fr) => fr.join() !== frames[0].join());
        const litTile = rayAt(tx * TILE + 8, ty * TILE + 2) >= 1;
        t = defineTerrain({
          id: `seabed-${tx}-${ty}`,
          level: 1,
          group: "seabed",
          pal: SEABED_PAL,
          lip: { fill: "#9cd4cc", outline: "#2e5c70", depth: 2 },
          shade: [litTile ? "#9cd0cc" : "#78b0b4"],
          variants: [{ rows: frames[0] }],
          frames: animated ? frames.map((r) => [{ rows: r }]) : undefined,
          fps: 2,
        });
      }
      row += assign(t);
    }
    map.push(row);
  }
  return { map, legend };
}
