# Análisis de referencias y propuesta para Royo

> Los vídeos son **inspiración**, no algo que copiar. De ellos saco las técnicas que hacen que una web
> se sienta como un vídeo interactivo y enganche, y las aplico a Royo con su propio estilo.

---

## 1. Qué hace cada vídeo (como movimiento, no como capturas sueltas)

Los he recorrido fotograma a fotograma: el principal cada ~0,5 s y los otros dos cada ~1,2 s.

### Vídeo 3 · PRINCIPAL · "Oryzo" (un posavasos de corcho) · 16 s
Todo el vídeo es **un solo objeto que viaja por la web**. Cada scroll lo cambia de escena, y en ningún momento hay "secciones" que entren y salgan como bloques.

| Tiempo | Qué pasa en pantalla |
|---|---|
| 0–2 s | Fondo oscuro con luz cálida en una esquina. El objeto, en grande y en el centro, lo sujeta una mano. Detrás, el titular gigante ("Powered by AI"). Un **halo de color recorre el borde** de la pantalla como si se encendiera. |
| 2,5 s | El objeto **encoge y entra en una tarjeta con marco fino** en el centro, con crucetas de plano en las esquinas. El objeto gira en 3D dentro de la tarjeta. |
| 3 s | Aparece una **palabra gigante que pasa por delante** ("it's wearable"), con desenfoque de movimiento, y se aparta. |
| 3,5–5,5 s | La tarjeta central se queda fija y **dentro cambian las fotos**: el objeto puesto en distintas situaciones. A los lados va apareciendo una **galería en fila** con las fotos anteriores. |
| 6–6,5 s | Corte a escena "real": la tarjeta **se abre a pantalla completa** y estamos en un escritorio. El objeto ya está colocado en la escena. Texto pequeño abajo a la izquierda. |
| 7 s | **La misma escena cambia de luz**: pasa a púrpura y naranja, una especie de vista térmica, para contar otra característica sin cambiar de plano. |
| 7,5 s | **Modo plano técnico**: la escena se vuelve líneas, el objeto se convierte en un aro con cotas y piezas despiezadas arriba. |
| 8 s | Las letras de la marca se montan con **puntos de construcción** (como en un programa de diseño) y luego se rellenan. |
| 8,5–9 s | **Cámara cenital** sobre una mesa de trabajo con herramientas. El objeto aparece sobre la mesa y la cámara se acerca. |
| 9,5 s | **Macro**: el objeto ocupa toda la pantalla y se ve la textura del material. |
| 10–10,5 s | Blanco y negro, superficie en primer plano y un titular técnico centrado. |
| 11–12,5 s | **La textura del material llena la pantalla** con un corte horizontal, y la palabra gigante "sustainability" aparece **primero en oscuro y luego en claro**: un cambio de tema de toda la página. |
| 13,5 s | Reseñas en lista, con el objeto flotando en el centro. |
| 14–15 s | Escenas deportivas o de prueba en fila, con titular gigante por delante y partículas al "caer" el objeto. |
| 15,6–16 s | Cierre: logo gigante con **reflejo en el suelo** y halo detrás. |

**Ritmo:** cada "plano" dura entre 0,5 y 1,5 s de scroll y siempre hay algo moviéndose. No hay ni un momento estático.

### Visto en directo en oryzo.ai (con scroll real)
Lo más revelador: **el scroll de cada escena es muy largo**. Cada "plano" ocupa varias pantallas de rueda, así que el movimiento es lento, suave y sientes que lo controlas tú.

| Momento | Qué pasa mientras haces scroll |
|---|---|
| Carga | Fondo verde oscuro, solo **dos líneas guía en cruz** y un pequeño círculo con nodos, como un programa de diseño. |
| Scroll 1 | El círculo **crece y se convierte en el contorno del objeto**, con los manejadores de curva visibles (puntos y tangentes). Es un dibujo vectorial. |
| Scroll 2 | El dibujo **se convierte en la foto real**: vista cenital de una mesa de trabajo (alfombrilla de corte, lápiz, cúter). Aparece el titular gigante "ORYZO" arriba, la descripción a la derecha y créditos abajo a la izquierda. |
| Scroll 3 | La cámara **se acerca** al objeto, y la mesa y los textos se desvanecen. |
| Scroll 4 | **El fondo se funde a negro cálido, pero el objeto no se mueve**: es el ancla que cose las dos escenas. |
| Scroll 5–15 | El objeto se queda **fijo en el centro y gira en 3D**: de frente, de canto, de lado y de vuelta, con una luz lateral cálida que dibuja el volumen. A izquierda y derecha, textos fijos ("Isn't just a coaster" / "…unprecedented AI breakthroughs") que **se encienden palabra a palabra** y luego se apagan. |
| Scroll 16+ | El objeto encoge un poco y sube. El titular "Powered by AI" **entra letra a letra con desenfoque** (de borroso a nítido) y **una mano sube desde abajo** para "recogerlo". |

