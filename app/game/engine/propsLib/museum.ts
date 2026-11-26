// Natural-history museum props: giant dinosaur skeletons on their plinths
// (T-Rex, brachiosaurus, triceratops, a hanging pterodactyl), exhibition
// ropes, glass display cases (fossils, eggs, amber, minerals), paintings,
// a meteorite, info signs, benches, potted plants, the gift shop with dino
// plushies and a few green "fake dinos" to throw the player off Julio's trail.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, line, rod, text, textWidth, outlineWith, inEllipse } from "./pixkit";

// ── helpers ──────────────────────────────────────────────────────────────────
type P = readonly [number, number];

function inPoly(x: number, y: number, pts: readonly P[]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function poly(g: CharGrid, pts: readonly P[], ch: (x: number, y: number) => string) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (inPoly(x + 0.5, y + 0.5, pts)) put(g, x, y, ch(x, y));
    }
  }
}
/** Only paint over transparent pixels. */
function under(g: CharGrid, x: number, y: number, ch: string) {
  if (g[y] && g[y][x] === ".") g[y][x] = ch;
}

// Bone ramp: a light, b base, c shade, d deep (joints / far side).
function lit(dx: number, dy: number, h: number, dark: boolean) {
  const l = (dx * 0.55 + dy * 0.85) / Math.max(1, h);
  if (dark) return l < -0.3 ? "b" : l < 0.45 ? "c" : "d";
  return l < -0.35 ? "a" : l < 0.4 ? "b" : "c";
}
function disk(g: CharGrid, cx: number, cy: number, r: number, dark = false) {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r * r) put(g, x, y, lit(dx, dy, r, dark));
    }
  }
}
function bone(g: CharGrid, ax: number, ay: number, bx: number, by: number, half: number, dark = false, half2 = half) {
  rod(g, ax, ay, bx, by, Math.max(half, half2), (t, s, len) => {
    const h = half + (half2 - half) * (t / len);
    if (Math.abs(s) > h) return null;
    return lit(0, s * 1.2, h, dark);
  });
}
/** Bone with knobbly ends (limb bones). */
function limb(g: CharGrid, ax: number, ay: number, bx: number, by: number, half: number, dark = false, half2 = half * 0.85) {
  bone(g, ax, ay, bx, by, half, dark, half2);
  disk(g, ax, ay, half + 0.8, dark);
  disk(g, bx, by, half2 + 0.8, dark);
}
/**
 * Vertebral column along a polyline: thick sampled disks, a dark notch every
 * `seg` px and optional dorsal spines (up) or chevrons (down).
 */
function spine(
  g: CharGrid, pts: readonly P[], h0: number, h1: number,
  opts: { spikes?: number; chevrons?: number; seg?: number; dark?: boolean } = {},
) {
  const seg = opts.seg ?? 5;
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  let dist = 0;
  const notches: [number, number, number, number, number][] = [];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const len = Math.hypot(bx - ax, by - ay);
    for (let t = 0; t <= len; t += 0.5) {
      const x = ax + ((bx - ax) * t) / len, y = ay + ((by - ay) * t) / len;
      const d = dist + t;
      const h = h0 + (h1 - h0) * (d / total);
      disk(g, x, y, h, opts.dark);
      const k = Math.floor(d / seg);
      if (d - k * seg < 0.5 && d > 1) notches.push([x, y, h, (bx - ax) / len, (by - ay) / len]);
    }
    dist += len;
  }
  for (const [x, y, h, ux, uy] of notches) {
    // perpendicular joint line
    const nx = -uy, ny = ux;
    for (let s = -h + 0.5; s <= h - 0.5; s += 0.5) put(g, Math.floor(x + nx * s), Math.floor(y + ny * s), "d");
    if (opts.spikes) {
      for (let k = 1; k <= opts.spikes; k++) put(g, Math.floor(x), Math.floor(y - h - k + 0.5), k === opts.spikes ? "a" : "b");
    }
    if (opts.chevrons) {
      for (let k = 1; k <= opts.chevrons; k++) put(g, Math.floor(x - ux * k * 0.6), Math.floor(y + h + k - 0.5), k === opts.chevrons ? "c" : "b");
    }
  }
}
/** Curved rib (1px), from the spine down, bowed. */
function rib(g: CharGrid, x0: number, y0: number, x1: number, y1: number, bow: number, ch = "b") {
  const cx = (x0 + x1) / 2 + bow, cy = (y0 + y1) / 2;
  let px = -1, py = -1;
  for (let t = 0; t <= 1.0001; t += 0.02) {
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const ix = Math.round(x), iy = Math.round(y);
    if (ix !== px || iy !== py) put(g, ix, iy, t < 0.25 ? "a" : t > 0.8 ? "c" : ch);
    px = ix; py = iy;
  }
}
/** Steel armature rod from (x, y0) down to (x, y1) with a base plate. */
function armature(g: CharGrid, x: number, y0: number, y1: number) {
  for (let y = y0; y <= y1; y++) { under(g, x, y, "m"); under(g, x + 1, y, "M"); }
  for (let xx = x - 2; xx <= x + 3; xx++) put(g, xx, y1, xx <= x ? "m" : "M");
}
/** Outline the art, then paint a soft floor shadow on transparent pixels. */
function finish(g: CharGrid, shadow: { cx: number; cy: number; rx: number; ry: number }) {
  outlineWith(g, () => true, "o");
  for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) {
    if (inEllipse(x, y, shadow.cx, shadow.cy, shadow.rx, shadow.ry)) under(g, x, y, "s");
  }
}

const BONE = {
  a: "#fffaec", b: "#f0e0bc", c: "#d4bc90", d: "#a88c64", o: "#5a4228",
  t: "#ffffff", m: "#a0a6be", M: "#62667e", s: "#a8a6c0", h: "#3a2a1c",
};

// ── T-Rex skeleton (facing right, ~7 tiles wide) ─────────────────────────────
function trex(f: number): string[] {
  const W = 114, H = 88;
  const g = blank(W, H);
  const jaw = f === 1 ? 1 : 0; // the jaw bobs a little (museum animatronic)
  // far leg (darker)
  limb(g, 46, 40, 51, 56, 2.6, true, 2.2);
  limb(g, 51, 56, 45, 70, 2, true, 1.6);
  bone(g, 45, 70, 50, 80, 1.6, true, 1.3);
  bone(g, 50, 80, 57, 82, 1, true); bone(g, 50, 80, 53, 83, 0.9, true);
  // tail
  spine(g, [[42, 33], [30, 38], [18, 46], [7, 55], [2, 60]], 3.2, 1, { chevrons: 3, spikes: 2 });
  // ribs (behind the spine)
  for (let x = 54; x <= 74; x += 4) {
    const len = 22 - Math.abs(x - 62) * 0.55;
    rib(g, x, 31, x - 5, 31 + len, -3);
  }
  // gastralia (belly ribs)
  for (let x = 52; x <= 68; x += 4) put(g, x, 52 - Math.floor(Math.abs(x - 60) / 4), "c");
  // pelvis
  blobs(g, [{ x: 45, y: 34, rx: 8, ry: 5 }], "abcd", { crease: false });
  limb(g, 47, 37, 55, 52, 1.6, false, 1.4);
  disk(g, 56, 53, 2.4);
  bone(g, 42, 38, 36, 47, 1.3, false, 0.9);
  // back + neck
  spine(g, [[40, 32], [52, 29], [64, 28], [74, 30], [79, 25], [85, 22]], 3.2, 3, { spikes: 3 });
  // shoulder blade + tiny arm
  bone(g, 73, 31, 68, 42, 1.8, false, 1.2);
  limb(g, 68, 43, 71, 49, 1, false, 0.8);
  bone(g, 71, 49, 75, 48, 0.8);
  put(g, 76, 47, "t"); put(g, 76, 49, "t");
  // near leg
  limb(g, 49, 38, 59, 56, 3.1, false, 2.6);
  limb(g, 59, 56, 53, 71, 2.4, false, 1.8);
  bone(g, 53, 71, 59, 80, 1.8, false, 1.4);
  bone(g, 59, 80, 67, 82, 1.1); bone(g, 59, 80, 63, 84, 1); bone(g, 56, 81, 53, 83, 0.9);
  // skull
  const skull: P[] = [[81, 22], [83, 14], [90, 10], [102, 10], [110, 13], [113, 18], [113, 25], [100, 26], [86, 27]];
  poly(g, skull, (x, y) => (y < 12 ? "a" : y < 14 ? "a" : y < 22 ? (x > 109 ? "c" : "b") : "c"));
  // ridge along the snout
  for (let x = 92; x <= 109; x++) put(g, x, 12 + (x > 105 ? 1 : 0), "a");
  // eye socket, antorbital opening, temporal opening, nostril
  ellipse(g, 89.5, 15.5, 2.6, 3.1, "h");
  put(g, 89, 14, "o"); put(g, 90, 17, "d");
  poly(g, [[94, 16], [104, 15], [101, 22], [95, 22]], () => "h");
  poly(g, [[83, 17], [86, 16], [86, 22], [83, 22]], () => "h");
  for (let x = 95; x <= 101; x++) put(g, x, 23, "d");
  put(g, 109, 16, "h"); put(g, 110, 16, "h"); put(g, 110, 17, "d");
  // cheek line
  for (let x = 87; x <= 112; x++) put(g, x, 25, x % 5 === 0 ? "d" : "c");
  // upper teeth
  for (let x = 88; x <= 111; x += 2) { put(g, x, 26, "t"); if (x % 4 === 0) put(g, x, 27 + jaw, "t"); }
  // lower jaw
  const j0 = 30 + jaw;
  poly(g, [[83, j0 - 1], [98, j0 - 1], [111, j0], [110, j0 + 2], [97, j0 + 4], [86, j0 + 4], [81, j0 + 1]], (_x, y) => (y < j0 + 1 ? "b" : "c"));
  for (let x = 86; x <= 96; x++) put(g, x, j0 + 3, "d");
  for (let x = 89; x <= 108; x += 2) put(g, x, j0 - 1, "t");
  // supports
  armature(g, 63, 54, 85);
  armature(g, 22, 47, 85);
  armature(g, 96, 36, 85);
  finish(g, { cx: 52, cy: 85, rx: 42, ry: 2.6 });
  return rowsOf(g);
}
export const TREX = defineProp({
  frames: [trex(0), trex(0), trex(0), trex(1)],
  fps: 1.5,
  pal: BONE,
  outline: false,
  solid: null,
});

