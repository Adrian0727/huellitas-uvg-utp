/* =========================================================
   Piezas de interfaz reutilizables: formato, modales,
   avisos y tarjetas de producto.
   ========================================================= */

/* Evita que el texto escrito por usuarios se convierta en HTML (seguridad: XSS) */
function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const dinero = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MESES = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
function fechaCorta(iso) {
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}
function fechaLarga(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const nombreEspecie = (id) => (CATEGORIAS.especies.find((e) => e.id === id) || {}).nombre || id;
const nombreNecesidad = (id) => (CATEGORIAS.necesidades.find((e) => e.id === id) || {}).nombre || id;

/* Imagen del producto: foto si el proveedor la subió, si no la ilustración */
function imagenProducto(p, tam = 110) {
  if (p.fotos && p.fotos.length) return `<img src="${p.fotos[0]}" alt="${esc(p.nombre)}">`;
  return art(p.arte, tam);
}

function etiquetaProducto(p) {
  if (p.estado === 'pronto') return `<span class="pill p-dark tag">${icon('calendar', 14)}Llega el ${fechaCorta(p.llegada)}</span>`;
  if (p.stock === 0) return '<span class="pill p-red tag">Agotado</span>';
  return '<span class="pill p-green tag">En stock</span>';
}

function tarjetaProducto(p) {
  return `<a class="pcard" href="#/producto/${p.id}">
    <div class="thumb ${p.tinte}">${etiquetaProducto(p)}${imagenProducto(p)}</div>
    <div><div class="pname">${esc(p.nombre)}</div><div class="price">${dinero(p.precio)}</div></div>
  </a>`;
}

/* ---------- Modal tipo alerta de iOS ---------- */
const TONOS = {
  verde: ['var(--green-soft)', 'var(--green)'],
  ambar: ['var(--amber-soft)', 'var(--amber)'],
  rojo: ['var(--red-soft)', 'var(--red)'],
  gris: ['#f2f1ec', 'var(--ink-2)']
};

/* botones: [{ texto, clase: 'pri' | 'line', accion: () => {} }] */
function modal({ icono = 'info', tono = 'verde', titulo, texto, botones = [{ texto: 'Entendido', clase: 'pri' }] }) {
  cerrarModal();
  const [bg, fg] = TONOS[tono];
  const capa = document.createElement('div');
  capa.className = 'overlay';
  capa.id = 'modal';
  capa.innerHTML = `<div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="m-t">
    <div class="aico" style="background:${bg};color:${fg}">${icon(icono, 28)}</div>
    <h3 id="m-t">${titulo}</h3><p>${texto}</p>
    <div class="acts">${botones.map((b, i) => `<button class="btn ${b.clase || 'line'} full" data-i="${i}">${b.texto}</button>`).join('')}</div>
  </div>`;
  capa.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) { cerrarModal(); const f = botones[+b.dataset.i].accion; if (f) f(); }
    else if (e.target === capa) cerrarModal();
  });
  document.body.appendChild(capa);
  capa.querySelector('button')?.focus();
}
function cerrarModal() { document.getElementById('modal')?.remove(); }
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarModal(); });

/* ---------- Aviso breve en la parte de abajo ---------- */
let timerAviso;
function aviso(html, ms = 3500) {
  document.getElementById('toast')?.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  t.id = 'toast';
  t.setAttribute('role', 'status');
  t.innerHTML = html;
  document.body.appendChild(t);
  clearTimeout(timerAviso);
  timerAviso = setTimeout(() => t.remove(), ms);
}

/* ---------- Validación de formularios ---------- */
function marcarError(campo, mensaje) {
  const f = campo.closest('.field');
  if (!f) return;
  f.classList.toggle('bad', !!mensaje);
  let e = f.querySelector('.err');
  if (!e) { e = document.createElement('span'); e.className = 'err'; f.appendChild(e); }
  e.textContent = mensaje || '';
}

/* reglas: { nombreCampo: (valor, form) => 'mensaje' | '' } */
function validar(form, reglas) {
  let primero = null;
  Object.entries(reglas).forEach(([nombre, regla]) => {
    const campo = form.elements[nombre];
    if (!campo) return;
    const msg = regla(campo.value.trim(), form);
    marcarError(campo, msg);
    if (msg && !primero) primero = campo;
  });
  if (primero) primero.focus();
  return !primero;
}

const reglas = {
  requerido: (v) => (v ? '' : 'Este campo es obligatorio.'),
  correo: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Escribe un correo válido.'),
  clave: (v) => (v.length >= 6 ? '' : 'Mínimo 6 caracteres.'),
  telefono: (v) => (/^[\d\s+-]{7,}$/.test(v) ? '' : 'Escribe un teléfono válido.'),
  tarjeta: (v) => (luhn(v) ? '' : 'Número de tarjeta no válido.'),
  vence: (v) => {
    const m = v.match(/^(\d{2})\/(\d{2})$/);
    if (!m || +m[1] < 1 || +m[1] > 12) return 'Usa el formato MM/AA.';
    const fin = new Date(2000 + +m[2], +m[1], 0);
    return fin >= new Date() ? '' : 'La tarjeta está vencida.';
  },
  cvv: (v) => (/^\d{3,4}$/.test(v) ? '' : '3 o 4 dígitos.'),
  precio: (v) => (+v > 0 ? '' : 'Escribe un precio mayor que 0.'),
  entero: (v) => (/^\d+$/.test(v) && +v > 0 ? '' : 'Escribe una cantidad mayor que 0.')
};

/* Algoritmo de Luhn: revisa que el número de tarjeta sea válido */
function luhn(num) {
  const d = num.replace(/\D/g, '');
  if (d.length < 13 || d.length > 19) return false;
  let suma = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    suma += n;
  }
  return suma % 10 === 0;
}
function marcaTarjeta(num) {
  const d = num.replace(/\D/g, '');
  if (/^4/.test(d)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'American Express';
  return 'Tarjeta';
}

/* Da formato mientras escribe: 0000 0000 0000 0000 y MM/AA */
function formatoTarjeta(input) {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  });
}
function formatoVence(input) {
  input.addEventListener('input', () => {
    const d = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });
}

/* Reduce las fotos antes de guardarlas para no llenar el almacenamiento */
function comprimirImagen(archivo, max = 700) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * escala);
        c.height = Math.round(img.height * escala);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = reject;
      img.src = lector.result;
    };
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}
