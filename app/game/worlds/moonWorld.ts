// Parque/plaza top-down. Mundo 1. Mobile portrait. Compact zoom.
import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawTreeTrunk, drawTreeCanopy,
  drawBench, drawHedge, drawFountain,
  drawPath, drawSandbox, drawFlowerbed,
  drawSlide, drawSwingSet, drawCarousel, drawSeesaw,
} from "../sprites";
import { drawGbaGrass, drawGbaWildFlowers } from "./gbaStyle";
import type { WorldModule } from "./types";

export const WORLD_WIDTH = 480;
export const WORLD_HEIGHT = 800;
export const NPC_COUNT = 55;

export type NpcPos = { x: number; y: number; variant: number };
export type Placement = { julio: { x: number; y: number }; npcs: NpcPos[] };

const MARGIN = 18;

export type Tree = { x: number; y: number; r: number };
export type Bench = { x: number; y: number; w: number };
export type Hedge = { x: number; y: number; w: number; h: number };
export type Fountain = { x: number; y: number; r: number };
export type Slide = { x: number; y: number };
export type Swing = { x: number; y: number };
export type Carousel = { x: number; y: number; r: number };
export type Sandbox = { x: number; y: number; w: number; h: number };
export type Path = { x: number; y: number; w: number; h: number };
export type Seesaw = { x: number; y: number };
export type Flowerbed = { x: number; y: number; w: number; h: number };

export type Scene = {
  trees: Tree[];
  benches: Bench[];
  hedges: Hedge[];
  fountains: Fountain[];
  slides: Slide[];
  swings: Swing[];
  carousels: Carousel[];
  sandboxes: Sandbox[];
  paths: Path[];
  seesaws: Seesaw[];
  flowerbeds: Flowerbed[];
};

export function buildScene(): Scene {
  const paths: Path[] = [
    { x: 210, y: 40, w: 60, h: WORLD_HEIGHT - 80 },
    { x: 30, y: 380, w: WORLD_WIDTH - 60, h: 60 },
  ];

  const fountains: Fountain[] = [{ x: 240, y: 410, r: 38 }];

  const carousels: Carousel[] = [{ x: 120, y: 170, r: 52 }];
  const slides: Slide[] = [{ x: 360, y: 160 }];
  const swings: Swing[] = [{ x: 130, y: 590 }];
  const seesaws: Seesaw[] = [{ x: 360, y: 590 }];
  const sandboxes: Sandbox[] = [{ x: 290, y: 680, w: 140, h: 100 }];

  const benches: Bench[] = [
    { x: 30, y: 300, w: 60 },
    { x: 390, y: 300, w: 60 },
    { x: 30, y: 480, w: 60 },
    { x: 390, y: 480, w: 60 },
    { x: 60, y: 700, w: 60 },
    { x: 180, y: 760, w: 70 },
  ];

  const hedges: Hedge[] = [
    { x: 20, y: 60, w: 180, h: 16 },
    { x: 280, y: 60, w: 180, h: 16 },
    { x: 20, y: WORLD_HEIGHT - 70, w: 130, h: 16 },
  ];

  const flowerbeds: Flowerbed[] = [
    { x: 30, y: 130, w: 60, h: 26 },
    { x: 390, y: 260, w: 60, h: 26 },
    { x: 30, y: 580, w: 60, h: 22 },
  ];

  const trees: Tree[] = [];
  // top edge
  for (let i = 0; i < 4; i++) trees.push({ x: 50 + i * 130, y: 30, r: 22 });
  // sides
  trees.push({ x: 25, y: 220, r: 22 });
  trees.push({ x: WORLD_WIDTH - 25, y: 220, r: 22 });
  trees.push({ x: 25, y: 540, r: 22 });
  trees.push({ x: WORLD_WIDTH - 25, y: 540, r: 22 });
  // bottom edge
  for (let i = 0; i < 4; i++) trees.push({ x: 70 + i * 120, y: WORLD_HEIGHT - 30, r: 22 });
  // near fountain
  trees.push({ x: 90, y: 410, r: 20 });
  trees.push({ x: 400, y: 410, r: 20 });

  return {
    trees, benches, hedges, fountains, slides, swings, carousels,
    sandboxes, paths, seesaws, flowerbeds,
  };
}

