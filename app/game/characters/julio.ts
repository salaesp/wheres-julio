import { PX, SPRITE_SCALE, type Ctx, pellipse } from "../utils/primitives";
import { drawSprite, currentFrame, type Palette, type Frame, type SpriteSheet } from "../utils/sprite";

// ── Palette (from FRONT_HI32 reference sprite) ───────────────────────────────
const JULIO_PALETTE: Palette = {
  ".": null,
  "A": "#0a2723",
  "B": "#588356",
  "C": "#e6eddb",
  "D": "#78a562",
  "E": "#2f503e",
  "F": "#32553f",
  "G": "#5a8357",
  "H": "#e9c97c",
  "I": "#598457",
  "J": "#0b2824",
  "K": "#e8c87b",
  "L": "#eebb9c",
  "M": "#a59557",
  "N": "#e5c97c",
  "O": "#a5955a",
  "P": "#cdb89b",
  "Q": "#010101",
  "R": "#cc8a70",
  "S": "#edba9d",
  "T": "#74a262",
  "U": "#cd8f75",
  "V": "#76a463",
  "W": "#0c2623",
  "X": "#5b8558",
  "Y": "#092823",
  "Z": "#78a564",
  "a": "#472b27",
  "b": "#6a473e",
  "c": "#452925",
  "d": "#5a845a",
  "e": "#77a462",
  "f": "#865b49",
  "g": "#77a564",
  "h": "#77a662",
  "i": "#76a561",
  "j": "#2d4f39",
  "k": "#eebb9e",
  "l": "#a2715e",
  "m": "#5d8259",
  "n": "#5a8455",
  "o": "#efbd9f",
  "p": "#598257",
  "q": "#5b8757",
  "r": "#2e523b",
  "s": "#588358",
  "t": "#4d2d27",
  "u": "#edba9b",
  "v": "#5e875a",
  "w": "#0d2925",
  "x": "#5f463e",
  "y": "#578555",
  "z": "#32523f",
  "0": "#588354",
  "1": "#f0ba9c",
  "2": "#edbb9d",
  "3": "#578156",
  "4": "#5a835a",
  "5": "#5a7e57",
  "6": "#d0ab88",
  "7": "#d7d3a5",
  "8": "#d4c295",
  "9": "#a79b65",
  "!": "#729d63",
  "@": "#102c24",
  "#": "#092622",
  "$": "#78a560",
  "%": "#b88e69",
  "^": "#eeb89b",
  "&": "#35503e",
  "*": "#5a3b32",
  "(": "#0b2823",
  ")": "#09281f",
  "-": "#e9c878",
  "_": "#77a265",
  "=": "#eac97c",
};

// ── FRONT IDLE 32×32 (pixel-accurate from FRONT_HI32) ────────────────────────
const FRONT_IDLE: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "...............WA...............",
    "..............8NO9W.............",
    ".............ANNOOA.............",
    "..........AAAAIIIBAAAA..........",
    ".........Add!IIIIIIeX@W.........",
    ".........ACChIIBBpBeCCA.........",
    ".......YAXCCADiDhhDACCqAA.......",
    ".......YAZZCDDDDDxDZZDZAA.......",
    ".......#ADeqDDyhy$DZXDeAA.......",
    "......AAIDFEFEFEErEzEFeBBY......",
    "......A0BFPCaCPbbPPaCPFBBA......",
    "......JsBjPaf%tffbxfCPEBBA......",
    "......JsBcbctU^URbRfcbcBBA......",
    "......J0BEacSCQ1SCQuaaEBBA......",
    "......JddEULLQQSSQQk2UcBBJ......",
    "......JdsERLSQQLkQQLkREBBJ......",
    ".......WA3&RSLS1kLLS*tvJw.......",
    ".........J4FURLLL2RUFvA.........",
    ".........JwGjEllllFqG(J.........",
    ".........AggpmMMOOXITVA.........",
    ".......YAViigOMMMMMgTTVAA.......",
    "......A)TijFV-KKHKKVjr_TAA......",
    "......AX3Vr4NHHHHHKNnEV5vY......",
    "......AooREgKHH=HHKNnzUooA......",
    ".......WAJGGNHHHHKKNnpAAA.......",
    "........AAGGT6KKNK6TTGAA........",
    ".........AGGFOMOMOMFnGA.........",
    ".........AGGmFAAAAFmGGA.........",
    ".........wXC7AAAAYm7C5A.........",
    "..........PCAAW..AAACP..........",
    "................................",
  ],
};

// Walk frames: shift bottom two rows slightly for leg animation
const FRONT_WALK1: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "...............WA...............",
    "..............8NO9W.............",
    ".............ANNOOA.............",
    "..........AAAAIIIBAAAA..........",
    ".........Add!IIIIIIeX@W.........",
    ".........ACChIIBBpBeCCA.........",
    ".......YAXCCADiDhhDACCqAA.......",
    ".......YAZZCDDDDDxDZZDZAA.......",
    ".......#ADeqDDyhy$DZXDeAA.......",
    "......AAIDFEFEFEErEzEFeBBY......",
    "......A0BFPCaCPbbPPaCPFBBA......",
    "......JsBjPaf%tffbxfCPEBBA......",
    "......JsBcbctU^URbRfcbcBBA......",
    "......J0BEacSCQ1SCQuaaEBBA......",
    "......JddEULLQQSSQQk2UcBBJ......",
    "......JdsERLSQQLkQQLkREBBJ......",
    ".......WA3&RSLS1kLLS*tvJw.......",
    ".........J4FURLLL2RUFvA.........",
    ".........JwGjEllllFqG(J.........",
    ".........AggpmMMOOXITVA.........",
    ".......YAViigOMMMMMgTTVAA.......",
    "......A)TijFV-KKHKKVjr_TAA......",
    "......AX3Vr4NHHHHHKNnEV5vY......",
    "......AooREgKHH=HHKNnzUooA......",
    ".......WAJGGNHHHHKKNnpAAA.......",
    "........AAGGT6KKNK6TTGAA........",
    ".........AGGFOMOMOMFnGA.........",
    ".........AGGmFAAAAFmGGA.........",
    "..........wXC7AAAAYm7C5A........",  // right leg out
    "...........PCAAW..AAACP.........",
    "................................",
  ],
};

