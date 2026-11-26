// Giant-desk props: everyday school/office things blown up to giant size so
// the tiny people look like ants on them. Pencils and pens are rasterized as
// rotated rods (pixkit.rod) so they can lie diagonally; most objects lying on
// the desk are flat (people can walk over them) and get a separate flat drop
// shadow prop (see `shadowed`).
import { defineProp, type PropDef } from "../props";
import { blank, blobs, rect, rowsOf, put, stamp, type CharGrid } from "../shapes";
import { ellipse, inEllipse, line, outlineWith, rod, text, textWidth, rng } from "./pixkit";
import type { PropPlace } from "../world";

// ── Drop shadows ─────────────────────────────────────────────────────────────
const SHADOW = { wood: "#b07440", paper: "#d4d6e0" } as const;
type Surface = keyof typeof SHADOW;
const shadowCache = new Map<string, PropDef>();

/** Flat silhouette of a prop (outline ring included). */
function shadowFor(p: PropDef, on: Surface): PropDef {
  const key = `${p.key}:${on}`;
  let s = shadowCache.get(key);
  if (!s) {
    const rows = p.frames?.[0] ?? p.rows ?? [];
    const W = p.w(), H = p.h();
    const pad = p.outline !== false ? 1 : 0;
    const g = blank(W, H);
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        if (r[x] === "." || r[x] === " ") continue;
        for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (pad || (dx === 0 && dy === 0)) put(g, x + pad + dx * pad, y + pad + dy * pad, "s");
        }
      }
    });
    s = defineProp({ rows: rowsOf(g), pal: { s: SHADOW[on] }, flat: true, outline: false });
    shadowCache.set(key, s);
  }
  return s;
}

/** Place a prop with its drop shadow (down-right) under it. */
export function shadowed(p: PropDef, x: number, y: number, on: Surface = "wood", d = 3): PropPlace[] {
  return [[shadowFor(p, on), x + d / 16, y + d / 16], [p, x, y]];
}

// ── Pencils ──────────────────────────────────────────────────────────────────
type PencilColors = { A: string; B: string; C: string; D: string };
const PENCIL_BASE = {
  p: "#ffb8c8", P: "#f08098", Q: "#c05870", // eraser
  n: "#f0f0f8", m: "#b8bcd0", M: "#808498", // ferrule
  w: "#f8d8a8", W: "#d8a870", // wood
  g: "#787888", G: "#404050", // graphite
};

function pencilRows(w: number, h: number, ax: number, ay: number, bx: number, by: number, colored: boolean): string[] {
  const g = blank(w, h);
  const half = 5.5;
  rod(g, ax, ay, bx, by, half, (t, s, len) => {
    const tipLen = 22, lead = 7;
    const as = Math.abs(s);
    if (t < 10) {
      if (t < 2 && as > 3.5) return null;
      return s < -2 ? "p" : s < 2.5 ? "P" : "Q";
    }
    if (t < 17) return (Math.floor(t) % 3 === 0) ? "M" : s < -2 ? "n" : s < 2.5 ? "m" : "M";
    const paintEnd = len - tipLen + 2.2 * Math.cos(s * 1.15);
    if (t < paintEnd) return s < -3.6 ? "A" : s < -0.8 ? "B" : s < 2.6 ? "C" : "D";
    const tt = (t - (len - tipLen)) / tipLen;
    const hw = half * (1 - tt) + 0.5;
    if (as > hw) return null;
    if (t > len - lead) return colored ? (s < 0 ? "B" : "D") : (s < 0 ? "g" : "G");
    return s < 0 ? "w" : "W";
  });
  return rowsOf(g);
}
function pencil(c: PencilColors, colored = false, flip = false) {
  // lies diagonally, eraser bottom-left, tip top-right (or mirrored)
  const rows = flip ? pencilRows(150, 50, 146, 44, 4, 6, colored) : pencilRows(150, 50, 4, 44, 146, 6, colored);
  return defineProp({ rows, pal: { ...PENCIL_BASE, ...c }, flat: true });
}
export const PENCIL = pencil({ A: "#fff0a0", B: "#f8d038", C: "#e8a820", D: "#b87818" });
export const PENCIL_RED = pencil({ A: "#ffa8a0", B: "#f04848", C: "#c83030", D: "#902028" }, true, true);
export const PENCIL_BLUE = pencil({ A: "#a8d0ff", B: "#4888f0", C: "#3060c8", D: "#204090" }, true);
export const PENCIL_GREEN = pencil({ A: "#b8f0a0", B: "#58c048", C: "#389838", D: "#246c2c" }, true, true);

