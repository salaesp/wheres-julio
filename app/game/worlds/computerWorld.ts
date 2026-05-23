import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawCPU, drawRAMStick, drawCable, drawBugDigital, drawRobotAnt,
} from "../sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 42;
const MARGIN = 12;

type Ram = { x: number; y: number; h: number };
type Cable = { x1: number; y1: number; x2: number; y2: number; color: string };
type Bug = { x: number; y: number };
type Robot = { x: number; y: number };
type Bit = { x: number; y: number; value: "0" | "1" };

export type ComputerScene = {
  cpu: { x: number; y: number; size: number };
  rams: Ram[];
  cables: Cable[];
  bugs: Bug[];
  robots: Robot[];
  bits: Bit[];
};

function buildScene(): ComputerScene {
  const cpu = { x: WIDTH / 2 - 50, y: 320, size: 100 };

  const rams: Ram[] = [
    { x: 80, y: 110, h: 160 },
    { x: 110, y: 110, h: 160 },
    { x: 320, y: 110, h: 160 },
    { x: 350, y: 110, h: 160 },
  ];

  const cables: Cable[] = [
    { x1: 60, y1: 500, x2: 200, y2: 540, color: "#e23a3a" },
    { x1: 240, y1: 560, x2: 420, y2: 520, color: "#3a78c9" },
    { x1: 80, y1: 660, x2: 280, y2: 700, color: "#f0c842" },
    { x1: 320, y1: 680, x2: 440, y2: 740, color: "#3aa86a" },
  ];

  const bugs: Bug[] = [
    { x: 90, y: 460 },
    { x: 380, y: 480 },
    { x: 200, y: 600 },
    { x: 410, y: 600 },
    { x: 60, y: 540 },
    { x: 280, y: 460 },
  ];

  const robots: Robot[] = [
    { x: 150, y: 290 },
    { x: 350, y: 290 },
    { x: 230, y: 470 },
    { x: 320, y: 730 },
    { x: 100, y: 720 },
  ];

  // bits floating decoration — pre-positioned (rendered as background text)
  const bits: Bit[] = [];
  const rngB = createRng(7);
  for (let i = 0; i < 80; i++) {
    bits.push({
      x: randRange(rngB, 10, WIDTH - 10),
      y: randRange(rngB, 100, HEIGHT - 10),
      value: rngB() < 0.5 ? "0" : "1",
    });
  }

  return { cpu, rams, cables, bugs, robots, bits };
}

function collides(scene: ComputerScene, x: number, y: number, r: number): boolean {
  // CPU square
  const cpu = scene.cpu;
  if (x > cpu.x - r && x < cpu.x + cpu.size + r && y > cpu.y - r && y < cpu.y + cpu.size + r) return true;
  // RAM sticks
  for (const m of scene.rams) {
    if (x > m.x - r && x < m.x + 36 + r && y > m.y - r && y < m.y + m.h + r) return true;
  }
  // bugs
  for (const b of scene.bugs) {
    const dx = b.x - x, dy = b.y - y;
    if (dx * dx + dy * dy < (16 + r) * (16 + r)) return true;
  }
  // robots
  for (const rob of scene.robots) {
    const dx = rob.x - x, dy = rob.y - y;
    if (dx * dx + dy * dy < (16 + r) * (16 + r)) return true;
  }
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as ComputerScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.4;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 1000; i++) {
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

function renderBackground(ctx: CanvasRenderingContext2D, _scene: unknown, time: number) {
  const scene = _scene as ComputerScene;
  // PCB green base
  ctx.fillStyle = "#0a3a1a";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // green texture / haze
  ctx.fillStyle = "#1a5a2a";
  for (let x = 0; x < WIDTH; x += 8) {
    for (let y = 0; y < HEIGHT; y += 8) {
      if (((x * 31 + y * 17) & 7) === 0) ctx.fillRect(x, y, 2, 2);
    }
  }
  // PCB traces — gold lines forming circuits
  ctx.fillStyle = "#c89a3a";
  // horizontal traces
  for (let y = 60; y < HEIGHT; y += 32) {
    ctx.fillRect(20, y, WIDTH - 40, 1);
    // junction dots
    for (let x = 40; x < WIDTH - 40; x += 64) {
      ctx.fillRect(x, y - 1, 3, 3);
    }
  }
  // vertical traces
  for (let x = 60; x < WIDTH; x += 60) {
    ctx.fillRect(x, 50, 1, HEIGHT - 70);
  }
  // gold via dots
  ctx.fillStyle = "#f0c842";
  for (let x = 40; x < WIDTH; x += 64) {
    for (let y = 60; y < HEIGHT; y += 32) {
      if (((x + y) & 15) === 0) ctx.fillRect(x, y - 1, 3, 3);
    }
  }
  // tiny SMD components scattered
  ctx.fillStyle = "#1a1a1a";
  for (let i = 0; i < 25; i++) {
    const x = (i * 137) % (WIDTH - 20) + 10;
    const y = 80 + ((i * 71) % (HEIGHT - 110));
    ctx.fillRect(x, y, 4, 2);
    ctx.fillStyle = "#f0c842";
    ctx.fillRect(x, y, 1, 2);
    ctx.fillRect(x + 3, y, 1, 2);
    ctx.fillStyle = "#1a1a1a";
  }

  // floating bits (0/1) animated drifting
  ctx.font = "bold 9px ui-monospace, monospace";
  for (const b of scene.bits) {
    const drift = (Math.sin(time * 1.2 + b.x * 0.03) * 4);
    const alpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2 + b.y * 0.05));
    ctx.fillStyle = `rgba(122, 223, 122, ${alpha})`;
    ctx.fillText(b.value, b.x, b.y + drift);
  }
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as ComputerScene;
  // RAM sticks
  for (const m of scene.rams) drawRAMStick(ctx, m.x, m.y, m.h);
  // cables
  for (const c of scene.cables) drawCable(ctx, c.x1, c.y1, c.x2, c.y2, c.color);
  // CPU
  drawCPU(ctx, scene.cpu.x, scene.cpu.y, scene.cpu.size);
  // bugs
  for (const b of scene.bugs) drawBugDigital(ctx, b.x, b.y);
  // robots
  for (const r of scene.robots) drawRobotAnt(ctx, r.x, r.y);
}

function renderOver(_ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "Adentro de la Computadora",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
