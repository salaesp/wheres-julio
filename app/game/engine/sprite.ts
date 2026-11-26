// ASCII pixel-art → cached canvas sprites.
//
// A sprite is written as rows of characters; each character maps to a color
// through a palette ('.' and ' ' are always transparent). Sprites are rasterized
// lazily (the first time they are drawn, so this works with SSR) into a small
// offscreen canvas and then blitted with drawImage — cheap enough to draw
// hundreds per frame.
//
// `outline: true` adds a Pokémon-style selective outline: every transparent
// pixel touching a filled one gets a very dark shade of that fill color.
import { outlineOf } from "./color";

export type Pal = Record<string, string | null | undefined>;
export type Grid = (string | null)[][];

export type SpriteOpts = {
  /** Auto-outline (default false). */
  outline?: boolean;
  /** Force a single outline color instead of a derived one. */
  outlineColor?: string;
  /** Mirror horizontally. */
  flip?: boolean;
};

export class Sprite {
  readonly w: number;
  readonly h: number;
  private grid: Grid;
  private canvas: HTMLCanvasElement | null = null;

  constructor(grid: Grid) {
    this.grid = grid;
    this.h = grid.length;
    this.w = grid.reduce((m, r) => Math.max(m, r.length), 0);
  }

  get pixels(): Grid {
    return this.grid;
  }

  get image(): HTMLCanvasElement {
    if (!this.canvas) this.canvas = rasterize(this.grid, this.w, this.h);
    return this.canvas;
  }
}

function rasterize(grid: Grid, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(c.width, c.height);
  for (let y = 0; y < h; y++) {
    const row = grid[y];
    for (let x = 0; x < w; x++) {
      const col = row[x];
      if (!col) continue;
      const n = parseInt(col.slice(1), 16);
      const i = (y * c.width + x) * 4;
      img.data[i] = (n >> 16) & 255;
      img.data[i + 1] = (n >> 8) & 255;
      img.data[i + 2] = n & 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Turn ASCII rows + palette into a color grid. */
export function toGrid(rows: readonly string[], pal: Pal): Grid {
  return rows.map((r) => {
    const out: (string | null)[] = [];
    for (const ch of r) out.push(ch === "." || ch === " " ? null : pal[ch] ?? null);
    return out;
  });
}

/** Overlay grids (later wins where non-null). Grids may differ in size. */
export function stack(...grids: Grid[]): Grid {
  const h = Math.max(...grids.map((g) => g.length));
  const w = Math.max(...grids.map((g) => g.reduce((m, r) => Math.max(m, r.length), 0)));
  const out: Grid = Array.from({ length: h }, () => Array<string | null>(w).fill(null));
  for (const g of grids) {
    for (let y = 0; y < g.length; y++) {
      for (let x = 0; x < g[y].length; x++) {
        const c = g[y][x];
        if (c) out[y][x] = c;
      }
    }
  }
  return out;
}

export function flipGrid(g: Grid): Grid {
  const w = g.reduce((m, r) => Math.max(m, r.length), 0);
  return g.map((r) => {
    const padded = [...r, ...Array(w - r.length).fill(null)];
    return padded.reverse();
  });
}

/** Add a 1px selective outline around the filled shape (in place size: the
 *  grid must already have a transparent margin where the outline should go). */
export function outlineGrid(g: Grid, forced?: string): Grid {
  const h = g.length;
  const w = g.reduce((m, r) => Math.max(m, r.length), 0);
  const at = (x: number, y: number) => (y >= 0 && y < h && x >= 0 && x < w ? g[y][x] ?? null : null);
  const out: Grid = g.map((r) => [...r, ...Array(w - r.length).fill(null)]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (at(x, y)) continue;
      // Prefer the pixel above (so feet/bottoms get the darkest outline from
      // the body color right above), then sides, then below.
      const n = at(x, y - 1) ?? at(x - 1, y) ?? at(x + 1, y) ?? at(x, y + 1);
      if (n) out[y][x] = forced ?? outlineOf(n);
    }
  }
  return out;
}

/** Grow a grid by `m` transparent pixels on every side. */
export function padGrid(g: Grid, m = 1): Grid {
  const w = g.reduce((mm, r) => Math.max(mm, r.length), 0);
  const empty = () => Array<string | null>(w + m * 2).fill(null);
  const rows = g.map((r) => [...Array(m).fill(null), ...r, ...Array(w - r.length + m).fill(null)]);
  return [...Array.from({ length: m }, empty), ...rows, ...Array.from({ length: m }, empty)];
}

export function makeSprite(rows: readonly string[], pal: Pal, opts: SpriteOpts = {}): Sprite {
  let g = toGrid(rows, pal);
  if (opts.outline) g = outlineGrid(padGrid(g, 1), opts.outlineColor);
  if (opts.flip) g = flipGrid(g);
  return new Sprite(g);
}

export function gridSprite(g: Grid, opts: SpriteOpts = {}): Sprite {
  if (opts.outline) g = outlineGrid(padGrid(g, 1), opts.outlineColor);
  if (opts.flip) g = flipGrid(g);
  return new Sprite(g);
}

/** Lazy factory so modules can declare sprites at top level without paying
 *  the cost until first use. */
export function lazy<T>(fn: () => T): () => T {
  let v: T | undefined;
  let done = false;
  return () => {
    if (!done) { v = fn(); done = true; }
    return v as T;
  };
}

export function blit(ctx: CanvasRenderingContext2D, s: Sprite, x: number, y: number): void {
  ctx.drawImage(s.image, Math.round(x), Math.round(y));
}
