import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

// ───────────── Barco pirata props ─────────────

export function drawShipWheel(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pcircle(ctx, gx + 1, gy + 1, 6, "rgba(0,0,0,0.4)");
  // outer ring brown
  pcircle(ctx, gx, gy, 6, "#7a4a22");
  pcircle(ctx, gx, gy, 5, "#a87a4a");
  pcircle(ctx, gx, gy, 3, "#7a4a22");
  // hub
  pcircle(ctx, gx, gy, 2, "#3a2a14");
  pset(ctx, gx, gy, "#f0c842");
  // spokes / handles (8 directions)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const sx = gx + Math.round(Math.cos(a) * 7);
    const sy = gy + Math.round(Math.sin(a) * 7);
    pset(ctx, sx, sy, "#5a3a1a");
    const sx2 = gx + Math.round(Math.cos(a) * 8);
    const sy2 = gy + Math.round(Math.sin(a) * 8);
    pset(ctx, sx2, sy2, "#7a4a22");
  }
  // outline
  for (let yy = -6; yy <= 6; yy++) {
    for (let xx = -6; xx <= 6; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= 36 && d2 > 25) pset(ctx, gx + xx, gy + yy, "#3a2a14");
    }
  }
}


export function drawCannon(ctx: Ctx, x: number, y: number, vertical: boolean = false) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx + 1, gy + 2, 5, 1, "rgba(0,0,0,0.4)");
  if (vertical) {
    // barrel pointing up/down
    prect(ctx, gx - 2, gy - 4, 4, 8, "#3a3a3a");
    prect(ctx, gx - 2, gy - 5, 4, 1, "#5a5a66");
    pset(ctx, gx - 1, gy - 5, "#1a1a1a"); pset(ctx, gx, gy - 5, "#1a1a1a"); // bore
    // wheels
    prect(ctx, gx - 4, gy + 2, 2, 2, "#7a4a22");
    prect(ctx, gx + 2, gy + 2, 2, 2, "#7a4a22");
    pset(ctx, gx - 4, gy + 3, "#1a1a1a"); pset(ctx, gx + 3, gy + 3, "#1a1a1a");
    // carriage
    prect(ctx, gx - 3, gy + 2, 7, 2, "#7a4a22");
  } else {
    // horizontal
    prect(ctx, gx - 4, gy - 2, 8, 4, "#3a3a3a");
    prect(ctx, gx + 4, gy - 1, 2, 2, "#5a5a66");
    pset(ctx, gx + 5, gy, "#1a1a1a"); // bore
    pset(ctx, gx + 5, gy - 1, "#1a1a1a");
    // wheels
    prect(ctx, gx - 4, gy - 4, 2, 2, "#7a4a22");
    prect(ctx, gx - 4, gy + 2, 2, 2, "#7a4a22");
    // carriage
    prect(ctx, gx - 4, gy - 2, 1, 4, "#5a3a1a");
  }
}


export function drawTreasureChest(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 7, 2, "rgba(0,0,0,0.4)");
  // chest base
  prect(ctx, gx - 6, gy - 1, 13, 6, "#7a4a22");
  prect(ctx, gx - 6, gy - 1, 13, 1, "#5a3a1a");
  prect(ctx, gx - 6, gy + 4, 13, 1, "#5a3a1a");
  prect(ctx, gx - 6, gy - 1, 1, 6, "#3a2a14");
  prect(ctx, gx + 6, gy - 1, 1, 6, "#3a2a14");
  // gold bands
  prect(ctx, gx - 6, gy + 1, 13, 1, "#f0c842");
  // open lid (behind, going up)
  prect(ctx, gx - 6, gy - 6, 13, 4, "#a87a4a");
  prect(ctx, gx - 6, gy - 6, 13, 1, "#5a3a1a");
  prect(ctx, gx - 6, gy - 6, 1, 4, "#5a3a1a");
  prect(ctx, gx + 6, gy - 6, 1, 4, "#5a3a1a");
  prect(ctx, gx - 6, gy - 4, 13, 1, "#f0c842");
  // coins/gems inside
  pset(ctx, gx - 4, gy, "#f0c842");
  pset(ctx, gx - 2, gy + 1, "#f0c842");
  pset(ctx, gx, gy, "#f0c842");
  pset(ctx, gx + 2, gy + 1, "#f0c842");
  pset(ctx, gx + 4, gy, "#f0c842");
  pset(ctx, gx - 3, gy + 2, "#e23a3a"); // ruby
  pset(ctx, gx + 1, gy + 2, "#3a78c9"); // sapphire
  pset(ctx, gx + 4, gy + 2, "#3aa86a"); // emerald
  // sparkle
  pset(ctx, gx, gy - 2, "#ffffff");
  pset(ctx, gx - 5, gy - 5, "#ffffff");
}


