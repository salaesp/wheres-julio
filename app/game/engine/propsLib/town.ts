// Town / marathon props: Pokémon-style houses and shops, a small apartment
// block, the start/finish arch, traffic lights, cones, crowd barriers, water
// stations, km signs, balloons, a race clock and street furniture.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, put, stamp, type CharGrid } from "../shapes";
import { line, outlineWith, text, textWidth } from "./pixkit";

// ── Houses ───────────────────────────────────────────────────────────────────
// Shared letters: roof a/b/c/d/e · wall W/w/v · wood t/u/U · glass g/G/h/o ·
// frame f · stone s/S · brick k/K · flowers r/R/l.
export const HOUSE_BASE = {
  W: "#fff8e8", w: "#f4e4c4", v: "#d8c098",
  t: "#d89858", u: "#b07038", U: "#7c4824",
  g: "#c8f0ff", G: "#78b8f0", h: "#4880c8", o: "#ffffff", f: "#f8f8f8",
  s: "#c8c8d0", S: "#9898a8", k: "#d07050", K: "#a04838",
  r: "#f85868", R: "#c03048", l: "#58b048", y: "#f8d048",
};
export const ROOFS = {
  red: { a: "#ff9080", b: "#f05848", c: "#c83838", d: "#902830", e: "#601828" },
  blue: { a: "#90c8ff", b: "#5890f0", c: "#3c68d0", d: "#2c4898", e: "#1c2c68" },
  green: { a: "#a8e888", b: "#60c058", c: "#3c9840", d: "#2c7030", e: "#1c4c24" },
  orange: { a: "#ffd080", b: "#f8a038", c: "#d07820", d: "#985018", e: "#683410" },
  purple: { a: "#e0a8f8", b: "#b070e0", c: "#8850c0", d: "#603890", e: "#402060" },
};

export function windowAt(g: CharGrid, x: number, y: number, w: number, h: number, flowers = true) {
  rect(g, x, y, w, h, "f");
  rect(g, x + 1, y + 1, w - 2, h - 2, "G");
  rect(g, x + 1, y + 1, w - 2, 1, "g");
  rect(g, x + 1, y + 1, 1, h - 2, "g");
  rect(g, x + 1, y + h - 2, w - 2, 1, "h");
  // cross bar
  rect(g, x + Math.floor(w / 2), y + 1, 1, h - 2, "f");
  // shine
  put(g, x + 2, y + 3, "o"); put(g, x + 3, y + 2, "o");
  put(g, x + Math.floor(w / 2) + 2, y + 3, "o");
  // sill
  rect(g, x - 1, y + h, w + 2, 1, "t");
  if (flowers) {
    rect(g, x, y + h + 1, w, 2, "u");
    for (let i = 0; i < w; i += 2) {
      put(g, x + i, y + h, i % 4 === 0 ? "r" : "l");
      put(g, x + i + 1, y + h, i % 4 === 0 ? "l" : "y");
    }
  }
}

export function roof(g: CharGrid, x0: number, y0: number, w: number, h: number) {
  for (let y = 0; y < h; y++) {
    const inset = Math.max(0, 3 - y);
    for (let x = inset; x < w - inset; x++) {
      const course = Math.floor(y / 4), r = y % 4;
      let c = course === 0 ? "a" : "b";
      if (r === 3) c = "c";
      else if (r === 0 && course > 0) c = (x + course) % 3 === 0 ? "a" : "b";
      else if ((r === 1 || r === 2) && (x + (course % 2) * 4) % 8 === 0) c = "c";
      if (x === inset || (y === 0)) c = "a";
      if (x >= w - inset - 2) c = r === 3 ? "d" : "c";
      put(g, x0 + x, y0 + y, c);
    }
  }
  rect(g, x0, y0 + h, w, 1, "d");
  rect(g, x0 + 1, y0 + h + 1, w - 2, 1, "e");
}

