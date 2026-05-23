// Strict pixel-art sprites. All shapes snap to PX grid (no anti-aliased arcs).
export const SPRITE_BASE = 24;
export const SPRITE_SCALE = 3;
export const SPRITE_SIZE = SPRITE_BASE * SPRITE_SCALE; // 72
export const PX = SPRITE_SCALE; // base pixel size for chars/props

type Ctx = CanvasRenderingContext2D;

// ───────────── Pixel primitives ─────────────

function pset(ctx: Ctx, gx: number, gy: number, color: string, px = PX) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx) * px, Math.round(gy) * px, px, px);
}

function prect(ctx: Ctx, gx: number, gy: number, gw: number, gh: number, color: string, px = PX) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx) * px, Math.round(gy) * px, Math.round(gw) * px, Math.round(gh) * px);
}

// Filled pixel circle on grid
function pcircle(ctx: Ctx, cgx: number, cgy: number, rg: number, color: string, px = PX) {
  ctx.fillStyle = color;
  const r2 = rg * rg;
  const r = Math.ceil(rg);
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      if (xx * xx + yy * yy <= r2) {
        ctx.fillRect((cgx + xx) * px, (cgy + yy) * px, px, px);
      }
    }
  }
}

function pellipse(
  ctx: Ctx, cgx: number, cgy: number, rgx: number, rgy: number, color: string, px = PX,
) {
  ctx.fillStyle = color;
  const rxr = rgx * rgx;
  const ryr = rgy * rgy;
  for (let yy = -Math.ceil(rgy); yy <= Math.ceil(rgy); yy++) {
    for (let xx = -Math.ceil(rgx); xx <= Math.ceil(rgx); xx++) {
      if ((xx * xx) / rxr + (yy * yy) / ryr <= 1) {
        ctx.fillRect((cgx + xx) * px, (cgy + yy) * px, px, px);
      }
    }
  }
}

// ───────────── NPC people (top-down) ─────────────

const HAIR_COLORS = ["#2a1a0e", "#6e4a22", "#a86a2a", "#d8b06a", "#3a3a3a", "#cc4422"];
const SHIRT_COLORS = [
  "#c83a3a", "#3a78c9", "#f0c842", "#3aa86a", "#7a3aa8",
  "#e8853a", "#d04a8a", "#2a8aa8", "#8a6a3a", "#5a5a6a",
  "#c8c8c8", "#3a3a3a",
];
const SKIN_COLORS = ["#f3c79a", "#d99a6a", "#a86a3a", "#f8d8b0"];

const PANTS_COLORS = ["#2a3a5a", "#3a3a3a", "#5a3a2a", "#1a2540", "#4a4a4a", "#6a4a2a"];
const SHOE_COLOR = "#1a1a1a";

// Top-down character — head, torso, arms, legs visible.
// Sprite layout in cells (centered at gcx, gcy):
//   head   y: -8 .. -3   (height 5)
//   torso  y: -2 ..  3   (height 5)
//   legs   y:  4 ..  8   (height 4)
export function drawPerson(ctx: Ctx, cx: number, cy: number, variant: number) {
  const gcx = cx / PX;
  const gcy = cy / PX;
  const hair = HAIR_COLORS[variant % HAIR_COLORS.length];
  const shirt = SHIRT_COLORS[(variant * 7) % SHIRT_COLORS.length];
  const shirtDark = "#000";
  const skin = SKIN_COLORS[(variant * 3) % SKIN_COLORS.length];
  const pants = PANTS_COLORS[(variant * 5) % PANTS_COLORS.length];

  // ── shadow ──
  pellipse(ctx, gcx, gcy + 9, 6, 2, "rgba(0,0,0,0.32)");

  // ── legs (4 cells tall) ──
  // left leg
  prect(ctx, gcx - 3, gcy + 4, 2, 4, pants);
  prect(ctx, gcx - 3, gcy + 4, 1, 4, "rgba(0,0,0,0.25)");
  // right leg
  prect(ctx, gcx + 1, gcy + 4, 2, 4, pants);
  prect(ctx, gcx + 2, gcy + 4, 1, 4, "rgba(0,0,0,0.18)");
  // shoes (last row)
  prect(ctx, gcx - 3, gcy + 8, 2, 1, SHOE_COLOR);
  prect(ctx, gcx + 1, gcy + 8, 2, 1, SHOE_COLOR);

  // ── torso (shirt) ──
  prect(ctx, gcx - 4, gcy - 2, 8, 5, shirt);
  // shirt outline
  prect(ctx, gcx - 4, gcy - 2, 8, 1, shirtDark);
  prect(ctx, gcx - 4, gcy + 2, 8, 1, "rgba(0,0,0,0.3)");
  prect(ctx, gcx - 4, gcy - 2, 1, 5, shirtDark);
  prect(ctx, gcx + 3, gcy - 2, 1, 5, shirtDark);
  // collar / neck hint
  prect(ctx, gcx - 1, gcy - 2, 2, 1, skin);

  // ── arms (sides) ──
  prect(ctx, gcx - 5, gcy - 1, 1, 4, shirt);
  prect(ctx, gcx + 4, gcy - 1, 1, 4, shirt);
  // arm outlines
  pset(ctx, gcx - 5, gcy - 1, shirtDark);
  pset(ctx, gcx - 5, gcy + 2, shirtDark);
  pset(ctx, gcx + 4, gcy - 1, shirtDark);
  pset(ctx, gcx + 4, gcy + 2, shirtDark);
  // hands (skin) at end of arms
  pset(ctx, gcx - 5, gcy + 3, skin);
  pset(ctx, gcx + 4, gcy + 3, skin);

  // ── head ──
  // hair (top-back of head)
  pcircle(ctx, gcx, gcy - 5, 3, hair);
  // face (skin) — slightly forward so we see chin
  pcircle(ctx, gcx, gcy - 4, 2, skin);
  // face outline
  pset(ctx, gcx - 3, gcy - 4, "#000");
  pset(ctx, gcx + 2, gcy - 4, "#000");
  pset(ctx, gcx, gcy - 7, "#000");
  // tiny eyes (top-down — hint)
  pset(ctx, gcx - 1, gcy - 4, "#1a1a1a");
  pset(ctx, gcx + 1, gcy - 4, "#1a1a1a");

  // forelock variants
  if (variant % 3 === 0) {
    prect(ctx, gcx - 2, gcy - 6, 4, 1, hair);
    pset(ctx, gcx, gcy - 7, hair);
  }

  // hats
  if (variant % 4 === 1) {
    const cap = SHIRT_COLORS[(variant + 2) % SHIRT_COLORS.length];
    pcircle(ctx, gcx, gcy - 6, 3, cap);
    pset(ctx, gcx + 3, gcy - 5, cap); // visor
    pset(ctx, gcx + 4, gcy - 5, cap);
  } else if (variant % 5 === 2) {
    pcircle(ctx, gcx, gcy - 6, 3, "#2a2a2a");
    pset(ctx, gcx, gcy - 8, "#c83a3a");
  } else if (variant % 7 === 3) {
    // longer hair (down to shoulders)
    prect(ctx, gcx - 3, gcy - 3, 7, 2, hair);
    pset(ctx, gcx - 4, gcy - 2, hair);
    pset(ctx, gcx + 3, gcy - 2, hair);
  }

  // ── backpack hint for some variants ──
  if (variant % 6 === 4) {
    const pack = SHIRT_COLORS[(variant + 5) % SHIRT_COLORS.length];
    prect(ctx, gcx - 3, gcy - 1, 6, 3, pack);
    prect(ctx, gcx - 3, gcy - 1, 6, 1, "rgba(0,0,0,0.4)");
  }
}

// ───────────── Julio (top-down small) ─────────────

const DINO_GREEN = "#3fbf3f";
const DINO_DARK = "#2a8c2a";
const DINO_LIGHT = "#7adf6a";
const BELLY = "#b9f0a0";
const HAIR = "#7a4a22";
const SKIN = "#f3c79a";
const BLUSH = "#ef9a9a";

// Small in-game Julio = same front-view sprite as drawJulioFound, rendered small.
// bigPx=2 keeps total height near SPRITE_SIZE (72).
export function drawJulio(ctx: Ctx, cx: number, cy: number) {
  drawJulioFound(ctx, cx, cy, 2, false);
}

// Top-down legacy version kept in case needed.
export function drawJulioTopDown(ctx: Ctx, cx: number, cy: number) {
  const gcx = cx / PX;
  const gcy = cy / PX;

  // shadow
  pellipse(ctx, gcx, gcy + 9, 6, 2, "rgba(0,0,0,0.35)");

  // ── legs (green dino legs w/ feet) ──
  prect(ctx, gcx - 3, gcy + 4, 2, 4, DINO_GREEN);
  prect(ctx, gcx + 1, gcy + 4, 2, 4, DINO_GREEN);
  // leg shading
  prect(ctx, gcx - 3, gcy + 4, 1, 4, DINO_DARK);
  prect(ctx, gcx + 2, gcy + 4, 1, 4, DINO_DARK);
  // feet
  prect(ctx, gcx - 4, gcy + 8, 3, 1, DINO_DARK);
  prect(ctx, gcx + 1, gcy + 8, 3, 1, DINO_DARK);

  // ── tail asomando entre piernas ──
  pset(ctx, gcx, gcy + 8, DINO_GREEN);
  pset(ctx, gcx, gcy + 9, DINO_DARK);

  // ── torso (dino suit) ──
  prect(ctx, gcx - 4, gcy - 2, 8, 5, DINO_GREEN);
  // belly patch (lighter)
  prect(ctx, gcx - 2, gcy - 1, 4, 4, BELLY);
  // suit outline
  prect(ctx, gcx - 4, gcy - 2, 8, 1, "#000");
  prect(ctx, gcx - 4, gcy + 2, 8, 1, DINO_DARK);
  prect(ctx, gcx - 4, gcy - 2, 1, 5, "#000");
  prect(ctx, gcx + 3, gcy - 2, 1, 5, "#000");

  // ── arms ──
  prect(ctx, gcx - 5, gcy - 1, 1, 4, DINO_GREEN);
  prect(ctx, gcx + 4, gcy - 1, 1, 4, DINO_GREEN);
  // arm outlines
  pset(ctx, gcx - 5, gcy - 1, "#000");
  pset(ctx, gcx - 5, gcy + 2, "#000");
  pset(ctx, gcx + 4, gcy - 1, "#000");
  pset(ctx, gcx + 4, gcy + 2, "#000");
  // hands (skin)
  pset(ctx, gcx - 5, gcy + 3, SKIN);
  pset(ctx, gcx + 4, gcy + 3, SKIN);

  // ── hood (green dome) ──
  pcircle(ctx, gcx, gcy - 5, 4, DINO_GREEN);
  // hood hi/shade
  pset(ctx, gcx - 2, gcy - 7, DINO_LIGHT);
  pset(ctx, gcx - 3, gcy - 6, DINO_LIGHT);
  pset(ctx, gcx + 2, gcy - 4, DINO_DARK);
  pset(ctx, gcx + 3, gcy - 5, DINO_DARK);

  // ── dino spikes on hood ──
  for (let i = -1; i <= 1; i++) {
    const sx = gcx + i * 2;
    pset(ctx, sx, gcy - 9, DINO_DARK);
    pset(ctx, sx - 1, gcy - 8, DINO_DARK);
    pset(ctx, sx + 1, gcy - 8, DINO_DARK);
  }

  // ── face ──
  pcircle(ctx, gcx, gcy - 4, 2, SKIN);
  // hair tufts asomando
  pset(ctx, gcx - 2, gcy - 6, HAIR);
  pset(ctx, gcx - 1, gcy - 7, HAIR);
  pset(ctx, gcx + 1, gcy - 7, HAIR);
  pset(ctx, gcx + 2, gcy - 6, HAIR);
  // eyes
  pset(ctx, gcx - 1, gcy - 4, "#000");
  pset(ctx, gcx + 1, gcy - 4, "#000");
  // blush
  pset(ctx, gcx - 2, gcy - 3, BLUSH);
  pset(ctx, gcx + 2, gcy - 3, BLUSH);
  // smile
  pset(ctx, gcx, gcy - 3, "#7a3a1a");
}

