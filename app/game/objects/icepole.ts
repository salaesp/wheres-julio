import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

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

