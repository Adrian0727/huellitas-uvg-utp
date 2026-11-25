/* =========================================================
   Pantallas de la tienda. Cada pantalla tiene:
   - html(params): devuelve el contenido
   - init(params): conecta los botones y formularios
   ========================================================= */

const Vistas = {};

/* Lleva al inicio de sesión y luego regresa a donde estaba */
function pedirSesion(volver) {
  location.hash = '#/login?volver=' + encodeURIComponent(volver || location.hash);
}

/* ===================== INICIO (RF-01, RF-02) ===================== */
Vistas.inicio = {
  titulo: 'Inicio',
  html() {
    const disp = Store.disponibles();
    const pronto = Store.proximos();
    return `
    <section class="wrap" style="display:flex;flex-wrap:wrap;gap:40px;align-items:center;padding-top:48px">
      <div style="flex:1 1 440px" class="stack">
        <span class="pill p-green" style="align-self:flex-start">${icon('leaf', 16)}Empaques compostables en cada pedido</span>
        <h1>Bienestar y comodidad para tu mascota, en casa.</h1>
        <p class="lead">Productos de recreación, cuidado diario y paseo para perros, gatos y otras especies.</p>
        <div class="row" style="flex-wrap:wrap"><a class="btn pri" href="#/catalogo">Ver tienda</a><a class="btn line" href="#/catalogo?disp=stock">Disponibles hoy</a></div>
      </div>
      <div style="flex:1 1 440px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px">
        <div class="thumb t1" style="grid-row:span 2;min-height:340px;flex-direction:column;gap:10px">${art('bed', 170)}<span class="pill" style="background:#fff">Descanso</span></div>
        <div class="card stack" style="padding:22px;gap:8px;justify-content:center"><span style="color:var(--green)">${icon('truck', 28)}</span><h3>Envío local en 24 a 48 h</h3><span class="muted small">Fuera de cobertura, retiras en un centro aliado.</span></div>
        <div class="card stack" style="padding:22px;gap:8px;justify-content:center;background:var(--green);border-color:var(--green);color:#fff"><span>${icon('recycle', 28)}</span><h3>Materiales responsables</h3><span class="small" style="color:#d6e6dc">Fibras naturales y recicladas.</span></div>
      </div>
    </section>

    <section class="wrap sec" aria-labelledby="t-cat">
      <div class="sechead"><h2 id="t-cat">Compra por categoría</h2></div>
      <div class="grid g3">${CATEGORIAS.especies.map((e) => `
        <a class="card row" style="padding:18px;gap:16px" href="#/catalogo?especie=${e.id}">
          <div class="thumb ${e.tinte}" style="width:64px;height:64px">${icon(e.icono, 30)}</div>
          <div><h3>${e.nombre}</h3><span class="muted small">${Store.productos().filter((p) => p.especie === e.id).length} productos</span></div>
          <span class="muted" style="margin-left:auto">${icon('right', 20)}</span></a>`).join('')}</div>
      <div class="chips" style="margin-top:16px">${CATEGORIAS.necesidades.map((n) => `<a class="chip" href="#/catalogo?necesidad=${n.id}">${n.nombre}</a>`).join('')}</div>
    </section>

    <section class="wrap sec" aria-labelledby="t-disp">
      <div class="sechead"><div><h2 id="t-disp">Disponibles ahora</h2><p class="muted">Listos para enviar hoy.</p></div>
        <div class="arrows"><button class="arrow" data-mover="c-disp" data-dir="-1" aria-label="Anterior">${icon('left', 18)}</button><button class="arrow" data-mover="c-disp" data-dir="1" aria-label="Siguiente">${icon('right', 18)}</button></div></div>
      <div class="carousel" id="c-disp" tabindex="0" aria-label="Carrusel de productos disponibles">${disp.map(tarjetaProducto).join('')}</div>
    </section>

    <section class="wrap sec" aria-labelledby="t-pronto">
      <div class="sechead"><div><h2 id="t-pronto">Próximamente</h2><p class="muted">Fecha estimada de llegada a bodega.</p></div>
        <div class="arrows"><button class="arrow" data-mover="c-pronto" data-dir="-1" aria-label="Anterior">${icon('left', 18)}</button><button class="arrow" data-mover="c-pronto" data-dir="1" aria-label="Siguiente">${icon('right', 18)}</button></div></div>
      <div class="carousel" id="c-pronto" tabindex="0" aria-label="Carrusel de productos que llegan pronto">${pronto.map(tarjetaProducto).join('')}</div>
    </section>

    <section class="wrap sec grid g2">
      <div class="card stack" style="padding:32px;gap:12px;align-items:flex-start"><span style="color:var(--green)">${icon('box', 30)}</span><h2>¿Eres pequeño proveedor?</h2><p class="muted">Publica tu catálogo y vende en Huellitas a cambio de una comisión.</p><a class="btn soft" href="#/proveedor">Vender en Huellitas</a></div>
      <div class="card stack" style="padding:32px;gap:12px;align-items:flex-start"><span style="color:var(--green)">${icon('store', 30)}</span><h2>¿Tienes un negocio?</h2><p class="muted">Pequeños negocios y empresas piden al por mayor con tarifas especiales.</p><a class="btn soft" href="#/catalogo?mayoreo=1">Ver productos al por mayor</a></div>
    </section>`;
  },
  init() {
    document.querySelectorAll('[data-mover]').forEach((b) => b.addEventListener('click', () => {
      const c = document.getElementById(b.dataset.mover);
      c.scrollBy({ left: +b.dataset.dir * c.clientWidth * 0.8, behavior: 'smooth' });
    }));
    document.querySelectorAll('.carousel').forEach((c) => c.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') c.scrollBy({ left: c.clientWidth * 0.8, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') c.scrollBy({ left: -c.clientWidth * 0.8, behavior: 'smooth' });
    }));
  }
};

/* ===================== CATÁLOGO (CU-01, RF-05) ===================== */
Vistas.catalogo = {
  titulo: 'Catálogo',
  html(_, q) {
    const filtros = { q: q.q || '', especie: q.especie || '', necesidad: q.necesidad || '', disp: q.disp || '', orden: q.orden || 'relevancia' };
    let lista = Store.buscar(filtros);
    if (q.mayoreo) lista = lista.filter((p) => p.mayoreo);
    const enlace = (cambio) => '#/catalogo?' + new URLSearchParams(Object.entries({ ...filtros, mayoreo: q.mayoreo || '', ...cambio }).filter(([, v]) => v)).toString();
    const chip = (texto, activo, cambio) => `<a class="chip ${activo ? 'on' : ''}" href="${enlace(cambio)}">${texto}</a>`;
    const titulo = filtros.q ? `Resultados para “${esc(filtros.q)}”`
      : q.mayoreo ? 'Productos con venta al por mayor'
      : filtros.especie ? nombreEspecie(filtros.especie)
      : filtros.necesidad ? nombreNecesidad(filtros.necesidad) : 'Toda la tienda';
    const correccion = filtros.q && !lista.length ? Store.sugerencias(filtros.q).correccion : null;
    return `<div class="wrap" style="padding-top:36px">
      <p class="small muted" style="margin-bottom:8px"><a href="#/">Inicio</a> › Catálogo</p>
      <div class="between" style="flex-wrap:wrap;margin-bottom:18px"><h1 style="font-size:40px">${titulo}</h1>
        <label class="row small muted">Ordenar por
          <select id="orden" class="chip" style="padding-right:10px">
            ${[['relevancia', 'Más relevantes'], ['menor', 'Menor precio'], ['mayor', 'Mayor precio'], ['nombre', 'Nombre']].map(([v, t]) => `<option value="${v}" ${filtros.orden === v ? 'selected' : ''}>${t}</option>`).join('')}
          </select></label></div>
      <div class="chips" style="margin-bottom:12px">
        ${chip('Todas las especies', !filtros.especie, { especie: '' })}
        ${CATEGORIAS.especies.map((e) => chip(e.nombre, filtros.especie === e.id, { especie: e.id })).join('')}
        <span class="sep"></span>
        ${chip('Todas', !filtros.necesidad, { necesidad: '' })}
        ${CATEGORIAS.necesidades.map((n) => chip(n.nombre, filtros.necesidad === n.id, { necesidad: n.id })).join('')}
        <span class="sep"></span>
        ${chip('En stock', filtros.disp === 'stock', { disp: filtros.disp === 'stock' ? '' : 'stock' })}
        ${chip('Próximamente', filtros.disp === 'pronto', { disp: filtros.disp === 'pronto' ? '' : 'pronto' })}
      </div>
      <p class="small muted" style="margin:18px 0 16px">${lista.length} ${lista.length === 1 ? 'artículo' : 'artículos'}</p>
      ${lista.length ? `<div class="grid g4" style="row-gap:32px">${lista.map(tarjetaProducto).join('')}</div>` : `
      <div class="empty" role="status">
        <div class="thumb" style="width:64px;height:64px;background:#f2f1ec;border-radius:999px">${icon('search', 30)}</div>
        <h2>No se encontraron artículos</h2>
        <p class="muted" style="max-width:440px">No hay productos para esta búsqueda o categoría. Prueba con otra palabra o elige otra categoría.</p>
        ${correccion ? `<p>¿Quisiste decir <a class="link" href="#/catalogo?q=${encodeURIComponent(correccion)}">${esc(correccion)}</a>?</p>` : ''}
        <a class="btn pri" href="#/catalogo">Ver todas las categorías</a>
      </div>`}
    </div>`;
  },
  init(_, q) {
    document.getElementById('orden').addEventListener('change', (e) => {
      const p = new URLSearchParams(q);
      p.set('orden', e.target.value);
      location.hash = '#/catalogo?' + p.toString();
    });
  }
};