export function drawTreasureMap(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 6, 1, "rgba(0,0,0,0.4)");
  // table
  prect(ctx, gx - 6, gy - 2, 13, 5, "#7a4a22");
  prect(ctx, gx - 6, gy + 2, 13, 1, "#5a3a1a");
  prect(ctx, gx - 7, gy + 3, 1, 2, "#3a2a14");
  prect(ctx, gx + 6, gy + 3, 1, 2, "#3a2a14");
  // map (parchment)
  prect(ctx, gx - 5, gy - 3, 11, 5, "#e2c878");
  prect(ctx, gx - 5, gy - 3, 11, 1, "#a87a4a");
  prect(ctx, gx - 5, gy + 1, 11, 1, "#a87a4a");
  prect(ctx, gx - 5, gy - 3, 1, 5, "#a87a4a");
  prect(ctx, gx + 5, gy - 3, 1, 5, "#a87a4a");
  // map lines (dotted)
  pset(ctx, gx - 3, gy - 1, "#3a2a14");
  pset(ctx, gx - 1, gy - 1, "#3a2a14");
  pset(ctx, gx + 1, gy, "#3a2a14");
  pset(ctx, gx + 3, gy, "#3a2a14");
  // X marks the spot (red)
  pset(ctx, gx + 3, gy - 2, "#e23a3a");
  pset(ctx, gx + 4, gy - 1, "#e23a3a");
  pset(ctx, gx + 3, gy, "#e23a3a");
  pset(ctx, gx + 4, gy - 2, "#e23a3a");
  pset(ctx, gx + 2, gy, "#e23a3a");
}


export function drawCaptain(ctx: Ctx, x: number, y: number) {
  // Like drawPerson but with tricornio + parche + barba + chaqueta roja
  const gcx = x / PX, gcy = y / PX;
  const skin = "#f3c79a";
  const coat = "#8a1a1a";
  const coatTrim = "#f0c842";

  pellipse(ctx, gcx, gcy + 9, 6, 2, "rgba(0,0,0,0.32)");
  // legs (boots)
  prect(ctx, gcx - 3, gcy + 4, 2, 4, "#3a2a14");
  prect(ctx, gcx + 1, gcy + 4, 2, 4, "#3a2a14");
  prect(ctx, gcx - 3, gcy + 8, 3, 1, "#1a1a1a");
  prect(ctx, gcx + 1, gcy + 8, 3, 1, "#1a1a1a");
  // coat
  prect(ctx, gcx - 4, gcy - 2, 8, 5, coat);
  prect(ctx, gcx - 4, gcy - 2, 8, 1, "#1a1a1a");
  prect(ctx, gcx - 4, gcy + 2, 8, 1, "#1a1a1a");
  prect(ctx, gcx - 4, gcy - 2, 1, 5, "#1a1a1a");
  prect(ctx, gcx + 3, gcy - 2, 1, 5, "#1a1a1a");
  // gold trim
  prect(ctx, gcx - 4, gcy - 1, 8, 1, coatTrim);
  // belt
  prect(ctx, gcx - 4, gcy + 1, 8, 1, "#3a2a14");
  pset(ctx, gcx, gcy + 1, coatTrim); // buckle
  // arms
  prect(ctx, gcx - 5, gcy - 1, 1, 4, coat);
  prect(ctx, gcx + 4, gcy - 1, 1, 4, coat);
  pset(ctx, gcx - 5, gcy + 3, skin);
  pset(ctx, gcx + 4, gcy + 3, skin);
  // head
  pcircle(ctx, gcx, gcy - 4, 2, skin);
  // beard black
  prect(ctx, gcx - 2, gcy - 3, 5, 1, "#1a1a1a");
  pset(ctx, gcx, gcy - 2, "#1a1a1a");
  // eye + eye patch
  pset(ctx, gcx + 1, gcy - 4, "#1a1a1a");
  prect(ctx, gcx - 2, gcy - 4, 1, 1, "#1a1a1a"); // patch
  prect(ctx, gcx - 3, gcy - 5, 4, 1, "#1a1a1a"); // patch strap
  // tricornio (3-corner hat)
  prect(ctx, gcx - 4, gcy - 7, 9, 2, "#1a1a1a");
  pset(ctx, gcx - 4, gcy - 8, "#1a1a1a");
  pset(ctx, gcx, gcy - 9, "#1a1a1a");
  pset(ctx, gcx + 4, gcy - 8, "#1a1a1a");
  // gold trim on hat
  prect(ctx, gcx - 3, gcy - 6, 7, 1, "#f0c842");
  // hook hand (right)
  pset(ctx, gcx + 5, gcy + 3, "#bcbcc4");
}


