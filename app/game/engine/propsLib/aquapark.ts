// Water-park props: slides, diving board, pool floats, tiki snack bar,
// mushroom fountain, lifeguard chair…
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import type { Pal } from "../sprite";
import { ellipse, tube, bezier, line, BEACH_BALL } from "./beach";

// ── Slide tower + tube ───────────────────────────────────────────────────────
const TOWER_PAL = {
  m: "#f8f8ff", n: "#c0c8d8", o: "#8890a8", // white steel
  r: "#58a8f8", R: "#3070d0", q: "#a8d8ff", // roof (blue/white stripes)
  w: "#ffffff", W: "#d8e0f0",
  y: "#f8d040", Y: "#c89820",                // stairs
  p: "#e8dcc4", P: "#c8b898",                // platform floor
  s: "#a8f0ff", S: "#68d0f8", T: "#ffffff",  // splash
};

function drawTower(g: CharGrid, x: number, roofA: string, roofB: string) {
  // legs
  for (const lx of [x + 2, x + 23]) { rect(g, lx, 16, 3, 46, "n"); rect(g, lx, 16, 1, 46, "m"); rect(g, lx + 2, 16, 1, 46, "o"); }
  // zig-zag stairs
  for (let k = 0; k < 4; k++) {
    const y0 = 22 + k * 10;
    const fwd = k % 2 === 0;
    for (let i = 0; i < 18; i++) {
      const xx = x + 5 + (fwd ? i : 17 - i);
      const yy = y0 + Math.floor(i / 2.2);
      put(g, xx, yy, "y"); put(g, xx, yy + 1, "Y");
    }
  }
  // platform
  rect(g, x, 12, 28, 5, "p"); rect(g, x, 16, 28, 1, "P");
  rect(g, x, 11, 28, 1, "m");
  for (let i = 0; i < 28; i += 4) rect(g, x + i, 8, 1, 4, "n");
  rect(g, x, 8, 28, 1, "m");
  // roof
  for (let y = 0; y < 7; y++) {
    const inset = 6 - y;
    for (let xx = x - 1 + inset; xx < x + 29 - inset; xx++) {
      const s = ((xx - x + 40) >> 2) % 2;
      put(g, xx, y, s ? roofA : roofB);
    }
  }
  for (let xx = x - 1; xx < x + 29; xx++) put(g, xx, 7, ((xx - x + 40) >> 2) % 2 ? "R" : "W");
}

function slideRows(mirror: boolean, ramp: string, open: boolean): string[] {
  const W = 104, H = 70;
  const g = blank(W, H);
  const X = (x: number) => (mirror ? W - 1 - x : x);
  // tube path: leaves the platform, loops, lands bottom-right in the pool
  const raw: [number, number][] = [
    ...bezier([[26, 14], [62, 8], [70, 30], [46, 34]], 20),
    ...bezier([[46, 34], [24, 38], [34, 56], [60, 54]], 20).slice(1),
    ...bezier([[60, 54], [78, 52], [86, 56], [94, 62]], 12).slice(1),
  ];
  const pts = raw.map(([x, y]) => [X(x), y] as [number, number]);
  drawTower(g, mirror ? W - 29 : 1, "r", "w");
  // support poles under the tube
  for (const [px, py] of [pts[10], pts[24], pts[34]]) {
    rect(g, Math.round(px), Math.round(py) + 4, 2, 66 - Math.round(py) - 8, "n");
    put(g, Math.round(px) + 1, Math.round(py) + 4, "m");
  }
  tube(g, pts, 4.2, ramp);
  if (open) {
    // open half-pipe: water running down the middle
    pts.forEach(([x, y], i) => { if (i % 1 === 0) { put(g, Math.round(x), Math.round(y) - 1, "s"); put(g, Math.round(x) + 1, Math.round(y) - 1, i % 3 ? "S" : "s"); } });
  } else {
    // highlight track along the top of the tube
    for (let i = 2; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      line(g, Math.round(x0 - 1.5), Math.round(y0 - 2.5), Math.round(x1 - 1.5), Math.round(y1 - 2.5), ramp[0]);
    }
  }
  // exit mouth + splash
  const [ex, ey] = pts[pts.length - 1];
  ellipse(g, ex, ey + 1, 4, 3, () => "S");
  ellipse(g, ex, ey + 1, 2.5, 2, () => "s");
  for (const [dx, dy] of [[-6, 3], [5, 4], [-3, 6], [7, 0], [0, 7], [-7, -1]]) put(g, Math.round(ex + (mirror ? -dx : dx)), Math.round(ey + dy), "T");
  return rowsOf(g);
}

