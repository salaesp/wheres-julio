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

// ── Player name: the hidden kid takes the name of whoever is playing ──
const NAME_KEY = "find-julio:name";
export const DEFAULT_NAME = "Julio";
export const NAME_MAX = 12;

/** Trim, collapse spaces and cap length; empty → default name. */
export function cleanName(raw: string): string {
  const n = raw.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
  return n || DEFAULT_NAME;
}

export function loadName(): string {
  const s = safeStorage();
  if (!s) return DEFAULT_NAME;
  try { return cleanName(s.getItem(NAME_KEY) ?? ""); } catch { return DEFAULT_NAME; }
}

export function saveName(name: string) {
  const s = safeStorage();
  if (!s) return;
  try { s.setItem(NAME_KEY, cleanName(name)); } catch { /* ignore */ }
}
