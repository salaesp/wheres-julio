// Tile terrains (16×16) with automatic Pokémon-style edge transitions.
//
// Every terrain has a `level`. Where a higher terrain touches a lower one, the
// higher terrain "overhangs" 1–3 px into the lower tile (its `lip`), with a dark
// outline, and the lower tile gets a shadow line under it. That one rule gives
// grass ledges over dirt paths, sand shores over water, carpets over floors…
import { Sprite, makeSprite, type Pal } from "./sprite";

export const TILE = 16;

export type TileArt = { rows: readonly string[]; weight?: number };

export type TerrainDef = {
  id: string;
  /** Higher levels overhang onto lower neighbours. */
  level: number;
  /** Can characters stand here? (default true) */
  walkable?: boolean;
  pal: Pal;
  /** Weighted random variants (16×16 rows). Frame 0 when animated. */
  variants: readonly TileArt[];
  /** Animation frames (each a list of variants, same length as `variants`). */
  frames?: readonly (readonly TileArt[])[];
  fps?: number;
  /** How this terrain looks when it overhangs onto a lower neighbour. */
  lip?: { fill: string; outline: string; bumpy?: boolean; depth?: number };
  /** Line(s) drawn on this tile right under a higher neighbour's lip. */
  shade?: readonly string[];
  /** Terrains in the same group never draw edges between each other. */
  group?: string;
  /** Overlay drawn in front of characters standing on this tile (tall grass). */
  cover?: TileArt;
  /** Never place Julio on this terrain (e.g. wading water: too hard to spot). */
  noJulio?: boolean;
};

export type Terrain = TerrainDef & {
  _sprites?: Sprite[][]; // [frame][variant]
  _cover?: Sprite;
};

export function defineTerrain(def: TerrainDef): Terrain {
  return { walkable: true, ...def };
}

function spritesFor(t: Terrain): Sprite[][] {
  if (!t._sprites) {
    const frames = t.frames && t.frames.length ? t.frames : [t.variants];
    t._sprites = frames.map((vs) => vs.map((v) => makeSprite(v.rows, t.pal)));
  }
  return t._sprites;
}

export function coverSprite(t: Terrain): Sprite | null {
  if (!t.cover) return null;
  if (!t._cover) t._cover = makeSprite(t.cover.rows, t.pal);
  return t._cover;
}

