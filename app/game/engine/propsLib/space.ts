// Space props for the Pokémon-style moon base: planets and a comet in the
// void, a hand-drawn rocket with its launch gantry, the moon-base building,
// lander, rover, dishes and solar arrays on the surface, and the station
// interior (airlock, hull windows, control screens and consoles, lab tubes,
// cryo pods, bunks, vending machine, lockers) plus aliens and astronauts.
// Big pieces are drawn row by row (half-sprites mirrored with a tone swap so
// the left side is lit); `blobs()` is only used for planets and rocks.
import { defineProp, type PropDef } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put, type CharGrid } from "../shapes";
import { ellipse, line } from "./artkit";
import { text, textWidth, rng, inEllipse } from "./pixkit";

type G = CharGrid;
const dots = (n: number) => ".".repeat(Math.max(0, n));

/** Re-tint a prop from another world (keeps rows, frames, solid, flat…). */
export function retint(p: PropDef, pal: Record<string, string>): PropDef {
  return defineProp({
    rows: p.rows, frames: p.frames, fps: p.fps, pal: { ...p.pal, ...pal },
    solid: p.solid, flat: p.flat, outline: p.outline, baseY: p.baseY,
  });
}

/** Paint only on top of already-filled pixels (surface markings). */
function paintOn(g: G, x: number, y: number, rows: readonly string[]) {
  rows.forEach((r, yy) => {
    for (let xx = 0; xx < r.length; xx++) {
      const c = r[xx];
      if (c === "." || !g[y + yy] || g[y + yy][x + xx] === undefined || g[y + yy][x + xx] === ".") continue;
      g[y + yy][x + xx] = c;
    }
  });
}

/** Bevelled box: light top/left edge, dark bottom/right edge. */
function bevel(g: G, x: number, y: number, w: number, h: number, hi: string, mid: string, lo: string) {
  rect(g, x, y, w, h, mid);
  rect(g, x, y, w, 1, hi); rect(g, x, y, 1, h, hi);
  rect(g, x, y + h - 1, w, 1, lo); rect(g, x + w - 1, y, 1, h, lo);
}

