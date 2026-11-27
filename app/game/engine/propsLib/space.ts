// Space props: planets, satellites, rockets, moon rocks, aliens, a UFO, a rover,
// the moon-base dome, radar dish, solar panels, consoles and an Argentine flag.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, line } from "./artkit";

/** Paint only on top of already-filled pixels (surface markings). */
function paintOn(g: CharGrid, x: number, y: number, rows: readonly string[]) {
  rows.forEach((r, yy) => {
    for (let xx = 0; xx < r.length; xx++) {
      const c = r[xx];
      if (c === "." || !g[y + yy] || g[y + yy][x + xx] === undefined || g[y + yy][x + xx] === ".") continue;
      g[y + yy][x + xx] = c;
    }
  });
}

// ── Planets (live in the starfield rows, never block) ───────────────────────
export const PLANET_RINGED = defineProp({
  rows: (() => {
    const W = 44, H = 32, cx = 22, cy = 15;
    const g = blank(W, H);
    const ring = (front: boolean) => {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const o = ((x + 0.5 - cx) / 21) ** 2 + ((y + 0.5 - cy - 2) / 5.5) ** 2;
        const i = ((x + 0.5 - cx) / 15.5) ** 2 + ((y + 0.5 - cy - 2) / 3.4) ** 2;
        if (o <= 1 && i >= 1 && (front ? y >= cy + 2 : y < cy + 2)) g[y][x] = (x + y) % 7 < 3 ? "r" : "R";
      }
    };
    ring(false);
    blobs(g, [{ x: cx, y: cy, rx: 10.5 }], "abcd", { crease: false });
    paintOn(g, 12, 9, ["..bbbbbbbbbbbb..", ".bbbbbbbbbbbbbb."].map((r) => r.replace(/b/g, "c")));
    paintOn(g, 11, 14, ["ccccccccccccccccccccc"]);
    ring(true);
    return rowsOf(g);
  })(),
  pal: { a: "#ffd89a", b: "#f8b060", c: "#e08840", d: "#a85a30", r: "#f4e0b0", R: "#c8a878" },
  solid: null,
});

export const PLANET_EARTH = defineProp({
  rows: (() => {
    const g = blank(26, 26);
    blobs(g, [{ x: 13, y: 13, rx: 11.5 }], "abcd", { crease: false });
    paintOn(g, 6, 6, ["..gggg.", ".ggggggg", "gggggg..", ".ggg..."]);
    paintOn(g, 12, 13, ["..gggg", ".ggggg", "..ggg.", "...gg."]);
    paintOn(g, 5, 15, ["..gg", ".ggg", "..g."]);
    paintOn(g, 9, 4, ["wwww", ".ww."]);
    paintOn(g, 14, 18, ["wwww", "www."]);
    return rowsOf(g);
  })(),
  pal: { a: "#98d0ff", b: "#4c98e8", c: "#3470c8", d: "#254a98", g: "#58b048", w: "#ffffff" },
  solid: null,
});

export const PLANET_RED = defineProp({
  rows: (() => {
    const g = blank(18, 18);
    blobs(g, [{ x: 9, y: 9, rx: 7.8 }], "abcd", { crease: false });
    paintOn(g, 4, 5, [".dd.", "dccd", ".dd."]);
    paintOn(g, 10, 10, ["dd.", "dcd"]);
    return rowsOf(g);
  })(),
  pal: { a: "#ffa890", b: "#e8684c", c: "#c04838", d: "#8a3028" },
  solid: null,
});

export const MOONLET = defineProp({
  rows: (() => {
    const g = blank(12, 12);
    blobs(g, [{ x: 6, y: 6, rx: 5 }], "abcd", { crease: false });
    paintOn(g, 3, 3, [".dd", "dcd"]);
    paintOn(g, 6, 7, ["dd", "cd"]);
    return rowsOf(g);
  })(),
  pal: { a: "#f4f4fc", b: "#d0d0e0", c: "#a8a8c0", d: "#80809c" },
  solid: null,
});

