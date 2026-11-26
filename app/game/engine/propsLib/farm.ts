// Farm props: barn, farmhouse, silo, windmill, fences, animals, crops, tractor…
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put } from "../shapes";
import { ellipse, flipRows, line, pad } from "./artkit";

// ════════════════════════════════════════════════════════════════════════════
// Buildings
// ════════════════════════════════════════════════════════════════════════════

// ── Red barn with grey gambrel roof, cupola, X doors and a hayloft ───────────
function barnRows(): string[] {
  const W = 66, H = 70;
  const g = blank(W, H);
  const roofTop = 9, roofBot = 37, wallTop = 38, wallBot = H - 1;
  for (let y = roofTop; y <= roofBot; y++) {
    const ry = y - roofTop;
    const inset = ry < 12 ? Math.max(0, 3 - Math.floor(ry / 3)) : 0;
    for (let x = inset; x < W - inset; x++) {
      let c: string;
      if (ry <= 1) c = "t";
      else if (ry === 2) c = "q";
      else if (ry < 13) c = (ry - 3) % 4 === 3 ? "s" : "r";
      else if (ry === 13) c = "q";
      else if (y === roofBot) c = "t";
      else c = (ry - 14) % 4 === 3 ? "t" : "s";
      // shingle notches on the line rows, staggered
      const band = Math.floor(ry / 4);
      if (ry > 2 && ry !== 13 && y < roofBot - 1 && (ry - 3) % 4 === 0 && (x + band * 4) % 8 === 0) c = ry < 13 ? "s" : "t";
      // lit left edge / dark right edge
      if (x <= inset + 1 && ry > 1 && y < roofBot) c = ry < 13 ? "q" : "r";
      if (x >= W - inset - 2 && ry > 1 && y < roofBot) c = "t";
      g[y][x] = c;
    }
  }
  // cupola on the ridge
  stamp(g, 27, 0, pad([
    ".....kk.....",
    "....tttt....",
    "...trrrst...",
    "..trrrrsst..",
    ".tttttttttt.",
    "..abbbbbbc..",
    "..abkdkdbc..",
    "..abkdkdbc..",
    "..abkdkdbc..",
    "..abbbbbbc..",
    "..cccccccc..",
  ]));
  // walls
  for (let y = wallTop; y <= wallBot; y++) {
    for (let x = 2; x < W - 2; x++) {
      let c = (x - 2) % 5 === 4 ? "c" : "b";
      if ((x - 2) % 5 === 0 && y % 7 === 0) c = "a";
      if (y === wallTop) c = "d";
      else if (y === wallTop + 1) c = "c";
      if (x <= 3) c = x === 2 ? "w" : "W";
      if (x >= W - 4) c = x === W - 4 ? "w" : "W";
      if (y >= wallBot - 1) c = y === wallBot ? "O" : "o";
      g[y][x] = c;
    }
  }
  // big double door with X braces
  const dx = 23, dy = 50, dw = 20;
  rect(g, dx, dy, dw, wallBot - dy + 1, "w");
  rect(g, dx + dw - 1, dy, 1, wallBot - dy + 1, "W");
  for (const lx of [dx + 2, dx + 11]) {
    rect(g, lx, dy + 2, 7, wallBot - dy - 2, "e");
    rect(g, lx, dy + 2, 7, 1, "d");
    line(g, lx, dy + 3, lx + 6, wallBot - 1, "w");
    line(g, lx + 6, dy + 3, lx, wallBot - 1, "w");
  }
  rect(g, dx + 9, dy + 2, 2, wallBot - dy - 1, "W");
  put(g, dx + 8, dy + 10, "y"); put(g, dx + 11, dy + 10, "y");
  // hayloft
  rect(g, 28, 41, 10, 8, "w");
  rect(g, 37, 41, 1, 8, "W");
  rect(g, 30, 43, 6, 5, "k");
  stamp(g, 30, 45, ["y.yy.y", "yYyyYy", "YYYYYY"]);
  rect(g, 31, 38, 4, 2, "O");
  // side windows
  for (const wx of [7, 49]) {
    rect(g, wx, 44, 10, 9, "w");
    rect(g, wx + 9, 44, 1, 9, "W");
    rect(g, wx + 1, 45, 8, 7, "g");
    rect(g, wx + 4, 45, 1, 7, "w");
    rect(g, wx + 1, 48, 8, 1, "w");
    put(g, wx + 1, 45, "G"); put(g, wx + 2, 45, "G"); put(g, wx + 1, 46, "G");
    put(g, wx + 5, 49, "G"); put(g, wx + 5, 50, "G");
  }
  return rowsOf(g);
}

export const BARN = defineProp({
  rows: barnRows(),
  pal: {
    q: "#c8ccdc", r: "#9aa0b8", s: "#767c9c", t: "#575c7e",
    a: "#f88068", b: "#d84838", c: "#b03028", d: "#842024", e: "#a02c2c",
    w: "#f8f8f0", W: "#c8c8d8", g: "#405890", G: "#88a8e0",
    y: "#f8d860", Y: "#c89830", o: "#b0a8a0", O: "#80786c", k: "#3c2028",
  },
  solid: { x: 1, y: 42, w: 66, h: 30 },
});