/** Mirror a left half (last column = centre) with a tone swap on the right. */
const SWAP: Record<string, string> = { a: "d", b: "c", c: "b", d: "a", r: "u", s: "t", t: "s", u: "r" };
function sym(left: readonly string[], swap: Record<string, string> = SWAP): string[] {
  return left.map((r) => {
    const right = r.slice(0, -1).split("").reverse().map((c) => swap[c] ?? c).join("");
    return r + right;
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

// ── Comet (void decoration) ──────────────────────────────────────────────────
function cometRows(f: number): string[] {
  const g = blank(54, 24);
  for (let t = 0; t < 46; t++) {
    const cx = 9 + t, cy = 17 - t * 0.36;
    const hw = 4.2 * (1 - t / 46) + 0.4;
    for (let y = Math.floor(cy - hw); y <= Math.ceil(cy + hw); y++) {
      const d = Math.abs(y + 0.5 - cy) / hw;
      const px = Math.round(cx);
      if (t < 12 && d < 0.5) put(g, px, y, "h");
      else if (d < 0.55 && (px + y + f) % 2 === 0) put(g, px, y, t < 24 ? "i" : "j");
      else if (d < 1 && (px + y * 2 + f) % 3 === 0) put(g, px, y, "j");
    }
  }
  ellipse(g, 9, 17, 5, 5, "i");
  ellipse(g, 9, 17, 3.6, 3.6, "h");
  ellipse(g, 8.5, 16.5, 2, 2, "w");
  put(g, 7, 15, "x");
  const sp: [number, number][] = [[32, 7], [20, 14], [40, 4], [26, 11]];
  sp.forEach(([x, y], i) => { if ((i + f) % 2 === 0) put(g, x, y, "w"); });
  return rowsOf(g);
}
export const COMET = defineProp({
  frames: [cometRows(0), cometRows(1)],
  fps: 1.5,
  pal: { w: "#ffffff", x: "#ffffff", h: "#d8f4ff", i: "#8cc8ff", j: "#4c78d0" },
  outline: false,
  solid: null,
});

// ── Rocket (hero): ogive nose, flag roundel, porthole, red band and fins ─────
function rocketRows(): string[] {
  const W = 17, BW = 10;
  const tones = (w: number, hi: string, md: string) => { const n = w >= 6 ? 2 : 1; return hi.repeat(n) + md.repeat(w - n); };
  const body = (w: number, hi = "a", md = "b", f = 0) => dots(W - w - f) + (f > 0 ? "r" + "s".repeat(f - 1) : "") + tones(w, hi, md);
  const L: string[] = [];
  [1, 2, 3, 3, 4, 4, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 10, 10].forEach((w) => L.push(body(w, "r", "s")));
  const mark = (c: string) => dots(W - BW) + c.repeat(BW);
  L.push(mark("q"), mark("Q"));
  const upperStart = L.length;
  for (let i = 0; i < 14; i++) L.push(body(BW));
  L.push(mark("z"));
  const portStart = L.length;
  for (let i = 0; i < 16; i++) L.push(body(BW));
  L.push(mark("z"));
  for (let i = 0; i < 4; i++) L.push(body(BW, "r", "s"));
  L.push(mark("z"));
  const lowerStart = L.length;
  for (let i = 0; i < 14; i++) L.push(body(BW));
  L.push(mark("z"));
  [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 7, 7, 7].forEach((f) => L.push(body(BW, "a", "b", f)));
  L.push(mark("q"), mark("Q"));
  L.push(dots(W - 7) + "zzqqqqq", dots(W - 7) + "zqqQQQQ", dots(W - 7) + "qqQQQQQ");
  const g = sym(L).map((r) => r.split(""));
  const cx = W - 1;
  // porthole
  stamp(g, cx - 4, portStart + 3, [
    "..fffff..", ".ffVVVff.", "fVXXVVWWf", "fVXVVWWWf", "fVVVVWWZf", "fVVWWWZZf", ".fWWZZZF.", "..FFFFF..",
  ]);
  put(g, cx + 3, portStart + 5, "a");
  // flag roundel (celeste & white with a sun)
  const ry = upperStart + 4;
  stamp(g, cx - 5, ry, [
    "lllllllllll", "lllllllllll", "oooooonoooo", "ooooooooooo", "lllllllllll", "lllllllllll",
  ]);
  rect(g, cx - 5, ry - 1, 11, 1, "z"); rect(g, cx - 5, ry + 6, 11, 1, "z");
  // rivets on the lower body and above the porthole
  for (const y of [lowerStart + 2, lowerStart + 10, portStart + 1]) {
    for (const dx of [-7, -4, 0, 4, 7]) put(g, cx + dx, y, "z");
  }
  // nose highlight streak
  for (let y = 4; y < 15; y++) put(g, cx - 4 + Math.floor(y / 5), y, "R");
  return rowsOf(g);
}
const ROCKET_PAL = {
  a: "#fcfcff", b: "#e2e7f6", c: "#b9c2de", d: "#8c97bd",
  r: "#ff7a6a", s: "#e8505a", t: "#bc3048", u: "#8c1e3c", R: "#ffb0a0",
  q: "#6b7499", Q: "#444c70", z: "#a2acd0",
  f: "#8d98c0", F: "#4e5886", W: "#2f7ccc", V: "#5ab6fa", X: "#dcf6ff", Z: "#1e4c9a",
  l: "#6cc4f4", o: "#ffffff", n: "#f8c838",
};
const ROCKET_ROWS = rocketRows();
export const ROCKET_BIG = defineProp({
  rows: ROCKET_ROWS,
  pal: ROCKET_PAL,
  solid: { x: 7, y: ROCKET_ROWS.length - 22, w: 22, h: 24 },
});

// ── Launch gantry: orange lattice tower with a swing arm, blinking beacon ────
function gantryRows(on: boolean): string[] {
  const W = 40, H = 100;
  const g = blank(W, H);
  const rail = (x: number) => {
    for (let y = 8; y < H - 4; y++) { put(g, x, y, "a"); put(g, x + 1, y, "b"); put(g, x + 2, y, "c"); }
  };
  rail(2); rail(17);
  for (let k = 0; k < 7; k++) {
    const y0 = 8 + k * 12, y1 = y0 + 12;
    rect(g, 5, y0, 12, 1, "b");
    line(g, 5, y0 + 1, 16, y1 - 1, "b");
    line(g, 16, y0 + 1, 5, y1 - 1, "c");
    put(g, 5, y0 + 1, "a");
  }
  for (const y of [34, 60, 86]) {
    rect(g, 0, y, 24, 3, "b"); rect(g, 0, y, 24, 1, "a"); rect(g, 0, y + 2, 24, 1, "d");
    for (let x = 1; x < 24; x += 4) { put(g, x, y - 1, "c"); put(g, x, y - 2, "c"); }
    rect(g, 0, y - 3, 24, 1, "c");
  }
  // crown
  bevel(g, 1, 3, 20, 6, "a", "b", "d");
  rect(g, 4, 5, 3, 2, "k"); rect(g, 15, 5, 3, 2, "k");
  line(g, 11, 3, 11, 0, "d");
  put(g, 11, 0, on ? "R" : "y"); put(g, 10, 0, on ? "R" : "d"); put(g, 12, 0, on ? "R" : "d");
  // swing arm to the rocket, with a clamp
  bevel(g, 20, 40, 18, 4, "a", "b", "d");
  for (let x = 22; x < 36; x += 4) { line(g, x, 44, x + 2, 48, "c"); line(g, x + 2, 48, x + 4, 44, "c"); }
  rect(g, 20, 48, 18, 1, "c");
  bevel(g, 34, 36, 5, 12, "A", "B", "d");
  rect(g, 36, 38, 2, 8, "k");
  // base
  bevel(g, 0, H - 5, 24, 5, "a", "c", "d");
  for (let x = 2; x < 22; x += 5) put(g, x, H - 3, "k");
  rect(g, 0, H - 1, 24, 1, "d");
  // cable hanging from the arm
  for (let y = 49; y < 60; y++) put(g, 24 + (y > 54 ? 1 : 0), y, "k");
  return rowsOf(g);
}
export const GANTRY = defineProp({
  frames: [gantryRows(true), gantryRows(false)],
  fps: 1.4,
  pal: { a: "#ffb070", b: "#ec7440", c: "#b84a2c", d: "#7e3024", k: "#34262c", A: "#fff0e0", B: "#d8d8e8", R: "#ff3c3c", y: "#8a2a2a" },
  solid: { x: 0, y: 92, w: 25, h: 10 },
});

// ── Moon-base building: observatory dome over a two-storey hall with wings ──
function baseRows(): string[] {
  const W = 92, H = 66;
  const g = blank(W, H);
  const cx = 46;
  // wings
  const wing = (x0: number, side: number) => {
    bevel(g, x0, 38, 20, 26, "M", "N", "O");
    rect(g, x0 + 1, 37, 18, 1, "M"); rect(g, x0 + 2, 36, 16, 1, "M");
    rect(g, x0 + 2, 36, 16, 1, "m");
    for (const wy of [42]) {
      bevel(g, x0 + 4, wy, 12, 8, "m", "v", "V");
      rect(g, x0 + 5, wy + 1, 10, 6, "k");
      rect(g, x0 + 5, wy + 1, 10, 1, "w");
      for (let i = 0; i < 4; i++) put(g, x0 + 6 + i * 3 + (side > 0 ? 0 : 0), wy + 3 + (i % 2), "x");
    }
    // vent + lights
    for (let i = 0; i < 4; i++) rect(g, x0 + 4, 54 + i * 2, 12, 1, "O");
    put(g, x0 + 17, 40, "y"); put(g, x0 + 2, 40, "R");
  };
  wing(0, -1); wing(72, 1);
  // pipes joining wings and hall
  rect(g, 18, 46, 6, 4, "M"); rect(g, 18, 46, 6, 1, "m"); rect(g, 18, 49, 6, 1, "O");
  rect(g, 68, 46, 6, 4, "M"); rect(g, 68, 46, 6, 1, "m"); rect(g, 68, 49, 6, 1, "O");
  // main hall
  bevel(g, 18, 30, 56, 34, "m", "M", "O");
  rect(g, 18, 30, 56, 2, "w"); rect(g, 18, 32, 56, 1, "m");
  rect(g, 18, 33, 56, 1, "N");
  for (let x = 19; x < 73; x += 8) { rect(g, x, 34, 1, 22, "N"); }
  // hall windows beside the door
  for (const wx of [22, 61]) {
    bevel(g, wx, 47, 10, 8, "w", "v", "V");
    rect(g, wx + 1, 48, 8, 6, "k"); rect(g, wx + 1, 48, 8, 1, "x"); put(g, wx + 2, 50, "w"); put(g, wx + 4, 49, "w"); put(g, wx + 6, 52, "x");
    rect(g, wx - 1, 55, 12, 1, "O");
  }
  // upper strip of tiny lights under the roof
  for (let x = 22; x < 71; x += 4) put(g, x, 34, x % 8 === 2 ? "y" : "x");
  // sign plate "BASE"
  const sw = textWidth("BASE") + 6;
  const sx = cx - Math.floor(sw / 2);
  bevel(g, sx, 36, sw, 9, "B", "U", "u");
  text(g, sx + 3, 38, "BASE", "w");
  // door with frame, lights and a hazard step
  bevel(g, cx - 9, 48, 18, 16, "w", "N", "O");
  rect(g, cx - 7, 50, 14, 14, "k");
  rect(g, cx - 7, 50, 7, 14, "D"); rect(g, cx, 50, 7, 14, "E");
  rect(g, cx - 1, 50, 2, 14, "k");
  rect(g, cx - 6, 52, 5, 4, "x"); rect(g, cx + 1, 52, 5, 4, "x");
  put(g, cx - 6, 52, "w"); put(g, cx + 1, 52, "w");
  put(g, cx - 10, 49, "y"); put(g, cx + 9, 49, "y");
  for (let x = 17; x < 75; x++) { put(g, x, 62, (x % 8 < 4) ? "y" : "k"); put(g, x, 63, (x % 8 < 4) ? "Y" : "k"); }
  // dome
  const hw = [4, 7, 10, 12, 14, 16, 18, 19, 21, 22, 23, 24, 25, 26, 26, 27, 27, 28, 28, 28, 28, 28, 28, 28];
  const top = 6;
  hw.forEach((h, i) => {
    for (let x = -h; x < h; x++) {
      const u = (x + h) / (2 * h);
      let c = u < 0.14 ? "a" : u < 0.46 ? "b" : u < 0.76 ? "c" : "d";
      if (i < 2) c = "a";
      if (i > 20) c = c === "a" ? "b" : c === "b" ? "c" : "d";
      put(g, cx + x, top + i, c);
    }
  });
  // dome ribs and rings
  for (const f of [0.22, 0.5, 0.78]) {
    hw.forEach((h, i) => {
      if (i < 3) return;
      const x = cx - h + Math.round(f * 2 * h);
      put(g, x, top + i, "e");
    });
  }
  for (const i of [8, 15]) hw.forEach((h, k) => { if (k === i) for (let x = -h; x < h; x++) put(g, cx + x, top + k, "e"); });
  // glass slit
  for (let i = 10; i < 14; i++) { const h = hw[i]; for (let x = -h + 3; x < h - 3; x++) { if ((x + cx) % 11 !== 0) put(g, cx + x, top + i, i === 10 ? "W" : "k"); } }
  for (let x = -18; x < 18; x += 6) put(g, cx + x + 2, top + 11, "x");
  rect(g, cx - 30, top + 24, 60, 1, "N");
  // dome rim, antenna mast
  bevel(g, cx - 29, top + 24, 58, 2, "m", "M", "O");
  line(g, cx, top - 1, cx, 0, "M"); put(g, cx, 0, "R"); put(g, cx - 1, 0, "R");
  line(g, cx + 12, top + 5, cx + 12, 0, "M"); rect(g, cx + 10, 1, 5, 2, "m");
  return rowsOf(g);
}
export const MOON_BASE = defineProp({
  rows: baseRows(),
  pal: {
    a: "#f2fcff", b: "#c4ecfa", c: "#92cae8", d: "#6a9ac8", e: "#4f7caa",
    m: "#eef2fc", M: "#c8d2ec", N: "#9eabcf", O: "#6e7ba4", w: "#ffffff",
    v: "#6c7aa8", V: "#454f78", k: "#232a48", D: "#8a92b8", E: "#6e769c", x: "#78a8f0", W: "#2c4c98",
    U: "#3c6cd0", u: "#2848a0", B: "#78a4f0", y: "#f8d848", Y: "#c8a028", R: "#ff4a4a",
  },
  solid: { x: 0, y: 36, w: 94, h: 30 },
});

// ── Lunar module (hand-built: gold foil descent stage, grey cabin, legs) ─────
export const LANDER = defineProp({
  rows: (() => {
    const g = blank(36, 36);
    // legs + pads
    for (const [x0, x1] of [[10, 3], [26, 33]] as const) { line(g, x0, 22, x1, 33, "s"); line(g, x0 + (x0 < 18 ? 1 : -1), 22, x1 + (x0 < 18 ? 1 : -1), 33, "S"); }
    for (const [x0, x1] of [[14, 12], [22, 24]] as const) { line(g, x0, 24, x1, 33, "s"); }
    for (const x of [0, 8, 26, 32]) { rect(g, x, 33, 5, 2, "S"); rect(g, x, 33, 5, 1, "s"); }
    // ladder on the left leg
    for (let i = 0; i < 4; i++) rect(g, 5 + Math.floor(i * 1.3), 25 + i * 2, 4, 1, "g");
    // descent stage: octagon with gold foil
    const dsh = [[9, 20], [8, 21], [7, 22], [7, 23], [7, 24], [7, 25], [7, 26], [8, 27], [9, 28]] as const;
    dsh.forEach(([x0, w], i) => { for (let x = x0; x < 29 - (x0 - 7); x++) put(g, x, 17 + i, (x + i) % 4 === 0 ? "Y" : (x * 3 + i) % 5 === 0 ? "o" : "y"); void w; });
    rect(g, 7, 17, 22, 1, "Y"); rect(g, 7, 26, 22, 1, "o"); rect(g, 8, 27, 20, 1, "o");
    for (let y = 18; y < 27; y++) put(g, 28, y, "o");
    // ascent stage: grey cabin with triangular windows
    bevel(g, 11, 6, 15, 11, "G", "g", "h");
    rect(g, 12, 5, 13, 1, "G"); rect(g, 13, 4, 11, 1, "G");
    stamp(g, 13, 8, ["kkkk", ".kkk", "..kk"]); stamp(g, 21, 8, ["kkkk", "kkk.", "kk.."]);
    put(g, 13, 8, "x"); put(g, 21, 8, "x");
    rect(g, 15, 13, 6, 3, "h"); rect(g, 16, 14, 4, 1, "k");
    // thrusters, antennae, small dish
    rect(g, 8, 10, 3, 3, "g"); rect(g, 26, 10, 3, 3, "g"); put(g, 8, 10, "G"); put(g, 26, 10, "G");
    line(g, 27, 4, 31, 0, "s"); put(g, 31, 0, "R");
    ellipse(g, 6, 4, 4, 2, "g"); put(g, 6, 4, "k"); line(g, 6, 4, 8, 6, "h");
    return rowsOf(g);
  })(),
  pal: { s: "#b8bcd0", S: "#6c7090", g: "#d8dcec", G: "#fafcff", h: "#9094b4", k: "#1c2444", x: "#7cb0f8", y: "#e8b83c", Y: "#fff098", o: "#a8782a", R: "#ff4848" },
  solid: { x: 6, y: 20, w: 24, h: 16 },
});

// ── Six-wheeled rover with solar panel and a mast dish ───────────────────────
const WHEEL = [".kkkk.", "kmssmk", "ksccsk", "ksccsk", "kmssmk", ".kkkk."];
export const ROVER = defineProp({
  rows: (() => {
    const g = blank(40, 26);
    // chassis
    bevel(g, 6, 10, 28, 7, "a", "b", "d");
    rect(g, 6, 14, 28, 1, "c");
    for (let x = 8; x < 33; x += 4) put(g, x, 12, "d");
    // cabin with glass
    bevel(g, 10, 3, 12, 8, "a", "b", "d");
    rect(g, 11, 4, 10, 5, "w"); rect(g, 11, 4, 10, 1, "x"); put(g, 12, 5, "x"); put(g, 13, 5, "x");
    rect(g, 16, 4, 1, 5, "d");
    // solar panel on the back, tilted
    for (let i = 0; i < 6; i++) rect(g, 24 + i, 3 - Math.floor(i / 3), 9, 1, i % 2 ? "P" : "p");
    for (let i = 0; i < 4; i++) rect(g, 25 + i * 2, 1, 1, 6, "q");
    rect(g, 23, 6, 2, 4, "d");
    // mast with dish
    line(g, 5, 10, 5, 3, "d"); ellipse(g, 5, 3, 3, 1.4, "a"); put(g, 5, 1, "R");
    // wheels
    for (const x of [3, 14, 27]) {
      stamp(g, x, 17, WHEEL);
      line(g, x + 3, 17, x + 3, 15, "d");
    }
    // pennant
    rect(g, 33, 6, 3, 2, "n");
    return rowsOf(g);
  })(),
  pal: { a: "#f4f6fe", b: "#d2d8ec", c: "#aeb6d4", d: "#7c84a8", w: "#3a5ca8", x: "#8cb8ff", p: "#3a6ad8", P: "#2848a8", q: "#a8c8ff", k: "#2c3050", m: "#9098b8", s: "#c8cee4", R: "#ff5050", n: "#78c8f8" },
  solid: { x: 2, y: 10, w: 38, h: 16 },
});

// ── Flag (celeste & white, Sol de Mayo): two frames of gentle waving ─────────
function flagRows(f: number): string[] {
  const g = blank(26, 34);
  rect(g, 1, 0, 1, 32, "s"); rect(g, 0, 31, 5, 3, "S"); rect(g, 0, 31, 5, 1, "s");
  put(g, 1, 0, "y"); put(g, 0, 0, "y"); put(g, 2, 0, "y");
  const wave = f === 0 ? [0, 0, 1, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 1, 0, 0, -1, -1, 0, 0, 1, 1, 0, 0] : [0, 0, 0, 1, 1, 1, 0, 0, -1, -1, 0, 0, 0, 1, 1, 1, 0, 0, -1, -1, 0, 0, 0, 1];
  for (let x = 0; x < 22; x++) {
    const o = wave[x];
    for (let y = 0; y < 14; y++) {
      const c = y < 4 ? (y === 0 ? "L" : "l") : y < 10 ? "o" : y === 13 ? "m" : "l";
      put(g, 3 + x, 2 + y + o, c);
    }
    put(g, 3 + x, 2 + 9 + o, x % 2 ? "O" : "o");
  }
  // sun
  const o = wave[11];
  stamp(g, 12, 5 + o, [".y.y.", "yyYyy", ".YYY.", "yyYyy", ".y.y."].map((r) => r));
  return rowsOf(g);
}
export const MOON_FLAG = defineProp({
  frames: [flagRows(0), flagRows(1)],
  fps: 2,
  pal: { s: "#d4d8e8", S: "#6c7090", l: "#78c8f6", L: "#b4e4ff", m: "#4c98d0", o: "#ffffff", O: "#d8dcec", y: "#f8c838", Y: "#d89818" },
  solid: { x: 0, y: 29, w: 6, h: 7 },
});

// ── Parabolic dish on a pedestal ─────────────────────────────────────────────
export const DISH = defineProp({
  rows: (() => {
    const g = blank(30, 34);
    stamp(g, 3, 0, [
      "...cccccccccccccc...",
      ".ccbbbbbbbbbbbbbbcc.",
      ".cbbbbbbbbbbbbbbbbdc",
      "cbbbbbbddddddbbbbbdd",
      "cbbbbbdddeeeddbbbbdd",
      "cbbbbddeeeyeeddbbbdd",
      "cbbbbddeeeeeeddbbbdd",
      "cbbbbbdddeeeddbbbbdd",
      ".cbbbbbbddddbbbbbbd.",
      ".ccbbbbbbbbbbbbbbdd.",
      "...ccbbbbbbbbbbddd..",
      ".....dddddddddddd...",
    ]);
    // lit rim
    for (let x = 6; x < 18; x++) put(g, x, 0, "a");
    for (let y = 1; y < 6; y++) put(g, 3 + (y < 3 ? 1 : 0), y, "a");
    // feed arm
    line(g, 13, 7, 13, 14, "k"); line(g, 13, 7, 16, 14, "k");
    // yoke + mast
    bevel(g, 10, 12, 10, 6, "a", "m", "d");
    rect(g, 13, 18, 4, 10, "m"); rect(g, 13, 18, 1, 10, "a"); rect(g, 16, 18, 1, 10, "d");
    // base
    bevel(g, 6, 27, 18, 7, "a", "m", "d");
    rect(g, 8, 29, 4, 2, "k"); put(g, 19, 29, "R"); put(g, 21, 29, "y");
    return rowsOf(g);
  })(),
  pal: { a: "#ffffff", b: "#e6eaf6", c: "#c0c8e0", d: "#8e98bc", e: "#6c7498", y: "#f8d848", k: "#4c5478", m: "#c8d0e8", R: "#ff5050" },
  solid: { x: 5, y: 26, w: 22, h: 10 },
});

// ── Solar arrays ─────────────────────────────────────────────────────────────
function panel(g: G, x: number, y: number, w: number, h: number, skew: number) {
  for (let r = 0; r < h; r++) {
    const sx = x + Math.round(((h - 1 - r) * skew));
    for (let c = 0; c < w; c++) {
      const edge = c === 0 || c === w - 1 || r === 0 || r === h - 1;
      let ch = edge ? "q" : c % 5 === 0 || r % 4 === 0 ? "P" : r < h / 3 ? "r" : "p";
      if (!edge && (c + r) % 11 === 0) ch = "r";
      if (r === h - 1 || c === w - 1) ch = edge ? "Q" : ch;
      put(g, sx + c, y + r, ch);
    }
  }
}
const SOLAR_PAL = { p: "#3868d8", P: "#2444a0", q: "#a8c8ff", Q: "#1c3478", r: "#5c8cf0", s: "#b8bcd0", S: "#6c7090", k: "#2c3050" };
export const SOLAR_FARM = defineProp({
  rows: (() => {
    const g = blank(56, 26);
    for (const px of [2, 20, 38]) {
      panel(g, px, 2, 16, 14, 0.45);
      rect(g, px + 8, 16, 2, 7, "s"); rect(g, px + 9, 16, 1, 7, "S");
      rect(g, px + 4, 22, 10, 2, "S"); rect(g, px + 4, 22, 10, 1, "s");
    }
    rect(g, 0, 24, 56, 1, "k");
    return rowsOf(g);
  })(),
  pal: SOLAR_PAL,
  solid: { x: 2, y: 18, w: 54, h: 10 },
});
export const SOLAR_TALL = defineProp({
  rows: (() => {
    const g = blank(34, 32);
    panel(g, 2, 1, 30, 16, 0.5);
    line(g, 6, 17, 16, 24, "S"); line(g, 28, 17, 18, 24, "S");
    rect(g, 15, 18, 4, 11, "s"); rect(g, 15, 18, 1, 11, "a"); rect(g, 18, 18, 1, 11, "S");
    bevel(g, 9, 28, 16, 4, "a", "s", "S");
    return rowsOf(g);
  })(),
  pal: { ...SOLAR_PAL, a: "#eef0fa" },
  solid: { x: 8, y: 26, w: 18, h: 8 },
});

// ── Airlock frame over the hull gap (flat: sits under the characters) ────────
function airlockRows(on: boolean): string[] {
  const W = 48, H = 32;
  const g = blank(W, H);
  // pillars with a hazard stripe
  for (const x0 of [0, 41]) {
    bevel(g, x0, 0, 7, 32, "a", "b", "d");
    for (let y = 5; y < 30; y++) if ((y + (x0 ? 1 : 0)) % 6 < 3) { rect(g, x0 + 1, y, 5, 1, "y"); } else rect(g, x0 + 1, y, 5, 1, "k");
    rect(g, x0, 0, 7, 2, "a"); rect(g, x0, 30, 7, 2, "d");
  }
  // lintel with lights and the label
  bevel(g, 0, 0, W, 11, "a", "b", "d");
  rect(g, 8, 2, 32, 7, "n"); rect(g, 8, 2, 32, 1, "N"); rect(g, 8, 8, 32, 1, "k");
  text(g, 11, 3, "ESCLUSA", "w");
  put(g, 9, 5, on ? "R" : "q"); put(g, 38, 5, on ? "q" : "R");
  put(g, 3, 5, on ? "R" : "q"); put(g, 44, 5, on ? "q" : "R");
  // inner door leaves (open, shown as thin slats at the sides)
  rect(g, 7, 11, 2, 21, "d"); rect(g, 39, 11, 2, 21, "d");
  for (let y = 12; y < 31; y += 3) { put(g, 7, y, "k"); put(g, 40, y, "k"); }
  return rowsOf(g);
}
export const AIRLOCK = defineProp({
  frames: [airlockRows(true), airlockRows(false)],
  fps: 1.2,
  pal: { a: "#d8e2f6", b: "#a4b4d8", d: "#6a7aa4", y: "#f8d848", k: "#2c3452", n: "#2c4c9c", N: "#6c9cf0", w: "#ffffff", R: "#ff5050", q: "#7a2c3c" },
  outline: false,
  flat: true,
});

// ── Hull windows looking out at the stars (flat, on the station wall) ────────
function windowRows(w: number, h: number, planet: boolean, seed: number): string[] {
  const g = blank(w, h);
  const r = rng(seed);
  bevel(g, 0, 0, w, h, "a", "b", "d");
  rect(g, 1, 1, w - 2, h - 2, "c");
  rect(g, 3, 3, w - 6, h - 6, "k");
  const gx = 3, gy = 3, gw = w - 6, gh = h - 6;
  for (let i = 0; i < gw * gh * 0.06; i++) {
    put(g, gx + Math.floor(r() * gw), gy + Math.floor(r() * gh), r() < 0.2 ? "Y" : r() < 0.5 ? "w" : "s");
  }
  if (planet) {
    // Earth peeking up from the lower-left corner: banded ocean, tan land, clouds
    const paintPlanet = (px: number, py: number, rows: readonly string[], ch: string) =>
      rows.forEach((r, yy) => { for (let xx = 0; xx < r.length; xx++) {
        if (r[xx] === "#" && "EefF".includes(g[gy + py + yy]?.[gx + px + xx] ?? "")) g[gy + py + yy][gx + px + xx] = ch;
      } });
    for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
      const dx = x - 6, dy = y - (gh + 5);
      if (dx * dx + dy * dy < 19 * 19) {
        const lit = -(dx * 0.6 + dy * 0.8) / 19;
        put(g, gx + x, gy + y, lit > 0.55 ? "E" : lit > 0.3 ? "e" : lit > 0.05 ? "f" : "F");
      }
    }
    paintPlanet(5, 8, ["..###.", ".#####", "###.#.", ".##.."], "G");
    paintPlanet(14, 6, ["#####", ".###.", "..#.."], "G");
    paintPlanet(2, 13, ["###", ".##"], "G");
    paintPlanet(9, 10, ["#####..", ".######"], "W");
    paintPlanet(17, 11, ["####", "..##"], "W");
  }
  // glass glare
  for (let i = 0; i < 5; i++) { put(g, gx + 2 + i, gy + 5 - i, "h"); put(g, gx + 6 + i, gy + 5 - i, "h"); }
  // mullions
  rect(g, Math.floor(w / 2), 3, 2, h - 6, "c"); rect(g, Math.floor(w / 2), 3, 1, h - 6, "b");
  rect(g, 3, h - 5, w - 6, 1, "d");
  return rowsOf(g);
}
const WIN_PAL = { a: "#dce6fa", b: "#aab8dc", c: "#7886b0", d: "#505e88", k: "#08082c", w: "#ffffff", s: "#6a7ac8", Y: "#f8e888", E: "#a8dcff", e: "#58a4f0", f: "#3470d0", F: "#244aa0", G: "#c8b068", W: "#ffffff", h: "#24307c" };
export const WINDOW_EARTH = defineProp({ rows: windowRows(46, 24, true, 7), pal: WIN_PAL, outline: false, flat: true });
export const WINDOW_STARS = defineProp({ rows: windowRows(46, 24, false, 11), pal: WIN_PAL, outline: false, flat: true });
export const WINDOW_SMALL = defineProp({ rows: windowRows(30, 24, false, 19), pal: WIN_PAL, outline: false, flat: true });

// ── Stencilled pad number (flat on the concrete) ─────────────────────────────
export const PAD_TEXT = defineProp({
  rows: (() => { const g = blank(24, 7); text(g, 0, 0, "PAD 01", "y", 1, "d"); return rowsOf(g); })(),
  pal: { y: "#f8d848", d: "#5c4a10" },
  outline: false,
  flat: true,
});

// ── Wall plaques (CONTROL / LAB) and big control screens ─────────────────────
function plaque(label: string, bg: string, hi: string, lo: string, fg = "#ffffff") {
  const w = textWidth(label) + 8, h = 11;
  const g = blank(w, h);
  bevel(g, 0, 0, w, h, "h", "b", "l");
  text(g, 4, 3, label, "f", 1, "s");
  put(g, 1, 1, "y"); put(g, w - 2, 1, "y"); put(g, 1, h - 2, "y"); put(g, w - 2, h - 2, "y");
  return defineProp({ rows: rowsOf(g), pal: { b: bg, h: hi, l: lo, f: fg, s: "#1c2444", y: "#f8e070" }, outline: false, flat: true });
}
export const PLAQUE_CONTROL = plaque("CONTROL", "#2c64c8", "#78a4f0", "#1c3c88");
export const PLAQUE_LAB = plaque("LAB", "#8c48c0", "#c490f0", "#582a88");
export const PLAQUE_HANGAR = plaque("HANGAR", "#d87020", "#ffb060", "#8c4010");
export const PLAQUE_REST = plaque("DESCANSO", "#2c9cb0", "#78e0f0", "#18606c");

function screenWallRows(f: number): string[] {
  const W = 92, H = 24;
  const g = blank(W, H);
  bevel(g, 0, 0, W, H, "a", "b", "d");
  const screen = (x: number, y: number, w: number, h: number) => {
    rect(g, x, y, w, h, "k");
    rect(g, x, y, w, 1, "n"); rect(g, x, y, 1, h, "n");
    rect(g, x + 1, y + 1, w - 2, h - 2, "K");
  };
  // left: bar graph
  screen(4, 3, 22, 17);
  for (let i = 0; i < 6; i++) { const hh = 3 + ((i * 5 + f * 3) % 9); rect(g, 7 + i * 3, 17 - hh, 2, hh, i % 3 === 0 ? "y" : i % 3 === 1 ? "c" : "m"); }
  rect(g, 6, 17, 18, 1, "n");
  // centre: orbit scope
  screen(30, 2, 32, 19);
  ellipse(g, 46, 11, 13, 7, "N");
  ellipse(g, 46, 11, 12, 6, "K");
  ellipse(g, 46, 11, 5, 5, "e"); ellipse(g, 46, 11, 4, 4, "E");
  put(g, 44, 9, "w"); put(g, 45, 9, "w");
  const ang = [[56, 8], [51, 5], [41, 16], [36, 11]][f % 4];
  rect(g, ang[0], ang[1], 2, 2, "y"); put(g, ang[0] - 1, ang[1] - 1, "w");
  rect(g, 33, 4, 8, 1, "c"); rect(g, 33, 6, 5, 1, "c"); rect(g, 52, 18, 8, 1, "m");
  text(g, 33, 15, "T-" + (f % 2 ? "10" : "09"), "y");
  // right: heartbeat line
  screen(66, 3, 22, 17);
  const pts = [0, 0, 1, -1, 4, -5, 5, 2, 0, 0, 0, 1, -1, 0, 0, 0, 0, 0, 0, 0];
  for (let x = 0; x < 18; x++) {
    const v = pts[(x + f * 4) % pts.length];
    put(g, 68 + x, 12 + v, "c"); put(g, 68 + x, 12 + v + 1, "C");
  }
  rect(g, 68, 5, 6, 1, "m"); rect(g, 76, 5, 6, 1, "y");
  // status lights across the bezel
  for (let i = 0; i < 4; i++) put(g, 28 + i * 0, 4 + i * 4, i % 2 ? "R" : "y");
  return rowsOf(g);
}
export const SCREEN_WALL = defineProp({
  frames: [0, 1, 2, 3].map(screenWallRows),
  fps: 1.4,
  pal: { a: "#dce6fa", b: "#aab8dc", d: "#505e88", k: "#0a1030", K: "#0e1c48", n: "#4864a8", c: "#58f0ff", C: "#2a88b0", m: "#ff78c0", y: "#ffe068", e: "#58a4f0", E: "#9cd0ff", N: "#2c4c88", w: "#ffffff", R: "#ff5050" },
  outline: false,
  flat: true,
});

// ── Control-room furniture ───────────────────────────────────────────────────
function consoleRows(f: number): string[] {
  const g = blank(44, 30);
  // two monitors on arms
  for (const x0 of [3, 24]) {
    bevel(g, x0, 0, 17, 12, "a", "b", "d");
    rect(g, x0 + 2, 2, 13, 8, "k");
    for (let i = 0; i < 4; i++) rect(g, x0 + 3, 3 + i * 2, 3 + ((i * 5 + f * 2) % 7), 1, i % 2 ? "c" : "y");
    rect(g, x0 + 11, 3, 3, 6, "n"); put(g, x0 + 12, 4 + (f % 4), "w");
    rect(g, x0 + 7, 12, 3, 3, "d");
  }
  // desk top and sloped panel
  bevel(g, 0, 14, 44, 5, "a", "b", "d");
  rect(g, 0, 19, 44, 9, "m"); rect(g, 0, 19, 44, 1, "d");
  rect(g, 0, 27, 44, 2, "k");
  for (let i = 0; i < 7; i++) { const x = 3 + i * 6; rect(g, x, 21, 4, 2, "k"); put(g, x, 21, i % 2 ? "R" : "y"); put(g, x + 2, 21, "c"); put(g, x + 1, 24, i % 3 === (f % 3) ? "w" : "c"); put(g, x + 3, 24, "y"); }
  rect(g, 17, 16, 10, 2, "d"); for (let x = 18; x < 26; x += 2) put(g, x, 16, "w");
  rect(g, 2, 29, 4, 1, "k"); rect(g, 38, 29, 4, 1, "k");
  return rowsOf(g);
}
export const CONSOLE_DESK = defineProp({
  frames: [0, 1, 2, 3].map(consoleRows),
  fps: 1.6,
  pal: { a: "#e8eefc", b: "#b8c4e4", d: "#6a78a4", k: "#1c2444", n: "#2c4c9c", c: "#58f0ff", y: "#ffe068", m: "#4a5a8c", w: "#ffffff", R: "#ff5858" },
  solid: { x: 0, y: 12, w: 44, h: 18 },
});

export const HOLO_TABLE = defineProp({
  frames: [0, 1, 2].map((f) => {
    const g = blank(40, 40);
    // hologram cone with scan lines
    for (let y = 8; y < 24; y++) {
      const hw = 3 + Math.floor((y - 8) * 0.9);
      for (let x = -hw; x <= hw; x++) if ((y + f) % 2 === 0 || Math.abs(x) === hw) put(g, 20 + x, y, Math.abs(x) === hw ? "H" : "h");
    }
    // spinning globe
    for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
      if (!inEllipse(x, y, 7, 7, 6.4, 6.4)) continue;
      const lon = (x + f * 3) % 7 === 0, lat = y === 3 || y === 7 || y === 10;
      put(g, 13 + x, y, lon || lat ? "w" : (x + y) % 3 === 0 ? "c" : "e");
    }
    // pedestal
    rect(g, 12, 25, 16, 6, "m"); rect(g, 12, 25, 1, 6, "a"); rect(g, 27, 25, 1, 6, "d");
    bevel(g, 4, 23, 32, 3, "a", "b", "d");
    rect(g, 6, 22, 28, 1, "n");
    for (let i = 0; i < 6; i++) put(g, 8 + i * 5, 24, i % 3 === f ? "R" : "c");
    bevel(g, 6, 30, 28, 6, "a", "b", "d");
    rect(g, 8, 32, 24, 2, "k");
    rect(g, 3, 36, 34, 3, "d"); rect(g, 3, 36, 34, 1, "b");
    return rowsOf(g);
  }),
  fps: 2.5,
  pal: { a: "#eef2ff", b: "#b8c4e4", d: "#6a78a4", k: "#1c2444", m: "#8a98c4", n: "#58a4f0", c: "#58f0ff", e: "#2c7cd8", w: "#d8fcff", h: "#7cf0ff", H: "#c8fcff", R: "#ff5858" },
  solid: { x: 2, y: 24, w: 36, h: 16 },
});

// ── Laboratory: specimen tubes, a cryo pod and a bench ───────────────────────
function tubeRows(f: number, creature: boolean): string[] {
  const g = blank(16, 44);
  bevel(g, 0, 0, 16, 5, "a", "m", "d");
  rect(g, 6, 1, 4, 1, "k");
  bevel(g, 0, 39, 16, 5, "a", "m", "d");
  rect(g, 2, 41, 3, 1, "y"); rect(g, 6, 41, 3, 1, "c"); put(g, 12, 41, f % 2 ? "R" : "r");
  // glass
  rect(g, 2, 5, 12, 34, "G");
  rect(g, 2, 5, 1, 34, "g"); rect(g, 13, 5, 1, 34, "i");
  // liquid
  rect(g, 3, 9, 10, 30, "l"); rect(g, 3, 9, 3, 30, "L"); rect(g, 11, 9, 2, 30, "q");
  rect(g, 3, 9, 10, 1, "w");
  // bubbles rising (3 frames)
  const bub = [[5, 34], [9, 27], [6, 19], [10, 13], [7, 30]];
  bub.forEach(([x, y], i) => { const yy = y - ((f * 3 + i * 2) % 10); if (yy > 10) { put(g, x, yy, "w"); if (i % 2) put(g, x + 1, yy + 1, "L"); } });
  if (creature) {
    stamp(g, 5, 20, [".ww.", "wkkw", ".ww.", ".cc.", "c..c"]);
    put(g, 5 + 1, 21, "k");
  }
  put(g, 4, 11, "w"); put(g, 4, 12, "w");
  return rowsOf(g);
}
const TUBE_BASE = { a: "#e8eefc", m: "#a8b4d8", d: "#586890", k: "#1c2444", y: "#ffe068", c: "#58f0ff", R: "#ff5858", r: "#7a2c3c", G: "#bcd8f0", g: "#e8f8ff", i: "#7a9cc8", w: "#ffffff" };
export const TUBE_CYAN = defineProp({
  frames: [0, 1, 2].map((f) => tubeRows(f, false)), fps: 3,
  pal: { ...TUBE_BASE, l: "#48c4f0", L: "#9cecff", q: "#2878c0" }, solid: { x: 0, y: 38, w: 16, h: 8 },
});
export const TUBE_PURPLE = defineProp({
  frames: [0, 1, 2].map((f) => tubeRows(f, true)), fps: 3,
  pal: { ...TUBE_BASE, l: "#a868e8", L: "#dcb0ff", q: "#6c3cb0" }, solid: { x: 0, y: 38, w: 16, h: 8 },
});
export const TUBE_PINK = defineProp({
  frames: [0, 1, 2].map((f) => tubeRows(f, false)), fps: 3,
  pal: { ...TUBE_BASE, l: "#f070b8", L: "#ffb8e0", q: "#b0407c" }, solid: { x: 0, y: 38, w: 16, h: 8 },
});

export const CRYO_POD = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(26, 46);
    bevel(g, 0, 34, 26, 12, "a", "m", "d");
    rect(g, 3, 38, 20, 4, "k"); for (let i = 0; i < 5; i++) put(g, 5 + i * 4, 39, i === f + 1 ? "R" : "c");
    rect(g, 2, 36, 22, 1, "y");
    // capsule
    for (let y = 2; y < 35; y++) {
      const hw = y < 8 ? 5 + y : y > 30 ? 12 - (y - 30) / 2 : 12;
      for (let x = 13 - Math.round(hw); x < 13 + Math.round(hw); x++) {
        const u = (x - (13 - hw)) / (2 * hw);
        put(g, x, y, u < 0.15 ? "w" : u < 0.5 ? "G" : u < 0.8 ? "g" : "i");
      }
    }
    // frost and mist
    for (let i = 0; i < 20; i++) put(g, 5 + ((i * 7) % 16), 20 + ((i * 5 + f * 3) % 14), (i + f) % 3 ? "F" : "w");
    for (let x = 4; x < 22; x += 2) put(g, x + (f % 2), 33, "w");
    // sleeper: a little astronaut silhouette
    stamp(g, 8, 10, ["..oooo..", ".oVVVVo.", ".oVxVVo.", "..oooo..", ".ooooooo", "oooccooo", ".ooooooo", ".oo..oo."]);
    // top cap
    rect(g, 8, 0, 10, 3, "m"); rect(g, 8, 0, 10, 1, "a");
    return rowsOf(g);
  }),
  fps: 1.4,
  pal: { a: "#e8eefc", m: "#a8b4d8", d: "#586890", k: "#1c2444", y: "#58a4f0", c: "#58f0ff", R: "#ff5858", w: "#f4fcff", G: "#a8d4f0", g: "#7cb4e0", i: "#4c80c0", F: "#d8f0ff", o: "#f2f4fc", V: "#2c4c9c", x: "#8cb8ff" },
  solid: { x: 0, y: 32, w: 26, h: 16 },
});