// ── Brachiosaurus skeleton (facing left, very long neck) ─────────────────────
function brachio(f: number): string[] {
  const W = 98, H = 134;
  const g = blank(W, H);
  const nod = f === 1 ? 1 : 0;
  // far legs
  limb(g, 53, 78, 53, 98, 2.8, true, 2.4);
  limb(g, 53, 98, 55, 118, 2.4, true, 2.1);
  blobs(g, [{ x: 55, y: 122, rx: 4.5, ry: 2 }], "bcdd", { crease: false });
  limb(g, 67, 78, 67, 99, 3, true, 2.4);
  limb(g, 67, 99, 65, 118, 2.3, true, 2);
  blobs(g, [{ x: 65, y: 122, rx: 4.5, ry: 2 }], "bcdd", { crease: false });
  // tail
  spine(g, [[74, 70], [82, 78], [89, 90], [93, 104], [95, 114]], 3.2, 1, { chevrons: 2, spikes: 1 });
  // ribs
  for (let x = 50; x <= 70; x += 4) {
    const len = 28 - Math.abs(x - 59) * 0.5;
    rib(g, x, 67, x + 4, 67 + len, 3);
  }
  // pelvis + shoulder blade
  blobs(g, [{ x: 72, y: 72, rx: 7, ry: 5 }], "abcd", { crease: false });
  bone(g, 48, 66, 50, 82, 2.2, false, 1.6);
  // back
  spine(g, [[46, 66], [58, 66], [74, 70]], 3.4, 3.2, { spikes: 3 });
  // neck
  const top: P = [27, 13 + nod];
  spine(g, [[47, 66], [39, 50], [33, 34], [29, 22], top], 3.6, 2.4, { spikes: 2, seg: 6 });
  // skull (facing left) with the tall nasal crest
  blobs(g, [{ x: 21, y: 11 + nod, rx: 7.5, ry: 4 }, { x: 24, y: 6.5 + nod, rx: 4, ry: 3.2 }], "abcd", { crease: false });
  put(g, 22, 9 + nod, "."); put(g, 23, 9 + nod, "."); put(g, 22, 10 + nod, "h");
  put(g, 25, 5 + nod, "."); put(g, 25, 6 + nod, ".");
  for (let x = 14; x <= 24; x++) put(g, x, 14 + nod, x % 2 ? "c" : "t");
  for (let x = 14; x <= 23; x++) put(g, x, 15 + nod, "c");
  // near legs (front legs are longer)
  limb(g, 46, 78, 44, 100, 3.3, false, 2.8);
  limb(g, 44, 100, 46, 119, 2.7, false, 2.3);
  blobs(g, [{ x: 46, y: 123, rx: 5.5, ry: 2.4 }], "abcd", { crease: false });
  limb(g, 74, 77, 77, 99, 3.6, false, 2.8);
  limb(g, 77, 99, 75, 119, 2.7, false, 2.3);
  blobs(g, [{ x: 76, y: 123, rx: 5.5, ry: 2.4 }], "abcd", { crease: false });
  // supports
  armature(g, 35, 40, 128);
  armature(g, 60, 94, 128);
  finish(g, { cx: 60, cy: 128, rx: 34, ry: 3 });
  return rowsOf(g);
}
export const BRACHIO = defineProp({
  frames: [brachio(0), brachio(0), brachio(1), brachio(1)],
  fps: 1,
  pal: BONE,
  outline: false,
  solid: null,
});

// ── Triceratops skeleton (facing left) ───────────────────────────────────────
function trike(): string[] {
  const W = 90, H = 58;
  const g = blank(W, H);
  // far legs
  limb(g, 42, 30, 43, 40, 2.4, true, 2); limb(g, 43, 40, 42, 49, 2, true, 1.8);
  limb(g, 58, 29, 61, 40, 2.6, true, 2.2); limb(g, 61, 40, 58, 49, 2, true, 1.8);
  // tail
  spine(g, [[70, 26], [79, 31], [86, 38], [88, 42]], 3, 1, { chevrons: 2, spikes: 1 });
  // ribs
  for (let x = 38; x <= 62; x += 4) {
    const len = 18 - Math.abs(x - 50) * 0.35;
    rib(g, x, 23, x + 3, 23 + len, 2);
  }
  blobs(g, [{ x: 66, y: 25, rx: 6.5, ry: 4.5 }], "abcd", { crease: false });
  spine(g, [[32, 25], [44, 21], [58, 21], [70, 26]], 3.2, 3, { spikes: 2 });
  // frill with scalloped edge and two holes
  blobs(g, [{ x: 25, y: 18, rx: 11.5, ry: 14 }], "abcd", { crease: false, hi: 0.3 });
  for (let a = -2.6; a <= 1.4; a += 0.42) {
    const x = 25 + Math.cos(a) * 12.2, y = 18 + Math.sin(a) * 14.6;
    disk(g, x, y, 1.4);
  }
  for (const [hx, hy] of [[24, 11], [29, 19]] as const) {
    for (let y = hy - 2; y <= hy + 2; y++) for (let x = hx - 2; x <= hx + 2; x++) {
      if (inEllipse(x, y, hx + 0.5, hy + 0.5, 2.6, 2.2)) put(g, x, y, inEllipse(x, y, hx + 0.5, hy + 0.5, 1.8, 1.4) ? "h" : "d");
    }
  }
  // brow horns (far one first)
  bone(g, 19, 18, 8, 5, 2, true, 0.6);
  // face
  const face: P[] = [[13, 16], [19, 22], [19, 33], [11, 38], [4, 37], [1, 32], [5, 26]];
  poly(g, face, (x, y) => (x + y < 34 ? "a" : x + y < 46 ? "b" : "c"));
  bone(g, 16, 20, 3, 7, 2.2, false, 0.6);
  bone(g, 7, 27, 5, 20, 1.6, false, 0.5);
  put(g, 13, 24, "h"); put(g, 14, 24, "d"); put(g, 13, 25, "h");
  for (let x = 4; x <= 16; x++) put(g, x, 35, x % 3 === 0 ? "t" : "d");
  put(g, 1, 33, "c"); put(g, 0, 34, "c");
  // near legs
  limb(g, 36, 30, 34, 40, 2.7, false, 2.3); limb(g, 34, 40, 37, 49, 2.2, false, 2);
  bone(g, 37, 50, 32, 51, 1.2);
  limb(g, 64, 29, 68, 40, 3, false, 2.4); limb(g, 68, 40, 64, 49, 2.3, false, 2);
  bone(g, 64, 50, 59, 51, 1.2);
  armature(g, 51, 38, 53);
  finish(g, { cx: 46, cy: 53, rx: 36, ry: 2.6 });
  return rowsOf(g);
}
export const TRIKE = defineProp({ rows: trike(), pal: BONE, outline: false, solid: null });

