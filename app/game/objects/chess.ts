import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

export type ChessKind = "pawn" | "rook" | "bishop" | "knight" | "queen" | "king";

export function drawChessPiece(ctx: Ctx, x: number, y: number, color: string, kind: ChessKind) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 6, 5, 1, "rgba(0,0,0,0.5)");
  // base disc
  pellipse(ctx, gx, gy + 5, 5, 2, color);
  pellipse(ctx, gx, gy + 5, 5, 2, color);
  prect(ctx, gx - 5, gy + 5, 11, 1, "#1a1a1a");
  // body / stem
  prect(ctx, gx - 2, gy - 1, 5, 6, color);
  // body shading
  prect(ctx, gx + 2, gy - 1, 1, 6, "rgba(0,0,0,0.3)");
  prect(ctx, gx - 2, gy - 1, 1, 6, "rgba(255,255,255,0.2)");
  // outline body
  prect(ctx, gx - 2, gy - 1, 1, 6, "#1a1a1a");
  prect(ctx, gx + 2, gy - 1, 1, 6, "#1a1a1a");
  // top pieces by kind
  if (kind === "pawn") {
    pcircle(ctx, gx, gy - 3, 2, color);
    pset(ctx, gx, gy - 3, "rgba(255,255,255,0.3)");
    // outline top
    pset(ctx, gx - 2, gy - 3, "#1a1a1a");
    pset(ctx, gx + 2, gy - 3, "#1a1a1a");
    pset(ctx, gx, gy - 5, "#1a1a1a");
  } else if (kind === "rook") {
    // square top with battlements
    prect(ctx, gx - 3, gy - 5, 7, 3, color);
    prect(ctx, gx - 3, gy - 5, 7, 1, "#1a1a1a");
    prect(ctx, gx - 3, gy - 3, 1, 1, "#1a1a1a");
    prect(ctx, gx + 3, gy - 3, 1, 1, "#1a1a1a");
    // crenellations
    pset(ctx, gx - 2, gy - 6, color); pset(ctx, gx, gy - 6, color); pset(ctx, gx + 2, gy - 6, color);
  } else if (kind === "bishop") {
    // pointed top
    pcircle(ctx, gx, gy - 4, 2, color);
    pset(ctx, gx, gy - 6, color);
    pset(ctx, gx, gy - 7, "#1a1a1a");
    // cross slit
    pset(ctx, gx, gy - 4, "rgba(255,255,255,0.6)");
  } else if (kind === "knight") {
    // horse head silhouette
    prect(ctx, gx - 2, gy - 5, 4, 3, color);
    pset(ctx, gx - 3, gy - 4, color);
    pset(ctx, gx + 2, gy - 6, color); // ear
    pset(ctx, gx + 1, gy - 6, color);
    pset(ctx, gx + 1, gy - 5, "rgba(255,255,255,0.6)"); // eye
    pset(ctx, gx - 3, gy - 3, "#1a1a1a");
  } else if (kind === "queen") {
    pcircle(ctx, gx, gy - 4, 2, color);
    // crown pearls
    pset(ctx, gx - 2, gy - 6, "#f0c842");
    pset(ctx, gx, gy - 7, "#f0c842");
    pset(ctx, gx + 2, gy - 6, "#f0c842");
    pset(ctx, gx - 1, gy - 6, color);
    pset(ctx, gx + 1, gy - 6, color);
  } else if (kind === "king") {
    pcircle(ctx, gx, gy - 4, 2, color);
    // cross on top
    prect(ctx, gx, gy - 7, 1, 3, "#f0c842");
    prect(ctx, gx - 1, gy - 6, 3, 1, "#f0c842");
    pset(ctx, gx, gy - 8, "#1a1a1a");
  }
}


