// Mundo 20 — El Circo: the big top with its red carpet, a striped ring with an
// elephant, a lion wagon, clowns and a clown car, a strongman, a cannon,
// popcorn & candy carts, tents and pennants on a sawdust-covered fairground.
import { defineWorld, type PropPlace } from "../engine/world";
import { GRASS } from "../engine/terrains/common";
import { SAWDUST, RED_CARPET, PLANKS } from "../engine/terrains/circus";
import {
  BIG_TOP, TENT_RED, TENT_BLUE, TENT_PURPLE, CIRCUS_RING, ELEPHANT, LION_WAGON, CLOWN_CAR,
  CLOWN_RAINBOW, CLOWN_BLUE, STRONGMAN, TICKET_BOOTH, POPCORN_CART, CANDY_CART, CANNON,
  PENNANT_POLE, CIRCUS_BALL, PEDESTAL, CIRCUS_CRATE,
} from "../engine/propsLib/circus";
import { BALLOONS, BALLOONS_B } from "../engine/propsLib/town";
import { TREE_B, BUSH_FLOWER, FLOWERS_MIX } from "../engine/propsLib/nature";

const props: PropPlace[] = [
  // ── fairground entrance ──
  [BIG_TOP, 4.7, 0.9],
  [TENT_RED, 0.1, 2.5], [TENT_BLUE, 12.0, 2.5],
  [PENNANT_POLE, 3.4, 4.2], [PENNANT_POLE, 11.0, 4.2],
  [TREE_B, -0.5, 0.0], [TREE_B, 13.6, 0.0], [BUSH_FLOWER, 3.0, 0.4], [BUSH_FLOWER, 11.6, 0.6],
  [FLOWERS_MIX, 7.2, 5.0],

  // ── side attractions ──
  [TICKET_BOOTH, 0.3, 7.6], [LION_WAGON, 12.2, 7.9],
  [BALLOONS, 3.0, 7.6], [BALLOONS_B, 11.2, 8.6],

  // ── the ring ──
  [CIRCUS_RING, 4.2, 10.6],
  [ELEPHANT, 5.2, 11.7], [PEDESTAL, 9.2, 14.2], [CIRCUS_BALL, 9.6, 12.9],
  [CLOWN_RAINBOW, 7.6, 13.6],
  [PENNANT_POLE, 0.1, 10.9], [PENNANT_POLE, 13.8, 12.3],

  // ── midway ──
  [POPCORN_CART, 0.8, 16.0], [CANDY_CART, 12.6, 16.2],
  [STRONGMAN, 3.6, 17.4], [CLOWN_CAR, 6.2, 17.9], [CANNON, 9.6, 17.0],
  [CLOWN_BLUE, 2.4, 13.2], [CLOWN_RAINBOW, 12.4, 14.0],
  [CIRCUS_CRATE, 5.4, 15.6], [CIRCUS_CRATE, 6.4, 15.9],
  [BALLOONS, 10.6, 19.6], [BALLOONS_B, 1.8, 19.2],
  [CLOWN_BLUE, 8.0, 20.0], [CLOWN_RAINBOW, 4.6, 20.2],

  // ── back lot ──
  [TENT_PURPLE, 10.2, 22.7], [TREE_B, -0.6, 22.6], [BUSH_FLOWER, 3.6, 23.6], [TREE_B, 6.4, 23.0],
  [FLOWERS_MIX, 9.0, 24.4], [BUSH_FLOWER, 13.4, 24.4], [CIRCUS_CRATE, 2.4, 22.0],
  [PENNANT_POLE, 7.2, 21.2],
];

export const worldModule = defineWorld({
  title: "El Circo",
  npcCount: 46,
  background: "#6a1c28",
  legend: { g: GRASS, s: SAWDUST, c: RED_CARPET, p: PLANKS },
  map: [
    "ggggggggggggggg",
    "ggggggggggggggg",
    "ggggggggggggggg",
    "ggggggggggggggg",
    "ggggggggggggggg",
    "gggggggcggggggg",
    "ssssssscsssssss",
    "ssssssscsssssss",
    "ssssssscsssssss",
    "ssssssscsssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "sssssssssssssss",
    "ppppppppppppppp",
    "ggggggggggggggg",
    "ggggggggggggggg",
    "ggggggggggggggg",
  ],
  props,
  outfit: {
    hats: { party: 4, none: 3, cap: 1, bandana: 1, beanie: 0.5 },
    lowers: { pants: 3, shorts: 2, skirt: 2 },
    tops: [
      "#f05050", "#48a0f0", "#f8d848", "#e060c0", "#f08030", "#8858c8",
      "#f8f8f8", "#38b0c8", "#ff7088", "#fff088", "#6c80ff", "#d03860",
    ],
    lowerColors: ["#f8d848", "#48a0f0", "#e060c0", "#f05050", "#8858c8", "#f8f8f8"],
  },
});
