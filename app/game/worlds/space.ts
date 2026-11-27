// Mundo 18 — El Espacio: a Pokémon-style space centre. Planets, a comet and a
// satellite drift in the void above the lunar horizon. On the moon: a domed
// base on a rocky plateau, a launch pad with a gantry and a big rocket, craters
// (one with a crashed UFO), a lander, a rover, dishes and solar panels, all
// linked by paved walkways to the airlock. Below, the station interior: a
// control room (screens, consoles, holo table), a laboratory (specimen tubes,
// cryo pod, bench), a cargo hangar and a rest area, with hull windows to space.
import { defineWorld, type PropPlace } from "../engine/world";
import {
  STARFIELD, MOON_DUST, MOON_HILL, HILL_FACE, CRATER_PIT, MOON_ROAD, LAUNCH_PAD, PAD_FACE,
  DECK, DECK_TREAD, DECK_HAZARD, DECK_GRATE, LAB_TILE, CONTROL_CARPET, DORM_CARPET, HANGAR_STEEL,
  HULL_WALL, HULL_WALL_LOW,
} from "../engine/terrains/space";
import {
  PLANET_RINGED, PLANET_EARTH, PLANET_RED, MOONLET, ASTEROID, SATELLITE, COMET,
  ROCKET_BIG, GANTRY, PAD_TEXT, MOON_BASE, LANDER, ROVER, MOON_FLAG, DISH, SOLAR_FARM, SOLAR_TALL,
  AIRLOCK, WINDOW_EARTH, WINDOW_STARS, PLAQUE_CONTROL, PLAQUE_LAB, PLAQUE_HANGAR, PLAQUE_REST,
  SCREEN_WALL, CONSOLE_DESK, HOLO_TABLE, TUBE_CYAN, TUBE_PURPLE, TUBE_PINK, CRYO_POD, LAB_BENCH,
  BUNK, VENDING, LOCKERS, SIGN_LAUNCH, CRATE_HAZ, TANKS, CABLE_A, CABLE_B, CABLE_C, MOON_LAMP,
  UFO, ALIEN_BLUE, ALIEN_PINK, ALIEN_PURPLE, ALIEN_ORANGE, ASTRO_WHITE, ASTRO_ORANGE,
  MOON_ROCK, MOON_ROCK_BIG, retint,
} from "../engine/propsLib/space";
// reused from other worlds
import { ROPE_72, METEORITE, SIGN_SPACE, CASE_MINERALS, BENCH } from "../engine/propsLib/museum";
import { CONE, BARRIER_H } from "../engine/propsLib/town";
import { SEISMOGRAPH, CRATES, BACKPACKS } from "../engine/propsLib/volcano";
import { BARREL } from "../engine/propsLib/pirate";
import { DRINKING_FOUNTAIN } from "../engine/propsLib/school";
import { LED_BLUE, LED_RED, LED_YELLOW } from "../engine/propsLib/computer";

// Steel versions of reused wooden / brown props.
const DRUM = retint(BARREL, { a: "#ff9c50", b: "#e0702c", c: "#b8501c", d: "#7c3010", e: "#ffc890", m: "#c8d0e8", n: "#6a749c" });
const STEEL_CRATES = retint(CRATES, { a: "#dce6fa", b: "#aebcdc", c: "#8090b8", d: "#58688e", o: "#f0c030" });
const PACKS = retint(BACKPACKS, { a: "#ffffff", b: "#e4e8f6", c: "#a8b0d0", k: "#586088", f: "#f0b070", g: "#e07830", h: "#a84820" });
const BENCH_BLUE = retint(BENCH, { r: "#6c94f0", R: "#4668c8", q: "#2c4090", w: "#a8c0ff", a: "#d8e0f4", b: "#aab4d4", c: "#7a86ac", d: "#566290" });