/** Short vertical colored pencil (stub). */
export const PENCIL_STUB = defineProp({
  rows: pencilRows(16, 70, 8, 66, 8, 3, true),
  pal: { ...PENCIL_BASE, A: "#ffd0f0", B: "#d060c8", C: "#a840a0", D: "#782878" },
  flat: true,
});

// ── Ballpoint pen (clear barrel, blue cap & ink) ─────────────────────────────
function penRows(w: number, h: number, ax: number, ay: number, bx: number, by: number): string[] {
  const g = blank(w, h);
  rod(g, ax, ay, bx, by, 4.5, (t, s, len) => {
    const as = Math.abs(s);
    if (t < 26) {
      if (t < 2 && as > 2.5) return null;
      return s < -2 ? "c" : s < 2 ? "C" : "e";
    }
    if (t < len - 18) {
      if (as < 1.2) return t < len - 40 ? "i" : "I";
      return s < -3 ? "o" : s < 2.8 ? "q" : "Q";
    }
    const tt = (t - (len - 18)) / 18;
    const hw = 4.5 * (1 - tt) + 0.8;
    if (as > hw) return null;
    if (t > len - 5) return s < 0 ? "n" : "M";
    if (as < 1) return "I";
    return s < 0 ? "q" : "Q";
  });
  return rowsOf(g);
}
export const PEN = defineProp({
  rows: (() => {
    const g = penRows(132, 40, 4, 34, 128, 6).map((r) => r.split(""));
    // pocket clip along the cap
    for (let i = 0; i < 18; i++) {
      const x = 7 + i, y = Math.round(34 - (i + 3) * (28 / 124)) - 4;
      put(g, x, y, i === 17 ? "C" : "c");
    }
    return g.map((r) => r.join(""));
  })(),
  pal: {
    c: "#5890f8", C: "#2c5cd0", e: "#1c3c98",
    o: "#ffffff", q: "#dceef8", Q: "#a8c4dc", i: "#2850c8", I: "#b0b8c8",
    n: "#e0e0e8", M: "#888898",
  },
  flat: true,
});

// ── Ruler (clear plastic, ticks and numbers) ─────────────────────────────────
export const RULER = defineProp({
  rows: (() => {
    const W = 212, H = 24;
    const g = blank(W, H);
    rect(g, 0, 0, W, H, "r");
    rect(g, 0, 0, W, 1, "o");
    rect(g, 0, H - 1, W, 1, "R");
    rect(g, W - 1, 0, 1, H, "R");
    // ticks on the top edge (1 unit = 4px, 1 "cm" = 20px)
    for (let i = 0; i * 4 < W - 8; i++) {
      const x = 6 + i * 4;
      rect(g, x, 1, 1, i % 5 === 0 ? 8 : 4, "k");
      if (i % 5 === 0) {
        const n = String(i / 5);
        text(g, x - Math.floor(textWidth(n) / 2), 11, n, "k");
      }
    }
    rect(g, 2, H - 5, W - 4, 1, "R");
    text(g, W - 22, 17, "CM", "R");
    return rowsOf(g);
  })(),
  pal: { r: "#c8f0e8", o: "#f0fffc", R: "#78b8b0", k: "#2c5850" },
  flat: true,
});

