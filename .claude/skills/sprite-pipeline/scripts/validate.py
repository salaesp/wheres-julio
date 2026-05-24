"""Validation for indexed pixel-art sprites.

Deterministic technical assertions (parameterized by the target size N) plus a
numeric color-distance metric used as a human-review guide (not pass/fail).

Can be imported (`validate_sprite`, `validate_directions`) or run as a CLI:

    python3 validate.py --sprite NAME.json --size 32 [--image SRC.png]
    python3 validate.py --sprite NAME.json --size 32 --directions

Exit code is non-zero when any technical assertion fails, so it is CI-chainable.
The report is printed as JSON: { size, checks: [{name, pass, message}],
color_distance, ok }.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import spritelib

DIRECTIONS = ("front", "back", "left", "right")


def _check(name: str, ok: bool, message: str) -> dict:
    return {"name": name, "pass": bool(ok), "message": message}


def validate_sprite(sprite: dict, size: int, ring_tol: float = 0.9) -> list[dict]:
    """Technical assertions for one sprite at target size N."""
    checks: list[dict] = []
    w, h = sprite.get("width"), sprite.get("height")
    palette = sprite.get("palette", [])
    data = sprite.get("data", [])
    tindex = sprite.get("transparentIndex")

    checks.append(_check("dimensions_match_size", w == size and h == size,
                         f"width={w} height={h} expected {size}x{size}"))

    expected = (w or 0) * (h or 0)
    checks.append(_check("data_length", len(data) == expected,
                         f"data length={len(data)} expected width*height={expected}"))

    in_range = all(0 <= v < len(palette) for v in data) if palette else False
    checks.append(_check("indices_in_range", in_range,
                         f"all {len(data)} indices within [0, {len(palette) - 1}]" if in_range
                         else "some index is outside the palette range"))

    checks.append(_check("palette_size", len(palette) <= 256,
                         f"palette has {len(palette)} colors (<= 256)"))

    transparent_ok = bool(palette) and palette[0] == "" and tindex == 0
    checks.append(_check("transparent_index", transparent_ok,
                         f"palette[0]={palette[0]!r} transparentIndex={tindex} (expected '' and 0)"
                         if palette else "empty palette"))

    # No background halo: outer ring is mostly transparent.
    if w == size and h == size and len(data) == size * size and size >= 2:
        grid = [data[r * size:(r + 1) * size] for r in range(size)]
        ring = grid[0] + grid[-1]
        for r in range(1, size - 1):
            ring.append(grid[r][0])
            ring.append(grid[r][-1])
        transparent_in_ring = sum(1 for v in ring if v == tindex)
        frac = transparent_in_ring / len(ring) if ring else 0.0
        checks.append(_check("no_background_halo", frac >= ring_tol,
                             f"outer ring is {frac:.0%} transparent (threshold {ring_tol:.0%})"))
    else:
        checks.append(_check("no_background_halo", False,
                             "could not evaluate ring (bad dimensions)"))
    return checks


def validate_directions(sprites: dict, size: int, ring_tol: float = 0.9):
    """Validate a 4-direction set: all present, same dims, each technically valid."""
    checks: list[dict] = []
    present = [d for d in DIRECTIONS if d in sprites]
    checks.append(_check("four_directions_present", len(present) == 4,
                         f"present: {present}"))
    widths = {sprites[d]["width"] for d in present}
    heights = {sprites[d]["height"] for d in present}
    checks.append(_check("directions_same_dims",
                         len(widths) == 1 and len(heights) == 1,
                         f"widths={widths} heights={heights}"))
    for d in present:
        for c in validate_sprite(sprites[d], size, ring_tol):
            checks.append(_check(f"{d}.{c['name']}", c["pass"], c["message"]))
    return checks


def build_report(sprite_or_set, size: int, image: str | None = None,
                 directions: bool = False, ring_tol: float = 0.9,
                 bg_tol: int = 40) -> dict:
    if directions:
        checks = validate_directions(sprite_or_set, size, ring_tol)
        primary = sprite_or_set.get("front") or next(iter(sprite_or_set.values()), None)
    else:
        checks = validate_sprite(sprite_or_set, size, ring_tol)
        primary = sprite_or_set

    color_dist = None
    if image and primary:
        try:
            color_dist = spritelib.color_distance(image, primary, bg_tol)
        except Exception as exc:  # metric is best-effort, never fails the run
            color_dist = None
            checks.append(_check("color_distance_metric", True,
                                 f"metric skipped: {exc}"))

    ok = all(c["pass"] for c in checks)
    return {"size": size, "checks": checks, "color_distance": color_dist, "ok": ok}


def _load(path: str) -> dict:
    return json.loads(Path(path).read_text())


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate an indexed pixel-art sprite.")
    ap.add_argument("--sprite", required=True, help="Path to the sprite .json")
    ap.add_argument("--size", required=True, type=int, help="Expected NxN size")
    ap.add_argument("--image", help="Original image, for the color-distance metric")
    ap.add_argument("--directions", action="store_true",
                    help="The json is a {front,back,left,right} set")
    ap.add_argument("--ring-tol", type=float, default=0.9,
                    help="Min transparent fraction of the outer ring (default 0.9)")
    ap.add_argument("--bg-tol", type=int, default=40)
    ap.add_argument("--report", help="Optional path to write the report JSON")
    args = ap.parse_args()

    loaded = _load(args.sprite)
    report = build_report(loaded, args.size, args.image, args.directions,
                          args.ring_tol, args.bg_tol)
    text = json.dumps(report, indent=2)
    if args.report:
        Path(args.report).write_text(text)
    print(text)
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
