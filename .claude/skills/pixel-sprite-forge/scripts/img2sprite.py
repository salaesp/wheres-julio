"""img2sprite — convierte imágenes en sprites indexados y los renderiza.

Subcomandos:
  from-image INPUT --out NAME [--size N --max-colors C --content-rows R --bg-tol T]
      INPUT (PNG/JPG) -> NAME.ts, NAME.json (editable), NAME.preview.png
  render SPRITE.json --out preview.png [--scale S]
      Renderiza un sprite a PNG (para verificar ediciones).
  mirror SPRITE.json --out MIRRORED.json [--name NEW]
      Espeja un sprite horizontalmente.
  emit-ts SPRITE.json --out NAME.ts
      Emite el .ts autocontenido a partir de un .json.

Formato Sprite: { name, width, height, transparentIndex, palette: string[], data: number[] }
- palette[0] === "" (transparente), transparentIndex === 0, data row-major.

Reducción por COLOR DOMINANTE (no promedio): promediar mezcla el contorno oscuro
con el relleno y deja un velo gris. Se conserva la paleta real cuantizada a
--max-colors (default 64, hasta 255).

Dependencias: Pillow y numpy. Si faltan:
  pip install pillow numpy --break-system-packages
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image


# --------------------------- foreground / crop ----------------------------- #

def load_rgba(path):
    return np.asarray(Image.open(path).convert("RGBA"), dtype=np.uint8)


def foreground_mask(rgba, bg_tol):
    alpha = rgba[..., 3]
    if alpha.min() < 250 and float(np.mean(alpha < 250)) > 0.01:
        return alpha >= 128
    rgb = rgba[..., :3].astype(np.int16)
    h, w = rgb.shape[:2]
    corners = np.stack([rgb[0, 0], rgb[0, w - 1], rgb[h - 1, 0], rgb[h - 1, w - 1]])
    bg = np.median(corners, axis=0)
    return np.sqrt(((rgb - bg) ** 2).sum(axis=2)) > bg_tol


def content_bbox(mask):
    rows, cols = np.any(mask, axis=1), np.any(mask, axis=0)
    if not rows.any():
        return 0, mask.shape[0], 0, mask.shape[1]
    y0, y1 = np.where(rows)[0][[0, -1]]
    x0, x1 = np.where(cols)[0][[0, -1]]
    return int(y0), int(y1) + 1, int(x0), int(x1) + 1


# --------------------------- dominant downscale ---------------------------- #

def _dominant(opaque):
    q = opaque.astype(np.int64) // 16
    keys = q[:, 0] * 4096 + q[:, 1] * 64 + q[:, 2]
    vals, counts = np.unique(keys, return_counts=True)
    sel = keys == vals[int(np.argmax(counts))]
    return opaque[sel].mean(axis=0).round().astype(np.uint8)


def downscale_dominant(rgb, mask, out_w, out_h, keep_tol=0.5):
    sh, sw = mask.shape
    out_rgb = np.zeros((out_h, out_w, 3), np.uint8)
    out_mask = np.zeros((out_h, out_w), bool)
    for ty in range(out_h):
        y0, y1 = ty * sh // out_h, max(ty * sh // out_h + 1, (ty + 1) * sh // out_h)
        for tx in range(out_w):
            x0, x1 = tx * sw // out_w, max(tx * sw // out_w + 1, (tx + 1) * sw // out_w)
            bm = mask[y0:y1, x0:x1]
            opaque = rgb[y0:y1, x0:x1][bm]
            if bm.size and len(opaque) >= keep_tol * bm.size:
                out_rgb[ty, tx] = _dominant(opaque)
                out_mask[ty, tx] = True
    return out_rgb, out_mask


def _hex(c):
    return "#{:02x}{:02x}{:02x}".format(int(c[0]), int(c[1]), int(c[2]))


def quantize(small_rgb, small_mask, max_colors):
    h, w = small_mask.shape
    grid = np.zeros((h, w), np.int32)
    fg = small_rgb[small_mask]
    if len(fg) == 0:
        return [""], grid
    uniq = np.unique(fg.reshape(-1, 3), axis=0)
    if len(uniq) <= max_colors:
        colors = uniq
    else:
        strip = Image.fromarray(fg.reshape(-1, 1, 3).astype(np.uint8), "RGB")
        q = strip.quantize(colors=max_colors, method=Image.MEDIANCUT, dither=Image.Dither.NONE)
        pal = q.getpalette() or []
        n = min(max_colors, len(pal) // 3)
        colors = np.unique(np.array(pal[: n * 3]).reshape(-1, 3), axis=0)
    coords = np.argwhere(small_mask)
    cell = small_rgb[small_mask].astype(np.int32)
    d = ((cell[:, None, :] - colors[None, :, :].astype(np.int32)) ** 2).sum(axis=2)
    nearest = d.argmin(axis=1)
    palette = [""] + [_hex(c) for c in colors]
    for (y, x), idx in zip(coords, nearest):
        grid[y, x] = int(idx) + 1
    return palette, grid


def fit_dims(bb_h, bb_w, size, content_rows, margin=1):
    avail_h = max(1, min(content_rows if content_rows else size - 2 * margin, size - 2 * margin))
    avail_w = max(1, size - 2 * margin)
    scale = min(avail_w / bb_w, avail_h / bb_h)
    return (max(1, min(round(bb_h * scale), avail_h)),
            max(1, min(round(bb_w * scale), avail_w)))


def compose(grid, size):
    h, w = grid.shape
    canvas = np.zeros((size, size), np.int32)
    canvas[(size - h) // 2:(size - h) // 2 + h, (size - w) // 2:(size - w) // 2 + w] = grid
    return canvas


def image_to_sprite(path, size, name, max_colors=64, content_rows=None, bg_tol=40):
    rgba = load_rgba(path)
    mask = foreground_mask(rgba, bg_tol)
    y0, y1, x0, x1 = content_bbox(mask)
    out_h, out_w = fit_dims(y1 - y0, x1 - x0, size, content_rows)
    s_rgb, s_mask = downscale_dominant(rgba[y0:y1, x0:x1, :3], mask[y0:y1, x0:x1], out_w, out_h)
    palette, grid = quantize(s_rgb, s_mask, max_colors)
    return {"name": name, "width": size, "height": size, "transparentIndex": 0,
            "palette": palette, "data": [int(v) for v in compose(grid, size).reshape(-1)]}


# ------------------------------ render / mirror ---------------------------- #

def render(sprite, scale=8):
    w, h, palette, data = sprite["width"], sprite["height"], sprite["palette"], sprite["data"]
    rgba = np.zeros((h, w, 4), np.uint8)
    for i, idx in enumerate(data):
        if idx == 0 or idx >= len(palette) or not palette[idx]:
            continue
        hx = palette[idx].lstrip("#")
        rgba[i // w, i % w] = (int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16), 255)
    return Image.fromarray(rgba, "RGBA").resize((w * scale, h * scale), Image.NEAREST)


def mirror(sprite, name=None):
    w, h = sprite["width"], sprite["height"]
    grid = np.array(sprite["data"], np.int32).reshape(h, w)[:, ::-1]
    return {"name": name or sprite["name"] + "_mirror", "width": w, "height": h,
            "transparentIndex": sprite["transparentIndex"], "palette": list(sprite["palette"]),
            "data": [int(v) for v in grid.reshape(-1)]}


# -------------------------------- emit ts ---------------------------------- #

_HEADER = """// Generated by pixel-sprite-forge. Self-contained: type, data, and renderer.
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
  const { width, palette, transparentIndex, data } = sprite;
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


