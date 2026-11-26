// School props: the school building, flagpole with the Argentine flag,
// basketball hoops, court lines, hopscotch, drinking fountain, bike rack,
// chalkboard, backpacks, balls and an apple.
import { defineProp } from "../props";
import { blank, rect, rowsOf, put, stamp } from "../shapes";
import { HOUSE_BASE, ROOFS, roof, windowAt } from "./town";
import { ellipse, inEllipse, line, text, textWidth } from "./pixkit";

// ── School building (13 tiles wide) ──────────────────────────────────────────
function schoolRows(): string[] {
  const W = 206, H = 92;
  const g = blank(W, H);
  roof(g, 0, 10, W, 20);
  // wall
  rect(g, 1, 32, W - 2, 55, "w");
  rect(g, 1, 32, W - 2, 2, "v");
  rect(g, 1, 34, 2, 53, "W");
  rect(g, W - 3, 32, 2, 55, "v");
  // floor trim
  rect(g, 1, 51, W - 2, 2, "t");
  rect(g, 1, 52, W - 2, 1, "u");
  // brick skirting
  for (let y = 73; y < 87; y++) for (let x = 1; x < W - 1; x++) {
    const row = Math.floor((y - 73) / 3);
    const mortar = (y - 73) % 3 === 2 || (x + (row % 2) * 4) % 8 === 0;
    put(g, x, y, mortar ? "K" : "k");
  }
  rect(g, 1, 72, W - 2, 1, "t");
  // windows
  for (const x of [7, 27, 47, 67, 127, 147, 167, 187]) {
    windowAt(g, x, 36, 12, 12, false);
    windowAt(g, x, 57, 12, 11, true);
  }
  // central tower with clock, rising above the roof
  rect(g, 80, 0, 46, 32, "w");
  rect(g, 80, 0, 2, 32, "W");
  rect(g, 124, 0, 2, 32, "v");
  roof(g, 77, 0, 52, 5);
  ellipse(g, 103, 18, 8, 8, "S");
  ellipse(g, 103, 18, 7, 7, "o");
  ellipse(g, 103, 18, 7, 7, (x, y) => (inEllipse(x, y, 104, 19, 6, 6) ? "o" : "f"));
  for (const [dx, dy] of [[0, -6], [6, 0], [0, 5], [-6, 0]]) put(g, 103 + dx, 18 + dy, "q");
  line(g, 103, 18, 103, 13, "q");
  line(g, 103, 18, 107, 18, "q");
  put(g, 103, 18, "r");
  // upper windows of the tower block
  windowAt(g, 87, 36, 12, 12, false);
  windowAt(g, 107, 36, 12, 12, false);
  // sign
  const label = "ESCUELA";
  const tw = textWidth(label);
  rect(g, 103 - Math.ceil(tw / 2) - 4, 50, tw + 8, 9, "f");
  rect(g, 103 - Math.ceil(tw / 2) - 3, 51, tw + 6, 7, "h");
  text(g, 103 - Math.ceil(tw / 2), 52, label, "o");
  // entrance: pillars + double glass door
  for (const px of [84, 119]) {
    rect(g, px, 59, 4, 28, "W");
    rect(g, px + 3, 59, 1, 28, "v");
    rect(g, px - 1, 59, 6, 2, "f");
  }
  rect(g, 89, 60, 29, 27, "U");
  rect(g, 90, 61, 13, 26, "G");
  rect(g, 104, 61, 13, 26, "G");
  rect(g, 90, 61, 13, 2, "g");
  rect(g, 104, 61, 13, 2, "g");
  rect(g, 90, 61, 2, 26, "g");
  rect(g, 104, 61, 2, 26, "g");
  rect(g, 90, 73, 27, 1, "U");
  put(g, 101, 78, "y"); put(g, 105, 78, "y");
  put(g, 94, 64, "o"); put(g, 95, 63, "o"); put(g, 108, 64, "o"); put(g, 109, 63, "o");
  // base + steps
  rect(g, 0, 87, W, 2, "s");
  rect(g, 0, 89, W, 3, "S");
  for (let x = 3; x < W; x += 7) put(g, x, 88, "S");
  rect(g, 84, 87, 39, 2, "o");
  rect(g, 82, 89, 43, 3, "s");
  rect(g, 82, 91, 43, 1, "S");
  return rowsOf(g);
}