// ── Farmhouse: cream siding, blue roof, chimney, flower boxes ────────────────
function houseRows(): string[] {
  const W = 58, H = 60;
  const g = blank(W, H);
  // chimney (behind roof)
  rect(g, 41, 0, 7, 16, "m");
  rect(g, 46, 0, 2, 16, "M");
  rect(g, 40, 0, 9, 2, "o");
  rect(g, 40, 1, 9, 1, "O");
  for (let y = 4; y < 16; y += 3) for (let x = 41 + (y % 2) * 2; x < 46; x += 4) put(g, x, y, "M");
  const roofTop = 8, roofBot = 34;
  for (let y = roofTop; y <= roofBot; y++) {
    const ry = y - roofTop;
    const inset = Math.max(0, 4 - Math.floor(ry / 2));
    for (let x = inset; x < W - inset; x++) {
      let c = "r";
      if (ry === 0) c = "t";
      else if (ry === 1) c = "q";
      else if ((ry - 2) % 4 === 3) c = "s";
      if ((ry - 2) % 4 === 0 && ry > 1 && (x + Math.floor(ry / 4) * 3) % 7 === 0) c = "s";
      if (x <= inset + 1 && ry > 0) c = "q";
      if (x >= W - inset - 2 && ry > 0) c = "t";
      if (y === roofBot) c = "t";
      if (y === roofBot - 1 && c === "r") c = "s";
      g[y][x] = c;
    }
  }
  // walls
  for (let y = roofBot + 1; y < H; y++) {
    for (let x = 2; x < W - 2; x++) {
      let c = (y - roofBot) % 4 === 0 ? "c" : "b";
      if (y === roofBot + 1) c = "d";
      if (x === 2) c = "a";
      if (x === W - 3) c = "d";
      if (y >= H - 2) c = y === H - 1 ? "O" : "o";
      g[y][x] = c;
    }
  }
  // door
  rect(g, 25, 43, 9, H - 43, "u");
  rect(g, 26, 44, 7, H - 45, "v");
  rect(g, 27, 46, 2, 5, "V"); rect(g, 30, 46, 2, 5, "V");
  rect(g, 27, 53, 2, 4, "V"); rect(g, 30, 53, 2, 4, "V");
  put(g, 31, 51, "y");
  rect(g, 23, H - 1, 13, 1, "o");
  // windows with flower boxes
  for (const wx of [7, 39]) {
    rect(g, wx, 39, 12, 10, "w");
    rect(g, wx + 11, 39, 1, 10, "W");
    rect(g, wx + 1, 40, 10, 8, "g");
    rect(g, wx + 5, 40, 1, 8, "w");
    rect(g, wx + 1, 43, 10, 1, "w");
    put(g, wx + 1, 40, "G"); put(g, wx + 2, 40, "G"); put(g, wx + 1, 41, "G");
    put(g, wx + 6, 44, "G"); put(g, wx + 7, 44, "G"); put(g, wx + 6, 45, "G");
    stamp(g, wx - 1, 48, [
      ".fFy.fy.Fyf.",
      "uuuuuuuuuuuu",
      "UUUUUUUUUUUU",
    ]);
  }
  return rowsOf(g);
}

export const FARMHOUSE = defineProp({
  rows: houseRows(),
  pal: {
    q: "#a8d8ff", r: "#6c9ce8", s: "#4c74c8", t: "#34509c",
    a: "#fffbe8", b: "#f4e4bc", c: "#dcc898", d: "#b8a070",
    m: "#d47858", M: "#a04c3c", o: "#b8b0a8", O: "#888078",
    u: "#7c4c2c", U: "#5a3420", v: "#b07848", V: "#946038", y: "#f8d860",
    w: "#ffffff", W: "#c8c8d8", g: "#78a8e8", G: "#d8ecff",
    f: "#f85868", F: "#f8a0d0",
  },
  solid: { x: 1, y: 36, w: 58, h: 26 },
});

// ── Grain silo (metal cylinder with a red dome and a ladder) ─────────────────
function siloRows(): string[] {
  const W = 22, H = 62;
  const g = blank(W, H);
  blobs(g, [{ x: 11, y: 12, rx: 10.8, ry: 11 }], "efgh", { crease: false, hi: 0.3 });
  for (let y = 12; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let c = x <= 1 ? "c" : x <= 5 ? "a" : x <= 11 ? "b" : x <= 17 ? "c" : "d";
      if (y % 8 === 3) c = x <= 11 ? "c" : "d";
      if (y === 12) c = "d";
      g[y][x] = c;
    }
  }
  // cap ring
  rect(g, 0, 11, W, 1, "h");
  // ladder
  for (let y = 6; y < H - 1; y++) {
    put(g, 14, y, "k"); put(g, 17, y, "k");
    if (y % 3 === 0) { put(g, 15, y, "k"); put(g, 16, y, "k"); }
  }
  // hatch door
  rect(g, 3, H - 10, 7, 10, "u");
  rect(g, 4, H - 9, 5, 9, "v");
  put(g, 7, H - 5, "y");
  return rowsOf(g);
}