export const LAB_BENCH = defineProp({
  rows: (() => {
    const g = blank(52, 30);
    // bench top
    bevel(g, 0, 12, 52, 6, "a", "b", "d");
    rect(g, 0, 18, 52, 10, "m"); rect(g, 0, 18, 52, 1, "d");
    rect(g, 3, 20, 14, 6, "n"); rect(g, 19, 20, 14, 6, "n"); rect(g, 35, 20, 14, 6, "n");
    for (const x of [9, 25, 41]) { rect(g, x, 22, 3, 1, "k"); }
    rect(g, 1, 28, 3, 2, "k"); rect(g, 48, 28, 3, 2, "k");
    // beakers and flasks
    stamp(g, 4, 3, ["gg.gg", "g...g", "g.l.g", "glllg", "ggggg"].map((r) => r)); rect(g, 5, 8, 3, 2, "l"); // erlenmeyer-ish
    stamp(g, 12, 2, ["kkkk", "g..g", "gppg", "gppg", "gppg", "gggg"]);
    stamp(g, 18, 1, [".gg.", ".g.g", ".gcg", ".gcg", "gccg", "gccg", "gggg"]);
    // test-tube rack
    rect(g, 26, 9, 12, 3, "w"); rect(g, 26, 9, 12, 1, "W");
    for (let i = 0; i < 4; i++) { rect(g, 27 + i * 3, 4, 2, 6, i % 2 ? "p" : "c"); rect(g, 27 + i * 3, 3, 2, 1, "g"); }
    // microscope
    rect(g, 42, 10, 8, 2, "k"); line(g, 44, 10, 44, 3, "d"); rect(g, 44, 3, 4, 2, "d"); rect(g, 46, 5, 2, 5, "d"); put(g, 47, 1, "g");
    rect(g, 45, 7, 3, 1, "y");
    return rowsOf(g);
  })(),
  pal: { a: "#f4f8ff", b: "#d0daf0", d: "#7c8ab0", m: "#9aa8cc", n: "#586890", k: "#1c2444", g: "#d8f0ff", l: "#f070b8", p: "#a868e8", c: "#58d8f0", w: "#e8eefc", W: "#ffffff", y: "#f8d848" },
  solid: { x: 0, y: 10, w: 52, h: 20 },
});