/* ===================== DETALLE DE PRODUCTO (CU-01 pasos 5-6, CU-02, CU-06) ===================== */
Vistas.producto = {
  titulo: 'Producto',
  html([pid]) {
    const p = Store.producto(pid);
    if (!p) return Vistas.noEncontrado.html();
    const u = Store.usuario();
    const disponible = p.estado === 'stock' && p.stock > 0;
    const fotos = p.fotos && p.fotos.length ? p.fotos : null;
    let mayoreo = '';
    if (p.mayoreo) {
      if (!u) mayoreo = `<a class="btn line full" href="#/mayoreo/${p.id}">${icon('store', 20)}Compra al por mayor</a><p class="small muted">Inicia sesión con una cuenta de negocio para pedir al por mayor.</p>`;
      else if (Store.esNegocio(u)) mayoreo = `<a class="btn line full" href="#/mayoreo/${p.id}">${icon('store', 20)}Compra al por mayor</a>`;
      else mayoreo = `<button class="btn full disabled" id="btn-mayoreo" aria-disabled="true">${icon('lock', 20)}Compra al por mayor</button>
        <div class="notice warn">${icon('info', 20)}<span>Las compras al por mayor son exclusivas para pequeños negocios y empresas. Tu cuenta es de tipo ${ROLES[u.rol]?.nombre.toLowerCase() || 'administrador'}.</span></div>`;
    }
    return `<div class="wrap" style="padding-top:28px">
      <p class="small muted" style="margin-bottom:20px"><a href="#/">Inicio</a> › <a href="#/catalogo?especie=${p.especie}">${nombreEspecie(p.especie)}</a> › ${nombreNecesidad(p.necesidad)}</p>
      <div style="display:flex;flex-wrap:wrap;gap:48px">
        <div style="flex:1 1 420px" class="stack">
          <div class="thumb ${p.tinte}" id="foto-principal" style="aspect-ratio:1/0.95">${fotos ? `<img src="${fotos[0]}" alt="${esc(p.nombre)}">` : art(p.arte, 240)}</div>
          ${fotos && fotos.length > 1 ? `<div class="row">${fotos.map((f, i) => `<button class="thumb t1" data-foto="${i}" style="width:84px;height:84px;border:0;padding:0" aria-label="Ver foto ${i + 1}"><img src="${f}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div style="flex:1 1 400px" class="stack">
          <div class="chips">
            ${disponible ? `<span class="pill p-green">${icon('check', 14)}En stock</span>` : p.estado === 'pronto' ? `<span class="pill p-dark">${icon('calendar', 14)}Llega el ${fechaCorta(p.llegada)}</span>` : '<span class="pill p-red">Agotado</span>'}
            ${p.material ? `<span class="pill p-sand">${icon('recycle', 14)}${esc(p.material.split(' ')[0])}</span>` : ''}
            ${p.mayoreo ? `<span class="pill p-amber">${icon('store', 14)}Venta al por mayor</span>` : ''}
          </div>
          <h1 style="font-size:clamp(32px,4vw,44px)">${esc(p.nombre)}</h1>
          <p class="muted">Vendido por <b style="color:var(--ink)">${esc(p.vendedor)}</b>${p.vendedorId ? ' · Pequeño proveedor' : ''}</p>
          <div style="font-size:32px;font-weight:650">${dinero(p.precio)}</div>
          <p class="lead" style="font-size:17px">${esc(p.descripcion)}</p>
          <div class="hr"></div>
          ${disponible ? `
          <div class="between"><div><div style="font-weight:600">Cantidad</div><div class="small muted">${p.stock} disponibles</div></div>
            <div class="stepper"><button id="menos" aria-label="Quitar uno">${icon('minus', 18)}</button><b id="cant" aria-live="polite">1</b><button id="mas" aria-label="Agregar uno">${icon('plus', 18)}</button></div></div>
          <button class="btn pri full" id="agregar">${icon('bag', 20)}Agregar al carrito</button>` : p.estado === 'pronto' ? `
          <div class="notice info">${icon('calendar', 20)}<span>Este artículo llega a bodega el <b>${fechaCorta(p.llegada)}</b>. Podrás comprarlo desde esa fecha.</span></div>` : `
          <div class="notice warn">${icon('alert', 20)}<span>Este artículo está agotado por el momento.</span></div>`}
          ${mayoreo}
          <div class="card" style="padding:4px 18px">
            <div class="row" style="padding:14px 0;border-bottom:1px solid var(--line)"><span style="color:var(--green)">${icon('truck', 20)}</span><div><div style="font-weight:600;font-size:15px">Envío local en 24 a 48 h</div><div class="small muted">Gratis desde $40</div></div></div>
            <div class="row" style="padding:14px 0"><span style="color:var(--green)">${icon('pin', 20)}</span><div><div style="font-weight:600;font-size:15px">Fuera de cobertura</div><div class="small muted">Retiro en un centro de entrega aliado</div></div></div>
          </div>
        </div>
      </div>
      <section class="sec"><h2 style="margin-bottom:16px">Detalles</h2>
        <div class="card" style="padding:4px 24px;max-width:760px">
          ${[['Especie', nombreEspecie(p.especie)], ['Necesidad', nombreNecesidad(p.necesidad)], ['Medidas', p.medidas], ['Material', p.material], ['Disponibilidad', disponible ? `${p.stock} unidades` : p.estado === 'pronto' ? `Llega el ${fechaCorta(p.llegada)}` : 'Agotado']]
            .filter(([, v]) => v).map(([k, v], i, a) => `<div class="between" style="padding:14px 0;${i < a.length - 1 ? 'border-bottom:1px solid var(--line)' : ''}"><span class="muted">${k}</span><span style="text-align:right">${esc(v)}</span></div>`).join('')}
        </div></section>
    </div>`;
  },
  init([pid]) {
    const p = Store.producto(pid);
    if (!p) return;
    document.querySelectorAll('[data-foto]').forEach((b) => b.addEventListener('click', () => {
      document.getElementById('foto-principal').innerHTML = `<img src="${p.fotos[+b.dataset.foto]}" alt="${esc(p.nombre)}">`;
    }));
    document.getElementById('btn-mayoreo')?.addEventListener('click', () => modal({
      icono: 'store', tono: 'ambar', titulo: 'Exclusivo para negocios',
      texto: 'Las compras al por mayor son exclusivas para pequeños negocios y empresas.',
      botones: [{ texto: 'Entendido', clase: 'pri' }]
    }));
    const cant = document.getElementById('cant');
    if (!cant) return;
    let n = 1;
    const pintar = () => { cant.textContent = n; };
    const stockMaximo = (pedido) => {
      // Flujo alternativo CU-02 2.1: stock insuficiente
      const enCarrito = (Store.carrito().find((l) => l.id === p.id) || {}).cantidad || 0;
      const maximo = p.stock - enCarrito;
      modal({
        icono: 'alert', tono: 'ambar', titulo: `Solo quedan ${p.stock} unidades`,
        texto: enCarrito ? `Ya tienes ${enCarrito} en tu carrito. Puedes agregar como máximo ${Math.max(0, maximo)} más.` : `Pediste ${pedido}, pero el inventario disponible es de ${p.stock}.`,
        botones: maximo > 0 ? [{ texto: `Ajustar a ${maximo}`, clase: 'pri', accion: () => { n = maximo; pintar(); } }, { texto: 'Cancelar', clase: 'line' }] : [{ texto: 'Ver carrito', clase: 'pri', accion: () => { location.hash = '#/carrito'; } }, { texto: 'Cerrar', clase: 'line' }]
      });
    };
    document.getElementById('menos').addEventListener('click', () => { n = Math.max(1, n - 1); pintar(); });
    document.getElementById('mas').addEventListener('click', () => { if (n + 1 > p.stock) stockMaximo(n + 1); else { n++; pintar(); } });
    document.getElementById('agregar').addEventListener('click', () => {
      const r = Store.agregar(p.id, n);
      if (!r.ok && r.error === 'stock') return stockMaximo(n);
      if (!r.ok) return;
      document.querySelector('#cart-badge')?.classList.add('bump');
      aviso(`${icon('check', 20)}<span>Agregado al carrito · ${Store.cantidadCarrito()} artículos</span><a href="#/carrito">Ver carrito</a>`);
      n = 1; pintar();
    });
  }
};

/* ===================== CARRITO (RF-03, RF-04, CU-02) ===================== */
function pasos(n) {
  return `<div class="steps">${['Carrito', 'Pago', 'Listo'].map((t, i) => `<span class="row ${i + 1 === n ? 'on' : i + 1 < n ? 'ok' : ''}" style="gap:8px"><span class="n">${i + 1 < n ? icon('check', 14) : i + 1}</span>${t}</span>`).join('<span class="bar"></span>')}</div>`;
}
function resumen(boton) {
  const t = Store.totales();
  return `<aside class="card stack" style="flex:1 1 320px;padding:28px;gap:14px;align-self:flex-start">
    <h3>Resumen</h3>
    <div class="between"><span class="muted">Subtotal (${Store.cantidadCarrito()} artículos)</span><span>${dinero(t.subtotal)}</span></div>
    <div class="between"><span class="muted">Envío</span><span>${t.envio ? dinero(t.envio) : 'Gratis'}</span></div>
    <div class="between"><span class="muted">ITBMS 7 %</span><span>${dinero(t.impuesto)}</span></div>
    <div class="hr"></div>
    <div class="between"><b style="font-size:18px">Total</b><b style="font-size:26px">${dinero(t.total)}</b></div>
    ${boton}
    <div class="row small muted"><span style="color:var(--green)">${icon('leaf', 16)}</span>Tu pedido viaja en empaque compostable.</div>
  </aside>`;
}

Vistas.carrito = {
  titulo: 'Carrito',
  html() {
    const lineas = Store.carrito();
    if (!lineas.length) return `<div class="wrap" style="padding-top:40px"><h1 style="margin-bottom:24px">Tu carrito</h1>
      <div class="empty"><div class="thumb" style="width:64px;height:64px;background:#f2f1ec;border-radius:999px">${icon('bag', 30)}</div><h2>Tu carrito está vacío</h2><p class="muted">Agrega productos desde el catálogo.</p><a class="btn pri" href="#/catalogo">Ir al catálogo</a></div></div>`;
    return `<div class="wrap" style="padding-top:40px">
      <div class="between" style="flex-wrap:wrap;margin-bottom:28px"><h1>Tu carrito</h1>${pasos(1)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:28px">
        <section class="card" style="flex:999 1 560px;padding:4px 28px" aria-label="Artículos del carrito">
          ${lineas.map((l, i) => `<div class="row" style="padding:20px 0;gap:18px;flex-wrap:wrap;${i < lineas.length - 1 ? 'border-bottom:1px solid var(--line)' : ''}">
            <a class="thumb ${l.producto.tinte}" href="#/producto/${l.id}" style="width:92px;height:92px">${imagenProducto(l.producto, 66)}</a>
            <div style="flex:1 1 180px"><a class="pname" href="#/producto/${l.id}">${esc(l.producto.nombre)}</a><div class="small muted">${dinero(l.producto.precio)} c/u · ${l.producto.stock} disponibles</div></div>
            <div class="stepper"><button data-menos="${l.id}" aria-label="Quitar uno">${icon('minus', 18)}</button><b>${l.cantidad}</b><button data-mas="${l.id}" aria-label="Agregar uno">${icon('plus', 18)}</button></div>
            <div class="price" style="width:90px;text-align:right">${dinero(l.producto.precio * l.cantidad)}</div>
            <button class="iconbtn" data-quitar="${l.id}" aria-label="Eliminar ${esc(l.producto.nombre)}">${icon('trash', 20)}</button>
          </div>`).join('')}
        </section>
        ${resumen('<a class="btn pri full" href="#/pago">Ir a pagar</a>')}
      </div>
      <a class="row" href="#/catalogo" style="margin-top:20px;color:var(--green);font-weight:600">${icon('left', 18)}Seguir comprando</a>
    </div>`;
  },
  init() {
    const recargar = () => App.render();
    document.querySelectorAll('[data-mas]').forEach((b) => b.addEventListener('click', () => {
      const l = Store.carrito().find((x) => x.id === b.dataset.mas);
      const r = Store.cambiarCantidad(l.id, l.cantidad + 1);
      if (!r.ok && r.error === 'stock') modal({ icono: 'alert', tono: 'ambar', titulo: `Solo quedan ${r.maximo} unidades`, texto: 'No puedes agregar más de lo que hay en inventario.' });
      else recargar();
    }));
    document.querySelectorAll('[data-menos]').forEach((b) => b.addEventListener('click', () => {
      const l = Store.carrito().find((x) => x.id === b.dataset.menos);
      Store.cambiarCantidad(l.id, l.cantidad - 1); recargar();
    }));
    document.querySelectorAll('[data-quitar]').forEach((b) => b.addEventListener('click', () => {
      const p = Store.producto(b.dataset.quitar);
      Store.eliminar(b.dataset.quitar); recargar();
      aviso(`${icon('trash', 20)}<span>Eliminaste ${esc(p.nombre)}</span>`);
    }));
  }
};

/* ===================== PAGO (RF-07, CU-03) ===================== */
Vistas.pago = {
  titulo: 'Pago',
  html() {
    const u = Store.usuario();
    if (!Store.carrito().length) { setTimeout(() => { location.hash = '#/carrito'; }); return ''; }
    if (!u) { setTimeout(() => pedirSesion('#/pago')); return ''; }
    const opcion = (valor, ico, titulo, sub, marcado) => `<label class="opt ${marcado ? 'on' : ''}"><input type="radio" name="metodo" value="${valor}" ${marcado ? 'checked' : ''}><span class="dot"></span><span style="color:var(--ink-2)">${icon(ico, 22)}</span><span><b style="font-weight:600;display:block">${titulo}</b><span class="small muted">${sub}</span></span></label>`;
    return `<div class="wrap" style="padding-top:40px">
      <div class="between" style="flex-wrap:wrap;margin-bottom:28px"><h1>Pago</h1>${pasos(2)}</div>
      <form id="f-pago" novalidate style="display:flex;flex-wrap:wrap;gap:28px">
        <div class="stack" style="flex:999 1 560px;gap:20px">
          <section class="card stack" style="padding:28px;gap:12px"><h3>Método de pago</h3>
            ${u.pago ? opcion('guardada', 'card', `${esc(u.pago.marca)} guardada •••• ${esc(u.pago.ultimos)}`, 'Pagas sin volver a escribir tus datos', true) : ''}
            ${opcion('tarjeta', 'card', 'Tarjeta de crédito o débito', 'Visa, Mastercard o American Express', !u.pago)}
            ${opcion('billetera', 'phone', 'Billetera digital', 'Confirmas el pago en tu celular')}
            ${opcion('transferencia', 'bank', 'Transferencia bancaria', 'Escribe el número de comprobante')}
          </section>
          <section class="card" style="padding:28px" id="datos-pago" aria-live="polite"></section>
          <section class="card stack" style="padding:28px;gap:12px"><h3>Entrega</h3>
            <label class="opt on"><input type="radio" name="entrega" value="domicilio" checked><span class="dot"></span><span style="color:var(--ink-2)">${icon('truck', 22)}</span><span><b style="font-weight:600;display:block">Envío a domicilio</b><span class="small muted">Zona local · 24 a 48 h</span></span></label>
            <label class="opt"><input type="radio" name="entrega" value="centro"><span class="dot"></span><span style="color:var(--ink-2)">${icon('pin', 22)}</span><span><b style="font-weight:600;display:block">Retiro en centro de entrega aliado</b><span class="small muted">Para direcciones fuera de cobertura</span></span></label>
            <div id="datos-entrega"></div>
          </section>
        </div>
        ${resumen(`<button class="btn pri full" type="submit" id="pagar">Pagar ${dinero(Store.totales().total)}</button><a class="row link small" href="#/carrito" style="justify-content:center">${icon('left', 16)}Volver al carrito</a>`)}
      </form></div>`;
  },
  init() {
    const f = document.getElementById('f-pago');
    if (!f) return;
    const u = Store.usuario();
    const datos = document.getElementById('datos-pago');
    const ent = document.getElementById('datos-entrega');
    const campo = (nombre, etiqueta, extra = '', clase = '') => `<label class="field ${clase}">${etiqueta}<input name="${nombre}" ${extra}></label>`;

    /* El sistema solicita los datos según el método elegido (CU-03 paso 4) */
    function pintarMetodo() {
      const m = f.metodo.value;
      if (m === 'guardada') datos.innerHTML = `<h3 style="margin-bottom:12px">Tarjeta guardada</h3><div class="notice info">${icon('check', 20)}<span>Usaremos tu ${esc(u.pago.marca)} terminada en ${esc(u.pago.ultimos)} (vence ${esc(u.pago.vence)}). No necesitas escribir tus datos otra vez.</span></div>`;
      if (m === 'tarjeta') {
        datos.innerHTML = `<h3 style="margin-bottom:16px">Datos de la tarjeta</h3><div class="form">
          ${campo('titular', 'Nombre en la tarjeta', `autocomplete="cc-name" value="${esc(u.nombre)}"`, 'span2')}
          ${campo('numero', 'Número de tarjeta', 'inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000"', 'span2')}
          ${campo('vence', 'Vencimiento', 'inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA"')}
          ${campo('cvv', 'Código de seguridad', 'inputmode="numeric" autocomplete="cc-csc" placeholder="CVV" maxlength="4"')}
          <div class="between span2"><span>Guardar esta tarjeta en mi cuenta</span><label class="switch"><input type="checkbox" name="guardar" aria-label="Guardar tarjeta"><span></span></label></div>
          <p class="small muted span2">Prueba: <b>4242 4242 4242 4242</b> se aprueba y <b>4000 0000 0000 0002</b> la rechaza la pasarela.</p></div>`;
        formatoTarjeta(f.numero); formatoVence(f.vence);
      }
      if (m === 'billetera') datos.innerHTML = `<h3 style="margin-bottom:16px">Billetera digital</h3><div class="form">${campo('celular', 'Número de celular', `inputmode="tel" placeholder="6000-0000" value="${esc(u.telefono)}"`, 'span2')}<p class="small muted span2">Recibirás una notificación en tu celular para confirmar el pago.</p></div>`;
      if (m === 'transferencia') datos.innerHTML = `<h3 style="margin-bottom:16px">Transferencia bancaria</h3><div class="notice info" style="margin-bottom:16px">${icon('bank', 20)}<span>Banco Nacional · Cuenta corriente 04-000-123456-7 · A nombre de Huellitas S.A.</span></div><div class="form">${campo('comprobante', 'Número de comprobante', 'placeholder="Ej. 98765432"', 'span2')}</div>`;
    }
    function pintarEntrega() {
      ent.innerHTML = f.entrega.value === 'domicilio'
        ? `<label class="field">Dirección de entrega<input name="direccion" value="${esc(u.direccion)}" placeholder="Provincia, distrito y calle"></label>`
        : `<label class="field">Centro de entrega<select name="centro"><option value="">Elige un centro</option>${CENTROS_ENTREGA.map((c) => `<option>${c}</option>`).join('')}</select></label>`;
    }
    f.addEventListener('change', (e) => {
      if (e.target.name === 'metodo' || e.target.name === 'entrega') {
        f.querySelectorAll(`input[name="${e.target.name}"]`).forEach((r) => r.closest('.opt').classList.toggle('on', r.checked));
        e.target.name === 'metodo' ? pintarMetodo() : pintarEntrega();
      }
    });
    pintarMetodo(); pintarEntrega();

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const m = f.metodo.value;
      const r = {};
      if (m === 'tarjeta') Object.assign(r, { titular: reglas.requerido, numero: reglas.tarjeta, vence: reglas.vence, cvv: reglas.cvv });
      if (m === 'billetera') r.celular = reglas.telefono;
      if (m === 'transferencia') r.comprobante = (v) => (/^\d{6,}$/.test(v) ? '' : 'Escribe el número de comprobante (mínimo 6 dígitos).');
      if (f.entrega.value === 'domicilio') r.direccion = reglas.requerido; else r.centro = (v) => (v ? '' : 'Elige un centro de entrega.');
      if (!validar(f, r)) return;

      let datosPago = { numero: '' };
      if (m === 'guardada') datosPago = { numero: '', etiqueta: `${u.pago.marca} •••• ${u.pago.ultimos}` };
      if (m === 'tarjeta') {
        const num = f.numero.value.replace(/\D/g, '');
        datosPago = { numero: num, etiqueta: `${marcaTarjeta(num)} •••• ${num.slice(-4)}`, resumen: { marca: marcaTarjeta(num), ultimos: num.slice(-4), vence: f.vence.value, titular: f.titular.value.trim() } };
      }
      if (m === 'billetera') datosPago = { numero: '', etiqueta: 'Billetera digital · ' + f.celular.value };
      if (m === 'transferencia') datosPago = { numero: '', etiqueta: 'Transferencia · comprobante ' + f.comprobante.value };
      const entrega = f.entrega.value === 'domicilio' ? 'Domicilio: ' + f.direccion.value.trim() : f.centro.value;

      const boton = document.getElementById('pagar');
      boton.disabled = true;
      boton.innerHTML = '<span class="spinner"></span>Procesando pago…';
      const res = await Store.pagar({ metodo: m === 'guardada' ? 'guardada' : m, datos: datosPago, entrega, guardarTarjeta: m === 'tarjeta' && f.guardar.checked });
      boton.disabled = false;
      boton.textContent = 'Pagar ' + dinero(Store.totales().total);
      if (res.ok) { location.hash = '#/factura/' + res.pedido.id; return; }
      if (res.error === 'rechazado') modal({
        icono: 'x', tono: 'rojo', titulo: 'Pago rechazado',
        texto: 'La pasarela de pago no aprobó la transacción. No se hizo ningún cargo. Revisa los datos e intenta de nuevo.',
        botones: [{ texto: 'Reintentar', clase: 'pri', accion: () => f.numero?.focus() }, { texto: 'Cambiar método', clase: 'line', accion: () => f.querySelector('input[value="billetera"]').focus() }]
      });
      if (res.error === 'stock') modal({ icono: 'alert', tono: 'ambar', titulo: 'Stock insuficiente', texto: `Ya no hay suficientes unidades de ${esc(res.producto.nombre)}. Ajusta tu carrito.`, botones: [{ texto: 'Ir al carrito', clase: 'pri', accion: () => { location.hash = '#/carrito'; } }] });
    });
  }
};

