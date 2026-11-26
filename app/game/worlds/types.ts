import type { Dir, Outfit } from "../engine/characters";
import type { PropInstance } from "../engine/props";
import type { Sprite } from "../engine/sprite";

export type NpcPos = { x: number; y: number; variant: number; dir: Dir };
export type JulioPos = { x: number; y: number; dir: Dir };
export type Placement = { julio: JulioPos; npcs: NpcPos[] };

/** A window of a cover tile (tall grass) drawn over a character's legs. */
export type CoverPiece = { sprite: Sprite; sx: number; sy: number; w: number; h: number; x: number; y: number };

// A world is a tile map + props. All coordinates are native game pixels
// (16px tiles); GameCanvas renders at that resolution and upscales.
export interface WorldModule<TScene = unknown> {
  width: number;
  height: number;
  npcCount: number;
  title: string;
  /** Color shown around the map (letterbox). */
  background: string;
  outfit?: Outfit;
  outfitKey: string;
  buildScene(): TScene;
  placeCharacters(seed: number, scene: TScene): Placement;
  /** Static ground: terrain + flat props. Rendered once and cached. */
  drawGround(ctx: CanvasRenderingContext2D, scene: TScene): void;
  /** Animated terrain tiles (water…), drawn every frame over the cache. */
  drawAnimated(ctx: CanvasRenderingContext2D, scene: TScene, time: number): void;
  /** Depth-sorted props (drawn together with characters). */
  props(scene: TScene): PropInstance[];
  /** Overlays that hide the feet of a character standing at (x, y). */
  coverAt(scene: TScene, x: number, y: number): CoverPiece[];
}

export type AnyWorldModule = WorldModule<unknown>;
