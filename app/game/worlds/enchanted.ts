// Mundo 19 — El Bosque Encantado: a moonlit forest in the spirit of Viridian
// Forest / Ilex Forest, but enchanted. Tree walls on every border, a luminous
// stone road that runs from the fairy glade (north) through the magic-tree
// plaza (centre) to the forest entrance (south), a pond with a plank bridge to
// an owl island, tall grass thickets, a gnome camp and a toadstool ring.
import { defineWorld, type PropPlace } from "../engine/world";
import {
  NIGHT_GRASS, NIGHT_UNDERGROWTH, NIGHT_TALL, NIGHT_MOSS, NIGHT_STONE, NIGHT_TRAIL, MOON_SAND,
  NIGHT_POND, NIGHT_BRIDGE, TREE_WALL,
} from "../engine/terrains/enchanted";
import {
  TREE_N, TREE_N_B, TREE_N_S, PINE_N, OLD_TREE, OLD_TREE_B, BUSH_N, BUSH_N_FLOWER, FERN_N, BIG_LEAVES_N,
  ROCK_N, ROCK_BIG_N, MOSSY_ROCK_N, MOSSY_ROCK_BIG_N, STUMP_N, LOG_N, BENCH_N, WELL_N, REEDS_N, LILYPAD_N,
  FENCE_H, FENCE_POST, TENT_N, CAMPFIRE_N, POST_N, CRATES_N, BACKPACKS_N,
  FLOWERS_PINK, FLOWERS_GLOW_Y, FLOWERS_GLOW_R,
  MAGIC_TREE, FAIRY_HOUSE, MUSH_S_BLUE, MUSH_S_PINK, MUSH_M_BLUE, MUSH_M_PINK, MUSH_L_VIOLET, MUSH_L_BLUE,
  MUSH_L_PINK, FAIRY_RING, CRYSTALS_BLUE, CRYSTALS_PINK, CRYSTALS_VIOLET, OWL_STUMP, GNOME_RED, GNOME_BLUE,
  GNOME_ORANGE, LANTERN, LANTERN_LOW, LIGHT_POOL, FAIRY_PURPLE, FAIRY_GOLD, FIREFLIES, SIGN_FAIRIES, SIGN_POND,
  SIGN_GNOMES, SIGN_WOODS, GLOW_FLOWER_PINK, GLOW_FLOWER_BLUE, GLOW_FLOWER_GOLD, STEPPING_STONES,
} from "../engine/propsLib/enchanted";

