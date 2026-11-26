// Mundo 1 — La Plaza: town park with a fountain, pond and playground.
import { defineWorld, type PropPlace } from "../engine/world";
import { GRASS, TALL_GRASS, PATH, STONE, WATER, SAND, FLOWERBED } from "../engine/terrains/common";
import {
  TREE, TREE_B, TREE_SMALL, BUSH, BUSH_FLOWER, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX, ROCK,
} from "../engine/propsLib/nature";
import {
  BENCH, LAMP, TRASH, SIGN, FOUNTAIN, SWINGS, SLIDE, SEESAW, LILYPAD, DUCK, STATUE,
} from "../engine/propsLib/park";

const props: PropPlace[] = [
  // top tree line
  [TREE, -0.6, -1], [TREE_B, 1.2, -1.3], [TREE, 3.4, -0.9],
  [TREE_B, 9.4, -1.2], [TREE, 11.4, -0.8], [TREE_B, 13.3, -1.2],
  // side trees
  [TREE_SMALL, 13.8, 3.2], [TREE, 12.6, 5.4], [TREE_SMALL, -0.3, 6.4],
  [TREE_SMALL, 14, 15.2], [TREE_B, -0.8, 14.4],
  [TREE, -0.7, 22.4], [TREE_SMALL, 4.3, 22.6],
  [TREE_B, 12.8, 23.8], [TREE_SMALL, 10.2, 24.3],
  // plaza
  [FOUNTAIN, 5.6, 9.6],
  [BENCH, 2.4, 8.05], [BENCH, 10.6, 8.05], [BENCH, 2.4, 14.0], [BENCH, 10.6, 14.0],
  [LAMP, 2.1, 6.7], [LAMP, 12.4, 6.7], [LAMP, 2.1, 13.5], [LAMP, 12.4, 13.5],
  [TRASH, 4.6, 8.1], [TRASH, 9.8, 14.15],
  [STATUE, 2.4, 10.3],
  // paths
  [SIGN, 9.1, 2.7], [SIGN, 4.8, 23.5],
  [BUSH, 5, 4.6], [BUSH_FLOWER, 9.1, 5.3], [BUSH, 5, 17.3], [BUSH_FLOWER, 9.1, 18.3],
  [BUSH, 13.1, 9.3], [BUSH_FLOWER, 13.1, 12.6],
  // pond
  [LILYPAD, 1.2, 19.4], [LILYPAD, 3.3, 20.8], [DUCK, 2.2, 20.1], [DUCK, 0.4, 20.9], [ROCK, 3.6, 22.3],
  // playground
  [SWINGS, 10.4, 16.7], [SLIDE, 12.9, 19.8], [SEESAW, 10.3, 21.4],
  // flowers
  [FLOWERS_RED, 0.5, 2.5], [FLOWERS_YELLOW, 11.3, 2.7], [FLOWERS_MIX, 4.2, 16.4],
  [FLOWERS_RED, 12.2, 15.6], [FLOWERS_YELLOW, 1.4, 24.5], [FLOWERS_MIX, 9.5, 23],
];

export const worldModule = defineWorld({
  title: "La Plaza",
  npcCount: 48,
  background: "#285830",
  legend: { ".": GRASS, t: TALL_GRASS, p: PATH, s: STONE, w: WATER, n: SAND, f: FLOWERBED },
  map: [
    "...............",
    "...............",
    "......ppp......",
    ".ttt..ppp......",
    "tttt..ppp..ff..",
    "ttt...ppp..ff..",
    "......ppp......",
    "......ppp......",
    "..sssssssssss..",
    "..sssssssssss..",
    "..sssssssssss..",
    "ppsssssssssssss",
    "..sssssssssss..",
    "..sssssssssss..",
    "..sssssssssss..",
    "......ppp......",
    ".ff...ppp......",
    ".ff...ppp.nnnnn",
    "......ppp.nnnnn",
    "www...ppp.nnnnn",
    "wwww..ppp.nnnnn",
    "wwww..ppp.nnnnn",
    "www...ppp.nnnnn",
    "......ppp......",
    "tttt..ppp...ttt",
    "ttttt.ppp..tttt",
  ],
  props,
});
