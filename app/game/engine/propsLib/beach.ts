// Beach props: umbrellas, towels, loungers, sandcastles, palms, lifeguard
// tower, ice-cream kiosk, sea rocks, boats… Also small drawing helpers that the
// aquapark and pirate libraries reuse.
import { defineProp, type PropDef } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import type { Pal } from "../sprite";

// ── Helpers ──────────────────────────────────────────────────────────────────
/** 0 (highlight) … 3 (deep shadow) for a point on a dome lit from top-left. */
export function lightLevel(nx: number, ny: number, r2: number, hi = 0.45): number {
  const lit = -(nx * 0.55 + ny * 0.85);
  if (lit > hi && r2 < 0.72) return 0;
  if (lit > -0.2) return 1;
  if (lit > -0.68) return 2;
  return 3;
}

/** Fill an ellipse, choosing each pixel's letter with `pick`. */
export function ellipse(
  g: CharGrid, cx: number, cy: number, rx: number, ry: number,
  pick: (lvl: number, x: number, y: number, nx: number, ny: number) => string | null,
  hi = 0.45,
) {
  for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) {
    for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      if (!g[y] || x < 0 || x >= g[y].length) continue;
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      const r2 = nx * nx + ny * ny;
      if (r2 > 1) continue;
      const c = pick(lightLevel(nx, ny, r2, hi), x, y, nx, ny);
      if (c) g[y][x] = c;
    }
  }
}

/** Shaded tube along a polyline (later samples overwrite earlier ones). */
export function tube(g: CharGrid, pts: readonly [number, number][], r: number, ramp: string, step = 0.25) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(len / step));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
      ellipse(g, cx, cy, r, r, (l) => ramp[l], 0.35);
    }
  }
}

/** Sample a quadratic/cubic Bézier into points. */
export function bezier(p: readonly [number, number][], n = 24): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    let pts = p.map((q) => [...q] as [number, number]);
    while (pts.length > 1) {
      pts = pts.slice(1).map((q, k) => [pts[k][0] + (q[0] - pts[k][0]) * t, pts[k][1] + (q[1] - pts[k][1]) * t] as [number, number]);
    }
    out.push(pts[0]);
  }
  return out;
}

/** 1px line. */
export function line(g: CharGrid, x0: number, y0: number, x1: number, y1: number, ch: string) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) put(g, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), ch);
}

export const SAND_SHADOW = "#dcc282";

/** Flat soft shadow (no outline) — place under tall props on sand. */
export function shadowProp(w: number, h: number, color = SAND_SHADOW): PropDef {
  const g = blank(w, h);
  ellipse(g, w / 2, h / 2, w / 2, h / 2, () => "s");
  return defineProp({ rows: rowsOf(g), pal: { s: color }, flat: true, outline: false });
}

