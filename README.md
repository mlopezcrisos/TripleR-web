# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Catálogo en Firestore (TRIPLE R)

Los productos y artistas viven en Firestore (`products` y `artists`). La tienda los
lee en tiempo real (`src/hooks/useCatalog.js`). Si Firestore está vacío o no responde,
muestra el catálogo inicial de `src/data/catalogSeed.js`.

Producto (`products/{id}`):

```js
{
  nombre: "Playera Nsqk",
  precio: 200,                    // MXN
  descripcion: "...",
  artist: "nsqk",                 // id de artists/{id}
  tipo: "playera",                // "playera" (tallas CH, M, G, EG) o "bolsa" (talla UNICA)
  imagen: "playera_nsqk.png",     // archivo de src/assets o URL https://
  stock: { CH: 10, M: 10, G: 10, EG: 10 },  // o { UNICA: 10 }
  activo: true,                   // false = oculto en la tienda
  orden: 1
}
```

### Panel de administración (`/admin`)

1. Inicia sesión en la tienda con la cuenta que será admin y entra a `/admin`.
   Te mostrará tu `uid`.
2. En la consola de Firebase > Firestore, crea un documento en la colección
   `admins` con ese `uid` como id (puede ir vacío).
3. Recarga `/admin`. La primera vez aparece "Importar catálogo inicial".
4. Publica las reglas: `firebase deploy --only firestore:rules`.

Desde `/admin` se edita precio, stock por talla y visibilidad, se crean productos
y se cambia el estado de los pedidos. El stock se descuenta al confirmar un pago,
desde el backend (Admin SDK), no desde el navegador.
