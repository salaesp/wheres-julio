// Volcano props: the smoking crater with its lava cascade, geyser, fumaroles,
// hot-spring steam, lava rocks, fire crystals, obsidian, fossils & bones, a
// dinosaur nest, prehistoric plants, and the explorers' camp (tents, campfire,
// map table, jeep, crates, seismograph, warning signs, flag, backpacks).
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { hash2 } from "../terrain";
import { ellipse, flipRows, line } from "./artkit";
import { outlineWith, text, textWidth } from "./pixkit";

const at = (g: CharGrid, x: number, y: number) => g[y]?.[x] ?? ".";

// Shared ramps ────────────────────────────────────────────────────────────────
const ROCK = { a: "#9a8a8e", b: "#76686e", c: "#5a4e58", d: "#443a46", e: "#302838" };
const LAVA = { L: "#fff8c0", Y: "#f8d848", O: "#f89830", D: "#e86020", E: "#b83820", K: "#6a2a24" };
const SMOKE = { w: "#f0ecf0", W: "#d0c8d4", v: "#a69caa", V: "#7e7488" };
const WOOD = { t: "#d8a868", u: "#a87848", U: "#7c5434", T: "#58381f" };

// ════════════════════════════════════════════════════════════════════════════
// THE VOLCANO — crater with bubbling lava, smoke plume, lava cascade down the
// front face that pours into the lava river below (sprite bottom = river top).
// ════════════════════════════════════════════════════════════════════════════
const VW = 146, VH = 96, VCX = 72.5, RIM = 30;
const CONE = { a: "#c0aa9e", b: "#9a8478", c: "#7a6660", d: "#5c4a4c", e: "#42343c" };
const isLavaCh = (c: string) => "LYODEK".includes(c);

function volcanoFrame(f: number): string[] {
  const g = blank(VW, VH);
  const foot = VH - 2;
  // ── cone body
  for (let y = RIM; y <= foot; y++) {
    const t = (y - RIM) / (foot - RIM);
    let half = 23 + 48 * Math.pow(t, 1.35);
    if (y > foot - 3) half -= (y - (foot - 3)) * 1.6;
    for (let x = 0; x < VW; x++) {
      const jag = (hash2(x >> 2, y >> 1, 3) % 3) - 1;
      const rel = (x + 0.5 - VCX) / (half + jag * 0.6);
      if (Math.abs(rel) > 1) continue;
      let c = rel < -0.62 ? "b" : rel < -0.05 ? "c" : rel < 0.6 ? "d" : "e";
      // soft dithered seams between bands
      const n = hash2(x, y, 9) % 100;
      if (c === "c" && rel < -0.5 && n < 35) c = "b";
      if (c === "d" && rel < 0.07 && n < 35) c = "c";
      if (c === "e" && rel < 0.7 && n < 35) c = "d";
      // pitted texture: dark pocks with a lit rim above
      const p = hash2(x, y, 21) % 100;
      if (p < 5) c = c === "b" ? "c" : c === "c" ? "d" : "e";
      else if (p > 96 && rel < 0.3) c = c === "e" ? "d" : c === "d" ? "c" : "b";
      g[y][x] = c;
    }
    // gullies / ridges radiating from the crater
    if (t > 0.06) {
      [-0.82, -0.55, -0.3, 0.22, 0.46, 0.74].forEach((r, k) => {
        const xr = Math.round(VCX + r * half + 1.6 * Math.sin(y * 0.23 + k * 1.7));
        const here = at(g, xr, y);
        if (here === ".") return;
        const dark = here === "b" ? "c" : here === "c" ? "d" : "e";
        put(g, xr, y, dark);
        if (at(g, xr - 1, y) !== ".") put(g, xr - 1, y, here === "e" ? "d" : here === "d" ? "c" : "a");
      });
    }
  }
  // boulders and ledges on the slopes
  const rockBlobs: [number, number, number, number][] = [
    [26, 82, 5, 3.5], [42, 68, 4, 3], [112, 74, 5, 3.5], [124, 88, 6, 4], [16, 90, 5, 3], [100, 60, 3.5, 2.5],
    [56, 86, 3, 2], [92, 84, 3.5, 2.5], [34, 56, 2.5, 2]
  ];
  for (const [bx, by, rx, ry] of rockBlobs) blobs(g, [{ x: bx, y: by, rx, ry }], "abce", { crease: false });
  // dried lava streaks (dark red) on the flank
  for (const [x0, y0, len] of [[48, 54, 20], [96, 56, 22], [36, 74, 12]] as const) {
    for (let k = 0; k < len; k++) {
      const x = Math.round(x0 + Math.sin(k * 0.4) * 1.5 + (x0 < VCX ? -k * 0.3 : k * 0.3));
      put(g, x, y0 + k, "K");
      if (k % 5 === 2) put(g, x + 1, y0 + k, "E");
    }
  }
  // ── crater: rim ring, dark inner wall, lava pool
  const cy = RIM + 3;
  ellipse(g, VCX, cy, 27, 8, "b");
  // jagged rim teeth
  for (const [tx, w] of [[-18, 3], [-9, 4], [3, 3], [14, 4], [21, 2]] as const) {
    const x0 = Math.round(VCX + tx);
    for (let k = 0; k < w; k++) {
      const yTop = Math.round(cy - 8 * Math.sqrt(Math.max(0, 1 - ((x0 + k + 0.5 - VCX) / 27) ** 2)));
      put(g, x0 + k, yTop - 1, "b");
      if (k > 0 && k < w - 1) put(g, x0 + k, yTop - 2, "b");
    }
  }
  for (let y = cy - 11; y <= cy + 10; y++) for (let x = 0; x < VW; x++) {
    if (at(g, x, y) !== "b" || y > cy + 8) continue;
    const nx = (x + 0.5 - VCX) / 27, ny = (y + 0.5 - cy) / 8;
    if (nx * nx + ny * ny > 1.25) continue;
    const lit = -(nx * 0.6 + ny * 0.8);
    g[y][x] = lit > 0.35 ? "a" : lit > -0.3 ? "b" : "c";
  }
  ellipse(g, VCX, cy + 0.5, 22, 5.5, "e");
  for (let y = cy - 7; y <= cy + 7; y++) for (let x = 0; x < VW; x++) {
    if (at(g, x, y) !== "e") continue;
    const nx = (x + 0.5 - VCX) / 22, ny = (y + 0.5 - cy - 0.5) / 5.5;
    if (nx * nx + ny * ny > 1) continue;
    if (ny < -0.55) g[y][x] = "d";
    else if (ny > -0.05) g[y][x] = "K";
  }
  // lava pool
  const py = cy + 2;
  ellipse(g, VCX, py, 17, 3.2, "O");
  for (let y = py - 5; y <= py + 5; y++) for (let x = 0; x < VW; x++) {
    if (at(g, x, y) !== "O") continue;
    const nx = (x + 0.5 - VCX) / 17, ny = (y + 0.5 - py) / 3.2;
    const r2 = nx * nx + ny * ny;
    if (r2 > 1) continue;
    if (r2 > 0.72) g[y][x] = ny < 0 ? "Y" : "D";
    else if ((hash2(x >> 1, y, f % 2) % 100) < 9) g[y][x] = "Y";
  }
  // bubbles (move between frames)
  const bub: [number, number][][] = [
    [[63, py - 1], [82, py + 1]], [[67, py], [78, py - 1]], [[73, py + 1], [60, py]], [[84, py - 1], [69, py - 1]],
  ];
  for (const [bx, by] of bub[f]) {
    stamp(g, bx - 1, by - 1, [".Y.", "YLY", ".D."]);
  }
  put(g, Math.round(VCX) + ((f * 7) % 15) - 7, py - 2, "L");
  // ── cascade: notch in the front rim + lava pouring down the face
  const top = cy + 5;
  for (let y = top; y < VH; y++) {
    const t2 = (y - top) / (VH - 1 - top);
    const xc = VCX - 0.5 + 3 * Math.sin(t2 * 5) * (1 - t2);
    const hw = 3 + 4 * t2 + (t2 > 0.78 ? (t2 - 0.78) * 42 : 0);
    for (let x = Math.floor(xc - hw - 1); x <= Math.ceil(xc + hw + 1); x++) {
      const d = Math.abs(x + 0.5 - xc);
      if (d > hw + 0.5) continue;
      let c: string;
      if (d > hw - 0.5) c = y > VH - 6 ? "D" : "E";
      else if (d > hw - 1.5) c = "D";
      else {
        const ph = (y - f * 3 + (hash2(x, 0, 5) % 12) + 120) % 12;
        c = ph === 0 ? "Y" : ph === 1 ? (hash2(x, y, 2) % 3 === 0 ? "L" : "Y") : ph === 6 && d < 2 ? "Y" : "O";
      }
      put(g, x, y, c);
    }
  }
  // embers flicking off the cascade
  for (let k = 0; k < 7; k++) {
    const yy = top + 6 + ((k * 9 + f * 4) % 40);
    const side = k % 2 ? 1 : -1;
    const xx = Math.round(VCX + side * (6 + (k % 3) * 2 + (yy - top) * 0.08));
    if (at(g, xx, yy) !== "." && !isLavaCh(at(g, xx, yy))) put(g, xx, yy, k % 3 ? "O" : "Y");
  }
  // glowing rim lip at the notch
  for (let x = Math.round(VCX) - 5; x <= Math.round(VCX) + 4; x++) put(g, x, top - 1, "D");
  // outline the cone (not the lava, so it flows straight into the river)
  outlineWith(g, (c) => "abcde".includes(c) || c === "K", "z");
  // ── smoke plume (rises & drifts right, loops every 4 frames)
  const puffs: { x: number; y: number; rx: number; ry: number }[] = [];
  for (let k = 0; k < 6; k++) {
    const yk = RIM - 2 - 12 * k - 3 * f;
    if (yk < -14) continue;
    const up = RIM - yk;
    const xk = VCX - 4 + up * 0.7;
    const rk = 6 + up * 0.22;
    puffs.push({ x: xk, y: yk, rx: rk, ry: rk * 0.8 });
    puffs.push({ x: xk + rk * 0.9, y: yk + 3, rx: rk * 0.7, ry: rk * 0.55 });
    if (k > 1) puffs.push({ x: xk - rk * 0.8, y: yk + 2, rx: rk * 0.6, ry: rk * 0.5 });
  }
  const sg = blank(VW, VH);
  blobs(sg, puffs, "wWvV");
  for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
    if (sg[y][x] !== "." && (y < RIM - 2 || at(g, x, y) === "." || at(g, x, y) === "z")) g[y][x] = sg[y][x];
  }
  outlineWith(g, (c) => "wWvV".includes(c), "Z");
  return rowsOf(g);
}
export const VOLCANO = defineProp({
  frames: [0, 1, 2, 3].map(volcanoFrame),
  fps: 4,
  outline: false,
  pal: { ...CONE, ...LAVA, ...SMOKE, z: "#1c1620", Z: "#5c5466" },
  solid: { x: 8, y: 52, w: 130, h: 42 },
});

