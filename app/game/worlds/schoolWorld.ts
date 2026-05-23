import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawHopscotch, drawSchoolBall, drawJumpRope, drawSchoolBench,
  drawBackpack, drawTrashCan, drawSchoolEntrance, drawFlagpoleAR,
} from "../sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 55;
const MARGIN = 14;

type Ball = { x: number; y: number; color: string };
type Rope = { x: number; y: number };
type Bench = { x: number; y: number; w: number };
type Pack = { x: number; y: number; color: string };
type Trash = { x: number; y: number; color: string };
type Hop = { x: number; y: number };

export type SchoolScene = {
  entrance: { x: number; y: number; w: number };
  flagpole: { x: number; y: number };
  hopscotches: Hop[];
  balls: Ball[];
  ropes: Rope[];
  benches: Bench[];
  packs: Pack[];
  trashes: Trash[];
};

function buildScene(): SchoolScene {
  const entrance = { x: 60, y: 130, w: 360 };
  // mástil al costado entrada (derecha)
  const flagpole = { x: 70, y: 200 };

  const hopscotches: Hop[] = [
    { x: 130, y: 380 },
    { x: 360, y: 600 },
  ];

  const balls: Ball[] = [
    { x: 70, y: 470, color: "#e23a3a" },
    { x: 240, y: 320, color: "#f0c842" },
    { x: 410, y: 470, color: "#3aa86a" },
    { x: 200, y: 560, color: "#3a78c9" },
    { x: 290, y: 720, color: "#a85ad4" },
  ];

  const ropes: Rope[] = [
    { x: 90, y: 620 },
    { x: 380, y: 360 },
    { x: 240, y: 660 },
  ];

  const benches: Bench[] = [
    { x: 30, y: 290, w: 90 },
    { x: 360, y: 290, w: 90 },
    { x: 30, y: 740, w: 100 },
    { x: 350, y: 740, w: 100 },
  ];

  const packs: Pack[] = [
    { x: 50, y: 310, color: "#e23a3a" },
    { x: 80, y: 320, color: "#3a78c9" },
    { x: 380, y: 310, color: "#3aa86a" },
    { x: 410, y: 320, color: "#a85ad4" },
    { x: 60, y: 760, color: "#f0c842" },
    { x: 100, y: 770, color: "#e8853a" },
    { x: 380, y: 760, color: "#3a78c9" },
    { x: 410, y: 770, color: "#e23a3a" },
    { x: 220, y: 480, color: "#7a3aa8" },
  ];

  const trashes: Trash[] = [
    { x: 30, y: 470, color: "#3aa86a" },
    { x: 450, y: 470, color: "#e23a3a" },
    { x: 240, y: 770, color: "#3a78c9" },
  ];

  return { entrance, flagpole, hopscotches, balls, ropes, benches, packs, trashes };
}

function collides(scene: SchoolScene, x: number, y: number, r: number): boolean {
  // entrance wall blocks
  const e = scene.entrance;
  if (x > e.x - r && x < e.x + e.w + r && y > e.y - r && y < e.y + 30 + r) return true;
  // flagpole pole
  const fp = scene.flagpole;
  if (Math.abs(fp.x - x) < 4 + r && y > fp.y - 50 && y < fp.y + 16) return true;
  // benches
  for (const b of scene.benches) {
    if (x > b.x - 4 && x < b.x + b.w + 4 && y > b.y - 8 && y < b.y + 20) return true;
  }
  // trashes
  for (const t of scene.trashes) {
    if (Math.abs(t.x - x) < 14 && Math.abs(t.y - y) < 16) return true;
  }
  // backpacks (small)
  for (const p of scene.packs) {
    if (Math.abs(p.x - x) < 12 && Math.abs(p.y - y) < 14) return true;
  }
  // hopscotch areas
  for (const h of scene.hopscotches) {
    if (x > h.x - 14 && x < h.x + 14 && y > h.y - 4 && y < h.y + 80) return true;
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as SchoolScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.32;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 1000; i++) {
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
  // schoolyard concrete tiled
  ctx.fillStyle = "#c8b888";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // tile grid (large)
  ctx.fillStyle = "#a89868";
  const tile = 48;
  for (let x = 0; x < WIDTH; x += tile) ctx.fillRect(x, 0, 2, HEIGHT);
  for (let y = 0; y < HEIGHT; y += tile) ctx.fillRect(0, y, WIDTH, 2);
  // speckle
  ctx.fillStyle = "#b8a878";
  for (let x = 0; x < WIDTH; x += 8) {
    for (let y = 0; y < HEIGHT; y += 8) {
      if (((x * 31 + y * 17) & 15) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // chalk scribbles
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  for (let i = 0; i < 30; i++) {
    const x = (i * 137) % WIDTH;
    const y = 200 + ((i * 71) % (HEIGHT - 230));
    ctx.fillRect(x, y, 2, 1);
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as SchoolScene;
  // hopscotch painted on ground
  for (const h of scene.hopscotches) drawHopscotch(ctx, h.x, h.y);
  // entrance wall + sign
  drawSchoolEntrance(ctx, scene.entrance.x, scene.entrance.y, scene.entrance.w);
  // flagpole
  drawFlagpoleAR(ctx, scene.flagpole.x, scene.flagpole.y);
  // benches
  for (const b of scene.benches) drawSchoolBench(ctx, b.x, b.y, b.w);
  // backpacks
  for (const p of scene.packs) drawBackpack(ctx, p.x, p.y, p.color);
  // trashes
  for (const t of scene.trashes) drawTrashCan(ctx, t.x, t.y, t.color);
  // balls
  for (const b of scene.balls) drawSchoolBall(ctx, b.x, b.y, b.color);
  // ropes
  for (const r of scene.ropes) drawJumpRope(ctx, r.x, r.y);
}

function renderOver(_ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "La Escuela",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
