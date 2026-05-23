import { createRng, randRange, randInt } from "../utils/seededRandom";
import {
  SPRITE_SIZE,
  drawShipWheel, drawCannon, drawTreasureChest, drawTreasureMap,
  drawCaptain, drawParrot, drawSkeleton, drawIsland,
  drawBarrel, drawRopeCoil, drawLantern, drawAnchor,
} from "../characters/sprites";
import type { NpcPos, Placement, WorldModule } from "./types";

export const WIDTH = 480;
export const HEIGHT = 800;
export const NPC_COUNT = 58;
const MARGIN = 12;

type Cannon = { x: number; y: number; vertical: boolean };
type Special = { x: number; y: number; kind: "captain" | "parrot" | "skeleton" };
type Pt = { x: number; y: number };

export type PirateScene = {
  deck: { x: number; y: number; w: number; h: number };
  bowY: number;
  sternY: number;
  wheel: { x: number; y: number };
  cannons: Cannon[];
  chest: { x: number; y: number };
  mapTable: { x: number; y: number };
  specials: Special[];
  islands: { x: number; y: number }[];
  barrels: Pt[];
  ropeCoils: Pt[];
  lanterns: Pt[];
  anchor: Pt;
};

function buildScene(): PirateScene {
  const deck = { x: 60, y: 110, w: WIDTH - 120, h: HEIGHT - 220 };
  const bowY = deck.y - 60; // pointed bow above
  const sternY = deck.y + deck.h + 60; // rounded stern below

  const wheel = { x: WIDTH / 2, y: deck.y + 40 };

  // Cannons along port (left) and starboard (right) — más densos
  const cannons: Cannon[] = [];
  for (let i = 0; i < 5; i++) {
    cannons.push({ x: deck.x + 18, y: deck.y + 100 + i * 90, vertical: false });
    cannons.push({ x: deck.x + deck.w - 18, y: deck.y + 100 + i * 90, vertical: false });
  }
  // 2 cañones en bow apuntando arriba
  cannons.push({ x: deck.x + deck.w / 2 - 30, y: bowY + 15, vertical: true });
  cannons.push({ x: deck.x + deck.w / 2 + 30, y: bowY + 15, vertical: true });

  const chest = { x: WIDTH / 2 - 30, y: deck.y + deck.h - 80 };
  const mapTable = { x: WIDTH / 2 + 50, y: deck.y + 140 };

  // Especiales — más loros + esqueletos
  const specials: Special[] = [
    { x: wheel.x + 20, y: wheel.y + 6, kind: "captain" },
    { x: wheel.x + 26, y: wheel.y - 4, kind: "parrot" },
    { x: WIDTH / 2 - 80, y: deck.y + 60, kind: "parrot" },
    { x: WIDTH / 2 + 80, y: deck.y + 240, kind: "parrot" },
    { x: deck.x + 50, y: deck.y + deck.h - 60, kind: "skeleton" },
    { x: deck.x + deck.w - 60, y: deck.y + deck.h - 90, kind: "skeleton" },
  ];

  // Barriles agrupados
  const barrels: Pt[] = [
    { x: deck.x + 40, y: deck.y + 80 },
    { x: deck.x + 65, y: deck.y + 85 },
    { x: deck.x + 40, y: deck.y + 110 },
    { x: deck.x + deck.w - 40, y: deck.y + 80 },
    { x: deck.x + deck.w - 65, y: deck.y + 85 },
    { x: deck.x + deck.w - 40, y: deck.y + 110 },
    { x: WIDTH / 2 - 40, y: deck.y + deck.h - 130 },
    { x: WIDTH / 2 + 40, y: deck.y + deck.h - 30 },
    { x: deck.x + 70, y: deck.y + deck.h - 30 },
    { x: deck.x + deck.w - 70, y: deck.y + deck.h - 30 },
  ];

  // Rollos de soga en cubierta
  const ropeCoils: Pt[] = [
    { x: deck.x + 90, y: deck.y + 220 },
    { x: deck.x + deck.w - 90, y: deck.y + 320 },
    { x: WIDTH / 2 - 60, y: deck.y + 380 },
    { x: WIDTH / 2 + 60, y: deck.y + 430 },
    { x: deck.x + 60, y: deck.y + 480 },
    { x: deck.x + deck.w - 60, y: deck.y + 520 },
  ];

  // Linternas iluminando cubierta
  const lanterns: Pt[] = [
    { x: deck.x + 30, y: bowY + 30 },
    { x: deck.x + deck.w - 30, y: bowY + 30 },
    { x: deck.x + 30, y: sternY - 30 },
    { x: deck.x + deck.w - 30, y: sternY - 30 },
    { x: WIDTH / 2, y: deck.y + deck.h / 2 },
  ];

  // Ancla en proa
  const anchor: Pt = { x: deck.x + 30, y: deck.y + 50 };

  // Islands floating in distance
  const islands = [
    { x: 30, y: 30 },
    { x: WIDTH - 40, y: 60 },
    { x: 60, y: HEIGHT - 40 },
    { x: WIDTH - 60, y: HEIGHT - 40 },
  ];

  return { deck, bowY, sternY, wheel, cannons, chest, mapTable, specials, islands, barrels, ropeCoils, lanterns, anchor };
}

