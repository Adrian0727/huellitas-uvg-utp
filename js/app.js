/* =========================================================
   Arranque de la aplicación: encabezado, buscador con
   asistente, rutas (#/...) y pie de página.
   ========================================================= */

const App = (() => {
  const RUTAS = [
    [/^\/?$/, 'inicio'],
    [/^\/catalogo$/, 'catalogo'],
    [/^\/producto\/([\w-]+)$/, 'producto'],
    [/^\/carrito$/, 'carrito'],
    [/^\/pago$/, 'pago'],
    [/^\/factura\/([\w-]+)$/, 'factura'],
    [/^\/registro$/, 'registro'],
    [/^\/login$/, 'login'],
    [/^\/cuenta$/, 'cuenta'],
    [/^\/proveedor$/, 'proveedor'],
    [/^\/mayoreo\/([\w-]+)$/, 'mayoreo'],
    [/^\/admin$/, 'admin']
  ];

  function leerRuta() {
    const [ruta, query = ''] = location.hash.replace(/^#/, '').split('?');
    for (const [patron, nombre] of RUTAS) {
      const m = ruta.match(patron);
      if (m) return { nombre, params: m.slice(1), query: Object.fromEntries(new URLSearchParams(query)) };
    }
    return { nombre: 'noEncontrado', params: [], query: {} };
  }

  /* ---------- Encabezado ---------- */
  function encabezado() {
    const u = Store.usuario();
    const { nombre, query } = leerRuta();
    const activo = (cond) => (cond ? 'class="on"' : '');
    const n = Store.cantidadCarrito();
    let cuenta;
    if (u) {
      cuenta = `<div class="account"><button class="btn soft sm" id="btn-cuenta" aria-haspopup="true" aria-expanded="false">${icon('user', 18)}<span class="hide-md">${esc(u.negocio || u.nombre.split(' ')[0])}</span></button>
        <div class="menu" id="menu-cuenta" role="menu">
          <div class="who"><b>${esc(u.nombre)}</b><div class="small muted">${ROLES[u.rol]?.nombre || 'Administrador'}</div></div>
          <a href="#/cuenta" role="menuitem">${icon('receipt', 18)}Mi cuenta y pedidos</a>
          ${u.rol === 'proveedor' ? `<a href="#/proveedor" role="menuitem">${icon('box', 18)}Gestión de mis productos</a>` : ''}
          ${u.rol === 'admin' ? `<a href="#/admin" role="menuitem">${icon('shield', 18)}Administración</a>` : ''}
          <button id="btn-salir" role="menuitem">${icon('logout', 18)}Cerrar sesión</button>
        </div></div>`;
    } else {
      cuenta = `<a class="hide-md" href="#/login" style="font-size:15px;font-weight:500">Iniciar sesión</a><a class="btn soft sm" href="#/registro">Registrarse</a>`;
    }
    document.getElementById('top').innerHTML = `<div class="wrap">
      <a class="logo" href="#/" aria-label="Huellitas, inicio">${icon('leaf', 24)}<span>Huellitas</span></a>
      <nav class="nav" aria-label="Principal">
        <a href="#/catalogo" ${activo(nombre === 'catalogo' && !query.especie && !query.mayoreo)}>Tienda</a>
        ${CATEGORIAS.especies.map((e) => `<a href="#/catalogo?especie=${e.id}" ${activo(query.especie === e.id)}>${e.nombre}</a>`).join('')}
        <a href="#/catalogo?mayoreo=1" ${activo(!!query.mayoreo)}>Al por mayor</a>
      </nav>
      <div class="tools">
        <form class="search" id="buscador" role="search" autocomplete="off">
          ${icon('search', 19)}
          <label for="q" class="sr-only">Buscar productos</label>
          <input id="q" type="search" placeholder="Buscar productos" value="${esc(query.q || '')}" aria-autocomplete="list" aria-controls="sugerencias" aria-expanded="false">
          <div class="suggest" id="sugerencias" role="listbox"></div>
        </form>
        ${cuenta}
        <a class="iconbtn" href="#/carrito" aria-label="Carrito, ${n} artículos">${icon('bag')}${n ? `<span class="badge" id="cart-badge">${n}</span>` : ''}</a>
      </div></div>`;
    conectarBuscador();
    const bc = document.getElementById('btn-cuenta');
    if (bc) {
      const menu = document.getElementById('menu-cuenta');
      bc.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('open'); bc.setAttribute('aria-expanded', menu.classList.contains('open')); });
      document.getElementById('btn-salir').addEventListener('click', () => { Store.cerrarSesion(); location.hash = '#/'; aviso('Cerraste sesión'); });
    }
  }

  /* ---------- Buscador con asistente de escritura (RF-05, RF-06) ---------- */
  function conectarBuscador() {
    const form = document.getElementById('buscador');
    const input = document.getElementById('q');
    const caja = document.getElementById('sugerencias');
    let activo = -1;
    let opciones = [];

    const resaltar = (texto, q) => {
      const i = Store.normal(texto).indexOf(Store.normal(q));
      if (i < 0 || !q) return esc(texto);
      return esc(texto.slice(0, i)) + '<mark>' + esc(texto.slice(i, i + q.length)) + '</mark>' + esc(texto.slice(i + q.length));
    };
    function cerrar() { caja.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); activo = -1; }
    function pintar() {
      const q = input.value.trim();
      if (!q) return cerrar();
      const { productos, correccion } = Store.sugerencias(q);
      opciones = productos.map((p) => ({ tipo: 'p', p }));
      let html = '';
      if (productos.length) {
        html += '<div class="lbl">Sugerencias</div>' + productos.map((p, i) => `<button type="button" role="option" data-i="${i}" id="sug-${i}">
          <span class="thumb ${p.tinte}">${imagenProducto(p, 26)}</span><span>${resaltar(p.nombre, q)}</span><span class="meta">${p.estado === 'pronto' ? 'Próximamente' : dinero(p.precio)}</span></button>`).join('');
      } else if (correccion) {
        opciones = [{ tipo: 'c', q: correccion }];
        html += `<div class="lbl">No encontramos “${esc(q)}”</div><button type="button" role="option" data-i="0" id="sug-0">${icon('sparkle', 18)}<span>¿Quisiste decir <b>${esc(correccion)}</b>?</span></button>`;
      } else {
        html += `<div class="lbl">No hay coincidencias. Presiona Enter para buscar “${esc(q)}”.</div>`;
      }
      caja.innerHTML = html;
      caja.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      activo = -1;
    }
    function elegir(i) {
      const o = opciones[i];
      if (!o) return;
      cerrar();
      if (o.tipo === 'p') location.hash = '#/producto/' + o.p.id;
      else { input.value = o.q; location.hash = '#/catalogo?q=' + encodeURIComponent(o.q); }
    }
    function mover(d) {
      if (!opciones.length) return;
      activo = (activo + d + opciones.length) % opciones.length;
      caja.querySelectorAll('button').forEach((b, i) => b.classList.toggle('act', i === activo));
      input.setAttribute('aria-activedescendant', 'sug-' + activo);
    }
    input.addEventListener('input', pintar);
    input.addEventListener('focus', () => input.value && pintar());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); mover(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); mover(-1); }
      if (e.key === 'Escape') cerrar();
    });
    caja.addEventListener('mousedown', (e) => {
      const b = e.target.closest('button[data-i]');
      if (b) { e.preventDefault(); elegir(+b.dataset.i); }
    });
    input.addEventListener('blur', () => setTimeout(cerrar, 120));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (activo >= 0) return elegir(activo);
      cerrar();
      location.hash = '#/catalogo?q=' + encodeURIComponent(input.value.trim());
    });
  }

  function pie() {
    document.getElementById('pie').innerHTML = `<div class="wrap">
      <div class="row" style="color:var(--green);font-weight:700">${icon('leaf', 20)}Huellitas</div>
      <div class="row">${icon('recycle', 18)}Empaques compostables y reciclables</div>
      <div class="row">${icon('truck', 18)}Envío local y centros de entrega aliados</div>
      <div class="row" style="flex-wrap:wrap">Proyecto COIL · UVG × UTP · <button class="link small" id="reiniciar">Reiniciar datos de prueba</button></div>
    </div>`;
    document.getElementById('reiniciar').addEventListener('click', () => modal({
      icono: 'alert', tono: 'ambar', titulo: '¿Reiniciar la tienda?',
      texto: 'Se borran pedidos, cuentas nuevas, productos publicados y el carrito. Vuelven los datos de prueba.',
      botones: [{ texto: 'Sí, reiniciar', clase: 'danger', accion: () => { Store.reiniciar(); location.hash = '#/'; render(); aviso('Datos reiniciados'); } }, { texto: 'Cancelar', clase: 'line' }]
    }));
  }

  /* ---------- Dibujar la pantalla actual ---------- */
  function render() {
    const { nombre, params, query } = leerRuta();
    const vista = Vistas[nombre];
    encabezado();
    const main = document.getElementById('main');
    main.innerHTML = vista.html(params, query);
    document.title = `${vista.titulo} · Huellitas`;
    if (vista.init) vista.init(params, query);
  }

  function iniciar() {
    pie();
    window.addEventListener('hashchange', () => { cerrarModal(); render(); window.scrollTo(0, 0); document.getElementById('main').focus({ preventScroll: true }); });
    document.addEventListener('click', () => document.getElementById('menu-cuenta')?.classList.remove('open'));
    document.addEventListener('store:cambio', () => {
      // Actualiza el contador del carrito sin recargar toda la página (CU-02 paso 3)
      const n = Store.cantidadCarrito();
      const enlace = document.querySelector('.tools a[href="#/carrito"]');
      if (!enlace) return;
      enlace.setAttribute('aria-label', `Carrito, ${n} artículos`);
      let b = document.getElementById('cart-badge');
      if (!n) { b?.remove(); return; }
      if (!b) { b = document.createElement('span'); b.className = 'badge'; b.id = 'cart-badge'; enlace.appendChild(b); }
      if (b.textContent !== String(n)) { b.textContent = n; b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
    render();
  }

  return { render, iniciar };
})();

App.iniciar();
