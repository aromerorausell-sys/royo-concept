/* Ficha de colección: una plantilla para todas (?c=logika | econic | alfa) */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeMaterials, loadLogika, buildEconic } from './royo-models.js';

const g = (k, n) => Array.from({ length: n }, (_, i) => `assets/royo/g/${k}-${String(i).padStart(2, '0')}.jpg`);
const DATA = {
  logika: {
    name: 'Logika', line: 'Compact · Modular', tag: 'El baño, el nuevo corazón de la casa.',
    hero: 'assets/royo/logika-nogal.jpg',
    meta: [['Fondo', '45 cm'], ['Alto', '56,5 cm'], ['Anchos', '60 · 80 · 100 · 120']],
    feats: [
      ['Líneas rectas', 'Funcionalidad con un diseño de líneas rectas, encimeras asimétricas y un tirador integrado discreto.'],
      ['Cajón metálico', 'Cajón de 45 de fondo con estética de alta gama y doble regulación: arriba-abajo e izquierda-derecha.'],
      ['Interior antracita', 'Interiores de cajón en acabado antracita.'],
      ['4 acabados', '3 lisos y 1 madera en melamina, con tirador en blanco, antracita o inox.'],
      ['Lavabo a elegir', 'Lavabo integrado o sobre encimera.'],
    ],
    model: 'logika', src: 'Modelo 3D real del configurador de Royo',
    finishes: [
      { name: 'Nogal Ártico', color: '#f2e4cf', map: 'nogal', rough: 0.62, sw: '#dccbb2' },
      { name: 'Blanco Pure', color: '#f1efea', rough: 0.5, sw: '#f6f5f2' },
      { name: 'Verde Pure', color: '#5d6857', rough: 0.58, sw: '#5d6857' },
      { name: 'Azul Talco Pure', color: '#8797ac', rough: 0.55, sw: '#8797ac' },
    ],
    specs: [['Fondo', '45 cm'], ['Alto', '56,5 cm'], ['Anchos', '60, 80, 100 y 120 cm'], ['Laterales', 'Aglomerado TSCA 16 mm'], ['Frentes', 'DM TSCA 18 mm'], ['Cajones', 'Extracción total Hettich, cierre amortiguado'], ['Interior', 'Antracita, con organizador'], ['Tirador', 'Integrado: blanco, antracita o inox'], ['Instalación', 'Suspendido']],
    docs: [['Ficha técnica', 'assets/docs/logika-ficha.pdf'], ['Esquema de montaje', 'assets/docs/logika-montaje.pdf'], ['Vídeo de montaje', 'https://youtu.be/bs2HRiMpeAU']],
    gallery: g('logika', 12),
  },
  econic: {
    name: 'Econic', line: 'Modular · 50 aniversario', tag: 'Una mirada a la naturaleza, en cada curva.',
    hero: 'assets/royo/econic-terracota.jpg',
    meta: [['Fondo', '45 cm'], ['Alto', '56,5 cm'], ['Anchos', '59,5 · 79,5 · 99,5']],
    feats: [
      ['50 aniversario', 'Colección emblemática creada para el 50 aniversario de Royo.'],
      ['Curvas de montaña y río', 'Presentes en sus formas redondeadas, su tirador único, sus lavabos y sus espejos.'],
      ['Piel fumé', 'Interiores de cajón en piel fumé.'],
      ['Lacado al agua', 'Acabados con proceso de lacado al agua.'],
      ['Extracción total', 'Guías Hettich de extracción total. Lavabo integrado o sobre encimera.'],
    ],
    model: 'econic', src: 'Modelo 3D recreado a partir de la ficha técnica de Royo',
    finishes: [
      { name: 'Azul Vapor', color: '#566e86', rough: 0.72, sw: '#566e86' },
      { name: 'Hickory Nature', color: '#ffffff', map: 'hickory', rough: 0.6, sw: '#b08560' },
      { name: 'Terracota', color: '#c05e3e', rough: 0.72, sw: '#c05e3e' },
      { name: 'Verde Forest', color: '#4d5b48', rough: 0.72, sw: '#4d5b48' },
      { name: 'Blanco Mate', color: '#eeece7', rough: 0.7, sw: '#f4f3f0' },
      { name: 'Negro Mate', color: '#2a2a2a', rough: 0.7, sw: '#262626' },
    ],
    specs: [['Fondo', '45 cm'], ['Alto', '56,5 cm'], ['Anchos', '59,5, 79,5 y 99,5 cm'], ['Laterales', 'TSCA 16 mm'], ['Frentes', 'DM TSCA 18 mm, lacado al agua'], ['Cajones', 'Extracción total Hettich, cierre amortiguado'], ['Interior', 'Piel fumé'], ['Acabados', 'Azul Vapor, Blanco y Negro mate, Verde Forest, Terracota, Gris Vintage, Azul Navy, Blanco brillo, Nature Beige, Hickory y White'], ['Instalación', 'Suspendido']],
    docs: [['Ficha técnica', 'assets/docs/econic-ficha.pdf'], ['Esquema de montaje', 'assets/docs/econic-montaje.pdf'], ['Vídeo de montaje', 'https://youtu.be/vT1QEa_X8Fc'], ['Vídeo de regulación', 'https://youtu.be/LMrT4zvzSEg']],
    gallery: g('econic', 12),
  },
  alfa: {
    name: 'Alfa', line: 'Compact · Modular', tag: 'Diseño atemporal con laterales curvos.',
    hero: 'assets/royo/alfa-arena.jpg',
    meta: [['Fondo', '45 cm'], ['Alto', '56,5 cm'], ['Anchos', '60 · 80 · 100 · 120']],
    feats: [
      ['Laterales curvos', 'Diseño atemporal con laterales curvos y tirador integrado en el frente.'],
      ['Piel fumé', 'Interiores de cajón en piel fumé, con organizador en el cajón superior.'],
      ['Extracción total', 'Guías Hettich de extracción total y cierre amortiguado.'],
      ['Puertas y cajones', 'Nueva composición de 100 cm con cajón lateral a izquierda o derecha.'],
      ['Patas decorativas', 'Patas Wire o Lite en tres acabados distintos.'],
    ],
    model: null,
    specs: [['Fondo', '45 cm (columna 24 cm)'], ['Alto', '56,5 cm'], ['Anchos', '60, 80, 100 y 120 cm'], ['Laterales y frentes', 'MDF 16 mm'], ['Cajones', 'Hettich, cierre amortiguado, organizador'], ['Interior', 'Piel fumé'], ['Acabado', 'Foil 2D / Foil 3D y lacados'], ['Encimeras', 'Mineral, mármol, Concretech, melamina o lacada'], ['Instalación', 'Suspendido o con patas']],
    docs: [['Ficha técnica', 'assets/docs/alfa-ficha.pdf'], ['Esquema de montaje', 'assets/docs/alfa-montaje.pdf'], ['Vídeo de montaje', 'https://youtu.be/vT1QEa_X8Fc']],
    gallery: g('alfa', 12),
  },
};