// ════════════════════════════════════════════════════════════════════════════
// Steam & smoke puffs
// ════════════════════════════════════════════════════════════════════════════
function puffFrame(W: number, H: number, f: number, n: number, seed: number): string[] {
  const g = blank(W, H);
  const list: { x: number; y: number; rx: number; ry: number }[] = [];
  for (let k = 0; k < n; k++) {
    const y = H - 4 - 7 * k - (7 * f) / 4;
    const x = W / 2 + Math.sin(k * 1.9 + seed + f * 0.5) * (1.5 + k);
    const r = 1.6 + k * 0.8;
    if (y + r < 1) continue;
    list.push({ x, y, rx: r, ry: r * 0.85 });
  }
  blobs(g, list, "wWWv");
  outlineWith(g, (c) => c !== "o", "o");
  return rowsOf(g);
}
/** Hot-spring vapour: two sinuous wisps that rise and break up. */
function steamFrame(W: number, H: number, f: number, seed: number): string[] {
  const g = blank(W, H);
  for (let k = 0; k < 2; k++) {
    const x0 = W / 2 - 4 + k * 6;
    for (let y = H - 1; y >= 0; y--) {
      const up = H - 1 - y;
      if ((up + f * 2 + k * 3) % 8 >= 6) continue; // gaps travel upwards
      if (up > H - 4 && k === 1) continue;
      const x = Math.round(x0 + Math.sin(up * 0.45 - f * 1.57 + k * 2 + seed) * (1 + up * 0.12));
      const c = up < H * 0.45 ? "w" : up < H * 0.8 ? "W" : "v";
      put(g, x - 1, y, "v");
      put(g, x, y, c);
      if (up < H * 0.8) put(g, x + 1, y, up < H * 0.5 ? "w" : "W");
      if (up < H * 0.55) put(g, x + 2, y, "v");
    }
  }
  return rowsOf(g);
}
export const STEAM = defineProp({
  frames: [0, 1, 2, 3].map((f) => steamFrame(16, 26, f, 0)),
  fps: 4,
  outline: false,
  pal: { w: "#ffffff", W: "#e4f0f8", v: "#b8d0e0" },
  solid: null,
});
export const STEAM_B = defineProp({
  frames: [2, 3, 0, 1].map((f) => steamFrame(16, 20, f, 2)),
  fps: 4,
  outline: false,
  pal: { w: "#ffffff", W: "#e4f0f8", v: "#b8d0e0" },
  solid: null,
});