// ── Hanging pterodactyl (cast replica on wires) + its floor shadow ───────────
function ptero(f: number): string[] {
  const W = 76, H = 40;
  const g = blank(W, H);
  const lift = f === 1 ? -1 : 0;
  // membranes
  const wingL: P[] = [[33, 22], [20, 16 + lift], [8, 18 + lift], [1, 25 + lift], [14, 26], [30, 30]];
  const wingR: P[] = [[43, 22], [56, 16 + lift], [68, 18 + lift], [75, 25 + lift], [62, 26], [46, 30]];
  for (const w of [wingL, wingR]) poly(g, w, (x, y) => (y < 20 + lift ? "q" : (x + y) % 9 === 0 ? "r" : y > 26 ? "r" : "p"));
  // wing bones (leading edge)
  bone(g, 34, 22, 20, 16 + lift, 1.2); bone(g, 20, 16 + lift, 8, 18 + lift, 0.9); bone(g, 8, 18 + lift, 1, 25 + lift, 0.6);
  bone(g, 42, 22, 56, 16 + lift, 1.2); bone(g, 56, 16 + lift, 68, 18 + lift, 0.9); bone(g, 68, 18 + lift, 75, 25 + lift, 0.6);
  // body
  blobs(g, [{ x: 38, y: 24, rx: 4.5, ry: 6 }], "qpru", { crease: false });
  // legs
  bone(g, 36, 29, 34, 34, 0.7); bone(g, 40, 29, 42, 34, 0.7);
  // head: long beak to the left, crest to the right
  blobs(g, [{ x: 38, y: 16, rx: 3.5, ry: 3 }], "qpru", { crease: false });
  poly(g, [[36, 14], [26, 17], [36, 18]], (_x, y) => (y < 16 ? "y" : "Y"));
  poly(g, [[40, 13], [48, 9], [41, 16]], (_x, y) => (y < 12 ? "q" : "r"));
  put(g, 37, 15, "h");
  outlineWith(g, () => true, "O");
  // wires up to the ceiling
  for (let y = 0; y < 15 + lift; y++) { under(g, 20, y, "k"); under(g, 56, y, "k"); }
  return rowsOf(g);
}
export const PTERO = defineProp({
  frames: [ptero(0), ptero(1)],
  fps: 1.2,
  pal: {
    p: "#f0a868", q: "#f8c890", r: "#d07c48", u: "#a85830", y: "#f8e0a0", Y: "#d8b060",
    a: "#fffaec", b: "#f0e0bc", c: "#d4bc90", d: "#a88c64", h: "#302020", O: "#683820", k: "#4c4c60",
  },
  outline: false,
  solid: null,
});
export const PTERO_SHADOW = defineProp({
  rows: (() => {
    const g = blank(60, 12);
    poly(g, [[28, 5], [16, 2], [6, 3], [0, 8], [12, 8], [26, 11], [34, 11], [48, 8], [60, 8], [54, 3], [44, 2], [32, 5]], () => "s");
    return rowsOf(g);
  })(),
  pal: { s: "#d8c8aa" },
  outline: false,
  flat: true,
});

// ── Exhibition rope: brass stanchions with a sagging red velvet rope ─────────
function ropeRows(len: number): string[] {
  const W = len + 6, H = 16;
  const g = blank(W, H);
  const posts = [0];
  const n = Math.max(1, Math.round(len / 24));
  for (let i = 1; i <= n; i++) posts.push(Math.round((len * i) / n));
  for (let i = 0; i < posts.length - 1; i++) {
    const x0 = posts[i] + 3, x1 = posts[i + 1] + 3;
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / (x1 - x0);
      const sag = Math.round(4 * 4 * t * (1 - t) * 0.9);
      put(g, x, 3 + sag, "r"); put(g, x, 4 + sag, "R");
    }
  }
  for (const p of posts) {
    // knob, pole, weighted base
    rect(g, p + 1, 0, 3, 2, "y"); put(g, p + 1, 0, "w"); put(g, p + 3, 1, "Y");
    for (let y = 2; y < 13; y++) { put(g, p + 2, y, "y"); put(g, p + 3, y, "Y"); }
    rect(g, p, 13, 6, 2, "y"); put(g, p, 13, "w"); rect(g, p + 3, 13, 3, 2, "Y"); rect(g, p, 15, 6, 1, "Z");
  }
  return rowsOf(g);
}
const ROPE_PAL = { r: "#e83848", R: "#a01830", y: "#f8d050", Y: "#c08820", w: "#fff4c0", Z: "#8c6018" };
function rope(len: number) {
  const rows = ropeRows(len);
  return defineProp({ rows, pal: ROPE_PAL, solid: { x: 0, y: 12, w: rows[0].length + 2, h: 6 } });
}
export const ROPE_48 = rope(48);
export const ROPE_72 = rope(72);
export const ROPE_96 = rope(96);
export const STANCHION = defineProp({
  rows: ropeRows(0).map((r) => r.slice(0, 6)),
  pal: ROPE_PAL,
  solid: { x: 0, y: 12, w: 8, h: 6 },
});

// ── Brass plaques for the plinth faces ───────────────────────────────────────
function plaque(label: string) {
  const w = textWidth(label) + 6;
  const g = blank(w, 9);
  rect(g, 0, 0, w, 9, "b");
  rect(g, 0, 0, w, 1, "a"); rect(g, 0, 0, 1, 9, "a");
  rect(g, 0, 8, w, 1, "c"); rect(g, w - 1, 0, 1, 9, "c");
  text(g, 3, 2, label, "k");
  put(g, 1, 1, "w"); put(g, w - 2, 7, "k");
  return defineProp({ rows: rowsOf(g), pal: { a: "#fce890", b: "#e8c050", c: "#a87c20", k: "#5c3c10", w: "#ffffff" }, solid: null });
}
export const PLAQUE_TREX = plaque("T-REX");
export const PLAQUE_BRACHIO = plaque("BRAQUIO");
export const PLAQUE_TRIKE = plaque("TRICERA");

