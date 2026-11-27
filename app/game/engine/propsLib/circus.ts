// Circus props: the big top and small striped tents, a ring border, an
// elephant, a lion wagon, a clown car, clowns, a strongman, a ticket booth,
// popcorn / cotton-candy carts, a cannon, pennants, a ball and a pedestal.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, line } from "./artkit";
import { text, textWidth } from "./pixkit";

// ── Tents ────────────────────────────────────────────────────────────────────
function tentRows(W: number, roofH: number, wallH: number, door: number): string[] {
  const H = roofH + wallH + 9;
  const cx = (W - 1) / 2;
  const g = blank(W, H);
  const flagY = 0;
  // roof: wedge stripes radiating from the apex, with a lit left / dark right
  for (let y = 6; y < 6 + roofH; y++) {
    const t = (y - 5) / roofH;
    const half = Math.max(1, t * (W / 2 - 0.5));
    for (let x = Math.ceil(cx - half); x <= Math.floor(cx + half); x++) {
      const u = (x - cx) / half; // -1 … 1
      const stripe = Math.floor((u + 1) * 4.4) % 2 === 0;
      const lit = u < -0.35 ? 0 : u < 0.4 ? 1 : 2;
      g[y][x] = stripe ? "rRQ"[lit] : "wWv"[lit];
    }
  }
  // scalloped valance
  const vy = 6 + roofH;
  for (let x = 0; x < W; x++) {
    const stripe = Math.floor(x / 5) % 2 === 0;
    g[vy][x] = stripe ? "R" : "W";
    g[vy + 1][x] = stripe ? "r" : "w";
    if (x % 5 !== 2) g[vy + 2][x] = stripe ? "R" : "W";
    if (x % 5 === 0 || x % 5 === 4) g[vy + 2][x] = stripe ? "R" : "W";
  }
  // walls
  for (let y = vy + 3; y < vy + 3 + wallH; y++) {
    for (let x = 1; x < W - 1; x++) {
      const stripe = Math.floor((x - 1) / 5) % 2 === 0;
      const dark = x > W - 7;
      g[y][x] = stripe ? (dark ? "Q" : "r") : (dark ? "v" : "w");
    }
  }
  rect(g, 0, vy + 3 + wallH - 1, W, 1, "k");
  // door
  const dx = Math.floor(cx - door / 2);
  rect(g, dx, vy + 3, door, wallH, "k");
  rect(g, dx + 1, vy + 3, door - 2, wallH, "K");
  // curtains tied back
  rect(g, dx - 1, vy + 3, 2, wallH, "Y"); rect(g, dx + door - 1, vy + 3, 2, wallH, "Y");
  rect(g, dx - 1, vy + 3 + Math.floor(wallH / 2), 3, 1, "y");
  rect(g, dx + door - 2, vy + 3 + Math.floor(wallH / 2), 3, 1, "y");
  // flag
  rect(g, Math.floor(cx), flagY, 1, 7, "s");
  stamp(g, Math.floor(cx) + 1, flagY, ["ff", "ffF", "fF"]);
  return rowsOf(g);
}
const TENT_PAL = { r: "#f05050", R: "#d03038", Q: "#a82430", w: "#ffffff", W: "#e4e4f0", v: "#c0c0d8", k: "#38202c", K: "#1c1018", y: "#f8d848", Y: "#c89828", s: "#d8d8e4", f: "#f8d848", F: "#c89828" };
export const BIG_TOP = defineProp({
  rows: tentRows(88, 34, 26, 22),
  pal: TENT_PAL,
  solid: { x: 2, y: 46, w: 86, h: 30 },
});
export const TENT_RED = defineProp({
  rows: tentRows(46, 17, 14, 12),
  pal: TENT_PAL,
  solid: { x: 1, y: 24, w: 46, h: 20 },
});
export const TENT_BLUE = defineProp({
  rows: tentRows(46, 17, 14, 12),
  pal: { ...TENT_PAL, r: "#4890f0", R: "#2c68d0", Q: "#1e48a0", w: "#fff0a0", W: "#e8d070", v: "#c0a850", f: "#ff6868", F: "#c83838" },
  solid: { x: 1, y: 24, w: 46, h: 20 },
});
export const TENT_PURPLE = defineProp({
  rows: tentRows(46, 17, 14, 12),
  pal: { ...TENT_PAL, r: "#b070f0", R: "#8c48d0", Q: "#6430a0", w: "#ffd0f0", W: "#f0a8d8", v: "#c880b0", f: "#58d8f0", F: "#2898c0" },
  solid: { x: 1, y: 24, w: 46, h: 20 },
});

