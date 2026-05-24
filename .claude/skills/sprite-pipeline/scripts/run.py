"""sprite-pipeline entry point: image + size -> validated rendered sprite.

Standalone and portable. Nothing is hardcoded; every path is derived from the
arguments. One image of any size and any square resolution N -> a clean indexed
sprite, a preview, and a machine-checkable report.

    python3 run.py --image PATH --size N [options]

Pipeline (in order):
  1. Convert the image to an indexed Sprite at NxN (dominant-color downscale).
  2. Render the preview PNG.
  3. Run the technical + visual validation.
  4. Present the preview and report (present_files when available).
  5. Drop all artifacts in --out-dir: <name>.ts, <name>.json, <name>.preview.png,
     <name>.report.json

Exit code is non-zero if any technical assertion fails, so it chains in CI.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import spritelib
import validate as validator


def _present(files: list[str], caption: str) -> None:
    """Best-effort: show artifacts via the present_files CLI if it exists."""
    for tool in ("present_files", "present-files"):
        try:
            subprocess.run([tool, *files], check=False,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return
        except FileNotFoundError:
            continue


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Convert any image into a validated, rendered pixel-art sprite.")
    ap.add_argument("--image", required=True, help="Path to any PNG/JPG image")
    ap.add_argument("--size", required=True, type=int,
                    help="Square resolution N (e.g. 32, 48, 64)")
    ap.add_argument("--max-colors", type=int, default=64,
                    help="Palette budget, up to 255 (default 64)")
    ap.add_argument("--content-rows", type=int, default=None,
                    help="How many rows the body occupies (default: fill the interior)")
    ap.add_argument("--bg-tol", type=int, default=40,
                    help="Background tolerance; lower = less aggressive (default 40)")
    ap.add_argument("--name", default=None,
                    help="Sprite name (default: derived from the image filename)")
    ap.add_argument("--out-dir", default="./sprite-out",
                    help="Where to write artifacts (default ./sprite-out)")
    ap.add_argument("--directions", action="store_true",
                    help="Emit a 4-view set (front/back/left/right) via combine + mirror")
    ap.add_argument("--scale", type=int, default=8, help="Preview upscale factor")
    ap.add_argument("--ring-tol", type=float, default=0.9,
                    help="Min transparent fraction of the outer ring (default 0.9)")
    args = ap.parse_args()

    image = Path(args.image)
    if not image.exists():
        print(f"error: image not found: {image}", file=sys.stderr)
        return 2
    if args.size < 2:
        print("error: --size must be >= 2", file=sys.stderr)
        return 2

    name = args.name or image.stem
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    ts_path = out_dir / f"{name}.ts"
    json_path = out_dir / f"{name}.json"
    preview_path = out_dir / f"{name}.preview.png"
    report_path = out_dir / f"{name}.report.json"

    # 1. Convert
    base = spritelib.image_to_sprite(
        image, args.size, name,
        max_colors=args.max_colors,
        content_rows=args.content_rows,
        bg_tol=args.bg_tol,
    )

    if args.directions:
        # With a single source image, derive the four views by combine + mirror:
        # front == back (same facing data), and left is the mirror of right.
        right = dict(base, name=f"{name}_right")
        left = spritelib.mirror_sprite(right, name=f"{name}_left")
        front = dict(base, name=f"{name}_front")
        back = dict(base, name=f"{name}_back")
        sprites = {"front": front, "back": back, "left": left, "right": right}
        json_obj = sprites
        ts_path.write_text(spritelib.emit_ts_directions(name, sprites))
        spritelib.render_directions_preview(sprites, args.scale).save(preview_path)
    else:
        sprites = base
        json_obj = base
        ts_path.write_text(spritelib.emit_ts(base))
        spritelib.render_preview(base, args.scale).save(preview_path)

    json_path.write_text(json.dumps(json_obj, indent=2))

    # 3. Validate
    report = validator.build_report(
        json_obj, args.size, image=str(image),
        directions=args.directions, ring_tol=args.ring_tol, bg_tol=args.bg_tol,
    )
    report_path.write_text(json.dumps(report, indent=2))

    # 4. Present + summary
    _present([str(preview_path), str(report_path)], f"{name} sprite")
    passed = sum(1 for c in report["checks"] if c["pass"])
    print(json.dumps({
        "name": name,
        "size": args.size,
        "ok": report["ok"],
        "checks_passed": f"{passed}/{len(report['checks'])}",
        "color_distance": report["color_distance"],
        "artifacts": {
            "ts": str(ts_path), "json": str(json_path),
            "preview": str(preview_path), "report": str(report_path),
        },
    }, indent=2))
    for c in report["checks"]:
        if not c["pass"]:
            print(f"  FAIL  {c['name']}: {c['message']}", file=sys.stderr)

    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
