# Huellitas · Tienda en línea para mascotas

Proyecto COIL entre la **Universidad del Valle de Guatemala** y la **Universidad Tecnológica de Panamá**.
Página web funcional hecha con **HTML, CSS y JavaScript puro** (sin instalar nada). Funciona en Vercel, GitHub Pages o abriendo el archivo en el navegador.

> Los datos (cuentas, carrito, pedidos, productos publicados) se guardan en el navegador con `localStorage`.
> Es un prototipo sin servidor: cada persona ve sus propios datos y el pago se simula.

---

## Cuentas de prueba

Contraseña de todas: `123456`. También están como botones en la pantalla de **Iniciar sesión**.

| Correo | Tipo de usuario | Sirve para probar |
|---|---|---|
| cliente@demo.com | Cliente (con tarjeta guardada) | Compras, pago con tarjeta guardada, bloqueo de compras al por mayor |
| negocio@demo.com | Pequeño negocio | Solicitud de compra al por mayor |
| proveedor@demo.com | Pequeño proveedor | Gestión de mis productos (publicar y producto repetido) |
| admin@demo.com | Administrador | Aprobar o rechazar solicitudes al por mayor, ver ventas |

**Tarjetas de prueba:** `4242 4242 4242 4242` se aprueba y `4000 0000 0000 0002` la rechaza la pasarela. La fecha debe ser futura (por ejemplo, 12/30) y el CVV, cualquier número de 3 dígitos.

---

## Cómo se cumple cada requisito del documento

| Requisito | Dónde está |
|---|---|
| RF-01 Carrusel de artículos disponibles | Inicio → "Disponibles ahora" (flechas, deslizar o teclado) |
| RF-02 Carrusel distinto con fechas de llegada | Inicio → "Próximamente" ("Llega el 5 dic.") |
| RF-03 Agregar y eliminar del carrito | Detalle de producto → "Agregar al carrito"; Carrito → ícono de basura |
| RF-04 Lista con cantidades antes de pagar | Carrito (precio unitario, cantidad, subtotal y total) |
| RF-05 Escribir el producto deseado | Buscador de la barra superior |
| RF-06 Asistente de escritura | Sugerencias mientras escribes (flechas ↑ ↓ y Enter) y "¿Quisiste decir…?" si hay un error de tipeo |
| RF-07 Métodos de pago y sus datos | Pago: tarjeta guardada, tarjeta nueva, billetera digital y transferencia |
| RF-08 Proveedores suben su catálogo | Gestión de mis productos: nombre, descripción, precio, cantidad y fotos |
| RF-09 Solicitud de compra al por mayor | Detalle de producto → "Compra al por mayor" |
| RF-10 Registro con datos y forma de pago opcional | Registrarse → interruptor "Guardar forma de pago" |
| RF-11 Preguntar el tipo de usuario | Registrarse: Cliente, Pequeño negocio, Empresa o Pequeño proveedor |
| RF-12 Solo negocios compran al por mayor | El botón se bloquea para clientes y proveedores (ver nota abajo) |
| RF-13 Solo proveedores publican | "Acceso denegado" para cualquier otro rol |

| Caso de uso | Flujo principal | Alternativo / excepción |
|---|---|---|
| CU-01 Consultar catálogo | Categorías, búsqueda, lista y detalle | "No se encontraron artículos" y vuelve a buscar |
| CU-02 Gestionar carrito | Valida stock, actualiza contador, recalcula total | Aviso de stock insuficiente con opción "Ajustar" |
| CU-03 Procesar pago | Ir a pagar → método → datos → pago aprobado, factura, estado "Pagado" e inventario actualizado | Tarjeta guardada / Pago rechazado con "Reintentar" |
| CU-04 Registrar cuenta | Rol → formulario personal o de negocio → guardar pago → cuenta creada | "Cuenta ya registrada" y sugiere iniciar sesión |
| CU-05 Publicar productos | Verifica rol → subir artículo → publicar → aparece en buscador y carruseles | "¿Desea agregar nuevamente este producto?" (rellena todo menos la cantidad) / Acceso denegado |
| CU-06 Pedido al por mayor | Verifica rol → cantidad → tarifa especial → "Solicitud en proceso" | Cuenta cliente o proveedor: botón bloqueado y mensaje |

**Nota sobre RF-12:** el documento dice "proveedores" en el RF-12, pero el CU-06 dice que solo los pequeños negocios y las empresas pueden pedir al por mayor. Seguimos el CU-06 porque es más detallado. Si el equipo de Panamá decide otra cosa, se cambia en `js/store.js`, en la función `esNegocio`.

