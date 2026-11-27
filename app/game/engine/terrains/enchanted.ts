// Terrains for El Bosque Encantado.
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
// ENCHANTED NIGHT FOREST
// ════════════════════════════════════════════════════════════════════════════

const NG_PAL = {
  a: "#4a9a82", b: "#2e6e5e", c: "#25594c", d: "#1b4339",
  p: "#f8a0e8", y: "#f8f090", u: "#8ad8f8", w: "#e8f0ff",
  m: "#e85878", M: "#a8384e", s: "#e8d8c0",
};
const ngBase = (seed: number, dens = 6) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < dens ? "c" : h > 96 ? "a" : "b";
};
export const NIGHT_GRASS = defineTerrain({
  id: "night-grass",
  level: 2,
  group: "night-grass",
  pal: NG_PAL,
  lip: { fill: "#2e6e5e", outline: "#0e2a26", bumpy: true },
  shade: ["#1b4339"],
  variants: [
    { weight: 5, rows: tile(ngBase(31)) },
    { weight: 4, rows: tile(ngBase(32, 3), [[3, 3, ["a.a", ".c."]], [10, 10, ["a.a", ".c."]]]) },
    { weight: 3, rows: tile(ngBase(33), [[9, 4, ["a.a.a", ".c.c."]]]) },
    { weight: 1, rows: tile(ngBase(34, 3), [[4, 5, [".p.", "pyp", ".p."]], [11, 11, ["u"]]]) },
    { weight: 1, rows: tile(ngBase(35, 3), [[10, 4, [".u.", "uwu", ".u."]], [3, 11, ["p"]]]) },
    { weight: 0.7, rows: tile(ngBase(36), [[5, 7, [".mmm.", "mMmMm", "..s..", "..s.."]]]) },
  ],
});

const TRAIL = (seed: number) => (x: number, y: number) => {
  const h = hash2(x, y, seed) % 100;
  return h < 8 ? "c" : h > 94 ? "a" : "b";
};
export const NIGHT_TRAIL = defineTerrain({
  id: "night-trail",
  level: 1,
  pal: { a: "#c0d0f8", b: "#8a9ed0", c: "#6a7eb4", d: "#4c5e94", u: "#a8f0ff" },
  lip: { fill: "#8a9ed0", outline: "#2a3866", bumpy: true },
  shade: ["#3a4a80"],
  variants: [
    { weight: 5, rows: tile(TRAIL(41)) },
    { weight: 3, rows: tile(TRAIL(42), [[3, 4, ["cc", "dc"]], [10, 9, ["cc.", "dcc"]]]) },
    { weight: 1, rows: tile(TRAIL(43), [[6, 7, ["u"]], [11, 3, ["u"]], [2, 12, ["u"]]]) },
  ],
});

// Ferns: tall, hides legs (hiding spot).
const FERN_UNIT = [
  "dbbadbba",
  "cbabcbab",
  "dcbbdcbb",
  "ddcbddcb",
  "cdcdcdcd",
  "dddcdddc",
  "cdddcddd",
  "dddddddd",
];
const FERN_ROWS = Array.from({ length: 16 }, (_, y) => {
  const u = FERN_UNIT[y % 8];
  const off = y < 8 ? 0 : 3;
  let r = "";
  for (let x = 0; x < 16; x++) r += u[(x + off) % 8];
  return r;
});
export const FERN = defineTerrain({
  id: "fern",
  level: 3,
  group: "night-grass",
  pal: { a: "#6ac0a0", b: "#3c8c78", c: "#2a6a5a", d: "#1c4a40" },
  lip: { fill: "#3c8c78", outline: "#0e2a26", bumpy: true },
  shade: [],
  variants: [{ rows: FERN_ROWS }],
  cover: { rows: FERN_ROWS.map((r, i) => (i % 8 === 0 ? r.replace(/d/g, ".") : r)) },
});

const PO_PAL = { a: "#6a8cf0", b: "#3c58c0", c: "#2c40a0", d: "#203080", w: "#e8f0ff", u: "#a8d0ff" };
const POND0 = tile((x, y) => {
  const h = hash2(x, y, 51) % 100;
  return (y + (x >> 2)) % 6 === 0 ? (h < 40 ? "a" : "b") : h < 6 ? "c" : "b";
}, [[3, 5, ["ww", ".u"]], [10, 11, ["w."]]]);
const POND1 = shiftX(POND0, 3).map((r, i) => (i === 7 ? r.replace("bb", "uw") : r));
const POND2 = shiftX(POND0, 6);
export const NIGHT_POND = defineTerrain({
  id: "night-pond",
  level: 0,
  walkable: false,
  noJulio: true,
  pal: PO_PAL,
  shade: ["#8aa8ff", "#4a68d0"],
  variants: [{ rows: POND0 }],
  frames: [[{ rows: POND0 }], [{ rows: POND1 }], [{ rows: POND2 }], [{ rows: POND1 }]],
  fps: 1.5,
});

