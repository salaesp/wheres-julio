# Motor gráfico — guía de estilo y de uso

Objetivo visual: **overworld de Pokémon GBA (Ruby/Sapphire/Emerald, FireRed/LeafGreen)**.
Pixel art a todo color, tiles de 16×16, contornos oscuros de color (nunca negro puro),
luz desde arriba a la izquierda, paleta saturada y alegre.

## Cómo se dibuja

- Todo se dibuja a **resolución nativa** (1 unidad = 1 pixel de juego) en un canvas
  de `cols*16 × rows*16` y después se escala al tamaño de pantalla con
  nearest-neighbour. **Nunca** dibujes con `arc`, gradientes, alpha ni
  coordenadas fraccionarias: sólo sprites/tiles.
- Mundo estándar: **15 columnas × 26 filas** (240×416 px), formato retrato.
- Los personajes miden ~18×23 px (con contorno) y se anclan por los pies.

## Piezas

| Archivo | Qué es |
|---|---|
| `sprite.ts` | Sprites ASCII → canvas cacheado. `.`/espacio = transparente. Contorno automático (`outline`). |
| `shapes.ts` | Generadores de filas ASCII: `blank`, `rect`, `put`, `stamp`, `blobs` (follaje/rocas redondeadas con sombreado). |
| `terrain.ts` | Terrenos de 16×16 con transiciones automáticas por `level`. |
| `terrains/common.ts` | Pasto, pasto alto, camino, piedra, arena, agua (animada), mar, cantero. |
| `props.ts` | `defineProp` — objetos del mapa (árboles, bancos…). Se ordenan en profundidad con los personajes. |
| `propsLib/*.ts` | Librerías de props por tema (`nature.ts`, `park.ts`, …). |
| `world.ts` | `defineWorld` — mapa ASCII + props → mundo jugable (render + ubicación de personajes). |
| `characters.ts` | NPCs por capas (4 direcciones, caminar) y Julio (traje de dinosaurio). |

## Terrenos (`defineTerrain`)

```ts
defineTerrain({
  id: "snow",
  level: 2,              // los niveles altos "se apoyan" sobre los bajos
  walkable: true,        // false = nadie se para ahí (agua, lava, paredes)
  pal: { a: "#fff", b: "#e8f0ff", c: "#c8d8f0", d: "#a0b8e0" },
  lip: { fill: "#e8f0ff", outline: "#8098c0", bumpy: true }, // cómo pisa a un vecino más bajo
  shade: ["#b8c8e8"],    // línea de sombra que recibe cuando un vecino más alto lo pisa
  variants: [{ weight: 4, rows: [/* 16 filas de 16 chars */] }, ...],
  frames: [...],         // opcional: animación (lista de listas de variantes)
  group: "snow",         // terrenos del mismo grupo no dibujan borde entre sí
  cover: { rows },       // opcional: tapa las piernas (pasto alto)
});
```

Regla de bordes: donde un terreno de `level` mayor toca uno menor, el mayor
"sobresale" 1–3 px dentro del tile menor (`lip`) con contorno, y el menor recibe
`shade`. Las esquinas se redondean solas. Agua = nivel 0, caminos/arena = 1,
pasto = 2, pasto alto/canteros = 3.

Variantes: 1 tile “liso” con peso alto + 2–3 con detalles chicos (matas, piedritas)
con peso menor. Evitá patrones que formen grillas visibles.

## Props (`defineProp`)

```ts
export const BARREL = defineProp({
  rows: ["..aaaa..", ".abbbba.", ...],   // o frames: [rows, rows] + fps
  pal: { a: "#c88848", b: "#a86830" },
  solid: { x: 0, y: 6, w: 10, h: 6 },     // rect bloqueante (px, relativo al sprite con contorno)
  flat: false,                           // true = es parte del piso (toallas, rayuelas)
  outline: true,                         // contorno automático (default)
});
```

- Tamaño del sprite final = filas + 2 px de contorno.
- `solid` por defecto = los 10 px de abajo. Usá `solid: null` para nada bloqueante.
- Props altos (árboles, mástiles) tapan a quien esté detrás — el motor evita
  ubicar personajes totalmente escondidos.
- Paleta por prop: 3–5 tonos por material (luz, base, sombra, sombra profunda).
  El contorno lo calcula el motor a partir del color vecino.
- Para formas orgánicas usá `blobs()` de `shapes.ts`.

## Mundos (`defineWorld`)

```ts
export const worldModule = defineWorld({
  title: "La Playa",
  npcCount: 45,
  background: "#3058a8",                 // color fuera del mapa
  legend: { ".": SAND, w: SEA, g: GRASS },
  map: [ "..............." /* 26 filas de 15 chars */ ],
  props: [[PALM, 1, 2], [UMBRELLA, 4.5, 8]], // [prop, tileX, tileY] esquina sup-izq, admite decimales
  outfit: { hats: { none: 4, sunhat: 3, cap: 2 }, lowers: { shorts: 5, skirt: 2, pants: 1 } },
});
```

Diseño de nivel: el juego es “¿Dónde está Wally?”. Hace falta **mucha superficie
caminable** para ~45 personas, con detalles que distraigan (props chicos, flores,
pasto alto para esconder piernas) pero sin tapar por completo a nadie.
