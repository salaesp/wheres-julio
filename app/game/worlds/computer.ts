// Mundo 12 — Adentro de la Compu: tiny people walking around a motherboard,
// between the CPU cooler, RAM sticks, chips, capacitors and blinking LEDs.
import { defineWorld, type PropPlace } from "../engine/world";
import {
  PCB, PCB_GROUND, BUS_H, BUS_V, BUS_X, BUS_ES, BUS_WS, BUS_NE, BUS_NW, RIBBON, STEEL,
} from "../engine/terrains/boards";
import {
  CPU_FAN, CHOKE, CAP_BIG_BLUE, CAP_BIG_PURPLE, CAP_BLUE_S, CAP_PURPLE_S, CAP_BLACK_S, CAP_BLACK_BIG, CAP_GREEN_S,
  RESISTOR_A, RESISTOR_B, RESISTOR_C, LED_RED, LED_GREEN, LED_BLUE, LED_YELLOW,
  CHIP_BIG, CHIP_MED, CHIP_SMALL, CHIPSET, RAM_RED, RAM_BLUE, RAM_SLOT_EMPTY,
  PCIE_X16, PCIE_X16_DARK, PCIE_X1, BATTERY, POST_DISPLAY, HEADER_A, HEADER_B, ATX_POWER,
  RIBBON_PLUG, SCREW, silk, wires,
} from "../engine/propsLib/computer";

const FAN_WIRE = wires(30, 44, [[1, 2], [12, 2], [22, 12], [22, 40]], ["k", "r", "y"]);
const FRONT_WIRES = wires(24, 64, [[8, 63], [8, 30], [14, 24], [14, 0]], ["u", "w", "g", "o"]);

const props: PropPlace[] = [
  [SCREW, 0.1, 0.15], [SCREW, 14.15, 23.85], [SCREW, 0.1, 23.85],
  // ── CPU + VRM ──
  [CHOKE, 1.1, 0.05], [CHOKE, 2.2, 0.05], [CHOKE, 3.3, 0.05], [CHOKE, 4.4, 0.05],
  [CPU_FAN, 1.0, 1.4],
  [FAN_WIRE, 5.3, 4.9], [HEADER_B, 6.2, 7.3],
  [CAP_PURPLE_S, 3.3, 6.65], [CAP_PURPLE_S, 4.1, 6.65], [CAP_BLACK_S, 0.3, 6.65],
  [CAP_BIG_BLUE, 6.1, 0.2],
  [silk("CPU1"), 5.9, 2.2],
  // ── RAM ──
  [RAM_RED, 7.3, 1.0], [RAM_SLOT_EMPTY, 7.3, 3.15], [RAM_BLUE, 7.3, 4.9], [RAM_SLOT_EMPTY, 7.3, 7.05],
  [silk("DIMM"), 12.4, 8.05],
  // ── chipset & friends ──
  [CHIP_SMALL, 4.7, 8.7], [CHIPSET, 4.4, 10.4],
  [CHIP_BIG, 9.3, 9.4], [ATX_POWER, 13.0, 9.3], [silk("ATX"), 13.2, 13.2],
  [POST_DISPLAY, 9.7, 11.6],
  [CHIP_MED, 0.4, 12.15],
  [CAP_BIG_PURPLE, 7.6, 12.35], [CAP_BLUE_S, 3.4, 12.6], [CAP_GREEN_S, 12.1, 11.9],
  [LED_GREEN, 0.4, 9.5], [LED_RED, 3.6, 9.9], [LED_BLUE, 11.6, 12.2],
  [RESISTOR_A, 0.3, 11.0], [RESISTOR_B, 10.6, 13.3],
  // ── ribbon cable ──
  [RIBBON_PLUG, 2.0, 15.35],
  [RESISTOR_C, 4.5, 15.1],
  // ── expansion slots ──
  [PCIE_X16, 0.4, 17.5], [PCIE_X1, 0.4, 20.0], [PCIE_X16_DARK, 0.4, 22.0],
  [silk("PCIE1"), 3.6, 18.55], [silk("PCIE2"), 3.6, 23.05],
  [CAP_BLACK_BIG, 4.0, 19.3], [CAP_BLACK_S, 5.1, 19.8], [CAP_BLUE_S, 7.0, 19.8],
  // ── bottom right ──
  [BATTERY, 10.6, 17.3], [silk("BAT"), 11.3, 19.0],
  [HEADER_A, 10.3, 20.1], [HEADER_B, 12.5, 21.6],
  [FRONT_WIRES, 12.45, 22.0],
  [LED_YELLOW, 14.15, 17.3], [LED_RED, 10.3, 22.5], [LED_GREEN, 14.15, 19.6],
  [CAP_PURPLE_S, 14.1, 14.6], [CAP_BLUE_S, 9.7, 15.0],
];

export const worldModule = defineWorld({
  title: "Adentro de la Compu",
  npcCount: 46,
  background: "#1c3a2c",
  legend: {
    ".": PCB, ",": PCB_GROUND, "-": BUS_H, "|": BUS_V, "+": BUS_X,
    r: BUS_ES, "7": BUS_WS, L: BUS_NE, J: BUS_NW, "=": RIBBON, s: STEEL,
  },
  map: [
    ",,,,,,,........",
    ",,,,,,,........",
    ",,,,,,,........",
    ",,,,,,,........",
    ",,,,,,,........",
    ",,,,,,,........",
    ",,,,,,,........",
    ",,,,,,,........",
    "--7.....r------",
    "..|.....|......",
    "..|.....|......",
    "..L-....|......",
    "........|......",
    "........|......",
    "--------+----7.",
    "........|....|.",
    "...============",
    "........|....|.",
    "........|....|.",
    "........|....|.",
    "........|....|.",
    "........|....|.",
    "........|....|.",
    "........L----J.",
    "---------------",
    "sssssssssssssss",
  ],
  props,
});