export function drawHourglass(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 9, 7, 2, "rgba(0,0,0,0.4)");
  // wooden frame top + bottom
  prect(ctx, gx - 6, gy - 8, 13, 2, "#7a4a22");
  prect(ctx, gx - 6, gy + 6, 13, 2, "#7a4a22");
  prect(ctx, gx - 6, gy - 8, 13, 1, "#5a3a1a");
  prect(ctx, gx - 6, gy + 7, 13, 1, "#5a3a1a");
  // glass top half (lighter)
  for (let yy = -6; yy <= -1; yy++) {
    const halfW = 5 - Math.floor((yy + 6) * 0.7);
    prect(ctx, gx - halfW, gy + yy, halfW * 2 + 1, 1, "#e8eef8");
  }
  // glass bottom half
  for (let yy = 0; yy <= 5; yy++) {
    const halfW = Math.floor(yy * 0.7) + 1;
    prect(ctx, gx - halfW, gy + yy, halfW * 2 + 1, 1, "#e8eef8");
  }
  // sand top (gold)
  for (let yy = -5; yy <= -2; yy++) {
    const halfW = 4 - Math.floor((yy + 5) * 0.8);
    prect(ctx, gx - halfW, gy + yy, halfW * 2 + 1, 1, "#f0c842");
  }
  // sand bottom (pile)
  prect(ctx, gx - 4, gy + 5, 9, 1, "#f0c842");
  prect(ctx, gx - 3, gy + 4, 7, 1, "#f0c842");
  prect(ctx, gx - 2, gy + 3, 5, 1, "#f0c842");
  // sand stream (1 px column falling)
  pset(ctx, gx, gy - 1, "#f0c842");
  pset(ctx, gx, gy, "#f0c842");
  pset(ctx, gx, gy + 1, "#f0c842");
  pset(ctx, gx, gy + 2, "#f0c842");
  // glass outline
  prect(ctx, gx - 5, gy - 6, 1, 12, "#1a1a1a");
  prect(ctx, gx + 5, gy - 6, 1, 12, "#1a1a1a");
}

// Giant hand silhouette pinching from edge.
// `side`: 'top' | 'bottom' | 'left' | 'right'. (x,y) anchored at finger tip.

// Giant hand silhouette pinching from edge.
// `side`: 'top' | 'bottom' | 'left' | 'right'. (x,y) anchored at finger tip.
export function drawGiantHand(ctx: Ctx, x: number, y: number, side: "top" | "bottom" | "left" | "right") {
  const gx = x / PX, gy = y / PX;
  const skin = "#f3c79a";
  const skinShade = "#d99a6a";
  // base drawing: hand pointing right, fingers extended.
  // We'll render to offscreen orientation by mapping coords.
  const set = (dx: number, dy: number, c: string) => {
    let mx = dx, my = dy;
    if (side === "top") { mx = dx; my = -dy; }      // mirror vertical
    else if (side === "left") { mx = -dy; my = dx; } // rotate 90 ccw mapping
    else if (side === "right") { mx = dy; my = dx; } // rotate 90 cw mapping
    pset(ctx, gx + mx, gy + my, c);
  };
  // For "bottom" (default): finger up
  // We'll draw a hand whose finger tip is at (0,0), pointing in +y for "bottom" (entering from below pointing up).
  // Use bottom as default and skip side fancy mapping — just call with side="bottom" generally; for other sides, we'll re-orient simply.

  // index finger pointing up
  for (let yy = 0; yy <= 16; yy++) {
    set(-1, yy, skin); set(0, yy, skin); set(1, yy, skin);
  }
  // fingertip nail hint
  set(0, 0, "#ffe0d0");
  // shading right side of finger
  for (let yy = 1; yy <= 16; yy++) set(1, yy, skinShade);
  // hand palm (wider lower part)
  for (let yy = 14; yy <= 24; yy++) {
    const half = Math.min(6, 2 + (yy - 14));
    for (let xx = -half; xx <= half; xx++) set(xx, yy, skin);
  }
  // thumb sticking sideways
  for (let xx = -7; xx <= -3; xx++) set(xx, 16, skin);
  for (let xx = -7; xx <= -3; xx++) set(xx, 17, skin);
  // knuckle lines
  for (let xx = -5; xx <= 5; xx++) set(xx, 20, skinShade);
  // outline silhouette
  for (let yy = 0; yy <= 16; yy++) {
    set(-2, yy, "#1a1a1a");
    set(2, yy, "#1a1a1a");
  }
  set(-1, -1, "#1a1a1a");
  set(0, -1, "#1a1a1a");
  set(1, -1, "#1a1a1a");
  // palm outline
  for (let xx = -7; xx <= 7; xx++) {
    set(xx, 24, "#1a1a1a");
  }
  set(-7, 23, "#1a1a1a");
  set(7, 23, "#1a1a1a");
  set(-8, 17, "#1a1a1a");
  set(-8, 16, "#1a1a1a");
  // wrist sleeve (shirt cuff)
  for (let xx = -7; xx <= 7; xx++) {
    set(xx, 25, "#3a78c9");
    set(xx, 26, "#3a78c9");
  }
  set(-7, 25, "#1a1a1a"); set(7, 25, "#1a1a1a");
  set(-7, 26, "#1a1a1a"); set(7, 26, "#1a1a1a");
}

// ───────────── Mundo gigante props (escritorio) ─────────────