export const SCHOOL = defineProp({
  rows: schoolRows(),
  pal: { ...HOUSE_BASE, ...ROOFS.blue, W: "#fffaf0", w: "#f8ecd0", v: "#dcc8a0", k: "#e89070", K: "#c06850", q: "#303040" },
  solid: { x: 0, y: 0, w: 208, h: 94 },
});

// ── Flagpole with the Argentine flag (waving) ────────────────────────────────
function flagRows(f: number): string[] {
  const g = blank(34, 74);
  // pole
  rect(g, 3, 4, 2, 64, "n");
  put(g, 3, 4, "o");
  rect(g, 4, 4, 1, 64, "m");
  ellipse(g, 4, 2, 2.2, 2.2, "y");
  put(g, 3, 1, "o");
  // pedestal
  rect(g, 0, 66, 9, 4, "s");
  rect(g, 0, 66, 9, 1, "o");
  rect(g, 0, 70, 9, 4, "S");
  // flag 26×16, waving
  const FW = 26, FH = 15;
  for (let x = 0; x < FW; x++) {
    const off = Math.round(Math.sin((x / 7) + f * 2.1) * 1.4 * (x / FW + 0.2));
    for (let y = 0; y < FH; y++) {
      const band = y < 5 ? "c" : y < 10 ? "w" : "c";
      let ch = band;
      const shade = Math.sin((x / 7) + f * 2.1 + 1.2) < -0.4;
      if (shade) ch = band === "c" ? "C" : "W";
      put(g, 5 + x, 6 + y + off, ch);
    }
    if (x >= 11 && x <= 14) {
      // sun
      for (let y = 6; y <= 8; y++) put(g, 5 + x, 6 + y + off, x === 11 || x === 14 ? (y === 7 ? "Y" : "w") : "Y");
    }
  }
  return rowsOf(g);
}
export const FLAGPOLE = defineProp({
  frames: [flagRows(0), flagRows(1), flagRows(2)],
  fps: 3,
  pal: {
    n: "#e0e4f0", m: "#a0a4b8", o: "#ffffff", y: "#f8d048",
    s: "#d8d4c8", S: "#a8a498",
    c: "#80c8f8", C: "#5aa0d8", w: "#ffffff", W: "#d8e0f0", Y: "#f8c030",
  },
  solid: { x: 0, y: 66, w: 11, h: 9 },
});

// ── Basketball hoops ─────────────────────────────────────────────────────────
const HOOP_PAL = {
  w: "#ffffff", W: "#c8d0e0", r: "#e84838", R: "#a82828",
  o: "#f89038", O: "#c05818", n: "#a0a8c0", m: "#68708c", N: "#f8f8f8", p: "#4060a0",
};
export const HOOP = defineProp({
  rows: (() => {
    const g = blank(30, 52);
    // backboard
    rect(g, 0, 0, 30, 18, "w");
    rect(g, 0, 17, 30, 1, "W");
    rect(g, 29, 0, 1, 18, "W");
    rect(g, 10, 6, 10, 8, "r");
    rect(g, 11, 7, 8, 6, "w");
    rect(g, 11, 12, 8, 1, "W");
    // rim
    rect(g, 9, 16, 12, 1, "o");
    rect(g, 8, 17, 14, 2, "o");
    rect(g, 9, 19, 12, 1, "O");
    rect(g, 11, 17, 8, 1, "O");
    // net
    for (let y = 20; y < 27; y++) {
      const inset = Math.floor((y - 20) / 2);
      for (let x = 9 + inset; x < 21 - inset; x++) if ((x + y) % 2 === 0) put(g, x, y, "N");
    }
    // pole
    rect(g, 13, 27, 4, 22, "n");
    rect(g, 16, 27, 1, 22, "m");
    rect(g, 13, 18, 4, 2, "m");
    rect(g, 10, 48, 10, 4, "p");
    rect(g, 10, 48, 10, 1, "n");
    return rowsOf(g);
  })(),
  pal: HOOP_PAL,
  solid: { x: 9, y: 46, w: 14, h: 8 },
});

