// Mundo 7 — El Barco Pirata: a big wooden ship seen from above filling the
// map (bow at the top, quarterdeck with the helm at the stern), sea around it
// and a tiny island with a palm in a corner.
import { defineWorld, type PropPlace } from "../engine/world";
import { bakeShip, SHIP } from "../engine/terrains/ship";
import { PALM_B, SEA_ROCK, SEA_ROCK_BIG, FOAM_SMALL, FOAM_BIG } from "../engine/propsLib/beach";
import { ROCK } from "../engine/propsLib/nature";
import {
  MAST_MAIN, MAST_FORE, CANNON_L, CANNON_R, CANNONBALLS, BARREL, CRATE, HELM, TREASURE,
  JOLLY_ROGER, HATCH, ROPE_COIL, ANCHOR, STAIRS, BALUSTRADE, LANTERN, PARROT, MAP_TABLE,
  MOP_BUCKET, SHARK_FIN, BOWSPRIT, X_MARK,
} from "../engine/propsLib/pirate";

const { map, legend } = bakeShip();
const T = 16;
const Q = SHIP.quarter / T; // quarterdeck edge in tiles

// Quarterdeck railing with a gap for the stairs in the middle.
const railing: PropPlace[] = [];
for (const x of [2.1, 3.1, 4.1, 5.1, 8.9, 9.9, 10.9, 11.9]) railing.push([BALUSTRADE, x, Q - 0.62]);

const props: PropPlace[] = [
  // ── sea & island ──
  [PALM_B, -0.15, -1.25], [X_MARK, 2.1, 1.7], [ROCK, 0.1, 2.0],
  [FOAM_BIG, 12.5, 1.35], [SEA_ROCK_BIG, 12.55, 0.3],
  [FOAM_SMALL, 0.1, 9.45], [SEA_ROCK, 0.25, 8.9],
  [SHARK_FIN, 12.6, 4.3], [SHARK_FIN, -0.3, 17.2],
  [FOAM_SMALL, 13.65, 23.2], [SEA_ROCK, 13.8, 22.6],

  // ── bow ──
  [BOWSPRIT, 6.97, -0.55],
  [ANCHOR, 6.95, 3.0],
  [ROPE_COIL, 5.4, 5.4], [CANNONBALLS, 8.7, 5.6],
  [MAST_FORE, 5.95, 3.35],
  [BARREL, 3.3, 7.6], [BARREL, 4.1, 8.2], [BARREL, 3.1, 8.75],
  [CRATE, 10.5, 7.7], [CRATE, 11.2, 8.6], [BARREL, 10.2, 9.0],

  // ── cannons along the rails ──
  [CANNON_L, 1.55, 10.4], [CANNON_L, 1.55, 13.6], [CANNON_L, 1.55, 16.8],
  [CANNON_R, 12.05, 10.4], [CANNON_R, 12.05, 13.6], [CANNON_R, 12.05, 16.8],
  [CANNONBALLS, 2.6, 12.3], [CANNONBALLS, 11.4, 15.4],

  // ── main deck ──
  [MAST_MAIN, 5.6, 8.95],
  [ROPE_COIL, 8.6, 15.4], [MOP_BUCKET, 4.4, 14.9],
  [HATCH, 6.6, 16.6],
  [CRATE, 2.6, 17.9], [BARREL, 3.5, 18.2], [ROPE_COIL, 10.6, 18.5],
  [LANTERN, 2.5, 6.6], [LANTERN, 12.0, 6.6],

  // ── quarterdeck ──
  ...railing,
  [STAIRS, 6.5, Q - 0.75],
  [HELM, 6.8, 20.9],
  [MAP_TABLE, 2.4, 21.4],
  [TREASURE, 10.5, 21.3],
  [PARROT, 9.4, 20.6],
  [JOLLY_ROGER, 11.6, 20.6],
  [BARREL, 2.2, 23.0], [CRATE, 11.9, 23.0],
  [LANTERN, 1.9, 19.9], [LANTERN, 12.6, 19.9],
];

export const worldModule = defineWorld({
  title: "El Barco Pirata",
  npcCount: 44,
  background: "#2c4894",
  legend,
  map,
  props,
  outfit: {
    hats: { bandana: 6, none: 2.5, beanie: 0.8, cap: 0.4 },
    lowers: { pants: 6, shorts: 2.5, skirt: 0.8 },
    tops: [
      "#f8f8f8", "#e84848", "#3858a8", "#303848", "#f0e0b0", "#a83838",
      "#4878c8", "#d8c8a0", "#585060", "#c06030", "#f8f0e0", "#882838",
    ],
    lowerColors: ["#5a3a28", "#3a3a48", "#7a5038", "#304878", "#c8b080", "#484040", "#283058"],
  },
});
