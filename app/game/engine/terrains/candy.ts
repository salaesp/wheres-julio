// Candy-land terrains: chocolate-bar plaza floor (plain squares, shavings,
// chips, sprinkles), wafer paths, mint sugar grass, shredded-coconut grass,
// pink cotton-candy "tall grass" (hides legs), an animated milk river and a
// red-licorice bridge.
import { defineTerrain, hash2 } from "../terrain";

type Mark = readonly [number, number, readonly string[]];

/** A 16×16 tile from a base letter (or a generator) plus stamped details. */
function tile(base: string | ((x: number, y: number) => string), marks: readonly Mark[] = []): string[] {
  const g: string[][] = [];
  for (let y = 0; y < 16; y++) {
    const r: string[] = [];
    for (let x = 0; x < 16; x++) r.push(typeof base === "string" ? base : base(x, y));
    g.push(r);
  }
  for (const [mx, my, rows] of marks) {
    rows.forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) {
        const ch = row[xx];
        const x = mx + xx, y = my + yy;
        if (ch !== "." && ch !== " " && x >= 0 && x < 16 && y >= 0 && y < 16) g[y][x] = ch;
      }
    });
  }
  return g.map((r) => r.join(""));
}

const shiftY = (rows: readonly string[], dy: number) =>
  rows.map((_, i) => rows[(i - dy + rows.length) % rows.length]);

// ════════════════════════════════════════════════════════════════════════════
// Chocolate bar floor: 8×8 bevelled squares (light top-left, dark bottom-right,
// deep groove). Variants add shavings, chips, sprinkles and a white square.
// ════════════════════════════════════════════════════════════════════════════
function bar(white: readonly number[] = []) {
  return (x: number, y: number) => {
    const bx = x % 8, by = y % 8;
    const sq = Math.floor(x / 8) + Math.floor(y / 8) * 2;
    const w = white.includes(sq);
    if (bx === 7 || by === 7) return w ? "D" : "d";
    if (by === 0 || bx === 0) return w ? "A" : "a";
    if (by === 6 || bx === 6) return w ? "C" : "c";
    if (bx === 1 && by === 1) return w ? "A" : "a";
    return w ? "B" : "b";
  };
}
export const CHOCO = defineTerrain({
  id: "choco",
  level: 1,
  pal: {
    a: "#b0784c", b: "#8c5834", c: "#704428", d: "#4c2c1c",
    A: "#fff4e0", B: "#f4e0c0", C: "#d8bc98", D: "#a88868", // white chocolate
    s: "#c89060", S: "#e8b888",                            // shavings
    k: "#3c2014", K: "#5c3420",                            // dark chips
    r: "#f05878", y: "#f8d848", g: "#68d890", u: "#68a8f8", w: "#ffffff", p: "#c878f0",
  },
  shade: ["#5c3420"],
  lip: { fill: "#8c5834", outline: "#3c2014" },
  variants: [
    { weight: 6, rows: tile(bar()) },
    { weight: 2, rows: tile(bar(), [[2, 2, ["sS", ".s"]], [10, 11, [".S", "ss"]], [11, 3, ["S"]]]) },
    { weight: 2, rows: tile(bar(), [[3, 10, [".K", "kk"]], [10, 2, [".K", "kk"]], [12, 12, ["k"]]]) },
    { weight: 1.6, rows: tile(bar(), [[2, 3, ["r"]], [4, 2, ["y"]], [11, 4, ["g"]], [3, 11, ["u"]], [12, 10, ["w"]], [10, 13, ["p"]]]) },
    { weight: 1.2, rows: tile(bar(), [[9, 9, ["y.", ".r"]], [2, 2, ["g"]], [4, 4, ["u"]], [12, 3, ["sS"]]]) },
    { weight: 0.5, rows: tile(bar([3]), [[2, 3, ["kK"]]]) },
    { weight: 0.5, rows: tile(bar([0]), [[11, 11, ["r"]], [13, 9, ["y"]]]) },
  ],
});

