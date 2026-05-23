import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

export function drawTreeTrunk(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // Trunk sits low under the canopy. GBA trees barely show trunk top-down.
  pellipse(ctx, gx, gy + 1, 3, 1, "rgba(0,0,0,0.35)");
  pellipse(ctx, gx, gy, 2, 1, "#5a3a1e");
  pset(ctx, gx, gy, "#7a4a2a");
}

// GBA Pokémon-style bushy tree canopy.
// Built from overlapping circles so the silhouette is lumpy, with a clear
// dark outline ring, mid-green base, lighter top-left highlight and a few
// bright top blobs — matches the Hoenn/Kanto outdoor tree look.

// GBA Pokémon-style bushy tree canopy.
// Built from overlapping circles so the silhouette is lumpy, with a clear
// dark outline ring, mid-green base, lighter top-left highlight and a few
// bright top blobs — matches the Hoenn/Kanto outdoor tree look.
export function drawTreeCanopy(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX;
  const gr = Math.max(3, r / PX);
  const OUTLINE = "#163a16";
  const DARK = "#2a6a2a";
  const MID = "#3f9d4a";
  const LIGHT = "#7adf6a";
  const HIGH = "#b8ec88";

  // Drop shadow
  pcircle(ctx, gx + 2, gy + 3, gr, "rgba(0,0,0,0.32)");

  // Lumpy silhouette — central blob + 5 bumps around the edge.
  // Each bump is a small circle whose center sits on the canopy edge,
  // giving the GBA "cloud-cluster" look.
  const bumps: [number, number, number][] = [
    [0, 0, gr],                                             // main
    [-gr * 0.7, -gr * 0.3, gr * 0.55],                      // left bump
    [ gr * 0.7, -gr * 0.3, gr * 0.55],                      // right bump
    [-gr * 0.35, -gr * 0.75, gr * 0.55],                    // top-left bump
    [ gr * 0.35, -gr * 0.75, gr * 0.55],                    // top-right bump
    [-gr * 0.35,  gr * 0.7,  gr * 0.5],                     // bottom-left bump
    [ gr * 0.4,   gr * 0.7,  gr * 0.5],                     // bottom-right bump
  ];

  // Pass 1: dark outline (slightly larger) — gives every bump a ring.
  for (const [dx, dy, br] of bumps) {
    pcircle(ctx, gx + dx, gy + dy, br + 1, OUTLINE);
  }
  // Pass 2: dark fill
  for (const [dx, dy, br] of bumps) {
    pcircle(ctx, gx + dx, gy + dy, br, DARK);
  }
  // Pass 3: mid green inset (the bushy body)
  for (const [dx, dy, br] of bumps) {
    pcircle(ctx, gx + dx, gy + dy - 1, Math.max(1, br - 1), MID);
  }
  // Pass 4: light highlight blobs on top-left of each bump
  for (const [dx, dy, br] of bumps) {
    const hr = Math.max(1, Math.round(br * 0.45));
    pcircle(ctx, gx + dx - Math.round(br * 0.25), gy + dy - Math.round(br * 0.35), hr, LIGHT);
  }
  // Pass 5: small bright "sparkle" highlights — gives the painted top-light feel
  pcircle(ctx, gx - Math.round(gr * 0.45), gy - Math.round(gr * 0.6), Math.max(1, Math.round(gr * 0.22)), HIGH);
  pcircle(ctx, gx + Math.round(gr * 0.15), gy - Math.round(gr * 0.7), Math.max(1, Math.round(gr * 0.14)), HIGH);
  pcircle(ctx, gx - Math.round(gr * 0.05), gy - Math.round(gr * 0.25), Math.max(1, Math.round(gr * 0.12)), HIGH);
}

// GBA-style park bench — wooden slats with brighter highlight band,
// darker shadow at the base, and visible metal legs at the ends.

export function drawSandbox(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // wooden frame
  prect(ctx, gx, gy, gw, gh, "#7a4a22");
  // sand inside
  prect(ctx, gx + 2, gy + 2, gw - 4, gh - 4, "#f0d68a");
  // sand speckle
  for (let yy = gy + 3; yy < gy + gh - 3; yy += 3) {
    for (let xx = gx + 3; xx < gx + gw - 3; xx += 3) {
      if (((xx * 7 + yy * 11) & 3) === 0) pset(ctx, xx, yy, "#d4b86a");
    }
  }
  // pala + balde
  // bucket (red)
  prect(ctx, gx + 4, gy + 4, 5, 4, "#c83a3a");
  prect(ctx, gx + 4, gy + 4, 5, 1, "#1a1a1a");
  prect(ctx, gx + 4, gy + 7, 5, 1, "#1a1a1a");
  // shovel (blue)
  prect(ctx, gx + gw - 8, gy + 6, 1, 4, "#3a78c9");
  prect(ctx, gx + gw - 9, gy + 6, 3, 2, "#3a78c9");
  // frame outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
}

// GBA Pokémon-style flower bed — a green leafy patch dotted with red
// rose-bush triplet flowers (3 small petals in a triangle), the iconic
// look of Petalburg/Route flower clumps in Ruby/Sapphire/Emerald.

