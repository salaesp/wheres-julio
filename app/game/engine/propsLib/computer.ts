// Motherboard components for "Adentro de la Compu": CPU cooler with spinning
// fan, RAM, chips, capacitors, resistors, blinking LEDs, slots and cables.
import { defineProp, type PropDef } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { lathe } from "./chess";

function ellipse(g: CharGrid, cx: number, cy: number, rx: number, ry: number, ch: string | ((nx: number, ny: number) => string)) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
    if (nx * nx + ny * ny <= 1) put(g, x, y, typeof ch === "string" ? ch : ch(nx, ny));
  }
}

// Tiny 3×5 silkscreen font.
const FONT: Record<string, string[]> = {
  A: [".#.", "#.#", "###", "#.#", "#.#"], B: ["##.", "#.#", "##.", "#.#", "##."],
  C: [".##", "#..", "#..", "#..", ".##"], D: ["##.", "#.#", "#.#", "#.#", "##."],
  E: ["###", "#..", "##.", "#..", "###"], F: ["###", "#..", "##.", "#..", "#.."],
  I: ["###", ".#.", ".#.", ".#.", "###"], M: ["#.#", "###", "###", "#.#", "#.#"],
  P: ["##.", "#.#", "##.", "#..", "#.."], R: ["##.", "#.#", "##.", "#.#", "#.#"],
  S: [".##", "#..", ".#.", "..#", "##."], T: ["###", ".#.", ".#.", ".#.", ".#."],
  U: ["#.#", "#.#", "#.#", "#.#", "###"], X: ["#.#", "#.#", ".#.", "#.#", "#.#"],
  N: ["##.", "#.#", "#.#", "#.#", "#.#"], O: [".#.", "#.#", "#.#", "#.#", ".#."],
  "0": ["###", "#.#", "#.#", "#.#", "###"], "1": [".#.", "##.", ".#.", ".#.", "###"],
  "2": ["##.", "..#", ".#.", "#..", "###"], "3": ["##.", "..#", ".#.", "..#", "##."],
  "4": ["#.#", "#.#", "###", "..#", "..#"], "6": [".##", "#..", "###", "#.#", "###"],
  "+": ["...", ".#.", "###", ".#.", "..."], "-": ["...", "...", "###", "...", "..."],
  " ": ["...", "...", "...", "...", "..."],
};
function text(g: CharGrid, x: number, y: number, s: string, ch: string) {
  [...s].forEach((c, i) => {
    const gl = FONT[c] ?? FONT[" "];
    gl.forEach((r, yy) => { for (let xx = 0; xx < 3; xx++) if (r[xx] === "#") put(g, x + i * 4 + xx, y + yy, ch); });
  });
}

/** White silkscreen label printed on the PCB (flat). */
export function silk(label: string): PropDef {
  const g = blank(label.length * 4 - 1, 5);
  text(g, 0, 0, label, "w");
  return defineProp({ rows: rowsOf(g), pal: { w: "#effaf0" }, flat: true, outline: false });
}

