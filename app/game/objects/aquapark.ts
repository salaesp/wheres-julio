import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

// ───────────── Maratón ciudad props ─────────────

export function drawFinishArch(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  // posts (left + right)
  prect(ctx, gx, gy, 3, 14, "#e23a3a");
  prect(ctx, gx + gw - 3, gy, 3, 14, "#e23a3a");
  // post highlight
  prect(ctx, gx, gy, 1, 14, "#ffffff");
  prect(ctx, gx + gw - 3, gy, 1, 14, "#ffffff");
  // outline posts
  prect(ctx, gx, gy, 3, 1, "#1a1a1a");
  prect(ctx, gx, gy + 13, 3, 1, "#1a1a1a");
  prect(ctx, gx + gw - 3, gy, 3, 1, "#1a1a1a");
  prect(ctx, gx + gw - 3, gy + 13, 3, 1, "#1a1a1a");
  // banner (top crossbar)
  prect(ctx, gx, gy - 6, gw, 6, "#e23a3a");
  prect(ctx, gx, gy - 6, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  // FINISH text bars (white blocks)
  prect(ctx, gx + 2, gy - 4, gw - 4, 2, "#ffffff");
  // small flags on top
  for (let xx = gx + 2; xx < gx + gw - 2; xx += 4) {
    pset(ctx, xx, gy - 7, "#f0c842");
    pset(ctx, xx + 1, gy - 8, "#3aa86a");
    pset(ctx, xx + 2, gy - 7, "#3a78c9");
  }
  // checker line below arch (start/finish line on street)
  for (let xx = gx; xx < gx + gw; xx += 2) {
    pset(ctx, xx, gy + 16, ((xx / 2) & 1) === 0 ? "#ffffff" : "#1a1a1a");
    pset(ctx, xx, gy + 17, ((xx / 2) & 1) === 0 ? "#1a1a1a" : "#ffffff");
  }
}


export function drawBarrier(ctx: Ctx, x: number, y: number, vertical: boolean = true, length: number = 60) {
  const gx = x / PX, gy = y / PX, glen = length / PX;
  if (vertical) {
    // shadow
    prect(ctx, gx + 1, gy + 1, 2, glen, "rgba(0,0,0,0.35)");
    // posts at intervals
    for (let i = 0; i <= glen; i += 6) {
      prect(ctx, gx, gy + i, 2, 1, "#bcbcc4");
      prect(ctx, gx, gy + i + 1, 2, 4, "#bcbcc4");
      pset(ctx, gx, gy + i, "#1a1a1a");
    }
    // horizontal bars connecting posts
    prect(ctx, gx, gy + 1, 2, 1, "#a8a8b2");
    prect(ctx, gx, gy + Math.floor(glen / 2), 2, 1, "#a8a8b2");
    prect(ctx, gx, gy + glen - 1, 2, 1, "#a8a8b2");
  } else {
    prect(ctx, gx + 1, gy + 1, glen, 2, "rgba(0,0,0,0.35)");
    for (let i = 0; i <= glen; i += 6) {
      prect(ctx, gx + i, gy, 4, 2, "#bcbcc4");
      pset(ctx, gx + i, gy, "#1a1a1a");
    }
    prect(ctx, gx, gy + 1, glen, 1, "#a8a8b2");
  }
}


export function drawHydrationTable(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  // shadow
  prect(ctx, gx + 1, gy + 5, gw, 1, "rgba(0,0,0,0.4)");
  // tablecloth (white)
  prect(ctx, gx, gy - 1, gw, 7, "#ffffff");
  prect(ctx, gx, gy - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + 5, gw, 1, "#1a1a1a");
  // red stripe
  prect(ctx, gx, gy + 2, gw, 1, "#e23a3a");
  // cups on table (small)
  for (let xx = gx + 2; xx < gx + gw - 1; xx += 3) {
    pset(ctx, xx, gy, "#3a78c9");
    pset(ctx, xx, gy - 1, "#3a78c9");
    pset(ctx, xx + 1, gy, "#5aa6e8");
  }
  // water jug on side
  prect(ctx, gx + gw - 4, gy - 3, 3, 3, "#3a78c9");
  prect(ctx, gx + gw - 4, gy - 3, 3, 1, "#1a1a1a");
  pset(ctx, gx + gw - 1, gy - 2, "#3a78c9");
}


export function drawSpectatorFlag(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // stick
  prect(ctx, gx, gy, 1, 6, "#5a3a1e");
  // flag
  prect(ctx, gx + 1, gy, 4, 3, color);
  prect(ctx, gx + 1, gy, 4, 1, "#1a1a1a");
  prect(ctx, gx + 1, gy + 2, 4, 1, "#1a1a1a");
  prect(ctx, gx + 4, gy, 1, 3, "#1a1a1a");
}


export function drawSign(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // stick
  prect(ctx, gx, gy, 1, 6, "#5a3a1e");
  // sign rectangle
  prect(ctx, gx - 3, gy - 3, 7, 4, color);
  prect(ctx, gx - 3, gy - 3, 7, 1, "#1a1a1a");
  prect(ctx, gx - 3, gy, 7, 1, "#1a1a1a");
  prect(ctx, gx - 3, gy - 3, 1, 4, "#1a1a1a");
  prect(ctx, gx + 3, gy - 3, 1, 4, "#1a1a1a");
  // text lines (white bars)
  prect(ctx, gx - 2, gy - 2, 5, 1, "#ffffff");
}


export function drawCameraProp(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 4, 1, "rgba(0,0,0,0.4)");
  // tripod legs
  prect(ctx, gx - 2, gy + 1, 1, 4, "#1a1a1a");
  prect(ctx, gx, gy + 1, 1, 4, "#1a1a1a");
  prect(ctx, gx + 2, gy + 1, 1, 4, "#1a1a1a");
  // camera body
  prect(ctx, gx - 3, gy - 2, 7, 4, "#1a1a1a");
  prect(ctx, gx - 3, gy - 2, 7, 1, "#3a3a44");
  // lens
  pcircle(ctx, gx + 1, gy, 2, "#3a3a44");
  pset(ctx, gx + 1, gy, "#5aa6e8");
  // top viewfinder
  prect(ctx, gx - 1, gy - 4, 3, 2, "#3a3a44");
  pset(ctx, gx, gy - 4, "#e23a3a"); // record dot
}