// ── Ring border (flat) ───────────────────────────────────────────────────────
export const CIRCUS_RING = defineProp({
  rows: (() => {
    const W = 106, H = 66, cx = 52.5, cy = 32.5, rx = 51, ry = 31;
    const g = blank(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const o = ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2;
      const i = ((x + 0.5 - cx) / (rx - 4.5)) ** 2 + ((y + 0.5 - cy) / (ry - 3.6)) ** 2;
      if (o <= 1 && i >= 1) {
        const a = Math.atan2((y - cy) / ry, (x - cx) / rx);
        const stripe = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 24) % 2 === 0;
        const edge = o > 0.9 || i < 1.15;
        g[y][x] = stripe ? (edge ? "R" : "r") : (edge ? "W" : "w");
      }
    }
    return rowsOf(g);
  })(),
  pal: { r: "#f05050", R: "#b82c3c", w: "#ffffff", W: "#c8c8dc" },
  outline: false,
  flat: true,
});

// ── Elephant ─────────────────────────────────────────────────────────────────
export const ELEPHANT = defineProp({
  rows: (() => {
    const g = blank(46, 38);
    // legs
    for (const x of [12, 17, 28, 33]) { rect(g, x, 24, 5, 12, "c"); rect(g, x, 24, 1, 12, "b"); rect(g, x, 35, 5, 2, "d"); }
    // tail
    line(g, 38, 16, 41, 24, "c"); put(g, 41, 25, "d");
    // body & head
    blobs(g, [{ x: 26, y: 17, rx: 14, ry: 9.5 }], "abcd", { crease: false });
    blobs(g, [{ x: 10, y: 14, rx: 7, ry: 7 }], "abcd", { crease: false });
    blobs(g, [{ x: 15, y: 16, rx: 4.5, ry: 6 }], "bcdd", { crease: false }); // ear
    // trunk
    for (let y = 18; y < 31; y++) { rect(g, 3 + Math.round((y - 18) * 0.05), y, 3, 1, y > 27 ? "d" : "c"); }
    rect(g, 3, 18, 1, 12, "b");
    put(g, 6, 30, "c"); put(g, 7, 29, "c");
    // tusk & eye
    rect(g, 6, 20, 2, 3, "t"); put(g, 8, 22, "t");
    put(g, 7, 12, "k"); put(g, 8, 12, "k");
    // party hat + blanket
    stamp(g, 7, 2, ["..r.", ".rrr", "rrry", ".rrr"]);
    rect(g, 6, 7, 8, 1, "y");
    rect(g, 20, 8, 12, 5, "r"); rect(g, 20, 8, 12, 1, "R"); rect(g, 20, 12, 12, 1, "y");
    stamp(g, 23, 9, ["y.y.y"]);
    return rowsOf(g);
  })(),
  pal: { a: "#d0d8e8", b: "#a8b4cc", c: "#8894b0", d: "#64708c", t: "#fff8e0", k: "#201828", r: "#f05050", R: "#b82c3c", y: "#f8d848" },
  solid: { x: 8, y: 28, w: 32, h: 10 },
});