const props: PropPlace[] = [
  // ── northern tree wall (an archway of two trees frames the road) ──
  [TREE_N, -0.7, -0.5], [PINE_N, 1.3, -1.0], [TREE_N_B, 2.7, -0.3], [TREE_N, 4.3, -0.1], [TREE_N_B, 7.6, -0.2],
  [PINE_N, 9.7, -1.1], [TREE_N, 11.2, -0.4], [PINE_N, 13.4, -0.9],

  // ── western & eastern walls ──
  [TREE_N, -1.2, 9.6], [PINE_N, -0.7, 12.6], [TREE_N_B, -1.2, 15.6], [PINE_N, -0.6, 18.6], [TREE_N, -1.2, 21.4],
  [PINE_N, -0.7, 24.0],
  [TREE_N_B, 13.4, 10.2], [PINE_N, 13.9, 13.2], [TREE_N, 13.4, 16.0], [PINE_N, 13.9, 19.0], [TREE_N_B, 13.4, 21.4],
  [PINE_N, 13.9, 24.0],

  // ── fairy glade (north-west) ──
  [FAIRY_HOUSE, 0.9, 3.0],
  [FENCE_POST, 0.9, 6.6], [FENCE_H, 1.3, 6.6], [FENCE_H, 2.4, 6.6],
    [SIGN_FAIRIES, 4.0, 5.9],
  [FAIRY_RING, 1.2, 8.1], [MUSH_S_BLUE, 2.5, 8.9],
  [LANTERN, 5.0, 2.8], [LANTERN, 8.4, 3.4],
  [FLOWERS_PINK, 4.3, 3.9], [GLOW_FLOWER_BLUE, 3.7, 7.6], [GLOW_FLOWER_PINK, 4.4, 8.9],
  [BUSH_N_FLOWER, 1.2, 9.8], [FERN_N, 3.6, 2.6],
  [FAIRY_PURPLE, 3.6, 4.4], [FIREFLIES, 2.0, 9.6],

  // ── pond, owl island, plank bridge ──
  [LILYPAD_N, 10.5, 4.3], [LILYPAD_N, 12.4, 4.6], [LILYPAD_N, 13.1, 7.8], [LILYPAD_N, 10.4, 7.6], [LILYPAD_N, 13.4, 5.2],
  [REEDS_N, 8.9, 3.4], [REEDS_N, 13.5, 3.3], [REEDS_N, 8.8, 8.7],
  [OWL_STUMP, 11.1, 5.1], [GLOW_FLOWER_GOLD, 12.2, 6.6],
  [POST_N, 8.7, 5.5], [POST_N, 8.7, 6.7], [LANTERN_LOW, 8.5, 6.0],
  [SIGN_POND, 7.0, 8.2],
  [CRYSTALS_BLUE, 12.6, 8.7], [LOG_N, 9.4, 9.2], [FAIRY_GOLD, 9.8, 7.0],
  [FIREFLIES, 11.2, 3.2],

  // ── east tall-grass thicket ──
  [BUSH_N_FLOWER, 12.6, 10.0], [MUSH_M_PINK, 10.1, 10.6], [MOSSY_ROCK_N, 8.6, 11.6],
  [GLOW_FLOWER_PINK, 9.0, 10.0], [FERN_N, 11.4, 12.0],

  // ── magic-tree plaza ──
  [WELL_N, 3.3, 10.3],
  [MAGIC_TREE, 4.75, 12.4],
  [LANTERN, 3.1, 12.0], [LANTERN, 10.7, 12.0], [LANTERN, 3.1, 17.0], [LANTERN, 10.7, 17.0],
  [MUSH_L_VIOLET, 4.2, 16.0], [MUSH_M_BLUE, 9.0, 16.4], [MUSH_S_PINK, 8.5, 17.0], [MUSH_S_BLUE, 4.9, 17.2],
  [GLOW_FLOWER_BLUE, 4.4, 14.6], [GLOW_FLOWER_PINK, 9.5, 14.8], [GLOW_FLOWER_GOLD, 5.2, 17.4],
  [FAIRY_PURPLE, 4.6, 12.3], [FAIRY_GOLD, 9.6, 15.0],
  [CRYSTALS_VIOLET, 11.8, 14.4], [BENCH_N, 11.6, 17.9],
  [GNOME_BLUE, 1.8, 14.8], [STEPPING_STONES, 0.6, 18.6],
  [FIREFLIES, 8.2, 13.2], [FIREFLIES, 2.4, 16.6],

  // ── south: gnome camp ──
  [SIGN_GNOMES, 4.2, 20.4],
  [TENT_N, 1.2, 21.1], [CAMPFIRE_N, 3.7, 22.2], [GNOME_RED, 1.5, 23.4], [STUMP_N, 3.1, 24.0],
  [CRATES_N, 4.4, 21.4], [BACKPACKS_N, 1.0, 24.6], [LANTERN_LOW, 4.5, 23.4], [GLOW_FLOWER_BLUE, 0.9, 20.6],

  // ── south-east: toadstool ring & edge ──
  [FAIRY_RING, 8.6, 21.4], [MUSH_M_PINK, 10.4, 22.2], [GNOME_ORANGE, 11.9, 23.1],
  [SIGN_WOODS, 8.2, 24.2], [LOG_N, 9.4, 24.6], [BUSH_N, 12.0, 21.2], [MUSH_L_BLUE, 12.0, 19.4],
  [FAIRY_PURPLE, 6.5, 20.8], [FIREFLIES, 10.6, 20.4], [FIREFLIES, 5.4, 24.6],
  [FLOWERS_GLOW_Y, 8.0, 19.6], [FLOWERS_GLOW_R, 4.8, 25.0],
  // ── tree clump (SE) ──
  [TREE_N, 10.7, 19.3], [PINE_N, 12.5, 19.0], [TREE_N_B, 9.4, 20.0],
  // ── extra fill ──
  [MOSSY_ROCK_N, 1.4, 19.4], [FERN_N, 0.9, 17.7], [BUSH_N, 2.4, 19.2], [MOSSY_ROCK_BIG_N, 8.2, 18.9],
  [BUSH_N_FLOWER, 12.0, 24.3], [ROCK_N, 10.6, 24.9], [STUMP_N, 12.5, 22.7], [MUSH_S_BLUE, 11.0, 25.0],
  [BUSH_N, 4.4, 9.9], [ROCK_BIG_N, 6.3, 9.0], [STUMP_N, 0.9, 10.9], [MUSH_M_BLUE, 1.7, 11.5],
  [FERN_N, 8.1, 14.0], [FERN_N, 6.9, 22.2], [MUSH_S_PINK, 7.4, 23.4], [GLOW_FLOWER_PINK, 6.1, 23.0],
  [FLOWERS_PINK, 3.3, 13.2], [FLOWERS_GLOW_R, 8.5, 9.8], [GLOW_FLOWER_GOLD, 9.2, 12.6],
  [BUSH_N, 8.6, 2.6], [MUSH_M_PINK, 5.7, 3.1], [MOSSY_ROCK_N, 6.0, 25.0],
];

