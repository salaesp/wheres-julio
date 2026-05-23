import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawBarn, drawFarmhouse, drawFenceH, drawFenceV,
  drawCow, drawHorse, drawDog, drawDuck,
  drawTractor, drawHayBale, drawCropRow, drawPond,
  drawWindmill, drawScarecrow,
} from "../characters/sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 52;
const MARGIN = 20;

type Animal = { x: number; y: number; kind: "cow" | "cowBlack" | "horse" | "dog" | "duck" };
type Building = { x: number; y: number; w: number; h: number; kind: "barn" | "house" };
type Hay = { x: number; y: number };
type Crop = { x: number; y: number; w: number; h: number; color: string };
type Pond = { x: number; y: number; r: number };
type Fence = { x: number; y: number; len: number; vertical: boolean };

export type FarmScene = {
  buildings: Building[];
  fences: Fence[];
  animals: Animal[];
  hayBales: Hay[];
  crops: Crop[];
  ponds: Pond[];
  tractor: { x: number; y: number };
  windmill: { x: number; y: number };
  scarecrow: { x: number; y: number };
  paths: { x: number; y: number; w: number; h: number }[];
};

function buildScene(): FarmScene {
  const buildings: Building[] = [
    // Barn top-left
    { x: 60, y: 90, w: 130, h: 130, kind: "barn" },
    // Farmhouse bottom-right
    { x: 290, y: 600, w: 150, h: 130, kind: "house" },
  ];

  // Fences forming animal pen (top-right area)
  const penX = 230, penY = 110, penW = 220, penH = 200;
  const fences: Fence[] = [
    { x: penX, y: penY, len: penW, vertical: false },
    { x: penX, y: penY + penH, len: penW, vertical: false },
    { x: penX, y: penY, len: penH, vertical: true },
    { x: penX + penW, y: penY, len: penH, vertical: true },
    // gap for entry on bottom-left of pen
  ];

  // Animals inside pen — cows mostly
  const animals: Animal[] = [
    { x: penX + 40, y: penY + 50, kind: "cow" },
    { x: penX + 130, y: penY + 60, kind: "cowBlack" },
    { x: penX + 70, y: penY + 130, kind: "cow" },
    { x: penX + 160, y: penY + 130, kind: "cowBlack" },
    { x: penX + 100, y: penY + 170, kind: "cow" },
    // horses near barn
    { x: 200, y: 350, kind: "horse" },
    { x: 140, y: 370, kind: "horse" },
    // dog guarding entrance (between barn and house)
    { x: 220, y: 470, kind: "dog" },
    // ducks near pond
    { x: 195, y: 460, kind: "duck" },
    { x: 285, y: 465, kind: "duck" },
    { x: 220, y: 510, kind: "duck" },
    { x: 270, y: 510, kind: "duck" },
  ];

  // Hay bales near barn
  const hayBales: Hay[] = [
    { x: 220, y: 90 },
    { x: 220, y: 130 },
    { x: 30, y: 240 },
    { x: 110, y: 420 },
  ];

  // Crop rows lower-left
  const crops: Crop[] = [
    { x: 30, y: 540, w: 100, h: 30, color: "#f0c842" }, // trigo
    { x: 30, y: 580, w: 100, h: 30, color: "#7adf6a" }, // lechuga
    { x: 30, y: 620, w: 100, h: 30, color: "#e8853a" }, // zanahoria tops
    { x: 30, y: 660, w: 100, h: 30, color: "#a85ad4" }, // berenjena
    { x: 30, y: 700, w: 100, h: 30, color: "#e23a3a" }, // tomate
  ];

  // Pond center-bottom
  const ponds: Pond[] = [{ x: 240, y: 470, r: 42 }];

  const tractor = { x: 380, y: 380 };
  const windmill = { x: 380, y: 530 };
  const scarecrow = { x: 80, y: 760 };

  // Dirt paths between buildings
  const paths = [
    // path barn -> house (vertical-ish)
    { x: 200, y: 300, w: 50, h: 280 },
    // path house horizontal at door
    { x: 200, y: 580, w: 90, h: 30 },
  ];

  return { buildings, fences, animals, hayBales, crops, ponds, tractor, windmill, scarecrow, paths };
}