// ── Eraser (half red / half blue, the classic school one) ────────────────────
export const ERASER = defineProp({
  rows: (() => {
    const g = blank(42, 26);
    // top face
    rect(g, 1, 0, 40, 15, "r");
    rect(g, 21, 0, 20, 15, "b");
    rect(g, 1, 0, 20, 1, "R");
    rect(g, 21, 0, 20, 1, "B");
    rect(g, 0, 1, 1, 13, "R");
    put(g, 0, 0, "."); put(g, 41, 0, ".");
    rect(g, 41, 1, 1, 13, "b");
    // worn, rounded corner where it was used
    put(g, 1, 0, "."); put(g, 0, 1, "."); put(g, 0, 2, "s");
    // label
    rect(g, 13, 5, 16, 5, "w");
    rect(g, 14, 6, 6, 1, "x");
    rect(g, 22, 6, 6, 1, "y");
    rect(g, 14, 8, 14, 1, "W");
    // front face
    rect(g, 0, 15, 21, 10, "s");
    rect(g, 21, 15, 21, 10, "c");
    rect(g, 0, 15, 42, 1, "q");
    rect(g, 0, 24, 21, 1, "S");
    rect(g, 21, 24, 21, 1, "C");
    rect(g, 0, 15, 1, 10, "q");
    return rowsOf(g);
  })(),
  pal: {
    R: "#ff9890", r: "#f05850", s: "#c83838", S: "#982830", q: "#e86058",
    B: "#90b8ff", b: "#4878e8", c: "#3058c0", C: "#20408c",
    w: "#ffffff", W: "#c8c8d8", x: "#f05850", y: "#4878e8",
  },
  solid: { x: 0, y: 6, w: 44, h: 21 },
});

/** Eraser crumbs (flat). */
export const ERASER_CRUMBS = defineProp({
  rows: [
    ".rr.....b...",
    "rR...b.bb...",
    "...r.......r",
    "..rR..bB..rR",
    "b.......r...",
  ],
  pal: { r: "#f06860", R: "#b83838", b: "#5880e8", B: "#3050b0" },
  flat: true,
});

// ── Pencil sharpener + shavings ──────────────────────────────────────────────
export const SHARPENER = defineProp({
  rows: (() => {
    const g = blank(26, 22);
    // red plastic body: top face
    rect(g, 0, 0, 26, 10, "r");
    rect(g, 0, 0, 26, 1, "q");
    rect(g, 0, 0, 1, 10, "q");
    // metal blade plate with a screw
    rect(g, 3, 2, 18, 6, "b");
    rect(g, 3, 2, 18, 1, "a");
    rect(g, 3, 7, 18, 1, "c");
    rect(g, 5, 4, 14, 1, "d");
    ellipse(g, 17, 5, 1.6, 1.6, "c");
    put(g, 17, 5, "e");
    // front face with the cone hole
    rect(g, 0, 10, 26, 12, "R");
    rect(g, 0, 10, 26, 1, "q");
    rect(g, 0, 21, 26, 1, "s");
    for (let x = 2; x < 24; x += 3) if (x < 7 || x > 19) rect(g, x, 12, 1, 8, "s");
    ellipse(g, 13, 15.5, 5, 4.2, "c");
    ellipse(g, 13, 15.5, 3.6, 3, "d");
    ellipse(g, 13.5, 16, 1.8, 1.4, "e");
    put(g, 11, 14, "b");
    return rowsOf(g);
  })(),
  pal: {
    q: "#ff8c80", r: "#f04848", R: "#c83038", s: "#982030",
    a: "#f0f4fc", b: "#c8ccdc", c: "#9ca0b8", d: "#585c74", e: "#2c2c40",
  },
  solid: { x: 0, y: 6, w: 28, h: 18 },
});

// Curly shavings: a "C" curl with the painted wavy rim and wood inside.
const SHAVING_ROWS = [
  "....yYyYy....",
  "..yYwwwwWyY..",
  ".yWwW....WWy.",
  "yWw.......Wg.",
  "yw........gG.",
  "yWw..........",
  ".yWwW...wy...",
  "..yYwwwwWy...",
  "....yYyYy....",
];
export const SHAVINGS = defineProp({
  rows: SHAVING_ROWS,
  pal: { y: "#f8c830", Y: "#c89020", w: "#f8dcb0", W: "#e0b880", g: "#707080", G: "#404050" },
  flat: true,
});
export const SHAVINGS_RED = defineProp({
  rows: SHAVING_ROWS.map((r) => r.split("").reverse().join("")),
  pal: { y: "#f04848", Y: "#b02830", w: "#f8dcb0", W: "#e0b880", g: "#e05050", G: "#a02828" },
  flat: true,
});

