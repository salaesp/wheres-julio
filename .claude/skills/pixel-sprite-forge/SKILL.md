---
name: pixel-sprite-forge
description: Convierte imágenes O descripciones de texto en archivos TypeScript de sprites pixel-art listos para un juego (formato indexado, hasta 256 colores, con renderer incluido). Usá esta skill SIEMPRE que el usuario quiera convertir la imagen de un personaje, un sprite de referencia o un NPC en un archivo .ts para un juego, replicar un sprite en una grilla 32x32 (o NxN), generar sprites pixel-art, producir paletas/datos de sprites, o construir assets de personajes a partir de una descripción. Disparála ante cualquier mención de sprites, pixel art, hojas de sprites (sprite sheets), arte de personajes/NPCs para juegos, o pedidos del tipo "pasá esto a un .ts", "replicá este personaje", "generá un sprite", aunque no digan la palabra "skill".
---

# pixel-sprite-forge

Convierte un personaje (desde una **imagen** o una **descripción**) en un sprite
indexado y emite un `.ts` listo para llevar a un juego, más un PNG de
previsualización para verificar la fidelidad.

El formato de salida exacto, el renderer, los sets de 4 direcciones, el espejado
y la edición están en `references/output-format.md`. Leelo antes de emitir el
`.ts` o de hacer ediciones.

## Principios que hacen que salga bien

Estos tres puntos son la diferencia entre un sprite limpio y uno embarrado:

1. **Nunca promediar al achicar.** Reducir por promedio de área mezcla los
   colores con el contorno negro y produce un "velo gris". El conversor reduce
   tomando el **color dominante** de cada celda. Mantené ese método.
2. **No machacar la paleta.** El formato soporta hasta 256 colores, así que
   conservá la fidelidad: cuantizá los colores **reales** del original con un
   `--max-colors` generoso (default 64). No hace falta bajar a ~10 colores.
3. **Siempre verificá renderizando.** Generá el PNG de preview y mostráselo al
   usuario con `present_files` ANTES de dar por bueno el `.ts`. Iterá según lo
   que vea.

## Dependencias

El conversor usa Pillow y numpy (normalmente ya están). Si falta alguno:
`pip install pillow numpy --break-system-packages`.

## Camino A — desde una imagen (el más fiel)

Es el camino sólido. Un PNG/JPG de UN personaje (fondo plano o transparente):

```bash
python3 scripts/img2sprite.py from-image ENTRADA.png --out NOMBRE \
  --max-colors 64 --size 32 --content-rows 28 --bg-tol 40
```

Produce `NOMBRE.ts`, `NOMBRE.json` (editable) y `NOMBRE.preview.png`.

Mostrá el preview y ajustá si hace falta:
- colores apagados / faltan detalles → subí `--max-colors` (hasta 255).
- se come parte del sprite o deja halo → ajustá `--bg-tol` (más bajo = menos
  agresivo con el fondo).
- proporciones raras → cambiá `--content-rows` (cuántas filas ocupa el cuerpo).

Para un personaje completo en 4 direcciones, corré `from-image` por vista y
combinálas en un `Record<Direction, Sprite>` (ver referencia). Si solo hay un
lado, derivá el opuesto con `mirror`.

Si la entrada es una **hoja con varios personajes**, segmentá primero (detectá
bandas de fondo entre celdas, recortá cada una a un PNG temporal, corré
`from-image` en cada celda). Tomá un cuadro representativo por grupo de
animación. Detalle en la referencia.

## Camino B — desde una descripción

Claude no genera imágenes raster por sí mismo, así que hay dos opciones:

1. **Si hay un conector/MCP de generación de imágenes disponible**, generá una
   imagen del personaje ("sprite estilo overworld 16-bit, vista frontal, cuerpo
   completo, fondo blanco, centrado, sin texto") y después pasala por el Camino
   A. Es la vía de mayor fidelidad para texto→sprite.
2. **Si no hay generador de imágenes**, construí el sprite directamente: armá un
   JSON indexado a mano (ver el tipo en la referencia), renderizalo con
   `scripts/img2sprite.py render sprite.json --out preview.png`, mostráselo al
   usuario e iterá. Funciona bien para sprites simples/icónicos; para personajes
   detallados avisá que la fidelidad es menor y conviene una imagen de
   referencia. Aprovechá el preview para corregir ronda a ronda.

## Editar / variar un sprite

Pedidos como "sacale la gorra", "el pelo va azul #082e5b", "espejalo",
"recoloreá la chaqueta", "agregá un cuadro de caminata" son ediciones sobre
`palette`/`data` (texto estructurado), no sobre raster — Claude las hace bien.
Cargá el `.json`, aplicá el cambio, RE-RENDERIZÁ con `render` para verificar, y
recién ahí emití el `.ts` con `emit-ts`. Recolorear suele ser cambiar una sola
entrada de `palette`.

## Entregar

Emití el `.ts` final y presentalo junto al PNG de preview con `present_files`,
con un resumen breve (cuántos colores, qué vistas). El `.ts` es autocontenido:
trae el tipo `Sprite`, los datos y `renderSprite`, así que entra directo al
juego.