/* ===================== FACTURA / PAGO APROBADO (postcondición CU-03) ===================== */
Vistas.factura = {
  titulo: 'Pago aprobado',
  html([pid]) {
    const p = Store.pedido(pid);
    if (!p) return Vistas.noEncontrado.html();
    return `<div class="wrap stack" style="align-items:center;text-align:center;padding-top:56px;gap:16px">
      <div class="no-print" style="width:84px;height:84px;border-radius:999px;background:var(--green-soft);color:var(--green);display:flex;align-items:center;justify-content:center">${icon('check', 42)}</div>
      <h1 class="no-print" style="font-size:44px">Pago aprobado</h1>
      <p class="lead no-print" style="max-width:520px">Tu pedido <b>${p.id}</b> está pagado. Esta es tu factura digital.</p>
      <section class="card stack" style="width:100%;max-width:560px;padding:28px;gap:12px;text-align:left">
        <div class="between"><div><h3>Factura digital</h3><span class="small muted">${p.id} · ${fechaLarga(p.fecha)}</span></div><span class="pill p-green">${p.estado}</span></div>
        <div class="small muted">Huellitas S.A. · RUC 155000000-2-2026<br>Cliente: ${esc((Store.usuario() || {}).nombre || '')}</div>
        <div class="hr"></div>
        ${p.items.map((i) => `<div class="between"><span>${i.cantidad} × ${esc(i.nombre)}</span><span>${dinero(i.precio * i.cantidad)}</span></div>`).join('')}
        <div class="hr"></div>
        <div class="between"><span class="muted">Subtotal</span><span>${dinero(p.subtotal)}</span></div>
        <div class="between"><span class="muted">Envío</span><span>${p.envio ? dinero(p.envio) : 'Gratis'}</span></div>
        <div class="between"><span class="muted">ITBMS 7 %</span><span>${dinero(p.impuesto)}</span></div>
        <div class="between"><b>Total pagado</b><b style="font-size:24px">${dinero(p.total)}</b></div>
        <div class="hr"></div>
        <div class="small muted">Método: ${esc(p.metodo)} · Autorización ${p.autorizacion}<br>Entrega: ${esc(p.entrega)}</div>
      </section>
      <div class="row no-print" style="flex-wrap:wrap;justify-content:center"><a class="btn pri" href="#/">Volver a la tienda</a><button class="btn line" onclick="window.print()">${icon('receipt', 20)}Imprimir o guardar PDF</button></div>
      <p class="row small muted no-print">${icon('recycle', 16)}El inventario ya se actualizó con tu compra.</p>
    </div>`;
  }
};