export const SILO = defineProp({
  rows: siloRows(),
  pal: {
    a: "#f4f6fc", b: "#d4d8e4", c: "#aab2c6", d: "#8088a4",
    e: "#f88870", f: "#e05040", g: "#b83830", h: "#882828",
    k: "#585c70", u: "#5c6074", v: "#7c849c", y: "#f8d860",
  },
  solid: { x: 0, y: 46, w: 24, h: 18 },
});

// ── Windmill with rotating sails (4 frames) ──────────────────────────────────
function windmillFrame(angle: number): string[] {
  const W = 48, H = 68;
  const g = blank(W, H);
  const cx = 24;
  // tower (trapezoid)
  for (let y = 24; y < H; y++) {
    const half = Math.round(7 + ((y - 24) / (H - 24)) * 6);
    for (let x = cx - half; x <= cx + half; x++) {
      const rel = (x - (cx - half)) / (half * 2);
      let c = rel < 0.15 ? "a" : rel < 0.6 ? "b" : rel < 0.88 ? "c" : "d";
      if ((y - 24) % 6 === 5 && c !== "d") c = c === "a" ? "b" : "c";
      if (y === H - 1) c = "d";
      g[y][x] = c;
    }
  }
  // door + window
  rect(g, cx - 3, H - 11, 7, 11, "u");
  rect(g, cx - 2, H - 10, 5, 10, "v");
  put(g, cx + 1, H - 6, "y");
  rect(g, cx - 2, 40, 5, 6, "u");
  rect(g, cx - 1, 41, 3, 4, "g");
  put(g, cx - 1, 41, "G");
  // cap
  blobs(g, [{ x: cx, y: 25, rx: 11, ry: 10 }], "efgh", { crease: false, hi: 0.3 });
  for (let y = 26; y < 36; y++) for (let x = 0; x < W; x++) {
    if ("efgh".includes(g[y][x]) && y > 25) g[y][x] = y === 26 ? "h" : g[y][x];
  }
  // remove cap below its rim (tower shows)
  for (let y = 27; y < 36; y++) for (let x = 0; x < W; x++) {
    if ("efgh".includes(g[y][x])) {
      const half = Math.round(7 + ((y - 24) / (H - 24)) * 6);
      const rel = (x - (cx - half)) / (half * 2);
      g[y][x] = x < cx - half || x > cx + half ? "." : rel < 0.15 ? "a" : rel < 0.6 ? "b" : rel < 0.88 ? "c" : "d";
    }
  }
  rect(g, cx - 10, 26, 21, 1, "h");
  // sails
  const hx = cx + 0.5, hy = 21.5, L = 20;
  for (let k = 0; k < 4; k++) {
    const a = angle + (k * Math.PI) / 2;
    const ux = Math.cos(a), uy = Math.sin(a);
    const nx = -uy, ny = ux;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const px = x + 0.5 - hx, py = y + 0.5 - hy;
      const u = px * ux + py * uy, v = px * nx + py * ny;
      if (u < 0 || u > L) continue;
      if (Math.abs(v) < 0.75) { g[y][x] = "x"; continue; }
      if (u >= 5 && v >= 0.75 && v <= 5.2) {
        const lattice = (u % 4) < 0.9 || v > 4.4 || u > L - 0.9;
        g[y][x] = lattice ? "x" : (k % 2 === 0 ? "z" : "Z");
      }
    }
  }
  stamp(g, cx - 1, 20, ["kk.", "kKk", ".kk"]);
  return rowsOf(g);
}

export const WINDMILL = defineProp({
  frames: [0, 1, 2, 3].map((i) => windmillFrame((i * Math.PI) / 8 + 0.2)),
  fps: 4,
  pal: {
    a: "#fffaf0", b: "#ece0c8", c: "#cdbb9a", d: "#a08c6c",
    e: "#f08870", f: "#d85040", g: "#a83830", h: "#7c2828",
    u: "#6c4428", v: "#9a6838", y: "#f8d860", G: "#d8ecff",
    x: "#7a5434", z: "#fff8e8", Z: "#e0d4b8", k: "#4c3424", K: "#a08060",
  },
  solid: { x: 10, y: 52, w: 30, h: 18 },
});