// Hull shape — chars only allowed on deck
function onDeck(scene: PirateScene, x: number, y: number): boolean {
  const d = scene.deck;
  // Main rectangle
  if (x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h) return true;
  // Bow tapered (above deck) — narrowing triangle
  if (y < d.y && y > scene.bowY) {
    const t = (d.y - y) / (d.y - scene.bowY);
    const halfW = (d.w / 2) * (1 - t * 0.8);
    return x > d.x + d.w / 2 - halfW && x < d.x + d.w / 2 + halfW;
  }
  // Stern rounded (below deck) — short rect
  if (y > d.y + d.h && y < scene.sternY) {
    const t = (y - (d.y + d.h)) / (scene.sternY - (d.y + d.h));
    const halfW = (d.w / 2) * (1 - t * 0.5);
    return x > d.x + d.w / 2 - halfW && x < d.x + d.w / 2 + halfW;
  }
  return false;
}

function collides(scene: PirateScene, x: number, y: number, r: number): boolean {
  if (!onDeck(scene, x, y)) return true;
  // wheel
  const dxw = scene.wheel.x - x, dyw = scene.wheel.y - y;
  if (dxw * dxw + dyw * dyw < (16 + r) * (16 + r)) return true;
  // cannons
  for (const c of scene.cannons) {
    if (x > c.x - 16 && x < c.x + 16 && y > c.y - 10 && y < c.y + 14) return true;
  }
  // chest
  if (x > scene.chest.x - 24 && x < scene.chest.x + 24 && y > scene.chest.y - 24 && y < scene.chest.y + 18) return true;
  // map table
  if (x > scene.mapTable.x - 24 && x < scene.mapTable.x + 24 && y > scene.mapTable.y - 18 && y < scene.mapTable.y + 16) return true;
  // specials (captain area blocks)
  for (const s of scene.specials) {
    const dxs = s.x - x, dys = s.y - y;
    if (dxs * dxs + dys * dys < (16 + r) * (16 + r)) return true;
  }
  // barrels
  for (const b of scene.barrels) {
    const dxb = b.x - x, dyb = b.y - y;
    if (dxb * dxb + dyb * dyb < (14 + r) * (14 + r)) return true;
  }
  // rope coils (small)
  for (const rc of scene.ropeCoils) {
    const dxr = rc.x - x, dyr = rc.y - y;
    if (dxr * dxr + dyr * dyr < (10 + r) * (10 + r)) return true;
  }
  // lanterns
  for (const l of scene.lanterns) {
    const dxl = l.x - x, dyl = l.y - y;
    if (dxl * dxl + dyl * dyl < (8 + r) * (8 + r)) return true;
  }
  // anchor
  const dxa = scene.anchor.x - x, dya = scene.anchor.y - y;
  if (dxa * dxa + dya * dya < (16 + r) * (16 + r)) return true;
  return false;
}

function placeCharacters(seed: number, _scene: unknown): Placement {
  const scene = _scene as PirateScene;
  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist = SPRITE_SIZE * 0.42;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < 800; i++) {
      const x = randRange(rng, scene.deck.x + 10, scene.deck.x + scene.deck.w - 10);
      const y = randRange(rng, scene.deck.y + 100, scene.deck.y + scene.deck.h - 30);
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
  const scene = _scene as PirateScene;
  // Stormy sea base
  const bands = ["#0a2440", "#1a3a6a", "#2a4a8a", "#3a5a9a"];
  for (let i = 0; i < bands.length; i++) {
    ctx.fillStyle = bands[i];
    ctx.fillRect(0, (HEIGHT / bands.length) * i, WIDTH, HEIGHT / bands.length + 2);
  }
  // animated foam crests
  ctx.fillStyle = "#a8d8ff";
  const off = (time * 14) % 16;
  for (let y = 20; y < HEIGHT - 20; y += 32) {
    for (let x = -16 + off; x < WIDTH; x += 32) {
      ctx.fillRect(x, y, 8, 2);
      ctx.fillRect(x + 12, y + 6, 6, 2);
    }
  }
  ctx.fillStyle = "#ffffff";
  for (let y = 10; y < HEIGHT - 10; y += 38) {
    for (let x = -8 + (off / 2); x < WIDTH; x += 40) {
      ctx.fillRect(x, y + Math.sin(time * 2 + x * 0.05) * 2, 4, 2);
    }
  }
  // Islands in distance (corners) — drawn here as far background
  for (const isl of scene.islands) drawIsland(ctx, isl.x, isl.y);
}