export const ASTEROID = defineProp({
  rows: (() => {
    const g = blank(16, 12);
    blobs(g, [{ x: 6, y: 6, rx: 5.5, ry: 4.5 }, { x: 11, y: 7, rx: 4, ry: 3.5 }, { x: 8, y: 4, rx: 3.5, ry: 3 }], "abcd");
    paintOn(g, 4, 5, ["dd", "dc"]);
    return rowsOf(g);
  })(),
  pal: { a: "#c8a888", b: "#a88868", c: "#846a50", d: "#5c4838" },
  solid: null,
});

// ── Satellite (two frames: blinking light) ───────────────────────────────────
function satelliteRows(on: boolean): string[] {
  const g = blank(34, 16);
  const panel = (x0: number) => {
    rect(g, x0, 4, 12, 8, "p");
    for (let i = 1; i < 12; i += 3) rect(g, x0 + i, 4, 1, 8, "P");
    rect(g, x0, 7, 12, 1, "P");
    rect(g, x0, 4, 12, 1, "q");
  };
  panel(1); panel(21);
  rect(g, 13, 7, 8, 2, "s");
  rect(g, 13, 3, 8, 10, "a");
  rect(g, 13, 3, 8, 1, "b");
  rect(g, 13, 12, 8, 1, "d");
  rect(g, 15, 5, 4, 4, "g");
  rect(g, 15, 5, 4, 1, "h");
  line(g, 17, 3, 17, 0, "s");
  put(g, 17, 0, on ? "r" : "R");
  rect(g, 14, 13, 6, 2, "c");
  return rowsOf(g);
}
export const SATELLITE = defineProp({
  frames: [satelliteRows(true), satelliteRows(false)],
  fps: 1.5,
  pal: { p: "#3868d8", P: "#2848a8", q: "#78a8f8", s: "#a8a8c0", a: "#e0e0ec", b: "#fafaff", d: "#8888a4", c: "#686884", g: "#2c3c78", h: "#587cd0", r: "#ff6060", R: "#a03838" },
  solid: null,
});

// ── Rockets ──────────────────────────────────────────────────────────────────
function rocketRows(half: number, noseH: number, bodyH: number, finH: number): string[] {
  const W = half * 2 + 9, H = noseH + bodyH + 5;
  const cx = Math.floor(W / 2);
  const g = blank(W, H);
  const shade = (dx: number, hw: number) => {
    const t = (dx + hw) / (hw * 2);
    return t < 0.25 ? "a" : t < 0.5 ? "b" : t < 0.78 ? "c" : "d";
  };
  // fins behind the body
  for (let i = 0; i < finH; i++) {
    const reach = Math.round((finH - i) * 0.7);
    for (let k = 0; k <= reach; k++) {
      put(g, cx - half - k, noseH + bodyH - finH + i + 3, "f");
      put(g, cx + half + k, noseH + bodyH - finH + i + 3, "F");
    }
  }
  for (let y = 0; y < noseH + bodyH; y++) {
    const hw = y < noseH ? Math.max(1, Math.round(half * Math.sqrt(y / noseH))) : half;
    for (let dx = -hw; dx <= hw; dx++) {
      const c = shade(dx, hw);
      const nose = y < noseH * 0.8;
      g[y][cx + dx] = nose ? ({ a: "n", b: "n", c: "N", d: "O" } as Record<string, string>)[c] : c;
    }
  }
  // stripe + window
  rect(g, cx - half, noseH + 2, half * 2 + 1, 2, "N");
  const wy = noseH + Math.floor(bodyH / 2);
  ellipse(g, cx, wy, 3.2, 3.2, "O");
  ellipse(g, cx, wy, 2.4, 2.4, "w");
  put(g, cx - 1, wy - 1, "x");
  // engine
  rect(g, cx - 3, noseH + bodyH, 7, 2, "s");
  rect(g, cx - 4, noseH + bodyH + 1, 9, 2, "S");
  return rowsOf(g);
}
const ROCKET_PAL = { a: "#fafaff", b: "#e4e8f4", c: "#bcc4dc", d: "#8c94b8", n: "#ff6860", N: "#d83c44", O: "#9c2438", f: "#d83c44", F: "#9c2438", w: "#5cc0ff", x: "#d8f4ff", s: "#80809c", S: "#585874" };
export const ROCKET = defineProp({
  rows: rocketRows(8, 16, 30, 12),
  pal: ROCKET_PAL,
  solid: { x: 2, y: 36, w: 24, h: 18 },
});
export const ROCKET_BLUE = defineProp({
  rows: rocketRows(6, 12, 22, 9),
  pal: { ...ROCKET_PAL, n: "#58a8ff", N: "#3870d8", O: "#24489c", f: "#3870d8", F: "#24489c" },
  solid: { x: 2, y: 26, w: 19, h: 14 },
});

