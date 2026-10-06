/* ============================================================
   FESTIVAL PABLO SARASATE · programa.js
   Configuración y datos del programa, compartidos por
   index.html (tarjetas de días) y dia.html (página de cada día).

   SHEET_CSV_URL: en Google Sheets → Archivo → Compartir →
   Publicar en la web → elige la pestaña → formato CSV → Publicar.
   Pega aquí la URL que te da.

   Columnas de la hoja (fila 1):
   fecha | hora | titulo | artistas | lugar | tipo | precio | entradas | descripcion
   fecha: 2027-03-08 o 08/03/2027 · hora: 19:30
   entradas: enlace de venta (si está vacío no aparece el botón)
   descripcion: opcional, texto o programa de la obra

   FORM_URL: enlace del Google Form de inscripción a las masterclasses.
   Las respuestas se guardan en una Google Sheet (Respuestas → Vincular a Hojas de cálculo).
   ============================================================ */
const CONFIG = {
  SHEET_CSV_URL: '',
  HERO_IMAGE: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ayuntamiento_de_Pamplona,_Pamplona_(ES)_-_panoramio.jpg?width=2400',
  /* Formulario de inscripción (Google Forms → Enviar → icono <> → copia la URL del src) */
  FORM_URL: '',
  START: '2027-03-08',
  DAYS: 7
};

/* Eventos de ejemplo: solo se muestran si la hoja no está conectada */
const SAMPLE = [
  {fecha:'2027-03-08',hora:'20:00',titulo:'Concierto inaugural',artistas:'Miguel Colom',lugar:'Catedral de Pamplona',tipo:'Concierto',precio:'',entradas:'',descripcion:''},
  {fecha:'2027-03-09',hora:'10:00',titulo:'Clase magistral de violín',artistas:'Miguel Colom',lugar:'Conservatorio Pablo Sarasate',tipo:'Clase magistral',precio:'Entrada libre',entradas:'',descripcion:''},
  {fecha:'2027-03-10',hora:'19:30',titulo:'Recital de cámara',artistas:'Alumnos del festival',lugar:'Civivox',tipo:'Concierto',precio:'',entradas:'',descripcion:''},
  {fecha:'2027-03-11',hora:'10:00',titulo:'Clase magistral de violín',artistas:'Miguel Colom',lugar:'Conservatorio Pablo Sarasate',tipo:'Clase magistral',precio:'Entrada libre',entradas:'',descripcion:''},
  {fecha:'2027-03-12',hora:'19:30',titulo:'Concierto de alumnos',artistas:'Alumnos del festival',lugar:'Civivox',tipo:'Concierto',precio:'',entradas:'',descripcion:''},
  {fecha:'2027-03-14',hora:'19:00',titulo:'Concierto de clausura',artistas:'Miguel Colom y alumnos del festival',lugar:'Catedral de Pamplona',tipo:'Concierto',precio:'',entradas:'',descripcion:''}
];

const Programa = (() => {
  const DOW = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const DOW_LONG = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const MES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  function parseDate(s){
    s = String(s||'').trim(); let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return new Date(+m[1], +m[2]-1, +m[3]);
    if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))) return new Date(+(m[3].length===2 ? '20'+m[3] : m[3]), +m[2]-1, +m[1]);
    return null;
  }
  const norm = k => String(k).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const longDate = d => `${cap(DOW_LONG[d.getDay()])} ${d.getDate()} de ${MES[d.getMonth()]}`;

  const start = parseDate(CONFIG.START);
  const days = Array.from({length: CONFIG.DAYS}, (_, i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d; });

  function clean(rows){
    return rows.map(r => { const o = {}; for (const k in r) o[norm(k)] = String(r[k] ?? '').trim(); return o; })
      .map(o => ({fecha:o.fecha, hora:o.hora, titulo:o.titulo||o.evento, artistas:o.artistas||o.artista,
                  lugar:o.lugar||o.sede, tipo:o.tipo||o.categoria, precio:o.precio,
                  entradas:o.entradas||o.enlace||o.url, descripcion:o.descripcion||o.notas}))
      .map(e => ({...e, date: parseDate(e.fecha)}))
      .filter(e => e.date && e.titulo)
      .sort((a, b) => a.date - b.date || String(a.hora).localeCompare(String(b.hora)));
  }

  /* cb(events, isSample) */
  function load(cb){
    const sample = () => cb(clean(SAMPLE), true);
    if (!CONFIG.SHEET_CSV_URL || !window.Papa) { sample(); return; }
    const url = CONFIG.SHEET_CSV_URL + (CONFIG.SHEET_CSV_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
    Papa.parse(url, {
      download: true, header: true, skipEmptyLines: true,
      complete: r => { const rows = clean(r.data); rows.length ? cb(rows, false) : sample(); },
      error: sample
    });
  }

  const forDay = (events, key) => events.filter(e => iso(e.date) === key);
  const dayUrl = d => 'dia.html#' + iso(d);

  return {DOW, DOW_LONG, MES, iso, parseDate, esc, cap, longDate, days, load, forDay, dayUrl};
})();

/* Menú (común a todas las páginas) */
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.getElementById('burger'), menu = document.getElementById('menu');
  const subbtn = document.getElementById('subbtn'), sub = document.getElementById('submenu');
  if (!burger) return;
  burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  subbtn.addEventListener('click', e => { e.stopPropagation(); sub.hidden = !sub.hidden; subbtn.setAttribute('aria-expanded', !sub.hidden); });
  document.addEventListener('click', e => { if (!e.target.closest('.has-sub')) { sub.hidden = true; subbtn.setAttribute('aria-expanded', 'false'); } });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); sub.hidden = true; }));
});
