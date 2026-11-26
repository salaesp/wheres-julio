// Props: static or animated multi-pixel objects placed on the map (trees,
// benches, fountains…). Non-flat props are depth-sorted together with the
// characters by their base line, so people walk behind/in front of them
// naturally — the way overworld maps work in the GBA Pokémon games.
import { Sprite, makeSprite, type Pal } from "./sprite";

export type Rect = { x: number; y: number; w: number; h: number };

export type PropSpec = {
  /** Pixel rows (or several frames of rows for animation). */
  rows?: readonly string[];
  frames?: readonly (readonly string[])[];
  pal: Pal;
  fps?: number;
  /** Auto selective outline (default true). */
  outline?: boolean;
  /** Blocking rectangle in sprite pixels (relative to the sprite top-left,
   *  outline included). Default: the bottom 10px of the sprite. `null` = none. */
  solid?: Rect | null;
  /** Drawn as part of the ground (rugs, towels, hopscotch) — never in front of
   *  characters. Flat props don't block unless `solid` is given. */
  flat?: boolean;
  /** Depth line relative to the sprite top (default: bottom of the sprite). */
  baseY?: number;
};

export type PropDef = PropSpec & {
  readonly key: number;
  sprites(): Sprite[];
  w(): number;
  h(): number;
};

let nextKey = 1;

export function defineProp(spec: PropSpec): PropDef {
  let cache: Sprite[] | null = null;
  const build = () => {
    if (!cache) {
      const frames = spec.frames ?? (spec.rows ? [spec.rows] : []);
      cache = frames.map((rows) => makeSprite(rows, spec.pal, { outline: spec.outline !== false }));
    }
    return cache;
  };
  // Width/height without rasterizing (so placement can run on the server).
  const rows0 = spec.frames?.[0] ?? spec.rows ?? [];
  const pad = spec.outline !== false ? 2 : 0;
  const W = rows0.reduce((m, r) => Math.max(m, r.length), 0) + pad;
  const H = rows0.length + pad;
  return {
    ...spec,
    key: nextKey++,
    sprites: build,
    w: () => W,
    h: () => H,
  };
}

export type PropInstance = {
  def: PropDef;
  /** Top-left in world pixels. */
  x: number;
  y: number;
  /** Per-instance animation phase. */
  phase: number;
};

export function propSolid(p: PropInstance): Rect | null {
  const d = p.def;
  if (d.solid === null) return null;
  if (d.flat && !d.solid) return null;
  const s = d.solid ?? { x: 0, y: Math.max(0, d.h() - 10), w: d.w(), h: Math.min(10, d.h()) };
  return { x: p.x + s.x, y: p.y + s.y, w: s.w, h: s.h };
}

export function propBase(p: PropInstance): number {
  return p.y + (p.def.baseY ?? p.def.h());
}

export function drawProp(ctx: CanvasRenderingContext2D, p: PropInstance, time: number) {
  const sp = p.def.sprites();
  if (!sp.length) return;
  const n = sp.length;
  const f = n > 1 ? ((Math.floor(time * (p.def.fps ?? 3) + p.phase) % n) + n) % n : 0;
  ctx.drawImage(sp[f].image, Math.round(p.x), Math.round(p.y));
}