function houseRows(kind: "house" | "shop", sign = "KIOSCO"): string[] {
  const W = 46;
  const g = blank(W, 48);
  // chimney
  rect(g, 33, 0, 6, 8, "k");
  rect(g, 36, 1, 3, 7, "K");
  rect(g, 32, 0, 8, 2, "S");
  rect(g, 32, 0, 8, 1, "s");
  roof(g, 0, 3, W, 20);
  // walls
  rect(g, 1, 25, W - 2, 19, "w");
  rect(g, 1, 25, W - 2, 2, "v");
  rect(g, 1, 27, 2, 17, "W");
  rect(g, W - 3, 25, 2, 19, "v");
  // corner beams
  rect(g, 1, 27, 1, 17, "u");
  rect(g, W - 2, 25, 1, 19, "U");
  if (kind === "house") {
    windowAt(g, 5, 29, 10, 8);
    windowAt(g, 31, 29, 10, 8);
    // door
    rect(g, 18, 29, 10, 15, "U");
    rect(g, 19, 30, 8, 14, "u");
    rect(g, 19, 30, 2, 14, "t");
    rect(g, 22, 32, 3, 4, "U");
    rect(g, 22, 38, 3, 4, "U");
    put(g, 25, 37, "y");
  } else {
    // awning stripes
    for (let x = 1; x < W - 1; x++) {
      const red = Math.floor((x - 1) / 4) % 2 === 0;
      for (let y = 27; y < 31; y++) put(g, x, y, red ? (y === 30 ? "R" : "r") : (y === 30 ? "s" : "o"));
      // scalloped edge
      if ((x - 1) % 4 !== 3) put(g, x, 31, red ? "R" : "s");
    }
    // sign
    rect(g, 6, 22, W - 12, 2, "f");
    const sw = textWidth(sign);
    rect(g, Math.floor((W - sw) / 2) - 3, 18, sw + 6, 8, "f");
    rect(g, Math.floor((W - sw) / 2) - 2, 19, sw + 4, 6, "h");
    text(g, Math.floor((W - sw) / 2), 20, sign, "o");
    // display window
    rect(g, 3, 33, 14, 9, "f");
    rect(g, 4, 34, 12, 7, "G");
    rect(g, 4, 34, 12, 1, "g");
    rect(g, 4, 39, 12, 2, "h");
    stamp(g, 5, 36, ["y.r.l", "yyrrl"]);
    put(g, 6, 35, "o"); put(g, 7, 34, "o");
    rect(g, 29, 33, 14, 9, "f");
    rect(g, 30, 34, 12, 7, "G");
    rect(g, 30, 34, 12, 1, "g");
    rect(g, 30, 39, 12, 2, "h");
    stamp(g, 31, 36, ["r.y.r", "rryyr"]);
    put(g, 32, 35, "o"); put(g, 33, 34, "o");
    // glass door
    rect(g, 19, 32, 8, 12, "f");
    rect(g, 20, 33, 6, 11, "G");
    rect(g, 20, 33, 2, 11, "g");
    put(g, 25, 38, "U");
  }
  // stone base
  rect(g, 0, 44, W, 2, "s");
  rect(g, 0, 46, W, 2, "S");
  for (let x = 2; x < W; x += 6) put(g, x, 45, "S");
  // door step
  rect(g, 17, 44, 12, 1, "o");
  return rowsOf(g);
}

const houseSolid = { x: 0, y: 26, w: 48, h: 24 };
export const HOUSE_RED = defineProp({ rows: houseRows("house"), pal: { ...HOUSE_BASE, ...ROOFS.red }, solid: houseSolid });
export const HOUSE_BLUE = defineProp({ rows: houseRows("house"), pal: { ...HOUSE_BASE, ...ROOFS.blue }, solid: houseSolid });
export const HOUSE_GREEN = defineProp({ rows: houseRows("house"), pal: { ...HOUSE_BASE, ...ROOFS.green }, solid: houseSolid });
export const HOUSE_PURPLE = defineProp({ rows: houseRows("house"), pal: { ...HOUSE_BASE, ...ROOFS.purple, W: "#f8f0ff", w: "#e8dcf0", v: "#c8b8d8" }, solid: houseSolid });
export const SHOP = defineProp({ rows: houseRows("shop", "KIOSCO"), pal: { ...HOUSE_BASE, ...ROOFS.orange }, solid: houseSolid });
export const CAFE = defineProp({ rows: houseRows("shop", "CAFE"), pal: { ...HOUSE_BASE, ...ROOFS.green, r: "#40a050", R: "#287038" }, solid: houseSolid });

