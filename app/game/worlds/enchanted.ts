// Mundo 19 — El Bosque Encantado: a night forest lit by glowing mushrooms,
// crystals, fireflies and lanterns. A magic tree, a fairy house, a pond, fern
// thickets (great hiding spots) and a winding moonlit trail.
import { defineWorld, type PropPlace } from "../engine/world";
import { NIGHT_GRASS, NIGHT_TRAIL, FERN, NIGHT_POND } from "../engine/terrains/enchanted";
import {
  TREE_NIGHT, TREE_NIGHT_B, PINE_NIGHT, MAGIC_TREE, MUSHROOM_S, MUSHROOM_M, MUSHROOM_L,
  MUSHROOM_M_BLUE, FAIRY_RING, FAIRY, FAIRY_PINK, FIREFLIES, OWL_STUMP, GNOME, FAIRY_HOUSE,
  CRYSTALS, CRYSTALS_PINK, LANTERN, BUSH_NIGHT, LOG_NIGHT, MOSS_ROCK,
} from "../engine/propsLib/enchanted";

const props: PropPlace[] = [
  // ── northern canopy ──
  [TREE_NIGHT, -0.6, 0.2], [PINE_NIGHT, 2.6, 0.0], [TREE_NIGHT_B, 4.4, 0.3], [PINE_NIGHT, 8.1, 0.1],
  [TREE_NIGHT, 10.2, 0.0], [PINE_NIGHT, 13.8, 0.2],
  [BUSH_NIGHT, 0.6, 3.6], [MUSHROOM_M, 12.4, 3.8],
  [LANTERN, 8.0, 3.9], [LANTERN, 4.9, 7.6],
  [GNOME, 9.6, 5.6], [OWL_STUMP, 12.6, 6.4], [FAIRY, 8.2, 7.2], [FIREFLIES, 2.4, 5.0],

  // ── fairy house & clearing ──
  [FAIRY_HOUSE, 0.2, 7.4], [FAIRY_RING, 2.2, 10.6], [MUSHROOM_S, 3.6, 10.3],
  [CRYSTALS, 10.4, 7.8], [FAIRY_PINK, 5.6, 11.0],

  // ── the pond ──
  [MOSS_ROCK, 8.0, 14.2], [BUSH_NIGHT, 12.4, 13.9], [CRYSTALS_PINK, 13.0, 8.6],
  [FIREFLIES, 9.5, 10.0], [LOG_NIGHT, 11.2, 14.6],

  // ── magic tree grove ──
  [MAGIC_TREE, 0.3, 14.3],
  [MUSHROOM_L, 5.0, 16.7], [MUSHROOM_M_BLUE, 4.6, 14.8], [MUSHROOM_S, 6.3, 18.0], [FAIRY, 3.7, 14.0],
  [LANTERN, 6.6, 15.2], [FIREFLIES, 4.0, 18.4],

  // ── southern woods ──
  [TREE_NIGHT_B, 9.4, 17.2], [PINE_NIGHT, 12.8, 16.6], [BUSH_NIGHT, 8.4, 19.4],
  [GNOME, 11.6, 20.0], [MUSHROOM_M, 13.2, 19.2], [MUSHROOM_S, 10.4, 21.0], [CRYSTALS, 1.0, 20.6],
  [LOG_NIGHT, 3.4, 21.0], [OWL_STUMP, 6.6, 22.0], [FAIRY_PINK, 9.2, 22.8], [MOSS_ROCK, 12.6, 22.6],
  [PINE_NIGHT, 0.0, 23.2], [TREE_NIGHT, 12.2, 23.6], [BUSH_NIGHT, 4.8, 24.4], [PINE_NIGHT, 8.8, 24.0],
  [LANTERN, 7.4, 19.6], [FIREFLIES, 10.8, 18.6],
];

export const worldModule = defineWorld({
  title: "El Bosque Encantado",
  npcCount: 46,
  background: "#0e2a26",
  legend: { ".": NIGHT_GRASS, t: NIGHT_TRAIL, f: FERN, w: NIGHT_POND },
  map: [
    "...............",
    "...............",
    "..ff.......ff..",
    "..ff.......ff..",
    "......tt.......",
    "......tt.......",
    ".....tt........",
    ".....tt...ff...",
    ".....ttt..ff...",
    "......tt...www.",
    ".ff...tt..wwww.",
    ".ff...tt..wwww.",
    "......tt..wwww.",
    "......tt...ww..",
    "......tt.......",
    ".......tt......",
    ".......tt...ff.",
    ".......ttt..ff.",
    "........tt.....",
    "..ff....tt.....",
    "..ff....tt.....",
    ".......tt......",
    ".......tt...ff.",
    "......tt....ff.",
    "......tt.......",
    "......tt.......",
  ],
  props,
  outfit: {
    hats: { none: 5, beanie: 2, bandana: 1, cap: 1, party: 1 },
    lowers: { pants: 4, shorts: 1, skirt: 2 },
    tops: [
      "#e87898", "#8868e0", "#48b8d8", "#f0a038", "#f06830", "#e85858",
      "#c8a0f0", "#f8e068", "#4878d0", "#d85098", "#38a898", "#f8f8f8",
    ],
    lowerColors: ["#3a3a5c", "#2c4878", "#5a3c70", "#4a6a58", "#704838", "#383848"],
  },
});
