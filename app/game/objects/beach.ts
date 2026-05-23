import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

// ───────────── Beach props (pixel-art top-down) ─────────────

export function drawUmbrella(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow (offset)
  pcircle(ctx, gx + 2, gy + 2, 9, "rgba(0,0,0,0.3)");
  // canopy
  pcircle(ctx, gx, gy, 9, color);
  // alternating stripe slices — radial wedges via pixel checks
  const r = 9;
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      if (xx * xx + yy * yy <= r * r) {
        const a = Math.atan2(yy, xx);
        const wedge = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 8) % 2;
        if (wedge === 0) pset(ctx, gx + xx, gy + yy, "#ffffff");
      }
    }
  }
  // outline ring
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= r * r && d2 > (r - 1) * (r - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // center pole hub
  pset(ctx, gx, gy, "#1a1a1a");
  pset(ctx, gx, gy + 1, "#5a3a1e");
  pset(ctx, gx, gy + 2, "#5a3a1e");
  pset(ctx, gx, gy + 3, "#5a3a1e");
}


export function drawBeachChair(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow
  prect(ctx, gx - 5, gy + 7, 12, 1, "rgba(0,0,0,0.3)");
  // backrest (raised, darker for shading)
  prect(ctx, gx - 5, gy - 4, 11, 4, color);
  prect(ctx, gx - 5, gy - 4, 11, 1, "#1a1a1a");
  // stripes on backrest
  prect(ctx, gx - 5, gy - 3, 11, 1, "#ffffff");
  prect(ctx, gx - 5, gy - 1, 11, 1, "#ffffff");
  // seat
  prect(ctx, gx - 5, gy + 1, 11, 5, color);
  prect(ctx, gx - 5, gy + 6, 11, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy + 3, 11, 1, "#ffffff");
  // frame
  prect(ctx, gx - 6, gy - 4, 1, 11, "#5a3a3a");
  prect(ctx, gx + 6, gy - 4, 1, 11, "#5a3a3a");
}


export function drawTowel(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // shadow
  prect(ctx, gx + 1, gy + 1, gw, gh, "rgba(0,0,0,0.25)");
  // base
  prect(ctx, gx, gy, gw, gh, color);
  // stripes pattern
  const stripe = "#ffffff";
  for (let yy = gy + 1; yy < gy + gh - 1; yy += 3) {
    prect(ctx, gx + 1, yy, gw - 2, 1, stripe);
  }
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
}


export function drawTent(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 7, 11, 2, "rgba(0,0,0,0.3)");
  // dome (half-circle look from top — full circle here w/ door)
  pcircle(ctx, gx, gy, 9, color);
  // door (dark wedge front-bottom)
  prect(ctx, gx - 3, gy + 2, 6, 5, "#1a1a1a");
  prect(ctx, gx - 2, gy + 3, 4, 4, "#3a2a2a");
  // outline ring
  const r = 9;
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= r * r && d2 > (r - 1) * (r - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // top vent
  pset(ctx, gx, gy - r + 1, "#fff");
}


export function drawSandcastle(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const sand = "#e8c878";
  const sandShade = "#b8945a";
  // shadow
  prect(ctx, gx - 5, gy + 6, 12, 1, "rgba(0,0,0,0.3)");
  // base square
  prect(ctx, gx - 6, gy - 1, 13, 7, sand);
  prect(ctx, gx - 6, gy + 4, 13, 2, sandShade);
  // turrets (4 corners + center)
  prect(ctx, gx - 6, gy - 4, 3, 4, sand);
  prect(ctx, gx + 4, gy - 4, 3, 4, sand);
  prect(ctx, gx - 1, gy - 5, 3, 5, sand);
  // turret crenellations (top)
  pset(ctx, gx - 6, gy - 5, sand); pset(ctx, gx - 4, gy - 5, sand);
  pset(ctx, gx + 4, gy - 5, sand); pset(ctx, gx + 6, gy - 5, sand);
  pset(ctx, gx - 1, gy - 6, sand); pset(ctx, gx + 1, gy - 6, sand);
  // door (dark arch in middle)
  prect(ctx, gx - 1, gy + 2, 3, 4, "#3a2a14");
  pset(ctx, gx, gy + 1, "#3a2a14");
  // flag on center turret
  prect(ctx, gx, gy - 8, 1, 2, "#5a3a1e");
  prect(ctx, gx + 1, gy - 8, 2, 1, "#e23a3a");
  // outline base
  prect(ctx, gx - 6, gy - 1, 13, 1, "#7a5a2a");
  prect(ctx, gx - 6, gy + 5, 13, 1, "#7a5a2a");
}


export function drawBeachBall(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const r = 4;
  // shadow
  pellipse(ctx, gx, gy + 4, 4, 1, "rgba(0,0,0,0.35)");
  // ball — wedges of color
  const colors = ["#e83a3a", "#ffffff", "#3a78c9", "#f0c842", "#3aa86a", "#ffffff"];
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      if (xx * xx + yy * yy <= r * r) {
        const a = Math.atan2(yy, xx);
        const wedge = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 6);
        pset(ctx, gx + xx, gy + yy, colors[wedge % colors.length]);
      }
    }
  }
  // outline
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= r * r && d2 > (r - 1) * (r - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // highlight
  pset(ctx, gx - 1, gy - 2, "#ffffff");
}


