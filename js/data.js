/* =========================================================
   Datos iniciales de la tienda (productos y cuentas de prueba).
   Se cargan la primera vez; después todo se guarda en el
   navegador (localStorage). Para empezar de cero: botón
   "Reiniciar datos de prueba" en el pie de página.
   ========================================================= */

const CATEGORIAS = {
  especies: [
    { id: 'perros', nombre: 'Perros', icono: 'dog', tinte: 't1' },
    { id: 'gatos', nombre: 'Gatos', icono: 'cat', tinte: 't2' },
    { id: 'otras', nombre: 'Otras especies', icono: 'fish', tinte: 't3' }
  ],
  necesidades: [
    { id: 'recreacion', nombre: 'Recreación' },
    { id: 'cuidado', nombre: 'Cuidado diario' },
    { id: 'paseo', nombre: 'Paseo' }
  ]
};

const ROLES = {
  cliente: { nombre: 'Cliente', icono: 'user', desc: 'Compro artículos para mis mascotas.' },
  pequeno_negocio: { nombre: 'Pequeño negocio', icono: 'store', desc: 'Compro para mi tienda o veterinaria, también al por mayor.' },
  empresa: { nombre: 'Empresa', icono: 'building', desc: 'Hago pedidos grandes al por mayor.' },
  proveedor: { nombre: 'Pequeño proveedor', icono: 'box', desc: 'Publico y vendo mis productos a cambio de una comisión.' }
};

