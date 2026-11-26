// Declarative world builder: an ASCII tile map + a list of props becomes a
// WorldModule (ground rendering, animated tiles, depth-sorted props, and a
// generic character placement that respects terrain + prop collisions).
import {
  TILE, makeGrid, drawGround, drawAnimatedTiles, isAnimated, terrainAt, coverSprite,
  type Terrain, type TerrainGrid,
} from "./terrain";
import { drawProp, propSolid, type PropDef, type PropInstance, type Rect } from "./props";
import type { Outfit, Dir } from "./characters";
import { createRng, randInt, randRange } from "../utils/seededRandom";
import type { CoverPiece, NpcPos, Placement, WorldModule } from "../worlds/types";

/** [prop, tileX, tileY] — top-left of the prop sprite in tile units (fractions ok). */
export type PropPlace = readonly [PropDef, number, number];

export type WorldDef = {
  title: string;
  npcCount: number;
  legend: Record<string, Terrain>;
  /** Rows of legend characters. All rows must have the same length. */
  map: readonly string[];
  props?: readonly PropPlace[];
  outfit?: Outfit;
  background?: string;
  /** Extra spawn filter in world pixels (feet position). */
  canSpawn?: (x: number, y: number) => boolean;
};

export type WorldScene = {
  grid: TerrainGrid;
  props: PropInstance[]; // all props
  sorted: PropInstance[]; // non-flat
  solids: Rect[];
  animated: number[];
};

