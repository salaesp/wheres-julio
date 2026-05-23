import { createRng, randRange, randInt } from "../utils/seededRandom";
import { SPRITE_SIZE } from "../sprites";
import {
  drawUmbrella, drawBeachChair, drawTowel, drawTent, drawSandcastle,
  drawBeachBall, drawFloatie, drawSurfboard, drawShell, drawStarfish,
  drawLifeguardTower,
} from "../sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 55;
const MARGIN = 16;

type Umbrella = { x: number; y: number; color: string };
type Chair = { x: number; y: number; color: string };
type Towel = { x: number; y: number; w: number; h: number; color: string };
type Tent = { x: number; y: number; color: string };
type Sandcastle = { x: number; y: number };
type Ball = { x: number; y: number };
type Floatie = { x: number; y: number; color: string };
type Surf = { x: number; y: number; color: string };
type Shell = { x: number; y: number };
type Star = { x: number; y: number };
type Tower = { x: number; y: number };

export type BeachScene = {
  // Layout: water top, sand bottom
  waterY: number;       // y where water ends
  shoreY: number;       // damp sand line ends
  umbrellas: Umbrella[];
  chairs: Chair[];
  towels: Towel[];
  tents: Tent[];
  castles: Sandcastle[];
  balls: Ball[];
  floaties: Floatie[];
  surfs: Surf[];
  shells: Shell[];
  stars: Star[];
  tower: Tower;
};

function buildScene(): BeachScene {
  const waterY = 230;
  const shoreY = 290;

  const umbrellas: Umbrella[] = [
    { x: 90, y: 380, color: "#e23a3a" },
    { x: 260, y: 410, color: "#3a78c9" },
    { x: 410, y: 380, color: "#f0c842" },
    { x: 150, y: 560, color: "#a85ad4" },
    { x: 330, y: 580, color: "#e8853a" },
    { x: 60, y: 700, color: "#3aa86a" },
  ];

  const chairs: Chair[] = [
    { x: 90, y: 420, color: "#3a3a3a" },
    { x: 260, y: 450, color: "#5a3a3a" },
    { x: 410, y: 420, color: "#2a3a5a" },
    { x: 150, y: 600, color: "#5a3a3a" },
    { x: 330, y: 620, color: "#3a3a3a" },
  ];

  const towels: Towel[] = [
    { x: 30, y: 480, w: 60, h: 40, color: "#e23a8a" },
    { x: 200, y: 510, w: 70, h: 44, color: "#3aa86a" },
    { x: 360, y: 490, w: 60, h: 40, color: "#f0c842" },
    { x: 230, y: 700, w: 60, h: 40, color: "#5aa6e8" },
    { x: 50, y: 760, w: 60, h: 36, color: "#a85ad4" },
  ];

  const tents: Tent[] = [
    { x: 380, y: 740, color: "#3a78c9" },
    { x: 200, y: 380, color: "#e8853a" },
  ];

  const castles: Sandcastle[] = [
    { x: 330, y: 340 },
    { x: 110, y: 660 },
  ];

  const balls: Ball[] = [
    { x: 200, y: 350 },
    { x: 60, y: 620 },
    { x: 430, y: 540 },
    { x: 290, y: 770 },
  ];

  // Floaties — half in water at top
  const floaties: Floatie[] = [
    { x: 70, y: 140, color: "#ff7fa8" },
    { x: 230, y: 100, color: "#f0c842" },
    { x: 380, y: 160, color: "#7adf6a" },
  ];

  const surfs: Surf[] = [
    { x: 60, y: 340, color: "#3a78c9" },
    { x: 430, y: 720, color: "#e23a3a" },
    { x: 290, y: 480, color: "#a85ad4" },
  ];

  const shells: Shell[] = [
    { x: 50, y: 320 }, { x: 130, y: 305 }, { x: 220, y: 310 },
    { x: 320, y: 320 }, { x: 400, y: 310 }, { x: 70, y: 540 },
    { x: 280, y: 540 }, { x: 420, y: 580 }, { x: 180, y: 770 },
    { x: 340, y: 770 },
  ];

  const stars: Star[] = [
    { x: 90, y: 310 }, { x: 260, y: 320 }, { x: 380, y: 305 },
    { x: 120, y: 540 }, { x: 360, y: 540 }, { x: 230, y: 770 },
  ];

  const tower: Tower = { x: 420, y: 250 }; // at shoreline right

  return {
    waterY, shoreY,
    umbrellas, chairs, towels, tents, castles,
    balls, floaties, surfs, shells, stars, tower,
  };
}