export function drawParrot(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pset(ctx, gx, gy + 3, "rgba(0,0,0,0.3)");
  // body red
  prect(ctx, gx - 2, gy - 1, 4, 4, "#e23a3a");
  prect(ctx, gx - 2, gy + 2, 4, 1, "#a82a2a");
  // wing
  prect(ctx, gx - 2, gy, 1, 2, "#3a78c9");
  prect(ctx, gx + 1, gy, 1, 2, "#3aa86a");
  // head
  pcircle(ctx, gx - 2, gy - 2, 1, "#e23a3a");
  pset(ctx, gx - 3, gy - 2, "#f0c842");
  // beak
  pset(ctx, gx - 4, gy - 1, "#f0c842");
  pset(ctx, gx - 4, gy - 2, "#e8853a");
  // eye
  pset(ctx, gx - 2, gy - 2, "#1a1a1a");
  // tail
  pset(ctx, gx + 3, gy, "#3a78c9");
  pset(ctx, gx + 3, gy + 1, "#3aa86a");
  pset(ctx, gx + 4, gy, "#f0c842");
  // feet
  pset(ctx, gx - 1, gy + 3, "#7a4a22");
  pset(ctx, gx + 1, gy + 3, "#7a4a22");
}


export function drawBarrel(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 5, 1, "rgba(0,0,0,0.4)");
  prect(ctx, gx - 4, gy - 4, 9, 9, "#a87a4a");
  for (let xx = gx - 3; xx <= gx + 4; xx += 2) {
    prect(ctx, xx, gy - 4, 1, 9, "#7a4a22");
  }
  prect(ctx, gx - 4, gy - 3, 9, 1, "#3a3a44");
  prect(ctx, gx - 4, gy + 2, 9, 1, "#3a3a44");
  prect(ctx, gx - 4, gy - 4, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy + 4, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy - 4, 1, 9, "#1a1a1a");
  prect(ctx, gx + 4, gy - 4, 1, 9, "#1a1a1a");
  pellipse(ctx, gx, gy - 4, 4, 1, "#c89a5a");
  pset(ctx, gx, gy - 4, "#5a3a1a");
}


export function drawRopeCoil(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 1, 4, 1, "rgba(0,0,0,0.4)");
  pcircle(ctx, gx, gy, 4, "#a87a4a");
  pcircle(ctx, gx, gy, 3, "#7a4a22");
  pcircle(ctx, gx, gy, 2, "#a87a4a");
  pcircle(ctx, gx, gy, 1, "#7a4a22");
  pset(ctx, gx - 3, gy, "#5a3a1a");
  pset(ctx, gx + 3, gy, "#5a3a1a");
  pset(ctx, gx, gy - 3, "#5a3a1a");
  pset(ctx, gx, gy + 3, "#5a3a1a");
}


