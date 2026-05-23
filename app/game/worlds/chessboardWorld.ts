import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE, drawChessPiece, drawHourglass, drawGiantHand,
  type ChessKind,
} from "../sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 36;

type Piece = { x: number; y: number; color: string; kind: ChessKind };
type Hand = { x: number; y: number; side: "top" | "bottom" | "left" | "right" };

export type ChessScene = {
  board: { x: number; y: number; size: number; cell: number };
  pieces: Piece[];
  hourglass: { x: number; y: number };
  hands: Hand[];
};

function buildScene(): ChessScene {
  const cell = 50;
  const size = cell * 8; // 400
  const board = {
    x: (WIDTH - size) / 2,
    y: 180,
    size,
    cell,
  };

  const colors = ["#e23a3a", "#3a78c9", "#f0c842", "#3aa86a", "#a85ad4", "#e8853a", "#ffffff", "#1a1a1a"];
  const kinds: ChessKind[] = ["pawn", "rook", "bishop", "knight", "queen", "king"];

  // Place pieces in starting-row positions but multicolor + random kinds for visual variety
  const pieces: Piece[] = [];
  const seed0 = 0xBEEF;
  const rng = createRng(seed0);
  // back row top
  for (let c = 0; c < 8; c++) {
    pieces.push({
      x: board.x + c * cell + cell / 2,
      y: board.y + cell / 2,
      color: colors[c % colors.length],
      kind: kinds[randInt(rng, 0, kinds.length)],
    });
  }
  // pawn row top
  for (let c = 0; c < 8; c++) {
    pieces.push({
      x: board.x + c * cell + cell / 2,
      y: board.y + cell + cell / 2,
      color: colors[(c + 2) % colors.length],
      kind: "pawn",
    });
  }
  // pawn row bottom
  for (let c = 0; c < 8; c++) {
    pieces.push({
      x: board.x + c * cell + cell / 2,
      y: board.y + size - cell - cell / 2,
      color: colors[(c + 4) % colors.length],
      kind: "pawn",
    });
  }
  // back row bottom
  for (let c = 0; c < 8; c++) {
    pieces.push({
      x: board.x + c * cell + cell / 2,
      y: board.y + size - cell / 2,
      color: colors[(c + 5) % colors.length],
      kind: kinds[randInt(rng, 0, kinds.length)],
    });
  }
  // scattered loose pieces mid-board (mid-game feel)
  pieces.push({ x: board.x + 2 * cell + cell / 2, y: board.y + 3 * cell + cell / 2, color: "#e23a3a", kind: "knight" });
  pieces.push({ x: board.x + 5 * cell + cell / 2, y: board.y + 4 * cell + cell / 2, color: "#3a78c9", kind: "bishop" });
  pieces.push({ x: board.x + 4 * cell + cell / 2, y: board.y + 5 * cell + cell / 2, color: "#f0c842", kind: "queen" });

  const hourglass = { x: 60, y: 110 };

  const hands: Hand[] = [
    { x: 120, y: HEIGHT - 30, side: "bottom" },
    { x: WIDTH - 100, y: HEIGHT - 30, side: "bottom" },
    { x: 80, y: 60, side: "top" },
  ];

  return { board, pieces, hourglass, hands };
}