// ── Beach umbrella ───────────────────────────────────────────────────────────
function umbrellaRows(): string[] {
  const W = 30, H = 31;
  const g = blank(W, H);
  rect(g, 14, 12, 2, 19, "p");
  rect(g, 15, 12, 1, 19, "q");
  put(g, 13, 30, "q"); put(g, 16, 30, "q");
  const cx = 15, cy = 9.5, ax = 15, ay = 4;
  ellipse(g, cx, cy, 15, 8.5, (lvl, x, y, nx, ny) => {
    const ang = Math.atan2(y + 0.5 - ay, (x + 0.5 - ax) * 0.75);
    const wedge = Math.floor(((ang + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 5));
    // scalloped rim: nibble the bottom between ribs
    const rim = ny > 0.55 && nx * nx + ny * ny > 0.86;
    const frac = (((ang + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 5)) % 1;
    if (rim && frac > 0.25 && frac < 0.75 && ny > 0.7) return null;
    const ramp = wedge % 2 ? "abcd" : "wxyz";
    return ramp[Math.min(3, lvl + (ny > 0.62 ? 1 : 0))];
  }, 0.35);
  put(g, 15, 0, "k"); put(g, 14, 0, "k");
  return rowsOf(g);
}
const UMB_ROWS = umbrellaRows();
const UMB_BASE = { w: "#ffffff", x: "#f4f0f0", y: "#d8d4e0", z: "#a8a0b8", p: "#f0f0f8", q: "#a0a0b8", k: "#f8d040" };
const umbrella = (a: string, b: string, c: string, d: string, white?: Partial<Pal>) =>
  defineProp({
    rows: UMB_ROWS,
    pal: { ...UMB_BASE, a, b, c, d, ...white },
    solid: { x: 12, y: 29, w: 8, h: 4 },
    baseY: 32,
  });
export const UMBRELLA_RED = umbrella("#ff8888", "#f04850", "#c83040", "#901c34");
export const UMBRELLA_BLUE = umbrella("#88c8ff", "#4890f0", "#3068c8", "#204890");
export const UMBRELLA_YELLOW = umbrella("#fff090", "#f8d038", "#d8a020", "#a07018", { w: "#78d868", x: "#58c050", y: "#40a040", z: "#2c7838" });
export const UMBRELLA_PINK = umbrella("#ffb8e0", "#f878b8", "#d05090", "#983068");
export const UMBRELLA_SHADOW = shadowProp(28, 9);

// ── Towels (flat) ────────────────────────────────────────────────────────────
function towelRows(w: number, h: number, stripe: (x: number, y: number) => string): string[] {
  const g = blank(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (y === 0 || y === h - 1) { if (x % 2 === 0 && x > 0 && x < w - 1) g[y][x] = "f"; continue; }
    g[y][x] = stripe(x, y);
    if (x === w - 1 || y === h - 2) g[y][x] = g[y][x] === "a" ? "c" : g[y][x] === "b" ? "d" : g[y][x];
  }
  return rowsOf(g);
}
const towel = (pal: Pal, kind = 0) => defineProp({
  rows: towelRows(14, 24, (x, y) => {
    if (kind === 0) return (y - 1) % 6 < 3 ? "a" : "b";
    if (kind === 1) return (x < 2 || x > 10) ? "b" : "a";
    return ((x >> 2) + ((y - 1) >> 2)) % 2 ? "a" : "b";
  }),
  pal: { f: "#fff8e8", ...pal },
  flat: true,
});
export const TOWEL_RED = towel({ a: "#f85858", b: "#ffffff", c: "#c03840", d: "#d0d0d8" });
export const TOWEL_BLUE = towel({ a: "#58a8f8", b: "#f8f070", c: "#3878c8", d: "#c8b840" }, 1);
export const TOWEL_GREEN = towel({ a: "#68d088", b: "#ffffff", c: "#3c9858", d: "#d0d0d8" }, 2);
export const TOWEL_PURPLE = towel({ a: "#b078e8", b: "#f8a8d8", c: "#8050b8", d: "#c878a8" });
export const TOWEL_ORANGE = towel({ a: "#f8a040", b: "#fff0c0", c: "#c87020", d: "#d8c890" }, 1);

// ── Lounger (reposera) ───────────────────────────────────────────────────────
function loungerRows(): string[] {
  const W = 14, H = 25;
  const g = blank(W, H);
  // backrest (tilted: darker fabric)
  rect(g, 1, 0, 12, 1, "k");
  for (let y = 1; y < 7; y++) for (let x = 1; x < 13; x++) g[y][x] = x % 4 < 2 ? "c" : "d";
  rect(g, 0, 0, 1, 8, "k"); rect(g, 13, 0, 1, 8, "l");
  rect(g, 0, 7, 14, 1, "l");
  // seat (flat: lighter fabric)
  for (let y = 8; y < 21; y++) for (let x = 1; x < 13; x++) g[y][x] = x % 4 < 2 ? "a" : "b";
  rect(g, 1, 8, 12, 1, "e");
  rect(g, 0, 8, 1, 14, "k"); rect(g, 13, 8, 1, 14, "l");
  rect(g, 0, 21, 14, 1, "k");
  rect(g, 0, 22, 14, 1, "l");
  rect(g, 1, 23, 1, 2, "l"); rect(g, 12, 23, 1, 2, "l");
  return rowsOf(g);
}
const LOUNGER_ROWS = loungerRows();
const lounger = (a: string, b: string, c: string, d: string) => defineProp({
  rows: LOUNGER_ROWS,
  pal: { a, b, c, d, e: "#ffffff", k: "#f8f8f8", l: "#a8a8c0" },
  solid: { x: 0, y: 2, w: 16, h: 24 },
});
export const LOUNGER_BLUE = lounger("#a8d8ff", "#ffffff", "#78b0f0", "#d8e0f0");
export const LOUNGER_RED = lounger("#ffa0a0", "#ffffff", "#e06868", "#d8d8e8");
export const LOUNGER_YELLOW = lounger("#fff080", "#ffffff", "#e8c840", "#e0d8c8");
export const LOUNGER_GREEN = lounger("#98e098", "#f8fff0", "#60b868", "#d0e0c8");

// ── Sandcastle ───────────────────────────────────────────────────────────────
function castleRows(): string[] {
  const g = blank(24, 22);
  const tower = (x: number, y: number, w: number, h: number) => {
    rect(g, x, y + 2, w, h - 2, "b");
    rect(g, x, y + 2, 1, h - 2, "a");
    rect(g, x + w - 2, y + 2, 2, h - 2, "c");
    for (let i = 0; i < w; i += 2) { put(g, x + i, y, i === 0 ? "a" : "b"); put(g, x + i, y + 1, i === 0 ? "a" : "b"); }
    put(g, x + w - 1, y + 1, "c");
    rect(g, x, y + 2, w, 1, "a");
  };
  tower(7, 6, 10, 14); // keep
  tower(1, 10, 6, 10);
  tower(17, 10, 6, 10);
  rect(g, 10, 15, 4, 5, "e"); rect(g, 11, 14, 2, 1, "e"); // door
  put(g, 3, 13, "e"); put(g, 19, 13, "e"); put(g, 11, 10, "e"); put(g, 12, 10, "e");
  rect(g, 0, 19, 24, 3, "d"); rect(g, 1, 19, 22, 1, "c");
  // shells on the base
  put(g, 4, 20, "w"); put(g, 15, 20, "s"); put(g, 20, 20, "w");
  // flag
  rect(g, 12, 0, 1, 6, "k");
  stamp(g, 13, 0, ["rrr", "rR", "r"]);
  return rowsOf(g);
}
export const SANDCASTLE = defineProp({
  rows: castleRows(),
  pal: { a: "#fff4c8", b: "#f0d494", c: "#d8b070", d: "#c09858", e: "#987040", k: "#906840", r: "#f04848", R: "#b02838", w: "#ffffff", s: "#f898a0" },
  solid: { x: 0, y: 12, w: 26, h: 12 },
});
export const SANDCASTLE_SMALL = defineProp({
  rows: [
    "...k......",
    "...kbb....",
    "...kb.....",
    "a.b.k.b...",
    "abbbbbbc..",
    "abbeebbc..",
    "abbeebbc..",
    "dddddddd..",
  ].map((r) => r.slice(0, 8)),
  pal: { a: "#fff4c8", b: "#f0d494", c: "#d8b070", d: "#c09858", e: "#987040", k: "#906840" },
  solid: { x: 0, y: 4, w: 10, h: 6 },
});

// ── Beach ball / bucket / spade ──────────────────────────────────────────────
export const BEACH_BALL = defineProp({
  rows: [
    "..rrww..",
    ".wrrwwb.",
    "wwrhwbbb",
    "yyrrwbbb",
    "yyyrrbbB",
    "yyyrrbBB",
    ".YyrRBB.",
    "..YRRB..",
  ],
  pal: { r: "#f04848", R: "#b82838", w: "#ffffff", h: "#ffffff", y: "#f8d838", Y: "#c8a020", b: "#4888f0", B: "#2858b8" },
  solid: { x: 0, y: 2, w: 10, h: 8 },
});
const BUCKET_ROWS = [
    "..kkkk..",
    ".k....k.",
    "aaaaaaaa",
    "bccccccd",
    ".bccccd.",
    ".bccccd.",
    "..bccd..",
];
export const BUCKET = defineProp({
  rows: BUCKET_ROWS,
  pal: { k: "#8890a8", a: "#ff9090", b: "#f86060", c: "#e04848", d: "#a83038" },
  solid: { x: 0, y: 3, w: 10, h: 6 },
});
export const BUCKET_BLUE = defineProp({
  rows: BUCKET_ROWS,
  pal: { k: "#8890a8", a: "#a0d0ff", b: "#68a8f8", c: "#4888e8", d: "#3060b0" },
  solid: { x: 0, y: 3, w: 10, h: 6 },
});
export const SPADE = defineProp({
  rows: [
    "...yy",
    "..yy.",
    ".k...",
    "kk...",
    "kK...",
  ].map((r) => r),
  pal: { y: "#f8d040", k: "#58b0f0", K: "#3878c0" },
  flat: true,
});

// ── Palm tree ────────────────────────────────────────────────────────────────
function palmRows(lean = 1): string[] {
  const W = 40, H = 50;
  const g = blank(W, H);
  // trunk: curved, ringed
  const base: [number, number] = [20 - lean * 3, 49];
  const top: [number, number] = [20 + lean * 2, 15];
  const pts = bezier([base, [20 - lean * 4, 30], top], 40);
  pts.forEach(([x, y], i) => {
    const w = 2.6 - i / 40;
    for (let xx = Math.floor(x - w); xx <= Math.ceil(x + w); xx++) {
      const o = xx + 0.5 - x;
      if (Math.abs(o) > w) continue;
      const ring = Math.round(y) % 4 === 0;
      const c = o < -w / 3 ? "t" : o < w / 3 ? "u" : "v";
      put(g, xx, Math.round(y), ring ? (c === "t" ? "u" : "v") : c);
    }
  });
  // fronds: back (darker) first, then front
  const leaf = (ang: number, len: number, droop: number, ramp: string) => {
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const n = 60;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const cx = top[0] + dx * len * t, cy = top[1] - 1 + dy * len * t + droop * t * t * len;
      const w = 3.4 * Math.sin(Math.PI * Math.min(1, t * 1.15)) + 0.6;
      // normal pointing "up"
      let nx = -(dy + 2 * droop * t), ny = dx;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl; ny /= nl;
      if (ny > 0) { nx = -nx; ny = -ny; }
      for (let o = -w; o <= w; o += 0.5) {
        const serr = Math.abs(o) > w * 0.55 && (Math.floor(t * 34 + (o > 0 ? 0 : 1)) % 2 === 0);
        if (serr) continue;
        const x = Math.round(cx + nx * o), y = Math.round(cy + ny * o);
        const c = o > w * 0.35 ? ramp[0] : o > -w * 0.2 ? ramp[1] : o > -w * 0.6 ? ramp[2] : ramp[3];
        put(g, x, y, c);
      }
      // midrib
      put(g, Math.round(cx), Math.round(cy), ramp[2]);
    }
  };
  leaf(-Math.PI * 0.62, 14, 0.25, "bccd");
  leaf(-Math.PI * 0.35, 14, 0.25, "bccd");
  leaf(Math.PI * 0.98, 16, 0.55, "abcd");
  leaf(Math.PI * 0.02, 16, 0.55, "abcd");
  leaf(Math.PI * 0.72, 13, 0.7, "abcd");
  leaf(Math.PI * 0.28, 13, 0.7, "abcd");
  leaf(-Math.PI * 0.5, 11, 0.15, "abcd");
  // coconuts
  for (const [x, y] of [[top[0] - 2, top[1] + 1], [top[0] + 1, top[1] + 2], [top[0] - 1, top[1] + 3]]) {
    stamp(g, x, y, ["mn", "no"]);
  }
  return rowsOf(g);
}
const PALM_PAL = {
  a: "#a8f070", b: "#68c848", c: "#40a038", d: "#287830",
  t: "#d8a868", u: "#b08048", v: "#805830",
  m: "#a87038", n: "#7c4c24", o: "#5a3418",
};
export const PALM = defineProp({ rows: palmRows(1), pal: PALM_PAL, solid: { x: 14, y: 44, w: 10, h: 7 } });
export const PALM_B = defineProp({ rows: palmRows(-1), pal: PALM_PAL, solid: { x: 18, y: 44, w: 10, h: 7 } });
export const PALM_SHADOW = shadowProp(30, 10);

// ── Lifeguard tower ──────────────────────────────────────────────────────────
function lifeguardRows(): string[] {
  const W = 28, H = 46;
  const g = blank(W, H);
  // legs + cross braces
  rect(g, 4, 22, 2, 23, "l"); rect(g, 22, 22, 2, 23, "l");
  rect(g, 5, 22, 1, 23, "m"); rect(g, 23, 22, 1, 23, "m");
  line(g, 6, 26, 21, 40, "m"); line(g, 21, 26, 6, 40, "m");
  // ladder in front
  rect(g, 11, 24, 1, 21, "m"); rect(g, 16, 24, 1, 21, "m");
  for (let y = 27; y < 45; y += 3) rect(g, 12, y, 4, 1, "l");
  // platform
  rect(g, 2, 20, 24, 3, "w"); rect(g, 2, 22, 24, 1, "y");
  // cabin
  rect(g, 4, 8, 20, 12, "r");
  rect(g, 4, 8, 1, 12, "q"); rect(g, 22, 8, 2, 12, "R");
  rect(g, 7, 10, 14, 6, "g"); rect(g, 7, 10, 14, 1, "G"); // window
  rect(g, 13, 10, 1, 6, "r");
  // red cross sign
  rect(g, 9, 16, 10, 3, "w");
  rect(g, 13, 16, 2, 3, "r"); rect(g, 12, 17, 4, 1, "r");
  // roof (striped)
  for (let y = 2; y < 8; y++) {
    const inset = 7 - y;
    for (let x = 1 + inset; x < 27 - inset; x++) g[y][x] = ((x >> 2) % 2 ? "r" : "w");
  }
  rect(g, 0, 7, 28, 1, "R");
  for (let x = 0; x < 28; x++) if (g[7][x] === "R" && (x >> 2) % 2 === 0) g[7][x] = "y";
  // flag on top
  rect(g, 21, 0, 1, 3, "m");
  return rowsOf(g);
}
export const LIFEGUARD = defineProp({
  frames: [0, 1].map((f) => {
    const r = lifeguardRows().map((s) => s.split(""));
    const flag = f ? ["ffff", "fFf."] : ["fff.", "fFff"];
    flag.forEach((row, yy) => { for (let x = 0; x < row.length; x++) if (row[x] !== ".") r[yy][22 + x] = row[x]; });
    return r.map((s) => s.join(""));
  }),
  fps: 3,
  pal: {
    l: "#f8f8f8", m: "#b0b0c8", w: "#ffffff", y: "#c8c8d8",
    r: "#f04848", R: "#b02838", q: "#ff7878", g: "#88d0f8", G: "#d8f4ff",
    f: "#f8d040", F: "#c89820",
  },
  solid: { x: 3, y: 38, w: 24, h: 10 },
});

// ── Ice-cream kiosk ──────────────────────────────────────────────────────────
function kioskRows(): string[] {
  const W = 40, H = 40;
  const g = blank(W, H);
  // body
  rect(g, 3, 20, 34, 18, "b");
  rect(g, 3, 20, 1, 18, "a"); rect(g, 35, 20, 2, 18, "c");
  rect(g, 3, 36, 34, 2, "c");
  // counter with tubs
  rect(g, 2, 18, 36, 3, "k"); rect(g, 2, 20, 36, 1, "K");
  const tubs = ["p", "y", "g", "m", "o"];
  tubs.forEach((c, i) => { rect(g, 5 + i * 6, 18, 5, 2, c); put(g, 5 + i * 6, 18, "w"); });
  // big cone painted on the front
  stamp(g, 15, 23, [
    "..pppp..",
    ".pPppPp.",
    ".pppppP.",
    "eeeeeeee",
    ".eEeEeE.",
    "..eEeE..",
    "..EeEe..",
    "...eE...",
    "...EE...",
  ]);
  // awning (scalloped stripes)
  for (let y = 4; y < 15; y++) {
    const inset = Math.max(0, 8 - y) >> 1;
    for (let x = inset; x < W - inset; x++) {
      const s = (x >> 2) % 2;
      g[y][x] = s ? (y < 7 ? "R" : "r") : (y < 7 ? "w" : "W");
      if (y === 4) g[y][x] = s ? "R" : "w";
    }
  }
  for (let x = 0; x < W; x++) {
    const s = (x >> 2) % 2, k = x % 4;
    g[15][x] = s ? "r" : "W";
    if (k === 1 || k === 2) g[16][x] = s ? "Q" : "V";
  }
  // shadow under awning
  for (let x = 3; x < 37; x++) if (g[17][x] === ".") g[17][x] = "c";
  // giant cone on top
  stamp(g, 16, 0, [
    "..pppp..",
    ".pPpppp.",
    "pppppppP",
    "eeeeeeee",
  ]);
  return rowsOf(g);
}
export const ICECREAM_KIOSK = defineProp({
  rows: kioskRows(),
  pal: {
    a: "#d0f0ff", b: "#90d0f8", c: "#5898d0", k: "#f8f8f8", K: "#b8b8d0",
    r: "#f878a8", R: "#e05888", Q: "#b03868", w: "#ffffff", W: "#f0e8f0", V: "#c8b8d0",
    p: "#ffb0d0", P: "#e070a0", y: "#f8e888", g: "#98e0a0", m: "#a07050", o: "#f8b060",
    e: "#e8b060", E: "#b07830",
  },
  solid: { x: 2, y: 20, w: 38, h: 20 },
});

// ── Cooler, surfboards, crab, seagull, starfish ──────────────────────────────
export const COOLER = defineProp({
  rows: [
    "..kkkkkk..",
    ".k......k.",
    "wwwwwwwwww",
    "aaaaaaaaab",
    "abbbbbbbbc",
    "abbwwwwbbc",
    "abbbbbbbbc",
    "cccccccccc",
  ],
  pal: { k: "#8890a8", w: "#ffffff", a: "#80b8f8", b: "#4888e8", c: "#2c5cb0" },
  solid: { x: 0, y: 3, w: 12, h: 7 },
});

function surfRows(): string[] {
  const g = blank(18, 26);
  const board = (x: number, top: number, A: string, B: string, C: string) => {
    for (let y = 0; y < 22; y++) {
      const w = y < 2 ? 1 : y < 4 ? 2 : 3;
      for (let i = -w; i < w; i++) put(g, x + i, top + y, i < -1 ? A : i < 1 ? B : C);
    }
    rect(g, x - 1, top + 5, 2, 12, "s");
  };
  board(4, 2, "a", "b", "c");
  board(10, 0, "d", "e", "f");
  board(15, 3, "g", "h", "i");
  rect(g, 0, 24, 18, 2, "z");
  return rowsOf(g);
}
export const SURFBOARDS = defineProp({
  rows: surfRows(),
  pal: {
    a: "#ffb070", b: "#f88838", c: "#c86020", d: "#a0e8ff", e: "#58c0f0", f: "#3890c8",
    g: "#fff080", h: "#f0d038", i: "#c09818", s: "#ffffff", z: "#d8c080",
  },
  solid: { x: 0, y: 20, w: 20, h: 8 },
});

export const CRAB = defineProp({
  frames: [
    [
      "r......r",
      "rr....rr",
      ".r.ww.r.",
      "..rkrk..",
      ".rrrrrr.",
      "rRrrrrRr",
      ".R.RR.R.",
    ],
    [
      "........",
      "rr....rr",
      "rr.ww.rr",
      "..rkrk..",
      ".rrrrrr.",
      "RrrrrrrR",
      "R.R..R.R",
    ],
  ],
  fps: 3,
  pal: { r: "#f05038", R: "#b02820", w: "#ffffff", k: "#202020" },
  solid: null,
});

export const SEAGULL = defineProp({
  frames: [
    [
      "..ww....",
      ".wwko...",
      ".www....",
      "wwwwgg..",
      ".wwwgggg",
      "..www...",
      "...o.o..",
    ],
    [
      "........",
      "..ww....",
      ".wwko...",
      "wwwwgg..",
      ".wwwgggg",
      "..www...",
      "...o.o..",
    ],
  ],
  fps: 1.5,
  pal: { w: "#ffffff", g: "#a8b0c8", k: "#202020", o: "#f8b030" },
  solid: null,
});

export const STARFISH = defineProp({
  rows: [
    "...o...",
    "..ooo..",
    "ooOoOoo",
    ".ooOoo.",
    ".oo.oo.",
    "oo...oo",
  ],
  pal: { o: "#f8a048", O: "#c86828" },
  flat: true,
});

// ── Volleyball net (manual outline, mesh has holes) ──────────────────────────
function netRows(): string[] {
  const W = 60, H = 26;
  const g = blank(W, H);
  // posts
  for (const x of [1, W - 4]) {
    rect(g, x, 0, 3, H, "o");
    rect(g, x + 1, 0, 1, H - 1, "p");
    put(g, x + 1, 0, "q");
  }
  // tape
  rect(g, 4, 3, W - 8, 1, "o");
  rect(g, 4, 4, W - 8, 2, "w");
  rect(g, 4, 6, W - 8, 1, "o");
  // mesh
  for (let y = 7; y < 15; y++) for (let x = 4; x < W - 4; x++) {
    if (y % 3 === 0 || x % 3 === 0) g[y][x] = "m";
  }
  rect(g, 4, 15, W - 8, 1, "o");
  // shadow on the sand
  for (let x = 4; x < W - 4; x += 1) put(g, x, H - 2, "s");
  rect(g, 0, H - 1, 5, 1, "s"); rect(g, W - 5, H - 1, 5, 1, "s");
  return rowsOf(g);
}
export const VOLLEY_NET = defineProp({
  rows: netRows(),
  pal: { o: "#404860", p: "#e8e8f8", q: "#ffffff", w: "#ffffff", m: "#e0e0f0", s: "#d8bc80" },
  outline: false,
  solid: { x: 0, y: 21, w: 60, h: 5 },
  baseY: 25,
});

// ── Sea props ────────────────────────────────────────────────────────────────
function seaRockRows(big: boolean): string[] {
  const g = big ? blank(30, 20) : blank(16, 12);
  if (big) {
    blobs(g, [{ x: 15, y: 12, rx: 14, ry: 7.5 }, { x: 10, y: 9, rx: 8, ry: 7 }, { x: 20, y: 10, rx: 7, ry: 6 }], "abcd", { hi: 0.25 });
  } else {
    blobs(g, [{ x: 8, y: 7, rx: 7.5, ry: 5 }, { x: 6, y: 5.5, rx: 4.5, ry: 4 }], "abcd", { hi: 0.25 });
  }
  // wet dark band at the waterline
  const h = g.length;
  for (let x = 0; x < g[0].length; x++) {
    for (let y = h - 1; y >= 0; y--) {
      if (g[y][x] !== ".") { g[y][x] = "e"; if (y > 0 && g[y - 1][x] !== ".") g[y - 1][x] = "e"; break; }
    }
  }
  return rowsOf(g);
}
const SEA_ROCK_PAL = { a: "#e8e0d8", b: "#b8b0b0", c: "#908890", d: "#686070", e: "#504858" };
export const SEA_ROCK = defineProp({ rows: seaRockRows(false), pal: SEA_ROCK_PAL, solid: null });
export const SEA_ROCK_BIG = defineProp({ rows: seaRockRows(true), pal: SEA_ROCK_PAL, solid: null });

/** Animated foam ring to put under rocks / posts on water (flat). */
export function foamRing(w: number, h: number): PropDef {
  const frames = [0, 1, 2].map((f) => {
    const g = blank(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = (x + 0.5 - w / 2) / (w / 2), ny = (y + 0.5 - h / 2) / (h / 2);
      const r = Math.hypot(nx, ny);
      const a = Math.atan2(ny, nx);
      if (r <= 1 && r > 0.72 && Math.floor((a + Math.PI) * 4 + f * 1.3) % 3 !== 0) g[y][x] = r > 0.86 ? "f" : "g";
    }
    return rowsOf(g);
  });
  return defineProp({ frames, fps: 2, pal: { f: "#ffffff", g: "#c8e8ff" }, flat: true, outline: false });
}
export const FOAM_SMALL = foamRing(20, 8);
export const FOAM_BIG = foamRing(34, 10);

export const BUOY = defineProp({
  frames: [0, 1].map((f) => {
    const r = [
      "...k...",
      "...k...",
      "..www..",
      ".rrrrr.",
      "rrRrrrR",
      "wwwwwww",
      "rrrrrRR",
      ".fRRRf.",
      "ff...ff",
    ];
    return f ? ["......."].concat(r.slice(0, 8)).map((s, i) => (i === 8 ? "ff...ff" : s)) : r;
  }),
  fps: 1.5,
  pal: { k: "#606880", w: "#ffffff", r: "#f04848", R: "#b02838", f: "#e0f4ff" },
  solid: null,
});

function boatRows(): string[] {
  const W = 30, H = 16;
  const g = blank(W, H);
  for (let y = 0; y < 12; y++) {
    const t = Math.abs(y - 5.5) / 6;
    const left = Math.round(4 * t * t * 3 + 0), right = Math.round(W - 1 - 9 * t * t);
    for (let x = left; x <= right; x++) {
      const edge = x === left || x === right || y === 0 || y === 11;
      g[y][x] = edge ? (y < 6 ? "a" : "c") : "b";
    }
  }
  // inner hull
  for (let y = 2; y < 10; y++) for (let x = 4; x < W - 5; x++) {
    if (g[y][x] === "b" && g[y][x - 2] !== "." && g[y][x + 3] !== ".") g[y][x] = y < 4 ? "e" : "d";
  }
  // benches
  rect(g, 9, 2, 3, 8, "a"); rect(g, 18, 2, 3, 8, "a");
  rect(g, 11, 2, 1, 8, "c"); rect(g, 20, 2, 1, 8, "c");
  // hull side visible below (3/4 view) + waterline foam
  for (let x = 2; x < W - 4; x++) { put(g, x, 12, "h"); put(g, x, 13, "H"); }
  for (let x = 1; x < W - 3; x += 2) put(g, x, 14, "f");
  return rowsOf(g);
}
export const ROWBOAT = defineProp({
  frames: [boatRows(), ["." .repeat(30), ...boatRows().slice(0, 15)]],
  fps: 1,
  pal: { a: "#e8b878", b: "#c88848", c: "#a06030", d: "#885028", e: "#704020", o: "#c09060", h: "#f8f8f8", H: "#e04848", f: "#e8f8ff" },
  solid: null,
});

export const DOCK_POST = defineProp({
  rows: [
    ".aab.",
    "abbbc",
    "bbbcc",
    "bbbcc",
    "bbbcc",
    "dbccd",
    "ddddd",
  ],
  pal: { a: "#c89058", b: "#9c6838", c: "#784828", d: "#4c6890" },
  solid: null,
});

// ── Beach fence (rope between posts), shower ─────────────────────────────────
export const BEACH_FENCE = defineProp({
  rows: [
    ".ab..............",
    "abbc............ab",
    "bbcckk........kabbc",
    "bbcc..kkk..kkk.bbcc",
    "bbcc.....kk....bbcc",
    "bbcc...........bbcc",
    "bbcc...........bbcc",
    "dddd...........dddd",
  ].map((r) => r.padEnd(19, ".").slice(0, 19)),
  pal: { a: "#e0b078", b: "#b88050", c: "#906038", d: "#c8a868", k: "#d8c8a0" },
  solid: { x: 0, y: 4, w: 21, h: 6 },
});

export const SHOWER = defineProp({
  frames: [0, 1, 2].map((f) => {
    const g = blank(14, 30);
    rect(g, 6, 2, 2, 24, "m"); rect(g, 7, 2, 1, 24, "n");
    rect(g, 6, 1, 6, 2, "m"); rect(g, 10, 3, 4, 2, "k"); rect(g, 10, 3, 4, 1, "n");
    // drops
    for (let i = 0; i < 4; i++) {
      const y = 6 + ((i * 5 + f * 3) % 14);
      put(g, 10 + (i % 3), y, "w");
    }
    rect(g, 1, 26, 12, 4, "g"); rect(g, 1, 26, 12, 1, "G");
    for (let x = 2; x < 13; x += 2) put(g, x, 28, "k");
    return rowsOf(g);
  }),
  fps: 6,
  pal: { m: "#a8b0c8", n: "#e8f0ff", k: "#687088", w: "#a8e0ff", g: "#c0c8d8", G: "#e8eef8" },
  solid: { x: 4, y: 24, w: 8, h: 6 },
});

export const SIGN_BEACH = defineProp({
  rows: [
    "aaaaaaaaaaaa",
    "abbbbbbbbbbc",
    "abrrrbbbbbbc",
    "abrbrbbyyybc",
    "abrrrbbyyybc",
    "abbbbbbbbbbc",
    "cccccccccccc",
    "....dc......",
    "....dc......",
    "....dc......",
  ],
  pal: { a: "#f8d8a0", b: "#e0b070", c: "#a06830", d: "#784020", r: "#f05050", y: "#58a8f0" },
  solid: { x: 3, y: 7, w: 6, h: 5 },
});