// ── Fumarole: sulfur-crusted vent with a grey smoke puff ─────────────────────
function fumaroleFrame(f: number): string[] {
  const W = 20, H = 32;
  const g = blank(W, H);
  const smoke = puffFrame(14, 22, f, 3, 1);
  stamp(g, 3, 0, smoke.map((r) => r.replace(/o/g, "q").replace(/w/g, "s").replace(/W/g, "S").replace(/v/g, "p")));
  blobs(g, [{ x: 5, y: 27, rx: 5, ry: 4 }, { x: 15, y: 27.5, rx: 5, ry: 3.6 }, { x: 10, y: 25.5, rx: 6, ry: 4.5 }], "abcd");
  ellipse(g, 10, 23.5, 3, 1.4, "y");
  ellipse(g, 10, 23.8, 2, 0.9, "k");
  put(g, 6, 24, "y"); put(g, 14, 25, "Y"); put(g, 7, 26, "Y"); put(g, 13, 23, "y");
  return rowsOf(g);
}
export const FUMAROLE = defineProp({
  frames: [0, 1, 2, 3].map(fumaroleFrame),
  fps: 3,
  pal: { ...ROCK, s: "#e8e4e8", S: "#c4bcc8", p: "#9c94a4", q: "#6c6476", y: "#f8e848", Y: "#c8b030", k: "#1c1620" },
  solid: { x: 1, y: 22, w: 20, h: 10 },
});

// ════════════════════════════════════════════════════════════════════════════
// Geyser — sinter mound that erupts every few seconds.
// ════════════════════════════════════════════════════════════════════════════
function geyserFrame(stage: number): string[] {
  const W = 28, H = 60;
  const g = blank(W, H);
  const hole = 53;
  blobs(g, [{ x: 14, y: 55.5, rx: 13.5, ry: 4.5 }], "pPqr", { crease: false });
  for (let x = 2; x < 26; x += 5) put(g, x + (x % 3), 57, "r");
  ellipse(g, 14, hole + 0.5, 5, 1.8, "o");
  ellipse(g, 14, hole + 0.5, 3.5, 1.2, "k");
  const hts = [0, 0, 22, 44, 46, 28];
  const h = hts[stage];
  if (stage === 0) {
    stamp(g, 12, hole - 5, ["..W.", ".W..", "..W.", ".W.."]);
  }
  if (stage === 1) {
    stamp(g, 9, hole - 4, ["..www.", ".wbbbw", "wbbccb", ".bcccb"]);
    put(g, 7, hole - 6, "b"); put(g, 20, hole - 5, "b");
  }
  if (h > 0) {
    for (let y = hole - h; y <= hole; y++) {
      const tt = (hole - y) / h;
      const hw = 2.5 + (1 - tt) * 1.5 + Math.sin(y * 0.9 + stage) * 0.6;
      for (let x = Math.floor(14 - hw); x <= Math.ceil(14 + hw); x++) {
        const d = (x + 0.5 - 14) / hw;
        if (Math.abs(d) > 1) continue;
        const c = d < -0.45 ? "w" : d < 0.3 ? ((y + stage) % 5 === 0 ? "w" : "b") : "c";
        put(g, x, y, c);
      }
    }
    // spray crown
    const ty = hole - h;
    blobs(g, [
      { x: 14, y: ty + 1, rx: 6, ry: 4 },
      { x: 9, y: ty + 4, rx: 4, ry: 3 },
      { x: 19, y: ty + 4, rx: 4, ry: 3 },
    ], "wbcd", { crease: false });
    // droplets falling off the crown
    const drops = stage === 4 ? [[4, 8], [23, 11], [6, 18], [22, 22], [3, 28], [25, 31]] :
      stage === 5 ? [[5, 6], [22, 8], [4, 14], [24, 16]] : [[6, 6], [21, 7]];
    for (const [dx, dy] of drops) { put(g, dx, ty + dy, "b"); put(g, dx, ty + dy + 1, "c"); }
    // splash on the mound
    if (stage >= 3) stamp(g, 5, hole - 2, ["b.........b.....b", ".c.....b.....c..."]);
  }
  return rowsOf(g);
}
export const GEYSER = defineProp({
  frames: [0, 0, 0, 0, 1, 1, 2, 3, 4, 3, 4, 5, 1].map(geyserFrame),
  fps: 4,
  pal: {
    w: "#ffffff", b: "#c8f0ff", c: "#80d0f0", d: "#58a8d8", W: "#e4f0f8",
    p: "#fff4e0", P: "#ecd8bc", q: "#d0b490", r: "#a88c6c", o: "#e89850", k: "#2c3448",
  },
  solid: { x: 2, y: 51, w: 26, h: 10 },
});

// ════════════════════════════════════════════════════════════════════════════
// Rocks, crystals, obsidian
// ════════════════════════════════════════════════════════════════════════════
function lavaRockFrame(f: number, big: boolean): string[] {
  const W = big ? 26 : 18, H = big ? 18 : 13;
  const g = blank(W, H);
  if (big) {
    blobs(g, [{ x: 9, y: 10, rx: 8.5, ry: 7 }, { x: 18, y: 11.5, rx: 7, ry: 5.5 }], "abcd");
    line(g, 4, 9, 8, 12, "O"); line(g, 8, 12, 13, 11, "O"); line(g, 13, 11, 16, 14, "O"); line(g, 9, 5, 8, 12, "O");
    line(g, 18, 9, 22, 13, "O");
  } else {
    blobs(g, [{ x: 9, y: 7.5, rx: 8.5, ry: 5.5 }], "abcd");
    line(g, 4, 6, 8, 9, "O"); line(g, 8, 9, 13, 7, "O"); line(g, 8, 9, 9, 11, "O");
  }
  // inner glow alternates
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x] === "O" && (x + y + f) % 3 === 0) g[y][x] = "Y";
  }
  return rowsOf(g);
}
export const LAVA_ROCK = defineProp({
  frames: [0, 1, 2].map((f) => lavaRockFrame(f, true)),
  fps: 3,
  pal: { ...ROCK, ...LAVA },
  solid: { x: 1, y: 7, w: 26, h: 12 },
});
export const LAVA_ROCK_S = defineProp({
  frames: [0, 1, 2].map((f) => lavaRockFrame(f, false)),
  fps: 2.5,
  pal: { ...ROCK, ...LAVA },
  solid: { x: 1, y: 5, w: 18, h: 9 },
});
export const BOULDER = defineProp({
  rows: (() => {
    const g = blank(22, 15);
    blobs(g, [{ x: 8, y: 8.5, rx: 7.5, ry: 6 }, { x: 15.5, y: 10, rx: 6, ry: 4.5 }], "abcd");
    put(g, 6, 5, "a"); put(g, 7, 5, "a"); put(g, 12, 11, "e"); put(g, 13, 12, "e");
    return rowsOf(g);
  })(),
  pal: ROCK,
  solid: { x: 1, y: 6, w: 22, h: 10 },
});