// ── Small apartment block (flat roof, 3 floors) ──────────────────────────────
function apartmentRows(): string[] {
  const W = 44, H = 70;
  const g = blank(W, H);
  // roof slab
  rect(g, 0, 0, W, 6, "c");
  rect(g, 0, 0, W, 1, "a");
  rect(g, 1, 1, W - 2, 4, "b");
  rect(g, 0, 5, W, 1, "d");
  rect(g, 0, 6, W, 1, "e");
  // water tank on roof
  rect(g, 30, 1, 8, 3, "s");
  rect(g, 30, 1, 8, 1, "o");
  // wall
  rect(g, 1, 7, W - 2, 57, "w");
  rect(g, 1, 7, W - 2, 1, "v");
  rect(g, 1, 8, 2, 56, "W");
  rect(g, W - 3, 7, 2, 57, "v");
  // floor bands
  for (const y of [24, 42]) {
    rect(g, 0, y, W, 2, "c");
    rect(g, 0, y, W, 1, "b");
  }
  for (const y of [10, 28]) {
    windowAt(g, 5, y, 12, 9, false);
    windowAt(g, 27, y, 12, 9, false);
    // balcony rail on the right window
    rect(g, 26, y + 10, 14, 1, "S");
    for (let x = 26; x < 40; x += 2) put(g, x, y + 11, "S");
    rect(g, 26, y + 12, 14, 1, "S");
  }
  windowAt(g, 5, 47, 12, 9);
  // entrance with small awning
  rect(g, 24, 46, 16, 3, "a");
  rect(g, 24, 48, 16, 1, "d");
  rect(g, 26, 49, 12, 15, "f");
  rect(g, 27, 50, 10, 14, "G");
  rect(g, 27, 50, 3, 14, "g");
  rect(g, 31, 50, 1, 14, "f");
  put(g, 30, 57, "U"); put(g, 33, 57, "U");
  // base
  rect(g, 0, 64, W, 3, "s");
  rect(g, 0, 67, W, 3, "S");
  rect(g, 25, 64, 14, 1, "o");
  return rowsOf(g);
}
export const APARTMENT = defineProp({
  rows: apartmentRows(),
  pal: { ...HOUSE_BASE, ...ROOFS.blue, W: "#fff0e0", w: "#f0c8a8", v: "#d0a080" },
  solid: { x: 0, y: 44, w: 46, h: 28 },
});
export const APARTMENT_B = defineProp({
  rows: apartmentRows(),
  pal: { ...HOUSE_BASE, ...ROOFS.red, W: "#f8fff0", w: "#d8ecc8", v: "#b0cc98" },
  solid: { x: 0, y: 44, w: 46, h: 28 },
});

// ── Start / finish arch (two truss posts + banner on top) ────────────────────
// Posts are 12px wide (with outline), banner spans from post to post.
function postRows(): string[] {
  const g = blank(10, 62);
  rect(g, 0, 0, 2, 58, "n");
  rect(g, 8, 0, 2, 58, "n");
  rect(g, 1, 0, 1, 58, "m");
  rect(g, 9, 0, 1, 58, "m");
  for (let y = 0; y < 56; y += 8) {
    line(g, 2, y + 1, 7, y + 6, "M");
    line(g, 7, y + 1, 2, y + 6, "m");
    rect(g, 2, y, 6, 1, "M");
  }
  // sponsor panel
  rect(g, 0, 30, 10, 14, "r");
  rect(g, 0, 30, 10, 1, "q");
  rect(g, 0, 43, 10, 1, "R");
  text(g, 1, 32, "4", "o");
  text(g, 5, 32, "2", "o");
  text(g, 3, 38, "K", "y");
  // feet
  rect(g, 0, 58, 10, 4, "M");
  rect(g, 0, 58, 10, 1, "n");
  return rowsOf(g);
}
const ARCH_PAL = {
  n: "#d8dce8", m: "#a0a4b8", M: "#787c90",
  r: "#e83838", R: "#a82030", q: "#ff7868",
  o: "#ffffff", O: "#d0d0e0", k: "#283048", y: "#f8d048", Y: "#c89828",
  b: "#3870e0", B: "#2850a8", g: "#48b848", p: "#f878b8",
};
export const ARCH_POST = defineProp({ rows: postRows(), pal: ARCH_PAL, solid: { x: 0, y: 54, w: 12, h: 10 } });

