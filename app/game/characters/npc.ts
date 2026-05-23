// NPC + Julio sprites. Front-view large sprite used both in-game (small) and on found overlay (large).
import { PX, SPRITE_SCALE, type Ctx, pset, prect, pcircle, pellipse } from "./primitives";

const HAIR_COLORS = ["#2a1a0e", "#6e4a22", "#a86a2a", "#d8b06a", "#3a3a3a", "#cc4422"];
const SHIRT_COLORS = [
  "#c83a3a", "#3a78c9", "#f0c842", "#3aa86a", "#7a3aa8",
  "#e8853a", "#d04a8a", "#2a8aa8", "#8a6a3a", "#5a5a6a",
  "#c8c8c8", "#3a3a3a",
];
const SKIN_COLORS = ["#f3c79a", "#d99a6a", "#a86a3a", "#f8d8b0"];
const PANTS_COLORS = ["#2a3a5a", "#3a3a3a", "#5a3a2a", "#1a2540", "#4a4a4a", "#6a4a2a"];
const SHOE_COLOR = "#1a1a1a";

export function drawPerson(ctx: Ctx, cx: number, cy: number, variant: number) {
  const gcx = cx / PX;
  const gcy = cy / PX;
  const hair = HAIR_COLORS[variant % HAIR_COLORS.length];
  const shirt = SHIRT_COLORS[(variant * 7) % SHIRT_COLORS.length];
  const shirtDark = "#000";
  const skin = SKIN_COLORS[(variant * 3) % SKIN_COLORS.length];
  const pants = PANTS_COLORS[(variant * 5) % PANTS_COLORS.length];

  pellipse(ctx, gcx, gcy + 9, 6, 2, "rgba(0,0,0,0.32)");

  prect(ctx, gcx - 3, gcy + 4, 2, 4, pants);
  prect(ctx, gcx - 3, gcy + 4, 1, 4, "rgba(0,0,0,0.25)");
  prect(ctx, gcx + 1, gcy + 4, 2, 4, pants);
  prect(ctx, gcx + 2, gcy + 4, 1, 4, "rgba(0,0,0,0.18)");
  prect(ctx, gcx - 3, gcy + 8, 2, 1, SHOE_COLOR);
  prect(ctx, gcx + 1, gcy + 8, 2, 1, SHOE_COLOR);

  prect(ctx, gcx - 4, gcy - 2, 8, 5, shirt);
  prect(ctx, gcx - 4, gcy - 2, 8, 1, shirtDark);
  prect(ctx, gcx - 4, gcy + 2, 8, 1, "rgba(0,0,0,0.3)");
  prect(ctx, gcx - 4, gcy - 2, 1, 5, shirtDark);
  prect(ctx, gcx + 3, gcy - 2, 1, 5, shirtDark);
  prect(ctx, gcx - 1, gcy - 2, 2, 1, skin);

  prect(ctx, gcx - 5, gcy - 1, 1, 4, shirt);
  prect(ctx, gcx + 4, gcy - 1, 1, 4, shirt);
  pset(ctx, gcx - 5, gcy - 1, shirtDark);
  pset(ctx, gcx - 5, gcy + 2, shirtDark);
  pset(ctx, gcx + 4, gcy - 1, shirtDark);
  pset(ctx, gcx + 4, gcy + 2, shirtDark);
  pset(ctx, gcx - 5, gcy + 3, skin);
  pset(ctx, gcx + 4, gcy + 3, skin);

  pcircle(ctx, gcx, gcy - 5, 3, hair);
  pcircle(ctx, gcx, gcy - 4, 2, skin);
  pset(ctx, gcx - 3, gcy - 4, "#000");
  pset(ctx, gcx + 2, gcy - 4, "#000");
  pset(ctx, gcx, gcy - 7, "#000");
  pset(ctx, gcx - 1, gcy - 4, "#1a1a1a");
  pset(ctx, gcx + 1, gcy - 4, "#1a1a1a");

  if (variant % 3 === 0) {
    prect(ctx, gcx - 2, gcy - 6, 4, 1, hair);
    pset(ctx, gcx, gcy - 7, hair);
  }

  if (variant % 4 === 1) {
    const cap = SHIRT_COLORS[(variant + 2) % SHIRT_COLORS.length];
    pcircle(ctx, gcx, gcy - 6, 3, cap);
    pset(ctx, gcx + 3, gcy - 5, cap);
    pset(ctx, gcx + 4, gcy - 5, cap);
  } else if (variant % 5 === 2) {
    pcircle(ctx, gcx, gcy - 6, 3, "#2a2a2a");
    pset(ctx, gcx, gcy - 8, "#c83a3a");
  } else if (variant % 7 === 3) {
    prect(ctx, gcx - 3, gcy - 3, 7, 2, hair);
    pset(ctx, gcx - 4, gcy - 2, hair);
    pset(ctx, gcx + 3, gcy - 2, hair);
  }

  if (variant % 6 === 4) {
    const pack = SHIRT_COLORS[(variant + 5) % SHIRT_COLORS.length];
    prect(ctx, gcx - 3, gcy - 1, 6, 3, pack);
    prect(ctx, gcx - 3, gcy - 1, 6, 1, "rgba(0,0,0,0.4)");
  }
}