/** One prism crystal: pointed top, lit left face. */
function crystal(g: CharGrid, x: number, base: number, h: number, w: number, lean: number) {
  for (let yy = 0; yy < h; yy++) {
    const y = base - yy;
    const off = Math.round(lean * yy / h);
    const tip = h - yy; // rows from the top
    const ww = tip <= 1 ? 1 : tip <= 3 ? Math.min(w, tip + 0) : w;
    const x0 = x + off - Math.floor(ww / 2);
    for (let k = 0; k < ww; k++) {
      const c = k === 0 ? "a" : k < Math.ceil(ww / 2) ? "b" : k === ww - 1 ? "d" : "c";
      put(g, x0 + k, y, c);
    }
  }
}
export const FIRE_CRYSTALS = defineProp({
  rows: (() => {
    const g = blank(20, 20);
    crystal(g, 6, 17, 10, 4, -3);
    crystal(g, 14, 17, 11, 4, 3);
    crystal(g, 10, 18, 16, 5, 0);
    crystal(g, 4, 18, 6, 3, -2);
    crystal(g, 16, 18, 6, 3, 2);
    blobs(g, [{ x: 10, y: 18, rx: 9, ry: 2.2 }], "mmnn", { crease: false });
    put(g, 9, 6, "w"); put(g, 9, 7, "w"); put(g, 13, 11, "w");
    return rowsOf(g);
  })(),
  pal: { a: "#ffe0b0", b: "#f89850", c: "#e05830", d: "#a03028", w: "#ffffff", m: "#5a4e58", n: "#3c3440" },
  solid: { x: 2, y: 14, w: 18, h: 8 },
});
export const OBSIDIAN = defineProp({
  rows: (() => {
    const g = blank(20, 17);
    crystal(g, 6, 15, 9, 5, -2);
    crystal(g, 13, 15, 13, 5, 2);
    crystal(g, 9, 16, 6, 4, 0);
    crystal(g, 16, 16, 5, 3, 2);
    blobs(g, [{ x: 10, y: 15.5, rx: 9, ry: 2 }], "mmnn", { crease: false });
    put(g, 12, 5, "w"); put(g, 5, 9, "w");
    return rowsOf(g);
  })(),
  pal: { a: "#a898d8", b: "#504470", c: "#342c4c", d: "#201a30", w: "#e8e0ff", m: "#5a4e58", n: "#3c3440" },
  solid: { x: 2, y: 11, w: 18, h: 8 },
});

/** Charred dead tree with glowing ember tips. */
function charredFrame(f: number): string[] {
  const g = blank(22, 32);
  for (let y = 10; y < 31; y++) {
    const spread = y > 27 ? y - 27 : 0;
    for (let x = 9 - spread; x <= 12 + spread; x++) put(g, x, y, x <= 9 - spread + 1 ? "b" : x >= 12 ? "d" : "c");
  }
  line(g, 10, 14, 3, 6, "c"); line(g, 4, 7, 2, 2, "c"); line(g, 6, 9, 7, 4, "c");
  line(g, 11, 12, 18, 5, "d"); line(g, 17, 6, 19, 1, "d"); line(g, 15, 8, 14, 3, "d");
  line(g, 11, 10, 11, 1, "c"); put(g, 10, 4, "b");
  put(g, 10, 20, "e"); put(g, 11, 21, "e"); put(g, 10, 24, "O");
  const tips: [number, number][] = [[2, 2], [7, 4], [19, 1], [14, 3], [11, 1]];
  tips.forEach(([x, y], i) => put(g, x, y, (i + f) % 3 === 0 ? "Y" : "O"));
  return rowsOf(g);
}
export const CHARRED_TREE = defineProp({
  frames: [0, 1, 2].map(charredFrame),
  fps: 2,
  pal: { b: "#5c5058", c: "#3e343e", d: "#2a222c", e: "#1c161e", O: "#f87828", Y: "#f8d848" },
  solid: { x: 7, y: 26, w: 9, h: 7 },
});

// ════════════════════════════════════════════════════════════════════════════
// Fossils, bones, dinosaur nest
// ════════════════════════════════════════════════════════════════════════════
const BONE = { a: "#fffaf0", b: "#ece0c4", c: "#c8b494", d: "#988462", k: "#4a3c30", m: "#b4b0ac", M: "#8c8888", n: "#6c6868" };

export const AMMONITE = defineProp({
  rows: [
    "....mmmmmmm....",
    "..mmMMMMMMMmm..",
    ".mMMbbbbbbMMMm.",
    "mMMbccccccbbMMm",
    "mMbcbbbbbbcbMMm",
    "mMbcbccccbcbMMm",
    "mMbcbcbbcbcbMMm",
    "mMbcbccbcbcbMMm",
    "mMbcbbbbcbcbMMm",
    "mMMbccccbcbMMm.",
    ".mMMbbbbcbMMm..",
    "..mmMMMMMMmm...",
    "....mmmmmm.....",
  ],
  pal: BONE,
  flat: true,
});

export const TRILOBITE = defineProp({
  rows: [
    "...mmmmmmm...",
    "..mMMbbbMMm..",
    ".mMbbcccbbMm.",
    ".mMbcbbbcbMm.",
    ".mMbccbccbMm.",
    ".mMbcbcbcbMm.",
    ".mMbccbccbMm.",
    ".mMbcbcbcbMm.",
    ".mMMbcbcbMMm.",
    "..mMMbcbMMm..",
    "...mmMbMmm...",
    ".....mmm.....",
  ],
  pal: BONE,
  flat: true,
});

export const DINO_SKULL = defineProp({
  rows: (() => {
    const g = blank(30, 17);
    blobs(g, [{ x: 20, y: 7, rx: 7.5, ry: 5.5 }, { x: 10, y: 9, rx: 8.5, ry: 3.6 }], "abcd", { crease: false });
    stamp(g, 19, 0, ["..a", ".ab", "abc"]); // brow horn
    stamp(g, 4, 4, [".a", "ab"]); // nose horn
    ellipse(g, 21, 6.5, 2.3, 2, "k");
    put(g, 20, 5, "c");
    ellipse(g, 4.5, 8, 1, 0.8, "k");
    for (let x = 3; x < 15; x += 2) { put(g, x, 12, "a"); put(g, x + 1, 12, "d"); }
    line(g, 3, 11, 16, 11, "d");
    // half-buried in an ash mound
    blobs(g, [{ x: 15, y: 15.5, rx: 14.5, ry: 3.2 }], "mmMn", { crease: false });
    put(g, 8, 13, "m"); put(g, 22, 13, "m"); put(g, 23, 13, "m");
    return rowsOf(g);
  })(),
  pal: BONE,
  solid: { x: 2, y: 8, w: 28, h: 10 },
});

