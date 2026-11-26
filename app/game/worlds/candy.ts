// PLACEHOLDER — se reemplaza por el mundo real.
import { defineWorld } from "../engine/world";
import { GRASS } from "../engine/terrains/common";

export const worldModule = defineWorld({
  title: "La Ciudad de Golosinas",
  npcCount: 40,
  legend: { ".": GRASS },
  map: Array.from({ length: 26 }, () => "..............."),
});
