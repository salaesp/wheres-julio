// Shared outdoor terrains (grass, paths, water, sand…), Hoenn/Kanto inspired.
import { defineTerrain } from "../terrain";

// ── Grass ────────────────────────────────────────────────────────────────────
const GRASS_PAL = {
  a: "#b0e880", // highlight
  b: "#88d060", // base
  c: "#70b850", // mid
  d: "#509838", // dark
  r: "#f05050", R: "#b02838", // red flower
  y: "#f8e060", Y: "#c89828", // yellow flower
  w: "#ffffff", W: "#c8c8d8", // white flower
};

export const GRASS = defineTerrain({
  id: "grass",
  level: 2,
  pal: GRASS_PAL,
  lip: { fill: "#88d060", outline: "#3c7830", bumpy: true },
  variants: [
    { weight: 5, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
    { weight: 4, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbabbbabbbbbbbb",
      "bbbcbbbcbbbbbbbb",
      "bbbbcbcbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbabbbab",
      "bbbbbbbbbbcbbbcb",
      "bbbbbbbbbbbcbcbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
    { weight: 3, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbabbb",
      "bbbbbbbbbbbbcbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbabbbabbbbbbbbb",
      "bbcbbbcbbbbbbbbb",
      "bbbcbcbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbabbbbbb",
      "bbbbbbbbbcbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
    { weight: 0.6, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbwbbbbbbbbbbbb",
      "bbwywbbbbbbbbbbb",
      "bbbwbbbbbbbbbbbb",
      "bbbcbbbbbbrbbbbb",
      "bbbbbbbbbrRrbbbb",
      "bbbbbbbbbbrbbbbb",
      "bbbbbbbbbbcbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbrbbbbbbbbbbb",
      "bbbrRrbbbbbbwbbb",
      "bbbbrbbbbbbwywbb",
      "bbbbcbbbbbbbwbbb",
      "bbbbbbbbbbbbcbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
  ],
});

// Darker, lusher grass (jungle / forest floor).
export const GRASS_DARK = defineTerrain({
  id: "grass-dark",
  level: 2,
  group: "grass",
  pal: { a: "#88c860", b: "#60a848", c: "#4c9038", d: "#3a7830" },
  lip: { fill: "#60a848", outline: "#2a5c24", bumpy: true },
  variants: GRASS.variants.slice(0, 3),
});

// ── Tall grass (wild-encounter grass). Characters standing on it get their
// legs hidden by the `cover` overlay — a great hiding spot. ─────────────────
const TALL_ROWS = [
  "dadddadddadddadd",
  "abadabadabadabad",
  "bbbabbbabbbabbba",
  "bcbbbcbbbcbbbcbb",
  "cccbcccbcccbcccb",
  "dcdcdcdcdcdcdcdc",
  "dddddddddddddddd",
  "cdddcdddcdddcddd",
  "dddadddadddaddda",
  "adabadabadabadab",
  "babbbabbbabbbabb",
  "bbbcbbbcbbbcbbbc",
  "cbcccbcccbcccbcc",
  "dcdcdcdcdcdcdcdc",
  "dddddddddddddddd",
  "ddcdddcdddcdddcd",
];
export const TALL_GRASS = defineTerrain({
  id: "tall-grass",
  level: 3,
  pal: { a: "#98e070", b: "#60b448", c: "#3c8c34", d: "#2a6a2c", ".": null },
  lip: { fill: "#60b448", outline: "#245c24", bumpy: true },
  shade: [],
  variants: [{ rows: TALL_ROWS }],
  cover: { rows: TALL_ROWS.map((r, i) => (i % 8 === 0 ? r.replace(/d/g, ".") : r))  },
});

// ── Dirt path ────────────────────────────────────────────────────────────────
export const PATH = defineTerrain({
  id: "path",
  level: 1,
  pal: { a: "#f8e8b8", b: "#e8d098", c: "#d0b478", d: "#b89860" },
  shade: ["#c8a870"],
  lip: { fill: "#e8d098", outline: "#a88850" },
  variants: [
    { weight: 4, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
    { weight: 3, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbacbbbbbbbbbb",
      "bbbbccbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbabbb",
      "bbbbbbbbbbbbcbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbabbbbbbbbbbbbb",
      "bbcbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
    { weight: 2, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbabbbb",
      "bbbbbbbbbbacdbbb",
      "bbbbbbbbbbbddbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbcbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbcbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbcbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
  ],
});

// ── Stone paving (town plaza) ────────────────────────────────────────────────
export const STONE = defineTerrain({
  id: "stone",
  level: 1,
  pal: { a: "#f0ece0", b: "#d8d4c8", c: "#b8b4a8", d: "#98948c" },
  shade: ["#a8a498"],
  lip: { fill: "#d8d4c8", outline: "#88847c" },
  variants: [
    { rows: [
      "abbbbbbcabbbbbbc",
      "bbbbbbbcbbbbbbbc",
      "bbbbbbbcbbbbbbbc",
      "bbbbbbbcbbbbbbbc",
      "bbbbbbbcbbbbbbbc",
      "bbbbbbbcbbbbbbbc",
      "bbbbbbbcbbbbbbbc",
      "ccccccccdccccccc",
      "bbbcabbbbbbcabbb",
      "bbbcbbbbbbbcbbbb",
      "bbbcbbbbbbbcbbbb",
      "bbbcbbbbbbbcbbbb",
      "bbbcbbbbbbbcbbbb",
      "bbbcbbbbbbbcbbbb",
      "bbbcbbbbbbbcbbbb",
      "cccdccccccccdccc",
    ] },
  ],
});

// ── Sand ─────────────────────────────────────────────────────────────────────
export const SAND = defineTerrain({
  id: "sand",
  level: 1,
  pal: { a: "#fff8d8", b: "#f8e8b0", c: "#e8d090", d: "#d0b070", s: "#f0a0a0", S: "#c87070" },
  shade: ["#e0c888"],
  lip: { fill: "#f8e8b0", outline: "#c0a060", bumpy: true },
  variants: [
    { weight: 4, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbcbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbcbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbcbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
    { weight: 3, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbacbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbacbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbacbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
    { weight: 0.5, rows: [
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbsbbbbbbbb",
      "bbbbbbsSsbbbbbbb",
      "bbbbbsSsSsbbbbbb",
      "bbbbbbccccbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
      "bbbbbbbbbbbbbbbb",
    ] },
  ],
});

// ── Water (animated). Lowest level: everything overhangs onto it, and it adds
// a light foam line along the shore. ───────────────────────────────────────
const WATER_PAL = { a: "#e0f0ff", b: "#88b8f8", c: "#6898f0", d: "#5080e0" };
const W0 = [
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
const shiftRows = (rows: string[], dx: number) =>
  rows.map((r) => r.slice(-dx) + r.slice(0, r.length - dx));
const W1 = shiftRows(W0, 2);
const W2 = shiftRows(W0, 4).map((r, i) => (i === 3 ? r.replace("bb", "ab") : r));
const W3 = shiftRows(W0, 2);

export const WATER = defineTerrain({
  id: "water",
  level: 0,
  walkable: false,
  pal: WATER_PAL,
  shade: ["#d8ecff", "#a8ccf8"],
  variants: [{ rows: W0 }],
  frames: [[{ rows: W0 }], [{ rows: W1 }], [{ rows: W2 }], [{ rows: W3 }]],
  fps: 2,
});

// Deep sea: darker blue, still animated.
const SEA_PAL = { a: "#c8e0ff", b: "#6890e8", c: "#4870d0", d: "#3858b8" };
export const SEA = defineTerrain({
  id: "sea",
  level: 0,
  walkable: false,
  group: "water",
  pal: SEA_PAL,
  shade: ["#c8e0ff", "#88a8f0"],
  variants: [{ rows: W0 }],
  frames: [[{ rows: W0 }], [{ rows: W1 }], [{ rows: W2 }], [{ rows: W3 }]],
  fps: 1.5,
});

// ── Flowerbed (dense flowers, not walkable) ──────────────────────────────────
export const FLOWERBED = defineTerrain({
  id: "flowerbed",
  level: 3,
  walkable: false,
  pal: { ...GRASS_PAL, g: "#3c7830", e: "#589838" },
  lip: { fill: "#589838", outline: "#2c5c28" },
  variants: [
    { rows: [
      "eeeeeeeeeeeeeeee",
      "erRreeewyweeeeee",
      "erRreeeWwWeeryre",
      "eegeeeeeeeeeyYye",
      "eeeeyeeeerreegee",
      "eeeyYyeerRRreeee",
      "eeeegeeeegeeewee",
      "ewyweeeeeeeewyWe",
      "eWwWeerreeeeeWee",
      "eeeeerRRreeeeeee",
      "eeeyeeggeeewyeee",
      "eeyYyeeeeeeWwWee",
      "eeegeeewyweeeeee",
      "erreeeeWwWeerrRe",
      "eRRreeeeeeeeRrge",
      "eeeeeeeeeeeeeeee",
    ] },
  ],
});
