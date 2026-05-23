"use client";
import { useEffect, useRef, useState } from "react";

export function useCamera(worldWidth: number, viewportWidth: number) {
  const [cameraX, setCameraX] = useState(0);
  const targetX = useRef(0);
  const keys = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const mouseEdge = useRef(0); // -1..1 — how close to edge

  // Smooth follow loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // keyboard input
      const speed = 700; // px/s
      if (keys.current.left) targetX.current -= speed * dt;
      if (keys.current.right) targetX.current += speed * dt;
      // mouse edge pan
      if (Math.abs(mouseEdge.current) > 0.01) {
        targetX.current += mouseEdge.current * speed * dt;
      }
      const maxX = Math.max(0, worldWidth - viewportWidth);
      if (targetX.current < 0) targetX.current = 0;
      if (targetX.current > maxX) targetX.current = maxX;
      setCameraX((c) => c + (targetX.current - c) * Math.min(1, dt * 8));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [worldWidth, viewportWidth]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const setMouseX = (clientX: number, viewportW: number) => {
    const edge = 80;
    if (clientX < edge) mouseEdge.current = -(1 - clientX / edge);
    else if (clientX > viewportW - edge) mouseEdge.current = (clientX - (viewportW - edge)) / edge;
    else mouseEdge.current = 0;
  };

  const setTarget = (x: number) => {
    targetX.current = x;
  };

  return { cameraX, setMouseX, setTarget };
}
