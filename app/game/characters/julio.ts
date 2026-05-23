import { PX, SPRITE_SCALE, type Ctx, pellipse } from "../utils/primitives";
import { drawSprite, currentFrame, type Palette, type Frame, type SpriteSheet } from "../utils/sprite";

// ── Palette (from dino_front reference sprite) ────────────────────────────────
const JULIO_PALETTE: Palette = {
  ".": null,
  "A": "#051003",
  "B": "#748f57",
  "C": "#7aa26c",
  "D": "#74906c",
  "E": "#e6c673",
  "F": "#d1d8ca",
  "G": "#c2c5ac",
  "H": "#e9c59f",
  "I": "#637457",
  "J": "#333928",
  "K": "#747e62",
  "L": "#736253",
  "M": "#688f5f",
  "N": "#a6b590",
  "O": "#253320",
  "P": "#648058",
  "Q": "#769967",
  "R": "#56704a",
  "S": "#cda78e",
  "T": "#56624b",
  "U": "#1c1b0e",
  "V": "#928365",
  "W": "#655343",
  "X": "#49392c",
  "Y": "#445539",
  "Z": "#67875b",
  "a": "#a18e6a",
  "b": "#909a72",
  "c": "#927660",
  "d": "#d7b994",
  "e": "#3f4b35",
  "f": "#48603f",
  "g": "#d4c58c",
  "h": "#97a27d",
  "i": "#868f6d",
  "j": "#99a981",
  "k": "#f2f5f2",
};

// ── FRONT IDLE 32×32 (pixel-accurate from reference) ─────────────────────────
const FRONT_IDLE: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "..............FJXh..............",
    ".............FNNNKG.............",
    ".............KiNNNe.............",
    "..........FAAOPBBZOJJe..........",
    ".........NKDDDMMMMDDDKG.........",
    "........FIDDDMMMMMMDDDDG........",
    ".......FADCFAPQCjQCAkFDAG.......",
    ".......FACCQCQQCBQQCCCbAT.......",
    "......GIPCCZDZQQBQQQRCCITF......",
    "......FJCCDOYYYYYYYYYCCDIA......",
    "......AJDCDFXLLWWGLLGNDZIA......",
    "......UJPOeXWLLWWLcLGGfZIA......",
    "......AJKOXXLWSHHLcLXXJPJA......",
    "......AJKOWXdVHHHHdFUUJPIA......",
    "......AOKJWSSaUHHHXHHaJKIA......",
    "......FTIJLSSSddHHHHHLJTDF......",
    ".......FATTaSSdSSHdHLKKAF.......",
    ".........UeeLWccHaSKKOO.........",
    ".........ATZPWccVaVIMfU.........",
    "........GDMMRBVVVVaBCCfG........",
    ".......FACMBBgSEEEgBQCCAN.......",
    "......GbbCfBBgEEEEgBBRCbKF......",
    "......FUBBRBaEEEEEEBBJbbUA......",
    "......FhGGTRaEEEEEEBBOGGhA......",
    ".......GAUTRbgEEEEEBZIUAF.......",
    ".........ORPBBVVBBBPRRUA........",
    ".........NIPRRRVVKfRZPA.........",
    ".........AIIDDAAAAIPPIA.........",
    "..........GIAAO..NTATK..........",
    "...........GAO...NNAK...........",
    "................................",
  ],
};

const FRONT_WALK1: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "..............FJXh..............",
    ".............FNNNKG.............",
    ".............KiNNNe.............",
    "..........FAAOPBBZOJJe..........",
    ".........NKDDDMMMMDDDKG.........",
    "........FIDDDMMMMMMDDDDG........",
    ".......FADCFAPQCjQCAkFDAG.......",
    ".......FACCQCQQCBQQCCCbAT.......",
    "......GIPCCZDZQQBQQQRCCITF......",
    "......FJCCDOYYYYYYYYYCCDIA......",
    "......AJDCDFXLLWWGLLGNDZIA......",
    "......UJPOeXWLLWWLcLGGfZIA......",
    "......AJKOXXLWSHHLcLXXJPJA......",
    "......AJKOWXdVHHHHdFUUJPIA......",
    "......AOKJWSSaUHHHXHHaJKIA......",
    "......FTIJLSSSddHHHHHLJTDF......",
    ".......FATTaSSdSSHdHLKKAF.......",
    ".........UeeLWccHaSKKOO.........",
    ".........ATZPWccVaVIMfU.........",
    "........GDMMRBVVVVaBCCfG........",
    ".......FACMBBgSEEEgBQCCAN.......",
    "......GbbCfBBgEEEEgBBRCbKF......",
    "......FUBBRBaEEEEEEBBJbbUA......",
    "......FhGGTRaEEEEEEBBOGGhA......",
    ".......GAUTRbgEEEEEBZIUAF.......",
    ".........ORPBBVVBBBPRRUA........",
    ".........NIPRRRVVKfRZPA.........",
    ".........AIIDDAAAAIIPP..........",  // right leg shifted
    "..........GIAAO...NTATK.........",
    "...........GAO....NNAK..........",
    "................................",
  ],
};

const FRONT_WALK2: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "..............FJXh..............",
    ".............FNNNKG.............",
    ".............KiNNNe.............",
    "..........FAAOPBBZOJJe..........",
    ".........NKDDDMMMMDDDKG.........",
    "........FIDDDMMMMMMDDDDG........",
    ".......FADCFAPQCjQCAkFDAG.......",
    ".......FACCQCQQCBQQCCCbAT.......",
    "......GIPCCZDZQQBQQQRCCITF......",
    "......FJCCDOYYYYYYYYYCCDIA......",
    "......AJDCDFXLLWWGLLGNDZIA......",
    "......UJPOeXWLLWWLcLGGfZIA......",
    "......AJKOXXLWSHHLcLXXJPJA......",
    "......AJKOWXdVHHHHdFUUJPIA......",
    "......AOKJWSSaUHHHXHHaJKIA......",
    "......FTIJLSSSddHHHHHLJTDF......",
    ".......FATTaSSdSSHdHLKKAF.......",
    ".........UeeLWccHaSKKOO.........",
    ".........ATZPWccVaVIMfU.........",
    "........GDMMRBVVVVaBCCfG........",
    ".......FACMBBgSEEEgBQCCAN.......",
    "......GbbCfBBgEEEEgBBRCbKF......",
    "......FUBBRBaEEEEEEBBJbbUA......",
    "......FhGGTRaEEEEEEBBOGGhA......",
    ".......GAUTRbgEEEEEBZIUAF.......",
    ".........ORPBBVVBBBPRRUA........",
    ".........NIPRRRVVKfRZPA.........",
    ".........AIIDDAAAAIIPP..........",  // left leg shifted
    "........GIAAO...NTATK...........",
    ".........GAO....NNAK............",
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
