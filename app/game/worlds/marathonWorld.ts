import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawFinishArch, drawBarrier, drawHydrationTable,
  drawSpectatorFlag, drawSign, drawCameraProp,
  drawTreeTrunk, drawTreeCanopy,
} from "../sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 60;
const MARGIN = 12;

type Flag = { x: number; y: number; color: string };
type Sign = { x: number; y: number; color: string };
type Tree = { x: number; y: number; r: number };
type Camera = { x: number; y: number };

export type MarathonScene = {
  streetX: number;
  streetW: number;
  archY: number;
  hydration: { x: number; y: number; w: number };
  flags: Flag[];
  signs: Sign[];
  cameras: Camera[];
  trees: Tree[];
  sidewalkLeft: { x: number; y: number; w: number; h: number };
  sidewalkRight: { x: number; y: number; w: number; h: number };
  street: { x: number; y: number; w: number; h: number };
};

function buildScene(): MarathonScene {
  const streetW = 200;
  const streetX = (WIDTH - streetW) / 2;
  const sidewalkW = (WIDTH - streetW) / 2;

  const sidewalkLeft = { x: 0, y: 0, w: sidewalkW, h: HEIGHT };
  const sidewalkRight = { x: streetX + streetW, y: 0, w: sidewalkW, h: HEIGHT };
  const street = { x: streetX, y: 0, w: streetW, h: HEIGHT };

  const archY = 120;

  const hydration = { x: streetX - 90, y: 480, w: 80 };

  // Spectator flags + signs on sidewalks
  const flagColors = ["#e23a3a", "#3a78c9", "#f0c842", "#3aa86a", "#a85ad4", "#e8853a"];
  const signColors = ["#ffffff", "#f0c842", "#3aa86a"];
  const flags: Flag[] = [];
  const signs: Sign[] = [];
  // left sidewalk
  for (let i = 0; i < 6; i++) {
    flags.push({ x: 30, y: 200 + i * 90, color: flagColors[i % flagColors.length] });
  }
  for (let i = 0; i < 4; i++) {
    signs.push({ x: 90, y: 240 + i * 130, color: signColors[i % signColors.length] });
  }
  // right sidewalk
  for (let i = 0; i < 6; i++) {
    flags.push({ x: WIDTH - 30, y: 240 + i * 90, color: flagColors[(i + 2) % flagColors.length] });
  }
  for (let i = 0; i < 4; i++) {
    signs.push({ x: WIDTH - 90, y: 200 + i * 130, color: signColors[(i + 1) % signColors.length] });
  }

  // Photographers — camera tripods placed at corners/finish line
  const cameras: Camera[] = [
    { x: streetX - 30, y: archY + 60 },
    { x: streetX + streetW + 30, y: archY + 60 },
    { x: 30, y: 380 },
    { x: WIDTH - 30, y: 600 },
  ];

  // Trees along outer edges of sidewalks (between sidewalk and world edge)
  const trees: Tree[] = [];
  for (let i = 0; i < 7; i++) trees.push({ x: 16, y: 280 + i * 80, r: 22 });
  for (let i = 0; i < 7; i++) trees.push({ x: WIDTH - 16, y: 300 + i * 80, r: 22 });

  return {
    streetX, streetW, archY, hydration, flags, signs, cameras, trees,
    sidewalkLeft, sidewalkRight, street,
  };
}

