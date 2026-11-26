# Royo · concepto de rediseño web

Concepto de rediseño de la web de Royo (muebles de baño, Valencia): experiencia 3D con scroll (Three.js + Lenis), fichas de colección, contacto, ES/EN.

**No es la web oficial de Royo.** Las fotos, los textos y los modelos 3D pertenecen a Royo y se usan solo para este concepto privado.

Concept by Alejandro Romero.

**Repositorio:** https://github.com/aromerorausell-sys/royo-concept

## Descripción
Rediseño conceptual de la web de **Royo**, fabricante valenciano de muebles de baño con más de 50 años de historia. La idea es contar la marca como una película que avanza con el scroll, sin vídeos: todo es 3D en tiempo real en el navegador.

**Qué incluye**
- **Portada cinematográfica en 3D**: el mueble Logika (modelo real del configurador de Royo) se dibuja en líneas, se llena de luz, se despieza con sus etiquetas técnicas y abre los cajones al hacer scroll.
- **Galería de colecciones** (Compact, Modular y Tuyo) que se abre a pantalla completa, macro del material y paso a modo oscuro.
- **Econic en 360º**, la colección del 50 aniversario, modelada por código a partir de su ficha técnica. Sus acabados se pueden elegir con un clic.
- **Montaje atado al scroll** en la sección Instalación, preparada para un vídeo de montaje.
- **Fichas de colección** (Logika, Econic y Alfa) con visor 3D, galería, ficha técnica y documentos.
- **Catálogo completo** y página de **contacto** con mapa y buscador de distribuidores (demo).
- **ES / EN**, versión para móvil y respeto a *reducir movimiento*.

**Tecnología**: HTML, CSS y JavaScript sin frameworks · Three.js · Lenis (scroll suave).

## Verla en local
```bash
git clone https://github.com/aromerorausell-sys/royo-concept.git
cd royo-concept
python3 -m http.server 8080
```
y abre http://localhost:8080
