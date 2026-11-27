// Terrains for El Circo.
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
// CIRCUS
// ════════════════════════════════════════════════════════════════════════════

const SAW_PAL = {
  a: "#f4dca0", b: "#e6c47e", c: "#d0a860", d: "#b08848",
  r: "#e84848", y: "#f8d838", u: "#48a0f0", p: "#e060c0", g: "#58c058", w: "#ffffff",
};
const saw = (seed: number, dens = 8) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < dens ? "c" : h > 95 ? "a" : "b";
};
const CONFETTI: Mark[] = [[2, 3, ["r"]], [9, 2, ["u"]], [12, 8, ["y"]], [5, 11, ["p"]], [13, 13, ["g"]], [1, 8, ["y"]]];
export const SAWDUST = defineTerrain({
  id: "sawdust",
  level: 1,
  group: "sawdust",
  pal: SAW_PAL,
  lip: { fill: "#e6c47e", outline: "#8a6430", bumpy: true },
  shade: ["#c09858"],
  variants: [
    { weight: 6, rows: tile(saw(61)) },
    { weight: 3, rows: tile(saw(62, 5), [[3, 4, ["cc", "dc"]], [10, 10, ["cc."]]]) },
    { weight: 2, rows: tile(saw(63), [[6, 6, ["dd"]], [12, 2, ["cc"]]]) },
    { weight: 1.5, rows: tile(saw(64, 6), CONFETTI) },
    { weight: 1, rows: tile(saw(65, 6), [[4, 5, ["u"]], [10, 9, ["r"]], [7, 13, ["y"]], [13, 3, ["p"]]]) },
  ],
});

// Red-and-white striped carpet (entrance & ring border).
const CARPET_PAL = { a: "#f8f8f8", b: "#e0e0e8", r: "#e04848", R: "#b83038", s: "#f87878", y: "#f8d838" };
const stripe = (x: number, y: number) => {
  const red = Math.floor(x / 4) % 2 === 0;
  if (red) return x % 4 === 0 ? "s" : x % 4 === 3 ? "R" : "r";
  return x % 4 === 0 ? "a" : "b";
};
export const STRIPE_CARPET = defineTerrain({
  id: "stripe-carpet",
  level: 2,
  group: "circus-floor",
  pal: CARPET_PAL,
  lip: { fill: "#e04848", outline: "#6a1c28" },
  shade: ["#a02838"],
  variants: [
    { weight: 4, rows: tile(stripe) },
    { weight: 1, rows: tile(stripe, [[6, 6, ["yy", "yy"]]]) },
  ],
});

// Red velvet carpet with golden trim.
export const RED_CARPET = defineTerrain({
  id: "red-carpet",
  level: 2,
  group: "circus-floor",
  pal: { a: "#f06060", b: "#d83c48", c: "#b82c3c", d: "#8c1c30", y: "#f8d848", Y: "#c89828" },
  lip: { fill: "#d83c48", outline: "#5c1020" },
  shade: ["#8c1c30"],
  variants: [
    { weight: 5, rows: tile((x, y) => (x === 0 || x === 15 ? (x === 0 ? "Y" : "y") : (x + y) % 6 === 0 ? "c" : "b")) },
    { weight: 1, rows: tile((x, y) => (x === 0 || x === 15 ? (x === 0 ? "Y" : "y") : "b"), [[6, 5, [".y.", "yby", ".y."]]]) },
  ],
});

// Wooden boardwalk.
const PL_PAL = { a: "#e8b878", b: "#c8985c", c: "#a87848", d: "#805830", e: "#5c3c20" };
const plank = (x: number, y: number) => {
  if (y % 8 === 7) return "e";
  if (y % 8 === 0) return "a";
  const off = Math.floor(y / 8) % 2 ? 7 : 0;
  if ((x + off) % 16 === 0) return "d";
  return hash2(x, y, 71) % 100 < 7 ? "c" : "b";
};
export const PLANKS = defineTerrain({
  id: "circus-planks",
  level: 1,
  group: "planks",
  pal: PL_PAL,
  lip: { fill: "#c8985c", outline: "#3c2410" },
  shade: ["#805830"],
  variants: [
    { weight: 5, rows: tile(plank) },
    { weight: 1, rows: tile(plank, [[5, 3, ["dd"]], [10, 11, ["dd"]]]) },
  ],
});

