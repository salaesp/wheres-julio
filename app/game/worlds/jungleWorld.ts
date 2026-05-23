import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawJungleTreeTrunk, drawJungleCanopy, drawVine,
  drawTiger, drawMonkey, drawElephant,
} from "../characters/sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 44;
const MARGIN = 20;

type Tree = { x: number; y: number; r: number };
type Vine = { x: number; y: number; h: number };
type Animal = { x: number; y: number; kind: "tiger" | "monkey" | "elephant" };
type RiverPoint = { x: number; y: number };

export type JungleScene = {
  trees: Tree[];
  vines: Vine[];
  animals: Animal[];
  river: { points: RiverPoint[]; width: number };
  waterfall: { x: number; y: number; w: number; h: number };
};

function buildScene(): JungleScene {
  // Serpentine river crossing horizontally with curves
  const river = {
    points: [
      { x: 0, y: 420 },
      { x: 90, y: 410 },
      { x: 170, y: 470 },
      { x: 250, y: 500 },
      { x: 330, y: 460 },
      { x: 410, y: 430 },
      { x: WIDTH, y: 460 },
    ],
    width: 38,
  };

  // Waterfall feeding river from top-right
  const waterfall = { x: 380, y: 100, w: 30, h: 230 };

  // Trees scattered (dense canopy cover)
  const trees: Tree[] = [
    { x: 70, y: 130, r: 36 },
    { x: 220, y: 130, r: 38 },
    { x: 380, y: 70, r: 32 },
    { x: 40, y: 280, r: 34 },
    { x: 180, y: 280, r: 36 },
    { x: 320, y: 290, r: 36 },
    { x: 60, y: 580, r: 36 },
    { x: 200, y: 620, r: 38 },
    { x: 340, y: 580, r: 36 },
    { x: 440, y: 620, r: 32 },
    { x: 100, y: 740, r: 32 },
    { x: 260, y: 760, r: 36 },
    { x: 420, y: 750, r: 34 },
  ];

  // Vines hanging from canopies
  const vines: Vine[] = [
    { x: 80, y: 150, h: 70 },
    { x: 230, y: 150, h: 60 },
    { x: 60, y: 300, h: 60 },
    { x: 200, y: 300, h: 70 },
    { x: 340, y: 310, h: 55 },
    { x: 80, y: 600, h: 60 },
    { x: 220, y: 640, h: 50 },
    { x: 360, y: 600, h: 65 },
    { x: 280, y: 740, h: 50 },
  ];

  // Animals
  const animals: Animal[] = [
    // tigers (in clearings)
    { x: 130, y: 220, kind: "tiger" },
    { x: 360, y: 360, kind: "tiger" },
    { x: 130, y: 700, kind: "tiger" },
    // monkeys (hanging on vines)
    { x: 80, y: 200, kind: "monkey" },
    { x: 230, y: 200, kind: "monkey" },
    { x: 200, y: 350, kind: "monkey" },
    { x: 340, y: 360, kind: "monkey" },
    { x: 80, y: 650, kind: "monkey" },
    { x: 220, y: 690, kind: "monkey" },
    { x: 360, y: 650, kind: "monkey" },
    // elephants (big, in open spots)
    { x: 250, y: 250, kind: "elephant" },
    { x: 130, y: 540, kind: "elephant" },
    { x: 390, y: 540, kind: "elephant" },
  ];

  return { trees, vines, animals, river, waterfall };
}