// ── CPU cooler: tower heatsink fins + big spinning fan seen from above ─────
function fanFrame(f: number): string[] {
  const W = 66, H = 78;
  const g = blank(W, H);
  // heatsink fins (front face) under the fan
  for (let y = 52; y < 72; y++) for (let x = 2; x < 64; x++) {
    const col = (x - 2) % 4;
    put(g, x, y, y === 71 ? "S" : col === 0 ? "s" : col === 3 ? "S" : "t");
  }
  for (let x = 2; x < 64; x++) put(g, x, 52, "s");
  // copper heat pipes looping out at the sides
  for (const px of [6, 54]) {
    rect(g, px, 58, 6, 14, "o");
    rect(g, px, 58, 2, 14, "O");
    rect(g, px + 4, 58, 2, 14, "q");
    rect(g, px, 72, 6, 2, "q");
  }
  // socket bracket peeking out at the bottom
  rect(g, 0, 72, 66, 4, "K");
  rect(g, 0, 72, 66, 1, "n");
  rect(g, 0, 76, 66, 2, "k");
  // fan housing (top face)
  rect(g, 1, 0, 64, 54, "b");
  rect(g, 0, 1, 66, 52, "b");
  rect(g, 1, 0, 64, 2, "a");
  rect(g, 0, 1, 2, 52, "a");
  rect(g, 63, 2, 3, 51, "c");
  rect(g, 1, 52, 64, 3, "d");
  rect(g, 1, 52, 64, 1, "c");
  // screws in the corners
  for (const [sx, sy] of [[4, 3], [58, 3], [4, 44], [58, 44]]) {
    stamp(g, sx, sy, [".mm.", "mnnm", "mnnm", ".mm."].map((r) => r));
    put(g, sx + 1, sy + 1, "m");
  }
  // round opening with spinning blades
  const cx = 33, cy = 26.5, R = 24;
  const N = 7;
  const rot = (f / 4) * (Math.PI * 2 / N);
  for (let y = 0; y < 54; y++) for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    const rr = Math.sqrt(dx * dx + dy * dy);
    if (rr > R + 1.2) continue;
    if (rr > R - 0.4) { put(g, x, y, dx + dy < 0 ? "d" : "a"); continue; }
    let ch = "k";
    if (rr > 6.5) {
      const th = Math.atan2(dy, dx);
      let u = ((th + rot - rr * 0.035) / (Math.PI * 2 / N)) % 1;
      if (u < 0) u += 1;
      if (u < 0.55) ch = u < 0.12 ? "w" : u > 0.42 ? "v" : "l";
      else if (rr > R - 2.5) ch = "K";
    }
    put(g, x, y, ch);
  }
  // hub with sticker
  ellipse(g, cx, cy, 7, 7, (nx, ny) => (nx + ny < -0.6 ? "w" : nx + ny > 0.8 ? "v" : "l"));
  ellipse(g, cx, cy, 5, 5, (nx, ny) => (nx + ny < -0.4 ? "R" : nx + ny > 0.7 ? "e" : "r"));
  put(g, 31, 25, "w"); put(g, 32, 25, "w"); put(g, 31, 26, "w"); put(g, 33, 27, "w"); put(g, 34, 28, "w");
  return rowsOf(g);
}

export const CPU_FAN = defineProp({
  frames: [0, 1, 2, 3].map(fanFrame),
  fps: 12,
  pal: {
    a: "#98b8ff", b: "#5c80e0", c: "#4460b8", d: "#2c3c88",
    k: "#1c2038", K: "#2c3048", l: "#a8e0f8", w: "#e8fbff", v: "#6cb0e0",
    r: "#f05858", R: "#ff9090", e: "#b83040",
    m: "#e0e4f0", n: "#9098b0",
    s: "#f4f8ff", t: "#c8d0e0", S: "#8c94ac",
    o: "#e88850", O: "#ffc090", q: "#b05830",
  },
  solid: { x: 1, y: 30, w: 66, h: 50 },
  baseY: 80,
});

// ── VRM choke (gray ferrite cube) ───────────────────────────────────────────
export const CHOKE = defineProp({
  rows: (() => {
    const g = blank(14, 14);
    rect(g, 0, 0, 14, 6, "a");
    rect(g, 0, 0, 14, 1, "w");
    rect(g, 0, 6, 14, 7, "b");
    rect(g, 12, 6, 2, 7, "c");
    rect(g, 0, 12, 14, 1, "c");
    text(g, 1, 0, "R2", "n");
    rect(g, 2, 13, 3, 1, "m"); rect(g, 9, 13, 3, 1, "m");
    return rowsOf(g);
  })(),
  pal: { w: "#f4f6fc", a: "#c8ccd8", b: "#9ca2b4", c: "#767c94", n: "#5c6078", m: "#e8e8f0" },
  solid: { x: 0, y: 4, w: 16, h: 12 },
});