function collides(scene: FarmScene, x: number, y: number, r: number): boolean {
  for (const b of scene.buildings) {
    if (x > b.x - r && x < b.x + b.w + r && y > b.y - r && y < b.y + b.h + r) return true;
  }
  for (const c of scene.crops) {
    if (x > c.x - 4 && x < c.x + c.w + 4 && y > c.y - 4 && y < c.y + c.h + 4) return true;
  }
  for (const p of scene.ponds) {
    const dx = p.x - x, dy = p.y - y;
    if (dx * dx + dy * dy < (p.r + r) * (p.r + r)) return true;
  }
  // fences (block crossing inside pen)
  for (const f of scene.fences) {
    if (f.vertical) {
      if (x > f.x - 6 && x < f.x + 6 && y > f.y && y < f.y + f.len) return true;
    } else {
      if (y > f.y - 6 && y < f.y + 6 && x > f.x && x < f.x + f.len) return true;
    }
  }
  // tractor
  if (x > scene.tractor.x - 30 && x < scene.tractor.x + 30 && y > scene.tractor.y - 24 && y < scene.tractor.y + 24) return true;
  // windmill
  const dxw = scene.windmill.x - x, dyw = scene.windmill.y - y;
  if (dxw * dxw + dyw * dyw < (24 + r) * (24 + r)) return true;
  // hay bales
  for (const h of scene.hayBales) {
    if (x > h.x - 20 && x < h.x + 20 && y > h.y - 12 && y < h.y + 12) return true;
  }
  // animals (chars stop next to them)
  for (const a of scene.animals) {
    const dxA = a.x - x, dyA = a.y - y;
    if (dxA * dxA + dyA * dyA < (18 + r) * (18 + r)) return true;
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as FarmScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.4;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 800; i++) {
      const x = randRange(rng, MARGIN, WIDTH - MARGIN);
      const y = randRange(rng, 100, HEIGHT - MARGIN - 30);
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
  const scene = _scene as FarmScene;
  // grass
  ctx.fillStyle = "#7ac86a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#5aa84a";
  for (let x = 0; x < WIDTH; x += 18) {
    for (let y = 0; y < HEIGHT; y += 18) {
      if (((x * 31 + y * 17) & 7) === 0) ctx.fillRect(x, y, 3, 3);
    }
  }
  ctx.fillStyle = "#9adc7a";
  for (let x = 9; x < WIDTH; x += 24) {
    for (let y = 9; y < HEIGHT; y += 24) {
      if (((x * 13 + y * 23) & 7) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // tiny dandelions
  ctx.fillStyle = "#f5e23a";
  for (let x = 5; x < WIDTH; x += 35) {
    for (let y = 5; y < HEIGHT; y += 35) {
      if (((x * 41 + y * 19) & 15) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // Dirt paths
  for (const p of scene.paths) {
    ctx.fillStyle = "#a87a4a";
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#7a4a22";
    for (let yy = p.y + 2; yy < p.y + p.h - 2; yy += 4) {
      for (let xx = p.x + 2; xx < p.x + p.w - 2; xx += 4) {
        if (((xx * 7 + yy * 11) & 3) === 0) ctx.fillRect(xx, yy, 2, 2);
      }
    }
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as FarmScene;
  // crops
  for (const c of scene.crops) drawCropRow(ctx, c.x, c.y, c.w, c.h, c.color);
  // pond
  for (const p of scene.ponds) drawPond(ctx, p.x, p.y, p.r);
  // buildings
  for (const b of scene.buildings) {
    if (b.kind === "barn") drawBarn(ctx, b.x, b.y, b.w, b.h);
    else drawFarmhouse(ctx, b.x, b.y, b.w, b.h);
  }
  // fences
  for (const f of scene.fences) {
    if (f.vertical) drawFenceV(ctx, f.x, f.y, f.len);
    else drawFenceH(ctx, f.x, f.y, f.len);
  }
  // hay
  for (const h of scene.hayBales) drawHayBale(ctx, h.x, h.y);
  // tractor + windmill + scarecrow
  drawTractor(ctx, scene.tractor.x, scene.tractor.y);
  drawWindmill(ctx, scene.windmill.x, scene.windmill.y);
  drawScarecrow(ctx, scene.scarecrow.x, scene.scarecrow.y);
  // animals
  for (const a of scene.animals) {
    if (a.kind === "cow") drawCow(ctx, a.x, a.y, false);
    else if (a.kind === "cowBlack") drawCow(ctx, a.x, a.y, true);
    else if (a.kind === "horse") drawHorse(ctx, a.x, a.y);
    else if (a.kind === "dog") drawDog(ctx, a.x, a.y);
    else if (a.kind === "duck") drawDuck(ctx, a.x, a.y);
  }
}

function renderOver(_ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  // no overhead layer for farm
}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "La Granja",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