export function hash2(x: number, y: number, s = 0): number {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function pickVariant(t: Terrain, tx: number, ty: number): number {
  const vs = t.variants;
  if (vs.length === 1) return 0;
  const total = vs.reduce((s, v) => s + (v.weight ?? 1), 0);
  let r = (hash2(tx, ty, 7) % 10000) / 10000 * total;
  for (let i = 0; i < vs.length; i++) {
    r -= vs[i].weight ?? 1;
    if (r < 0) return i;
  }
  return vs.length - 1;
}

export type TerrainGrid = {
  cols: number;
  rows: number;
  cells: Terrain[]; // row-major
  variant: number[];
};

export function makeGrid(cols: number, rows: number, cells: Terrain[]): TerrainGrid {
  const variant = cells.map((t, i) => pickVariant(t, i % cols, Math.floor(i / cols)));
  return { cols, rows, cells, variant };
}

export function terrainAt(g: TerrainGrid, tx: number, ty: number): Terrain | null {
  if (tx < 0 || ty < 0 || tx >= g.cols || ty >= g.rows) return null;
  return g.cells[ty * g.cols + tx];
}

function sameGroup(a: Terrain, b: Terrain) {
  return a === b || (a.group != null && a.group === b.group);
}

// Bump profile for organic lips (grass blades hanging over a path).
const BUMPS = [1, 2, 2, 1, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 3, 2];

function lipDepth(lip: NonNullable<TerrainDef["lip"]>, i: number, seed: number) {
  if (!lip.bumpy) return lip.depth ?? 1;
  return BUMPS[(i + seed) & 15] + ((lip.depth ?? 1) - 1);
}

/** Draw one tile including its edges (lips of higher neighbours). */
export function drawTile(ctx: CanvasRenderingContext2D, g: TerrainGrid, tx: number, ty: number, frame = 0) {
  const t = g.cells[ty * g.cols + tx];
  const sp = spritesFor(t);
  const fr = sp[((frame % sp.length) + sp.length) % sp.length];
  const px = tx * TILE, py = ty * TILE;
  ctx.drawImage(fr[g.variant[ty * g.cols + tx]].image, px, py);

  const N = terrainAt(g, tx, ty - 1);
  const S = terrainAt(g, tx, ty + 1);
  const W = terrainAt(g, tx - 1, ty);
  const E = terrainAt(g, tx + 1, ty);
  const higher = (n: Terrain | null): n is Terrain =>
    !!n && !sameGroup(n, t) && n.level > t.level && !!n.lip;

  const fill = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(px + x, py + y, w, h);
  };
  const shade = t.shade ?? [];

  // North neighbour overhangs downwards (a ledge: lip + outline + shadow).
  if (higher(N)) {
    const lip = N.lip!;
    for (let i = 0; i < TILE; i++) {
      const d = lipDepth(lip, i, hash2(tx, ty) & 15);
      fill(i, 0, 1, d, lip.fill);
      fill(i, d, 1, 1, lip.outline);
      shade.forEach((c, k) => fill(i, d + 1 + k, 1, 1, c));
    }
  }
  // South neighbour pokes up a little (no shadow: light comes from above).
  if (higher(S)) {
    const lip = S.lip!;
    for (let i = 0; i < TILE; i++) {
      const d = Math.max(1, lipDepth(lip, i, hash2(tx, ty, 3) & 15) - 1);
      fill(i, TILE - d, 1, d, lip.fill);
      fill(i, TILE - d - 1, 1, 1, lip.outline);
    }
  }
  if (higher(W)) {
    const lip = W.lip!;
    for (let i = 0; i < TILE; i++) {
      const d = Math.max(1, lipDepth(lip, i, hash2(tx, ty, 5) & 15) - 1);
      fill(0, i, d, 1, lip.fill);
      fill(d, i, 1, 1, lip.outline);
      if (shade[0]) fill(d + 1, i, 1, 1, shade[0]);
    }
  }
  if (higher(E)) {
    const lip = E.lip!;
    for (let i = 0; i < TILE; i++) {
      const d = Math.max(1, lipDepth(lip, i, hash2(tx, ty, 9) & 15) - 1);
      fill(TILE - d, i, d, 1, lip.fill);
      fill(TILE - d - 1, i, 1, 1, lip.outline);
    }
  }

  // Inner corners: only the diagonal neighbour is higher.
  const corner = (dx: number, dy: number) => {
    const D = terrainAt(g, tx + dx, ty + dy);
    const A = terrainAt(g, tx + dx, ty);
    const B = terrainAt(g, tx, ty + dy);
    if (!higher(D) || higher(A) || higher(B)) return;
    const lip = D.lip!;
    const cx = dx < 0 ? 0 : TILE - 3;
    const cy = dy < 0 ? 0 : TILE - 3;
    // small rounded nub, 3×3 minus the inner pixel
    const shape = dy < 0
      ? (dx < 0 ? ["ffo", "fo.", "o.."] : ["off", ".of", "..o"])
      : (dx < 0 ? ["o..", "fo.", "ffo"] : ["..o", ".of", "off"]);
    shape.forEach((row, yy) => {
      for (let xx = 0; xx < 3; xx++) {
        const ch = row[xx];
        if (ch === "f") fill(cx + xx, cy + yy, 1, 1, lip.fill);
        else if (ch === "o") fill(cx + xx, cy + yy, 1, 1, lip.outline);
      }
    });
  };
  corner(-1, -1); corner(1, -1); corner(-1, 1); corner(1, 1);

  // Rounded concave corners: two orthogonal neighbours are higher → fill the
  // corner with a small stair so ponds and plazas don't look boxy.
  const round = (dx: number, dy: number, A: Terrain | null, B: Terrain | null) => {
    if (!higher(A) || !higher(B)) return;
    const lip = A.lip!;
    const stair = [7, 5, 4, 3, 2, 2, 1];
    stair.forEach((len, yy) => {
      for (let xx = 0; xx <= len; xx++) {
        const x = dx < 0 ? xx : TILE - 1 - xx;
        const y = dy < 0 ? yy : TILE - 1 - yy;
        fill(x, y, 1, 1, xx < len ? lip.fill : lip.outline);
      }
      // outline under the stair step
      const nxt = stair[yy + 1] ?? 0;
      for (let xx = nxt; xx < len; xx++) {
        const x = dx < 0 ? xx : TILE - 1 - xx;
        const y = dy < 0 ? yy + 1 : TILE - 2 - yy;
        fill(x, y, 1, 1, lip.outline);
      }
    });
  };
  round(-1, -1, N, W); round(1, -1, N, E); round(-1, 1, S, W); round(1, 1, S, E);
}

export function isAnimated(t: Terrain) {
  return !!t.frames && t.frames.length > 1;
}

/** Paint the whole static ground (frame 0) into ctx. */
export function drawGround(ctx: CanvasRenderingContext2D, g: TerrainGrid) {
  for (let ty = 0; ty < g.rows; ty++) for (let tx = 0; tx < g.cols; tx++) drawTile(ctx, g, tx, ty, 0);
}

/** Redraw only animated tiles for the current time. */
export function drawAnimatedTiles(ctx: CanvasRenderingContext2D, g: TerrainGrid, time: number, list: number[]) {
  for (const i of list) {
    const t = g.cells[i];
    const frame = Math.floor(time * (t.fps ?? 2));
    drawTile(ctx, g, i % g.cols, Math.floor(i / g.cols), frame);
  }
}
