// Terrains for El Circo: cream brick fairground paving (re-tinted zoo bricks
// with confetti), a red-and-white aisle runner, the raised sawdust ring floor,
// a wooden boardwalk for the sideshow stalls and a gravel bed with rails for
// the little fair train.
import { defineTerrain, hash2 } from "../terrain";
import { ZOO_PAVE } from "./zoo";

type Mark = readonly [number, number, readonly string[]];

const gen16 = (fn: (x: number, y: number) => string): string[] => {
  const out: string[] = [];
  for (let y = 0; y < 16; y++) {
    let r = "";
    for (let x = 0; x < 16; x++) r += fn(x, y);
    out.push(r);
  }
  return out;
};

/** Stamp hand-drawn marks over 16×16 rows ('.' keeps the base). */
function mark(rows: readonly string[], marks: readonly Mark[]): string[] {
  const g = rows.map((r) => r.split(""));
  for (const [mx, my, art] of marks) {
    art.forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) {
        const x = mx + xx, y = my + yy;
        if (row[xx] !== "." && x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = row[xx];
      }
    });
  }
  return g.map((r) => r.join(""));
}

// ════════════════════════════════════════════════════════════════════════════
// Fairground paving — the zoo's sandstone bricks, warmer, with confetti.
// ════════════════════════════════════════════════════════════════════════════
const PAVE_PAL = {
  ...ZOO_PAVE.pal,
  a: "#fff2dc", b: "#f6dcb8", e: "#eecaa0", f: "#fce8cc", c: "#d8aa80", d: "#b88460",
  r: "#e84848", y: "#f8d038", u: "#48a0f0", q: "#e060c0", t: "#ffffff", k: "#8858c8",
};
const [P0, P1, P2, P3] = ZOO_PAVE.variants.map((v) => v.rows);
export const CIRCUS_PAVE = defineTerrain({
  ...ZOO_PAVE,
  id: "circus-pave",
  pal: PAVE_PAL,
  lip: { fill: "#f6dcb8", outline: "#a07450" },
  shade: ["#d0a078"],
  variants: [
    { weight: 6, rows: P0 },
    { weight: 4, rows: P1 },
    { weight: 2, rows: P2 },
    { weight: 1.2, rows: P3 },
    { weight: 1.6, rows: mark(P0, [[2, 3, ["r"]], [10, 2, ["u"]], [13, 9, ["y"]], [5, 12, ["q"]], [8, 7, ["t"]]]) },
    { weight: 1.4, rows: mark(P1, [[4, 5, ["u", ".y"]], [11, 11, ["r."]], [1, 9, ["k"]], [7, 1, ["q"]]]) },
    { weight: 1, rows: mark(P0, [[3, 9, ["rr", ".y"]], [10, 4, ["uk"]], [6, 13, ["t"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Aisle runner: red velvet with white pin-stripes, gold fringe and diamonds.
// ════════════════════════════════════════════════════════════════════════════
const RUN_PAL = {
  Y: "#b88820", y: "#f8d848", w: "#ffffff", W: "#e4dcec",
  R: "#a82838", r: "#d83c48", s: "#ec6068", d: "#8c1c30",
};
const runner = (x: number, y: number) => {
  if (x === 0) return "Y";
  if (x === 15) return "Y";
  if (x === 1 || x === 14) return "y";
  if (x === 2 || x === 13) return "w";
  if (x === 3 || x === 12) return "W";
  if (x === 4 || x === 11) return "R";
  if (x === 5) return "s";
  if (x === 10) return "d";
  return (x + y) % 8 === 0 ? "R" : "r";
};
export const RED_CARPET = defineTerrain({
  id: "red-carpet",
  level: 2,
  group: "circus-floor",
  pal: RUN_PAL,
  lip: { fill: "#d83c48", outline: "#5c1020" },
  shade: ["#8c1c30"],
  variants: [
    { weight: 6, rows: gen16(runner) },
    {
      weight: 1.5,
      rows: mark(gen16(runner), [[5, 4, ["..yy..", ".yrry.", "yrrrry", ".yrry.", "..yy.."]]]),
    },
    { weight: 1, rows: mark(gen16(runner), [[6, 9, [".y.", "yry", ".y."]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Raised ring floor: golden sawdust packed flat, raked in arcs, with hay bits.
// ════════════════════════════════════════════════════════════════════════════
const RING_PAL = {
  a: "#fbe8b0", b: "#f0d28a", c: "#dcb468", d: "#b88c48",
  r: "#e84848", y: "#f8d038", u: "#48a0f0", q: "#e060c0", t: "#ffffff",
};
const sawdust = (seed: number, dens = 7) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < dens ? "c" : h > 96 ? "a" : "b";
};
export const RING_FLOOR = defineTerrain({
  id: "circus-ring",
  level: 3,
  group: "circus-ring",
  pal: RING_PAL,
  lip: { fill: "#f0d28a", outline: "#6a4a28", bumpy: true },
  shade: ["#c49858"],
  variants: [
    { weight: 6, rows: gen16(sawdust(81)) },
    { weight: 3, rows: mark(gen16(sawdust(82, 5)), [[2, 5, ["cc.", ".dc"]], [9, 11, ["cc", "dc"]]]) },
    { weight: 2, rows: mark(gen16(sawdust(83)), [[4, 9, ["cccc"]], [8, 3, [".ccc", "cc.."]]]) },
    { weight: 1.2, rows: mark(gen16(sawdust(84, 6)), [[3, 3, ["r"]], [11, 6, ["u"]], [6, 12, ["y"]], [13, 13, ["q"]], [1, 10, ["t"]]]) },
    { weight: 1, rows: mark(gen16(sawdust(85)), [[6, 5, ["yd.", ".dy"]], [11, 12, ["d."]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Boardwalk of the sideshow stalls (honey planks, staggered joints).
// ════════════════════════════════════════════════════════════════════════════
const PL_PAL = {
  a: "#f4c888", b: "#d8a468", c: "#b88048", d: "#8c5c30", e: "#5c3c20",
  n: "#707078", r: "#e84848", y: "#f8d038", u: "#48a0f0", t: "#ffffff",
};
const plank = (x: number, y: number) => {
  const row = Math.floor(y / 4);
  const ly = y % 4;
  if (ly === 3) return "c";
  if (ly === 0) return "a";
  const off = (row * 5 + Math.floor(row / 2) * 3) % 16;
  if ((x + off) % 16 === 0) return "e";
  if (ly === 1 && hash2(x, y, 71) % 100 < 6) return "c";
  return hash2(x, y, 72) % 100 < 5 ? "c" : "b";
};
export const PLANKS = defineTerrain({
  id: "circus-planks",
  level: 1.5,
  group: "planks",
  pal: PL_PAL,
  lip: { fill: "#d8a468", outline: "#4a2c14" },
  shade: ["#8c5c30"],
  variants: [
    { weight: 6, rows: gen16(plank) },
    { weight: 2, rows: mark(gen16(plank), [[3, 1, ["n"]], [12, 5, ["n"]], [6, 13, ["n"]]]) },
    { weight: 1, rows: mark(gen16(plank), [[5, 4, ["r"]], [10, 9, ["y"]], [2, 12, ["u"]], [13, 2, ["t"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Gravel bed with two steel rails and wooden sleepers (the fair train).
// ════════════════════════════════════════════════════════════════════════════
const TR_PAL = {
  g: "#d8c8a8", G: "#c0ac88", h: "#a89470", s: "#8a6038", S: "#5c3c20",
  a: "#e4e4f0", n: "#a8a8bc", N: "#686880",
};
const track = (x: number, y: number) => {
  if (y === 5) return "a";
  if (y === 6) return "n";
  if (y === 7) return "N";
  if (y === 12) return "a";
  if (y === 13) return "n";
  if (y === 14) return "N";
  if (y >= 4 && y <= 15 && x % 5 >= 1 && x % 5 <= 2) return y === 15 || y === 4 ? "S" : "s";
  const h = hash2(x, y, 91) % 100;
  return h < 14 ? "G" : h > 92 ? "h" : "g";
};
export const TRACK = defineTerrain({
  id: "circus-track",
  level: 1,
  walkable: false,
  noJulio: true,
  pal: TR_PAL,
  lip: { fill: "#d8c8a8", outline: "#7a6648" },
  shade: ["#b09c78"],
  variants: [{ weight: 1, rows: gen16(track) }],
});