function distToRiver(scene: JungleScene, x: number, y: number): number {
  let best = Infinity;
  const pts = scene.river.points;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    let t = ((x - a.x) * dx + (y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + dx * t, py = a.y + dy * t;
    const d2 = (x - px) * (x - px) + (y - py) * (y - py);
    if (d2 < best) best = d2;
  }
  return Math.sqrt(best);
}

function collides(scene: JungleScene, x: number, y: number, r: number): boolean {
  // river is impassable
  if (distToRiver(scene, x, y) < scene.river.width / 2 + r - 4) return true;
  // waterfall area blocked
  const wf = scene.waterfall;
  if (x > wf.x - r && x < wf.x + wf.w + r && y > wf.y - r && y < wf.y + wf.h + r) return true;
  // tree trunks
  for (const t of scene.trees) {
    const dx = t.x - x, dy = t.y - y;
    if (dx * dx + dy * dy < (12 + r) * (12 + r)) return true;
  }
  // animals
  for (const a of scene.animals) {
    const range = a.kind === "elephant" ? 30 : a.kind === "tiger" ? 22 : 14;
    const dxA = a.x - x, dyA = a.y - y;
    if (dxA * dxA + dyA * dyA < (range + r) * (range + r)) return true;
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as JungleScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.42;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 800; i++) {
      const x = randRange(rng, MARGIN, WIDTH - MARGIN);
      const y = randRange(rng, 130, HEIGHT - MARGIN - 30);
      if (collides(scene, x, y, 10)) continue;
      let ok = true;
      for (const n of npcs) {
        const dxn = n.x - x, dyn = n.y - y;
        if (dxn * dxn + dyn * dyn < minDist * minDist) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
    return { x: WIDTH / 2, y: 200 };
  }

  for (let i = 0; i < NPC_COUNT; i++) {
    const p = tryPlace();
    npcs.push({ x: p.x, y: p.y, variant: randInt(rng, 0, 12) });
  }
  const julio = tryPlace();
  return { julio, npcs };
}

function strokeRiver(ctx: CanvasRenderingContext2D, scene: JungleScene, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const pts = scene.river.points;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
}

function renderBackground(ctx: CanvasRenderingContext2D, _scene: unknown, time: number) {
  const scene = _scene as JungleScene;
  // jungle floor — dark green
  ctx.fillStyle = "#3a5a2a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#2a4a1a";
  for (let x = 0; x < WIDTH; x += 14) {
    for (let y = 0; y < HEIGHT; y += 14) {
      if (((x * 31 + y * 17) & 5) === 0) ctx.fillRect(x, y, 3, 3);
    }
  }
  ctx.fillStyle = "#5a7a3a";
  for (let x = 7; x < WIDTH; x += 18) {
    for (let y = 7; y < HEIGHT; y += 18) {
      if (((x * 13 + y * 23) & 7) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // fallen leaves (yellow/orange)
  const leafColors = ["#f0c842", "#e88a3a", "#a86a2a"];
  for (let x = 4; x < WIDTH; x += 28) {
    for (let y = 4; y < HEIGHT; y += 28) {
      if (((x * 41 + y * 19) & 15) === 0) {
        ctx.fillStyle = leafColors[((x + y) >>> 0) % leafColors.length];
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  // River (banks + water + foam)
  strokeRiver(ctx, scene, "#8a5a2a", scene.river.width + 8); // bank dark
  strokeRiver(ctx, scene, "#c89a5a", scene.river.width + 2); // bank light (sand)
  strokeRiver(ctx, scene, "#1a4a8a", scene.river.width);     // water deep
  strokeRiver(ctx, scene, "#3a78c9", scene.river.width - 8); // water mid
  // animated highlight stripes on river (current flow)
  ctx.save();
  ctx.beginPath();
  const pts = scene.river.points;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.lineWidth = scene.river.width - 4;
  ctx.strokeStyle = "transparent";
  ctx.stroke();
  ctx.restore();
  // dotted foam moving
  ctx.fillStyle = "#a8d8ff";
  const off = (time * 18) % 14;
  for (const p of scene.river.points) {
    ctx.fillRect(p.x + ((p.x + off) % 14) - 7, p.y - 2, 4, 2);
    ctx.fillRect(p.x - ((p.x + off) % 14) + 7, p.y + 4, 3, 2);
  }

  // Waterfall (vertical animated stripes)
  const wf = scene.waterfall;
  ctx.fillStyle = "#3a78c9";
  ctx.fillRect(wf.x, wf.y, wf.w, wf.h);
  ctx.fillStyle = "#5aa6e8";
  const stripeOff = (time * 80) % 12;
  for (let yy = wf.y - 12 + stripeOff; yy < wf.y + wf.h; yy += 12) {
    ctx.fillRect(wf.x + 2, yy, wf.w - 4, 4);
  }
  ctx.fillStyle = "#cfeaff";
  for (let yy = wf.y - 6 + stripeOff; yy < wf.y + wf.h; yy += 18) {
    ctx.fillRect(wf.x + 6, yy, 4, 2);
    ctx.fillRect(wf.x + 16, yy + 6, 4, 2);
  }
  // top edge (cliff rocks)
  ctx.fillStyle = "#5a5a66";
  ctx.fillRect(wf.x - 4, wf.y - 8, wf.w + 8, 8);
  // foam pool at bottom
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(wf.x - 4, wf.y + wf.h - 6, wf.w + 8, 4);
  ctx.fillStyle = "#cfeaff";
  ctx.fillRect(wf.x - 6, wf.y + wf.h - 2, wf.w + 12, 4);
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as JungleScene;
  // trunks
  for (const t of scene.trees) drawJungleTreeTrunk(ctx, t.x, t.y);
  // vines below canopy
  for (const v of scene.vines) drawVine(ctx, v.x, v.y, v.h);
  // animals
  for (const a of scene.animals) {
    if (a.kind === "tiger") drawTiger(ctx, a.x, a.y);
    else if (a.kind === "monkey") drawMonkey(ctx, a.x, a.y);
    else if (a.kind === "elephant") drawElephant(ctx, a.x, a.y);
  }
}

function renderOver(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as JungleScene;
  // canopies on top — hide chars below for waldo feel
  for (const t of scene.trees) drawJungleCanopy(ctx, t.x, t.y, t.r);
}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "La Jungla",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