// ── Rest area: bunks, vending machine, lockers ───────────────────────────────
export const BUNK = defineProp({
  rows: (() => {
    const g = blank(34, 40);
    for (const x of [0, 31]) { rect(g, x, 0, 3, 40, "d"); rect(g, x, 0, 1, 40, "m"); }
    for (const [y, c] of [[6, "B"], [22, "O"]] as const) {
      bevel(g, 3, y + 4, 28, 5, "a", "w", "n");
      rect(g, 4, y, 8, 5, "o"); rect(g, 4, y, 8, 1, "a"); // pillow
      rect(g, 3, y + 3, 28, 6, c);
      rect(g, 3, y + 3, 28, 1, c === "B" ? "b" : "p");
      for (let x = 14; x < 30; x += 4) put(g, x, y + 5, c === "B" ? "b" : "p");
      rect(g, 3, y + 8, 28, 1, c === "B" ? "D" : "q");
    }
    rect(g, 0, 38, 34, 2, "k");
    for (let y = 12; y < 36; y += 4) rect(g, 32, y, 2, 1, "m");
    return rowsOf(g);
  })(),
  pal: { d: "#6c78a4", m: "#aab4d8", k: "#2c3452", a: "#ffffff", w: "#e4e8f4", n: "#9aa4c8", o: "#f4f6ff", B: "#5c7cf0", b: "#8ca8ff", D: "#3c54b8", O: "#f08844", p: "#ffb878", q: "#b85c24" },
  solid: { x: 0, y: 20, w: 34, h: 20 },
});

