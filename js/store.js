/* =========================================================
   Lógica de la tienda: guarda y lee todo en localStorage.
   Aquí viven las reglas de negocio de los requisitos (RF)
   y de los casos de uso (CU) del documento.
   ========================================================= */

const Store = (() => {
  const KEY = 'huellitas_v4';
  let db;

  function nuevo() {
    return {
      productos: JSON.parse(JSON.stringify(PRODUCTOS_INICIALES)),
      usuarios: JSON.parse(JSON.stringify(USUARIOS_INICIALES)),
      carrito: [],          // [{ id, cantidad }]
      pedidos: [],          // pedidos pagados (CU-03)
      solicitudes: [],      // solicitudes al por mayor (CU-06)
      sesion: null,         // id del usuario conectado
      contador: 245         // número de factura
    };
  }

  function cargar() {
    try {
      const guardado = localStorage.getItem(KEY);
      db = guardado ? JSON.parse(guardado) : nuevo();
    } catch (e) {
      db = nuevo();
    }
  }

  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.warn('No se pudo guardar en localStorage', e); }
    document.dispatchEvent(new CustomEvent('store:cambio'));
  }

  function reiniciar() { db = nuevo(); guardar(); }

  const id = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const redondear = (n) => Math.round(n * 100) / 100;

  /* ---------------- Productos ---------------- */
  const productos = () => db.productos;
  const producto = (pid) => db.productos.find((p) => p.id === pid);
  const disponibles = () => db.productos.filter((p) => p.estado === 'stock' && p.stock > 0);   // RF-01
  const proximos = () => db.productos.filter((p) => p.estado === 'pronto')
    .sort((a, b) => a.llegada.localeCompare(b.llegada));                                     // RF-02

  /* Búsqueda y filtros (CU-01) */
  const normal = (t) => (t || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function buscar({ q = '', especie = '', necesidad = '', disp = '', orden = 'relevancia' } = {}) {
    const palabras = normal(q).split(/\s+/).filter(Boolean);
    let lista = db.productos.filter((p) => {
      const texto = normal(`${p.nombre} ${p.descripcion} ${p.especie} ${p.necesidad} ${p.vendedor}`);
      if (palabras.some((w) => !texto.includes(w))) return false;
      if (especie && p.especie !== especie) return false;
      if (necesidad && p.necesidad !== necesidad) return false;
      if (disp === 'stock' && !(p.estado === 'stock' && p.stock > 0)) return false;
      if (disp === 'pronto' && p.estado !== 'pronto') return false;
      return true;
    });
    if (orden === 'menor') lista.sort((a, b) => a.precio - b.precio);
    if (orden === 'mayor') lista.sort((a, b) => b.precio - a.precio);
    if (orden === 'nombre') lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return lista;
  }

  /* Asistente de escritura del buscador (RF-06):
     sugiere productos mientras escribes y corrige errores de tipeo. */
  function distancia(a, b) {
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return m[a.length][b.length];
  }

  function sugerencias(q, max = 6) {
    const t = normal(q).trim();
    if (!t) return { productos: [], correccion: null };
    const empieza = [], contiene = [];
    db.productos.forEach((p) => {
      const n = normal(p.nombre);
      if (n.startsWith(t) || n.split(' ').some((w) => w.startsWith(t))) empieza.push(p);
      else if (n.includes(t)) contiene.push(p);
    });
    const lista = [...empieza, ...contiene].slice(0, max);
    let correccion = null;
    if (!lista.length && t.length >= 3) {
      // Busca la palabra del catálogo más parecida a lo que escribió
      const vocab = new Set();
      db.productos.forEach((p) => normal(p.nombre).split(/\s+/).forEach((w) => w.length > 3 && vocab.add(w)));
      let mejor = null, d = 99;
      vocab.forEach((w) => {
        const dist = distancia(t, w.slice(0, Math.max(t.length, 4)));
        if (dist < d) { d = dist; mejor = w; }
      });
      if (mejor && d <= 2) correccion = mejor;
    }
    return { productos: lista, correccion };
  }

  /* ---------------- Sesión y registro (RF-10, RF-11, CU-04) ---------------- */
  const usuario = () => db.usuarios.find((u) => u.id === db.sesion) || null;
  const esNegocio = (u) => !!u && (u.rol === 'pequeno_negocio' || u.rol === 'empresa');

  function registrar(datos) {
    const correo = normal(datos.correo).trim();
    // Flujo de excepción CU-04: los datos ya existen
    const repetido = db.usuarios.find((u) => normal(u.correo) === correo ||
      (datos.ruc && u.ruc && normal(u.ruc) === normal(datos.ruc)));
    if (repetido) return { ok: false, error: 'existe' };
    const nuevoUsuario = {
      id: id('u'), rol: datos.rol, nombre: datos.nombre.trim(), correo: datos.correo.trim(), clave: datos.clave,
      telefono: datos.telefono.trim(), direccion: datos.direccion.trim(),
      negocio: datos.negocio ? datos.negocio.trim() : '', ruc: datos.ruc ? datos.ruc.trim() : '',
      pago: datos.pago || null  // solo se guardan los últimos 4 dígitos, nunca el número completo ni el CVV
    };
    db.usuarios.push(nuevoUsuario);
    db.sesion = nuevoUsuario.id;
    guardar();
    return { ok: true, usuario: nuevoUsuario };
  }

  function iniciarSesion(correo, clave) {
    const u = db.usuarios.find((x) => normal(x.correo) === normal(correo).trim());
    if (!u || u.clave !== clave) return { ok: false };
    db.sesion = u.id;
    guardar();
    return { ok: true, usuario: u };
  }

  function cerrarSesion() { db.sesion = null; guardar(); }

  /* Editar perfil: revisa que el correo o RUC nuevo no sea de otra cuenta */
  function actualizarPerfil(datos) {
    const u = usuario();
    if (!u) return { ok: false };
    const correo = normal(datos.correo).trim();
    const otro = db.usuarios.find((x) => x.id !== u.id && (normal(x.correo) === correo ||
      (datos.ruc && x.ruc && normal(x.ruc) === normal(datos.ruc))));
    if (otro) return { ok: false, error: 'existe' };
    ['nombre', 'correo', 'telefono', 'direccion', 'negocio', 'ruc'].forEach((k) => {
      if (datos[k] !== undefined) u[k] = datos[k].trim();
    });
    // El nombre del negocio también aparece como vendedor en sus productos
    if (u.rol === 'proveedor') db.productos.filter((p) => p.vendedorId === u.id).forEach((p) => { p.vendedor = u.negocio || u.nombre; });
    guardar();
    return { ok: true };
  }

  function cambiarClave(actual, nueva) {
    const u = usuario();
    if (!u || u.clave !== actual) return { ok: false };
    u.clave = nueva;
    guardar();
    return { ok: true };
  }

  /* Recuperar contraseña (modo de prueba: sin servidor de correo, el código se muestra en pantalla).
     El código vive solo en memoria: vence en 10 minutos y permite 5 intentos. */
  let recuperacion = null;
  function iniciarRecuperacion(correo) {
    const u = db.usuarios.find((x) => normal(x.correo) === normal(correo).trim());
    if (!u) return { ok: false };
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    recuperacion = { id: u.id, codigo, vence: Date.now() + 10 * 60 * 1000, intentos: 0 };
    return { ok: true, codigo };
  }
  function restablecerClave(codigo, nueva) {
    if (!recuperacion) return { ok: false, error: 'sin-codigo' };
    if (Date.now() > recuperacion.vence) { recuperacion = null; return { ok: false, error: 'vencido' }; }
    if (recuperacion.codigo !== codigo.trim()) {
      recuperacion.intentos += 1;
      const quedan = 5 - recuperacion.intentos;
      if (quedan <= 0) { recuperacion = null; return { ok: false, error: 'intentos' }; }
      return { ok: false, error: 'codigo', quedan };
    }
    const u = db.usuarios.find((x) => x.id === recuperacion.id);
    u.clave = nueva;
    recuperacion = null;
    guardar();
    return { ok: true, correo: u.correo };
  }

  function guardarPago(resumen) {
    const u = usuario();
    if (u) { u.pago = resumen; guardar(); }
  }

  function quitarPagoGuardado() {
    const u = usuario();
    if (u) { u.pago = null; guardar(); }
  }

  /* ---------------- Carrito (RF-03, RF-04, CU-02) ---------------- */
  const carrito = () => db.carrito.map((l) => ({ ...l, producto: producto(l.id) })).filter((l) => l.producto);
  const cantidadCarrito = () => db.carrito.reduce((s, l) => s + l.cantidad, 0);

  function agregar(pid, cantidad = 1) {
    const p = producto(pid);
    if (!p || p.estado !== 'stock') return { ok: false, error: 'no-disponible' };
    const linea = db.carrito.find((l) => l.id === pid);
    const total = (linea ? linea.cantidad : 0) + cantidad;
    // Paso 2 y flujo alternativo 2.1: validar el stock disponible
    if (total > p.stock) return { ok: false, error: 'stock', maximo: p.stock, enCarrito: linea ? linea.cantidad : 0 };
    if (linea) linea.cantidad = total; else db.carrito.push({ id: pid, cantidad });
    guardar();
    return { ok: true };
  }

  function cambiarCantidad(pid, cantidad) {
    const p = producto(pid);
    const linea = db.carrito.find((l) => l.id === pid);
    if (!p || !linea) return { ok: false };
    if (cantidad > p.stock) return { ok: false, error: 'stock', maximo: p.stock };
    if (cantidad < 1) return eliminar(pid);
    linea.cantidad = cantidad;
    guardar();
    return { ok: true };
  }

  function eliminar(pid) {
    db.carrito = db.carrito.filter((l) => l.id !== pid);
    guardar();
    return { ok: true };
  }

  /* Totales recalculados automáticamente (CU-02 paso 7) */
  function totales(lineas = carrito()) {
    const subtotal = redondear(lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0));
    const envio = subtotal === 0 || subtotal >= 40 ? 0 : 3.5;
    const impuesto = redondear(subtotal * 0.07);
    return { subtotal, envio, impuesto, total: redondear(subtotal + envio + impuesto) };
  }

  /* ---------------- Pago (RF-07, CU-03) ---------------- */
  /* Simula la pasarela de pago. Tarjeta de prueba que se rechaza: termina en 0002. */
  function pasarela(metodo, datos) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (metodo === 'tarjeta' && datos.numero.replace(/\D/g, '').endsWith('0002')) resolve({ aprobado: false });
        else resolve({ aprobado: true, autorizacion: Math.random().toString(36).slice(2, 10).toUpperCase() });
      }, 1200);
    });
  }

  async function pagar({ metodo, datos, entrega, guardarTarjeta }) {
    const u = usuario();
    const lineas = carrito();
    if (!u || !lineas.length) return { ok: false, error: 'vacio' };
    // Revisión final de stock antes de cobrar
    const sinStock = lineas.find((l) => l.cantidad > l.producto.stock);
    if (sinStock) return { ok: false, error: 'stock', producto: sinStock.producto };

    const r = await pasarela(metodo, datos);
    if (!r.aprobado) return { ok: false, error: 'rechazado' };   // Flujo de excepción CU-03

    const t = totales(lineas);
    db.contador += 1;
    const pedido = {
      id: 'HU-' + String(db.contador).padStart(6, '0'),
      usuarioId: u.id, fecha: new Date().toISOString(), estado: 'Pagado',
      items: lineas.map((l) => ({ id: l.id, nombre: l.producto.nombre, precio: l.producto.precio, cantidad: l.cantidad })),
      ...t, metodo: datos.etiqueta, entrega, autorizacion: r.autorizacion
    };
    // Postcondición: se actualizan los productos disponibles
    lineas.forEach((l) => { l.producto.stock -= l.cantidad; });
    if (guardarTarjeta && metodo === 'tarjeta') u.pago = datos.resumen;
    db.pedidos.unshift(pedido);
    db.carrito = [];
    guardar();
    return { ok: true, pedido };
  }

  const pedido = (pid) => db.pedidos.find((p) => p.id === pid);
  const misPedidos = () => db.pedidos.filter((p) => p.usuarioId === db.sesion);

  /* ---------------- Proveedores (RF-08, RF-13, CU-05) ---------------- */
  const misProductos = () => db.productos.filter((p) => p.vendedorId === db.sesion);
  const productoRepetido = (nombre) => misProductos().find((p) => normal(p.nombre).trim() === normal(nombre).trim());

  function publicar(datos) {
    const u = usuario();
    if (!u || u.rol !== 'proveedor') return { ok: false, error: 'acceso' };   // Flujo de excepción
    const tintes = ['t1', 't2', 't3', 't4'];
    const nuevoProducto = {
      id: id('p'), nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(), precio: redondear(+datos.precio),
      stock: +datos.cantidad, especie: datos.especie, necesidad: datos.necesidad, arte: 'box',
      tinte: tintes[db.productos.length % 4], estado: 'stock', mayoreo: false,
      vendedor: u.negocio || u.nombre, vendedorId: u.id, material: '', medidas: '', fotos: datos.fotos || []
    };
    db.productos.unshift(nuevoProducto);
    guardar();
    return { ok: true, producto: nuevoProducto };
  }

  /* Flujo alternativo CU-05: volver a agregar un producto existente (solo cambia la cantidad) */
  function reabastecer(pid, datos) {
    const p = producto(pid);
    const u = usuario();
    if (!p || !u || p.vendedorId !== u.id) return { ok: false };
    p.descripcion = datos.descripcion.trim();
    p.precio = redondear(+datos.precio);
    p.especie = datos.especie;
    p.necesidad = datos.necesidad;
    if (datos.fotos && datos.fotos.length) p.fotos = datos.fotos;
    p.stock += +datos.cantidad;
    p.estado = 'stock';
    guardar();
    return { ok: true, producto: p };
  }

  /* ---------------- Al por mayor (RF-09, RF-12, CU-06) ---------------- */
  const MINIMO_MAYOREO = 20;
  function tarifa(precio, cantidad) {
    const descuento = cantidad >= 100 ? 0.20 : cantidad >= 50 ? 0.15 : 0.10;
    return redondear(precio * (1 - descuento));
  }

  function solicitarMayoreo(pid, cantidad, notas) {
    const u = usuario();
    const p = producto(pid);
    if (!esNegocio(u)) return { ok: false, error: 'rol' };            // Flujo de excepción
    if (!p || !p.mayoreo) return { ok: false, error: 'sin-mayoreo' };
    if (cantidad < MINIMO_MAYOREO) return { ok: false, error: 'minimo' };
    if (cantidad > p.stockMayoreo) return { ok: false, error: 'cantidad', maximo: p.stockMayoreo };
    const unitario = tarifa(p.precio, cantidad);
    const s = {
      id: 'SM-' + Date.now().toString().slice(-6), usuarioId: u.id, cliente: u.negocio || u.nombre,
      productoId: p.id, producto: p.nombre, cantidad, unitario, total: redondear(unitario * cantidad),
      notas: notas.trim(), fecha: new Date().toISOString(), estado: 'En proceso'
    };
    db.solicitudes.unshift(s);
    guardar();
    return { ok: true, solicitud: s };
  }

  const misSolicitudes = () => db.solicitudes.filter((s) => s.usuarioId === db.sesion);

  /* ---------------- Administrador ---------------- */
  const todosPedidos = () => db.pedidos;
  const todasSolicitudes = () => db.solicitudes;
  function decidirSolicitud(sid, estado) {
    const s = db.solicitudes.find((x) => x.id === sid);
    if (!s || usuario()?.rol !== 'admin') return;
    if (estado === 'Aprobada' && s.estado !== 'Aprobada') {
      const p = producto(s.productoId);
      if (p) p.stockMayoreo = Math.max(0, p.stockMayoreo - s.cantidad);
    }
    s.estado = estado;
    guardar();
  }

  cargar();
  return {
    reiniciar, productos, producto, disponibles, proximos, buscar, sugerencias, normal,
    usuario, esNegocio, registrar, iniciarSesion, cerrarSesion, quitarPagoGuardado, actualizarPerfil, cambiarClave, guardarPago, iniciarRecuperacion, restablecerClave,
    carrito, cantidadCarrito, agregar, cambiarCantidad, eliminar, totales, pagar, pedido, misPedidos,
    misProductos, productoRepetido, publicar, reabastecer,
    MINIMO_MAYOREO, tarifa, solicitarMayoreo, misSolicitudes,
    todosPedidos, todasSolicitudes, decidirSolicitud
  };
})();