// ── Chicken coop ─────────────────────────────────────────────────────────────
export const COOP = defineProp({
  rows: (() => {
    const g = blank(30, 28);
    for (let y = 0; y < 12; y++) {
      const inset = Math.max(0, 3 - Math.floor(y / 2));
      for (let x = inset; x < 30 - inset; x++) {
        let c = y % 3 === 2 ? "s" : "r";
        if (y === 0) c = "t";
        if (x <= inset + 1) c = "q";
        if (x >= 30 - inset - 2 || y === 11) c = "t";
        g[y][x] = c;
      }
    }
    for (let y = 12; y < 26; y++) for (let x = 2; x < 28; x++) {
      g[y][x] = (x - 2) % 4 === 3 ? "c" : y === 12 ? "d" : "b";
    }
    rect(g, 2, 24, 26, 2, "d");
    // round door + ramp
    stamp(g, 11, 15, [".kkk.", "kkkkk", "kkkkk", "kkkkk"]);
    stamp(g, 10, 19, ["xxxxxxx", ".xXxXx.", "..xXx..", "..xxx..", "...x..."].map((r) => r));
    // little window
    rect(g, 20, 15, 5, 4, "w"); rect(g, 21, 16, 3, 2, "k");
    // legs
    rect(g, 3, 26, 2, 2, "d"); rect(g, 25, 26, 2, 2, "d");
    return rowsOf(g);
  })(),
  pal: {
    q: "#f0a070", r: "#c86c40", s: "#a85430", t: "#7c3c24",
    b: "#f0d8a0", c: "#c8ac78", d: "#8c7048", k: "#3c2c28",
    x: "#b08050", X: "#8c6038", w: "#f8f8f0",
  },
  solid: { x: 1, y: 14, w: 30, h: 16 },
});

// ── Stone well with a little roof ────────────────────────────────────────────
export const WELL = defineProp({
  rows: pad([
    "..tttttttttttttttt..",
    ".tqrrrrrrrrrrrrrrst.",
    "tqrrrrrrrrrrrrrrrsst",
    "tttttttttttttttttttt",
    "..u.............u...",
    "..u....kkkk.....u...",
    "..u....kmmk.....u...",
    "..u.....kk......u...",
    "..u.....kk......u...",
    "..u..aaaaaaaaa..u...",
    "..uaabbbbbbbbbbau...",
    ".aabwwwwwwwwwwwwbba.",
    ".abbwWWWWWWWWWWwbbc.",
    ".abbbbbbbbbbbbbbbbc.",
    ".acbbcbbbcbbbcbbbcc.",
    ".abbbbcbbbbcbbbbbbc.",
    ".acbbbbbbcbbbbcbbcc.",
    ".abbcbbbbbbbbbbbbbc.",
    "..cccccccccccccccc..",
  ]),
  pal: {
    t: "#7c3c24", q: "#f09060", r: "#c86c40", s: "#a05030",
    u: "#8c6038", k: "#585060", m: "#9890a0",
    a: "#e8e4dc", b: "#c4beb4", c: "#9a948c", w: "#3c5c98", W: "#5880c0",
  },
  solid: { x: 1, y: 10, w: 22, h: 11 },
});

// ════════════════════════════════════════════════════════════════════════════
// Fences
// ════════════════════════════════════════════════════════════════════════════
const FENCE_PAL = { a: "#f0d0a0", b: "#d0a068", c: "#a07040", d: "#6c4828" };

/** Horizontal fence piece, 16px: a post on the left + two rails. */
export const FENCE_H = defineProp({
  rows: [
    "aab.............",
    "abc.............",
    "abcaaaaaaaaaaaaa",
    "abcbbbbbbbbbbbbb",
    "abcccccccccccccc",
    "abc.............",
    "abc.............",
    "abcaaaaaaaaaaaaa",
    "abcbbbbbbbbbbbbb",
    "abcccccccccccccc",
    "abc.............",
    "ddd.............",
  ],
  pal: FENCE_PAL,
  solid: { x: 0, y: 8, w: 18, h: 6 },
});

/** End post to close a horizontal run. */
export const FENCE_POST = defineProp({
  rows: ["aab", "abc", "abc", "abc", "abc", "abc", "abc", "abc", "abc", "abc", "abc", "ddd"],
  pal: FENCE_PAL,
  solid: { x: 0, y: 8, w: 5, h: 6 },
});

/** Vertical fence piece, 16px tall: a post on top + a rail going down. */
export const FENCE_V = defineProp({
  rows: [
    "aab",
    "abc",
    "abc",
    "abc",
    "abc",
    "abc",
    "abc",
    "abc",
    "ddd",
    ".b.",
    ".b.",
    ".b.",
    ".b.",
    ".b.",
    ".b.",
    ".b.",
  ],
  pal: FENCE_PAL,
  solid: { x: 0, y: 0, w: 5, h: 18 },
  baseY: 10,
});

// ════════════════════════════════════════════════════════════════════════════
// Animals (side view facing left; *_R = facing right)
// ════════════════════════════════════════════════════════════════════════════