// ───────────── Big "found" Julio (front view, large pixel art) ─────────────
// Renders the reference image style: kid in dino suit facing forward, arms up, holding heart sign.
// Drawn around (cx, cy) using `bigPx` per pixel cell.
export function drawJulioFound(ctx: Ctx, cx: number, cy: number, bigPx: number, withSign: boolean = true) {
  // Coords in cells.
  const set = (gx: number, gy: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + Math.round(gx) * bigPx, cy + Math.round(gy) * bigPx, bigPx, bigPx);
  };
  const rect = (gx: number, gy: number, gw: number, gh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + Math.round(gx) * bigPx, cy + Math.round(gy) * bigPx, Math.round(gw) * bigPx, Math.round(gh) * bigPx);
  };

  // Palette extracted directly from the reference image
  const outline   = "#000000";
  const g         = "#55b639"; // Dino green
  const gd        = "#3d8825"; // Dino dark shadow
  const gl        = "#81df54"; // Dino light highlight
  const belly     = "#96df71"; // Dino belly patch
  const skin      = "#f9b282"; // Kid skin
  const skinShade = "#d38558"; // Kid skin shade
  const hair      = "#643c28"; // Brown hair
  const blush     = "#f0758a"; // Pink blush
  const eye       = "#000000";
  const tooth     = "#ffffff";
  const mouth     = "#ffffff";
  const signBg    = "#ffffff";
  const heart     = "#bd407a"; // Purple-pink heart

  // ── 1. BACKGROUND SHADOW (Under the character) ──
  rect(-5, 14, 11, 1, "rgba(0,0,0,0.3)");

  // ── 2. TAIL (Behind left leg) ──
  rect(-8, 10, 3, 2, gd);
  rect(-9, 11, 3, 1, outline);
  rect(-6, 12, 2, 1, outline);

  // ── 3. LEGS & FEET ──
  // Left foot
  rect(-5, 11, 3, 3, gd);
  rect(-5, 14, 4, 1, outline);
  // Right foot
  rect(2, 11, 3, 3, g);
  rect(2, 11, 1, 3, gd); // inner shade
  rect(1, 14, 4, 1, outline);

  // ── 4. BODY & DINO SUIT TORSO ──
  rect(-4, 3, 9, 8, g);
  rect(-4, 3, 1, 8, gd); // left side shade
  rect(-5, 3, 1, 7, outline); // body outer left
  rect(5, 3, 1, 7, outline);  // body outer right
  
  // Belly Patch
  rect(-2, 5, 5, 5, belly);
  set(-1, 5, outline); set(-1, 7, outline); set(-1, 9, outline); // Suit buttons/seams

  // ── 5. ARMS (Raised up horizontally/cheering) ──
  // Left Arm
  rect(-7, 2, 3, 2, g);
  rect(-7, 2, 3, 1, gl); // top highlight
  rect(-8, 1, 1, 3, outline);
  // Right Arm
  rect(5, 2, 3, 2, g);
  rect(5, 2, 3, 1, gl);
  rect(8, 1, 1, 3, outline);

  // ── 6. DINO HOOD & HEAD OUTLINE ──
  rect(-6, -11, 13, 13, g);
  // Hood Highlights & Shadows
  rect(-6, -11, 13, 1, gl);
  rect(-6, -10, 1, 11, gl);
  rect(6, -10, 1, 12, gd); // Right shadow
  // Outer Black Outline for Hood
  rect(-5, -12, 11, 1, outline);
  rect(-7, -11, 1, 12, outline);
  rect(7, -11, 1, 12, outline);

  // Dino Spikes/Scales on Head
  rect(-4, -14, 2, 2, gd); rect(-4, -14, 2, 1, outline);
  rect(1, -14, 2, 2, gd);  rect(1, -14, 2, 1, outline);

  // Dino Snout/Teeth Overlay (Top of face opening)
  rect(-4, -8, 9, 1, outline);
  set(-3, -7, tooth); set(0, -7, tooth); set(3, -7, tooth);

  // ── 7. FACE & HAIR (Inside the hood) ──
  rect(-4, -7, 9, 7, skin);
  // Hair
  rect(-4, -7, 9, 2, hair);
  set(-4, -5, hair); set(4, -5, hair); // sideburns
  // Eyes
  set(-2, -4, eye); set(2, -4, eye);
  // Blush
  set(-3, -3, blush); set(3, -3, blush);
  // Mouth (Happy open smile)
  rect(-1, -2, 3, 1, outline);
  set(0, -1, tooth);

  // ── 8. HEART SPEECH BUBBLE (Floating on the right) ──
  if (withSign) {
    const bx = 6;  // Bubble X offset
    const by = -6; // Bubble Y offset

    // White background interior
    rect(bx + 2, by + 1, 7, 5, signBg);
    // Black border
    rect(bx + 2, by, 7, 1, outline); // Top
    rect(bx + 2, by + 6, 7, 1, outline); // Bottom
    rect(bx + 1, by + 1, 1, 5, outline); // Left
    rect(bx + 9, by + 1, 1, 5, outline); // Right
    // Speech pointer/tail
    set(bx, by + 5, outline);
    set(bx + 1, by + 5, signBg);

    // Pixel Heart inside bubble
    set(bx + 4, by + 2, heart); set(bx + 6, by + 2, heart);
    rect(bx + 3, by + 3, 5, 1, heart);
    rect(bx + 4, by + 4, 3, 1, heart);
    set(bx + 5, by + 5, heart);
  }
}

// ───────────── Found-screen heart sign (kept small for compatibility) ─────────────
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

// ───────────── Props (pixel-art top-down) ─────────────

export function drawBuilding(
  ctx: Ctx, x: number, y: number, w: number, h: number, color: string, roof: string,
) {
  const p = PX;
  const gx = x / p, gy = y / p, gw = w / p, gh = h / p;
  // drop shadow (offset)
  prect(ctx, gx + 2, gy + 2, gw, gh, "rgba(0,0,0,0.35)");
  // roof fill
  prect(ctx, gx, gy, gw, gh, color);
  // roof border (4 sides)
  prect(ctx, gx, gy, gw, 2, roof);
  prect(ctx, gx, gy + gh - 2, gw, 2, roof);
  prect(ctx, gx, gy, 2, gh, roof);
  prect(ctx, gx + gw - 2, gy, 2, gh, roof);
  // outline pixels
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
  // tile stripes
  for (let yy = gy + 4; yy < gy + gh - 3; yy += 5) {
    prect(ctx, gx + 3, yy, gw - 6, 1, "rgba(0,0,0,0.12)");
  }
  // AC unit(s)
  const cnt = Math.max(1, Math.floor(gw / 14));
  for (let i = 0; i < cnt; i++) {
    const ux = gx + 4 + i * ((gw - 8) / cnt);
    const uy = gy + gh / 2 - 3;
    prect(ctx, ux, uy, 8, 5, "#3a3a44");
    prect(ctx, ux + 1, uy + 1, 6, 3, "#5a5a66");
    prect(ctx, ux + 2, uy + 2, 4, 1, "#222");
  }
  // antenna
  prect(ctx, gx + gw - 6, gy + 2, 1, 4, "#222");
  pset(ctx, gx + gw - 6, gy + 1, "#e23a3a");
}

export function drawCar(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, angle: number) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  // map to grid relative
  const p = PX;
  const gw = Math.round(w / p);
  const gh = Math.round(h / p);
  const x0 = -Math.floor(gw / 2);
  const y0 = -Math.floor(gh / 2);
  const set = (gx: number, gy: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(gx * p, gy * p, p, p);
  };
  const rect = (gx: number, gy: number, ggw: number, ggh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(gx * p, gy * p, ggw * p, ggh * p);
  };
  // shadow
  rect(x0 + 1, y0 + 1, gw, gh, "rgba(0,0,0,0.35)");
  // body
  rect(x0, y0, gw, gh, color);
  // outline
  rect(x0, y0, gw, 1, "#1a1a1a");
  rect(x0, y0 + gh - 1, gw, 1, "#1a1a1a");
  rect(x0, y0, 1, gh, "#1a1a1a");
  rect(x0 + gw - 1, y0, 1, gh, "#1a1a1a");
  // windshield (front side = +x)
  rect(x0 + gw - 5, y0 + 1, 2, gh - 2, "#1a2540");
  // rear window
  rect(x0 + 2, y0 + 1, 2, gh - 2, "#2a3550");
  // wheels
  rect(x0 + 1, y0 - 1, 4, 1, "#111");
  rect(x0 + 1, y0 + gh, 4, 1, "#111");
  rect(x0 + gw - 5, y0 - 1, 4, 1, "#111");
  rect(x0 + gw - 5, y0 + gh, 4, 1, "#111");
  // headlights
  set(x0 + gw - 1, y0 + 1, "#fff9a8");
  set(x0 + gw - 1, y0 + gh - 2, "#fff9a8");
  ctx.restore();
}

export function drawTreeTrunk(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pcircle(ctx, gx, gy, 3, "rgba(0,0,0,0.35)");
  pcircle(ctx, gx, gy, 2, "#5a3a1e");
  pset(ctx, gx - 1, gy - 1, "#7a4a2a");
}

export function drawTreeCanopy(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX;
  const gr = r / PX;
  pcircle(ctx, gx + 2, gy + 2, gr, "rgba(0,0,0,0.35)");
  pcircle(ctx, gx, gy, gr, "#2a6a2a");
  pcircle(ctx, gx - 1, gy - 1, Math.max(2, gr - 2), "#3f9d4a");
  // highlight blobs
  pcircle(ctx, gx - Math.round(gr * 0.4), gy - Math.round(gr * 0.4), Math.max(1, Math.round(gr * 0.25)), "#6dc66a");
  pcircle(ctx, gx + Math.round(gr * 0.3), gy + Math.round(gr * 0.1), Math.max(1, Math.round(gr * 0.18)), "#6dc66a");
  pcircle(ctx, gx - Math.round(gr * 0.5), gy + Math.round(gr * 0.3), Math.max(1, Math.round(gr * 0.18)), "#6dc66a");
  // top highlight
  pcircle(ctx, gx - Math.round(gr * 0.5), gy - Math.round(gr * 0.55), Math.max(1, Math.round(gr * 0.18)), "#a8e070");
}

export function drawBench(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  prect(ctx, gx + 1, gy + 1, gw, 5, "rgba(0,0,0,0.3)");
  prect(ctx, gx, gy, gw, 5, "#7a4a22");
  prect(ctx, gx, gy, gw, 1, "#5a3a1a");
  prect(ctx, gx, gy + 4, gw, 1, "#5a3a1a");
  prect(ctx, gx, gy, 1, 5, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, 5, "#1a1a1a");
  // legs
  prect(ctx, gx + 1, gy + 5, 1, 1, "#3a3a3a");
  prect(ctx, gx + gw - 2, gy + 5, 1, 1, "#3a3a3a");
}

export function drawHedge(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.3)");
  prect(ctx, gx, gy, gw, gh, "#2a6a2a");
  for (let xx = gx + 1; xx < gx + gw - 1; xx += 3) {
    pcircle(ctx, xx, gy + 1, 2, "#3f9d4a");
  }
  for (let xx = gx + 2; xx < gx + gw - 1; xx += 4) {
    pset(ctx, xx, gy + 1, "#6dc66a");
  }
}

export function drawFountain(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX, gr = r / PX;
  pcircle(ctx, gx + 1, gy + 1, gr, "rgba(0,0,0,0.35)");
  pcircle(ctx, gx, gy, gr, "#bcbcc4");
  pcircle(ctx, gx, gy, Math.max(2, gr - 2), "#5aa6e8");
  pcircle(ctx, gx - 1, gy - 1, Math.max(1, Math.round(gr * 0.4)), "#a8d8ff");
  pcircle(ctx, gx, gy, 2, "#dcdce4");
  pset(ctx, gx, gy - 3, "#fff");
  pset(ctx, gx + 2, gy - 2, "#fff");
}

