"use client";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { getWorld } from "../worlds";
import type { Placement, WorldModule } from "../worlds/types";
import { loadProgress, saveProgress } from "../storage";

export type Phase = "searching" | "found_anim" | "fail_anim" | "world_complete";

export type GameState = {
  world: number;
  step: number;
  total: number;
  worldModule: WorldModule;
  finds: number;
  wrongClicks: number;
  phase: Phase;
  seed: number;
  scene: unknown;
  placement: Placement;
  nextPlacement: Placement;
  attemptIndex: number;
};

const INITIAL_SEED = 0xC0FFEE;
const TOTAL_WORLDS = 12;
const ANIM_MS = 1500;
const FAIL_ANIM_MS = 1500;
const MAX_WRONG = 5;
const FINDS_TO_COMPLETE = 3;

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function freshSequence(): number[] {
  return shuffle(Array.from({ length: TOTAL_WORLDS }, (_, i) => i + 1), Math.random);
}

// ───────── Reducer ─────────

type S = {
  sequence: number[];
  step: number;
  finds: number;
  wrongClicks: number;
  attemptIndex: number;
  phase: Phase;
};

type Action =
  | { type: "CLICK_JULIO" }
  | { type: "CLICK_OTHER" }
  | { type: "ANIM_DONE" }
  | { type: "NEXT_WORLD" }
  | { type: "RESET_WORLD" };

function reducer(s: S, a: Action): S {
  switch (a.type) {
    case "CLICK_JULIO":
      if (s.phase !== "searching") return s;
      return { ...s, phase: "found_anim" };

    case "CLICK_OTHER": {
      if (s.phase !== "searching") return s;
      const wrongClicks = s.wrongClicks + 1;
      if (wrongClicks >= MAX_WRONG) {
        return { ...s, wrongClicks, phase: "fail_anim" };
      }
      return { ...s, wrongClicks };
    }

    case "ANIM_DONE": {
      if (s.phase === "found_anim") {
        const finds = s.finds + 1;
        if (finds >= FINDS_TO_COMPLETE) {
          return { ...s, finds, phase: "world_complete" };
        }
        return { ...s, finds, wrongClicks: 0, attemptIndex: s.attemptIndex + 1, phase: "searching" };
      }
      if (s.phase === "fail_anim") {
        return { ...s, wrongClicks: 0, attemptIndex: s.attemptIndex + 1, phase: "searching" };
      }
      return s;
    }

    case "NEXT_WORLD": {
      const nextStep = s.step + 1;
      if (nextStep >= TOTAL_WORLDS) {
        return {
          sequence: freshSequence(),
          step: 0,
          finds: 0,
          wrongClicks: 0,
          attemptIndex: 0,
          phase: "searching",
        };
      }
      return {
        ...s,
        step: nextStep,
        finds: 0,
        wrongClicks: 0,
        attemptIndex: 0,
        phase: "searching",
      };
    }

    case "RESET_WORLD":
      return { ...s, finds: 0, wrongClicks: 0, attemptIndex: 0, phase: "searching" };
  }
}

function initialState(): S {
  const saved = loadProgress();
  const sequence = saved.currentSequence && saved.currentSequence.length === TOTAL_WORLDS
    ? saved.currentSequence
    : freshSequence();
  const step = typeof saved.currentStep === "number" && saved.currentStep >= 0 && saved.currentStep < TOTAL_WORLDS
    ? saved.currentStep
    : 0;
  return { sequence, step, finds: 0, wrongClicks: 0, attemptIndex: 0, phase: "searching" };
}

// ───────── Hook ─────────

export function useGameState() {
  const [s, dispatch] = useReducer(reducer, undefined, initialState);

  const world = s.sequence[s.step] ?? 1;
  const worldModule = useMemo(() => getWorld(world), [world]);
  const scene = useMemo(() => worldModule.buildScene(), [worldModule]);
  const seed = useMemo(() => INITIAL_SEED + world * 1000 + s.attemptIndex * 31, [world, s.attemptIndex]);
  const nextSeed = useMemo(() => INITIAL_SEED + world * 1000 + (s.attemptIndex + 1) * 31, [world, s.attemptIndex]);
  const placement = useMemo(() => worldModule.placeCharacters(seed, scene), [worldModule, seed, scene]);
  const nextPlacement = useMemo(() => worldModule.placeCharacters(nextSeed, scene), [worldModule, nextSeed, scene]);

  // Schedule ANIM_DONE on transition phases. Cleanup on unmount or phase change to prevent stale dispatches.
  useEffect(() => {
    if (s.phase === "found_anim") {
      const t = setTimeout(() => dispatch({ type: "ANIM_DONE" }), ANIM_MS);
      return () => clearTimeout(t);
    }
    if (s.phase === "fail_anim") {
      const t = setTimeout(() => dispatch({ type: "ANIM_DONE" }), FAIL_ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [s.phase]);

  // Persist progress on world_complete + step/sequence changes.
  useEffect(() => {
    const prev = loadProgress();
    const update = {
      ...prev,
      currentSequence: s.sequence,
      currentStep: s.step,
    };
    if (s.phase === "world_complete") {
      update.worldsCompleted = (prev.worldsCompleted ?? 0) + 1;
      const prevBest = prev.bestWrongPerWorld[world];
      if (prevBest === undefined || s.wrongClicks < prevBest) {
        update.bestWrongPerWorld = { ...prev.bestWrongPerWorld, [world]: s.wrongClicks };
      }
    }
    saveProgress(update);
  }, [s.sequence, s.step, s.phase, world, s.wrongClicks]);

  const registerWrong = useCallback(() => dispatch({ type: "CLICK_OTHER" }), []);
  const registerFind = useCallback(() => dispatch({ type: "CLICK_JULIO" }), []);
  const nextWorld = useCallback(() => dispatch({ type: "NEXT_WORLD" }), []);
  const resetWorld = useCallback(() => dispatch({ type: "RESET_WORLD" }), []);

  // `phase` exposed to GameCanvas: collapses fail_anim → found_anim for backwards
  // compat (canvas treats both as "transition" — same overlay/anim hooks).
  const phaseForUi: Phase = s.phase === "fail_anim" ? "found_anim" : s.phase;

  const state: GameState = {
    world,
    step: s.step,
    total: TOTAL_WORLDS,
    worldModule,
    finds: s.finds,
    wrongClicks: s.wrongClicks,
    phase: phaseForUi,
    seed,
    scene,
    placement,
    nextPlacement,
    attemptIndex: s.attemptIndex,
  };
  return { state, registerWrong, registerFind, nextWorld, resetWorld };
}
