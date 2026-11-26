// A big wooden ship seen from above, baked pixel by pixel into unique tiles:
// pointed bow, plank deck, thick rail, a raised quarterdeck, the stern's hull
// face with lit windows, foam and a cast shadow on the animated sea, and a
// little sandy island in a corner.
import { TILE, type Terrain } from "../terrain";
import type { Pal } from "../sprite";
import { SEA } from "./common";
import { bakeMap, seaChar, noise, SEA_COLORS } from "./water";

export const SHIP = {
  cx: 120,
  hw: 92, // half width (outer rail edge)
  bowTip: 20,
  bowEnd: 165,
  stern: 390, // last deck row
  corner: 20,
  transom: 11,
  quarter: 318, // quarterdeck starts here
  island: { x: 22, y: 24, rx: 30, ry: 21 },
};

const W = 240, H = 416;

function halfWidth(y: number): number {
  const s = SHIP;
  if (y < s.bowTip) return -1;
  if (y < s.bowEnd) {
    const t = (y - s.bowTip) / (s.bowEnd - s.bowTip);
    return s.hw * (1 - Math.pow(1 - t, 2.3));
  }
  if (y <= s.stern - s.corner) return s.hw;
  if (y <= s.stern) {
    const dy = y - (s.stern - s.corner);
    return s.hw - s.corner + Math.sqrt(Math.max(0, s.corner * s.corner - dy * dy));
  }
  return -1;
}

/** Is world pixel (x, y) on the deck (rail included)? */
export function onDeck(x: number, y: number): boolean {
  const hw = halfWidth(y + 0.5);
  return hw >= 0 && Math.abs(x + 0.5 - SHIP.cx) <= hw;
}

// Masks + chamfer distance fields, computed once.
const deck = new Uint8Array(W * H);
const hull = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const d = onDeck(x, y);
  deck[y * W + x] = d ? 1 : 0;
  let h = d;
  if (!h && y > SHIP.stern - SHIP.corner) {
    for (let k = 1; k <= SHIP.transom; k++) if (onDeck(x, y - k)) { h = true; break; }
  }
  hull[y * W + x] = h ? 1 : 0;
}
const isTransom = (x: number, y: number) => hull[y * W + x] === 1 && deck[y * W + x] === 0;

