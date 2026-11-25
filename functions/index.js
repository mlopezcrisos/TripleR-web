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

function validateShipping(raw = {}) {
  const shipping = {
    nombre: cleanText(raw.nombre, 120),
    calle: cleanText(raw.calle, 200),
    ciudad: cleanText(raw.ciudad, 100),
    codigoPostal: cleanText(raw.codigoPostal, 10),
    estado: cleanText(raw.estado, 100),
    telefono: cleanText(raw.telefono, 20),
    email: cleanText(raw.email, 200),
  };
  for (const [key, value] of Object.entries(shipping)) {
    if (!value) throw new HttpsError('invalid-argument', `Falta el campo de envío: ${key}`);
  }
  if (!/^\d{5}$/.test(shipping.codigoPostal)) {
    throw new HttpsError('invalid-argument', 'El código postal debe tener 5 dígitos.');
  }
  if (!/^[\d\s+()-]{8,20}$/.test(shipping.telefono)) {
    throw new HttpsError('invalid-argument', 'El teléfono no es válido.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
    throw new HttpsError('invalid-argument', 'El correo no es válido.');
  }
  return shipping;
}

// Convierte el carrito que manda el navegador en partidas con precios del
// servidor. Del navegador solo se acepta: id, talla, corte y cantidad.
function buildItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new HttpsError('invalid-argument', 'El carrito está vacío.');
  }
  if (rawItems.length > MAX_ITEMS) {
    throw new HttpsError('invalid-argument', 'Demasiados productos en el carrito.');
  }
  return rawItems.map((raw) => {
    const product = PRODUCTS[raw?.id];
    if (!product) throw new HttpsError('invalid-argument', `Producto desconocido: ${raw?.id}`);
    const size = raw.selectedSize ?? null;
    if (size !== null && !SIZES.includes(size)) {
      throw new HttpsError('invalid-argument', `Talla no válida: ${size}`);
    }
    const cutId = raw.selectedCut ?? 'regular';
    const cut = CUTS[cutId];
    if (!cut) throw new HttpsError('invalid-argument', `Corte no válido: ${cutId}`);
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
      throw new HttpsError('invalid-argument', 'Cantidad no válida.');
    }
    const unitPrice = product.precio + cut.priceMod;
    return {
      productId: Number(raw.id),
      nombre: product.nombre,
      talla: size,
      corte: cutId,
      cantidad: quantity,
      precioUnitario: unitPrice,
      subtotal: unitPrice * quantity,
    };
  });
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
    const items = buildItems(request.data?.items);
    const shipping = validateShipping(request.data?.shipping);
    const userId = request.auth?.uid ?? null; // Se permiten compras como invitado.

    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const total = subtotal + SHIPPING_COST;

    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      userId,
      status: 'pending',
      items,
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
          quantity: i.cantidad,
          price_data: {
            currency: CURRENCY,
            unit_amount: Math.round(i.precioUnitario * 100),
            product_data: {
              name: i.nombre,
              description: [i.talla && `Talla ${i.talla}`, i.corte !== 'regular' && CUTS[i.corte].label]
                .filter(Boolean)
                .join(' · ') || undefined,
            },
          },
        })),
        customer_email: shipping.email,
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
      await orderRef.update({ status: 'error', error: String(err.message ?? err) });
      throw new HttpsError('internal', 'No se pudo iniciar el pago. Intenta de nuevo.');
    }
  },
);

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
        case 'checkout.session.async_payment_succeeded': {
          if (!orderId) break;
          if (session.payment_status !== 'paid') {
            // Pago diferido (p. ej. OXXO): se confirma después con async_payment_succeeded.
            await db.doc(`orders/${orderId}`).update({ status: 'awaiting_payment' });
            break;
          }
          const orderRef = db.doc(`orders/${orderId}`);
          await orderRef.update({
            status: 'paid',
            paidAt: FieldValue.serverTimestamp(),
            amountPaid: session.amount_total / 100,
            stripePaymentIntentId: session.payment_intent ?? null,
            customerEmail: session.customer_details?.email ?? null,
          });
          // Vacía el carrito del usuario que compró.
          const userId = session.metadata?.userId;
          if (userId) {
            await db.doc(`carts/${userId}`).set({ items: [] }, { merge: true });
          }
          break;
        }
        case 'checkout.session.async_payment_failed':
          if (orderId) await db.doc(`orders/${orderId}`).update({ status: 'payment_failed' });
          break;
        case 'checkout.session.expired':
          if (orderId) await db.doc(`orders/${orderId}`).update({ status: 'expired' });
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