// White-chocolate squares (plaza centre around the fountain).
export const WHITE_CHOCO = defineTerrain({
  ...CHOCO,
  id: "white-choco",
  variants: [
    { weight: 5, rows: tile(bar([0, 1, 2, 3])) },
    { weight: 2, rows: tile(bar([0, 1, 2, 3]), [[2, 3, ["r"]], [4, 2, ["y"]], [11, 4, ["g"]], [3, 11, ["u"]], [12, 10, ["p"]]]) },
    { weight: 1, rows: tile(bar([0, 1, 2, 3]), [[10, 10, [".K", "kk"]], [3, 3, ["S"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Wafer path: golden lattice of 4px cells, crumbs and a few sugar grains.
// ════════════════════════════════════════════════════════════════════════════
function wafer(x: number, y: number) {
  const bx = x % 4, by = y % 4;
  if (bx === 3 && by === 3) return "d";
  if (bx === 3 || by === 3) return "c";
  if (bx === 0 && by === 0) return "a";
  return "b";
}
export const WAFER = defineTerrain({
  id: "wafer",
  level: 1.5,
  pal: { a: "#fff0b8", b: "#f0cc78", c: "#d4a454", d: "#b07c38", e: "#c08840", w: "#ffffff", k: "#6c4024" },
  shade: ["#b88a48"],
  lip: { fill: "#f0cc78", outline: "#8c5c28" },
  variants: [
    { weight: 6, rows: tile(wafer) },
    { weight: 2, rows: tile(wafer, [[5, 6, ["ee", "e."]], [12, 1, ["e"]], [2, 13, ["w"]]]) },
    { weight: 2, rows: tile(wafer, [[9, 9, ["w"]], [2, 2, ["e"]], [13, 13, ["ee"]]]) },
    { weight: 1, rows: tile(wafer, [[6, 9, [".k", "kk"]], [11, 3, ["w"]]]) },
  ],
});

// ════════════════════════════════════════════════════════════════════════════
// Mint sugar grass: crystals that sparkle, small tufts, jelly beans.
// ════════════════════════════════════════════════════════════════════════════
const MINT_PAL = {
  a: "#e0fff0", b: "#a8ecc8", c: "#80d8b0", d: "#58b890", w: "#ffffff",
  r: "#f85888", R: "#c02858", y: "#f8d838", Y: "#c89818",
  o: "#f89038", O: "#c06020", p: "#b878f0", P: "#8048c0",
};
export const MINT = defineTerrain({
  id: "mint",
  level: 2,
  pal: MINT_PAL,
  lip: { fill: "#a8ecc8", outline: "#3c9078", bumpy: true },
  variants: [
    { weight: 5, rows: tile("b") },
    { weight: 4, rows: tile("b", [
      [3, 2, ["a...a", "c...c", ".c.c."]],
      [10, 9, ["a...a", "c...c", ".c.c."]],
    ]) },
    { weight: 3, rows: tile("b", [
      [11, 2, ["a", "c"]],
      [2, 7, ["a...a", "c...c", ".c.c."]],
      [9, 13, ["w"]], [4, 13, ["a"]],
    ]) },
    { weight: 2, rows: tile("b", [[4, 4, [".w.", "waw", ".w."]], [12, 11, ["w"]], [9, 2, ["a"]]]) },
    { weight: 0.8, rows: tile("b", [
      [3, 3, ["rR"]], [11, 6, ["yY"]], [5, 11, ["pP"]], [12, 13, ["oO"]],
      [8, 9, ["c"]],
    ]) },
    { weight: 0.6, rows: tile("b", [
      [9, 3, ["rR"]], [3, 12, ["yY"]], [10, 11, ["w"]], [2, 5, ["a", "c"]],
    ]) },
  ],
});

// Shredded coconut: off-white with fine curls.
export const COCONUT = defineTerrain({
  id: "coconut",
  level: 2.2,
  pal: { a: "#ffffff", b: "#f4eee4", c: "#dcd2c4", d: "#bcae9c", s: "#f8b8d0" },
  lip: { fill: "#f4eee4", outline: "#9c8c78", bumpy: true },
  shade: ["#d8ccbc"],
  variants: [0, 1, 2, 3].map((v) => ({
    weight: v === 0 ? 3 : 2,
    rows: tile((x, y) => {
      const h = hash2(x, y, 31 + v) % 100;
      if (h < 9) return "c";
      if (h < 13) return "a";
      if (h < 15 && v === 3) return "s";
      if (h < 16) return "d";
      return "b";
    }),
  })),
});

// ════════════════════════════════════════════════════════════════════════════
// Cotton candy (tall grass equivalent): rows of fluffy puffs. Hides legs.
// ════════════════════════════════════════════════════════════════════════════
function puffRows(): string[] {
  // puffs on an 8px lattice, odd bands shifted 4px; lower puffs in front.
  const g: string[][] = Array.from({ length: 16 }, () => Array<string>(16).fill("d"));
  for (let band = -1; band < 3; band++) {
    const cy = band * 8 + 5;
    const off = band % 2 === 0 ? 0 : 4;
    for (let k = -1; k < 3; k++) {
      const cx = k * 8 + off + 4;
      for (let y = cy - 6; y <= cy + 4; y++) for (let x = cx - 6; x <= cx + 6; x++) {
        const nx = (x + 0.5 - cx) / 5, ny = (y + 0.5 - cy) / 4.6;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;
        const lit = -(nx * 0.55 + ny * 0.85);
        let s = lit > 0.45 && r2 < 0.6 ? "a" : lit > -0.2 ? "b" : lit > -0.65 ? "c" : "d";
        const xx = ((x % 16) + 16) % 16, yy = ((y % 16) + 16) % 16;
        // wrap horizontally (seamless); vertically only within the tile
        if (y >= 0 && y < 16) g[yy][xx] = s;
      }
    }
  }
  return g.map((r) => r.join(""));
}
const PUFF = puffRows();
export const COTTON = defineTerrain({
  id: "cotton",
  level: 3,
  pal: { a: "#fff4fa", b: "#fcc8e4", c: "#f09cc8", d: "#cc6ca4", ".": null },
  lip: { fill: "#fcc8e4", outline: "#a8487c", bumpy: true },
  shade: [],
  variants: [{ rows: PUFF }],
  cover: { rows: PUFF.map((r, i) => (i % 8 === 0 ? r.replace(/d/g, ".") : r)) },
});
export const COTTON_BLUE = defineTerrain({
  ...COTTON,
  id: "cotton-blue",
  group: "cotton",
  pal: { a: "#f4fcff", b: "#c4e4fc", c: "#94c4f0", d: "#6c98d4", ".": null },
  lip: { fill: "#c4e4fc", outline: "#4c70a8", bumpy: true },
});

// ════════════════════════════════════════════════════════════════════════════
// Milk river (animated, flows downwards) with a few cocoa swirls.
// ════════════════════════════════════════════════════════════════════════════
const CREST = [".abba.", "d....d", ".d..d."];
const MILK_BASE = tile("c", [
  [1, 1, CREST], [9, 5, CREST], [3, 10, CREST], [12, 13, [".ab", "d..", ".d."]], [0, 13, ["a.", ".d"]],
  [13, 0, ["e"]], [7, 8, ["ee"]], [14, 9, ["b"]], [10, 1, ["b"]],
]);
export const MILK = defineTerrain({
  id: "milk",
  level: 0,
  walkable: false,
  group: "water",
  pal: { a: "#ffffff", b: "#fbf8ff", c: "#e6dcf4", d: "#c4b2e2", e: "#d8cced" },
  shade: ["#a898cc", "#c8b8e2"],
  variants: [{ rows: MILK_BASE }],
  frames: [0, 4, 8, 12].map((dy) => [{ rows: shiftY(MILK_BASE, dy) }]),
  fps: 3,
});

// ════════════════════════════════════════════════════════════════════════════
// Red licorice bridge (planks run across a horizontal path).
// ════════════════════════════════════════════════════════════════════════════
const LICORICE_ROWS = tile((x, y) => {
  if (y === 0 || y === 15) return "k";
  if (y === 1) return "K";
  if (y === 14) return "k";
  if (y === 2 || y === 13) return "d";
  const px = x % 4;
  if (px === 3) return "d";
  // twisted rope: diagonal light/dark bands
  const t = (y + px * 2) % 4;
  if (px === 0) return t === 0 ? "a" : "b";
  if (px === 2) return t === 2 ? "b" : "c";
  return t === 1 ? "a" : "b";
});
export const LICORICE = defineTerrain({
  id: "licorice",
  level: 1.5,
  pal: { a: "#ff98a0", b: "#e83848", c: "#b82038", d: "#701828", k: "#2c2030", K: "#5c4c68" },
  lip: { fill: "#b82038", outline: "#3c1020" },
  variants: [{ rows: LICORICE_ROWS }],
});
