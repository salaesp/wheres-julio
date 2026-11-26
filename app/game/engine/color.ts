// Small color helpers used to derive shades / outlines from a base color.

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linear mix: t=0 → a, t=1 → b. */
export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

/** Pokémon-style "selective outline": a very dark, slightly cool version of the
 *  neighbouring fill color, never pure black. */
export function outlineOf(fill: string): string {
  return mix(fill, "#141020", 0.78);
}

export function darken(c: string, t: number): string {
  return mix(c, "#181028", t);
}

export function lighten(c: string, t: number): string {
  return mix(c, "#fffff0", t);
}
