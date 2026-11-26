/* ROYO · Laboratorio 3D
   Técnica tipo Oryzo: un único lienzo WebGL fijo, scroll largo + suavizado,
   la cámara y el mueble se mueven por "fotogramas clave" atados al scroll,
   y los textos HTML pasan por encima. Modelo real: Logika 100 (configurador Royo). */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- render ---------- */
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping; // respeta los colores reales de los acabados
renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;

const camera = new THREE.PerspectiveCamera(28, innerWidth / innerHeight, 0.05, 50);

// luz de estudio: principal cálida con sombra suave + contraluz frío
const key = new THREE.DirectionalLight(0xfff0de, 2.4);
key.position.set(-1.6, 3.6, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 0.5, far: 10 });
key.shadow.radius = 8;
key.shadow.bias = -0.0003;
key.shadow.normalBias = 0.02;
const rim = new THREE.DirectionalLight(0xdde6ff, 0.9);
rim.position.set(2.6, 1.4, -2.2);
scene.add(key, rim);

// "pared" invisible que solo recoge la sombra del mueble suspendido
const wallMat = new THREE.ShadowMaterial({ opacity: 0 });
const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), wallMat);
wall.position.z = -0.245;
wall.receiveShadow = true;
scene.add(wall);

const rig = new THREE.Group();
scene.add(rig);

/* ---------- materiales ---------- */
const manager = new THREE.LoadingManager();
const loadbar = document.getElementById('loadbar');
const loadpct = document.getElementById('loadpct');
manager.onProgress = (_u, done, total) => {
  const p = done / total;
  loadbar.style.transform = `scaleX(${p})`;
  loadpct.textContent = `Cargando modelo · ${Math.round(p * 100)}%`;
};

const woodTex = new THREE.TextureLoader(manager).load('../../assets/3d/tex/nogal_artico.jpg');
woodTex.colorSpace = THREE.SRGBColorSpace;
woodTex.wrapS = woodTex.wrapT = THREE.MirroredRepeatWrapping;
woodTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

const hickoryTex = new THREE.TextureLoader(manager).load('../../assets/3d/tex/hickory_nature.jpg');
hickoryTex.colorSpace = THREE.SRGBColorSpace;
hickoryTex.wrapS = hickoryTex.wrapT = THREE.MirroredRepeatWrapping;
hickoryTex.anisotropy = woodTex.anisotropy;
const TEX = { nogal: woodTex, hickory: hickoryTex };

// ?modelo=econic → Econic (modelado por código) · por defecto Logika (modelo real del configurador)
const MODEL = new URLSearchParams(location.search).get('modelo') === 'econic' ? 'econic' : 'logika';
const FINISHES = MODEL === 'econic' ? [
  { name: 'Azul Vapor', color: '#566e86', map: null, rough: 0.72, swatch: '#566e86', bg: '#E8ECF0' },
  { name: 'Hickory Nature', color: '#ffffff', map: 'hickory', rough: 0.6, swatch: '#b08560', bg: '#F2ECE5' },
  { name: 'Terracota', color: '#c05e3e', map: null, rough: 0.72, swatch: '#c05e3e', bg: '#F3E8E3' },
  { name: 'Verde Forest', color: '#4d5b48', map: null, rough: 0.72, swatch: '#4d5b48', bg: '#E6EAE4' },
  { name: 'Blanco Mate', color: '#eeece7', map: null, rough: 0.7, swatch: '#f4f3f0', bg: '#EDEDEB' },
  { name: 'Negro Mate', color: '#262626', map: null, rough: 0.7, swatch: '#262626', bg: '#E3E1DE' },
] : [
  { name: 'Nogal Ártico', color: '#f2e4cf', map: 'nogal', rough: 0.62, swatch: '#dccbb2', bg: '#F4EFE8' },
  { name: 'Blanco Pure', color: '#f1efea', map: null, rough: 0.5, swatch: '#f6f5f2', bg: '#EDEDEB' },
  { name: 'Verde Pure', color: '#5d6857', map: null, rough: 0.58, swatch: '#5d6857', bg: '#E7EBE4' },
  { name: 'Azul Talco Pure', color: '#8797ac', map: null, rough: 0.55, swatch: '#8797ac', bg: '#E8ECF1' },
];
const F0 = FINISHES[0];
const bodyMat = new THREE.MeshStandardMaterial({ map: F0.map ? TEX[F0.map] : null, color: new THREE.Color(F0.color), roughness: F0.rough, metalness: 0 });
// el fondo cóncavo del tirador Econic: misma pintura, vista por dentro
const grooveMat = new THREE.MeshStandardMaterial({ side: THREE.BackSide, roughness: 0.72, metalness: 0 });
const handleMat = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.26 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, metalness: 0.4, roughness: 0.5 });
const drawerMat = new THREE.MeshStandardMaterial({ color: 0x33322f, metalness: 0.55, roughness: 0.42 });
const ceramicMat = new THREE.MeshPhysicalMaterial({ color: 0xfbfaf8, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 });
const bowlMat = ceramicMat.clone();
bowlMat.side = THREE.BackSide;
const SOLIDS = [bodyMat, grooveMat, handleMat, darkMat, drawerMat, ceramicMat, bowlMat];
const lineMat = new THREE.LineBasicMaterial({ color: 0x141414, transparent: true, opacity: 1 });