export const VENDING = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(22, 36);
    bevel(g, 0, 0, 22, 36, "a", "b", "d");
    rect(g, 2, 2, 18, 5, "n"); text(g, 3, 3, "COSMO", "w");
    rect(g, 2, 8, 13, 20, "k");
    const cans = ["R", "y", "c", "m", "R", "y", "c", "m"];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const col = cans[(r * 3 + c * 2) % cans.length];
      rect(g, 3 + c * 3, 9 + r * 5, 2, 4, col); put(g, 3 + c * 3, 9 + r * 5, "w");
    }
    rect(g, 2, 8, 13, 1, "x"); rect(g, 2, 8, 1, 20, "x");
    // coin panel
    rect(g, 16, 9, 4, 12, "d"); rect(g, 17, 10, 2, 3, f ? "G" : "y"); rect(g, 17, 15, 2, 1, "k"); put(g, 17, 18, "R"); put(g, 18, 18, "c");
    rect(g, 3, 29, 12, 5, "k"); rect(g, 3, 29, 12, 1, "d");
    return rowsOf(g);
  }),
  fps: 1.2,
  pal: { a: "#e8c8ff", b: "#a870e0", d: "#6c3ca8", n: "#3c2478", w: "#ffffff", k: "#1c1038", R: "#ff5858", y: "#ffe068", c: "#58f0ff", m: "#ff88d0", x: "#7c70c8", G: "#b8f8ff" },
  solid: { x: 0, y: 26, w: 22, h: 12 },
});