// ── Moon lander ──────────────────────────────────────────────────────────────
export const LANDER = defineProp({
  rows: (() => {
    const g = blank(30, 26);
    line(g, 6, 24, 11, 14, "s"); line(g, 23, 24, 18, 14, "s");
    rect(g, 3, 24, 7, 1, "S"); rect(g, 20, 24, 7, 1, "S");
    line(g, 15, 23, 15, 15, "s");
    rect(g, 8, 6, 14, 9, "y");
    rect(g, 8, 6, 14, 1, "Y"); rect(g, 8, 6, 3, 9, "Y");
    for (let x = 8; x < 22; x += 3) rect(g, x, 8, 1, 6, "o");
    rect(g, 10, 2, 10, 5, "g");
    rect(g, 10, 2, 10, 1, "G");
    rect(g, 12, 3, 6, 3, "w");
    put(g, 12, 3, "x");
    rect(g, 12, 15, 6, 2, "S");
    rect(g, 14, 17, 2, 3, "s");
    return rowsOf(g);
  })(),
  pal: { y: "#f8d060", Y: "#fff0a0", o: "#c8982c", g: "#c4c4d4", G: "#e8e8f4", w: "#3c68b8", x: "#98c0f0", s: "#a0a0b8", S: "#6c6c84" },
  solid: { x: 5, y: 14, w: 20, h: 12 },
});

// ── Radar dish ───────────────────────────────────────────────────────────────
export const RADAR = defineProp({
  rows: (() => {
    const g = blank(26, 28);
    rect(g, 11, 14, 4, 11, "s");
    rect(g, 11, 14, 1, 11, "a");
    rect(g, 7, 24, 12, 3, "S");
    rect(g, 7, 24, 12, 1, "s");
    ellipse(g, 12, 9, 11, 7, "d");
    ellipse(g, 12, 8, 10, 6, "a");
    ellipse(g, 12.5, 8.5, 7, 4, "b");
    ellipse(g, 12.5, 9, 3.5, 2, "c");
    line(g, 12, 9, 20, 1, "s"); put(g, 20, 0, "r");
    return rowsOf(g);
  })(),
  pal: { s: "#a8a8c0", S: "#686884", a: "#f0f0fa", b: "#d0d4e8", c: "#a4a8c8", d: "#7c80a4", r: "#ff5858" },
  solid: { x: 7, y: 22, w: 12, h: 6 },
});

// ── Solar panel ──────────────────────────────────────────────────────────────
export const SOLAR_PANEL = defineProp({
  rows: (() => {
    const g = blank(32, 20);
    rect(g, 14, 12, 4, 7, "s");
    rect(g, 10, 18, 12, 2, "S");
    for (let y = 0; y < 12; y++) {
      const sk = Math.round((11 - y) * 0.35);
      for (let x = 1 + sk; x < 31 - sk + 0; x++) {
        const edge = x === 1 + sk || x === 30 - sk || y === 0 || y === 11;
        g[y][x] = edge ? "q" : (x - sk) % 7 === 0 || y % 4 === 3 ? "P" : y < 4 ? "r" : "p";
      }
    }
    return rowsOf(g);
  })(),
  pal: { p: "#3868d8", P: "#2444a0", q: "#a8c8ff", r: "#5c8cf0", s: "#a8a8c0", S: "#686884" },
  solid: { x: 8, y: 14, w: 16, h: 6 },
});