export const RIBCAGE = defineProp({
  rows: (() => {
    const g = blank(32, 20);
    blobs(g, [{ x: 16, y: 18, rx: 15.5, ry: 2.6 }], "mmMn", { crease: false });
    // spine
    for (let x = 2; x < 30; x++) { put(g, x, 3, "b"); put(g, x, 2, x % 3 === 0 ? "a" : "b"); put(g, x, 4, "c"); }
    for (let x = 3; x < 30; x += 3) put(g, x, 1, "b");
    // ribs (arcs into the ground)
    for (let i = 0; i < 6; i++) {
      const x0 = 5 + i * 4;
      for (let yy = 5; yy < 17; yy++) {
        const k = (yy - 5) / 12;
        const x = Math.round(x0 - 3 * Math.sin(k * 2.6) + k * 1.5);
        put(g, x, yy, "b");
        put(g, x + 1, yy, "c");
        if (yy < 8) put(g, x - 1, yy, "a");
      }
    }
    // tail vertebrae trailing off
    stamp(g, 0, 4, ["b.", "cb"]);
    return rowsOf(g);
  })(),
  pal: BONE,
  solid: { x: 1, y: 12, w: 32, h: 9 },
});

export const BONES = defineProp({
  rows: [
    "ab.........ab..",
    "bbc.......abbc.",
    ".bcbbbbbbbbbc..",
    ".abccccccccdbc.",
    "abc.......dbcd.",
    ".cd........cd..",
  ],
  pal: BONE,
  flat: true,
});

export const DINO_NEST = defineProp({
  rows: (() => {
    const g = blank(34, 22);
    blobs(g, [{ x: 17, y: 16, rx: 16.5, ry: 5.5 }], "tuUT", { crease: false });
    ellipse(g, 17, 14.5, 12, 3.2, "T");
    // twig texture
    for (let k = 0; k < 26; k++) {
      const x = 2 + ((k * 13) % 30), y = 13 + ((k * 7) % 8);
      if (g[y][x] === "u" || g[y][x] === "t") { put(g, x, y, k % 2 ? "t" : "U"); put(g, x + 1, y, k % 2 ? "U" : "t"); }
    }
    // eggs
    const eggs: [number, number, string][] = [[11, 10, "e"], [17, 9, "q"], [23, 10.5, "e"], [14, 13, "q"], [20, 13.5, "e"]];
    for (const [ex, ey, kind] of eggs) {
      const l = kind === "e" ? "e" : "q", m = kind === "e" ? "E" : "Q", s = kind === "e" ? "o" : "p";
      blobs(g, [{ x: ex, y: ey, rx: 2.6, ry: 3.4 }], `${l}${l}${m}${m}`, { crease: false, hi: 0.6 });
      put(g, Math.round(ex) - 1, Math.round(ey) - 2, "w");
      put(g, Math.round(ex) + 1, Math.round(ey), s);
      put(g, Math.round(ex) - 1, Math.round(ey) + 1, s);
      put(g, Math.round(ex), Math.round(ey) - 1, s);
    }
    // a cracked one
    line(g, 16, 8, 17, 9, "k"); line(g, 17, 9, 16, 10, "k"); put(g, 18, 8, "k");
    // straw sticking out in front
    for (const x of [4, 9, 14, 20, 25, 30]) { put(g, x, 20, "t"); put(g, x + 1, 19, "u"); }
    return rowsOf(g);
  })(),
  pal: {
    t: "#e8c070", u: "#c09048", U: "#8c6430", T: "#5c3c20",
    e: "#fff0d0", E: "#e0b880", o: "#d86028", q: "#c8ecf4", Q: "#70b0cc", p: "#7c4c30", w: "#ffffff", k: "#5a3c28",
  },
  solid: { x: 2, y: 12, w: 32, h: 11 },
});

// ════════════════════════════════════════════════════════════════════════════
// Prehistoric plants
// ════════════════════════════════════════════════════════════════════════════
function frond(g: CharGrid, cx: number, cy: number, dx: number, dy: number, L: number, droop: number) {
  for (let s = 0; s <= L; s += 0.5) {
    const t = s / L;
    const x = Math.round(cx + dx * s);
    const y = Math.round(cy + dy * s + droop * t * t * L * 0.5);
    put(g, x, y - 1, "a");
    put(g, x, y, "b");
    if (Math.round(s * 2) % 3 !== 0) {
      put(g, x, y + 1, "c");
      if (t > 0.15 && t < 0.9) put(g, x, y + 2, "d");
    }
  }
}
/** Serrated fern frond (cleaner than individual leaflets at this scale). */
function fernFrond(g: CharGrid, cx: number, cy: number, dx: number, dy: number, L: number, droop: number) {
  for (let s = 0; s <= L; s += 0.5) {
    const t = s / L;
    const x = Math.round(cx + dx * s);
    const y = Math.round(cy + dy * s + droop * t * t * L * 0.5);
    const i = Math.round(s * 2);
    if (i % 4 !== 0 || t > 0.85) put(g, x, y - 1, "a");
    put(g, x, y, t < 0.5 ? "m" : "b");
    put(g, x, y + 1, "c");
    if (t > 0.1 && t < 0.88) {
      put(g, x, y + 2, i % 3 === 0 ? "c" : "d");
      if (i % 4 === 1 && t < 0.7) put(g, x, y + 3, "d");
    }
  }
}
function treeFernRows(lean: number): string[] {
  const W = 44, H = 42;
  const g = blank(W, H);
  const top = 14;
  for (let y = top; y < H; y++) {
    const tt = (H - y) / (H - top);
    const cx = Math.round(22 + lean * tt * 2);
    put(g, cx - 2, y, "u"); put(g, cx - 1, y, y % 2 ? "t" : "u");
    put(g, cx, y, "U"); put(g, cx + 1, y, "T");
    // shaggy leaf-base stubs
    if (y % 4 === 0) { put(g, cx - 3, y, "U"); put(g, cx - 2, y + 1, "T"); }
    if (y % 4 === 2) { put(g, cx + 2, y, "T"); put(g, cx + 1, y + 1, "U"); }
    if (y > H - 3) { put(g, cx - 3, y, "u"); put(g, cx + 2, y, "T"); }
  }
  const cx = 22 + lean * 2, cy = 13;
  const fr: [number, number, number, number][] = [
    [-1, -0.15, 19, 1.1], [1, -0.15, 19, 1.1], [-0.8, -0.65, 14, 1.0], [0.8, -0.65, 14, 1.0],
    [-0.6, 0.35, 12, 0.9], [0.6, 0.35, 12, 0.9], [-0.25, -1, 9, 0.6], [0.3, -1, 9, 0.6],
  ];
  for (const [dx, dy, L, dr] of fr) fernFrond(g, cx, cy, dx, dy, L, dr);
  // crown & fiddleheads (curled young fronds)
  stamp(g, Math.round(cx) - 2, cy - 1, [".mm.", "mUUm", ".mm."]);
  stamp(g, Math.round(cx) - 5, cy - 5, [".aa", "a.b", ".bb"]);
  stamp(g, Math.round(cx) + 3, cy - 6, ["aa.", "b.a", "bb."]);
  return rowsOf(g);
}
const FERN_PAL = { a: "#b8e878", b: "#74b848", c: "#4e9038", d: "#30682c", m: "#5c8c30", ...WOOD };
export const TREE_FERN = defineProp({ rows: treeFernRows(1), pal: FERN_PAL, solid: { x: 17, y: 36, w: 10, h: 8 } });
export const TREE_FERN_L = defineProp({ rows: flipRows(treeFernRows(1)), pal: FERN_PAL, solid: { x: 19, y: 36, w: 10, h: 8 } });