/** Banner from post to post. `span` = distance between the posts' left edges. */
export function archBanner(span: number, label = "LLEGADA") {
  const W = span + 10;
  const g = blank(W, 30);
  // board
  rect(g, 0, 0, W, 18, "o");
  rect(g, 1, 1, W - 2, 16, "r");
  rect(g, 1, 1, W - 2, 1, "q");
  rect(g, 1, 16, W - 2, 1, "R");
  // checkered ends
  for (const x0 of [2, W - 14]) {
    for (let y = 2; y < 16; y++) for (let x = 0; x < 12; x++) {
      put(g, x0 + x, y, (Math.floor(x / 3) + Math.floor((y - 2) / 3)) % 2 === 0 ? "o" : "k");
    }
  }
  const tw = textWidth(label, 2);
  text(g, Math.floor((W - tw) / 2), 4, label, "o", 2, "R");
  // pennants hanging under the board
  const cols = ["y", "b", "g", "p", "o"];
  for (let x = 2, i = 0; x < W - 6; x += 7, i++) {
    const c = cols[i % cols.length];
    stamp(g, x, 18, [c.repeat(5), "." + c.repeat(3) + ".", "." + c.repeat(3) + ".", ".." + c + ".."]);
  }
  rect(g, 0, 18, W, 1, "O");
  return defineProp({ rows: rowsOf(g), pal: ARCH_PAL, solid: null, baseY: 64 });
}

// ── Traffic light (animated: green → yellow → red) ───────────────────────────
function trafficRows(state: 0 | 1 | 2): string[] {
  const g = blank(11, 46);
  rect(g, 4, 23, 3, 20, "n");
  rect(g, 4, 23, 1, 20, "o");
  rect(g, 6, 23, 1, 20, "m");
  rect(g, 2, 43, 7, 3, "m");
  rect(g, 2, 43, 7, 1, "n");
  // head
  rect(g, 1, 0, 9, 23, "k");
  rect(g, 1, 0, 9, 1, "K");
  rect(g, 9, 1, 1, 22, "j");
  const lamp = (y: number, on: boolean, c: string, C: string, off: string) => {
    const col = on ? c : off;
    stamp(g, 3, y, [".xxx.", "xxxxx", "xxxxx", "xxxxx", ".xxx."].map((r) => r.replace(/x/g, col)));
    rect(g, 2, y - 1, 7, 1, "K"); // visor
    if (on) { put(g, 4, y + 1, "o"); put(g, 5, y + 1, "o"); put(g, 4, y + 2, "o"); put(g, 6, y + 4, C); put(g, 7, y + 3, C); }
  };
  lamp(3, state === 2, "r", "R", "1");
  lamp(10, state === 1, "y", "Y", "2");
  lamp(17, state === 0, "g", "G", "3");
  return rowsOf(g);
}
export const TRAFFIC_LIGHT = defineProp({
  frames: [trafficRows(0), trafficRows(0), trafficRows(0), trafficRows(1), trafficRows(2), trafficRows(2), trafficRows(2)],
  fps: 0.8,
  pal: {
    n: "#9098b0", m: "#606880", o: "#d0d8e8", k: "#383c50", K: "#585c70", j: "#282a3c",
    r: "#ff4040", R: "#b82020", y: "#ffd030", Y: "#c09010", g: "#48e070", G: "#20a048",
    "1": "#682830", "2": "#685828", "3": "#285838",
  },
  solid: { x: 2, y: 42, w: 9, h: 6 },
});

// ── Cones and barriers ───────────────────────────────────────────────────────
export const CONE = defineProp({
  rows: [
    "....o....",
    "...aob...",
    "...abb...",
    "...wwW...",
    "..awwWb..",
    "..abbbc..",
    "..abbbc..",
    ".wwwwwWW.",
    ".abbbbcc.",
    "dddddddd.",
    "ddddddddd",
  ],
  pal: { o: "#ffd0a0", a: "#ffa048", b: "#f07020", c: "#c04810", d: "#a83810", w: "#ffffff", W: "#c8c8d8" },
  solid: { x: 1, y: 8, w: 9, h: 5 },
});