// ── Lion wagon ───────────────────────────────────────────────────────────────
export const LION_WAGON = defineProp({
  rows: (() => {
    const g = blank(40, 34);
    // cage interior
    rect(g, 2, 2, 36, 20, "i");
    // lion
    blobs(g, [{ x: 20, y: 14, rx: 8, ry: 8 }], "mMNn", { crease: false });
    ellipse(g, 20, 15, 4.8, 4.6, "f");
    put(g, 18, 14, "k"); put(g, 22, 14, "k"); rect(g, 19, 17, 3, 1, "k"); put(g, 20, 16, "o");
    rect(g, 15, 21, 11, 1, "F");
    // roof
    rect(g, 0, 0, 40, 3, "R"); rect(g, 0, 0, 40, 1, "r");
    // bars
    for (let x = 4; x < 38; x += 4) rect(g, x, 3, 1, 19, "b");
    rect(g, 0, 11, 40, 1, "b");
    // wagon body
    rect(g, 0, 22, 40, 9, "w"); rect(g, 0, 22, 40, 1, "W"); rect(g, 0, 30, 40, 1, "V");
    text(g, 13, 24, "LEON", "k");
    // wheels
    for (const x of [8, 31]) { ellipse(g, x, 31, 4, 4, "k"); ellipse(g, x, 31, 2, 2, "y"); put(g, x, 31, "k"); }
    return rowsOf(g);
  })(),
  pal: { i: "#3a2a3c", b: "#a8a8bc", r: "#ff7060", R: "#c83c44", w: "#e8a850", W: "#f8cc78", V: "#a87028", y: "#fff0b0", k: "#302024", f: "#f8d8a0", F: "#c89860", o: "#e87068", m: "#f8a030", M: "#d87818", N: "#a85818", n: "#7a3c10" },
  solid: { x: 0, y: 14, w: 40, h: 22 },
});

// ── Clown car ────────────────────────────────────────────────────────────────
export const CLOWN_CAR = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(38, 22);
    rect(g, 3, 9, 32, 8, "r"); rect(g, 3, 9, 32, 1, "R"); rect(g, 3, 16, 32, 1, "Q");
    blobs(g, [{ x: 17, y: 9, rx: 9, ry: 6 }], "rRQQ", { crease: false });
    rect(g, 11, 4, 12, 5, "g"); rect(g, 11, 4, 12, 1, "G"); rect(g, 16, 4, 1, 5, "r");
    // dots
    for (const [x, y] of [[6, 11], [10, 14], [15, 12], [20, 14], [25, 11], [30, 13], [28, 15]]) { put(g, x, y, "y"); put(g, x + 1, y, "y"); }
    // nose horn + exhaust
    ellipse(g, 36, 12, 2, 2, "n");
    rect(g, 0, 11, 3, 3, "s");
    if (f) { put(g, 0, 8, "s"); put(g, 1, 7, "s"); } else { put(g, 0, 9, "s"); put(g, 0, 6, "s"); }
    // wheels
    for (const x of [9, 28]) { ellipse(g, x, 17, 4, 4, "k"); ellipse(g, x, 17, 1.8, 1.8, "y"); }
    // driver clown
    ellipse(g, 14, 3, 2.4, 2.4, "2"); put(g, 14, 3, "n");
    rect(g, 12, 0, 5, 1, "u"); rect(g, 12, 1, 1, 2, "u"); rect(g, 16, 1, 1, 2, "u");
    return rowsOf(g);
  }),
  fps: 4,
  pal: { r: "#f8d848", R: "#fff088", Q: "#c89828", g: "#98d8f8", G: "#d8f4ff", y: "#f05050", s: "#b8b8c8", k: "#302830", n: "#f05050", "2": "#fff0e0", u: "#48a0f0" },
  solid: { x: 2, y: 10, w: 35, h: 12 },
});