const props: PropPlace[] = [
  // ── the void: planets, comet, satellite, asteroids ──
  [PLANET_RINGED, 0.4, 0.45], [PLANET_EARTH, 10.2, 0.3], [PLANET_RED, 6.2, 1.9],
  [COMET, 2.4, 2.1], [SATELLITE, 5.4, 0.15], [MOONLET, 13.4, 2.0], [MOONLET, 8.4, 0.9],
  [ASTEROID, 3.9, 3.1], [ASTEROID, 7.7, 2.9],

  // ── plateau: the moon base ──
  [MOON_BASE, 0.0, 4.75],

  // ── launch pad: gantry, rocket, cordon, drums ──
  [GANTRY, 8.45, 3.38],
  [ROCKET_BIG, 10.4, 3.44],
  [PAD_TEXT, 12.9, 8.55],
  [DRUM, 9.6, 8.3], [DRUM, 10.35, 8.6], [CONE, 13.7, 9.0], [CONE, 8.15, 9.2],
  [ASTRO_WHITE, 13.35, 6.1],
  [ROPE_72, 9.9, 9.3],
  [CABLE_A, 6.6, 10.35],

  // ── crater between base and pad ──
  [MOON_FLAG, 6.1, 4.5],
  [MOON_ROCK, 6.9, 5.7], [MOON_ROCK, 6.35, 8.4], [MOON_ROCK, 7.0, 7.4],
  [ALIEN_BLUE, 4.7, 9.9],

  // ── walkway band ──
  [SIGN_LAUNCH, 10.3, 10.85],
  [SEISMOGRAPH, 0.15, 9.7], [DISH, 6.05, 9.15],
  [MOON_LAMP, 1.3, 9.6], [MOON_LAMP, 13.9, 10.7],
  [MOON_ROCK, 3.9, 10.2], [MOON_ROCK, 13.0, 12.3],
  [ALIEN_PINK, 12.2, 12.1],

  // ── south surface: solar, rover, lander, crashed UFO ──
  [SOLAR_TALL, 0.0, 12.55],
  [ROVER, 3.1, 12.85],
  [LANDER, 9.1, 12.5],
  [UFO, 12.2, 13.0],
  [MOON_ROCK, 5.3, 14.0], [MOON_ROCK, 11.6, 14.3],
  [ALIEN_ORANGE, 8.8, 14.0],
  [CABLE_B, 6.4, 13.2],

  // ── hull: windows, plaques, screens, airlock ──
  [SCREEN_WALL, 0.15, 15.5], [PLAQUE_CONTROL, 1.9, 14.85],
  [AIRLOCK, 6.0, 15.0],
  [WINDOW_EARTH, 9.1, 15.5], [WINDOW_STARS, 12.1, 15.5], [PLAQUE_LAB, 11.4, 14.85],

  // ── control room ──
  [CONSOLE_DESK, 0.3, 17.2], [CONSOLE_DESK, 3.0, 17.2],
  [HOLO_TABLE, 1.9, 19.2],
  [LED_BLUE, 0.2, 20.8], [LED_RED, 5.1, 20.9], [LED_YELLOW, 4.9, 19.4],
  [ASTRO_ORANGE, 0.5, 19.4], [PACKS, 5.0, 21.1],

  // ── corridor ──
  [MOON_LAMP, 6.1, 17.0], [MOON_LAMP, 8.35, 17.0],
  [DRINKING_FOUNTAIN, 8.5, 19.7], [SIGN_SPACE, 6.0, 20.2],
  [CABLE_C, 6.6, 21.3],
  [ALIEN_PURPLE, 7.4, 23.4],

  // ── laboratory ──
  [TUBE_CYAN, 9.2, 16.95], [TUBE_PURPLE, 10.4, 16.95], [TUBE_PINK, 11.6, 16.95],
  [CRYO_POD, 13.1, 16.9],
  [LAB_BENCH, 9.6, 19.8], [CASE_MINERALS, 13.0, 19.9],
  [METEORITE, 12.2, 21.3],
  [ASTRO_WHITE, 9.3, 21.0],

  // ── cargo hangar ──
  [PLAQUE_HANGAR, 1.0, 22.2],
  [LOCKERS, 0.1, 22.9],
  [STEEL_CRATES, 3.0, 23.1], [CRATE_HAZ, 3.4, 24.9], [DRUM, 5.0, 23.6], [DRUM, 4.9, 24.7],
  [TANKS, 1.0, 24.9], [BARRIER_H, 2.0, 22.6],

  // ── rest area ──
  [PLAQUE_REST, 12.3, 22.2],
  [BUNK, 11.0, 22.9], [VENDING, 13.5, 23.1],
  [BENCH_BLUE, 9.3, 24.9], [ALIEN_BLUE, 10.4, 24.0],
];

export const worldModule = defineWorld({
  title: "El Espacio",
  npcCount: 46,
  background: "#0a0a2e",
  legend: {
    v: STARFIELD, m: MOON_DUST, h: MOON_HILL, H: HILL_FACE, c: CRATER_PIT, r: MOON_ROAD,
    p: LAUNCH_PAD, P: PAD_FACE,
    W: HULL_WALL, L: HULL_WALL_LOW, A: DECK_HAZARD, d: DECK, t: DECK_TREAD, g: DECK_GRATE,
    b: LAB_TILE, k: CONTROL_CARPET, z: DORM_CARPET, s: HANGAR_STEEL,
  },
  map: [
    "vvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvv",
    "mmmvvvvvvvvvmmm",
    "hhhhhhmmppppppp",
    "hhhhhhmmppppppp",
    "hhhhhhccppppppp",
    "hhhhhhccppppppp",
    "HHrrHHccppppppp",
    "mmrrmmmmPPPPPPP",
    "rrrrrrrrrrrrrrr",
    "rrrrrrrrrrrrrrr",
    "mmmmmmrrrmmmccc",
    "mmmmmmrrrmmmccc",
    "WWWWWWAAAWWWWWW",
    "LLLLLLAAALLLLLL",
    "kkkkkkdtdbbbbbb",
    "kkkkkkdtdbbbbbb",
    "kkkkkkdtdbbbbbb",
    "kkkkkkdtdbbbbbb",
    "kkkkkkdtdbbbbbb",
    "LLLLdd" + "dtd" + "ddLLLL",
    "sssggg" + "dtd" + "zzzzzz",
    "sssggg" + "dtd" + "zzzzzz",
    "sssggg" + "dtd" + "zzzzzz",
  ],
  props,
  outfit: {
    // Astronauts: white / orange / silver suits, goggles as visors. Never green.
    hats: { none: 6, helmet: 1.3, dinohood: 0.5 },
    lowers: { pants: 1 },
    tops: [
      "#f8f8f8", "#f08030", "#d0d8e8", "#f8c838", "#e84848", "#58a8f0",
      "#f8f8f8", "#f08030", "#a0a8c0", "#f078a8", "#b868e8", "#38b0c8",
    ],
    lowerColors: ["#f8f8f8", "#d0d8e8", "#a0a8c0", "#f08030", "#4860a8", "#686878"],
  },
});
