// Overworld characters in the style of the GBA Pokémon games: chibi 16px wide
// people, built from layered templates (body + legs + hair + hat) and recolored
// per NPC, with 4 facing directions and a 2-step walk cycle. Julio is a kid in
// a green dinosaur costume.
import { Sprite, gridSprite, stack, toGrid, flipGrid, outlineGrid, padGrid, type Grid, type Pal } from "./sprite";
import { createRng, randInt } from "../utils/seededRandom";
import { mix } from "./color";

export type Dir = 0 | 1 | 2 | 3; // down, up, left, right
export const DIRS: Dir[] = [0, 1, 2, 3];

// Role letters used by every template:
//  K skin  k skin shadow  E eye
//  H hair  h hair shadow  g hair shine
//  T top   t top shadow
//  P lower (pants/skirt)  p lower shadow
//  F shoes
//  X hat   x hat shadow   W hat detail

type View = "front" | "back" | "side";

// ── Heads + torsos ───────────────────────────────────────────────────────────
const HEAD: Record<View, string[]> = {
  front: [
    "................",
    "................",
    "................",
    ".....KKKKKK.....",
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "...KKKKKKKKKK...",
    "...KKEKKKKEKK...",
    "...KKEKKKKEKK...",
    "...kKKKKKKKKk...",
    "....kKKKKKKk....",
    ".....kkKKkk.....",
  ],
  back: [
    "................",
    "................",
    "................",
    ".....KKKKKK.....",
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "...KKKKKKKKKK...",
    "...KKKKKKKKKK...",
    "...KKKKKKKKKK...",
    "...kKKKKKKKKk...",
    "....kKKKKKKk....",
    ".....kkKKkk.....",
  ],
  side: [
    "................",
    "................",
    "................",
    ".....KKKKKK.....",
    "....KKKKKKKK....",
    "...KKKKKKKKKK...",
    "...KKKKKKKKKK...",
    "..KKEKKKKKKKK...",
    "...KEKKKKKKKK...",
    "...KKKKKKKKKk...",
    "....kKKKKKKk....",
    ".....kkKKk......",
  ],
};

const TORSO: Record<View, string[]> = {
  front: [
    "....TTTTTTTT....",
    "...TTTTTTTTTT...",
    "..TTtTTTTTTtTT..",
    "..TTtTTTTTTtTT..",
    "..KKttttttttKK..",
  ],
  back: [
    "....TTTTTTTT....",
    "...TTTTTTTTTT...",
    "..TTtTTTTTTtTT..",
    "..TTtTTTTTTtTT..",
    "..KKttttttttKK..",
  ],
  side: [
    ".....TTTTTT.....",
    "....TTTTTTTT....",
    "....TTTtTTTT....",
    "....TTTtTTTT....",
    "....tttKtttt....",
  ],
};