// ── Moon rocks ───────────────────────────────────────────────────────────────
const ROCK_PAL = { a: "#d4d4e4", b: "#b0b0c8", c: "#8c8ca8", d: "#686884" };
export const MOON_ROCK = defineProp({
  rows: (() => {
    const g = blank(11, 8);
    blobs(g, [{ x: 4.5, y: 4.5, rx: 4.2, ry: 3 }, { x: 8, y: 5, rx: 2.6, ry: 2.2 }], "abcd");
    return rowsOf(g);
  })(),
  pal: ROCK_PAL,
  solid: { x: 0, y: 3, w: 12, h: 7 },
});
export const MOON_ROCK_BIG = defineProp({
  rows: (() => {
    const g = blank(20, 14);
    blobs(g, [{ x: 8, y: 8, rx: 7.5, ry: 5 }, { x: 14.5, y: 8.5, rx: 4.5, ry: 4 }, { x: 10, y: 5, rx: 5, ry: 3.5 }], "abcd");
    return rowsOf(g);
  })(),
  pal: ROCK_PAL,
  solid: { x: 0, y: 5, w: 22, h: 11 },
});

// ── Flag (sky-blue & white, with a sun) ──────────────────────────────────────
export const MOON_FLAG = defineProp({
  rows: (() => {
    const g = blank(18, 28);
    rect(g, 1, 0, 1, 26, "s");
    rect(g, 0, 25, 4, 2, "S");
    rect(g, 2, 1, 15, 4, "u"); rect(g, 2, 5, 15, 4, "w"); rect(g, 2, 9, 15, 4, "u");
    rect(g, 2, 13, 15, 1, "U");
    put(g, 9, 7, "y"); put(g, 10, 7, "y"); put(g, 9, 6, "y"); put(g, 10, 6, "y");
    return rowsOf(g);
  })(),
  pal: { s: "#d0d0e0", S: "#80809c", u: "#78c0f0", U: "#4c90c8", w: "#ffffff", y: "#f8c838" },
  solid: { x: 0, y: 22, w: 5, h: 6 },
});

// ── Aliens (never green: Julio is the green one) ─────────────────────────────
function alienRows(eyes: 1 | 2 | 3): string[] {
  const g = blank(14, 17);
  line(g, 4, 3, 2, 0, "a"); line(g, 9, 3, 11, 0, "a");
  put(g, 2, 0, "y"); put(g, 11, 0, "y");
  blobs(g, [{ x: 7, y: 7, rx: 6, ry: 5.5 }], "abcd", { crease: false });
  if (eyes === 1) { rect(g, 5, 6, 4, 3, "k"); put(g, 6, 6, "w"); put(g, 7, 7, "k"); }
  else if (eyes === 2) { rect(g, 3, 6, 3, 3, "k"); rect(g, 8, 6, 3, 3, "k"); put(g, 3, 6, "w"); put(g, 8, 6, "w"); }
  else { rect(g, 3, 6, 2, 2, "k"); rect(g, 6, 5, 2, 3, "k"); rect(g, 9, 6, 2, 2, "k"); }
  rect(g, 6, 10, 2, 1, "d");
  rect(g, 4, 12, 6, 3, "c"); rect(g, 4, 12, 2, 3, "b");
  rect(g, 4, 15, 2, 2, "d"); rect(g, 8, 15, 2, 2, "d");
  put(g, 3, 13, "c"); put(g, 10, 13, "c");
  return rowsOf(g);
}
const ALIEN_SOLID = { x: 3, y: 12, w: 9, h: 7 };
export const ALIEN_BLUE = defineProp({ rows: alienRows(2), pal: { a: "#8ce0ff", b: "#58b8f0", c: "#3c8cd0", d: "#2860a0", k: "#101030", w: "#ffffff", y: "#ffe860" }, solid: ALIEN_SOLID });
export const ALIEN_PURPLE = defineProp({ rows: alienRows(1), pal: { a: "#e0a0ff", b: "#b870f0", c: "#9050c8", d: "#6a3898", k: "#101030", w: "#ffffff", y: "#ff8888" }, solid: ALIEN_SOLID });
export const ALIEN_PINK = defineProp({ rows: alienRows(3), pal: { a: "#ffc0e0", b: "#f890c0", c: "#d060a0", d: "#984078", k: "#101030", w: "#ffffff", y: "#ffe860" }, solid: ALIEN_SOLID });