// ───────────── Barco pirata props ─────────────


// ───────────── Parque acuático props ─────────────

export function drawPool(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // tile deck (lighter)
  prect(ctx, gx - 2, gy - 2, gw + 4, gh + 4, "#dcdce4");
  // pool border
  prect(ctx, gx, gy, gw, gh, "#3a3a44");
  // water surface
  prect(ctx, gx + 2, gy + 2, gw - 4, gh - 4, "#1a4a8a");
  prect(ctx, gx + 2, gy + 2, gw - 4, Math.max(1, Math.floor(gh / 4)), "#2a6abf");
  // water highlights (ripples)
  for (let yy = gy + 4; yy < gy + gh - 4; yy += 3) {
    for (let xx = gx + 4; xx < gx + gw - 4; xx += 3) {
      if (((xx * 31 + yy * 17) & 7) === 0) pset(ctx, xx, yy, "#5aa6e8");
      if (((xx * 13 + yy * 23) & 11) === 0) pset(ctx, xx, yy + 1, "#a8d8ff");
    }
  }
  // lane lines (yellow stripes)
  const lanes = 4;
  for (let i = 1; i < lanes; i++) {
    const ly = gy + Math.floor((gh * i) / lanes);
    for (let xx = gx + 3; xx < gx + gw - 3; xx += 4) {
      pset(ctx, xx, ly, "#f0c842");
      pset(ctx, xx + 1, ly, "#ffffff");
    }
  }
  // pool edge outline
  prect(ctx, gx, gy, gw, 1, "#1a1a2a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a2a");
  prect(ctx, gx, gy, 1, gh, "#1a1a2a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a2a");
  // ladders (2 short marks at sides)
  prect(ctx, gx + Math.floor(gw / 2) - 1, gy - 2, 2, 4, "#bcbcc4");
  prect(ctx, gx + Math.floor(gw / 2) - 1, gy + gh - 2, 2, 4, "#bcbcc4");
}


export function drawSpiralSlide(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // base shadow
  pellipse(ctx, gx, gy + 22, 16, 3, "rgba(0,0,0,0.4)");
  // tower (vertical structure)
  prect(ctx, gx - 4, gy - 22, 8, 28, "#5a5a66");
  prect(ctx, gx - 4, gy - 22, 8, 1, "#1a1a2a");
  prect(ctx, gx - 4, gy + 6, 8, 1, "#1a1a2a");
  prect(ctx, gx - 4, gy - 22, 1, 28, "#1a1a2a");
  prect(ctx, gx + 3, gy - 22, 1, 28, "#1a1a2a");
  // top platform (red)
  prect(ctx, gx - 7, gy - 25, 14, 4, "#c83a3a");
  prect(ctx, gx - 7, gy - 25, 14, 1, "#1a1a1a");
  // railing
  prect(ctx, gx - 7, gy - 27, 14, 1, "#bcbcc4");
  pset(ctx, gx - 7, gy - 27, "#1a1a2a"); pset(ctx, gx + 6, gy - 27, "#1a1a2a");
  // ladder rungs on tower
  for (let i = 0; i < 7; i++) prect(ctx, gx - 5, gy - 20 + i * 4, 2, 1, "#3a3a44");

  // Spiral chute — multiple concentric rings showing the slide wraps
  const ringColors = ["#3a78c9", "#5aa6e8", "#7ec8e8"];
  for (let i = 0; i < 3; i++) {
    const rOuter = 12 + i * 4;
    const rInner = 9 + i * 4;
    const baseY = gy - 12 + i * 7;
    // arc ring (open on right where chute exits)
    for (let ang = Math.PI * 0.2; ang < Math.PI * 2.0; ang += 0.18) {
      const bx = gx + Math.round(Math.cos(ang) * rOuter * 0.8);
      const by = baseY + Math.round(Math.sin(ang) * rOuter * 0.35);
      pset(ctx, bx, by, ringColors[i % ringColors.length]);
    }
    // inner edge (chute wall)
    for (let ang = Math.PI * 0.2; ang < Math.PI * 2.0; ang += 0.22) {
      const bx = gx + Math.round(Math.cos(ang) * rInner * 0.8);
      const by = baseY + Math.round(Math.sin(ang) * rInner * 0.35);
      pset(ctx, bx, by, "#1a1a2a");
    }
    void rInner;
  }
  // Exit chute (straight piece bottom)
  prect(ctx, gx - 14, gy + 6, 12, 4, "#5aa6e8");
  prect(ctx, gx - 14, gy + 6, 12, 1, "#1a1a2a");
  prect(ctx, gx - 14, gy + 9, 12, 1, "#1a1a2a");
  // splash pool small
  pellipse(ctx, gx - 18, gy + 12, 8, 3, "#1a4a8a");
  pellipse(ctx, gx - 18, gy + 12, 7, 2, "#3a78c9");
  // splash
  pset(ctx, gx - 22, gy + 10, "#fff");
  pset(ctx, gx - 20, gy + 9, "#fff");
  pset(ctx, gx - 14, gy + 11, "#fff");
}