/** Hoop seen from behind (bottom end of a vertical court). */
export const HOOP_BACK = defineProp({
  rows: (() => {
    const g = blank(30, 44);
    rect(g, 13, 14, 4, 26, "n");
    rect(g, 16, 14, 1, 26, "m");
    rect(g, 10, 40, 10, 4, "p");
    rect(g, 10, 40, 10, 1, "n");
    // back of the board + bracing
    rect(g, 0, 0, 30, 14, "m");
    rect(g, 1, 1, 28, 12, "n");
    line(g, 2, 2, 13, 12, "m");
    line(g, 27, 2, 16, 12, "m");
    rect(g, 13, 2, 4, 11, "m");
    // rim peeking above the board
    rect(g, 9, 0, 12, 1, "o");
    return rowsOf(g);
  })(),
  pal: HOOP_PAL,
  solid: { x: 9, y: 38, w: 14, h: 8 },
});

// ── Court lines (flat, sized to a vertical court in tiles) ───────────────────
export function courtLines(tw: number, th: number) {
  const W = tw * 16, H = th * 16;
  const g = blank(W, H);
  const cx = W / 2;
  const x0 = 3, y0 = 3, x1 = W - 4, y1 = H - 4;
  const key = (top: boolean) => {
    const kw = 36, kh = 34;
    const kx = Math.round(cx - kw / 2);
    const ky = top ? y0 : y1 - kh;
    rect(g, kx, ky, kw, kh, "o");
    // free-throw circle (half outside the key)
    const fy = top ? ky + kh : ky;
    for (let y = fy - 18; y <= fy + 18; y++) for (let x = cx - 19; x <= cx + 19; x++) {
      const d = ((x + 0.5 - cx) / 18) ** 2 + ((y + 0.5 - fy) / 14) ** 2;
      if (d <= 1 && d > 0.78 && (top ? y >= fy : y < fy)) put(g, x, y, "w");
    }
    // key outline
    for (let x = kx; x < kx + kw; x++) { put(g, x, ky, "w"); put(g, x, ky + kh - 1, "w"); }
    for (let y = ky; y < ky + kh; y++) { put(g, kx, y, "w"); put(g, kx + kw - 1, y, "w"); }
    // three-point arc
    const ay = top ? y0 : y1;
    for (let y = y0; y <= y1; y++) for (let x = x0 + 8; x <= x1 - 8; x++) {
      const d = ((x + 0.5 - cx) / (W / 2 - 14)) ** 2 + ((y + 0.5 - ay) / 58) ** 2;
      if (d <= 1 && d > 0.94 && (top ? y > ay : y < ay)) put(g, x, y, "w");
    }
  };
  key(true);
  key(false);
  // boundary
  for (let x = x0; x <= x1; x++) { put(g, x, y0, "w"); put(g, x, y1, "w"); }
  for (let y = y0; y <= y1; y++) { put(g, x0, y, "w"); put(g, x1, y, "w"); }
  // half-court line + center circle
  const my = Math.round(H / 2);
  for (let x = x0; x <= x1; x++) put(g, x, my, "w");
  for (let y = my - 16; y <= my + 16; y++) for (let x = cx - 18; x <= cx + 18; x++) {
    const d = ((x + 0.5 - cx) / 16) ** 2 + ((y + 0.5 - my) / 13) ** 2;
    if (d <= 1) put(g, x, y, d > 0.76 ? "w" : "y");
  }
  return defineProp({ rows: rowsOf(g), pal: { w: "#f8f8f0", o: "#f0a060", y: "#f8d058" }, flat: true, outline: false });
}

// ── Hopscotch (chalk, flat) ──────────────────────────────────────────────────
export const HOPSCOTCH = defineProp({
  rows: (() => {
    const S = 12;
    const g = blank(2 * S + 1, 6 * S + 12);
    const box = (x: number, y: number, n: string, c: string) => {
      for (let i = 0; i <= S; i++) {
        put(g, x + i, y, "w"); put(g, x + i, y + S, "w");
        put(g, x, y + i, "w"); put(g, x + S, y + i, "w");
      }
      text(g, x + 5, y + 4, n, c);
    };
    const mid = Math.floor(S / 2);
    const top = 11;
    // "cielo" on top
    for (let y = 0; y <= top; y++) for (let x = 0; x <= 2 * S; x++) {
      const d = ((x + 0.5 - S - 0.5) / (S + 0.5)) ** 2 + ((y + 0.5 - top - 1) / (top + 0.5)) ** 2;
      if (d <= 1 && d > 0.72) put(g, x, y, "w");
    }
    text(g, 3, 6, "CIELO", "p");
    box(0, top, "8", "y"); box(S, top, "7", "y");
    box(mid, top + S, "6", "p");
    box(0, top + 2 * S, "5", "b"); box(S, top + 2 * S, "4", "b");
    box(mid, top + 3 * S, "3", "y");
    box(mid, top + 4 * S, "2", "p");
    box(mid, top + 5 * S, "1", "b");
    // a pebble
    put(g, mid + 3, top + 3 * S + 8, "s");
    put(g, mid + 4, top + 3 * S + 8, "s");
    return rowsOf(g);
  })(),
  pal: { w: "#ffffff", p: "#f8a0c8", y: "#f8e070", b: "#90d0ff", s: "#787890" },
  flat: true,
  outline: false,
});