function collidesSolid(scene: Scene, x: number, y: number, r: number): boolean {
  for (const f of scene.fountains) {
    const dx = f.x - x, dy = f.y - y;
    if (dx * dx + dy * dy < (f.r + r) * (f.r + r)) return true;
  }
  for (const c of scene.carousels) {
    const dx = c.x - x, dy = c.y - y;
    if (dx * dx + dy * dy < (c.r + r - 4) * (c.r + r - 4)) return true;
  }
  for (const s of scene.slides) {
    if (x > s.x - 30 - r && x < s.x + 30 + r && y > s.y - 50 - r && y < s.y + 30 + r) return true;
  }
  for (const sw of scene.swings) {
    if (x > sw.x - 50 - r && x < sw.x + 50 + r && y > sw.y - 28 - r && y < sw.y + 30 + r) return true;
  }
  for (const ss of scene.seesaws) {
    if (x > ss.x - 36 - r && x < ss.x + 36 + r && y > ss.y - 12 - r && y < ss.y + 14 + r) return true;
  }
  for (const b of scene.benches) {
    if (x > b.x - 4 && x < b.x + b.w + 4 && y > b.y - 6 && y < b.y + 18) return true;
  }
  for (const h of scene.hedges) {
    if (x > h.x - 4 && x < h.x + h.w + 4 && y > h.y - 4 && y < h.y + h.h + 4) return true;
  }
  for (const fb of scene.flowerbeds) {
    if (x > fb.x - 4 && x < fb.x + fb.w + 4 && y > fb.y - 4 && y < fb.y + fb.h + 4) return true;
  }
  return false;
}

export function placeCharacters(seed: number, scene: Scene): Placement {
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.35;

  function tryPlace(): { x: number; y: number } {
    const topPad = MARGIN;
    for (let i = 0; i < 600; i++) {
      const x = randRange(rng, MARGIN, WORLD_WIDTH - MARGIN);
      const y = randRange(rng, topPad, WORLD_HEIGHT - MARGIN - 40);
      if (collidesSolid(scene, x, y, 8)) continue;
      let ok = true;
      for (const n of npcs) {
        const dx = n.x - x, dy = n.y - y;
        if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
    return { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };
  }

  for (let i = 0; i < NPC_COUNT; i++) {
    const p = tryPlace();
    npcs.push({ x: p.x, y: p.y, variant: randInt(rng, 0, 12) });
  }
  const julio = tryPlace();
  // No sort — keep stable index order for cross-placement interpolation.
  return { julio, npcs };
}

// ───────── Render functions ─────────

function renderBackground(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  drawGbaGrass(ctx, WORLD_WIDTH, WORLD_HEIGHT);
  drawGbaWildFlowers(ctx, WORLD_WIDTH, WORLD_HEIGHT, 0.8);
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as Scene;
  for (const p of scene.paths) drawPath(ctx, p.x, p.y, p.w, p.h);
  for (const f of scene.flowerbeds) drawFlowerbed(ctx, f.x, f.y, f.w, f.h);
  for (const s of scene.sandboxes) drawSandbox(ctx, s.x, s.y, s.w, s.h);
  for (const c of scene.carousels) drawCarousel(ctx, c.x, c.y, c.r);
  for (const s of scene.slides) drawSlide(ctx, s.x, s.y);
  for (const sw of scene.swings) drawSwingSet(ctx, sw.x, sw.y);
  for (const ss of scene.seesaws) drawSeesaw(ctx, ss.x, ss.y);
  for (const h of scene.hedges) drawHedge(ctx, h.x, h.y, h.w, h.h);
  for (const b of scene.benches) drawBench(ctx, b.x, b.y, b.w);
  for (const f of scene.fountains) drawFountain(ctx, f.x, f.y, f.r);
  for (const t of scene.trees) drawTreeTrunk(ctx, t.x, t.y);
}

function renderOver(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as Scene;
  for (const t of scene.trees) drawTreeCanopy(ctx, t.x, t.y, t.r);
}

export const worldModule: WorldModule = {
  width: WORLD_WIDTH,
  height: WORLD_HEIGHT,
  npcCount: NPC_COUNT,
  title: "La Plaza",
  buildScene,
  placeCharacters: (seed, scene) => placeCharacters(seed, scene as Scene),
  renderBackground,
  renderUnder,
  renderOver,
};