// Legs: [standing, stepA, stepB] per view and lower-body kind.
type Lower = "pants" | "shorts" | "skirt";
const LEGS: Record<Lower, Record<View, string[][]>> = {
  pants: {
    front: [
      ["....PPPPPPPP....", "....PPPPPPPP....", "....PPp..pPP....", "....FFF..FFF...."],
      ["....PPPPPPPP....", "....PPPPPPPP....", "....PPp..FFF....", "....FFF........."],
      ["....PPPPPPPP....", "....PPPPPPPP....", "....FFF..pPP....", ".........FFF...."],
    ],
    back: [
      ["....PPPPPPPP....", "....PPPPPPPP....", "....PPp..pPP....", "....FFF..FFF...."],
      ["....PPPPPPPP....", "....PPPPPPPP....", "....PPp..FFF....", "....FFF........."],
      ["....PPPPPPPP....", "....PPPPPPPP....", "....FFF..pPP....", ".........FFF...."],
    ],
    side: [
      [".....PPPPPP.....", ".....PPPPPP.....", ".....PPPPpP.....", "....FFFFFF......"],
      [".....PPPPPP.....", "....PPp.PPP.....", "...PPp...PPp....", "...FFF...FFF...."],
      [".....PPPPPP.....", ".....PPPPPP.....", ".....PPPPpP.....", "....FFFFFF......"],
    ],
  },
  shorts: {
    front: [
      ["....PPPPPPPP....", "....PPp..pPP....", "....KKk..kKK....", "....FFF..FFF...."],
      ["....PPPPPPPP....", "....PPp..pPP....", "....KKk..FFF....", "....FFF........."],
      ["....PPPPPPPP....", "....PPp..pPP....", "....FFF..kKK....", ".........FFF...."],
    ],
    back: [
      ["....PPPPPPPP....", "....PPp..pPP....", "....KKk..kKK....", "....FFF..FFF...."],
      ["....PPPPPPPP....", "....PPp..pPP....", "....KKk..FFF....", "....FFF........."],
      ["....PPPPPPPP....", "....PPp..pPP....", "....FFF..kKK....", ".........FFF...."],
    ],
    side: [
      [".....PPPPPP.....", ".....PPPPpP.....", ".....KKKKk......", "....FFFFFF......"],
      [".....PPPPPP.....", "....PPp.PPP.....", "...KKk...KKk....", "...FFF...FFF...."],
      [".....PPPPPP.....", ".....PPPPpP.....", ".....KKKKk......", "....FFFFFF......"],
    ],
  },
  skirt: {
    front: [
      ["....PPPPPPPP....", "...PPpPPPPpPP...", ".....KK..KK.....", ".....FF..FF....."],
      ["....PPPPPPPP....", "...PPpPPPPpPP...", ".....KK..FF.....", ".....FF........."],
      ["....PPPPPPPP....", "...PPpPPPPpPP...", ".....FF..KK.....", ".........FF....."],
    ],
    back: [
      ["....PPPPPPPP....", "...PPpPPPPpPP...", ".....KK..KK.....", ".....FF..FF....."],
      ["....PPPPPPPP....", "...PPpPPPPpPP...", ".....KK..FF.....", ".....FF........."],
      ["....PPPPPPPP....", "...PPpPPPPpPP...", ".....FF..KK.....", ".........FF....."],
    ],
    side: [
      [".....PPPPPP.....", "....PPPPPPpP....", "......KKK.......", ".....FFFF......."],
      [".....PPPPPP.....", "....PPPPPPpP....", ".....K...K......", "....FF...FF....."],
      [".....PPPPPP.....", "....PPPPPPpP....", "......KKK.......", ".....FFFF......."],
    ],
  },
};

