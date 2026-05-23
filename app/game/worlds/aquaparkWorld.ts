import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawPool, drawSpiralSlide, drawSunbed, drawPlasticTable, drawSnackBar,
  drawUmbrella,
} from "../sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 50;
const MARGIN = 14;

type Sunbed = { x: number; y: number; color: string };
type Umbrella = { x: number; y: number; color: string };
type Table = { x: number; y: number };

export type AquaScene = {
  pool: { x: number; y: number; w: number; h: number };
  slide: { x: number; y: number };
  splashPool: { x: number; y: number; r: number };
  sunbeds: Sunbed[];
  umbrellas: Umbrella[];
  tables: Table[];
  snackBar: { x: number; y: number; w: number; h: number };
};

function buildScene(): AquaScene {
  const pool = { x: 50, y: 100, w: 380, h: 200 };
  const slide = { x: 380, y: 470 };
  const splashPool = { x: 318, y: 506, r: 28 };

  // Sunbeds in 2 rows
  const sunbedColors = ["#3a78c9", "#e23a3a", "#f0c842", "#3aa86a", "#a85ad4", "#e8853a"];
  const sunbeds: Sunbed[] = [];
  for (let i = 0; i < 6; i++) {
    sunbeds.push({ x: 60 + i * 60, y: 380, color: sunbedColors[i] });
  }
  for (let i = 0; i < 5; i++) {
    sunbeds.push({ x: 80 + i * 60, y: 450, color: sunbedColors[(i + 3) % 6] });
  }
  // a few near slide pool
  sunbeds.push({ x: 90, y: 550, color: "#e23a3a" });
  sunbeds.push({ x: 170, y: 560, color: "#3aa86a" });

  // Umbrellas paired with sunbed clusters
  const umbrellaColors = ["#e23a3a", "#3a78c9", "#f0c842", "#3aa86a", "#a85ad4"];
  const umbrellas: Umbrella[] = [
    { x: 80, y: 360, color: umbrellaColors[0] },
    { x: 200, y: 360, color: umbrellaColors[1] },
    { x: 320, y: 360, color: umbrellaColors[2] },
    { x: 130, y: 540, color: umbrellaColors[3] },
  ];

  // Plastic tables
  const tables: Table[] = [
    { x: 80, y: 660 },
    { x: 200, y: 660 },
    { x: 320, y: 660 },
    { x: 140, y: 730 },
    { x: 260, y: 730 },
  ];

  // Snack bar at bottom
  const snackBar = { x: WIDTH / 2 - 55, y: HEIGHT - 90, w: 110, h: 50 };

  return { pool, slide, splashPool, sunbeds, umbrellas, tables, snackBar };
}

function collides(scene: AquaScene, x: number, y: number, r: number): boolean {
  // pool blocks
  const p = scene.pool;
  if (x > p.x - r && x < p.x + p.w + r && y > p.y - r && y < p.y + p.h + r) return true;
  // splash pool
  const sp = scene.splashPool;
  const dxsp = sp.x - x, dysp = sp.y - y;
  if (dxsp * dxsp + dysp * dysp < (sp.r + r) * (sp.r + r)) return true;
  // slide tower
  if (x > scene.slide.x - 24 - r && x < scene.slide.x + 24 + r &&
      y > scene.slide.y - 30 - r && y < scene.slide.y + 30 + r) return true;
  // sunbeds
  for (const s of scene.sunbeds) {
    if (x > s.x - 22 && x < s.x + 22 && y > s.y - 16 && y < s.y + 18) return true;
  }
  // umbrellas (pole only — chars can stand near edge)
  for (const u of scene.umbrellas) {
    const dxu = u.x - x, dyu = u.y - y;
    if (dxu * dxu + dyu * dyu < (12 + r) * (12 + r)) return true;
  }
  // tables
  for (const t of scene.tables) {
    const dxt = t.x - x, dyt = t.y - y;
    if (dxt * dxt + dyt * dyt < (24 + r) * (24 + r)) return true;
  }
  // snack bar
  const sb = scene.snackBar;
  if (x > sb.x - r && x < sb.x + sb.w + r && y > sb.y - r && y < sb.y + sb.h + r) return true;
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as AquaScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.34;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 800; i++) {
      const x = randRange(rng, MARGIN, WIDTH - MARGIN);
      const y = randRange(rng, MARGIN, HEIGHT - MARGIN - 30);
      if (collides(scene, x, y, 8)) continue;
      let ok = true;
      for (const n of npcs) {
        const dxn = n.x - x, dyn = n.y - y;
        if (dxn * dxn + dyn * dyn < minDist * minDist) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
    return { x: WIDTH / 2, y: HEIGHT - 200 };
  }

  for (let i = 0; i < NPC_COUNT; i++) {
    const p = tryPlace();
    npcs.push({ x: p.x, y: p.y, variant: randInt(rng, 0, 12) });
  }
  const julio = tryPlace();
  return { julio, npcs };
}

function renderBackground(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  // tile deck (light beige) — whole world
  ctx.fillStyle = "#f0e2c0";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // tile grid
  ctx.fillStyle = "#dcc89a";
  const tileSize = 32;
  for (let x = 0; x < WIDTH; x += tileSize) ctx.fillRect(x, 0, 2, HEIGHT);
  for (let y = 0; y < HEIGHT; y += tileSize) ctx.fillRect(0, y, WIDTH, 2);
  // wet spots speckle
  ctx.fillStyle = "rgba(58, 120, 201, 0.18)";
  for (let x = 0; x < WIDTH; x += 18) {
    for (let y = 0; y < HEIGHT; y += 18) {
      if (((x * 31 + y * 17) & 15) === 0) ctx.fillRect(x, y, 4, 4);
    }
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as AquaScene;
  // pool
  drawPool(ctx, scene.pool.x, scene.pool.y, scene.pool.w, scene.pool.h);
  // sunbeds
  for (const s of scene.sunbeds) drawSunbed(ctx, s.x, s.y, s.color);
  // tables
  for (const t of scene.tables) drawPlasticTable(ctx, t.x, t.y);
  // slide (tall — overlaps chars but drawn here so chars sorted-by-y can pass behind splash)
  drawSpiralSlide(ctx, scene.slide.x, scene.slide.y);
  // snack bar
  drawSnackBar(ctx, scene.snackBar.x, scene.snackBar.y, scene.snackBar.w, scene.snackBar.h);
}

function renderOver(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as AquaScene;
  // umbrella canopies on top
  for (const u of scene.umbrellas) drawUmbrella(ctx, u.x, u.y, u.color);
}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "El Parque Acuático",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