// GBA Pokémon-style flower bed — a green leafy patch dotted with red
// rose-bush triplet flowers (3 small petals in a triangle), the iconic
// look of Petalburg/Route flower clumps in Ruby/Sapphire/Emerald.
export function drawFlowerbed(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  const LEAF = "#3f9d4a";
  const LEAF_DARK = "#2a6a2a";
  const LEAF_LIGHT = "#7adf6a";
  const OUTLINE = "#163a16";
  const ROSE = "#e23a4a";
  const ROSE_DARK = "#a82838";
  const ROSE_LIGHT = "#ff7a6a";
  const YELLOW = "#f4d24a";
  const PINK = "#f48ab2";
  const WHITE = "#ffffff";

  // Leafy bed base — bumpy outline like the hedge
  prect(ctx, gx, gy + 1, gw, gh - 1, LEAF_DARK);
  prect(ctx, gx + 1, gy + 2, gw - 2, gh - 3, LEAF);
  // Lighter speckles for leaf texture
  for (let yy = gy + 2; yy < gy + gh - 1; yy += 2) {
    for (let xx = gx + 1; xx < gx + gw - 1; xx += 2) {
      const k = (xx * 7 + yy * 11) >>> 0;
      if ((k & 3) === 0) pset(ctx, xx, yy, LEAF_LIGHT);
    }
  }
  // bumpy top outline
  for (let xx = gx; xx < gx + gw; xx++) {
    const above = (((xx - gx) % 3) === 1) ? -1 : 0;
    pset(ctx, xx, gy + above, OUTLINE);
  }
  prect(ctx, gx, gy + gh - 1, gw, 1, OUTLINE);
  prect(ctx, gx - 1, gy + 1, 1, gh - 1, OUTLINE);
  prect(ctx, gx + gw, gy + 1, 1, gh - 1, OUTLINE);

  // Flowers — 3-petal rose clusters scattered across the bed.
  const accent = [ROSE, YELLOW, PINK, WHITE];
  for (let yy = gy + 3; yy < gy + gh - 2; yy += 5) {
    for (let xx = gx + 3; xx < gx + gw - 2; xx += 5) {
      const k = (xx * 31 + yy * 17) >>> 0;
      const col = accent[k % accent.length];
      const dark =
        col === ROSE ? ROSE_DARK :
        col === YELLOW ? "#b8902a" :
        col === PINK ? "#b8527a" : "#b8b8b8";
      const light =
        col === ROSE ? ROSE_LIGHT :
        col === YELLOW ? "#fff086" :
        col === PINK ? "#ffc0d4" : WHITE;
      // 3-petal cluster (triangle)
      pset(ctx, xx, yy - 1, col);
      pset(ctx, xx - 1, yy, col);
      pset(ctx, xx + 1, yy, col);
      // shading
      pset(ctx, xx - 1, yy - 1, dark);
      pset(ctx, xx + 1, yy + 1, dark);
      // highlight
      pset(ctx, xx, yy, light);
    }
  }
}


export function drawSlide(ctx: Ctx, x: number, y: number) {
  // (x, y) is center. Slide ladder on right, slide ramp going left+down.
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx + 1, gy + 16, 9, 3, "rgba(0,0,0,0.35)");

  // platform on top (red)
  prect(ctx, gx + 1, gy - 14, 8, 6, "#c83a3a");
  prect(ctx, gx + 1, gy - 14, 8, 1, "#1a1a1a");
  prect(ctx, gx + 1, gy - 9, 8, 1, "#1a1a1a");
  prect(ctx, gx + 1, gy - 14, 1, 6, "#1a1a1a");
  prect(ctx, gx + 8, gy - 14, 1, 6, "#1a1a1a");

  // ladder (right side)
  prect(ctx, gx + 7, gy - 8, 1, 12, "#7a4a22");
  prect(ctx, gx + 9, gy - 8, 1, 12, "#7a4a22");
  for (let i = 0; i < 4; i++) {
    prect(ctx, gx + 7, gy - 7 + i * 3, 3, 1, "#7a4a22");
  }
  // ladder shadow
  pset(ctx, gx + 9, gy + 4, "#1a1a1a");

  // slide ramp (yellow, going left-down)
  // ramp consists of stepped pixel rect
  const rampColor = "#f0c842";
  const rampShade = "#a87a3a";
  prect(ctx, gx - 8, gy - 6, 9, 2, rampColor);
  prect(ctx, gx - 9, gy - 4, 10, 2, rampColor);
  prect(ctx, gx - 10, gy - 2, 11, 2, rampColor);
  prect(ctx, gx - 11, gy, 12, 2, rampColor);
  prect(ctx, gx - 12, gy + 2, 13, 2, rampColor);
  // side rails
  prect(ctx, gx - 12, gy - 6, 1, 10, rampShade);
  prect(ctx, gx + 1, gy - 6, 1, 10, rampShade);
  // bottom curl
  prect(ctx, gx - 13, gy + 4, 3, 2, rampColor);
  prect(ctx, gx - 13, gy + 4, 1, 2, rampShade);
  // outline ramp top
  prect(ctx, gx - 8, gy - 6, 9, 1, "#1a1a1a");
  prect(ctx, gx - 13, gy + 6, 16, 1, "#1a1a1a");

  // legs
  prect(ctx, gx + 1, gy + 4, 1, 4, "#3a3a3a");
  prect(ctx, gx + 8, gy + 4, 1, 4, "#3a3a3a");
}


