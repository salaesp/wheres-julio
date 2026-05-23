export type Palette = Record<string, string | null>;

export type Frame = {
  width: number;
  height: number;
  pixels: readonly string[];
};

export type DirectionSheet = {
  idle: Frame;
  walk?: readonly [Frame, Frame];
};

export type SpriteSheet = {
  front: DirectionSheet;
  back?: DirectionSheet;
  left?: DirectionSheet;
  right?: DirectionSheet;
};

// Draw a frame centered at (cx, cy) in canvas pixels. cy = vertical center of sprite.
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  frame: Frame,
  palette: Palette,
  cx: number,
  cy: number,
  scale: number,
): void {
  ctx.imageSmoothingEnabled = false;
  const ox = Math.round(cx - (frame.width * scale) / 2);
  const oy = Math.round(cy - (frame.height * scale) / 2);
  for (let row = 0; row < frame.height; row++) {
    const line = frame.pixels[row];
    for (let col = 0; col < frame.width; col++) {
      const color = palette[line[col]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + col * scale, oy + row * scale, scale, scale);
    }
  }
}

// Returns the appropriate frame given walking state and time.
export function currentFrame(sheet: DirectionSheet, walking: boolean, time: number, fps = 6): Frame {
  if (!walking || !sheet.walk) return sheet.idle;
  return sheet.walk[Math.floor(time * fps) % 2];
}
