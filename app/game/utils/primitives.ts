// Pixel-grid drawing primitives. All shapes snap to PX cells.
export const SPRITE_BASE = 24;
export const SPRITE_SCALE = 3;
export const SPRITE_SIZE = SPRITE_BASE * SPRITE_SCALE; // 72
export const PX = SPRITE_SCALE;

export type Ctx = CanvasRenderingContext2D;

export function pset(ctx: Ctx, gx: number, gy: number, color: string, px = PX) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx) * px, Math.round(gy) * px, px, px);
}

export function prect(
  ctx: Ctx, gx: number, gy: number, gw: number, gh: number, color: string, px = PX,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(gx) * px, Math.round(gy) * px, Math.round(gw) * px, Math.round(gh) * px);
}

export function pcircle(
  ctx: Ctx, cgx: number, cgy: number, rg: number, color: string, px = PX,
) {
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

export function pellipse(
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

export function drawAsciiGrid(
  ctx: Ctx,
  rows: string[],
  palette: Record<string, string | null>,
  ox = 0,
  oy = 0,
  px = PX,
) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = palette[row[x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect((ox + x) * px, (oy + y) * px, px, px);
    }
  }
}