// ── Hair (rows from the top of the 16-wide head area) ────────────────────────
type HairStyle = "short" | "spiky" | "long" | "bun" | "curly" | "bald" | "bob";
const HAIR: Record<HairStyle, Record<View, string[]>> = {
  short: {
    front: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHhHHHhHHHh..",
      "..hH........Hh..",
    ],
    back: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "...hhHHHHHHhh...",
      "....hhhhhhhh....",
    ],
    side: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "...hHHHHHHHHHh..",
      "...hHhHHHHHHHh..",
      ".......hHHHHHh..",
      "........hHHHHh..",
      ".........hHHh...",
    ],
  },
  spiky: {
    front: [
      "................",
      "....h..h..h.....",
      "...hH.hHhhHh.h..",
      "..hHHhHHHHHHhH..",
      "..hHHHgggHHHHh..",
      ".hHHHHHHHHHHHHh.",
      "..hHhHHhHHhHHh..",
      "..hH........Hh..",
    ],
    back: [
      "................",
      "....h..h..h.....",
      "...hH.hHhhHh.h..",
      "..hHHhHHHHHHhH..",
      "..hHHHgggHHHHh..",
      ".hHHHHHHHHHHHHh.",
      "..hHHHHHHHHHHh..",
      ".hHHHHHHHHHHHHh.",
      "..hHHHHHHHHHHh..",
      "...hhHhHHhHhh...",
      "....h.h..h.h....",
    ],
    side: [
      "................",
      ".......h..h.....",
      ".....hHhhHh.h...",
      "....hHHHHHHhH...",
      "...hHHgggHHHHh..",
      "...hHHHHHHHHHHh.",
      "...hHhHHHHHHHh..",
      ".......hHHHHHHh.",
      "........hHHHHh..",
      ".........hHhh...",
    ],
  },
  long: {
    front: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHHhHHhHHHh..",
      "..hHh......hHh..",
      "..hHh......hHh..",
      "..hHh......hHh..",
      "..hHHh....hHHh..",
      "..hHHh....hHHh..",
      "..hhh......hhh..",
    ],
    back: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHhHHhHHHh..",
      "...hhh.hh.hhh...",
    ],
    side: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "...hHHHHHHHHHh..",
      "...hHhHHHHHHHh..",
      ".......hHHHHHh..",
      "........HHHHHh..",
      "........hHHHHh..",
      "........hHHHHh..",
      ".........HHHHh..",
      ".........hHHHh..",
      "..........hhh...",
    ],
  },
  bun: {
    front: [
      "......hHHh......",
      ".....hHggHh.....",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hH........Hh..",
    ],
    back: [
      "......hHHh......",
      ".....hHggHh.....",
      ".....hhHHhh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "...hhHHHHHHhh...",
      "....hhhhhhhh....",
    ],
    side: [
      "..........hHh...",
      ".........hHgHh..",
      ".....hHHHhHHh...",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "...hHHHHHHHHHh..",
      "...hHHHHHHHHHh..",
      ".......hHHHHHh..",
      "........hHHHHh..",
      ".........hHHh...",
    ],
  },
  curly: {
    front: [
      "................",
      "....hHHHHHHh....",
      "..hHHgHHHHgHHh..",
      ".hHHHHHHHHHHHHh.",
      ".hHgHHHHHHHgHHh.",
      ".hHHHHHHHHHHHHh.",
      ".hHHHHhHHhHHHHh.",
      ".hHH........HHh.",
      "..hH........Hh..",
    ],
    back: [
      "................",
      "....hHHHHHHh....",
      "..hHHgHHHHgHHh..",
      ".hHHHHHHHHHHHHh.",
      ".hHgHHHHHHHgHHh.",
      ".hHHHHHHHHHHHHh.",
      ".hHHHHHHHHHHHHh.",
      ".hHHgHHHHHHgHHh.",
      ".hHHHHHHHHHHHHh.",
      "..hHHHHHHHHHHh..",
      "...hhhhhhhhhh...",
    ],
    side: [
      "................",
      "....hHHHHHHh....",
      "...hHgHHHHgHHh..",
      "..hHHHHHHHHHHHh.",
      "..hHHHHHHHgHHHh.",
      "..hHHHHHHHHHHHh.",
      "..hHhHHHHHHHHHh.",
      ".......hHHHHHHh.",
      "........hHHHHHh.",
      ".........hHHHh..",
    ],
  },
  bald: {
    front: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "..hh........hh..",
      "..hH........Hh..",
    ],
    back: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "..hH........Hh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "...hhHHHHHHhh...",
    ],
    side: [
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
      "...........hh...",
      ".........hHHh...",
      ".........hHHh...",
      "..........hh....",
    ],
  },
  bob: {
    front: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHH......HHh..",
      "..hHh......hHh..",
      "..hHh......hHh..",
      "..hhh......hhh..",
    ],
    back: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hHHHHHHHHHHh..",
      "..hhhhhhhhhhhh..",
    ],
    side: [
      "................",
      "................",
      ".....hHHHHh.....",
      "....hHHHHHHh....",
      "...hHHgggHHHh...",
      "...hHHHHHHHHHh..",
      "...hHHHHHHHHHh..",
      ".......hHHHHHh..",
      ".......hHHHHHh..",
      ".......hHHHHHh..",
      ".......hhhhhhh..",
    ],
  },
};

