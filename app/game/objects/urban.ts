import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

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


// GBA-style park bench — wooden slats with brighter highlight band,
// darker shadow at the base, and visible metal legs at the ends.
export function drawBench(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  const OUTLINE = "#1a1a1a";
  const WOOD = "#9a6a32";
  const WOOD_DARK = "#5a3a1a";
  const WOOD_LIGHT = "#c89a5a";

  // shadow
  prect(ctx, gx + 1, gy + 5, gw, 1, "rgba(0,0,0,0.4)");
  // main slat body
  prect(ctx, gx, gy, gw, 5, WOOD);
  // top highlight band
  prect(ctx, gx + 1, gy + 1, gw - 2, 1, WOOD_LIGHT);
  // slat divider
  prect(ctx, gx, gy + 2, gw, 1, WOOD_DARK);
  // bottom edge
  prect(ctx, gx, gy + 4, gw, 1, WOOD_DARK);
  // outline (all sides)
  prect(ctx, gx, gy, gw, 1, OUTLINE);
  prect(ctx, gx, gy + 4, gw, 1, OUTLINE);
  prect(ctx, gx - 1, gy, 1, 5, OUTLINE);
  prect(ctx, gx + gw, gy, 1, 5, OUTLINE);
  // metal legs (poking down at ends)
  prect(ctx, gx + 1, gy + 5, 1, 2, OUTLINE);
  prect(ctx, gx + gw - 2, gy + 5, 1, 2, OUTLINE);
}

// GBA-style hedge — bumpy rounded top (looks like a row of bushes) with
// dark outline, darker base and bright top highlights. The bump pattern
// matches the canopy style for visual consistency.

// GBA-style hedge — bumpy rounded top (looks like a row of bushes) with
// dark outline, darker base and bright top highlights. The bump pattern
// matches the canopy style for visual consistency.
export function drawHedge(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  const OUTLINE = "#163a16";
  const DARK = "#2a6a2a";
  const MID = "#3f9d4a";
  const LIGHT = "#7adf6a";
  const HIGH = "#b8ec88";

  // shadow under hedge
  prect(ctx, gx + 1, gy + gh, gw, 1, "rgba(0,0,0,0.35)");
  // body
  prect(ctx, gx, gy + 1, gw, gh - 1, DARK);
  // bumpy top — alternating tall/short rounded bumps
  for (let xx = gx; xx < gx + gw; xx += 3) {
    pcircle(ctx, xx + 1, gy + 1, 2, DARK);
    pcircle(ctx, xx + 1, gy + 1, 1, MID);
  }
  // mid-tone inset along the body
  prect(ctx, gx + 1, gy + 2, gw - 2, Math.max(1, gh - 3), MID);
  // light tufts scattered along top
  for (let xx = gx + 1; xx < gx + gw - 1; xx += 3) {
    pset(ctx, xx, gy + 1, LIGHT);
    if (((xx * 11) & 3) === 0) pset(ctx, xx + 1, gy, HIGH);
  }
  // outline ring (top bumps + sides + bottom)
  for (let xx = gx; xx < gx + gw; xx++) {
    // top outline follows bump silhouette: every 3px ring goes one px higher
    const above = (((xx - gx) % 3) === 1) ? -1 : 0;
    pset(ctx, xx, gy + above, OUTLINE);
  }
  prect(ctx, gx, gy + gh - 1, gw, 1, OUTLINE);
  prect(ctx, gx - 1, gy + 1, 1, gh - 1, OUTLINE);
  prect(ctx, gx + gw, gy + 1, 1, gh - 1, OUTLINE);
}

// GBA-style fountain — stone basin with dark outline, blue water, white
// foam ring around the central spout. Reads as a town-square fountain.

// GBA-style fountain — stone basin with dark outline, blue water, white
// foam ring around the central spout. Reads as a town-square fountain.
export function drawFountain(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX, gr = r / PX;
  const OUTLINE = "#1a1a1a";
  const STONE = "#bcbcc4";
  const STONE_DARK = "#7a7a84";
  const WATER = "#3a8ad8";
  const WATER_LIGHT = "#7ac2ee";
  const FOAM = "#ffffff";

  // shadow under basin
  pcircle(ctx, gx + 1, gy + 2, gr, "rgba(0,0,0,0.35)");
  // outer stone ring (outline)
  pcircle(ctx, gx, gy, gr + 1, OUTLINE);
  pcircle(ctx, gx, gy, gr, STONE);
  // darker bottom-right stone shading
  pcircle(ctx, gx + 1, gy + 1, gr, STONE_DARK);
  pcircle(ctx, gx, gy, gr - 1, STONE);
  // water rim outline
  pcircle(ctx, gx, gy, gr - 1, OUTLINE);
  pcircle(ctx, gx, gy, gr - 2, WATER);
  // water highlight (top-left lighter band)
  pcircle(ctx, gx - 1, gy - 1, Math.max(1, Math.round(gr * 0.55)), WATER_LIGHT);
  // central spout (stone column)
  pcircle(ctx, gx, gy, Math.max(2, Math.round(gr * 0.25)), OUTLINE);
  pcircle(ctx, gx, gy, Math.max(1, Math.round(gr * 0.18)), STONE);
  // foam splash dots around spout
  pset(ctx, gx, gy - 3, FOAM);
  pset(ctx, gx + 2, gy - 2, FOAM);
  pset(ctx, gx - 2, gy + 1, FOAM);
  pset(ctx, gx + 2, gy + 2, FOAM);
  pset(ctx, gx - 2, gy - 1, FOAM);
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

// GBA route path — light sandy tone with a soft darker edge and small
// pebble speckles. Avoids a hard outline so it blends into grass like a
// real Pokémon route tile.

// ───────────── Playground props ─────────────

// GBA route path — light sandy tone with a soft darker edge and small
// pebble speckles. Avoids a hard outline so it blends into grass like a
// real Pokémon route tile.
export function drawPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  const BASE = "#e3cfa1";
  const EDGE = "#b39866";
  const SPEC = "#c9b27a";
  const HI = "#f1dfb6";
  prect(ctx, gx, gy, gw, gh, BASE);
  // soft inner edge band
  prect(ctx, gx, gy, gw, 1, EDGE);
  prect(ctx, gx, gy + gh - 1, gw, 1, EDGE);
  prect(ctx, gx, gy, 1, gh, EDGE);
  prect(ctx, gx + gw - 1, gy, 1, gh, EDGE);
  // pebble + highlight speckle
  for (let yy = gy + 2; yy < gy + gh - 2; yy += 3) {
    for (let xx = gx + 2; xx < gx + gw - 2; xx += 3) {
      const k = (xx * 31 + yy * 17) >>> 0;
      if ((k & 5) === 0) pset(ctx, xx, yy, SPEC);
      if ((k & 9) === 0) pset(ctx, xx + 1, yy + 1, HI);
    }
  }
}

