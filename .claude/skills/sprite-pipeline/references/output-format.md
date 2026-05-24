# Formato de salida `Sprite`

El pipeline emite sprites **indexados**: una paleta de colores y una grilla de
índices a esa paleta. Es compacto, editable como texto y se renderiza sin
suavizado, que es lo que da el look pixel art nítido.

## El tipo

```ts
export interface Sprite {
  name: string;
  width: number;
  height: number;
  transparentIndex: number;   // siempre 0
  palette: string[];          // palette[0] === "" (transparente)
  data: number[];             // row-major, length === width * height
}
```

Invariantes que el validador verifica:

- `width === height === N` (resolución cuadrada pedida).
- `data.length === width * height`, row-major (fila 0 primero, izquierda→derecha).
- cada entrada de `data` es un índice válido en `[0, palette.length - 1]`.
- `palette[0] === ""` y `transparentIndex === 0`: el índice 0 nunca se dibuja.
- `palette.length <= 256`.
- el anillo exterior (primera/última fila y columna) es mayormente transparente,
  para que no quede un halo del fondo original.

## El renderer

El `.ts` viene autocontenido con esta función, sin dependencias externas:

```ts
export function renderSprite(
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  x: number,
  y: number,
  scale = 1,
): void {
  const { width, palette, transparentIndex, data } = sprite;
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < data.length; i++) {
    const idx = data[i];
    if (idx === transparentIndex) continue;
    const color = palette[idx];
    if (!color) continue;
    ctx.fillStyle = color;
    ctx.fillRect(x + (i % width) * scale, y + Math.floor(i / width) * scale, scale, scale);
  }
}
```

`imageSmoothingEnabled = false` es clave: el escalado tiene que ser de bloques,
no interpolado, o se pierde el pixel art.

## Sets de 4 direcciones (`--directions`)

Con `--directions` la salida es un `Record<Direction, Sprite>`:

```ts
export type Direction = "front" | "back" | "left" | "right";
export const NAME: Record<Direction, Sprite> = { front, back, left, right };
```

Las cuatro vistas comparten `width`/`height`. A partir de **una sola** imagen las
vistas se derivan por combine + mirror (`left` es el espejo de `right`), que sirve
para personajes simétricos. Para máxima fidelidad por dirección, pasá una imagen
por vista y combinálas vos.

## Editar un sprite a mano

`palette` y `data` son texto estructurado, así que editar es directo:

- **Recolorear**: cambiá una entrada de `palette` (ej. `palette[5] = "#082e5b"`).
  Todos los píxeles con ese índice cambian de color de una.
- **Borrar píxeles**: poné `0` en las posiciones de `data` que quieras
  transparentes.
- **Espejar**: invertí cada fila de `data` (hay un helper `mirror_sprite` en
  `scripts/spritelib.py`).

Después de editar el `.json`, re-renderizá y re-validá:

```bash
python3 scripts/validate.py --sprite NAME.json --size N --image SRC.png
```
