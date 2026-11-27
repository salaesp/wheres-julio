"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./GameCanvas.module.css";
import { useGameState } from "./hooks/useGameState";
import { getAccent } from "./worlds/accents";
import { JulioHeadIcon, HeartIcon, HomeIcon } from "./HudIcons";
import {
  drawCharacter, julioFrames, personFrames, type Dir,
} from "./engine/characters";
import { drawProp, propBase } from "./engine/props";
import { EMOTE, EMOTE_Q, HEART, MISS, SPARKLE } from "./engine/effects";
import type { NpcPos } from "./worlds/types";

// Hit area around Julio's body, in native game pixels.
const HIT_RADIUS = 12;
const WALK_TIME = 1.15; // seconds NPCs take to reshuffle
// When the reshuffle starts within the transition (seconds). Before that, the
// found celebration (big Julio + dialog) or the "escaped" reveal is shown.
const FOUND_WALK_START = 2.1;
const FAIL_WALK_START = 1.1;

type WrongMark = { x: number; y: number; t: number };
// Hearts live in screen (device) pixels around the big celebration Julio.
type Heart = { x: number; y: number; vx: number; vy: number; t: number; px: number };

function dirFor(dx: number, dy: number, fallback: Dir): Dir {
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 2 : 3;
  return dy < 0 ? 1 : 0;
}