const key = new URLSearchParams(location.search).get('c');
const D = DATA[key] || DATA.logika;
const $ = (id) => document.getElementById(id);
document.title = `Royo · ${D.name} (concepto)`;
$('cName').textContent = D.name; $('cLine').textContent = D.line; $('cTag').textContent = D.tag;
$('cHero').src = D.hero; $('cHero').alt = `Mueble ${D.name} de Royo en un baño`;
$('cMeta').innerHTML = D.meta.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
$('cFeats').innerHTML = D.feats.map(([t, d], i) => `<li class="reveal"><span>${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`).join('');
$('cGallery').innerHTML = D.gallery.map((src, i) => `<button class="gallery__item clip" data-i="${i}"><img src="${src}" alt="${D.name}, foto ${i + 1}" loading="lazy" /></button>`).join('');
$('cSpecs').innerHTML = D.specs.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
$('cDocs').innerHTML = D.docs.map(([t, h]) => `<a href="${h}" target="_blank" rel="noopener" class="doc"><span>${/youtu/.test(h) ? 'Vídeo' : 'PDF'}</span>${t}<i>↗</i></a>`).join('');
$('cOthers').innerHTML = Object.entries(DATA).filter(([k]) => DATA[k] !== D).map(([k, o]) => `<a href="coleccion.html?c=${k}" class="other"><img src="${o.hero}" alt="" loading="lazy" /><span class="eyebrow">${o.line}</span><b>${o.name}</b></a>`).join('');