export function drawKiosk(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.3)");
  prect(ctx, gx, gy, gw, gh, color);
  // striped awning
  for (let i = 0; i < gw; i += 2) {
    prect(ctx, gx + i, gy, 1, 2, i % 4 === 0 ? "#ffffff" : color);
  }
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
  // counter
  prect(ctx, gx, gy + gh - 2, gw, 1, "rgba(0,0,0,0.4)");
}

export function drawCrosswalk(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  const stripeH = 3;
  const gap = 2;
  for (let yy = gy + 1; yy < gy + gh - 1; yy += stripeH + gap) {
    prect(ctx, gx, yy, gw, stripeH, "#ffffff");
  }
}

// ───────────── Playground props ─────────────

export function drawPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx, gy, gw, gh, "#d4b88a");
  // edge
  prect(ctx, gx, gy, gw, 1, "#a8946a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#a8946a");
  prect(ctx, gx, gy, 1, gh, "#a8946a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#a8946a");
  // pebble speckle
  for (let yy = gy + 2; yy < gy + gh - 2; yy += 4) {
    for (let xx = gx + 2; xx < gx + gw - 2; xx += 4) {
      if (((xx * 31 + yy * 17) & 3) === 0) pset(ctx, xx, yy, "#b89a6a");
      if (((xx * 13 + yy * 23) & 5) === 0) pset(ctx, xx + 1, yy + 1, "#e8d4a8");
    }
  }
}

export function drawSandbox(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // wooden frame
  prect(ctx, gx, gy, gw, gh, "#7a4a22");
  // sand inside
  prect(ctx, gx + 2, gy + 2, gw - 4, gh - 4, "#f0d68a");
  // sand speckle
  for (let yy = gy + 3; yy < gy + gh - 3; yy += 3) {
    for (let xx = gx + 3; xx < gx + gw - 3; xx += 3) {
      if (((xx * 7 + yy * 11) & 3) === 0) pset(ctx, xx, yy, "#d4b86a");
    }
  }
  // pala + balde
  // bucket (red)
  prect(ctx, gx + 4, gy + 4, 5, 4, "#c83a3a");
  prect(ctx, gx + 4, gy + 4, 5, 1, "#1a1a1a");
  prect(ctx, gx + 4, gy + 7, 5, 1, "#1a1a1a");
  // shovel (blue)
  prect(ctx, gx + gw - 8, gy + 6, 1, 4, "#3a78c9");
  prect(ctx, gx + gw - 9, gy + 6, 3, 2, "#3a78c9");
  // frame outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
}

export function drawFlowerbed(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // dirt
  prect(ctx, gx, gy, gw, gh, "#5a3a22");
  prect(ctx, gx, gy, gw, 1, "#3a2a14");
  // flowers
  const colors = ["#e83a78", "#f0c842", "#e8853a", "#a85ad4", "#ffffff"];
  for (let yy = gy + 2; yy < gy + gh - 1; yy += 4) {
    for (let xx = gx + 2; xx < gx + gw - 1; xx += 4) {
      const c = colors[((xx * 7 + yy * 11) >>> 0) % colors.length];
      pset(ctx, xx, yy, c);
      pset(ctx, xx - 1, yy, c);
      pset(ctx, xx + 1, yy, c);
      pset(ctx, xx, yy - 1, c);
      pset(ctx, xx, yy + 1, c);
      pset(ctx, xx, yy, "#f5e23a"); // yellow center
    }
  }
}

export function drawSlide(ctx: Ctx, x: number, y: number) {
  // (x, y) is center. Slide ladder on right, slide ramp going left+down.
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx + 1, gy + 16, 9, 3, "rgba(0,0,0,0.35)");

  // platform on top (red)
  prect(ctx, gx + 1, gy - 14, 8, 6, "#c83a3a");
  prect(ctx, gx + 1, gy - 14, 8, 1, "#1a1a1a");
  prect(ctx, gx + 1, gy - 9, 8, 1, "#1a1a1a");
  prect(ctx, gx + 1, gy - 14, 1, 6, "#1a1a1a");
  prect(ctx, gx + 8, gy - 14, 1, 6, "#1a1a1a");

  // ladder (right side)
  prect(ctx, gx + 7, gy - 8, 1, 12, "#7a4a22");
  prect(ctx, gx + 9, gy - 8, 1, 12, "#7a4a22");
  for (let i = 0; i < 4; i++) {
    prect(ctx, gx + 7, gy - 7 + i * 3, 3, 1, "#7a4a22");
  }
  // ladder shadow
  pset(ctx, gx + 9, gy + 4, "#1a1a1a");

  // slide ramp (yellow, going left-down)
  // ramp consists of stepped pixel rect
  const rampColor = "#f0c842";
  const rampShade = "#a87a3a";
  prect(ctx, gx - 8, gy - 6, 9, 2, rampColor);
  prect(ctx, gx - 9, gy - 4, 10, 2, rampColor);
  prect(ctx, gx - 10, gy - 2, 11, 2, rampColor);
  prect(ctx, gx - 11, gy, 12, 2, rampColor);
  prect(ctx, gx - 12, gy + 2, 13, 2, rampColor);
  // side rails
  prect(ctx, gx - 12, gy - 6, 1, 10, rampShade);
  prect(ctx, gx + 1, gy - 6, 1, 10, rampShade);
  // bottom curl
  prect(ctx, gx - 13, gy + 4, 3, 2, rampColor);
  prect(ctx, gx - 13, gy + 4, 1, 2, rampShade);
  // outline ramp top
  prect(ctx, gx - 8, gy - 6, 9, 1, "#1a1a1a");
  prect(ctx, gx - 13, gy + 6, 16, 1, "#1a1a1a");

  // legs
  prect(ctx, gx + 1, gy + 4, 1, 4, "#3a3a3a");
  prect(ctx, gx + 8, gy + 4, 1, 4, "#3a3a3a");
}

export function drawSwingSet(ctx: Ctx, x: number, y: number) {
  // (x,y) center. Two swings hanging from top bar.
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 12, 14, 3, "rgba(0,0,0,0.3)");

  // A-frame legs (left)
  prect(ctx, gx - 12, gy - 8, 1, 18, "#5a3a1e");
  prect(ctx, gx - 10, gy - 8, 1, 18, "#5a3a1e");
  // A-frame legs (right)
  prect(ctx, gx + 10, gy - 8, 1, 18, "#5a3a1e");
  prect(ctx, gx + 12, gy - 8, 1, 18, "#5a3a1e");
  // top bar
  prect(ctx, gx - 12, gy - 9, 25, 2, "#5a3a1e");
  prect(ctx, gx - 12, gy - 9, 25, 1, "#7a4a22");

  // chains
  prect(ctx, gx - 6, gy - 7, 1, 8, "#888");
  prect(ctx, gx - 3, gy - 7, 1, 8, "#888");
  prect(ctx, gx + 3, gy - 7, 1, 8, "#888");
  prect(ctx, gx + 6, gy - 7, 1, 8, "#888");

  // seats
  prect(ctx, gx - 7, gy + 1, 4, 2, "#c83a3a");
  prect(ctx, gx - 7, gy + 1, 4, 1, "#1a1a1a");
  prect(ctx, gx + 3, gy + 1, 4, 2, "#3a78c9");
  prect(ctx, gx + 3, gy + 1, 4, 1, "#1a1a1a");
}

export function drawCarousel(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX, gr = r / PX;
  // shadow
  pcircle(ctx, gx + 1, gy + 2, gr, "rgba(0,0,0,0.35)");
  // base platform
  pcircle(ctx, gx, gy, gr, "#3a78c9");
  pcircle(ctx, gx, gy, gr - 1, "#5a98e8");
  pcircle(ctx, gx, gy, gr - 3, "#a8d4f0");

  // colored wedges
  const wedgeColors = ["#e83a3a", "#f0c842", "#3aa86a", "#a85ad4"];
  const slices = 8;
  for (let i = 0; i < slices; i++) {
    const a = (i / slices) * Math.PI * 2;
    const ex = Math.cos(a) * (gr - 4);
    const ey = Math.sin(a) * (gr - 4);
    pcircle(ctx, gx + ex, gy + ey, 2, wedgeColors[i % wedgeColors.length]);
  }
  // center pole + roof (yellow)
  pcircle(ctx, gx, gy, 4, "#f0c842");
  pset(ctx, gx, gy, "#c89a3a");
  // top flag
  prect(ctx, gx, gy - gr - 2, 1, 3, "#5a3a1e");
  prect(ctx, gx + 1, gy - gr - 2, 3, 2, "#e83a3a");
  // horse silhouettes (4 spokes)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const hx = gx + Math.cos(a) * (gr - 6);
    const hy = gy + Math.sin(a) * (gr - 6);
    prect(ctx, hx - 1, hy - 1, 2, 2, "#fff");
    pset(ctx, hx - 1, hy - 2, "#fff");
    pset(ctx, hx + 1, hy - 1, "#5a3a1e");
  }
  // outline
  for (let yy = -Math.ceil(gr); yy <= Math.ceil(gr); yy++) {
    for (let xx = -Math.ceil(gr); xx <= Math.ceil(gr); xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= gr * gr && d2 > (gr - 1) * (gr - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
}

export function drawSeesaw(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 5, 14, 2, "rgba(0,0,0,0.3)");
  // pivot
  prect(ctx, gx - 2, gy - 1, 4, 4, "#5a3a1e");
  prect(ctx, gx - 1, gy, 2, 2, "#7a4a22");
  // plank — slightly tilted (use two halves)
  // left half (down)
  prect(ctx, gx - 16, gy + 1, 14, 2, "#c83a3a");
  prect(ctx, gx - 16, gy + 1, 14, 1, "#1a1a1a");
  // right half (up)
  prect(ctx, gx + 2, gy - 1, 14, 2, "#3a78c9");
  prect(ctx, gx + 2, gy - 1, 14, 1, "#1a1a1a");
  // handles
  prect(ctx, gx - 15, gy, 1, 1, "#f0c842");
  prect(ctx, gx + 15, gy - 2, 1, 1, "#f0c842");
}

// ───────────── Beach props (pixel-art top-down) ─────────────

export function drawUmbrella(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow (offset)
  pcircle(ctx, gx + 2, gy + 2, 9, "rgba(0,0,0,0.3)");
  // canopy
  pcircle(ctx, gx, gy, 9, color);
  // alternating stripe slices — radial wedges via pixel checks
  const r = 9;
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      if (xx * xx + yy * yy <= r * r) {
        const a = Math.atan2(yy, xx);
        const wedge = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 8) % 2;
        if (wedge === 0) pset(ctx, gx + xx, gy + yy, "#ffffff");
      }
    }
  }
  // outline ring
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= r * r && d2 > (r - 1) * (r - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // center pole hub
  pset(ctx, gx, gy, "#1a1a1a");
  pset(ctx, gx, gy + 1, "#5a3a1e");
  pset(ctx, gx, gy + 2, "#5a3a1e");
  pset(ctx, gx, gy + 3, "#5a3a1e");
}

export function drawBeachChair(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow
  prect(ctx, gx - 5, gy + 7, 12, 1, "rgba(0,0,0,0.3)");
  // backrest (raised, darker for shading)
  prect(ctx, gx - 5, gy - 4, 11, 4, color);
  prect(ctx, gx - 5, gy - 4, 11, 1, "#1a1a1a");
  // stripes on backrest
  prect(ctx, gx - 5, gy - 3, 11, 1, "#ffffff");
  prect(ctx, gx - 5, gy - 1, 11, 1, "#ffffff");
  // seat
  prect(ctx, gx - 5, gy + 1, 11, 5, color);
  prect(ctx, gx - 5, gy + 6, 11, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy + 3, 11, 1, "#ffffff");
  // frame
  prect(ctx, gx - 6, gy - 4, 1, 11, "#5a3a3a");
  prect(ctx, gx + 6, gy - 4, 1, 11, "#5a3a3a");
}

