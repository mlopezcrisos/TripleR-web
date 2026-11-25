# Pagos con Stripe (Cloud Functions)

Flujo de compra:

1. En `/checkout` el cliente llena su dirección y da clic en **Pagar**.
2. La app llama a la función `createCheckoutSession`, que:
   - toma precio y stock de Firestore `products/{id}` (o de `catalog.js` si el
     producto aún no está ahí); nunca confía en el precio del navegador,
   - rechaza la compra si no hay stock suficiente de la talla,
   - crea el pedido en Firestore `orders/{id}` con `status: "pendiente"`,
   - crea una sesión de Stripe Checkout y devuelve su URL.
3. El cliente paga en la página segura de Stripe.
4. Stripe avisa a la función `stripeWebhook`, que en una transacción marca
   el pedido como `pagado`, descuenta el stock por talla y vacía el carrito.
5. Stripe regresa al cliente a `/checkout/success?order={id}`.

Estados de un pedido (los mismos del panel /admin): `pendiente`, `pagado`,
`enviado`, `entregado`, `cancelado`. Si el pago expira o falla, el pedido pasa
a `cancelado` con `cancelReason`.

## Puesta en marcha (una sola vez)

Requisitos: el proyecto de Firebase debe estar en el **plan Blaze** (las
Cloud Functions no funcionan en el plan gratuito Spark) y tener instalado
`firebase-tools` (`npm i -g firebase-tools`, luego `firebase login`).

1. Instala dependencias:

   ```bash
   cd functions && npm install
   ```

2. Guarda la clave secreta de Stripe (Dashboard → Developers → API keys).
   Empieza con la de prueba `sk_test_...`:

   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   ```

3. Configura los dominios de la tienda: copia `functions/.env.example` a
   `functions/.env` y agrega el dominio real (por ejemplo el de Vercel).

4. Despliega las funciones:

   ```bash
   firebase deploy --only functions
   ```

5. Crea el webhook en Stripe (Dashboard → Developers → Webhooks → Add
   endpoint):
   - URL: `https://us-central1-tripler-fb8ef.cloudfunctions.net/stripeWebhook`
   - Eventos: `checkout.session.completed`,
     `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`

   Copia el "Signing secret" (`whsec_...`) y guárdalo:

   ```bash
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   firebase deploy --only functions
   ```

6. Prueba con la tarjeta `4242 4242 4242 4242`, cualquier fecha futura y
   cualquier CVC. El pedido debe aparecer en Firestore con `status: "pagado"`.

Para pasar a cobros reales, repite los pasos 2 y 5 con las claves `sk_live_`
y un webhook en modo live.

## Probar en local

```bash
# functions/.secret.local (no se sube a git)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # el que imprime `stripe listen`

firebase emulators:start --only functions,firestore
stripe listen --forward-to http://127.0.0.1:5001/tripler-fb8ef/us-central1/stripeWebhook
```

Nota: la app web apunta a las funciones desplegadas. Para usar el emulador
desde la app hay que llamar a `connectFunctionsEmulator` en
`src/firebase/config.js`.

## Precios y productos

Se administran desde `/admin` (colección `products`). `functions/catalog.js`
solo se usa como respaldo para productos que no estén en Firestore.
