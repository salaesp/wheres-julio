import { PX, type Ctx, pellipse } from "../utils/primitives";
import { drawSprite, currentFrame, type Palette, type Frame, type SpriteSheet } from "../utils/sprite";

// ── Color tables ──────────────────────────────────────────────────────────────
const CAP_COLORS = [
  "#d42010", // rojo
  "#1a50c0", // azul
  "#28a030", // verde
  "#e8c010", // amarillo
];

const HAIR_COLORS = [
  "#161616", // negro
  "#5c2e10", // marrón
  "#c8a040", // rubio
];

const JACKET_COLORS = [
  "#0e52b0", // azul original
  "#1a6a1a", // verde oscuro
  "#8b1a1a", // rojo oscuro/bordó
  "#2a2a5a", // azul marino
  "#5a3a8a", // violeta oscuro
  "#8a5a10", // marrón/mostaza
  "#1a6a5a", // teal oscuro
  "#3a3a3a", // gris oscuro
  "#8a2a5a", // magenta oscuro
  "#1a4a2a", // verde militar
];

// Pieles humanas reales: de muy clara a muy oscura
const SKIN_TONES: [string, string][] = [ // [base, sombra]
  ["#fddbb4", "#e8b888"], // muy clara / porcelana
  ["#f5c9a0", "#d9a070"], // clara
  ["#e8a878", "#c88050"], // clara-media
  ["#e08e68", "#be7454"], // media (original)
  ["#c87848", "#a85830"], // media-oscura / olivácea
  ["#b06030", "#8a4018"], // morena
  ["#8a4820", "#6a3010"], // marrón oscura
  ["#6a3010", "#4a1808"], // oscura
  ["#4a2008", "#301008"], // muy oscura
];


function makePalette(cap: string, hair: string, skin: string, skinShadow: string, jacket: string): Palette {
  return {
    ".": null,
    "O": "#161616",
    "C": cap,
    "c": "#1a1010",
    "B": "#eeeef6",
    "G": "#a8a8c4",
    "h": hair,
    "S": skin,
    "s": skinShadow,
    "J": jacket,
    "j": "#0a0a14",
  };
}

// ── FRONT 32×32 ───────────────────────────────────────────────────────────────
const FRONT_IDLE: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "................................",
    "..........hhhhhhhhhhhh..........",
    ".........hhhhhhhhhhhhhh.........",
    "........hhcCCCCCCCCCCchh........",
    "........hhCCCCBBBBCCCChh........",
    ".......hhcCCCCBBBBCCCCchh.......",
    ".......hccCCCBCCCBBCCCchh.......",
    ".......OcccCCCCCCCCCcccOO.......",
    ".....jjOcccccBCccCBccccOOjB.....",
    ".....jjOcccccBccccBccccOOjj.....",
    "....OOOshhGcccGGGGccGGhssOOO....",
    ".....OOSOOJBBBBBBBBBJJOSSOO.....",
    ".....OOSOOJBBBBBBBBBJJOSSOO.....",
    "....OjjOhhSJJJJJJJJJSShOOjOO....",
    ".....jjjSSSSJOJSSJOSSSSOOj......",
    ".......jSSSSSOSSSSOSSSSjj.......",
    ".....OOjhhSSShSSSShSSShhjOO.....",
    ".......OGGOhhSSSSSShOOGOO.......",
    "......hOGGOhhSSSSSShOOGOOh......",
    ".....hhSSSGGGOOOOOOGGG.SShh.....",
    ".....hhSSShJJJJJJJJJJhSSShh.....",
    "......hSSShJJJJJJJJJJhSSSh......",
    ".......hOOOGGBBBBBBGOOOhh.......",
    "..........chhOOOOOOhcc..........",
    ".........OchhOOOOOOhcc..........",
    "........OOOSShOOOhhSOOOO........",
    "........OOGJJOO..OOJGGOO........",
    ".........OGOJO....OJOOO.........",
    "..........OOO......OOO..........",
    "................................",
    "................................",
  ],
};

// ── BACK 32×32 ────────────────────────────────────────────────────────────────
const BACK_IDLE: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "................................",
    "..........hhhhhhhhhhhh..........",
    ".........hhhhhhhhhhhhhh.........",
    ".........hccCCCCCCCCCchh........",
    ".........hCCCCCCCCCCCChh........",
    "........hcCCCCCCCCCCCCchh.......",
    ".......hhcCCCCCCCCCCCCcch.......",
    ".......hhcccCCCCCCCCCccch.......",
    "......OhhcccccccccccccccjO......",
    ".....OOjjcccccccccccccccjOO.....",
    "....OOjjjhcccccccccccchhjjOO....",
    ".....OOjjjhccccOOcccchjjjOO.....",
    ".....OOjjjhhcccOOOccchjjjOO.....",
    "....OOOjjjjjhhhjjhhhhjjjjOOO....",
    ".......OjjjjjjjjjjjjjjjjOO......",
    ".......OOjjjjjjjjjjjjjjOO.......",
    "......OjjOOOOjjjjjjOOOOOjOO.....",
    ".......OOGJJJOOOOOOJJJGOO.......",
    ".......OOGJJJOOOOOOJJJGGOh......",
    ".....hh..G.JJJJJJJJJJ.GGShh.....",
    ".....hhSShJJhOOGGGOhJJhSShh.....",
    "......hShhJJhOOGGGOhhJhhSh......",
    ".......hhOGGBBBOOOBBBGOOh.......",
    "........cchhJJJOOOJJJhcc........",
    ".........chhJJJOOJJJJhcc........",
    ".........OOOhJJhhJJhhOOO........",
    ".........OGGJOOOOOOJJGOO........",
    ".........OOOJOOOOOOJOGO.........",
    "..........OOO......OOO..........",
    "................................",
    "................................",
  ],
};