export function drawTowel(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // shadow
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.25)");
  // base
  prect(ctx, gx, gy, gw, gh, color);
  // stripes pattern
  const stripe = "#ffffff";
  for (let yy = gy + 1; yy < gy + gh - 1; yy += 3) {
    prect(ctx, gx + 1, yy, gw - 2, 1, stripe);
  }
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
}

export function drawTent(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 7, 11, 2, "rgba(0,0,0,0.3)");
  // dome (half-circle look from top — full circle here w/ door)
  pcircle(ctx, gx, gy, 9, color);
  // door (dark wedge front-bottom)
  prect(ctx, gx - 3, gy + 2, 6, 5, "#1a1a1a");
  prect(ctx, gx - 2, gy + 3, 4, 4, "#3a2a2a");
  // outline ring
  const r = 9;
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= r * r && d2 > (r - 1) * (r - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // top vent
  pset(ctx, gx, gy - r + 1, "#fff");
}

export function drawSandcastle(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const sand = "#e8c878";
  const sandShade = "#b8945a";
  // shadow
  prect(ctx, gx - 5, gy + 6, 12, 1, "rgba(0,0,0,0.3)");
  // base square
  prect(ctx, gx - 6, gy - 1, 13, 7, sand);
  prect(ctx, gx - 6, gy + 4, 13, 2, sandShade);
  // turrets (4 corners + center)
  prect(ctx, gx - 6, gy - 4, 3, 4, sand);
  prect(ctx, gx + 4, gy - 4, 3, 4, sand);
  prect(ctx, gx - 1, gy - 5, 3, 5, sand);
  // turret crenellations (top)
  pset(ctx, gx - 6, gy - 5, sand); pset(ctx, gx - 4, gy - 5, sand);
  pset(ctx, gx + 4, gy - 5, sand); pset(ctx, gx + 6, gy - 5, sand);
  pset(ctx, gx - 1, gy - 6, sand); pset(ctx, gx + 1, gy - 6, sand);
  // door (dark arch in middle)
  prect(ctx, gx - 1, gy + 2, 3, 4, "#3a2a14");
  pset(ctx, gx, gy + 1, "#3a2a14");
  // flag on center turret
  prect(ctx, gx, gy - 8, 1, 2, "#5a3a1e");
  prect(ctx, gx + 1, gy - 8, 2, 1, "#e23a3a");
  // outline base
  prect(ctx, gx - 6, gy - 1, 13, 1, "#7a5a2a");
  prect(ctx, gx - 6, gy + 5, 13, 1, "#7a5a2a");
}

export function drawBeachBall(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const r = 4;
  // shadow
  pellipse(ctx, gx, gy + 4, 4, 1, "rgba(0,0,0,0.35)");
  // ball — wedges of color
  const colors = ["#e83a3a", "#ffffff", "#3a78c9", "#f0c842", "#3aa86a", "#ffffff"];
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      if (xx * xx + yy * yy <= r * r) {
        const a = Math.atan2(yy, xx);
        const wedge = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 6);
        pset(ctx, gx + xx, gy + yy, colors[wedge % colors.length]);
      }
    }
  }
  // outline
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= r * r && d2 > (r - 1) * (r - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // highlight
  pset(ctx, gx - 1, gy - 2, "#ffffff");
}

export function drawFloatie(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  const R = 7, r = 3;
  // shadow
  pellipse(ctx, gx + 1, gy + 1, R, R - 2, "rgba(0,0,0,0.25)");
  // donut: outer disc minus inner hole
  for (let yy = -R; yy <= R; yy++) {
    for (let xx = -R; xx <= R; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= R * R && d2 >= r * r) {
        pset(ctx, gx + xx, gy + yy, color);
      }
    }
  }
  // outline outer
  for (let yy = -R; yy <= R; yy++) {
    for (let xx = -R; xx <= R; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= R * R && d2 > (R - 1) * (R - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // outline inner hole
  for (let yy = -R; yy <= R; yy++) {
    for (let xx = -R; xx <= R; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 >= r * r && d2 < (r + 1) * (r + 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // sprinkles / spots
  pset(ctx, gx - 4, gy - 2, "#ffffff");
  pset(ctx, gx + 3, gy + 3, "#ffffff");
  pset(ctx, gx + 4, gy - 3, "#ffffff");
  pset(ctx, gx - 3, gy + 4, "#ffffff");
}

export function drawSurfboard(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow at base
  pellipse(ctx, gx, gy + 13, 4, 1, "rgba(0,0,0,0.35)");
  // board vertical (stuck in sand) — narrow oval
  for (let yy = -12; yy <= 12; yy++) {
    const rx = yy < -8 || yy > 10 ? 1 : 2;
    prect(ctx, gx - rx, gy + yy, rx * 2 + 1, 1, color);
  }
  // stripe down middle
  prect(ctx, gx, gy - 8, 1, 18, "#ffffff");
  // tail fin hint
  pset(ctx, gx, gy + 11, "#1a1a1a");
  // outline edges
  pset(ctx, gx - 2, gy - 6, "#1a1a1a"); pset(ctx, gx + 2, gy - 6, "#1a1a1a");
  pset(ctx, gx - 2, gy + 8, "#1a1a1a"); pset(ctx, gx + 2, gy + 8, "#1a1a1a");
  pset(ctx, gx, gy - 12, "#1a1a1a");
}

export function drawShell(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const p = "#f8d8b0";
  const ps = "#d8a878";
  // fan shape (scallop)
  prect(ctx, gx - 2, gy - 1, 5, 1, p);
  prect(ctx, gx - 3, gy, 7, 1, p);
  prect(ctx, gx - 3, gy + 1, 7, 1, p);
  pset(ctx, gx - 3, gy + 1, ps); pset(ctx, gx + 3, gy + 1, ps);
  // ridges
  pset(ctx, gx - 2, gy + 1, ps);
  pset(ctx, gx, gy + 1, ps);
  pset(ctx, gx + 2, gy + 1, ps);
  // hinge
  pset(ctx, gx, gy - 2, ps);
}

export function drawStarfish(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const c = "#e88a3a";
  const cs = "#b85a1a";
  // 5-point star pixel approximation
  // center
  prect(ctx, gx - 1, gy - 1, 3, 3, c);
  // arms
  pset(ctx, gx, gy - 3, c); pset(ctx, gx, gy - 4, c);
  pset(ctx, gx, gy + 3, c); pset(ctx, gx, gy + 4, c);
  pset(ctx, gx - 3, gy + 1, c); pset(ctx, gx - 4, gy + 2, c);
  pset(ctx, gx + 3, gy + 1, c); pset(ctx, gx + 4, gy + 2, c);
  pset(ctx, gx - 3, gy - 1, c); pset(ctx, gx + 3, gy - 1, c);
  // dots
  pset(ctx, gx, gy, "#ffffff");
  pset(ctx, gx - 1, gy - 1, cs);
  pset(ctx, gx + 1, gy + 1, cs);
}

export function drawLifeguardTower(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  prect(ctx, gx - 6, gy + 8, 14, 1, "rgba(0,0,0,0.35)");
  // legs (4 corners of base)
  prect(ctx, gx - 6, gy - 2, 1, 10, "#7a4a22");
  prect(ctx, gx + 6, gy - 2, 1, 10, "#7a4a22");
  prect(ctx, gx - 6, gy - 2, 13, 1, "#5a3a1e");
  // hut body (white with red trim)
  prect(ctx, gx - 5, gy - 8, 11, 7, "#ffffff");
  prect(ctx, gx - 5, gy - 8, 11, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy - 1, 11, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy - 8, 1, 8, "#1a1a1a");
  prect(ctx, gx + 5, gy - 8, 1, 8, "#1a1a1a");
  // red stripe
  prect(ctx, gx - 4, gy - 6, 9, 2, "#e23a3a");
  // window
  prect(ctx, gx - 3, gy - 3, 7, 2, "#5aa6e8");
  prect(ctx, gx - 3, gy - 3, 7, 1, "#1a1a1a");
  // roof (red triangle pixel)
  prect(ctx, gx - 5, gy - 10, 11, 2, "#e23a3a");
  prect(ctx, gx - 4, gy - 11, 9, 1, "#e23a3a");
  prect(ctx, gx - 2, gy - 12, 5, 1, "#e23a3a");
  prect(ctx, gx - 5, gy - 10, 11, 1, "#1a1a1a");
  // flag pole
  prect(ctx, gx, gy - 14, 1, 3, "#5a3a1e");
  prect(ctx, gx + 1, gy - 14, 3, 2, "#e23a3a");
}

// ───────────── Supermarket props (top-down) ─────────────

export function drawFloorTile(ctx: Ctx, x: number, y: number, size: number) {
  const gx = x / PX, gy = y / PX, gs = size / PX;
  prect(ctx, gx, gy, gs, gs, "#e8e8ec");
  prect(ctx, gx, gy, gs, 1, "#b8b8c0");
  prect(ctx, gx, gy + gs - 1, gs, 1, "#b8b8c0");
  prect(ctx, gx, gy, 1, gs, "#b8b8c0");
  prect(ctx, gx + gs - 1, gy, 1, gs, "#b8b8c0");
}

export function drawWallH(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  prect(ctx, gx, gy, gw, 4, "#7a7a86");
  prect(ctx, gx, gy, gw, 1, "#3a3a44");
  prect(ctx, gx, gy + 3, gw, 1, "#3a3a44");
}

export function drawWallV(ctx: Ctx, x: number, y: number, h: number) {
  const gx = x / PX, gy = y / PX, gh = h / PX;
  prect(ctx, gx, gy, 4, gh, "#7a7a86");
  prect(ctx, gx, gy, 1, gh, "#3a3a44");
  prect(ctx, gx + 3, gy, 1, gh, "#3a3a44");
}

export function drawFruitShelf(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // wood crate base
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.3)");
  prect(ctx, gx, gy, gw, gh, "#7a4a22");
  // wood slats
  for (let yy = gy + 2; yy < gy + gh - 1; yy += 4) {
    prect(ctx, gx + 1, yy, gw - 2, 1, "#5a3a1a");
  }
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");

  // fruits/vegs scattered (deterministic by position)
  const fruits = [
    "#e23a3a", // apple
    "#f0c842", // banana yellow
    "#e8853a", // orange
    "#a85ad4", // grape purple
    "#3aa86a", // lettuce green
    "#7adf6a", // lime
    "#ffffff", // garlic/onion
    "#e2d8a0", // potato
  ];
  for (let yy = gy + 2; yy < gy + gh - 2; yy += 2) {
    for (let xx = gx + 2; xx < gx + gw - 2; xx += 2) {
      const k = (xx * 31 + yy * 17) >>> 0;
      pset(ctx, xx, yy, fruits[k % fruits.length]);
      if ((k & 7) === 0) pset(ctx, xx + 1, yy, "#1a1a1a");
    }
  }
  // label sign on top
  prect(ctx, gx + Math.floor(gw / 2) - 4, gy - 3, 9, 3, "#3aa86a");
  prect(ctx, gx + Math.floor(gw / 2) - 4, gy - 3, 9, 1, "#1a1a1a");
}

export function drawFridge(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.35)");
  // body
  prect(ctx, gx, gy, gw, gh, "#dcdce4");
  // glass door panels with blue tint
  prect(ctx, gx + 2, gy + 3, gw - 4, gh - 6, "#5aa6e8");
  // glass shine bands
  prect(ctx, gx + 2, gy + 3, gw - 4, 1, "#a8d8ff");
  prect(ctx, gx + 2, gy + 3, 1, gh - 6, "#a8d8ff");
  // bottles (vertical lines, mixed colors)
  const bottleColors = ["#3a3a44", "#e23a3a", "#3aa86a", "#f0c842", "#a85ad4", "#ffffff"];
  for (let xx = gx + 3; xx < gx + gw - 3; xx += 2) {
    const k = (xx * 13) >>> 0;
    const c = bottleColors[k % bottleColors.length];
    prect(ctx, xx, gy + 4, 1, gh - 8, c);
    pset(ctx, xx, gy + 4, "#fff");
  }
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
  // door divider
  prect(ctx, gx + Math.floor(gw / 2), gy, 1, gh, "#1a1a1a");
  // handles
  pset(ctx, gx + Math.floor(gw / 2) - 2, gy + 4, "#3a3a44");
  pset(ctx, gx + Math.floor(gw / 2) + 1, gy + 4, "#3a3a44");
}

export function drawBakeryCounter(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.3)");
  // counter body
  prect(ctx, gx, gy, gw, gh, "#a87a4a");
  // glass top
  prect(ctx, gx + 1, gy + 1, gw - 2, 4, "#cfe8f0");
  // breads inside (round)
  for (let xx = gx + 3; xx < gx + gw - 3; xx += 4) {
    pcircle(ctx, xx, gy + 3, 1, "#c89a5a");
    pset(ctx, xx, gy + 2, "#e8b878");
  }
  // facturas / pastries lower
  prect(ctx, gx + 2, gy + 6, gw - 4, 2, "#5a3a1a");
  for (let xx = gx + 3; xx < gx + gw - 3; xx += 3) {
    pset(ctx, xx, gy + 6, "#f0c842"); // sprinkle
  }
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
  // sign
  prect(ctx, gx + Math.floor(gw / 2) - 5, gy - 3, 11, 3, "#e8853a");
  prect(ctx, gx + Math.floor(gw / 2) - 5, gy - 3, 11, 1, "#1a1a1a");
}

export function drawRegister(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  prect(ctx, gx - 7, gy - 5, 15, 14, "rgba(0,0,0,0.3)");
  // counter body
  prect(ctx, gx - 8, gy - 6, 16, 14, "#bcbcc4");
  // conveyor belt
  prect(ctx, gx - 8, gy - 6, 16, 5, "#3a3a44");
  prect(ctx, gx - 8, gy - 4, 16, 1, "#5a5a66");
  prect(ctx, gx - 8, gy - 2, 16, 1, "#5a5a66");
  // register box
  prect(ctx, gx + 2, gy, 5, 5, "#3a3a44");
  prect(ctx, gx + 2, gy, 5, 2, "#5a5a66"); // screen
  prect(ctx, gx + 3, gy + 3, 3, 1, "#1a1a1a");
  // bagging area
  prect(ctx, gx - 6, gy + 1, 6, 5, "#dcdce4");
  // outline
  prect(ctx, gx - 8, gy - 6, 16, 1, "#1a1a1a");
  prect(ctx, gx - 8, gy + 7, 16, 1, "#1a1a1a");
  prect(ctx, gx - 8, gy - 6, 1, 14, "#1a1a1a");
  prect(ctx, gx + 7, gy - 6, 1, 14, "#1a1a1a");
}

export function drawCart(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  prect(ctx, gx - 3, gy + 5, 9, 1, "rgba(0,0,0,0.35)");
  // basket
  prect(ctx, gx - 4, gy - 3, 9, 7, "#a8a8b2");
  // grid lines (wire mesh hint)
  prect(ctx, gx - 4, gy - 1, 9, 1, "#5a5a66");
  prect(ctx, gx - 4, gy + 1, 9, 1, "#5a5a66");
  prect(ctx, gx - 1, gy - 3, 1, 7, "#5a5a66");
  prect(ctx, gx + 2, gy - 3, 1, 7, "#5a5a66");
  // handle (sticks out top)
  prect(ctx, gx - 4, gy - 4, 9, 1, "#e23a3a");
  // wheels
  pset(ctx, gx - 4, gy + 4, "#1a1a1a");
  pset(ctx, gx + 4, gy + 4, "#1a1a1a");
  // outline
  prect(ctx, gx - 4, gy - 3, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy + 4, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy - 3, 1, 7, "#1a1a1a");
  prect(ctx, gx + 4, gy - 3, 1, 7, "#1a1a1a");
}

export function drawSalePoster(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // hanging string
  prect(ctx, gx, gy - 6, 1, 2, "#5a5a66");
  // poster body (yellow)
  prect(ctx, gx - 6, gy - 4, 13, 7, "#f0c842");
  prect(ctx, gx - 6, gy - 4, 13, 1, "#1a1a1a");
  prect(ctx, gx - 6, gy + 2, 13, 1, "#1a1a1a");
  prect(ctx, gx - 6, gy - 4, 1, 7, "#1a1a1a");
  prect(ctx, gx + 6, gy - 4, 1, 7, "#1a1a1a");
  // SALE text bars (red blocks)
  prect(ctx, gx - 4, gy - 2, 9, 1, "#e23a3a");
  prect(ctx, gx - 4, gy, 9, 1, "#e23a3a");
  // % symbol pixels
  pset(ctx, gx - 2, gy - 1, "#1a1a1a");
  pset(ctx, gx + 3, gy - 1, "#1a1a1a");
  pset(ctx, gx + 1, gy + 1, "#1a1a1a");
}

// ───────────── Farm props (top-down) ─────────────

export function drawBarn(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx + 2, gy + 2, gw, gh, "rgba(0,0,0,0.35)");
  prect(ctx, gx, gy, gw, gh, "#c83a3a");
  // roof gable lines down middle
  prect(ctx, gx + Math.floor(gw / 2), gy, 1, gh, "#8a1a1a");
  // white trim cross (barn doors visible from top)
  prect(ctx, gx + 4, gy + Math.floor(gh / 2) - 2, gw - 8, 1, "#ffffff");
  prect(ctx, gx + Math.floor(gw / 2) - 4, gy + 4, 1, gh - 8, "#ffffff");
  prect(ctx, gx + Math.floor(gw / 2) + 3, gy + 4, 1, gh - 8, "#ffffff");
  // hayloft window
  prect(ctx, gx + Math.floor(gw / 2) - 2, gy + 2, 4, 3, "#3a2a1a");
  prect(ctx, gx + Math.floor(gw / 2) - 2, gy + 2, 4, 1, "#1a1a1a");
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
  // weather vane (rooster shape pixel)
  pset(ctx, gx + Math.floor(gw / 2), gy - 2, "#1a1a1a");
  pset(ctx, gx + Math.floor(gw / 2) + 1, gy - 2, "#1a1a1a");
}

export function drawFarmhouse(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx + 2, gy + 2, gw, gh, "rgba(0,0,0,0.3)");
  // roof brown
  prect(ctx, gx, gy, gw, gh, "#7a4a22");
  // roof shingles
  for (let yy = gy + 2; yy < gy + gh - 1; yy += 3) {
    prect(ctx, gx + 1, yy, gw - 2, 1, "#5a3a1a");
  }
  // chimney
  prect(ctx, gx + 2, gy - 3, 3, 4, "#5a3a3a");
  prect(ctx, gx + 2, gy - 3, 3, 1, "#3a2a2a");
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
}

