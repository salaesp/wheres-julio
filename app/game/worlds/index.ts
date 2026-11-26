import { worldModule as plaza } from "./plaza";
import { worldModule as beach } from "./beach";
import { worldModule as farm } from "./farm";
import { worldModule as polar } from "./polar";
import { worldModule as jungle } from "./jungle";
import { worldModule as aquapark } from "./aquapark";
import { worldModule as pirate } from "./pirate";
import { worldModule as marathon } from "./marathon";
import { worldModule as school } from "./school";
import { worldModule as giantDesk } from "./giantDesk";
import { worldModule as chess } from "./chess";
import { worldModule as computer } from "./computer";
import { worldModule as candy } from "./candy";
import { worldModule as museum } from "./museum";
import { worldModule as undersea } from "./undersea";
import { worldModule as zoo } from "./zoo";
import { worldModule as volcano } from "./volcano";
import type { WorldModule } from "./types";

// Ordered registry. World ids are 1-based positions in this array (see accents.ts).
export const WORLDS: readonly WorldModule[] = [
  plaza,
  beach, farm, polar, jungle, aquapark, pirate, marathon, school, giantDesk, chess, computer,
  candy, museum, undersea, zoo, volcano,
];

export const WORLD_COUNT = WORLDS.length;

export function getWorld(world: number): WorldModule {
  const idx = Math.max(1, Math.min(WORLDS.length, world)) - 1;
  return WORLDS[idx];
}