function drawHull(ctx: CanvasRenderingContext2D, scene: PirateScene) {
  const d = scene.deck;
  // Hull outline + bow + stern (top-down view)
  const hullColor = "#5a3a1a";
  const hullShade = "#3a2a14";
  const deckColor = "#a87a4a";
  const deckPlank = "#7a4a22";

  ctx.fillStyle = hullColor;
  // main hull (with extra for hull thickness)
  ctx.fillRect(d.x - 6, d.y, d.w + 12, d.h);
  // bow taper (triangle-ish)
  ctx.beginPath();
  ctx.moveTo(d.x + d.w / 2, scene.bowY);
  ctx.lineTo(d.x - 6, d.y + 20);
  ctx.lineTo(d.x + d.w + 6, d.y + 20);
  ctx.closePath();
  ctx.fill();
  // stern rounded
  ctx.beginPath();
  ctx.ellipse(d.x + d.w / 2, d.y + d.h, d.w / 2 + 6, scene.sternY - (d.y + d.h), 0, 0, Math.PI);
  ctx.fill();

  // deck (inner)
  ctx.fillStyle = deckColor;
  ctx.fillRect(d.x, d.y, d.w, d.h);
  // bow deck taper
  ctx.beginPath();
  ctx.moveTo(d.x + d.w / 2, scene.bowY + 18);
  ctx.lineTo(d.x, d.y + 22);
  ctx.lineTo(d.x + d.w, d.y + 22);
  ctx.closePath();
  ctx.fill();
  // stern deck
  ctx.beginPath();
  ctx.ellipse(d.x + d.w / 2, d.y + d.h, d.w / 2, scene.sternY - (d.y + d.h) - 8, 0, 0, Math.PI);
  ctx.fill();

  // deck planks (horizontal lines)
  ctx.fillStyle = deckPlank;
  for (let yy = d.y + 6; yy < d.y + d.h; yy += 14) {
    ctx.fillRect(d.x + 4, yy, d.w - 8, 1);
  }
  // wood knots
  ctx.fillStyle = "#5a3a1a";
  for (let xx = d.x + 8; xx < d.x + d.w; xx += 28) {
    for (let yy = d.y + 14; yy < d.y + d.h; yy += 42) {
      ctx.fillRect(xx, yy, 2, 2);
    }
  }

  // hull stripe (gold band)
  ctx.fillStyle = "#f0c842";
  ctx.fillRect(d.x - 6, d.y + d.h / 2 - 2, d.w + 12, 3);
  // hull shadow line
  ctx.fillStyle = hullShade;
  ctx.fillRect(d.x - 6, d.y + d.h / 2 + 1, d.w + 12, 1);

  // gunwale (rim around deck)
  ctx.fillStyle = hullShade;
  ctx.fillRect(d.x - 2, d.y + 22, 4, d.h - 22);
  ctx.fillRect(d.x + d.w - 2, d.y + 22, 4, d.h - 22);
}

function renderUnder(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as PirateScene;
  drawHull(ctx, scene);
  // anchor (lower z than chars)
  drawAnchor(ctx, scene.anchor.x, scene.anchor.y);
  // wheel
  drawShipWheel(ctx, scene.wheel.x, scene.wheel.y);
  // cannons
  for (const c of scene.cannons) drawCannon(ctx, c.x, c.y, c.vertical);
  // barrels + rope coils
  for (const b of scene.barrels) drawBarrel(ctx, b.x, b.y);
  for (const rc of scene.ropeCoils) drawRopeCoil(ctx, rc.x, rc.y);
  // chest + map
  drawTreasureChest(ctx, scene.chest.x, scene.chest.y);
  drawTreasureMap(ctx, scene.mapTable.x, scene.mapTable.y);
  // captain + parrot + skeleton
  for (const s of scene.specials) {
    if (s.kind === "captain") drawCaptain(ctx, s.x, s.y);
    else if (s.kind === "parrot") drawParrot(ctx, s.x, s.y);
    else if (s.kind === "skeleton") drawSkeleton(ctx, s.x, s.y);
  }
}

function renderOver(ctx: CanvasRenderingContext2D, _scene: unknown, _time: number) {
  const scene = _scene as PirateScene;
  // Lanterns drawn on top so glow shows over NPCs near them
  for (const l of scene.lanterns) drawLantern(ctx, l.x, l.y);
}

export const worldModule: WorldModule = {
  width: WIDTH,
  height: HEIGHT,
  npcCount: NPC_COUNT,
  title: "El Barco Pirata",
  buildScene,
  placeCharacters,
  renderBackground,
  renderUnder,
  renderOver,
};