// Big "found" Julio — front view, large pixel art. withSign=false reuses for small in-game sprite.
export function drawJulioFound(ctx: Ctx, cx: number, cy: number, bigPx: number, withSign: boolean = true) {
  const set = (gx: number, gy: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + Math.round(gx) * bigPx, cy + Math.round(gy) * bigPx, bigPx, bigPx);
  };
  const rect = (gx: number, gy: number, gw: number, gh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + Math.round(gx) * bigPx, cy + Math.round(gy) * bigPx, Math.round(gw) * bigPx, Math.round(gh) * bigPx);
  };

  const outline = "#000000";
  const g = "#55b639";
  const gd = "#3d8825";
  const gl = "#81df54";
  const belly = "#96df71";
  const skin = "#f9b282";
  const hair = "#643c28";
  const blush = "#f0758a";
  const eye = "#000000";
  const tooth = "#ffffff";
  const signBg = "#ffffff";
  const heart = "#bd407a";

  rect(-5, 14, 11, 1, "rgba(0,0,0,0.3)");

  rect(-8, 10, 3, 2, gd);
  rect(-9, 11, 3, 1, outline);
  rect(-6, 12, 2, 1, outline);

  rect(-5, 11, 3, 3, gd);
  rect(-5, 14, 4, 1, outline);
  rect(2, 11, 3, 3, g);
  rect(2, 11, 1, 3, gd);
  rect(1, 14, 4, 1, outline);

  rect(-4, 3, 9, 8, g);
  rect(-4, 3, 1, 8, gd);
  rect(-5, 3, 1, 7, outline);
  rect(5, 3, 1, 7, outline);

  rect(-2, 5, 5, 5, belly);
  set(-1, 5, outline); set(-1, 7, outline); set(-1, 9, outline);

  rect(-7, 2, 3, 2, g);
  rect(-7, 2, 3, 1, gl);
  rect(-8, 1, 1, 3, outline);
  rect(5, 2, 3, 2, g);
  rect(5, 2, 3, 1, gl);
  rect(8, 1, 1, 3, outline);

  rect(-6, -11, 13, 13, g);
  rect(-6, -11, 13, 1, gl);
  rect(-6, -10, 1, 11, gl);
  rect(6, -10, 1, 12, gd);
  rect(-5, -12, 11, 1, outline);
  rect(-7, -11, 1, 12, outline);
  rect(7, -11, 1, 12, outline);

  rect(-4, -14, 2, 2, gd); rect(-4, -14, 2, 1, outline);
  rect(1, -14, 2, 2, gd); rect(1, -14, 2, 1, outline);

  rect(-4, -8, 9, 1, outline);
  set(-3, -7, tooth); set(0, -7, tooth); set(3, -7, tooth);

  rect(-4, -7, 9, 7, skin);
  rect(-4, -7, 9, 2, hair);
  set(-4, -5, hair); set(4, -5, hair);
  set(-2, -4, eye); set(2, -4, eye);
  set(-3, -3, blush); set(3, -3, blush);
  rect(-1, -2, 3, 1, outline);
  set(0, -1, tooth);

  if (withSign) {
    const bx = 6, by = -6;
    rect(bx + 2, by + 1, 7, 5, signBg);
    rect(bx + 2, by, 7, 1, outline);
    rect(bx + 2, by + 6, 7, 1, outline);
    rect(bx + 1, by + 1, 1, 5, outline);
    rect(bx + 9, by + 1, 1, 5, outline);
    set(bx, by + 5, outline);
    set(bx + 1, by + 5, signBg);
    set(bx + 4, by + 2, heart); set(bx + 6, by + 2, heart);
    rect(bx + 3, by + 3, 5, 1, heart);
    rect(bx + 4, by + 4, 3, 1, heart);
    set(bx + 5, by + 5, heart);
  }
}