export function drawFenceH(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  prect(ctx, gx, gy + 1, gw, 1, "rgba(0,0,0,0.35)");
  // posts
  for (let xx = gx; xx < gx + gw; xx += 5) {
    prect(ctx, xx, gy - 2, 1, 4, "#8a5a2a");
    pset(ctx, xx, gy - 2, "#5a3a1a");
  }
  // rails
  prect(ctx, gx, gy - 1, gw, 1, "#a87a4a");
  prect(ctx, gx, gy + 1, gw, 1, "#a87a4a");
}

export function drawFenceV(ctx: Ctx, x: number, y: number, h: number) {
  const gx = x / PX, gy = y / PX, gh = h / PX;
  prect(ctx, gx + 1, gy, 1, gh, "rgba(0,0,0,0.35)");
  for (let yy = gy; yy < gy + gh; yy += 5) {
    prect(ctx, gx - 2, yy, 4, 1, "#8a5a2a");
    pset(ctx, gx - 2, yy, "#5a3a1a");
  }
  prect(ctx, gx - 1, gy, 1, gh, "#a87a4a");
  prect(ctx, gx + 1, gy, 1, gh, "#a87a4a");
}

// Cow (top-down) — bigger, 4 legs, ears, tail tuft
export function drawCow(ctx: Ctx, x: number, y: number, black: boolean = false) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 7, 2, "rgba(0,0,0,0.35)");
  const base = black ? "#2a2a2a" : "#ffffff";
  const patch = black ? "#ffffff" : "#1a1a1a";
  // legs (4 hooves)
  prect(ctx, gx - 4, gy + 4, 1, 2, "#3a2a1a");
  prect(ctx, gx - 1, gy + 4, 1, 2, "#3a2a1a");
  prect(ctx, gx + 1, gy + 4, 1, 2, "#3a2a1a");
  prect(ctx, gx + 3, gy + 4, 1, 2, "#3a2a1a");
  // body
  prect(ctx, gx - 5, gy - 2, 10, 6, base);
  // patches
  prect(ctx, gx - 4, gy - 1, 3, 2, patch);
  prect(ctx, gx + 1, gy + 1, 3, 2, patch);
  prect(ctx, gx - 2, gy + 2, 2, 1, patch);
  pset(ctx, gx + 2, gy - 1, patch);
  // head
  prect(ctx, gx - 7, gy - 3, 3, 3, base);
  // ears
  pset(ctx, gx - 7, gy - 4, base); pset(ctx, gx - 5, gy - 4, base);
  // horns
  pset(ctx, gx - 6, gy - 5, "#f0e0a8");
  pset(ctx, gx - 4, gy - 5, "#f0e0a8");
  // eye
  pset(ctx, gx - 6, gy - 2, "#1a1a1a");
  // muzzle pink
  prect(ctx, gx - 7, gy - 1, 2, 1, "#f8a8a0");
  pset(ctx, gx - 6, gy - 1, "#1a1a1a"); // nostril
  // tail (with tuft at end)
  prect(ctx, gx + 5, gy + 1, 1, 3, patch);
  pset(ctx, gx + 5, gy + 4, "#1a1a1a");
  // outline body
  prect(ctx, gx - 5, gy - 2, 10, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy + 4, 10, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy - 2, 1, 6, "#1a1a1a");
  prect(ctx, gx + 4, gy - 2, 1, 6, "#1a1a1a");
  // head outline
  prect(ctx, gx - 7, gy - 3, 1, 3, "#1a1a1a");
  pset(ctx, gx - 7, gy, "#1a1a1a");
}

export function drawSheep(ctx: Ctx, x: number, y: number, black: boolean = false) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 5, 2, "rgba(0,0,0,0.3)");
  const wool = black ? "#3a3a44" : "#f0e8d8";
  const woolShade = black ? "#1a1a1a" : "#dcd4c0";
  // legs
  prect(ctx, gx - 3, gy + 3, 1, 2, "#3a2a1a");
  prect(ctx, gx + 2, gy + 3, 1, 2, "#3a2a1a");
  // fluffy wool body
  pcircle(ctx, gx, gy, 4, wool);
  // wool texture (bumps)
  pset(ctx, gx - 2, gy - 2, woolShade);
  pset(ctx, gx + 1, gy - 1, woolShade);
  pset(ctx, gx - 1, gy + 1, woolShade);
  pset(ctx, gx + 2, gy + 2, woolShade);
  pset(ctx, gx - 3, gy + 1, woolShade);
  // head (dark)
  prect(ctx, gx - 6, gy - 1, 3, 3, "#3a2a2a");
  // ears
  pset(ctx, gx - 6, gy - 2, "#3a2a2a");
  pset(ctx, gx - 4, gy - 2, "#3a2a2a");
  // eye
  pset(ctx, gx - 5, gy, "#fff");
  // muzzle
  pset(ctx, gx - 6, gy + 1, "#1a1a1a");
  // tail (small)
  pset(ctx, gx + 4, gy, wool);
}