const slide = (mirror: boolean, ramp: string, pal: Pal, open: boolean) => defineProp({
  rows: slideRows(mirror, ramp, open),
  pal: { ...TOWER_PAL, ...pal },
  solid: mirror ? { x: 76, y: 54, w: 30, h: 16 } : { x: 1, y: 54, w: 30, h: 16 },
  baseY: 70,
});
export const SLIDE_YELLOW = slide(false, "abcd", { a: "#fff8a0", b: "#f8d838", c: "#e0a820", d: "#a87018" }, false);
export const SLIDE_RED = slide(true, "efgh", { e: "#ffa8a8", f: "#f05858", g: "#c83848", h: "#902434" }, true);

// ── Diving board (sticks down over the pool from the top edge) ───────────────
export const DIVING_BOARD = defineProp({
  rows: [
    "m..........m",
    "mn........nm",
    "mnooooooooom",
    "mn........nm",
    "mnooooooooom",
    "mn........nm",
    ".bbbbbbbbbb.",
    ".baaaaaaaab.",
    ".baaaaaaaab.",
    ".bcccccccc.",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..baaaaaab..",
    "..bccccccb..",
    "...dddddd...",
  ],
  pal: { m: "#c0c8d8", n: "#f0f4ff", o: "#8890a8", a: "#58b8f8", b: "#3888d8", c: "#2860a8", d: "#3890c8" },
  solid: { x: 0, y: 0, w: 14, h: 10 },
  baseY: 10,
});

export const POOL_LADDER = defineProp({
  rows: [
    ".mm....mm.",
    "m..m..m..m",
    "m..n..m..n",
    "n..n..n..n",
    "...nooo..n",
    "...n.....n",
    "...nooo..n",
    "...n.....n",
  ],
  pal: { m: "#ffffff", n: "#a8b0c8", o: "#d0d8e8" },
  solid: null,
});

// ── Floats (flat; they bob on the animated water) ────────────────────────────
function ringFrames(w: number, h: number, stripe: (a: number) => boolean): string[][] {
  return [0, 1].map((f) => {
    const g = blank(w, h + 1);
    ellipse(g, w / 2, h / 2 + f, w / 2, h / 2, (l, x, y, nx, ny) => {
      const r = Math.hypot(nx, ny);
      if (r < 0.45) return null;
      const a = Math.atan2(ny, nx);
      const lit = -(nx * 0.55 + ny * 0.85);
      const inner = r < 0.62;
      const lvl = inner ? (ny < 0 ? 2 : 0) : lit > 0.4 ? 0 : lit > -0.3 ? 1 : 2;
      return (stripe(a) ? "abc" : "wxy")[lvl];
    });
    return rowsOf(g);
  });
}
const ring = (pal: Pal, n = 4) => defineProp({
  frames: ringFrames(14, 11, (a) => Math.floor(((a + Math.PI) / (Math.PI * 2)) * n * 2) % 2 === 0),
  fps: 1.5,
  pal: { w: "#ffffff", x: "#e8e8f0", y: "#b8b8d0", ...pal },
  flat: true,
});
export const RING_RED = ring({ a: "#ff8080", b: "#f04848", c: "#b82838" });
export const RING_ORANGE = ring({ a: "#ffc070", b: "#f89030", c: "#c06018" }, 3);
const solidRing = (a: string, b: string, c: string) => defineProp({
  frames: ringFrames(14, 11, () => true),
  fps: 1.5,
  pal: { a, b, c, w: a, x: b, y: c },
  flat: true,
});
export const RING_PINK = solidRing("#ffc0e0", "#f888c0", "#c85890");
export const RING_GREEN = solidRing("#b8f8a0", "#68d868", "#38a048");

