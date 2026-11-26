// Mundo 8 — La Maratón: a town street closed for the race, with the finish
// arch, a crossing with traffic lights, water stations and the crowd.
import { defineWorld, type PropPlace } from "../engine/world";
import { GRASS, TALL_GRASS, FLOWERBED } from "../engine/terrains/common";
import {
  ROAD, ROAD_CENTER, ROAD_CENTER_H, ROAD_EDGE_L, ROAD_EDGE_R, ROAD_EDGE_T, ROAD_EDGE_B,
  ROAD_ZEBRA_TOP, ROAD_ZEBRA_BOTTOM, ROAD_ZEBRA_H, ROAD_START, SIDEWALK,
} from "../engine/terrains/urban";
import { TREE, TREE_B, TREE_SMALL, BUSH, BUSH_FLOWER, FLOWERS_RED, FLOWERS_YELLOW, FLOWERS_MIX } from "../engine/propsLib/nature";
import { BENCH, LAMP, TRASH } from "../engine/propsLib/park";
import {
  HOUSE_RED, HOUSE_BLUE, HOUSE_GREEN, HOUSE_PURPLE, SHOP, CAFE, APARTMENT, APARTMENT_B,
  ARCH_POST, archBanner, TRAFFIC_LIGHT, CONE, BARRIER_V, WATER_TABLE, BOTTLE_PACK,
  CUPS_LITTER, kmSign, BALLOONS, BALLOONS_B, RACE_CLOCK, HYDRANT, MANHOLE, MAILBOX, garland, PLANTER,
} from "../engine/propsLib/town";

const BANNER = archBanner(6 * 16 + 4);
const KM_42 = kmSign("42");
const KM_41 = kmSign("41");
const GARLAND = garland(124);

const props: PropPlace[] = [
  // ── left houses
  [HOUSE_RED, -0.1, -0.9],
  [APARTMENT, -0.1, 3.7],
  [HOUSE_BLUE, -0.1, 9.0],
  [SHOP, -0.1, 18.1],
  [HOUSE_GREEN, -0.1, 22.4],
  // ── right houses
  [CAFE, 12.0, -0.9],
  [HOUSE_PURPLE, 12.0, 5.8],
  [APARTMENT_B, 12.0, 18.4],
  // trees, bushes & flowers on the grass strips
  [TREE_SMALL, 13.9, 2.2], [TREE_SMALL, -0.4, 13.0], [TREE_B, 12.2, 10.6], [TREE, 12.6, 22.9],
  [BUSH_FLOWER, 1.4, 8.5], [BUSH, 12.3, 3.5], [BUSH_FLOWER, 13.6, 13.3],
  [FLOWERS_RED, 0.3, 3.0], [FLOWERS_YELLOW, 12.2, 25.0], [FLOWERS_MIX, 1.6, 21.6], [FLOWERS_MIX, 12.4, 9.2],
  [FLOWERS_YELLOW, 1.2, 13.6],

  // ── finish arch
  [ARCH_POST, 4.15, 1.75], [ARCH_POST, 10.4, 1.75], [BANNER, 4.15, 1.75],
  [BALLOONS, 3.1, 0.4], [BALLOONS_B, 10.95, 0.3],
  [RACE_CLOCK, 9.95, 6.6],
  [KM_42, 3.0, 6.9],

  // ── crowd barriers along the road
  [BARRIER_V, 4.35, 10.6], [BARRIER_V, 10.06, 8.5], [BARRIER_V, 4.35, 20.4], [BARRIER_V, 10.06, 23.4],
  // the cross street is closed to cars
  [BARRIER_V, 1.7, 15.1], [BARRIER_V, 12.7, 15.1],
  [CONE, 1.0, 16.6], [CONE, 2.5, 17.2], [CONE, 13.5, 16.6], [CONE, 12.0, 15.0],

  // ── street furniture
  [LAMP, 3.25, 9.6], [LAMP, 10.95, 9.6], [LAMP, 10.95, 13.0], [LAMP, 3.25, 22.0], [LAMP, 11.3, 22.9],
  [GARLAND, 57 / 16, 9.79],
  [TRAFFIC_LIGHT, 4.2, 11.7], [TRAFFIC_LIGHT, 10.55, 16.9],
  [HYDRANT, 11.2, 3.3], [MAILBOX, 2.3, 12.9], [TRASH, 11.3, 12.0], [PLANTER, 3.1, 13.2],
  [BENCH, 12.1, 23.9 - 0.1],
  [MANHOLE, 8.0, 3.3], [MANHOLE, 6.2, 23.6], [MANHOLE, 13.4, 16.25],

  // ── water stations
  [WATER_TABLE, 3.0, 18.4], [BOTTLE_PACK, 3.3, 20.7], [BALLOONS, 2.6, 16.9],
  [WATER_TABLE, 9.15, 21.2], [BOTTLE_PACK, 10.2, 23.4],
  [CUPS_LITTER, 6.4, 21.0], [CUPS_LITTER, 8.1, 23.0], [CUPS_LITTER, 5.6, 19.6],
  [KM_41, 3.0, 23.8],

  // ── cones on the road
  [CONE, 7.2, 7.4], [CONE, 7.2, 10.4], [CONE, 7.2, 20.9], [CONE, 7.2, 24.4],
];

export const worldModule = defineWorld({
  title: "La Maratón",
  npcCount: 48,
  background: "#3c4458",
  legend: {
    ".": GRASS, t: TALL_GRASS, f: FLOWERBED, s: SIDEWALK,
    r: ROAD, c: ROAD_CENTER, L: ROAD_EDGE_L, R: ROAD_EDGE_R, k: ROAD_START,
    z: ROAD_ZEBRA_TOP, Z: ROAD_ZEBRA_BOTTOM, H: ROAD_ZEBRA_H,
    u: ROAD_EDGE_T, "-": ROAD_CENTER_H, n: ROAD_EDGE_B,
  },
  map: [
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...sskkkkkss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...sszzzzzss...",
    "...ssZZZZZss...",
    "uuuHHrrrrrHHuuu",
    "---HHrrrrrHH---",
    "nnnHHrrrrrHHnnn",
    "...sszzzzzss...",
    "...ssZZZZZss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
    "...ssLrcrRss...",
  ],
  props,
  outfit: {
    hats: { none: 4, cap: 4, bandana: 1.5, sunhat: 0.6 },
    lowers: { shorts: 6, pants: 1.5, skirt: 0.8 },
    tops: [
      "#e84848", "#f08030", "#f8c838", "#58b8f0", "#3868d8", "#f078a8", "#f8f8f8",
      "#48b0a0", "#a0d050", "#c83070", "#68c868", "#f8e848", "#40d8c8", "#ff6890",
    ],
    lowerColors: ["#383848", "#283868", "#f8f8f8", "#e84848", "#3868d8", "#404040"],
  },
});