// ── Glass display cases ──────────────────────────────────────────────────────
// 3/4 view: glass lid (contents on velvet), a thin front glass, wood cabinet.
const CASE_PAL = {
  // brass frame
  y: "#f8d860", Y: "#c89830", Z: "#8c6420",
  // velvet (blue) seen through glass
  v: "#5068b0", V: "#3c5090", x: "#7890d0",
  // glass glints
  w: "#ffffff", g: "#c8e8f8",
  // wood cabinet
  t: "#b87040", u: "#945430", U: "#d08c50", k: "#5c3018",
  // contents
  a: "#fffaec", b: "#f0e0bc", c: "#d4bc90", d: "#a88c64",
  e: "#f8a830", E: "#c86c10", f: "#ffd860",
  m: "#c890f0", M: "#9058c8", n: "#e8c8ff", N: "#603890",
  q: "#88e0e8", Q: "#40a0b8", r: "#f07060", R: "#b03838",
  s: "#a8a0a0", S: "#787070", h: "#302028",
  p: "#f8e8c8", P: "#e0c098", j: "#c8a878",
};
function caseFrame(f: number, w: number, contents: (g: CharGrid) => void): string[] {
  const H = 30;
  const g = blank(w, H);
  // glass lid with velvet inside
  rect(g, 0, 0, w, 15, "Y"); rect(g, 0, 0, w, 1, "y"); rect(g, 0, 0, 1, 15, "y");
  rect(g, 1, 1, w - 2, 13, "v"); rect(g, 1, 1, w - 2, 1, "V"); rect(g, 1, 1, 1, 13, "V");
  contents(g);
  // glint: a diagonal sparkle sweeping across the lid
  const gx = [3, Math.floor(w / 2) - 2, w - 9][f % 3];
  for (let i = 0; i < 5; i++) { put(g, gx + i, 6 - i, "w"); put(g, gx + i + 2, 6 - i, "g"); }
  put(g, gx + 6, 12, "g"); put(g, gx + 7, 11, "g");
  // front glass
  rect(g, 0, 15, w, 6, "Z"); rect(g, 1, 15, w - 2, 5, "V");
  rect(g, 1, 15, w - 2, 1, "x");
  put(g, gx + 2, 17, "g"); put(g, gx + 3, 16, "g");
  rect(g, 0, 20, w, 1, "y");
  // cabinet
  rect(g, 0, 21, w, 8, "t"); rect(g, 0, 21, w, 1, "U"); rect(g, 0, 21, 1, 8, "U");
  rect(g, 3, 23, w - 6, 4, "u"); rect(g, 3, 23, w - 6, 1, "k"); rect(g, 3, 23, 1, 4, "k");
  rect(g, w - 1, 21, 1, 8, "u");
  rect(g, 0, 29, w, 1, "k");
  put(g, Math.floor(w / 2), 25, "y");
  return rowsOf(g);
}
function displayCase(w: number, contents: (g: CharGrid) => void) {
  return defineProp({
    frames: [0, 1, 2, 3, 4, 5].map((f) => caseFrame(f < 3 ? f : 9, w, contents)),
    fps: 2,
    pal: CASE_PAL,
    solid: { x: 0, y: 8, w: w + 2, h: 24 },
  });
}
const ammonite = (g: CharGrid, cx: number, cy: number, r: number, L = "pPj") => {
  ellipse(g, cx, cy, r, r, (x, y) => ((x - cx) + (y - cy) < -1 ? L[0] : L[1]));
  // spiral ribs
  for (let a = 0; a < 12.5; a += 0.15) {
    const rr = r * (1 - a / 14);
    const x = Math.round(cx - 0.5 + Math.cos(a) * rr * 0.9), y = Math.round(cy - 0.5 + Math.sin(a) * rr * 0.9);
    put(g, x, y, L[2]);
  }
  put(g, Math.floor(cx), Math.floor(cy), L[2]);
};
export const CASE_FOSSILS = displayCase(34, (g) => {
  ammonite(g, 8, 7.5, 5);
  // trilobite
  stamp(g, 16, 3, [".cbc.", "cbabc", "cbcbc", "dcbcd", "cbcbc", "dcbcd", ".cbc.", "..d.."]);
  // shark tooth + raptor claw
  stamp(g, 23, 3, ["aaaa", "abbc", ".bc.", ".c.."]);
  stamp(g, 24, 8, ["..ab", ".abc", "abc.", "bc..", "c..."]);
  put(g, 29, 4, "s"); put(g, 30, 4, "S"); put(g, 29, 5, "S");
});
export const CASE_EGGS = displayCase(30, (g) => {
  // nest of speckled eggs on straw
  ellipse(g, 15, 9, 11, 4, (x, y) => ((x + y) % 3 === 0 ? "E" : (x * 2 + y) % 5 === 0 ? "j" : "e"));
  for (const [ex, ey] of [[8, 6], [13, 5], [18, 6], [22, 7], [11, 9], [17, 9]] as const) {
    ellipse(g, ex, ey, 2.5, 3, (x, y) => (x - ex + y - ey < -1.5 ? "a" : x - ex + y - ey < 1 ? "b" : "c"));
    put(g, ex - 1, ey, "d"); put(g, ex + 1, ey + 1, "d");
  }
});
export const CASE_AMBER = displayCase(30, (g) => {
  // two amber drops (one with a mosquito) and a crystal cluster
  ellipse(g, 8, 7, 5, 4.5, (x, y) => (x - 8 + y - 7 < -2 ? "f" : x - 8 + y - 7 < 2 ? "e" : "E"));
  put(g, 8, 7, "h"); put(g, 7, 6, "h"); put(g, 9, 6, "h"); put(g, 9, 8, "h"); put(g, 7, 8, "h"); put(g, 6, 5, "w");
  ellipse(g, 15, 10, 2.5, 2, (x, y) => (x - 15 + y - 10 < 0 ? "f" : "E"));
  // amethyst geode
  ellipse(g, 23, 7, 5, 5, (x, y) => (Math.hypot(x + 0.5 - 23, y + 0.5 - 7) > 4 ? "s" : (x + y) % 3 === 0 ? "n" : (x + y) % 3 === 1 ? "m" : "M"));
  put(g, 23, 7, "N"); put(g, 22, 5, "n"); put(g, 21, 5, "w");
});
export const CASE_MINERALS = displayCase(34, (g) => {
  // quartz spikes, a red crystal, a blue geode slice
  const spike = (x: number, y: number, h: number, a: string, b: string) => {
    for (let i = 0; i < h; i++) { put(g, x, y + i, a); put(g, x + 1, y + i, b); }
    put(g, x, y - 1, a);
  };
  spike(4, 5, 7, "w", "q"); spike(7, 3, 9, "q", "Q"); spike(10, 6, 6, "w", "q");
  rect(g, 3, 12, 10, 1, "S");
  spike(15, 6, 6, "r", "R"); spike(17, 4, 8, "r", "R"); spike(19, 7, 5, "r", "R"); rect(g, 14, 12, 8, 1, "S");
  ellipse(g, 27, 8, 4.5, 4.5, (x, y) => {
    const d = Math.hypot(x + 0.5 - 27, y + 0.5 - 8);
    return d > 3.6 ? "S" : d > 2.4 ? "q" : d > 1.2 ? "Q" : "w";
  });
});
export const CASE_SKULL = displayCase(30, (g) => {
  // raptor skull facing left
  poly(g, [[4, 8], [10, 4], [18, 3], [24, 5], [25, 9], [18, 11], [8, 11]], (x, y) => (y < 6 ? "a" : y < 9 ? "b" : "c"));
  rect(g, 17, 5, 3, 2, "V"); rect(g, 12, 6, 3, 2, "V");
  for (let x = 6; x <= 20; x += 2) put(g, x, 11, "a");
  poly(g, [[7, 12], [20, 12], [16, 14], [9, 14]], () => "c");
  ammonite(g, 27, 11, 2.3);
});

// ── Paintings on the wall ────────────────────────────────────────────────────
const ART_PAL = {
  // gold frame
  F: "#f8d868", G: "#d8a838", H: "#9c6c1c",
  // sky / landscape
  s: "#f8b878", S: "#f08858", z: "#a8d8f8", Z: "#78b0e8", l: "#e8f4ff",
  v: "#585070", V: "#383050", r: "#f05830", R: "#b02818", y: "#ffe070",
  g: "#58b058", q: "#3c8840", j: "#a0d070", h: "#282030",
  w: "#ffffff", b: "#c8a070", B: "#987048", e: "#68a860", E: "#3c7c48",
  p: "#e8d8b8", P: "#c0a888",
};
function painting(w: number, h: number, scene: (g: CharGrid, w: number, h: number) => void) {
  const g = blank(w, h);
  scene(g, w, h);
  // frame
  for (let x = 0; x < w; x++) { put(g, x, 0, "F"); put(g, x, 1, "G"); put(g, x, h - 2, "G"); put(g, x, h - 1, "H"); }
  for (let y = 0; y < h; y++) { put(g, 0, y, "F"); put(g, 1, y, y > 0 && y < h - 1 ? "G" : g[y][1]); put(g, w - 2, y, y > 0 && y < h - 1 ? "G" : g[y][w - 2]); put(g, w - 1, y, "H"); }
  put(g, 0, h - 1, "G"); put(g, w - 1, 0, "G");
  put(g, 2, 2, "F");
  return defineProp({ rows: rowsOf(g), pal: ART_PAL, solid: null });
}
/** Volcano at sunset with a brachiosaurus silhouette. */
export const PAINT_VOLCANO = painting(30, 22, (g, w, h) => {
  rect(g, 2, 2, w - 4, h - 4, "s");
  for (let y = 2; y < 8; y++) for (let x = 2; x < w - 2; x++) put(g, x, y, y < 5 ? "S" : "s");
  rect(g, 10, 4, 2, 1, "y");
  poly(g, [[13, 9], [16, 9], [24, 19], [5, 19]], (x) => (x < 14 ? "v" : "V"));
  rect(g, 13, 8, 4, 1, "r"); put(g, 14, 7, "y"); put(g, 15, 6, "r"); put(g, 12, 10, "r"); put(g, 16, 11, "R");
  rect(g, 2, 17, w - 4, 3, "q");
  rect(g, 2, 17, w - 4, 1, "g");
  // brachio silhouette on the right
  rect(g, 20, 13, 6, 3, "h"); rect(g, 20, 16, 1, 2, "h"); rect(g, 25, 16, 1, 2, "h");
  line(g, 21, 13, 19, 8, "h"); put(g, 18, 8, "h"); put(g, 26, 14, "h"); put(g, 27, 15, "h");
});
/** T-Rex portrait. */
export const PAINT_TREX = painting(24, 22, (g, w, h) => {
  rect(g, 2, 2, w - 4, h - 4, "z");
  rect(g, 2, 2, w - 4, 4, "l");
  rect(g, 2, 15, w - 4, 5, "j");
  poly(g, [[5, 8], [12, 5], [19, 7], [20, 12], [12, 13], [9, 18], [5, 18]], (x, y) => (y < 9 ? "j" : x + y < 22 ? "e" : "E"));
  put(g, 12, 8, "w"); put(g, 13, 8, "h");
  for (let x = 13; x <= 19; x += 2) put(g, x, 12, "w");
  rect(g, 13, 13, 6, 1, "E");
});
/** Pterodactyls over the sea. */
export const PAINT_PTERO = painting(30, 22, (g, w, h) => {
  rect(g, 2, 2, w - 4, h - 4, "Z");
  rect(g, 2, 2, w - 4, 6, "z");
  rect(g, 2, 14, w - 4, 6, "V");
  for (let x = 3; x < w - 3; x += 3) put(g, x, 15 + (x % 2), "Z");
  rect(g, 20, 4, 4, 3, "y"); put(g, 20, 4, "Z"); put(g, 23, 6, "Z");
  for (const [bx, by] of [[6, 7], [13, 10], [9, 4]] as const) {
    put(g, bx, by, "h"); put(g, bx - 1, by - 1, "h"); put(g, bx - 2, by - 1, "h"); put(g, bx + 1, by - 1, "h"); put(g, bx + 2, by - 1, "h"); put(g, bx - 3, by, "h"); put(g, bx + 3, by, "h");
  }
});
/** Fossil timeline chart. */
export const PAINT_CHART = painting(28, 22, (g, w, h) => {
  rect(g, 2, 2, w - 4, h - 4, "p");
  for (let i = 0; i < 4; i++) rect(g, 2, 3 + i * 4, w - 4, 1, "P");
  ammonite(g, 7, 9, 3.4, "bBH");
  // tiny bones
  rect(g, 14, 7, 8, 1, "b"); put(g, 13, 6, "b"); put(g, 13, 8, "b"); put(g, 22, 6, "b"); put(g, 22, 8, "b");
  rect(g, 14, 12, 5, 1, "B"); put(g, 13, 11, "B"); put(g, 19, 11, "B");
  text(g, 5, 14, "65M", "B");
});

