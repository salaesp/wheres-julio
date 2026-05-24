"""Self-contained image -> indexed pixel-art sprite library.

No project-specific paths. Everything is derived from arguments. Used by run.py
and validate.py. Emits the documented `Sprite` format:

    { name, width, height, transparentIndex, palette: string[], data: number[] }

- palette[0] is "" (transparent), transparentIndex is 0.
- data is row-major, length == width * height, every entry an index into palette.

Core ideas (why it looks clean):
- Downscale by DOMINANT color per cell, never by averaging (averaging smears the
  dark outline into a gray veil).
- Keep real colors: quantize the source palette with a generous budget instead of
  crushing to a handful of colors.
- Reserve a transparent border by construction so there is no background halo.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from PIL import Image


# --------------------------------------------------------------------------- #
# Loading and foreground/background separation
# --------------------------------------------------------------------------- #

def load_rgba(path: str | Path) -> np.ndarray:
    """Load any PNG/JPG as an HxWx4 uint8 RGBA array."""
    img = Image.open(path).convert("RGBA")
    return np.asarray(img, dtype=np.uint8)


def foreground_mask(rgba: np.ndarray, bg_tol: int) -> np.ndarray:
    """Boolean HxW mask, True where the subject is (opaque foreground).

    If the image carries a real alpha channel, trust it. Otherwise infer a flat
    background color from the four corners and mark pixels within `bg_tol` of it
    as background.
    """
    alpha = rgba[..., 3]
    transparent_frac = float(np.mean(alpha < 250))
    if alpha.min() < 250 and transparent_frac > 0.01:
        return alpha >= 128

    rgb = rgba[..., :3].astype(np.int16)
    h, w = rgb.shape[:2]
    corners = np.stack([rgb[0, 0], rgb[0, w - 1], rgb[h - 1, 0], rgb[h - 1, w - 1]])
    bg = np.median(corners, axis=0)
    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    return dist > bg_tol


def content_bbox(mask: np.ndarray) -> tuple[int, int, int, int]:
    """(y0, y1, x0, x1) bounding box of True pixels; full frame if mask is empty."""
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    if not rows.any():
        return 0, mask.shape[0], 0, mask.shape[1]
    y0, y1 = np.where(rows)[0][[0, -1]]
    x0, x1 = np.where(cols)[0][[0, -1]]
    return int(y0), int(y1) + 1, int(x0), int(x1) + 1


# --------------------------------------------------------------------------- #
# Dominant-color downscaling
# --------------------------------------------------------------------------- #

def _dominant_color(opaque: np.ndarray) -> np.ndarray:
    """Representative color of a block: mean of the most populated coarse bucket.

    Bucketing to a 16-level grid first means the "dominant" color is robust to
    photographic noise instead of being whatever single pixel happens to repeat.
    """
    q = (opaque.astype(np.int64) // 16)
    keys = q[:, 0] * 4096 + q[:, 1] * 64 + q[:, 2]
    vals, counts = np.unique(keys, return_counts=True)
    best = vals[int(np.argmax(counts))]
    sel = keys == best
    return opaque[sel].mean(axis=0).round().astype(np.uint8)


def downscale_dominant(
    rgb: np.ndarray, mask: np.ndarray, out_w: int, out_h: int, keep_tol: float = 0.5
) -> tuple[np.ndarray, np.ndarray]:
    """Reduce (rgb, mask) to out_h x out_w taking the dominant color of each cell.

    A target cell becomes transparent when less than `keep_tol` of its source
    pixels are foreground; otherwise it gets the dominant foreground color.
    """
    sh, sw = mask.shape
    out_rgb = np.zeros((out_h, out_w, 3), dtype=np.uint8)
    out_mask = np.zeros((out_h, out_w), dtype=bool)
    ys = [(ty * sh // out_h, max(ty * sh // out_h + 1, (ty + 1) * sh // out_h)) for ty in range(out_h)]
    xs = [(tx * sw // out_w, max(tx * sw // out_w + 1, (tx + 1) * sw // out_w)) for tx in range(out_w)]
    for ty, (y0, y1) in enumerate(ys):
        for tx, (x0, x1) in enumerate(xs):
            block_mask = mask[y0:y1, x0:x1]
            total = block_mask.size
            opaque = rgb[y0:y1, x0:x1][block_mask]
            if total and len(opaque) >= keep_tol * total:
                out_rgb[ty, tx] = _dominant_color(opaque)
                out_mask[ty, tx] = True
    return out_rgb, out_mask


# --------------------------------------------------------------------------- #
# Palette quantization
# --------------------------------------------------------------------------- #

def _to_hex(c: np.ndarray) -> str:
    return "#{:02x}{:02x}{:02x}".format(int(c[0]), int(c[1]), int(c[2]))


def quantize(small_rgb: np.ndarray, small_mask: np.ndarray, max_colors: int):
    """Map foreground cells to a palette of at most `max_colors` colors.

    Returns (palette, index_grid) where palette[0] == "" (transparent) and
    index_grid has 0 for transparent cells, >=1 otherwise.
    """
    h, w = small_mask.shape
    index_grid = np.zeros((h, w), dtype=np.int32)
    fg = small_rgb[small_mask]
    if len(fg) == 0:
        return [""], index_grid

    uniq = np.unique(fg.reshape(-1, 3), axis=0)
    if len(uniq) <= max_colors:
        colors = uniq
    else:
        strip = Image.fromarray(fg.reshape(-1, 1, 3).astype(np.uint8), "RGB")
        q = strip.quantize(colors=max_colors, method=Image.MEDIANCUT, dither=Image.Dither.NONE)
        pal = q.getpalette() or []
        n = min(max_colors, len(pal) // 3)
        colors = np.unique(np.array(pal[: n * 3]).reshape(-1, 3), axis=0)

    # nearest palette color for each foreground cell (small grid -> brute force is fine)
    coords = np.argwhere(small_mask)
    cell_rgb = small_rgb[small_mask].astype(np.int32)
    d = ((cell_rgb[:, None, :] - colors[None, :, :].astype(np.int32)) ** 2).sum(axis=2)
    nearest = d.argmin(axis=1)
    palette = [""] + [_to_hex(c) for c in colors]
    for (y, x), idx in zip(coords, nearest):
        index_grid[y, x] = int(idx) + 1
    return palette, index_grid


# --------------------------------------------------------------------------- #
# Compose into the NxN canvas (transparent border by construction)
# --------------------------------------------------------------------------- #

def fit_dims(bb_h: int, bb_w: int, size: int, content_rows: int | None, margin: int = 1):
    """Target content (h, w) fitting inside the NxN interior, preserving aspect."""
    avail_h = (content_rows if content_rows else size - 2 * margin)
    avail_h = max(1, min(avail_h, size - 2 * margin))
    avail_w = max(1, size - 2 * margin)
    scale = min(avail_w / bb_w, avail_h / bb_h)
    out_w = max(1, min(round(bb_w * scale), avail_w))
    out_h = max(1, min(round(bb_h * scale), avail_h))
    return out_h, out_w


def compose(index_grid: np.ndarray, size: int) -> np.ndarray:
    """Center the content grid in an NxN canvas of transparent (0) cells."""
    h, w = index_grid.shape
    canvas = np.zeros((size, size), dtype=np.int32)
    oy = (size - h) // 2
    ox = (size - w) // 2
    canvas[oy : oy + h, ox : ox + w] = index_grid
    return canvas


# --------------------------------------------------------------------------- #
# Sprite assembly / mirroring
# --------------------------------------------------------------------------- #

def build_sprite(name: str, size: int, palette: list[str], grid: np.ndarray) -> dict:
    return {
        "name": name,
        "width": size,
        "height": size,
        "transparentIndex": 0,
        "palette": palette,
        "data": [int(v) for v in grid.reshape(-1)],
    }


def mirror_sprite(sprite: dict, name: str | None = None) -> dict:
    w, h = sprite["width"], sprite["height"]
    grid = np.array(sprite["data"], dtype=np.int32).reshape(h, w)
    flipped = grid[:, ::-1]
    return {
        "name": name or (sprite["name"] + "_mirror"),
        "width": w,
        "height": h,
        "transparentIndex": sprite["transparentIndex"],
        "palette": list(sprite["palette"]),
        "data": [int(v) for v in flipped.reshape(-1)],
    }


# --------------------------------------------------------------------------- #
# Image conversion (the standalone path)
# --------------------------------------------------------------------------- #

def image_to_sprite(
    image_path: str | Path,
    size: int,
    name: str,
    max_colors: int = 64,
    content_rows: int | None = None,
    bg_tol: int = 40,
) -> dict:
    rgba = load_rgba(image_path)
    mask = foreground_mask(rgba, bg_tol)
    y0, y1, x0, x1 = content_bbox(mask)
    crop_rgb = rgba[y0:y1, x0:x1, :3]
    crop_mask = mask[y0:y1, x0:x1]
    out_h, out_w = fit_dims(y1 - y0, x1 - x0, size, content_rows)
    small_rgb, small_mask = downscale_dominant(crop_rgb, crop_mask, out_w, out_h)
    palette, index_grid = quantize(small_rgb, small_mask, max_colors)
    canvas = compose(index_grid, size)
    return build_sprite(name, size, palette, canvas)


# --------------------------------------------------------------------------- #
# Preview rendering
# --------------------------------------------------------------------------- #

def render_preview(sprite: dict, scale: int = 8) -> Image.Image:
    """Render a sprite to an upscaled RGBA PIL image (transparent stays transparent)."""
    w, h = sprite["width"], sprite["height"]
    palette = sprite["palette"]
    data = sprite["data"]
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    for i, idx in enumerate(data):
        if idx == 0 or idx >= len(palette) or not palette[idx]:
            continue
        hexv = palette[idx].lstrip("#")
        rgba[i // w, i % w] = (int(hexv[0:2], 16), int(hexv[2:4], 16), int(hexv[4:6], 16), 255)
    img = Image.fromarray(rgba, "RGBA")
    return img.resize((w * scale, h * scale), Image.NEAREST)


def render_directions_preview(sprites: dict[str, dict], scale: int = 8) -> Image.Image:
    """Tile a 4-direction set side by side for a single preview image."""
    order = [d for d in ("front", "back", "left", "right") if d in sprites]
    tiles = [render_preview(sprites[d], scale) for d in order]
    if not tiles:
        return Image.new("RGBA", (scale, scale))
    th = max(t.height for t in tiles)
    gap = scale
    total_w = sum(t.width for t in tiles) + gap * (len(tiles) - 1)
    canvas = Image.new("RGBA", (total_w, th), (0, 0, 0, 0))
    x = 0
    for t in tiles:
        canvas.paste(t, (x, 0))
        x += t.width + gap
    return canvas


# --------------------------------------------------------------------------- #
# Color-distance metric (visual guide, not pass/fail)
# --------------------------------------------------------------------------- #

def _srgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """Vectorized sRGB (0-255) -> CIE Lab. Input ...x3, output ...x3."""
    srgb = rgb.astype(np.float64) / 255.0
    lin = np.where(srgb <= 0.04045, srgb / 12.92, ((srgb + 0.055) / 1.055) ** 2.4)
    m = np.array([
        [0.4124564, 0.3575761, 0.1804375],
        [0.2126729, 0.7151522, 0.0721750],
        [0.0193339, 0.1191920, 0.9503041],
    ])
    xyz = lin @ m.T
    white = np.array([0.95047, 1.0, 1.08883])
    xyz = xyz / white
    eps = 216 / 24389
    kappa = 24389 / 27
    f = np.where(xyz > eps, np.cbrt(xyz), (kappa * xyz + 16) / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], axis=-1)


def color_distance(image_path: str | Path, sprite: dict, bg_tol: int = 40) -> float:
    """Mean Lab (deltaE76) distance between the source and the rendered sprite.

    The source is cropped and rescaled with the same geometry as the sprite, so
    the comparison is aligned. Measured only over foreground cells. Returns -1.0
    if there is nothing to compare.
    """
    size = sprite["width"]
    rgba = load_rgba(image_path)
    mask = foreground_mask(rgba, bg_tol)
    y0, y1, x0, x1 = content_bbox(mask)
    crop = Image.fromarray(rgba[y0:y1, x0:x1, :3], "RGB")
    grid = np.array(sprite["data"], dtype=np.int32).reshape(size, size)
    fg = grid > 0
    if not fg.any():
        return -1.0
    rows = np.any(fg, axis=1)
    cols = np.any(fg, axis=0)
    cy0, cy1 = np.where(rows)[0][[0, -1]]
    cx0, cx1 = np.where(cols)[0][[0, -1]]
    out_w, out_h = cx1 - cx0 + 1, cy1 - cy0 + 1
    ref = np.asarray(crop.resize((out_w, out_h), Image.LANCZOS), dtype=np.uint8)

    palette = sprite["palette"]
    spr_rgb = np.zeros((out_h, out_w, 3), dtype=np.uint8)
    valid = np.zeros((out_h, out_w), dtype=bool)
    for yy in range(out_h):
        for xx in range(out_w):
            idx = int(grid[cy0 + yy, cx0 + xx])
            if idx > 0 and idx < len(palette) and palette[idx]:
                hexv = palette[idx].lstrip("#")
                spr_rgb[yy, xx] = (int(hexv[0:2], 16), int(hexv[2:4], 16), int(hexv[4:6], 16))
                valid[yy, xx] = True
    if not valid.any():
        return -1.0
    lab_ref = _srgb_to_lab(ref[valid])
    lab_spr = _srgb_to_lab(spr_rgb[valid])
    return float(np.sqrt(((lab_ref - lab_spr) ** 2).sum(axis=1)).mean())


# --------------------------------------------------------------------------- #
# TypeScript emission (self-contained: type + data + renderer)
# --------------------------------------------------------------------------- #

_TS_HEADER = """// Generated by sprite-pipeline. Self-contained: type, data, and renderer.
export interface Sprite {
  name: string;
  width: number;
  height: number;
  transparentIndex: number;
  palette: string[];
  data: number[];
}

