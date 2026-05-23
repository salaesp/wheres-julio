// Shared character-placement helper. Each world declares colliders + (optional)
// allowed zones, this helper does the retry-loop + minDist enforcement.
import { createRng, randRange, randInt } from "../utils/seededRandom";
import { SPRITE_SIZE } from "../characters/primitives";
import type { NpcPos, Placement } from "./types";

export type PlacementOpts = {
  width: number;
  height: number;
  npcCount: number;
  /** Margin from each edge (default 16) */
  margin?: number;
  /** Extra padding from top (e.g. to avoid HUD overlap) */
  topPad?: number;
  /** Extra padding from bottom */
  bottomPad?: number;
  /** Variant range max (exclusive) for NPCs (default 12) */
  variantMax?: number;
  /** Minimum distance between placed NPCs in world units. Default = SPRITE_SIZE * 0.4 */
  minDist?: number;
  /** Max attempts per placement before giving up (default 800) */
  maxAttempts?: number;
  /** Returns true if (x,y) is solid / impassable for radius r */
  collides: (x: number, y: number, r: number) => boolean;
  /** Optional: returns true if (x,y) is inside a walkable zone. Default: anywhere */
  allowed?: (x: number, y: number) => boolean;
  /** Optional: fallback position if all retries fail */
  fallback?: { x: number; y: number };
};

export function placeWithColliders(seed: number, opts: PlacementOpts): Placement {
  const {
    width, height, npcCount,
    margin = 16,
    topPad = margin,
    bottomPad = margin + 30,
    variantMax = 12,
    minDist = SPRITE_SIZE * 0.4,
    maxAttempts = 800,
    collides,
    allowed,
    fallback,
  } = opts;

  const rng = createRng(seed);
  const npcs: NpcPos[] = [];
  const minDist2 = minDist * minDist;

  function tryPlace(): { x: number; y: number } {
    for (let i = 0; i < maxAttempts; i++) {
      const x = randRange(rng, margin, width - margin);
      const y = randRange(rng, topPad, height - bottomPad);
      if (allowed && !allowed(x, y)) continue;
      if (collides(x, y, 10)) continue;
      let ok = true;
      for (const n of npcs) {
        const dx = n.x - x, dy = n.y - y;
        if (dx * dx + dy * dy < minDist2) { ok = false; break; }
      }
      if (ok) return { x, y };
    }
    return fallback ?? { x: width / 2, y: height / 2 };
  }

  for (let i = 0; i < npcCount; i++) {
    const p = tryPlace();
    npcs.push({ x: p.x, y: p.y, variant: randInt(rng, 0, variantMax) });
  }
  const julio = tryPlace();
  return { julio, npcs };
}