// ── Clowns ───────────────────────────────────────────────────────────────────
function clownRows(f: number): string[] {
  const g = blank(16, 26);
  blobs(g, [{ x: 4, y: 5, rx: 3.4 }, { x: 12, y: 5, rx: 3.4 }, { x: 8, y: 3, rx: 4.5, ry: 3.4 }], "abcd", { crease: false });
  ellipse(g, 8, 8, 3.4, 3.4, "f");
  put(g, 7, 7, "k"); put(g, 9, 7, "k"); put(g, 8, 8, "n"); rect(g, 7, 10, 3, 1, "m");
  // ruffle
  for (let x = 3; x < 13; x++) put(g, x, 12, x % 2 ? "w" : "W");
  rect(g, 3, 13, 10, 7, "s"); rect(g, 3, 13, 3, 7, "S"); rect(g, 10, 13, 3, 7, "T");
  put(g, 8, 14, "y"); put(g, 8, 17, "y");
  rect(g, 0 + f, 13, 3, 2, "s"); rect(g, 13 - f, 13, 3, 2, "s");
  rect(g, 0 + f, 15, 2, 1, "f"); rect(g, 14 - f, 15, 2, 1, "f");
  // pants + giant shoes
  rect(g, 4, 20, 3, 3, "p"); rect(g, 9, 20, 3, 3, "P");
  rect(g, 2, 23, 6, 2, "o"); rect(g, 8, 23, 6, 2, "O");
  return rowsOf(g);
}
const CLOWN_SOLID = { x: 2, y: 18, w: 12, h: 9 };
export const CLOWN_RAINBOW = defineProp({
  frames: [clownRows(0), clownRows(1)], fps: 2,
  pal: { a: "#ff9090", b: "#f05050", c: "#b83038", d: "#802028", f: "#fff0e0", k: "#201828", n: "#f03838", m: "#e03848", w: "#ffffff", W: "#d0d0e4", s: "#48a0f0", S: "#78c0ff", T: "#2c68c0", y: "#f8d848", p: "#f8d848", P: "#d8a828", o: "#f05050", O: "#b82c3c" },
  solid: CLOWN_SOLID,
});
export const CLOWN_BLUE = defineProp({
  frames: [clownRows(1), clownRows(0)], fps: 2.5,
  pal: { a: "#a8c8ff", b: "#5c90f0", c: "#3c64c0", d: "#284488", f: "#fff0e0", k: "#201828", n: "#3868e8", m: "#e03848", w: "#ffffff", W: "#d0d0e4", s: "#f05050", S: "#ff8888", T: "#b82c3c", y: "#fff088", p: "#48a0f0", P: "#2c68c0", o: "#f8d848", O: "#c89828" },
  solid: CLOWN_SOLID,
});

// ── Strongman ────────────────────────────────────────────────────────────────
export const STRONGMAN = defineProp({
  rows: (() => {
    const g = blank(26, 30);
    // barbell
    rect(g, 2, 1, 22, 1, "s");
    rect(g, 0, 0, 3, 4, "i"); rect(g, 23, 0, 3, 4, "i"); rect(g, 3, 0, 2, 3, "I"); rect(g, 21, 0, 2, 3, "I");
    // arms up
    rect(g, 6, 2, 2, 8, "f"); rect(g, 18, 2, 2, 8, "f");
    rect(g, 5, 8, 4, 3, "f"); rect(g, 17, 8, 4, 3, "f");
    // head
    ellipse(g, 13, 8, 3.3, 3.3, "f"); put(g, 12, 8, "k"); put(g, 14, 8, "k");
    rect(g, 10, 10, 6, 1, "m"); rect(g, 11, 11, 4, 1, "m");
    // torso (striped leotard)
    for (let y = 13; y < 23; y++) for (let x = 7; x < 19; x++) g[y][x] = (y % 3 === 0) ? "w" : (x > 15 ? "R" : "r");
    rect(g, 6, 12, 14, 2, "f"); rect(g, 9, 12, 8, 1, "r");
    // belt + legs
    rect(g, 7, 21, 12, 2, "y");
    rect(g, 8, 23, 4, 5, "r"); rect(g, 14, 23, 4, 5, "R");
    rect(g, 7, 28, 5, 2, "k"); rect(g, 14, 28, 5, 2, "k");
    return rowsOf(g);
  })(),
  pal: { s: "#b0b0c4", i: "#404058", I: "#686884", f: "#f0b890", k: "#201828", m: "#3a2418", w: "#ffffff", r: "#e84848", R: "#a82838", y: "#f8d848" },
  solid: { x: 5, y: 22, w: 16, h: 10 },
});

