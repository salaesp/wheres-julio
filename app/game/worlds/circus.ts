// Mundo 20 — El Circo: a fairground laid out like the zoo — an entrance gate
// with ticket booth at the bottom, brick streets crossing a red-white aisle
// runner, the big top (with its two small tents) at the head of the aisle, a
// raised sawdust ring fenced in red & white (elephant on a drum, juggler,
// big ball), a mesh lion cage, a boardwalk midway (cotton candy, popcorn,
// high striker, strongman), the fair train on its rails and a back lawn with
// a cage wagon, a human cannon and a purple tent.
import { defineWorld, type PropPlace } from "../engine/world";
import type { PropDef } from "../engine/props";
import { GRASS, FLOWERBED } from "../engine/terrains/common";
import { LION_GROUND } from "../engine/terrains/zoo";
import { CIRCUS_PAVE, RED_CARPET, RING_FLOOR, PLANKS, TRACK } from "../engine/terrains/circus";
import {
  BIG_TOP, TENT_RED, TENT_BLUE, TENT_PURPLE,
  CLOWN_BLUE, CLOWN_PINK, CLOWN_ORANGE, CLOWN_JUGGLER, STRONGMAN,
  LION_WAGON, HIGH_STRIKER, CANDY_STALL, CANNON,
  RING_FENCE_H, RING_FENCE_V, RING_POST, CAGE_H, CAGE_V, CAGE_POST,
  DRUM, BIG_BALL, SMALL_BALL, CIRCUS_ELEPHANT,
  GATE_L, GATE_R, GATE_SIGN, TICKET_BOOTH, POPCORN_CART,
  TRAIN_LOCO_C, TRAIN_WAGON_C,
  BUNTING, PENNANT_POLE, PENNANT_POLE_L, SIGN_LIONS, SIGN_RING, SIGN_TRAIN, POSTER,
  POPCORN_SPILL, CONFETTI, PROP_CRATE,
} from "../engine/propsLib/circus";
import { PRIDE_ROCK, LIONESS, LION_CUB } from "../engine/propsLib/zoo";
import { BALLOONS, BALLOONS_B } from "../engine/propsLib/town";
import { BENCH, LAMP, TRASH } from "../engine/propsLib/park";
import { TREE_B, TREE_SMALL, BUSH_FLOWER, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX, ROCK } from "../engine/propsLib/nature";
import { CRATE, BARREL } from "../engine/propsLib/pirate";
import { LOLLIPOP_SMALL, LOLLIPOP_SMALL_B } from "../engine/propsLib/candy";

/** Horizontal run of 16px fence pieces from x0 to x1 (tiles), closed by a post. */
const hRun = (piece: PropDef, post: PropDef | null, x0: number, x1: number, y: number): PropPlace[] => {
  const out: PropPlace[] = [];
  for (let x = x0; x < x1 - 0.01; x++) out.push([piece, x, y]);
  if (post) out.push([post, x1, y]);
  return out;
};
const vRun = (piece: PropDef, x: number, y0: number, n: number): PropPlace[] =>
  Array.from({ length: n }, (_, i) => [piece, x, y0 + i] as PropPlace);