// ── Electrolytic capacitors (cylinders with scored silver tops) ────────────
function capRows(w: number, h: number): string[] {
  const g = blank(w, h);
  const cx = w / 2;
  lathe(g, cx, 3, Array(h - 4).fill(cx), "abcd");
  // polarity stripe
  for (let y = 4; y < h - 1; y++) { put(g, Math.floor(cx * 0.55), y, "s"); put(g, Math.floor(cx * 0.55) + 1, y, y % 3 === 0 ? "S" : "s"); }
  // dark ring under the lid + bottom
  for (let x = 0; x < w; x++) { if (g[4][x] !== ".") g[4][x] = g[4][x] === "a" ? "b" : g[4][x] === "b" ? "c" : "d"; }
  // lid
  ellipse(g, cx, 3, cx, 2.6, (nx, ny) => (nx + ny < -0.7 ? "w" : nx + ny > 0.5 ? "n" : "m"));
  put(g, Math.floor(cx), 2, "n"); put(g, Math.floor(cx), 3, "n"); put(g, Math.floor(cx) - 1, 3, "n"); put(g, Math.floor(cx) + 1, 3, "n");
  return rowsOf(g);
}
const CAP_LID = { w: "#ffffff", m: "#d4d8e4", n: "#9098b0" };
const capProp = (w: number, h: number, sleeve: Record<string, string>) => defineProp({
  rows: capRows(w, h),
  pal: { ...CAP_LID, ...sleeve },
  solid: { x: 1, y: 4, w: w, h: h - 2 },
});
const CAP_BLUE = { a: "#90b8ff", b: "#4c7ce8", c: "#3858c0", d: "#283c90", s: "#d8e4ff", S: "#90a8e0" };
const CAP_PURPLE = { a: "#d8a8ff", b: "#9c60e0", c: "#7844b8", d: "#502c88", s: "#f0e0ff", S: "#c0a0e0" };
const CAP_BLACK = { a: "#6c6c88", b: "#3c3c54", c: "#2c2c40", d: "#1e1e2e", s: "#f8d068", S: "#c89830" };
const CAP_GREEN = { a: "#a8f0a0", b: "#58c060", c: "#40a048", d: "#2c7838", s: "#f0fff0", S: "#a0d8a0" };
export const CAP_BIG_BLUE = capProp(14, 22, CAP_BLUE);
export const CAP_BIG_PURPLE = capProp(14, 22, CAP_PURPLE);
export const CAP_BLUE_S = capProp(10, 15, CAP_BLUE);
export const CAP_PURPLE_S = capProp(10, 15, CAP_PURPLE);
export const CAP_BLACK_S = capProp(10, 15, CAP_BLACK);
export const CAP_BLACK_BIG = capProp(14, 22, CAP_BLACK);
export const CAP_GREEN_S = capProp(10, 15, CAP_GREEN);

// ── Resistor (through-hole, color bands) ────────────────────────────────────
function resistorRows(bands: string): string[] {
  const g = blank(20, 7);
  // leads to solder pads
  rect(g, 2, 3, 16, 1, "m");
  for (const px of [0, 17]) { stamp(g, px, 2, ["gGh", "GGh", "hhh"]); }
  // body
  rect(g, 5, 1, 10, 5, "b");
  rect(g, 6, 0, 8, 1, "a");
  rect(g, 5, 1, 10, 1, "a");
  rect(g, 6, 6, 8, 1, "c");
  rect(g, 5, 5, 10, 1, "c");
  rect(g, 4, 2, 1, 3, "b"); rect(g, 15, 2, 1, 3, "c");
  [...bands].forEach((b, i) => { const x = 6 + i * 2 + (i === 3 ? 1 : 0); rect(g, x, 0, 1, 7, b); });
  return rowsOf(g);
}
const RES_PAL = {
  a: "#fff0c8", b: "#f0d098", c: "#c8a068", m: "#c8ccd8", g: "#fff0a0", G: "#e8b848", h: "#b08030",
  r: "#e04040", o: "#f89030", y: "#f8e048", k: "#383040", u: "#4878e0", v: "#a060d8", n: "#a06030",
};
export const RESISTOR_A = defineProp({ rows: resistorRows("rvoy"), pal: RES_PAL, flat: true });
export const RESISTOR_B = defineProp({ rows: resistorRows("nkry"), pal: RES_PAL, flat: true });
export const RESISTOR_C = defineProp({ rows: resistorRows("yvku"), pal: RES_PAL, flat: true });

