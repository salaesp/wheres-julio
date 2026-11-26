// Helpers to *generate* ASCII pixel rows procedurally (round foliage, rocks,
// clouds…) so props stay consistent without hand-typing every pixel. The output
// is plain rows of palette letters, fed to defineProp like hand-made art.

export type CharGrid = string[][];

export function blank(w: number, h: number): CharGrid {
  return Array.from({ length: h }, () => Array<string>(w).fill("."));
}

export function rowsOf(g: CharGrid): string[] {
  return g.map((r) => r.join(""));
}

export function rect(g: CharGrid, x: number, y: number, w: number, h: number, ch: string) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
    if (g[yy] && xx >= 0 && xx < g[yy].length) g[yy][xx] = ch;
  }
}

export function put(g: CharGrid, x: number, y: number, ch: string) {
  if (g[y] && x >= 0 && x < g[y].length) g[y][x] = ch;
}

/** Overlay hand-drawn rows at (x, y); '.' is transparent. */
export function stamp(g: CharGrid, x: number, y: number, rows: readonly string[]) {
  rows.forEach((r, yy) => {
    for (let xx = 0; xx < r.length; xx++) if (r[xx] !== "." && r[xx] !== " ") put(g, x + xx, y + yy, r[xx]);
  });
}

export type Blob = { x: number; y: number; rx: number; ry?: number };

/**
 * Paint overlapping ellipses ("blobs") shaded as lit from the top-left.
 * `ramp` is [highlight, light, mid, dark] palette letters. Later blobs are in
 * front; the lower/right edge of a front blob gets a dark crease where it
 * overlaps a blob behind it — the classic GBA leafy-cluster look.
 */
export function blobs(g: CharGrid, list: readonly Blob[], ramp = "abcd", opts: { crease?: boolean; hi?: number } = {}) {
  const h = g.length, w = g[0].length;
  const owner: number[][] = Array.from({ length: h }, () => Array(w).fill(-1));
  const shade: string[][] = Array.from({ length: h }, () => Array(w).fill(""));
  const hi = opts.hi ?? 0.5;
  list.forEach((b, i) => {
    const ry = b.ry ?? b.rx;
    for (let y = Math.floor(b.y - ry - 1); y <= Math.ceil(b.y + ry + 1); y++) {
      for (let x = Math.floor(b.x - b.rx - 1); x <= Math.ceil(b.x + b.rx + 1); x++) {
        if (y < 0 || y >= h || x < 0 || x >= w) continue;
        const nx = (x + 0.5 - b.x) / b.rx, ny = (y + 0.5 - b.y) / ry;
        const r2 = nx * nx + ny * ny;
        if (r2 > 1) continue;
        owner[y][x] = i;
        const lit = -(nx * 0.55 + ny * 0.85);
        let s: string;
        if (lit > hi && r2 < 0.75) s = ramp[0];
        else if (lit > -0.25) s = ramp[1];
        else if (lit > -0.7) s = ramp[2];
        else s = ramp[3];
        shade[y][x] = s;
      }
    }
  });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = owner[y][x];
    if (o < 0) continue;
    let s = shade[y][x];
    if (opts.crease !== false) {
      const below = y + 1 < h ? owner[y + 1][x] : -1;
      const right = x + 1 < w ? owner[y][x + 1] : -1;
      if ((below >= 0 && below < o) || (right >= 0 && right < o && y > 0 && owner[y - 1][x] === o)) s = ramp[3];
    }
    g[y][x] = s;
  }
}

/** Mirror the left half onto the right half (for symmetric hand-drawn art). */
export function mirrorRows(rows: readonly string[]): string[] {
  return rows.map((r) => r + r.split("").reverse().join(""));
}
