/* ROYO · concepto v2
   Un único lienzo 3D fijo detrás de toda la historia. Los muebles Logika (modelo real del
   configurador de Royo) y Econic (modelado por código) son los "actores" de las animaciones.
   El scroll, largo y suavizado, mueve una línea de tiempo de fotogramas clave. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const mobile = innerWidth < 800;
const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp;
const sm = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const range = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

/* ================= RENDER ================= */
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;
const camera = new THREE.PerspectiveCamera(28, innerWidth / innerHeight, 0.05, 50);

const key = new THREE.DirectionalLight(0xfff0de, 2.4);
key.position.set(-1.6, 3.6, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(mobile ? 2048 : 4096, mobile ? 2048 : 4096);
Object.assign(key.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: 0.5, far: 12 });
key.shadow.radius = 8; key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02;
const rim = new THREE.DirectionalLight(0xdde6ff, 0.9);
rim.position.set(2.6, 1.4, -2.2);
const warm = new THREE.PointLight(0xffa860, 0, 6, 1.6); // luz lateral cálida del plano oscuro
warm.position.set(-1.4, 0.6, 1.2);
scene.add(key, rim, warm);

const wallMat = new THREE.ShadowMaterial({ opacity: 0 });
const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), wallMat);
wall.position.z = -0.245; wall.receiveShadow = true;
scene.add(wall);

const rig = new THREE.Group();
scene.add(rig);

/* ================= MATERIALES ================= */
const manager = new THREE.LoadingManager();
const loadTxt = document.getElementById('loadTxt'), lightRect = document.getElementById('lightRect');
manager.onProgress = (_u, d, t) => { const p = d / t; loadTxt.textContent = `Royo · ${Math.round(p * 100)}%`; lightRect.setAttribute('y', 190 - 190 * p); };

const texLoader = new THREE.TextureLoader(manager);
const tex = (url) => { const t = texLoader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
const TEX = { nogal: tex('assets/3d/tex/nogal_artico.jpg'), hickory: tex('assets/3d/tex/hickory_nature.jpg') };

const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10); // "llenado de luz" de abajo arriba
const bodyL = new THREE.MeshStandardMaterial({ map: TEX.nogal, color: 0xf2e4cf, roughness: 0.62 });
const ECONIC = [
  { name: 'Azul Vapor', color: '#566e86', map: null, rough: 0.72, sw: '#566e86', bg: '#10151b' },
  { name: 'Hickory Nature', color: '#ffffff', map: 'hickory', rough: 0.6, sw: '#b08560', bg: '#18120d' },
  { name: 'Terracota', color: '#c05e3e', map: null, rough: 0.72, sw: '#c05e3e', bg: '#1a100c' },
  { name: 'Verde Forest', color: '#4d5b48', map: null, rough: 0.72, sw: '#4d5b48', bg: '#0f140f' },
  { name: 'Blanco Mate', color: '#eeece7', map: null, rough: 0.7, sw: '#f4f3f0', bg: '#161615' },
  { name: 'Negro Mate', color: '#2a2a2a', map: null, rough: 0.7, sw: '#262626', bg: '#141210' },
];
const bodyE = new THREE.MeshStandardMaterial({ color: new THREE.Color(ECONIC[0].color), roughness: 0.72 });
const grooveE = new THREE.MeshStandardMaterial({ side: THREE.BackSide, color: new THREE.Color(ECONIC[0].color), roughness: 0.72 });
const handleMat = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.26 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, metalness: 0.4, roughness: 0.5 });
const drawerMat = new THREE.MeshStandardMaterial({ color: 0x33322f, metalness: 0.55, roughness: 0.42 });
const ceramicMat = new THREE.MeshPhysicalMaterial({ color: 0xfbfaf8, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 });
const bowlMat = ceramicMat.clone(); bowlMat.side = THREE.BackSide;
const SOLIDS = [bodyL, bodyE, grooveE, handleMat, darkMat, drawerMat, ceramicMat, bowlMat];
SOLIDS.forEach((m) => (m.clippingPlanes = [clipPlane]));
const lineMat = new THREE.LineBasicMaterial({ color: 0x2a251f, transparent: true, opacity: 0, depthWrite: false });

