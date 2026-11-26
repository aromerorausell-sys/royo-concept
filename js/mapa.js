/* Dónde comprar: mapa a medida (Leaflet + mapa gris claro de Esri) con la sede de Royo
   y un buscador por código postal que lleva el mapa a tu provincia.
   No se muestran distribuidores inventados: sin la lista real, se indica el teléfono de Royo. */
(function () {
  const el = document.getElementById('mapa');
  if (!el || !window.L) return;
  const HQ = [39.46795, -0.5021];
  const small = matchMedia('(max-width: 1000px)').matches;

  const map = L.map(el, { zoomControl: false, scrollWheelZoom: false, attributionControl: true })
    .setView(small ? [40.0, -3.2] : [40.0, -6.2], small ? 5 : 6);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  // mapa base gris claro de Esri (sin clave) + capa de nombres encima
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  L.tileLayer(ESRI + 'World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16, attribution: 'Mapa &copy; Esri, HERE, Garmin, &copy; colaboradores de OpenStreetMap',
  }).addTo(map);
  L.tileLayer(ESRI + 'World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, pane: 'overlayPane' }).addTo(map);
  // la rueda solo hace zoom después de pulsar el mapa (para no atrapar el scroll de la página)
  map.on('click', () => map.scrollWheelZoom.enable());
  map.on('mouseout', () => map.scrollWheelZoom.disable());

  const icon = (cls) => L.divIcon({ className: '', html: `<span class="pin ${cls}"><i></i></span>`, iconSize: [22, 22], iconAnchor: [11, 11] });
  L.marker(HQ, { icon: icon('pin--hq'), title: 'Royo · Oficinas centrales' }).addTo(map)
    .bindPopup('<b>Royo · Oficinas centrales</b><br />C/ Río Vinalopó, 69<br />46930 Quart de Poblet, Valencia<br /><a href="tel:+34961597660">+34 961 597 660</a>');
  let you = null;
  // en escritorio la tarjeta tapa la izquierda: se centra el punto en la zona libre de la derecha
  const card = document.querySelector('.ct-locator');
  const fly = (ll, z) => {
    const off = small ? 0 : (card.getBoundingClientRect().right) / 2;
    const pt = map.project(ll, z).subtract([off, 0]);
    map.flyTo(map.unproject(pt, z), z, { duration: 1.6 });
  };

  // capital de provincia según las dos primeras cifras del código postal
  const PROV = {
    '01': ['Álava', 42.85, -2.67], '02': ['Albacete', 38.99, -1.86], '03': ['Alicante', 38.35, -0.48], '04': ['Almería', 36.84, -2.46],
    '05': ['Ávila', 40.66, -4.70], '06': ['Badajoz', 38.88, -6.97], '07': ['Illes Balears', 39.57, 2.65], '08': ['Barcelona', 41.39, 2.17],
    '09': ['Burgos', 42.34, -3.70], '10': ['Cáceres', 39.47, -6.37], '11': ['Cádiz', 36.53, -6.29], '12': ['Castellón', 39.99, -0.05],
    '13': ['Ciudad Real', 38.99, -3.93], '14': ['Córdoba', 37.88, -4.78], '15': ['A Coruña', 43.36, -8.41], '16': ['Cuenca', 40.07, -2.13],
    '17': ['Girona', 41.98, 2.82], '18': ['Granada', 37.18, -3.60], '19': ['Guadalajara', 40.63, -3.17], '20': ['Gipuzkoa', 43.32, -1.98],
    '21': ['Huelva', 37.26, -6.95], '22': ['Huesca', 42.14, -0.41], '23': ['Jaén', 37.77, -3.79], '24': ['León', 42.60, -5.57],
    '25': ['Lleida', 41.62, 0.62], '26': ['La Rioja', 42.47, -2.45], '27': ['Lugo', 43.01, -7.56], '28': ['Madrid', 40.42, -3.70],
    '29': ['Málaga', 36.72, -4.42], '30': ['Murcia', 37.99, -1.13], '31': ['Navarra', 42.81, -1.64], '32': ['Ourense', 42.34, -7.86],
    '33': ['Asturias', 43.36, -5.85], '34': ['Palencia', 42.01, -4.53], '35': ['Las Palmas', 28.12, -15.43], '36': ['Pontevedra', 42.43, -8.65],
    '37': ['Salamanca', 40.97, -5.66], '38': ['Santa Cruz de Tenerife', 28.46, -16.25], '39': ['Cantabria', 43.46, -3.80], '40': ['Segovia', 40.95, -4.12],
    '41': ['Sevilla', 37.39, -5.98], '42': ['Soria', 41.76, -2.46], '43': ['Tarragona', 41.12, 1.25], '44': ['Teruel', 40.34, -1.11],
    '45': ['Toledo', 39.86, -4.02], '46': ['Valencia', 39.47, -0.38], '47': ['Valladolid', 41.65, -4.72], '48': ['Bizkaia', 43.26, -2.93],
    '49': ['Zamora', 41.50, -5.75], '50': ['Zaragoza', 41.65, -0.89], '51': ['Ceuta', 35.89, -5.32], '52': ['Melilla', 35.29, -2.94],
  };

  const form = document.querySelector('.ct-search'), res = document.getElementById('res');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const cp = document.getElementById('q').value.trim();
    const P = /^\d{5}$/.test(cp) && PROV[cp.slice(0, 2)];
    if (!P) { res.textContent = 'Escribe un código postal de 5 cifras.'; return; }
    const [name, lat, lng] = P;
    if (you) you.remove();
    you = L.marker([lat, lng], { icon: icon('pin--you'), title: name }).addTo(map);
    fly([lat, lng], 9);
    res.innerHTML = `<span class="ct-prov">${name}</span>En la web real, aquí aparecerían los distribuidores Royo de tu zona. Mientras tanto, llama al <a href="tel:+34961597660">+34 961 597 660</a> y te diremos cuál te queda más cerca.`;
  });
  document.getElementById('verSede').addEventListener('click', () => fly(HQ, 15));
})();
