// localStorage persistence helpers. SSR-safe (no-op if window absent).

const KEY = "find-julio:v1";

export type Progress = {
  worldsCompleted: number;       // total mundos completados (todos los runs)
  bestWrongPerWorld: Record<number, number>; // por worldId, mínimo wrongClicks acumulados en un run
  currentSequence?: number[];    // permutación actual de mundos
  currentStep?: number;          // posición dentro de la secuencia
};

const DEFAULT: Progress = {
  worldsCompleted: 0,
  bestWrongPerWorld: {},
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage; } catch { return null; }
}

export function loadProgress(): Progress {
  const s = safeStorage();
  if (!s) return { ...DEFAULT };
  try {
    const raw = s.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return { ...DEFAULT, ...parsed, bestWrongPerWorld: { ...DEFAULT.bestWrongPerWorld, ...(parsed.bestWrongPerWorld ?? {}) } };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProgress(p: Progress) {
  const s = safeStorage();
  if (!s) return;
  try { s.setItem(KEY, JSON.stringify(p)); } catch { /* ignore quota */ }
}

export function clearProgress() {
  const s = safeStorage();
  if (!s) return;
  try { s.removeItem(KEY); } catch { /* ignore */ }
}