// ── Drinking fountain (animated water arcs) ──────────────────────────────────
function fountainRows(f: number): string[] {
  const g = blank(18, 26);
  const arcs = [
    ["..x...", ".x.x..", "x...x.", "....x."],
    ["......", "..x...", ".x.x..", "x...x."],
  ][f];
  stamp(g, 1, 0, arcs);
  stamp(g, 10, 0, arcs.map((r) => r.split("").reverse().join("")));
  // basin top
  rect(g, 0, 4, 18, 6, "a");
  rect(g, 0, 4, 18, 1, "o");
  rect(g, 2, 5, 14, 3, "c");
  rect(g, 3, 6, 12, 2, "q");
  put(g, 5, 6, "Q"); put(g, 12, 7, "Q");
  rect(g, 0, 9, 18, 1, "c");
  // spouts
  put(g, 3, 4, "m"); put(g, 14, 4, "m");
  // body
  rect(g, 2, 10, 14, 14, "b");
  rect(g, 2, 10, 2, 14, "a");
  rect(g, 13, 10, 3, 14, "c");
  rect(g, 6, 13, 6, 4, "c");
  rect(g, 7, 14, 4, 2, "m");
  rect(g, 1, 23, 16, 3, "d");
  rect(g, 1, 23, 16, 1, "c");
  return rowsOf(g);
}
export const DRINKING_FOUNTAIN = defineProp({
  frames: [fountainRows(0), fountainRows(1)],
  fps: 3,
  pal: {
    o: "#ffffff", a: "#e8ecf4", b: "#c8d0e0", c: "#98a0b8", d: "#707890", m: "#585c70",
    q: "#78b8f8", Q: "#d0f0ff", x: "#a8dcff",
  },
  solid: { x: 1, y: 12, w: 18, h: 15 },
});

// ── Bike rack with two bikes (side view) ─────────────────────────────────────
function bike(g: string[][], x: number, y: number, c: string, C: string) {
  // wheels (spoked discs so the auto-outline stays on the outside)
  for (const wx of [x, x + 16]) {
    for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) {
      const d = (xx * xx + yy * yy) / 36;
      if (d > 1.05) continue;
      let ch = d > 0.6 ? "k" : "s";
      if (d <= 0.6 && (xx === 0 || yy === 0 || xx === yy || xx === -yy)) ch = "m";
      if (d > 0.6 && d <= 0.75 && yy < 0 && xx < 0) ch = "K";
      put(g, wx + xx, y + yy, ch);
    }
    put(g, wx, y, "n");
  }
  // frame (2px thick)
  for (const o of [0, 1]) {
    line(g, x, y - o, x + 6, y - 8 - o, c);
    line(g, x + 6, y - 8 + o, x + 14, y - 8 + o, o ? C : c);
    line(g, x + 6, y - 8, x + 8, y - o, c);
    line(g, x + 8, y - o, x + 14, y - 8, c);
    line(g, x + 14, y - 8, x + 16 - o, y, o ? C : c);
  }
  line(g, x + 8, y, x, y, C);
  // seat, handlebar
  rect(g, x + 3, y - 11, 6, 2, "k");
  put(g, x + 6, y - 9, "m");
  line(g, x + 14, y - 8, x + 14, y - 12, "m");
  rect(g, x + 13, y - 13, 5, 2, "k");
  put(g, x + 8, y, "n");
}
export const BIKE_RACK = defineProp({
  rows: (() => {
    const g = blank(52, 24);
    // rack: inverted-U hoops on a ground rail
    for (let i = 0; i < 4; i++) {
      const hx = 3 + i * 13;
      rect(g, hx, 6, 1, 15, "n");
      rect(g, hx + 5, 6, 1, 15, "m");
      rect(g, hx + 1, 5, 4, 1, "n");
    }
    rect(g, 0, 20, 52, 2, "m");
    rect(g, 0, 20, 52, 1, "n");
    bike(g, 7, 15, "r", "R");
    bike(g, 29, 16, "b", "B");
    return rowsOf(g);
  })(),
  pal: { n: "#e0e4f0", m: "#8890a8", s: "#c0c4d4", k: "#383848", K: "#606478", r: "#f04848", R: "#b02838", b: "#3890f0", B: "#2060b8" },
  solid: { x: 0, y: 12, w: 54, h: 12 },
});

