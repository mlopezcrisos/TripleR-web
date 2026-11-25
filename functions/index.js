import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import { CURRENCY, PRODUCTS, SIZES, CUTS, SHIPPING_COST } from './catalog.js';

initializeApp();
const db = getFirestore();

// Claves de Stripe: se guardan en Secret Manager, nunca en el código.
//   firebase functions:secrets:set STRIPE_SECRET_KEY
//   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_SECRET = defineSecret('STRIPE_WEBHOOK_SECRET');

// Dominios desde los que se permite iniciar un pago (separados por coma).
// Stripe regresa al cliente a uno de estos dominios después de pagar.
// Se configura en functions/.env (ver functions/.env.example).
const ALLOWED_ORIGINS = defineString('ALLOWED_ORIGINS', {
  default: 'http://localhost:5173,https://tripler-fb8ef.web.app,https://tripler-fb8ef.firebaseapp.com',
});

const MAX_QTY_PER_ITEM = 20;
const MAX_ITEMS = 50;

function cleanText(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Los nombres de campos coinciden con lo que lee el panel /admin.
function validateShipping(raw = {}) {
  const shipping = {
    name: cleanText(raw.nombre, 120),
    address: cleanText(raw.calle, 200),
    city: cleanText(raw.ciudad, 100),
    zip: cleanText(raw.codigoPostal, 10),
    state: cleanText(raw.estado, 100),
    phone: cleanText(raw.telefono, 20),
  };
  const email = cleanText(raw.email, 200);
  for (const [key, value] of Object.entries({ ...shipping, email })) {
    if (!value) throw new HttpsError('invalid-argument', `Falta el campo de envío: ${key}`);
  }
  if (!/^\d{5}$/.test(shipping.zip)) {
    throw new HttpsError('invalid-argument', 'El código postal debe tener 5 dígitos.');
  }
  if (!/^[\d\s+()-]{8,20}$/.test(shipping.phone)) {
    throw new HttpsError('invalid-argument', 'El teléfono no es válido.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError('invalid-argument', 'El correo no es válido.');
  }
  return { shipping, email };
}

// Busca el producto en Firestore (products/{id}, con precio y stock por
// talla). Si todavía no existe ahí, usa el catálogo de respaldo catalog.js.
async function loadProduct(id) {
  const key = String(id ?? '');
  if (!key || key.includes('/')) return null;
  const snap = await db.doc(`products/${key}`).get();
  if (snap.exists) {
    const data = snap.data();
    if (data.activo === false) return null;
    return {
      id: key,
      nombre: data.nombre,
      precio: Number(data.precio),
      precioHoodie: data.precioHoodie != null ? Number(data.precioHoodie) : null,
      tipo: data.tipo ?? null,
      stock: data.stock ?? null,
    };
  }
  const fallback = PRODUCTS[key];
  return fallback ? { id: key, nombre: fallback.nombre, precio: fallback.precio, precioHoodie: null, tipo: fallback.tipo ?? null, stock: null } : null;
}

// Convierte el carrito que manda el navegador en partidas con precios del
// servidor. Del navegador solo se acepta: id, talla, corte y cantidad.
async function buildItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new HttpsError('invalid-argument', 'El carrito está vacío.');
  }
  if (rawItems.length > MAX_ITEMS) {
    throw new HttpsError('invalid-argument', 'Demasiados productos en el carrito.');
  }
  const items = [];
  const wanted = {}; // `${id}|${talla}` -> piezas pedidas, para validar stock
  for (const raw of rawItems) {
    const product = await loadProduct(raw?.id);
    if (!product || !Number.isFinite(product.precio)) {
      throw new HttpsError('invalid-argument', `Producto no disponible: ${raw?.id}`);
    }
    const size = raw.selectedSize ?? null;
    const validSizes = product.stock ? Object.keys(product.stock) : SIZES;
    if (size !== null && !validSizes.includes(size)) {
      throw new HttpsError('invalid-argument', `Talla no válida: ${size}`);
    }
    const cutId = raw.selectedCut ?? 'regular';
    const cut = CUTS[cutId];
    if (!cut) throw new HttpsError('invalid-argument', `Corte no válido: ${cutId}`);
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      throw new HttpsError('invalid-argument', 'Cantidad no válida.');
    }
    if (product.stock) {
      const k = `${product.id}|${size}`;
      wanted[k] = (wanted[k] ?? 0) + quantity;
      if (wanted[k] > Number(product.stock[size] ?? 0)) {
        throw new HttpsError('failed-precondition',
          `No hay suficiente stock de ${product.nombre}${size ? ` talla ${size}` : ''}.`);
      }
    }
    if (cutId === 'hoodie' && product.tipo && product.tipo !== 'playera') {
      throw new HttpsError('invalid-argument', `${product.nombre} no está disponible como hoodie.`);
    }
    // Hoodie: precio total propio (products/{id}.precioHoodie, o 400 por defecto).
    const precio = cutId === 'hoodie'
      ? (Number.isFinite(product.precioHoodie) ? product.precioHoodie : cut.fixedPrice)
      : product.precio + (cut.priceMod ?? 0);
    items.push({
      productId: product.id,
      nombre: product.nombre,
      selectedSize: size,
      selectedCut: cutId,
      quantity,
      precio,
      subtotal: precio * quantity,
    });
  }
  return items;
}