export const CYCAD = defineProp({
  rows: (() => {
    const g = blank(26, 24);
    // stout diamond-patterned trunk
    for (let y = 13; y < 23; y++) for (let x = 9; x < 17; x++) {
      put(g, x, y, (x + y) % 3 === 0 ? "T" : x < 11 ? "t" : x > 14 ? "U" : "u");
    }
    const cx = 13, cy = 12;
    for (const [dx, dy, L, dr] of [[-1, -0.1, 12, 0.7], [1, -0.1, 12, 0.7], [-0.7, -0.75, 9, 0.5], [0.7, -0.75, 9, 0.5], [-0.25, -1, 8, 0.2], [0.25, -1, 8, 0.2], [-0.8, 0.35, 9, 0.5], [0.8, 0.35, 9, 0.5]] as const) {
      frond(g, cx, cy, dx, dy, L, dr);
    }
    // seed cone
    stamp(g, 11, 9, [".oo.", "oOoO", "OoOo", ".OO."]);
    return rowsOf(g);
  })(),
  pal: { ...FERN_PAL, o: "#f8a040", O: "#c86828" },
  solid: { x: 8, y: 18, w: 12, h: 7 },
});

export const HORSETAIL = defineProp({
  rows: (() => {
    const g = blank(16, 17);
    for (const [x, h] of [[2, 9], [6, 14], [10, 11], [13, 7]] as const) {
      for (let k = 0; k < h; k++) {
        const y = 16 - k;
        const node = k % 3 === 2;
        put(g, x, y, node ? "D" : "b");
        put(g, x + 1, y, node ? "D" : "c");
        if (node && k > 2 && k < h - 2) { put(g, x - 1, y - 1, "c"); put(g, x + 2, y - 1, "d"); }
      }
      put(g, x, 16 - h, "o"); put(g, x + 1, 16 - h, "O"); put(g, x, 15 - h, "o");
    }
    return rowsOf(g);
  })(),
  outline: false,
  pal: { b: "#a0d060", c: "#5c9c3c", d: "#3a7030", D: "#2c5a28", o: "#d8b070", O: "#9c7840" },
  solid: null,
});

// ════════════════════════════════════════════════════════════════════════════
// Explorers' camp
// ════════════════════════════════════════════════════════════════════════════
function tentRows(): string[] {
  const W = 32, H = 26;
  const g = blank(W, H);
  const cx = 15.5;
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W; x++) {
    const d = x + 0.5 - cx;
    const back = y >= 1 && Math.abs(d) <= (y - 1) * 0.62 && y <= 19;
    const front = y >= 6 && Math.abs(d) <= (y - 6) * 0.78;
    if (front) {
      const edge = Math.abs(d) > (y - 6) * 0.78 - 1;
      g[y][x] = d < 0 ? (edge ? "a" : "b") : (edge ? "d" : "c");
    } else if (back) {
      g[y][x] = d < 0 ? "a" : "d";
    }
  }
  // ridge seam on the roof
  for (let y = 1; y < 7; y++) put(g, Math.floor(cx), y, "b");
  // door (open flap)
  for (let y = 12; y < H - 1; y++) {
    const hw = (y - 12) * 0.45;
    for (let x = Math.floor(cx - hw); x <= Math.ceil(cx + hw - 1); x++) put(g, x, y, y < 15 ? "K" : "k");
  }
  for (let y = 14; y < H - 1; y++) put(g, Math.round(cx + (y - 12) * 0.45), y, "b");
  // pole tip & guy ropes with pegs
  put(g, 15, 0, "p"); put(g, 16, 0, "p"); put(g, 15, 5, "p");
  line(g, 3, 19, 0, 24, "r"); line(g, 28, 19, 31, 24, "r");
  put(g, 0, 25, "p"); put(g, 31, 25, "p");
  // bottom hem
  for (let x = 0; x < W; x++) if (g[H - 2][x] === "b" || g[H - 2][x] === "a") g[H - 2][x] = "c";
  return rowsOf(g);
}
export const TENT_ORANGE = defineProp({
  rows: tentRows(),
  pal: { a: "#f8c080", b: "#f08838", c: "#c86020", d: "#8c3c18", k: "#3c2418", K: "#5c3820", p: "#7c5434", r: "#e8d8b0" },
  solid: { x: 2, y: 13, w: 30, h: 14 },
});
export const TENT_OLIVE = defineProp({
  rows: tentRows(),
  pal: { a: "#d0cc80", b: "#a4a450", c: "#7c7c34", d: "#545424", k: "#2c2c18", K: "#44441e", p: "#7c5434", r: "#e8d8b0" },
  solid: { x: 2, y: 13, w: 30, h: 14 },
});

function campfireFrame(f: number): string[] {
  const g = blank(20, 22);
  // logs
  line(g, 3, 19, 16, 15, "u"); line(g, 3, 18, 16, 14, "t");
  line(g, 4, 14, 16, 19, "U"); line(g, 4, 15, 16, 20, "u");
  // stone ring
  const stones: [number, number][] = [[1, 17], [4, 20], [9, 21], [14, 20], [18, 17], [17, 13], [2, 13]];
  for (const [x, y] of stones) stamp(g, x - 1, y - 1, ["ab", "bc"]);
  // flames
  const F = [
    ["....r.....", "...rY..r..", "..rYYr.rr.", "..rYLYrYr.", ".rYLLLYYr.", ".rYLLLLYr.", "..rYLLYr..", "...rrrr..."],
    ["......r...", "..r..rY...", ".rr.rYYr..", ".rYrYLYr..", ".rYYLLLYr.", ".rYLLLLYr.", "..rYLLYr..", "...rrrr..."],
    ["...r......", "...Yr..r..", "..rYYrrY..", ".rYLYYLYr.", ".rYLLLLYr.", ".rYLLLLYr.", "..rYLLYr..", "...rrrr..."],
  ];
  stamp(g, 5, 7, F[f]);
  // sparks
  const sp = [[[4, 4], [14, 2]], [[13, 5], [6, 1]], [[8, 3], [15, 6]]][f];
  for (const [x, y] of sp) put(g, x, y, "Y");
  return rowsOf(g);
}
export const CAMPFIRE = defineProp({
  frames: [0, 1, 2].map(campfireFrame),
  fps: 6,
  pal: { ...WOOD, a: "#c8c4c0", b: "#9c9894", c: "#6c6868", r: "#e84820", Y: "#f8c838", L: "#fff4b0" },
  solid: { x: 1, y: 13, w: 20, h: 9 },
});