// ── Blinking LEDs ───────────────────────────────────────────────────────────
function ledRows(on: boolean): string[] {
  const g = blank(9, 13);
  // legs
  rect(g, 2, 10, 1, 3, "m"); rect(g, 6, 10, 1, 3, "m");
  // rim
  rect(g, 0, 8, 9, 2, "c");
  rect(g, 0, 8, 9, 1, "b");
  // dome
  lathe(g, 4.5, 2, [2.5, 3.5, 4, 4, 4, 4], "abcd");
  blobs(g, [{ x: 4.5, y: 3.2, rx: 4, ry: 3.2 }], "abcd", { crease: false, hi: 0.3 });
  put(g, 2, 2, "w"); put(g, 3, 2, on ? "w" : "a"); put(g, 2, 3, on ? "w" : "a");
  if (on) { put(g, 4, 4, "a"); put(g, 5, 4, "a"); put(g, 4, 5, "a"); }
  return rowsOf(g);
}
function led(on: Record<string, string>, off: Record<string, string>, pattern: number[]): PropDef {
  // frames alternate between "on" and "off" palettes by duplicating rows with
  // different letters: on uses a-d, off uses A-D.
  const ON = ledRows(true), OFF = ledRows(false).map((r) => r.replace(/[abcd]/g, (c) => c.toUpperCase()));
  return defineProp({
    frames: pattern.map((p) => (p ? ON : OFF)),
    fps: 3,
    pal: { ...on, A: off.a, B: off.b, C: off.c, D: off.d, w: "#ffffff", m: "#c8ccd8" },
    solid: { x: 1, y: 8, w: 9, h: 6 },
  });
}
export const LED_RED = led({ a: "#ffb0a8", b: "#ff5048", c: "#d02838", d: "#901828" }, { a: "#c87878", b: "#a04048", c: "#802838", d: "#601828" }, [1, 1, 0, 1, 0, 0]);
export const LED_GREEN = led({ a: "#d0ffb0", b: "#68f060", c: "#38c040", d: "#208830" }, { a: "#80b080", b: "#408850", c: "#306840", d: "#204830" }, [1, 0, 1, 0, 1, 1]);
export const LED_BLUE = led({ a: "#c0e8ff", b: "#50b0ff", c: "#2878e0", d: "#1c4ca0" }, { a: "#8090b8", b: "#405890", c: "#304070", d: "#203050" }, [1, 1, 1, 0]);
export const LED_YELLOW = led({ a: "#fff8c0", b: "#f8e040", c: "#d0a820", d: "#987018" }, { a: "#b8b088", b: "#988850", c: "#706030", d: "#504020" }, [0, 1, 0, 1, 1, 0, 0, 0]);

// ── Chips ───────────────────────────────────────────────────────────────────
/** DIP chip, horizontal: black body, legs along the front, label. */
function dipRows(w: number, label: string): string[] {
  const g = blank(w, 22);
  // back legs peeking above
  for (let x = 3; x < w - 3; x += 4) { rect(g, x, 0, 2, 2, "m"); put(g, x + 1, 1, "n"); }
  // top face
  rect(g, 0, 2, w, 10, "b");
  rect(g, 0, 2, w, 1, "a");
  rect(g, 0, 2, 1, 10, "a");
  rect(g, w - 1, 3, 1, 9, "c");
  // notch + dot
  stamp(g, 0, 5, ["kk", "kkk", "kk"].map((r) => r));
  put(g, 4, 9, "w"); put(g, 5, 9, "W");
  // label
  text(g, 7, 5, label, "e");
  // front face
  rect(g, 0, 12, w, 4, "c");
  rect(g, 0, 15, w, 1, "d");
  // front legs: bend down to the board
  for (let x = 3; x < w - 3; x += 4) {
    rect(g, x, 16, 2, 4, "m");
    put(g, x + 1, 16, "n"); put(g, x + 1, 17, "n"); put(g, x + 1, 18, "n"); put(g, x + 1, 19, "n");
    rect(g, x - 1, 20, 4, 2, "G"); put(g, x - 1, 20, "g");
  }
  return rowsOf(g);
}
const CHIP_PAL = {
  a: "#6c6884", b: "#3c3850", c: "#2c283c", d: "#1c1828", k: "#24202e",
  w: "#ffffff", W: "#b8b8c8", e: "#8c88a4", m: "#e4e8f4", n: "#a0a4b8", g: "#fff0a0", G: "#e8b848",
};
export const CHIP_BIG = defineProp({ rows: dipRows(56, "ATM6"), pal: CHIP_PAL, solid: { x: 0, y: 3, w: 58, h: 20 } });
export const CHIP_MED = defineProp({ rows: dipRows(36, "IC2"), pal: CHIP_PAL, solid: { x: 0, y: 3, w: 38, h: 20 } });
export const CHIP_SMALL = defineProp({ rows: dipRows(24, "U1"), pal: CHIP_PAL, solid: { x: 0, y: 3, w: 26, h: 20 } });

