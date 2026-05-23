"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./WelcomeScreen.module.css";
import { drawJulioFound } from "./sprites";
import { WORLDS } from "./worlds";
import { getAccent } from "./worlds/accents";

// Pixel text via offscreen low-res render, then nearest-neighbor upscale.
function makePixelText(text: string, color: string, smallFontPx: number) {
  const off = document.createElement("canvas");
  const octx = off.getContext("2d")!;
  octx.font = `900 ${smallFontPx}px "Courier New", monospace`;
  const m = octx.measureText(text);
  const w = Math.ceil(m.width) + 2;
  const h = Math.ceil(smallFontPx * 1.25);
  off.width = w;
  off.height = h;
  const ctx2 = off.getContext("2d")!;
  ctx2.font = `900 ${smallFontPx}px "Courier New", monospace`;
  ctx2.textBaseline = "top";
  ctx2.fillStyle = color;
  ctx2.fillText(text, 1, 1);
  return off;
}

// Render text at fixed small font then upscale by integer factor sized to fit
// `targetHeightPx` tall and at most `maxWidthPx` wide.
function drawPixelText(
  ctx: CanvasRenderingContext2D, text: string, cx: number, y: number,
  color: string, shadow: string, targetHeightPx: number, maxWidthPx: number,
) {
  const BASE = 16; // small font size used for rasterization
  const fg = makePixelText(text, color, BASE);
  const sh = makePixelText(text, shadow, BASE);
  const scaleByH = targetHeightPx / fg.height;
  const scaleByW = maxWidthPx / fg.width;
  const scale = Math.max(1, Math.floor(Math.min(scaleByH, scaleByW)));
  const w = fg.width * scale;
  const h = fg.height * scale;
  const x = cx - w / 2;
  ctx.imageSmoothingEnabled = false;
  // dark blocky shadow offset
  const s = scale;
  ctx.drawImage(sh, x + s * 2, y + s * 2, w, h);
  ctx.drawImage(sh, x - s, y, w, h);
  ctx.drawImage(sh, x + s, y, w, h);
  ctx.drawImage(sh, x, y - s, w, h);
  ctx.drawImage(sh, x, y + s, w, h);
  ctx.drawImage(fg, x, y, w, h);
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, px: number) {
  const set = (gx: number, gy: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + gx * px, y + gy * px, px, px);
  };
  const rect = (gx: number, gy: number, gw: number, gh: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + gx * px, y + gy * px, gw * px, gh * px);
  };
  const W = "#ffffff";
  const S = "#cfdcff";
  // cloud silhouette pixel art (12 wide x 5 tall)
  rect(2, 0, 4, 1, W);
  rect(1, 1, 8, 1, W);
  rect(0, 2, 12, 2, W);
  rect(1, 4, 10, 1, S);
  set(3, 1, W); set(4, 1, W);
}