// ── Hats ─────────────────────────────────────────────────────────────────────
export type HatStyle = "none" | "cap" | "beanie" | "sunhat" | "bandana" | "goggles" | "helmet" | "dinohood" | "party";
// Hats that sit on top of the hair instead of replacing its crown.
const KEEP_HAIR = new Set<HatStyle>(["goggles", "party"]);
const HAT: Record<Exclude<HatStyle, "none">, Record<View, string[]>> = {
  cap: {
    front: [
      "................",
      ".....XXXXXX.....",
      "....XXXWWXXX....",
      "...XXXWXXWXXX...",
      "..XXXXXXXXXXXX..",
      "..xxxxxxxxxxxx..",
    ],
    back: [
      "................",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "...XXXXXXXXXX...",
      "..XXXXXXXXXXXX..",
      "..XXXxxxxxxXXX..",
    ],
    side: [
      "................",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "...XXXXXXXXXX...",
      "..XXXXXXXXXXXX..",
      "xxxxxxXXXXXXXX..",
    ],
  },
  beanie: {
    front: [
      "......WWWW......",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "...XXXXXXXXXX...",
      "..XxXxXxXxXxXX..",
      "..xxxxxxxxxxxx..",
    ],
    back: [
      "......WWWW......",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "...XXXXXXXXXX...",
      "..XxXxXxXxXxXX..",
      "..xxxxxxxxxxxx..",
    ],
    side: [
      ".......WWWW.....",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "...XXXXXXXXXX...",
      "...xXxXxXxXxXX..",
      "...xxxxxxxxxxx..",
    ],
  },
  sunhat: {
    front: [
      "................",
      "................",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "....WWWWWWWW....",
      "XXXXXXXXXXXXXXXX",
      ".xxxxxxxxxxxxxx.",
    ],
    back: [
      "................",
      "................",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "....WWWWWWWW....",
      "XXXXXXXXXXXXXXXX",
      ".xxxxxxxxxxxxxx.",
    ],
    side: [
      "................",
      "................",
      ".....XXXXXX.....",
      "....XXXXXXXX....",
      "....WWWWWWWW....",
      ".XXXXXXXXXXXXXX.",
      "..xxxxxxxxxxxx..",
    ],
  },
  // Diving mask + snorkel (eyes visible through the glass).
  goggles: {
    front: [
      "................",
      "................",
      ".............x..",
      ".............x..",
      ".............x..",
      "..XXXXXXXXXXXXx.",
      "..XWWWWXXWWWWX..",
      "..XWWEWXXWEWWX..",
      "..XWWEWXXWEWWX..",
      "..XXXXXXXXXXXX..",
    ],
    back: [
      "................",
      "................",
      ".............x..",
      ".............x..",
      ".............x..",
      ".............x..",
      "..xXXXXXXXXXXx..",
    ],
    side: [
      "................",
      "................",
      "..........x.....",
      "..........x.....",
      "..........x.....",
      "..........x.....",
      ".XXXXXXXXXXXXX..",
      ".XWWEX..........",
      ".XWWEX..........",
      ".XXXXX..........",
    ],
  },
  // Explorer pith helmet.
  helmet: {
    front: [
      "................",
      "......XXXX......",
      "....XXWWXXXX....",
      "...XXWXXXXXXX...",
      "...XXXXXXXXXX...",
      ".xxxxxxxxxxxxxx.",
    ],
    back: [
      "................",
      "......XXXX......",
      "....XXXXXXXX....",
      "...XXXXXXXXXX...",
      "...XXXXXXXXXX...",
      ".xxxxxxxxxxxxxx.",
    ],
    side: [
      "................",
      "......XXXX......",
      "....XXWWXXXX....",
      "...XXWXXXXXXX...",
      "...XXXXXXXXXX...",
      "xxxxxxxxxxxxxxx.",
    ],
  },
  // Dino hood in other colors — decoys that look a bit like Julio.
  dinohood: {
    front: [
      "......x..x......",
      ".....XxXXxX.....",
      "....XXXXXXXX....",
      "...XWEXXXXWEX...",
      "..XXXXXXXXXXXX..",
      "..XWXWXWXWXWXX..",
      "..XX........XX..",
      "..XX........XX..",
      "..XX........XX..",
      "..xX........Xx..",
      "..xx........xx..",
    ],
    back: [
      ".......x........",
      "......XxX.......",
      "....XXXxXXXX....",
      "...XXXXXXXXXX...",
      "..XXXXXxxXXXXX..",
      "..XXXXXXXXXXXX..",
      "..XXXXXxxXXXXX..",
      "..XXXXXXXXXXXX..",
      "..XXXXXxxXXXXX..",
      "...XXXXXXXXXX...",
      "....xxxxxxxx....",
    ],
    side: [
      ".........x......",
      "......XXXxX.....",
      ".....XXXXXXx....",
      "...XXWEXXXXXX...",
      "..XXXXXXXXXXXx..",
      "..WXWXXXXXXXXX..",
      "......XXXXXXXXx.",
      ".......XXXXXXX..",
      ".......XXXXXXX..",
      "........xXXXXx..",
      ".........xxxx...",
    ],
  },
  // Party cone hat on top of the hair.
  party: {
    front: [".......W........", "......XWX.......", "......XXW.......", ".....XWXXX......"],
    back: [".......W........", "......XWX.......", "......XXW.......", ".....XWXXX......"],
    side: [".......W........", "......XWX.......", "......XXW.......", ".....XWXXX......"],
  },
  bandana: {
    front: [
      "................",
      "................",
      "................",
      "....XXXXXXXX....",
      "...XXWXXXXWXX...",
      "..xxxxxxxxxxxx..",
    ],
    back: [
      "................",
      "................",
      "................",
      "....XXXXXXXX....",
      "...XXWXXXXWXX...",
      "..xxxxxxxxxxxx..",
      ".......xx.......",
      "......xX.x......",
    ],
    side: [
      "................",
      "................",
      "................",
      "....XXXXXXXX....",
      "...XXWXXXXWXX...",
      "...xxxxxxxxxxxx.",
      ".............xx.",
    ],
  },
};