/** Square QFP chip (chipset) with pins on all sides and a shiny logo. */
export const CHIPSET = defineProp({
  rows: (() => {
    const W = 44, H = 44;
    const g = blank(W, H);
    // pins
    for (let i = 6; i < 38; i += 3) {
      rect(g, i, 0, 2, 4, "m"); put(g, i + 1, 1, "n");         // top
      rect(g, 0, i, 4, 2, "m"); put(g, 1, i + 1, "n");         // left
      rect(g, W - 4, i, 4, 2, "n");                            // right
      rect(g, i, H - 6, 2, 5, "m"); put(g, i + 1, H - 5, "n"); // bottom (longer: seen in front)
    }
    // body top
    rect(g, 4, 4, 36, 32, "b");
    rect(g, 4, 4, 36, 1, "a");
    rect(g, 4, 4, 1, 32, "a");
    rect(g, 39, 5, 1, 31, "c");
    // front face
    rect(g, 4, 36, 36, 3, "c");
    rect(g, 4, 38, 36, 1, "d");
    // shiny metal lid with logo
    rect(g, 9, 9, 26, 22, "s");
    rect(g, 9, 9, 26, 1, "w");
    rect(g, 9, 9, 1, 22, "w");
    rect(g, 34, 10, 1, 21, "S");
    rect(g, 10, 30, 25, 1, "S");
    for (let i = 0; i < 6; i++) { put(g, 12 + i, 12 + i, "w"); put(g, 13 + i, 12 + i, "w"); }
    text(g, 14, 18, "CPU", "e");
    text(g, 14, 24, "X64", "e");
    put(g, 6, 33, "w");
    return rowsOf(g);
  })(),
  pal: { ...CHIP_PAL, s: "#d8dce8", S: "#9ca0b8", e: "#5c6078" },
  solid: { x: 2, y: 8, w: 44, h: 38 },
});

// ── RAM: slot + stick with heat spreader (RGB bar animates) ────────────────
function ramFrame(color: "r" | "u", rgb: number): string[] {
  const W = 116, H = 22;
  const g = blank(W, H);
  // slot base + latches
  rect(g, 0, 15, W, 6, "K");
  rect(g, 0, 15, W, 1, "J");
  rect(g, 0, 20, W, 1, "k");
  for (const lx of [0, W - 5]) { rect(g, lx, 6, 5, 15, "L"); rect(g, lx, 6, 5, 1, "w"); rect(g, lx + 4, 7, 1, 14, "M"); }
  // the stick
  const A = color === "r" ? "1" : "5", B = color === "r" ? "2" : "6", C = color === "r" ? "3" : "7", D = color === "r" ? "4" : "8";
  rect(g, 6, 2, W - 12, 13, B);
  rect(g, 6, 2, W - 12, 1, A);
  rect(g, 6, 2, 1, 13, A);
  rect(g, W - 7, 3, 1, 12, C);
  rect(g, 6, 13, W - 12, 2, C);
  rect(g, 6, 14, W - 12, 1, D);
  // fins / chevrons on the spreader
  for (let x = 12; x < W - 12; x += 6) { put(g, x, 6, A); put(g, x + 1, 7, A); put(g, x + 2, 8, A); put(g, x + 1, 9, C); put(g, x, 10, C); }
  // label plate
  rect(g, 44, 5, 28, 6, "P");
  rect(g, 44, 5, 28, 1, "w");
  rect(g, 44, 10, 28, 1, "Q");
  text(g, 46, 6, "DDR4", "k");
  // RGB light bar on top
  const hues = ["R", "O", "Y", "G", "U", "V"];
  for (let x = 7; x < W - 7; x++) {
    const h = hues[Math.floor(((x + rgb * 6) / 10)) % hues.length];
    put(g, x, 0, h); put(g, x, 1, h);
  }
  return rowsOf(g);
}
const RAM_PAL = {
  K: "#2c2c3c", J: "#4c4c64", k: "#1c1c28", L: "#f0f0f8", M: "#b8b8cc", w: "#ffffff",
  "1": "#ff9888", "2": "#e84848", "3": "#b83040", "4": "#802030",
  "5": "#90c0ff", "6": "#4c80e8", "7": "#3858c0", "8": "#283c90",
  P: "#e8ecf4", Q: "#a8acc0",
  R: "#ff6070", O: "#ffa850", Y: "#fff070", G: "#80f080", U: "#70b0ff", V: "#c088ff",
};
export const RAM_RED = defineProp({
  frames: Array.from({ length: 10 }, (_, i) => ramFrame("r", i)), fps: 6, pal: RAM_PAL,
  solid: { x: 0, y: 8, w: 118, h: 16 },
});
export const RAM_BLUE = defineProp({
  frames: Array.from({ length: 10 }, (_, i) => ramFrame("u", i)), fps: 6, pal: RAM_PAL,
  solid: { x: 0, y: 8, w: 118, h: 16 },
});
export const RAM_SLOT_EMPTY = defineProp({
  rows: (() => {
    const W = 116;
    const g = blank(W, 12);
    rect(g, 0, 4, W, 7, "K");
    rect(g, 0, 4, W, 1, "J");
    rect(g, 6, 6, W - 12, 2, "k");
    for (let x = 7; x < W - 7; x += 2) put(g, x, 7, "g");
    rect(g, 0, 10, W, 1, "k");
    // open latches tilted outward
    stamp(g, 0, 0, ["LL...", ".LLL.", "..LLL", "..LLL", "..LLM", "..LLM", "..LLM", "..LLM", "..LLM", "..LLM", "..LLM"]);
    stamp(g, W - 5, 0, ["...LL", ".LLL.", "LLM..", "LLM..", "LLM..", "LLM..", "LLM..", "LLM..", "LLM..", "LLM..", "LLM.."]);
    return rowsOf(g);
  })(),
  pal: { ...RAM_PAL, g: "#e8b848" },
  solid: { x: 0, y: 4, w: 118, h: 9 },
});