export function drawSwingSet(ctx: Ctx, x: number, y: number) {
  // (x,y) center. Two swings hanging from top bar.
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 12, 14, 3, "rgba(0,0,0,0.3)");

  // A-frame legs (left)
  prect(ctx, gx - 12, gy - 8, 1, 18, "#5a3a1e");
  prect(ctx, gx - 10, gy - 8, 1, 18, "#5a3a1e");
  // A-frame legs (right)
  prect(ctx, gx + 10, gy - 8, 1, 18, "#5a3a1e");
  prect(ctx, gx + 12, gy - 8, 1, 18, "#5a3a1e");
  // top bar
  prect(ctx, gx - 12, gy - 9, 25, 2, "#5a3a1e");
  prect(ctx, gx - 12, gy - 9, 25, 1, "#7a4a22");

  // chains
  prect(ctx, gx - 6, gy - 7, 1, 8, "#888");
  prect(ctx, gx - 3, gy - 7, 1, 8, "#888");
  prect(ctx, gx + 3, gy - 7, 1, 8, "#888");
  prect(ctx, gx + 6, gy - 7, 1, 8, "#888");

  // seats
  prect(ctx, gx - 7, gy + 1, 4, 2, "#c83a3a");
  prect(ctx, gx - 7, gy + 1, 4, 1, "#1a1a1a");
  prect(ctx, gx + 3, gy + 1, 4, 2, "#3a78c9");
  prect(ctx, gx + 3, gy + 1, 4, 1, "#1a1a1a");
}


export function drawCarousel(ctx: Ctx, x: number, y: number, r: number) {
  const gx = x / PX, gy = y / PX, gr = r / PX;
  // shadow
  pcircle(ctx, gx + 1, gy + 2, gr, "rgba(0,0,0,0.35)");
  // base platform
  pcircle(ctx, gx, gy, gr, "#3a78c9");
  pcircle(ctx, gx, gy, gr - 1, "#5a98e8");
  pcircle(ctx, gx, gy, gr - 3, "#a8d4f0");

  // colored wedges
  const wedgeColors = ["#e83a3a", "#f0c842", "#3aa86a", "#a85ad4"];
  const slices = 8;
  for (let i = 0; i < slices; i++) {
    const a = (i / slices) * Math.PI * 2;
    const ex = Math.cos(a) * (gr - 4);
    const ey = Math.sin(a) * (gr - 4);
    pcircle(ctx, gx + ex, gy + ey, 2, wedgeColors[i % wedgeColors.length]);
  }
  // center pole + roof (yellow)
  pcircle(ctx, gx, gy, 4, "#f0c842");
  pset(ctx, gx, gy, "#c89a3a");
  // top flag
  prect(ctx, gx, gy - gr - 2, 1, 3, "#5a3a1e");
  prect(ctx, gx + 1, gy - gr - 2, 3, 2, "#e83a3a");
  // horse silhouettes (4 spokes)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
    const hx = gx + Math.cos(a) * (gr - 6);
    const hy = gy + Math.sin(a) * (gr - 6);
    prect(ctx, hx - 1, hy - 1, 2, 2, "#fff");
    pset(ctx, hx - 1, hy - 2, "#fff");
    pset(ctx, hx + 1, hy - 1, "#5a3a1e");
  }
  // outline
  for (let yy = -Math.ceil(gr); yy <= Math.ceil(gr); yy++) {
    for (let xx = -Math.ceil(gr); xx <= Math.ceil(gr); xx++) {
      const d2 = xx * xx + yy * yy;
      if (d2 <= gr * gr && d2 > (gr - 1) * (gr - 1)) {
        pset(ctx, gx + xx, gy + yy, "#1a1a1a");
      }
    }
  }
}


export function drawSeesaw(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 5, 14, 2, "rgba(0,0,0,0.3)");
  // pivot
  prect(ctx, gx - 2, gy - 1, 4, 4, "#5a3a1e");
  prect(ctx, gx - 1, gy, 2, 2, "#7a4a22");
  // plank — slightly tilted (use two halves)
  // left half (down)
  prect(ctx, gx - 16, gy + 1, 14, 2, "#c83a3a");
  prect(ctx, gx - 16, gy + 1, 14, 1, "#1a1a1a");
  // right half (up)
  prect(ctx, gx + 2, gy - 1, 14, 2, "#3a78c9");
  prect(ctx, gx + 2, gy - 1, 14, 1, "#1a1a1a");
  // handles
  prect(ctx, gx - 15, gy, 1, 1, "#f0c842");
  prect(ctx, gx + 15, gy - 2, 1, 1, "#f0c842");
}

// ───────────── Beach props (pixel-art top-down) ─────────────

