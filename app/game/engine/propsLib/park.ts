// Park / town props: benches, fountain, lamps, playground.
import { defineProp } from "../props";
import { blank, blobs, rect, rowsOf, stamp, put } from "../shapes";

const WOOD = { a: "#e8a860", b: "#c88040", c: "#a06030", d: "#784020", m: "#606878", n: "#8890a0" };

export const BENCH = defineProp({
  rows: [
    "..............................",
    ".aaaaaaaaaaaaaaaaaaaaaaaaaaaa.",
    ".bbbbbbbbbbbbbbbbbbbbbbbbbbbb.",
    ".cccccccccccccccccccccccccccc.",
    ".aaaaaaaaaaaaaaaaaaaaaaaaaaaa.",
    ".bbbbbbbbbbbbbbbbbbbbbbbbbbbb.",
    ".cccccccccccccccccccccccccccc.",
    ".nm........................nm.",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "dddddddddddddddddddddddddddddd",
    ".nm........................nm.",
    ".nm........................nm.",
  ],
  pal: WOOD,
  solid: { x: 0, y: 6, w: 32, h: 10 },
});

export const BENCH_V = defineProp({
  rows: [
    ".aab.",
    "maabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    ".aabc",
    "maabc",
    ".dddd",
    ".m..m",
  ],
  pal: WOOD,
  solid: { x: 0, y: 0, w: 7, h: 18 },
});

export const LAMP = defineProp({
  rows: [
    "..mmmm..",
    ".myyyym.",
    "myywwyym",
    "myywwyym",
    ".mmmmmm.",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "...nm...",
    "..nnmm..",
    ".nnmmmm.",
  ],
  pal: { m: "#485060", n: "#7880a0", y: "#f8e070", w: "#ffffff" },
  solid: { x: 1, y: 17, w: 8, h: 5 },
});

export const TRASH = defineProp({
  rows: [
    ".aaaaaaa.",
    "abbbbbbba",
    "ddddddddd",
    ".bcbcbcb.",
    ".bcbcbcb.",
    ".bcbcbcb.",
    ".bcbcbcb.",
    ".ddddddd.",
  ],
  pal: { a: "#88d088", b: "#50a858", c: "#388040", d: "#286030" },
  solid: { x: 0, y: 2, w: 11, h: 8 },
});

export const SIGN = defineProp({
  rows: [
    "aaaaaaaaaaaaaa",
    "abbbbbbbbbbbbc",
    "abeeeeeeeeeebc",
    "abbbbbbbbbbbbc",
    "abeeeeeeebbbbc",
    "abbbbbbbbbbbbc",
    "cccccccccccccc",
    ".....dc.......",
    ".....dc.......",
    ".....dc.......",
  ],
  pal: { a: "#e8b870", b: "#d09850", c: "#a06830", d: "#784020", e: "#805030" },
  solid: { x: 4, y: 7, w: 6, h: 5 },
});

// ── Fountain (3×3 tiles, animated water) ─────────────────────────────────────
function fountainFrame(f: number): string[] {
  const g = blank(46, 40);
  // stone basin: outer ring + rim highlight
  blobs(g, [{ x: 23, y: 26, rx: 22.5, ry: 13 }], "abcd", { crease: false, hi: 0.2 });
  // inner water
  blobs(g, [{ x: 23, y: 25.5, rx: 18.5, ry: 9.5 }], "wxyz", { crease: false, hi: 0.6 });
  // rim inner shadow line along the top of the water
  for (let x = 6; x < 41; x++) {
    for (let y = 15; y < 26; y++) {
      if (g[y][x] === "w" || g[y][x] === "x" || g[y][x] === "y" || g[y][x] === "z") {
        if (g[y - 1][x] !== "w" && g[y - 1][x] !== "x" && g[y - 1][x] !== "y" && g[y - 1][x] !== "z") g[y][x] = "d";
        break;
      }
    }
  }
  // ripples (animated)
  const rip = [[12, 26], [30, 23], [18, 30], [33, 29]];
  rip.forEach(([x, y], i) => {
    const o = (f + i) % 3;
    put(g, x + o, y, "o"); put(g, x + o + 1, y, "o");
  });
  // central pillar + bowl
  rect(g, 20, 12, 6, 14, "b");
  rect(g, 20, 12, 2, 14, "a");
  rect(g, 24, 12, 2, 14, "c");
  blobs(g, [{ x: 23, y: 12, rx: 8.5, ry: 3.5 }], "abcd", { crease: false, hi: 0.1 });
  rect(g, 17, 11, 12, 1, "x");
  // water jet
  const jet = [
    ["....oo....", "...owwo...", "..ow..wo..", ".ow....wo.", ".o......o.", "o........o", "o........o", "w........w"],
    ["...oooo...", "..owwwwo..", ".ow....wo.", ".o......o.", "o........o", "o........o", "w........w", "..........",],
  ][f % 2];
  stamp(g, 18, 1 + (f % 2), jet);
  return rowsOf(g);
}