**Cómo está construido** (y cómo lo haría yo para Royo):
- **Un único lienzo 3D fijo** detrás de toda la página, con el objeto dentro. Las secciones HTML (textos) pasan por encima.
- Cada sección define **dónde está el objeto, cómo gira, qué luz tiene y qué fondo hay**, y el scroll interpola entre esos "fotogramas clave". Por eso el objeto nunca se corta: solo cambia de pose.
- Los textos son HTML normal (buenos para SEO y accesibilidad), animados por palabra o letra con desenfoque y opacidad.
- **Para Royo** es exactamente la arquitectura que propongo: el mueble en un lienzo 3D fijo y las secciones (manifiesto, colecciones, acabados…) pasando por encima, cada una con su pose del mueble.

### Por qué el scroll de Oryzo se siente "perfecto" (inspeccionado en su código)
He revisado qué archivos carga la web y cómo pinta. Estas son las claves de esa calidad:

| Clave | Qué hace Oryzo | Por qué se nota |
|---|---|---|
| **1. Animaciones hechas en Blender, no en código** | Carga archivos como `hero_camera.buf`, `CAMERA_ANIM.buf`, `COASTER_ANIM.buf` y `COASTER_FLIP_ANIM.buf`: **la cámara y el objeto se animaron a mano en un programa 3D**, con curvas de cine. El scroll solo mueve el cabezal de esa línea de tiempo. | Por eso el movimiento es tan orgánico: aceleraciones y frenadas suaves, arcos de cámara reales. Es un "vídeo 3D" que tú reproduces con la rueda. |
| **2. Un solo lienzo 3D (WebGL2) fijo** | Toda la escena se pinta en un único canvas fijo. El HTML de encima solo cambia opacidad y posición. | Nada en la página se recoloca al hacer scroll, así que no hay tirones: 60 fps constantes. |
| **3. Scroll larguísimo** | La página mide ~54.000 px (unas **65 pantallas**). | Cada gesto de rueda mueve muy poco la animación: se siente lento, caro y controlado. |
| **4. Suavizado del scroll** | El scroll real se suaviza con inercia antes de llegar a la animación. | El objeto "flota" detrás de tu dedo en vez de ir a saltos. |
| **5. Luz horneada y entornos por escena** | Mapas de entorno distintos por escena (`env_hero`, `env_table`, `env_hand`) y texturas de luz precalculada ("harmonics"). | Iluminación de foto de estudio sin coste en tiempo real. |
| **6. Proyecciones de luz (gobos)** | Texturas `gobo_*`: patrones de luz proyectada, como el sol entrando por una ventana. | Da atmósfera de cine a la escena. |
| **7. Objetos escaneados de la realidad** | Archivos `.sog` (**Gaussian splats**): objetos y reflejos de la mesa **escaneados con cámara**, no modelados. | Por eso parte de la escena parece una foto: es una foto en 3D. |
| **8. Postprocesado fino** | Antialiasing SMAA, textura de ruido azul para evitar bandas en los degradados, y renderizado a 1,5× la resolución. | Bordes limpios, degradados sin escalones, nitidez en Retina. |
| **9. Texto 3D dentro de la escena** | Fuentes MSDF y modelos de texto (`sustainability_text.buf`). | Las palabras gigantes viven en el mismo espacio 3D que el objeto: pueden pasar por delante o por detrás. |
| **10. Microanimaciones vectoriales** | Archivo Rive (`oryzo.riv`) para el logo y los detalles. | Pequeñas animaciones nítidas y ligeras en la interfaz. |
| **11. Todo precargado y optimizado** | Imágenes webp/avif, versiones `_MOBILE` aparte, todo cargado durante la pantalla de inicio. | No hay ni un parón a mitad del scroll esperando una imagen. |

