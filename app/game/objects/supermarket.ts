import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

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

// GBA-style barn — saturated red with darker roof band, white cross trim,
// double doors at the front and a hayloft window. Slight angled feel.
