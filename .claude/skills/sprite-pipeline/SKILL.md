---
name: sprite-pipeline
description: Convierte CUALQUIER imagen (PNG/JPG) en un sprite de pixel art renderizado y validado a la resolución NxN que pidas (32, 48, 64…), con un solo comando standalone y portable. Emite el .ts indexado listo para el juego + preview PNG + reporte JSON de aserciones técnicas, y devuelve exit code ≠ 0 si algo falla (encadenable en CI). Usá esta skill SIEMPRE que el usuario quiera "convertir esta imagen a pixel art", "generá un sprite de NxN", "renderizá este personaje para mi juego", "pasá este PNG/foto a un sprite indexado", "hacé un sprite de 64x64 de esta imagen", validar un sprite, o necesite un pipeline imagen→sprite reproducible sin atarse a rutas o proyectos fijos. Disparála ante cualquier mención de convertir imágenes a sprites, pixel art a partir de fotos, o validación de sprites, aunque no diga la palabra "skill".
---

# sprite-pipeline

Pipeline **standalone y portable** imagen → sprite de pixel art renderizado y
validado. La interfaz es mínima a propósito:

    entrada = una imagen cualquiera + una resolución NxN
    salida  = el sprite correcto (.ts) + preview + reporte de validación

Nada de rutas fijas ni de imágenes/proyectos específicos: todo se deriva de los
argumentos, así que se reutiliza tal cual en cualquier proyecto.

## Uso

```bash
python3 scripts/run.py --image <RUTA_IMAGEN> --size <N> [opciones]
```

Ejemplo concreto:

```bash
python3 scripts/run.py --image foo.png --size 48 --out-dir ./sprite-out
```

Opciones (todas con defaults sensatos):

| flag | default | qué hace |
|------|---------|----------|
| `--image` | — (requerido) | cualquier PNG/JPG |
| `--size` | — (requerido) | resolución cuadrada N (32, 48, 64…) |
| `--max-colors` | 64 | presupuesto de paleta (hasta 255) |
| `--content-rows` | interior lleno | cuántas filas ocupa el cuerpo |
| `--bg-tol` | 40 | tolerancia de fondo; más bajo = menos agresivo |
| `--name` | nombre del archivo | nombre del sprite y de los artefactos |
| `--out-dir` | `./sprite-out` | dónde quedan los artefactos |
| `--directions` | off | emite las 4 vistas (front/back/left/right) por combine + mirror |
| `--scale` | 8 | factor de escala del preview |
| `--ring-tol` | 0.9 | fracción transparente mínima del anillo exterior |

## Qué hace por dentro (en este orden)

1. **Convierte** la imagen a un `Sprite` indexado NxN. La reducción toma el
   **color dominante** de cada celda, nunca el promedio: promediar mezcla el
   contorno oscuro con el relleno y deja un "velo gris". Se conserva la paleta
   real (cuantizada a `--max-colors`) y se reserva un borde transparente por
   construcción para que no quede halo de fondo.
2. **Renderiza** el `<name>.preview.png` (transparencia preservada).
3. **Valida** el resultado con `scripts/validate.py` (ver abajo).
4. **Presenta** preview + reporte (`present_files` si está disponible) y
   **devuelve exit ≠ 0** si alguna aserción técnica falla, para encadenar en CI.
5. **Deja los artefactos juntos** en `--out-dir`: `<name>.ts`, `<name>.json`,
   `<name>.preview.png`, `<name>.report.json`.

Es idempotente: corré con el mismo `--out-dir` y se sobrescriben los artefactos.

## Formato de salida

El `.ts` es autocontenido (trae `interface Sprite`, los datos y `renderSprite`),
así que entra directo a un juego sin dependencias. El detalle completo del
formato `Sprite`, el set de 4 direcciones y la edición están en
`references/output-format.md` — leelo antes de editar a mano un `.json` o de
integrar el renderer.

## Validación

`scripts/validate.py` corre solo o se invoca desde `run.py`. Las aserciones
técnicas son determinísticas y están parametrizadas por N:

- `width === N && height === N`
- `data.length === width * height`
- todos los índices de `data` en rango `[0, palette.length - 1]`
- `palette.length <= 256`
- `palette[0]` vacío (transparente) y `transparentIndex === 0`
- **sin halo de fondo**: el anillo exterior es ≥ `--ring-tol` transparente
- con `--directions`: las 4 vistas presentes y con el mismo `width`/`height`

Además reporta una **métrica visual de apoyo** (numérica, no pass/fail):
distancia de color promedio en espacio Lab entre la imagen original reescalada y
el sprite renderizado, alineadas con la misma geometría. Sirve de guía para
revisión humana; un número más bajo es más fiel.

El reporte JSON: `{ size, checks: [{name, pass, message}], color_distance, ok }`.

Correrla suelta:

```bash
python3 scripts/validate.py --sprite NAME.json --size 32 --image SRC.png
python3 scripts/validate.py --sprite NAME.json --size 48 --directions
```

## Dependencias

Usa Pillow y numpy. Si falta alguno:
`pip install pillow numpy --break-system-packages`.

## Iterar la fidelidad

Mirá el preview y ajustá:
- colores apagados o detalle perdido → subí `--max-colors` (hasta 255).
- se come parte del sprite o deja halo → bajá `--bg-tol`.
- proporciones raras → ajustá `--content-rows`.
- `color_distance` alto → suele bajar subiendo `--size` o `--max-colors`.