// ── Color tables ─────────────────────────────────────────────────────────────
const SKINS: [string, string][] = [
  ["#f8d8b8", "#e0b088"],
  ["#f0c8a0", "#d8a070"],
  ["#e0a878", "#c08050"],
  ["#c88858", "#a06838"],
  ["#a06840", "#7c4c2c"],
  ["#7a4a30", "#5a3420"],
];
const HAIRS: string[] = [
  "#383040", "#383040", "#583828", "#7a4a28", "#a86a38",
  "#e8c050", "#d86838", "#b0b0b8", "#5868c8", "#e878a8", "#7848a0",
];
const TOPS: string[] = [
  "#e84848", "#f08030", "#f8c838", "#58b8f0", "#3868d8", "#8858c8",
  "#f078a8", "#f8f8f8", "#48b0a0", "#a0d050", "#d8a050", "#404858",
  "#c83070", "#68c868", "#f0e0a0", "#3890b0",
];
const LOWERS: string[] = ["#4060a8", "#3a3a48", "#c8b080", "#686868", "#7a5038", "#e8e8f0", "#304878", "#a84040"];
const SHOES: string[] = ["#e84040", "#383838", "#f8f8f8", "#4868d8", "#7a5030", "#f0c030"];
const HATS: string[] = ["#e83838", "#3868e0", "#f8c830", "#48b048", "#f8f8f8", "#f07830", "#9050c0", "#383838"];

export type Look = {
  skin: [string, string];
  hair: string;
  hairStyle: HairStyle;
  hat: HatStyle;
  hatColor: string;
  top: string;
  lower: Lower;
  lowerColor: string;
  shoes: string;
  kid: boolean;
};

export type Outfit = {
  /** Probability weights for hats (none/cap/beanie/sunhat/bandana). */
  hats?: Partial<Record<HatStyle, number>>;
  /** Probability weights for lower body. */
  lowers?: Partial<Record<Lower, number>>;
  tops?: string[];
  lowerColors?: string[];
};

function weighted<K extends string>(rng: () => number, w: Partial<Record<K, number>>): K {
  const entries = Object.entries(w) as [K, number][];
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let r = rng() * total;
  for (const [k, v] of entries) {
    r -= v;
    if (r < 0) return k;
  }
  return entries[entries.length - 1][0];
}

// Decoy dino hoods are never green (that would be indistinguishable from Julio).
function hatColorFor(hat: HatStyle, c: string): string {
  if (hat === "dinohood" && c === "#48b048") return "#f07830";
  if (hat === "helmet") return "#d8c088";
  if (hat === "goggles") return c === "#f8f8f8" ? "#3868e0" : c;
  return c;
}

export function lookFor(variant: number, outfit: Outfit = {}): Look {
  const rng = createRng(0x51a7 + variant * 7919);
  const pick = <T,>(a: readonly T[]) => a[randInt(rng, 0, a.length)];
  const kid = rng() < 0.22;
  const hairStyle = weighted<HairStyle>(rng, {
    short: 4, spiky: 2, long: 3, bun: 1.2, curly: 1.5, bob: 2, bald: kid ? 0 : 0.8,
  });
  const hat = weighted<HatStyle>(rng, outfit.hats ?? { none: 6, cap: 2, beanie: 0.6, sunhat: 0.6, bandana: 0.4 });
  const lower = weighted<Lower>(rng, outfit.lowers ?? { pants: 5, shorts: 2.5, skirt: 2 });
  return {
    skin: pick(SKINS),
    hair: pick(HAIRS),
    hairStyle,
    hat,
    hatColor: hatColorFor(hat, pick(HATS)),
    top: pick(outfit.tops ?? TOPS),
    lower,
    lowerColor: pick(outfit.lowerColors ?? LOWERS),
    shoes: pick(SHOES),
    kid,
  };
}