const props: PropPlace[] = [
  // ── head of the aisle: big top with its two small tents ──
  [BIG_TOP, 3.94, 0.2],
  [TENT_RED, 0.1, 2.05], [TENT_BLUE, 11.65, 2.05],
  [PENNANT_POLE, 3.5, 2.35], [PENNANT_POLE_L, 10.7, 2.35],
  [TREE_B, -0.45, -0.3], [TREE_B, 13.4, -0.3],
  [BUSH_FLOWER, 3.0, 0.5], [BUSH_FLOWER, 11.9, 0.6],
  [FLOWERS_MIX, 0.4, 5.2], [FLOWERS_RED, 2.5, 5.3], [FLOWERS_YELLOW, 12.3, 5.2], [FLOWERS_MIX, 14.0, 5.3],
  [TREE_SMALL, 3.15, 4.3], [TREE_SMALL, 11.3, 4.3], [CRATE, 14.0, 4.6], [BARREL, 0.15, 4.3],

  // ── street one: bunting over the carpet, lamps, balloons ──
  [PENNANT_POLE_L, 4.7, 6.0], [PENNANT_POLE, 9.2, 6.0],
  [BUNTING, 6.1, 6.2],
  [SIGN_RING, 2.0, 6.55], [SIGN_LIONS, 11.2, 6.55],
  [BALLOONS_B, 0.2, 5.95], [BALLOONS, 13.3, 6.1],
  [TRASH, 3.9, 6.9], [TRASH, 10.4, 6.15],

  // ── the ring: red & white fence, drum with elephant, juggler, ball ──
  ...hRun(RING_FENCE_H, RING_POST, 0, 5.95, 8.0),
  ...hRun(RING_FENCE_H, null, 0, 2, 13.1),
  [RING_POST, 2.0, 13.1],
  ...hRun(RING_FENCE_H, RING_POST, 4, 5.95, 13.1),
  ...vRun(RING_FENCE_V, 0.0, 8.7, 4),
  ...vRun(RING_FENCE_V, 5.75, 8.7, 4),
  [DRUM, 1.4, 11.4],
  [CIRCUS_ELEPHANT, 1.15, 9.3],
  [CLOWN_JUGGLER, 4.3, 9.4],
  [BIG_BALL, 3.95, 11.3],
  [SMALL_BALL, 0.7, 12.0],
  [CLOWN_BLUE, 0.35, 9.0],

  // ── lion cage: red mesh around the pride rock ──
  ...hRun(CAGE_H, CAGE_POST, 9, 14.8, 7.85),
  ...hRun(CAGE_H, CAGE_POST, 9, 14.8, 12.75),
  ...vRun(CAGE_V, 8.8, 7.85, 6),
  [CAGE_V, 14.8, 7.85], [CAGE_V, 14.8, 8.85], [CAGE_V, 14.8, 9.85], [CAGE_V, 14.8, 10.85], [CAGE_V, 14.8, 11.85],
  [PRIDE_ROCK, 9.3, 8.6],
  [LIONESS, 12.5, 10.5], [LION_CUB, 9.7, 11.3],
  [ROCK, 13.4, 9.2],

  // ── aisle furniture ──
  [LAMP, 6.0, 8.6], [LAMP, 8.7, 8.6],
  [LAMP, 6.0, 15.9], [LAMP, 8.7, 15.9],
  [BENCH, 0.4, 14.2], [BENCH, 11.8, 14.2],
  [CLOWN_ORANGE, 10.0, 14.2],

  // ── boardwalk midway ──
  [CANDY_STALL, 0.0, 16.3],
  [POPCORN_CART, 3.0, 17.9],
  [HIGH_STRIKER, 4.55, 16.2],
  [LOLLIPOP_SMALL, 0.15, 19.0], [LOLLIPOP_SMALL_B, 1.0, 19.3],
  [STRONGMAN, 3.7, 19.6],
  [POSTER, 0.3, 20.1],
  [CRATE, 2.5, 21.0], [BARREL, 5.1, 20.8],
  [CLOWN_PINK, 2.0, 18.6],
  [POPCORN_SPILL, 3.2, 21.1], [CONFETTI, 1.9, 20.9],

  // ── the train and the back lawn ──
  [TRAIN_LOCO_C, 9.2, 15.95], [TRAIN_WAGON_C, 11.7, 16.3],
  [SIGN_TRAIN, 13.45, 17.9],
  [LION_WAGON, 9.1, 18.4],
  [CANNON, 12.3, 19.3],
  [PROP_CRATE, 12.1, 21.1], [SMALL_BALL, 14.3, 21.2],

  // ── street three ──
  [BALLOONS, 5.0, 22.0],
  [CLOWN_BLUE, 9.7, 22.6],

  // ── entrance gate ──
  [GATE_L, 4.25, 21.9], [GATE_R, 9.625, 21.9], [GATE_SIGN, 4.8, 22.9],
  [TICKET_BOOTH, 1.1, 22.7],
  [TENT_PURPLE, 11.5, 22.4],
  [LAMP, 3.5, 23.4], [LAMP, 11.0, 23.4],
  [TRASH, 3.9, 24.3], [TRASH, 5.2, 14.4],
  [FLOWERS_YELLOW, 0.3, 24.5], [FLOWERS_MIX, 2.0, 25.0], [TREE_SMALL, 10.4, 24.0],
];

export const worldModule = defineWorld({
  title: "El Circo",
  npcCount: 46,
  background: "#6a1c28",
  legend: { g: GRASS, p: CIRCUS_PAVE, c: RED_CARPET, r: RING_FLOOR, l: LION_GROUND, k: PLANKS, t: TRACK, f: FLOWERBED },
  map: [
    "ggggggggggggggg",
    "ggggggggggggggg",
    "ggggggggggggggg",
    "ggggggggggggggg",
    "ggggggggggggggg",
    "gggggggcggggggg",
    "pppppppcppppppp",
    "pppppppcppppppp",
    "rrrrrrpcpllllll",
    "rrrrrrpcpllllll",
    "rrrrrrpcpllllll",
    "rrrrrrpcpllllll",
    "rrrrrrpcpllllll",
    "rrrrrrpcpllllll",
    "pppppppcppppppp",
    "pppppppcppppppp",
    "kkkkkkpcppppppp",
    "kkkkkkpcptttttt",
    "kkkkkkpcpgggggg",
    "kkkkkkpcpgggggg",
    "kkkkkkpcpgggggg",
    "kkkkkkpcpgggggg",
    "pppppppcppppppp",
    "pppppppcppppppp",
    "fffgpppcpppgggg",
    "fffgpppcpppgggg",
  ],
  props,
  outfit: {
    hats: { party: 4, none: 3, cap: 1.2, bandana: 1, beanie: 0.5 },
    lowers: { pants: 3, shorts: 2, skirt: 2 },
    tops: [
      "#f05050", "#48a0f0", "#f8d848", "#e060c0", "#f08030", "#8858c8",
      "#f8f8f8", "#38b0c8", "#ff7088", "#fff088", "#6c80ff", "#d03860",
    ],
    lowerColors: ["#f8d848", "#48a0f0", "#e060c0", "#f05050", "#8858c8", "#f8f8f8"],
  },
});
