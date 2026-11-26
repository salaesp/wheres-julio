// Mundo 16 — El Zoológico: brick walks between fenced enclosures — giraffes and
// zebras on the savanna, elephants with a mud wallow and trough, lions lounging
// on their rock, hippos and flamingos in the pond, penguins on ice, a monkey
// cage with a climbing frame, pandas munching bamboo and a reptile house;
// entrance gate with ticket booth, carts, balloons, a map and a little train.
import { defineWorld, type PropPlace } from "../engine/world";
import type { PropDef } from "../engine/props";
import { GRASS, FLOWERBED, TALL_GRASS } from "../engine/terrains/common";
import { ARCTIC_SEA } from "../engine/terrains/nature2";
import {
  ZOO_PAVE, SAVANNA, YARD, WALLOW, LION_GROUND, POND, BANK, PEN_ICE, PEN_JUNGLE, PEN_GRASS,
} from "../engine/terrains/zoo";
import { TREE, TREE_B, TREE_SMALL, BUSH, BUSH_FLOWER, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX, ROCK } from "../engine/propsLib/nature";
import { BENCH, BENCH_V, LAMP, TRASH, DUCK, LILYPAD } from "../engine/propsLib/park";
import { PENGUIN, PENGUIN_L, PENGUIN_R, PENGUIN_CHICK, ICE_FLOE, ICE_FLOE_S } from "../engine/propsLib/polar";
import { MONKEY, MONKEY_R, MONKEY_HANG, PALM, FERN } from "../engine/propsLib/jungle";
import { BALLOONS, BALLOONS_B } from "../engine/propsLib/town";
import { HAY_ROUND, WHEELBARROW } from "../engine/propsLib/farm";
import {
  LOG_FENCE_H, LOG_FENCE_V, LOG_POST, RAIL_H, RAIL_V, RAIL_POST, WALL_H, WALL_V,
  MESH_H, MESH_V, MESH_POST, BAMBOO_FENCE_H,
  GIRAFFE, GIRAFFE_R, ZEBRA, ZEBRA_R, ACACIA, HAY_FEEDER,
  ELEPHANT, ELEPHANT_BABY_R, TROUGH_STONE,
  PRIDE_ROCK, LIONESS, LION_CUB,
  HIPPO_SWIM, HIPPO_SWIM_R, FLAMINGO, FLAMINGO_R, FLAMINGO_WADE,
  PANDA, PANDA_LIE, BAMBOO, CLIMB_FRAME, REPTILE_HOUSE,
  GATE_PILLAR_L, GATE_PILLAR_R, GATE_SIGN, TICKET_BOOTH, ICECREAM_CART, POPCORN_CART, ZOO_MAP,
  SIGN_LION, SIGN_GIRAFFE, SIGN_ELEPHANT, SIGN_PENGUIN, SIGN_MONKEY, SIGN_PANDA, SIGN_HIPPO,
  TRAIN_LOCO, TRAIN_WAGON, TRAIN_WAGON_Y, PEACOCK,
} from "../engine/propsLib/zoo";

/** Horizontal fence run of 16px pieces from x0 to x1 (tiles), closed by a post. */
const hRun = (piece: PropDef, post: PropDef | null, x0: number, x1: number, y: number): PropPlace[] => {
  const out: PropPlace[] = [];
  for (let x = x0; x < x1 - 0.01; x++) out.push([piece, x, y]);
  if (post) out.push([post, x1, y]);
  return out;
};
const vRun = (piece: PropDef, x: number, y0: number, n: number): PropPlace[] =>
  Array.from({ length: n }, (_, i) => [piece, x, y0 + i] as PropPlace);

