/* Interfaz de la portada: pestañas de colecciones y fotos que se pulsan para verlas en grande. */
(function () {
  const tabs = [...document.querySelectorAll('.cats .tab')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) { panel.hidden = !on; if (on) { panel.classList.remove('in'); requestAnimationFrame(() => panel.classList.add('in')); } }
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    // flechas izquierda/derecha entre pestañas (accesibilidad)
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; select(n); n.focus();
    });
  });
  if (tabs[0]) select(tabs[0]);

  // miniaturas: cambian la foto grande de su colección
  document.querySelectorAll('.cat').forEach((panel) => {
    const big = panel.querySelector('.cat__big');
    panel.querySelectorAll('.cat__thumb').forEach((b) => b.addEventListener('click', () => {
      panel.querySelectorAll('.cat__thumb').forEach((x) => x.classList.toggle('on', x === b));
      big.classList.add('swap');
      setTimeout(() => { big.onload = () => big.classList.remove('swap'); big.src = b.dataset.src; big.alt = b.getAttribute('aria-label'); }, 180);
    }));
  });
  // logo grande en la portada: empieza ampliado y se reduce al tamaño normal al hacer scroll
  const logo = document.querySelector('.header .logo');
  if (logo && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    const fit = () => {
      ticking = false;
      const big = innerWidth < 500 ? 1.35 : innerWidth < 1000 ? 1.8 : 2.6;
      const t = Math.min(1, scrollY / (innerHeight * 0.35));
      const e = 1 - Math.pow(1 - t, 3);
      logo.style.setProperty('--logo-s', (big + (1 - big) * e).toFixed(3));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(fit); } }, { passive: true });
    addEventListener('resize', fit); fit();
  }
})();