export default function WelcomeScreen({ onStart }: { onStart: (startWorld?: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPickerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let raf = 0;
    const start = performance.now();

    const render = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);

      // ── Pixel sky: flat single color (GBA spec — no gradients) ──
      const skyH = h * 0.65;
      ctx.fillStyle = "#5ab8e8";
      ctx.fillRect(0, 0, w, skyH);
      // Sun (pixel circle)
      const sunPx = Math.min(10, Math.max(4, Math.floor(w / 80)));
      drawPixelSun(ctx, w - sunPx * 14, sunPx * 8, sunPx);
      // Clouds — moving slow
      const t = (performance.now() - start) / 1000;
      const cloudPx = Math.min(8, Math.max(3, Math.floor(w / 100)));
      const cloudW = 12 * cloudPx;
      const drift = (t * 20) % (w + cloudW);
      drawCloud(ctx, ((w * 0.15 - drift + w + cloudW) % (w + cloudW)) - cloudW, h * 0.08, cloudPx);
      drawCloud(ctx, ((w * 0.55 - drift + w + cloudW) % (w + cloudW)) - cloudW, h * 0.18, cloudPx);
      drawCloud(ctx, ((w * 0.85 - drift + w + cloudW) % (w + cloudW)) - cloudW, h * 0.05, cloudPx);

      // ── Ground: GBA-style grass strip ──
      const groundY = h * 0.65;
      ctx.fillStyle = "#6dc25a";
      ctx.fillRect(0, groundY, w, h - groundY);
      // bright top edge (sun-lit horizon)
      ctx.fillStyle = "#92dc7a";
      ctx.fillRect(0, groundY, w, Math.max(3, Math.floor(h / 200)));
      const sp = Math.max(2, Math.floor(w / 160));
      // GBA "tuft" clusters (2-pixel dark green clumps)
      ctx.fillStyle = "#3a7a32";
      for (let x = 0; x < w; x += sp * 5) {
        for (let y = groundY + sp * 2; y < h; y += sp * 5) {
          if (((x * 31 + y * 17) & 5) === 0) {
            ctx.fillRect(x, y, sp * 2, sp);
            ctx.fillRect(x + sp, y + sp, sp, sp);
          }
        }
      }
      // mid-tone speckle
      ctx.fillStyle = "#58a548";
      for (let x = sp * 2; x < w; x += sp * 4) {
        for (let y = groundY + sp * 3; y < h; y += sp * 5) {
          if (((x * 13 + y * 23) & 7) === 0) ctx.fillRect(x, y, sp, sp);
        }
      }
      // light highlight tufts
      ctx.fillStyle = "#a8e878";
      for (let x = sp * 3; x < w; x += sp * 7) {
        for (let y = groundY + sp * 4; y < h; y += sp * 7) {
          if (((x * 19 + y * 29) & 7) === 0) ctx.fillRect(x, y, sp, sp);
        }
      }
      // tiny rose-bush flowers
      const flowerColors = ["#e23a4a", "#f4d24a", "#ffffff"];
      for (let x = sp; x < w; x += sp * 11) {
        for (let y = groundY + sp * 5; y < h; y += sp * 9) {
          if (((x * 41 + y * 19) & 7) === 0) {
            ctx.fillStyle = flowerColors[((x + y) >>> 0) % flowerColors.length];
            ctx.fillRect(x, y, sp, sp);
            ctx.fillRect(x - sp, y + sp, sp, sp);
            ctx.fillRect(x + sp, y + sp, sp, sp);
          }
        }
      }

      // ── Julio big (bobbing) ──
      const bob = Math.sin(t * 2) * 6;
      const target = Math.min(w * 0.7, h * 0.42, 480);
      const bigPx = Math.max(4, Math.floor(target / 40));
      const cx = w / 2 - bigPx * 3;
      const cy = h * 0.52 + bob;
      drawJulioFound(ctx, cx, cy, bigPx);

      // ── Pixel title (capped width + height so doesn't blow up on wide screens) ──
      const maxLineW = Math.min(w * 0.85, 520);
      const smallTitleH = Math.min(h * 0.06, 44);
      drawPixelText(ctx, "DONDE ESTÁ", w / 2, h * 0.06, "#ffffff", "#1a1a1a", smallTitleH, maxLineW);
      const bigTitleH = Math.min(h * 0.14, 110);
      drawPixelText(ctx, "JULIO?", w / 2, h * 0.13, "#ffe066", "#1a1a1a", bigTitleH, maxLineW);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.root} ref={wrapRef}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.bottomBar}>
        <button className={styles.startBtn} onClick={() => onStart()}>EMPEZAR</button>
        <p className={styles.hint}>Encuentralo 3 veces en cada mundo</p>
        <button
          className={styles.pickerToggle}
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
        >
          ELEGIR MUNDO
        </button>
        <p className={styles.credit}>
          creado por{" "}
          <a
            href="https://github.com/salaesp"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creditLink}
          >
            @salaesp
          </a>
        </p>
      </div>

      {pickerOpen && (
        <div
          className={styles.pickerBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="Elegir mundo de inicio"
          onClick={() => setPickerOpen(false)}
        >
          <div className={styles.pickerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pickerHeader}>
              <span className={styles.pickerTitle}>ELEGÍ UN MUNDO</span>
              <button
                className={styles.pickerClose}
                onClick={() => setPickerOpen(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className={styles.levelGrid}>
              {WORLDS.map((w, i) => {
                const id = i + 1;
                const accent = getAccent(id);
                return (
                  <button
                    key={id}
                    className={styles.levelChip}
                    style={{ "--chip-accent": accent } as React.CSSProperties}
                    onClick={() => onStart(id)}
                  >
                    {w.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function drawPixelSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number) {
  const set = (gx: number, gy: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(cx + gx * px, cy + gy * px, px, px);
  };
  // sun disc 7x7 ish
  const Y = "#ffe066";
  const O = "#ffb84a";
  const positions: [number, number, string][] = [
    [-1, -3, Y], [0, -3, Y], [1, -3, Y],
    [-2, -2, Y], [-1, -2, Y], [0, -2, Y], [1, -2, Y], [2, -2, Y],
    [-3, -1, Y], [-2, -1, Y], [-1, -1, Y], [0, -1, Y], [1, -1, Y], [2, -1, Y], [3, -1, Y],
    [-3, 0, Y], [-2, 0, Y], [-1, 0, Y], [0, 0, Y], [1, 0, Y], [2, 0, Y], [3, 0, Y],
    [-3, 1, O], [-2, 1, O], [-1, 1, O], [0, 1, O], [1, 1, O], [2, 1, O], [3, 1, O],
    [-2, 2, O], [-1, 2, O], [0, 2, O], [1, 2, O], [2, 2, O],
    [-1, 3, O], [0, 3, O], [1, 3, O],
  ];
  for (const [x, y, c] of positions) set(x, y, c);
  // rays
  set(0, -5, Y); set(0, 5, Y); set(-5, 0, Y); set(5, 0, Y);
  set(-4, -4, O); set(4, -4, O); set(-4, 4, O); set(4, 4, O);
}