// ── UFO (blinking lights) ────────────────────────────────────────────────────
function ufoRows(frame: number): string[] {
  const g = blank(34, 24);
  blobs(g, [{ x: 17, y: 8, rx: 7, ry: 6.5 }], "abcd", { crease: false });
  for (let y = 0; y < 8; y++) for (let x = 0; x < 34; x++) if (g[y][x] === "b" || g[y][x] === "a") g[y][x] = y < 4 ? "G" : "g";
  stamp(g, 15, 3, ["x."]);
  blobs(g, [{ x: 17, y: 14, rx: 16.5, ry: 4.8 }], "mMsS", { crease: false });
  rect(g, 4, 15, 26, 1, "S");
  for (let i = 0; i < 5; i++) {
    const on = (i + frame) % 2 === 0;
    put(g, 6 + i * 5, 14, on ? "y" : "o"); put(g, 7 + i * 5, 14, on ? "y" : "o");
  }
  line(g, 9, 17, 6, 22, "S"); line(g, 25, 17, 28, 22, "S"); line(g, 17, 18, 17, 22, "S");
  rect(g, 4, 22, 5, 1, "S"); rect(g, 25, 22, 5, 1, "S"); rect(g, 15, 22, 5, 1, "S");
  return rowsOf(g);
}
export const UFO = defineProp({
  frames: [ufoRows(0), ufoRows(1)],
  fps: 2.5,
  pal: { a: "#fafaff", b: "#c8d0e8", c: "#98a0c4", d: "#6c74a0", g: "#98e8ff", G: "#d8f8ff", x: "#ffffff", m: "#e8ecf8", M: "#b4bcdc", s: "#9098bc", S: "#5c6488", y: "#ffe860", o: "#c08838" },
  solid: { x: 3, y: 15, w: 28, h: 10 },
});

// ── Rover ────────────────────────────────────────────────────────────────────
export const ROVER = defineProp({
  rows: (() => {
    const g = blank(30, 18);
    rect(g, 4, 6, 22, 6, "a"); rect(g, 4, 6, 22, 1, "b"); rect(g, 4, 11, 22, 1, "d");
    rect(g, 8, 3, 8, 4, "g"); rect(g, 9, 4, 6, 2, "w");
    rect(g, 19, 2, 8, 4, "p"); rect(g, 19, 2, 8, 1, "q");
    line(g, 25, 6, 28, 0, "s"); put(g, 28, 0, "r");
    for (const x of [6, 14, 22]) { ellipse(g, x + 2, 14, 3.2, 3.2, "k"); ellipse(g, x + 2, 14, 1.4, 1.4, "s"); }
    return rowsOf(g);
  })(),
  pal: { a: "#e8e8f4", b: "#fafaff", d: "#9898b4", g: "#c4c4d4", w: "#5c98e0", p: "#3868d8", q: "#8cb4ff", s: "#b0b0c8", r: "#ff5858", k: "#383850" },
  solid: { x: 2, y: 8, w: 26, h: 10 },
});

// ── Moon-base dome ───────────────────────────────────────────────────────────
export const DOME = defineProp({
  rows: (() => {
    const W = 52, H = 38;
    const g = blank(W, H);
    blobs(g, [{ x: 26, y: 30, rx: 24, ry: 28 }], "abcd", { crease: false, hi: 0.35 });
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (g[y][x] === ".") continue;
      if ((x + (Math.floor(y / 7) % 2) * 6) % 12 === 0 || y % 7 === 6) g[y][x] = g[y][x] === "a" || g[y][x] === "b" ? "c" : "d";
    }
    rect(g, 0, 31, W, 7, "m"); rect(g, 0, 31, W, 1, "M"); rect(g, 0, 37, W, 1, "k");
    for (let x = 4; x < W - 3; x += 8) rect(g, x, 33, 3, 2, "y");
    rect(g, 22, 26, 9, 11, "k"); rect(g, 23, 27, 7, 10, "D"); rect(g, 26, 27, 1, 10, "k");
    return rowsOf(g);
  })(),
  pal: { a: "#d8f4ff", b: "#a8e0f8", c: "#78c0e8", d: "#4c94c4", m: "#b8bcd4", M: "#e4e8f8", k: "#383a58", D: "#7c80a0", y: "#ffe070" },
  solid: { x: 1, y: 18, w: 52, h: 22 },
});

