// Mundo 5 — La Jungla: a waterfall feeds a winding river crossed by two
// wooden bridges; a mossy stepped temple, giant trees with lianas, palms,
// tropical flowers, monkeys, parrots and lots of tall grass to hide in.
import { defineWorld, type PropPlace } from "../engine/world";
import { JUNGLE_GRASS, JUNGLE_TALL, RIVER, JUNGLE_PATH, RUIN_FLOOR, BRIDGE } from "../engine/terrains/nature2";
import {
  JUNGLE_TREE, JUNGLE_TREE_B, CANOPY, PALM, PALM_L, FERN, BIG_LEAVES, RAFFLESIA, HIBISCUS,
  MOSSY_ROCK, MOSSY_ROCK_BIG, LOG, WATERFALL, MONKEY, MONKEY_R, MONKEY_HANG,
  PARROT, PARROT_R, PARROT_STAND, TEMPLE, RUIN_PILLAR, STONE_HEAD, RUBBLE, LIANAS, TOTEM,
} from "../engine/propsLib/jungle";

const props: PropPlace[] = [
  // ── waterfall & northern canopy ──
  [WATERFALL, 4.85, -0.3],
  [JUNGLE_TREE, -1.2, -0.6],
  [JUNGLE_TREE_B, 10.6, -1.7],
  [PARROT, 0.4, 0.2], [PARROT_R, 12.6, -0.6],
  [MONKEY_HANG, 1.6, 1.2],
  [LIANAS, 3.0, -0.25],
  [MOSSY_ROCK, 4.6, 2.3], [MOSSY_ROCK, 9.8, 2.6],

  // ── temple ──
  [TEMPLE, 9.6, 3.9],
  [RUIN_PILLAR, 9.75, 7.7], [RUIN_PILLAR, 14.05, 8.4],
  [STONE_HEAD, 8.0, 5.0],
  [TOTEM, 12.4, 9.9],
  [RUBBLE, 10.6, 10.2],
  [PARROT_STAND, 8.6, 9.0],
  [FERN, 8.6, 3.3], [BIG_LEAVES, 7.4, 7.6],

  // ── west bank ──
  [JUNGLE_TREE_B, -1.5, 5.4],
  [HIBISCUS, 2.4, 3.6],
  [MONKEY, 2.0, 8.5],
  [RAFFLESIA, 0.4, 12.9], [FERN, 1.9, 14.2],
  [LOG, 0.1, 16.0],
  [MOSSY_ROCK_BIG, 2.2, 17.2],
  [PALM, -0.5, 18.3],
  [BIG_LEAVES, 3.6, 19.8],
  [MOSSY_ROCK, 5.0, 12.7],

  // ── east bank ──
  [PALM_L, 12.0, 11.0],
  [HIBISCUS, 8.4, 12.9], [FERN, 9.4, 14.6],
  [MONKEY_R, 13.2, 14.7],
  [RAFFLESIA, 9.3, 17.6],
  [PALM, 11.6, 16.9],
  [BIG_LEAVES, 13.3, 19.6],
  [MOSSY_ROCK, 9.1, 19.9], [MOSSY_ROCK_BIG, 5.6, 22.2],

  // ── southern jungle ──
  [JUNGLE_TREE, -1.3, 21.4],
  [JUNGLE_TREE_B, 11.0, 21.7],
  [PARROT, 12.1, 21.4], [MONKEY_HANG, 1.3, 22.6],
  [CANOPY, 4.4, 24.5],
  [HIBISCUS, 6.3, 19.9],
  [FERN, 10.2, 22.5], [RAFFLESIA, 1.5, 22.3],
];

export const worldModule = defineWorld({
  title: "La Jungla",
  npcCount: 46,
  background: "#1c4424",
  legend: { ".": JUNGLE_GRASS, t: JUNGLE_TALL, r: RIVER, p: JUNGLE_PATH, s: RUIN_FLOOR, b: BRIDGE },
  map: [
    "ttt...rrr...ttt",
    "tt....rrr....tt",
    "t.....rrrr.....",
    "..t...rrr......",
    ".tt...rr..sssss",
    ".tt..rrr..sssss",
    "..t..rr...sssss",
    "....rrr...sssss",
    "....rr....sssss",
    "...rrr....sssss",
    "tt.rr.....sssss",
    "pppbbppppppsss.",
    "tt.rr..p...tt..",
    "tt.rrr.p..tttt.",
    "t...rr.p..tttt.",
    "....rrrp...tt..",
    ".....rrpppppppp",
    "..tt.rrr.......",
    ".ttt..rr..ttt..",
    ".tt...rrr.ttt..",
    ".......rr......",
    "pppppppbbpppppp",
    "..tt...rrr..t..",
    ".ttt....rr.ttt.",
    "tttt....rr.tttt",
    "tttt....rr.tttt",
  ],
  props,
  outfit: {
    hats: { none: 3, sunhat: 2.5, bandana: 2, cap: 1.5 },
    lowers: { shorts: 4, pants: 3, skirt: 0.6 },
    tops: [
      "#d8c088", "#a0a060", "#e84848", "#f8c838", "#f08030", "#58b8f0",
      "#f8f8f8", "#8858c8", "#f078a8", "#48b0a0", "#c8a070", "#3868d8",
    ],
    lowerColors: ["#c8b080", "#7a5038", "#686848", "#4060a8", "#3a3a48", "#a08860"],
  },
});