// ── Outdoor chalkboard on an easel ───────────────────────────────────────────
export const CHALKBOARD = defineProp({
  rows: (() => {
    const g = blank(34, 34);
    // legs (A-frame)
    line(g, 5, 22, 2, 33, "u");
    line(g, 28, 22, 31, 33, "u");
    line(g, 6, 22, 3, 33, "t");
    line(g, 29, 22, 32, 33, "U");
    // frame
    rect(g, 0, 0, 34, 26, "t");
    rect(g, 33, 0, 1, 26, "U");
    rect(g, 0, 25, 34, 1, "U");
    rect(g, 2, 2, 30, 21, "g");
    rect(g, 2, 2, 30, 1, "G");
    rect(g, 2, 2, 1, 21, "G");
    text(g, 4, 4, "2+2=4", "w");
    text(g, 4, 11, "HOLA!", "y");
    text(g, 23, 16, "♥", "p");
    line(g, 4, 18, 18, 18, "w");
    // chalk tray
    rect(g, 2, 23, 30, 2, "u");
    put(g, 8, 23, "w"); put(g, 9, 23, "w"); put(g, 14, 23, "p");
    return rowsOf(g);
  })(),
  pal: { t: "#d89858", u: "#b07038", U: "#7c4824", g: "#2c6448", G: "#3c7c5c", w: "#f8f8f0", y: "#f8e070", p: "#f8a0c8" },
  solid: { x: 1, y: 26, w: 34, h: 9 },
});

// ── Backpacks & balls ────────────────────────────────────────────────────────
function backpack(a: string, b: string, c: string) {
  return defineProp({
    rows: [
      "...ddd....",
      "..d...d...",
      ".aaaaaab..",
      "aabbbbbbc.",
      "abbbbbbbc.",
      "abkkkkkbc.",
      "abkaaabkc.",
      "abkbbbbkc.",
      "abkkykkbc.",
      "abbbbbbbc.",
      ".cccccccc.",
    ],
    pal: { a, b, c, d: c, k: c, y: "#f8d048" },
    solid: { x: 0, y: 6, w: 11, h: 7 },
  });
}
export const BACKPACK_RED = backpack("#ff8878", "#e84838", "#a82828");
export const BACKPACK_BLUE = backpack("#88b8ff", "#3c78e0", "#2850a8");
export const BACKPACK_YELLOW = backpack("#fff090", "#f8c830", "#c08818");
export const BACKPACK_PINK = backpack("#ffc0e0", "#f070b0", "#b84080");
export const BACKPACK_GREEN = backpack("#b0f090", "#58b848", "#2c7c30");

export const BALL_SOCCER = defineProp({
  rows: [
    "..oww..",
    ".wwkkw.",
    "wkwkkwo",
    "wwwwwwW",
    "wkkwwkW",
    ".wkwWW.",
    "..WWW..",
  ],
  pal: { o: "#ffffff", w: "#f0f0f8", W: "#b8b8c8", k: "#303040" },
  solid: null,
});
export const BALL_BASKET = defineProp({
  rows: [
    "..aob..",
    ".abkbb.",
    "abbkbbc",
    "kkkkkkk",
    "bbbkbbc",
    ".bbkcc.",
    "..ccc..",
  ],
  pal: { o: "#ffd0a0", a: "#ffa860", b: "#f08030", c: "#b85818", k: "#683018" },
  solid: null,
});

/** School-bag pile / lunch box detail: an apple on the ground. */
export const APPLE = defineProp({
  rows: [
    "...g.",
    "..gl.",
    ".rrrr",
    "rorrR",
    "rrrrR",
    ".RRR.",
  ],
  pal: { g: "#7a4a2a", l: "#58b848", r: "#f04848", R: "#b02838", o: "#ffb0a0" },
  solid: null,
});