// ── Console & small gear ─────────────────────────────────────────────────────
export const CONSOLE = defineProp({
  rows: (() => {
    const g = blank(22, 18);
    rect(g, 1, 1, 20, 9, "a"); rect(g, 1, 1, 20, 1, "b");
    rect(g, 3, 2, 16, 6, "k");
    rect(g, 4, 3, 7, 1, "g"); rect(g, 4, 5, 10, 1, "g"); rect(g, 4, 7, 4, 1, "g");
    for (let i = 0; i < 4; i++) { put(g, 13 + i, 3, "g"); put(g, 13 + i, 6, i % 2 ? "r" : "y"); }
    rect(g, 0, 10, 22, 6, "d"); rect(g, 0, 10, 22, 1, "b");
    for (let x = 2; x < 20; x += 3) { put(g, x, 12, "r"); put(g, x + 1, 12, "y"); put(g, x, 14, "g"); put(g, x + 1, 14, "u"); }
    rect(g, 2, 16, 3, 1, "s"); rect(g, 17, 16, 3, 1, "s");
    return rowsOf(g);
  })(),
  pal: { a: "#c8d0e8", b: "#f0f4ff", d: "#7c88b0", k: "#101838", g: "#58f0c0", r: "#ff6868", y: "#ffe068", u: "#68b0ff", s: "#585c80" },
  solid: { x: 0, y: 9, w: 22, h: 9 },
});

export const SPACE_CRATE = defineProp({
  rows: (() => {
    const g = blank(14, 13);
    rect(g, 0, 0, 14, 13, "b");
    rect(g, 0, 0, 14, 2, "a"); rect(g, 0, 11, 14, 2, "d");
    rect(g, 0, 0, 2, 13, "c"); rect(g, 12, 0, 2, 13, "c");
    rect(g, 2, 5, 10, 3, "y");
    for (let x = 2; x < 12; x += 4) { rect(g, x, 5, 2, 3, "k"); }
    return rowsOf(g);
  })(),
  pal: { a: "#d4dcf0", b: "#a8b4d8", c: "#8896c0", d: "#6874a0", y: "#f8d848", k: "#303858" },
  solid: { x: 0, y: 3, w: 15, h: 12 },
});

export const OXYGEN_TANKS = defineProp({
  rows: (() => {
    const g = blank(14, 16);
    for (const x0 of [1, 8]) {
      rect(g, x0, 2, 5, 12, "a"); rect(g, x0, 2, 1, 12, "b"); rect(g, x0 + 4, 2, 1, 12, "d");
      rect(g, x0 + 1, 0, 3, 2, "s"); rect(g, x0, 6, 5, 2, "u");
    }
    return rowsOf(g);
  })(),
  pal: { a: "#e8ecf8", b: "#fafaff", d: "#a0a8c8", s: "#808098", u: "#48a0f0" },
  solid: { x: 0, y: 4, w: 16, h: 14 },
});

export const SPACE_LAMP = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(8, 26);
    rect(g, 3, 4, 2, 21, "s"); rect(g, 1, 24, 6, 2, "S");
    rect(g, 1, 0, 6, 4, f ? "w" : "y"); rect(g, 1, 0, 6, 1, "x");
    return rowsOf(g);
  }),
  fps: 1,
  pal: { s: "#a0a8c8", S: "#60688c", y: "#ffe888", w: "#fff8c8", x: "#ffffff" },
  solid: { x: 1, y: 22, w: 7, h: 6 },
});

// Helmet on the ground (decoy detail).
export const SPACE_HELMET = defineProp({
  rows: (() => {
    const g = blank(11, 10);
    blobs(g, [{ x: 5.5, y: 5, rx: 5, ry: 4.4 }], "abcd", { crease: false });
    rect(g, 2, 3, 7, 4, "v"); rect(g, 3, 3, 3, 1, "x");
    rect(g, 1, 8, 9, 2, "S");
    return rowsOf(g);
  })(),
  pal: { a: "#fafaff", b: "#e0e4f4", c: "#b0b8d4", d: "#8088ac", v: "#2c4c9c", x: "#78a8f0", S: "#686884" },
  solid: null,
});
