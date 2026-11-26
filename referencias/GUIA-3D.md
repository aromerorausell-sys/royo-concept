# Guía paso a paso: conseguir el 3D del mueble Royo

Todo lo que consigas va a la carpeta **`royo-concept/assets/3d/`**.
Haz los pasos en orden: si consigues el paso 1, los demás son opcionales.

---

## Paso 1 · Pedir el modelo a Royo (lo mejor, 10 minutos)
Royo tiene configuradores 3D en su web, así que casi seguro tienen los modelos.

**Escríbeles algo así** (por email o LinkedIn al departamento de marketing o diseño):
> Hola, soy Alejandro Romero, diseñador web. Estoy preparando un concepto de rediseño de vuestra web con
> experiencia 3D interactiva. ¿Podríais facilitarme el modelo 3D de un mueble de la colección Modular
> (por ejemplo Logika), en formato .glb, .fbx, .obj o .step? Solo lo usaré para el concepto.

**Qué pedir exactamente:**
- 1 mueble suspendido con 2 cajones, encimera y lavabo (Logika o Essence, por ejemplo).
- Formatos válidos, de mejor a peor: `.glb` / `.gltf` → `.fbx` → `.obj` → `.step`/`.stp` (CAD; lo convertimos).
- Si tienen las **texturas de los acabados** (roble, nogal, blanco…), que las incluyan.

**Guárdalo como:** `assets/3d/mueble.glb` (o con el nombre y la extensión que venga).

---

## Paso 2 · Escanear un mueble real con el iPhone (realismo de foto)
Si puedes ir a una tienda o exposición con muebles Royo (o tienes uno en casa).

### Qué app usar (todas gratis para empezar)
| App | Para qué | Exporta |
|---|---|---|
| **Scaniverse** (recomendada) | Gaussian splat de mucha calidad, gratis | `.ply` / `.spz` (splat) y `.glb` (malla) |
| **Polycam** | Malla con textura, muy fácil | `.glb` (con la versión gratis tiene límites) |
| **Luma AI** | Splat muy realista | `.ply` / `.splat` |

### Cómo escanear bien (lo más importante)
1. **Luz:** uniforme y suave. Nada de sol directo ni focos fuertes que hagan brillos. Mejor un día nublado o una tienda bien iluminada.
2. **Despeja alrededor:** que no haya cajas, personas ni cosas pegadas al mueble.
3. **Rodea el mueble despacio**, en **3 vueltas**:
   - Vuelta 1: a la altura del mueble.
   - Vuelta 2: más alto, mirando un poco hacia abajo (para captar la encimera y el lavabo).
   - Vuelta 3: más bajo, mirando hacia arriba (para captar los bajos, porque es suspendido).
4. **Distancia:** que el mueble ocupe ~70 % de la pantalla. Sin acercarte ni alejarte de golpe.
5. **Duración:** 1–2 minutos. Movimiento lento y continuo, sin tirones.
6. **Superficies difíciles:** espejos y cristal salen mal. Si hay espejo, mejor tápalo o déjalo fuera del encuadre.
7. Si puedes, **haz 2 escaneos**: uno con los cajones cerrados y otro con un cajón abierto.

### Exportar
- **En Scaniverse:** abre el escaneo → *Share/Export* → elige **Splat (`.ply` o `.spz`)** y también **Mesh (`.glb`)**.
- **En Polycam:** *Export* → **GLB**.
- Pásalo al Mac (AirDrop) y guárdalo en `assets/3d/`, por ejemplo `mueble-scan.ply` y `mueble-scan.glb`.

---

## Paso 3 · Si no hay ni modelo ni mueble cerca: generarlo con IA a partir de fotos
1. Busca 1–3 fotos del mueble **de frente, con fondo limpio y bien iluminado** (la web de Royo vale para la demo privada).
2. Recorta el fondo con [remove.bg](https://remove.bg).
3. Súbela a **[meshy.ai](https://meshy.ai)**, **[tripo3d.ai](https://tripo3d.ai)** o **[hyper3d.ai](https://hyper3d.ai)** → opción *Image to 3D*.
4. Exporta en **`.glb` con texturas**.
5. Guárdalo en `assets/3d/mueble-ia.glb`.

La calidad es media (las texturas pueden salir algo borrosas), pero la forma suele servir y yo mejoro los materiales en código.

---

## Paso 4 · Material extra que mejora mucho el resultado (en paralelo)
Mientras estás con el mueble, saca con el móvil (o consigue de Royo):
- **Macros de los acabados:** veta de la madera, canto de la encimera, tirador o gola, interior del cajón. De cerca, con luz suave, en horizontal.
- **2–3 fotos del mueble montado en un baño real**, en horizontal.
- **El logo de Royo en SVG** (pídeselo también en el email del paso 1).
- **Datos técnicos reales:** materiales, grosor de la encimera, tipo de guías de los cajones y nombres de los acabados.

Guárdalo en `assets/` (fotos) y `referencias/` (datos y logo).

---

## Paso 5 · Avísame
Dime qué has conseguido y yo:
1. Reviso el archivo: tamaño, calidad y si hace falta limpiarlo o reducirlo.
2. Lo optimizo para la web (comprimido para que cargue rápido).
3. Monto la escena 3D con el scroll largo y suave, la luz de estudio y los planos.

**No pasa nada si no consigues nada:** modelo yo el mueble por código y, cuando llegue el bueno, lo sustituyo sin rehacer la web.
