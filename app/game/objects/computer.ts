import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

// ───────────── Computadora props ─────────────

export function drawCPU(ctx: Ctx, x: number, y: number, size: number) {
  const gx = x / PX, gy = y / PX, gs = size / PX;
  prect(ctx, gx + 1, gy + 1, gs, gs, "rgba(0,0,0,0.5)");
  // socket (dark)
  prect(ctx, gx - 2, gy - 2, gs + 4, gs + 4, "#1a1a1a");
  // chip body
  prect(ctx, gx, gy, gs, gs, "#3a3a44");
  // gold pad center
  const padW = Math.floor(gs * 0.7);
  const padOff = Math.floor((gs - padW) / 2);
  prect(ctx, gx + padOff, gy + padOff, padW, padW, "#f0c842");
  prect(ctx, gx + padOff, gy + padOff, padW, 1, "#a87a3a");
  prect(ctx, gx + padOff, gy + padOff + padW - 1, padW, 1, "#a87a3a");
  // text-like circuit pattern on gold
  for (let yy = gy + padOff + 2; yy < gy + padOff + padW - 2; yy += 3) {
    for (let xx = gx + padOff + 2; xx < gx + padOff + padW - 2; xx += 2) {
      if (((xx * 7 + yy * 11) & 3) === 0) pset(ctx, xx, yy, "#c89a3a");
    }
  }
  // notched corner (orientation mark)
  prect(ctx, gx + 1, gy + 1, 3, 3, "#f0c842");
  // pins around edges
  for (let i = 2; i < gs - 1; i += 2) {
    pset(ctx, gx + i, gy - 1, "#bcbcc4");
    pset(ctx, gx + i, gy + gs, "#bcbcc4");
    pset(ctx, gx - 1, gy + i, "#bcbcc4");
    pset(ctx, gx + gs, gy + i, "#bcbcc4");
  }
  // outline
  prect(ctx, gx, gy, gs, 1, "#1a1a1a");
  prect(ctx, gx, gy + gs - 1, gs, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gs, "#1a1a1a");
  prect(ctx, gx + gs - 1, gy, 1, gs, "#1a1a1a");
  // tiny status LED corner
  pset(ctx, gx + gs - 3, gy + 2, "#3aa86a");
  pset(ctx, gx + gs - 3, gy + 4, "#e23a3a");
}


export function drawRAMStick(ctx: Ctx, x: number, y: number, h: number) {
  const gx = x / PX, gy = y / PX, gh = h / PX;
  prect(ctx, gx + 1, gy + 1, 12, gh, "rgba(0,0,0,0.4)");
  // PCB green
  prect(ctx, gx, gy, 12, gh, "#1a5a2a");
  // outline
  prect(ctx, gx, gy, 12, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, 12, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + 11, gy, 1, gh, "#1a1a1a");
  // chips on stick (8 small black rects)
  for (let i = 0; i < 8; i++) {
    const cy = gy + 2 + i * Math.floor((gh - 4) / 8);
    prect(ctx, gx + 2, cy, 8, 2, "#1a1a1a");
    prect(ctx, gx + 2, cy, 8, 1, "#3a3a44");
    // label dot
    pset(ctx, gx + 5, cy + 1, "#ffffff");
  }
  // gold contact pins at bottom edge
  for (let i = 0; i < 6; i++) {
    pset(ctx, gx + 1 + i * 2, gy + gh - 1, "#f0c842");
  }
  // notch
  pset(ctx, gx + 6, gy + gh - 1, "#1a5a2a");
  pset(ctx, gx + 7, gy + gh - 1, "#1a5a2a");
  // sticker label
  prect(ctx, gx + 2, gy + 1, 8, 2, "#ffffff");
}


export function drawCable(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string) {
  // Catmull-ish curve drawn as series of pixels with sag
  const sag = 18;
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x1 + (x2 - x1) * t;
    const cy = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag;
    // draw 3px thick segment on grid
    const gx = Math.floor(cx / PX);
    const gy = Math.floor(cy / PX);
    pset(ctx, gx, gy, "#1a1a1a");
    pset(ctx, gx, gy + 1, color);
    pset(ctx, gx + 1, gy + 1, color);
    pset(ctx, gx + 1, gy + 2, "#1a1a1a");
  }
  // connectors at ends
  const g1x = Math.floor(x1 / PX), g1y = Math.floor(y1 / PX);
  const g2x = Math.floor(x2 / PX), g2y = Math.floor(y2 / PX);
  prect(ctx, g1x - 2, g1y - 1, 4, 3, "#3a3a44");
  prect(ctx, g1x - 2, g1y - 1, 4, 1, "#1a1a1a");
  prect(ctx, g2x - 2, g2y - 1, 4, 3, "#3a3a44");
  prect(ctx, g2x - 2, g2y - 1, 4, 1, "#1a1a1a");
}


export function drawBugDigital(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 4, 1, "rgba(0,0,0,0.4)");
  // body red oval
  pellipse(ctx, gx, gy, 4, 3, "#e23a3a");
  // body shading
  pellipse(ctx, gx, gy - 1, 3, 2, "#f06a6a");
  // black spots
  pset(ctx, gx - 2, gy - 1, "#1a1a1a");
  pset(ctx, gx + 1, gy, "#1a1a1a");
  pset(ctx, gx, gy + 1, "#1a1a1a");
  // center line
  prect(ctx, gx, gy - 2, 1, 5, "#1a1a1a");
  // head
  pcircle(ctx, gx - 4, gy, 1, "#1a1a1a");
  // antennae
  pset(ctx, gx - 5, gy - 2, "#1a1a1a");
  pset(ctx, gx - 5, gy + 1, "#1a1a1a");
  // legs (3 each side)
  pset(ctx, gx - 3, gy - 2, "#1a1a1a");
  pset(ctx, gx - 1, gy - 3, "#1a1a1a");
  pset(ctx, gx + 1, gy - 2, "#1a1a1a");
  pset(ctx, gx - 3, gy + 2, "#1a1a1a");
  pset(ctx, gx - 1, gy + 3, "#1a1a1a");
  pset(ctx, gx + 1, gy + 2, "#1a1a1a");
}


export function drawRobotAnt(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 4, 1, "rgba(0,0,0,0.4)");
  // 3 body segments metal
  pcircle(ctx, gx - 3, gy, 2, "#bcbcc4");
  pcircle(ctx, gx, gy, 2, "#a8a8b2");
  pcircle(ctx, gx + 3, gy, 2, "#8a8a98");
  // antenna with red LED
  pset(ctx, gx - 4, gy - 3, "#3a3a44");
  pset(ctx, gx - 4, gy - 4, "#e23a3a");
  // eyes (blue LEDs on head)
  pset(ctx, gx - 4, gy, "#5aa6e8");
  pset(ctx, gx - 3, gy - 1, "#5aa6e8");
  // joints (highlights)
  pset(ctx, gx - 3, gy, "#ffffff");
  pset(ctx, gx, gy, "#ffffff");
  pset(ctx, gx + 3, gy, "#ffffff");
  // legs (mechanical pixel sticks)
  pset(ctx, gx - 2, gy + 2, "#3a3a44");
  pset(ctx, gx, gy + 2, "#3a3a44");
  pset(ctx, gx + 2, gy + 2, "#3a3a44");
  pset(ctx, gx - 2, gy - 2, "#3a3a44");
  pset(ctx, gx, gy - 2, "#3a3a44");
  pset(ctx, gx + 2, gy - 2, "#3a3a44");
  // outlines
  pset(ctx, gx - 5, gy, "#1a1a1a");
  pset(ctx, gx + 5, gy, "#1a1a1a");
}