/* ===================== REGISTRO (RF-10, RF-11, CU-04) ===================== */
Vistas.registro = {
  titulo: 'Registrarse',
  html(_, q) {
    const rol = ROLES[q.rol] ? q.rol : 'cliente';
    const empresa = rol !== 'cliente';
    const campo = (n, et, extra = '', clase = '') => `<label class="field ${clase}">${et}<input name="${n}" ${extra}></label>`;
    return `<div class="wrap" style="display:flex;justify-content:center;padding-top:40px">
      <div class="stack" style="width:100%;max-width:680px;gap:22px">
        <nav class="seg" aria-label="Cuenta"><a class="on" href="#/registro">Registrarse</a><a href="#/login">Iniciar sesión</a></nav>
        <div><h1 style="font-size:40px">Crea tu cuenta</h1><p class="muted" style="margin-top:6px">¿Qué tipo de usuario quieres registrar?</p></div>
        <div class="grid g2" role="radiogroup" aria-label="Tipo de usuario" style="gap:12px">${Object.entries(ROLES).map(([k, r]) => `
          <a class="opt ${k === rol ? 'on' : ''}" href="#/registro?rol=${k}" role="radio" aria-checked="${k === rol}" style="align-items:flex-start">
            <span style="color:var(--green)">${icon(r.icono, 26)}</span><span><b style="display:block;font-weight:600">${r.nombre}</b><span class="small muted">${r.desc}</span></span></a>`).join('')}</div>
        <form id="f-reg" class="card form" style="padding:28px" novalidate>
          <h3 class="span2">${empresa ? 'Datos del negocio' : 'Datos personales'}</h3>
          ${empresa ? campo('negocio', 'Nombre del negocio', 'autocomplete="organization"') + campo('ruc', 'RUC', 'placeholder="8-123-4567"') : ''}
          ${campo('nombre', empresa ? 'Nombre del encargado' : 'Nombre completo', 'autocomplete="name"')}
          ${campo('telefono', 'Teléfono', 'inputmode="tel" autocomplete="tel" placeholder="6000-0000"')}
          ${campo('correo', 'Correo electrónico', 'type="email" autocomplete="email"', 'span2')}
          ${campo('clave', 'Contraseña', 'type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"', 'span2')}
          ${campo('direccion', empresa ? 'Dirección del negocio' : 'Dirección de entrega', 'autocomplete="street-address" placeholder="Provincia, distrito y calle"', 'span2')}
          <div class="hr span2"></div>
          <div class="between span2"><div><b style="font-weight:600">Guardar forma de pago predeterminada</b><div class="small muted">Opcional. Así no vuelves a escribir tus datos al pagar.</div></div>
            <label class="switch"><input type="checkbox" name="guardarPago" aria-label="Guardar forma de pago"><span></span></label></div>
          <div id="campos-pago" class="form span2" hidden>
            ${campo('tnumero', 'Número de tarjeta', 'inputmode="numeric" placeholder="0000 0000 0000 0000"', 'span2')}
            ${campo('tvence', 'Vencimiento', 'inputmode="numeric" placeholder="MM/AA"')}
            ${campo('ttitular', 'Titular', 'placeholder="Como aparece en la tarjeta"')}
            <p class="small muted span2">Solo guardamos la marca y los últimos 4 dígitos. Nunca el número completo ni el código de seguridad.</p>
          </div>
          <button class="btn pri full span2" type="submit">Registrarme como ${ROLES[rol].nombre.toLowerCase()}</button>
          <p class="small muted span2" style="text-align:center">¿Ya tienes cuenta? <a class="link" href="#/login">Inicia sesión</a></p>
        </form>
      </div></div>`;
  },
  init(_, q) {
    const rol = ROLES[q.rol] ? q.rol : 'cliente';
    const f = document.getElementById('f-reg');
    const pago = document.getElementById('campos-pago');
    formatoTarjeta(f.tnumero); formatoVence(f.tvence);
    /* Flujo alternativo CU-04: al activar "guardar pago" aparecen sus campos y luego el botón de registrarse */
    f.guardarPago.addEventListener('change', () => { pago.hidden = !f.guardarPago.checked; if (!pago.hidden) f.tnumero.focus(); });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const r = { nombre: reglas.requerido, telefono: reglas.telefono, correo: reglas.correo, clave: reglas.clave, direccion: reglas.requerido };
      if (rol !== 'cliente') Object.assign(r, { negocio: reglas.requerido, ruc: reglas.requerido });
      if (f.guardarPago.checked) Object.assign(r, { tnumero: reglas.tarjeta, tvence: reglas.vence, ttitular: reglas.requerido });
      if (!validar(f, r)) return;
      const num = f.tnumero.value.replace(/\D/g, '');
      const res = Store.registrar({
        rol, nombre: f.nombre.value, correo: f.correo.value, clave: f.clave.value, telefono: f.telefono.value, direccion: f.direccion.value,
        negocio: f.negocio?.value, ruc: f.ruc?.value,
        pago: f.guardarPago.checked ? { marca: marcaTarjeta(num), ultimos: num.slice(-4), vence: f.tvence.value, titular: f.ttitular.value.trim() } : null
      });
      if (!res.ok) return modal({   // Flujo de excepción CU-04
        icono: 'user', tono: 'ambar', titulo: 'Esta cuenta ya está registrada',
        texto: 'Ya existe una cuenta con este correo o RUC. Te sugerimos iniciar sesión.',
        botones: [{ texto: 'Iniciar sesión', clase: 'pri', accion: () => { location.hash = '#/login?correo=' + encodeURIComponent(f.correo.value); } }, { texto: 'Cancelar', clase: 'line' }]
      });
      modal({
        icono: 'check', tono: 'verde', titulo: 'Cuenta creada',
        texto: `Tu perfil de ${ROLES[rol].nombre.toLowerCase()} quedó registrado${res.usuario.pago ? ' con tu forma de pago guardada' : ''}.`,
        botones: [{ texto: rol === 'proveedor' ? 'Ir a gestión de mis productos' : 'Ir a la tienda', clase: 'pri', accion: () => { location.hash = rol === 'proveedor' ? '#/proveedor' : '#/'; } }]
      });
    });
  }
};