export function drawFloatie(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  const R = 7, r = 3;
  // shadow
  pellipse(ctx, gx + 1, gy + 1, R, R - 2, "rgba(0,0,0,0.25)");
  // donut: outer disc minus inner hole
  for (let yy = -R; yy <= R; yy++) {
    for (let xx = -R; xx <= R; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= R * R && d2 >= r * r) {
        pset(ctx, gx + xx, gy + yy, color);
      }
    }
  }
  // outline outer
  for (let yy = -R; yy <= R; yy++) {
    for (let xx = -R; xx <= R; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= R * R && d2 > (R - 1) * (R - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // outline inner hole
  for (let yy = -R; yy <= R; yy++) {
    for (let xx = -R; xx <= R; xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 >= r * r && d2 < (r + 1) * (r + 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
  // sprinkles / spots
  pset(ctx, gx - 4, gy - 2, "#ffffff");
  pset(ctx, gx + 3, gy + 3, "#ffffff");
  pset(ctx, gx + 4, gy - 3, "#ffffff");
  pset(ctx, gx - 3, gy + 4, "#ffffff");
}


export function drawSurfboard(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  // shadow at base
  pellipse(ctx, gx, gy + 13, 4, 1, "rgba(0,0,0,0.35)");
  // board vertical (stuck in sand) — narrow oval
  for (let yy = -12; yy <= 12; yy++) {
    const rx = yy < -8 || yy > 10 ? 1 : 2;
    prect(ctx, gx - rx, gy + yy, rx * 2 + 1, 1, color);
  }
  // stripe down middle
  prect(ctx, gx, gy - 8, 1, 18, "#ffffff");
  // tail fin hint
  pset(ctx, gx, gy + 11, "#1a1a1a");
  // outline edges
  pset(ctx, gx - 2, gy - 6, "#1a1a1a"); pset(ctx, gx + 2, gy - 6, "#1a1a1a");
  pset(ctx, gx - 2, gy + 8, "#1a1a1a"); pset(ctx, gx + 2, gy + 8, "#1a1a1a");
  pset(ctx, gx, gy - 12, "#1a1a1a");
}


export function drawShell(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const p = "#f8d8b0";
  const ps = "#d8a878";
  // fan shape (scallop)
  prect(ctx, gx - 2, gy - 1, 5, 1, p);
  prect(ctx, gx - 3, gy, 7, 1, p);
  prect(ctx, gx - 3, gy + 1, 7, 1, p);
  pset(ctx, gx - 3, gy + 1, ps); pset(ctx, gx + 3, gy + 1, ps);
  // ridges
  pset(ctx, gx - 2, gy + 1, ps);
  pset(ctx, gx, gy + 1, ps);
  pset(ctx, gx + 2, gy + 1, ps);
  // hinge
  pset(ctx, gx, gy - 2, ps);
}


export function drawStarfish(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const c = "#e88a3a";
  const cs = "#b85a1a";
  // 5-point star pixel approximation
  // center
  prect(ctx, gx - 1, gy - 1, 3, 3, c);
  // arms
  pset(ctx, gx, gy - 3, c); pset(ctx, gx, gy - 4, c);
  pset(ctx, gx, gy + 3, c); pset(ctx, gx, gy + 4, c);
  pset(ctx, gx - 3, gy + 1, c); pset(ctx, gx - 4, gy + 2, c);
  pset(ctx, gx + 3, gy + 1, c); pset(ctx, gx + 4, gy + 2, c);
  pset(ctx, gx - 3, gy - 1, c); pset(ctx, gx + 3, gy - 1, c);
  // dots
  pset(ctx, gx, gy, "#ffffff");
  pset(ctx, gx - 1, gy - 1, cs);
  pset(ctx, gx + 1, gy + 1, cs);
}


export function drawLifeguardTower(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  prect(ctx, gx - 6, gy + 8, 14, 1, "rgba(0,0,0,0.35)");
  // legs (4 corners of base)
  prect(ctx, gx - 6, gy - 2, 1, 10, "#7a4a22");
  prect(ctx, gx + 6, gy - 2, 1, 10, "#7a4a22");
  prect(ctx, gx - 6, gy - 2, 13, 1, "#5a3a1e");
  // hut body (white with red trim)
  prect(ctx, gx - 5, gy - 8, 11, 7, "#ffffff");
  prect(ctx, gx - 5, gy - 8, 11, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy - 1, 11, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy - 8, 1, 8, "#1a1a1a");
  prect(ctx, gx + 5, gy - 8, 1, 8, "#1a1a1a");
  // red stripe
  prect(ctx, gx - 4, gy - 6, 9, 2, "#e23a3a");
  // window
  prect(ctx, gx - 3, gy - 3, 7, 2, "#5aa6e8");
  prect(ctx, gx - 3, gy - 3, 7, 1, "#1a1a1a");
  // roof (red triangle pixel)
  prect(ctx, gx - 5, gy - 10, 11, 2, "#e23a3a");
  prect(ctx, gx - 4, gy - 11, 9, 1, "#e23a3a");
  prect(ctx, gx - 2, gy - 12, 5, 1, "#e23a3a");
  prect(ctx, gx - 5, gy - 10, 11, 1, "#1a1a1a");
  // flag pole
  prect(ctx, gx, gy - 14, 1, 3, "#5a3a1e");
  prect(ctx, gx + 1, gy - 14, 3, 2, "#e23a3a");
}

// ───────────── Supermarket props (top-down) ─────────────

