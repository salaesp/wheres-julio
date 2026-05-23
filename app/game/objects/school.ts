import { SPRITE_BASE, SPRITE_SCALE, SPRITE_SIZE, PX, type Ctx, pset, prect, pcircle, pellipse } from "../utils/primitives";
void SPRITE_BASE; void SPRITE_SCALE; void SPRITE_SIZE;

// ───────────── Mundo gigante props (escritorio) ─────────────

export function drawGiantBook(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  const gx = x / PX, gy = y / PX, gw = w / PX, gh = h / PX;
  // shadow
  prect(ctx, gx + 2, gy + 2, gw, gh, "rgba(0,0,0,0.5)");
  // pages (white side stripes)
  prect(ctx, gx, gy + 1, gw, gh - 2, "#f0e8d8");
  for (let yy = gy + 2; yy < gy + gh - 2; yy += 2) {
    prect(ctx, gx, yy, gw, 1, "#dcd4c0");
  }
  // cover (top + bottom rectangles)
  prect(ctx, gx, gy, gw, 2, color);
  prect(ctx, gx, gy + gh - 2, gw, 2, color);
  // spine + outline
  prect(ctx, gx, gy, 2, gh, color);
  prect(ctx, gx + gw - 2, gy, 2, gh, color);
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + gh - 1, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, gh, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, gh, "#1a1a1a");
  // title bar on cover top
  prect(ctx, gx + 2, gy + 1, gw - 4, 1, "#f0c842");
}


export function drawGiantPencil(ctx: Ctx, x: number, y: number, len: number, color: string) {
  const gx = x / PX, gy = y / PX, glen = len / PX;
  // shadow
  prect(ctx, gx + 1, gy + 1, glen, 5, "rgba(0,0,0,0.4)");
  // wood tip (left)
  prect(ctx, gx, gy + 1, 3, 3, "#e2c878");
  prect(ctx, gx, gy + 1, 3, 1, "#a87a4a");
  prect(ctx, gx, gy + 3, 3, 1, "#a87a4a");
  // lead point
  pset(ctx, gx - 1, gy + 2, "#1a1a1a");
  // colored shaft
  prect(ctx, gx + 3, gy, glen - 7, 5, color);
  // stripes
  prect(ctx, gx + 3, gy, glen - 7, 1, "rgba(0,0,0,0.3)");
  prect(ctx, gx + 3, gy + 4, glen - 7, 1, "rgba(0,0,0,0.3)");
  prect(ctx, gx + 3, gy + 2, glen - 7, 1, "rgba(255,255,255,0.18)");
  // metal ferrule
  prect(ctx, gx + glen - 4, gy, 2, 5, "#bcbcc4");
  prect(ctx, gx + glen - 4, gy + 2, 2, 1, "#7a7a86");
  // eraser end (pink)
  prect(ctx, gx + glen - 2, gy, 2, 5, "#f4a8b8");
  prect(ctx, gx + glen - 2, gy, 2, 1, "#c87898");
  // outline
  prect(ctx, gx + 3, gy, glen - 5, 1, "#1a1a1a");
  prect(ctx, gx + 3, gy + 4, glen - 5, 1, "#1a1a1a");
}


