/* ROYO · concepto de rediseño
   GSAP + ScrollTrigger + Lenis (CDN) */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- utilidades de texto ---------- */
  // Titular: palabras con máscara (overflow hidden) y letras dentro
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words
      .map((w) => `<span class="word" aria-hidden="true">${[...w].map((c) => `<span class="char">${c}</span>`).join('')}</span>`)
      .join(' ');
  });
  // Manifiesto: palabra a palabra
  document.querySelectorAll('[data-words]').forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------- mueble.png: si no existe, máscara con detalle1.jpg ---------- */
  const depth = document.querySelector('.depth');
  const png = document.querySelector('.depth__png');
  if (png) {
    const fallback = () => depth.classList.add('no-png');
    png.addEventListener('error', fallback);
    png.loading = 'eager'; // forzamos la comprobación aunque esté fuera de pantalla
    if (png.complete && png.naturalWidth === 0) fallback();
  }

  /* ---------- 5b. Mueble 3D en CSS para la película ---------- */
  const FINISHES = [
    ['Roble natural', '#b8925f'], ['Nogal', '#6b4a33'], ['Blanco mate', '#e4dfd6'],
    ['Gris piedra', '#8f8a82'], ['Verde salvia', '#7f8b75'], ['Negro mate', '#2b2927'],
  ];
  const vanityEl = document.querySelector('.vanity');
  const parts = {};
  const box = (name, [w, h, d], [x, y, z], cls = '', skip = []) => {
    const part = document.createElement('div');
    part.className = `v-part ${cls}`;
    part.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
    const faces = {
      front: [w, h, `translateZ(${d / 2}px)`],
      back: [w, h, `rotateY(180deg) translateZ(${d / 2}px)`],
      right: [d, h, `rotateY(90deg) translateZ(${w / 2}px)`],
      left: [d, h, `rotateY(-90deg) translateZ(${w / 2}px)`],
      top: [w, d, `rotateX(90deg) translateZ(${h / 2}px)`],
      bottom: [w, d, `rotateX(-90deg) translateZ(${h / 2}px)`],
    };
    Object.entries(faces).forEach(([k, [fw, fh, t]]) => {
      if (skip.includes(k)) return;
      const f = document.createElement('div');
      f.className = `v-face f-${k}`;
      f.style.cssText = `width:${fw}px;height:${fh}px;margin:${-fh / 2}px 0 0 ${-fw / 2}px;transform:${t}`;
      part.appendChild(f);
    });
    vanityEl.appendChild(part);
    parts[name] = part;
    return part;
  };
  if (vanityEl) {
    vanityEl.style.setProperty('--wood', FINISHES[0][1]);
    box('inner', [436, 206, 226], [0, 0, 0], 'v-inner', ['front']);
    box('carcass', [440, 210, 230], [0, 0, 0], '', ['front']);
    box('d1', [420, 96, 214], [0, -51, 9], 'v-drawer');
    box('d2', [420, 96, 214], [0, 51, 9], 'v-drawer');
    box('top', [462, 20, 244], [0, -115, 4], 'v-top');
    box('tap', [12, 62, 12], [0, -156, -88], 'v-tap');
    box('spout', [12, 10, 62], [0, -182, -63], 'v-tap');
  }

  /* ---------- header, menú, idioma, newsletter (no dependen de GSAP) ---------- */
  const header = document.querySelector('.header');
  let lastY = 0;
  const onScroll = (y) => {
    header.classList.toggle('is-solid', y > window.innerHeight * 0.6);
    const goingDown = y > lastY && y > window.innerHeight;
    header.classList.toggle('is-hidden', goingDown && !document.body.classList.contains('menu-open'));
    lastY = y;
  };

  const burger = document.querySelector('.burger');
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.querySelectorAll('.nav a').forEach((a) =>
    a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    })
  );

  document.querySelectorAll('.lang__btn').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.lang__btn').forEach((x) => {
        x.classList.toggle('is-active', x === b);
        x.setAttribute('aria-pressed', x === b);
      });
    })
  );

  const form = document.querySelector('.news__form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = form.querySelector('.news__msg');
    const email = form.email.value.trim();
    msg.classList.remove('is-error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Revisa tu correo electrónico.';
      msg.classList.add('is-error');
      return;
    }
    if (!form.privacy.checked) {
      msg.textContent = 'Necesitamos que aceptes la política de privacidad.';
      msg.classList.add('is-error');
      return;
    }
    msg.textContent = 'Gracias. Te escribiremos pronto (demo: no se envía nada).';
    form.reset();
  });

  /* ---------- sin GSAP o con movimiento reducido: todo visible ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js');
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 1.4 });

  const camScale = () => Math.max(0.42, Math.min(window.innerWidth / 1150, window.innerHeight / 980, 1.15));
  const camera = document.querySelector('.film__camera');
  if (camera) camera.style.setProperty('--s', camScale());

  if (reduced) {
    // pose fija, sin película
    gsap.set(vanityEl, { rotationY: -28, rotationX: -14 });
    gsap.set(parts.d1, { z: 120 });
    document.querySelector('.film__title').style.display = 'none';
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
    return; // el CSS ya deja todo en su estado final
  }

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.25, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    lenis.on('scroll', ({ scroll }) => { ScrollTrigger.update(); onScroll(scroll); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.8 });
      })
    );
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  }

  /* ---------- cursor ---------- */
  if (finePointer) {
    document.body.classList.add('has-cursor');
    const cursor = document.querySelector('.cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    const label = cursor.querySelector('.cursor__label');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3.out' });
    const dy = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3.out' });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(ring, 'y', { duration: 0.6, ease: 'power3.out' });
    window.addEventListener('mousemove', (e) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('mouseover', (e) => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, label, input');
      cursor.classList.toggle('is-label', !!lab && !link);
      cursor.classList.toggle('is-link', !!link);
      cursor.classList.toggle('on-dark', !!e.target.closest('.hero, .panel, .depth, .footer'));
      if (lab) label.textContent = lab.dataset.cursor;
    });
    document.addEventListener('mouseleave', () => gsap.to(cursor, { autoAlpha: 0, duration: 0.3 }));
    document.addEventListener('mouseenter', () => gsap.to(cursor, { autoAlpha: 1, duration: 0.3 }));
  }

  /* ---------- 2. Hero ---------- */
  const heroTl = gsap.timeline({ delay: 0.2 });
  heroTl
    .to('.hero__img', { scale: 1, duration: 3.2, ease: 'power2.out' }, 0)
    .fromTo('.hero__title .char', { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.4, stagger: 0.025 }, 0.35)
    .to('.hero__eyebrow', { opacity: 1, duration: 1.2 }, 0.9)
    .to('.scroll-cue', { opacity: 1, duration: 1.2 }, 1.4);

  // al bajar, el hero se va hundiendo
  gsap.to('.hero__content', {
    yPercent: -30, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__media', {
    yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* ---------- 3. Manifiesto ---------- */
  gsap.to('.manifesto__text .w', {
    opacity: 1, ease: 'none', stagger: 0.5,
    scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 40%', scrub: 1 },
  });
  gsap.from('.manifesto__sub', {
    y: 40, opacity: 0, duration: 1.6,
    scrollTrigger: { trigger: '.manifesto__sub', start: 'top 90%' },
  });

  /* títulos de sección */
  gsap.utils.toArray('.section-title, .eyebrow:not(.hero__eyebrow):not(.eyebrow--light)').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.5, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- 4. Colecciones ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const track = document.querySelector('.collections__track');
    const panels = gsap.utils.toArray('.panel');
    const dist = () => track.scrollWidth - window.innerWidth;

    const horizontal = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.collections__pin', pin: true, scrub: 1,
        start: 'top top', end: () => '+=' + dist(),
        invalidateOnRefresh: true,
      },
    });

    panels.forEach((panel) => {
      const img = panel.querySelector('.panel__media img');
      const num = panel.querySelector('.panel__num');
      const body = panel.querySelector('.panel__body');
      // parallax interno de la imagen
      gsap.fromTo(img, { xPercent: -8 }, {
        xPercent: 8, ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
      });
      gsap.fromTo(num, { xPercent: 40 }, {
        xPercent: -40, ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: 'left right', end: 'right left', scrub: true },
      });
      gsap.from(body.children, {
        y: 60, opacity: 0, stagger: 0.08, duration: 1.4,
        scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: 'left 55%' },
      });
    });
  });
  mm.add('(max-width: 899px)', () => {
    gsap.utils.toArray('.panel').forEach((panel) => {
      gsap.fromTo(panel.querySelector('.panel__media img'), { yPercent: -10 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from(panel.querySelector('.panel__body').children, {
        y: 40, opacity: 0, stagger: 0.08, duration: 1.3,
        scrollTrigger: { trigger: panel, start: 'top 60%' },
      });
    });
  });

  /* ---------- 5. Parallax de 3 capas ---------- */
  // speed < 1 va más lento que el scroll, speed > 1 más rápido
  gsap.utils.toArray('.depth [data-speed]').forEach((layer) => {
    const speed = parseFloat(layer.dataset.speed);
    const range = window.innerHeight * 0.5;
    gsap.fromTo(layer, { y: -(speed - 1) * -range }, {
      y: (speed - 1) * -range, ease: 'none',
      scrollTrigger: { trigger: '.depth', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });
  gsap.fromTo('.depth__mask', { clipPath: 'inset(30% 20% 30% 20%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
    scrollTrigger: { trigger: '.depth', start: 'top 80%', end: 'center center', scrub: true },
  });

  /* ---------- 5b. Película: el scroll es el cabezal de reproducción ---------- */
  const film = document.querySelector('.film');
  if (film) {
    const video = film.querySelector('.film__video');
    let hasVideo = false;
    video.addEventListener('loadedmetadata', () => { hasVideo = true; film.classList.add('has-video'); });
    video.addEventListener('error', () => video.remove());

    const chapters = [...film.querySelectorAll('.film__chapters li')];
    const tc = film.querySelector('.film__tc');
    const fill = film.querySelector('.film__fill');
    const finishLabel = film.querySelector('.film__finish');
    const playBtn = film.querySelector('.film__play');
    const TOTAL = 42; // segundos "de película"
    const pad2 = (n) => String(n).padStart(2, '0');
    let lastFinish = 0;

    const render = (p) => {
      const t = p * TOTAL;
      tc.textContent = `00:00:${pad2(Math.floor(t))}:${pad2(Math.floor((t % 1) * 24))}`;
      fill.style.transform = `scaleX(${p})`;
      chapters.forEach((li) => li.classList.toggle('is-on', p >= +li.dataset.from && p < +li.dataset.to));
      const fi = p < 0.78 ? 0 : Math.min(FINISHES.length - 1, Math.floor(((p - 0.78) / 0.2) * FINISHES.length));
      if (fi !== lastFinish) {
        lastFinish = fi;
        vanityEl.style.setProperty('--wood', FINISHES[fi][1]);
        finishLabel.textContent = FINISHES[fi][0];
      }
      if (hasVideo && video.duration) video.currentTime = p * video.duration * 0.999;
    };

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: film, pin: '.film__pin', start: 'top top', end: '+=400%', scrub: 0.8,
        onUpdate: (self) => render(self.progress),
        onRefresh: () => camera.style.setProperty('--s', camScale()),
      },
    });
    tl.fromTo(vanityEl, { rotationY: -42, rotationX: -14, y: 60, opacity: 0 }, { rotationY: -30, y: 0, opacity: 1, duration: 0.12, ease: 'power3.out' }, 0)
      .to('.film__title', { opacity: 0, y: -40, duration: 0.08 }, 0.1)
      .to(vanityEl, { rotationY: 32, duration: 0.26 }, 0.1)
      .to(vanityEl, { rotationY: -30, rotationX: -24, duration: 0.2 }, 0.36)
      .to(parts.d1, { z: 160, duration: 0.12, ease: 'power3.out' }, 0.4)
      .to(parts.d2, { z: 110, duration: 0.12, ease: 'power3.out' }, 0.45)
      .to([parts.d1, parts.d2], { z: 9, duration: 0.08, ease: 'power3.in' }, 0.58)
      .to(parts.top, { y: -215, duration: 0.08, ease: 'power3.out' }, 0.6)
      .to([parts.tap, parts.spout], { y: '-=100', duration: 0.08, ease: 'power3.out' }, 0.6)
      .to(parts.top, { y: -115, duration: 0.07, ease: 'power3.in' }, 0.7)
      .to([parts.tap, parts.spout], { y: '+=100', duration: 0.07, ease: 'power3.in' }, 0.7)
      .to(vanityEl, { rotationY: -8, rotationX: -10, duration: 0.2 }, 0.78)
      .to({}, { duration: 0.02 }, 0.98);
    render(0);

    // reproductor: play / pausa / buscar
    const st = tl.scrollTrigger;
    const stop = () => { film.classList.remove('is-playing'); playBtn.setAttribute('aria-label', 'Reproducir'); };
    const goTo = (y, duration, onComplete) => {
      if (lenis) lenis.scrollTo(y, { duration, easing: (x) => x, onComplete });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    };
    playBtn.addEventListener('click', () => {
      if (film.classList.contains('is-playing')) {
        if (lenis) lenis.scrollTo(lenis.scroll, { immediate: true });
        return stop();
      }
      let from = st.progress >= 0.99 ? 0 : st.progress;
      if (from === 0 && lenis) lenis.scrollTo(st.start, { immediate: true });
      film.classList.add('is-playing');
      playBtn.setAttribute('aria-label', 'Pausar');
      goTo(st.end, (1 - from) * 16, stop);
    });
    ['wheel', 'touchstart', 'keydown'].forEach((ev) => window.addEventListener(ev, () => film.classList.contains('is-playing') && stop(), { passive: true }));
    film.querySelector('.film__track').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      stop();
      goTo(st.start + ratio * (st.end - st.start), 1.2);
    });
  }

  /* ---------- 6. Configuradores: clip-path ---------- */
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } });
    tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.8, ease: 'power3.inOut' })
      .to(el.querySelector('img'), { scale: 1, duration: 1.8 }, 0.1);
    const text = el.parentElement.querySelector('.config__text');
    gsap.from(text.children, { y: 30, opacity: 0, stagger: 0.08, duration: 1.3, scrollTrigger: { trigger: text, start: 'top 90%' } });
  });

  /* ---------- 7. Contador ---------- */
  const num = document.querySelector('[data-count]');
  const counter = { v: 0 };
  num.textContent = '0';
  gsap.to(counter, {
    v: +num.dataset.count, duration: 2.4, ease: 'power3.out',
    onUpdate: () => (num.textContent = Math.round(counter.v)),
    scrollTrigger: { trigger: '.years', start: 'top 70%', once: true },
  });
  gsap.from('.acc li', {
    y: 40, opacity: 0, stagger: 0.1, duration: 1.3,
    scrollTrigger: { trigger: '.acc', start: 'top 85%' },
  });

  /* ---------- 8–9. Newsletter y footer ---------- */
  gsap.from('.news__form', { y: 40, opacity: 0, duration: 1.5, scrollTrigger: { trigger: '.news__form', start: 'top 90%' } });
  gsap.from('.footer__big', { yPercent: 30, opacity: 0, duration: 1.8, scrollTrigger: { trigger: '.footer', start: 'top 85%' } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