export const worldModule = defineWorld({
  title: "El Bosque Encantado",
  npcCount: 46,
  background: "#0a2422",
  legend: {
    ".": NIGHT_GRASS, d: NIGHT_UNDERGROWTH, g: NIGHT_TALL, o: NIGHT_MOSS, s: NIGHT_STONE, t: NIGHT_TRAIL,
    m: MOON_SAND, w: NIGHT_POND, b: NIGHT_BRIDGE, T: TREE_WALL,
  },
  map: [
    "TTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTT",
    "TTdd..ss.dTTTTT",
    "Td....ss......T",
    "Td....ss..wwwww",
    "T.....ss..wmmww",
    "T.....sstbbmmww",
    "T.....ss..wmmww",
    "T.....ss..wwwww",
    "T.d...ss.mmmm..",
    "Tgg...ss..ggg.T",
    "Tgg...ss..ggg.T",
    "Tgg...ss..ggg.T",
    "T...ssssss.gg.T",
    "T..ssssssss.ggT",
    "T.ssooooooss.gT",
    "T.ssooooooss.gT",
    "T.ssooooooss.gT",
    "T.ssooooooss.gT",
    "T..ssssssss.ggT",
    "T...ssssss.gg.T",
    "Td....ss...TTTT",
    "Ttttttss...TTTT",
    "Ttttttss.dd...T",
    "Ttttttss.dd...T",
    "T.ttt.ss......T",
    "Td....ss....d.T",
  ],
  props,
  outfit: {
    hats: { none: 5, beanie: 2, cap: 1.5, bandana: 1, party: 1, dinohood: 1 },
    lowers: { pants: 4, shorts: 1, skirt: 2 },
    tops: [
      "#e87898", "#8868e0", "#48b8d8", "#f0a038", "#f06830", "#e85858",
      "#c8a0f0", "#f8e068", "#4878d0", "#d85098", "#f8f8f8", "#a0c8f8",
    ],
    lowerColors: ["#3a3a5c", "#2c4878", "#5a3c70", "#4a4a68", "#704838", "#383848"],
  },
});