export function drawGiantMug(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // shadow
  pellipse(ctx, gx, gy + 13, 12, 3, "rgba(0,0,0,0.45)");
  // mug body (white)
  prect(ctx, gx - 9, gy - 6, 18, 18, "#ffffff");
  // outline
  prect(ctx, gx - 9, gy - 6, 18, 1, "#1a1a1a");
  prect(ctx, gx - 9, gy + 11, 18, 1, "#1a1a1a");
  prect(ctx, gx - 9, gy - 6, 1, 18, "#1a1a1a");
  prect(ctx, gx + 8, gy - 6, 1, 18, "#1a1a1a");
  // shading
  prect(ctx, gx + 6, gy - 5, 2, 16, "#dcdce4");
  // colored stripe band
  prect(ctx, gx - 8, gy + 4, 16, 3, "#3a78c9");
  prect(ctx, gx - 8, gy + 7, 16, 1, "#2a5a9a");
  // coffee top (oval brown)
  pellipse(ctx, gx, gy - 6, 8, 2, "#5a3a1a");
  pellipse(ctx, gx, gy - 6, 7, 1, "#7a4a22");
  // foam dots
  pset(ctx, gx - 2, gy - 6, "#e2c878");
  pset(ctx, gx + 2, gy - 6, "#e2c878");
  // handle (right side)
  prect(ctx, gx + 9, gy - 2, 4, 2, "#ffffff");
  prect(ctx, gx + 11, gy, 2, 6, "#ffffff");
  prect(ctx, gx + 9, gy + 5, 4, 2, "#ffffff");
  prect(ctx, gx + 9, gy - 2, 4, 1, "#1a1a1a");
  prect(ctx, gx + 9, gy + 6, 4, 1, "#1a1a1a");
  prect(ctx, gx + 12, gy, 1, 6, "#1a1a1a");
  // steam wisps above
  pset(ctx, gx - 3, gy - 10, "#dcdce4");
  pset(ctx, gx - 2, gy - 11, "#dcdce4");
  pset(ctx, gx - 1, gy - 10, "#dcdce4");
  pset(ctx, gx, gy - 11, "#dcdce4");
  pset(ctx, gx + 1, gy - 10, "#dcdce4");
  pset(ctx, gx + 2, gy - 11, "#dcdce4");
}


export function drawGiantRuler(ctx: Ctx, x: number, y: number, len: number) {
  const gx = x / PX, gy = y / PX, glen = len / PX;
  // shadow
  prect(ctx, gx + 1, gy + 1, glen, 7, "rgba(0,0,0,0.4)");
  // ruler body (yellow wood)
  prect(ctx, gx, gy, glen, 7, "#f0c842");
  // grain shading
  prect(ctx, gx, gy + 5, glen, 1, "#c89a2a");
  prect(ctx, gx, gy + 1, glen, 1, "#f8d870");
  // outline
  prect(ctx, gx, gy, glen, 1, "#1a1a1a");
  prect(ctx, gx, gy + 6, glen, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, 7, "#1a1a1a");
  prect(ctx, gx + glen - 1, gy, 1, 7, "#1a1a1a");
  // tick marks
  for (let i = 2; i < glen - 1; i += 2) {
    const tall = i % 10 === 0 ? 4 : (i % 5 === 0 ? 3 : 2);
    prect(ctx, gx + i, gy + 1, 1, tall, "#1a1a1a");
  }
}


export function drawGiantEraser(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  prect(ctx, gx + 1, gy + 1, 14, 6, "rgba(0,0,0,0.4)");
  // body pink
  prect(ctx, gx, gy, 14, 6, "#f4a8b8");
  // top sleeve (orange band)
  prect(ctx, gx, gy, 14, 2, "#e8853a");
  // outline
  prect(ctx, gx, gy, 14, 1, "#1a1a1a");
  prect(ctx, gx, gy + 5, 14, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, 6, "#1a1a1a");
  prect(ctx, gx + 13, gy, 1, 6, "#1a1a1a");
  // dust pixels
  pset(ctx, gx + 3, gy + 3, "rgba(255,255,255,0.4)");
  pset(ctx, gx + 9, gy + 4, "rgba(255,255,255,0.4)");
  // brand stripe
  prect(ctx, gx + 2, gy + 3, 10, 1, "#c87898");
}