/* UV por proyección de caja en metros reales → la veta tiene siempre el tamaño correcto */
const TEX_W = 1.1, TEX_H = 0.245; // la textura cubre 1,10 × 0,245 m del frente real
function boxUV(mesh) {
  const g = mesh.geometry;
  mesh.updateWorldMatrix(true, false);
  const m = mesh.matrixWorld, nm = new THREE.Matrix3().getNormalMatrix(m);
  const pos = g.attributes.position, nor = g.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(m);
    n.fromBufferAttribute(nor, i).applyMatrix3(nm);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    let u, w;
    if (az >= ax && az >= ay) { u = v.x; w = v.y; }
    else if (ax >= ay) { u = v.z; w = v.y; }
    else { u = v.x; w = v.z; }
    uv[i * 2] = u / TEX_W + 0.5;
    uv[i * 2 + 1] = w / TEX_H + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

function addEdges(mesh) {
  const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), lineMat);
  lines.raycast = () => {};
  mesh.add(lines);
}
function solid(geo, mat, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

/* ---------- piezas ---------- */
const parts = { d1: new THREE.Group(), d2: new THREE.Group(), top: new THREE.Group(), sideL: null, sideR: null, handles: [] };
const base = {}; // posiciones de reposo para el despiece
let ready = false;

/* caja interior del cajón (según ficha: interior antracita) detrás de un frente */
function drawerBox(grp, b) {
  const W = b.max.x - b.min.x - 0.07, H = (b.max.y - b.min.y) - 0.06, D = 0.38, T = 0.012;
  const cy = (b.max.y + b.min.y) / 2 - 0.01, cz = b.min.z - D / 2 - 0.004;
  [[W, T, D, 0, -H / 2, 0], [T, H, D, -W / 2, 0, 0], [T, H, D, W / 2, 0, 0], [W, H, T, 0, 0, -D / 2]].forEach(([w, h, d, x, y, z]) => {
    const p = solid(new THREE.BoxGeometry(w, h, d), drawerMat);
    p.position.set(x, cy + y, cz + z);
    addEdges(p);
    grp.add(p);
  });
}

/* encimera con lavabo integrado de cerámica + grifo */
function buildTop(carcassTop, W = 1.01) {
  const D = 0.462, T = 0.016;
  const rr = (x, y, w, h, r) => {
    const s = new THREE.Shape();
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const slabShape = rr(-W / 2, -D / 2, W, D, 0.006);
  const BW = 0.6, BD = 0.3, bz = 0.025;
  slabShape.holes.push(rr(-BW / 2, -BD / 2 - bz, BW, BD, 0.06));
  const slabGeo = new THREE.ExtrudeGeometry(slabShape, { depth: T, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 3, curveSegments: 24 });
  slabGeo.rotateX(-Math.PI / 2);
  const slab = solid(slabGeo, ceramicMat);
  slab.position.y = carcassTop + 0.0025;
  addEdges(slab);
  const bowl = solid(new RoundedBoxGeometry(BW, 0.12, BD, 6, 0.055), bowlMat, false);
  bowl.position.set(0, carcassTop + T - 0.06, bz);
  const drain = solid(new THREE.CylinderGeometry(0.018, 0.018, 0.002, 32), handleMat, false);
  drain.position.set(0, carcassTop + T - 0.118, bz);
  const tap = new THREE.Group();
  const body = solid(new THREE.CylinderGeometry(0.016, 0.018, 0.17, 40), handleMat);
  body.position.y = 0.085;
  const spout = solid(new THREE.CylinderGeometry(0.009, 0.009, 0.11, 32), handleMat);
  spout.rotation.x = Math.PI / 2;
  spout.position.set(0, 0.155, 0.055);
  const lever = solid(new RoundedBoxGeometry(0.012, 0.012, 0.06, 2, 0.004), handleMat);
  lever.position.set(0, 0.178, -0.022);
  lever.rotation.x = -0.25;
  tap.add(body, spout, lever);
  tap.position.set(0, carcassTop + T, -D / 2 + 0.065);
  [body, spout, lever].forEach(addEdges);
  parts.top.add(slab, bowl, drain, tap);
  rig.add(parts.top);
}

function finishSetup() {
  base.top = parts.top.position.clone();
  base.d1 = parts.d1.position.clone();
  base.d2 = parts.d2.position.clone();
  if (parts.sideL) base.sideL = parts.sideL.position.clone();
  if (parts.sideR) base.sideR = parts.sideR.position.clone();
  parts.handles.forEach((h) => (h.base = h.m.position.clone()));
  ready = true;
}

/* LOGIKA · modelo real del configurador de Royo */
function loadLogika() {
  new GLTFLoader(manager).load('../../assets/3d/LOGIKA_2C_100.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const c = box.getCenter(new THREE.Vector3());
    model.position.sub(c);
    rig.add(model);
    rig.updateMatrixWorld(true);
    const meshes = [];
    model.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const fronts = [];
    meshes.forEach((m) => {
      const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3());
      m.castShadow = m.receiveShadow = true;
      if (/tirador/i.test(m.name) || /tirador/i.test(m.parent?.name || '')) { m.material = handleMat; parts.handles.push({ m, b }); }
      else if (s.x < 0.02 && s.y < 0.02) m.material = darkMat;
      else {
        m.material = bodyMat;
        boxUV(m);
        if (s.z < 0.025 && b.min.z > 0.15 && s.y > 0.15) fronts.push({ m, b });
        if (s.x < 0.03 && s.y > 0.5) { if (b.min.x < 0) parts.sideL = m; else parts.sideR = m; }
      }
      addEdges(m);
    });
    fronts.sort((a, b) => b.b.max.y - a.b.max.y);
    [parts.d1, parts.d2].forEach((grp, i) => {
      const f = fronts[i];
      if (!f) return;
      rig.add(grp);
      grp.attach(f.m);
      parts.handles.filter((h) => { const y = h.b.getCenter(new THREE.Vector3()).y; return y < f.b.max.y && y > f.b.min.y; })
        .forEach((h) => grp.attach(h.m));
      drawerBox(grp, f.b);
    });
    buildTop(box.max.y - c.y, 1.01);
    finishSetup();
  });
}