export const LOCKERS = defineProp({
  rows: (() => {
    const g = blank(40, 38);
    const cols = ["B", "O", "T"];
    for (let i = 0; i < 3; i++) {
      const x = i * 13, c = cols[i];
      const hi = { B: "b", O: "p", T: "t" }[c]!;
      const lo = { B: "D", O: "q", T: "u" }[c]!;
      bevel(g, x, 0, 13, 36, hi, c, lo);
      for (let k = 0; k < 4; k++) rect(g, x + 3, 4 + k * 2, 7, 1, lo);
      rect(g, x + 9, 20, 2, 5, "m"); put(g, x + 9, 20, "a");
      rect(g, x + 3, 28, 5, 3, "w"); rect(g, x + 4, 29, 3, 1, "k");
    }
    rect(g, 0, 36, 39, 2, "k");
    return rowsOf(g);
  })(),
  pal: { B: "#4c78e0", b: "#88acff", D: "#2c4cb0", O: "#f08844", p: "#ffb878", q: "#b85c24", T: "#a45cd8", t: "#d8a0ff", u: "#6c34a0", m: "#c8d0e8", a: "#ffffff", w: "#f4f6ff", k: "#232a48" },
  solid: { x: 0, y: 30, w: 40, h: 10 },
});

// ── Hazard sign on the moon ("LANZAMIENTO" with an arrow) ────────────────────
export const SIGN_LAUNCH = defineProp({
  rows: (() => {
    const label = "LANZAMIENTO";
    const W = textWidth(label) + 14, H = 24;
    const g = blank(W, H);
    rect(g, 4, 11, 3, 13, "s"); rect(g, W - 7, 11, 3, 13, "S"); rect(g, 4, 11, 1, 13, "a");
    bevel(g, 0, 0, W, 12, "y", "o", "d");
    for (let x = 1; x < W - 1; x += 4) { put(g, x, 1, "k"); put(g, x + 1, 1, "k"); }
    rect(g, 2, 3, W - 4, 7, "n");
    text(g, 4, 4, label, "w");
    stamp(g, W - 8, 4, ["..y..", "...y.", "yyyyy", "...y.", "..y.."].map((r) => r));
    rect(g, 2, 22, 7, 2, "S"); rect(g, W - 9, 22, 7, 2, "S");
    return rowsOf(g);
  })(),
  pal: { y: "#ffe888", o: "#f0b030", d: "#a06c18", k: "#40300c", n: "#1c2c70", w: "#ffffff", s: "#c4cae0", S: "#7078a0", a: "#f4f6ff" },
  solid: { x: 2, y: 18, w: 58, h: 8 },
});