// ── Giant coffee mug (animated coffee shine; steam is a separate prop) ─────
function mugRows(f: number): string[] {
  const W = 64, H = 72;
  const g = blank(W, H);
  const cx = 25, top = 10, rx = 24, ry = 8, bottom = 62;
  // handle (behind the body's right edge)
  for (let y = 16; y < 56; y++) for (let x = 40; x < 63; x++) {
    const o = inEllipse(x, y, 47, 35, 14, 16), i = inEllipse(x, y, 47, 35, 8, 10);
    if (o && !i && x > 44) put(g, x, y, x > 57 ? "4" : y < 28 ? "1" : y > 44 ? "4" : "3");
  }
  // body, lit from the left
  for (let y = top; y <= bottom + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) {
    const nx = (x + 0.5 - cx) / rx;
    if (Math.abs(nx) > 1) continue;
    const yb = bottom + ry * Math.sqrt(1 - nx * nx);
    if (y > yb) continue;
    let c = nx < -0.82 ? "2" : nx < -0.15 ? "1" : nx < 0.55 ? "2" : nx < 0.85 ? "3" : "4";
    if (y > yb - 2) c = "4";
    put(g, x, y, c);
  }
  // decoration: blue band + big heart
  for (let y = 44; y < 48; y++) for (let x = cx - rx; x <= cx + rx; x++) {
    const nx = (x + 0.5 - cx) / rx;
    if (Math.abs(nx) <= 1 && g[y][x] !== ".") put(g, x, y, nx > 0.6 ? "B" : "b");
  }
  stamp(g, cx - 7, 22, [
    "..rrr...rrr..",
    ".rRRRr.rRRRr.",
    "rRoRRRrRRRRRr",
    "rRRRRRRRRRRRr",
    "rRRRRRRRRRRRs",
    ".rRRRRRRRRRs.",
    "..rRRRRRRRs..",
    "...rRRRRRs...",
    "....rRRRs....",
    ".....rRs.....",
    "......s......",
  ]);
  // rim (white lip) + coffee with a crema ring and a moving shine
  ellipse(g, cx, top, rx, ry, (x, y) => (y < top - 3 ? "1" : "2"));
  ellipse(g, cx, top + 0.5, rx - 2.5, ry - 2, "3");
  ellipse(g, cx, top + 1.2, rx - 3.5, ry - 2.6, (x, y) => (inEllipse(x, y, cx + 1, top + 1.8, rx - 5.5, ry - 3.6) ? "c" : "C"));
  const sh = [[-9, 0], [-6, -1], [-3, 0]][f % 3];
  put(g, cx + sh[0], top + sh[1], "a");
  put(g, cx + sh[0] + 1, top + sh[1], "a");
  put(g, cx + 6 - (f % 3), top + 2, "C");
  return rowsOf(g);
}
export const MUG = defineProp({
  frames: [mugRows(0), mugRows(1), mugRows(2)],
  fps: 2.5,
  pal: {
    "1": "#ffffff", "2": "#eef0f8", "3": "#c8cce0", "4": "#9498b8",
    b: "#5890f0", B: "#3060c0",
    r: "#ff7878", R: "#e83848", o: "#ffd0d0", s: "#b02838",
    c: "#6c3818", C: "#b07040", a: "#f8e8d0",
  },
  solid: { x: 2, y: 50, w: 50, h: 24 },
});
/** Soft shadow for the mug (place at the mug's position). */
export const MUG_SHADOW = defineProp({
  rows: (() => {
    const g = blank(70, 78);
    ellipse(g, 31, 69, 27, 8, "s");
    return rowsOf(g);
  })(),
  pal: { s: "#b07440" },
  flat: true,
  outline: false,
});
/** Steam over the mug (place at mug.x + 10px, mug.y - 12px). Not outlined. */
export const MUG_STEAM = defineProp({
  frames: [0, 1, 2, 3].map((f) => {
    const g = blank(26, 16);
    const wisp = (x0: number, phase: number) => {
      for (let k = 0; k < 13; k++) {
        const y = 14 - k;
        const x = x0 + Math.round(Math.sin((k + phase * 1.5) * 0.65) * 2);
        if ((k + phase) % 6 !== 5) put(g, x, y, k > 8 ? "w" : "v");
      }
    };
    wisp(8, f);
    wisp(19, f + 2);
    return rowsOf(g);
  }),
  fps: 3,
  pal: { v: "#fcfcff", w: "#e8e4f0" },
  outline: false,
  solid: null,
  baseY: 90,
});