export function renderSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  scale = 1,
): void {
  const { width, height, palette, transparentIndex, data } = sprite;
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < data.length; i++) {
    const idx = data[i];
    if (idx === transparentIndex) continue;
    const color = palette[idx];
    if (!color) continue;
    ctx.fillStyle = color;
    ctx.fillRect(x + (i % width) * scale, y + Math.floor(i / width) * scale, scale, scale);
  }
}
"""


def _ident(name: str) -> str:
    ident = re.sub(r"[^0-9a-zA-Z_]", "_", name)
    if ident and ident[0].isdigit():
        ident = "_" + ident
    return ident or "sprite"


def _sprite_literal(sprite: dict) -> str:
    palette = ", ".join(json.dumps(c) for c in sprite["palette"])
    w = sprite["width"]
    rows = []
    for r in range(sprite["height"]):
        row = sprite["data"][r * w : (r + 1) * w]
        rows.append("    " + ", ".join(str(v) for v in row) + ",")
    data = "\n".join(rows)
    return (
        "{\n"
        f"  name: {json.dumps(sprite['name'])},\n"
        f"  width: {sprite['width']},\n"
        f"  height: {sprite['height']},\n"
        f"  transparentIndex: {sprite['transparentIndex']},\n"
        f"  palette: [{palette}],\n"
        "  data: [\n"
        f"{data}\n"
        "  ],\n"
        "}"
    )


def emit_ts(sprite: dict) -> str:
    ident = _ident(sprite["name"])
    return f"{_TS_HEADER}\nexport const {ident}: Sprite = {_sprite_literal(sprite)};\n"


def emit_ts_directions(name: str, sprites: dict[str, dict]) -> str:
    ident = _ident(name)
    parts = [_TS_HEADER, "\nexport type Direction = \"front\" | \"back\" | \"left\" | \"right\";\n"]
    parts.append(f"\nexport const {ident}: Record<Direction, Sprite> = {{")
    for d in ("front", "back", "left", "right"):
        if d in sprites:
            lit = _sprite_literal(sprites[d]).replace("\n", "\n  ")
            parts.append(f"  {d}: {lit},")
    parts.append("};\n")
    return "\n".join(parts)