export const DUCK_FLOAT = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(18, 16);
    // ring body
    ellipse(g, 9, 10.5 + f * 0.5, 8.5, 5, (l, x, y, nx, ny) => (Math.hypot(nx, ny) < 0.48 ? null : "abcc"[l]));
    // head + beak
    ellipse(g, 13, 4.5 + f * 0.5, 3.5, 3.5, (l) => "abcc"[l]);
    stamp(g, 15, 4 + f, ["oo", "O."]);
    put(g, 13, 3 + f, "k");
    return rowsOf(g);
  }),
  fps: 1.5,
  pal: { a: "#fff8a8", b: "#f8e040", c: "#d0a820", o: "#f89838", O: "#c86820", k: "#202020" },
  flat: true,
});

export const MATTRESS = defineProp({
  frames: [0, 1].map((f) => {
    const rows: string[] = f ? ["............"] : [];
    for (let y = 0; y < 24; y++) {
      if (y === 0 || y === 23) rows.push(".bbbbbbbbbb.");
      else if (y < 5) rows.push(y === 4 ? "bccccccccccb" : "baaaaaaaaaac");
      else rows.push(y % 4 === 0 ? "bccccccccccc" : "baaaaaaaaaac");
    }
    return f ? rows : [...rows, "............"];
  }),
  fps: 1.2,
  pal: { a: "#ffb0d8", b: "#f878b8", c: "#d05898" },
  flat: true,
});
export const MATTRESS_BLUE = defineProp({ frames: MATTRESS.frames, fps: 1.2, flat: true, pal: { a: "#b0e8ff", b: "#60b8f8", c: "#3888d0" } });

export const FLOAT_BALL = defineProp({ rows: BEACH_BALL.rows, pal: BEACH_BALL.pal, flat: true });

// ── Mushroom fountain (kids' pool) ───────────────────────────────────────────
export const MUSHROOM_FOUNTAIN = defineProp({
  rows: (() => {
    const g = blank(30, 30);
    rect(g, 12, 12, 6, 14, "m"); rect(g, 12, 12, 2, 14, "n"); rect(g, 16, 12, 2, 14, "o");
    ellipse(g, 15, 8, 14, 8, (l, x, y, nx, ny) => (ny > 0.55 ? "c" : "abcd"[l]));
    for (const [x, y] of [[9, 5], [18, 3], [22, 8], [12, 10], [5, 9]]) stamp(g, x, y, ["ww", "wW"]);
    return rowsOf(g);
  })(),
  pal: { a: "#ff9090", b: "#f04848", c: "#b82838", d: "#882030", w: "#ffffff", W: "#e0d0d8", m: "#f8f0e0", n: "#ffffff", o: "#d8c8b0" },
  solid: null,
});
/** Water curtain falling from the mushroom cap (place at the same spot). */
export const MUSHROOM_SPRAY = defineProp({
  frames: [0, 1, 2].map((f) => {
    const g = blank(32, 32);
    for (let x = 3; x < 30; x += 3) {
      const len = 9 + ((x + f * 2) % 4);
      for (let y = 15; y < 15 + len; y++) {
        if (x > 11 && x < 20 && y < 26) continue;
        if ((y + f + x) % 4 !== 0) put(g, x, y, (y + f) % 3 ? "s" : "T");
      }
    }
    for (let x = 5; x < 28; x += 2) put(g, x, 28 + ((x + f) % 2), "T");
    return rowsOf(g);
  }),
  fps: 4,
  pal: { s: "#c8f8ff", T: "#ffffff" },
  outline: false,
  solid: null,
  baseY: 33,
});