const FRONT_WALK2: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "...............WA...............",
    "..............8NO9W.............",
    ".............ANNOOA.............",
    "..........AAAAIIIBAAAA..........",
    ".........Add!IIIIIIeX@W.........",
    ".........ACChIIBBpBeCCA.........",
    ".......YAXCCADiDhhDACCqAA.......",
    ".......YAZZCDDDDDxDZZDZAA.......",
    ".......#ADeqDDyhy$DZXDeAA.......",
    "......AAIDFEFEFEErEzEFeBBY......",
    "......A0BFPCaCPbbPPaCPFBBA......",
    "......JsBjPaf%tffbxfCPEBBA......",
    "......JsBcbctU^URbRfcbcBBA......",
    "......J0BEacSCQ1SCQuaaEBBA......",
    "......JddEULLQQSSQQk2UcBBJ......",
    "......JdsERLSQQLkQQLkREBBJ......",
    ".......WA3&RSLS1kLLS*tvJw.......",
    ".........J4FURLLL2RUFvA.........",
    ".........JwGjEllllFqG(J.........",
    ".........AggpmMMOOXITVA.........",
    ".......YAViigOMMMMMgTTVAA.......",
    "......A)TijFV-KKHKKVjr_TAA......",
    "......AX3Vr4NHHHHHKNnEV5vY......",
    "......AooREgKHH=HHKNnzUooA......",
    ".......WAJGGNHHHHKKNnpAAA.......",
    "........AAGGT6KKNK6TTGAA........",
    ".........AGGFOMOMOMFnGA.........",
    ".........AGGmFAAAAFmGGA.........",
    ".........wXC7AAAAYm7C5A.........",
    "........PCAAW..AAACP............",  // left leg out
    "................................",
  ],
};

// ── Sprite sheet (front only) ─────────────────────────────────────────────────
const JULIO: SpriteSheet = {
  front: { idle: FRONT_IDLE, walk: [FRONT_WALK1, FRONT_WALK2] },
};

const JULIO_SCALE = 2;

export function drawJulio(ctx: Ctx, cx: number, cy: number, time = 0): void {
  const gcx = cx / PX;
  const gcy = cy / PX;
  pellipse(ctx, gcx, gcy + 7, 6, 1.5, "#282828");
  const frame = currentFrame(JULIO.front, false, time);
  drawSprite(ctx, frame, JULIO_PALETTE, cx, cy, JULIO_SCALE);
}

// ── Found overlay (large — draws the same sprite at bigPx scale) ──────────────
export function drawJulioFound(ctx: Ctx, cx: number, cy: number, bigPx: number, withSign = true): void {
  const set = (gx: number, gy: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + Math.round(gx) * bigPx, cy + Math.round(gy) * bigPx, bigPx, bigPx);
  };
  const rect = (gx: number, gy: number, gw: number, gh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + Math.round(gx) * bigPx, cy + Math.round(gy) * bigPx, Math.round(gw) * bigPx, Math.round(gh) * bigPx);
  };

  // shadow
  rect(-6, 15, 12, 1, "rgba(0,0,0,0.3)");

  // Draw the sprite centered: FRONT_IDLE is 32×32, so offset by -16 cells
  drawSprite(ctx, FRONT_IDLE, JULIO_PALETTE, cx, cy, bigPx);

  const signBg = "#ffffff";
  const heart = "#bd407a";
  const O = "#051003";

  if (withSign) {
    const bx = 6, by = -6;
    rect(bx + 2, by + 1, 7, 5, signBg);
    rect(bx + 2, by, 7, 1, O);
    rect(bx + 2, by + 6, 7, 1, O);
    rect(bx + 1, by + 1, 1, 5, O);
    rect(bx + 9, by + 1, 1, 5, O);
    set(bx, by + 5, O);
    set(bx + 1, by + 5, signBg);
    set(bx + 4, by + 2, heart); set(bx + 6, by + 2, heart);
    rect(bx + 3, by + 3, 5, 1, heart);
    rect(bx + 4, by + 4, 3, 1, heart);
    set(bx + 5, by + 5, heart);
  }
}

export function drawHeartSign(ctx: Ctx, cx: number, cy: number, _t: number): void {
  const s = SPRITE_SCALE;
  const yo = -8 * s;
  ctx.fillStyle = "#000";
  ctx.fillRect(cx - 5 * s, cy - 5 * s + yo, 10 * s, 8 * s);
  ctx.fillStyle = "#fff";
  ctx.fillRect(cx - 4 * s, cy - 4 * s + yo, 8 * s, 6 * s);
  ctx.fillStyle = "#e25aa0";
  const hx = cx;
  const hy = cy - 1.5 * s + yo;
  ctx.fillRect(hx - 3 * s, hy - 1 * s, 2 * s, 2 * s);
  ctx.fillRect(hx + 1 * s, hy - 1 * s, 2 * s, 2 * s);
  ctx.fillRect(hx - 3 * s, hy, 6 * s, 2 * s);
  ctx.fillRect(hx - 2 * s, hy + 2 * s, 4 * s, 1 * s);
  ctx.fillRect(hx - 1 * s, hy + 3 * s, 2 * s, 1 * s);
}
