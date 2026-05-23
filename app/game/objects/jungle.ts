import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

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

