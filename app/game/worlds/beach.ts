// Mundo 2 — La Playa: animated sea and surf at the top, a wooden pier, a sandy
// beach full of umbrellas and towels, and dunes with palms at the bottom.
import { defineWorld, type PropPlace } from "../engine/world";
import type { Terrain } from "../engine/terrain";
import { bakeShore, DOCK, BOARDWALK, DUNE_GRASS } from "../engine/terrains/water";
import {
  UMBRELLA_RED, UMBRELLA_BLUE, UMBRELLA_YELLOW, UMBRELLA_PINK, UMBRELLA_SHADOW,
  TOWEL_RED, TOWEL_BLUE, TOWEL_GREEN, TOWEL_PURPLE, TOWEL_ORANGE,
  LOUNGER_BLUE, LOUNGER_RED, LOUNGER_YELLOW, LOUNGER_GREEN,
  SANDCASTLE, SANDCASTLE_SMALL, BEACH_BALL, BUCKET, BUCKET_BLUE, SPADE,
  PALM, PALM_B, PALM_SHADOW, LIFEGUARD, ICECREAM_KIOSK, COOLER, SURFBOARDS,
  CRAB, SEAGULL, STARFISH, VOLLEY_NET, SEA_ROCK, SEA_ROCK_BIG, FOAM_SMALL, FOAM_BIG,
  BUOY, ROWBOAT, DOCK_POST, BEACH_FENCE, SHOWER, SIGN_BEACH,
} from "../engine/propsLib/beach";

// Overlay: '~' = automatic (sea / baked shore / sand), others force a terrain.
const OVERLAY = [
  "~~~~~~~~~DDDD~~",
  "~~~~~~~~~DDDD~~",
  "~~~~~~~~~~DD~~~",
  "~~~~~~~~~~DD~~~",
  "~~~~~~~~~~DD~~~",
  "~~~~~~~~~~DD~~~",
  "~~~~~~~~~~DD~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~",
  "tt~~~~~~~~~~~~t",
  "ttt~~~~bbb~~~tt",
  "tttt~~~bbb~~ttt",
  "tttt~~~bbb~~ttt",
  "ttttt~~bbb~tttt",
  "ttttt~~bbb~tttt",
  "tttttt~bbb~tttt",
];
const FORCED: Record<string, Terrain> = { D: DOCK, b: BOARDWALK, t: DUNE_GRASS };

const shoreY = (x: number) => 90 + 6 * Math.sin(x * 0.04 + 0.4) + 3 * Math.sin(x * 0.13 + 2.1);

const { map, legend } = bakeShore({
  cols: 15,
  rows: 26,
  shoreY,
  override: (tx, ty) => FORCED[OVERLAY[ty][tx]] ?? null,
});

/** Umbrella with its shadow (shadow is flat, drawn under everything). */
const umbrella = (u: typeof UMBRELLA_RED, x: number, y: number): PropPlace[] => [
  [UMBRELLA_SHADOW, x + 0.35, y + 1.55],
  [u, x, y],
];
const palm = (p: typeof PALM, x: number, y: number, shadow = false): PropPlace[] => [
  ...(shadow ? [[PALM_SHADOW, x + 0.7, y + 2.65] as const] : []),
  [p, x, y],
];

const props: PropPlace[] = [
  // ── sea ──
  [FOAM_BIG, 0.55, 2.55], [SEA_ROCK_BIG, 0.6, 1.5],
  [FOAM_SMALL, 4.05, 3.75], [SEA_ROCK, 4.2, 3.2],
  [ROWBOAT, 5.6, 0.6],
  [BUOY, 13.4, 2.6], [BUOY, 2.6, 0.2], [BUOY, 7.8, 3.6],
  // pier posts + gulls
  [DOCK_POST, 9.55, 2.4], [DOCK_POST, 12.05, 3.4], [DOCK_POST, 9.55, 4.6], [DOCK_POST, 12.05, 5.5],
  [DOCK_POST, 8.6, 0.6], [DOCK_POST, 13.05, 0.9],
  [SEAGULL, 12.3, 1.3], [SEAGULL, 9.3, 0.15],

  // ── shore & sand ──
  [LIFEGUARD, 6.0, 5.4],
  [SURFBOARDS, 13.4, 6.7],
  [CRAB, 3.2, 7.2], [CRAB, 13.1, 9.9], [STARFISH, 8.6, 8.1], [STARFISH, 1.2, 12.9],
  [SEAGULL, 0.6, 7.3],

  ...umbrella(UMBRELLA_RED, 0.5, 8.4),
  [TOWEL_RED, 2.5, 9.2], [LOUNGER_BLUE, 0.4, 10.6],
  [COOLER, 3.3, 10.9],

  ...umbrella(UMBRELLA_BLUE, 10.8, 8.9),
  [LOUNGER_RED, 10.2, 11.0], [LOUNGER_RED, 11.4, 11.0], [TOWEL_ORANGE, 13.2, 10.6],

  [SANDCASTLE, 6.5, 9.4], [BUCKET, 8.1, 10.4], [SPADE, 6.0, 10.9], [BEACH_BALL, 5.1, 9.6],

  [VOLLEY_NET, 7.6, 12.2], [BEACH_BALL, 9.6, 14.4],

  ...umbrella(UMBRELLA_YELLOW, 2.6, 13.4),
  [TOWEL_BLUE, 1.0, 14.6], [TOWEL_GREEN, 4.6, 15.0], [SANDCASTLE_SMALL, 3.6, 16.6], [BUCKET_BLUE, 2.4, 17.0],

  ...umbrella(UMBRELLA_PINK, 10.6, 15.4),
  [LOUNGER_YELLOW, 12.5, 16.0], [TOWEL_PURPLE, 9.5, 16.9],

  [TOWEL_RED, 7.0, 16.3], [LOUNGER_GREEN, 0.3, 17.6],
  ...umbrella(UMBRELLA_RED, 5.3, 17.6),
  [TOWEL_ORANGE, 13.4, 13.4], [CRAB, 8.4, 19.0],

  // ── dunes ──
  [ICECREAM_KIOSK, 10.3, 17.9],
  [SHOWER, 6.1, 20.6], [SIGN_BEACH, 10.2, 21.2],
  [BEACH_FENCE, 2.6, 19.2], [BEACH_FENCE, 3.75, 19.2],
  ...palm(PALM, -0.6, 17.4),
  ...palm(PALM_B, 12.6, 19.6),
  ...palm(PALM_B, -0.4, 22.3),
  ...palm(PALM, 11.0, 22.6),
  [SEAGULL, 4.8, 23.6],
];

export const worldModule = defineWorld({
  title: "La Playa",
  npcCount: 46,
  background: "#3858b8",
  legend,
  map,
  props,
  outfit: {
    hats: { none: 5, sunhat: 3, cap: 2.5, bandana: 0.4 },
    lowers: { shorts: 6, skirt: 2, pants: 0.6 },
    tops: [
      "#f85858", "#f89838", "#f8d838", "#58c8f8", "#3878e8", "#f878b8", "#ffffff",
      "#48c8a8", "#a8e058", "#f8a8c8", "#68e0e8", "#f86890", "#b888f0",
    ],
    lowerColors: ["#3870d8", "#f05858", "#48b8a0", "#f8c838", "#e8e8f0", "#304878", "#f08838", "#8858c8"],
  },
});