export function drawPig(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 5, 2, "rgba(0,0,0,0.3)");
  // legs
  prect(ctx, gx - 3, gy + 3, 1, 2, "#c87898");
  prect(ctx, gx - 1, gy + 3, 1, 2, "#c87898");
  prect(ctx, gx + 1, gy + 3, 1, 2, "#c87898");
  prect(ctx, gx + 3, gy + 3, 1, 2, "#c87898");
  // body pink
  prect(ctx, gx - 4, gy - 2, 9, 5, "#f4a8b8");
  // belly highlight
  prect(ctx, gx - 3, gy + 1, 7, 1, "#f8c0c8");
  // outline
  prect(ctx, gx - 4, gy - 2, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy + 2, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy - 2, 1, 5, "#1a1a1a");
  prect(ctx, gx + 4, gy - 2, 1, 5, "#1a1a1a");
  // head
  prect(ctx, gx + 5, gy - 1, 3, 3, "#f4a8b8");
  prect(ctx, gx + 5, gy - 1, 3, 1, "#1a1a1a");
  prect(ctx, gx + 5, gy + 2, 3, 1, "#1a1a1a");
  prect(ctx, gx + 7, gy - 1, 1, 3, "#1a1a1a");
  // ears
  pset(ctx, gx + 5, gy - 2, "#f4a8b8");
  pset(ctx, gx + 7, gy - 2, "#f4a8b8");
  // eye
  pset(ctx, gx + 6, gy, "#1a1a1a");
  // snout (2 nostrils)
  pset(ctx, gx + 7, gy + 1, "#c87898");
  // tail curl
  pset(ctx, gx - 5, gy - 1, "#1a1a1a");
  pset(ctx, gx - 5, gy, "#1a1a1a");
  pset(ctx, gx - 4, gy + 1, "#1a1a1a");
}

export function drawChicken(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pset(ctx, gx, gy + 3, "rgba(0,0,0,0.3)");
  // legs (orange)
  pset(ctx, gx - 1, gy + 2, "#f0c842");
  pset(ctx, gx + 1, gy + 2, "#f0c842");
  // body white
  pcircle(ctx, gx, gy, 2, "#ffffff");
  pset(ctx, gx + 1, gy + 1, "#dcdce0"); // shade
  // wing hint
  pset(ctx, gx + 1, gy - 1, "#dcdce0");
  // head
  pset(ctx, gx - 2, gy - 2, "#ffffff");
  pset(ctx, gx - 2, gy - 3, "#ffffff");
  pset(ctx, gx - 3, gy - 2, "#ffffff");
  // comb red
  pset(ctx, gx - 2, gy - 4, "#e23a3a");
  pset(ctx, gx - 1, gy - 4, "#e23a3a");
  // beak orange
  pset(ctx, gx - 4, gy - 2, "#f0c842");
  // wattle
  pset(ctx, gx - 3, gy - 1, "#e23a3a");
  // eye
  pset(ctx, gx - 2, gy - 3, "#1a1a1a");
  // tail feathers
  pset(ctx, gx + 2, gy - 1, "#1a1a1a");
  pset(ctx, gx + 3, gy - 2, "#1a1a1a");
}

export function drawHorse(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 7, 2, "rgba(0,0,0,0.3)");
  // legs (4)
  prect(ctx, gx - 4, gy + 4, 1, 2, "#3a2a1a");
  prect(ctx, gx - 1, gy + 4, 1, 2, "#3a2a1a");
  prect(ctx, gx + 1, gy + 4, 1, 2, "#3a2a1a");
  prect(ctx, gx + 3, gy + 4, 1, 2, "#3a2a1a");
  // body brown
  prect(ctx, gx - 5, gy - 2, 10, 6, "#7a4a22");
  // body shade
  prect(ctx, gx - 5, gy + 2, 10, 1, "#5a3a1a");
  // mane (along back)
  prect(ctx, gx - 6, gy - 2, 1, 4, "#3a2a1a");
  prect(ctx, gx - 5, gy - 3, 5, 1, "#3a2a1a");
  // head
  prect(ctx, gx - 8, gy - 1, 3, 3, "#7a4a22");
  // ears
  pset(ctx, gx - 7, gy - 2, "#7a4a22");
  // eye
  pset(ctx, gx - 7, gy, "#1a1a1a");
  // muzzle
  pset(ctx, gx - 8, gy + 1, "#3a2a1a");
  // tail
  prect(ctx, gx + 5, gy, 2, 2, "#3a2a1a");
  prect(ctx, gx + 6, gy + 2, 1, 2, "#3a2a1a");
  // outline body
  prect(ctx, gx - 5, gy - 2, 10, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy + 4, 10, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy - 2, 1, 6, "#1a1a1a");
  prect(ctx, gx + 4, gy - 2, 1, 6, "#1a1a1a");
}

// ───── New animal variety ─────

export function drawDog(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 4, 1, "rgba(0,0,0,0.3)");
  // body
  prect(ctx, gx - 3, gy - 1, 7, 4, "#c89858");
  // legs
  pset(ctx, gx - 3, gy + 3, "#7a5a2a");
  pset(ctx, gx, gy + 3, "#7a5a2a");
  pset(ctx, gx + 3, gy + 3, "#7a5a2a");
  // belly shade
  prect(ctx, gx - 3, gy + 2, 7, 1, "#a87a3a");
  // head
  prect(ctx, gx - 5, gy - 1, 3, 3, "#c89858");
  // ears (flop)
  pset(ctx, gx - 5, gy - 2, "#7a5a2a");
  pset(ctx, gx - 3, gy - 2, "#7a5a2a");
  pset(ctx, gx - 5, gy, "#7a5a2a");
  // eye
  pset(ctx, gx - 4, gy, "#1a1a1a");
  // nose
  pset(ctx, gx - 5, gy + 1, "#1a1a1a");
  // tail (curled up)
  pset(ctx, gx + 4, gy - 2, "#c89858");
  pset(ctx, gx + 5, gy - 1, "#c89858");
  pset(ctx, gx + 5, gy, "#c89858");
  // outline
  prect(ctx, gx - 3, gy - 1, 7, 1, "#1a1a1a");
  prect(ctx, gx - 3, gy + 3, 7, 1, "#1a1a1a");
}

export function drawDuck(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pset(ctx, gx, gy + 3, "rgba(0,0,0,0.3)");
  // legs orange
  pset(ctx, gx - 1, gy + 2, "#e8853a");
  pset(ctx, gx + 1, gy + 2, "#e8853a");
  // body yellow
  pcircle(ctx, gx, gy, 2, "#f5d63a");
  // wing
  pset(ctx, gx + 1, gy, "#d8b03a");
  pset(ctx, gx, gy + 1, "#d8b03a");
  // head
  pset(ctx, gx - 2, gy - 2, "#f5d63a");
  pset(ctx, gx - 1, gy - 2, "#f5d63a");
  pset(ctx, gx - 2, gy - 1, "#f5d63a");
  // beak orange
  pset(ctx, gx - 3, gy - 1, "#e8853a");
  pset(ctx, gx - 3, gy, "#e8853a");
  // eye
  pset(ctx, gx - 1, gy - 2, "#1a1a1a");
  // tail
  pset(ctx, gx + 2, gy - 1, "#d8b03a");
}

export function drawGoose(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 4, 1, "rgba(0,0,0,0.3)");
  // legs
  pset(ctx, gx - 1, gy + 3, "#e8853a");
  pset(ctx, gx + 1, gy + 3, "#e8853a");
  // body white oval
  pcircle(ctx, gx, gy + 1, 3, "#ffffff");
  pset(ctx, gx + 2, gy + 2, "#dcdce0");
  // long neck (vertical)
  prect(ctx, gx - 1, gy - 4, 2, 4, "#ffffff");
  // head
  pset(ctx, gx - 2, gy - 5, "#ffffff");
  pset(ctx, gx - 1, gy - 5, "#ffffff");
  // beak orange
  pset(ctx, gx - 3, gy - 5, "#e8853a");
  pset(ctx, gx + 1, gy - 5, "#e8853a");
  // eye
  pset(ctx, gx - 1, gy - 4, "#1a1a1a");
  // outline neck
  pset(ctx, gx - 2, gy - 3, "#1a1a1a");
  pset(ctx, gx + 1, gy - 3, "#1a1a1a");
}

export function drawGoat(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 5, 1, "rgba(0,0,0,0.3)");
  // legs
  prect(ctx, gx - 3, gy + 3, 1, 2, "#3a3a3a");
  prect(ctx, gx - 1, gy + 3, 1, 2, "#3a3a3a");
  prect(ctx, gx + 1, gy + 3, 1, 2, "#3a3a3a");
  prect(ctx, gx + 3, gy + 3, 1, 2, "#3a3a3a");
  // body white/gray
  prect(ctx, gx - 4, gy - 1, 9, 4, "#dcdce0");
  prect(ctx, gx - 4, gy + 2, 9, 1, "#b8b8c0");
  // head
  prect(ctx, gx - 6, gy - 1, 3, 3, "#dcdce0");
  // horns curving back
  pset(ctx, gx - 6, gy - 2, "#5a3a1a");
  pset(ctx, gx - 4, gy - 2, "#5a3a1a");
  pset(ctx, gx - 5, gy - 3, "#5a3a1a");
  // beard
  pset(ctx, gx - 6, gy + 2, "#ffffff");
  // eye
  pset(ctx, gx - 5, gy, "#1a1a1a");
  // tail (up)
  pset(ctx, gx + 5, gy - 1, "#dcdce0");
  // outline
  prect(ctx, gx - 4, gy - 1, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy + 3, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy - 1, 1, 4, "#1a1a1a");
  prect(ctx, gx + 4, gy - 1, 1, 4, "#1a1a1a");
}

export function drawRabbit(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 3, 1, "rgba(0,0,0,0.3)");
  // body white fluffy
  pcircle(ctx, gx, gy, 2, "#ffffff");
  // pink tail dot
  pset(ctx, gx + 2, gy, "#f8c0c8");
  // legs
  pset(ctx, gx - 2, gy + 2, "#dcdce0");
  pset(ctx, gx + 1, gy + 2, "#dcdce0");
  // head
  pset(ctx, gx - 2, gy - 1, "#ffffff");
  // long ears (2 vertical)
  prect(ctx, gx - 3, gy - 4, 1, 3, "#ffffff");
  prect(ctx, gx - 1, gy - 4, 1, 3, "#ffffff");
  pset(ctx, gx - 3, gy - 4, "#f8c0c8");
  pset(ctx, gx - 1, gy - 4, "#f8c0c8");
  // eye
  pset(ctx, gx - 2, gy - 1, "#1a1a1a");
  // nose
  pset(ctx, gx - 3, gy, "#f4a8b8");
}

export function drawTractor(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  prect(ctx, gx - 7, gy + 5, 16, 1, "rgba(0,0,0,0.35)");
  // body
  prect(ctx, gx - 7, gy - 3, 14, 8, "#e23a3a");
  prect(ctx, gx - 7, gy - 3, 14, 1, "#1a1a1a");
  prect(ctx, gx - 7, gy + 4, 14, 1, "#1a1a1a");
  prect(ctx, gx - 7, gy - 3, 1, 8, "#1a1a1a");
  prect(ctx, gx + 6, gy - 3, 1, 8, "#1a1a1a");
  // cabin
  prect(ctx, gx - 1, gy - 5, 5, 3, "#3a3a44");
  prect(ctx, gx, gy - 4, 3, 1, "#a8d4f0");
  // exhaust pipe
  pset(ctx, gx + 4, gy - 6, "#3a3a44");
  pset(ctx, gx + 4, gy - 5, "#3a3a44");
  // front wheels small
  prect(ctx, gx + 6, gy - 1, 3, 2, "#1a1a1a");
  // rear wheels big
  prect(ctx, gx - 9, gy + 1, 4, 4, "#1a1a1a");
  prect(ctx, gx - 8, gy + 2, 2, 2, "#3a3a3a");
  prect(ctx, gx + 6, gy + 1, 4, 4, "#1a1a1a");
  prect(ctx, gx + 7, gy + 2, 2, 2, "#3a3a3a");
}

