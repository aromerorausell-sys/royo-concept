/* Instalación · el baño se monta con el scroll.
   Fondo: secuencia de fotogramas del vídeo de montaje (avanza y retrocede con la rueda).
   Encima, una capa de "plano técnico": antes de que llegue cada pieza se dibuja su silueta
   discontinua en la pared; al entrar la pieza, la silueta se apaga y aparece su etiqueta. */

const sec = document.getElementById('instalacion');
if (sec) init();

function init() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const range = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
  const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const $ = (s) => sec.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const stage = $('.assembly__stage'), bg = $('#salaBg'), over = $('#salaOver');
  const hud = $('#salaStep'), bar = $('.assembly__bar span');
  const steps = [...sec.querySelectorAll('.steps li')];

  /* Coordenadas en el fotograma original (1280 × 720) y fotogramas (0–89) de cada fase */
  const OUTLINES = [
    { r: [293, 132, 398, 565], draw: [0, 6], fill: [8, 22] },   // columna
    { r: [462, 412, 952, 583], draw: [2, 8], fill: [14, 46] },  // mueble doble
    { r: [506, 68, 661, 343], draw: [4, 10], fill: [54, 70] },  // espejo izquierdo
    { r: [743, 68, 897, 343], draw: [5, 11], fill: [54, 70] },  // espejo derecho
  ];
  const TAGS = [
    { f: [8, 28], at: [398, 170], side: 1, b: 'Columna', s: 'Suspendida · dos puertas' },
    { f: [16, 32], at: [707, 583], side: -1, b: 'Estructura', s: 'Se cuelga en la pared' },
    { f: [32, 50], at: [946, 500], side: 1, b: 'Cajones', s: 'Extracción total · cierre amortiguado' },
    { f: [50, 66], at: [462, 414], side: -1, b: 'Encimera', s: 'Doble lavabo integrado' },
    { f: [60, 78], at: [897, 120], side: 1, b: 'Espejos', s: 'Retroiluminación LED' },
    { f: [80, 92], at: [952, 560], side: 1, b: 'Listo', s: 'Tu baño, montado' },
  ];
  const STEP_AT = [0, 30, 50, 64];
  const STEP_NAME = ['Estructura', 'Cajones', 'Encimera', 'Luz'];

  /* ---------- capa SVG ---------- */
  const outs = OUTLINES.map((o) => {
    const p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'ol'); p.setAttribute('pathLength', '1'); over.appendChild(p);
    return { ...o, el: p };
  });
  const tags = TAGS.map((t) => {
    const line = document.createElementNS(NS, 'path'); line.setAttribute('class', 'lead');
    const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('class', 'dot'); dot.setAttribute('r', '4');
    over.append(line, dot);
    const el = document.createElement('div'); el.className = 'assembly__tag'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<b>${t.b}</b><span>${t.s}</span>`; stage.appendChild(el);
    return { ...t, el, line, dot };
  });

  /* ---------- fotogramas ---------- */
  const bx = bg.getContext('2d');
  let frames = [], meta = null, lastFrame = -1;
  fetch('assets/video/sala/frames.json').then((r) => r.json()).then((m) => {
    meta = m; frames = Array.from({ length: m.count }, () => null);
    const load = (i) => new Promise((res) => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => { frames[i] = im; lastFrame = -1; res(); };
      im.onerror = res;
      im.src = `assets/video/sala/${String(i).padStart(3, '0')}.${m.ext}`;
    });
    // primero uno de cada 8 (para poder mover el scroll enseguida) y luego el resto
    const order = [...Array(m.count).keys()].sort((a, b) => (a % 8 ? 1 : 0) - (b % 8 ? 1 : 0) || a - b);
    (async () => { for (let i = 0; i < order.length; i += 6) await Promise.all(order.slice(i, i + 6).map(load)); })();
  }).catch(() => {});
  const nearest = (i) => { for (let d = 0; d < frames.length; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; } return null; };

  /* ---------- encuadre: cómo cae el fotograma en la pantalla ---------- */
  const SW = 1280, SH = 720;
  let W = 0, H = 0, dpr = 1, portrait = false, T = { s: 1, ox: 0, oy: 0 };
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight; portrait = W / H < 0.9;
    dpr = Math.min(devicePixelRatio, 1.5); bg.width = Math.round(W * dpr); bg.height = Math.round(H * dpr);
    over.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let s, ox, oy;
    if (portrait) {
      // móvil: la escena ocupa la parte de arriba y el texto va debajo
      s = Math.max((H * 0.6) / SH, W / SW); const dw = SW * s;
      ox = clamp(W * 0.5 - 0.56 * dw, W - dw, 0); oy = H * 0.08;
    } else {
      // escritorio: se amplía y se desplaza a la derecha para dejar sitio al texto
      s = Math.max(W / SW, H / SH, (W * 1.12) / SW); const dw = SW * s, dh = SH * s;
      ox = clamp(W * 0.6 - 0.5 * dw, W - dw, 0); oy = clamp((H - dh) * 0.15, H - dh, 0);
    }
    T = { s, ox, oy }; lastFrame = -1;
  }
  new ResizeObserver(layout).observe(stage); layout();
  const P = (x, y) => [T.ox + x * T.s, T.oy + y * T.s];

  function drawBg(i) {
    const im = frames[i] || nearest(i); if (!im) return;
    bx.fillStyle = '#F5F2EE'; bx.fillRect(0, 0, bg.width, bg.height);
    bx.drawImage(im, T.ox * dpr, T.oy * dpr, SW * T.s * dpr, SH * T.s * dpr);
  }

  /* ---------- bucle ---------- */
  let vis = false, a = reduced ? 1 : 0;
  new IntersectionObserver(([e]) => (vis = e.isIntersecting), { rootMargin: '20% 0px' }).observe(sec);
  (function loop() {
    requestAnimationFrame(loop);
    if (!vis) return;
    const r = sec.getBoundingClientRect();
    const target = reduced ? 1 : range(clamp(-r.top / (r.height - H), 0, 1), 0.03, 0.94);
    a += (target - a) * (reduced ? 1 : 0.14);
    const n = meta ? meta.count - 1 : 89, f = a * n;

    const fi = Math.round(f);
    if (meta && fi !== lastFrame) { drawBg(fi); lastFrame = fi; }

    // siluetas del plano: se dibujan sobre la pared vacía y se apagan cuando llega la pieza
    outs.forEach((o) => {
      const [x0, y0] = P(o.r[0], o.r[1]), [x1, y1] = P(o.r[2], o.r[3]);
      o.el.setAttribute('d', `M${x0},${y0} H${x1} V${y1} H${x0} Z`);
      o.el.style.strokeDashoffset = 1 - ease(range(f, o.draw[0], o.draw[1]));
      o.el.style.opacity = 1 - ease(range(f, o.fill[0], o.fill[1]));
    });

    // etiquetas que aparecen con cada pieza
    tags.forEach((t) => {
      const o = Math.min(range(f, t.f[0], t.f[0] + 3), 1 - range(f, t.f[1] - 3, t.f[1]));
      t.el.style.opacity = o; t.line.style.opacity = o; t.dot.style.opacity = o;
      if (o <= 0) return;
      const [x, y] = P(t.at[0], t.at[1]);
      const w = t.el.offsetWidth, h = t.el.offsetHeight;
      const tx = clamp(t.side > 0 ? x + 48 : x - 48 - w, 12, W - w - 12), ty = clamp(y - h - 30, 80, H - h - 20);
      t.el.style.transform = `translate(${tx}px, ${ty}px)`;
      const ex = t.side > 0 ? tx : tx + w;
      t.line.setAttribute('d', `M${ex},${ty + h / 2} L${(ex + x) / 2},${ty + h / 2} L${x},${y}`);
      t.dot.setAttribute('cx', x); t.dot.setAttribute('cy', y);
    });

    // pasos y barra
    let si = 0; STEP_AT.forEach((s, i) => { if (f >= s) si = i; });
    steps.forEach((el, i) => { el.classList.toggle('on', i <= si); el.classList.toggle('now', i === si); });
    const txt = `Paso ${String(si + 1).padStart(2, '0')} / 04 · ${STEP_NAME[si]}`;
    if (hud.dataset.t !== txt) { hud.dataset.t = txt; hud.textContent = txt; }
    bar.style.transform = `scaleX(${a})`;
  })();
}
