/* Catálogo: todas las colecciones de Royo (según el menú de royogroup.com) con buscador y filtro por tipo.
   Las que tienen ficha propia en este concepto abren coleccion.html; el resto, su página oficial. */
(function () {
  const R = 'https://www.royogroup.com/coleccion/';
  const T = [
    { id: 'compacto', name: 'Compacto', sub: 'Muebles completos, listos para colocar', items: [
      'Ego', 'Vora', 'Satori', 'Win', ['Logika', 'logika'], ['Econic', 'econic'], 'Dai', 'Vitale', 'Sansa', 'Niwa', 'Urban',
      'Wave Compact', ['Alfa Compact', 'alfa'], 'Bassi', 'Street', 'Enjoy', 'Elegance'] },
    { id: 'modular', name: 'Modular', sub: 'Módulos que se combinan a tu medida', items: [
      ['Logika Modular', 'logika'], ['Econic Modular', 'econic'], 'Wave Modular', 'Vida Modular', ['Alfa Modular', 'alfa'], 'Essence', 'Vitale Modular', 'Sansa Modular'] },
    { id: 'tuyo', name: 'Tuyo a medida', sub: 'Hecho al centímetro', items: [
      ['Bezel', null, 'tuyo-bezel'], ['Classic', null, 'tuyo-classic'], ['Line', null, 'tuyo-line'], ['Bold', null, 'tuyo-bold'], ['Minimal', null, 'tuyo-minimal'], ['Canaletto', null, 'tuyo-canaletto']] },
    { id: 'espejos', name: 'Espejos', sub: 'Con y sin luz LED', items: [
      'Murano', 'Esferic', 'Yue', 'Eclipse', 'Blaze', 'Stella', 'Lys', 'Boira', 'Glow', 'Halo', 'Nika', 'Apolo'] },
    { id: 'luces', name: 'Luminarias', sub: 'Apliques para el espejo', items: ['Lucce', 'Uri', 'Llum', 'Sunna', 'Limit', 'Alea'] },
    { id: 'auxiliares', name: 'Auxiliares', sub: 'Altos y columnas', items: ['Altos Style'] },
    { id: 'lavabos', name: 'Lavabos', sub: 'Integrados o sobre encimera', items: [
      ['Lavabos integrados', null, null, 'https://www.royogroup.com/colecciones/accesorios/lavabos/lavabos-integrados/']] },
    { id: 'complementos', name: 'Complementos', sub: 'Patas, accesorios y válvulas', items: [
      ['Accesorios Sumi', null, 'accesorios-sumi'], ['Patas', null, 'accesorios-sumi-2'], ['Válvulas y sifones', null, 'valvulas-sifones']] },
  ];
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const all = T.flatMap((t) => t.items.map((it) => {
    const [name, own, sl, url] = Array.isArray(it) ? it : [it];
    return { t, name, own, href: own ? `coleccion.html?c=${own}` : (url || R + (sl || slug(name)) + '/') };
  }));

  const types = document.getElementById('cgTypes'), list = document.getElementById('cgList');
  const q = document.getElementById('cgq'), count = document.getElementById('cgCount'), empty = document.getElementById('cgEmpty');
  const chip = (id, label) => `<button type="button" class="cg-chip" data-t="${id}" aria-pressed="false">${label}</button>`;
  types.innerHTML = chip('', 'Todo') + T.map((t) => chip(t.id, t.name)).join('');

  // texto extra por el que también se encuentra cada tipo (en los cuatro idiomas)
  const KW = {
    compacto: 'mueble muebles compact meuble mobile cabinet vanity', modular: 'mueble muebles modulos meuble mobile modules cabinet',
    tuyo: 'medida a medida made to measure sur mesure su misura mueble', espejos: 'espejo espejos luz led mirror miroir specchio',
    luces: 'luz luces aplique lampara light lights lampe luce luci', auxiliares: 'columna alto armario tall cabinet colonne colonna',
    lavabos: 'lavabo lavabos basin sink vasque lavabo', complementos: 'patas pata valvula sifon legs pieds gambe accesorios accessories',
  };

  // estado en la dirección (catalogo.html?tipo=espejos&q=halo): se puede compartir y volver atrás
  const P = new URLSearchParams(location.search);
  let tipo = T.some((t) => t.id === P.get('tipo')) ? P.get('tipo') : '';
  q.value = P.get('q') || '';

  function render() {
    const f = fold(q.value.trim());
    types.querySelectorAll('.cg-chip').forEach((b) => { const on = b.dataset.t === tipo; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    let n = 0, html = '';
    T.forEach((t) => {
      if (tipo && t.id !== tipo) return;
      const hits = all.filter((c) => c.t === t && (!f || fold(c.name).includes(f) || (f.length > 2 && (fold(t.name) + ' ' + KW[t.id]).split(' ').some((w) => w.startsWith(f)))));
      if (!hits.length) return;
      n += hits.length;
      html += `<div class="cg-group"><div class="cg-head"><h2>${t.name}</h2><p>${t.sub}</p></div><ul>` + hits.map((c) =>
        `<li><a href="${c.href}"${c.own ? '' : ' target="_blank" rel="noopener"'}><span class="cg-name">${c.name}</span>${c.own ? '<span class="cg-own">3D</span>' : '<span class="cg-ext" aria-hidden="true">↗</span>'}</a></li>`).join('') + '</ul></div>';
    });
    list.innerHTML = html;
    empty.hidden = n > 0;
    count.textContent = n === 1 ? '1 resultado' : `${n} resultados`;
    const u = new URLSearchParams(); if (tipo) u.set('tipo', tipo); if (q.value.trim()) u.set('q', q.value.trim());
    history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : '') + location.hash);
  }
  types.addEventListener('click', (e) => { const b = e.target.closest('.cg-chip'); if (!b) return; tipo = b.dataset.t; render(); });
  q.addEventListener('input', render);
  render();
  if (location.hash === '#buscar') setTimeout(() => q.focus({ preventScroll: true }), 300);
})();