/** Big banner "MUSEO" above the main hall. */
export const BANNER = defineProp({
  rows: (() => {
    const w = 52, h = 20;
    const g = blank(w, h);
    rect(g, 0, 0, w, 14, "r"); rect(g, 0, 0, w, 1, "a"); rect(g, 0, 13, w, 1, "R");
    rect(g, 1, 1, w - 2, 1, "y"); rect(g, 1, 12, w - 2, 1, "Y");
    text(g, 7, 4, "MUSEO", "w", 1, "R");
    // dino skull logo on both sides
    stamp(g, 2, 4, ["www.", "wwhw", "www."]);
    stamp(g, w - 6, 4, [".www", "whww", ".www"]);
    // tails of the banner
    for (let i = 0; i < 6; i++) { rect(g, 2 + i, 14 + i, 8 - i * 2 > 0 ? 8 - i : 2, 1, "R"); }
    for (let y = 14; y < 19; y++) { rect(g, 2, y, 8, 1, "r"); rect(g, w - 10, y, 8, 1, "r"); }
    put(g, 5, 19, "r"); put(g, 6, 18, "."); put(g, 5, 18, "."); put(g, 6, 19, ".");
    for (const x0 of [2, w - 10]) { put(g, x0 + 3, 18, "."); put(g, x0 + 4, 18, "."); put(g, x0 + 3, 17, "."); put(g, x0 + 4, 17, "R"); put(g, x0 + 2, 18, "R"); put(g, x0 + 5, 18, "R"); }
    return rowsOf(g);
  })(),
  pal: { r: "#d83040", R: "#901828", a: "#f87080", y: "#f8d050", Y: "#c89030", w: "#ffffff", h: "#901828" },
  solid: null,
});

// ── Marble column (stands against the back wall) ────────────────────────────
export const COLUMN = defineProp({
  rows: (() => {
    const w = 16, h = 50;
    const g = blank(w, h);
    // capital
    rect(g, 0, 0, w, 3, "b"); rect(g, 0, 0, w, 1, "a"); rect(g, 0, 2, w, 1, "c");
    rect(g, 1, 3, w - 2, 3, "a"); rect(g, 1, 5, w - 2, 1, "c"); put(g, 1, 4, "c"); put(g, w - 2, 4, "c");
    // fluted shaft
    for (let y = 6; y < 43; y++) for (let x = 2; x < w - 2; x++) {
      const k = x - 2;
      put(g, x, y, k === 0 || k === 1 ? "a" : k === 11 ? "d" : k % 3 === 2 ? "c" : k > 7 ? "c" : "b");
    }
    // base
    rect(g, 1, 43, w - 2, 2, "a"); rect(g, 1, 44, w - 2, 1, "c");
    rect(g, 0, 45, w, 4, "b"); rect(g, 0, 45, w, 1, "a"); rect(g, 0, 48, w, 1, "d"); rect(g, w - 3, 45, 3, 3, "c");
    rect(g, 0, 49, w, 1, "s");
    return rowsOf(g);
  })(),
  pal: { a: "#fffcf0", b: "#ece4d0", c: "#d0c4a8", d: "#a89c84", s: "#bca888" },
  solid: { x: 0, y: 42, w: 18, h: 10 },
});

// ── Meteorite on a round pedestal (cracks glow) ──────────────────────────────
function meteorite(f: number): string[] {
  const W = 40, H = 36;
  const g = blank(W, H);
  // pedestal (round, stone)
  ellipse(g, 20, 29, 17, 5.5, (x, y) => (y < 28 ? (x < 16 ? "A" : "B") : "C"));
  for (let x = 4; x < 37; x++) if (g[31][x] !== ".") { put(g, x, 31, "D"); put(g, x, 32, "D"); put(g, x, 33, "F"); }
  ellipse(g, 20, 27, 16, 4.5, (x, y) => (x + y < 38 ? "A" : "B"));
  // rock
  blobs(g, [{ x: 16, y: 18, rx: 10, ry: 8 }, { x: 25, y: 16, rx: 8, ry: 8.5 }, { x: 21, y: 22, rx: 10, ry: 5 }], "abcd");
  // metallic flecks + glowing cracks
  for (const [x, y] of [[12, 13], [22, 11], [27, 14], [14, 20], [24, 22]] as const) put(g, x, y, "w");
  const glow = f % 2 === 0 ? ["e", "E"] : ["E", "f"];
  const crack: P[] = [[16, 15], [17, 16], [18, 17], [19, 17], [20, 18], [21, 19], [22, 19], [23, 20], [19, 18], [18, 19], [17, 21]];
  crack.forEach(([x, y], i) => put(g, x, y, glow[i % 2]));
  put(g, 26, 18, glow[0]); put(g, 27, 19, glow[1]); put(g, 28, 19, glow[0]);
  return rowsOf(g);
}
export const METEORITE = defineProp({
  frames: [meteorite(0), meteorite(1)],
  fps: 2,
  pal: {
    a: "#9890a0", b: "#6c6474", c: "#4c4454", d: "#342c3c", w: "#e8f0ff",
    e: "#ff9030", E: "#ffd060", f: "#ff5828",
    A: "#ece8f4", B: "#d0cce0", C: "#b0aec8", D: "#8c8aa8", F: "#6c6a88",
  },
  solid: { x: 2, y: 22, w: 38, h: 16 },
});