export function drawGiantSharpener(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  prect(ctx, gx + 1, gy + 1, 9, 6, "rgba(0,0,0,0.4)");
  // body (red plastic)
  prect(ctx, gx, gy, 9, 6, "#e23a3a");
  prect(ctx, gx, gy + 1, 9, 1, "#f8a8a0");
  prect(ctx, gx, gy + 4, 9, 1, "#a82a2a");
  // outline
  prect(ctx, gx, gy, 9, 1, "#1a1a1a");
  prect(ctx, gx, gy + 5, 9, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, 6, "#1a1a1a");
  prect(ctx, gx + 8, gy, 1, 6, "#1a1a1a");
  // hole for pencil
  pcircle(ctx, gx + 4, gy + 3, 1, "#1a1a1a");
  pset(ctx, gx + 4, gy + 3, "#3a3a3a");
  // metal blade screw
  pset(ctx, gx + 7, gy + 1, "#bcbcc4");
}

// ───────────── Escuela props ─────────────


// ───────────── Escuela props ─────────────

export function drawHopscotch(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  const colors = ["#e23a3a", "#3a78c9", "#f0c842", "#3aa86a", "#a85ad4"];
  // Hopscotch: 1 / 2-3 / 4 / 5-6 / 7 / 8-9 / 10 simplified to 7 squares stacked
  // Pattern: 1 box (1), 2 boxes (2,3), 1 box (4), 2 boxes (5,6), 1 box (7)
  let cy = 0;
  const drawBox = (col: number, row: number, c: string, label: string) => {
    const bx = gx - 4 + col * 6;
    const by = gy + row * 6;
    prect(ctx, bx, by, 6, 6, c);
    prect(ctx, bx, by, 6, 1, "#ffffff");
    prect(ctx, bx, by + 5, 6, 1, "#ffffff");
    prect(ctx, bx, by, 1, 6, "#ffffff");
    prect(ctx, bx + 5, by, 1, 6, "#ffffff");
    // chalk number (single pixel dot)
    void label;
    pset(ctx, bx + 2, by + 2, "#ffffff");
    pset(ctx, bx + 3, by + 3, "#ffffff");
  };
  drawBox(1, cy, colors[0], "1"); cy++;
  drawBox(0, cy, colors[1], "2"); drawBox(2, cy, colors[1], "3"); cy++;
  drawBox(1, cy, colors[2], "4"); cy++;
  drawBox(0, cy, colors[3], "5"); drawBox(2, cy, colors[3], "6"); cy++;
  drawBox(1, cy, colors[4], "7");
}


export function drawSchoolBall(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 3, 3, 1, "rgba(0,0,0,0.35)");
  pcircle(ctx, gx, gy, 3, color);
  // hexagon stitching
  pset(ctx, gx, gy - 2, "#1a1a1a");
  pset(ctx, gx - 2, gy, "#1a1a1a");
  pset(ctx, gx + 2, gy, "#1a1a1a");
  pset(ctx, gx, gy + 2, "#1a1a1a");
  pset(ctx, gx - 1, gy - 1, "#1a1a1a");
  pset(ctx, gx + 1, gy + 1, "#1a1a1a");
  // shine
  pset(ctx, gx - 1, gy - 2, "#ffffff");
}


export function drawJumpRope(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // coiled rope (concentric circles)
  pcircle(ctx, gx, gy, 4, "#e8853a");
  pcircle(ctx, gx, gy, 3, "#a85a1a");
  pcircle(ctx, gx, gy, 2, "#e8853a");
  pset(ctx, gx, gy, "#a85a1a");
  // handles (red)
  prect(ctx, gx - 6, gy - 1, 2, 2, "#e23a3a");
  prect(ctx, gx + 5, gy + 1, 2, 2, "#e23a3a");
  prect(ctx, gx - 6, gy - 1, 1, 2, "#1a1a1a");
  prect(ctx, gx + 6, gy + 1, 1, 2, "#1a1a1a");
}


