// Mundo 9 — La Escuela: the school building, the patio with the flag, a
// basketball court and the back garden with the sandbox.
import { defineWorld, type PropPlace } from "../engine/world";
import { GRASS, TALL_GRASS, FLOWERBED } from "../engine/terrains/common";
import { PATIO, COURT } from "../engine/terrains/urban";
import { TREE, TREE_B, TREE_SMALL, BUSH, BUSH_FLOWER, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX, STUMP } from "../engine/propsLib/nature";
import { BENCH, BENCH_V, TRASH, SANDBOX, LAMP } from "../engine/propsLib/park";
import {
  SCHOOL, FLAGPOLE, HOOP, HOOP_BACK, courtLines, HOPSCOTCH, DRINKING_FOUNTAIN, BIKE_RACK, CHALKBOARD,
  BACKPACK_RED, BACKPACK_BLUE, BACKPACK_YELLOW, BACKPACK_PINK, BACKPACK_GREEN, BALL_SOCCER, BALL_BASKET,
  APPLE,
} from "../engine/propsLib/school";

const LINES = courtLines(11, 9);

const props: PropPlace[] = [
  // building + side trees
  [SCHOOL, 0.95, 0.05],
  [TREE_SMALL, -0.45, 0.2], [TREE_SMALL, 14.05, 0.6], [TREE_SMALL, -0.3, 3.3], [BUSH, 14.0, 4.2],

  // ── patio
  [FLAGPOLE, 6.75, 5.7],
  [HOPSCOTCH, 1.3, 6.4],
  [DRINKING_FOUNTAIN, 12.6, 5.75],
  [BIKE_RACK, 10.2, 9.5],
  [BENCH, 3.6, 10.15], [BENCH_V, 0.25, 8.0],
  [TRASH, 9.6, 6.15],
  [BACKPACK_RED, 5.2, 7.6], [BACKPACK_BLUE, 5.9, 7.75], [BACKPACK_YELLOW, 9.4, 8.6],
  [APPLE, 4.6, 8.3],

  // ── court
  [LINES, 2, 12],
  [HOOP, 6.55, 10.55], [HOOP_BACK, 6.55, 18.3],
  [BALL_BASKET, 9.3, 14.2], [BALL_SOCCER, 3.2, 19.1],
  [BACKPACK_PINK, 13.15, 13.0], [BACKPACK_GREEN, 0.6, 16.8],
  [BENCH_V, 13.3, 15.3], [BENCH_V, 0.55, 12.6],

  // ── garden
  [SANDBOX, 0.4, 21.3],
  [CHALKBOARD, 10.6, 21.2],
  [BENCH, 6.4, 23.6],
  [TREE, -0.8, 23.3], [TREE_B, 12.6, 23.6], [TREE_SMALL, 3.6, 23.0], [TREE_SMALL, 9.0, 23.8],
  [BUSH_FLOWER, 13.3, 21.0], [STUMP, 8.6, 21.5],
  [FLOWERS_RED, 3.1, 24.7], [FLOWERS_YELLOW, 7.6, 24.9], [FLOWERS_MIX, 3.4, 22.1],
  [BACKPACK_BLUE, 5.6, 24.9], [BALL_SOCCER, 9.9, 22.6],
  [LAMP, 13.9, 9.4], [LAMP, 0.2, 18.4],
];

export const worldModule = defineWorld({
  title: "La Escuela",
  npcCount: 46,
  background: "#305838",
  legend: { ".": GRASS, t: TALL_GRASS, f: FLOWERBED, p: PATIO, c: COURT },
  map: [
    ".ppppppppppppp.",
    ".ppppppppppppp.",
    ".ppppppppppppp.",
    ".ppppppppppppp.",
    ".ppppppppppppp.",
    "ppppppppppppppp",
    "ppppppppppppppp",
    "ppppppppppppppp",
    "ppppppppppppppp",
    "ppppppppppppppp",
    "ppppppppppppppp",
    ".ppppppppppppp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".pcccccccccccp.",
    ".ppppppppppppp.",
    ".....ff....ff..",
    "...............",
    "tt..........ttt",
    "ttt........tttt",
  ],
  props,
  outfit: {
    hats: { none: 9, cap: 1.5, beanie: 0.5 },
    lowers: { pants: 4, skirt: 3, shorts: 1.5 },
    // most kids wear the classic white "guardapolvo"
    tops: [
      "#f8f8f8", "#f8f8f8", "#f8f8f8", "#f8f8f8", "#f8f8f8", "#f8f8f8", "#f8f8f8",
      "#3868d8", "#e84848", "#f8c838", "#48b0a0", "#8858c8", "#f078a8",
    ],
    lowerColors: ["#304878", "#3a3a48", "#4060a8", "#686868", "#7a5038", "#a84040"],
  },
});
