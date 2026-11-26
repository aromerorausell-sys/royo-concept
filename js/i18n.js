/* Idiomas ES / EN.
   El texto base está en español. En inglés se traduce cada nodo de texto (y alt, aria-label, title…)
   buscando su frase en el diccionario. Un MutationObserver traduce también lo que los scripts
   escriben después (fichas de colección, mensajes de formularios, nombres de acabado).
   Al cambiar de idioma se recarga la página: así las animaciones (palabras que se encienden,
   texto que se desordena) se montan ya con el idioma correcto. */
(function () {
  const KEY = 'royo-lang';
  const lang = localStorage.getItem(KEY) === 'en' ? 'en' : 'es';
  document.documentElement.lang = lang;

  const EN = {
    // cabecera y navegación
    'Somos Royo': 'About Royo', 'Colecciones': 'Collections', 'Instalación': 'Installation', 'Configuradores': 'Configurators',
    'Contacto': 'Contact', 'Profesionales': 'Professionals', 'Área privada': 'Private area', 'Dónde comprar': 'Where to buy',
    'Royo, inicio': 'Royo, home', 'Principal': 'Main', 'Inicio': 'Home',
    // portada
    'Diseñamos': 'We design', 'tu baño': 'your bathroom', 'Muebles de baño': 'Bathroom furniture', '+50 años': '50+ years',
    'Diseño y fabricación': 'Design and manufacturing',
    'Diseñamos y fabricamos muebles de baño en Valencia desde hace más de 50 años. Para quien reforma su casa y para quien construye proyectos.':
      'We have been designing and manufacturing bathroom furniture in Valencia for over 50 years. For people renovating their home and for those building projects.',
    'Innovación, sostenibilidad, mejora continua y trabajo en equipo.': 'Innovation, sustainability, continuous improvement and teamwork.',
    // despiece
    '01 · Despiece': '01 · Exploded view', 'Cada pieza,': 'Every piece,', 'pensada.': 'thought through.',
    'Laterales de 16 mm, frentes de 18 mm y encimera con lavabo integrado.': '16 mm sides, 18 mm fronts and a countertop with integrated basin.',
    'Encimera': 'Countertop', 'Lavabo integrado de cerámica': 'Integrated ceramic basin', 'Cajón superior': 'Top drawer',
    'Extracción total · Hettich': 'Full extension · Hettich', 'Tirador': 'Handle', 'Integrado · acabado inox': 'Integrated · stainless finish',
    'Cajón inferior': 'Bottom drawer', 'Cierre amortiguado': 'Soft-close', 'Lateral': 'Side panel', 'Aglomerado TSCA 16 mm': '16 mm TSCA chipboard',
    '02 · Por dentro': '02 · Inside', 'Se abre': 'It opens', 'hasta el fondo.': 'all the way.',
    'Cajón metálico con interior antracita, regulable en altura y en lateral.': 'Metal drawer with an anthracite interior, adjustable in height and sideways.',
    // galería de colecciones
    'Soluciones compactas para cada espacio': 'Compact solutions for every space', 'Combina, adapta, crea': 'Combine, adapt, create',
    'Tu baño, a medida': 'Your bathroom, made to measure', 'Tres formas de pensar el baño': 'Three ways to think about the bathroom',
    '03 · Colecciones': '03 · Collections', 'Tu baño,': 'Your bathroom,', 'a medida.': 'made to measure.',
    '04 · Materia': '04 · Material', 'Calidad': 'Quality',
    // Econic
    'No es solo un mueble.': 'It is not just a piece of furniture.',
    'Es la colección que creamos para celebrar nuestros 50 años. Curvas de montaña y río, y un tirador tallado en el frente.':
      'It is the collection we created to celebrate our 50 years. Curves of mountains and rivers, and a handle carved into the front.',
    '06 · Tu acabado': '06 · Your finish', 'Blanco Mate': 'Matt White', 'Negro Mate': 'Matt Black',
    'Toca un color para probarlo': 'Tap a colour to try it',
    '50 años diseñando en Valencia': '50 years designing in Valencia',
    // colecciones
    'Tres formas de': 'Three ways to', 'pensar el baño.': 'think about the bathroom.',
    'Soluciones compactas para cada espacio.': 'Compact solutions for every space.', '15 colecciones': '15 collections', '6 colecciones': '6 collections',
    'Combina, adapta, crea.': 'Combine, adapt, create.', 'Tu baño, a medida.': 'Your bathroom, made to measure.', '6 acabados': '6 finishes',
    'Ver Compact': 'See Compact', 'Ver Modular': 'See Modular', 'Ver Tuyo': 'See Tuyo',
    'Mueble Logika Compact en Nogal Ártico': 'Logika Compact unit in Nogal Ártico', 'Composición Econic Modular en Verde Forest': 'Econic Modular composition in Verde Forest',
    'Baño a medida con muebles en roble': 'Made-to-measure bathroom with oak furniture',
    // profesionales
    'Profesionales y contract': 'Professionals and contract', 'Proyectos que': 'Projects that', 'se entregan a tiempo.': 'are delivered on time.',
    'Hoteles, promociones y reformas. Fabricamos en Valencia, con servicio técnico propio y una red de distribuidores en toda España.':
      'Hotels, developments and renovations. We manufacture in Valencia, with our own technical service and a network of distributors across Spain.',
    'Baño con muebles Alfa en Azul Ocean': 'Bathroom with Alfa furniture in Azul Ocean',
    // instalación
    'Montarlo es': 'Assembling it is', 'tan fácil como elegirlo.': 'as easy as choosing it.',
    'Elige': 'Choose', 'Colección, medida y acabado en el configurador o en tu distribuidor.': 'Collection, size and finish in the configurator or at your distributor.',
    'Recibe': 'Receive', 'Cada mueble llega con su esquema de montaje y sus herrajes.': 'Every unit arrives with its assembly diagram and fittings.',
    'Instala': 'Install', 'Vídeos paso a paso y guías regulables en altura y en lateral.': 'Step-by-step videos and runners adjustable in height and sideways.',
    'Disfruta': 'Enjoy', 'Garantía Royo y servicio técnico desde Valencia.': 'Royo warranty and technical service from Valencia.',
    'Piezas del mueble Logika antes de montarlo': 'Logika unit parts before assembly', 'Mueble Logika montado': 'Assembled Logika unit',
    'Laterales': 'Side panels', 'Listo': 'Done', 'Los laterales de 16 mm se unen a la estructura.': 'The 16 mm side panels join the frame.',
    'Guías Hettich de extracción total y cierre amortiguado.': 'Hettich full-extension, soft-close runners.',
    'La encimera con lavabo integrado se apoya arriba.': 'The countertop with integrated basin rests on top.',
    'Suspendido en la pared. Garantía Royo y servicio técnico desde Valencia.': 'Wall-hung. Royo warranty and technical service from Valencia.',
    'Guías Hettich · extracción total': 'Hettich runners · full extension', 'Montaje del mueble Logika en 3D': '3D assembly of the Logika unit',
    'Estructura': 'Structure', 'Luz': 'Light', 'Columna': 'Tall unit', 'Suspendida · dos puertas': 'Wall-hung · two doors', 'Se cuelga en la pared': 'Hangs on the wall',
    'Extracción total · cierre amortiguado': 'Full extension · soft-close', 'Doble lavabo integrado': 'Integrated double basin', 'Espejos': 'Mirrors', 'Retroiluminación LED': 'LED backlighting',
    'Tu baño, montado': 'Your bathroom, assembled', 'La columna y las estructuras se cuelgan en la pared.': 'The tall unit and the frames hang on the wall.',
    'Guías de extracción total y cierre amortiguado.': 'Full-extension, soft-close runners.', 'La encimera con doble lavabo se apoya encima.': 'The countertop with double basin rests on top.',
    'Espejos con LED y tu baño, listo. Garantía Royo.': 'LED mirrors and your bathroom is ready. Royo warranty.',
    'Ver colecciones': 'See collections', 'Saltar intro': 'Skip intro', 'Líneas': 'Lines', 'Para ti': 'For you', 'Todo lo que': 'Everything', 'necesitas.': 'you need.',
    'Proyectos que se entregan a tiempo.': 'Projects delivered on time.', 'Configuradores': 'Configurators', 'Diséñalo tú. Nosotros lo fabricamos.': 'You design it. We make it.',
    'Elige módulos, medidas y acabados, o crea tu baño a medida centímetro a centímetro.': 'Choose modules, sizes and finishes, or create your made-to-measure bathroom centimetre by centimetre.',
    'Royo Modular': 'Royo Modular', 'Tuyo a medida': 'Tuyo made to measure', 'Completa tu baño.': 'Complete your bathroom.', 'años': 'years',
    'diseñando y fabricando en Valencia': 'designing and manufacturing in Valencia', 'Newsletter · ideas para tu baño, una vez al mes': 'Newsletter · ideas for your bathroom, once a month',
    'Logika en Nogal Ártico': 'Logika in Nogal Ártico', 'Logika en roble': 'Logika in oak', 'Alfa en Arena': 'Alfa in Arena', 'Econic en Terracota': 'Econic in Terracota',
    'Econic en Verde Forest': 'Econic in Verde Forest', 'Econic en Azul Vapor': 'Econic in Azul Vapor', 'Alfa en Azul Ocean': 'Alfa in Azul Ocean',
    'Baño a medida en roble': 'Made-to-measure bathroom in oak', 'Composición en gris': 'Composition in grey', 'Detalle de lavabo': 'Basin detail',
    // configuradores
    'Diséñalo tú.': 'You design it.', 'Nosotros lo fabricamos.': 'We make it.', 'Diseña tu baño con': 'Design your bathroom with',
    'Logika, Econic, Wave, Vida, Alfa y Essence. Elige módulos, medidas y acabados.': 'Logika, Econic, Wave, Vida, Alfa and Essence. Choose modules, sizes and finishes.',
    'Abrir configurador': 'Open configurator', 'Tu baño a medida con': 'Your made-to-measure bathroom with',
    'Bezel, Classic, Line, Bold, Minimal y Canaletto. Cada centímetro, aprovechado.': 'Bezel, Classic, Line, Bold, Minimal and Canaletto. Every centimetre put to use.',
    'Interior de cajón Econic con organizador': 'Econic drawer interior with organiser', 'Lavabo Oval de la colección Econic': 'Oval basin from the Econic collection',
    // años y accesorios
    'años diseñando': 'years designing', 'y fabricando en Valencia': 'and manufacturing in Valencia', 'Accesorios': 'Accessories',
    'Espejos': 'Mirrors', 'Con y sin marco, a medida': 'Framed or frameless, made to measure', 'Iluminación integrada': 'Integrated lighting',
    'Lavabos': 'Basins', 'Integrados o sobre encimera': 'Integrated or countertop', 'Armarios': 'Cabinets', 'Columnas y auxiliares': 'Tall units and auxiliary units',
    // newsletter
    'Ideas para tu baño,': 'Ideas for your bathroom,', 'una vez al mes.': 'once a month.', 'Tu correo electrónico': 'Your email address',
    'Suscribirme →': 'Subscribe →', 'He leído y acepto la': 'I have read and accept the', 'política de privacidad': 'privacy policy',
    'Revisa tu correo electrónico.': 'Please check your email address.', 'Necesitamos que aceptes la política de privacidad.': 'Please accept the privacy policy.',
    'Gracias. Te escribiremos pronto (demo: no se envía nada).': 'Thank you. We will be in touch soon (demo: nothing is sent).',
    // pie
    '50 años': '50 years', 'Síguenos': 'Follow us', 'Aviso legal': 'Legal notice', 'Privacidad': 'Privacy',
    'Royo 50 años · Concepto de rediseño, no es la web oficial': 'Royo 50 years · Redesign concept, not the official website',
    // ficha de colección (estático)
    'En 3D': 'In 3D', 'Gíralo, ábrelo,': 'Turn it, open it,', 'elige su acabado.': 'choose its finish.',
    'Arrastra para girar · rueda para acercar': 'Drag to rotate · scroll to zoom', 'Mueble en 3D': '3D furniture', 'Acabado': 'Finish',
    'Abrir cajones': 'Open drawers', 'Cerrar cajones': 'Close drawers', 'Características': 'Features', 'Galería': 'Gallery',
    'Ficha técnica': 'Technical sheet', 'Medidas': 'Dimensions', 'y materiales.': 'and materials.', 'Otras colecciones': 'Other collections',
    '¿Lo quieres': 'Want it', 'en tu baño?': 'in your bathroom?', 'Configurarlo': 'Configure it', 'Encontrar distribuidor': 'Find a distributor',
    'Pedir información': 'Request information', 'Cerrar': 'Close',
    // ficha de colección (datos)
    'Modular · 50 aniversario': 'Modular · 50th anniversary',
    'El baño, el nuevo corazón de la casa.': 'The bathroom, the new heart of the home.',
    'Una mirada a la naturaleza, en cada curva.': 'A nod to nature, in every curve.',
    'Diseño atemporal con laterales curvos.': 'Timeless design with curved sides.',
    'Fondo': 'Depth', 'Alto': 'Height', 'Anchos': 'Widths', 'Laterales': 'Sides', 'Frentes': 'Fronts', 'Cajones': 'Drawers', 'Interior': 'Interior',
    'Acabados': 'Finishes', 'Encimeras': 'Countertops', 'Laterales y frentes': 'Sides and fronts',
    'Líneas rectas': 'Straight lines', 'Funcionalidad con un diseño de líneas rectas, encimeras asimétricas y un tirador integrado discreto.':
      'Functionality with a straight-lined design, asymmetric countertops and a discreet integrated handle.',
    'Cajón metálico': 'Metal drawer', 'Cajón de 45 de fondo con estética de alta gama y doble regulación: arriba-abajo e izquierda-derecha.':
      '45 cm deep drawer with a high-end look and double adjustment: up-down and left-right.',
    'Interior antracita': 'Anthracite interior', 'Interiores de cajón en acabado antracita.': 'Drawer interiors in an anthracite finish.',
    '4 acabados': '4 finishes', '3 lisos y 1 madera en melamina, con tirador en blanco, antracita o inox.': '3 plain and 1 wood melamine finish, with a white, anthracite or stainless handle.',
    'Lavabo a elegir': 'Basin of your choice', 'Lavabo integrado o sobre encimera.': 'Integrated or countertop basin.',
    'Modelo 3D real del configurador de Royo': 'Real 3D model from the Royo configurator',
    'Modelo 3D recreado a partir de la ficha técnica de Royo': '3D model recreated from the Royo technical sheet',
    '50 aniversario': '50th anniversary', 'Colección emblemática creada para el 50 aniversario de Royo.': 'Flagship collection created for Royo’s 50th anniversary.',
    'Curvas de montaña y río': 'Curves of mountains and rivers', 'Presentes en sus formas redondeadas, su tirador único, sus lavabos y sus espejos.':
      'Present in its rounded shapes, its unique handle, its basins and its mirrors.',
    'Piel fumé': 'Smoked leather', 'Interiores de cajón en piel fumé.': 'Drawer interiors in smoked leather.',
    'Lacado al agua': 'Water-based lacquer', 'Acabados con proceso de lacado al agua.': 'Finishes made with a water-based lacquering process.',
    'Extracción total': 'Full extension', 'Guías Hettich de extracción total. Lavabo integrado o sobre encimera.': 'Hettich full-extension runners. Integrated or countertop basin.',
    'Laterales curvos': 'Curved sides', 'Diseño atemporal con laterales curvos y tirador integrado en el frente.': 'Timeless design with curved sides and a handle integrated into the front.',
    'Interiores de cajón en piel fumé, con organizador en el cajón superior.': 'Drawer interiors in smoked leather, with an organiser in the top drawer.',
    'Guías Hettich de extracción total y cierre amortiguado.': 'Hettich full-extension, soft-close runners.',
    'Puertas y cajones': 'Doors and drawers', 'Nueva composición de 100 cm con cajón lateral a izquierda o derecha.': 'New 100 cm composition with a side drawer on the left or right.',
    'Patas decorativas': 'Decorative legs', 'Patas Wire o Lite en tres acabados distintos.': 'Wire or Lite legs in three different finishes.',
    '60, 80, 100 y 120 cm': '60, 80, 100 and 120 cm', '59,5, 79,5 y 99,5 cm': '59.5, 79.5 and 99.5 cm', '56,5 cm': '56.5 cm', '59,5 · 79,5 · 99,5': '59.5 · 79.5 · 99.5',
    'DM TSCA 18 mm': '18 mm TSCA MDF', 'Extracción total Hettich, cierre amortiguado': 'Hettich full extension, soft-close',
    'Antracita, con organizador': 'Anthracite, with organiser', 'Integrado: blanco, antracita o inox': 'Integrated: white, anthracite or stainless',
    'Suspendido': 'Wall-hung', 'DM TSCA 18 mm, lacado al agua': '18 mm TSCA MDF, water-based lacquer',
    'Azul Vapor, Blanco y Negro mate, Verde Forest, Terracota, Gris Vintage, Azul Navy, Blanco brillo, Nature Beige, Hickory y White':
      'Azul Vapor, matt White and Black, Verde Forest, Terracota, Gris Vintage, Azul Navy, gloss White, Nature Beige, Hickory and White',
    '45 cm (columna 24 cm)': '45 cm (tall unit 24 cm)', 'MDF 16 mm': '16 mm MDF', 'Hettich, cierre amortiguado, organizador': 'Hettich, soft-close, organiser',
    'Foil 2D / Foil 3D y lacados': '2D / 3D foil and lacquers', 'Mineral, mármol, Concretech, melamina o lacada': 'Mineral, marble, Concretech, melamine or lacquered',
    'Suspendido o con patas': 'Wall-hung or on legs', 'Esquema de montaje': 'Assembly diagram', 'Vídeo de montaje': 'Assembly video',
    'Vídeo de regulación': 'Adjustment video', 'Vídeo': 'Video',
    // contacto
    'Royo / Contacto': 'Royo / Contact', 'Hablemos': 'Let’s talk', 'de tu baño.': 'about your bathroom.',
    'Queremos estar siempre cerca del cliente. Escríbenos, llámanos o ven a vernos a nuestras oficinas centrales en Valencia.':
      'We always want to be close to our customers. Write to us, call us or visit our head office in Valencia.',
    'Escríbenos': 'Write to us', 'Soy': 'I am', 'Particular': 'Homeowner', 'Profesional': 'Professional', 'Quiero distribuir': 'I want to distribute',
    'Nombre': 'Name', 'Teléfono': 'Phone', 'Correo electrónico': 'Email', 'Código postal': 'Postcode', '¿En qué podemos ayudarte?': 'How can we help you?',
    'Enviar mensaje →': 'Send message →', 'Oficinas centrales': 'Head office', 'Valencia · España': 'Valencia · Spain',
    'L–J 08:00–14:00 y 15:00–17:00 · V 08:00–14:30': 'Mon–Thu 08:00–14:00 and 15:00–17:00 · Fri 08:00–14:30',
    'Trabaja con nosotros:': 'Work with us:', 'Misma dirección ·': 'Same address ·', 'L–V 10:00–14:00 y 15:00–19:00': 'Mon–Fri 10:00–14:00 and 15:00–19:00',
    'Mapa de Royo en Quart de Poblet': 'Map of Royo in Quart de Poblet', 'Encuentra tu': 'Find your', 'distribuidor Royo.': 'Royo distributor.',
    'Tu código postal': 'Your postcode', 'Buscar →': 'Search →', 'Dinos tu nombre.': 'Please tell us your name.',
    'Cuéntanos en qué podemos ayudarte.': 'Tell us how we can help you.', 'Escribe un código postal de 5 cifras.': 'Enter a 5-digit postcode.',
    'En la web real, aquí aparecerían los distribuidores Royo más cercanos a': 'On the real website, the Royo distributors closest to',
    'en el mapa. Mientras tanto, llama al': 'would appear here on the map. In the meantime, call',
    'y te diremos cuál te queda más cerca.': 'and we will tell you which one is nearest.',
  };
  // frases con partes variables
  const STEP_EN = { Estructura: 'Structure', Cajones: 'Drawers', Encimera: 'Countertop', Luz: 'Light' };
  const RULES = [
    [/^Paso (\d+) \/ (\d+) · (Estructura|Cajones|Encimera|Luz)$/, (_, a, b, c) => `Step ${a} / ${b} · ${STEP_EN[c]}`],
    [/^Gracias, (.+)\. Te responderemos pronto \(demo: no se envía nada\)\.$/, 'Thank you, $1. We will reply soon (demo: nothing is sent).'],
    [/^Mueble (.+) de Royo en un baño$/, 'Royo $1 unit in a bathroom'],
    [/^(.+), foto (\d+)$/, '$1, photo $2'],
    [/^Royo · Colección \(concepto\)$/, 'Royo · Collection (concept)'],
    [/^Royo · (.+) \(concepto\)$/, 'Royo · $1 (concept)'],
  ];
  const TITLES = {
    'Royo — Diseñamos tu baño desde hace más de 50 años (concepto)': 'Royo — Designing your bathroom for over 50 years (concept)',
    'Royo · Contacto (concepto)': 'Royo · Contact (concept)',
  };

  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  function tr(s) {
    const k = norm(s);
    if (!k) return null;
    if (EN[k]) return EN[k];
    for (const [re, out] of RULES) if (re.test(k)) return k.replace(re, out);
    return null;
  }
  const ATTRS = ['alt', 'aria-label', 'title', 'data-cap', 'data-col', 'placeholder'];
  const trAttrs = (el) => ATTRS.forEach((a) => { if (el.hasAttribute(a)) { const t = tr(el.getAttribute(a)); if (t) el.setAttribute(a, t); } });
  function translateText(node) {
    const v = node.nodeValue, t = tr(v);
    if (t) node.nodeValue = v.match(/^\s*/)[0] + t + v.match(/\s*$/)[0];
  }
  function translateEl(el) {
    if (el.nodeType === 3) return translateText(el);
    if (el.nodeType !== 1 || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
    trAttrs(el);
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while ((n = w.nextNode())) { if (n.nodeType === 3) translateText(n); else trAttrs(n); }
  }

  // selector ES / EN en la cabecera
  document.querySelectorAll('.header__right > span').forEach((host) => {
    host.className = 'lang';
    host.innerHTML = '<button type="button" data-l="es">ES</button><i>/</i><button type="button" data-l="en">EN</button>';
    host.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('on', b.dataset.l === lang);
      b.setAttribute('aria-pressed', b.dataset.l === lang);
      b.setAttribute('aria-label', b.dataset.l === 'es' ? 'Español' : 'English');
      b.addEventListener('click', () => {
        if (b.dataset.l === lang) return;
        localStorage.setItem(KEY, b.dataset.l);
        sessionStorage.setItem('royo-scroll', String(scrollY));
        location.reload();
      });
    });
  });

  // al volver de un cambio de idioma, quedarse en el mismo punto de la página
  const back = sessionStorage.getItem('royo-scroll');
  if (back !== null) {
    sessionStorage.removeItem('royo-scroll');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    addEventListener('load', () => setTimeout(() => scrollTo(0, +back), 60));
  }

  if (lang === 'es') return;
  const tTitle = () => { const t = TITLES[document.title] || tr(document.title); if (t && t !== document.title) document.title = t; };
  tTitle();
  translateEl(document.body);
  new MutationObserver((ms) => ms.forEach((m) => {
    if (m.type === 'characterData') translateText(m.target);
    else if (m.type === 'attributes') { const t = tr(m.target.getAttribute(m.attributeName) || ''); if (t) m.target.setAttribute(m.attributeName, t); }
    else m.addedNodes.forEach(translateEl);
  })).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  const titleEl = document.querySelector('title');
  if (titleEl) new MutationObserver(tTitle).observe(titleEl, { childList: true });
})();