// ── Info sign on a stand ─────────────────────────────────────────────────────
function infoSign(label: string, icon: readonly string[], bg = "z") {
  const w = Math.max(20, textWidth(label) + 6), h = 26;
  const g = blank(w, h);
  rect(g, 0, 0, w, 16, bg); rect(g, 0, 0, w, 1, "Y"); rect(g, 0, 0, 1, 16, "Y");
  rect(g, 0, 15, w, 1, "k"); rect(g, w - 1, 0, 1, 16, "k");
  stamp(g, Math.floor((w - icon[0].length) / 2), 2, icon);
  text(g, 3, 9, label, "w");
  const px = Math.floor(w / 2) - 1;
  rect(g, px, 16, 2, 8, "m"); put(g, px, 16, "M");
  rect(g, px - 3, 24, 8, 2, "m"); rect(g, px - 3, 25, 8, 1, "M");
  return defineProp({
    rows: rowsOf(g),
    pal: { z: "#2c5c78", Z: "#7c3c64", Y: "#68a0c0", k: "#183448", w: "#ffffff", b: "#f0e0bc", m: "#8890a8", M: "#585c74", y: "#f8d050" },
    solid: { x: px - 3, y: 22, w: 10, h: 6 },
  });
}
const ICON_SKULL = ["..bbbb.", ".bbkbbb", "bbbbbbb", ".b.b.b."];
const ICON_BONE = ["b.....b", ".bbbbb.", "b.....b"];
const ICON_STAR = ["...y...", "..yyy..", "yyyyyyy", ".y...y."];
export const SIGN_TREX = infoSign("T-REX", ICON_SKULL);
export const SIGN_FOSIL = infoSign("FOSIL", ICON_BONE);
export const SIGN_SPACE = infoSign("COSMOS", ICON_STAR);

// ── Museum bench (padded leather) ────────────────────────────────────────────
export const BENCH = defineProp({
  rows: [
    "..............................",
    ".rrrrrrrrrrrrrrrrrrrrrrrrrrrr.",
    "rRRRRRRRRRRRRRRRRRRRRRRRRRRRRq",
    "rRRwRRRRRRwRRRRRRRwRRRRRRRwRRq",
    "rRRRRRRRRRRRRRRRRRRRRRRRRRRRRq",
    "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ".cc.......................cc..",
    ".cc.......................cc..",
    ".dd.......................dd..",
  ],
  pal: { r: "#c86048", R: "#a83c30", q: "#782420", w: "#d87860", a: "#d8a060", b: "#a06830", c: "#7c4c24", d: "#5c3418" },
  solid: { x: 0, y: 2, w: 32, h: 11 },
});

// ── Potted plant (big fern in a white planter) ──────────────────────────────
export const PLANT = defineProp({
  rows: (() => {
    const g = blank(20, 28);
    blobs(g, [
      { x: 5, y: 10, rx: 5, ry: 4 }, { x: 15, y: 9, rx: 5, ry: 4 }, { x: 10, y: 6, rx: 6, ry: 5 },
      { x: 6, y: 15, rx: 4.5, ry: 3.5 }, { x: 14, y: 15, rx: 4.5, ry: 3.5 }, { x: 10, y: 12, rx: 5, ry: 4 },
    ], "abcd");
    // frond tips
    for (const [x, y] of [[1, 8], [18, 7], [10, 0], [3, 18], [17, 18]] as const) put(g, x, y, "b");
    // pot
    for (let y = 17; y < 28; y++) {
      const half = y < 19 ? 7 : 6 - Math.floor((y - 19) / 4);
      for (let x = 10 - half; x < 10 + half; x++) {
        const k = x - (10 - half);
        put(g, x, y, y < 19 ? (y === 17 ? "W" : "X") : k < 2 ? "W" : k > half * 2 - 3 ? "Y" : "X");
      }
    }
    rect(g, 5, 22, 10, 1, "Z");
    return rowsOf(g);
  })(),
  pal: { a: "#a8e070", b: "#70c048", c: "#489838", d: "#2c6c30", W: "#ffffff", X: "#e8e4ec", Y: "#c0bccc", Z: "#d85848" },
  solid: { x: 2, y: 19, w: 18, h: 11 },
});

// ── Green dinosaur statue (fake Julio!) ──────────────────────────────────────
export const DINO_STATUE = defineProp({
  rows: [
    "......GGGG.....",
    ".....GLLGGG....",
    ".....GWDGGGG...",
    ".....GGGGGGGG..",
    ".....GgYYYYYY..",
    "......GGGGGG...",
    "..S..GGGGG.....",
    ".SGSGGLGGGG....",
    "SGGGGLGGGGGGg..",
    "GGgGGYYYGGGGg..",
    "Gg.GGYYYGGGGgg.",
    "g..gGYYYGGGg.gg",
    "....GGGgGGg..g.",
    "....GG...GG....",
    "....LL...LL....",
    "...bbbbbbbbbb..",
    "..abbbbbbbbbbc.",
    "..abbbbbbbbbbc.",
    "..ddddddddddd..",
  ],
  pal: {
    G: "#3cb46c", g: "#258a54", L: "#7ad890", S: "#1e6e44", Y: "#f8e8a8", W: "#ffffff", D: "#202020",
    a: "#e8e4f0", b: "#cccadc", c: "#8c8aa8", d: "#6c6a88",
  },
  solid: { x: 2, y: 13, w: 14, h: 8 },
});