const props: PropPlace[] = [
  // ── savanna (giraffes + zebras) ──
  [ACACIA, 2.0, -0.25],
  [HAY_FEEDER, 0.3, 0.2],
  [GIRAFFE, 1.0, 0.6], [GIRAFFE_R, 4.1, 1.2],
  [ZEBRA, 0.2, 2.75], [ZEBRA_R, 2.8, 2.85], [ZEBRA, 5.0, 2.5],
  [ROCK, 5.6, 0.4],
  ...hRun(LOG_FENCE_H, null, 0, 7, 4.05),
  ...vRun(LOG_FENCE_V, 6.65, -0.3, 5),
  [LOG_POST, 6.65, 4.05],

  // ── elephants (yard, wallow, trough) ──
  [ELEPHANT, 9.4, 0.2],
  [ELEPHANT_BABY_R, 12.6, 0.7],
  [TROUGH_STONE, 9.6, 2.9],
  [HAY_ROUND, 13.6, 2.7], [WHEELBARROW, 12.3, 3.1],
  ...hRun(LOG_FENCE_H, LOG_POST, 9, 14.65, 4.05),
  ...vRun(LOG_FENCE_V, 9.0, -0.3, 4),

  // ── walkway between the top pens ──
  [SIGN_GIRAFFE, 7.05, 0.2], [SIGN_ELEPHANT, 7.95, 2.6],
  [LAMP, 7.6, 0.1],

  // ── lions ──
  [PRIDE_ROCK, 0.1, 7.3],
  [LIONESS, 2.6, 10.1], [LION_CUB, 0.3, 10.4], [ROCK, 3.5, 8.6],
  ...hRun(WALL_H, null, 0, 5, 7.0),
  ...hRun(WALL_H, null, 0, 5, 11.25),
  ...vRun(WALL_V, 4.5, 7.0, 5),

  // ── hippo pond + flamingos ──
  [HIPPO_SWIM, 11.8, 9.0], [HIPPO_SWIM_R, 12.8, 10.15],
  [FLAMINGO, 10.2, 6.9], [FLAMINGO_R, 11.4, 7.0], [FLAMINGO, 12.6, 6.95],
  [FLAMINGO_WADE, 13.9, 7.6], [FLAMINGO_WADE, 10.8, 9.5],
  [LILYPAD, 12.4, 8.3], [DUCK, 11.5, 10.4],
  ...hRun(RAIL_H, null, 10, 15, 6.95),
  ...hRun(RAIL_H, null, 10, 15, 11.15),
  ...vRun(RAIL_V, 9.85, 7.0, 4),
  [RAIL_POST, 9.85, 11.15],

  // ── centre strips ──
  [SIGN_LION, 5.1, 7.2], [SIGN_HIPPO, 9.0, 7.3],
  [TREE_SMALL, 5.2, 9.3], [BENCH_V, 9.1, 9.1],
  [TRASH, 6.2, 11.3], [BUSH_FLOWER, 8.9, 11.0],

  // ── penguins ──
  [ICE_FLOE, 0.4, 15.4], [ICE_FLOE_S, 1.5, 17.2],
  [PENGUIN, 2.5, 14.5], [PENGUIN_L, 3.3, 15.4], [PENGUIN_R, 2.9, 16.7], [PENGUIN_CHICK, 3.7, 17.4],
  [PENGUIN, 0.9, 15.3], [PENGUIN_R, 3.6, 13.9],
  ...hRun(WALL_H, null, 0, 5, 14.0),
  ...hRun(WALL_H, null, 0, 5, 18.25),
  ...vRun(WALL_V, 4.5, 14.0, 5),

  // ── monkeys ──
  [PALM, 12.9, 13.6],
  [CLIMB_FRAME, 11.1, 14.5],
  [MONKEY, 11.6, 15.5], [MONKEY_R, 13.5, 16.9], [MONKEY_HANG, 13.4, 14.3], [MONKEY, 12.2, 17.0],
  [FERN, 14.1, 16.0],
  ...hRun(MESH_H, MESH_POST, 11, 14.8, 13.85),
  ...hRun(MESH_H, MESH_POST, 11, 14.8, 17.75),
  ...vRun(MESH_V, 10.8, 13.85, 5),

  [SIGN_PENGUIN, 5.0, 14.2], [SIGN_MONKEY, 9.6, 14.0],
  [TREE, 8.7, 15.0], [BUSH, 5.0, 17.4],

  // ── pandas ──
  [BAMBOO, -0.2, 18.45], [BAMBOO, 2.1, 18.6],
  [PANDA, 0.9, 20.0], [PANDA_LIE, 2.2, 19.95],
  ...hRun(BAMBOO_FENCE_H, null, 0, 4, 21.25),
  ...vRun(RAIL_V, 3.85, 19.1, 2),
  [SIGN_PANDA, 4.15, 20.0],

  // ── reptile house + lawn ──
  [REPTILE_HOUSE, 10.6, 19.05],
  [TREE_SMALL, 9.1, 19.6], [FLOWERS_RED, 9.4, 21.3],

  // ── entrance plaza ──
  [GATE_PILLAR_L, 4.85, 21.9], [GATE_PILLAR_R, 9.15, 21.9], [GATE_SIGN, 5.05, 22.9],
  [TICKET_BOOTH, 1.1, 22.7],
  [ICECREAM_CART, 11.5, 23.2], [BALLOONS, 13.4, 22.5],
  [POPCORN_CART, 3.5, 12.0],
  [ZOO_MAP, 12.75, 11.85],
  [TRAIN_LOCO, 9.6, 5.0], [TRAIN_WAGON, 12.0, 5.25], [TRAIN_WAGON_Y, 14.0, 5.25],
  [BALLOONS_B, 5.6, 18.6],
  [PEACOCK, 5.3, 15.6],
  [BENCH, 0.2, 12.2], [BENCH, 10.4, 12.2],
  [LAMP, 4.3, 5.0], [LAMP, 10.3, 12.0], [LAMP, 6.0, 19.2],
  [TRASH, 4.0, 23.2], [TRASH, 10.3, 21.4],
  [FLOWERS_YELLOW, 0.3, 24.5], [FLOWERS_MIX, 13.4, 24.4], [FLOWERS_RED, 2.3, 25.0],
];

