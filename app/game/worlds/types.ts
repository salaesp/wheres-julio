export type NpcPos = { x: number; y: number; variant: number };
export type Placement = { julio: { x: number; y: number }; npcs: NpcPos[] };

// Generic world module. Each world parameterizes its scene type internally;
// callers (hook, GameCanvas) treat scene as opaque (`unknown`) at the boundary.
export interface WorldModule<TScene = unknown> {
  width: number;
  height: number;
  npcCount: number;
  title: string;
  buildScene(): TScene;
  placeCharacters(seed: number, scene: TScene): Placement;
  renderBackground(ctx: CanvasRenderingContext2D, scene: TScene, time: number): void;
  renderUnder(ctx: CanvasRenderingContext2D, scene: TScene, time: number): void;
  renderOver(ctx: CanvasRenderingContext2D, scene: TScene, time: number): void;
}

// Opaque alias for code that doesn't care about the scene type.
export type AnyWorldModule = WorldModule<unknown>;

// Helper for declaring a world with strong scene typing internally while exposing
// AnyWorldModule. Renderers/placeCharacters can take `TScene` directly; the unsafe
// cast happens once at the module boundary instead of every render call.
export function defineWorld<TScene>(m: WorldModule<TScene>): AnyWorldModule {
  return m as unknown as AnyWorldModule;
}

