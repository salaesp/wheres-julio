// Mundo 15 — El Fondo del Mar: a turquoise seabed with light rays, a sunken
// ship and its treasure, coral reefs, swaying kelp, glowing trenches, fish,
// a turtle, an octopus and a yellow submarine. Everybody wears a diving mask.
import { defineWorld, type PropPlace } from "../engine/world";
import type { Terrain } from "../engine/terrain";
import { bakeSeabed, TRENCH, REEF_ROCK, SEA_GRASS, CORAL_BED } from "../engine/terrains/undersea";
import type { PropDef } from "../engine/props";
import {
  SHADOW_S, SHADOW_M, SHADOW_L, SHADOW_XL,
  BRAIN_CORAL_PINK, BRAIN_CORAL_GREEN, BRAIN_CORAL_YELLOW, FAN_CORAL_PURPLE, FAN_CORAL_RED,
  STAGHORN_ORANGE, STAGHORN_YELLOW, STAGHORN_BLUE, TUBE_SPONGE, TUBE_SPONGE_ORANGE,
  ANEMONE, ANEMONE_GREEN, KELP, KELP_B, REEF_STONE, REEF_STONE_BIG, URCHIN,
  STARFISH_RED, STARFISH_ORANGE, STARFISH_PURPLE, SHELL, CONCH, COINS, CHAIN,
  SHIPWRECK, SUNKEN_CHEST, ANCHOR_SUNK, AMPHORA, AMPHORA_BROKEN, DIVE_HELMET, GIANT_CLAM,
  FISH_YELLOW, FISH_BLUE, FISH_CLOWN, FISH_PINK, FISH_GREEN, FISH_SCHOOL, TURTLE, OCTOPUS,
  SEA_CRAB, SEA_CRAB_BLUE, JELLYFISH, JELLYFISH_BLUE, SEAHORSE, BUBBLES, BUBBLES_TALL, VENT, SUBMARINE,
} from "../engine/propsLib/undersea";

const OVERLAY = [
  "kkkk......rrrrr",
  "kkk.......rrrrr",
  "kk........rrrr.",
  "k..........rr..",
  "...............",
  "...............",
  "...............",
  "..............k",
  "cc...........kk",
  "ccc.......cc.kk",
  "xxx......cccc..",
  "xxxx.....cccc..",
  "xxxx......cc...",
  ".xx............",
  "...........kkkk",
  "...........kkkk",
  "kk..........kkk",
  "kkk............",
  "rrrr...........",
  "rrrrr....xxx...",
  "rrrr....xxxx...",
  "rrr......xx....",
  "...............",
  "............kkk",
  "kk..........kkk",
  "kkk........kkkk",
];
const FORCED: Record<string, Terrain> = { k: SEA_GRASS, r: REEF_ROCK, x: TRENCH, c: CORAL_BED };
const { map, legend } = bakeSeabed(OVERLAY, FORCED, 3);

/** A creature floating above the sand, with its shadow on the floor. */
const fl = (p: PropDef, x: number, y: number, sh: PropDef, dx: number, dy: number): PropPlace[] => [
  [sh, x + dx, y + dy], [p, x, y],
];
const fish = (p: PropDef, x: number, y: number) => fl(p, x, y, SHADOW_S, 0.2, 0.85);

