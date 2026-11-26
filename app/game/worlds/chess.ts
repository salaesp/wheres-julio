// Mundo 11 — El Tablero: tiny people on a giant chessboard sitting on a
// wooden table, among huge chess pieces, a chess clock and other games.
import { defineWorld, type PropPlace } from "../engine/world";
import type { PropDef } from "../engine/props";
import {
  TABLE, FRAME_T, FRAME_B, FRAME_R, FRAME_TR, FRAME_BR, SQUARE_LIGHT, SQUARE_DARK,
} from "../engine/terrains/boards";
import {
  W_PAWN, W_ROOK, W_BISHOP, W_KNIGHT, W_QUEEN, W_KING,
  B_PAWN, B_ROOK, B_BISHOP, B_KNIGHT, B_QUEEN, B_KING,
  W_PAWN_DOWN, B_PAWN_DOWN, B_BISHOP_DOWN, W_KING_DOWN,
  CHESS_CLOCK, DIE_RED, DIE_WHITE, DIE_BLUE, CHECKER_RED, CHECKER_RED_STACK, CHECKER_BLACK_STACK,
  LUDO_YELLOW, LUDO_BLUE, LUDO_GREEN, MUG, TROPHY, SCORESHEET, CARDS, coord,
} from "../engine/propsLib/chess";

const T = 16;
const BOARD_TOP = 4; // first board row (rank 8)

/** Place a piece standing on a square: file 0..5 (a..f), rank 1..8. */
function sq(def: PropDef, file: number, rank: number): PropPlace {
  const j = 8 - rank;
  const cx = file * 2 * T + T;
  const bottom = (BOARD_TOP + j * 2) * T + 2 * T - 4;
  return [def, (cx - def.w() / 2) / T, (bottom - def.h()) / T];
}

const coords: PropPlace[] = [
  ..."abcdef".split("").map((ch, i): PropPlace => [coord(ch), (i * 32 + 15) / T, (20 * T + 5) / T]),
  ..."87654321".split("").map((ch, j): PropPlace => [coord(ch), (12 * T + 6) / T, ((BOARD_TOP + j * 2) * T + 14) / T]),
];

const props: PropPlace[] = [
  ...coords,
  // ── pieces on the board (a mid-game position) ──
  sq(B_ROOK, 0, 8), sq(B_KING, 3, 8), sq(B_BISHOP, 5, 8),
  sq(B_PAWN, 1, 7), sq(B_PAWN, 4, 7),
  sq(B_KNIGHT, 2, 6), sq(B_PAWN, 5, 6),
  sq(W_QUEEN, 4, 5), sq(B_QUEEN, 0, 4),
  sq(W_BISHOP, 2, 4),
  sq(W_KNIGHT, 5, 3), sq(W_PAWN, 1, 3),
  sq(W_PAWN, 3, 2),
  sq(W_ROOK, 0, 1), sq(W_KING, 4, 1),
  [B_PAWN_DOWN, 6.3, 12.4],
  // ── top of the table ──
  [TROPHY, 0.4, 0.2], [CHESS_CLOCK, 5.6, -0.25], [MUG, 12.6, -0.2],
  [DIE_RED, 3.4, 1.3], [CHECKER_RED, 10.4, 1.7],
  // ── right strip: captured pieces ──
  [W_PAWN, 13.2, 3.7], [W_KNIGHT, 13.15, 8.5], [B_ROOK, 13.1, 12.9], [W_BISHOP, 13.2, 17.1],
  // ── bottom of the table ──
  [W_KING_DOWN, 0.6, 21.6], [B_BISHOP_DOWN, 8.6, 24.2], [W_PAWN_DOWN, 11.6, 21.5],
  [SCORESHEET, 5.2, 21.4], [CARDS, 12.3, 24.0],
  [DIE_WHITE, 4.2, 24.4], [DIE_BLUE, 6.0, 24.9], [DIE_RED, 13.6, 22.6],
  [CHECKER_BLACK_STACK, 2.4, 23.9], [CHECKER_RED_STACK, 0.4, 24.6], [CHECKER_RED, 9.6, 22.0],
  [LUDO_YELLOW, 7.6, 22.3], [LUDO_BLUE, 8.3, 22.7], [LUDO_GREEN, 4.4, 23.1],
];

// Board: 6 files (12 cols) × 8 ranks (16 rows), squares are 2×2 tiles.
const boardRow = (r: number) => {
  let s = "";
  for (let c = 0; c < 12; c++) s += ((Math.floor(c / 2) + Math.floor((r - BOARD_TOP) / 2)) % 2 === 0) ? "L" : "D";
  return s + "]ww";
};

const map: string[] = [
  "wwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwww",
  "^^^^^^^^^^^^7ww",
  ...Array.from({ length: 16 }, (_, i) => boardRow(BOARD_TOP + i)),
  "____________Jww",
  "wwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwww",
  "wwwwwwwwwwwwwww",
];

export const worldModule = defineWorld({
  title: "El Tablero",
  npcCount: 46,
  background: "#5a2c1c",
  legend: {
    w: TABLE, L: SQUARE_LIGHT, D: SQUARE_DARK,
    "^": FRAME_T, _: FRAME_B, "]": FRAME_R, "7": FRAME_TR, J: FRAME_BR,
  },
  map,
  props,
});
