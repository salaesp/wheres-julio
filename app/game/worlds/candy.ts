// Mundo 13 — La Ciudad de Golosinas: gingerbread houses with gumdrop roofs, a
// milk river with floating cereal crossed by licorice bridges, a chocolate-bar
// plaza with a chocolate fountain, wafer paths, mint sugar grass, cotton-candy
// fluff, lollipop trees, candy canes, giant gummy bears, cupcakes and donuts.
import { defineWorld, type PropPlace } from "../engine/world";
import { CHOCO, WHITE_CHOCO, WAFER, MINT, COCONUT, COTTON, COTTON_BLUE, MILK, LICORICE } from "../engine/terrains/candy";
import {
  LOLLIPOP_PINK, LOLLIPOP_RAINBOW, LOLLIPOP_MINT, LOLLIPOP_GRAPE, LOLLIPOP_SMALL, LOLLIPOP_SMALL_B,
  CANDY_CANE, CANDY_CANE_R, CANDY_CANE_GREEN,
  GUMMY_RED, GUMMY_GREEN, GUMMY_YELLOW, GUMMY_ORANGE, GUMMY_BLUE,
  CUPCAKE_PINK, CUPCAKE_CHOCO, CUPCAKE_MINT,
  DONUT_PINK, DONUT_CHOCO, DONUT_WHITE, DONUT_GIANT,
  COTTON_BUSH, COTTON_BUSH_BLUE, COTTON_BUSH_LILAC, COTTON_TREE, COTTON_TREE_BLUE, COTTON_TREE_LILAC,
  ICECREAM_STRAWBERRY, ICECREAM_MINT, ICECREAM_BLUE, ICECREAM_CART,
  MARSHMALLOW, MARSHMALLOW_STACK, MARSHMALLOW_PINK,
  GUMDROP_RED, GUMDROP_GREEN, GUMDROP_PURPLE, GUMDROP_YELLOW,
  BONBON_RED, BONBON_BLUE, BONBON_YELLOW, SPRINKLES, COOKIE_FLAT,
  CEREAL_RED, CEREAL_YELLOW, CEREAL_GREEN, CEREAL_PURPLE,
  CHOCO_ROCK, MACARONS, CHOCO_BENCH, CHOCO_FOUNTAIN,
  GINGER_HOUSE, GINGER_HOUSE_B, GINGER_HOUSE_C, GINGERBREAD_MAN, WAFER_SIGN,
} from "../engine/propsLib/candy";