function collides(scene: BeachScene, x: number, y: number, r: number): boolean {
  // can't stand in water
  if (y < scene.waterY) return true;
  // umbrellas (poles)
  for (const u of scene.umbrellas) {
    const dx = u.x - x, dy = u.y - y;
    if (dx * dx + dy * dy < (16 + r) * (16 + r)) return true;
  }
  for (const c of scene.chairs) {
    if (x > c.x - 22 && x < c.x + 22 && y > c.y - 16 && y < c.y + 24) return true;
  }
  for (const t of scene.towels) {
    if (x > t.x - 4 && x < t.x + t.w + 4 && y > t.y - 4 && y < t.y + t.h + 4) return true;
  }
  for (const t of scene.tents) {
    const dx = t.x - x, dy = t.y - y;
    if (dx * dx + dy * dy < (28 + r) * (28 + r)) return true;
  }
  for (const c of scene.castles) {
    if (x > c.x - 24 && x < c.x + 24 && y > c.y - 30 && y < c.y + 24) return true;
  }
  for (const s of scene.surfs) {
    if (x > s.x - 12 && x < s.x + 12 && y > s.y - 40 && y < s.y + 40) return true;
  }
  // tower
  const dx = scene.tower.x - x, dy = scene.tower.y - y;
  if (dx * dx + dy * dy < (40 + r) * (40 + r)) return true;
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as BeachScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.35;

  function tryPlace(): { x: number; y: number } {
    const topPad = Math.max(scene.waterY + 50, 280);
    for (let i = 0; i < 600; i++) {
      const x = randRange(rng, MARGIN, WIDTH - MARGIN);
      const y = randRange(rng, topPad, HEIGHT - MARGIN - 40);
      if (collides(scene, x, y, 8)) continue;
      let ok = true;
      for (const n of npcs) {
        const dxn = n.x - x, dyn = n.y - y;
        if (dxn * dxn + dyn * dyn < minDist * minDist) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
    return { x: WIDTH / 2, y: scene.shoreY + 60 };
  }

  for (let i = 0; i < NPC_COUNT; i++) {
    const p = tryPlace();
    npcs.push({ x: p.x, y: p.y, variant: randInt(rng, 0, 12) });
  }
  const julio = tryPlace();
  return { julio, npcs };
}

function renderBackground(ctx: CanvasRenderingContext2D, _scene: unknown, time: number) {
  const scene = _scene as BeachScene;
  // Water bands top
  const bands = ["#1a4a8a", "#2a6abf", "#3a8ad8", "#5aa6e8"];
  const bh = scene.waterY / bands.length;
  for (let i = 0; i < bands.length; i++) {
    ctx.fillStyle = bands[i];
    ctx.fillRect(0, i * bh, WIDTH, Math.ceil(bh) + 1);
  }
  // Wave foam crests — animated drift
  ctx.fillStyle = "#a8d8ff";
  const off = (time * 8) % 16;
  for (let y = 20; y < scene.waterY - 8; y += 28) {
    for (let x = -16 + off; x < WIDTH; x += 32) {
      ctx.fillRect(x, y, 8, 2);
      ctx.fillRect(x + 12, y + 4, 6, 2);
    }
  }
  // Foam at shore (wave hitting sand)
  ctx.fillStyle = "#ffffff";
  for (let x = 0; x < WIDTH; x += 4) {
    const wob = Math.sin(x * 0.05 + time * 2) * 3;
    ctx.fillRect(x, scene.waterY - 4 + wob, 3, 2);
  }
  ctx.fillStyle = "#cfeaff";
  for (let x = 0; x < WIDTH; x += 6) {
    const wob = Math.sin(x * 0.08 + time * 2.3) * 2;
    ctx.fillRect(x, scene.waterY - 2 + wob, 4, 2);
  }

  // Damp sand strip
  ctx.fillStyle = "#c8a878";
  ctx.fillRect(0, scene.waterY, WIDTH, scene.shoreY - scene.waterY);
  // Dry sand
  ctx.fillStyle = "#f0d68a";
  ctx.fillRect(0, scene.shoreY, WIDTH, HEIGHT - scene.shoreY);
  // sand speckle
  ctx.fillStyle = "#d4b86a";
  for (let x = 0; x < WIDTH; x += 6) {
    for (let y = scene.shoreY; y < HEIGHT; y += 6) {
      if (((x * 31 + y * 17) & 7) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.fillStyle = "#fff2c0";
  for (let x = 3; x < WIDTH; x += 9) {
    for (let y = scene.shoreY + 3; y < HEIGHT; y += 9) {
      if (((x * 13 + y * 23) & 7) === 0) ctx.fillRect(x, y, 1, 1);
    }
  }
  // shore line
  ctx.fillStyle = "#a8845a";
  ctx.fillRect(0, scene.shoreY - 2, WIDTH, 1);
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as BeachScene;
  // Decals on sand under chars: shells, stars, towels
  for (const s of scene.shells) drawShell(ctx, s.x, s.y);
  for (const s of scene.stars) drawStarfish(ctx, s.x, s.y);
  for (const t of scene.towels) drawTowel(ctx, t.x, t.y, t.w, t.h, t.color);
  // Sandcastles
  for (const c of scene.castles) drawSandcastle(ctx, c.x, c.y);
  // Floaties in water — drawn on water as bg
  for (const f of scene.floaties) drawFloatie(ctx, f.x, f.y, f.color);
  // Chairs (people can sit, but treat as solid prop)
  for (const c of scene.chairs) drawBeachChair(ctx, c.x, c.y, c.color);
  // Balls
  for (const b of scene.balls) drawBeachBall(ctx, b.x, b.y);
  // Tents (smaller-ish dome)
  for (const t of scene.tents) drawTent(ctx, t.x, t.y, t.color);
  // Surfboards (clavados, mid-level)
  for (const s of scene.surfs) drawSurfboard(ctx, s.x, s.y, s.color);
  // Tower (large — will overlap some chars; render here as under)
  drawLifeguardTower(ctx, scene.tower.x, scene.tower.y);
}

function renderOver(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as BeachScene;
  // Umbrella canopies on top so they cover chars sitting below
  for (const u of scene.umbrellas) drawUmbrella(ctx, u.x, u.y, u.color);
}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "La Playa",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