export function drawHayBale(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 6, 1, "rgba(0,0,0,0.35)");
  // cylindrical bale
  prect(ctx, gx - 6, gy - 3, 13, 7, "#e2c878");
  // straw lines
  for (let xx = gx - 5; xx < gx + 7; xx += 2) {
    prect(ctx, xx, gy - 3, 1, 7, "#a89858");
  }
  // outline
  prect(ctx, gx - 6, gy - 3, 13, 1, "#1a1a1a");
  prect(ctx, gx - 6, gy + 3, 13, 1, "#1a1a1a");
  prect(ctx, gx - 6, gy - 3, 1, 7, "#1a1a1a");
  prect(ctx, gx + 6, gy - 3, 1, 7, "#1a1a1a");
}

export function drawCropRow(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // dirt rows
  prect(ctx, gx, gy, gw, gh, "#7a4a22");
  for (let yy = gy + 1; yy < gy + gh; yy += 3) {
    prect(ctx, gx, yy, gw, 1, "#5a3a1a");
  }
  // plants in rows
  for (let yy = gy + 1; yy < gy + gh - 1; yy += 3) {
    for (let xx = gx + 1; xx < gx + gw - 1; xx += 2) {
      pset(ctx, xx, yy, color);
      if (((xx * 7 + yy * 13) & 3) === 0) pset(ctx, xx, yy + 1, "#3aa86a");
    }
  }
}

export function drawPond(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX, gr = r / PX;
  // outer dirt ring
  pcircle(ctx, gx, gy, gr, "#5a3a1a");
  // water
  pcircle(ctx, gx, gy, Math.max(2, gr - 1), "#3a78c9");
  pcircle(ctx, gx, gy, Math.max(1, gr - 2), "#5aa6e8");
  // highlight
  pset(ctx, gx - Math.floor(gr * 0.3), gy - Math.floor(gr * 0.3), "#a8d8ff");
  pset(ctx, gx + 1, gy - Math.floor(gr * 0.4), "#a8d8ff");
  // lily pad
  pcircle(ctx, gx + 1, gy + 1, 1, "#3aa86a");
}

export function drawWindmill(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 8, 5, 2, "rgba(0,0,0,0.35)");
  // tower
  prect(ctx, gx - 3, gy - 2, 7, 11, "#dcdce4");
  prect(ctx, gx - 3, gy - 2, 7, 1, "#1a1a1a");
  prect(ctx, gx - 3, gy + 8, 7, 1, "#1a1a1a");
  prect(ctx, gx - 3, gy - 2, 1, 11, "#1a1a1a");
  prect(ctx, gx + 3, gy - 2, 1, 11, "#1a1a1a");
  // door
  prect(ctx, gx, gy + 5, 2, 4, "#5a3a1a");
  // dome top
  prect(ctx, gx - 3, gy - 4, 7, 2, "#e23a3a");
  prect(ctx, gx - 2, gy - 5, 5, 1, "#e23a3a");
  // blades (4 arms cross)
  prect(ctx, gx, gy - 12, 1, 8, "#5a3a1a");
  prect(ctx, gx - 8, gy - 5, 8, 1, "#5a3a1a");
  prect(ctx, gx + 1, gy - 5, 8, 1, "#5a3a1a");
  prect(ctx, gx, gy - 4, 1, 8, "#5a3a1a");
  // hub
  pset(ctx, gx, gy - 5, "#1a1a1a");
}

export function drawScarecrow(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  prect(ctx, gx - 1, gy + 6, 4, 1, "rgba(0,0,0,0.35)");
  // pole
  prect(ctx, gx, gy - 4, 1, 11, "#5a3a1a");
  // crossbeam (arms)
  prect(ctx, gx - 4, gy - 1, 9, 1, "#5a3a1a");
  // hat
  prect(ctx, gx - 2, gy - 6, 5, 1, "#7a4a22");
  prect(ctx, gx - 1, gy - 7, 3, 1, "#7a4a22");
  // head (burlap sack)
  prect(ctx, gx - 1, gy - 5, 3, 2, "#e2c878");
  pset(ctx, gx - 1, gy - 4, "#1a1a1a"); // eye
  pset(ctx, gx + 1, gy - 4, "#1a1a1a"); // eye
  // shirt rags
  prect(ctx, gx - 2, gy, 5, 3, "#c83a3a");
  prect(ctx, gx - 4, gy - 1, 9, 1, "#5a3a1a"); // redraw beam
  // straw sticking out
  pset(ctx, gx - 3, gy + 1, "#e2c878");
  pset(ctx, gx + 3, gy + 1, "#e2c878");
}

// ───────────── Jungla props ─────────────

export function drawJungleTreeTrunk(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pcircle(ctx, gx + 1, gy + 2, 5, "rgba(0,0,0,0.4)");
  pcircle(ctx, gx, gy, 4, "#5a3a1e");
  pset(ctx, gx - 1, gy - 1, "#7a4a22");
  pset(ctx, gx + 1, gy + 1, "#3a2a14");
}

export function drawJungleCanopy(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX, gr = r / PX;
  pcircle(ctx, gx + 2, gy + 2, gr, "rgba(0,0,0,0.4)");
  // base dark green
  pcircle(ctx, gx, gy, gr, "#1a5a2a");
  // mid
  pcircle(ctx, gx - 1, gy - 1, Math.max(2, gr - 2), "#2a7a3a");
  // highlight blobs
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const bx = gx + Math.round(Math.cos(a) * gr * 0.4);
    const by = gy + Math.round(Math.sin(a) * gr * 0.4);
    pcircle(ctx, bx, by, Math.max(1, Math.round(gr * 0.2)), "#3aa84a");
  }
  // bright highlight
  pcircle(ctx, gx - Math.round(gr * 0.5), gy - Math.round(gr * 0.5), Math.max(1, Math.round(gr * 0.2)), "#7adf6a");
  // banana hint (yellow specks)
  pset(ctx, gx + 2, gy - 1, "#f0c842");
  pset(ctx, gx - 3, gy + 2, "#f0c842");
}

export function drawVine(ctx: Ctx, x: number, y: number, h: number) {
  const gx = x / PX, gy = y / PX, gh = h / PX;
  // vertical green strand with leaves
  for (let i = 0; i < gh; i++) {
    const c = i % 3 === 0 ? "#3aa84a" : "#2a7a3a";
    pset(ctx, gx + (i % 2 === 0 ? 0 : 1), gy + i, c);
  }
  // leaves every few cells
  for (let i = 2; i < gh; i += 4) {
    pset(ctx, gx - 1, gy + i, "#3aa84a");
    pset(ctx, gx + 2, gy + i + 1, "#3aa84a");
  }
  // end tip flower
  pset(ctx, gx, gy + gh, "#e23a8a");
}

export function drawTiger(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 7, 2, "rgba(0,0,0,0.35)");
  // legs
  prect(ctx, gx - 4, gy + 4, 1, 2, "#c87838");
  prect(ctx, gx - 1, gy + 4, 1, 2, "#c87838");
  prect(ctx, gx + 1, gy + 4, 1, 2, "#c87838");
  prect(ctx, gx + 3, gy + 4, 1, 2, "#c87838");
  // body orange
  prect(ctx, gx - 5, gy - 2, 10, 6, "#e8a448");
  // belly lighter
  prect(ctx, gx - 4, gy + 2, 8, 2, "#f8c478");
  // stripes (vertical black)
  for (let xx = gx - 4; xx <= gx + 4; xx += 2) {
    prect(ctx, xx, gy - 2, 1, 5, "#1a1a1a");
  }
  // head
  pcircle(ctx, gx - 7, gy - 1, 3, "#e8a448");
  // ears (triangle pixels)
  pset(ctx, gx - 9, gy - 3, "#e8a448");
  pset(ctx, gx - 5, gy - 3, "#e8a448");
  pset(ctx, gx - 9, gy - 4, "#1a1a1a");
  pset(ctx, gx - 5, gy - 4, "#1a1a1a");
  // face stripes
  pset(ctx, gx - 8, gy - 2, "#1a1a1a");
  pset(ctx, gx - 6, gy - 2, "#1a1a1a");
  // eyes
  pset(ctx, gx - 9, gy - 1, "#fff");
  pset(ctx, gx - 5, gy - 1, "#fff");
  pset(ctx, gx - 8, gy - 1, "#1a1a1a");
  pset(ctx, gx - 6, gy - 1, "#1a1a1a");
  // muzzle white
  pset(ctx, gx - 8, gy + 1, "#fff");
  pset(ctx, gx - 7, gy + 1, "#fff");
  pset(ctx, gx - 6, gy + 1, "#fff");
  pset(ctx, gx - 7, gy + 1, "#f4a8b8");
  // tail with stripes
  prect(ctx, gx + 5, gy, 3, 1, "#e8a448");
  pset(ctx, gx + 5, gy, "#1a1a1a");
  pset(ctx, gx + 7, gy, "#1a1a1a");
}

export function drawMonkey(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 3, 1, "rgba(0,0,0,0.3)");
  // body brown
  pcircle(ctx, gx, gy, 3, "#7a4a22");
  // belly
  pcircle(ctx, gx, gy + 1, 2, "#c89a5a");
  // head
  pcircle(ctx, gx - 1, gy - 3, 2, "#7a4a22");
  // face (tan)
  pset(ctx, gx - 1, gy - 3, "#e2b878");
  pset(ctx, gx - 2, gy - 2, "#e2b878");
  pset(ctx, gx, gy - 2, "#e2b878");
  // ears (round side dots)
  pset(ctx, gx - 3, gy - 3, "#7a4a22");
  pset(ctx, gx + 1, gy - 3, "#7a4a22");
  // eyes
  pset(ctx, gx - 2, gy - 3, "#1a1a1a");
  pset(ctx, gx, gy - 3, "#1a1a1a");
  // arms hanging
  pset(ctx, gx - 4, gy, "#7a4a22");
  pset(ctx, gx + 3, gy, "#7a4a22");
  // tail curl
  pset(ctx, gx + 3, gy + 1, "#7a4a22");
  pset(ctx, gx + 4, gy + 2, "#7a4a22");
  pset(ctx, gx + 4, gy, "#7a4a22");
}

export function drawElephant(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 6, 9, 2, "rgba(0,0,0,0.4)");
  // legs (4 thick)
  prect(ctx, gx - 5, gy + 4, 2, 3, "#6a6a78");
  prect(ctx, gx - 2, gy + 4, 2, 3, "#6a6a78");
  prect(ctx, gx + 1, gy + 4, 2, 3, "#6a6a78");
  prect(ctx, gx + 4, gy + 4, 2, 3, "#6a6a78");
  // body gray big
  prect(ctx, gx - 6, gy - 2, 13, 7, "#8a8a98");
  // body shade
  prect(ctx, gx - 6, gy + 3, 13, 1, "#6a6a78");
  // head
  pcircle(ctx, gx - 8, gy, 4, "#8a8a98");
  // ear (big flap on side)
  pellipse(ctx, gx - 9, gy + 1, 3, 4, "#7a7a88");
  pellipse(ctx, gx - 9, gy + 1, 2, 3, "#9a9aa8");
  // eye
  pset(ctx, gx - 8, gy - 1, "#1a1a1a");
  // trunk (curving down)
  prect(ctx, gx - 11, gy + 1, 1, 4, "#8a8a98");
  prect(ctx, gx - 12, gy + 4, 2, 1, "#8a8a98");
  pset(ctx, gx - 11, gy + 5, "#8a8a98");
  // tusks (white)
  pset(ctx, gx - 11, gy + 2, "#ffffff");
  pset(ctx, gx - 10, gy + 3, "#ffffff");
  // tail
  prect(ctx, gx + 7, gy, 1, 3, "#6a6a78");
  pset(ctx, gx + 7, gy + 3, "#1a1a1a");
  // outline body
  prect(ctx, gx - 6, gy - 2, 13, 1, "#3a3a44");
  prect(ctx, gx - 6, gy + 4, 13, 1, "#3a3a44");
}