const TEX_W = 1.1, TEX_H = 0.245;
function boxUV(mesh) {
  const g = mesh.geometry; mesh.updateWorldMatrix(true, false);
  const m = mesh.matrixWorld, nm = new THREE.Matrix3().getNormalMatrix(m);
  const pos = g.attributes.position, nor = g.attributes.normal, uv = new Float32Array(pos.count * 2);
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(m); n.fromBufferAttribute(nor, i).applyMatrix3(nm);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    let u, w;
    if (az >= ax && az >= ay) { u = v.x; w = v.y; } else if (ax >= ay) { u = v.z; w = v.y; } else { u = v.x; w = v.z; }
    uv[i * 2] = u / TEX_W + 0.5; uv[i * 2 + 1] = w / TEX_H + 0.5;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
const addEdges = (mesh) => { const l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), lineMat); l.raycast = () => {}; l.renderOrder = 2; mesh.add(l); };
const solid = (geo, mat, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; return m; };

/* ================= MUEBLES ================= */
const newModel = () => ({ grp: new THREE.Group(), d1: new THREE.Group(), d2: new THREE.Group(), top: new THREE.Group(), sideL: null, sideR: null, handles: [], base: {}, ready: false });
const L = newModel(), E = newModel();
rig.add(L.grp, E.grp);
const resetRig = () => { rig.position.set(0, 0, 0); rig.rotation.set(0, 0, 0); rig.scale.set(1, 1, 1); L.grp.rotation.set(0, 0, 0); E.grp.rotation.set(0, 0, 0); rig.updateMatrixWorld(true); };

function drawerBox(grp, b) {
  const W = b.max.x - b.min.x - 0.07, H = b.max.y - b.min.y - 0.06, D = 0.38, T = 0.012;
  const cy = (b.max.y + b.min.y) / 2 - 0.01, cz = b.min.z - D / 2 - 0.004;
  [[W, T, D, 0, -H / 2, 0], [T, H, D, -W / 2, 0, 0], [T, H, D, W / 2, 0, 0], [W, H, T, 0, 0, -D / 2]].forEach(([w, h, d, x, y, z]) => {
    const p = solid(new THREE.BoxGeometry(w, h, d), drawerMat); p.position.set(x, cy + y, cz + z); addEdges(p); grp.add(p);
  });
}
function buildTop(M, carcassTop, W) {
  const D = 0.462, T = 0.016;
  const rr = (x, y, w, h, r) => { const s = new THREE.Shape(); s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const shape = rr(-W / 2, -D / 2, W, D, 0.006), BW = 0.6, BD = 0.3, bz = 0.025;
  shape.holes.push(rr(-BW / 2, -BD / 2 - bz, BW, BD, 0.06));
  const g = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 3, curveSegments: 24 });
  g.rotateX(-Math.PI / 2);
  const slab = solid(g, ceramicMat); slab.position.y = carcassTop + 0.0025; addEdges(slab);
  const bowl = solid(new RoundedBoxGeometry(BW, 0.12, BD, 6, 0.055), bowlMat, false); bowl.position.set(0, carcassTop + T - 0.06, bz);
  const drain = solid(new THREE.CylinderGeometry(0.018, 0.018, 0.002, 32), handleMat, false); drain.position.set(0, carcassTop + T - 0.118, bz);
  const tap = new THREE.Group();
  const body = solid(new THREE.CylinderGeometry(0.016, 0.018, 0.17, 40), handleMat); body.position.y = 0.085;
  const spout = solid(new THREE.CylinderGeometry(0.009, 0.009, 0.11, 32), handleMat); spout.rotation.x = Math.PI / 2; spout.position.set(0, 0.155, 0.055);
  const lever = solid(new RoundedBoxGeometry(0.012, 0.012, 0.06, 2, 0.004), handleMat); lever.position.set(0, 0.178, -0.022); lever.rotation.x = -0.25;
  tap.add(body, spout, lever); tap.position.set(0, carcassTop + T, -D / 2 + 0.065); [body, spout, lever].forEach(addEdges);
  M.top.add(slab, bowl, drain, tap); M.grp.add(M.top);
}
function finish(M) {
  M.base.top = M.top.position.clone(); M.base.d1 = M.d1.position.clone(); M.base.d2 = M.d2.position.clone();
  if (M.sideL) M.base.sideL = M.sideL.position.clone();
  if (M.sideR) M.base.sideR = M.sideR.position.clone();
  M.ready = true;
}

