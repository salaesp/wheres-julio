// Per-world accent color used by the HUD to tint the level name and progress.
// Indexed by the 1-based `world` id used in `getWorld()`.
export const WORLD_ACCENTS: Record<number, string> = {
  1: "#a3e07c",  // La Plaza - parque verde
  2: "#5ec5ff",  // La Playa - cian playa
  3: "#7dd87c",  // La Granja - verde campo
  4: "#a8e0ff",  // El Polo Norte - hielo
  5: "#5fb878",  // La Jungla - verde selva
  6: "#5fc8d8",  // El Parque Acuático - aqua
  7: "#d4955a",  // El Barco Pirata - madera
  8: "#ff8a5b",  // La Maratón - naranja deporte
  9: "#ff9bbf",  // La Escuela - rosa
  10: "#e0a060", // El Mundo Gigante - madera escritorio
  11: "#e0e0e0", // El Tablero - blanco-negro
  12: "#5cf5ff", // La Computadora - cian tech
};

export function getAccent(world: number): string {
  return WORLD_ACCENTS[world] ?? "#ffe66d";
}