/** Spilled coffee puddle (flat, blocks the middle). */
export const COFFEE_SPILL = defineProp({
  rows: (() => {
    const g = blank(46, 30);
    blobs(g, [
      { x: 20, y: 16, rx: 15, ry: 7 },
      { x: 33, y: 12, rx: 9, ry: 6 },
      { x: 10, y: 20, rx: 7, ry: 4.5 },
      { x: 38, y: 21, rx: 4, ry: 3 },
      { x: 26, y: 6, rx: 3, ry: 4 },
    ], "cccd", { crease: false, hi: 2 });
    // wet lighter rim on the lit (top-left) side
    for (let y = 1; y < 29; y++) for (let x = 1; x < 45; x++) {
      if (g[y][x] === "c" && (g[y - 1][x] === "." || g[y][x - 1] === ".")) g[y][x] = "b";
    }
    // splash drops
    for (const [x, y] of [[4, 10], [42, 5], [44, 26], [3, 27], [31, 1]]) { put(g, x, y, "c"); put(g, x + 1, y, "c"); put(g, x, y + 1, "d"); }
    // shine
    stamp(g, 13, 12, ["aaa..", "....a"]);
    stamp(g, 31, 9, ["aa"]);
    outlineWith(g, (ch) => "abcd".includes(ch), "e");
    return rowsOf(g);
  })(),
  pal: { a: "#f8e8d0", b: "#b07040", c: "#7c4424", d: "#64341c", e: "#4c2410" },
  flat: true,
  outline: false,
  solid: { x: 6, y: 8, w: 34, h: 14 },
});

/** Coffee ring stain (flat, on paper). */
export const COFFEE_STAIN = defineProp({
  rows: (() => {
    const g = blank(34, 28);
    const r = rng(9);
    for (let y = 0; y < 28; y++) for (let x = 0; x < 34; x++) {
      const nx = (x + 0.5 - 17) / 16, ny = (y + 0.5 - 14) / 13;
      const d = Math.sqrt(nx * nx + ny * ny);
      if (d <= 1 && d > 0.84 && r() < 0.88) put(g, x, y, d > 0.92 ? "C" : "c");
      else if (d <= 0.84 && r() < 0.05) put(g, x, y, "c");
    }
    return rowsOf(g);
  })(),
  pal: { c: "#e8d0b0", C: "#d0a878" },
  flat: true,
  outline: false,
});