export const MAP_TABLE = defineProp({
  rows: (() => {
    const W = 30, H = 20;
    const g = blank(W, H);
    // table top + front apron + legs
    rect(g, 0, 4, W, 8, "b");
    rect(g, 0, 4, W, 1, "a");
    rect(g, 0, 12, W, 2, "c");
    rect(g, 1, 14, 2, 6, "c"); rect(g, W - 3, 14, 2, 6, "d"); rect(g, 13, 14, 2, 4, "d");
    // unrolled map
    rect(g, 3, 3, 17, 8, "m");
    rect(g, 3, 3, 17, 1, "n"); rect(g, 3, 10, 17, 1, "N");
    put(g, 2, 3, "N"); put(g, 2, 10, "N"); put(g, 20, 3, "N"); put(g, 20, 10, "N");
    // island outline, volcano and route on the map
    line(g, 5, 8, 8, 5, "g"); line(g, 8, 5, 12, 5, "g"); line(g, 12, 5, 16, 7, "g"); line(g, 16, 7, 13, 9, "g"); line(g, 13, 9, 6, 9, "g");
    stamp(g, 10, 6, [".R.", "RRR"]);
    for (const [x, y] of [[6, 8], [7, 7], [9, 7]]) put(g, x, y, "R");
    stamp(g, 15, 5, ["R.R", ".R.", "R.R"]);
    // compass + mug + lantern
    stamp(g, 22, 4, [".kk.", "kwRk", "kRwk", ".kk."]);
    stamp(g, 26, 2, ["oo", "oO", "oO"]);
    stamp(g, 22, 9, ["ss", "SS"]);
    return rowsOf(g);
  })(),
  pal: {
    ...WOOD, a: "#e0b878", b: "#c09058", c: "#906838", d: "#6c4c28",
    m: "#f8ecc8", n: "#fff8e0", N: "#d8c8a0", g: "#6c9858", R: "#d83828", k: "#5c5c68", w: "#f0f0f8",
    o: "#e8e8f0", O: "#a8a8b8", s: "#f8d040", S: "#c89828",
  },
  solid: { x: 0, y: 6, w: 32, h: 16 },
});

export const JEEP = defineProp({
  rows: (() => {
    const W = 48, H = 30;
    const g = blank(W, H);
    // roll bar (behind)
    rect(g, 30, 4, 2, 10, "m"); rect(g, 30, 4, 11, 2, "m"); rect(g, 39, 4, 2, 10, "M");
    // body
    rect(g, 1, 12, 44, 10, "b");
    rect(g, 1, 12, 44, 1, "a");
    rect(g, 1, 20, 44, 2, "c");
    rect(g, 1, 13, 15, 1, "a"); // hood shine
    // cabin cut (seats visible)
    rect(g, 18, 10, 20, 3, "s"); rect(g, 22, 8, 4, 5, "s"); rect(g, 32, 8, 4, 5, "s");
    rect(g, 22, 8, 4, 1, "S"); rect(g, 32, 8, 4, 1, "S");
    // windshield frame
    line(g, 16, 12, 17, 4, "m"); line(g, 17, 12, 18, 4, "M");
    rect(g, 14, 4, 4, 1, "m");
    for (let y = 5; y < 12; y++) put(g, 16 - Math.floor((12 - y) / 8), y, "g");
    // stripe + door line
    rect(g, 1, 16, 44, 1, "o");
    line(g, 26, 13, 26, 20, "c");
    put(g, 23, 15, "k"); put(g, 24, 15, "k");
    // headlight, bumper
    rect(g, 0, 14, 2, 2, "y"); put(g, 0, 14, "Y");
    rect(g, 0, 20, 3, 2, "M");
    // wheel arches & wheels
    for (const wx of [10, 36]) {
      ellipse(g, wx, 22, 6.5, 5, "c");
      ellipse(g, wx, 23, 5, 5, "k");
      ellipse(g, wx, 23, 2.4, 2.4, "h");
      put(g, wx - 1, 22, "H");
    }
    // spare tire on the back
    ellipse(g, 46, 15, 2, 4, "k"); put(g, 46, 15, "h");
    // gear on the back seat
    stamp(g, 33, 9, ["ll", "LL"]);
    return rowsOf(g);
  })(),
  pal: {
    a: "#e8d8a0", b: "#c8b070", c: "#98844c", m: "#9c9ca8", M: "#6c6c78", s: "#6c4c30", S: "#8c6844",
    g: "#b8e0f0", o: "#e87830", k: "#2c2830", h: "#b8b8c0", H: "#e8e8f0", y: "#f8f0a0", Y: "#ffffff",
    l: "#e86830", L: "#a84020",
  },
  solid: { x: 1, y: 12, w: 48, h: 19 },
});

function crateArt(g: CharGrid, x: number, y: number, w: number, h: number) {
  rect(g, x, y, w, h, "b");
  rect(g, x, y, w, 1, "a"); rect(g, x, y, 1, h, "a");
  rect(g, x, y + h - 1, w, 1, "d"); rect(g, x + w - 1, y, 1, h, "d");
  for (let yy = y + 3; yy < y + h - 1; yy += 3) rect(g, x + 1, yy, w - 2, 1, "c");
  line(g, x + 1, y + 1, x + w - 2, y + h - 2, "c");
}
export const CRATES = defineProp({
  rows: (() => {
    const g = blank(26, 25);
    crateArt(g, 0, 12, 13, 12);
    crateArt(g, 13, 13, 12, 11);
    crateArt(g, 6, 1, 12, 11);
    // stencil marks
    stamp(g, 3, 15, ["oo", "o."]); stamp(g, 18, 16, ["o.o", ".o."]); stamp(g, 10, 4, ["ooo", ".o."]);
    return rowsOf(g);
  })(),
  pal: { a: "#e8c888", b: "#c89c58", c: "#9c7038", d: "#74502a", o: "#d84828" },
  solid: { x: 0, y: 13, w: 27, h: 13 },
});

export const BACKPACKS = defineProp({
  rows: [
    "..aabb.....",
    ".abbbbc.ff.",
    ".abbbbcfggh",
    ".akkkkcfggh",
    ".abbbbcfgkh",
    ".abbbbcfggh",
    "..cccc.hhh.",
  ],
  pal: { a: "#f8b070", b: "#e87830", c: "#a84820", k: "#5c3418", f: "#c8c880", g: "#9c9c4c", h: "#6c6c30" },
  solid: { x: 0, y: 3, w: 13, h: 6 },
});