def _ident(name):
    ident = re.sub(r"[^0-9a-zA-Z_]", "_", name)
    return ("_" + ident) if ident[:1].isdigit() else (ident or "sprite")


def emit_ts(sprite):
    palette = ", ".join(json.dumps(c) for c in sprite["palette"])
    w = sprite["width"]
    rows = ["    " + ", ".join(str(v) for v in sprite["data"][r * w:(r + 1) * w]) + ","
            for r in range(sprite["height"])]
    lit = ("{\n"
           f"  name: {json.dumps(sprite['name'])},\n"
           f"  width: {sprite['width']},\n  height: {sprite['height']},\n"
           f"  transparentIndex: {sprite['transparentIndex']},\n"
           f"  palette: [{palette}],\n  data: [\n" + "\n".join(rows) + "\n  ],\n}")
    return f"{_HEADER}\nexport const {_ident(sprite['name'])}: Sprite = {lit};\n"


# --------------------------------- CLI ------------------------------------- #

def main():
    ap = argparse.ArgumentParser(description="Convert images to indexed sprites.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    fi = sub.add_parser("from-image")
    fi.add_argument("input")
    fi.add_argument("--out", required=True, help="Base name (writes NAME.ts/.json/.preview.png)")
    fi.add_argument("--size", type=int, default=32)
    fi.add_argument("--max-colors", type=int, default=64)
    fi.add_argument("--content-rows", type=int, default=None)
    fi.add_argument("--bg-tol", type=int, default=40)
    fi.add_argument("--scale", type=int, default=8)

    rn = sub.add_parser("render")
    rn.add_argument("sprite")
    rn.add_argument("--out", required=True)
    rn.add_argument("--scale", type=int, default=8)

    mr = sub.add_parser("mirror")
    mr.add_argument("sprite")
    mr.add_argument("--out", required=True)
    mr.add_argument("--name", default=None)

    et = sub.add_parser("emit-ts")
    et.add_argument("sprite")
    et.add_argument("--out", required=True)

    args = ap.parse_args()

    if args.cmd == "from-image":
        base = Path(args.out)
        if base.parent != Path("."):
            base.parent.mkdir(parents=True, exist_ok=True)
        name = base.name
        sprite = image_to_sprite(args.input, args.size, name, args.max_colors,
                                 args.content_rows, args.bg_tol)
        base.with_suffix(".json").write_text(json.dumps(sprite, indent=2))
        base.with_suffix(".ts").write_text(emit_ts(sprite))
        render(sprite, args.scale).save(str(base.with_suffix("")) + ".preview.png")
        print(f"wrote {base}.ts, {base}.json, {base}.preview.png "
              f"({len(sprite['palette']) - 1} colors, {args.size}x{args.size})")
    elif args.cmd == "render":
        sprite = json.loads(Path(args.sprite).read_text())
        render(sprite, args.scale).save(args.out)
        print(f"wrote {args.out}")
    elif args.cmd == "mirror":
        sprite = json.loads(Path(args.sprite).read_text())
        Path(args.out).write_text(json.dumps(mirror(sprite, args.name), indent=2))
        print(f"wrote {args.out}")
    elif args.cmd == "emit-ts":
        sprite = json.loads(Path(args.sprite).read_text())
        Path(args.out).write_text(emit_ts(sprite))
        print(f"wrote {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