// Small in-game Julio reuses the front-view sprite at bigPx=2 (no sign).
export function drawJulio(ctx: Ctx, cx: number, cy: number) {
  drawJulioFound(ctx, cx, cy, 2, false);
}

// Top-down legacy version (preserved in case useful).
const DINO_GREEN = "#3fbf3f";
const DINO_DARK = "#2a8c2a";
const DINO_LIGHT = "#7adf6a";
const BELLY = "#b9f0a0";
const HAIR = "#7a4a22";
const SKIN = "#f3c79a";
const BLUSH = "#ef9a9a";

export function drawJulioTopDown(ctx: Ctx, cx: number, cy: number) {
  const gcx = cx / PX;
  const gcy = cy / PX;
  pellipse(ctx, gcx, gcy + 9, 6, 2, "rgba(0,0,0,0.35)");
  prect(ctx, gcx - 3, gcy + 4, 2, 4, DINO_GREEN);
  prect(ctx, gcx + 1, gcy + 4, 2, 4, DINO_GREEN);
  prect(ctx, gcx - 3, gcy + 4, 1, 4, DINO_DARK);
  prect(ctx, gcx + 2, gcy + 4, 1, 4, DINO_DARK);
  prect(ctx, gcx - 4, gcy + 8, 3, 1, DINO_DARK);
  prect(ctx, gcx + 1, gcy + 8, 3, 1, DINO_DARK);
  pset(ctx, gcx, gcy + 8, DINO_GREEN);
  pset(ctx, gcx, gcy + 9, DINO_DARK);
  prect(ctx, gcx - 4, gcy - 2, 8, 5, DINO_GREEN);
  prect(ctx, gcx - 2, gcy - 1, 4, 4, BELLY);
  prect(ctx, gcx - 4, gcy - 2, 8, 1, "#000");
  prect(ctx, gcx - 4, gcy + 2, 8, 1, DINO_DARK);
  prect(ctx, gcx - 4, gcy - 2, 1, 5, "#000");
  prect(ctx, gcx + 3, gcy - 2, 1, 5, "#000");
  prect(ctx, gcx - 5, gcy - 1, 1, 4, DINO_GREEN);
  prect(ctx, gcx + 4, gcy - 1, 1, 4, DINO_GREEN);
  pset(ctx, gcx - 5, gcy - 1, "#000");
  pset(ctx, gcx - 5, gcy + 2, "#000");
  pset(ctx, gcx + 4, gcy - 1, "#000");
  pset(ctx, gcx + 4, gcy + 2, "#000");
  pset(ctx, gcx - 5, gcy + 3, SKIN);
  pset(ctx, gcx + 4, gcy + 3, SKIN);
  pcircle(ctx, gcx, gcy - 5, 4, DINO_GREEN);
  pset(ctx, gcx - 2, gcy - 7, DINO_LIGHT);
  pset(ctx, gcx - 3, gcy - 6, DINO_LIGHT);
  pset(ctx, gcx + 2, gcy - 4, DINO_DARK);
  pset(ctx, gcx + 3, gcy - 5, DINO_DARK);
  for (let i = -1; i <= 1; i++) {
    const sx = gcx + i * 2;
    pset(ctx, sx, gcy - 9, DINO_DARK);
    pset(ctx, sx - 1, gcy - 8, DINO_DARK);
    pset(ctx, sx + 1, gcy - 8, DINO_DARK);
  }
  pcircle(ctx, gcx, gcy - 4, 2, SKIN);
  pset(ctx, gcx - 2, gcy - 6, HAIR);
  pset(ctx, gcx - 1, gcy - 7, HAIR);
  pset(ctx, gcx + 1, gcy - 7, HAIR);
  pset(ctx, gcx + 2, gcy - 6, HAIR);
  pset(ctx, gcx - 1, gcy - 4, "#000");
  pset(ctx, gcx + 1, gcy - 4, "#000");
  pset(ctx, gcx - 2, gcy - 3, BLUSH);
  pset(ctx, gcx + 2, gcy - 3, BLUSH);
  pset(ctx, gcx, gcy - 3, "#7a3a1a");
}

// Found-screen heart sign (legacy, kept for compatibility).
export function drawHeartSign(ctx: Ctx, cx: number, cy: number, _t: number) {
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