function seismoFrame(f: number): string[] {
  const g = blank(22, 22);
  // stand
  rect(g, 2, 10, 18, 6, "b"); rect(g, 2, 10, 18, 1, "a"); rect(g, 2, 15, 18, 1, "c");
  rect(g, 3, 16, 2, 6, "c"); rect(g, 17, 16, 2, 6, "c");
  // drum with paper
  rect(g, 4, 3, 14, 7, "p"); rect(g, 4, 3, 14, 1, "P"); rect(g, 4, 9, 14, 1, "q");
  put(g, 3, 5, "m"); put(g, 3, 6, "m"); put(g, 18, 5, "m"); put(g, 18, 6, "m");
  // seismic trace (scrolls)
  const amp = [1, 2, 0, 2, 1, 0, 2, 1];
  for (let x = 0; x < 13; x++) {
    const v = amp[(x + f * 2) % 8];
    put(g, 5 + x, 6 + Math.round((x % 2 ? v : -v) * (x > 7 ? 1 : 0.5)), "r");
  }
  // needle arm
  line(g, 17, 1, 15, 6, "m"); put(g, 17, 0, "M"); put(g, 18, 1, "M");
  // dial & light
  stamp(g, 5, 11, ["kk", "kg"]); put(g, 9, 12, f % 2 ? "R" : "r"); put(g, 11, 12, "y");
  return rowsOf(g);
}
export const SEISMOGRAPH = defineProp({
  frames: [0, 1, 2, 3].map(seismoFrame),
  fps: 5,
  pal: {
    a: "#b8c0c8", b: "#8890a0", c: "#5c6474", p: "#fffcf0", P: "#ffffff", q: "#d8d4c8",
    r: "#e04030", R: "#ff8070", m: "#4c4c58", M: "#2c2c34", k: "#3c4048", g: "#78e078", y: "#f8d040",
  },
  solid: { x: 2, y: 12, w: 20, h: 11 },
});

/** Wooden post with a yellow triangle "!" warning sign. */
export const DANGER_SIGN = defineProp({
  rows: [
    "....kk....",
    "...kyyk...",
    "...kyyk...",
    "..kyrryk..",
    "..kyrryk..",
    ".kyyrryyk.",
    ".kyyyyyyk.",
    "kyyyrryyyk",
    "kkkkkkkkkk",
    "....tu....",
    "....tu....",
    "....tu....",
    "....tu....",
    "...ttuU...",
  ],
  pal: { y: "#f8d838", k: "#a07020", r: "#4a2a1c", ...WOOD },
  solid: { x: 3, y: 10, w: 6, h: 6 },
});

/** "PELIGRO" board on two posts. */
export const PELIGRO_SIGN = defineProp({
  rows: (() => {
    const label = "PELIGRO";
    const W = textWidth(label) + 6, H = 17;
    const g = blank(W, H);
    rect(g, 2, 9, 2, 8, "u"); rect(g, W - 4, 9, 2, 8, "U");
    rect(g, 0, 0, W, 10, "y");
    rect(g, 0, 0, W, 1, "Y"); rect(g, 0, 9, W, 1, "o");
    for (let x = 0; x < W; x += 4) { put(g, x, 1, "k"); put(g, x + 1, 1, "k"); put(g, x + 2, 8, "k"); put(g, x + 3, 8, "k"); }
    text(g, 3, 3, label, "k");
    return rowsOf(g);
  })(),
  pal: { y: "#f8d838", Y: "#fff090", o: "#c89820", k: "#3c2418", ...WOOD },
  solid: { x: 1, y: 10, w: 32, h: 8 },
});

/** Expedition flag (waves). */
function flagFrame(f: number): string[] {
  const g = blank(14, 24);
  rect(g, 1, 1, 1, 23, "m"); put(g, 1, 0, "y"); put(g, 2, 23, "M");
  const wave = [0, 1, 1, 0, -1, -1, 0, 1, 1, 0];
  for (let x = 0; x < 10; x++) {
    const o = wave[(x + f * 3) % 10];
    for (let y = 0; y < 7; y++) put(g, 2 + x, 2 + y + o, y === 0 ? "A" : y < 4 ? "a" : "b");
  }
  // emblem (volcano) on the flag
  const o3 = wave[(4 + f * 3) % 10];
  stamp(g, 5, 4 + o3, ["..w..", ".www.", "wwwww"]);
  return rowsOf(g);
}
export const EXPEDITION_FLAG = defineProp({
  frames: [0, 1, 2].map(flagFrame),
  fps: 4,
  pal: { m: "#8c8c98", M: "#5c5c68", y: "#f8d040", A: "#ffa868", a: "#f07830", b: "#c05020", w: "#fff4e0" },
  solid: { x: 0, y: 20, w: 5, h: 5 },
});

/** Rope-bridge anchor post (wood with rope wraps). */
export const BRIDGE_POST = defineProp({
  rows: [
    ".tu.",
    "rRrr",
    "tuuU",
    "tuuU",
    "rRrr",
    "tuuU",
    "tuuU",
    "tuuU",
    "tuuU",
  ],
  pal: { ...WOOD, r: "#e8d098", R: "#a88850" },
  solid: { x: 0, y: 6, w: 6, h: 5 },
});

/** Small cluster of smoking ember stones on a lava bank. */
export const EMBERS = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(14, 8);
    blobs(g, [{ x: 4, y: 5, rx: 3.5, ry: 2.5 }, { x: 10, y: 5.5, rx: 3.5, ry: 2.2 }], "bcde", { crease: false });
    put(g, 3, 5, f ? "Y" : "O"); put(g, 10, 6, f ? "O" : "Y"); put(g, 5, 6, "D"); put(g, 11, 4, "D");
    return rowsOf(g);
  }),
  fps: 2,
  pal: { ...ROCK, ...LAVA },
  solid: null,
  flat: true,
});

/** Wheelbarrow full of rock samples, with a pickaxe leaning on it. */
export const PICKAXE_CART = defineProp({
  rows: (() => {
    const g = blank(24, 16);
    // wheelbarrow with rock samples
    rect(g, 4, 6, 15, 5, "b"); rect(g, 4, 6, 15, 1, "a"); rect(g, 5, 10, 13, 1, "c");
    blobs(g, [{ x: 8, y: 5, rx: 2.5, ry: 2 }, { x: 13, y: 4.5, rx: 3, ry: 2.2 }, { x: 17, y: 5.5, rx: 2, ry: 1.6 }], "pqrs", { crease: false });
    put(g, 13, 4, "O"); put(g, 14, 5, "Y");
    line(g, 18, 9, 23, 13, "u"); line(g, 6, 11, 4, 15, "U");
    ellipse(g, 15, 13, 2.2, 2.2, "k"); put(g, 15, 13, "h");
    // pickaxe leaning
    line(g, 1, 14, 6, 2, "u"); stamp(g, 3, 0, ["mmmmm", "M...."]);
    return rowsOf(g);
  })(),
  pal: { ...WOOD, a: "#c8d0d8", b: "#8c98a8", c: "#5c6878", p: "#9a8a8e", q: "#76686e", r: "#5a4e58", s: "#443a46",
    O: "#f89830", Y: "#f8d848", k: "#2c2830", h: "#b8b8c0", m: "#c8c8d0", M: "#7c7c88" },
  solid: { x: 2, y: 8, w: 22, h: 9 },
});
