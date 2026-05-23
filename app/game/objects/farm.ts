import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

// ───────────── Farm props (top-down) ─────────────

// GBA-style barn — saturated red with darker roof band, white cross trim,
// double doors at the front and a hayloft window. Slight angled feel.
export function drawBarn(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  const OUTLINE = "#1a1a1a";
  const RED = "#d8403a";
  const RED_DARK = "#8a1a1a";
  const RED_LIGHT = "#f8604a";
  const WHITE = "#ffffff";

  prect(ctx, gx + 2, gy + 2, gw, gh, "rgba(0,0,0,0.35)");

  // ── Roof band (top portion, slightly darker) ──
  const roofH = Math.max(3, Math.floor(gh * 0.3));
  prect(ctx, gx, gy, gw, gh, RED);
  prect(ctx, gx, gy, gw, roofH, RED_DARK);
  // bright ridge highlight
  prect(ctx, gx + 1, gy + 1, gw - 2, 1, RED_LIGHT);
  // shingle stripes on roof
  for (let yy = gy + 2; yy < gy + roofH; yy += 2) {
    prect(ctx, gx + 1, yy, gw - 2, 1, "#6a1212");
  }
  // hayloft window inset into roof
  const lhw = 4, lhh = roofH - 2;
  const lhx = gx + Math.floor(gw / 2) - 2;
  const lhy = gy + 1;
  if (lhh >= 1) {
    prect(ctx, lhx, lhy, lhw, lhh, "#2a1a14");
    prect(ctx, lhx, lhy, lhw, 1, OUTLINE);
    prect(ctx, lhx, lhy + lhh, lhw, 1, OUTLINE);
    prect(ctx, lhx, lhy, 1, lhh, OUTLINE);
    prect(ctx, lhx + lhw - 1, lhy, 1, lhh, OUTLINE);
    // window cross
    pset(ctx, lhx + 1, lhy, OUTLINE);
    pset(ctx, lhx + 2, lhy, OUTLINE);
  }

  // ── Double barn doors (centered, bottom) ──
  const dw = 6, dh = Math.max(4, gh - roofH - 2);
  const ddx = gx + Math.floor(gw / 2) - 3;
  const ddy = gy + gh - dh - 1;
  prect(ctx, ddx, ddy, dw, dh, "#6a2a1a");
  // door cross trim (white X)
  prect(ctx, ddx, ddy + Math.floor(dh / 2), dw, 1, WHITE);
  prect(ctx, ddx + Math.floor(dw / 2) - 1, ddy, 1, dh, WHITE);
  // door split (vertical line down middle)
  prect(ctx, ddx + Math.floor(dw / 2), ddy, 1, dh, OUTLINE);
  // door outline
  prect(ctx, ddx, ddy, dw, 1, OUTLINE);
  prect(ctx, ddx, ddy, 1, dh, OUTLINE);
  prect(ctx, ddx + dw - 1, ddy, 1, dh, OUTLINE);

  // ── White trim around walls ──
  prect(ctx, gx + 1, gy + roofH, gw - 2, 1, WHITE);

  // ── Outline ──
  prect(ctx, gx, gy, gw, 1, OUTLINE);
  prect(ctx, gx, gy + gh - 1, gw, 1, OUTLINE);
  prect(ctx, gx, gy, 1, gh, OUTLINE);
  prect(ctx, gx + gw - 1, gy, 1, gh, OUTLINE);

  // ── Weather vane (rooster + arrow) ──
  prect(ctx, gx + Math.floor(gw / 2), gy - 4, 1, 4, "#3a2a1a");
  pset(ctx, gx + Math.floor(gw / 2) - 1, gy - 4, "#3a2a1a");
  pset(ctx, gx + Math.floor(gw / 2) + 1, gy - 4, "#3a2a1a");
  pset(ctx, gx + Math.floor(gw / 2) - 2, gy - 4, "#f4d24a");
  pset(ctx, gx + Math.floor(gw / 2) + 2, gy - 4, "#f4d24a");
}

// GBA-style farmhouse — wood walls with a tall sloped red shingle roof
// and a small blue door + window. Reads like a Pokémon route cottage
// from a slightly angled top-down view.