/* ===================== INICIAR SESIÓN ===================== */
Vistas.login = {
  titulo: 'Iniciar sesión',
  html(_, q) {
    const demo = [['cliente@demo.com', 'Cliente (con tarjeta guardada)'], ['negocio@demo.com', 'Pequeño negocio'], ['proveedor@demo.com', 'Pequeño proveedor'], ['admin@demo.com', 'Administrador']];
    return `<div class="wrap" style="display:flex;justify-content:center;padding-top:40px">
      <div class="stack" style="width:100%;max-width:460px;gap:22px">
        <nav class="seg" aria-label="Cuenta"><a href="#/registro">Registrarse</a><a class="on" href="#/login">Iniciar sesión</a></nav>
        <h1 style="font-size:40px">Bienvenido de nuevo</h1>
        <form id="f-login" class="card stack" style="padding:28px" novalidate>
          <label class="field">Correo electrónico<input name="correo" type="email" autocomplete="email" value="${esc(q.correo || '')}"></label>
          <label class="field">Contraseña<input name="clave" type="password" autocomplete="current-password"></label>
          <div id="login-error" class="notice bad" hidden>${icon('alert', 20)}<span>Correo o contraseña incorrectos.</span></div>
          <button class="btn pri full" type="submit">Entrar</button>
          <p class="small muted" style="text-align:center">¿No tienes cuenta? <a class="link" href="#/registro">Regístrate</a></p>
        </form>
        <section class="card" style="padding:20px">
          <b style="font-weight:600">Cuentas de prueba</b> <span class="small muted">· contraseña 123456</span>
          <div class="stack" style="gap:6px;margin-top:10px">${demo.map(([c, t]) => `<button class="opt" data-demo="${c}" style="padding:10px 14px"><span style="color:var(--green)">${icon('user', 20)}</span><span><b style="display:block;font-weight:600;font-size:15px">${t}</b><span class="small muted">${c}</span></span></button>`).join('')}</div>
        </section>
      </div></div>`;
  },
  init(_, q) {
    const f = document.getElementById('f-login');
    const entrar = () => {
      if (!validar(f, { correo: reglas.correo, clave: reglas.requerido })) return;
      const r = Store.iniciarSesion(f.correo.value, f.clave.value);
      document.getElementById('login-error').hidden = r.ok;
      if (!r.ok) return;
      aviso(`${icon('check', 20)}<span>Hola, ${esc(r.usuario.nombre.split(' ')[0])}</span>`);
      location.hash = q.volver || (r.usuario.rol === 'admin' ? '#/admin' : r.usuario.rol === 'proveedor' ? '#/proveedor' : '#/');
    };
    f.addEventListener('submit', (e) => { e.preventDefault(); entrar(); });
    document.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => { f.correo.value = b.dataset.demo; f.clave.value = '123456'; entrar(); }));
  }
};