// LOGIKA · modelo real (configurador de Royo)
new GLTFLoader(manager).load('assets/3d/LOGIKA_2C_100.glb', (gltf) => {
  resetRig();
  const model = gltf.scene, box = new THREE.Box3().setFromObject(model), c = box.getCenter(new THREE.Vector3());
  model.position.sub(c); L.grp.add(model); rig.updateMatrixWorld(true);
  const meshes = []; model.traverse((o) => o.isMesh && meshes.push(o));
  const fronts = [];
  meshes.forEach((m) => {
    const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3());
    m.castShadow = m.receiveShadow = true;
    if (/tirador/i.test(m.name + (m.parent?.name || ''))) { m.material = handleMat; L.handles.push({ m, b }); }
    else if (s.x < 0.02 && s.y < 0.02) m.material = darkMat;
    else {
      m.material = bodyL; boxUV(m);
      if (s.z < 0.025 && b.min.z > 0.15 && s.y > 0.15) fronts.push({ m, b });
      if (s.x < 0.03 && s.y > 0.5) { if (b.min.x < 0) L.sideL = m; else L.sideR = m; }
    }
    addEdges(m);
  });
  fronts.sort((a, b) => b.b.max.y - a.b.max.y);
  [L.d1, L.d2].forEach((grp, i) => {
    const f = fronts[i]; if (!f) return;
    L.grp.add(grp); grp.attach(f.m);
    L.handles.filter((h) => { const y = h.b.getCenter(new THREE.Vector3()).y; return y < f.b.max.y && y > f.b.min.y; }).forEach((h) => grp.attach(h.m));
    drawerBox(grp, f.b);
  });
  buildTop(L, box.max.y - c.y, 1.01);
  finish(L);
});

// ECONIC · colección 50 aniversario, modelada por código (99,5 × 56,5 × 45)
(function buildEconic() {
  resetRig();
  const W = 0.995, H = 0.55, D = 0.45, FT = 0.019, ST = 0.016, M = E;
  const add = (geo, x, y, z) => { const m = solid(geo, bodyE); m.position.set(x, y, z); M.grp.add(m); return m; };
  M.sideL = add(new THREE.BoxGeometry(ST, H, D - FT), -W / 2 + ST / 2, 0, -FT / 2);
  M.sideR = add(new THREE.BoxGeometry(ST, H, D - FT), W / 2 - ST / 2, 0, -FT / 2);
  const rest = [add(new THREE.BoxGeometry(W - 2 * ST, ST, D - FT), 0, -H / 2 + ST / 2, -FT / 2), add(new THREE.BoxGeometry(W - 2 * ST, H, 0.008), 0, 0, -D / 2 + 0.004), add(new THREE.BoxGeometry(W - 2 * ST, ST, 0.09), 0, H / 2 - ST / 2, D / 2 - FT - 0.045)];
  rig.updateMatrixWorld(true);
  [M.sideL, M.sideR, ...rest].forEach((m) => { boxUV(m); addEdges(m); });
  const gap = 0.003, fh = (H - gap) / 2, r = 0.0165;
  [M.d1, M.d2].forEach((grp, i) => {
    M.grp.add(grp);
    const yc = fh / 2 - 0.045, s = new THREE.Shape();
    s.moveTo(-W / 2, -fh / 2); s.lineTo(W / 2, -fh / 2); s.lineTo(W / 2, yc - r); s.lineTo(0, yc - r); s.absarc(0, yc, r, -Math.PI / 2, Math.PI / 2, true); s.lineTo(W / 2, yc + r); s.lineTo(W / 2, fh / 2); s.lineTo(-W / 2, fh / 2); s.lineTo(-W / 2, -fh / 2);
    const g = new THREE.Group();
    const front = solid(new THREE.ExtrudeGeometry(s, { depth: FT, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0012, bevelSegments: 2, curveSegments: 24 }), bodyE);
    const pipe = solid(new THREE.CylinderGeometry(r, r, W / 2, 32, 1, true), grooveE, false); pipe.rotation.z = Math.PI / 2; pipe.position.set(W / 4, yc, 0.002);
    const cap = solid(new THREE.SphereGeometry(r, 32, 16), grooveE, false); cap.position.set(0, yc, 0.002);
    g.add(front, pipe, cap); g.position.set(0, H / 2 - fh / 2 - i * (fh + gap), D / 2 - FT);
    grp.add(g); grp.updateMatrixWorld(true);
    boxUV(front); boxUV(pipe); g.children.forEach(addEdges);
    drawerBox(grp, new THREE.Box3().setFromObject(front));
  });
  buildTop(M, H / 2, 1.0);
  finish(M);
  E.grp.visible = false;
})();

/* escáner de luz: la línea que sube rellenando el plano */
const scan = new THREE.Group();
const ringGeo = new THREE.BufferGeometry().setFromPoints([[-0.52, 0.245], [0.52, 0.245], [0.52, -0.245], [-0.52, -0.245], [-0.52, 0.245]].map(([x, z]) => new THREE.Vector3(x, 0, z)));
const ringMat = new THREE.LineBasicMaterial({ color: 0xc9a46f, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
scan.add(new THREE.Line(ringGeo, ringMat));
const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.04, 0.49), glowMat); glow.rotation.x = -Math.PI / 2;
scan.add(glow); rig.add(scan);