export function defineWorld(def: WorldDef): WorldModule {
  const rows = def.map.length;
  const cols = def.map[0].length;
  const W = cols * TILE;
  const H = rows * TILE;

  for (const [i, r] of def.map.entries()) {
    if (r.length !== cols) {
      throw new Error(`[${def.title}] map row ${i} has length ${r.length}, expected ${cols}`);
    }
    for (const ch of r) {
      if (!def.legend[ch]) throw new Error(`[${def.title}] unknown terrain char '${ch}' in row ${i}`);
    }
  }

  function buildScene(): WorldScene {
    const cells: Terrain[] = [];
    for (const r of def.map) for (const ch of r) cells.push(def.legend[ch]);
    const grid = makeGrid(cols, rows, cells);
    const props: PropInstance[] = (def.props ?? []).map(([d, tx, ty], i) => ({
      def: d, x: Math.round(tx * TILE), y: Math.round(ty * TILE), phase: (i * 0.37) % 1 * 4,
    }));
    const sorted = props.filter((p) => !p.def.flat);
    const solids = props.map(propSolid).filter((r): r is Rect => !!r);
    const animated: number[] = [];
    cells.forEach((t, i) => { if (isAnimated(t)) animated.push(i); });
    return { grid, props, sorted, solids, animated };
  }

  const walkableAt = (s: WorldScene, x: number, y: number) => {
    const t = terrainAt(s.grid, Math.floor(x / TILE), Math.floor(y / TILE));
    return !!t && t.walkable !== false;
  };

  function freeSpot(s: WorldScene, x: number, y: number): boolean {
    if (x < 9 || x > W - 9 || y < 22 || y > H - 3) return false;
    if (!walkableAt(s, x - 5, y) || !walkableAt(s, x + 5, y) || !walkableAt(s, x, y - 3)) return false;
    for (const r of s.solids) {
      if (x > r.x - 6 && x < r.x + r.w + 6 && y > r.y - 2 && y < r.y + r.h + 4) return false;
    }
    // Don't stand fully hidden behind a tall prop.
    for (const p of s.sorted) {
      const base = p.y + (p.def.baseY ?? p.def.h());
      if (y >= base) continue;
      const cx = x, cy = y - 11;
      if (cx > p.x + 2 && cx < p.x + p.def.w() - 2 && cy > p.y + 2 && cy < base) return false;
    }
    if (def.canSpawn && !def.canSpawn(x, y)) return false;
    return true;
  }

  function placeCharacters(seed: number, s: WorldScene): Placement {
    const rng = createRng(seed);
    const npcs: NpcPos[] = [];
    const MIN = 12;
    const tryPlace = (minDist: number): { x: number; y: number } | null => {
      for (let i = 0; i < 1500; i++) {
        const x = Math.round(randRange(rng, 9, W - 9));
        const y = Math.round(randRange(rng, 22, H - 3));
        if (!freeSpot(s, x, y)) continue;
        let ok = true;
        for (const n of npcs) {
          const dx = n.x - x, dy = (n.y - y) * 1.3;
          if (dx * dx + dy * dy < minDist * minDist) { ok = false; break; }
        }
        if (ok) return { x, y };
      }
      return null;
    };
    for (let i = 0; i < def.npcCount; i++) {
      const p = tryPlace(MIN) ?? tryPlace(8);
      if (!p) continue;
      npcs.push({ ...p, variant: randInt(rng, 0, 4000), dir: randInt(rng, 0, 4) as Dir });
    }
    // Julio: a bit more breathing room so he's never completely covered, and
    // never on terrains flagged noJulio (wading water).
    const okForJulio = (p: { x: number; y: number } | null) => {
      if (!p) return null;
      for (const [dx, dy] of [[-6, 0], [6, 0], [0, -4], [0, -10], [-6, -8], [6, -8]]) {
        const t = terrainAt(s.grid, Math.floor((p.x + dx) / TILE), Math.floor((p.y + dy) / TILE));
        if (t?.noJulio) return null;
      }
      return p;
    };
    const tryJulio = (minDist: number) => {
      for (let k = 0; k < 40; k++) {
        const p = okForJulio(tryPlace(minDist));
        if (p) return p;
      }
      return null;
    };
    const j = tryJulio(15) ?? tryJulio(10) ?? tryJulio(6) ?? { x: W / 2, y: H / 2 };
    // Julio always faces the player (front view) — side/back views are too hard.
    return { julio: { ...j, dir: 0 as Dir }, npcs };
  }

  function drawGroundAll(ctx: CanvasRenderingContext2D, s: WorldScene) {
    drawGround(ctx, s.grid);
    for (const p of s.props) if (p.def.flat) drawProp(ctx, p, 0);
  }

  function drawAnimated(ctx: CanvasRenderingContext2D, s: WorldScene, time: number) {
    if (!s.animated.length) return;
    drawAnimatedTiles(ctx, s.grid, time, s.animated);
    // Flat props sitting on animated tiles (floats, lily pads) must be redrawn.
    for (const p of s.props) {
      if (!p.def.flat) continue;
      const t = terrainAt(s.grid, Math.floor((p.x + p.def.w() / 2) / TILE), Math.floor((p.y + p.def.h() / 2) / TILE));
      if (t && isAnimated(t)) drawProp(ctx, p, time);
    }
  }

  function coverAt(s: WorldScene, x: number, y: number): CoverPiece[] {
    const out: CoverPiece[] = [];
    // Cover from a clump-top row (multiple of 8, aligned with the tile art)
    // down to the feet, ±8px around the character.
    const top = Math.floor((y - 3) / 8) * 8;
    const bottom = Math.round(y) + 2;
    const left = Math.round(x) - 9, right = Math.round(x) + 9;
    for (let ty = Math.floor(top / TILE); ty * TILE < bottom; ty++) {
      for (let tx = Math.floor(left / TILE); tx * TILE < right; tx++) {
        const t = terrainAt(s.grid, tx, ty);
        if (!t) continue;
        const c = coverSprite(t);
        if (!c) continue;
        const x0 = Math.max(left, tx * TILE), x1 = Math.min(right, tx * TILE + TILE);
        const y0 = Math.max(top, ty * TILE), y1 = Math.min(bottom, ty * TILE + TILE);
        if (x1 <= x0 || y1 <= y0) continue;
        out.push({ sprite: c, sx: x0 - tx * TILE, sy: y0 - ty * TILE, w: x1 - x0, h: y1 - y0, x: x0, y: y0 });
      }
    }
    return out;
  }

  const mod: WorldModule<WorldScene> = {
    width: W,
    height: H,
    npcCount: def.npcCount,
    title: def.title,
    background: def.background ?? "#181850",
    outfit: def.outfit,
    outfitKey: def.title,
    buildScene,
    placeCharacters,
    drawGround: drawGroundAll,
    drawAnimated,
    props: (s) => s.sorted,
    coverAt,
  };
  return mod as unknown as WorldModule;
}
