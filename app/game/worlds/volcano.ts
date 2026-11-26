// Mundo 17 — El Volcán: a smoking crater pours a lava cascade into a winding
// lava river (crossed by a rope bridge). Around it: dark volcanic rock with
// glowing cracks, ash fields, a geyser, fumaroles, steaming hot springs,
// fire crystals & obsidian, fossils and bones, a dinosaur nest among
// prehistoric ferns, and the explorers' camp at the foot of the island.
import { defineWorld, type PropPlace } from "../engine/world";
import {
  LAVA, VROCK, ASH, SINTER, HOT_SPRING, PREHISTORIC_GRASS, GIANT_FERNS, ROPE_BRIDGE,
} from "../engine/terrains/volcano";
import {
  VOLCANO, STEAM, STEAM_B, FUMAROLE, GEYSER, LAVA_ROCK, LAVA_ROCK_S, BOULDER, FIRE_CRYSTALS, OBSIDIAN,
  CHARRED_TREE, AMMONITE, TRILOBITE, DINO_SKULL, RIBCAGE, BONES, DINO_NEST, TREE_FERN, TREE_FERN_L,
  CYCAD, HORSETAIL, TENT_ORANGE, TENT_OLIVE, CAMPFIRE, MAP_TABLE, JEEP, CRATES, BACKPACKS, SEISMOGRAPH,
  DANGER_SIGN, PELIGRO_SIGN, EXPEDITION_FLAG, BRIDGE_POST, EMBERS, PICKAXE_CART,
} from "../engine/propsLib/volcano";

const props: PropPlace[] = [
  // ── the volcano & upper slopes ──
  [VOLCANO, 3.47, -0.5],
  [FIRE_CRYSTALS, 0.2, 0.0],
  [FUMAROLE, 13.1, -0.3],
  [OBSIDIAN, 11.7, 0.5],
  [BONES, 12.6, 2.4],
  [LAVA_ROCK_S, 2.0, 1.0],
  [AMMONITE, 1.5, 3.4],
  [LAVA_ROCK_S, 0.2, 4.6],
  [GEYSER, 12.3, 3.0],
  [CHARRED_TREE, 2.3, 5.2],
  [EMBERS, 9.3, 4.9],
  [DANGER_SIGN, 3.0, 7.4],
  [BOULDER, 8.9, 7.4],
  [PELIGRO_SIGN, 0.1, 6.6],
  [FIRE_CRYSTALS, 13.2, 7.6],

  // ── lava river banks, bridge, hot springs ──
  [STEAM, 10.0, 8.9], [STEAM_B, 11.3, 9.8], [STEAM_B, 9.2, 9.6],
  [BONES, 0.6, 9.6],
  [EMBERS, 6.0, 10.3],
  [TRILOBITE, 7.2, 10.4],
  [OBSIDIAN, 1.6, 10.6],
  [BRIDGE_POST, 3.62, 10.55], [BRIDGE_POST, 6.0, 10.55],
  [BRIDGE_POST, 3.62, 11.45], [BRIDGE_POST, 6.0, 11.45],
  [RIBCAGE, 7.0, 12.4],
  [DINO_SKULL, 11.6, 12.0],
  [LAVA_ROCK, 0.1, 12.6],
  [EMBERS, 5.6, 13.2],
  [DANGER_SIGN, 6.9, 13.9],
  [PICKAXE_CART, 8.6, 14.0],

  // ── prehistoric meadow ──
  [TREE_FERN, 11.5, 13.0],
  [TREE_FERN_L, 4.6, 14.2],
  [DINO_NEST, 9.5, 15.3],
  [CYCAD, 3.2, 16.6],
  [HORSETAIL, 8.4, 17.0], [HORSETAIL, 2.2, 17.8],

  // ── explorers' camp ──
  [EXPEDITION_FLAG, 7.0, 17.6],
  [TENT_ORANGE, 4.4, 18.6],
  [TENT_OLIVE, 10.3, 18.6],
  [CAMPFIRE, 7.6, 19.9],
  [CRATES, 12.4, 20.3],
  [BACKPACKS, 9.6, 20.8],
  [JEEP, 0.4, 21.2],
  [SEISMOGRAPH, 5.0, 21.6],
  [MAP_TABLE, 8.3, 21.8],

  // ── southern ferns ──
  [TREE_FERN_L, 11.8, 22.6],
  [CYCAD, 6.3, 23.4],
  [HORSETAIL, 9.9, 23.6], [HORSETAIL, 3.6, 24.0],
];

export const worldModule = defineWorld({
  title: "El Volcán",
  npcCount: 46,
  background: "#2a1c22",
  legend: {
    r: VROCK, a: ASH, l: LAVA, b: ROPE_BRIDGE, s: SINTER, h: HOT_SPRING, g: PREHISTORIC_GRASS, f: GIANT_FERNS,
  },
  map: [
    "rrrrrrrrrrrrrrr",
    "rrrrrrrrrrrrrrr",
    "arrrrrrrrrrrrra",
    "aarrrrrrrrrrraa",
    "aaarrrrllrrraaa",
    "raaarrrllrraaar",
    "rraaarrllrraarr",
    "rrraaalllraaarr",
    "rrraalllaasssar",
    "rraallaasshhssr",
    "raaallaashhhhsr",
    "aaaabbaasshhhsr",
    "raaallaassssarr",
    "rralllaaaaaaagg",
    "rrallaaaaaagggg",
    "lllllaagggggfgg",
    "llllaaggggggffg",
    "aagaaagggggggfg",
    "ggggaaagggggggg",
    "gffgaaaaaaaaagg",
    "gffgaaaaaaaaagg",
    "ggggaaaaaaaaagf",
    "gggggaaaaaaaggf",
    "ffggggaaaagggff",
    "fffgggggaggggff",
    "ffffgggggagffff",
  ],
  props,
  outfit: {
    hats: { helmet: 4, cap: 1.5, bandana: 1, none: 2 },
    lowers: { shorts: 3, pants: 3 },
    tops: [
      "#c8b078", "#a89860", "#7c8040", "#687838", "#f08030", "#e86828",
      "#f8f0e0", "#d84838", "#4878c8", "#f8c838", "#8c6848", "#58a0a0",
    ],
    lowerColors: ["#c8b080", "#8c7850", "#5c5c40", "#7a5038", "#3a3a48", "#4c5c80"],
  },
});
