/* ============================================================
   FESTIVAL PABLO SARASATE · programa.js
   Configuración y datos del programa, compartidos por todas
   las páginas (español e inglés).

   SHEET_CSV_URL: en Google Sheets → Archivo → Compartir →
   Publicar en la web → elige la pestaña → formato CSV → Publicar.
   Pega aquí la URL que te da. Mientras esté vacía, la web muestra
   «Programa próximamente» (nunca eventos inventados).

   Para probar el diseño con eventos de ejemplo, añade ?demo a la
   dirección: index.html?demo

   Columnas de la hoja (fila 1):
   fecha | hora | titulo | artistas | lugar | tipo | precio | entradas | descripcion
   fecha: 2027-03-08 o 08/03/2027 · hora: 19:30
   entradas: enlace de venta (si está vacío no aparece el botón)
   descripcion: opcional, texto o programa de la obra
   Opcional para la web en inglés: title_en | type_en | price_en | description_en

   FORM_URL: enlace del Google Form de inscripción a las masterclasses.
   ============================================================ */
const CONFIG = {
  SHEET_CSV_URL: '',
  HERO_IMAGE: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ayuntamiento_de_Pamplona,_Pamplona_(ES)_-_panoramio.jpg?width=2400',
  FORM_URL: '',
  START: '2027-03-08',
  DAYS: 7
};

/* Eventos de ejemplo: solo se muestran con ?demo en la dirección */
const SAMPLE = [
  {fecha:'2027-03-08',hora:'20:00',titulo:'Concierto inaugural',artistas:'Miguel Colom',lugar:'Catedral de Pamplona',tipo:'Concierto',precio:'',entradas:'',descripcion:''},
  {fecha:'2027-03-09',hora:'10:00',titulo:'Clase magistral de violín',artistas:'Miguel Colom',lugar:'Conservatorio Pablo Sarasate',tipo:'Clase magistral',precio:'Entrada libre',entradas:'',descripcion:''},
  {fecha:'2027-03-10',hora:'19:30',titulo:'Recital de cámara',artistas:'Alumnos del festival',lugar:'Civivox',tipo:'Concierto',precio:'',entradas:'',descripcion:''},
  {fecha:'2027-03-14',hora:'19:00',titulo:'Concierto de clausura',artistas:'Miguel Colom y alumnos del festival',lugar:'Catedral de Pamplona',tipo:'Concierto',precio:'',entradas:'',descripcion:''}
];