/* ECONIC · modelado por código con las medidas de la ficha (99,5 × 56,5 × 45)
   tirador: ranura curva tallada en el frente, nace en el centro y sale por el canto derecho */
function econicFront(w, h, t) {
  const r = 0.0165, yc = h / 2 - 0.045, x0 = 0.0;
  const s = new THREE.Shape();
  s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, yc - r); s.lineTo(x0, yc - r);
  s.absarc(x0, yc, r, -Math.PI / 2, Math.PI / 2, true);
  s.lineTo(w / 2, yc + r); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2);
  const g = new THREE.Group();
  const front = solid(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0012, bevelSegments: 2, curveSegments: 24 }), bodyMat);
  const len = w / 2 - x0;
  const pipe = solid(new THREE.CylinderGeometry(r, r, len, 32, 1, true), grooveMat, false);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(x0 + len / 2, yc, 0.002);
  const cap = solid(new THREE.SphereGeometry(r, 32, 16), grooveMat, false);
  cap.position.set(x0, yc, 0.002);
  g.add(front, pipe, cap);
  return { g, front, pipe };
}
function buildEconic() {
  const W = 0.995, H = 0.55, D = 0.45, FT = 0.019, ST = 0.016;
  const add = (geo, x, y, z, grp = rig) => {
    const m = solid(geo, bodyMat);
    m.position.set(x, y, z);
    grp.add(m);
    return m;
  };
  parts.sideL = add(new THREE.BoxGeometry(ST, H, D - FT), -W / 2 + ST / 2, 0, -FT / 2);
  parts.sideR = add(new THREE.BoxGeometry(ST, H, D - FT), W / 2 - ST / 2, 0, -FT / 2);
  const carcass = [
    add(new THREE.BoxGeometry(W - 2 * ST, ST, D - FT), 0, -H / 2 + ST / 2, -FT / 2),
    add(new THREE.BoxGeometry(W - 2 * ST, H, 0.008), 0, 0, -D / 2 + 0.004),
    add(new THREE.BoxGeometry(W - 2 * ST, ST, 0.09), 0, H / 2 - ST / 2, D / 2 - FT - 0.045),
  ];
  rig.updateMatrixWorld(true);
  [parts.sideL, parts.sideR, ...carcass].forEach((m) => { boxUV(m); addEdges(m); });
  const gap = 0.003, fh = (H - gap) / 2;
  [parts.d1, parts.d2].forEach((grp, i) => {
    rig.add(grp);
    const { g, front, pipe } = econicFront(W, fh, FT);
    g.position.set(0, H / 2 - fh / 2 - i * (fh + gap), D / 2 - FT);
    grp.add(g);
    grp.updateMatrixWorld(true);
    [front, pipe].forEach((m) => boxUV(m));
    g.children.forEach(addEdges);
    if (i === 0) parts.handles.push({ m: pipe });
    drawerBox(grp, new THREE.Box3().setFromObject(front));
  });
  buildTop(H / 2, 1.0);
  finishSetup();
}