const props: PropPlace[] = [
  // ── gingerbread row (north) ──
  [GINGER_HOUSE, 5.7, -0.15],
  [GINGER_HOUSE_B, 10.9, -0.05],
  [COTTON_TREE, -0.6, -1.2],
  [LOLLIPOP_SMALL, 9.6, 2.1],
  [GUMDROP_RED, 5.4, 3.3], [GUMDROP_GREEN, 9.2, 3.4],
  [MARSHMALLOW, 14.1, 3.2],

  // ── milk river (cereal + banks) ──
  [CEREAL_RED, 3.3, 1.2], [CEREAL_YELLOW, 4.4, 4.3], [CEREAL_GREEN, 2.5, 9.5],
  [CEREAL_PURPLE, 3.9, 12.3], [CEREAL_RED, 5.6, 15.4], [CEREAL_YELLOW, 6.8, 20.4],
  [CEREAL_GREEN, 4.9, 24.3], [CEREAL_PURPLE, 3.5, 7.4],
  [CUPCAKE_MINT, -0.1, 3.5], [CHOCO_ROCK, 5.3, 13.6],

  // ── west strip ──
  [LOLLIPOP_PINK, -0.3, 7.6],
  [CANDY_CANE, 0.2, 13.0],
  [GUMMY_GREEN, 0.4, 11.0],
  [COTTON_BUSH_BLUE, 0.6, 15.6],

  // ── east lawn above the plaza ──
  [CANDY_CANE_R, 4.6, 3.8],
  [WAFER_SIGN, 11.2, 4.0],
  [GUMMY_RED, 12.6, 4.3],
  [LOLLIPOP_RAINBOW, 13.4, 5.3],
  [MACARONS, 6.3, 4.2],
  [BONBON_RED, 7.2, 5.3],

  // ── chocolate plaza ──
  [CHOCO_FOUNTAIN, 7.6, 7.7],
  [CHOCO_BENCH, 6.3, 13.15], [CHOCO_BENCH, 11.4, 13.15],
  [CANDY_CANE_GREEN, 6.2, 7.6], [CANDY_CANE_GREEN, 13.6, 7.6],
  [ICECREAM_CART, 12.6, 9.3],
  [SPRINKLES, 7.1, 11.6], [SPRINKLES, 12.1, 12.0],
  [BONBON_BLUE, 13.1, 13.9], [BONBON_YELLOW, 6.6, 12.2],
  [COOKIE_FLAT, 9.0, 13.5],

  // ── middle meadow ──
  [CUPCAKE_PINK, 11.8, 15.1],
  [GUMMY_YELLOW, 7.2, 15.8],
  [COTTON_BUSH, 13.4, 16.8],
  [LOLLIPOP_SMALL_B, 8.0, 17.3],
  [GUMDROP_PURPLE, 11.3, 17.4],
  [MARSHMALLOW_PINK, 0.4, 17.9],

  // ── south: sweets park ──
  [DONUT_GIANT, 9.5, 20.1],
  [CUPCAKE_CHOCO, 0.1, 20.2],
  [ICECREAM_STRAWBERRY, 2.9, 20.0],
  [GUMMY_BLUE, 12.2, 20.4],
  [LOLLIPOP_MINT, 13.3, 21.9],
  [DONUT_PINK, 7.8, 23.0], [DONUT_CHOCO, 2.6, 24.1],
  [ICECREAM_MINT, 11.4, 22.6],
  [GINGERBREAD_MAN, 9.4, 23.7],
  [MARSHMALLOW_STACK, 4.6, 19.9],
  [GUMMY_ORANGE, 1.1, 22.7],
  [COTTON_TREE_BLUE, -0.8, 23.2],
  [COTTON_TREE_LILAC, 12.6, 23.4],
  [LOLLIPOP_GRAPE, 14.2, 17.8],
  [ICECREAM_BLUE, 14.1, 12.4],
  [COTTON_BUSH_LILAC, 7.4, 25.3],
  [DONUT_WHITE, 10.9, 25.25],
  [GUMDROP_YELLOW, 3.0, 18.3],
];

export const worldModule = defineWorld({
  title: "La Ciudad de Golosinas",
  npcCount: 46,
  background: "#5c3420",
  legend: { ".": MINT, o: COCONUT, t: COTTON, u: COTTON_BLUE, c: CHOCO, v: WHITE_CHOCO, p: WAFER, w: MILK, b: LICORICE },
  map: [
    "tt.ww..........",
    "t..ww..........",
    "...www.........",
    "....ww.........",
    "....ww...pp....",
    "...www...pp....",
    "pppbbpppppppppp",
    "...ww....pp....",
    "..www.cvvvvvccc",
    "..ww..cvvvvvccc",
    "..www.cvvvvvccc",
    "...ww.cvvvvvccc",
    "...www.vvvvvccc",
    "oo..ww.cccccccc",
    "ooo.www..pp....",
    "oo...ww..pp..uu",
    ".....www.pp.uuu",
    "tt....ww.pp..uu",
    "ttt...ww.pp....",
    "ppppppbbppppppp",
    "......www......",
    "......ww...oo..",
    "tt...www...ooo.",
    "ttt..ww.....oo.",
    "tt..www......tt",
    "...www......ttt",
  ],
  props,
  outfit: {
    hats: { party: 5, none: 3, sunhat: 1, beanie: 0.8, cap: 0.6 },
    lowers: { skirt: 3, shorts: 3, pants: 3 },
    tops: [
      "#f8a8c8", "#f878a8", "#a8d8f8", "#78b8f0", "#c8a8f0", "#a878e0",
      "#f8e078", "#f8c848", "#a8e8c0", "#f8b888", "#ffffff", "#e84870",
    ],
    lowerColors: ["#f8c8dc", "#b8d8f8", "#d8c0f0", "#fff0b0", "#7a5038", "#5a6898"],
  },
});