const Programa = (() => {
  const LANG = (document.documentElement.lang || 'es').slice(0,2) === 'en' ? 'en' : 'es';
  const T = {
    es: {
      DOW:['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
      DOW_LONG:['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
      MES:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
      longDate: (d, t) => `${cap(t.DOW_LONG[d.getDay()])} ${d.getDate()} de ${t.MES[d.getMonth()]}`,
      dayPage:'dia.html', event:'evento', events:'eventos', more:'más', none:'Sin eventos programados', seeDay:'Ver el día',
      dayOf:(i,n)=>`Día ${i} de ${n} del festival`, tickets:'Entradas',
      emptyDay:'No hay eventos programados este día.', seeRest:'Ver el resto del programa',
      pendingDay:'El programa de este día se publicará próximamente.', backProgram:'Volver al festival',
      title:'Festival Pablo Sarasate'
    },
    en: {
      DOW:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
      DOW_LONG:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      MES:['January','February','March','April','May','June','July','August','September','October','November','December'],
      longDate: (d, t) => `${t.DOW_LONG[d.getDay()]}, ${d.getDate()} ${t.MES[d.getMonth()]}`,
      dayPage:'day.html', event:'event', events:'events', more:'more', none:'No events scheduled', seeDay:'See the day',
      dayOf:(i,n)=>`Day ${i} of ${n}`, tickets:'Tickets',
      emptyDay:'No events are scheduled on this day.', seeRest:'See the rest of the programme',
      pendingDay:'The programme for this day will be announced soon.', backProgram:'Back to the festival',
      title:'Pablo Sarasate Festival'
    }
  };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const t = T[LANG];

  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  function parseDate(s){
    s = String(s||'').trim(); let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return new Date(+m[1], +m[2]-1, +m[3]);
    if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))) return new Date(+(m[3].length===2 ? '20'+m[3] : m[3]), +m[2]-1, +m[1]);
    return null;
  }
  const norm = k => String(k).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = u => /^https?:\/\//i.test(String(u||'').trim()) ? String(u).trim() : '';
  const longDate = d => t.longDate(d, t);

  const start = parseDate(CONFIG.START);
  const days = Array.from({length: CONFIG.DAYS}, (_, i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d; });

  function clean(rows){
    const en = LANG === 'en';
    return rows.map(r => { const o = {}; for (const k in r) o[norm(k)] = String(r[k] ?? '').trim(); return o; })
      .map(o => ({fecha:o.fecha, hora:o.hora,
                  titulo:(en && o.titleen) || o.titulo || o.evento,
                  artistas:o.artistas || o.artista,
                  lugar:o.lugar || o.sede,
                  tipo:(en && o.typeen) || o.tipo || o.categoria,
                  precio:(en && o.priceen) || o.precio,
                  entradas:safeUrl(o.entradas || o.enlace || o.url),
                  descripcion:(en && o.descriptionen) || o.descripcion || o.notas}))
      .map(e => ({...e, date: parseDate(e.fecha)}))
      .filter(e => e.date && e.titulo)
      .sort((a, b) => a.date - b.date || String(a.hora).localeCompare(String(b.hora)));
  }

  /* cb(events, status) · status: 'live' | 'demo' | 'pending' */
  function load(cb){
    if (/[?&]demo\b/.test(location.search)) { cb(clean(SAMPLE), 'demo'); return; }
    const pending = () => cb([], 'pending');
    if (!CONFIG.SHEET_CSV_URL || !window.Papa) { pending(); return; }
    const url = CONFIG.SHEET_CSV_URL + (CONFIG.SHEET_CSV_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
    Papa.parse(url, {
      download: true, header: true, skipEmptyLines: true,
      complete: r => { const rows = clean(r.data); rows.length ? cb(rows, 'live') : pending(); },
      error: pending
    });
  }

  const forDay = (events, key) => events.filter(e => iso(e.date) === key);
  const dayUrl = d => t.dayPage + (/[?&]demo\b/.test(location.search) ? '?demo' : '') + '#' + iso(d);

  return {LANG, t, DOW:t.DOW, MES:t.MES, iso, parseDate, esc, cap, longDate, days, load, forDay, dayUrl};
})();

/* Menú, selector de idioma y foto de portada (común a todas las páginas) */
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger'), menu = document.getElementById('menu');
  const subbtn = document.getElementById('subbtn'), sub = document.getElementById('submenu');
  if (burger) {
    const close = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); if (sub) { sub.hidden = true; subbtn.setAttribute('aria-expanded', 'false'); } };
    burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
    if (subbtn) {
      subbtn.addEventListener('click', e => { e.stopPropagation(); sub.hidden = !sub.hidden; subbtn.setAttribute('aria-expanded', !sub.hidden); });
      document.addEventListener('click', e => { if (!e.target.closest('.has-sub')) { sub.hidden = true; subbtn.setAttribute('aria-expanded', 'false'); } });
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  /* El selector de idioma conserva el día abierto en la página del programa */
  document.querySelectorAll('[data-keep-hash]').forEach(a => a.addEventListener('click', () => {
    if (location.hash) a.href = a.href.split('#')[0] + location.hash;
  }));

  /* Foto de portada con alternativa si no carga */
  const hero = document.getElementById('hero'), photo = document.getElementById('heroPhoto');
  if (hero && photo) {
    if (CONFIG.HERO_IMAGE) { photo.addEventListener('error', () => hero.classList.add('no-photo')); photo.src = CONFIG.HERO_IMAGE; }
    else hero.classList.add('no-photo');
  }

  /* Botón de inscripción (masterclasses) */
  const formBtn = document.getElementById('formBtn');
  if (formBtn) {
    if (CONFIG.FORM_URL) formBtn.href = CONFIG.FORM_URL;
    else {
      formBtn.removeAttribute('href'); formBtn.removeAttribute('target');
      formBtn.classList.add('is-off'); formBtn.setAttribute('aria-disabled', 'true');
      formBtn.textContent = formBtn.dataset.off;
      const hint = document.getElementById('formHint'); if (hint) hint.hidden = false;
    }
  }
});
