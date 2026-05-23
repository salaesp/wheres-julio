import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawIgloo, drawPenguin, drawSeal, drawPolarBear,
  drawSnowman, drawSnowPile, drawReindeer, drawSleigh,
} from "../characters/sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 48;
const MARGIN = 20;

type Animal = { x: number; y: number; kind: "penguin" | "seal" | "bear" };
type Igloo = { x: number; y: number };
type Snowman = { x: number; y: number };
type Pile = { x: number; y: number; r: number };
type Reindeer = { x: number; y: number };

export type IceScene = {
  iglus: Igloo[];
  animals: Animal[];
  snowmen: Snowman[];
  piles: Pile[];
  sleigh: { x: number; y: number };
  reindeer: Reindeer[];
  icePatches: { x: number; y: number; rx: number; ry: number }[];
  tracks: { x: number; y: number }[];
};

function buildScene(): IceScene {
  const iglus: Igloo[] = [
    { x: 100, y: 130 },
    { x: 380, y: 150 },
    { x: 90, y: 460 },
    { x: 390, y: 530 },
  ];

  const animals: Animal[] = [
    // Penguin colony top
    { x: 200, y: 200, kind: "penguin" },
    { x: 230, y: 195, kind: "penguin" },
    { x: 260, y: 210, kind: "penguin" },
    { x: 245, y: 235, kind: "penguin" },
    { x: 215, y: 240, kind: "penguin" },
    { x: 275, y: 240, kind: "penguin" },
    // mid penguins
    { x: 60, y: 340, kind: "penguin" },
    { x: 430, y: 350, kind: "penguin" },
    // bottom penguins near seal
    { x: 150, y: 690, kind: "penguin" },
    { x: 320, y: 700, kind: "penguin" },
    // seals
    { x: 200, y: 600, kind: "seal" },
    { x: 280, y: 620, kind: "seal" },
    // polar bear center-mid (big)
    { x: 240, y: 400, kind: "bear" },
  ];

  const snowmen: Snowman[] = [
    { x: 50, y: 250 },
    { x: 430, y: 270 },
    { x: 50, y: 600 },
    { x: 250, y: 760 },
  ];

  const piles: Pile[] = [
    { x: 60, y: 180, r: 20 },
    { x: 420, y: 200, r: 22 },
    { x: 150, y: 410, r: 18 },
    { x: 360, y: 430, r: 20 },
    { x: 60, y: 520, r: 18 },
    { x: 420, y: 600, r: 20 },
    { x: 200, y: 530, r: 16 },
  ];

  const sleigh = { x: 200, y: 100 };
  // 4 reindeer pulling sleigh, in a line in front
  const reindeer: Reindeer[] = [
    { x: 150, y: 60 },
    { x: 120, y: 40 },
    { x: 90, y: 60 },
    { x: 60, y: 40 },
  ];

  const icePatches = [
    { x: 240, y: 300, rx: 60, ry: 18 },
    { x: 240, y: 500, rx: 90, ry: 24 },
    { x: 100, y: 700, rx: 40, ry: 14 },
    { x: 380, y: 720, rx: 50, ry: 16 },
  ];

  // little footprint tracks scattered
  const tracks = [
    { x: 100, y: 300 }, { x: 110, y: 320 }, { x: 100, y: 340 }, { x: 110, y: 360 },
    { x: 340, y: 300 }, { x: 350, y: 320 }, { x: 340, y: 340 },
    { x: 200, y: 550 }, { x: 210, y: 570 }, { x: 200, y: 590 },
  ];

  return { iglus, animals, snowmen, piles, sleigh, reindeer, icePatches, tracks };
}

function collides(scene: IceScene, x: number, y: number, r: number): boolean {
  for (const i of scene.iglus) {
    const dx = i.x - x, dy = i.y - y;
    if (dx * dx + dy * dy < (36 + r) * (36 + r)) return true;
  }
  for (const s of scene.snowmen) {
    const dx = s.x - x, dy = s.y - y;
    if (dx * dx + dy * dy < (16 + r) * (16 + r)) return true;
  }
  for (const p of scene.piles) {
    const dx = p.x - x, dy = p.y - y;
    if (dx * dx + dy * dy < (p.r + r) * (p.r + r)) return true;
  }
  // sleigh + reindeer area at top
  if (y < 130 && x < 240) return true;
  // big animals (bear) treat as obstacle
  for (const a of scene.animals) {
    if (a.kind === "bear") {
      const dxA = a.x - x, dyA = a.y - y;
      if (dxA * dxA + dyA * dyA < (32 + r) * (32 + r)) return true;
    } else if (a.kind === "seal") {
      const dxA = a.x - x, dyA = a.y - y;
      if (dxA * dxA + dyA * dyA < (20 + r) * (20 + r)) return true;
    } else {
      const dxA = a.x - x, dyA = a.y - y;
      if (dxA * dxA + dyA * dyA < (14 + r) * (14 + r)) return true;
    }
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as IceScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.4;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 800; i++) {
      const x = randRange(rng, MARGIN, WIDTH - MARGIN);
      const y = randRange(rng, 140, HEIGHT - MARGIN - 30);
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
  const scene = _scene as IceScene;
  // snow base
  ctx.fillStyle = "#e8eef8";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // snow speckle
  ctx.fillStyle = "#d4dce8";
  for (let x = 0; x < WIDTH; x += 18) {
    for (let y = 0; y < HEIGHT; y += 18) {
      if (((x * 31 + y * 17) & 7) === 0) ctx.fillRect(x, y, 3, 3);
    }
  }
  ctx.fillStyle = "#ffffff";
  for (let x = 9; x < WIDTH; x += 22) {
    for (let y = 9; y < HEIGHT; y += 22) {
      if (((x * 13 + y * 23) & 7) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // ice patches (light blue ovals)
  for (const p of scene.icePatches) {
    ctx.fillStyle = "#bcd8f0";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dceaf8";
    ctx.beginPath();
    ctx.ellipse(p.x - 2, p.y - 2, Math.max(2, p.rx - 4), Math.max(1, p.ry - 4), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // footprint tracks
  ctx.fillStyle = "#a8b8c8";
  for (const t of scene.tracks) {
    ctx.fillRect(t.x, t.y, 3, 2);
    ctx.fillRect(t.x + 4, t.y + 1, 3, 2);
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as IceScene;
  for (const p of scene.piles) drawSnowPile(ctx, p.x, p.y, p.r);
  for (const i of scene.iglus) drawIgloo(ctx, i.x, i.y);
  // sleigh + reindeer
  drawSleigh(ctx, scene.sleigh.x, scene.sleigh.y);
  for (const r of scene.reindeer) drawReindeer(ctx, r.x, r.y);
  for (const s of scene.snowmen) drawSnowman(ctx, s.x, s.y);
  for (const a of scene.animals) {
    if (a.kind === "penguin") drawPenguin(ctx, a.x, a.y);
    else if (a.kind === "seal") drawSeal(ctx, a.x, a.y);
    else if (a.kind === "bear") drawPolarBear(ctx, a.x, a.y);
  }
}

function renderOver(_ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "El Polo Norte",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
