import { worldModule as parkModule } from "./moonWorld";
import { worldModule as beachModule } from "./beachWorld";
import { worldModule as farmModule } from "./farmWorld";
import { worldModule as iceModule } from "./icePoleWorld";
import { worldModule as jungleModule } from "./jungleWorld";
import type { WorldModule } from "./types";

export function getWorld(world: number): WorldModule {
  if (world >= 5) return jungleModule;
  if (world === 4) return iceModule;
  if (world === 3) return farmModule;
  if (world === 2) return beachModule;
  return parkModule;
}
