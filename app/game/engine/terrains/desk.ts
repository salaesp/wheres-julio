// Giant-desk terrains: varnished wood with continuous grain, loose notebook
// sheets (ruled with a red margin and punched holes, or squared).
import { defineTerrain } from "../terrain";
import { gen, remap, rng } from "../propsLib/pixkit";

// ── Wood ─────────────────────────────────────────────────────────────────────
// Two grain lines cross every tile at fixed heights (so they join seamlessly
// left/right) and wander a little in the middle; short streaks and highlights
// vary per variant.
function woodTile(seed: number, knot = false): string[] {
  const r = rng(seed);
  const g = Array.from({ length: 16 }, () => Array<string>(16).fill("b"));
  // soft lighter band
  const band = 4 + Math.floor(r() * 3);
  for (let x = 0; x < 16; x++) for (let y = band; y < band + 2; y++) if (r() < 0.85) g[y][x] = "B";
  const wobble = (y0: number, ch: string) => {
    const s = 2 + Math.floor(r() * 7), len = 3 + Math.floor(r() * 4), dy = r() < 0.5 ? -1 : 1;
    for (let x = 0; x < 16; x++) {
      const y = y0 + (x >= s && x < s + len ? dy : 0);
      g[y][x] = ch;
      if (x === s - 1 || x === s + len) g[y0 + dy][x] = ch; // smooth the step
    }
  };
  wobble(2, "c");
  wobble(11, "d");
  // partial streaks
  for (let i = 0; i < 3; i++) {
    const y = [7, 9, 14][i] + (r() < 0.5 ? 0 : -1);
    const s = Math.floor(r() * 9), len = 3 + Math.floor(r() * 5);
    for (let x = s; x < Math.min(15, s + len); x++) g[y][x] = i === 1 ? "a" : "c";
  }
  if (knot) {
    const cx = 5 + Math.floor(r() * 6), cy = 7;
    const ring = ["..ddd..", ".dceed.", "dcceecd", ".dccdd.", "..ddd.."];
    ring.forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) if (row[xx] !== ".") g[cy - 2 + yy][cx - 3 + xx] = row[xx];
    });
  }
  return g.map((row) => row.join(""));
}

const WOOD_PAL = {
  a: "#f8d8a0", B: "#e8b478", b: "#dca468", c: "#c48848", d: "#a86c34", e: "#7c4c24",
};
export const WOOD = defineTerrain({
  id: "desk-wood",
  level: 1,
  pal: WOOD_PAL,
  shade: ["#9c6434", "#c08848"],
  lip: { fill: "#dca468", outline: "#5c3418" },
  variants: [
    { weight: 4, rows: woodTile(1) },
    { weight: 4, rows: woodTile(2) },
    { weight: 3, rows: woodTile(3) },
    { weight: 3, rows: woodTile(4) },
    { weight: 0.8, rows: woodTile(5, true) },
  ],
});

// ── Paper sheets ─────────────────────────────────────────────────────────────
const PAPER_PAL = {
  a: "#ffffff", b: "#f8f8f4", c: "#e8ecf0",
  l: "#a8c8f0", L: "#88a8e0", m: "#f08890", M: "#d86070",
  h: "#c08848", H: "#5c3418", s: "#d8d8e0",
};
const PAPER_COMMON = {
  level: 1.5,
  group: "paper",
  pal: PAPER_PAL,
  shade: ["#d8dce4"],
  lip: { fill: "#f8f8f4", outline: "#7c7c94" },
};

/** Ruled sheet: a blue line every 8px. */
const ruled = (_x: number, y: number) => (y % 8 === 7 ? "l" : "b");
const paperSmudges = (rows: string[], seed: number): string[] => {
  const r = rng(seed);
  const n = Math.floor(r() * 3);
  const pts = Array.from({ length: n }, () => [Math.floor(r() * 15), Math.floor(r() * 15)]);
  return remap(rows, (x, y, ch) => (ch === "b" && pts.some(([px, py]) => px === x && py === y) ? "c" : ch));
};

export const PAPER_RULED = defineTerrain({
  id: "paper-ruled", ...PAPER_COMMON,
  variants: [
    { weight: 5, rows: gen(16, 16, ruled) },
    { weight: 2, rows: paperSmudges(gen(16, 16, ruled), 3) },
    { weight: 1, rows: paperSmudges(gen(16, 16, ruled), 8) },
  ],
});

/** Ruled sheet with the red margin line (place as the 2nd column of a sheet). */
export const PAPER_MARGIN = defineTerrain({
  id: "paper-margin", ...PAPER_COMMON,
  variants: [{ rows: gen(16, 16, (x, y) => (x === 9 ? "m" : x === 11 ? "M" : ruled(x, y))) }],
});

/** Left edge of a ring-binder sheet ("hoja de carpeta"): punched holes. */
const holeRows = (hole: boolean): string[] =>
  gen(16, 16, (x, y) => {
    if (!hole) return y % 8 === 7 && x > 3 ? "l" : "b";
    const dx = x + 0.5 - 8, dy = y + 0.5 - 8;
    const d = dx * dx + dy * dy;
    if (d <= 12) return dy < -1 ? "H" : "h"; // the wood seen through the hole
    if (d <= 20) return dy < 0 ? "s" : "a";
    return y % 8 === 7 && x > 3 ? "l" : "b";
  });
export const PAPER_HOLE = defineTerrain({
  id: "paper-hole", ...PAPER_COMMON,
  variants: [{ rows: holeRows(true) }],
});
export const PAPER_EDGE = defineTerrain({
  id: "paper-edge", ...PAPER_COMMON,
  variants: [{ rows: holeRows(false) }],
});

/** Squared sheet ("cuadriculado"). */
const squared = (x: number, y: number) => (x % 8 === 7 || y % 8 === 7 ? "l" : "b");
export const PAPER_GRID = defineTerrain({
  id: "paper-grid",
  level: 1.5,
  group: "paper-grid",
  pal: { ...PAPER_PAL, b: "#fafaf6" },
  shade: ["#d8dce4"],
  lip: { fill: "#fafaf6", outline: "#7c7c94" },
  variants: [
    { weight: 5, rows: gen(16, 16, squared) },
    { weight: 1, rows: paperSmudges(gen(16, 16, squared), 5) },
  ],
});