/** Crowd barrier running east-west (face visible). */
export const BARRIER_H = defineProp({
  rows: [
    "nnnnnnnnnnnnnnnnnnnnnnnnnnnn",
    "mMMMMMMMMMMMMMMMMMMMMMMMMMMm",
    "m.n..n..n..n..n..n..n..n...m",
    "m.n..n..n..n..n..n..n..n...m",
    "m.n..n..n..n..n..n..n..n...m",
    "m.n..n..n..n..n..n..n..n...m",
    "m.M..M..M..M..M..M..M..M...m",
    "mnnnnnnnnnnnnnnnnnnnnnnnnnnm",
    "mMMMMMMMMMMMMMMMMMMMMMMMMMMm",
    "m..........................m",
    "MMMM....................MMMM",
  ],
  pal: { n: "#e8ecf4", m: "#a8b0c4", M: "#788098" },
  solid: { x: 0, y: 8, w: 30, h: 5 },
});

/** Crowd barrier running north-south (seen edge-on: top rail + feet). */
export const BARRIER_V = defineProp({
  rows: (() => {
    const g = blank(9, 32);
    for (let y = 1; y < 30; y++) {
      put(g, 3, y, "n");
      put(g, 4, y, y % 3 === 0 ? "M" : "m");
      put(g, 5, y, "M");
    }
    // feet + clamps every half segment
    for (const y of [0, 15, 29]) {
      rect(g, 0, y + 1, 9, 2, "m");
      rect(g, 0, y + 1, 9, 1, "n");
      rect(g, 3, y, 3, 1, "n");
    }
    for (const y of [7, 22]) { rect(g, 2, y, 5, 2, "M"); put(g, 2, y, "m"); }
    return rowsOf(g);
  })(),
  pal: { n: "#eef0f8", m: "#a8b0c4", M: "#707890" },
  solid: { x: 1, y: 1, w: 9, h: 31 },
});

// ── Water station: table with cups and bottles ───────────────────────────────
function waterTableRows(): string[] {
  const g = blank(44, 26);
  // bottles standing at the back
  for (let i = 0; i < 6; i++) {
    const x = 3 + i * 7;
    rect(g, x, 0, 3, 1, "B");
    rect(g, x, 1, 3, 1, "b");
    rect(g, x - 1, 2, 5, 7, "q");
    rect(g, x - 1, 2, 1, 7, "Q");
    put(g, x, 3, "o");
    rect(g, x - 1, 5, 5, 2, "b");
  }
  // table top (cloth)
  rect(g, 0, 8, 44, 8, "w");
  rect(g, 0, 8, 44, 1, "o");
  rect(g, 0, 15, 44, 1, "W");
  // cups in two rows
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 9; i++) {
      const x = 2 + i * 5 + row * 2, y = 9 + row * 3;
      if (x > 40) continue;
      rect(g, x, y, 3, 2, "c");
      put(g, x, y, "q");
      put(g, x + 1, y, "b");
      put(g, x + 2, y + 1, "C");
    }
  }
  // front skirt
  rect(g, 1, 16, 42, 8, "b");
  rect(g, 1, 16, 42, 1, "q");
  rect(g, 1, 23, 42, 1, "B");
  for (let x = 4; x < 42; x += 6) put(g, x, 22, "B");
  text(g, 15, 18, "AGUA", "o");
  // legs
  rect(g, 2, 24, 2, 2, "M");
  rect(g, 40, 24, 2, 2, "M");
  return rowsOf(g);
}
const WATER_PAL = {
  w: "#f0f4fc", o: "#ffffff", W: "#c0c8e0",
  b: "#3c84e8", B: "#2858b0", q: "#a8d8ff", Q: "#70b0f0",
  c: "#f8f8f8", C: "#c0c8d8", M: "#585870",
};
export const WATER_TABLE = defineProp({ rows: waterTableRows(), pal: WATER_PAL, solid: { x: 0, y: 9, w: 46, h: 19 } });

/** Pack of water bottles on the ground. */
export const BOTTLE_PACK = defineProp({
  rows: (() => {
    const g = blank(14, 12);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
      const x = 1 + i * 3, y = r * 3;
      put(g, x + 1, y, "B");
      rect(g, x, y + 1, 3, 4, "q");
      put(g, x, y + 2, "o");
    }
    rect(g, 0, 6, 14, 6, "Q");
    rect(g, 0, 6, 14, 1, "q");
    rect(g, 0, 8, 14, 2, "b");
    return rowsOf(g);
  })(),
  pal: WATER_PAL,
  solid: { x: 0, y: 4, w: 16, h: 10 },
});