export const FOUNTAIN = defineProp({
  frames: [fountainFrame(0), fountainFrame(1), fountainFrame(2)],
  fps: 4,
  pal: {
    a: "#f0f0f0", b: "#d0d0d8", c: "#a8a8b8", d: "#808098",
    w: "#d8f0ff", x: "#90c0f8", y: "#6898f0", z: "#5080e0", o: "#ffffff",
  },
  solid: { x: 1, y: 14, w: 46, h: 26 },
  baseY: 40,
});

// ── Playground ───────────────────────────────────────────────────────────────
export const SWINGS = defineProp({
  rows: [
    "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm",
    "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm.....k........k.k........k.....nm",
    ".nm....rrrrrrrrrrr.bbbbbbbbbbb....nm",
    ".nm....RRRRRRRRRRR.BBBBBBBBBBB....nm",
    ".nm...............................nm",
    ".nm...............................nm",
    "nnmm.............................nnmm",
  ].map((r) => r.slice(0, 36)),
  pal: { m: "#c83838", n: "#f06060", k: "#9090a0", r: "#f8d040", R: "#c09020", b: "#58a8f0", B: "#3070c0" },
  solid: { x: 0, y: 14, w: 38, h: 4 },
});

export const SLIDE = defineProp({
  rows: [
    "..mmmmmmmm....",
    ".mnnnnnnnnm...",
    ".m.yyyyyy.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    ".m.yaaaay.m...",
    "...yaaaay.....",
    "...yaaaay.....",
    "...yaaaay.....",
    "...yaaaay.....",
    "...yaaaay.....",
    "..yaaaaaay....",
    "..YYYYYYYY....",
  ],
  pal: { m: "#3060c0", n: "#5888e8", y: "#f8a040", Y: "#c06820", a: "#f8d070" },
  solid: { x: 0, y: 0, w: 14, h: 22 },
});

export const SANDBOX = defineProp({
  rows: (() => {
    const g = blank(40, 28);
    rect(g, 0, 0, 40, 28, "a");
    rect(g, 0, 26, 40, 2, "c");
    rect(g, 3, 3, 34, 22, "s");
    rect(g, 3, 3, 34, 1, "t");
    // little castle + bucket
    stamp(g, 8, 8, ["u.u.u", "uuuuu", "uvvvu", "uvvvu", "vvvvv"]);
    stamp(g, 26, 14, [".rrr.", "rRRRr", ".rrr.", ".rrr."]);
    stamp(g, 30, 9, ["..b", ".b.", "y.."]);
    return rowsOf(g);
  })(),
  pal: { a: "#d09050", c: "#906030", s: "#f8e0a0", t: "#d8b878", u: "#f0d088", v: "#c8a060", r: "#e84848", R: "#a82828", b: "#3868d0", y: "#f8d040" },
  flat: true,
  outline: true,
});

export const SEESAW = defineProp({
  rows: [
    "rr......................gg",
    "rrrrrrrrrrrrrrrrrrrrrrrrgg",
    "RRRRRRRRRRRRRRRRRRRRRRRRRR",
    "...........mmmm...........",
    "..........mnnnnm..........",
    "..........mmmmmm..........",
  ],
  pal: { r: "#f86060", R: "#c03838", g: "#60c060", m: "#505870", n: "#8890a8" },
  solid: { x: 9, y: 2, w: 10, h: 6 },
});

// ── Pond extras ──────────────────────────────────────────────────────────────
export const LILYPAD = defineProp({
  rows: [
    "..ggggg.",
    ".gGGGGgg",
    "gGGGG.gg",
    "gGGGGGgg",
    ".ggggg..",
  ],
  pal: { g: "#388838", G: "#58b048" },
  flat: true, outline: false,
});

export const DUCK = defineProp({
  frames: [
    [
      "...ww...",
      "..wwwk..",
      "..wwwoo.",
      "w.www...",
      "wwwwww..",
      "wwwwwww.",
      ".xxxxx..",
    ],
    [
      "...ww...",
      "..wwwk..",
      "..wwwoo.",
      "w.www...",
      "wwwwww..",
      "wwwwwww.",
      "..xxxxx.",
    ],
  ],
  fps: 2,
  pal: { w: "#ffffff", k: "#202020", o: "#f8a030", x: "#a8c8f8" },
  solid: null,
});

export const STATUE = defineProp({
  rows: [
    ".....aab.....",
    "....abbbc....",
    "....abbbc....",
    ".....bbc.....",
    "...aabbbcc...",
    "..abbbbbbbc..",
    "..ab.bbb.bc..",
    "....abbbc....",
    "....ab.bc....",
    "....ab.bc....",
    ".aaaaaaaaaaa.",
    ".bbbbbbbbbbb.",
    ".cdcdcdcdcdc.",
    ".bbbbbbbbbbb.",
    "ccccccccccccc",
  ],
  pal: { a: "#f8f0d8", b: "#d8d0b0", c: "#a8a080", d: "#c0b890" },
  solid: { x: 0, y: 9, w: 15, h: 8 },
});