// ── Crates, drums and cables (reused shapes re-tinted for steel storage) ─────
export const CRATE_HAZ = defineProp({
  rows: (() => {
    const g = blank(18, 16);
    bevel(g, 0, 0, 18, 16, "a", "b", "d");
    rect(g, 1, 1, 16, 2, "c");
    for (let x = 2; x < 16; x++) { put(g, x, 6 + 0, (x % 4 < 2) ? "y" : "k"); put(g, x, 7, (x % 4 < 2) ? "y" : "k"); put(g, x, 8, (x % 4 < 2) ? "k" : "y"); }
    rect(g, 1, 11, 16, 1, "d"); put(g, 3, 13, "k"); put(g, 14, 13, "k");
    rect(g, 0, 3, 18, 1, "d");
    return rowsOf(g);
  })(),
  pal: { a: "#dce4f8", b: "#aab8dc", c: "#c0ccea", d: "#6c7aa4", y: "#f8d848", k: "#2c3452" },
  solid: { x: 0, y: 3, w: 18, h: 15 },
});

export const TANKS = defineProp({
  rows: (() => {
    const g = blank(24, 28);
    for (const [x0, band] of [[1, "u"], [12, "o"]] as const) {
      rect(g, x0, 4, 10, 22, "b");
      rect(g, x0, 4, 3, 22, "a"); rect(g, x0 + 7, 4, 3, 22, "d"); rect(g, x0 + 9, 4, 1, 22, "e");
      rect(g, x0 + 1, 2, 8, 3, "b"); rect(g, x0 + 2, 1, 6, 2, "a"); rect(g, x0 + 2, 0, 6, 1, "d");
      rect(g, x0, 12, 10, 3, band); rect(g, x0, 12, 3, 3, band === "u" ? "U" : "O"); rect(g, x0, 14, 10, 1, "e");
      rect(g, x0 + 3, 7, 4, 3, "k"); put(g, x0 + 4, 8, "w");
      rect(g, x0 + 1, 25, 8, 2, "e");
    }
    rect(g, 10, 6, 2, 1, "k");
    return rowsOf(g);
  })(),
  pal: { a: "#fafcff", b: "#e0e6f6", d: "#a8b2d4", e: "#7480a8", u: "#4c98f0", U: "#98c8ff", o: "#f08040", O: "#ffb078", k: "#2c3454", w: "#58f0ff" },
  solid: { x: 0, y: 14, w: 24, h: 14 },
});

/** Flat floor cable (dark with a lit top edge), drawn through the given points. */
function cable(w: number, h: number, pts: number[][], lit = "h") {
  const g = blank(w, h);
  for (let i = 0; i < pts.length - 1; i++) {
    line(g, pts[i][0], pts[i][1] + 1, pts[i + 1][0], pts[i + 1][1] + 1, "k");
    line(g, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], lit);
  }
  return defineProp({ rows: rowsOf(g), pal: { k: "#2c3050", h: "#6c78a4", y: "#c89830", o: "#d86038", b: "#4878d0" }, outline: false, flat: true });
}
export const CABLE_A = cable(56, 14, [[0, 8], [10, 8], [16, 3], [30, 3], [36, 9], [55, 9]]);
export const CABLE_B = cable(40, 24, [[0, 3], [14, 3], [20, 10], [20, 16], [26, 21], [39, 21]], "y");
export const CABLE_C = cable(30, 10, [[0, 5], [10, 5], [14, 2], [29, 2]], "o");

