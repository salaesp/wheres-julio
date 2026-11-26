// Small procedural pixel helpers shared by the town / school / desk props:
// a 3×5 pixel font, Bresenham lines, filled ellipses and "rods" (rotated bars
// like pencils) rasterized pixel by pixel. Everything outputs palette letters
// into a CharGrid, so the result is plain pixel art fed to defineProp.
import { put, type CharGrid } from "../shapes";

/** Tiny deterministic RNG (xorshift) for tile/prop details. */
export function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/** Build w×h rows from a per-pixel function. */
export function gen(w: number, h: number, fn: (x: number, y: number) => string): string[] {
  const out: string[] = [];
  for (let y = 0; y < h; y++) {
    let r = "";
    for (let x = 0; x < w; x++) r += fn(x, y);
    out.push(r);
  }
  return out;
}

/** Re-map every pixel of some rows. */
export function remap(rows: readonly string[], fn: (x: number, y: number, ch: string) => string): string[] {
  return rows.map((r, y) => r.split("").map((ch, x) => fn(x, y, ch)).join(""));
}

export function get(g: CharGrid, x: number, y: number): string {
  return g[y]?.[x] ?? ".";
}

// ── 3×5 font ────────────────────────────────────────────────────────────────
const FONT: Record<string, string> = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
  Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111",
  "0": "111101101101111", "1": "010110010010111", "2": "110001010100111", "3": "110001010001110",
  "4": "101101111001001", "5": "111100110001110", "6": "011100111101111", "7": "111001010010010",
  "8": "111101111101111", "9": "111101111001110",
  "+": "000010111010000", "=": "000111000111000", "-": "000000111000000", "!": "010010010000010",
  "?": "110001010000010", ".": "000000000000010", "x": "000101010101000", "/": "001001010100100",
  "♥": "000101111111010", ":": "000010000010000", " ": "000000000000000",
};

/** Draw text with the 3×5 font (1px spacing, optional integer scale).
 *  `shadow` adds a 1px drop shadow (down-right) in another letter. */
export function text(g: CharGrid, x: number, y: number, s: string, ch: string, scale = 1, shadow?: string): number {
  const draw = (ox: number, oy: number, c0: string) => {
    let cx = x + ox;
    for (const c of s) {
      const f = FONT[c] ?? FONT[c.toUpperCase()] ?? FONT[" "];
      for (let i = 0; i < 15; i++) {
        if (f[i] !== "1") continue;
        const px = cx + (i % 3) * scale, py = y + oy + Math.floor(i / 3) * scale;
        for (let yy = 0; yy < scale; yy++) for (let xx = 0; xx < scale; xx++) put(g, px + xx, py + yy, c0);
      }
      cx += 4 * scale;
    }
  };
  if (shadow) draw(1, 1, shadow);
  draw(0, 0, ch);
  return textWidth(s, scale);
}

export function textWidth(s: string, scale = 1): number {
  return s.length * 4 * scale - scale;
}

// ── Lines and shapes ────────────────────────────────────────────────────────
export function line(g: CharGrid, x0: number, y0: number, x1: number, y1: number, ch: string) {
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
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

/** Is pixel (x, y) inside the ellipse? (pixel-center test) */
export function inEllipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
  return nx * nx + ny * ny <= 1;
}

export function ellipse(g: CharGrid, cx: number, cy: number, rx: number, ry: number, ch: string | ((x: number, y: number) => string)) {
  for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
    for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      if (inEllipse(x, y, cx, cy, rx, ry)) put(g, x, y, typeof ch === "string" ? ch : ch(x, y));
    }
  }
}

/**
 * Rasterize a rotated bar from A to B. For each pixel inside the bounding box,
 * `paint(t, s, len)` gets t = distance along the axis (0..len) and s = signed
 * distance across it (negative = the side facing up-left, i.e. the lit side),
 * and returns a palette letter or null (transparent).
 */
export function rod(
  g: CharGrid, ax: number, ay: number, bx: number, by: number, half: number,
  paint: (t: number, s: number, len: number) => string | null,
) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  // normal pointing "up" (towards the light): (uy, -ux) or the opposite
  let nx = uy, ny = -ux;
  if (ny > 0 || (ny === 0 && nx > 0)) { nx = -nx; ny = -ny; }
  const x0 = Math.floor(Math.min(ax, bx) - half - 1), x1 = Math.ceil(Math.max(ax, bx) + half + 1);
  const y0 = Math.floor(Math.min(ay, by) - half - 1), y1 = Math.ceil(Math.max(ay, by) + half + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const px = x + 0.5 - ax, py = y + 0.5 - ay;
    const t = px * ux + py * uy;
    const s = -(px * nx + py * ny); // negative towards the light
    if (t < 0 || t > len || Math.abs(s) > half) continue;
    const c = paint(t, s, len);
    if (c) put(g, x, y, c);
  }
}

/** Manual selective outline: every transparent pixel touching (4-neighbour)
 *  a pixel accepted by `isFill` becomes `oc`. Use with `outline: false` props
 *  when some parts (strings, thin lines) must stay un-outlined. */
export function outlineWith(g: CharGrid, isFill: (ch: string) => boolean, oc: string) {
  const h = g.length, w = g[0].length;
  const marks: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x] !== ".") continue;
    const n = [get(g, x, y - 1), get(g, x - 1, y), get(g, x + 1, y), get(g, x, y + 1)];
    if (n.some((c) => c !== "." && isFill(c))) marks.push([x, y]);
  }
  for (const [x, y] of marks) g[y][x] = oc;
}

/** Cast a hard drop shadow: every transparent pixel at (x+dx, y+dy) of a
 *  filled pixel becomes `ch`. Call after outlining. */
export function dropShadow(g: CharGrid, dx: number, dy: number, ch: string) {
  const h = g.length, w = g[0].length;
  const marks: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (g[y][x] === "." || g[y][x] === ch) continue;
    const tx = x + dx, ty = y + dy;
    if (ty >= 0 && ty < h && tx >= 0 && tx < w && g[ty][tx] === ".") marks.push([tx, ty]);
  }
  for (const [x, y] of marks) g[y][x] = ch;
}