// ── Stack of books ───────────────────────────────────────────────────────────
function bookFront(g: CharGrid, x: number, y: number, w: number, h: number, c: string, C: string, label: string) {
  rect(g, x, y, w, h, c);
  rect(g, x, y, w, 1, "o");
  rect(g, x, y + h - 1, w, 1, C);
  // pages peeking on the right end
  rect(g, x + w - 6, y + 1, 5, h - 2, "p");
  for (let yy = y + 2; yy < y + h - 1; yy += 2) rect(g, x + w - 6, yy, 5, 1, "P");
  // spine bands + title
  rect(g, x + 4, y + 2, 2, h - 3, "y");
  rect(g, x + w - 12, y + 2, 2, h - 3, "y");
  text(g, x + 10, y + Math.floor((h - 5) / 2), label, "y");
}
export const BOOKS = defineProp({
  rows: (() => {
    const g = blank(96, 70);
    // top cover of the top book
    rect(g, 6, 0, 82, 30, "g");
    rect(g, 6, 0, 82, 1, "G");
    rect(g, 6, 0, 1, 30, "G");
    rect(g, 87, 0, 1, 30, "h");
    rect(g, 18, 6, 50, 16, "o");
    rect(g, 19, 7, 48, 14, "O");
    text(g, 22, 9, "MATE", "g");
    text(g, 22, 15, "1+1=2", "r");
    // bookmark ribbon
    rect(g, 74, 0, 3, 34, "r");
    put(g, 74, 34, "r"); put(g, 76, 34, "r");
    // spines, slightly offset
    bookFront(g, 6, 30, 82, 12, "g", "h", "MATEMATICA");
    bookFront(g, 2, 42, 86, 13, "b", "B", "HISTORIA");
    bookFront(g, 8, 55, 86, 14, "r", "R", "CUENTOS");
    return rowsOf(g);
  })(),
  pal: {
    g: "#58c068", G: "#90e0a0", h: "#2c7c40",
    b: "#4880e8", B: "#2850a8",
    r: "#f05050", R: "#a82838",
    o: "#ffffff", O: "#f8f0d8", p: "#fff8e8", P: "#d8c8a8", y: "#f8d870",
  },
  solid: { x: 1, y: 30, w: 96, h: 42 },
});

// ── Paper clips ──────────────────────────────────────────────────────────────
function clipRows(): string[] {
  const g = blank(30, 10);
  const loop = (x0: number, y0: number, x1: number, y1: number) => {
    for (let x = x0 + 1; x < x1; x++) { put(g, x, y0, "n"); put(g, x, y1, "m"); }
    put(g, x0, y0 + 1, "n"); put(g, x0, y1 - 1, "m");
    for (let y = y0 + 1; y < y1; y++) put(g, x0, y, "n");
  };
  loop(0, 0, 28, 9);
  loop(4, 2, 24, 7);
  for (let y = 1; y < 9; y++) put(g, 28, y, "m");
  // inner loop end
  for (let x = 8; x < 28; x++) put(g, x, 4, x > 26 ? "m" : "n");
  put(g, 27, 3, "m");
  return rowsOf(g);
}
export const CLIP = defineProp({ rows: clipRows(), pal: { n: "#f0f4fc", m: "#a0a8bc" }, flat: true });
export const CLIP_RED = defineProp({ rows: clipRows(), pal: { n: "#ff8070", m: "#c83838" }, flat: true });
export const CLIP_BLUE = defineProp({ rows: clipRows(), pal: { n: "#80b0ff", m: "#3860c8" }, flat: true });

// ── Sticky notes ─────────────────────────────────────────────────────────────
function postitRows(seed: number, doodle: "lines" | "heart" | "check" | "smile"): string[] {
  const S = 32;
  const g = blank(S, S);
  rect(g, 0, 0, S, S, "b");
  rect(g, 0, 0, S, 6, "a");
  rect(g, 0, 6, S, 1, "c");
  const r = rng(seed);
  if (doodle === "lines") {
    for (let y = 10; y < 28; y += 5) {
      let x = 3;
      const end = 20 + Math.floor(r() * 8);
      while (x < end) {
        const len = 2 + Math.floor(r() * 4);
        for (let k = 0; k < len && x < end; k++, x++) put(g, x, y + ((x % 3) === 0 ? -1 : 0), "k");
        x += 2;
      }
    }
  } else if (doodle === "heart") {
    stamp(g, 9, 11, [".kk...kk.", "kRRk.kRRk", "kRRRkRRRk", "kRRRRRRRk", ".kRRRRRk.", "..kRRRk..", "...kRk...", "....k...."]);
  } else if (doodle === "check") {
    for (const y of [11, 18, 25]) {
      rect(g, 3, y - 2, 4, 4, "k");
      rect(g, 4, y - 1, 2, 2, "b");
      line(g, 9, y, 24 - Math.floor(r() * 6), y, "k");
    }
    line(g, 3, 9, 5, 12, "R"); line(g, 5, 12, 8, 6, "R");
  } else {
    stamp(g, 8, 10, ["...kkkkkk...", ".kk......kk.", "k..k....k..k", "k..........k", "k.k......k.k", "k..kkkkkk..k", ".kk......kk.", "...kkkkkk..."]);
  }
  // curled corner
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6 - i; j++) {
    put(g, S - 1 - j, S - 1 - i, ".");
  }
  for (let i = 0; i < 6; i++) put(g, S - 6 + i, S - 1 - i, "d");
  for (let i = 1; i < 6; i++) for (let j = 0; j < i; j++) put(g, S - 7 + i, S - 1 - j - (6 - i) + 1, "c");
  return rowsOf(g);
}
const POSTIT = (a: string, b: string, c: string, d: string, seed: number, doodle: Parameters<typeof postitRows>[1]) =>
  defineProp({ rows: postitRows(seed, doodle), pal: { a, b, c, d, k: "#3850a0", R: "#e83848" }, flat: true });