const COW_PAL = {
  a: "#ffffff", w: "#f4f4f8", W: "#d0d0e0", V: "#a4a4bc",
  k: "#3c3848", K: "#5c5868", n: "#f8b0b8", N: "#c87080", h: "#f0e0b0", f: "#584838", e: "#f8f8f8",
};
function cowFrame(f: number): string[] {
  const g = blank(26, 18);
  for (const [lx, far] of [[8, 1], [11, 0], [19, 1], [22, 0]] as const) {
    rect(g, lx, 11, 2, 5, far ? "V" : "W");
    put(g, lx, 11, far ? "W" : "w");
    rect(g, lx, 16, 2, 1, "f");
  }
  blobs(g, [{ x: 15.5, y: 7.5, rx: 9, ry: 5 }], "awWV", { crease: false });
  stamp(g, 11, 3, ["kkk.", "kkkk", ".kkK"]);
  stamp(g, 18, 7, [".kk", "kkkK", "kkK."]);
  stamp(g, 21, 3, ["kk", "k."]);
  stamp(g, 15, 12, ["nnn", ".N."]);
  if (f === 0) {
    for (let y = 4; y <= 9; y++) put(g, 25, y, "k");
    stamp(g, 24, 10, ["kk", ".k"]);
  } else {
    put(g, 25, 4, "k"); put(g, 25, 5, "k");
    for (let y = 6; y <= 9; y++) put(g, 24, y, "k");
    stamp(g, 23, 10, ["kk", "k."]);
  }
  stamp(g, 0, 3 + f, [
    "...hh..",
    "..kkkkk",
    ".kkekkk",
    "kkkkkkw",
    "wkkkkww",
    "nnnwww.",
    "nNnnw..",
    ".nnn...",
  ]);
  return rowsOf(g);
}
const COW_FRAMES = [cowFrame(0), cowFrame(0), cowFrame(1), cowFrame(0)];
export const COW = defineProp({
  frames: COW_FRAMES, fps: 1.5, pal: COW_PAL,
  solid: { x: 2, y: 10, w: 24, h: 9 },
});
export const COW_R = defineProp({
  frames: COW_FRAMES.map(flipRows), fps: 1.5, pal: COW_PAL,
  solid: { x: 2, y: 10, w: 24, h: 9 },
});

const SHEEP_PAL = {
  a: "#ffffff", b: "#f2eee4", c: "#d8d0c0", d: "#b0a898",
  k: "#4c4858", K: "#6c6878", e: "#f8f8f8",
};
function sheepFrame(f: number): string[] {
  const g = blank(20, 15);
  for (const [lx, far] of [[6, 1], [8, 0], [13, 1], [15, 0]] as const) {
    rect(g, lx, 10, 1, 4, far ? "K" : "k");
  }
  blobs(g, [
    { x: 12, y: 6.5, rx: 7.5, ry: 5 },
    { x: 7, y: 5.5, rx: 3.5, ry: 3.5 },
    { x: 11, y: 3.5, rx: 3.5, ry: 3 },
    { x: 15.5, y: 4, rx: 3.5, ry: 3 },
    { x: 17.5, y: 7.5, rx: 2.5, ry: 3 },
    { x: 9, y: 9, rx: 3.5, ry: 2.5 },
    { x: 14.5, y: 9.5, rx: 3.5, ry: 2.5 },
  ], "abcd");
  stamp(g, 0, 3 + f, [
    "..ab..",
    ".kkkk.",
    "kkekkk",
    "kkkkkK",
    ".kkk..",
  ]);
  return rowsOf(g);
}
const SHEEP_FRAMES = [sheepFrame(0), sheepFrame(0), sheepFrame(1), sheepFrame(1)];
export const SHEEP = defineProp({
  frames: SHEEP_FRAMES, fps: 1.2, pal: SHEEP_PAL,
  solid: { x: 2, y: 8, w: 18, h: 8 },
});
export const SHEEP_R = defineProp({
  frames: SHEEP_FRAMES.map(flipRows), fps: 1.2, pal: SHEEP_PAL,
  solid: { x: 2, y: 8, w: 18, h: 8 },
});

const PIG_PAL = {
  a: "#ffe4ea", b: "#f8b4c4", c: "#e08ca0", d: "#c06c84", D: "#a85070",
  n: "#f8889c", N: "#983c58", k: "#3c2830",
};
function pigFrame(f: number): string[] {
  return pad([
    f ? "...Dd............." : "....Dd............",
    f ? "..DDcbbbbbbbbb...." : "...DDcbbbbbbbb....",
    "..abbbbbaaaabbbc" + (f ? ".c" : "c."),
    ".abkbbbbbbbbbbbc" + (f ? "c." : ".c"),
    "nnbbbbbbbbbbbbbc" + (f ? ".c" : "c."),
    "nNbbbbbbbbbbbbcc..",
    "nnbbbbbbbbbbbccc..",
    ".bbbbbbbbbbbcccc..",
    "..cccbcccccbccc...",
    "..dc.dc...dc.dc...",
    "..DD.DD...DD.DD...",
  ]);
}
const PIG_FRAMES = [pigFrame(0), pigFrame(1)];
export const PIG = defineProp({
  frames: PIG_FRAMES, fps: 2, pal: PIG_PAL,
  solid: { x: 1, y: 5, w: 18, h: 8 },
});
export const PIG_R = defineProp({
  frames: PIG_FRAMES.map(flipRows), fps: 2, pal: PIG_PAL,
  solid: { x: 1, y: 5, w: 18, h: 8 },
});

