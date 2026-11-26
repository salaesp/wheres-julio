// Mundo 14 — El Museo de Dinosaurios: a natural-history museum hall with giant
// skeletons on stone plinths, red carpet routes, display cases, a meteorite,
// a dig pit for kids and the gift shop. Lots of kids wear coloured dino hoods
// (decoys), and a couple of green fake dinos are there to fool the player.
import { defineWorld, type PropPlace } from "../engine/world";
import { MARBLE, PARQUET, CARPET, WALL, WALL_LOW, PLINTH, PLINTH_FACE, DIG_SAND } from "../engine/terrains/museum";
import {
  TREX, BRACHIO, TRIKE, PTERO, PTERO_SHADOW, ROPE_48, ROPE_72, ROPE_96, STANCHION,
  PLAQUE_TREX, PLAQUE_BRACHIO, PLAQUE_TRIKE,
  CASE_FOSSILS, CASE_EGGS, CASE_AMBER, CASE_MINERALS, CASE_SKULL,
  PAINT_VOLCANO, PAINT_TREX, PAINT_CHART, BANNER, COLUMN,
  METEORITE, SIGN_FOSIL, SIGN_SPACE, BENCH, PLANT, DINO_STATUE,
  PLUSH_SHELF, PLUSH_PINK, PLUSH_BLUE, PLUSH_ORANGE, PLUSH_BIG_GREEN, PLUSH_BIN, COUNTER,
  PLINTH_ROCKS, PLINTH_PEBBLES, DIORAMA, BURIED_SKULL, BURIED_BONES, BRUSH, BUCKET, DIG_SIGN, FOOTPRINTS, DOORMAT, BIG_EGG, WET_FLOOR, PUDDLE, BROCHURE, BALLOON,
} from "../engine/propsLib/museum";

const props: PropPlace[] = [
  // ── back wall
  [PAINT_VOLCANO, 0.2, 0.25], [PAINT_TREX, 2.3, 0.25], [PAINT_CHART, 4.2, 0.25],
  [COLUMN, 8.55, -0.6], [BANNER, 9.85, 0.15], [COLUMN, 13.85, -0.6],

  // ── T-Rex hall (top-left)
  [PLINTH_ROCKS, 1.3, 5.3], [PLINTH_PEBBLES, 6.3, 6.1],
  [TREX, 1.0, 0.75],
  [PLAQUE_TREX, 3.6, 7.2],
  [ROPE_96, 0.9, 7.9], [ROPE_48, 7.0, 7.9],

  // ── right of the T-Rex: meteorite + cases
  [CASE_AMBER, 9.6, 2.35], [CASE_MINERALS, 12.4, 2.35],
  [METEORITE, 11.3, 4.75], [SIGN_SPACE, 13.0, 6.1],
  [CASE_SKULL, 8.15, 6.9],

  // ── dig pit (left) with the hanging pterodactyl
  [PTERO_SHADOW, 1.0, 15.3],
  [BURIED_SKULL, 1.5, 12.6], [BURIED_BONES, 3.7, 14.3], [BRUSH, 1.3, 14.9], [BUCKET, 4.4, 12.3],
  [DIG_SIGN, 0.1, 15.9],
  [PTERO, 0.6, 9.9],

  // ── brachiosaurus (right)
  [PLINTH_PEBBLES, 10.3, 12.9], [PLINTH_ROCKS, 12.2, 13.0],
  [BRACHIO, 8.85, 5.4],
  [PLAQUE_BRACHIO, 10.9, 14.25],
  [ROPE_72, 9.9, 14.95],
  [CASE_EGGS, 12.4, 15.6], [BIG_EGG, 9.6, 15.7],

  // ── central carpet details
  [FOOTPRINTS, 4.5, 11.4],
  [STANCHION, 6.3, 14.5],

  // ── triceratops (bottom-left)
  [PLINTH_ROCKS, 3.3, 21.0],
  [TRIKE, 0.55, 17.6],
  [PLAQUE_TRIKE, 1.6, 22.25],
  [ROPE_72, 0.9, 22.95],
  [SIGN_FOSIL, 5.5, 21.2],
  [CASE_FOSSILS, 0.2, 24.0], [BENCH, 2.55, 24.75], [DINO_STATUE, 5.0, 23.6],

  // ── gift shop (bottom-right)
  [DIORAMA, 9.6, 19.2],
  [PLUSH_SHELF, 12.6, 19.2], [COUNTER, 10.0, 22.2], [PLUSH_BIN, 12.8, 24.4],
  [PLUSH_PINK, 13.0, 22.0], [PLUSH_ORANGE, 14.0, 23.6],
  [PLUSH_BIG_GREEN, 10.9, 24.6], [PLUSH_BLUE, 9.95, 25.1],

  // ── misc
  [PLANT, 0.0, 10.2], [PLANT, 13.8, 17.8],
  [DOORMAT, 6.15, 24.9],
  [PUDDLE, 4.6, 17.1], [WET_FLOOR, 5.7, 15.95],
  [BROCHURE, 4.2, 9.5], [BROCHURE, 8.6, 21.6], [BROCHURE, 2.0, 3.1],
  [BALLOON, 9.25, 7.4],
];

export const worldModule = defineWorld({
  title: "El Museo de Dinosaurios",
  npcCount: 46,
  background: "#2c3440",
  legend: {
    ".": MARBLE, W: WALL, L: WALL_LOW, r: CARPET, P: PLINTH, F: PLINTH_FACE, s: DIG_SAND, q: PARQUET,
  },
  map: [
    "WWWWWWWWWWWWWWW",
    "LLLLLLLLLLLLLLL",
    "...............",
    "...............",
    ".PPPPPPP.......",
    ".PPPPPPP.......",
    ".PPPPPPP.......",
    ".FFFFFFF.......",
    "...............",
    "rrrrrrrrrrrrrrr",
    "rrrrrrrrrrrrrrr",
    ".......rr......",
    ".sssss.rr.PPPPP",
    ".sssss.rr.PPPPP",
    ".sssss.rr.FFFFF",
    ".sssss.rr......",
    ".......rr......",
    "rrrrrrrrrrrrrrr",
    "rrrrrrrrrrrrrrr",
    ".......rr......",
    ".PPPPP.rr......",
    ".PPPPP.rr.qqqqq",
    ".FFFFF.rr.qqqqq",
    ".......rr.qqqqq",
    ".......rr.qqqqq",
    ".......rr.qqqqq",
  ],
  props,
  outfit: {
    hats: { none: 5, dinohood: 2.5, cap: 1, beanie: 0.5, sunhat: 0.3, helmet: 0.3 },
    lowers: { pants: 5, shorts: 2, skirt: 2 },
  },
});