---

## Estructura de archivos

```
huellitas-web/
├── index.html        Página principal (solo carga los estilos y scripts)
├── css/
│   └── styles.css    Todo el diseño: colores, botones, tarjetas, celular
├── js/
│   ├── icons.js      Íconos de línea e ilustraciones de productos
│   ├── data.js       Productos iniciales, tipos de usuario y cuentas de prueba
│   ├── store.js      Reglas de negocio: carrito, pago, registro, proveedores, mayoreo
│   ├── ui.js         Piezas reutilizables: modales, avisos, validaciones, tarjetas
│   ├── views.js      Cada pantalla (inicio, catálogo, producto, carrito, pago…)
│   └── app.js        Encabezado, buscador con asistente y rutas (#/…)
├── vercel.json       Configuración para Vercel
└── README.md         Este archivo
```

Las pantallas se cambian con el `#` de la dirección: `#/catalogo`, `#/producto/p3`, `#/carrito`, `#/pago`, `#/registro`, `#/login`, `#/cuenta`, `#/proveedor`, `#/mayoreo/p3` y `#/admin`.

---

## Paso a paso: Visual Studio Code → GitHub → Vercel

### 1. Abrir el proyecto en Visual Studio Code
1. Descomprime el zip. Te queda la carpeta `huellitas-web`.
2. Abre Visual Studio Code → **Archivo → Abrir carpeta…** y elige `huellitas-web`.
3. Para verlo en el navegador, instala la extensión **Live Server** (de Ritwick Dey), da clic derecho en `index.html` y elige **Open with Live Server**.
   También puedes abrir `index.html` con doble clic.

### 2. Subirlo a GitHub
Necesitas tener instalado **Git** (git-scm.com) y una cuenta de GitHub.

1. En github.com presiona **New repository**, ponle de nombre `huellitas-web`, déjalo **Public** y **no** marques "Add a README". Presiona **Create repository**.
2. En Visual Studio Code abre la terminal (**Terminal → Nueva terminal**) y escribe, una línea a la vez:

```bash
git init
git add .
git commit -m "Primera versión de la tienda Huellitas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/huellitas-web.git
git push -u origin main
```

Cambia `TU-USUARIO` por tu usuario de GitHub. La primera vez te pedirá iniciar sesión.

**Sin terminal:** en la barra izquierda de VS Code está el ícono de **Control de código fuente** → **Publicar en GitHub** → elige repositorio público.

**Para guardar cambios después:**
```bash
git add .
git commit -m "Describe el cambio"
git push
```

### 3. Publicarlo en Vercel
1. Entra a vercel.com y presiona **Sign Up → Continue with GitHub**.
2. Presiona **Add New… → Project**.
3. Busca `huellitas-web` y presiona **Import**.
4. En **Framework Preset** deja **Other**. No cambies nada más.
5. Presiona **Deploy**. En menos de un minuto te da un link como `huellitas-web.vercel.app`.

Cada vez que hagas `git push`, Vercel publica la nueva versión solo.

### 4. Trabajar en equipo
- Los compañeros se agregan en GitHub → repositorio → **Settings → Collaborators → Add people**.
- Antes de empezar a trabajar, cada uno hace `git pull` para bajar los últimos cambios.

---

## Cambios rápidos

| Quiero… | Archivo |
|---|---|
| Cambiar colores o fuente | `css/styles.css`, arriba en `:root` |
| Agregar o editar productos iniciales | `js/data.js` → `PRODUCTOS_INICIALES` |
| Cambiar el envío o el impuesto | `js/store.js` → función `totales` |
| Cambiar los descuentos al por mayor | `js/store.js` → función `tarifa` |
| Empezar de cero con los datos de prueba | Botón "Reiniciar datos de prueba" en el pie de página |

Si cambias `data.js` y no ves el cambio, presiona "Reiniciar datos de prueba", porque el navegador guarda la versión anterior.

## Seguridad (lo que hace y lo que falta en un sistema real)
- El texto que escriben los usuarios se escapa antes de mostrarse, para evitar inyección de HTML (XSS).
- De las tarjetas solo se guarda la marca y los últimos 4 dígitos. Nunca el número completo ni el CVV.
- Los números de tarjeta se validan con el algoritmo de Luhn.
- **Falta para producción:** un servidor y una base de datos, contraseñas cifradas con hash, una pasarela de pago real y que los permisos por rol se verifiquen en el servidor. En este prototipo todo vive en el navegador.