function collides(scene: ChessScene, x: number, y: number, r: number): boolean {
  for (const p of scene.pieces) {
    const dxp = p.x - x, dyp = p.y - y;
    if (dxp * dxp + dyp * dyp < (16 + r) * (16 + r)) return true;
  }
  // hourglass
  const dh = scene.hourglass;
  if (x > dh.x - 20 && x < dh.x + 20 && y > dh.y - 30 && y < dh.y + 30) return true;
  // hand areas
  for (const h of scene.hands) {
    const dx = h.x - x, dy = h.y - y;
    if (dx * dx + dy * dy < (40 + r) * (40 + r)) return true;
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as ChessScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.42;
  const b = scene.board;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 1000; i++) {
      // Place INSIDE board area on empty cells; some chars off-board on wood table
      const onBoard = rng() < 0.7;
      let x: number, y: number;
      if (onBoard) {
        x = randRange(rng, b.x + 6, b.x + b.size - 6);
        y = randRange(rng, b.y + 6, b.y + b.size - 6);
      } else {
        // edges of table
        if (rng() < 0.5) {
          x = randRange(rng, 20, WIDTH - 20);
          y = rng() < 0.5 ? randRange(rng, 20, b.y - 20) : randRange(rng, b.y + b.size + 20, HEIGHT - 20);
        } else {
          y = randRange(rng, 20, HEIGHT - 20);
          x = rng() < 0.5 ? randRange(rng, 20, b.x - 14) : randRange(rng, b.x + b.size + 14, WIDTH - 20);
        }
      }
      if (collides(scene, x, y, 10)) continue;
      let ok = true;
      for (const n of npcs) {
        const dxn = n.x - x, dyn = n.y - y;
        if (dxn * dxn + dyn * dyn < minDist * minDist) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
    return { x: WIDTH / 2, y: HEIGHT / 2 };
  }

  for (let i = 0; i < NPC_COUNT; i++) {
    const p = tryPlace();
    npcs.push({ x: p.x, y: p.y, variant: randInt(rng, 0, 12) });
  }
  const julio = tryPlace();
  return { julio, npcs };
}

function renderBackground(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as ChessScene;
  // Wood table base
  ctx.fillStyle = "#7a4a22";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // grain
  ctx.fillStyle = "#5a3a1a";
  for (let y = 0; y < HEIGHT; y += 6) {
    if ((y * 13) & 1) ctx.fillRect(0, y, WIDTH, 1);
  }
  ctx.fillStyle = "#a87a4a";
  for (let y = 3; y < HEIGHT; y += 12) {
    ctx.fillRect(0, y, WIDTH, 1);
  }
  // wood knots
  ctx.fillStyle = "#3a2a14";
  for (let i = 0; i < 6; i++) {
    const x = (i * 137) % WIDTH;
    const y = ((i * 71) % HEIGHT);
    ctx.beginPath();
    ctx.ellipse(x, y, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chessboard frame (dark border)
  const b = scene.board;
  ctx.fillStyle = "#3a2a14";
  ctx.fillRect(b.x - 8, b.y - 8, b.size + 16, b.size + 16);
  ctx.fillStyle = "#f0c842";
  ctx.fillRect(b.x - 5, b.y - 5, b.size + 10, b.size + 10);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(b.x - 3, b.y - 3, b.size + 6, b.size + 6);

  // Squares
  const light = "#e8d8a8";
  const dark = "#7a4a22";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sx = b.x + c * b.cell;
      const sy = b.y + r * b.cell;
      ctx.fillStyle = (r + c) % 2 === 0 ? light : dark;
      ctx.fillRect(sx, sy, b.cell, b.cell);
    }
  }
  // Square outline grid
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let i = 0; i <= 8; i++) {
    ctx.fillRect(b.x + i * b.cell, b.y, 1, b.size);
    ctx.fillRect(b.x, b.y + i * b.cell, b.size, 1);
  }
  // Coordinate letters/numbers
  ctx.fillStyle = "#5a3a1a";
  ctx.font = "bold 10px ui-monospace, monospace";
  ctx.textAlign = "center";
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  for (let i = 0; i < 8; i++) {
    ctx.fillText(files[i], b.x + i * b.cell + b.cell / 2, b.y - 6);
    ctx.fillText(`${8 - i}`, b.x - 8, b.y + i * b.cell + b.cell / 2 + 4);
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as ChessScene;
  drawHourglass(ctx, scene.hourglass.x, scene.hourglass.y);
  for (const p of scene.pieces) drawChessPiece(ctx, p.x, p.y, p.color, p.kind);
}

function renderOver(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as ChessScene;
  // Hands on top — overlap chars near edges
  for (const h of scene.hands) drawGiantHand(ctx, h.x, h.y, h.side);
}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "El Tablero",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