// apariciones
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal, .clip').forEach((el) => io.observe(el));
requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));

// galería a pantalla completa
const lb = $('lightbox'), lbImg = lb.querySelector('img');
$('cGallery').addEventListener('click', (e) => { const b = e.target.closest('.gallery__item'); if (!b) return; lbImg.src = D.gallery[+b.dataset.i]; lb.hidden = false; });
lb.addEventListener('click', () => (lb.hidden = true));
addEventListener('keydown', (e) => { if (e.key === 'Escape') lb.hidden = true; });

/* ---------- visor 3D ---------- */
if (!D.model) $('viewerSec').remove();
else {
  const box = $('viewer'), canvas = $('vc');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 30);
  camera.position.set(1.4, 0.55, 2.3);
  const key = new THREE.DirectionalLight(0xfff0de, 2.4); key.position.set(-1.6, 3.6, 4.2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5 }); key.shadow.radius = 8; key.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(0xdde6ff, 0.9); rim.position.set(2.6, 1.4, -2.2);
  scene.add(key, rim);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.ShadowMaterial({ opacity: 0.08 })); wall.position.z = -0.245; wall.receiveShadow = true; scene.add(wall);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.06; controls.target.set(0, 0.03, 0);
  controls.minDistance = 1.4; controls.maxDistance = 4; controls.minPolarAngle = 0.5; controls.maxPolarAngle = 1.75;
  controls.minAzimuthAngle = -1.2; controls.maxAzimuthAngle = 1.2; controls.enablePan = false;
  controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches; controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => (controls.autoRotate = false));

  const mats = makeMaterials(renderer);
  let M = null, open = 0, openTarget = 0;
  const target = new THREE.Color();
  const setFinish = (i) => {
    const f = D.finishes[i];
    mats.body.map = f.map ? mats.TEX[f.map] : null; mats.body.roughness = f.rough; mats.body.needsUpdate = true; target.set(f.color);
    mats.groove.map = mats.body.map; mats.groove.needsUpdate = true;
    $('vFin').textContent = f.name;
    [...$('vDots').children].forEach((d, k) => d.classList.toggle('on', k === i));
  };
  $('vDots').innerHTML = D.finishes.map((f, i) => `<button style="background:${f.sw}" aria-label="${f.name}" data-i="${i}"></button>`).join('');
  $('vDots').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setFinish(+b.dataset.i); });
  mats.body.color.set(D.finishes[0].color); setFinish(0);
  $('vSrc').textContent = D.src;
  $('vOpen').addEventListener('click', (e) => { openTarget = openTarget ? 0 : 1; e.currentTarget.textContent = openTarget ? 'Cerrar cajones' : 'Abrir cajones'; e.currentTarget.setAttribute('aria-pressed', !!openTarget); });

  const ready = (m) => { M = m; scene.add(M.grp); };
  if (D.model === 'logika') loadLogika(mats).then(ready); else ready(buildEconic(mats));

  const resize = () => { const w = box.clientWidth, h = box.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(box); resize();
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(box);
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    controls.update();
    mats.body.color.lerp(target, 0.12); mats.groove.color.copy(mats.body.color); mats.groove.roughness = mats.body.roughness;
    if (M) {
      open += (openTarget - open) * 0.08;
      M.d1.position.z = M.base.d1.z + 0.33 * open;
      M.d2.position.z = M.base.d2.z + 0.31 * Math.max(0, open * 1.35 - 0.35);
    }
    renderer.render(scene, camera);
  });
}
