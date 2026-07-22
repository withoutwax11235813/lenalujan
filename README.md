# Leña Balance

PWA para el negocio de leña: pedidos, gastos y balances entre los 2 socios.

## Novedades de esta versión

- **Control de stock**: tarjeta que muestra los Kg disponibles en tiempo real
  (ingresos de leña cargados menos Kg de pedidos entregados). Se agrega
  con el botón 🪵 del FAB, con historial editable/eliminable.
- **Exportar a Excel**: desde la pestaña Contaduría, descarga un .xlsx con
  hojas de resumen mensual, gastos por categoría, mejores clientes y
  cuentas por cobrar.
- **Exportar a PDF**: botón que abre el diálogo de impresión del navegador
  (Guardar como PDF) con una vista limpia, sin botones ni menús.
- **Buscador de pedidos**: en la pestaña Pedidos, filtra por nombre de
  cliente, teléfono o dirección.
- **Aviso de pedidos pendientes**: si hay pedidos con más de 3 días sin
  entregar, aparece un banner arriba del dashboard listándolos.
- **Pestaña Contaduría**: gráfico de ingresos vs gastos por mes, tendencia
  del balance, gastos por categoría, mejores clientes, cuentas por cobrar
  y una proyección simple del próximo mes (promedio de los últimos 3 meses
  completos).
- **Editar y eliminar** ahora disponible tanto en pedidos como en gastos
  (antes los gastos no se podían ni editar ni borrar, y los pedidos no
  se podían borrar).
- Las reglas de Firestore ahora permiten que **cualquiera de los 2 socios**
  edite o borre cualquier registro (antes solo quien lo había creado podía
  borrarlo) -- acorde a que es un negocio compartido, no compartimentos
  separados por socio.

## Stack

- React 18.2.0 + Vite 5.3.1, Tailwind 3.4.4 (versiones fijadas en `package.json`
  a propósito -- evita que un update automático de CDN/paquete rompa la app,
  como pasó antes con Babel en CobrApp).
- Firebase 10.12.2 (Auth + Firestore, SDK modular).
- Service worker manual (`public/sw.js`) en vez de un plugin que lo autogenera,
  para poder controlar el caching a mano.

## Setup

```bash
npm install
```

1. Creá un proyecto en Firebase Console.
2. Habilitá **Authentication → Email/Password**.
3. Creá los dos usuarios (los socios) manualmente desde la consola de Firebase
   (Authentication → Users → Add user), y después creá el doc correspondiente
   en `users/{uid}` con `email` y `name` para que el nombre aparezca en el dashboard.
4. Habilitá **Firestore Database** (modo producción).
5. Pegá las credenciales del proyecto en `src/firebase.js` (reemplazá los
   `REPLACE_ME`).
6. Desplegá las reglas de `firestore.rules` desde Firebase Console
   (Firestore → Rules → pegar el contenido del archivo → Publish).
7. Poné los íconos reales de la app en `public/icons/icon-192.png` y
   `public/icons/icon-512.png` (192x192 y 512x512 px, fondo sólido recomendado
   para que se vea bien como ícono de home screen).

## Desarrollo local

```bash
npm run dev
```

## Build y deploy a Cloudflare Pages

```bash
npm run build
```

Esto genera la carpeta `dist/`. En Cloudflare Pages:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (o donde esté este proyecto en el repo)

Cada vez que hagas un deploy nuevo, subí la versión de `CACHE_VERSION` en
`public/sw.js` para forzar que el service worker limpie el caché viejo --
si no, los socios pueden seguir viendo la versión anterior de la app hasta
que fuercen un refresh manual.

## Estructura

```
src/
  firebase.js              # init de Firebase (Auth + Firestore)
  contexts/AuthContext.jsx # sesión persistente entre los 2 socios
  components/
    Login.jsx
    Dashboard.jsx           # hub: balances + tabs pedidos/gastos + FABs
    Balances.jsx            # tarjetas Hoy / Semana / Mes
    OrderList.jsx           # lista con filtros + recibo por WhatsApp
    OrderForm.jsx           # alta/edición de pedidos
    ExpenseList.jsx
    ExpenseForm.jsx
    FAB.jsx
  utils/
    whatsapp.js             # genera y abre el link de wa.me con el recibo
    dateHelpers.js          # rangos hoy/semana/mes y formato ARS
firestore.rules
```