const HEN_PAL = { w: "#ffffff", W: "#d8d4e0", V: "#aca8bc", r: "#f04038", o: "#f8b030", e: "#282030" };
const HEN_FRAMES = [
  [
    "..r.....",
    ".rww....",
    ".wew....",
    "oww...ww",
    ".www.wwW",
    ".wwwwwwW",
    ".wwwwWW.",
    "..WWVV..",
    "...o.o..",
  ],
  [
    "........",
    "......ww",
    "..r..wwW",
    ".rwwwwwW",
    ".wewwwwW",
    "owwwwWW.",
    "..wwWV..",
    "..WVV...",
    "...o.o..",
  ],
];
export const CHICKEN = defineProp({
  frames: [HEN_FRAMES[0], HEN_FRAMES[0], HEN_FRAMES[1], HEN_FRAMES[0]], fps: 2.5,
  pal: HEN_PAL, solid: null,
});
export const CHICKEN_R = defineProp({
  frames: [HEN_FRAMES[0], HEN_FRAMES[1], HEN_FRAMES[0], HEN_FRAMES[0]].map(flipRows), fps: 2.5,
  pal: HEN_PAL, solid: null,
});
export const CHICK = defineProp({
  frames: [
    [".yy.", "yeyo", "yyy.", ".o.."],
    [".yy.", "yeyo", "yyy.", "..o."],
  ],
  fps: 3,
  pal: { y: "#f8e048", e: "#282030", o: "#f89830" },
  solid: null,
});

// ════════════════════════════════════════════════════════════════════════════
// Crops & farm clutter
// ════════════════════════════════════════════════════════════════════════════

export const CABBAGE = defineProp({
  rows: (() => {
    const g = blank(12, 9);
    blobs(g, [
      { x: 6, y: 5, rx: 5.8, ry: 4 },
      { x: 3, y: 5, rx: 3, ry: 2.8 },
      { x: 9, y: 5, rx: 3, ry: 2.8 },
      { x: 6, y: 4, rx: 3.2, ry: 2.8 },
    ], "abcd");
    put(g, 6, 3, "a"); put(g, 5, 4, "e");
    return rowsOf(g);
  })(),
  pal: { a: "#e0ffb0", b: "#a8e070", c: "#70b848", d: "#488c34", e: "#c8f090" },
  solid: null,
});

export const CARROTS = defineProp({
  rows: [
    ".g.g....g.g....g.g.",
    "gGgGg..gGgGg..gGgGg",
    ".GgG....GgG....GgG.",
    "..oO.....oO.....oO.",
  ],
  pal: { g: "#78c848", G: "#3c8c30", o: "#f88830", O: "#c05818" },
  solid: null,
});

export const PUMPKIN = defineProp({
  rows: (() => {
    const g = blank(13, 10);
    blobs(g, [
      { x: 6.5, y: 6, rx: 6.2, ry: 3.8 },
      { x: 3.5, y: 6, rx: 3.2, ry: 3.4 },
      { x: 9.5, y: 6, rx: 3.2, ry: 3.4 },
      { x: 6.5, y: 6, rx: 2.6, ry: 3.8 },
    ], "abcd");
    stamp(g, 6, 0, [".g", "gG", ".G"]);
    stamp(g, 8, 0, ["ll", "lL"]);
    return rowsOf(g);
  })(),
  pal: { a: "#ffd890", b: "#f8a038", c: "#e07820", d: "#b05418", g: "#6a8a30", G: "#486420", l: "#78c048", L: "#4c9030" },
  solid: { x: 1, y: 5, w: 13, h: 6 },
});

/** Tall corn plant with a cob. */
export const CORN = defineProp({
  rows: [
    "....t.....",
    "...tTt....",
    "....t.....",
    "....s.....",
    "..a.sS....",
    ".ab.sSb...",
    "ab..sS.b..",
    "....sS..b.",
    "....sSa...",
    "..yysSab..",
    ".yYysS.ab.",
    ".hyYsS..b.",
    "..hhsS....",
    "...asS....",
    "..ab.Sb...",
    ".ab.sS.b..",
    "....sS..b.",
    "....sS....",
    "...cccc...",
  ],
  pal: {
    t: "#e8c878", T: "#b89048", s: "#78c048", S: "#4c9030", a: "#98d860", b: "#4c9030",
    y: "#f8e060", Y: "#d0a830", h: "#a8d070", c: "#946038",
  },
  solid: { x: 3, y: 16, w: 6, h: 5 },
});