const props: PropPlace[] = [
  // ── north: kelp forest, reef rocks, open sand ──
  [KELP, -0.3, -1.0], [KELP_B, 1.8, -1.7],
  [REEF_STONE_BIG, 11.0, 0.1], [FAN_CORAL_PURPLE, 13.3, 0.9], [URCHIN, 10.4, 2.7], [ANEMONE, 12.3, 2.4],
  [FISH_SCHOOL, 4.6, 0.2],
  [AMPHORA, 8.4, 0.9], [AMPHORA_BROKEN, 5.8, 2.6], [STARFISH_RED, 4.2, 2.2], [SHELL, 9.6, 3.0],
  ...fish(FISH_CLOWN, 2.6, 2.4),

  // ── sunken ship & treasure ──
  [SHIPWRECK, 2.4, 3.5],
  [SUNKEN_CHEST, 10.2, 5.6], [COINS, 10.1, 7.3], [DIVE_HELMET, 12.6, 4.4],
  [BUBBLES, 5.5, 2.4], [STARFISH_ORANGE, 12.9, 6.6],
  ...fish(FISH_YELLOW, 11.8, 7.5),

  // ── middle reef & trench ──
  [JELLYFISH, 1.4, 9.8], [BUBBLES_TALL, 2.5, 8.6],
  [BRAIN_CORAL_PINK, 4.6, 9.3], [STAGHORN_ORANGE, 6.8, 8.6],
  [FAN_CORAL_RED, 10.2, 7.9], [ANEMONE_GREEN, 9.0, 10.6], [TUBE_SPONGE, 13.2, 9.6],
  [STAGHORN_YELLOW, 12.9, 11.6], [BRAIN_CORAL_GREEN, 8.2, 12.3],
  ...fish(FISH_BLUE, 6.0, 11.0),
  [CONCH, 5.4, 12.6],

  // ── central sand ──
  [OCTOPUS, 1.0, 14.3],
  [GIANT_CLAM, 4.2, 14.4],
  ...fl(TURTLE, 7.2, 13.6, SHADOW_L, 0.25, 2.15),
  [KELP, 11.4, 11.9], [KELP_B, 13.2, 12.9], [KELP_B, -0.4, 13.6],
  [SEAHORSE, 10.9, 16.6], [STARFISH_PURPLE, 2.6, 17.3],
  [ANCHOR_SUNK, 8.6, 16.2], [CHAIN, 7.3, 17.9],
  ...fish(FISH_PINK, 4.6, 17.2),

  // ── south: rocks, trench, submarine ──
  [REEF_STONE_BIG, 0.2, 18.5], [BRAIN_CORAL_YELLOW, 2.6, 19.3], [VENT, 3.6, 21.3], [BUBBLES, 3.8, 19.2],
  [JELLYFISH_BLUE, 9.6, 18.7], [BUBBLES_TALL, 10.4, 17.6],
  [AMPHORA, 6.4, 19.2], [SEA_CRAB, 5.8, 21.4], [SEA_CRAB_BLUE, 12.6, 18.4],
  ...fish(FISH_GREEN, 12.4, 20.6),
  ...fl(SUBMARINE, 4.4, 22.0, SHADOW_XL, 0.9, 2.05),
  [BUBBLES, 3.6, 21.6],
  [KELP, 0.0, 21.4], [KELP_B, 12.9, 21.5],
  [ANEMONE_GREEN, 9.9, 22.4], [TUBE_SPONGE_ORANGE, 9.3, 24.4], [STAGHORN_BLUE, 12.2, 19.8],
  [REEF_STONE, 2.7, 23.3], [STARFISH_RED, 10.8, 21.2], [SHELL, 1.2, 22.4],
  ...fish(FISH_YELLOW, 7.8, 25.0),
  [FISH_SCHOOL, 9.6, 14.9],
  ...fl(JELLYFISH, 1.0, 16.9, SHADOW_S, 0.2, 1.75),
  [SEAHORSE, 3.9, 0.6], ...fish(FISH_CLOWN, 13.9, 3.6),
];

export const worldModule = defineWorld({
  title: "El Fondo del Mar",
  npcCount: 46,
  background: "#123058",
  legend,
  map,
  props,
  outfit: {
    hats: { goggles: 6, none: 0.5 },
    lowers: { shorts: 4, skirt: 1 },
    tops: [
      "#303848", "#283c78", "#3870e0", "#38c8e8", "#e83890", "#f88828",
      "#e84848", "#f8d030", "#8848d0", "#20a8a0", "#f878c0", "#a8e058", "#ffffff",
    ],
    lowerColors: ["#283048", "#3858c8", "#e04070", "#20a0a0", "#f8a030", "#7040b8", "#303030", "#48c8e8"],
  },
});