if (MODEL === 'econic') {
  buildEconic();
  manager.itemStart('econic'); manager.itemEnd('econic');
} else loadLogika();

manager.onLoad = () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 350);
};

/* ---------- fotogramas clave atados al scroll ---------- */
// p: progreso 0..1 · az/el: ángulos de cámara · dist: distancia · ty: altura del punto de mira
// wire/solid: dibujo de líneas vs. sólido · ex: despiece · open: cajones
const KEYS = [
  { p: 0.00, az: 0.0, el: 0.06, dist: 3.4, ty: -0.02, wire: 1, solid: 0, ex: 0, open: 0 },
  { p: 0.07, az: 0.18, el: 0.10, dist: 3.1, wire: 1, solid: 0 },
  { p: 0.14, az: 0.42, el: 0.16, dist: 2.55, wire: 0, solid: 1 },
  { p: 0.26, az: -0.55, el: 0.22, dist: 2.45 },
  { p: 0.35, az: -0.72, el: 0.36, dist: 3.15, ex: 1 },
  { p: 0.48, az: 0.58, el: 0.30, dist: 3.15, ex: 1 },
  { p: 0.55, az: 0.38, el: 0.26, dist: 2.6, ex: 0, open: 0 },
  { p: 0.63, az: 0.52, el: 0.58, dist: 2.25, open: 1 },
  { p: 0.72, az: 0.30, el: 0.52, dist: 2.3, open: 1 },
  { p: 0.78, az: 0.0, el: 0.10, dist: 2.55, open: 0 },
  { p: 0.93, az: -0.28, el: 0.14, dist: 2.5 },
  { p: 1.00, az: -0.45, el: 0.06, dist: 3.5, ty: 0.05 },
];
for (let i = 1; i < KEYS.length; i++) KEYS[i] = { ...KEYS[i - 1], ...KEYS[i] };
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
function sample(p) {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const t = smoother(THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1));
  const out = {};
  for (const k in a) if (k !== 'p') out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/* ---------- textos ---------- */
