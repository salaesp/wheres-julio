// Mundo 18 — El Espacio: a moon base under a starfield. Planets drift in the
// void, rockets and a lander stand on the lunar dust, aliens and a UFO mingle
// with astronauts, and the station deck has consoles, crates and solar panels.
import { defineWorld, type PropPlace } from "../engine/world";
import { STARFIELD, MOON_DUST, DECK, DECK_HAZARD } from "../engine/terrains/space";
import {
  PLANET_RINGED, PLANET_EARTH, PLANET_RED, MOONLET, ASTEROID, SATELLITE,
  ROCKET, ROCKET_BLUE, LANDER, RADAR, SOLAR_PANEL, MOON_ROCK, MOON_ROCK_BIG, MOON_FLAG,
  ALIEN_BLUE, ALIEN_PURPLE, ALIEN_PINK, UFO, ROVER, DOME, CONSOLE, SPACE_CRATE,
  OXYGEN_TANKS, SPACE_LAMP, SPACE_HELMET,
} from "../engine/propsLib/space";

const props: PropPlace[] = [
  // ── the void ──
  [PLANET_RINGED, 0.3, 0.5], [PLANET_EARTH, 9.2, 0.2], [PLANET_RED, 5.6, 2.3],
  [MOONLET, 13.2, 2.9], [ASTEROID, 3.6, 3.3], [ASTEROID, 7.9, 3.7], [SATELLITE, 4.8, 0.3],
  [MOONLET, 12.4, 0.2],

  // ── moon surface ──
  [DOME, 0.5, 5.3],
  [ROCKET, 12.2, 5.1], [ROCKET_BLUE, 9.9, 6.7],
  [MOON_FLAG, 5.2, 6.4],
  [LANDER, 5.9, 8.1],
  [RADAR, 0.4, 9.3],
  [MOON_ROCK_BIG, 3.4, 8.4], [MOON_ROCK, 8.8, 9.2], [MOON_ROCK, 1.6, 12.8],
  [ROVER, 9.3, 11.6],
  [UFO, 2.4, 11.3],
  [ALIEN_BLUE, 7.4, 6.2], [ALIEN_PURPLE, 13.4, 10.6], [ALIEN_PINK, 4.6, 13.1],
  [MOON_ROCK, 12.4, 13.4], [MOON_ROCK_BIG, 6.6, 13.5], [SPACE_HELMET, 11.2, 9.6],
  [ALIEN_BLUE, 0.8, 7.6],

  // ── station deck ──
  [SPACE_LAMP, 0.4, 15.1], [SPACE_LAMP, 6.9, 15.1], [SPACE_LAMP, 13.8, 15.1],
  [CONSOLE, 1.0, 16.9], [CONSOLE, 10.2, 17.2],
  [SOLAR_PANEL, 4.4, 17.0], [SOLAR_PANEL, 12.0, 21.6],
  [SPACE_CRATE, 8.6, 19.0], [SPACE_CRATE, 9.4, 19.6], [OXYGEN_TANKS, 13.0, 18.4],
  [ALIEN_PURPLE, 6.1, 20.4], [ALIEN_PINK, 2.4, 22.6], [ALIEN_BLUE, 11.4, 23.6],
  [OXYGEN_TANKS, 0.4, 20.0], [SPACE_CRATE, 5.4, 24.0], [CONSOLE, 6.4, 22.4],
  [SPACE_HELMET, 3.2, 19.2], [SPACE_HELMET, 9.8, 22.4],
  [SPACE_LAMP, 0.4, 24.0], [SPACE_LAMP, 13.8, 24.0],
];

export const worldModule = defineWorld({
  title: "El Espacio",
  npcCount: 46,
  background: "#0a0a2c",
  legend: { v: STARFIELD, m: MOON_DUST, d: DECK, h: DECK_HAZARD },
  map: [
    "vvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvv",
    "vvvvvvvvvvvvvvv",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "mmmmmmmmmmmmmmm",
    "hhhhhhhhhhhhhhh",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
    "ddddddddddddddd",
  ],
  props,
  outfit: {
    // Astronauts: white / orange / silver suits, goggles as visors, no cowboys.
    hats: { goggles: 3, helmet: 0.6, none: 3, cap: 1 },
    lowers: { pants: 1 },
    tops: [
      "#f8f8f8", "#f08030", "#d0d8e8", "#f8c838", "#e84848", "#58a8f0",
      "#f8f8f8", "#f08030", "#a0a8c0", "#f078a8", "#b868e8", "#38b0c8",
    ],
    lowerColors: ["#f8f8f8", "#d0d8e8", "#a0a8c0", "#f08030", "#4860a8", "#686878"],
  },
});