export function drawSchoolBench(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  prect(ctx, gx + 1, gy + 1, gw, 6, "rgba(0,0,0,0.35)");
  // seat
  prect(ctx, gx, gy, gw, 5, "#7a4a22");
  // stripes (planks)
  prect(ctx, gx, gy + 1, gw, 1, "#a87a4a");
  prect(ctx, gx, gy + 3, gw, 1, "#5a3a1a");
  // outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + 4, gw, 1, "#1a1a1a");
  // metal legs
  prect(ctx, gx + 2, gy + 5, 1, 2, "#3a3a44");
  prect(ctx, gx + gw - 3, gy + 5, 1, 2, "#3a3a44");
  prect(ctx, gx + Math.floor(gw / 2), gy + 5, 1, 2, "#3a3a44");
}


export function drawBackpack(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 4, 4, 1, "rgba(0,0,0,0.4)");
  // body
  prect(ctx, gx - 3, gy - 2, 7, 7, color);
  // pocket flap (lighter shade)
  prect(ctx, gx - 2, gy, 5, 3, "rgba(255,255,255,0.2)");
  // straps
  prect(ctx, gx - 4, gy - 2, 1, 6, color);
  prect(ctx, gx + 4, gy - 2, 1, 6, color);
  // outline
  prect(ctx, gx - 3, gy - 2, 7, 1, "#1a1a1a");
  prect(ctx, gx - 3, gy + 4, 7, 1, "#1a1a1a");
  prect(ctx, gx - 3, gy - 2, 1, 7, "#1a1a1a");
  prect(ctx, gx + 3, gy - 2, 1, 7, "#1a1a1a");
  // zipper line
  prect(ctx, gx - 2, gy + 1, 5, 1, "#1a1a1a");
  // top handle
  prect(ctx, gx - 1, gy - 3, 3, 1, "#1a1a1a");
}


export function drawTrashCan(ctx: Ctx, x: number, y: number, color: string) {
  const gx = x / PX, gy = y / PX;
  pellipse(ctx, gx, gy + 5, 4, 1, "rgba(0,0,0,0.4)");
  // body
  prect(ctx, gx - 4, gy - 3, 9, 8, color);
  // rim/lid
  prect(ctx, gx - 5, gy - 3, 11, 2, "#3a3a3a");
  // shade
  prect(ctx, gx - 4, gy - 1, 9, 1, "rgba(0,0,0,0.18)");
  prect(ctx, gx + 3, gy - 1, 1, 6, "rgba(0,0,0,0.18)");
  // outline body
  prect(ctx, gx - 4, gy + 4, 9, 1, "#1a1a1a");
  prect(ctx, gx - 4, gy - 1, 1, 6, "#1a1a1a");
  prect(ctx, gx + 4, gy - 1, 1, 6, "#1a1a1a");
  prect(ctx, gx - 5, gy - 3, 11, 1, "#1a1a1a");
  prect(ctx, gx - 5, gy, 11, 1, "#1a1a1a");
  // label
  prect(ctx, gx - 1, gy + 1, 3, 2, "#ffffff");
}