// ── PCIe slots ──────────────────────────────────────────────────────────────
function pcieRows(w: number, notch: number): string[] {
  const g = blank(w, 10);
  rect(g, 0, 1, w, 8, "b");
  rect(g, 0, 1, w, 1, "a");
  rect(g, 0, 8, w, 1, "c");
  rect(g, 2, 3, w - 4, 3, "k");
  for (let x = 3; x < w - 3; x += 2) put(g, x, 5, "g");
  rect(g, notch, 1, 2, 8, ".");
  rect(g, notch, 6, 2, 3, "k");
  if (w > 60) { rect(g, w - 7, 0, 7, 10, "L"); rect(g, w - 7, 0, 7, 1, "w"); rect(g, w - 1, 1, 1, 9, "M"); }
  return rowsOf(g);
}
export const PCIE_X16 = defineProp({
  rows: pcieRows(150, 22),
  pal: { a: "#90c8ff", b: "#5c98e8", c: "#3c68b8", k: "#1c2440", g: "#f0c050", L: "#f0f0f8", M: "#b8b8cc", w: "#ffffff" },
  solid: { x: 0, y: 1, w: 152, h: 10 },
});
export const PCIE_X16_DARK = defineProp({
  rows: pcieRows(150, 22),
  pal: { a: "#7c7c98", b: "#4c4c64", c: "#34344a", k: "#14141e", g: "#f0c050", L: "#f0f0f8", M: "#b8b8cc", w: "#ffffff" },
  solid: { x: 0, y: 1, w: 152, h: 10 },
});
export const PCIE_X1 = defineProp({
  rows: pcieRows(40, 10),
  pal: { a: "#7c7c98", b: "#4c4c64", c: "#34344a", k: "#14141e", g: "#f0c050" },
  solid: { x: 0, y: 1, w: 42, h: 10 },
});

// ── CMOS coin battery in its holder ─────────────────────────────────────────
export const BATTERY = defineProp({
  rows: (() => {
    const g = blank(34, 24);
    // black holder
    ellipse(g, 17, 12, 17, 10, "K");
    rect(g, 0, 12, 34, 8, "K");
    ellipse(g, 17, 20, 17, 4, "K");
    // coin edge (thickness)
    ellipse(g, 16, 13, 14, 8, "n");
    ellipse(g, 16, 11, 14, 8, (nx, ny) => (nx + ny < -0.9 ? "w" : nx + ny < 0.1 ? "m" : nx + ny < 0.8 ? "s" : "n"));
    // engraved +
    text(g, 9, 6, "+", "n");
    text(g, 13, 9, "3", "n"); text(g, 17, 9, "0", "n");
    // spring clip
    rect(g, 28, 4, 5, 14, "c"); rect(g, 28, 4, 5, 1, "w"); rect(g, 32, 5, 1, 13, "n");
    return rowsOf(g);
  })(),
  pal: { K: "#34303c", w: "#ffffff", m: "#e0e4ee", s: "#c0c6d6", n: "#8890a8", c: "#d8dce8" },
  solid: { x: 1, y: 6, w: 34, h: 20 },
});