**Conclusión:** la "calidad perfecta" sale de cuatro cosas. Primero, **animación de cámara diseñada como en cine** (en Blender) y reproducida con un scroll largo y suavizado. Segundo, **un único lienzo 3D**. Tercero, **luz horneada y objetos escaneados**. Cuarto, **postprocesado y precarga**. Las cuatro se pueden replicar para Royo.

### Vídeo 2 · "Igloo" · 16 s · escala de grises
- Arranca con un **dibujo de líneas (wireframe) flotando en blanco**, con un punto de luz.
- Al hacer scroll, el **wireframe se convierte en el objeto sólido** y alrededor **nace el paisaje**.
- Los bloques del objeto **se separan y flotan** (vista explosionada) y luego vuelven a su sitio.
- La cámara entra en el objeto y aparecen anillos, un túnel y un personaje sobre una plataforma.
- La interfaz es mínima: tipografía mono pequeña en las esquinas, como en un HUD de videojuego.
- **Idea clave:** *la construcción del objeto* (de plano a real) como espectáculo.
- **Visto en directo en igloo.inc** (con scroll real):
  - **La carga es parte del espectáculo:** mientras la web carga, el wireframe se va **llenando de luz** desde arriba (la luz crece como una barra de progreso dentro del objeto). Cuando termina, el dibujo **se solidifica**.
  - Con el scroll, alrededor del objeto **aparece el terreno** y las líneas de la cuadrícula se quedan flotando por encima.
  - Al despiezar, cada bloque lleva **puntos numerados unidos por líneas finas**, como una constelación técnica.
  - Los textos entran con efecto **"scramble"**: letras aleatorias que se van descifrando hasta formar la frase.
  - Todo es Three.js con scroll suave: nada es vídeo.

  **Para Royo:** la pantalla de carga sería el mueble en líneas llenándose de luz cálida, y las etiquetas técnicas del despiece entrarían con el efecto de descifrado.

### Vídeo 1 · "Products" · 16 s · fondo blanco
- Piezas del producto **flotando despiezadas en blanco** (tapa, cuerpo, etiqueta), con sombra suave.
- Al hacer scroll **se ensamblan** en el producto y el titular "PRODUCTS" aparece detrás.
- Luego, maquetación **de ficha técnica**: textos pequeños en columnas, **rótulos en vertical** en los bordes y el producto girando en el centro.
- El producto **cambia de color** (de blanco a rojo) y gira en diagonal.
- **Idea clave:** *despiece y montaje* con estética editorial y técnica, sobre fondo claro (el que más encaja con el blanco roto de Royo).

---

## 2. La "gramática" común: por qué enganchan

1. **Un objeto protagonista que no desaparece nunca.** El scroll no cambia de página: cambia lo que le pasa al objeto. Es lo que hace que parezca un vídeo.
2. **El scroll es el cabezal de reproducción.** Todo va atado al scroll (scrub), así que el usuario "dirige" el vídeo. Si para, se para; si vuelve atrás, se rebobina.
3. **Planos de cámara de cine:** plano general, plano medio en tarjeta, cenital, macro y vuelta. Cada cambio de plano equivale a una sección.
4. **Construcción y deconstrucción:** wireframe → sólido, despiece → montaje, plano técnico → real.
5. **Tipografía gigante que interactúa con el objeto:** detrás de él, pasando por delante o rellenándose.
6. **Cambios de luz o de tema sin cambiar de escena:** de oscuro a claro o cambio de color, en la misma toma.
7. **Marcos, crucetas y cotas finas:** detalles de "plano" que dan aspecto técnico y premium.
8. **Transiciones que expanden:** una tarjeta pequeña que se abre a pantalla completa.
9. **Micro-movimiento constante:** el objeto siempre flota o gira un poco, aunque no hagas scroll.
10. **Cierre memorable:** logo gigante con reflejo.

---

## 3. Lo técnico (importante para decidir)

Estas webs **no son CSS**: usan **3D real (WebGL con Three.js o Spline)** o **secuencias de imágenes renderizadas**. El mueble en CSS que hice antes se queda en "maqueta de juguete" frente a esto. Opciones:

