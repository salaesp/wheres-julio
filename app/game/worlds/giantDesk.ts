// Mundo 10 — El Mundo Gigante: tiny people on a giant school desk, between
// notebook sheets, pencils, a coffee mug, books, a phone and other giant things.
import { defineWorld, type PropPlace } from "../engine/world";
import { WOOD, PAPER_RULED, PAPER_MARGIN, PAPER_HOLE, PAPER_EDGE, PAPER_GRID } from "../engine/terrains/desk";
import {
  shadowed, PENCIL, PENCIL_RED, PENCIL_BLUE, PENCIL_STUB, PEN, RULER, ERASER, ERASER_CRUMBS,
  SHARPENER, SHAVINGS, SHAVINGS_RED, COFFEE_SPILL, MUG, MUG_SHADOW, MUG_STEAM, COFFEE_STAIN, BOOKS, CLIP, CLIP_RED, CLIP_BLUE,
  POSTIT_YELLOW, POSTIT_PINK, POSTIT_GREEN, POSTIT_BLUE, POSTIT_ORANGE, SCISSORS, PHONE, COOKIE, CRUMBS,
} from "../engine/propsLib/desk";

const MUG_X = 10.55, MUG_Y = 1.0;

const props: PropPlace[] = [
  // ── on the ruled sheet (top-left)
  [COFFEE_STAIN, 6.6, 7.6],
  ...shadowed(PENCIL_BLUE, 0.2, 0.8, "paper"),
  ...shadowed(POSTIT_PINK, 7.3, 4.1, "paper"),
  ...shadowed(PENCIL, 1.4, 6.4, "paper"),
  ...shadowed(CLIP, 3.2, 4.5, "paper"),
  // ── mug + spill (top-right, on wood)
  [MUG_SHADOW, MUG_X, MUG_Y],
  [COFFEE_SPILL, 11.0, 6.0],
  [MUG, MUG_X, MUG_Y],
  [MUG_STEAM, MUG_X + 10 / 16, MUG_Y - 12 / 16],
  ...shadowed(POSTIT_YELLOW, 10.2, 8.7),
  ...shadowed(COOKIE, 12.7, 8.3),
  [CRUMBS, 11.9, 10.3], [CRUMBS, 13.6, 6.6],
  ...shadowed(ERASER, 12.2, 10.4),
  ...shadowed(ERASER_CRUMBS, 10.6, 11.3),
  // ── ruler across the desk
  ...shadowed(RULER, 0.9, 12.3),
  // ── phone (left) + stub pencil
  ...shadowed(PHONE, 0.35, 14.0, "wood", 4),
  ...shadowed(PENCIL_STUB, 4.85, 14.5),
  ...shadowed(CLIP_RED, 4.1, 19.4),
  // ── squared sheet (bottom-right)
  ...shadowed(PEN, 6.2, 15.0, "paper"),
  ...shadowed(SHARPENER, 12.7, 14.3, "paper"),
  [SHAVINGS, 11.2, 14.6], [SHAVINGS_RED, 13.0, 16.2],
  ...shadowed(POSTIT_GREEN, 11.9, 17.3, "paper"),
  ...shadowed(SCISSORS, 9.6, 19.6, "paper"),
  ...shadowed(POSTIT_BLUE, 6.6, 20.4, "paper"),
  ...shadowed(CLIP_BLUE, 7.0, 18.6, "paper"),
  // ── books + loose pencil at the bottom
  ...shadowed(BOOKS, -0.25, 20.8, "wood", 4),
  ...shadowed(PENCIL_RED, 5.2, 22.6),
  ...shadowed(POSTIT_ORANGE, 12.7, 23.9),
  ...shadowed(CLIP, 9.4, 13.4),
];

export const worldModule = defineWorld({
  title: "El Mundo Gigante",
  npcCount: 46,
  background: "#5c3418",
  legend: {
    ".": WOOD, h: PAPER_HOLE, e: PAPER_EDGE, m: PAPER_MARGIN, r: PAPER_RULED, q: PAPER_GRID,
  },
  map: [
    "...............",
    ".emrrrrrrr.....",
    ".emrrrrrrr.....",
    ".hmrrrrrrr.....",
    ".emrrrrrrr.....",
    ".emrrrrrrr.....",
    ".hmrrrrrrr.....",
    ".emrrrrrrr.....",
    ".emrrrrrrr.....",
    ".hmrrrrrrr.....",
    ".emrrrrrrr.....",
    "...............",
    "...............",
    "...............",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "......qqqqqqqqq",
    "...............",
    "...............",
    "...............",
  ],
  props,
});