function collides(scene: MarathonScene, x: number, y: number, r: number): boolean {
  // Arch zone blocks
  if (y > scene.archY - 18 && y < scene.archY + 24 &&
      x > scene.streetX - 4 && x < scene.streetX + scene.streetW + 4) {
    // arch posts only
    if (x < scene.streetX + 10 || x > scene.streetX + scene.streetW - 10) return true;
  }
  // hydration table
  const h = scene.hydration;
  if (x > h.x - 4 && x < h.x + h.w + 4 && y > h.y - 8 && y < h.y + 10) return true;
  // tree trunks (canopy can overlap NPCs in renderOver)
  for (const t of scene.trees) {
    const dx = t.x - x, dy = t.y - y;
    if (dx * dx + dy * dy < (10 + r) * (10 + r)) return true;
  }
  // barriers between street and sidewalks (poles at edges)
  if (x > scene.streetX - 6 && x < scene.streetX + 2) return true;
  if (x > scene.streetX + scene.streetW - 2 && x < scene.streetX + scene.streetW + 6) return true;
  // sign / flag clusters
  for (const f of scene.flags) {
    if (Math.abs(f.x - x) < 8 && Math.abs(f.y - y) < 10) return true;
  }
  for (const s of scene.signs) {
    if (Math.abs(s.x - x) < 10 && Math.abs(s.y - y) < 10) return true;
  }
  // cameras
  for (const c of scene.cameras) {
    if (Math.abs(c.x - x) < 12 && Math.abs(c.y - y) < 12) return true;
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as MarathonScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.32;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 1000; i++) {
      const x = randRange(rng, MARGIN, WIDTH - MARGIN);
      const y = randRange(rng, scene.archY + 40, HEIGHT - MARGIN - 30);
      if (collides(scene, x, y, 8)) continue;
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
  const scene = _scene as MarathonScene;
  // Sidewalks
  ctx.fillStyle = "#c2c2cc";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // tiled sidewalk pattern
  ctx.fillStyle = "#a8a8b2";
  for (let x = 0; x < WIDTH; x += 32) ctx.fillRect(x, 0, 1, HEIGHT);
  for (let y = 0; y < HEIGHT; y += 32) ctx.fillRect(0, y, WIDTH, 1);
  // tree planting strip dark
  ctx.fillStyle = "#7a4a22";
  for (const t of scene.trees) {
    ctx.fillRect(t.x - 6, t.y - 4, 12, 8);
  }

  // Street asphalt
  ctx.fillStyle = "#3a3a44";
  ctx.fillRect(scene.streetX, 0, scene.streetW, HEIGHT);
  // asphalt speckle
  ctx.fillStyle = "#4a4a55";
  for (let x = scene.streetX; x < scene.streetX + scene.streetW; x += 6) {
    for (let y = 0; y < HEIGHT; y += 6) {
      if (((x * 31 + y * 17) & 7) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // Center painted line (yellow dashed)
  ctx.fillStyle = "#f0c842";
  const cx = scene.streetX + scene.streetW / 2;
  for (let y = 0; y < HEIGHT; y += 26) {
    ctx.fillRect(cx - 2, y, 4, 12);
  }
  // Lane edges (white solid)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(scene.streetX + 8, 0, 2, HEIGHT);
  ctx.fillRect(scene.streetX + scene.streetW - 10, 0, 2, HEIGHT);

  // Direction arrows on street (every ~140px)
  ctx.fillStyle = "#ffffff";
  for (let y = scene.archY + 80; y < HEIGHT; y += 160) {
    // arrow pointing up
    ctx.fillRect(cx - 8, y + 12, 16, 4);   // shaft
    ctx.fillRect(cx - 8, y, 16, 4);        // shaft 2
    ctx.fillRect(cx - 6, y - 4, 12, 4);    // head wide
    ctx.fillRect(cx - 3, y - 8, 6, 4);     // head tip
  }
  // km markers
  ctx.fillStyle = "#ffe066";
  ctx.font = "bold 12px ui-monospace, monospace";
  ctx.textAlign = "center";
  for (let i = 0; i < 4; i++) {
    ctx.fillText(`${i + 1} km`, cx, scene.archY + 200 + i * 160);
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as MarathonScene;
  // Barriers along street edges
  drawBarrier(ctx, scene.streetX - 6, 0, true, HEIGHT);
  drawBarrier(ctx, scene.streetX + scene.streetW + 2, 0, true, HEIGHT);
  // Finish arch
  drawFinishArch(ctx, scene.streetX, scene.archY, scene.streetW);
  // Hydration table
  drawHydrationTable(ctx, scene.hydration.x, scene.hydration.y, scene.hydration.w);
  // Tree trunks
  for (const t of scene.trees) drawTreeTrunk(ctx, t.x, t.y);
  // Flags
  for (const f of scene.flags) drawSpectatorFlag(ctx, f.x, f.y, f.color);
  // Signs
  for (const s of scene.signs) drawSign(ctx, s.x, s.y, s.color);
  // Cameras
  for (const c of scene.cameras) drawCameraProp(ctx, c.x, c.y);
}

function renderOver(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as MarathonScene;
  for (const t of scene.trees) drawTreeCanopy(ctx, t.x, t.y, t.r);
}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "La Maratón",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