/** Crushed cups on the road (flat litter). */
export const CUPS_LITTER = defineProp({
  rows: [
    "cC.......",
    "Cc....b..",
    "....cCc..",
    "..b.CC...",
  ],
  pal: WATER_PAL, flat: true, outline: false,
});

// ── Km sign on a post ────────────────────────────────────────────────────────
export function kmSign(km: string) {
  const W = Math.max(textWidth("KM"), textWidth(km)) + 6;
  const g = blank(W, 30);
  rect(g, 0, 0, W, 16, "a");
  rect(g, 1, 1, W - 2, 14, "b");
  rect(g, 1, 14, W - 2, 1, "c");
  text(g, Math.floor((W - textWidth("KM")) / 2), 2, "KM", "w");
  text(g, Math.floor((W - textWidth(km)) / 2), 8, km, "w");
  const px = Math.floor(W / 2) - 1;
  rect(g, px, 16, 2, 13, "n");
  put(g, px + 1, 16, "m");
  rect(g, px - 2, 28, 6, 2, "m");
  return defineProp({
    rows: rowsOf(g),
    pal: { a: "#ffb060", b: "#f07828", c: "#b84c18", w: "#ffffff", n: "#c0c4d4", m: "#7c8094" },
    solid: { x: px - 2, y: 26, w: 8, h: 6 },
  });
}

// ── Balloons (animated bob) ──────────────────────────────────────────────────
// Outlined by hand so the strings stay 1px thin.
function balloonRows(f: number, colors: string): string[] {
  const g = blank(22, 36);
  const pos = [[6, 7], [15, 6], [10.5, 13]];
  const knot = [11, 34];
  pos.forEach(([x, y], i) => {
    const dy = (f + i) % 2;
    line(g, Math.round(x), Math.round(y + 6 + dy), knot[0] + (i - 1), knot[1] - 2, "s");
  });
  line(g, knot[0], knot[1] - 2, knot[0], knot[1], "s");
  const fills = new Set<string>();
  pos.forEach(([x, y], i) => {
    const dy = (f + i) % 2;
    const c = colors[i];
    const cy = y + dy;
    const ramp = c === "r" ? "1rRS" : c === "y" ? "2yYT" : c === "b" ? "3bBU" : "4pPV";
    for (const ch of ramp) fills.add(ch);
    blobs(g, [{ x, y: cy, rx: 4.6, ry: 5.6 }], ramp, { crease: false, hi: 0.35 });
    put(g, Math.round(x) - 2, Math.round(cy) - 3, "o");
    put(g, Math.round(x) - 1, Math.round(cy) - 3, ramp[0]);
    // knot under each balloon
    put(g, Math.round(x) - 1, Math.round(cy + 5.6), ramp[2]);
  });
  fills.add("o");
  outlineWith(g, (ch) => fills.has(ch), "k");
  return rowsOf(g);
}
const BALLOON_PAL = {
  "1": "#ff9898", r: "#f04848", R: "#b82838", S: "#882030",
  "2": "#fff0a0", y: "#f8d038", Y: "#d8a020", T: "#a87018",
  "3": "#a0d0ff", b: "#4888f0", B: "#2c58b8", U: "#203c88",
  "4": "#ffc0e0", p: "#f070b0", P: "#c04888", V: "#883060",
  s: "#f0f0f8", o: "#ffffff", k: "#30202c",
};
export const BALLOONS = defineProp({
  frames: [balloonRows(0, "ryb"), balloonRows(1, "ryb")], fps: 1.5, pal: BALLOON_PAL, solid: null, outline: false,
});
export const BALLOONS_B = defineProp({
  frames: [balloonRows(0, "pby"), balloonRows(1, "pby")], fps: 1.2, pal: BALLOON_PAL, solid: null, outline: false,
});