export default function GameCanvas({ name, startWorld, onExit }: { name: string; startWorld?: number; onExit?: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState({ w: 400, h: 700 });
  const { state, registerFind, registerWrong, nextWorld } = useGameState(startWorld);

  const wrongRef = useRef<WrongMark[]>([]);
  const heartsRef = useRef<Heart[]>([]);
  const animStartRef = useRef<number | null>(null);
  const fitRef = useRef({ scale: 1, offX: 0, offY: 0, dpr: 1 });
  const fromRef = useRef<NpcPos[]>([]);
  const toRef = useRef<NpcPos[]>([]);
  const delayRef = useRef<number[]>([]);
  const nativeRef = useRef<HTMLCanvasElement | null>(null);
  const groundRef = useRef<{ scene: unknown; canvas: HTMLCanvasElement } | null>(null);

  const world = state.worldModule;
  const W = world.width;
  const H = world.height;

  useEffect(() => {
    const onResize = () => {
      const el = stageRef.current;
      if (el) setViewport({ w: el.clientWidth, h: el.clientHeight });
    };
    onResize();
    const ro = new ResizeObserver(onResize);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  // Start of a transition: hearts + NPC walk targets.
  useEffect(() => {
    if (state.phase !== "found_anim") {
      animStartRef.current = null;
      return;
    }
    animStartRef.current = performance.now();
    heartsRef.current = [];
    fromRef.current = state.placement.npcs.map((n) => ({ ...n }));
    toRef.current = state.nextPlacement.npcs.map((n) => ({ ...n }));
    const start = state.failed ? FAIL_WALK_START : FOUND_WALK_START;
    delayRef.current = state.placement.npcs.map(() => start + Math.random() * 0.3);
  }, [state.phase, state.failed, state.placement, state.nextPlacement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.floor(viewport.w * dpr);
    canvas.height = Math.floor(viewport.h * dpr);

    if (!nativeRef.current) nativeRef.current = document.createElement("canvas");
    const native = nativeRef.current;
    native.width = W;
    native.height = H;
    const nctx = native.getContext("2d")!;
    nctx.imageSmoothingEnabled = false;

    if (!groundRef.current || groundRef.current.scene !== state.scene) {
      const g = document.createElement("canvas");
      g.width = W;
      g.height = H;
      const gctx = g.getContext("2d")!;
      gctx.imageSmoothingEnabled = false;
      world.drawGround(gctx, state.scene);
      groundRef.current = { scene: state.scene, canvas: g };
    }
    const ground = groundRef.current.canvas;
    const julio = julioFrames();
    const props = world.props(state.scene);

    let raf = 0;
    let last = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = now / 1000;
      const animT = animStartRef.current != null ? (now - animStartRef.current) / 1000 : -1;
      const animating = animT >= 0;

      // ── Native-resolution scene ──
      nctx.drawImage(ground, 0, 0);
      world.drawAnimated(nctx, state.scene, time);

      // NPC positions (walk to their next spot during the transition)
      type Drawable = { y: number; draw: () => void };
      const list: Drawable[] = [];
      const from = fromRef.current, to = toRef.current;
      const npcs = state.placement.npcs;
      npcs.forEach((n, i) => {
        let x = n.x, y = n.y, dir = n.dir, step: 0 | 1 | 2 = 0;
        if (animating && from[i] && to[i]) {
          const local = Math.max(0, Math.min(1, (animT - delayRef.current[i]) / WALK_TIME));
          const a = from[i], b = to[i];
          x = a.x + (b.x - a.x) * local;
          y = a.y + (b.y - a.y) * local;
          if (local > 0 && local < 1) {
            dir = dirFor(b.x - a.x, b.y - a.y, a.dir);
            step = (Math.floor(time * 8) % 2 === 0 ? 1 : 2);
          } else if (local >= 1) dir = b.dir;
        }
        const frames = personFrames(n.variant, world.outfit, world.outfitKey);
        list.push({
          y,
          draw: () => {
            drawCharacter(nctx, frames, x, y, dir, step);
            for (const c of world.coverAt(state.scene, x, y)) nctx.drawImage(c.sprite.image, c.sx, c.sy, c.w, c.h, c.x, c.y, c.w, c.h);
          },
        });
      });
      const j = state.placement.julio;
      const hop = animating && !state.failed ? Math.round(Math.abs(Math.sin(animT * 9)) * -4) : 0;
      list.push({
        y: j.y,
        draw: () => {
          drawCharacter(nctx, julio, j.x, j.y + hop, animating && !state.failed ? 0 : j.dir, 0);
          for (const c of world.coverAt(state.scene, j.x, j.y)) nctx.drawImage(c.sprite.image, c.sx, c.sy, c.w, c.h, c.x, c.y, c.w, c.h);
        },
      });
      for (const p of props) list.push({ y: propBase(p), draw: () => drawProp(nctx, p, time) });
      list.sort((a, b) => a.y - b.y);
      for (const d of list) d.draw();

      // ── Effects ──
      if (animating) {
        const em = state.failed ? EMOTE_Q() : EMOTE();
        const emoteUntil = state.failed ? FAIL_WALK_START + 0.4 : FOUND_WALK_START;
        if (animT < emoteUntil) nctx.drawImage(em.image, Math.round(j.x - em.w / 2 + 3), Math.round(j.y - 36 + hop));
      }
      const miss = MISS();
      wrongRef.current = wrongRef.current.filter((m) => {
        m.t += dt;
        if (m.t > 0.7) return false;
        if (m.t < 0.45 || Math.floor(m.t * 20) % 2 === 0) {
          nctx.drawImage(miss.image, Math.round(m.x - miss.w / 2), Math.round(m.y - miss.h / 2 - m.t * 6));
        }
        return true;
      });

      // ── Upscale to the screen (nearest neighbour) ──
      const cw = canvas.width, ch = canvas.height;
      let scale = Math.min(cw / W, ch / H);
      const intScale = Math.floor(scale);
      if (intScale >= 2 && intScale / scale > 0.9) scale = intScale;
      const offX = Math.floor((cw - W * scale) / 2);
      const offY = Math.floor((ch - H * scale) / 2);
      fitRef.current = { scale, offX, offY, dpr };

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = world.background;
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(native, offX, offY, Math.round(W * scale), Math.round(H * scale));

      // Dim + big Julio on success
      if (animating && !state.failed) {
        // fade in fast, hold, then fade out as the crowd starts moving
        const k = Math.min(1, animT * 3) * Math.max(0, Math.min(1, 1 - (animT - FOUND_WALK_START + 0.2) / 0.5));
        ctx.fillStyle = `rgba(16,12,40,${0.5 * k})`;
        ctx.fillRect(0, 0, cw, ch);
        if (k > 0.05) {
          // pop in (grow), then shrink away when the celebration ends
          const grow = Math.min(1, animT * 4);
          const size = animT < FOUND_WALK_START - 0.2 ? 0.6 + 0.4 * grow : k;
          const s = julio[0][0];
          const big = Math.max(1, Math.floor(Math.min(cw, ch) * 0.45 / s.h * size));
          const by = ch * 0.42 + Math.round(Math.abs(Math.sin(animT * 5)) * -big * 2);
          const bx = Math.round(cw / 2 - (s.w * big) / 2), byTop = Math.round(by - (s.h * big) / 2);
          ctx.drawImage(s.image, bx, byTop, s.w * big, s.h * big);
          // sparkles orbiting the big Julio
          const sp = SPARKLE();
          const spPx = Math.max(2, Math.round(big * 0.6));
          for (let q = 0; q < 5; q++) {
            const ang = animT * 2.5 + (q * Math.PI * 2) / 5;
            const sx = cw / 2 + Math.cos(ang) * s.w * big * 0.75;
            const sy = by + Math.sin(ang) * s.h * big * 0.55;
            ctx.drawImage(sp.image, Math.round(sx - (sp.w * spPx) / 2), Math.round(sy - (sp.h * spPx) / 2), sp.w * spPx, sp.h * spPx);
          }
          // hearts burst out of the big Julio while celebrating
          if (animT < FOUND_WALK_START - 0.3) {
            const rate = animT < 0.3 ? 40 : 9; // big burst, then a steady trickle
            let n = rate * dt;
            while (n > 0) {
              if (Math.random() < n) {
                heartsRef.current.push({
                  x: cw / 2 + (Math.random() - 0.5) * s.w * big * 0.8,
                  y: byTop + s.h * big * (0.15 + Math.random() * 0.35),
                  vx: (Math.random() - 0.5) * big * 40,
                  vy: -(30 + Math.random() * 35) * big,
                  t: 0,
                  px: Math.max(2, Math.round(big * (0.45 + Math.random() * 0.25))),
                });
              }
              n -= 1;
            }
          }
        }
      }
      const heart = HEART();
      heartsRef.current = heartsRef.current.filter((h) => {
        h.t += dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.vy += h.px * 25 * dt;
        if (h.t > 1.4) return false;
        if (h.t < 1.05 || Math.floor(h.t * 20) % 2 === 0) {
          ctx.drawImage(heart.image, Math.round(h.x - (heart.w * h.px) / 2), Math.round(h.y), heart.w * h.px, heart.h * h.px);
        }
        return true;
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [viewport, state.placement, state.phase, state.failed, state.scene, world, W, H]);

  // Dev-only: lets automated screenshots find Julio.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const w = window as unknown as { __julio?: () => { x: number; y: number } };
    w.__julio = () => {
      const r = stageRef.current!.getBoundingClientRect();
      const { scale, offX, offY, dpr } = fitRef.current;
      const j = state.placement.julio;
      return { x: r.left + (offX + j.x * scale) / dpr, y: r.top + (offY + (j.y - 10) * scale) / dpr };
    };
  }, [state.placement]);

  const pointerToWorld = (clientX: number, clientY: number) => {
    const rect = stageRef.current!.getBoundingClientRect();
    const { scale, offX, offY, dpr } = fitRef.current;
    const px = (clientX - rect.left) * dpr;
    const py = (clientY - rect.top) * dpr;
    return { wx: (px - offX) / scale, wy: (py - offY) / scale };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (state.phase !== "searching") return;
    const { wx, wy } = pointerToWorld(e.clientX, e.clientY);
    const j = state.placement.julio;
    const dx = j.x - wx, dy = j.y - 10 - wy;
    if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
      registerFind();
      return;
    }
    wrongRef.current.push({ x: wx, y: wy, t: 0 });
    registerWrong();
  };

  const attemptsLeft = 5 - state.wrongClicks;
  const accent = getAccent(state.world);
  const transition = state.phase === "found_anim";
  const danger = attemptsLeft <= 2 && state.phase === "searching";
  const progress = (state.step + (state.phase === "world_complete" ? 1 : 0)) / state.total;

  return (
    <div className={styles.root} style={{ background: world.background }}>
      <header className={styles.hud} style={{ "--accent": accent } as React.CSSProperties}>
        {onExit && (
          <button className={styles.homeBtn} onClick={onExit} aria-label="Volver al menú principal" title="Volver al menú">
            <HomeIcon />
          </button>
        )}
        <div className={styles.panel}>
          <div className={styles.titleBlock}>
            <div className={styles.levelName} key={state.world}>{world.title}</div>
            <div className={styles.worldProgress} aria-label={`Mundo ${state.step + 1} de ${state.total}`}>
              <span className={styles.progressTag}>MUNDO</span>
              <span className={styles.bar}>
                <span className={styles.barFill} style={{ width: `${Math.max(4, progress * 100)}%` }} />
              </span>
              <span className={styles.progressCount}>{state.step + 1}/{state.total}</span>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.findsRow} aria-label={`Encontraste a ${name} ${state.finds} de 3 veces`}>
              {Array.from({ length: 3 }, (_, i) => {
                const found = i < state.finds;
                const popping = i === state.finds - 1 && transition && !state.failed;
                return (
                  <span key={i} className={`${styles.headSlot} ${popping ? styles.findPop : ""}`}>
                    <JulioHeadIcon found={found} />
                  </span>
                );
              })}
            </div>
            <div className={`${styles.hearts} ${danger ? styles.heartsDanger : ""}`} aria-label={`${attemptsLeft} intentos restantes`}>
              {Array.from({ length: 5 }, (_, i) => {
                const full = i < attemptsLeft;
                const lost = i === attemptsLeft && state.wrongClicks > 0;
                return (
                  <span key={`${i}-${state.wrongClicks}`} className={`${styles.heartSlot} ${lost ? styles.heartLost : ""}`}>
                    <HeartIcon full={full} />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </header>
      <div className={styles.stage} ref={stageRef}>
        <canvas ref={canvasRef} className={styles.canvas} onPointerDown={onPointerDown} />
        {transition && (
          <div className={styles.dialog} role="status">
            {state.failed ? `¡Oh, no! ${name} se escapó...` : `¡Encontraste a ${name.toUpperCase()}!`}
            <span className={styles.dialogArrow} />
          </div>
        )}
      </div>

      {state.phase === "world_complete" && (
        <div className={styles.popup}>
          <div className={styles.popupCard}>
            <h2>¡Mundo completado!</h2>
            <p>Encontraste a {name} 3 veces.</p>
            <button className={styles.btn} onClick={nextWorld}>
              {state.step + 1 < state.total ? `Siguiente mundo ▶` : "Empezar de nuevo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
