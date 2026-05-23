export type NpcPos = { x: number; y: number; variant: number };
export type Placement = { julio: { x: number; y: number }; npcs: NpcPos[] };

export interface WorldModule {
  width: number;
  height: number;
  npcCount: number;
  title: string;
  buildScene(): unknown;
  placeCharacters(seed: number, scene: unknown): Placement;
  renderBackground(ctx: CanvasRenderingContext2D, scene: unknown, time: number): void;
  renderUnder(ctx: CanvasRenderingContext2D, scene: unknown, time: number): void;
  renderOver(ctx: CanvasRenderingContext2D, scene: unknown, time: number): void;
}