// ── 7-segment debug display (animated POST codes) ───────────────────────────
const SEG: Record<string, string> = { "0": "abcdef", "8": "abcdefg", A: "abcefg", F: "aefg", b: "cdefg", "4": "bcfg", d: "bcdeg", "2": "abdeg", C: "adef" };
function digit(g: CharGrid, x: number, y: number, ch: string) {
  const on = SEG[ch] ?? "";
  const s = (k: string) => (on.includes(k) ? "r" : "q");
  for (let i = 1; i < 5; i++) { put(g, x + i, y, s("a")); put(g, x + i, y + 5, s("g")); put(g, x + i, y + 10, s("d")); }
  for (let i = 1; i < 5; i++) { put(g, x, y + i, s("f")); put(g, x + 5, y + i, s("b")); put(g, x, y + 5 + i, s("e")); put(g, x + 5, y + 5 + i, s("c")); }
}
function postFrame(code: string): string[] {
  const g = blank(22, 20);
  rect(g, 0, 0, 22, 16, "K");
  rect(g, 0, 0, 22, 1, "J");
  rect(g, 0, 16, 22, 2, "k");
  digit(g, 3, 3, code[0]); digit(g, 12, 3, code[1]);
  for (let x = 3; x < 20; x += 4) rect(g, x, 18, 2, 2, "m");
  return rowsOf(g).slice(0, 20);
}
export const POST_DISPLAY = defineProp({
  frames: ["A0", "b4", "d2", "FF", "C0", "88"].map(postFrame),
  fps: 1.2,
  pal: { K: "#2c2c3c", J: "#4c4c64", k: "#1c1c28", r: "#ff5050", q: "#4a2a38", m: "#c8ccd8" },
  solid: { x: 0, y: 4, w: 24, h: 16 },
});

// ── Header pins with jumpers ────────────────────────────────────────────────
function headerRows(n: number, jumpers: number[]): string[] {
  const w = n * 4 + 2;
  const g = blank(w, 14);
  rect(g, 0, 6, w, 7, "K");
  rect(g, 0, 6, w, 1, "J");
  rect(g, 0, 12, w, 1, "k");
  for (let i = 0; i < n; i++) {
    const x = 2 + i * 4;
    // back row
    rect(g, x, 2, 2, 5, "G"); put(g, x, 2, "g"); put(g, x + 1, 2, "g"); put(g, x + 1, 4, "h"); put(g, x + 1, 5, "h");
    // front row
    rect(g, x, 5, 2, 5, "G"); put(g, x, 5, "g"); put(g, x + 1, 5, "g"); put(g, x + 1, 8, "h"); put(g, x + 1, 9, "h");
  }
  for (const j of jumpers) {
    const x = 1 + j * 4;
    rect(g, x, 0, 4, 9, "u"); rect(g, x, 0, 4, 1, "U"); rect(g, x, 0, 1, 9, "U"); rect(g, x + 3, 1, 1, 8, "v"); rect(g, x, 8, 4, 1, "v");
  }
  return rowsOf(g);
}
const HDR_PAL = { K: "#2c2c3c", J: "#4c4c64", k: "#1c1c28", g: "#fff0a0", G: "#e8b848", h: "#b08030", u: "#4c80e8", U: "#90c0ff", v: "#2c4ca0" };
export const HEADER_A = defineProp({ rows: headerRows(6, [1]), pal: HDR_PAL, solid: { x: 0, y: 6, w: 28, h: 10 } });
export const HEADER_B = defineProp({ rows: headerRows(4, [2]), pal: { ...HDR_PAL, u: "#f05858", U: "#ff9898", v: "#a02838" }, solid: { x: 0, y: 6, w: 20, h: 10 } });