/* ===================== MI CUENTA ===================== */
Vistas.cuenta = {
  titulo: 'Mi cuenta',
  html() {
    const u = Store.usuario();
    if (!u) { setTimeout(() => pedirSesion('#/cuenta')); return ''; }
    const pedidos = Store.misPedidos();
    const sol = Store.misSolicitudes();
    return `<div class="wrap" style="padding-top:40px">
      <div class="between" style="flex-wrap:wrap;margin-bottom:24px"><div><h1 style="font-size:40px">Mi cuenta</h1><span class="pill p-green" style="margin-top:8px">${ROLES[u.rol]?.nombre || 'Administrador'}</span></div><button class="btn line sm" id="salir">${icon('logout', 18)}Cerrar sesión</button></div>
      <div class="grid g2" style="align-items:start">
        <section class="card stack" style="padding:24px;gap:10px"><h3>Mis datos</h3>
          ${u.negocio ? `<div class="between"><span class="muted">Negocio</span><span>${esc(u.negocio)}</span></div><div class="between"><span class="muted">RUC</span><span>${esc(u.ruc)}</span></div>` : ''}
          <div class="between"><span class="muted">Nombre</span><span>${esc(u.nombre)}</span></div>
          <div class="between"><span class="muted">Correo</span><span>${esc(u.correo)}</span></div>
          <div class="between"><span class="muted">Teléfono</span><span>${esc(u.telefono)}</span></div>
          <div class="between"><span class="muted">Dirección</span><span style="text-align:right">${esc(u.direccion)}</span></div></section>
        <section class="card stack" style="padding:24px;gap:10px"><h3>Forma de pago guardada</h3>
          ${u.pago ? `<div class="between"><span class="row">${icon('card', 22)}${esc(u.pago.marca)} •••• ${esc(u.pago.ultimos)}</span><span class="muted small">Vence ${esc(u.pago.vence)}</span></div><button class="link" id="quitar-pago" style="align-self:flex-start">Quitar tarjeta</button>`
            : '<p class="muted">No tienes una tarjeta guardada. Puedes guardarla al pagar.</p>'}</section>
      </div>
      <section class="sec"><h2 style="margin-bottom:16px">Mis pedidos</h2>
        ${pedidos.length ? `<div class="card scroll"><table class="list"><thead><tr><th>Pedido</th><th>Fecha</th><th>Estado</th><th class="num">Total</th><th></th></tr></thead><tbody>
          ${pedidos.map((p) => `<tr><td><b>${p.id}</b></td><td>${fechaLarga(p.fecha)}</td><td><span class="pill p-green">${p.estado}</span></td><td class="num">${dinero(p.total)}</td><td class="num"><a class="link" href="#/factura/${p.id}">Ver factura</a></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">Todavía no tienes pedidos.</p>'}</section>
      ${Store.esNegocio(u) ? `<section class="sec"><h2 style="margin-bottom:16px">Mis solicitudes al por mayor</h2>
        ${sol.length ? `<div class="card scroll"><table class="list"><thead><tr><th>Solicitud</th><th>Producto</th><th class="num">Unidades</th><th class="num">Total</th><th>Estado</th></tr></thead><tbody>
          ${sol.map((s) => `<tr><td><b>${s.id}</b><div class="small muted">${fechaLarga(s.fecha)}</div></td><td>${esc(s.producto)}</td><td class="num">${s.cantidad}</td><td class="num">${dinero(s.total)}</td><td><span class="pill ${s.estado === 'Aprobada' ? 'p-green' : s.estado === 'Rechazada' ? 'p-red' : 'p-amber'}">${s.estado}</span></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">Todavía no tienes solicitudes. Entra al detalle de un producto y elige "Compra al por mayor".</p>'}</section>` : ''}
    </div>`;
  },
  init() {
    document.getElementById('salir')?.addEventListener('click', () => { Store.cerrarSesion(); location.hash = '#/'; aviso('Cerraste sesión'); });
    document.getElementById('quitar-pago')?.addEventListener('click', () => { Store.quitarPagoGuardado(); App.render(); aviso('Tarjeta eliminada'); });
  }
};

/* ===================== GESTIÓN DE MIS PRODUCTOS (RF-08, RF-13, CU-05) ===================== */
Vistas.proveedor = {
  titulo: 'Gestión de mis productos',
  html() {
    const u = Store.usuario();
    // CU-05 paso 2: el sistema verifica el rol. Flujo de excepción: acceso denegado.
    if (!u || u.rol !== 'proveedor') return `<div class="wrap stack" style="align-items:center;text-align:center;padding-top:72px;gap:14px;max-width:560px">
      <div style="width:80px;height:80px;border-radius:999px;background:var(--red-soft);color:var(--red);display:flex;align-items:center;justify-content:center">${icon('lock', 38)}</div>
      <h1 style="font-size:40px">Acceso denegado</h1>
      <p class="lead">Solo las cuentas de <b>pequeño proveedor</b> pueden publicar productos en Huellitas.${u ? ` Tu cuenta es de tipo ${(ROLES[u.rol]?.nombre || 'administrador').toLowerCase()}.` : ''}</p>
      <div class="row" style="flex-wrap:wrap;justify-content:center">${u ? '' : '<a class="btn line" href="#/login?volver=%23%2Fproveedor">Iniciar sesión</a>'}<a class="btn pri" href="#/registro?rol=proveedor">Registrarme como proveedor</a></div>
    </div>`;
    const mios = Store.misProductos();
    return `<div class="wrap" style="padding-top:40px">
      <div class="between" style="flex-wrap:wrap;margin-bottom:24px"><div><h1 style="font-size:40px">Gestión de mis productos</h1><p class="muted">${esc(u.negocio || u.nombre)} · Pequeño proveedor</p></div>
        <button class="btn soft" id="nuevo">${icon('plus', 18)}Subir nuevo artículo</button></div>
      <div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">
        <form id="f-prod" class="card form" style="flex:1.4 1 440px;padding:28px" novalidate hidden>
          <div class="between span2"><h3 id="titulo-form">Subir nuevo artículo</h3><button type="button" class="iconbtn" id="cerrar-form" aria-label="Cerrar formulario">${icon('close', 20)}</button></div>
          <div id="aviso-repetido" class="notice info span2" hidden>${icon('info', 20)}<span>Llenamos los datos anteriores del producto. Solo escribe la <b>cantidad</b> que vas a agregar.</span></div>
          <input type="hidden" name="existente">
          <label class="field span2">Nombre del producto<input name="nombre" placeholder="Ej. Cama acolchada mediana"></label>
          <label class="field span2">Descripción<textarea name="descripcion" placeholder="Materiales, medidas y para qué mascota es."></textarea></label>
          <label class="field">Precio (USD)<input name="precio" inputmode="decimal" placeholder="0.00"></label>
          <label class="field">Cantidad<input name="cantidad" inputmode="numeric" placeholder="0"></label>
          <label class="field">Especie<select name="especie">${CATEGORIAS.especies.map((e) => `<option value="${e.id}">${e.nombre}</option>`).join('')}</select></label>
          <label class="field">Necesidad<select name="necesidad">${CATEGORIAS.necesidades.map((n) => `<option value="${n.id}">${n.nombre}</option>`).join('')}</select></label>
          <div class="span2 stack" style="gap:8px">
            <label class="drop" id="drop" tabindex="0">${icon('upload', 28)}<b>Adjunta fotografías</b><span class="small muted">Arrastra aquí o haz clic · JPG o PNG · hasta 4</span>
              <input type="file" name="fotos" accept="image/*" multiple class="sr-only"></label>
            <div class="previews" id="previews"></div>
          </div>
          <button class="btn pri full span2" type="submit" id="publicar">Publicar</button>
        </form>
        <section class="card" style="flex:1 1 340px;padding:24px">
          <div class="between" style="margin-bottom:6px"><h3>Mis artículos publicados</h3><span class="muted small">${mios.length}</span></div>
          ${mios.length ? mios.map((p, i) => `<a class="row" href="#/producto/${p.id}" style="padding:12px 0;${i < mios.length - 1 ? 'border-bottom:1px solid var(--line)' : ''}">
            <div class="thumb ${p.tinte}" style="width:52px;height:52px">${imagenProducto(p, 40)}</div>
            <div style="flex:1"><div style="font-weight:600;font-size:15px">${esc(p.nombre)}</div><div class="small muted">${p.estado === 'pronto' ? 'Llega el ' + fechaCorta(p.llegada) : p.stock + ' en stock'}</div></div><b>${dinero(p.precio)}</b></a>`).join('')
            : '<p class="muted">Aún no publicas artículos.</p>'}
          <p class="small muted" style="margin-top:12px">Huellitas cobra una comisión por cada venta.</p>
        </section>
      </div></div>`;
  },
  init() {
    const f = document.getElementById('f-prod');
    if (!f) return;
    let fotos = [];
    const prev = document.getElementById('previews');
    const pintarFotos = () => { prev.innerHTML = fotos.map((s) => `<img src="${s}" alt="Vista previa">`).join(''); };
    const abrir = () => { f.hidden = false; f.nombre.focus(); };
    const reiniciarForm = () => {
      f.reset(); f.existente.value = ''; fotos = []; pintarFotos();
      document.getElementById('aviso-repetido').hidden = true;
      document.getElementById('titulo-form').textContent = 'Subir nuevo artículo';
      document.getElementById('publicar').textContent = 'Publicar';
      f.nombre.readOnly = false;
    };
    document.getElementById('nuevo').addEventListener('click', () => { reiniciarForm(); abrir(); });
    document.getElementById('cerrar-form').addEventListener('click', () => { f.hidden = true; });

    async function agregarFotos(archivos) {
      const lista = [...archivos].filter((a) => a.type.startsWith('image/')).slice(0, 4 - fotos.length);
      for (const a of lista) { try { fotos.push(await comprimirImagen(a)); } catch (e) { /* imagen no válida */ } }
      pintarFotos();
    }
    const drop = document.getElementById('drop');
    f.fotos.addEventListener('change', () => agregarFotos(f.fotos.files));
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => agregarFotos(e.dataTransfer.files));

    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validar(f, { nombre: reglas.requerido, descripcion: reglas.requerido, precio: reglas.precio, cantidad: reglas.entero })) return;
      const datos = { nombre: f.nombre.value, descripcion: f.descripcion.value, precio: f.precio.value, cantidad: f.cantidad.value, especie: f.especie.value, necesidad: f.necesidad.value, fotos };
      const listo = (p, texto) => {
        reiniciarForm(); f.hidden = true; App.render();
        modal({ icono: 'check', tono: 'verde', titulo: 'Artículo publicado', texto, botones: [{ texto: 'Ver en la tienda', clase: 'pri', accion: () => { location.hash = '#/producto/' + p.id; } }, { texto: 'Seguir publicando', clase: 'line' }] });
      };
      if (f.existente.value) {
        const r = Store.reabastecer(f.existente.value, datos);
        if (r.ok) listo(r.producto, `Agregaste ${datos.cantidad} unidades. Ahora hay ${r.producto.stock} disponibles en la tienda.`);
        return;
      }
      // Flujo alternativo CU-05: el artículo ya existe
      const repetido = Store.productoRepetido(datos.nombre);
      if (repetido) return modal({
        icono: 'info', tono: 'verde', titulo: '¿Desea agregar nuevamente este producto?',
        texto: `“${esc(repetido.nombre)}” ya está en el sistema. Llenaremos los datos anteriores, excepto la cantidad.`,
        botones: [{ texto: 'Sí, agregar', clase: 'pri', accion: () => {
          f.existente.value = repetido.id;
          f.nombre.value = repetido.nombre; f.nombre.readOnly = true;
          f.descripcion.value = repetido.descripcion; f.precio.value = repetido.precio.toFixed(2);
          f.especie.value = repetido.especie; f.necesidad.value = repetido.necesidad;
          f.cantidad.value = ''; fotos = repetido.fotos ? [...repetido.fotos] : []; pintarFotos();
          document.getElementById('aviso-repetido').hidden = false;
          document.getElementById('titulo-form').textContent = 'Agregar nuevamente';
          document.getElementById('publicar').textContent = 'Agregar unidades';
          f.cantidad.focus();
        } }, { texto: 'Cancelar', clase: 'line' }]
      });
      const r = Store.publicar(datos);
      if (r.ok) listo(r.producto, 'Tu producto ya está visible en el buscador y en los carruseles de la tienda.');
    });
  }
};

/* ===================== AL POR MAYOR (RF-09, RF-12, CU-06) ===================== */
Vistas.mayoreo = {
  titulo: 'Compra al por mayor',
  html([pid]) {
    const p = Store.producto(pid);
    if (!p || !p.mayoreo) return Vistas.noEncontrado.html();
    const u = Store.usuario();
    if (!u) { setTimeout(() => pedirSesion('#/mayoreo/' + pid)); return ''; }
    const bloqueado = !Store.esNegocio(u);   // CU-06 paso 2 y flujo de excepción
    const tiers = [[20, 49], [50, 99], [100, null]];
    return `<div class="wrap" style="padding-top:36px">
      <p class="small muted" style="margin-bottom:8px"><a href="#/producto/${p.id}">‹ Volver al producto</a></p>
      <span class="pill ${bloqueado ? 'p-red' : 'p-sand'}">${icon('store', 14)}Cuenta: ${ROLES[u.rol]?.nombre || 'Administrador'}</span>
      <h1 style="font-size:40px;margin:10px 0 24px">Solicitud de compra al por mayor</h1>
      ${bloqueado ? `<div class="notice bad" style="margin-bottom:20px">${icon('lock', 20)}<span><b>Opción bloqueada.</b> Las compras al por mayor son exclusivas para grandes y pequeños negocios. <a class="link" href="#/registro?rol=pequeno_negocio">Registrar un negocio</a></span></div>` : ''}
      <div style="display:flex;flex-wrap:wrap;gap:28px">
        <section class="card stack" style="flex:1 1 340px;padding:24px;align-self:flex-start">
          <div class="row"><div class="thumb ${p.tinte}" style="width:88px;height:88px">${imagenProducto(p, 64)}</div><div><div class="pname">${esc(p.nombre)}</div><div class="small muted">Precio regular ${dinero(p.precio)} · ${p.stockMayoreo} unidades para mayoreo</div></div></div>
          <div class="hr"></div><h3>Tarifas especiales</h3>
          ${tiers.map(([a, b]) => `<div class="between tier" data-min="${a}" style="padding:12px 14px;border-radius:12px;border:1px solid var(--line)"><span>${b ? `${a} a ${b}` : `${a} o más`} unidades</span><b>${dinero(Store.tarifa(p.precio, a))} c/u</b></div>`).join('')}
        </section>
        <form id="f-may" class="card stack" style="flex:999 1 460px;padding:28px" novalidate>
          <label class="field">Cantidad de unidades deseadas<input name="cantidad" inputmode="numeric" value="50" ${bloqueado ? 'disabled' : ''}></label>
          <p class="small muted" style="margin-top:-8px">Mínimo ${Store.MINIMO_MAYOREO} y máximo ${p.stockMayoreo} unidades.</p>
          <div class="between" style="background:var(--green-tint);border-radius:16px;padding:20px"><span>Total estimado</span><b style="font-size:28px" id="total-may">—</b></div>
          <label class="field">Notas para el pedido (opcional)<textarea name="notas" placeholder="Fecha deseada, dirección de bodega, etc." ${bloqueado ? 'disabled' : ''}></textarea></label>
          <button class="btn pri full" type="submit" ${bloqueado ? 'disabled' : ''}>Confirmar solicitud</button>
          <p class="row small muted">${icon('info', 16)}El sistema aplica la tarifa especial y el equipo de Huellitas verifica y aprueba el pedido.</p>
        </form>
      </div></div>`;
  },
  init([pid]) {
    const f = document.getElementById('f-may');
    if (!f) return;
    const p = Store.producto(pid);
    const total = document.getElementById('total-may');
    const recalcular = () => {
      const n = parseInt(f.cantidad.value, 10) || 0;
      total.textContent = n >= Store.MINIMO_MAYOREO ? dinero(Store.tarifa(p.precio, n) * n) : '—';
      document.querySelectorAll('.tier').forEach((t, i, a) => {
        const min = +t.dataset.min, sig = a[i + 1] ? +a[i + 1].dataset.min : Infinity;
        const on = n >= min && n < sig;
        t.style.background = on ? 'var(--green-tint)' : '';
        t.style.borderColor = on ? 'var(--green)' : 'var(--line)';
      });
    };
    f.cantidad.addEventListener('input', recalcular);
    recalcular();
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validar(f, { cantidad: (v) => {
        const n = +v;
        if (!/^\d+$/.test(v)) return 'Escribe un número entero.';
        if (n < Store.MINIMO_MAYOREO) return `El mínimo es ${Store.MINIMO_MAYOREO} unidades.`;
        if (n > p.stockMayoreo) return `Solo hay ${p.stockMayoreo} unidades disponibles para mayoreo.`;
        return '';
      } })) return;
      const r = Store.solicitarMayoreo(p.id, +f.cantidad.value, f.notas.value);
      if (!r.ok) return modal({ icono: 'store', tono: 'ambar', titulo: 'Exclusivo para negocios', texto: 'Las compras al por mayor son exclusivas para grandes y pequeños negocios.' });
      modal({
        icono: 'check', tono: 'verde', titulo: 'Solicitud en proceso',
        texto: `Registramos tu pedido ${r.solicitud.id} de ${r.solicitud.cantidad} unidades por ${dinero(r.solicitud.total)}. Te avisaremos cuando sea aprobado.`,
        botones: [{ texto: 'Ver mis solicitudes', clase: 'pri', accion: () => { location.hash = '#/cuenta'; } }, { texto: 'Volver a la tienda', clase: 'line', accion: () => { location.hash = '#/'; } }]
      });
    });
  }
};

/* ===================== ADMINISTRADOR ===================== */
Vistas.admin = {
  titulo: 'Administración',
  html() {
    const u = Store.usuario();
    if (!u || u.rol !== 'admin') return `<div class="wrap stack" style="align-items:center;text-align:center;padding-top:72px;gap:14px"><span style="color:var(--red)">${icon('lock', 40)}</span><h1 style="font-size:40px">Acceso denegado</h1><p class="lead">Esta sección es solo para el administrador.</p><a class="btn pri" href="#/login?volver=%23%2Fadmin">Iniciar sesión</a></div>`;
    const sol = Store.todasSolicitudes();
    const ped = Store.todosPedidos();
    const ventas = ped.reduce((s, p) => s + p.total, 0);
    const bajo = Store.productos().filter((p) => p.estado === 'stock' && p.stock <= 5);
    return `<div class="wrap" style="padding-top:40px">
      <h1 style="font-size:40px;margin-bottom:24px">Panel de administración</h1>
      <div class="grid g3" style="margin-bottom:8px">
        <div class="card" style="padding:20px"><span class="muted small">Ventas pagadas</span><div style="font-size:30px;font-weight:700">${dinero(ventas)}</div><span class="small muted">${ped.length} pedidos</span></div>
        <div class="card" style="padding:20px"><span class="muted small">Solicitudes al por mayor en proceso</span><div style="font-size:30px;font-weight:700">${sol.filter((s) => s.estado === 'En proceso').length}</div><span class="small muted">de ${sol.length} en total</span></div>
        <div class="card" style="padding:20px"><span class="muted small">Productos con poco stock (5 o menos)</span><div style="font-size:30px;font-weight:700">${bajo.length}</div><span class="small muted">${bajo.map((p) => esc(p.nombre)).join(', ') || 'Ninguno'}</span></div>
      </div>
      <section class="sec"><h2 style="margin-bottom:16px">Solicitudes al por mayor</h2>
        ${sol.length ? `<div class="card scroll"><table class="list"><thead><tr><th>Solicitud</th><th>Negocio</th><th>Producto</th><th class="num">Unidades</th><th class="num">Total</th><th>Estado</th><th></th></tr></thead><tbody>
          ${sol.map((s) => `<tr><td><b>${s.id}</b><div class="small muted">${fechaLarga(s.fecha)}</div></td><td>${esc(s.cliente)}</td><td>${esc(s.producto)}${s.notas ? `<div class="small muted">${esc(s.notas)}</div>` : ''}</td><td class="num">${s.cantidad}</td><td class="num">${dinero(s.total)}</td>
            <td><span class="pill ${s.estado === 'Aprobada' ? 'p-green' : s.estado === 'Rechazada' ? 'p-red' : 'p-amber'}">${s.estado}</span></td>
            <td class="num">${s.estado === 'En proceso' ? `<button class="btn pri sm" data-aprobar="${s.id}">Aprobar</button> <button class="btn line sm" data-rechazar="${s.id}">Rechazar</button>` : ''}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">No hay solicitudes todavía.</p>'}</section>
      <section class="sec"><h2 style="margin-bottom:16px">Pedidos pagados</h2>
        ${ped.length ? `<div class="card scroll"><table class="list"><thead><tr><th>Pedido</th><th>Fecha</th><th>Método</th><th class="num">Total</th><th></th></tr></thead><tbody>
          ${ped.map((p) => `<tr><td><b>${p.id}</b></td><td>${fechaLarga(p.fecha)}</td><td>${esc(p.metodo)}</td><td class="num">${dinero(p.total)}</td><td class="num"><a class="link" href="#/factura/${p.id}">Factura</a></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">No hay pedidos todavía.</p>'}</section>
    </div>`;
  },
  init() {
    document.querySelectorAll('[data-aprobar]').forEach((b) => b.addEventListener('click', () => { Store.decidirSolicitud(b.dataset.aprobar, 'Aprobada'); App.render(); aviso('Solicitud aprobada'); }));
    document.querySelectorAll('[data-rechazar]').forEach((b) => b.addEventListener('click', () => { Store.decidirSolicitud(b.dataset.rechazar, 'Rechazada'); App.render(); aviso('Solicitud rechazada'); }));
  }
};

/* ===================== 404 ===================== */
Vistas.noEncontrado = {
  titulo: 'No encontrado',
  html() {
    return `<div class="wrap"><div class="empty" style="margin-top:56px"><h2>No encontramos esta página</h2><p class="muted">Puede que el enlace esté mal escrito o el producto ya no exista.</p><a class="btn pri" href="#/">Volver al inicio</a></div></div>`;
  }
};