export const POSTIT_YELLOW = POSTIT("#fff8a8", "#fff070", "#e8d050", "#c0a838", 1, "lines");
export const POSTIT_PINK = POSTIT("#ffd0e8", "#ffa8d0", "#e888b8", "#c06898", 2, "heart");
export const POSTIT_GREEN = POSTIT("#d8ffc0", "#b8f090", "#90d070", "#68a850", 3, "check");
export const POSTIT_BLUE = POSTIT("#d0f0ff", "#a8e0ff", "#80c0e8", "#5898c8", 4, "smile");
export const POSTIT_ORANGE = POSTIT("#ffe0b0", "#ffc880", "#e8a858", "#c08038", 5, "lines");

// ── Scissors ─────────────────────────────────────────────────────────────────
export const SCISSORS = defineProp({
  rows: (() => {
    const g = blank(76, 46);
    const px = 36, py = 24;
    // handles (thick rings)
    for (const [hx, hy] of [[11, 31], [19, 39]]) {
      for (let y = hy - 9; y <= hy + 9; y++) for (let x = hx - 11; x <= hx + 11; x++) {
        if (inEllipse(x, y, hx, hy, 10, 7.5) && !inEllipse(x, y, hx, hy, 6, 4)) {
          put(g, x, y, y < hy - 3 ? "R" : y > hy + 3 ? "s" : "r");
        }
      }
    }
    // shanks
    rod(g, 19, 27, px, py, 2.5, (_t, s) => (s < 0 ? "R" : "r"));
    rod(g, 25, 34, px, py, 2.5, (_t, s) => (s < 0 ? "R" : "r"));
    // blades
    rod(g, px - 2, py + 1, 74, 6, 3.5, (t, s, len) => {
      const hw = 3.5 * (1 - t / len) + 0.6;
      if (Math.abs(s) > hw) return null;
      return s < -0.5 ? "n" : "m";
    });
    rod(g, px - 2, py, 73, 17, 3.5, (t, s, len) => {
      const hw = 3.5 * (1 - t / len) + 0.6;
      if (Math.abs(s) > hw) return null;
      return s < 0.3 ? "o" : "M";
    });
    ellipse(g, px, py, 2.2, 2.2, "M");
    put(g, px - 1, py - 1, "o");
    return rowsOf(g);
  })(),
  pal: { r: "#f05050", R: "#ff8878", s: "#b02838", n: "#f0f4fc", o: "#dce0ec", m: "#a8b0c4", M: "#78809c" },
  flat: true,
});

