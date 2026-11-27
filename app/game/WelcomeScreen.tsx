"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./WelcomeScreen.module.css";
import { drawJulioBig, drawCharacter, julioFrames, personFrames, type Dir } from "./engine/characters";
import { drawProp, propBase } from "./engine/props";
import { WORLDS } from "./worlds";
import { getAccent } from "./worlds/accents";
import { DEFAULT_NAME, NAME_MAX, cleanName } from "./storage";

type Props = {
  name: string;
  onNameChange: (name: string) => void;
  onStart: (startWorld?: number) => void;
};

export default function WelcomeScreen({ name, onNameChange, onStart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  // What's typed in the box (may be empty while editing); the logo shows the
  // cleaned-up name so it never goes blank.
  const [draft, setDraft] = useState(name === DEFAULT_NAME ? "" : name);
  // Sync when the saved name loads, without eating spaces mid-typing.
  useEffect(() => {
    setDraft((d) => (cleanName(d) === name ? d : name === DEFAULT_NAME ? "" : name));
  }, [name]);
  const shown = cleanName(draft);
  // Long names shrink so they still fit across the screen.
  const bigSize = `clamp(28px, ${Math.min(15, 78 / Math.max(5, shown.length + 1))}vw, 84px)`;

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
    const ctx = canvas.getContext("2d")!;

    // Background: the plaza map (ground + props + strolling people), panned slowly.
    const world = WORLDS[0];
    const scene = world.buildScene();
    const placement = world.placeCharacters(1234, scene);
    const ground = document.createElement("canvas");
    ground.width = world.width;
    ground.height = world.height;
    world.drawGround(ground.getContext("2d")!, scene);
    const native = document.createElement("canvas");
    native.width = world.width;
    native.height = world.height;
    const nctx = native.getContext("2d")!;
    const julio = julioFrames();
    const props = world.props(scene);
    const walkers = placement.npcs.slice(0, 30).map((n, i) => ({
      ...n, speed: 6 + (i % 5) * 3, axis: i % 2, sign: i % 4 < 2 ? 1 : -1,
    }));

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      const t = Math.max(0, (now - start) / 1000);
      const w = wrap.clientWidth, h = wrap.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      nctx.drawImage(ground, 0, 0);
      world.drawAnimated(nctx, scene, t);
      type D = { y: number; draw: () => void };
      const list: D[] = props.map((p) => ({ y: propBase(p), draw: () => drawProp(nctx, p, t) }));
      for (const n of walkers) {
        // walk back and forth along one axis
        const range = 28;
        const ph = ((t * n.speed) / range + n.variant) % 2;
        const k = ph < 1 ? ph : 2 - ph;
        const off = (k - 0.5) * range * n.sign;
        const x = n.axis === 0 ? n.x + off : n.x;
        const y = n.axis === 1 ? n.y + off : n.y;
        const forward = (ph < 1) === (n.sign > 0);
        const dir: Dir = n.axis === 0 ? (forward ? 3 : 2) : (forward ? 0 : 1);
        const step = (Math.floor(t * 6 + n.variant) % 2 === 0 ? 1 : 2) as 1 | 2;
        const frames = personFrames(n.variant, world.outfit, world.outfitKey);
        list.push({ y, draw: () => drawCharacter(nctx, frames, x, y, dir, step) });
      }
      list.sort((a, b) => a.y - b.y);
      for (const d of list) d.draw();

      // cover the screen width; pan vertically over the map
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / world.width, ch / world.height) * 1.15;
      const sw = world.width * scale, sh = world.height * scale;
      const panY = (Math.sin(t * 0.08) * 0.5 + 0.5) * (ch - sh);
      const offX = Math.floor((cw - sw) / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(native, offX, Math.floor(panY), Math.round(sw), Math.round(sh));
      ctx.fillStyle = "rgba(24,16,64,0.35)";
      ctx.fillRect(0, 0, cw, ch);

      // Julio, big, hopping in the middle
      const s = julio[0][Math.floor(t * 3) % 2 === 0 ? 0 : 0];
      const px = Math.max(3, Math.floor(Math.min(cw * 0.42, ch * 0.3) / s.h));
      const hop = Math.round(Math.abs(Math.sin(t * 2.5)) * px * 3);
      const cx = cw / 2, cy = ch * 0.47;
      ctx.fillStyle = "rgba(16,8,40,0.35)";
      const shW = Math.round(s.w * px * 0.6 * (1 - hop / (px * 12)));
      ctx.fillRect(Math.round(cx - shW / 2), Math.round(cy + (s.h * px) / 2 - px * 2), shW, px * 2);
      drawJulioBig(ctx, cx, cy - hop, px);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles.root} ref={wrapRef}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <h1 className={styles.logo}>
        <span className={styles.logoSmall}>¿DÓNDE ESTÁ</span>
        <span className={styles.logoBig} style={{ fontSize: bigSize }}>{shown.toUpperCase()}?</span>
      </h1>
      <div className={styles.bottomBar}>
        <label className={styles.nameField}>
          <span className={styles.nameLabel}>¿QUIÉN JUEGA?</span>
          <input
            className={styles.nameInput}
            type="text"
            value={draft}
            placeholder={DEFAULT_NAME}
            maxLength={NAME_MAX}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            onChange={(e) => { setDraft(e.target.value); onNameChange(cleanName(e.target.value)); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.currentTarget.blur(); onStart(); } }}
          />
        </label>
        <button className={styles.startBtn} onClick={() => onStart()}>EMPEZAR</button>
        <p className={styles.hint}>Encontrá a {shown} 3 veces en cada mundo</p>
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