export const SUNFLOWER = defineProp({
  rows: [
    "...y.y.y...",
    "..yYyyyYy..",
    ".yymmmmmyy.",
    "..ymMMMmy..",
    ".yymMMMmyy.",
    "..ymmmmmy..",
    ".yyYyyyYyy.",
    "...y.sy.y..",
    ".....s.....",
    "..ll.s.....",
    ".lLLlS.....",
    "..LLsS.ll..",
    ".....SlLLl.",
    ".....sLL...",
    ".....s.....",
    ".....S.....",
    ".....s.....",
  ],
  pal: {
    y: "#f8d838", Y: "#d8a020", m: "#8a5428", M: "#5c3418",
    s: "#78c048", S: "#4c9030", l: "#88d050", L: "#4c9030",
  },
  solid: { x: 4, y: 14, w: 5, h: 5 },
});

export const SCARECROW = defineProp({
  frames: [0, 1].map((f) => pad([
    "......yyyyy.......",
    ".....yYyyyYy......",
    "...yyyyyyyyyyy....",
    "..YYyrrrrrrYYYY...",
    ".......sssss......",
    "......sSssSss.....",
    "......skSskSs.....",
    "......sssssss.....",
    "......ssmmmss.....",
    ".......sssss......",
    f === 0 ? "..y.prpRpRprp.y..." : ".y..prpRpRprp..y..",
    f === 0 ? ".yyypRpRpRpRpyyy.." : "yy.ppRpRpRpRpp.yy.",
    "...uuuuuuuuuuuuu..",
    ".......pRpRp......",
    ".......RpRpR......",
    ".......pRpRp......",
    ".......bbbbb......",
    ".......bBbBb......",
    "......yy.u.yy.....",
    "........uU........",
    "........uU........",
    "........uU........",
    "........uU........",
    "........uU........",
    "........uU........",
    ".......uuUU.......",
  ])),
  fps: 1,
  pal: {
    y: "#f8d860", Y: "#c89830", r: "#d84040", s: "#f0d8a0", S: "#c8a870", k: "#3c2c28", m: "#a06040",
    p: "#e85848", R: "#a8303c", b: "#4870c0", B: "#30509c", u: "#9a6a3c", U: "#6c4628",
  },
  solid: { x: 6, y: 22, w: 8, h: 6 },
});

export const HAY_ROUND = defineProp({
  rows: (() => {
    const g = blank(18, 15);
    blobs(g, [{ x: 9, y: 7.5, rx: 8.5, ry: 7 }], "abcd", { crease: false, hi: 0.2 });
    // spiral rings
    for (let a = 0; a < 6.28; a += 0.12) {
      put(g, Math.round(9 + Math.cos(a) * 5.4), Math.round(7.5 + Math.sin(a) * 4.4), "d");
    }
    for (let a = 0; a < 6.28; a += 0.25) {
      put(g, Math.round(9 + Math.cos(a) * 2.4), Math.round(7.5 + Math.sin(a) * 2), "c");
    }
    put(g, 9, 7, "d");
    stamp(g, 3, 3, ["a"]); stamp(g, 5, 1, ["aa"]);
    return rowsOf(g);
  })(),
  pal: { a: "#fff0a8", b: "#f0cc60", c: "#d0a440", d: "#a07828" },
  solid: { x: 1, y: 6, w: 18, h: 11 },
});

const HAY_SQ = [
  "aaaaaaaaaaaaaaaaaa",
  "abababaaaabababaaa",
  "aaaaaraaaaaaraaaaa",
  "bbbbbrbbbbbbrbbbbb",
  "bcbbbrbcbbcbrbbcbb",
  "bbbcbrbbbbbbrbcbbb",
  "bbbbbrbbcbbbrbbbbc",
  "cbcbbrbbbbcbrbbbbb",
  "cccccccccccccccccc",
  "dddddRddddddRddddd",
];
export const HAY_SQUARE = defineProp({
  rows: HAY_SQ,
  pal: { a: "#fff0a8", b: "#f0cc60", c: "#d0a440", d: "#a07828", r: "#d06038", R: "#904028" },
  solid: { x: 0, y: 2, w: 20, h: 10 },
});

export const HAY_STACK = defineProp({
  rows: (() => {
    const g = blank(36, 19);
    stamp(g, 9, 0, HAY_SQ);
    stamp(g, 0, 9, HAY_SQ);
    stamp(g, 18, 9, HAY_SQ);
    return rowsOf(g);
  })(),
  pal: { a: "#fff0a8", b: "#f0cc60", c: "#d0a440", d: "#a07828", r: "#d06038", R: "#904028" },
  solid: { x: 0, y: 9, w: 38, h: 12 },
});

export const TROUGH = defineProp({
  rows: [
    "aaaaaaaaaaaaaaaaaaaaa",
    "abwwwwwwwwwwwwwwwwwbc",
    "abWWWwWWWWWWWwWWWWWbc",
    "bbbbbbbbbbbbbbbbbbbbc",
    "bcbbbbbbcbbbbbbbbcbbc",
    "cccccccccccccccccccc.",
    ".d.................d.",
  ],
  pal: { a: "#d8a868", b: "#b07840", c: "#805028", d: "#5c3820", w: "#88c0f8", W: "#5890e0" },
  solid: { x: 0, y: 1, w: 23, h: 8 },
});