// ── Gift shop ────────────────────────────────────────────────────────────────
const PLUSH_COLORS: Record<string, [string, string, string]> = {
  pink: ["#ffb0d0", "#f070a8", "#b84880"],
  blue: ["#a8d0ff", "#5890f0", "#3060b0"],
  yellow: ["#fff0a0", "#f8c830", "#c08818"],
  purple: ["#d8b0ff", "#a070e0", "#6840a8"],
  orange: ["#ffc890", "#f88838", "#b85818"],
  green: ["#7ad890", "#3cb46c", "#258a54"],
};
const PLUSH_ROWS = [
  "...aab..",
  "..abbbb.",
  "..bkbbbb",
  "..bbbbcc",
  ".s.bbb..",
  "sbbbbbc.",
  "bbbwwbc.",
  ".bbwwbc.",
  "..b..c..",
];
function plushStamp(g: CharGrid, x: number, y: number, flip = false) {
  stamp(g, x, y, flip ? PLUSH_ROWS.map((r) => r.split("").reverse().join("")) : PLUSH_ROWS);
}
/** Shelf full of dino plushies in many colours. */
function plushShelf() {
  const W = 36, H = 36;
  const g = blank(W, H);
  rect(g, 0, 0, W, H, "t"); rect(g, 0, 0, W, 1, "U"); rect(g, 0, 0, 1, H, "U"); rect(g, W - 1, 0, 1, H, "k");
  const cols = ["1", "2", "3", "4", "5", "1", "4", "3", "2", "5", "3", "1"];
  let i = 0;
  for (const sy of [2, 13, 24]) {
    rect(g, 2, sy, W - 4, 10, "u"); rect(g, 2, sy, W - 4, 1, "k");
    for (let px = 3; px < W - 8; px += 8) {
      const c = cols[i++ % cols.length];
      const s = blank(8, 9);
      plushStamp(s, 0, 0, (i % 2) === 0);
      s.forEach((row, yy) => row.forEach((ch, xx) => {
        if (ch === ".") return;
        const m = ch === "a" ? c + "a" : ch === "b" ? c + "b" : ch === "c" ? c + "c" : ch;
        put(g, px + xx, sy + 1 + yy, m);
      }));
    }
    rect(g, 2, sy + 10, W - 4, 1, "U");
  }
  rect(g, 0, H - 1, W, 1, "k");
  // remap 2-char codes to single letters
  const map: Record<string, string> = {
    "1a": "A", "1b": "B", "1c": "C", "2a": "D", "2b": "E", "2c": "F", "3a": "H", "3b": "I", "3c": "J",
    "4a": "L", "4b": "M", "4c": "N", "5a": "P", "5b": "Q", "5c": "R",
  };
  return g.map((row) => row.map((ch) => map[ch] ?? ch).join(""));
}
export const PLUSH_SHELF = defineProp({
  rows: plushShelf(),
  pal: {
    t: "#c88850", u: "#7c4c28", U: "#e0a868", k: "#4c2c14", w: "#fff4e0", s: "#ffffff",
    A: PLUSH_COLORS.pink[0], B: PLUSH_COLORS.pink[1], C: PLUSH_COLORS.pink[2],
    D: PLUSH_COLORS.blue[0], E: PLUSH_COLORS.blue[1], F: PLUSH_COLORS.blue[2],
    H: PLUSH_COLORS.yellow[0], I: PLUSH_COLORS.yellow[1], J: PLUSH_COLORS.yellow[2],
    L: PLUSH_COLORS.purple[0], M: PLUSH_COLORS.purple[1], N: PLUSH_COLORS.purple[2],
    P: PLUSH_COLORS.orange[0], Q: PLUSH_COLORS.orange[1], R: PLUSH_COLORS.orange[2],
  },
  solid: { x: 0, y: 10, w: 38, h: 28 },
});
/** Loose plushie on the floor / in a bin. */
function plush(color: keyof typeof PLUSH_COLORS, flip = false) {
  const [a, b, c] = PLUSH_COLORS[color];
  const g = blank(8, 9);
  plushStamp(g, 0, 0, flip);
  return defineProp({ rows: rowsOf(g), pal: { a, b, c, k: "#282030", w: "#fff4e0", s: "#ffffff" }, solid: { x: 0, y: 4, w: 10, h: 7 } });
}
export const PLUSH_PINK = plush("pink");
export const PLUSH_BLUE = plush("blue", true);
export const PLUSH_ORANGE = plush("orange");
/** Big green plush dino (looks a lot like Julio from afar!). */
export const PLUSH_BIG_GREEN = defineProp({
  rows: [
    "......GGGGG.",
    ".....GLLGGGG",
    ".....GWDGGGG",
    ".....GGGGYYY",
    "......GGGGG.",
    "..S..GGGG...",
    ".SGSGLLGGG..",
    "SGGGLYYYGGG.",
    "GGgGGYYYGGg.",
    "g..GGYYYGGg.",
    "...GGGGGGg..",
    "...LLL.LLL..",
  ],
  pal: { G: "#3cb46c", g: "#258a54", L: "#7ad890", S: "#1e6e44", Y: "#f8e8a8", W: "#ffffff", D: "#202020" },
  solid: { x: 0, y: 6, w: 14, h: 8 },
});
/** Bin full of plushies. */
export const PLUSH_BIN = defineProp({
  rows: (() => {
    const g = blank(24, 20);
    const heads: [number, number, string][] = [[2, 0, "1"], [8, 1, "2"], [14, 0, "3"], [5, 4, "4"], [12, 4, "5"]];
    for (const [hx, hy, c] of heads) {
      stamp(g, hx, hy, ["..aab..", ".abbbb.", ".bkbbbb", ".bbbbcc", "bbbbbc."].map((r) => r.replace(/a/g, c === "1" ? "A" : c === "2" ? "D" : c === "3" ? "H" : c === "4" ? "L" : "P").replace(/b/g, c === "1" ? "B" : c === "2" ? "E" : c === "3" ? "I" : c === "4" ? "M" : "Q").replace(/c/g, c === "1" ? "C" : c === "2" ? "F" : c === "3" ? "J" : c === "4" ? "N" : "R")));
    }
    // wire basket
    for (let y = 8; y < 20; y++) for (let x = 1; x < 23; x++) {
      put(g, x, y, y === 8 ? "y" : y === 19 ? "Z" : (x + y) % 4 === 0 || (x - y + 40) % 4 === 0 ? "Y" : "z");
    }
    rect(g, 2, 10, 20, 2, "t"); text(g, 3, 13, "PROMO", "w");
    return rowsOf(g);
  })(),
  pal: {
    y: "#e8e8f8", Y: "#a8a8c0", z: "#d03848", Z: "#606078", t: "#d03848", w: "#ffffff", k: "#282030",
    A: PLUSH_COLORS.pink[0], B: PLUSH_COLORS.pink[1], C: PLUSH_COLORS.pink[2],
    D: PLUSH_COLORS.blue[0], E: PLUSH_COLORS.blue[1], F: PLUSH_COLORS.blue[2],
    H: PLUSH_COLORS.yellow[0], I: PLUSH_COLORS.yellow[1], J: PLUSH_COLORS.yellow[2],
    L: PLUSH_COLORS.purple[0], M: PLUSH_COLORS.purple[1], N: PLUSH_COLORS.purple[2],
    P: PLUSH_COLORS.orange[0], Q: PLUSH_COLORS.orange[1], R: PLUSH_COLORS.orange[2],
  },
  solid: { x: 0, y: 8, w: 26, h: 14 },
});
/** Shop counter with a cash register (animated drawer light). */
function counter(f: number): string[] {
  const W = 50, H = 30;
  const g = blank(W, H);
  // register
  rect(g, 30, 0, 14, 8, "m"); rect(g, 30, 0, 14, 1, "n"); rect(g, 31, 1, 7, 3, f ? "e" : "E");
  text(g, 32, 2, f ? "1" : "", "k");
  for (let x = 31; x < 43; x += 2) put(g, x, 6, "n");
  rect(g, 39, 1, 4, 4, "M");
  // counter top
  rect(g, 0, 8, W, 8, "a"); rect(g, 0, 8, W, 1, "A"); rect(g, 0, 15, W, 1, "b");
  rect(g, 4, 9, 10, 5, "p"); rect(g, 4, 9, 10, 1, "P"); // bag
  rect(g, 6, 7, 6, 2, "p");
  stamp(g, 18, 1, PLUSH_ROWS.map((r) => r.replace(/a/g, "H").replace(/b/g, "I").replace(/c/g, "J")));
  // front
  rect(g, 0, 16, W, 13, "t"); rect(g, 0, 16, W, 1, "U");
  for (let x = 6; x < W; x += 12) rect(g, x, 18, 1, 10, "u");
  rect(g, 0, 29, W, 1, "k");
  text(g, 14, 20, "TIENDA", "y", 1, "u");
  return rowsOf(g);
}
export const COUNTER = defineProp({
  frames: [counter(0), counter(0), counter(1)],
  fps: 1.5,
  pal: {
    m: "#7880a0", n: "#a8b0c8", M: "#484c64", e: "#a0f0a0", E: "#58b868", k: "#203020",
    a: "#f0e8d8", A: "#ffffff", b: "#c8bca8", p: "#f8d878", P: "#fff0b0",
    t: "#c03848", U: "#e86070", u: "#902030", y: "#f8d050",
    // plush on the counter (yellow)
    s: "#ffffff", w: "#fff4e0", H: "#fff0a0", I: "#f8c830", J: "#c08818",
  },
  solid: { x: 0, y: 12, w: 52, h: 20 },
});

// ── Diorama (model landscape with a smoking volcano and tiny dinos) ──────────
function diorama(f: number): string[] {
  const W = 46, H = 36;
  const g = blank(W, H);
  // table
  rect(g, 0, 10, W, 18, "e"); rect(g, 0, 10, W, 1, "E");
  // landscape
  blobs(g, [{ x: 12, y: 18, rx: 11, ry: 7 }, { x: 30, y: 19, rx: 13, ry: 7 }], "jgGq", { crease: false });
  ellipse(g, 34, 22, 6, 3, (x, y) => (y < 22 ? "z" : "Z"));
  put(g, 32, 21, "w");
  // volcano
  poly(g, [[13, 7], [17, 7], [24, 20], [6, 20]], (x) => (x < 14 ? "v" : "V"));
  rect(g, 13, 7, 5, 1, "r"); put(g, 15, 8, "r"); put(g, 14, 9, "R"); put(g, 16, 11, "r");
  // smoke puffs rising
  const sm = [[15, 4 - f], [17, 1 - f], [14, -1 - f]];
  for (const [sx, sy] of sm) {
    if (sy < 0) continue;
    ellipse(g, sx, sy + 1, 2, 1.6, (x, y) => (x + y < sx + sy + 1 ? "w" : "W"));
  }
  // tiny dinos + trees
  stamp(g, 26, 14, [".pp", "ppp", "p.p"]);
  stamp(g, 38, 16, ["pp.", "ppp", "p.p"].map((r) => r.replace(/p/g, "y")));
  for (const [tx, ty] of [[4, 15], [22, 21], [42, 18]] as const) { put(g, tx, ty, "q"); put(g, tx - 1, ty + 1, "q"); put(g, tx + 1, ty + 1, "q"); put(g, tx, ty + 2, "B"); }
  // glass edge + front
  rect(g, 0, 10, 1, 18, "w"); rect(g, W - 1, 10, 1, 18, "W");
  rect(g, 0, 26, W, 2, "E");
  rect(g, 0, 28, W, 6, "t"); rect(g, 0, 28, W, 1, "U");
  rect(g, 0, 34, W, 1, "k");
  rect(g, 2, 33, 2, 2, "k"); rect(g, W - 4, 33, 2, 2, "k");
  return rowsOf(g);
}
export const DIORAMA = defineProp({
  frames: [0, 1, 2, 3].map(diorama),
  fps: 2,
  pal: {
    e: "#c8e4f0", E: "#ffffff", j: "#b0e070", g: "#78c050", G: "#58a040", q: "#3c7c38", B: "#7c4c28",
    z: "#68b8f0", Z: "#3880d0", v: "#a07858", V: "#785440", r: "#ff6030", R: "#ffc040",
    w: "#ffffff", W: "#c8c8d8", p: "#f06070", y: "#f8c838",
    t: "#8c5c3c", U: "#b07850", k: "#4c2c18",
  },
  solid: { x: 0, y: 12, w: 48, h: 26 },
});

