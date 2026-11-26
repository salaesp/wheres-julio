// Mundo 4 — El Polo Norte: icy sea with floes, penguin colony on the ice shelf,
// log cabin, igloos, a frozen lake for ice fishing, deep snow drifts and the
// candy-striped North Pole itself.
import { defineWorld, type PropPlace } from "../engine/world";
import { SNOW, DEEP_SNOW, SNOW_TRAIL, ICE, ARCTIC_SEA } from "../engine/terrains/nature2";
import {
  SNOW_PINE, SNOW_FIR, IGLOO, SNOWMAN, PENGUIN, PENGUIN_L, PENGUIN_R, PENGUIN_CHICK,
  SEAL, SEAL_R, POLAR_BEAR, BEAR_CUB, SLED, PRESENTS, CABIN,
  SNOW_MOUND, SNOW_MOUND_BIG, SNOWY_ROCK, ICE_CRYSTAL, ICE_FLOE, ICE_FLOE_S, FISH_HOLE,
  NORTH_POLE, SNOW_LAMP,
} from "../engine/propsLib/polar";

const props: PropPlace[] = [
  // ── sea & ice shelf ──
  [ICE_FLOE, 4.4, 0.3], [ICE_FLOE_S, 8.4, 1.1], [ICE_FLOE_S, 0.6, 0.6], [ICE_FLOE, 11.2, 0.4],
  [PENGUIN, 10.6, 2.3], [PENGUIN_L, 12.1, 2.6], [PENGUIN_R, 9.6, 3.0], [PENGUIN_CHICK, 11.5, 3.4],
  [PENGUIN, 13.4, 3.2], [PENGUIN_CHICK, 13.0, 3.9],
  [SEAL, 0.2, 3.1], [SEAL_R, 2.8, 2.6], [PENGUIN_R, 4.6, 3.5],
  [ICE_CRYSTAL, 6.2, 3.5],

  // ── north-east: cabin ──
  [CABIN, 9.1, 5.1],
  [SLED, 7.0, 8.7], [PRESENTS, 13.5, 8.8],
  [SNOW_LAMP, 10.0, 9.9], [SNOW_LAMP, 13.3, 13.6],
  [POLAR_BEAR, 5.4, 4.6], [BEAR_CUB, 7.6, 5.0],

  // ── north-west: igloo village ──
  [IGLOO, 0.4, 5.4], [IGLOO, 3.9, 7.6],
  [SNOWMAN, 3.0, 5.0],
  [SNOW_MOUND, 6.6, 6.8],

  // ── frozen lake ──
  [FISH_HOLE, 2.0, 11.4], [FISH_HOLE, 4.5, 13.3],
  [PENGUIN_L, 6.4, 11.4],
  [SNOWY_ROCK, 7.2, 12.6],

  // ── North Pole plaza ──
  [NORTH_POLE, 7.05, 14.2],
  [SNOWMAN, 9.3, 15.6], [PRESENTS, 4.8, 15.6],
  [SNOW_PINE, 12.8, 9.9], [SNOW_FIR, 13.9, 12.2],

  // ── southern woods & drifts ──
  [SNOW_PINE, -0.4, 14.0], [SNOW_FIR, 3.2, 16.4], [SNOW_PINE, 12.4, 15.7],
  [IGLOO, 10.6, 18.9],
  [SNOWMAN, 4.6, 19.6], [SNOW_MOUND_BIG, 0.3, 21.4], [SNOWY_ROCK, 5.0, 21.9],
  [ICE_CRYSTAL, 13.6, 20.4], [SNOW_MOUND, 9.6, 21.0],
  [SNOW_LAMP, 6.3, 19.3],
  [SNOW_PINE, 9.6, 22.9], [SNOW_FIR, 12.0, 23.6], [SNOW_PINE, -0.3, 23.2], [SNOW_FIR, 6.0, 23.9],
  [PENGUIN, 2.6, 18.2], [PENGUIN_R, 13.8, 22.0],
  // extra clutter on the open snow
  [SNOW_FIR, 13.8, 4.9], [SNOW_MOUND, 9.4, 12.4], [ICE_CRYSTAL, 8.6, 10.6],
  [PENGUIN_CHICK, 7.2, 11.9], [SNOWY_ROCK, 12.9, 17.6], [SNOW_MOUND, 0.6, 9.2],
];

export const worldModule = defineWorld({
  title: "El Polo Norte",
  npcCount: 46,
  background: "#30509c",
  legend: { ".": SNOW, d: DEEP_SNOW, p: SNOW_TRAIL, i: ICE, s: ARCTIC_SEA },
  map: [
    "sssssssssssssss",
    "sssssssssssssss",
    "ssiiissssssiiss",
    "iiiiiissiiiiiii",
    "..iiii...iiiii.",
    "...............",
    "...............",
    "...............",
    "...............",
    "...........pp..",
    "..iiii.....pp..",
    ".iiiiii....pp..",
    "iiiiiiii...pp..",
    "iiiiiii....pp..",
    ".iiiii.....pp..",
    "......ppppppp..",
    "dd....ppp......",
    "ddd...ppp......",
    "dddd...pp...ddd",
    "ddd....pp..dddd",
    "dd.....pp...ddd",
    ".......pp......",
    ".......pppppppp",
    "..ddd..pp......",
    ".ddddd.pp.....d",
    "dddddd.pp....dd",
  ],
  props,
  outfit: {
    hats: { beanie: 9, none: 1 },
    lowers: { pants: 1 },
    tops: [
      "#e84848", "#3868d8", "#f8c838", "#f08030", "#48b048", "#8858c8",
      "#f078a8", "#f8f8f8", "#38b0c8", "#c83070", "#404858", "#a05030",
    ],
    lowerColors: ["#3a3a48", "#304878", "#4060a8", "#686868", "#7a5038", "#a84040"],
  },
});