// ── Floor water jets (animated) ──────────────────────────────────────────────
export const WATER_JET = defineProp({
  frames: [0, 1, 2, 3].map((f) => {
    const h = [8, 12, 14, 10][f];
    const g = blank(9, 16);
    for (let y = 15 - h; y < 15; y++) {
      put(g, 4, y, y < 15 - h + 2 ? "T" : "s");
      if (y > 15 - h + 2) put(g, 3, y, "S");
    }
    put(g, 2 + (f % 2), 15 - h + 1, "T"); put(g, 6 - (f % 2), 15 - h + 2, "T");
    rect(g, 2, 15, 5, 1, "o");
    return rowsOf(g);
  }),
  fps: 5,
  pal: { s: "#c8f8ff", S: "#80d8f8", T: "#ffffff", o: "#7888a0" },
  outline: false,
  solid: null,
});

// ── Lifeguard chair ──────────────────────────────────────────────────────────
export const LIFEGUARD_CHAIR = defineProp({
  rows: (() => {
    const g = blank(16, 32);
    rect(g, 2, 12, 2, 20, "m"); rect(g, 12, 12, 2, 20, "m");
    rect(g, 3, 12, 1, 20, "n"); rect(g, 13, 12, 1, 20, "n");
    for (let y = 16; y < 31; y += 4) rect(g, 4, y, 8, 1, "n");
    // seat + backrest
    rect(g, 1, 0, 14, 8, "r"); rect(g, 1, 0, 14, 1, "q"); rect(g, 13, 1, 2, 7, "R");
    rect(g, 3, 2, 10, 2, "w"); rect(g, 7, 1, 2, 4, "w");
    rect(g, 0, 8, 16, 4, "m"); rect(g, 0, 11, 16, 1, "n");
    return rowsOf(g);
  })(),
  pal: { m: "#ffffff", n: "#b0b8d0", r: "#f04848", R: "#b02838", q: "#ff8888", w: "#ffffff" },
  solid: { x: 1, y: 24, w: 16, h: 9 },
});

// ── Tiki snack bar ───────────────────────────────────────────────────────────
function tikiRows(): string[] {
  const W = 58, H = 50;
  const g = blank(W, H);
  // bamboo wall
  for (let x = 4; x < W - 4; x++) {
    const k = (x - 4) % 5;
    const c = k === 0 ? "u" : k === 4 ? "v" : k === 1 ? "s" : "t";
    for (let y = 22; y < 46; y++) g[y][x] = c;
  }
  for (let x = 4; x < W - 4; x++) { g[30][x] = "v"; g[40][x] = "v"; }
  // service window (dark interior) + counter
  rect(g, 10, 24, 38, 10, "k"); rect(g, 10, 24, 38, 2, "K");
  // bottles / cups inside
  const cols = ["r", "y", "g", "o", "p", "r", "y", "g"];
  cols.forEach((c, i) => { rect(g, 13 + i * 4, 28, 2, 4, c); put(g, 13 + i * 4, 27, c); });
  rect(g, 8, 34, 42, 3, "a"); rect(g, 8, 34, 42, 1, "A"); rect(g, 8, 36, 42, 1, "b");
  // menu board on the wall
  rect(g, 20, 39, 18, 6, "c"); rect(g, 21, 40, 16, 4, "C");
  rect(g, 22, 41, 6, 1, "w"); rect(g, 30, 41, 5, 1, "y"); rect(g, 22, 43, 4, 1, "y"); rect(g, 28, 43, 7, 1, "w");
  rect(g, 4, 46, W - 8, 3, "v"); rect(g, 4, 48, W - 8, 1, "x");
  // thatch roof: layered straw with a jagged fringe
  for (let y = 0; y < 22; y++) {
    const half = Math.min(W / 2, 10 + y * 1.6);
    for (let x = Math.ceil(W / 2 - half); x < W / 2 + half; x++) {
      const streak = (x * 7 + Math.floor(y / 3) * 3) % 5;
      const band = Math.floor(y / 5);
      let c = streak === 0 ? "h" : streak === 3 ? "j" : "i";
      if (y % 5 === 4) c = "j";
      if (x < W / 2 - half + 2) c = "h";
      if (x > W / 2 + half - 3) c = "j";
      if (band === 0 && y < 2) c = "h";
      g[y][x] = c;
    }
  }
  // fringe
  for (let x = 0; x < W; x++) {
    const d = (x * 5) % 3;
    for (let y = 22; y < 23 + d; y++) g[y][x] = "j";
    if (x % 3 === 1) g[22 + d][x] = "l";
  }
  // little flag
  rect(g, 28, 0, 1, 1, "v");
  return rowsOf(g);
}
export const TIKI_BAR = defineProp({
  rows: tikiRows(),
  pal: {
    h: "#f8e098", i: "#e0b860", j: "#b88838", l: "#906828",
    s: "#e8d088", t: "#d0b060", u: "#f8e8a8", v: "#987038", x: "#6a4c28",
    k: "#4a3028", K: "#2c1c18", a: "#f0c078", A: "#ffe0a8", b: "#a87038",
    c: "#5a3a20", C: "#384038", w: "#ffffff",
    r: "#f05050", y: "#f8d838", g: "#58c858", o: "#f89838", p: "#f888c0",
  },
  solid: { x: 3, y: 26, w: 54, h: 26 },
});