export function drawSunbed(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow
  prect(ctx, gx - 5, gy + 5, 12, 1, "rgba(0,0,0,0.3)");
  // frame
  prect(ctx, gx - 6, gy - 5, 13, 10, "#5a3a3a");
  // cushion
  prect(ctx, gx - 5, gy - 4, 11, 8, color);
  // pillow at head
  prect(ctx, gx - 5, gy - 4, 11, 2, "#ffffff");
  // stripes on cushion
  prect(ctx, gx - 5, gy - 1, 11, 1, "rgba(0,0,0,0.18)");
  prect(ctx, gx - 5, gy + 2, 11, 1, "rgba(0,0,0,0.18)");
  // outline
  prect(ctx, gx - 6, gy - 5, 13, 1, "#1a1a1a");
  prect(ctx, gx - 6, gy + 4, 13, 1, "#1a1a1a");
  // legs
  pset(ctx, gx - 5, gy + 5, "#3a3a44");
  pset(ctx, gx + 5, gy + 5, "#3a3a44");
}


export function drawPlasticTable(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx + 1, gy + 1, 6, 5, "rgba(0,0,0,0.3)");
  // table top (round white)
  pcircle(ctx, gx, gy, 5, "#ffffff");
  pcircle(ctx, gx, gy, 4, "#dcdce4");
  // hole in middle (for umbrella)
  pset(ctx, gx, gy, "#3a3a44");
  // 4 chairs around
  pset(ctx, gx - 6, gy, "#3a78c9"); pset(ctx, gx - 7, gy, "#3a78c9");
  pset(ctx, gx + 6, gy, "#3a78c9"); pset(ctx, gx + 7, gy, "#3a78c9");
  pset(ctx, gx, gy - 6, "#3a78c9"); pset(ctx, gx, gy - 7, "#3a78c9");
  pset(ctx, gx, gy + 6, "#3a78c9"); pset(ctx, gx, gy + 7, "#3a78c9");
  // outline
  for (let yy = -5; yy <= 5; yy++) {
    for (let xx = -5; xx <= 5; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= 25 && d2 > 16) pset(ctx, gx + xx, gy + yy, "#1a1a1a");
    }
  }
}


export function drawSnackBar(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.35)");
  // counter body (brown wood)
  prect(ctx, gx, gy + 4, gw, gh - 4, "#a87a4a");
  // counter top
  prect(ctx, gx, gy + 4, gw, 2, "#7a4a22");
  // striped awning (red/white)
  for (let i = 0; i < gw; i += 2) {
    prect(ctx, gx + i, gy, 1, 4, i % 4 === 0 ? "#ffffff" : "#e23a3a");
  }
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  // outline
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
  // food items on counter
  pset(ctx, gx + 4, gy + 6, "#f0c842"); // hot dog
  prect(ctx, gx + 3, gy + 6, 3, 1, "#f0c842");
  pset(ctx, gx + 8, gy + 6, "#e23a3a"); // soda cup
  pset(ctx, gx + 8, gy + 7, "#3a3a44");
  pset(ctx, gx + 12, gy + 6, "#f8d8b0"); // popcorn box
  pset(ctx, gx + 12, gy + 7, "#e23a3a");
  // sign / menu
  prect(ctx, gx + Math.floor(gw / 2) - 4, gy - 4, 9, 3, "#3aa86a");
  prect(ctx, gx + Math.floor(gw / 2) - 4, gy - 4, 9, 1, "#1a1a1a");
  prect(ctx, gx + Math.floor(gw / 2) - 4, gy - 2, 9, 1, "#1a1a1a");
  // person inside / cashier hint (head behind counter)
  pset(ctx, gx + Math.floor(gw / 2), gy + 2, "#f3c79a");
  pset(ctx, gx + Math.floor(gw / 2) + 1, gy + 2, "#f3c79a");
}

// ───────────── Jungla props ─────────────