export const worldModule = defineWorld({
  title: "El Zoológico",
  npcCount: 46,
  background: "#3c6c30",
  legend: {
    ".": GRASS, p: ZOO_PAVE, s: SAVANNA, y: YARD, m: WALLOW, l: LION_GROUND, w: POND, n: BANK,
    a: ARCTIC_SEA, i: PEN_ICE, j: PEN_JUNGLE, q: PEN_GRASS, f: FLOWERBED, t: TALL_GRASS,
  },
  map: [
    "sssssss..yyyyyy",
    "sssssss..yyyyyy",
    "sssssss..yymmyy",
    "sssssss..yymmmy",
    "sssssss..yyyyyy",
    "ppppppppppppppp",
    "ppppppppppppppp",
    "lllll..pp.nnnnn",
    "lllll..pp.nnwww",
    "lllll..pp.nwwww",
    "lllll..pp.nwwww",
    "lllll..pp.nnwww",
    "ppppppppppppppp",
    "ppppppppppppppp",
    "aaaii..pp..jjjj",
    "aaaai..pp..jjjj",
    "aaaii..pp..jjjj",
    "iiiii..pp..jjjj",
    "iiiii..pp..jjjj",
    "qqqq..ppppp....",
    "qqqq..ppp......",
    "qqqq..ppp......",
    "ppppppppppppppp",
    "ppppppppppppppp",
    "fff.pppppppp.ff",
    "fff.pppppppp.ff",
  ],
  props,
  outfit: {
    hats: { none: 3, cap: 2.5, sunhat: 2.5, helmet: 1.2, bandana: 0.5 },
    lowers: { shorts: 4, pants: 3, skirt: 1.5 },
    tops: [
      "#e84848", "#3868d8", "#58b8f0", "#f8c838", "#f08030", "#68c868", "#f8f8f8",
      "#8858c8", "#f078a8", "#48b0a0", "#d8c088", "#c83070", "#a0a060",
    ],
    lowerColors: ["#4060a8", "#304878", "#c8b080", "#7a5038", "#3a3a48", "#686848", "#a08860"],
  },
});
