// Small pixel-art helpers shared by the farm / polar / jungle prop libraries.
import { blank, put, type CharGrid } from "../shapes";

/** Pad rows to the same width ('.'). */
export function pad(rows: readonly string[]): string[] {
  const w = rows.reduce((m, r) => Math.max(m, r.length), 0);
  return rows.map((r) => r.padEnd(w, "."));
}

/** Mirror rows horizontally (left-facing animal → right-facing). */
export function flipRows(rows: readonly string[]): string[] {
  return pad(rows).map((r) => r.split("").reverse().join(""));
}

/** Solid filled ellipse (pixel-centred test, no anti-aliasing). */
export function ellipse(g: CharGrid, cx: number, cy: number, rx: number, ry: number, ch: string) {
  for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
    for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) put(g, x, y, ch);
    }
  }
}

/** Bresenham line. */
export function line(g: CharGrid, x0: number, y0: number, x1: number, y1: number, ch: string) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    put(g, x0, y0, ch);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

/** Replace every `from` char inside a rect with `to` (for recolouring areas). */
export function recolor(g: CharGrid, x: number, y: number, w: number, h: number, from: string, to: string) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
    if (g[yy] && g[yy][xx] === from) g[yy][xx] = to;
  }
}

/** Get a char (or '.' outside). */
export function at(g: CharGrid, x: number, y: number): string {
  return g[y]?.[x] ?? ".";
}

export function grid(w: number, h: number): CharGrid {
  return blank(w, h);
}