// ── Ticket booth ─────────────────────────────────────────────────────────────
export const TICKET_BOOTH = defineProp({
  rows: (() => {
    const W = 38, H = 44;
    const g = blank(W, H);
    // striped roof
    for (let y = 0; y < 9; y++) {
      const inset = Math.round((8 - y) * 0.8);
      for (let x = inset; x < W - inset; x++) g[y][x] = Math.floor(x / 4) % 2 === 0 ? (y > 6 ? "R" : "r") : (y > 6 ? "W" : "w");
    }
    for (let x = 0; x < W; x++) if (x % 4 < 3) put(g, x, 9, Math.floor(x / 4) % 2 === 0 ? "R" : "W");
    // body
    rect(g, 2, 10, W - 4, 32, "y"); rect(g, 2, 10, 3, 32, "Y"); rect(g, W - 5, 10, 3, 32, "q");
    // sign
    const sw = textWidth("ENTRADA");
    rect(g, Math.floor((W - sw) / 2) - 2, 12, sw + 4, 7, "k");
    text(g, Math.floor((W - sw) / 2), 13, "ENTRADA", "o");
    // window
    rect(g, 7, 22, 24, 11, "k"); rect(g, 8, 23, 22, 9, "g"); rect(g, 8, 23, 22, 2, "G");
    rect(g, 6, 33, 26, 2, "Y");
    // person inside window (ticket seller)
    ellipse(g, 19, 27, 2.6, 2.8, "f"); rect(g, 15, 24, 8, 2, "r");
    rect(g, 16, 29, 6, 3, "b");
    rect(g, 2, 41, W - 4, 2, "Q");
    return rowsOf(g);
  })(),
  pal: { r: "#f05050", R: "#b82c3c", w: "#ffffff", W: "#c8c8dc", y: "#f8cc58", Y: "#d8a030", q: "#b07818", Q: "#8c5a10", k: "#2c1c24", o: "#ffe888", g: "#78c8f0", G: "#c4ecff", f: "#f0b890", b: "#4868c8" },
  solid: { x: 2, y: 20, w: 36, h: 26 },
});