// ── Race clock on a stand ────────────────────────────────────────────────────
export const RACE_CLOCK = defineProp({
  frames: ["2:05:38", "2:05:39"].map((t) => {
    const g = blank(31, 24);
    rect(g, 0, 0, 31, 11, "k");
    rect(g, 0, 0, 31, 1, "K");
    rect(g, 1, 1, 29, 9, "j");
    text(g, 2, 3, t, "r");
    rect(g, 6, 11, 2, 11, "n");
    rect(g, 23, 11, 2, 11, "n");
    rect(g, 4, 22, 6, 2, "m");
    rect(g, 21, 22, 6, 2, "m");
    return rowsOf(g);
  }),
  fps: 1,
  pal: { k: "#383c50", K: "#60647c", j: "#181828", r: "#ff5848", y: "#ffd040", n: "#b0b4c8", m: "#707488" },
  solid: { x: 4, y: 21, w: 25, h: 5 },
});

// ── Street furniture ─────────────────────────────────────────────────────────
export const HYDRANT = defineProp({
  rows: [
    "..aab..",
    ".abbbc.",
    ".rrrrR.",
    "yrorrRy",
    "YrrrrRY",
    ".rorrR.",
    ".rrrrR.",
    "ddddddd",
  ],
  pal: { a: "#ff9080", b: "#e84040", c: "#a02028", r: "#e84848", R: "#a82830", o: "#ff9890", y: "#d8d8e0", Y: "#9898a8", d: "#783038" },
  solid: { x: 0, y: 4, w: 9, h: 6 },
});

export const MANHOLE = defineProp({
  rows: [
    "..cccccc..",
    ".cbbbbbbc.",
    "cbadadadbc",
    "cbdadadabc",
    "cbadadadbc",
    "cbdadadabc",
    ".cbbbbbbc.",
    "..cccccc..",
  ],
  pal: { a: "#8890a0", b: "#707888", c: "#585c6c", d: "#646878" },
  flat: true, outline: false,
});

export const MAILBOX = defineProp({
  rows: [
    ".aaaaa.",
    "abbbbbc",
    "bkkkkkc",
    "bbbbbbc",
    "bbwwbbc",
    "bbbbbbc",
    "ccccccc",
    "..nm...",
    "..nm...",
    ".nnmm..",
  ],
  pal: { a: "#ff8070", b: "#e04038", c: "#a02028", k: "#401820", w: "#f8d048", n: "#a0a4b8", m: "#686c80" },
  solid: { x: 0, y: 6, w: 9, h: 6 },
});

/** Pennant garland strung across the road (aerial: drawn over passers-by). */
export function garland(span: number) {
  const g = blank(span, 14);
  const sag = (x: number) => Math.round(1 + 6 * Math.sin((x / (span - 1)) * Math.PI));
  for (let x = 0; x < span; x++) put(g, x, sag(x), "s");
  const cols = ["r", "y", "b", "g", "o", "p"];
  let i = 0;
  for (let x = 3; x < span - 6; x += 7, i++) {
    const c = cols[i % cols.length];
    const y = sag(x + 2) + 1;
    stamp(g, x, y, [c.repeat(5), "." + c.repeat(3) + ".", "." + c.repeat(2) + "..", ".." + c + ".."]);
  }
  return defineProp({
    rows: rowsOf(g),
    pal: { s: "#f0f0f0", r: "#f04848", y: "#f8d038", b: "#4888f0", g: "#48b848", o: "#f89838", p: "#f070b0" },
    solid: null,
    baseY: 70,
  });
}

/** Flower planter box (sidewalk). */
export const PLANTER = defineProp({
  rows: (() => {
    const g = blank(16, 13);
    blobs(g, [{ x: 4, y: 4, rx: 4 }, { x: 11, y: 4, rx: 4.5 }, { x: 8, y: 5, rx: 4 }], "ABCD");
    for (const [x, y] of [[3, 2], [9, 1], [12, 4], [6, 5]]) { put(g, x, y, "r"); put(g, x + 1, y, "y"); }
    rect(g, 0, 7, 16, 6, "t");
    rect(g, 0, 7, 16, 1, "T");
    rect(g, 0, 12, 16, 1, "u");
    rect(g, 1, 9, 14, 1, "u");
    return rowsOf(g);
  })(),
  pal: { A: "#b8f080", B: "#70c850", C: "#48a040", D: "#2a7834", r: "#f85868", y: "#f8e058", t: "#c88040", T: "#e8a860", u: "#905828" },
  solid: { x: 0, y: 7, w: 18, h: 8 },
});