export const STOOL = defineProp({
  rows: [
    ".aaaa.",
    "abbbbc",
    ".cccc.",
    "..dd..",
    "..dd..",
    ".dddd.",
  ],
  pal: { a: "#ff9090", b: "#f05858", c: "#b83040", d: "#c0c8d8" },
  solid: { x: 0, y: 3, w: 8, h: 5 },
});

/** Round patio table with a parasol (pole through the middle). */
export const PATIO_TABLE = defineProp({
  rows: (() => {
    const g = blank(18, 12);
    ellipse(g, 9, 5, 8.5, 4, (l) => "abbc"[l]);
    rect(g, 8, 9, 2, 3, "c");
    rect(g, 5, 11, 8, 1, "c");
    put(g, 6, 3, "r"); put(g, 7, 3, "r"); put(g, 11, 5, "y"); put(g, 12, 5, "y");
    return rowsOf(g);
  })(),
  pal: { a: "#ffffff", b: "#e8e8f0", c: "#a8a8c0", r: "#f05050", y: "#58b8f8" },
  solid: { x: 1, y: 4, w: 18, h: 9 },
});

export const PLANTER = defineProp({
  rows: (() => {
    const g = blank(16, 18);
    blobs(g, [{ x: 8, y: 6, rx: 7.5, ry: 6 }, { x: 5, y: 5, rx: 4, ry: 4 }, { x: 11, y: 5, rx: 4, ry: 4 }], "abcd");
    for (const [x, y] of [[4, 3], [10, 2], [12, 7], [6, 8]]) { put(g, x, y, "f"); put(g, x + 1, y, "F"); }
    rect(g, 2, 11, 12, 6, "p"); rect(g, 2, 11, 12, 1, "P"); rect(g, 12, 12, 2, 5, "q"); rect(g, 2, 16, 12, 1, "q");
    return rowsOf(g);
  })(),
  pal: { a: "#b8f080", b: "#70c850", c: "#48a040", d: "#2a7834", f: "#f878b0", F: "#c84888", p: "#e88850", P: "#f8b078", q: "#b05830" },
  solid: { x: 2, y: 10, w: 14, h: 9 },
});

export const WET_SIGN = defineProp({
  rows: [
    "...yy...",
    "..yYYy..",
    "..ykky..",
    ".yykkyy.",
    ".yyyyyy.",
    "yykyykyy",
    "yyyyyyyy",
    "Y......Y",
    "Y......Y",
  ],
  pal: { y: "#f8d838", Y: "#c89820", k: "#303030" },
  solid: { x: 0, y: 6, w: 10, h: 5 },
});