// ── Carts ────────────────────────────────────────────────────────────────────
function cartRows(kind: "popcorn" | "candy"): string[] {
  const g = blank(30, 36);
  // umbrella canopy
  for (let y = 0; y < 8; y++) {
    const half = 5 + y * 1.5;
    for (let x = Math.ceil(15 - half); x <= Math.floor(15 + half); x++) {
      g[y][x] = Math.floor((x + 40) / 5) % 2 === 0 ? (y > 6 ? "R" : "r") : (y > 6 ? "W" : "w");
    }
  }
  rect(g, 15, 8, 1, 6, "s");
  // cart
  rect(g, 3, 13, 24, 14, "b"); rect(g, 3, 13, 24, 1, "B");
  rect(g, 3, 13, 2, 14, "B");
  if (kind === "popcorn") {
    rect(g, 5, 14, 20, 8, "g"); rect(g, 5, 14, 20, 1, "G");
    for (let i = 0; i < 20; i += 2) { put(g, 5 + i, 14 + (i % 4 ? 1 : 0), "p"); put(g, 6 + i, 16 + (i % 3), "P"); put(g, 5 + i, 19 + (i % 2), "p"); }
    for (let i = 0; i < 20; i += 3) put(g, 6 + i, 13 - (i % 2), "p");
  } else {
    rect(g, 5, 14, 20, 8, "g"); rect(g, 5, 14, 20, 1, "G");
    blobs(g, [{ x: 10, y: 11, rx: 5, ry: 4 }, { x: 17, y: 10, rx: 5.5, ry: 4.5 }, { x: 22, y: 12, rx: 3.5, ry: 3 }], "pPqQ", { crease: true });
    rect(g, 9, 14, 1, 3, "t"); rect(g, 16, 14, 1, 3, "t"); rect(g, 21, 14, 1, 3, "t");
  }
  rect(g, 4, 23, 22, 3, "R"); rect(g, 4, 23, 22, 1, "r");
  for (let x = 5; x < 25; x += 4) rect(g, x, 24, 2, 2, "w");
  for (const x of [9, 22]) { ellipse(g, x, 30, 4, 4, "k"); ellipse(g, x, 30, 1.6, 1.6, "s"); }
  rect(g, 0, 20, 3, 1, "s"); rect(g, 0, 20, 1, 8, "s");
  return rowsOf(g);
}
const CART_PAL = { r: "#f05050", R: "#b82c3c", w: "#ffffff", W: "#c8c8dc", s: "#a8a8bc", b: "#78c8f0", B: "#4a98c8", g: "#e8f8ff", G: "#ffffff", p: "#fff8d0", P: "#f8d878", q: "#ffd0f0", Q: "#d878b8", t: "#e8d8c0", k: "#2c2830" };
export const POPCORN_CART = defineProp({ rows: cartRows("popcorn"), pal: CART_PAL, solid: { x: 2, y: 20, w: 28, h: 18 } });
export const CANDY_CART = defineProp({
  rows: cartRows("candy"),
  pal: { ...CART_PAL, r: "#4890f0", R: "#2c68d0", b: "#f8a8d0", B: "#d870a8", p: "#ffe0f4", P: "#f8a0d0", q: "#ffc0e8", Q: "#e070b8" },
  solid: { x: 2, y: 20, w: 28, h: 18 },
});

// ── Cannon ───────────────────────────────────────────────────────────────────
export const CANNON = defineProp({
  rows: (() => {
    const g = blank(36, 26);
    // barrel (thick diagonal)
    for (let i = -3; i <= 3; i++) line(g, 8, 14 + i, 27, 3 + i, i < -1 ? "b" : i < 2 ? "c" : "d");
    for (let t = 0; t < 4; t++) { line(g, 12 + t * 4, 9 - t * 2, 14 + t * 4, 12 - t * 2, t % 2 ? "r" : "y"); }
    ellipse(g, 28, 3.5, 3, 3.6, "k");
    // carriage
    rect(g, 6, 14, 14, 5, "w"); rect(g, 6, 14, 14, 1, "W"); rect(g, 6, 18, 14, 1, "V");
    for (const x of [8, 18]) { ellipse(g, x, 20, 5, 5, "o"); ellipse(g, x, 20, 3, 3, "O"); put(g, x, 20, "k"); }
    return rowsOf(g);
  })(),
  pal: { b: "#d84a58", c: "#b02c40", d: "#841c30", r: "#f8f8f8", y: "#f8d848", k: "#1c1018", w: "#6a7090", W: "#9098b8", V: "#48506c", o: "#e8b858", O: "#a07828" },
  solid: { x: 3, y: 14, w: 20, h: 14 },
});

