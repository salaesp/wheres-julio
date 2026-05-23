"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./GameCanvas.module.css";
import { useGameState } from "./hooks/useGameState";
import {
  drawPerson, drawJulio, drawJulioFound,
  SPRITE_SIZE,
} from "./characters/sprites";

const HIT_RADIUS = SPRITE_SIZE * 0.4;

type WrongMark = { id: number; x: number; y: number; t: number };
type HeartParticle = { id: number; x: number; y: number; vx: number; vy: number; t: number };

export default function GameCanvas() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState({ w: 1280, h: 720 });
  const { state, registerFind, registerWrong, nextWorld } = useGameState();

  const wrongMarksRef = useRef<WrongMark[]>([]);
  const heartsRef = useRef<HeartParticle[]>([]);
  const foundStartRef = useRef<number | null>(null);
  const idRef = useRef(0);
  const fitRef = useRef({ scale: 1, offX: 0, offY: 0 });
  const prevNpcsRef = useRef<{ x: number; y: number; variant: number }[]>([]);
  const nextNpcsRef = useRef<{ x: number; y: number; variant: number }[]>([]);
  const wanderRef = useRef<{ dx: number; dy: number; phase: number; delay: number }[]>([]);
  // Offscreen cache for static under-layer. Invalidated when scene changes.
  const underCacheRef = useRef<HTMLCanvasElement | null>(null);
  const cachedSceneRef = useRef<unknown>(null);

  const W = state.worldModule.width;
  const H = state.worldModule.height;

  useEffect(() => {
    const onResize = () => {
      const el = stageRef.current;
      if (!el) return;
      setViewport({ w: el.clientWidth, h: el.clientHeight });
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (state.phase === "found_anim") {
      foundStartRef.current = performance.now();
      const j = state.placement.julio;
      for (let i = 0; i < 14; i++) {
        heartsRef.current.push({
          id: ++idRef.current,
          x: j.x + (Math.random() - 0.5) * 20,
          y: j.y - 10,
          vx: (Math.random() - 0.5) * 60,
          vy: -80 - Math.random() * 60,
          t: 0,
        });
      }
      prevNpcsRef.current = state.placement.npcs.map((n) => ({ ...n }));
      nextNpcsRef.current = state.nextPlacement.npcs.map((n) => ({ ...n }));
      wanderRef.current = state.placement.npcs.map(() => ({
        dx: (Math.random() - 0.5) * 30,
        dy: (Math.random() - 0.5) * 30,
        phase: Math.random() * Math.PI * 2,
        delay: Math.random() * 0.25,
      }));
    } else {
      foundStartRef.current = null;
    }
  }, [state.phase, state.placement.julio, state.placement.npcs, state.nextPlacement.npcs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.w * dpr);
    canvas.height = Math.floor(viewport.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    let last = performance.now();

    const render = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const time = now / 1000;

      ctx.clearRect(0, 0, viewport.w, viewport.h);

      const scale = Math.min(viewport.w / W, viewport.h / H);
      const offX = (viewport.w - W * scale) / 2;
      const offY = (viewport.h - H * scale) / 2;
      fitRef.current = { scale, offX, offY };

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, viewport.w, viewport.h);

      ctx.save();
      ctx.translate(offX, offY);
      ctx.scale(scale, scale);

      // ── World-specific layers ──
      state.worldModule.renderBackground(ctx, state.scene, time);
      // Under-layer is static — cache to offscreen, blit each frame.
      if (cachedSceneRef.current !== state.scene || underCacheRef.current === null
          || underCacheRef.current.width !== W || underCacheRef.current.height !== H) {
        const off = document.createElement("canvas");
        off.width = W;
        off.height = H;
        const offCtx = off.getContext("2d");
        if (offCtx) {
          offCtx.imageSmoothingEnabled = false;
          state.worldModule.renderUnder(offCtx, state.scene, time);
        }
        underCacheRef.current = off;
        cachedSceneRef.current = state.scene;
      }
      ctx.drawImage(underCacheRef.current, 0, 0);

      // ── Characters (interpolate during found_anim, sorted by y) ──
      const animating = state.phase === "found_anim" && foundStartRef.current != null;
      const animT = animating
        ? Math.min(1.5, (now - foundStartRef.current!) / 1000)
        : 0;

      let npcsRender: { x: number; y: number; variant: number }[];
      if (animating && prevNpcsRef.current.length === nextNpcsRef.current.length) {
        const prev = prevNpcsRef.current;
        const next = nextNpcsRef.current;
        const wander = wanderRef.current;
        npcsRender = prev.map((p, i) => {
          const n = next[i] ?? p;
          const w = wander[i] ?? { dx: 0, dy: 0, phase: 0, delay: 0 };
          const local = Math.max(0, Math.min(1, (animT - w.delay) / 1.1));
          const ease = local < 0.5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
          const wobble = Math.sin(local * Math.PI * 4 + w.phase) * (1 - Math.abs(local * 2 - 1)) * 3;
          const arc = Math.sin(local * Math.PI) * (1 - Math.abs(local * 2 - 1)) * 6;
          return {
            x: p.x + (n.x - p.x) * ease + w.dx * Math.sin(local * Math.PI) + wobble,
            y: p.y + (n.y - p.y) * ease + w.dy * Math.sin(local * Math.PI) - arc,
            variant: p.variant,
          };
        });
      } else {
        npcsRender = state.placement.npcs;
      }

      const all = [
        ...npcsRender.map((n) => ({ ...n, isJulio: false })),
        { x: state.placement.julio.x, y: state.placement.julio.y, variant: -1, isJulio: true },
      ].sort((a, b) => a.y - b.y);

      if (state.phase === "found_anim" && foundStartRef.current != null) {
        const t = Math.min(1.5, (now - foundStartRef.current) / 1000);
        const j = state.placement.julio;
        const glow = ctx.createRadialGradient(j.x, j.y, 10, j.x, j.y, 90 + t * 20);
        glow.addColorStop(0, "rgba(255,224,90,0.7)");
        glow.addColorStop(1, "rgba(255,224,90,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(j.x, j.y, 110 + t * 20, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const c of all) {
        if (c.isJulio) drawJulio(ctx, c.x, c.y);
        else drawPerson(ctx, c.x, c.y, c.variant);
      }

      // ── World over-layer (canopies, umbrellas) ──
      state.worldModule.renderOver(ctx, state.scene, time);

      if (state.phase === "found_anim" && foundStartRef.current != null) {
        heartsRef.current.forEach((h) => {
          h.t += dt;
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          h.vy += 30 * dt;
          ctx.globalAlpha = Math.max(0, 1 - h.t / 1.2);
          ctx.fillStyle = "#ff5aa0";
          ctx.beginPath();
          ctx.arc(h.x - 3, h.y, 4, 0, Math.PI * 2);
          ctx.arc(h.x + 3, h.y, 4, 0, Math.PI * 2);
          ctx.moveTo(h.x - 6, h.y + 1);
          ctx.lineTo(h.x + 6, h.y + 1);
          ctx.lineTo(h.x, h.y + 8);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      } else {
        heartsRef.current = [];
      }

      wrongMarksRef.current = wrongMarksRef.current.filter((m) => {
        m.t += dt;
        if (m.t > 0.6) return false;
        const a = 1 - m.t / 0.6;
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#ff3a3a";
        ctx.lineWidth = 5;
        const r = 18 + m.t * 12;
        ctx.beginPath();
        ctx.moveTo(m.x - r, m.y - r);
        ctx.lineTo(m.x + r, m.y + r);
        ctx.moveTo(m.x + r, m.y - r);
        ctx.lineTo(m.x - r, m.y + r);
        ctx.stroke();
        ctx.globalAlpha = 1;
        return true;
      });

      ctx.restore();

      // Big "found" overlay
      if (state.phase === "found_anim" && foundStartRef.current != null) {
        const t = Math.min(1.5, (now - foundStartRef.current) / 1000);
        ctx.fillStyle = `rgba(0,0,0,${0.55 * Math.min(1, t * 4)})`;
        ctx.fillRect(0, 0, viewport.w, viewport.h);
        const popT = Math.min(1, t * 3);
        const ease = 1 - Math.pow(1 - popT, 3);
        const targetH = Math.min(viewport.h, viewport.w) * 0.7 * ease;
        const bigPx = Math.max(4, Math.floor(targetH / 40));
        const cx = viewport.w / 2 - bigPx * 3;
        const cy = viewport.h / 2;
        drawJulioFound(ctx, cx, cy, bigPx);
        ctx.save();
        ctx.font = `bold ${Math.floor(bigPx * 4)}px ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.lineWidth = Math.max(3, bigPx);
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#ffe66d";
        const ty = cy + bigPx * 24;
        ctx.strokeText("¡ENCONTRADO!", viewport.w / 2, ty);
        ctx.fillText("¡ENCONTRADO!", viewport.w / 2, ty);
        ctx.restore();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [viewport, state.placement, state.phase, state.scene, state.worldModule, W, H, state.nextPlacement]);

  const pointerToWorld = (clientX: number, clientY: number) => {
    const el = stageRef.current!;
    const rect = el.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const { scale, offX, offY } = fitRef.current;
    return { wx: (px - offX) / scale, wy: (py - offY) / scale };
  };

  const handleClick = (clientX: number, clientY: number) => {
    if (state.phase !== "searching") return;
    const { wx, wy } = pointerToWorld(clientX, clientY);
    const j = state.placement.julio;
    const dx = j.x - wx, dy = j.y - wy;
    if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
      registerFind();
      return;
    }
    wrongMarksRef.current.push({ id: ++idRef.current, x: wx, y: wy, t: 0 });
    registerWrong();
  };

  const onPointerDown = (e: React.PointerEvent) => handleClick(e.clientX, e.clientY);

  const lupas = Array.from({ length: 5 }, (_, i) => i < state.wrongClicks);

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.hud}>
        <div className={styles.title}>
          ¿Dónde está Julio?
          <small>Mundo {state.step + 1}/{state.total} · {state.worldModule.title}</small>
        </div>
        <div className={styles.stats}>
          <div className={styles.box}>
            Encuentros: <strong>{state.finds}</strong> / 3
          </div>
          <div className={styles.box}>
            <div className={styles.lupas} aria-label="Intentos restantes">
              {lupas.map((used, i) => (
                <span key={i} className={used ? styles.lupaUsed : undefined}>🔍</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.stage} ref={stageRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onPointerDown={onPointerDown}
        />
      </div>

      {state.phase === "world_complete" && (
        <div className={styles.popup}>
          <div className={styles.popupCard}>
            <h2>¡Mundo completado!</h2>
            <p>Encontraste a Julio 3 veces.</p>
            <button className={styles.btn} onClick={nextWorld}>
              {state.step + 1 < state.total ? `Siguiente mundo →` : "Empezar de nuevo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