// GBA-style farmhouse — wood walls with a tall sloped red shingle roof
// and a small blue door + window. Reads like a Pokémon route cottage
// from a slightly angled top-down view.
export function drawFarmhouse(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  const OUTLINE = "#1a1a1a";
  const ROOF = "#c8482a";
  const ROOF_DARK = "#8a2a1a";
  const ROOF_LIGHT = "#e8704a";
  const WALL = "#e8c89a";
  const WALL_SHADE = "#b89464";
  const DOOR = "#2a6abf";
  const DOOR_DARK = "#1a4a8a";
  const WIN = "#a8d8ff";

  prect(ctx, gx + 2, gy + 2, gw, gh, "rgba(0,0,0,0.3)");

  // ── Roof — slightly larger than walls, with shingle bands ──
  const roofH = Math.max(4, Math.floor(gh * 0.45));
  prect(ctx, gx, gy, gw, roofH, ROOF);
  // bright top band (light catches the ridge)
  prect(ctx, gx + 1, gy + 1, gw - 2, 1, ROOF_LIGHT);
  // darker shingle bands
  for (let yy = gy + 3; yy < gy + roofH; yy += 2) {
    prect(ctx, gx, yy, gw, 1, ROOF_DARK);
  }
  // roof outline
  prect(ctx, gx, gy, gw, 1, OUTLINE);
  prect(ctx, gx, gy, 1, roofH, OUTLINE);
  prect(ctx, gx + gw - 1, gy, 1, roofH, OUTLINE);
  prect(ctx, gx, gy + roofH, gw, 1, OUTLINE);

  // ── Wall body ──
  const wallY = gy + roofH + 1;
  const wallH = gh - roofH - 1;
  prect(ctx, gx + 1, wallY, gw - 2, wallH, WALL);
  // right wall shade
  prect(ctx, gx + gw - 2, wallY, 1, wallH, WALL_SHADE);
  // outline walls
  prect(ctx, gx, wallY, 1, wallH, OUTLINE);
  prect(ctx, gx + gw - 1, wallY, 1, wallH, OUTLINE);
  prect(ctx, gx, wallY + wallH - 1, gw, 1, OUTLINE);

  // ── Door (centered) ──
  const dw = 3;
  const dh = Math.max(3, wallH - 2);
  const dx = gx + Math.floor(gw / 2) - 1;
  const dy = wallY + (wallH - dh);
  prect(ctx, dx, dy, dw, dh, DOOR);
  prect(ctx, dx, dy, 1, dh, DOOR_DARK);
  prect(ctx, dx, dy, dw, 1, OUTLINE);
  prect(ctx, dx - 1, dy, 1, dh, OUTLINE);
  prect(ctx, dx + dw, dy, 1, dh, OUTLINE);
  // door knob
  pset(ctx, dx + dw - 1, dy + Math.floor(dh / 2), "#f4d24a");

  // ── Windows (flanking the door) ──
  if (gw >= 12) {
    const wy = wallY + 1;
    prect(ctx, gx + 2, wy, 2, 2, WIN);
    prect(ctx, gx + gw - 4, wy, 2, 2, WIN);
    // window frames
    prect(ctx, gx + 2, wy, 2, 1, OUTLINE);
    prect(ctx, gx + 2, wy + 2, 2, 1, OUTLINE);
    prect(ctx, gx + 1, wy, 1, 2, OUTLINE);
    prect(ctx, gx + 4, wy, 1, 2, OUTLINE);
    prect(ctx, gx + gw - 4, wy, 2, 1, OUTLINE);
    prect(ctx, gx + gw - 4, wy + 2, 2, 1, OUTLINE);
    prect(ctx, gx + gw - 5, wy, 1, 2, OUTLINE);
    prect(ctx, gx + gw - 2, wy, 1, 2, OUTLINE);
  }

  // ── Chimney (with little smoke puff) ──
  prect(ctx, gx + gw - 5, gy - 3, 2, 4, "#7a4a3a");
  prect(ctx, gx + gw - 5, gy - 3, 2, 1, OUTLINE);
  prect(ctx, gx + gw - 6, gy - 3, 1, 4, OUTLINE);
  prect(ctx, gx + gw - 3, gy - 3, 1, 4, OUTLINE);
  // smoke
  pset(ctx, gx + gw - 4, gy - 5, "#dcdce4");
  pset(ctx, gx + gw - 3, gy - 6, "#dcdce4");
  pset(ctx, gx + gw - 4, gy - 7, "#dcdce4");
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

// ───────────── Computadora props ─────────────