function lookPal(l: Look): Pal {
  return {
    K: l.skin[0], k: l.skin[1], E: "#282030",
    H: l.hair, h: mix(l.hair, "#100818", 0.35), g: mix(l.hair, "#ffffff", 0.35),
    T: l.top, t: mix(l.top, "#201030", 0.25),
    P: l.lowerColor, p: mix(l.lowerColor, "#100818", 0.3),
    F: l.shoes,
    X: l.hatColor, x: mix(l.hatColor, "#100818", 0.3), W: mix(l.hatColor, "#ffffff", 0.6),
  };
}

function viewOf(dir: Dir): View {
  return dir === 0 ? "front" : dir === 1 ? "back" : "side";
}

/** Remove rows to make a kid (shorter torso + legs). */
function kidify(rows: string[]): string[] {
  // rows layout: 0-11 head, 12-16 torso, 17-20 legs
  return rows.filter((_, i) => i !== 13 && i !== 18);
}

function personGrid(l: Look, dir: Dir, step: 0 | 1 | 2): Grid {
  const view = viewOf(dir);
  const pal = lookPal(l);
  let body = [...HEAD[view], ...TORSO[view], ...LEGS[l.lower][view][step]];
  const hairRows = HAIR[l.hairStyle][view];
  const hatRows = l.hat !== "none" ? HAT[l.hat][view] : null;
  // Under a hat, hide the top hair rows the hat covers (avoids hair poking
  // through the crown) but keep the sides/back.
  let hair = hairRows;
  if (hatRows && !KEEP_HAIR.has(l.hat)) {
    const lastHat = hatRows.length - 1;
    hair = hairRows.map((r, i) => (i < lastHat - 1 ? ".".repeat(16) : r));
  }
  if (l.kid) {
    body = kidify(body);
    // hair and hat stay attached to the head (rows < 12) so no change needed,
    // except long hair that would reach the removed torso row.
    hair = hair.filter((_, i) => i !== 13);
  }
  const layers: Grid[] = [toGrid(body, pal), toGrid(hair, pal)];
  if (hatRows) layers.push(toGrid(hatRows, pal));
  let g = stack(...layers);
  // Normalize to a fixed 16×21 box (kids get 2 empty rows on top) so all
  // characters share the same anchor (feet at the bottom).
  const H = 21;
  while (g.length < H) g.unshift(Array(16).fill(null));
  if (dir === 3) g = flipGrid(g);
  return g;
}

export type CharFrames = Record<Dir, [Sprite, Sprite, Sprite]>;

function framesFrom(build: (dir: Dir, step: 0 | 1 | 2) => Grid): CharFrames {
  const out = {} as CharFrames;
  for (const d of DIRS) {
    out[d] = [0, 1, 2].map((s) => gridSprite(outlineGrid(padGrid(build(d, s as 0 | 1 | 2), 1)))) as [Sprite, Sprite, Sprite];
  }
  return out;
}

const personCache = new Map<string, CharFrames>();

export function personFrames(variant: number, outfit?: Outfit, outfitKey = ""): CharFrames {
  const key = `${outfitKey}:${variant}`;
  let f = personCache.get(key);
  if (!f) {
    const look = lookFor(variant, outfit);
    f = framesFrom((d, s) => personGrid(look, d, s));
    personCache.set(key, f);
  }
  return f;
}

// ── Julio: kid in a green dino costume ───────────────────────────────────────
const JULIO_PAL: Pal = {
  G: "#3cb46c", g: "#258a54", L: "#7ad890", S: "#1e6e44",
  Y: "#f8e8a8", y: "#e0c878",
  K: "#f8d0a8", k: "#e0a878", E: "#282030",
  W: "#ffffff", D: "#202020",
};

