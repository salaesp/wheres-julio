// Mundo 3 — La Granja: red barn, farmhouse, corral, pig pen, crop fields,
// wheat, pond and a windmill.
import { defineWorld, type PropPlace } from "../engine/world";
import { GRASS, TALL_GRASS, WATER } from "../engine/terrains/common";
import { FIELD, WHEAT, MUD, DIRT } from "../engine/terrains/nature2";
import { TREE, TREE_B, TREE_SMALL, BUSH, BUSH_FLOWER, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX, ROCK } from "../engine/propsLib/nature";
import { LILYPAD, DUCK, SIGN } from "../engine/propsLib/park";
import {
  BARN, FARMHOUSE, SILO, WINDMILL, COOP, WELL,
  FENCE_H, FENCE_V, FENCE_POST,
  COW, COW_R, SHEEP, SHEEP_R, PIG, PIG_R, CHICKEN, CHICKEN_R, CHICK,
  CABBAGE, CARROTS, PUMPKIN, CORN, SUNFLOWER, SCARECROW,
  HAY_ROUND, HAY_SQUARE, HAY_STACK, TROUGH, MILK_CANS, WHEELBARROW, TRACTOR, REEDS, MAILBOX,
} from "../engine/propsLib/farm";

const fenceRun = (x0: number, x1: number, y: number): PropPlace[] => {
  const out: PropPlace[] = [];
  for (let x = x0; x < x1; x++) out.push([FENCE_H, x, y]);
  out.push([FENCE_POST, x1, y]);
  return out;
};
const fenceCol = (x: number, y0: number, n: number, skip: number[] = []): PropPlace[] => {
  const out: PropPlace[] = [];
  for (let i = 0; i < n; i++) if (!skip.includes(i)) out.push([FENCE_V, x, y0 + i]);
  return out;
};

const props: PropPlace[] = [
  // ── farmstead ──
  [FARMHOUSE, 0.2, 0.1],
  [SILO, 9.0, 0.0],
  [BARN, 10.6, -0.4],
  [MAILBOX, 4.0, 3.5],
  [COOP, 5.0, 1.1],
  [WELL, 7.3, 2.4],
  [CHICKEN, 4.6, 3.6], [CHICKEN_R, 6.1, 3.9], [CHICK, 5.3, 4.1], [CHICK, 5.7, 3.85], [CHICKEN, 8.1, 4.3],
  [HAY_STACK, 12.4, 5.8], [HAY_ROUND, 9.7, 5.9], [MILK_CANS, 14.1, 4.4],
  [WHEELBARROW, 8.3, 6.4],

  // ── corral (cows + sheep) ──
  ...fenceRun(0, 5, 6.6),
  ...fenceCol(5.05, 7.4, 5, [2]),
  ...fenceRun(0, 5, 12.2),
  [COW, 0.6, 7.7], [COW_R, 2.9, 9.4], [SHEEP, 0.5, 10.4], [SHEEP_R, 2.6, 10.9], [SHEEP, 3.4, 7.9],
  [TROUGH, 1.4, 11.3],

  // ── pig pen ──
  ...fenceRun(0, 4, 13.35),
  ...fenceCol(4.05, 14.15, 3),
  ...fenceRun(0, 4, 16.75),
  [PIG, 0.4, 14.3], [PIG_R, 2.4, 15.0], [PIG, 0.9, 15.8],

  // ── crop field ──
  [CABBAGE, 9.3, 7.2], [CABBAGE, 10.4, 7.2], [CABBAGE, 11.5, 7.2],
  [CARROTS, 9.2, 8.7], [CARROTS, 12.6, 8.7], [CARROTS, 12.4, 9.9], [CABBAGE, 9.6, 9.6],
  [SCARECROW, 11.3, 8.6],
  [PUMPKIN, 9.4, 10.6], [PUMPKIN, 10.8, 10.75], [PUMPKIN, 13.2, 10.6],
  [CABBAGE, 12.0, 11.7], [CABBAGE, 13.6, 11.7], [CARROTS, 9.3, 11.9],
  [CORN, 14.3, 12.2], [CORN, 13.6, 12.5], [SUNFLOWER, 8.4, 12.2], [SUNFLOWER, 12.6, 12.6],
  [TRACTOR, 9.8, 13.3],
  [HAY_SQUARE, 13.4, 14.1],

  // ── wheat field ──
  [SIGN, 8.3, 14.0],
  [SUNFLOWER, 8.5, 16.8], [SUNFLOWER, 8.5, 18.6],

  // ── pond ──
  [LILYPAD, 0.4, 20.2], [LILYPAD, 2.3, 21.3], [DUCK, 1.2, 20.6], [DUCK, 0.3, 19.3],
  [REEDS, 2.2, 18.5], [REEDS, 3.3, 22.0], [ROCK, 4.1, 21.0],

  // ── windmill & countryside ──
  [WINDMILL, 11.5, 19.6],
  [HAY_ROUND, 9.4, 21.4], [HAY_ROUND, 10.3, 22.3],
  [TREE, -0.7, 22.6], [TREE_SMALL, 2.6, 23.3], [TREE_B, 13.0, 23.6], [TREE_SMALL, 9.0, 24.1],
  [BUSH, 4.3, 17.8], [BUSH_FLOWER, 0.2, 17.6], [BUSH, 13.9, 15.5],
  [FLOWERS_RED, 8.6, 1.0], [FLOWERS_YELLOW, 4.4, 5.6], [FLOWERS_MIX, 3.6, 17.2],
  [FLOWERS_RED, 5.0, 19.6], [FLOWERS_YELLOW, 5.0, 22.5], [FLOWERS_MIX, 8.1, 23.0],
];

export const worldModule = defineWorld({
  title: "La Granja",
  npcCount: 46,
  background: "#3c6c30",
  legend: { ".": GRASS, t: TALL_GRASS, p: DIRT, f: FIELD, h: WHEAT, m: MUD, w: WATER },
  map: [
    "...............",
    "...............",
    "...............",
    "...............",
    "..ppp......ppp.",
    "ppppppppppppppp",
    "......pp.......",
    "......pp.ffffff",
    "......pp.ffffff",
    "......pp.ffffff",
    "......pp.ffffff",
    "......pp.ffffff",
    "......pp.ffffff",
    "......pp.......",
    "mmmm..pp.......",
    "mmmm..pppppppp.",
    "mmmm..pp.hhhhhh",
    "......pp.hhhhhh",
    "......pp.hhhhhh",
    "ww....pp.hhhhhh",
    "www...pp.hhhhhh",
    "wwww..pp.......",
    "www...pp.......",
    "......pp.......",
    "tt....pp...tt..",
    "ttt...pp..ttt..",
  ],
  props,
  outfit: {
    hats: { none: 3, sunhat: 3, cap: 2.2, bandana: 1 },
    lowers: { pants: 5, shorts: 1.5, skirt: 1.5 },
    tops: [
      "#e84848", "#c83838", "#3868d8", "#58b8f0", "#f8c838", "#f08030", "#68c868",
      "#f8f8f8", "#a05030", "#8858c8", "#f078a8", "#48b0a0", "#d8a050",
    ],
    lowerColors: ["#4060a8", "#304878", "#5878c0", "#7a5038", "#c8b080", "#3a3a48"],
  },
});
