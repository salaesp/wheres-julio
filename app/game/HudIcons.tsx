// Tiny pixel-art icons for the HUD. Each rect = 1 pixel of a low-res grid; the
// SVG scales up with crisp edges so they stay sharp at any size.

type GridProps = { size: number; children: React.ReactNode };

function Grid({ size, children }: GridProps) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  );
}

function px(x: number, y: number, color: string, key?: number | string) {
  return <rect key={key} x={x} y={y} width={1} height={1} fill={color} />;
}

// Pixel-rasterized pie chart. Rasterizes a disc into a low-res grid and fills
// pixels whose polar angle falls within `done/total` of the way around the
// circle (starting at 12 o'clock, clockwise).
export function PieProgress({ done, total, accent }: { done: number; total: number; accent: string }) {
  const size = 12;
  const c = size / 2;
  const r = size / 2;
  const progress = Math.max(0, Math.min(1, done / total));
  const pixels: [number, number, string][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - c;
      const dy = y + 0.5 - c;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > r) continue;
      const onEdge = dist > r - 1;
      let ang = Math.atan2(dx, -dy);
      if (ang < 0) ang += Math.PI * 2;
      const t = ang / (Math.PI * 2);
      const filled = progress > 0 && t < progress;
      const color = onEdge
        ? "#0b0f24"
        : filled
        ? accent
        : "rgba(255, 255, 255, 0.18)";
      pixels.push([x, y, color]);
    }
  }
  return (
    <Grid size={size}>
      {pixels.map(([x, y, c], i) => px(x, y, c, i))}
    </Grid>
  );
}

// Julio's dino-hood head, 10×10. Bright when found, dim silhouette otherwise.
const JULIO_HEAD = [
  "...S..S...",
  "..OGSGSGO.",
  ".OWDGGWDGO",
  "OGGGGGGGGO",
  "OGWGWGWGWO",
  "OGKKKKKKGO",
  "OGKEKKEKGO",
  "OgGKkkKGgO",
  ".OggggggO.",
  "..OOOOOO..",
];
export function JulioHeadIcon({ found }: { found: boolean }) {
  const pal: Record<string, string> = found
    ? { S: "#1e6e44", O: "#102818", G: "#3cb46c", g: "#258a54", W: "#ffffff", D: "#202020", K: "#f8d0a8", k: "#e0a878", E: "#282030" }
    : { S: "#2a2a44", O: "#14142c", G: "#3a3a5c", g: "#30304c", W: "#4a4a6c", D: "#2a2a44", K: "#44446a", k: "#3a3a5c", E: "#2a2a44" };
  const pixels: [number, number, string][] = [];
  JULIO_HEAD.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] !== ".") pixels.push([x, y, pal[row[x]]]);
  });
  return (
    <Grid size={10}>
      {pixels.map(([x, y, c], i) => px(x, y, c, i))}
    </Grid>
  );
}

// 10x10 pixel-art magnifying glass. Lens is bright when active, dim when used.
export function MagnifierIcon({ used, danger }: { used: boolean; danger: boolean }) {
  const frame = danger ? "#ff3a3a" : used ? "#4a4a55" : "#ffe66d";
  const glass = danger ? "rgba(255, 58, 58, 0.35)" : used ? "rgba(120, 120, 140, 0.25)" : "rgba(180, 220, 255, 0.55)";
  const shine = danger ? "#ffffff" : used ? "#7a7a88" : "#ffffff";
  const handle = danger ? "#a02020" : used ? "#3a3a44" : "#b88a2c";

  // Lens: 6x6 circle-ish at top-left. Handle: diagonal pixels bottom-right.
  const pixels: [number, number, string][] = [
    // lens outer ring
    [2, 0, frame], [3, 0, frame], [4, 0, frame],
    [1, 1, frame], [5, 1, frame],
    [0, 2, frame], [6, 2, frame],
    [0, 3, frame], [6, 3, frame],
    [0, 4, frame], [6, 4, frame],
    [1, 5, frame], [5, 5, frame],
    [2, 6, frame], [3, 6, frame], [4, 6, frame],
    // lens glass fill
    [2, 1, glass], [3, 1, glass], [4, 1, glass],
    [1, 2, glass], [2, 2, glass], [3, 2, glass], [4, 2, glass], [5, 2, glass],
    [1, 3, glass], [2, 3, glass], [3, 3, glass], [4, 3, glass], [5, 3, glass],
    [1, 4, glass], [2, 4, glass], [3, 4, glass], [4, 4, glass], [5, 4, glass],
    [2, 5, glass], [3, 5, glass], [4, 5, glass],
    // shine
    [2, 1, shine], [1, 2, shine],
    // handle
    [5, 6, handle],
    [6, 7, handle], [7, 7, handle],
    [7, 8, handle], [8, 8, handle],
    [8, 9, handle], [9, 9, handle],
  ];

  return (
    <Grid size={10}>
      {pixels.map(([x, y, c], i) => px(x, y, c, i))}
    </Grid>
  );
}

// Pixel-art house icon for the "back to home" HUD button. 9x9 grid.
export function HomeIcon() {
  const outline = "#1a1a1a";
  const roof = "#e23a3a";
  const wall = "#ffe066";
  const door = "#1a1a1a";

  const pixels: [number, number, string][] = [
    // roof
    [4, 0, outline],
    [3, 1, outline], [4, 1, roof], [5, 1, outline],
    [2, 2, outline], [3, 2, roof], [4, 2, roof], [5, 2, roof], [6, 2, outline],
    [1, 3, outline], [2, 3, roof], [3, 3, roof], [4, 3, roof], [5, 3, roof], [6, 3, roof], [7, 3, outline],
    [0, 4, outline], [1, 4, roof], [2, 4, roof], [3, 4, roof], [4, 4, roof], [5, 4, roof], [6, 4, roof], [7, 4, roof], [8, 4, outline],
    // walls + door
    [1, 5, outline], [2, 5, wall], [3, 5, wall], [4, 5, wall], [5, 5, wall], [6, 5, wall], [7, 5, outline],
    [1, 6, outline], [2, 6, wall], [3, 6, door], [4, 6, door], [5, 6, wall], [6, 6, wall], [7, 6, outline],
    [1, 7, outline], [2, 7, wall], [3, 7, door], [4, 7, door], [5, 7, wall], [6, 7, wall], [7, 7, outline],
    [1, 8, outline], [2, 8, outline], [3, 8, outline], [4, 8, outline], [5, 8, outline], [6, 8, outline], [7, 8, outline],
  ];

  return (
    <Grid size={9}>
      {pixels.map(([x, y, c], i) => px(x, y, c, i))}
    </Grid>
  );
}
