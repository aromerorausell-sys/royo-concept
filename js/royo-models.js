/* Muebles 3D reutilizables (fichas de colección).
   Logika: modelo real del configurador de Royo. Econic: modelado por código según ficha. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function makeMaterials(renderer, manager) {
  const tl = new THREE.TextureLoader(manager);
  const tex = (u) => { const t = tl.load(u); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
  const TEX = { nogal: tex('assets/3d/tex/nogal_artico.jpg'), hickory: tex('assets/3d/tex/hickory_nature.jpg') };
  const body = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62 });
  const groove = new THREE.MeshStandardMaterial({ side: THREE.BackSide, roughness: 0.7 });
  const handle = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.26 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, metalness: 0.4, roughness: 0.5 });
  const drawer = new THREE.MeshStandardMaterial({ color: 0x33322f, metalness: 0.55, roughness: 0.42 });
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xfbfaf8, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 });
  const bowl = ceramic.clone(); bowl.side = THREE.BackSide;
  return { TEX, body, groove, handle, dark, drawer, ceramic, bowl };
}

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
const solid = (geo, mat, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; return m; };
const newModel = () => ({ grp: new THREE.Group(), d1: new THREE.Group(), d2: new THREE.Group(), top: new THREE.Group(), base: {} });

function drawerBox(M, grp, b) {
  const W = b.max.x - b.min.x - 0.07, H = b.max.y - b.min.y - 0.06, D = 0.38, T = 0.012;
  const cy = (b.max.y + b.min.y) / 2 - 0.01, cz = b.min.z - D / 2 - 0.004;
  [[W, T, D, 0, -H / 2, 0], [T, H, D, -W / 2, 0, 0], [T, H, D, W / 2, 0, 0], [W, H, T, 0, 0, -D / 2]].forEach(([w, h, d, x, y, z]) => {
    const p = solid(new THREE.BoxGeometry(w, h, d), M.mats.drawer); p.position.set(x, cy + y, cz + z); grp.add(p);
  });
}
function buildTop(M, carcassTop, W) {
  const mats = M.mats, D = 0.462, T = 0.016;
  const rr = (x, y, w, h, r) => { const s = new THREE.Shape(); s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const shape = rr(-W / 2, -D / 2, W, D, 0.006), BW = 0.6, BD = 0.3, bz = 0.025;
  shape.holes.push(rr(-BW / 2, -BD / 2 - bz, BW, BD, 0.06));
  const g = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 3, curveSegments: 24 });
  g.rotateX(-Math.PI / 2);
  const slab = solid(g, mats.ceramic); slab.position.y = carcassTop + 0.0025;
  const bowl = solid(new RoundedBoxGeometry(BW, 0.12, BD, 6, 0.055), mats.bowl, false); bowl.position.set(0, carcassTop + T - 0.06, bz);
  const tap = new THREE.Group();
  const body = solid(new THREE.CylinderGeometry(0.016, 0.018, 0.17, 40), mats.handle); body.position.y = 0.085;
  const spout = solid(new THREE.CylinderGeometry(0.009, 0.009, 0.11, 32), mats.handle); spout.rotation.x = Math.PI / 2; spout.position.set(0, 0.155, 0.055);
  const lever = solid(new RoundedBoxGeometry(0.012, 0.012, 0.06, 2, 0.004), mats.handle); lever.position.set(0, 0.178, -0.022); lever.rotation.x = -0.25;
  tap.add(body, spout, lever); tap.position.set(0, carcassTop + T, -D / 2 + 0.065);
  M.top.add(slab, bowl, tap); M.grp.add(M.top);
}
const done = (M) => { M.base.d1 = M.d1.position.clone(); M.base.d2 = M.d2.position.clone(); return M; };

export function loadLogika(mats, manager, url = 'assets/3d/LOGIKA_2C_100.glb') {
  return new Promise((resolve, reject) => {
    new GLTFLoader(manager).load(url, (gltf) => {
      const M = newModel(); M.mats = mats;
      const model = gltf.scene, box = new THREE.Box3().setFromObject(model), c = box.getCenter(new THREE.Vector3());
      model.position.sub(c); M.grp.add(model); M.grp.updateMatrixWorld(true);
      const meshes = []; model.traverse((o) => o.isMesh && meshes.push(o));
      const fronts = [], handles = [];
      meshes.forEach((m) => {
        const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3());
        m.castShadow = m.receiveShadow = true;
        if (/tirador/i.test(m.name + (m.parent?.name || ''))) { m.material = mats.handle; handles.push({ m, b }); }
        else if (s.x < 0.02 && s.y < 0.02) m.material = mats.dark;
        else { m.material = mats.body; boxUV(m); if (s.z < 0.025 && b.min.z > 0.15 && s.y > 0.15) fronts.push({ m, b }); }
      });
      fronts.sort((a, b) => b.b.max.y - a.b.max.y);
      [M.d1, M.d2].forEach((grp, i) => {
        const f = fronts[i]; if (!f) return;
        M.grp.add(grp); grp.attach(f.m);
        handles.filter((h) => { const y = h.b.getCenter(new THREE.Vector3()).y; return y < f.b.max.y && y > f.b.min.y; }).forEach((h) => grp.attach(h.m));
        drawerBox(M, grp, f.b);
      });
      buildTop(M, box.max.y - c.y, 1.01);
      resolve(done(M));
    }, undefined, reject);
  });
}

export function buildEconic(mats) {
  const M = newModel(); M.mats = mats;
  const W = 0.995, H = 0.55, D = 0.45, FT = 0.019, ST = 0.016, r = 0.0165;
  const add = (geo, x, y, z) => { const m = solid(geo, mats.body); m.position.set(x, y, z); M.grp.add(m); return m; };
  const parts = [
    add(new THREE.BoxGeometry(ST, H, D - FT), -W / 2 + ST / 2, 0, -FT / 2), add(new THREE.BoxGeometry(ST, H, D - FT), W / 2 - ST / 2, 0, -FT / 2),
    add(new THREE.BoxGeometry(W - 2 * ST, ST, D - FT), 0, -H / 2 + ST / 2, -FT / 2), add(new THREE.BoxGeometry(W - 2 * ST, H, 0.008), 0, 0, -D / 2 + 0.004),
    add(new THREE.BoxGeometry(W - 2 * ST, ST, 0.09), 0, H / 2 - ST / 2, D / 2 - FT - 0.045),
  ];
  M.grp.updateMatrixWorld(true); parts.forEach(boxUV);
  const gap = 0.003, fh = (H - gap) / 2;
  [M.d1, M.d2].forEach((grp, i) => {
    M.grp.add(grp);
    const yc = fh / 2 - 0.045, s = new THREE.Shape();
    s.moveTo(-W / 2, -fh / 2); s.lineTo(W / 2, -fh / 2); s.lineTo(W / 2, yc - r); s.lineTo(0, yc - r); s.absarc(0, yc, r, -Math.PI / 2, Math.PI / 2, true); s.lineTo(W / 2, yc + r); s.lineTo(W / 2, fh / 2); s.lineTo(-W / 2, fh / 2); s.lineTo(-W / 2, -fh / 2);
    const g = new THREE.Group();
    const front = solid(new THREE.ExtrudeGeometry(s, { depth: FT, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0012, bevelSegments: 2, curveSegments: 24 }), mats.body);
    const pipe = solid(new THREE.CylinderGeometry(r, r, W / 2, 32, 1, true), mats.groove, false); pipe.rotation.z = Math.PI / 2; pipe.position.set(W / 4, yc, 0.002);
    const cap = solid(new THREE.SphereGeometry(r, 32, 16), mats.groove, false); cap.position.set(0, yc, 0.002);
    g.add(front, pipe, cap); g.position.set(0, H / 2 - fh / 2 - i * (fh + gap), D / 2 - FT);
    grp.add(g); grp.updateMatrixWorld(true); boxUV(front); boxUV(pipe);
    drawerBox(M, grp, new THREE.Box3().setFromObject(front));
  });
  buildTop(M, H / 2, 1.0);
  return done(M);
}