function pickOrigin(requestOrigin) {
  const allowed = ALLOWED_ORIGINS.value().split(',').map((o) => o.trim()).filter(Boolean);
  return allowed.includes(requestOrigin) ? requestOrigin : allowed[0];
}

/**
 * Crea un pedido "pendiente" en Firestore y una sesión de Stripe Checkout.
 * Devuelve la URL de Stripe a la que el navegador debe redirigir.
 */
export const createCheckoutSession = onCall(
  { secrets: [STRIPE_SECRET_KEY], cors: true },
  async (request) => {
    const items = await buildItems(request.data?.items);
    const { shipping, email } = validateShipping(request.data?.shipping);
    const userId = request.auth?.uid ?? null; // Se permiten compras como invitado.

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const total = subtotal + SHIPPING_COST;

    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      userId,
      status: 'pendiente',
      items,
      email,
      shipping,
      subtotal,
      envio: SHIPPING_COST,
      total,
      currency: CURRENCY,
      createdAt: FieldValue.serverTimestamp(),
    });

    const origin = pickOrigin(request.rawRequest?.headers?.origin);
    const stripe = new Stripe(STRIPE_SECRET_KEY.value());

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: items.map((i) => ({
          quantity: i.quantity,
          price_data: {
            currency: CURRENCY,
            unit_amount: Math.round(i.precio * 100),
            product_data: {
              name: i.nombre,
              description: [
                i.selectedSize && i.selectedSize !== 'UNICA' && `Talla ${i.selectedSize}`,
                i.selectedCut !== 'regular' && CUTS[i.selectedCut].label,
              ]
                .filter(Boolean)
                .join(' · ') || undefined,
            },
          },
        })),
        customer_email: email,
        client_reference_id: orderRef.id,
        metadata: { orderId: orderRef.id, userId: userId ?? '' },
        payment_intent_data: { metadata: { orderId: orderRef.id } },
        success_url: `${origin}/checkout/success?order=${orderRef.id}`,
        cancel_url: `${origin}/checkout?cancelado=1`,
        locale: 'es',
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      });

      await orderRef.update({ stripeSessionId: session.id });
      return { url: session.url, orderId: orderRef.id };
    } catch (err) {
      logger.error('Error creando la sesión de Stripe', err);
      await orderRef.update({ status: 'cancelado', error: String(err.message ?? err) });
      throw new HttpsError('internal', 'No se pudo iniciar el pago. Intenta de nuevo.');
    }
  },
);

