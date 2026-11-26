// Mundo 6 — El Parque Acuático: a slide pool with two big slides, a free-form
// main pool with a diving board, a kids' splash zone, a hot tub and a tiki bar.
import { defineWorld, type PropPlace } from "../engine/world";
import { GRASS } from "../engine/terrains/common";
import { POOL_WATER, POOL_TILE, POOL_TILE_BLUE, BUBBLE_WATER } from "../engine/terrains/water";
import { BUSH, BUSH_FLOWER, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX } from "../engine/propsLib/nature";
import { TRASH } from "../engine/propsLib/park";
import {
  UMBRELLA_RED, UMBRELLA_BLUE, UMBRELLA_YELLOW, UMBRELLA_PINK,
  LOUNGER_BLUE, LOUNGER_RED, LOUNGER_YELLOW, LOUNGER_GREEN,
  TOWEL_RED, TOWEL_BLUE, TOWEL_GREEN, TOWEL_PURPLE, TOWEL_ORANGE,
  PALM, PALM_B, SHOWER, COOLER, BEACH_BALL,
} from "../engine/propsLib/beach";
import {
  SLIDE_YELLOW, SLIDE_RED, DIVING_BOARD, POOL_LADDER,
  RING_RED, RING_ORANGE, RING_PINK, RING_GREEN, DUCK_FLOAT, MATTRESS, MATTRESS_BLUE, FLOAT_BALL,
  MUSHROOM_FOUNTAIN, MUSHROOM_SPRAY, WATER_JET, LIFEGUARD_CHAIR, TIKI_BAR, STOOL, PATIO_TABLE, PLANTER, WET_SIGN,
} from "../engine/propsLib/aquapark";

const props: PropPlace[] = [
  // ── slide pool ──
  [SLIDE_YELLOW, 0, 0],
  [SLIDE_RED, 8.4, 0],
  [RING_PINK, 7.4, 2.4], [RING_GREEN, 9.9, 4.3], [FLOAT_BALL, 8.6, 3.5],
  [PLANTER, 5.6, 0.1], [PLANTER, 11.2, 0.4],

  // between pools
  [LOUNGER_BLUE, 0.4, 5.0], [LOUNGER_BLUE, 1.6, 5.0], [UMBRELLA_BLUE, 2.6, 4.3],
  [LOUNGER_RED, 12.3, 5.2], [LOUNGER_RED, 13.5, 5.2],
  [TOWEL_ORANGE, 4.4, 6.0], [TOWEL_PURPLE, 10.6, 6.1],
  [WET_SIGN, 9.2, 6.6],

  // ── main pool ──
  [DIVING_BOARD, 7.1, 7.15],
  [POOL_LADDER, 2.4, 7.55], [POOL_LADDER, 11.6, 7.55],
  [RING_RED, 3.6, 9.5], [RING_ORANGE, 11.2, 11.6], [DUCK_FLOAT, 5.4, 11.5],
  [MATTRESS, 9.2, 9.2], [MATTRESS_BLUE, 12.2, 9.0], [FLOAT_BALL, 7.4, 12.1], [RING_PINK, 2.6, 11.8],
  [LIFEGUARD_CHAIR, 13.95, 9.6],
  [PALM, -1.3, 4.9], [PALM_B, 12.9, 4.6],

  // below main pool
  [LOUNGER_YELLOW, 0.2, 13.4], [UMBRELLA_RED, 1.2, 13.0],
  [LOUNGER_GREEN, 12.6, 13.6], [LOUNGER_GREEN, 13.8, 13.6], [UMBRELLA_YELLOW, 11.2, 13.2],
  [TOWEL_RED, 5.0, 14.2], [TOWEL_BLUE, 8.4, 14.3], [COOLER, 6.2, 14.9],

  // ── kids' zone ──
  [MUSHROOM_FOUNTAIN, 5.6, 17.8], [MUSHROOM_SPRAY, 5.6, 17.8],
  [DUCK_FLOAT, 7.5, 19.6], [RING_GREEN, 5.2, 19.9], [FLOAT_BALL, 7.9, 18.3],
  [WATER_JET, 3.3, 16.2], [WATER_JET, 9.6, 16.5], [WATER_JET, 3.1, 21.1], [WATER_JET, 9.9, 21.0],
  [WATER_JET, 6.4, 22.0],
  [SHOWER, 0.3, 15.1], [SHOWER, 1.3, 15.1],
  [BEACH_BALL, 10.6, 18.2],

  // hot tub
  [PLANTER, 12.4, 17.6], [TOWEL_GREEN, 11.6, 19.6],

  // ── tiki bar & patio ──
  [TIKI_BAR, 10.7, 21.6],
  [STOOL, 11.3, 24.85], [STOOL, 12.4, 24.85], [STOOL, 13.5, 24.85],
  [UMBRELLA_PINK, 1.9, 21.6], [PATIO_TABLE, 2.4, 23.3], [STOOL, 1.7, 23.9], [STOOL, 4.0, 23.9],
  [UMBRELLA_BLUE, 6.4, 22.9], [PATIO_TABLE, 6.9, 24.6],
  [TRASH, 9.6, 23.9], [TRASH, 4.4, 6.9],

  // ── greenery ──
  [PALM, -1.2, 21.7], [BUSH_FLOWER, 13.9, 15.4], [BUSH, 0, 16.6],
  [FLOWERS_RED, 0.2, 7.2], [FLOWERS_YELLOW, 13.8, 7.4], [FLOWERS_MIX, 0.1, 24.5],
];

export const worldModule = defineWorld({
  title: "El Parque Acuático",
  npcCount: 46,
  background: "#2878b8",
  legend: { ".": POOL_TILE, w: POOL_WATER, B: POOL_TILE_BLUE, j: BUBBLE_WATER, g: GRASS },
  map: [
    "...............",
    "...............",
    ".....wwwwwww...",
    ".....wwwwwww...",
    ".....wwwwwww...",
    "......wwwww....",
    "...............",
    "gg...........gg",
    "g.wwwwwwwwwww.g",
    "..wwwwwwwwwwww.",
    "..wwwwwwwwwwww.",
    "..wwwwwwwwwwww.",
    "..wwwwwwwwwwww.",
    "...wwwwwwwww...",
    "...............",
    "...............",
    "gg..BBBBBBB..gg",
    "g..BBBBBBBBB..g",
    "...BBBwwwBBB...",
    "...BBwwwwwBB.jj",
    "...BBBwwwBBB.jj",
    "g..BBBBBBBBB...",
    "gg..BBBBBBB....",
    "g..............",
    "gg.............",
    "ggg............",
  ],
  props,
  outfit: {
    hats: { none: 7, cap: 1.5, sunhat: 1.5 },
    lowers: { shorts: 8, skirt: 2, pants: 0.3 },
    tops: [
      "#f85858", "#f89838", "#f8d838", "#58c8f8", "#3878e8", "#f878b8", "#ffffff",
      "#48c8a8", "#a8e058", "#68e0e8", "#f86890", "#b888f0", "#40d0c0",
    ],
    lowerColors: ["#3870d8", "#f05858", "#48b8a0", "#f8c838", "#f878b8", "#304878", "#f08838", "#58c8f8"],
  },
});