/* Fechas de llegada relativas a hoy, para que siempre sean futuras */
function enDias(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/* Fotos gratuitas de Unsplash (unsplash.com/license).
   Para cambiar una foto: busca otra en unsplash.com, ábrela, clic derecho > "Copiar dirección de imagen"
   y pega solo el código que va después de "photo-" (por ejemplo 1601758123927-4f7acc7da589). */
const FOTO = (codigo) => `https://images.unsplash.com/photo-${codigo}?auto=format&fit=crop&w=700&q=70`;
const FOTO_PORTADA = FOTO('1563460716037-460a3ad24ba9');

const PRODUCTOS_INICIALES = [
  // estado: 'stock' = disponible ahora | 'pronto' = llega pronto (tiene fecha)
  { id: 'p1', fotos: [FOTO('1601758123927-4f7acc7da589')], nombre: 'Cama acolchada mediana', precio: 34.90, stock: 18, especie: 'perros', necesidad: 'cuidado', arte: 'bed', tinte: 't1', estado: 'stock', mayoreo: true, stockMayoreo: 120, vendedor: 'Huellitas', material: 'Algodón reciclado y relleno de fibra', medidas: '70 × 55 × 18 cm', descripcion: 'Cama suave con bordes elevados para que tu perro descanse apoyando la cabeza. Funda lavable.' },
  { id: 'p2', fotos: [FOTO('1600352712371-15fd49ca42b5')], nombre: 'Collar reflectivo ajustable', precio: 9.50, stock: 42, especie: 'perros', necesidad: 'paseo', arte: 'collar', tinte: 't2', estado: 'stock', mayoreo: true, stockMayoreo: 300, vendedor: 'Huellitas', material: 'Nailon reciclado', medidas: 'Talla M (35 a 50 cm)', descripcion: 'Collar con franja reflectiva para paseos nocturnos más seguros. Hebilla de liberación rápida.' },
  { id: 'p3', fotos: [FOTO('1601758065893-25c11bfa69b5')], nombre: 'Rascador de dos niveles', precio: 27.00, stock: 7, especie: 'gatos', necesidad: 'recreacion', arte: 'tower', tinte: 't3', estado: 'stock', mayoreo: true, stockMayoreo: 240, vendedor: 'Rasca y Juega', vendedorId: 'u3', material: 'Cartón reciclado y sisal', medidas: '40 × 40 × 70 cm', descripcion: 'Torre de cartón y sisal con dos plataformas y un juguete colgante. Tu gato afila sus uñas sin dañar los muebles.' },
  { id: 'p4', fotos: [FOTO('1591608971358-f93643d11763')], nombre: 'Pelota de caucho natural', precio: 5.75, stock: 60, especie: 'perros', necesidad: 'recreacion', arte: 'ball', tinte: 't4', estado: 'stock', mayoreo: true, stockMayoreo: 500, vendedor: 'Huellitas', material: 'Caucho natural', medidas: '7 cm de diámetro', descripcion: 'Pelota resistente para morder y lanzar. Flota en el agua.' },
  { id: 'p5', fotos: [FOTO('1618865843655-e2723e296243')], nombre: 'Arnés acolchado talla M', precio: 18.25, stock: 15, especie: 'perros', necesidad: 'paseo', arte: 'harness', tinte: 't1', estado: 'stock', mayoreo: false, vendedor: 'Huellitas', material: 'Malla transpirable', medidas: 'Pecho 50 a 66 cm', descripcion: 'Arnés que reparte la presión en el pecho y evita lastimar el cuello.' },
  { id: 'p6', fotos: [FOTO('1571151596869-2663a84c1e41')], nombre: 'Comedero doble de acero', precio: 12.40, stock: 23, especie: 'gatos', necesidad: 'cuidado', arte: 'bowl', tinte: 't2', estado: 'stock', mayoreo: true, stockMayoreo: 150, vendedor: 'Huellitas', material: 'Acero inoxidable y bambú', medidas: '2 platos de 350 ml', descripcion: 'Dos platos de acero sobre base de bambú, para agua y alimento.' },
  { id: 'p7', fotos: [FOTO('1545249390-6bdfa286032f')], nombre: 'Ratón de tela con hierba gatera', precio: 4.50, stock: 30, especie: 'gatos', necesidad: 'recreacion', arte: 'ball', tinte: 't3', estado: 'stock', mayoreo: false, vendedor: 'Rasca y Juega', vendedorId: 'u3', material: 'Algodón orgánico', medidas: '10 cm', descripcion: 'Juguete relleno de hierba gatera natural que estimula el juego.' },
  { id: 'p8', fotos: [FOTO('1530700131180-d43d9b8cc41f')], nombre: 'Correa retráctil 5 m', precio: 15.60, stock: 12, especie: 'perros', necesidad: 'paseo', arte: 'leash', tinte: 't4', estado: 'stock', mayoreo: true, stockMayoreo: 80, vendedor: 'Huellitas', material: 'Plástico reciclado', medidas: '5 metros, hasta 25 kg', descripcion: 'Correa con freno de un botón y mango ergonómico.' },
  { id: 'p9', fotos: [FOTO('1606137029647-71daa7c9c5c8')], nombre: 'Acuario de 20 litros', precio: 49.00, stock: 5, especie: 'otras', necesidad: 'cuidado', arte: 'tank', tinte: 't3', estado: 'stock', mayoreo: false, vendedor: 'Huellitas', material: 'Vidrio templado', medidas: '40 × 25 × 25 cm', descripcion: 'Acuario con tapa y luz LED para peces pequeños.' },
  { id: 'p10', fotos: [FOTO('1595232170847-da4cab9e63ce')], nombre: 'Collar antipulgas para gato', precio: 11.90, stock: 25, especie: 'gatos', necesidad: 'cuidado', arte: 'collar', tinte: 't1', estado: 'stock', mayoreo: true, stockMayoreo: 200, vendedor: 'Huellitas', material: 'Silicona hipoalergénica', medidas: 'Ajustable hasta 38 cm', descripcion: 'Protección contra pulgas y garrapatas por hasta 8 meses.' },
  { id: 'p11', fotos: [FOTO('1571131116858-2295ade82a72')], nombre: 'Fuente de agua para gatos', precio: 29.90, stock: 0, especie: 'gatos', necesidad: 'cuidado', arte: 'fountain', tinte: 't3', estado: 'pronto', llegada: enDias(10), mayoreo: false, vendedor: 'Huellitas', material: 'Plástico libre de BPA', medidas: '2 litros', descripcion: 'Fuente silenciosa con filtro que motiva a tu gato a tomar más agua.' },
  { id: 'p12', fotos: [FOTO('1425082661705-1834bfd09dca')], nombre: 'Jaula para hámster', precio: 39.00, stock: 0, especie: 'otras', necesidad: 'cuidado', arte: 'cage', tinte: 't1', estado: 'pronto', llegada: enDias(15), mayoreo: false, vendedor: 'Huellitas', material: 'Metal y plástico reciclado', medidas: '60 × 36 × 30 cm', descripcion: 'Jaula con rueda, bebedero y casita.' },
  { id: 'p13', fotos: [FOTO('1588943211346-0908a1fb0b01')], nombre: 'Kit de cepillado', precio: 13.20, stock: 0, especie: 'perros', necesidad: 'cuidado', arte: 'brush', tinte: 't2', estado: 'pronto', llegada: enDias(18), mayoreo: true, stockMayoreo: 100, vendedor: 'Huellitas', material: 'Bambú y cerdas naturales', medidas: '3 piezas', descripcion: 'Cepillo, peine y guante para retirar pelo muerto.' },
  { id: 'p14', fotos: [FOTO('1661322563051-15248c0568a1')], nombre: 'Transportadora rígida', precio: 44.00, stock: 0, especie: 'gatos', necesidad: 'paseo', arte: 'carrier', tinte: 't4', estado: 'pronto', llegada: enDias(24), mayoreo: false, vendedor: 'Huellitas', material: 'Plástico reciclado', medidas: '48 × 32 × 30 cm', descripcion: 'Transportadora ventilada con puerta metálica, apta para viajes.' },
  { id: 'p15', fotos: [FOTO('1638826595775-e2eae86cda8e')], nombre: 'Túnel plegable para gatos', precio: 15.90, stock: 0, especie: 'gatos', necesidad: 'recreacion', arte: 'carrier', tinte: 't2', estado: 'pronto', llegada: enDias(30), mayoreo: false, vendedor: 'Rasca y Juega', vendedorId: 'u3', material: 'Poliéster reciclado', medidas: '90 cm de largo', descripcion: 'Túnel que se pliega para guardarlo fácil. Incluye pompón.' }
];

/* Cuentas de prueba. Contraseña de todas: 123456 */
const USUARIOS_INICIALES = [
  { id: 'u1', rol: 'cliente', nombre: 'Ana Pérez', correo: 'cliente@demo.com', clave: '123456', telefono: '6000-1111', direccion: 'Ciudad de Panamá, Bella Vista', pago: { marca: 'Visa', ultimos: '4417', vence: '08/28', titular: 'Ana Pérez' } },
  { id: 'u2', rol: 'pequeno_negocio', nombre: 'Luis Gómez', negocio: 'Veterinaria San José', ruc: '8-123-4567', correo: 'negocio@demo.com', clave: '123456', telefono: '6000-2222', direccion: 'David, Chiriquí', pago: null },
  { id: 'u3', rol: 'proveedor', nombre: 'María Ríos', negocio: 'Rasca y Juega', ruc: '8-765-4321', correo: 'proveedor@demo.com', clave: '123456', telefono: '6000-3333', direccion: 'Santiago, Veraguas', pago: null },
  { id: 'u4', rol: 'admin', nombre: 'Administrador', correo: 'admin@demo.com', clave: '123456', telefono: '', direccion: '', pago: null }
];

const CENTROS_ENTREGA = ['Centro de entrega · David', 'Centro de entrega · Santiago', 'Centro de entrega · Colón', 'Centro de entrega · Chitré'];