// ── Dig pit details (flat) ───────────────────────────────────────────────────
export const BURIED_SKULL = defineProp({
  rows: (() => {
    const g = blank(22, 12);
    poly(g, [[2, 7], [7, 3], [14, 2], [20, 4], [21, 8], [14, 9], [5, 9]], (x, y) => (y < 5 ? "a" : y < 8 ? "b" : "c"));
    rect(g, 13, 4, 3, 2, "h"); rect(g, 8, 5, 3, 2, "h");
    for (let x = 4; x <= 16; x += 2) put(g, x, 9, "a");
    rect(g, 0, 10, 22, 2, "s"); rect(g, 3, 9, 1, 1, "s");
    return rowsOf(g);
  })(),
  pal: { a: "#fffaec", b: "#f0e0bc", c: "#d4bc90", h: "#7c6448", s: "#dcc080" },
  solid: null,
  flat: true,
});
export const BURIED_BONES = defineProp({
  rows: [
    "aa.........aa..",
    "abbbbbbbbbbbc..",
    "cc.........cc..",
    "........a..a...",
    "...aa....bc....",
    "...abc...cb....",
    "....bc..c..c...",
    ".....cc........",
  ],
  pal: { a: "#fffaec", b: "#f0e0bc", c: "#d4bc90" },
  solid: null,
  flat: true,
});
export const BRUSH = defineProp({
  rows: [
    "ww.......",
    "wwttttttu",
    "ww.......",
  ],
  pal: { w: "#f8e8a0", t: "#c07838", u: "#804820" },
  solid: null,
  flat: true,
});
export const BUCKET = defineProp({
  rows: [
    ".kkkkkk.",
    "k......k",
    "rrrrrrrr",
    "RrrrrrrR",
    ".Rrrrrr.",
    ".RRRRRR.",
  ],
  pal: { k: "#606078", r: "#f05860", R: "#b83040" },
  solid: { x: 0, y: 2, w: 10, h: 6 },
});
export const DIG_SIGN = infoSign("EXCAVA", ["b.....b", ".bbbbb.", "b.....b"], "Z");

/** Dino footprints painted on the floor (flat, 3 toes). */
export const FOOTPRINTS = defineProp({
  rows: (() => {
    const g = blank(40, 14);
    const step = (x: number, y: number) => stamp(g, x, y, ["f.f.f", "f.f.f", ".fff.", ".fff.", "..f.."]);
    step(0, 8); step(10, 3); step(20, 8); step(30, 3);
    return rowsOf(g);
  })(),
  pal: { f: "#c9b18a" },
  solid: null,
  flat: true,
  outline: false,
});

/** Entrance doormat. */
export const DOORMAT = defineProp({
  rows: (() => {
    const g = blank(44, 14);
    rect(g, 0, 0, 44, 14, "a"); rect(g, 1, 1, 42, 12, "b");
    for (let x = 2; x < 42; x += 2) for (let y = 2; y < 12; y++) if ((x + y) % 4 === 0) put(g, x, y, "c");
    text(g, 8, 5, "SALIDA", "y");
    return rowsOf(g);
  })(),
  pal: { a: "#504860", b: "#686078", c: "#5c5470", y: "#f8d050" },
  solid: null,
  flat: true,
});

/** Big dino egg replica on a little stand. */
export const BIG_EGG = defineProp({
  rows: (() => {
    const g = blank(16, 24);
    ellipse(g, 8, 9, 6.5, 8.5, (x, y) => {
      const l = (x - 8) * 0.6 + (y - 9) * 0.8;
      const c = l < -3 ? "a" : l < 2 ? "b" : l < 5 ? "c" : "d";
      return (x * 3 + y * 5) % 11 === 0 ? "e" : c;
    });
    rect(g, 2, 18, 12, 2, "M"); rect(g, 3, 20, 10, 3, "m"); rect(g, 2, 23, 12, 1, "M");
    rect(g, 2, 18, 12, 1, "n");
    return rowsOf(g);
  })(),
  pal: { a: "#f8f0e0", b: "#e8d4b8", c: "#ccb494", d: "#a88c70", e: "#a07850", m: "#c03848", M: "#802030", n: "#e86070" },
  solid: { x: 1, y: 16, w: 16, h: 10 },
});

/** Little trash bin. */
export const BIN = defineProp({
  rows: [
    ".aaaaaa.",
    "abbbbbbc",
    "cccccccc",
    ".bdbdbd.",
    ".bdbdbd.",
    ".bdbdbd.",
    ".cccccc.",
  ],
  pal: { a: "#d0d4e4", b: "#a0a6be", c: "#6c7088", d: "#82889e" },
  solid: { x: 0, y: 1, w: 10, h: 8 },
});

// ── Decorative rocks + fern on the plinths ───────────────────────────────────
export const PLINTH_ROCKS = defineProp({
  rows: (() => {
    const g = blank(26, 14);
    blobs(g, [{ x: 18, y: 9, rx: 6, ry: 4 }, { x: 23, y: 10, rx: 3, ry: 2.5 }], "ABCD");
    blobs(g, [{ x: 5, y: 6, rx: 4, ry: 3 }, { x: 9, y: 5, rx: 3.5, ry: 3 }, { x: 4, y: 9, rx: 3.5, ry: 2.5 }, { x: 9, y: 9, rx: 3, ry: 2.5 }], "abcd");
    for (const [x, y] of [[1, 3], [11, 2], [7, 1], [13, 7]] as const) put(g, x, y, "b");
    return rowsOf(g);
  })(),
  pal: { a: "#a8e070", b: "#70c048", c: "#489838", d: "#2c6c30", A: "#d8c4a8", B: "#b49c80", C: "#8c7860", D: "#6c5844" },
  solid: null,
});
export const PLINTH_PEBBLES = defineProp({
  rows: (() => {
    const g = blank(16, 8);
    blobs(g, [{ x: 4, y: 4, rx: 3.5, ry: 2.5 }, { x: 10, y: 5, rx: 2.5, ry: 2 }, { x: 13.5, y: 3.5, rx: 2, ry: 1.6 }], "ABCD");
    return rowsOf(g);
  })(),
  pal: { A: "#d8c4a8", B: "#b49c80", C: "#8c7860", D: "#6c5844" },
  solid: null,
});

/** Yellow "wet floor" sign (piso mojado) with a tiny puddle. */
export const WET_FLOOR = defineProp({
  rows: [
    "....yy....",
    "...yYYy...",
    "...ykky...",
    "..yYkkYy..",
    "..yYYYYy..",
    ".yYYkkYYy.",
    ".yYkYYkYy.",
    "yYYYYYYYYy",
    "yyyyyyyyyy",
    "k........k",
  ],
  pal: { y: "#f8d838", Y: "#f0b828", k: "#383040" },
  solid: { x: 0, y: 4, w: 12, h: 8 },
});
export const PUDDLE = defineProp({
  rows: ["..bbbbb...", ".baawaab..", "bbaaaabbbb", ".bbbbbb..."],
  pal: { a: "#d8f0f8", b: "#b0d8e8", w: "#ffffff" },
  solid: null,
  flat: true,
  outline: false,
});
/** Dropped museum map brochure (flat). */
export const BROCHURE = defineProp({
  rows: ["wwwwwwwww", "wrrwggwbw", "wrrwggwbw", "wwwwwwwww", "wyywbbwrw", "wwwwwwwww"],
  pal: { w: "#fffcf0", r: "#e85060", g: "#70c048", b: "#5890f0", y: "#f8c838" },
  solid: null,
  flat: true,
});
/** Red balloon tied to a kid-height string (floats and bobs). */
export const BALLOON = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(8, 22);
    ellipse(g, 4, 4 + f, 3.6, 4.2, (x, y) => (x + y < 6 + f ? "a" : x + y < 10 + f ? "b" : "c"));
    put(g, 2, 2 + f, "w");
    put(g, 4, 9 + f, "c");
    for (let y = 10 + f; y < 22; y++) put(g, 4 + (y % 4 === 0 ? 1 : 0), y, "s");
    return rowsOf(g);
  }),
  fps: 1.5,
  pal: { a: "#ff8090", b: "#f03848", c: "#b02030", w: "#ffffff", s: "#e8e8f0" },
  solid: { x: 2, y: 20, w: 6, h: 4 },
});

// Unused-import guard for helpers kept for future props.
void line;
