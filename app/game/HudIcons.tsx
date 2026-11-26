// Pixel-art HUD icons drawn from ASCII grids as crisp SVG rects, so they stay
// sharp at any size. Same palette rules as the in-game sprites: dark colored
// outlines, light from the top-left.

type Pal = Record<string, string>;

function PixelIcon({ rows, pal, title }: { rows: readonly string[]; pal: Pal; title?: string }) {
  const h = rows.length;
  const w = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const rects: JSX.Element[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = pal[row[x]];
      if (c) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c} />);
    }
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" shapeRendering="crispEdges" aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      {rects}
    </svg>
  );
}

// ── Julio's dino-hood head (found) / empty "?" slot (not found yet) ─────────
const JULIO_HEAD = [
  "...S..S....",
  "..OGSGSGO..",
  ".OWDGGWDGO.",
  "OGGGGGGGGGO",
  "OGWGWGWGWGO",
  "OGKKKKKKKGO",
  "OGKEKKKEKGO",
  "OGKEKKKEKGO",
  "OgGKkkkKGgO",
  ".OgggggggO.",
  "..OOOOOOO..",
];
const JULIO_PAL: Pal = {
  S: "#1e6e44", O: "#183020", G: "#3cb46c", g: "#258a54", W: "#ffffff", D: "#202020",
  K: "#f8d0a8", k: "#e0a878", E: "#282030",
};
const EMPTY_PAL: Pal = {
  S: "#c8c2d8", O: "#b0a8c4", G: "#e4e0ec", g: "#d4cee0", W: "#e4e0ec", D: "#b0a8c4",
  K: "#e4e0ec", k: "#d4cee0", E: "#b0a8c4",
};

export function JulioHeadIcon({ found }: { found: boolean }) {
  return found
    ? <PixelIcon rows={JULIO_HEAD} pal={JULIO_PAL} />
    : <PixelIcon rows={JULIO_HEAD} pal={EMPTY_PAL} />;
}

// ── Heart (attempts left) ────────────────────────────────────────────────────
const HEART = [
  ".OOO.OOO.",
  "OrwrOrrrO",
  "OwrrrrrRO",
  "OrrrrrrRO",
  ".OrrrrRO.",
  "..OrrRO..",
  "...ORO...",
  "....O....",
];
const HEART_FULL: Pal = { O: "#781830", r: "#f84060", R: "#c02848", w: "#ffc8d0" };
const HEART_EMPTY: Pal = { O: "#a098b8", r: "#e0dce8", R: "#d0cadc", w: "#e0dce8" };

export function HeartIcon({ full }: { full: boolean }) {
  return <PixelIcon rows={HEART} pal={full ? HEART_FULL : HEART_EMPTY} />;
}

// ── Home (back to menu) ──────────────────────────────────────────────────────
const HOME = [
  ".....O.....",
  "....OrO....",
  "...OrrrO...",
  "..OrrrrrO..",
  ".OrrrrrrrO.",
  "OOOOOOOOOOO",
  ".OyyyyyyyO.",
  ".OyddyywyO.",
  ".OyddyyyyO.",
  ".OyddyyyyO.",
  ".OOOOOOOOO.",
];
export function HomeIcon() {
  return <PixelIcon rows={HOME} pal={{ O: "#3a2848", r: "#e84848", y: "#f8e088", d: "#8a5838", w: "#88c8f8" }} />;
}
