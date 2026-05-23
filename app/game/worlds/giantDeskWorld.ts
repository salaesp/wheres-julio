import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawGiantBook, drawGiantPencil, drawGiantMug,
  drawGiantRuler, drawGiantEraser, drawGiantSharpener,
} from "../sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 42;
const MARGIN = 16;

type Book = { x: number; y: number; w: number; h: number; color: string };
type Pencil = { x: number; y: number; len: number; color: string };
type Ruler = { x: number; y: number; len: number };

export type GiantScene = {
  books: Book[];
  pencils: Pencil[];
  mug: { x: number; y: number };
  rulers: Ruler[];
  erasers: { x: number; y: number }[];
  sharpeners: { x: number; y: number }[];
};

function buildScene(): GiantScene {
  const books: Book[] = [
    // stack 1 top-left
    { x: 40, y: 110, w: 130, h: 30, color: "#e23a3a" },
    { x: 50, y: 140, w: 120, h: 26, color: "#3aa86a" },
    { x: 30, y: 166, w: 140, h: 28, color: "#3a78c9" },
    // stack 2 bottom-right
    { x: 290, y: 620, w: 150, h: 32, color: "#a85ad4" },
    { x: 280, y: 652, w: 160, h: 28, color: "#f0c842" },
    // single book bottom-left
    { x: 50, y: 700, w: 130, h: 30, color: "#e8853a" },
  ];

  const pencils: Pencil[] = [
    { x: 200, y: 270, len: 180, color: "#e23a3a" },
    { x: 60, y: 320, len: 160, color: "#3a78c9" },
    { x: 300, y: 380, len: 140, color: "#3aa86a" },
    { x: 50, y: 540, len: 170, color: "#f0c842" },
  ];

  const mug = { x: 380, y: 240 };

  const rulers: Ruler[] = [
    { x: 90, y: 430, len: 280 },
    { x: 60, y: 760, len: 200 },
  ];

  const erasers = [
    { x: 240, y: 350 },
    { x: 130, y: 600 },
    { x: 380, y: 500 },
  ];

  const sharpeners = [
    { x: 290, y: 530 },
    { x: 50, y: 250 },
  ];

  return { books, pencils, mug, rulers, erasers, sharpeners };
}

function collides(scene: GiantScene, x: number, y: number, r: number): boolean {
  // books (chars can't stand on top — visually too tall)
  for (const b of scene.books) {
    if (x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r) return true;
  }
  // pencils
  for (const p of scene.pencils) {
    if (x > p.x - r && x < p.x + p.len + r && y > p.y - r && y < p.y + 16 + r) return true;
  }
  // mug (cylinder)
  const dx = scene.mug.x - x, dy = scene.mug.y - y;
  if (dx * dx + dy * dy < (40 + r) * (40 + r)) return true;
  // rulers
  for (const r2 of scene.rulers) {
    if (x > r2.x - 4 && x < r2.x + r2.len + 4 && y > r2.y - 4 && y < r2.y + 24) return true;
  }
  // erasers
  for (const e of scene.erasers) {
    if (x > e.x - 4 && x < e.x + 46 && y > e.y - 4 && y < e.y + 22) return true;
  }
  // sharpeners
  for (const s of scene.sharpeners) {
    if (x > s.x - 4 && x < s.x + 30 && y > s.y - 4 && y < s.y + 22) return true;
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as GiantScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.4;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 800; i++) {
      const x = randRange(rng, MARGIN, WIDTH - MARGIN);
      const y = randRange(rng, MARGIN, HEIGHT - MARGIN - 30);
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
  // Wooden desk surface — warm brown
  ctx.fillStyle = "#a87a4a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // wood grain horizontal lines
  ctx.fillStyle = "#8a5a2a";
  for (let y = 0; y < HEIGHT; y += 8) {
    if ((y * 17) & 1) ctx.fillRect(0, y, WIDTH, 1);
  }
  ctx.fillStyle = "#c89a5a";
  for (let y = 4; y < HEIGHT; y += 14) {
    ctx.fillRect(0, y, WIDTH, 1);
  }
  // wood knots
  ctx.fillStyle = "#5a3a1a";
  for (let i = 0; i < 8; i++) {
    const x = (i * 137) % WIDTH;
    const y = ((i * 71) % HEIGHT);
    ctx.beginPath();
    ctx.ellipse(x, y, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a4a22";
    ctx.fillRect(x - 4, y - 1, 8, 2);
    ctx.fillStyle = "#5a3a1a";
  }
  // edge plank seams (vertical board joins)
  ctx.fillStyle = "#5a3a1a";
  for (let x = 0; x < WIDTH; x += 120) {
    ctx.fillRect(x, 0, 2, HEIGHT);
  }
  // scattered crumbs / dust
  ctx.fillStyle = "#dcb87a";
  for (let x = 0; x < WIDTH; x += 6) {
    for (let y = 0; y < HEIGHT; y += 6) {
      if (((x * 31 + y * 17) & 31) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // graphite smudges
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let i = 0; i < 6; i++) {
    const x = (i * 81) % WIDTH;
    const y = 80 + ((i * 137) % (HEIGHT - 120));
    ctx.fillRect(x, y, 12, 3);
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as GiantScene;
  // rulers laid flat (under most)
  for (const r of scene.rulers) drawGiantRuler(ctx, r.x, r.y, r.len);
  // pencils
  for (const p of scene.pencils) drawGiantPencil(ctx, p.x, p.y, p.len, p.color);
  // erasers + sharpeners
  for (const e of scene.erasers) drawGiantEraser(ctx, e.x, e.y);
  for (const s of scene.sharpeners) drawGiantSharpener(ctx, s.x, s.y);
  // book stacks
  for (const b of scene.books) drawGiantBook(ctx, b.x, b.y, b.w, b.h, b.color);
  // mug (tall — on top)
  drawGiantMug(ctx, scene.mug.x, scene.mug.y);
}

function renderOver(_ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "El Mundo Gigante",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
