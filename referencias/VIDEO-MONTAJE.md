# Vídeo de montaje · qué hacer

## 1. Las dos imágenes (ya están hechas)
Están en `royo-concept/assets/video/`. Las dos tienen 1920×1080, el mismo fondo que la web (#F5F2EE) y la misma cámara.

| Archivo | Para qué |
|---|---|
| `montaje-inicio.png` | **Primer fotograma**: el Logika despiezado (encimera arriba, laterales y cajones separados) |
| `montaje-final.png` | **Último fotograma**: el mueble montado |

## 2. Dónde generarlo
Usa una herramienta que admita **primer y último fotograma** (*start / end frame*). Así el vídeo termina justo en el mueble montado:
- **Kling** (klingai.com) → *Image to Video* → sube las dos imágenes en *Start frame* y *End frame*. Es la mejor opción para piezas que encajan.
- **Runway** (Gen-4) → *First frame / Last frame*.
- **Luma Dream Machine** → *Start / End frame*.
- **Google Veo** (en Flow) → *Frames to video*.

Ajustes: **16:9**, **5–10 s**, **sin cámara en movimiento** (cámara fija), **sin audio**.

## 3. Prompt (cópialo tal cual)
```
Static camera, locked-off tripod shot, no camera movement. Clean product animation on a plain warm off-white studio background (#F5F2EE).
The pieces of a modern wall-hung bathroom vanity assemble themselves smoothly and precisely: the two wooden side panels slide inward
and lock to the frame, the two drawers glide straight back into the cabinet and close softly, then the white ceramic countertop with
the integrated basin and tap lowers gently from above and settles on top. Slow, elegant, satisfying ease-in-out motion, one piece at a time,
no bouncing, no extra objects, no hands, no people, no text. Soft diffused studio light, soft shadow on the wall behind.
Photorealistic light oak wood texture, premium furniture commercial, minimal, Scandinavian.
```
Si sale raro, añade al final: `The furniture keeps exactly the same shape, proportions and colors as in the first frame.`
**Negative prompt** (si la herramienta lo tiene): `camera shake, zoom, people, hands, tools, text, logo, extra furniture, warping, melting, flicker`

## 4. Pásamelo
Descarga el vídeo en la máxima calidad y guárdalo como **`royo-concept/assets/video/montaje-original.mp4`**. Después avísame y yo:
1. Lo preparo para que se pueda avanzar y retroceder con el scroll. Se recodifica con un fotograma clave en cada frame; sin eso, el vídeo va a saltos:
   ```bash
   ffmpeg -i montaje-original.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -g 1 -crf 20 -pix_fmt yuv420p -an -movflags +faststart montaje.mp4
   ```
2. Lo dejo como `assets/video/montaje.mp4`. La web lo detecta sola.

## 5. Dónde sale en la web
En la sección **Instalación** de la portada. Al hacer scroll, el mueble se monta: el vídeo avanza y retrocede con la rueda, al estilo de Oryzo, y los pasos 01–04 se van encendiendo.
Mientras no esté el vídeo, la sección funciona igual con un fundido entre las dos imágenes.