const JULIO_ROWS: Record<View, string[][]> = {
  front: [[
    "................",
    "................",
    "......S..S......",
    ".....GSGGSG.....",
    "....GGGGGGGG....",
    "...GWDGGGGWDG...",
    "..GGGGGGGGGGGG..",
    "..GWGWGWGWGWGG..",
    "..GKKKKKKKKKKG..",
    "..GKKEKKKKEKKG..",
    "..GKKEKKKKEKKG..",
    "..gGKKKKKKKKGg..",
    "...gGkKKKKkGg...",
    "....gGGGGGGg....",
    "....GYYYYYYG....",
    "..GGgYYYYYYgGG..",
    "..LLgyyyyyygLL..",
    "....GGGGGGGG....",
    "....GGg..gGG....",
    "....LLL..LLL....",
    "................",
  ]],
  back: [[
    "................",
    "................",
    ".......S........",
    "......GSG.......",
    "....GGGSSGGG....",
    "...GGGGGGGGGG...",
    "..GGGGGSSGGGGG..",
    "..GLGGGGGGGGLG..",
    "..GGGGGSSGGGGG..",
    "..GGGGGGGGGGGG..",
    "..GGGGGSSGGGGG..",
    "..gGGGGGGGGGGg..",
    "...gGGGSSGGGg...",
    "....gGGGGGGg....",
    "....GGGSSGGG....",
    "..GGgGGGGGGgGG..",
    "..LLgGGSSGGgLL..",
    "....GGGGGGGG....",
    "....GGgGGgGG....",
    "....LLLGGLLL....",
    ".......gg.......",
  ]],
  side: [[
    "................",
    "................",
    ".........S......",
    "......GGGSG.....",
    ".....GGGGGGS....",
    "...GGWDGGGGGG...",
    "..GGGGGGGGGGGS..",
    "..WGWGGGGGGGGG..",
    "...KKKKKGGGGGGS.",
    "...KEKKKKGGGGG..",
    "...KEKKKKGGGGG..",
    "...KKKKKKGGGGg..",
    "....kKKKgGGGg...",
    ".....gGGGGGg....",
    ".....GYYGGGG....",
    "....GYYYLLGG....",
    "....GyyyLLGGG...",
    ".....GGGGGGGGGG.",
    ".....GGGGg..ggGg",
    "....LLLLL.......",
    "................",
  ]],
};

// Walk steps for Julio are derived by swapping the feet rows.
function julioRows(view: View, step: 0 | 1 | 2): string[] {
  const base = [...JULIO_ROWS[view][0]];
  if (step === 0) return base;
  if (view === "side") {
    base[18] = step === 1 ? "....GGg.GGGGg.gG" : base[18];
    base[19] = step === 1 ? "...LLL...LLL...." : base[19];
    return base;
  }
  const n = base.length;
  if (step === 1) {
    base[n - 3] = view === "back" ? "....GGgGGLLL...." : "....GGg..LLL....";
    base[n - 2] = view === "back" ? "....LLLGG......." : "....LLL.........";
  } else {
    base[n - 3] = view === "back" ? "....LLLGGgGG...." : "....LLL..gGG....";
    base[n - 2] = view === "back" ? ".......GGLLL...." : ".........LLL....";
  }
  return base;
}

let julioCache: CharFrames | null = null;
export function julioFrames(): CharFrames {
  if (!julioCache) {
    julioCache = framesFrom((d, s) => {
      let g = toGrid(julioRows(viewOf(d), s), JULIO_PAL);
      if (d === 3) g = flipGrid(g);
      return g;
    });
  }
  return julioCache;
}

/** Sprite size (outline included). Characters are anchored at their feet. */
export const CHAR_W = 18;
export const CHAR_H = 23;

export function drawCharacter(
  ctx: CanvasRenderingContext2D, frames: CharFrames, x: number, y: number,
  dir: Dir, step: 0 | 1 | 2 = 0,
) {
  // soft oval shadow under the feet
  ctx.fillStyle = "rgba(24,16,40,0.28)";
  const fx = Math.round(x), fy = Math.round(y);
  ctx.fillRect(fx - 5, fy - 1, 10, 2);
  ctx.fillRect(fx - 4, fy + 1, 8, 1);
  const s = frames[dir][step];
  ctx.drawImage(s.image, fx - (s.w >> 1), fy - s.h + 2);
}

/** Draw Julio's front sprite big (title screen / celebration). (cx, cy) = center. */
export function drawJulioBig(ctx: CanvasRenderingContext2D, cx: number, cy: number, px: number, dir: Dir = 0) {
  const s = julioFrames()[dir][0];
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(s.image, Math.round(cx - (s.w * px) / 2), Math.round(cy - (s.h * px) / 2), s.w * px, s.h * px);
}