// ── 24-pin ATX power connector with its colorful wires leaving the board ──
export const ATX_POWER = defineProp({
  rows: (() => {
    const g = blank(30, 56);
    // wires to the right edge
    const cols = ["y", "r", "k", "o", "k", "r", "y", "k", "o", "r", "k", "y"];
    cols.forEach((c, i) => {
      const y = 4 + i * 4;
      rect(g, 16, y, 14, 2, c);
      rect(g, 16, y + 2, 14, 1, c.toUpperCase());
    });
    // housing
    rect(g, 0, 0, 16, 52, "b");
    rect(g, 0, 0, 16, 1, "a");
    rect(g, 0, 0, 1, 52, "a");
    rect(g, 14, 1, 2, 51, "c");
    rect(g, 0, 52, 16, 3, "c");
    rect(g, 0, 54, 16, 1, "d");
    for (let i = 0; i < 12; i++) for (const x of [3, 8]) {
      rect(g, x, 3 + i * 4, 4, 3, "h");
      rect(g, x, 3 + i * 4, 4, 1, "d");
    }
    // latch
    rect(g, 5, 23, 6, 6, "a"); rect(g, 5, 28, 6, 1, "c");
    return rowsOf(g);
  })(),
  pal: {
    a: "#ffffff", b: "#eae6dc", c: "#c4bcac", d: "#8c8478", h: "#5c5850",
    y: "#f8e048", Y: "#c8a820", r: "#f05050", R: "#b02838", k: "#4c4c60", K: "#2c2c3c", o: "#f89838", O: "#c06820",
  },
  solid: { x: 0, y: 2, w: 18, h: 54 },
});

// ── Cable plug for the ribbon (IDE connector) ───────────────────────────────
export const RIBBON_PLUG = defineProp({
  rows: (() => {
    const g = blank(14, 22);
    rect(g, 0, 0, 14, 20, "b");
    rect(g, 0, 0, 14, 1, "a");
    rect(g, 0, 0, 1, 20, "a");
    rect(g, 12, 1, 2, 19, "c");
    rect(g, 0, 19, 14, 2, "c");
    rect(g, 0, 21, 14, 1, "d");
    for (let y = 3; y < 18; y += 3) { rect(g, 4, y, 2, 1, "k"); rect(g, 8, y, 2, 1, "k"); }
    rect(g, 2, 8, 2, 4, "r");
    return rowsOf(g);
  })(),
  pal: { a: "#7c7c98", b: "#4c4c64", c: "#34344a", d: "#24243a", k: "#14141e", r: "#f05858" },
  solid: { x: 0, y: 2, w: 16, h: 22 },
});

// ── Mounting screw ─────────────────────────────────────────────────────────
export const SCREW = defineProp({
  rows: [
    "..gGGG..",
    ".gwmmmG.",
    "gwmnnmmh",
    "Gmnmmnmh",
    "Gmmnnmmh",
    ".Gmmmmh.",
    "..hhhh..",
  ],
  pal: { g: "#fff0a0", G: "#e8b848", h: "#b08030", w: "#ffffff", m: "#d4d8e4", n: "#8890a8" },
  flat: true,
});

// ── Colorful wire bundle (flat) following a polyline ────────────────────────
export function wires(w: number, h: number, pts: number[][], colors: string[]): PropDef {
  const g = blank(w, h);
  const K = colors.length;
  for (let s = 0; s + 1 < pts.length; s++) {
    const [x0, y0] = pts[s], [x1, y1] = pts[s + 1];
    const len = Math.max(1, Math.hypot(x1 - x0, y1 - y0));
    const nx = -(y1 - y0) / len, ny = (x1 - x0) / len;
    for (let t = 0; t <= len; t += 0.5) {
      const px = x0 + (x1 - x0) * t / len, py = y0 + (y1 - y0) * t / len;
      for (let k = 0; k < K; k++) {
        const off = (k - (K - 1) / 2) * 2;
        const x = Math.round(px + nx * off), y = Math.round(py + ny * off);
        put(g, x, y, colors[k]);
        put(g, x + 1, y + 1, colors[k].toUpperCase());
      }
    }
  }
  return defineProp({
    rows: rowsOf(g),
    pal: { r: "#f86060", R: "#b83040", y: "#f8e060", Y: "#c0a028", k: "#585870", K: "#30303e", u: "#68a8f8", U: "#3460c0", g: "#78d868", G: "#3c9040", w: "#f8f8ff", W: "#b0b0c8", o: "#f8a048", O: "#c06820" },
    flat: true,
  });
}