// ── LEFT 32×32 ────────────────────────────────────────────────────────────────
const LEFT_IDLE: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "................................",
    "..........hhhhhhhhhhh...........",
    ".........hhhhhhhhhhhhh..........",
    "........hhcCCCCCCCCCchh.........",
    ".......hccBCCCCCCCCCChh.........",
    ".....hhhccBCCCCCCCCCCchh........",
    ".....hhhccCCCCCCCCCCCcch........",
    "....OBBhccBCCCCCCCCCccch........",
    "....OBBcccccccccccccccch........",
    "....OBBcGGccccccccccccch........",
    "....OBBGccccccccccccchhOOO......",
    "....OOOGGGGcccccccchchjOOOO.....",
    ".....OOGGGGccccccchhhjjjjOO.....",
    ".......hJJhhhhhhhhjjjjjjOO......",
    ".......hSSSOOSShjSSSjjjjjOO.....",
    ".......hSSSOOSSSjSSSjjjjjOO.....",
    "........hhShhSSSSSSSOjjO........",
    ".........hhSSSSSShhhjOOjO.......",
    "..........hSSSSSShhhjOOjO.......",
    "..........OhhhOOOhhhOOOO........",
    "..........OJJOJJJOhhBBBO........",
    "..........OJJOJJJOhhBBOO........",
    "..........OGGhGGGOhhJJJO........",
    "..........OOOOSBBOJJJOO.........",
    "..........OOOOShhOOJJO..........",
    "...........OOShhhcOOO...........",
    "...........OOGGJJO..............",
    "............OOOOOO..............",
    ".............OOOO...............",
    "................................",
    "................................",
  ],
};

// ── RIGHT 32×32 ───────────────────────────────────────────────────────────────
const RIGHT_IDLE: Frame = {
  width: 32, height: 32,
  pixels: [
    "................................",
    "................................",
    "..........hhhhhhhhhhh...........",
    ".........hhhhhhhhhhhhh..........",
    "........hhcCCCCCCCCCchh.........",
    "........hhCCCCCCCCCCBcch........",
    ".......hhcCCCCCCCCCCBcchh.......",
    ".......hccCCCCCCCCCCCcchhh......",
    ".......hcccCCCCCCCCCBcchBBO.....",
    ".......hccccccccccccccccBBO.....",
    ".......hcccccccccccccGGcBBO.....",
    ".....OOOhhcccccccccccccGBBO.....",
    "....OOOOjhccccccccccGGGGOOO.....",
    "....OOjjjjhhhcccccccGGGGOO......",
    ".....OOjjjjjjhhhhhhhhJJh........",
    "....OOjjjjjSSSjhSSOOSSSh........",
    "....OOjjjjjSSSjSSSOOSSSh........",
    ".......OjjOSSSSSSShhShh.........",
    "......OjOOjhhhSSSSSShh..........",
    "......OjOOjhhhSSSSSSh...........",
    ".......OOOOhhhOOOhhhO...........",
    ".......OBBBhhOJJJOJJO...........",
    ".......OOBBhhOJJJOJJO...........",
    ".......OJJJhhOGGGhGGO...........",
    "........OOJJJOSSSOOOO...........",
    ".........OJJOOhSSOOOO...........",
    "..........OOOchhhSOO............",
    "............OOJJGGOO............",
    ".............OJOOOO.............",
    "..............OOOO..............",
    "................................",
    "................................",
  ],
};

// ── Sprite sheet ──────────────────────────────────────────────────────────────
const PERSON: SpriteSheet = {
  front: { idle: FRONT_IDLE },
  back:  { idle: BACK_IDLE  },
  left:  { idle: LEFT_IDLE  },
  right: { idle: RIGHT_IDLE },
};

const DIRECTIONS = ["front", "back", "left", "right"] as const;
type Direction = typeof DIRECTIONS[number];

const PERSON_SCALE = 2; // 32×32 sprite at 2px/cell = 64×64 canvas px

export function drawPerson(ctx: Ctx, cx: number, cy: number, variant: number, time = 0): void {
  const gcx = cx / PX;
  const gcy = cy / PX;
  pellipse(ctx, gcx, gcy + 7, 6, 1.5, "#282828");

  const cap    = CAP_COLORS[variant % CAP_COLORS.length];
  const hair   = HAIR_COLORS[(variant * 3) % HAIR_COLORS.length];
  const jacket = JACKET_COLORS[(variant * 7) % JACKET_COLORS.length];
  const [skin, skinShadow] = SKIN_TONES[(variant * 5) % SKIN_TONES.length];

  const dir: Direction = DIRECTIONS[variant % DIRECTIONS.length];
  const frame = currentFrame(PERSON[dir]!, false, time);
  drawSprite(ctx, frame, makePalette(cap, hair, skin, skinShadow, jacket), cx, cy, PERSON_SCALE);
}