/** Distance from every pixel to the nearest pixel where mask === target. */
function chamfer(mask: Uint8Array, target: number): Float32Array {
  const d = new Float32Array(W * H);
  const INF = 1e6, D = Math.SQRT2;
  for (let i = 0; i < W * H; i++) d[i] = mask[i] === target ? 0 : INF;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? (target === 0 ? 0 : INF) : d[y * W + x]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (d[i] === 0) continue;
    d[i] = Math.min(d[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + D, at(x + 1, y - 1) + D);
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x;
    if (d[i] === 0) continue;
    d[i] = Math.min(d[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + D, at(x - 1, y + 1) + D);
  }
  return d;
}
const distIn = chamfer(deck, 0);  // inside deck → distance to the outside
const distOut = chamfer(hull, 1); // outside hull → distance to the hull

const RAIL = 6;    // rail band (outline, top, base, dark, outline)
const SHADE = 9;   // rail shadow on the deck

const PAL: Pal = {
  ...SEA_COLORS,
  q: "#5c7cd8", r: "#3858b4", s: "#2c4898", t: "#243c84", // sea in shadow
  F: "#ffffff", G: "#d8ecff",
  K: "#3c2014", L: "#e09a64", M: "#b8723e", N: "#844a26", P: "#f0b47c", // rail
  e: "#f2cc8e", f: "#dcac70", g: "#9c6c3c", h: "#c89458", n: "#6c4424", // deck
  x: "#d6aa6c", y: "#c4965a", z: "#86592e", u: "#ae7e46",              // deck in shade
  A: "#fae0a8", B: "#ecc488", C: "#d4a464", D: "#a87444",              // quarterdeck
  H: "#7c4424", I: "#5c3018", Y: "#f8c848", Z: "#b88020", w: "#fff4b0", v: "#f8c858", // hull face
  S: "#f8e8b0", T: "#e8d090", V: "#e8cc90", O: "#d4b078",              // island sand
  j: "#b0f0f8", k: "#78d8f0", l: "#60c0e8",                            // shallow
};
const SHADOW: Record<string, string> = { a: "q", b: "q", c: "r", d: "s" };
const SHALLOW: Record<string, string> = { a: "G", b: "j", c: "k", d: "l" };
const SHADE_OF: Record<string, string> = { e: "x", f: "y", h: "u", g: "z", n: "z" };

function deckChar(x: number, y: number): string {
  if (y >= SHIP.quarter) {
    // quarterdeck: planks run across the ship
    const row = Math.floor((y - SHIP.quarter) / 5), ly = (y - SHIP.quarter) % 5;
    const off = (row * 17) % 31;
    if (ly === 4) return "D";
    if ((x + off) % 31 === 0) return "D";
    if (ly === 0) return "A";
    if (ly === 2 && noise(row, (x + off) >> 3, 7) < 0.25) return "C";
    return "B";
  }
  const col = Math.floor((x - SHIP.cx + 200) / 5), lx = (x - SHIP.cx + 200) % 5;
  const run = (y + col * 13) % 44;
  if (lx === 4) return "g";
  if (run === 0) return "g";
  if (lx === 2 && (run === 2 || run === 42)) return "n";
  if (lx === 0) return "e";
  if (noise(col, (y + col * 13) >> 3, 3) < 0.18 && lx !== 1) return "h";
  return "f";
}

function islandR(x: number, y: number): number {
  const I = SHIP.island;
  const dx = (x + 0.5 - I.x) / I.rx, dy = (y + 0.5 - I.y) / I.ry;
  const a = Math.atan2(dy, dx);
  return Math.hypot(dx, dy) * (1 + 0.07 * Math.sin(a * 5 + 1) + 0.04 * Math.sin(a * 9));
}

function px(x: number, y: number, f: number): string {
  const i = y * W + x;
  if (deck[i]) {
    const di = distIn[i];
    if (di <= 1.01) return "K";
    if (di <= 2.01) return "L";
    if (di <= 4.01) {
      // posts along the straight sides
      if (y > SHIP.bowEnd && y < SHIP.stern - SHIP.corner && (y % 18) < 3) return di <= 3.01 ? "P" : "L";
      return "M";
    }
    if (di <= 5.01) return "N";
    if (di <= RAIL + 0.01) return "K";
    let c = deckChar(x, y);
    if (y === SHIP.quarter - 1) c = "K";
    else if (y === SHIP.quarter) c = "A";
    else if (y === SHIP.quarter - 2 || y === SHIP.quarter - 3) c = SHADE_OF[c] ?? c;
    if (di <= SHADE + 0.01 && SHADE_OF[c]) {
      // the rail shades the deck next to it (more on the lit side's far edge)
      const shadeIt = di <= RAIL + 2.01 || (x < SHIP.cx && di <= SHADE + 0.01) || y < SHIP.bowEnd;
      if (shadeIt) c = SHADE_OF[c];
    }
    return c;
  }
  if (isTransom(x, y)) {
    let k = 0;
    while (k < SHIP.transom && !deck[(y - k - 1) * W + x]) k++;
    // k = rows below the deck edge (0 = right under the rail)
    if (k === SHIP.transom - 1) return "K";
    if (k === 0) return "Y";
    if (k === 1) return "Z";
    const wx = Math.abs(x - SHIP.cx);
    const win = [0, 36, 72].some((c) => Math.abs(wx - c) <= 4) && k >= 3 && k <= 7;
    if (win) {
      const edge = [0, 36, 72].some((c) => Math.abs(wx - c) === 4) || k === 3 || k === 7;
      return edge ? "Z" : k === 4 ? "w" : "v";
    }
    return k % 3 === 0 ? "I" : "H";
  }
  // sea
  const s = seaChar(x, y, f);
  const dOut = distOut[i];
  if (dOut <= 1.6 && noise(x >> 1, (y >> 1) + f * 7, 11) > 0.3) return "F";
  if (dOut <= 3.2 && noise(x >> 1, (y >> 1) + f * 5, 13) > 0.72) return "G";
  if (y < SHIP.bowEnd - 40 && dOut <= 6 && noise(x, y + f * 3, 17) > 0.86) return "F";
  const sx = x - 4, sy = y - 5;
  if (sx >= 0 && sy >= 0 && hull[sy * W + sx]) return SHADOW[s];
  // island
  const r = islandR(x, y);
  if (r < 1.0) {
    if (r < 0.8) return noise(x, y, 5) < 0.04 ? "T" : "S";
    if (r < 0.9) return "V";
    return "O";
  }
  const wl = [0, 0.02, 0.04, 0.02][f & 3];
  if (r < 1.06 + wl) return "F";
  if (r < 1.14 + wl) return noise(x, y + f, 2) < 0.15 ? "F" : "G";
  if (r < 1.5) return r < 1.32 || ((x + y) & 1 && r < 1.36) ? SHALLOW[s] : s;
  return s;
}

/** Bake the ship world: returns map + legend for defineWorld. */
export function bakeShip(): { map: string[]; legend: Record<string, Terrain> } {
  const cols = W / TILE, rows = H / TILE;
  const tileInfo = (tx: number, ty: number) => {
    let allSea = true, walk = true;
    for (let y = ty * TILE; y < ty * TILE + TILE; y++) for (let x = tx * TILE; x < tx * TILE + TILE; x++) {
      const i = y * W + x;
      if (hull[i] || distOut[i] < 8 || islandR(x, y) < 1.55) allSea = false;
      if (!deck[i] || distIn[i] <= SHADE - 1) walk = false;
    }
    if (allSea) {
      // also no cast shadow reaching in
      for (let y = ty * TILE; y < ty * TILE + TILE; y++) for (let x = tx * TILE; x < tx * TILE + TILE; x++) {
        const sx = x - 4, sy = y - 5;
        if (sx >= 0 && sy >= 0 && hull[sy * W + sx]) allSea = false;
      }
    }
    return { allSea, walk };
  };
  return bakeMap({
    id: "ship",
    cols,
    rows,
    pal: PAL,
    level: 1,
    group: "ship",
    px,
    base: (tx, ty) => (tileInfo(tx, ty).allSea ? SEA : null),
    walkable: (tx, ty) => tileInfo(tx, ty).walk,
  });
}