| Opción | Cómo se ve | Qué necesito | Mi valoración |
|---|---|---|---|
| **A. Three.js con un mueble modelado por código** | 3D real: madera y piedra con texturas, luz suave, sombras y reflejos. Cámara libre y despiece real de cajones y encimera. | Nada: lo modelo yo (mueble suspendido, encimera, lavabo, grifo, espejo). | **La que recomiendo.** Es la más fiel a las referencias y está integrada en la web. |
| B. Secuencia de imágenes (100–200 fotogramas) | Realismo fotográfico total. | Un render o vídeo del mueble girando, que ahora no tenemos. | Ideal si Royo te da un vídeo o modelo 3D. |
| C. Modelo 3D real de Royo (.glb) en Three.js | Lo mejor de A y B. | El archivo 3D del mueble (Royo seguramente lo tiene para su configurador). | Si lo consigues, lo cambio en minutos sobre A. |

---

## 4. Propuesta concreta para Royo: "El mueble atraviesa la web"

Un **mueble Royo en 3D** es el protagonista y va cambiando de escena con el scroll. Paleta de Royo: blanco roto, casi negro y arena. Mi propuesta es **empezar en claro** (como el vídeo 1) y hacer **un único paso a oscuro** a mitad, para el momento de los materiales.

| # | Plano | Qué pasa | Técnica de referencia |
|---|---|---|---|
| 1 | **Hero: el plano** | El mueble aparece como **dibujo de líneas** sobre blanco roto, con cotas finas. Detrás, el titular gigante "Diseñamos tu baño desde hace más de 50 años". Al empezar el scroll, las líneas **se rellenan** de madera y piedra. | Igloo (wireframe → sólido) |
| 2 | **Despiece** | Encimera, lavabo, cajones y grifo **se separan flotando**, con una etiqueta técnica fina en cada pieza ("Encimera solid surface 12 mm", "Guías ocultas con cierre amortiguado"…), y vuelven a montarse. | Products (despiece) |
| 3 | **La tarjeta** | El mueble encoge dentro de una **tarjeta con crucetas** en el centro. Dentro cambian los baños reales (fotos de las colecciones) y a los lados se va formando la **galería Compact / Modular / Tuyo**. | Oryzo ("wearable") |
| 4 | **Al baño** | La tarjeta **se abre a pantalla completa**: el mueble aterriza en un baño. Los cajones se abren con el scroll. | Oryzo (escritorio) |
| 5 | **Materia** | **Macro** a la veta de la madera hasta llenar la pantalla. Palabra gigante "Calidad" o "Durabilidad", con cambio de tema a oscuro. | Oryzo (corcho / "sustainability") |
| 6 | **Tu acabado** | De vuelta al mueble entero: con el scroll **cambia el acabado** (roble, nogal, blanco, piedra, salvia, negro) y **la luz del ambiente cambia con él**. | Oryzo (cambio de luz) + Products (color) |
| 7 | **Cierre** | "ROYO" gigante con **reflejo** y el mueble flotando delante. Da paso a configuradores, newsletter y footer. | Oryzo (final) |

Se mantienen las secciones que ya funcionan (manifiesto, configuradores, +50 años, newsletter, footer), cosidas a este hilo. Las colecciones pasarían a vivir dentro del plano 3. La sección "película" actual (barra de vídeo, timecode, bandas negras) **desaparece**.

**Requisitos que mantengo:** funciona en móvil (versión más ligera del 3D), respeta "reducir movimiento" (pasos fijos sin animación), carga rápida (el 3D se carga cuando llegas a la sección) y nada de plantilla genérica.

---

## 5. Lo que necesito que revises y decidas

1. **¿Opción A (Three.js con el mueble modelado por mí)?** Te la recomiendo. Si consigues un modelo 3D o un vídeo del mueble de Royo, lo meto después.
2. **¿Rehacer toda la web alrededor del hilo del mueble (7 planos) o solo una sección?** Recomiendo la web completa: es lo que da la sensación de vídeo.
3. **¿Claro con un paso a oscuro (mi propuesta), o todo oscuro como Oryzo?**
4. ¿Quitas, cambias o añades algún plano de la tabla del punto 4?