// ───────────── Polo norte props ─────────────

export function drawIgloo(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 8, 12, 2, "rgba(0,0,0,0.35)");
  // dome (snow blocks)
  pcircle(ctx, gx, gy, 11, "#e8eef8");
  pcircle(ctx, gx, gy + 1, 10, "#dce4f0");
  // brick lines (curved rows)
  for (let yy = -8; yy <= 4; yy += 3) {
    for (let xx = -10; xx <= 10; xx += 4) {
      if (xx * xx + yy * yy <= 100) pset(ctx, gx + xx + ((yy + 8) % 2 ? 2 : 0), gy + yy, "#a8b8d0");
    }
  }
  // dark entrance tunnel
  prect(ctx, gx - 3, gy + 4, 7, 5, "#3a3a5a");
  prect(ctx, gx - 4, gy + 3, 9, 1, "#dce4f0");
  // arch shadow
  prect(ctx, gx - 3, gy + 4, 7, 1, "#1a1a2a");
  // outline ring
  const r = 11;
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= r * r && d2 > (r - 1) * (r - 1) && yy < 4) {
        pset(ctx, gx + xx, gy + yy, "#1a1a2a");
      }
    }
  }
  // top highlight
  pset(ctx, gx - 1, gy - 8, "#ffffff");
  pset(ctx, gx, gy - 9, "#ffffff");
}

export function drawPenguin(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 3, 1, "rgba(0,0,0,0.3)");
  // body black
  prect(ctx, gx - 2, gy - 2, 5, 6, "#1a1a1a");
  // belly white
  prect(ctx, gx - 1, gy - 1, 3, 4, "#ffffff");
  // head black
  pcircle(ctx, gx, gy - 3, 2, "#1a1a1a");
  // face white patch
  pset(ctx, gx - 1, gy - 3, "#ffffff");
  pset(ctx, gx + 1, gy - 3, "#ffffff");
  // eyes (black inside white)
  pset(ctx, gx - 1, gy - 3, "#000");
  pset(ctx, gx + 1, gy - 3, "#000");
  // beak orange
  pset(ctx, gx, gy - 2, "#e8853a");
  // feet orange
  pset(ctx, gx - 2, gy + 4, "#e8853a");
  pset(ctx, gx + 2, gy + 4, "#e8853a");
  // wing hint
  pset(ctx, gx - 2, gy + 1, "#3a3a3a");
  pset(ctx, gx + 2, gy + 1, "#3a3a3a");
}

export function drawSeal(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 7, 2, "rgba(0,0,0,0.35)");
  // body (long oval gray)
  pellipse(ctx, gx, gy, 7, 3, "#7a8a9a");
  pellipse(ctx, gx, gy - 1, 6, 2, "#a8b8c8");
  // head (raised)
  pcircle(ctx, gx - 7, gy - 1, 2, "#7a8a9a");
  // eye
  pset(ctx, gx - 8, gy - 1, "#1a1a1a");
  pset(ctx, gx - 8, gy, "#1a1a1a");
  // whiskers
  pset(ctx, gx - 9, gy, "#1a1a1a");
  // tail flipper
  pset(ctx, gx + 7, gy - 1, "#7a8a9a");
  pset(ctx, gx + 8, gy, "#5a6a7a");
  pset(ctx, gx + 7, gy + 1, "#7a8a9a");
  // belly spots
  pset(ctx, gx - 2, gy + 1, "#5a6a7a");
  pset(ctx, gx + 1, gy, "#5a6a7a");
}

export function drawPolarBear(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 8, 2, "rgba(0,0,0,0.35)");
  // legs
  prect(ctx, gx - 5, gy + 4, 2, 2, "#dcdce4");
  prect(ctx, gx - 1, gy + 4, 2, 2, "#dcdce4");
  prect(ctx, gx + 2, gy + 4, 2, 2, "#dcdce4");
  // body big
  prect(ctx, gx - 6, gy - 2, 12, 6, "#f0f0f8");
  // shading
  prect(ctx, gx - 6, gy + 3, 12, 1, "#dcdce4");
  prect(ctx, gx + 5, gy - 1, 1, 4, "#dcdce4");
  // head
  pcircle(ctx, gx - 8, gy, 3, "#f0f0f8");
  // ears (round)
  pset(ctx, gx - 9, gy - 3, "#f0f0f8");
  pset(ctx, gx - 7, gy - 3, "#f0f0f8");
  // eyes
  pset(ctx, gx - 9, gy, "#1a1a1a");
  pset(ctx, gx - 7, gy, "#1a1a1a");
  // nose
  pset(ctx, gx - 10, gy + 1, "#1a1a1a");
  pset(ctx, gx - 9, gy + 1, "#1a1a1a");
  // outline body
  prect(ctx, gx - 6, gy - 2, 12, 1, "#a8a8b8");
  prect(ctx, gx - 6, gy + 4, 12, 1, "#a8a8b8");
  prect(ctx, gx - 6, gy - 2, 1, 6, "#a8a8b8");
  prect(ctx, gx + 5, gy - 2, 1, 6, "#a8a8b8");
}

export function drawSnowman(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 7, 5, 1, "rgba(0,0,0,0.3)");
  // bottom ball
  pcircle(ctx, gx, gy + 3, 4, "#ffffff");
  pset(ctx, gx, gy + 3, "#dcdce4");
  // middle ball
  pcircle(ctx, gx, gy - 1, 3, "#ffffff");
  pset(ctx, gx + 1, gy - 1, "#dcdce4");
  // head
  pcircle(ctx, gx, gy - 5, 2, "#ffffff");
  // hat (black top hat)
  prect(ctx, gx - 2, gy - 7, 5, 1, "#1a1a1a");
  prect(ctx, gx - 1, gy - 9, 3, 2, "#1a1a1a");
  // carrot nose
  pset(ctx, gx + 1, gy - 5, "#e8853a");
  pset(ctx, gx + 2, gy - 5, "#e8853a");
  // eyes (coal)
  pset(ctx, gx - 1, gy - 6, "#1a1a1a");
  pset(ctx, gx + 1, gy - 6, "#1a1a1a");
  // mouth (coal dots)
  pset(ctx, gx - 1, gy - 4, "#1a1a1a");
  pset(ctx, gx + 1, gy - 4, "#1a1a1a");
  // buttons (middle ball)
  pset(ctx, gx, gy - 1, "#1a1a1a");
  pset(ctx, gx, gy + 1, "#1a1a1a");
  // scarf red
  prect(ctx, gx - 3, gy - 3, 6, 1, "#e23a3a");
  pset(ctx, gx - 3, gy - 2, "#e23a3a");
  pset(ctx, gx - 3, gy - 1, "#e23a3a");
  // arms (sticks)
  prect(ctx, gx - 5, gy, 2, 1, "#5a3a1a");
  prect(ctx, gx + 3, gy, 2, 1, "#5a3a1a");
  pset(ctx, gx - 5, gy - 1, "#5a3a1a");
  pset(ctx, gx + 4, gy - 1, "#5a3a1a");
}

export function drawSnowPile(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX, gr = r / PX;
  pellipse(ctx, gx + 1, gy + 1, gr, Math.max(1, Math.floor(gr * 0.6)), "rgba(0,0,0,0.25)");
  pellipse(ctx, gx, gy, gr, Math.max(1, Math.floor(gr * 0.6)), "#ffffff");
  pellipse(ctx, gx - 1, gy - 1, Math.max(1, gr - 2), Math.max(1, Math.floor(gr * 0.4)), "#f0f4ff");
  // sparkles
  pset(ctx, gx - 1, gy - 2, "#a8d8ff");
  pset(ctx, gx + 2, gy + 1, "#a8d8ff");
}

export function drawReindeer(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 6, 2, "rgba(0,0,0,0.3)");
  // legs
  prect(ctx, gx - 3, gy + 3, 1, 3, "#5a3a1a");
  prect(ctx, gx - 1, gy + 3, 1, 3, "#5a3a1a");
  prect(ctx, gx + 1, gy + 3, 1, 3, "#5a3a1a");
  prect(ctx, gx + 3, gy + 3, 1, 3, "#5a3a1a");
  // body brown
  prect(ctx, gx - 4, gy - 1, 9, 4, "#8a5a2a");
  prect(ctx, gx - 4, gy + 2, 9, 1, "#5a3a1a");
  // head
  prect(ctx, gx - 6, gy - 2, 3, 3, "#8a5a2a");
  // antlers (forked)
  pset(ctx, gx - 6, gy - 4, "#5a3a1a");
  pset(ctx, gx - 5, gy - 5, "#5a3a1a");
  pset(ctx, gx - 4, gy - 4, "#5a3a1a");
  pset(ctx, gx - 4, gy - 5, "#5a3a1a");
  pset(ctx, gx - 6, gy - 3, "#5a3a1a");
  // nose (red — rudolph)
  pset(ctx, gx - 7, gy, "#e23a3a");
  // eye
  pset(ctx, gx - 5, gy - 1, "#1a1a1a");
  // tail
  pset(ctx, gx + 5, gy, "#ffffff");
  // outline body
  prect(ctx, gx - 4, gy - 1, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy + 3, 9, 1, "#1a1a1a");
}

export function drawSleigh(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 10, 1, "rgba(0,0,0,0.35)");
  // body red curved
  prect(ctx, gx - 8, gy - 2, 16, 4, "#c83a3a");
  // gold trim
  prect(ctx, gx - 8, gy - 2, 16, 1, "#f0c842");
  prect(ctx, gx - 8, gy + 2, 16, 1, "#f0c842");
  // front swoop
  pset(ctx, gx - 9, gy - 1, "#c83a3a");
  pset(ctx, gx - 10, gy, "#c83a3a");
  pset(ctx, gx - 9, gy + 1, "#c83a3a");
  // rear swoop
  pset(ctx, gx + 8, gy - 1, "#c83a3a");
  // runners (skis)
  prect(ctx, gx - 10, gy + 3, 18, 1, "#3a3a3a");
  pset(ctx, gx - 11, gy + 3, "#3a3a3a");
  pset(ctx, gx + 8, gy + 3, "#3a3a3a");
  // outline
  prect(ctx, gx - 8, gy - 2, 16, 1, "#1a1a1a");
  prect(ctx, gx - 8, gy + 2, 16, 1, "#1a1a1a");
  // gifts inside
  pset(ctx, gx - 4, gy - 1, "#f0c842");
  pset(ctx, gx, gy - 1, "#3aa86a");
  pset(ctx, gx + 4, gy - 1, "#3a78c9");
}

export function drawDoor(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  // gap in wall
  prect(ctx, gx, gy, gw, 4, "#5aa6e8");
  // glass shine
  prect(ctx, gx, gy + 1, gw, 1, "#a8d8ff");
  // door frame
  prect(ctx, gx - 1, gy - 1, 1, 6, "#3a3a44");
  prect(ctx, gx + gw, gy - 1, 1, 6, "#3a3a44");
  // arrow (entrance) pointing down — green
  const cx = gx + Math.floor(gw / 2);
  pset(ctx, cx, gy + 6, "#3aa86a");
  prect(ctx, cx - 1, gy + 7, 3, 1, "#3aa86a");
  prect(ctx, cx - 2, gy + 8, 5, 1, "#3aa86a");
  // sign above wall
  prect(ctx, cx - 6, gy - 5, 13, 3, "#3aa86a");
  prect(ctx, cx - 6, gy - 5, 13, 1, "#1a1a1a");
  prect(ctx, cx - 6, gy - 3, 13, 1, "#1a1a1a");
  prect(ctx, cx - 5, gy - 4, 11, 1, "#fff"); // ENTRADA text bar
}