export function drawLantern(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 3, 1, "rgba(0,0,0,0.4)");
  prect(ctx, gx - 2, gy - 5, 5, 1, "#3a3a3a");
  prect(ctx, gx - 1, gy - 6, 3, 1, "#3a3a3a");
  pset(ctx, gx, gy - 7, "#3a3a3a");
  prect(ctx, gx - 2, gy - 4, 5, 5, "#f0c842");
  prect(ctx, gx - 1, gy - 3, 3, 3, "#fff09a");
  pset(ctx, gx, gy - 2, "#ffffff");
  prect(ctx, gx - 2, gy - 4, 1, 5, "#3a3a3a");
  prect(ctx, gx + 2, gy - 4, 1, 5, "#3a3a3a");
  prect(ctx, gx, gy - 4, 1, 5, "#3a3a3a");
  prect(ctx, gx - 2, gy, 5, 1, "#3a3a3a");
}


export function drawAnchor(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 7, 5, 1, "rgba(0,0,0,0.4)");
  pcircle(ctx, gx, gy - 5, 2, "#5a5a66");
  pset(ctx, gx, gy - 5, "#3a3a44");
  prect(ctx, gx, gy - 3, 1, 8, "#5a5a66");
  prect(ctx, gx - 3, gy - 2, 7, 1, "#5a5a66");
  prect(ctx, gx - 4, gy + 4, 2, 1, "#5a5a66");
  prect(ctx, gx + 3, gy + 4, 2, 1, "#5a5a66");
  pset(ctx, gx - 4, gy + 3, "#5a5a66");
  pset(ctx, gx + 4, gy + 3, "#5a5a66");
  pset(ctx, gx - 5, gy + 4, "#3a3a44");
  pset(ctx, gx + 5, gy + 4, "#3a3a44");
  pset(ctx, gx + 1, gy, "#a8a8b2");
}


export function drawSkeleton(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 5, 1, "rgba(0,0,0,0.3)");
  // skull top
  pcircle(ctx, gx, gy - 3, 2, "#f0e8d8");
  // eye sockets
  pset(ctx, gx - 1, gy - 3, "#1a1a1a");
  pset(ctx, gx + 1, gy - 3, "#1a1a1a");
  // nose hole
  pset(ctx, gx, gy - 2, "#1a1a1a");
  // teeth
  pset(ctx, gx - 1, gy - 1, "#1a1a1a");
  pset(ctx, gx + 1, gy - 1, "#1a1a1a");
  // ribcage (vertical bone)
  prect(ctx, gx, gy, 1, 4, "#f0e8d8");
  // ribs (horizontal)
  prect(ctx, gx - 2, gy + 1, 5, 1, "#f0e8d8");
  prect(ctx, gx - 2, gy + 3, 5, 1, "#f0e8d8");
  // arms (sprawled out)
  prect(ctx, gx - 5, gy + 1, 2, 1, "#f0e8d8");
  prect(ctx, gx + 3, gy + 1, 2, 1, "#f0e8d8");
  // hand bones
  pset(ctx, gx - 5, gy, "#f0e8d8");
  pset(ctx, gx + 5, gy, "#f0e8d8");
  // pirate hat next to skeleton (fallen)
  prect(ctx, gx - 3, gy - 5, 4, 1, "#1a1a1a");
  pset(ctx, gx - 1, gy - 6, "#1a1a1a");
}


export function drawIsland(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // sand mound
  pellipse(ctx, gx, gy + 1, 8, 4, "#f0d68a");
  pellipse(ctx, gx, gy, 7, 3, "#e8c878");
  // palm trunk
  prect(ctx, gx, gy - 6, 1, 6, "#7a4a22");
  pset(ctx, gx - 1, gy - 4, "#5a3a1a");
  // palm fronds
  prect(ctx, gx - 4, gy - 7, 9, 1, "#3aa86a");
  prect(ctx, gx - 3, gy - 8, 7, 1, "#3aa86a");
  pset(ctx, gx - 4, gy - 8, "#2a7a3a");
  pset(ctx, gx + 4, gy - 8, "#2a7a3a");
  // coconut
  pset(ctx, gx + 1, gy - 6, "#5a3a1a");
}

// ───────────── Parque acuático props ─────────────

