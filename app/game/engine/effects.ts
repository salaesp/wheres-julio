// Small pixel-art effect sprites (emote bubble, hearts, miss marker).
import { makeSprite, lazy } from "./sprite";

export const HEART = lazy(() => makeSprite([
  ".rr.rr.",
  "rwrrrrr",
  "rrrrrrr",
  ".rrrrr.",
  "..rrr..",
  "...r...",
], { r: "#f85898", w: "#ffd8e8" }, { outline: true }));

export const MISS = lazy(() => makeSprite([
  "xx...xx",
  "xxx.xxx",
  ".xxxxx.",
  "..xxx..",
  ".xxxxx.",
  "xxx.xxx",
  "xx...xx",
], { x: "#f84040" }, { outline: true, outlineColor: "#ffffff" }));

/** Pokémon-style "!" emote bubble. */
export const EMOTE = lazy(() => makeSprite([
  ".wwwwwwww.",
  "wwwwrrwwww",
  "wwwwrrwwww",
  "wwwwrrwwww",
  "wwwwrrwwww",
  "wwwwwwwwww",
  "wwwwrrwwww",
  ".wwwwwwww.",
  "...ww.....",
  "...w......",
], { w: "#ffffff", r: "#e83030" }, { outline: true, outlineColor: "#282838" }));

/** "?" bubble shown when Julio escapes (fail). */
export const EMOTE_Q = lazy(() => makeSprite([
  ".wwwwwwww.",
  "wwwbbbbwww",
  "wwbbwwbbww",
  "wwwwwbbwww",
  "wwwwbbwwww",
  "wwwwwwwwww",
  "wwwwbbwwww",
  ".wwwwwwww.",
  "...ww.....",
  "...w......",
], { w: "#ffffff", b: "#3058d0" }, { outline: true, outlineColor: "#282838" }));

export const SPARKLE = lazy(() => makeSprite([
  "..w..",
  "..y..",
  "wyWyw",
  "..y..",
  "..w..",
], { w: "#ffffff", y: "#f8e070", W: "#ffffff" }));