/**
 * Marca el pedido como pagado y descuenta el stock, todo en una transacción.
 * Si Stripe manda el mismo evento dos veces, la segunda no hace nada.
 */
async function markPaid(orderId, session) {
  const orderRef = db.doc(`orders/${orderId}`);
  await db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) throw new Error(`Pedido ${orderId} no existe`);
    const order = orderSnap.data();
    if (order.status !== 'pendiente' && order.status !== 'cancelado') return; // ya procesado

    // Agrupa piezas por producto y talla.
    const perProduct = {};
    for (const item of order.items ?? []) {
      if (!item.selectedSize) continue;
      perProduct[item.productId] ??= {};
      perProduct[item.productId][item.selectedSize] =
        (perProduct[item.productId][item.selectedSize] ?? 0) + item.quantity;
    }
    const refs = Object.keys(perProduct).map((id) => db.doc(`products/${id}`));
    const snaps = refs.length ? await tx.getAll(...refs) : [];

    const oversold = [];
    snaps.forEach((snap, idx) => {
      const stock = snap.exists ? snap.data().stock : null;
      if (!stock) return; // producto sin control de stock
      const updates = {};
      for (const [size, qty] of Object.entries(perProduct[snap.id])) {
        const current = Number(stock[size] ?? 0);
        if (current < qty) oversold.push(`${snap.id}/${size}`);
        updates[`stock.${size}`] = Math.max(0, current - qty);
      }
      tx.update(refs[idx], updates);
    });

    tx.update(orderRef, {
      status: 'pagado',
      paidAt: FieldValue.serverTimestamp(),
      amountPaid: session.amount_total / 100,
      stripePaymentIntentId: session.payment_intent ?? null,
      customerEmail: session.customer_details?.email ?? null,
      ...(oversold.length ? { sobreventa: oversold } : {}),
    });
    if (oversold.length) logger.warn(`Pedido ${orderId}: sobreventa en ${oversold.join(', ')}`);
  });

  // Vacía el carrito del usuario que compró.
  const userId = session.metadata?.userId;
  if (userId) {
    await db.doc(`carts/${userId}`).set({ items: [] }, { merge: true });
  }
}

async function cancelIfPending(orderId, reason) {
  const orderRef = db.doc(`orders/${orderId}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    if (snap.exists && snap.data().status === 'pendiente') {
      tx.update(orderRef, { status: 'cancelado', cancelReason: reason });
    }
  });
}

/**
 * Webhook de Stripe: confirma el pago y marca el pedido como pagado.
 * Esta es la única fuente de verdad de que un pedido se pagó.
 */
export const stripeWebhook = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'],
        STRIPE_WEBHOOK_SECRET.value(),
      );
    } catch (err) {
      logger.warn('Firma de webhook inválida', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const session = event.data.object;
    const orderId = session?.metadata?.orderId;

    try {
      switch (event.type) {
        case 'checkout.session.completed':
        case 'checkout.session.async_payment_succeeded':
          if (!orderId) break;
          if (session.payment_status !== 'paid') {
            // Pago diferido (p. ej. OXXO): el pedido sigue "pendiente" hasta
            // que llegue async_payment_succeeded.
            await db.doc(`orders/${orderId}`).update({ paymentStatus: 'awaiting_payment' });
            break;
          }
          await markPaid(orderId, session);
          break;
        case 'checkout.session.async_payment_failed':
          if (orderId) await cancelIfPending(orderId, 'payment_failed');
          break;
        case 'checkout.session.expired':
          if (orderId) await cancelIfPending(orderId, 'expired');
          break;
        default:
          break;
      }
    } catch (err) {
      logger.error(`Error procesando ${event.type} para el pedido ${orderId}`, err);
      res.status(500).send('Error interno');
      return;
    }

    res.json({ received: true });
  },
);