export function drawSchoolEntrance(ctx: Ctx, x: number, y: number, w: number) {
  const gx = x / PX, gy = y / PX, gw = w / PX;
  // shadow
  prect(ctx, gx + 1, gy + 1, gw, 10, "rgba(0,0,0,0.4)");
  // wall (cream)
  prect(ctx, gx, gy, gw, 10, "#f0d68a");
  // wall outline
  prect(ctx, gx, gy, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy + 9, gw, 1, "#1a1a1a");
  prect(ctx, gx, gy, 1, 10, "#1a1a1a");
  prect(ctx, gx + gw - 1, gy, 1, 10, "#1a1a1a");
  // wall stripe
  prect(ctx, gx, gy + 5, gw, 1, "#c89a5a");
  // door (center, dark)
  const doorW = Math.floor(gw / 4);
  const doorX = gx + Math.floor(gw / 2) - Math.floor(doorW / 2);
  prect(ctx, doorX, gy + 3, doorW, 7, "#5a3a1a");
  prect(ctx, doorX, gy + 3, doorW, 1, "#3a2a14");
  prect(ctx, doorX, gy + 3, 1, 7, "#3a2a14");
  prect(ctx, doorX + doorW - 1, gy + 3, 1, 7, "#3a2a14");
  // door divider
  prect(ctx, doorX + Math.floor(doorW / 2), gy + 3, 1, 7, "#3a2a14");
  // handle
  pset(ctx, doorX + Math.floor(doorW / 2) - 1, gy + 7, "#f0c842");
  pset(ctx, doorX + Math.floor(doorW / 2) + 1, gy + 7, "#f0c842");
  // windows (sides of door)
  const wWin = 5;
  prect(ctx, doorX - wWin - 3, gy + 3, wWin, 4, "#5aa6e8");
  prect(ctx, doorX + doorW + 3, gy + 3, wWin, 4, "#5aa6e8");
  prect(ctx, doorX - wWin - 3, gy + 3, wWin, 1, "#1a1a1a");
  prect(ctx, doorX + doorW + 3, gy + 3, wWin, 1, "#1a1a1a");
  prect(ctx, doorX - wWin - 3, gy + 7, wWin, 1, "#1a1a1a");
  prect(ctx, doorX + doorW + 3, gy + 7, wWin, 1, "#1a1a1a");
  // window cross
  pset(ctx, doorX - wWin + Math.floor(wWin / 2) - 3, gy + 4, "#1a1a1a");
  pset(ctx, doorX - wWin + Math.floor(wWin / 2) - 3, gy + 5, "#1a1a1a");
  // big sign ESCUELA above wall
  prect(ctx, gx + Math.floor(gw / 2) - 14, gy - 6, 28, 5, "#e23a3a");
  prect(ctx, gx + Math.floor(gw / 2) - 14, gy - 6, 28, 1, "#1a1a1a");
  prect(ctx, gx + Math.floor(gw / 2) - 14, gy - 2, 28, 1, "#1a1a1a");
  prect(ctx, gx + Math.floor(gw / 2) - 14, gy - 6, 1, 5, "#1a1a1a");
  prect(ctx, gx + Math.floor(gw / 2) + 13, gy - 6, 1, 5, "#1a1a1a");
  // ESCUELA white text bar
  prect(ctx, gx + Math.floor(gw / 2) - 10, gy - 4, 20, 2, "#ffffff");
  // staircase (3 steps in front of door)
  for (let i = 0; i < 3; i++) {
    prect(ctx, doorX - 2 + i, gy + 10 + i, doorW + 4 - i * 2, 1, "#a8a8b2");
  }
}


export function drawFlagpoleAR(ctx: Ctx, x: number, y: number) {
  const gx = x / PX, gy = y / PX;
  // base
  prect(ctx, gx - 3, gy + 12, 7, 2, "#5a5a66");
  prect(ctx, gx - 3, gy + 12, 7, 1, "#3a3a44");
  // pole (vertical tall)
  prect(ctx, gx, gy - 14, 1, 26, "#bcbcc4");
  // top ball
  pset(ctx, gx, gy - 15, "#f0c842");
  // Argentine flag (celeste-white-celeste horizontal)
  prect(ctx, gx + 1, gy - 12, 8, 2, "#7ec8e3"); // celeste
  prect(ctx, gx + 1, gy - 10, 8, 2, "#ffffff"); // white
  prect(ctx, gx + 1, gy - 8, 8, 2, "#7ec8e3");  // celeste
  // sun (yellow circle middle of white stripe)
  pset(ctx, gx + 5, gy - 10, "#f0c842");
  pset(ctx, gx + 4, gy - 10, "#f0c842");
  pset(ctx, gx + 5, gy - 9, "#f0c842");
  // outline flag
  prect(ctx, gx + 1, gy - 12, 8, 1, "#1a1a1a");
  prect(ctx, gx + 1, gy - 7, 8, 1, "#1a1a1a");
  prect(ctx, gx + 1, gy - 12, 1, 6, "#1a1a1a");
  prect(ctx, gx + 8, gy - 12, 1, 6, "#1a1a1a");
}

// ───────────── Maratón ciudad props ─────────────