if (MODEL === 'econic') {
  const set = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; };
  set('#hud', 'Econic 100 · 2 cajones');
  set('.t-hero .eyebrow', 'Royo · Econic · colección 50 aniversario');
  set('.t-giant .big', 'Econic');
  set('[data-anchor="handle"] .in', '<b data-scramble>Tirador</b>Ranura curva tallada en el frente');
  set('[data-anchor="side"] .in', '<b data-scramble>Lacado</b>Al agua · 6 acabados');
  const l = document.querySelectorAll('.t-left');
  if (l[0]) l[0].innerHTML = '<p class="eyebrow" data-scramble>01 · 50 aniversario</p><h2 class="big">Curvas de<br /><em>montaña y río.</em></h2><p>Creada para los 50 años de Royo. 99,5 × 56,5 × 45 cm, frentes de 18 mm.</p>';
  if (l[1]) l[1].innerHTML = '<p class="eyebrow" data-scramble>03 · Por dentro</p><h2 class="big">Interior<br /><em>piel fumé.</em></h2><p>Guías Hettich de extracción total con cierre amortiguado.</p>';
}
document.querySelectorAll('.models a').forEach((a) => a.classList.toggle('on', a.dataset.m === MODEL));
const texts = [...document.querySelectorAll('.scene-text')].map((el) => ({ el, a: +el.dataset.in, b: +el.dataset.out, on: false }));
const labels = [...document.querySelectorAll('.label')].map((el) => ({ el, key: el.dataset.anchor, on: false }));
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/';
function scramble(node) {
  if (reduced) return;
  const final = node.dataset.final || (node.dataset.final = node.textContent);
  let frame = 0;
  const total = 22;
  clearInterval(node._t);
  node._t = setInterval(() => {
    frame++;
    node.textContent = [...final].map((ch, i) => (ch === ' ' || i < (frame / total) * final.length ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
    if (frame >= total) { node.textContent = final; clearInterval(node._t); }
  }, 32);
}
const FADE = 0.025;
function textOpacity(p, a, b) {
  const i = THREE.MathUtils.clamp((p - a) / FADE, 0, 1);
  const o = THREE.MathUtils.clamp((b - p) / FADE, 0, 1);
  return smoother(Math.min(i, o));
}

// muestras de acabado
const dots = document.getElementById('finishDots');
FINISHES.forEach((f) => { const s = document.createElement('span'); s.style.background = f.swatch; dots.appendChild(s); });
const finishName = document.getElementById('finishName');
let finishIdx = 0;
const targetColor = new THREE.Color(FINISHES[0].color);
function setFinish(i) {
  if (i === finishIdx) return;
  finishIdx = i;
  const f = FINISHES[i];
  bodyMat.map = f.map ? TEX[f.map] : null;
  bodyMat.roughness = f.rough;
  bodyMat.needsUpdate = true;
  targetColor.set(f.color);
  finishName.textContent = f.name;
  [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
}
dots.children[0].classList.add('on');

/* ---------- scroll ---------- */
let lenis = null;
if (!reduced && window.Lenis) lenis = new Lenis({ duration: 1.4, smoothWheel: true, easing: (t) => 1 - Math.pow(1 - t, 3) });
const scrollP = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const y = lenis ? lenis.scroll : scrollY;
  return max > 0 ? THREE.MathUtils.clamp(y / max, 0, 1) : 0;
};

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
if (finePointer && !reduced) addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ---------- bucle ---------- */
let pSmooth = 0;
let solidOpaque = false;
let lastBg = '';
const prog = document.getElementById('prog');
const clock = new THREE.Clock();
const tmp = new THREE.Vector3();

function anchor(key) {
  if (key === 'top') return parts.top.localToWorld(tmp.set(0.36, 0.33, 0.12));
  if (key === 'd1') return parts.d1.localToWorld(tmp.set(0.42, 0.14, 0.24));
  if (key === 'd2') return parts.d2.localToWorld(tmp.set(0.42, -0.14, 0.24));
  if (key === 'handle') { const h = parts.handles[0]?.m; return h ? h.getWorldPosition(tmp).add(new THREE.Vector3(0.12, 0.02, 0)) : tmp.set(0, 0, 0); }
  if (key === 'side' && parts.sideR) return parts.sideR.localToWorld(tmp.set(0, 0.0, 0)).add(new THREE.Vector3(0, 0.12, 0.1));
  return tmp.set(0, 0, 0);
}

function frame(time) {
  requestAnimationFrame(frame);
  if (lenis) lenis.raf(time);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  // doble suavizado: Lenis + inercia propia → el mueble "flota" detrás del scroll
  const target = scrollP();
  pSmooth = reduced ? target : pSmooth + (target - pSmooth) * (1 - Math.exp(-dt * 3.2));
  const s = sample(pSmooth);
  prog.style.transform = `scaleY(${pSmooth})`;

  // cámara en órbita + ligera reacción al ratón
  mouse.sx += (mouse.x - mouse.sx) * 0.05;
  mouse.sy += (mouse.y - mouse.sy) * 0.05;
  const aspect = innerWidth / innerHeight;
  const dist = s.dist * (aspect < 1 ? 1 + (1 - aspect) * 1.7 : 1);
  const az = s.az + mouse.sx * 0.12, el = s.el + mouse.sy * 0.06;
  camera.position.set(Math.sin(az) * Math.cos(el) * dist, s.ty + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
  camera.lookAt(0, s.ty, 0);

  if (ready) {
    // microflotación constante
    if (!reduced) { rig.position.y = Math.sin(t * 0.7) * 0.005; rig.rotation.y = Math.sin(t * 0.35) * 0.012; }

    // dibujo de líneas → sólido
    lineMat.opacity = s.wire * 0.85;
    lineMat.visible = s.wire > 0.01;
    const op = s.solid;
    const opaque = op > 0.995;
    if (opaque !== solidOpaque) {
      solidOpaque = opaque;
      SOLIDS.forEach((m) => { m.transparent = !opaque; m.depthWrite = opaque || op > 0.5; m.needsUpdate = true; });
    }
    SOLIDS.forEach((m) => { m.opacity = op; m.visible = op > 0.005; });
    wallMat.opacity = 0.085 * op;

    // despiece y cajones
    const e = s.ex, o = s.open;
    parts.top.position.y = base.top.y + 0.34 * e;
    parts.d1.position.z = base.d1.z + 0.34 * e + 0.33 * o;
    parts.d1.position.y = base.d1.y + 0.05 * e;
    const o2 = THREE.MathUtils.clamp(o * 1.35 - 0.35, 0, 1);
    parts.d2.position.z = base.d2.z + 0.56 * e + 0.31 * o2;
    parts.d2.position.y = base.d2.y - 0.05 * e;
    if (parts.sideL) parts.sideL.position.x = base.sideL.x - 0.26 * e;
    if (parts.sideR) parts.sideR.position.x = base.sideR.x + 0.26 * e;
    parts.handles.forEach((h) => { if (h.base) h.m.position.z = h.base.z + 0.0; });

    // acabados
    const fi = pSmooth < 0.78 ? 0 : Math.min(FINISHES.length - 1, Math.floor(((pSmooth - 0.78) / 0.15) * FINISHES.length));
    setFinish(fi);
    bodyMat.color.lerp(targetColor, 0.12);
    grooveMat.color.copy(bodyMat.color); grooveMat.roughness = bodyMat.roughness;
    if (grooveMat.map !== bodyMat.map) { grooveMat.map = bodyMat.map; grooveMat.needsUpdate = true; }
    const bg = pSmooth > 0.77 && pSmooth < 0.94 ? FINISHES[fi].bg : '#F5F2EE';
    if (bg !== lastBg) { document.documentElement.style.backgroundColor = bg; lastBg = bg; }

    // etiquetas técnicas proyectadas desde el 3D
    const lo = THREE.MathUtils.clamp((e - 0.55) / 0.35, 0, 1);
    labels.forEach((L) => {
      const v = anchor(L.key).project(camera);
      const x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
      L.el.style.transform = `translate(${x}px, ${y}px)`;
      L.el.classList.toggle('flip', x > innerWidth * 0.58);
      // en pantallas verticales solo 3 etiquetas, para que no se pisen
      L.el.style.opacity = aspect < 0.9 && (L.key === 'side' || L.key === 'handle') ? 0 : lo;
      if (lo > 0.4 && !L.on) { L.on = true; L.el.querySelectorAll('[data-scramble]').forEach(scramble); }
      if (lo < 0.05) L.on = false;
    });
  }

  // textos por tramo
  texts.forEach((T) => {
    const o = textOpacity(pSmooth, T.a, T.b);
    T.el.style.opacity = o;
    T.el.style.translate = `0 ${(1 - o) * 24}px`;
    if (o > 0.3 && !T.on) { T.on = true; T.el.querySelectorAll('[data-scramble]').forEach(scramble); }
    if (o < 0.02) T.on = false;
  });

  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