// ── Phone lying on the desk ──────────────────────────────────────────────────
export const PHONE = defineProp({
  rows: (() => {
    const W = 62, H = 112;
    const g = blank(W, H);
    // body with rounded corners
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const cx = Math.min(x, W - 1 - x), cy = Math.min(y, H - 1 - y);
      if (cx < 5 && cy < 5 && (5 - cx) ** 2 + (5 - cy) ** 2 > 26) continue;
      put(g, x, y, x === 0 || y === 0 ? "K" : x >= W - 2 || y >= H - 2 ? "j" : "k");
    }
    // screen: sky wallpaper
    for (let y = 6; y < H - 6; y++) for (let x = 4; x < W - 4; x++) {
      const t = (y - 6) / (H - 12);
      put(g, x, y, t < 0.3 ? "1" : t < 0.6 ? "2" : t < 0.8 ? "3" : "4");
    }
    // hills at the bottom of the wallpaper
    for (let x = 4; x < W - 4; x++) {
      const hy = Math.round(H - 26 + Math.sin(x / 7) * 3);
      for (let y = hy; y < H - 6; y++) put(g, x, y, y === hy ? "5" : "6");
    }
    // status bar + notch
    text(g, 7, 8, "9:41", "o");
    rect(g, W - 15, 9, 7, 3, "o");
    rect(g, 24, 6, 14, 3, "k");
    // app icons 4×5
    const cols = ["r", "y", "g", "b", "p", "o", "c", "r", "g", "b", "y", "p", "c", "g", "r", "b", "y", "p", "o", "c"];
    for (let i = 0; i < 20; i++) {
      const ix = 7 + (i % 4) * 13, iy = 20 + Math.floor(i / 4) * 15;
      const c = cols[i];
      rect(g, ix + 1, iy, 8, 10, c);
      rect(g, ix, iy + 1, 10, 8, c);
      rect(g, ix + 1, iy + 1, 3, 1, "o");
      rect(g, ix + 1, iy + 9, 8, 1, "d");
      put(g, ix + 5, iy + 5, i % 3 === 0 ? "o" : "d");
    }
    // dock + home bar
    rect(g, 6, H - 22, W - 12, 13, "7");
    for (let i = 0; i < 4; i++) {
      const ix = 9 + i * 12;
      rect(g, ix, H - 20, 9, 9, ["g", "b", "r", "y"][i]);
      rect(g, ix + 1, H - 19, 3, 1, "o");
    }
    rect(g, 21, H - 8, 20, 1, "o");
    return rowsOf(g);
  })(),
  pal: {
    k: "#303040", K: "#606878", j: "#1c1c2c",
    "1": "#68a8f8", "2": "#88c0f8", "3": "#a8d8f8", "4": "#c8e8f8", "5": "#90e070", "6": "#58b050",
    "7": "#98b8d8",
    o: "#ffffff", d: "#283040",
    r: "#f05858", y: "#f8c838", g: "#48c060", b: "#3878e8", p: "#c060e0", c: "#30c0c8",
  },
  flat: true,
});

// ── Food bits ────────────────────────────────────────────────────────────────
export const COOKIE = defineProp({
  rows: (() => {
    const g = blank(30, 28);
    blobs(g, [{ x: 15, y: 14, rx: 14, ry: 12.5 }], "abcd", { crease: false, hi: 0.3 });
    // bite
    for (let y = 0; y < 28; y++) for (let x = 0; x < 30; x++) {
      if (inEllipse(x, y, 27, 4, 6, 5.5) || inEllipse(x, y, 29, 11, 4, 4)) put(g, x, y, ".");
    }
    for (const [x, y] of [[8, 9], [15, 6], [11, 17], [19, 14], [7, 15], [16, 21], [22, 19]]) {
      stamp(g, x, y, ["kk", "kK"]);
    }
    return rowsOf(g);
  })(),
  pal: { a: "#f8d8a0", b: "#e8b870", c: "#d09850", d: "#b07838", k: "#5c3418", K: "#3c2010" },
  flat: true,
});
export const CRUMBS = defineProp({
  rows: [
    ".bb.......a.",
    "bcc....b....",
    ".c...bbc..b.",
    "......c.....",
    "..a.......bc",
    ".......b..c.",
  ],
  pal: { a: "#f8d8a0", b: "#e0b070", c: "#b07838" },
  flat: true,
});