export const MOON_LAMP = defineProp({
  frames: [0, 1].map((f) => {
    const g = blank(14, 38);
    rect(g, 6, 8, 2, 28, "s"); rect(g, 6, 8, 1, 28, "a");
    bevel(g, 2, 34, 10, 4, "a", "s", "S");
    bevel(g, 0, 1, 14, 6, "a", "s", "S");
    rect(g, 2, 2, 10, 4, f ? "W" : "y"); rect(g, 2, 2, 10, 1, "w");
    rect(g, 4, 7, 6, 2, "S");
    return rowsOf(g);
  }),
  fps: 0.9,
  pal: { a: "#f0f4ff", s: "#b0b8d4", S: "#6a7298", y: "#ffe888", W: "#fff8c8", w: "#ffffff" },
  solid: { x: 1, y: 32, w: 12, h: 8 },
});

// ── UFO: hand-drawn flying saucer with chasing lights ────────────────────────
function ufoRows(frame: number): string[] {
  const L = [
    "..............aaaa",
    "............aabbbb",
    "...........abvxxvv",
    "..........abvxxxvv",
    "..........abvvxvvv",
    "........aaabbbbbbb",
    "....aaaabbbbbbbbbb",
    "..aabbbbbbbbbbbbbc",
    ".abbbbbbbbbbbbbbbc",
    "abbbbbbbbbbbbbbbcc",
    "aabbcccccccccccccc",
    ".ddccddddddddddddd",
    "...dd.....ddd.....",
  ];
  const g = sym(L, { a: "d", b: "c", c: "b", d: "a" }).map((r) => r.split(""));
  // rim lights
  for (let i = 0; i < 5; i++) { const on = (i + frame) % 2 === 0; put(g, 5 + i * 6, 9, on ? "y" : "o"); put(g, 6 + i * 6, 9, on ? "y" : "o"); }
  // legs
  line(g, 9, 13, 6, 18, "S"); line(g, 27, 13, 30, 18, "S"); line(g, 18, 14, 18, 18, "S");
  rect(g, 4, 18, 5, 1, "S"); rect(g, 28, 18, 5, 1, "S"); rect(g, 16, 18, 5, 1, "S");
  return g.map((r) => r.join(""));
}
export const UFO = defineProp({
  frames: [ufoRows(0), ufoRows(1)],
  fps: 2.5,
  pal: { a: "#fafaff", b: "#d0d6ee", c: "#9aa4cc", d: "#6670a0", v: "#6a3cc8", x: "#c8a0ff", y: "#ffe860", o: "#a87820", S: "#5c6488" },
  solid: { x: 2, y: 10, w: 34, h: 12 },
});

// ── Aliens (never green: Julio is the green one) ─────────────────────────────
const ALIEN_SWAP = { a: "d", b: "c", c: "b", d: "a" };
const ALIEN_A = [
  "..y....", "...a...", "...aabb", "..aabbb", ".aabbbb", ".akkkbb", "aakwkbb", "aakkkbb",
  "aabbbbb", ".aabbmm", ".aabbbb", "..aabbb", "...abbb", "..ccbbb", ".accbbb", ".ccbbbb", "..ccbbb", "..dd.bb",
];
const ALIEN_B = [
  "..a....", "..aa...", "...aabb", "..aabbb", ".aabbbb", ".abbbbb", "aabkkkk", "aabkwkk", "aabkkkk",
  "aabbkkk", "aabbbbb", ".aabbbm", ".aabbbb", "..aabbb", "...abbb", "..ccbbb", ".accbbb", ".ccbbbb", "..ccbbb", "..dd.bb",
];
const alien = (rows: readonly string[], pal: Record<string, string>) =>
  defineProp({
    rows: sym(rows, ALIEN_SWAP),
    pal: { k: "#14102c", w: "#ffffff", y: "#ffe860", m: "#4a2a5c", ...pal },
    solid: { x: 3, y: 12, w: 11, h: 9 },
  });
export const ALIEN_BLUE = alien(ALIEN_A, { a: "#a8ecff", b: "#60c4f4", c: "#3c8cd4", d: "#2860a4" });
export const ALIEN_PINK = alien(ALIEN_A, { a: "#ffc8e8", b: "#f890c8", c: "#d060a4", d: "#984078" });
export const ALIEN_PURPLE = alien(ALIEN_B, { a: "#e4acff", b: "#b878f0", c: "#9254c8", d: "#6a3c9c" });
export const ALIEN_ORANGE = alien(ALIEN_B, { a: "#ffd8a0", b: "#ffa84c", c: "#e07828", d: "#a84c18" });

// ── Astronauts as scenery (white and orange suits, blue visor) ───────────────
const ASTRO = [
  "....aaaa", "..aabbbb", ".abbbbbb", ".abvvvvv", ".abvzxxx", ".abvxxxx", ".abvxxvv", ".abbvvvv",
  "..abbbbb", ".aaabbbb", "aaabbbbb", "aabbkkcb", "aabbkycb", "aabbbbbb", "accbbbbb", ".ccbbbbb",
  "..cbbbbb", "..cbbbbb", "..ddcccc", ".dddddkk",
];
const astro = (pal: Record<string, string>) =>
  defineProp({
    rows: sym(ASTRO, { a: "d", b: "c", c: "b", d: "a" }),
    pal: { v: "#1c2c64", x: "#5c8cf0", z: "#b8d4ff", k: "#2c3452", y: "#ffe068", ...pal },
    solid: { x: 3, y: 12, w: 12, h: 10 },
  });
export const ASTRO_WHITE = astro({ a: "#ffffff", b: "#e8ecf8", c: "#b8c0dc", d: "#8890b4" });
export const ASTRO_ORANGE = astro({ a: "#ffd0a0", b: "#ff9c50", c: "#e0702c", d: "#a8481c" });

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

// ── Cryogenic fuel tank on cradles (pad scenery) ─────────────────────────────
export const FUEL_TANK = defineProp({
  rows: (() => {
    const g = blank(40, 26);
    rect(g, 6, 17, 4, 8, "S"); rect(g, 28, 17, 4, 8, "S"); rect(g, 6, 17, 1, 8, "d");
    rect(g, 4, 24, 8, 2, "S"); rect(g, 26, 24, 8, 2, "S");
    const inset = [5, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 5];
    inset.forEach((ins, i) => {
      const c = i < 3 ? "a" : i < 7 ? "b" : i < 12 ? "c" : "d";
      for (let x = 1 + ins; x < 39 - ins; x++) put(g, x, 2 + i, c);
    });
    rect(g, 10, 4, 2, 14, "u"); rect(g, 27, 4, 2, 14, "u"); rect(g, 10, 4, 1, 14, "U"); rect(g, 27, 4, 1, 14, "U");
    text(g, 14, 8, "LOX", "k");
    rect(g, 17, 0, 6, 3, "S"); rect(g, 19, 0, 2, 1, "y"); rect(g, 15, 1, 2, 2, "S"); rect(g, 23, 1, 2, 2, "S");
    line(g, 34, 6, 34, 16, "S"); line(g, 36, 6, 36, 16, "S");
    for (let y = 7; y < 16; y += 3) rect(g, 34, y, 3, 1, "S");
    return rowsOf(g);
  })(),
  pal: { a: "#ffffff", b: "#e2e8f8", c: "#b4bee0", d: "#8692bc", u: "#4c98f0", U: "#98c8ff", S: "#6a749c", k: "#2c3454", y: "#f8d848" },
  solid: { x: 2, y: 8, w: 38, h: 20 },
});

// ── Swivel chair for the control room ────────────────────────────────────────
export const CHAIR = defineProp({
  rows: [
    "..aaaaaa..",
    ".abbbbbbc.",
    ".abbbbbbc.",
    ".abbbbbbc.",
    "..cccccc..",
    ".aabbbbcc.",
    ".abbbbbbc.",
    "..cccccc..",
    "....ss....",
    "....ss....",
    "..ssssss..",
    ".sk.ss.ks.",
  ],
  pal: { a: "#a8c4ff", b: "#5c84e8", c: "#3a5cb8", s: "#8a94b8", k: "#2c3454" },
  solid: { x: 1, y: 8, w: 10, h: 6 },
});