/* ================= LÍNEA DE TIEMPO ================= */
// az/el/dist: cámara · ty: altura mirada · rx: desplazamiento lateral del mueble · wire: líneas
// solid: opacidad · ex: despiece · open: cajones · which: 0 Logika / 1 Econic · spin: giro · dark: tema
const KEYS = [
  { p: 0.000, az: 0.00, el: 0.02, dist: 3.0, ty: 0.20, rx: 0, wire: 0.18, solid: 1, ex: 0, open: 0, which: 0, spin: 0, dark: 0 },
  { p: 0.060, az: 0.30, el: 0.12, dist: 2.65, ty: 0.02 },
  { p: 0.090, az: 0.55, el: 0.14, dist: 2.75, ty: 0.0, rx: 0.33, wire: 0 },
  { p: 0.190, az: 0.82, el: 0.22, dist: 2.75, rx: 0.33 },
  { p: 0.215, az: -0.55, el: 0.25, dist: 2.6, rx: 0 },
  { p: 0.250, az: -0.62, el: 0.34, dist: 4.1, rx: -0.14, ex: 1 },
  { p: 0.330, az: -0.18, el: 0.30, dist: 4.1, rx: -0.14, ex: 1 },
  { p: 0.360, az: 0.40, el: 0.30, dist: 2.6, rx: 0, ex: 0, open: 0 },
  { p: 0.395, az: 0.55, el: 0.56, dist: 2.25, rx: 0.22, open: 1 },
  { p: 0.425, az: 0.05, el: 0.10, dist: 2.7, rx: 0, open: 0 },
  { p: 0.455, az: 0.00, el: 0.06, dist: 4.9, solid: 1 },
  { p: 0.490, solid: 0 },
  { p: 0.700, solid: 0, which: 0, dark: 1, dist: 3.2 },
  { p: 0.705, which: 1 },
  { p: 0.725, solid: 1, dist: 2.75, az: 0, el: 0.10, spin: 0 },
  { p: 0.825, spin: Math.PI * 2, az: 0.0, el: 0.12 },
  { p: 0.845, az: -0.30, el: 0.14, dist: 2.6 },
  { p: 0.915, az: -0.22, el: 0.12, dark: 1 },
  { p: 0.950, az: 0.00, el: 0.04, dist: 3.25, ty: 0.06, dark: 0 },
  { p: 1.000, az: -0.15, el: 0.03, dist: 3.4, ty: 0.08 },
];
for (let i = 1; i < KEYS.length; i++) KEYS[i] = { ...KEYS[i - 1], ...KEYS[i] };
function sample(p) {
  let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1], t = sm(range(p, a.p, b.p)), o = {};
  for (const k in a) if (k !== 'p') o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
}

/* ================= DOM ================= */
document.querySelectorAll('[data-words]').forEach((el) => { el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' '); });
const texts = [...document.querySelectorAll('.st')].map((el) => ({ el, a: +el.dataset.in, b: +el.dataset.out, wa: +el.dataset.wordsFrom || 0, wb: +el.dataset.wordsTo || 0, words: [...el.querySelectorAll('.w')], on: false }));
const leaders = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); leaders.classList.add('leaders'); leaders.setAttribute('aria-hidden', 'true'); document.body.appendChild(leaders);
const labels = [...document.querySelectorAll('.label')].map((el) => {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path'); line.setAttribute('pathLength', '1');
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', '3.5');
  leaders.append(line, dot);
  return { el, key: el.dataset.anchor, on: false, line, dot };
});
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·/';
function scramble(node) {
  if (reduced) return;
  const final = node.dataset.final || (node.dataset.final = node.textContent);
  let f = 0; clearInterval(node._t);
  node._t = setInterval(() => { f++; node.textContent = [...final].map((ch, i) => (ch === ' ' || i < (f / 22) * final.length ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(''); if (f >= 22) { node.textContent = final; clearInterval(node._t); } }, 32);
}
const FADE = 0.02;
const textOpacity = (p, a, b) => sm(Math.min(clamp((p - a) / FADE, 0, 1), clamp((b - p) / FADE, 0, 1)));

const card = document.getElementById('card'), cardImgs = [...document.querySelectorAll('#cardImgs img')];
cardImgs.forEach((im) => (im.style.transition = 'opacity .8s cubic-bezier(.215,.61,.355,1), transform 1.6s cubic-bezier(.215,.61,.355,1)'));
const stripL = document.getElementById('stripL'), stripR = document.getElementById('stripR');
const thumbs = cardImgs.map((im, i) => { const t = document.createElement('img'); t.src = im.src; t.alt = ''; t.style.transition = 'opacity .8s, translate .8s cubic-bezier(.215,.61,.355,1)'; (i % 2 ? stripR : stripL).appendChild(t); return t; });
const capCol = document.getElementById('capCol'), capName = document.getElementById('capName');
const sweep = document.querySelector('#sweep .serif');
const macro = document.getElementById('macro'), macroImg = macro.querySelector('img'), macroShade = macro.querySelector('i');
const fillword = document.querySelector('#fillword .serif');
const finishName = document.getElementById('finishName'), dots = document.getElementById('finishDots');
ECONIC.forEach((f, i) => { const b = document.createElement('button'); b.type = 'button'; b.style.background = f.sw; b.setAttribute('aria-label', f.name); b.dataset.i = i; dots.appendChild(b); });
// clic en un color: se queda puesto mientras sigas en esta sección
let manualIdx = -1;
dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; manualIdx = +b.dataset.i; });
const railEl = document.getElementById('rail');
const story = document.getElementById('story');