// ── Pennant pole with waving flags ───────────────────────────────────────────
function pennantRows(f: number): string[] {
  const g = blank(22, 48);
  rect(g, 1, 3, 2, 44, "s"); rect(g, 0, 46, 4, 2, "S");
  put(g, 1, 1, "y"); put(g, 2, 1, "y"); put(g, 1, 2, "y"); put(g, 2, 2, "y");
  const cols = ["r", "y", "b", "g", "p"];
  for (let i = 0; i < 5; i++) {
    const y = 4 + i * 5, wob = (i + f) % 2;
    stamp(g, 3, y + wob, [`${cols[i]}${cols[i]}${cols[i]}${cols[i]}${cols[i]}${cols[i]}${cols[i]}`, `.${cols[i]}${cols[i]}${cols[i]}${cols[i]}${cols[i]}.`, `..${cols[i]}${cols[i]}${cols[i]}..`]);
  }
  return rowsOf(g);
}
export const PENNANT_POLE = defineProp({
  frames: [pennantRows(0), pennantRows(1)], fps: 2.2,
  pal: { s: "#d8d8e4", S: "#7c7c98", y: "#f8d848", r: "#f05050", b: "#48a0f0", g: "#58c870", p: "#e060c0" },
  solid: { x: 0, y: 44, w: 4, h: 6 },
});

// ── Striped ball & pedestal ──────────────────────────────────────────────────
export const CIRCUS_BALL = defineProp({
  rows: (() => {
    const g = blank(16, 16);
    blobs(g, [{ x: 8, y: 8, rx: 7.5 }], "abcd", { crease: false });
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (g[y][x] === ".") continue;
      const s = Math.floor((x + y) / 4) % 3;
      const shade = g[y][x];
      g[y][x] = s === 0 ? ({ a: "a", b: "b", c: "c", d: "d" } as Record<string, string>)[shade]
        : s === 1 ? ({ a: "e", b: "f", c: "g", d: "h" } as Record<string, string>)[shade]
        : ({ a: "i", b: "j", c: "k", d: "l" } as Record<string, string>)[shade];
    }
    return rowsOf(g);
  })(),
  pal: { a: "#ff9090", b: "#f05050", c: "#c83440", d: "#902030", e: "#ffffff", f: "#eeeef8", g: "#c4c4dc", h: "#9898b8", i: "#ffe888", j: "#f8d040", k: "#d0a020", l: "#a07810" },
  solid: { x: 1, y: 8, w: 14, h: 9 },
});
export const PEDESTAL = defineProp({
  rows: (() => {
    const g = blank(22, 16);
    ellipse(g, 11, 3.5, 10, 3.3, "T");
    ellipse(g, 11, 3, 8.5, 2.4, "t");
    for (let y = 4; y < 15; y++) for (let x = 1; x < 21; x++) {
      const e = ((x + 0.5 - 11) / 10) ** 2;
      if (e > 1) continue;
      g[y][x] = Math.floor(x / 4) % 2 === 0 ? (x < 6 ? "r" : "R") : (x < 10 ? "w" : "W");
    }
    rect(g, 1, 14, 20, 1, "k");
    return rowsOf(g);
  })(),
  pal: { T: "#f8d848", t: "#fff088", r: "#f05050", R: "#b82c3c", w: "#ffffff", W: "#c8c8dc", k: "#3c2430" },
  solid: { x: 1, y: 5, w: 20, h: 12 },
});

// ── Hay bales & crates ───────────────────────────────────────────────────────
export const CIRCUS_CRATE = defineProp({
  rows: (() => {
    const g = blank(16, 14);
    rect(g, 0, 0, 16, 14, "b"); rect(g, 0, 0, 16, 2, "a"); rect(g, 0, 12, 16, 2, "d");
    rect(g, 0, 0, 2, 14, "c"); rect(g, 14, 0, 2, 14, "c");
    for (let i = 2; i < 14; i++) { put(g, i, i, "c"); put(g, 15 - i, i, "c"); }
    text(g, 3, 5, "TNT", "y");
    return rowsOf(g);
  })(),
  pal: { a: "#d8a068", b: "#b88048", c: "#8c5c30", d: "#6a4220", y: "#ffe888" },
  solid: { x: 0, y: 3, w: 16, h: 13 },
});