export const MILK_CANS = defineProp({
  rows: [
    "..aab....aab.",
    ".abbbc..abbbc",
    "..mmm....mmm.",
    ".abbbc..abbbc",
    ".abbbc..abbbc",
    ".arrrc..arrrc",
    ".abbbc..abbbc",
    ".abbbc..abbbc",
    "..ccc....ccc.",
  ],
  pal: { a: "#f4f6fc", b: "#c8ccdc", c: "#8c92a8", m: "#686c80", r: "#4870c0" },
  solid: { x: 0, y: 4, w: 15, h: 7 },
});

export const WHEELBARROW = defineProp({
  rows: [
    "aaaaaaaaaaaa......",
    "abbbbbbbbbbbc.....",
    ".ayyyyyyyyyc......",
    ".abbbbbbbbbc......",
    "..ccccccccc..ddddd",
    "...kk...d.d.......",
    "..kKKk..d.........",
    "..kKKk.d..........",
    "...kk.............",
  ],
  pal: { a: "#70c0f0", b: "#4890d0", c: "#2c64a8", y: "#f8d860", d: "#8c6038", k: "#383840", K: "#686878" },
  solid: { x: 0, y: 3, w: 20, h: 8 },
});

// ── Tractor (facing right) ───────────────────────────────────────────────────
function tractorRows(): string[] {
  const g = blank(32, 24);
  // body
  rect(g, 13, 9, 16, 7, "b");
  rect(g, 13, 9, 16, 1, "a");
  rect(g, 13, 14, 16, 2, "c");
  rect(g, 28, 10, 2, 6, "d");
  for (let y = 11; y < 15; y += 2) put(g, 29, y, "k");
  // cab / seat
  rect(g, 5, 3, 3, 8, "b"); rect(g, 5, 3, 1, 8, "a"); rect(g, 7, 3, 1, 8, "c");
  rect(g, 4, 2, 11, 1, "c"); rect(g, 4, 1, 11, 1, "a");
  rect(g, 13, 2, 1, 7, "m");
  rect(g, 7, 8, 7, 2, "c");
  line(g, 12, 9, 14, 5, "k"); stamp(g, 13, 4, ["kk"]);
  // exhaust
  rect(g, 22, 2, 2, 7, "m"); rect(g, 22, 1, 2, 1, "k"); put(g, 23, 2, "n");
  // fender
  for (let x = 1; x < 17; x++) { put(g, x, 7, "a"); put(g, x, 8, "c"); }
  // rear wheel
  ellipse(g, 8.5, 15.5, 8, 8, "T");
  ellipse(g, 8.5, 15.5, 6.6, 6.6, "t");
  ellipse(g, 8.5, 15.5, 4, 4, "y");
  ellipse(g, 9, 16, 2.8, 2.8, "Y");
  ellipse(g, 8.5, 15.5, 1.5, 1.5, "k");
  for (let a = 0; a < 6.28; a += 0.52) put(g, Math.round(8 + Math.cos(a) * 7.3), Math.round(15 + Math.sin(a) * 7.3), "T");
  // front wheel
  ellipse(g, 25, 19, 4.6, 4.6, "T");
  ellipse(g, 25, 19, 3.4, 3.4, "t");
  ellipse(g, 25, 19, 2, 2, "y");
  put(g, 24, 18, "k");
  return rowsOf(g);
}
export const TRACTOR = defineProp({
  rows: tractorRows(),
  pal: {
    a: "#98e478", b: "#58b848", c: "#3c9038", d: "#286c2c",
    T: "#2c2c34", t: "#4c4c58", y: "#f8d840", Y: "#c89c20", k: "#202028", m: "#8890a0", n: "#c8ccd8",
  },
  solid: { x: 1, y: 12, w: 32, h: 14 },
});

export const TRACTOR_L = defineProp({
  rows: flipRows(tractorRows()),
  pal: TRACTOR.pal,
  solid: { x: 1, y: 12, w: 32, h: 14 },
});

// ── Pond reeds / cattails ────────────────────────────────────────────────────
export const REEDS = defineProp({
  frames: [0, 1].map((f) => pad([
    f ? ".m....m...." : "m.....m....",
    f ? ".M...mM...." : "M....mM....",
    ".M..M.M..m.",
    ".g..M.g..M.",
    ".g..g.g..M.",
    "ag.ag.ga.g.",
    "agaga.gaga.",
    ".gGgaGgGg..",
    "..GgGgGG...",
  ])),
  fps: 1,
  pal: { m: "#8c5830", M: "#6c3c20", g: "#58b048", G: "#30803c", a: "#90d860" },
  solid: null,
});

export const MAILBOX = defineProp({
  rows: [
    ".rrrrr.",
    "rRRRRRr",
    "rRRRRRf",
    "rrrrrrf",
    "...u...",
    "...u...",
    "...u...",
    "..uuU..",
  ],
  pal: { r: "#e84848", R: "#f87070", f: "#f8d040", u: "#8c6038", U: "#5c3c20" },
  solid: { x: 1, y: 5, w: 7, h: 5 },
});

void line;