/* ================= SCROLL ================= */
let lenis = null;
if (!reduced && window.Lenis) lenis = new Lenis({ duration: 1.4, smoothWheel: true, easing: (t) => 1 - Math.pow(1 - t, 3) });
const storyMax = () => story.offsetHeight - innerHeight;
const scrollY_ = () => (lenis ? lenis.scroll : scrollY);
const goto = (y) => (lenis ? lenis.scrollTo(y, { duration: 2.2 }) : scrollTo({ top: y, behavior: 'smooth' }));
document.querySelectorAll('[data-p]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goto(storyMax() * +a.dataset.p); }));
document.querySelectorAll('a[href^="#"]:not([data-p])').forEach((a) => a.addEventListener('click', (e) => { const t = document.querySelector(a.getAttribute('href')); if (!t || a.getAttribute('href') === '#') return; e.preventDefault(); goto(t.getBoundingClientRect().top + scrollY_()); }));

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
if (finePointer && !reduced) addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

/* ================= TEMA (claro → oscuro) ================= */
const C = { bgL: new THREE.Color('#F5F2EE'), bgD: new THREE.Color('#11100E'), fgL: new THREE.Color('#141414'), fgD: new THREE.Color('#F2EEE8'), mL: new THREE.Color('#5d5850'), mD: new THREE.Color('#b9b2a7') };
const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();
let lastTheme = '';
function theme(dark, tint) {
  tmpC.copy(C.bgL).lerp(tint ? tmpC2.set(tint) : C.bgD, dark);
  const bg = '#' + tmpC.getHexString();
  const fg = '#' + tmpC2.copy(C.fgL).lerp(C.fgD, dark).getHexString();
  const mu = '#' + new THREE.Color().copy(C.mL).lerp(C.mD, dark).getHexString();
  const key = bg + fg;
  if (key !== lastTheme) { lastTheme = key; const r = document.documentElement.style; r.setProperty('--bg', bg); r.setProperty('--fg', fg); r.setProperty('--muted', mu); }
  lineMat.color.copy(C.fgL).lerp(C.fgD, dark);
}

/* ================= BUCLE ================= */
let pSmooth = 0, loadedAt = 0, finishIdx = -1, opaque = null;
const targetE = new THREE.Color(ECONIC[0].color);
const clock = new THREE.Clock(), v3 = new THREE.Vector3();
const anchor = (k) => {
  if (k === 'top') return L.top.localToWorld(v3.set(0.36, 0.33, 0.12));
  if (k === 'd1') return L.d1.localToWorld(v3.set(0.42, 0.14, 0.24));
  if (k === 'd2') return L.d2.localToWorld(v3.set(0.42, -0.14, 0.24));
  if (k === 'handle') { const h = L.handles[0]?.m; return h ? h.getWorldPosition(v3).add(new THREE.Vector3(0.12, 0.02, 0)) : v3.set(0, 0, 0); }
  if (k === 'side' && L.sideL) return L.sideL.localToWorld(v3.set(0, 0, 0)).add(new THREE.Vector3(0, 0.1, 0.12));
  return v3.set(0, 0, 0);
};

manager.onLoad = () => {
  document.getElementById('loader').classList.add('done');
  setTimeout(() => { document.documentElement.classList.add('is-loaded'); loadedAt = clock.elapsedTime; }, 250);
};

function frame(time) {
  requestAnimationFrame(frame);
  if (lenis) lenis.raf(time);
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  const y = scrollY_(), max = storyMax();
  const target = max > 0 ? clamp(y / max, 0, 1) : 0;
  pSmooth = reduced ? target : pSmooth + (target - pSmooth) * (1 - Math.exp(-dt * 3.2));
  const p = pSmooth, s = sample(p);
  railEl.style.transform = `scaleY(${clamp(y / (document.documentElement.scrollHeight - innerHeight), 0, 1)})`;

  // intro tras la carga: el dibujo de líneas se rellena de luz (como el loader)
  const intro = reduced ? 1 : loadedAt ? sm(clamp((t - loadedAt - 0.4) / 2.6, 0, 1)) : 0;
  const level = lerp(-0.34, 0.52, intro);
  clipPlane.constant = intro >= 1 ? 10 : level;
  scan.position.y = level;
  const scanOn = intro > 0 && intro < 1 ? Math.sin(intro * Math.PI) : 0;
  ringMat.opacity = scanOn * 0.95; glowMat.opacity = scanOn * 0.16;

  // cámara
  mouse.sx += (mouse.x - mouse.sx) * 0.05; mouse.sy += (mouse.y - mouse.sy) * 0.05;
  const aspect = innerWidth / innerHeight, portrait = aspect < 0.9;
  const dist = s.dist * (aspect < 1 ? 1 + (1 - aspect) * 1.7 : 1) * (1 + s.ex * clamp((1.8 - aspect) * 0.55, 0, 0.3)) + (1 - intro) * 0.35;
  const az = s.az + mouse.sx * 0.12, el = s.el + mouse.sy * 0.06;
  camera.position.set(Math.sin(az) * Math.cos(el) * dist, s.ty + Math.sin(el) * dist, Math.cos(az) * Math.cos(el) * dist);
  camera.lookAt(0, s.ty, 0);

  // mueble activo
  const M = s.which < 0.5 ? L : E;
  L.grp.visible = M === L; E.grp.visible = M === E;
  rig.position.set(portrait ? 0 : s.rx, reduced ? 0 : Math.sin(t * 0.7) * 0.005, 0);
  rig.rotation.y = reduced ? 0 : Math.sin(t * 0.35) * 0.012;
  E.grp.rotation.y = s.spin;

  // líneas / sólido
  lineMat.opacity = lerp(1, s.wire, intro) * 0.85 * (M === L ? 1 : 0.5);
  lineMat.visible = lineMat.opacity > 0.01;
  const op = s.solid, isOpaque = op > 0.995;
  if (isOpaque !== opaque) { opaque = isOpaque; SOLIDS.forEach((m) => { m.transparent = !isOpaque; m.depthWrite = isOpaque || op > 0.5; m.needsUpdate = true; }); }
  SOLIDS.forEach((m) => { m.opacity = op; m.visible = op > 0.005; });
  scan.visible = M === L;

  // luz y tema
  const dark = s.dark;
  wallMat.opacity = 0.085 * op * (1 - dark);
  scene.environmentIntensity = lerp(0.7, 0.32, dark);
  key.intensity = lerp(2.4, 1.2, dark);
  rim.intensity = lerp(0.9, 2.2, dark);
  warm.intensity = dark * 3.2;

  // despiece y cajones
  if (M.ready) {
    const e = s.ex, o = s.open, o2 = clamp(o * 1.35 - 0.35, 0, 1);
    M.top.position.y = M.base.top.y + 0.34 * e;
    M.d1.position.z = M.base.d1.z + 0.34 * e + 0.33 * o; M.d1.position.y = M.base.d1.y + 0.05 * e;
    M.d2.position.z = M.base.d2.z + 0.56 * e + 0.31 * o2; M.d2.position.y = M.base.d2.y - 0.05 * e;
    if (M.sideL) M.sideL.position.x = M.base.sideL.x - 0.26 * e;
    if (M.sideR) M.sideR.position.x = M.base.sideR.x + 0.26 * e;
  }

  // acabados Econic
  let tint = null;
  if (p > 0.83 && p < 0.92) {
    const sf = Math.min(ECONIC.length - 1, Math.floor(range(p, 0.835, 0.91) * ECONIC.length));
    const fi = manualIdx >= 0 ? manualIdx : sf;
    if (fi !== finishIdx) {
      finishIdx = fi; const f = ECONIC[fi];
      bodyE.map = f.map ? TEX[f.map] : null; bodyE.roughness = f.rough; bodyE.needsUpdate = true; targetE.set(f.color);
      finishName.textContent = f.name; [...dots.children].forEach((d, k) => d.classList.toggle('on', k === fi));
    }
    tint = ECONIC[finishIdx].bg;
  } else manualIdx = -1;
  bodyE.color.lerp(targetE, 0.12);
  grooveE.color.copy(bodyE.color); grooveE.roughness = bodyE.roughness;
  if (grooveE.map !== bodyE.map) { grooveE.map = bodyE.map; grooveE.needsUpdate = true; }
  theme(dark, dark > 0.5 ? tint : null);

  // etiquetas del despiece: columna ordenada a la izquierda con líneas guía hasta cada pieza
  const lo = M === L && !portrait ? clamp((s.ex - 0.55) / 0.35, 0, 1) : 0;
  leaders.style.opacity = lo;
  if (L.ready && lo > 0) {
    const pts = labels.map((Lb) => { const v = anchor(Lb.key).project(camera); return { Lb, x: (v.x * 0.5 + 0.5) * innerWidth, y: (-v.y * 0.5 + 0.5) * innerHeight }; }).sort((a, b) => a.y - b.y);
    const gap = Math.max(74, innerHeight * 0.13), top = innerHeight * 0.2;
    const total = gap * (pts.length - 1), mid = clamp(pts.reduce((a, q) => a + q.y, 0) / pts.length, top + total / 2, innerHeight * 0.86 - total / 2);
    const lx = innerWidth * 0.045 + 20;
    pts.forEach((q, i) => {
      const ly = mid - total / 2 + gap * i, w = q.Lb.el.offsetWidth;
      q.Lb.el.style.transform = `translate(${lx}px, ${ly}px)`;
      const x0 = lx + w + 14, y0 = ly;
      q.Lb.line.setAttribute('d', `M${x0},${y0} L${Math.max(x0, q.x - 40)},${y0} L${q.x},${q.y}`);
      q.Lb.dot.setAttribute('cx', q.x); q.Lb.dot.setAttribute('cy', q.y);
      q.Lb.line.style.strokeDashoffset = 1 - lo;
    });
  }
  labels.forEach((Lb) => {
    Lb.el.style.opacity = lo;
    if (lo > 0.4 && !Lb.on) { Lb.on = true; Lb.el.querySelectorAll('[data-scramble]').forEach(scramble); }
    if (lo < 0.05) Lb.on = false;
  });

  // tarjeta con galería → se abre a pantalla completa
  const cIn = range(p, 0.445, 0.465), cOut = 1 - range(p, 0.64, 0.655), ex = sm(range(p, 0.555, 0.59));
  const cw = Math.min(innerWidth * (portrait ? 0.62 : 0.28), 430), ch = cw * 1.25;
  const W0 = lerp(cw, innerWidth, ex), H0 = lerp(ch, innerHeight, ex);
  card.style.width = W0 + 'px'; card.style.height = H0 + 'px';
  card.style.transform = `translate(${(innerWidth - W0) / 2}px, ${(innerHeight - H0) / 2}px)`;
  card.style.opacity = Math.min(cIn, cOut);
  card.querySelector('.card__frame').style.opacity = 1 - ex;
  const gi = p < 0.475 ? -1 : Math.min(cardImgs.length - 1, Math.floor(range(p, 0.475, 0.55) * cardImgs.length));
  cardImgs.forEach((im, i) => { const on = i === gi || (ex > 0 && i === cardImgs.length - 1); im.style.opacity = on ? 1 : 0; im.style.transform = on ? 'scale(1)' : 'scale(1.08)'; });
  if (gi >= 0 && capName.dataset.i !== String(gi)) { capName.dataset.i = gi; capName.textContent = cardImgs[gi].dataset.cap; capCol.textContent = cardImgs[gi].dataset.col; }
  const stripsOn = range(p, 0.47, 0.48) * (1 - range(p, 0.55, 0.56));
  stripL.style.opacity = stripR.style.opacity = stripsOn;
  stripL.style.right = `calc(50% + ${cw / 2 + 28}px)`; stripR.style.left = `calc(50% + ${cw / 2 + 28}px)`;
  stripL.style.flexDirection = 'row-reverse';
  thumbs.forEach((th, i) => { const on = i < gi; th.style.opacity = on ? 1 : 0; th.style.translate = on ? '0 0' : '0 30px'; });
  const sw = range(p, 0.44, 0.53);
  sweep.style.display = 'inline-block';
  sweep.style.transform = `translateX(${lerp(innerWidth, -sweep.offsetWidth, sw)}px)`;
  sweep.style.filter = sw > 0 && sw < 1 && !reduced ? 'blur(1.5px)' : 'none';

  // macro de material
  const mIn = range(p, 0.615, 0.635), mOut = 1 - range(p, 0.70, 0.715);
  macro.style.opacity = Math.min(mIn, mOut);
  macroImg.style.transform = `scale(${lerp(1.05, 2.6, sm(range(p, 0.615, 0.70)))})`;
  macroShade.style.opacity = lerp(0, 0.62, range(p, 0.64, 0.69));
  fillword.style.setProperty('--fill', `${range(p, 0.645, 0.69) * 100}%`);

  // textos por tramo + palabras que se encienden
  texts.forEach((T) => {
    const o = textOpacity(p, T.a, T.b);
    T.el.style.opacity = o; T.el.style.translate = `0 ${(1 - o) * 24}px`;
    T.el.classList.toggle('live', o > 0.5);
    if (o > 0.3 && !T.on) { T.on = true; T.el.querySelectorAll('[data-scramble]').forEach(scramble); }
    if (o < 0.02) T.on = false;
    if (T.words.length && T.wb) { const k = range(p, T.wa, T.wb) * T.words.length; T.words.forEach((w, i) => (w.style.opacity = clamp(k - i, 0.14, 1))); }
  });

  // cuando el flujo tapa la pantalla, no hace falta pintar el 3D
  if (y < max + innerHeight) renderer.render(scene, camera);
}
requestAnimationFrame(frame);

/* ================= SECCIONES DE FLUJO ================= */
/* Instalación: el montaje avanza y retrocede con el scroll.
   Con assets/video/montaje.mp4 mueve el vídeo fotograma a fotograma; sin vídeo, funde las dos imágenes. */
const asm = document.getElementById('instalacion');
if (asm) {
  const vid = asm.querySelector('.a-video'), imS = asm.querySelector('.a-start'), imE = asm.querySelector('.a-end');
  const steps = [...asm.querySelectorAll('.steps li')], bar = asm.querySelector('.assembly__bar span');
  let hasVideo = false, vt = 0;
  fetch('assets/video/montaje.mp4', { method: 'HEAD' }).then((r) => {
    if (!r.ok) return;
    vid.addEventListener('loadeddata', () => { hasVideo = true; asm.classList.add('has-video'); }, { once: true });
    vid.src = 'assets/video/montaje.mp4'; vid.load();
  }).catch(() => {});
  (function loop() {
    requestAnimationFrame(loop);
    const r = asm.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const k = clamp(-r.top / (r.height - innerHeight), 0, 1), a = clamp((k - 0.06) / 0.82, 0, 1);
    if (hasVideo && vid.duration) {
      vt += (a * (vid.duration - 0.05) - vt) * (reduced ? 1 : 0.2);
      if (!vid.seeking && Math.abs(vid.currentTime - vt) > 0.008) vid.currentTime = vt;
    } else {
      const f = sm(clamp((a - 0.35) / 0.4, 0, 1));
      imS.style.opacity = 1 - f; imE.style.opacity = f;
      imS.style.transform = `scale(${1 + 0.04 * (1 - a)})`; imE.style.transform = `scale(${1.02 - 0.02 * f})`;
    }
    const si = Math.min(steps.length - 1, Math.floor(a * steps.length * 0.999));
    steps.forEach((el, i) => { el.classList.toggle('on', i <= si); el.classList.toggle('now', i === si); });
    bar.style.transform = `scaleX(${a})`;
  })();
}

const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('.reveal, .clip').forEach((el) => io.observe(el));
const count = document.getElementById('count');
new IntersectionObserver((es, o) => es.forEach((e) => {
  if (!e.isIntersecting) return; o.disconnect();
  if (reduced) return;
  const t0 = performance.now();
  const tick = (now) => { const k = clamp((now - t0) / 2200, 0, 1); count.textContent = Math.round(50 * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), { threshold: 0.4 }).observe(count);
const proImg = document.querySelector('[data-parallax]');
if (proImg && !reduced) (function par() { const r = proImg.parentElement.getBoundingClientRect(); const k = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); proImg.style.transform = `translateY(${(k - 0.5) * 16}%)`; requestAnimationFrame(par); })();
const form = document.querySelector('.news__form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = form.querySelector('.news__msg'); msg.classList.remove('err');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) { msg.textContent = 'Revisa tu correo electrónico.'; msg.classList.add('err'); return; }
  if (!form.privacy.checked) { msg.textContent = 'Necesitamos que aceptes la política de privacidad.'; msg.classList.add('err'); return; }
  msg.textContent = 'Gracias. Te escribiremos pronto (demo: no se envía nada).'; form.reset();
});
