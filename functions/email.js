// Correo de confirmación de pedido.
//
// Se envía por SMTP con nodemailer, así funciona con cualquier proveedor:
//  - Para empezar: Gmail de la tienda con una "contraseña de aplicación"
//    (SMTP_HOST=smtp.gmail.com, SMTP_USER=tu@gmail.com). Límite ~500 correos/día.
//  - Cuando haya dominio propio: Resend, Brevo, etc. también dan SMTP; solo
//    cambian SMTP_HOST, SMTP_USER, MAIL_FROM y el secreto SMTP_PASS.
import nodemailer from 'nodemailer';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';

export const SMTP_PASS = defineSecret('SMTP_PASS');
const SMTP_HOST = defineString('SMTP_HOST', { default: 'smtp.gmail.com' });
const SMTP_PORT = defineString('SMTP_PORT', { default: '465' });
const SMTP_USER = defineString('SMTP_USER', { default: '' });
// Remitente que ve el cliente, p. ej. "Triple R <tripleerremx@gmail.com>".
const MAIL_FROM = defineString('MAIL_FROM', { default: '' });
// Dirección que recibe una copia oculta de cada pedido (vacío = ninguna).
const MAIL_BCC = defineString('MAIL_BCC', { default: '' });
const STORE_URL = defineString('STORE_URL', { default: 'https://triple-r-web.vercel.app' });

const money = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const CUT_LABELS = { regular: 'Regular', oversize: 'Oversize', hoodie: 'Hoodie' };

function itemDetail(item) {
  return [
    item.selectedSize && item.selectedSize !== 'UNICA' && `Talla ${item.selectedSize}`,
    item.selectedCut && item.selectedCut !== 'regular' && (CUT_LABELS[item.selectedCut] ?? item.selectedCut),
  ].filter(Boolean).join(' · ');
}

export function buildConfirmationEmail(orderId, order) {
  const shortId = orderId.slice(0, 8).toUpperCase();
  const items = order.items ?? [];
  const s = order.shipping ?? {};
  const total = order.amountPaid ?? order.total;
  const store = STORE_URL.value();

  const rows = items.map((i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee">
            <strong>${esc(i.nombre)}</strong><br>
            <span style="color:#666;font-size:13px">${esc(itemDetail(i))}${itemDetail(i) ? ' · ' : ''}Cantidad: ${esc(i.quantity)}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${money(i.subtotal)}</td>
        </tr>`).join('');

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#171717">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#1E3A8A;color:#FEF3C7;padding:20px 24px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:22px">¡Gracias por tu compra!</h1>
      <p style="margin:6px 0 0">Pedido #${esc(shortId)}</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 8px 8px">
      <p>Hola ${esc(s.name)}, recibimos tu pago y ya estamos preparando tu pedido. Te avisaremos por correo cuando salga, con tu número de guía.</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px">${rows}
        <tr><td style="padding:6px 0">Subtotal</td><td style="text-align:right">${money(order.subtotal)}</td></tr>
        <tr><td style="padding:6px 0">Envío</td><td style="text-align:right">${order.envio ? money(order.envio) : 'Gratis'}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold">Total pagado</td><td style="text-align:right;font-weight:bold">${money(total)}</td></tr>
      </table>
      <h2 style="font-size:16px;margin:24px 0 6px">Dirección de envío</h2>
      <p style="margin:0;line-height:1.5">${esc(s.name)}<br>${esc(s.address)}<br>${esc(s.city)}, ${esc(s.state)}, CP ${esc(s.zip)}<br>Tel. ${esc(s.phone)}</p>
      <p style="margin-top:24px;font-size:13px;color:#666;line-height:1.5">
        ¿Algún dato está mal o tienes dudas? Responde a este correo.<br>
        <a href="${esc(store)}/envios" style="color:#1E3A8A">Política de envíos</a> ·
        <a href="${esc(store)}/devoluciones" style="color:#1E3A8A">Cambios y devoluciones</a>
      </p>
    </div>
  </div>
</body></html>`;

  const text = [
    `¡Gracias por tu compra! Pedido #${shortId}`,
    '',
    ...items.map((i) => `- ${i.nombre}${itemDetail(i) ? ` (${itemDetail(i)})` : ''} x${i.quantity}: ${money(i.subtotal)}`),
    '',
    `Total pagado: ${money(total)}`,
    '',
    'Envío a:',
    s.name, s.address, `${s.city}, ${s.state}, CP ${s.zip}`, `Tel. ${s.phone}`,
    '',
    '¿Dudas? Responde a este correo.',
  ].join('\n');

  return { subject: `Confirmación de tu pedido #${shortId} | Triple R`, html, text };
}

/**
 * Envía la confirmación de un pedido pagado, una sola vez.
 * Nunca lanza error: si el correo falla, el pago ya quedó registrado y el
 * error se guarda en el pedido (emailError) para reenviarlo a mano.
 */
export async function sendOrderConfirmation(db, orderId) {
  if (!SMTP_USER.value()) {
    logger.warn('SMTP_USER no está configurado: no se envió el correo de confirmación.');
    return;
  }
  const orderRef = db.doc(`orders/${orderId}`);

  // Aparta el envío en una transacción para que dos eventos repetidos de
  // Stripe no manden el correo dos veces.
  const order = await db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    const data = snap.data();
    if (!snap.exists || data.status !== 'pagado' || data.emailSentAt || data.emailStatus === 'enviando') return null;
    tx.update(orderRef, { emailStatus: 'enviando' });
    return data;
  });
  if (!order) return;

  const to = order.email || order.customerEmail;
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST.value(),
      port: Number(SMTP_PORT.value()),
      secure: Number(SMTP_PORT.value()) === 465,
      auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
    });
    const { subject, html, text } = buildConfirmationEmail(orderId, order);
    await transporter.sendMail({
      from: MAIL_FROM.value() || `Triple R <${SMTP_USER.value()}>`,
      to,
      bcc: MAIL_BCC.value() || undefined,
      subject,
      html,
      text,
    });
    await orderRef.update({
      emailStatus: 'enviado',
      emailSentAt: FieldValue.serverTimestamp(),
      emailError: FieldValue.delete(),
    });
  } catch (err) {
    logger.error(`No se pudo enviar el correo del pedido ${orderId}`, err);
    await orderRef.update({ emailStatus: 'error', emailError: String(err.message ?? err) });
  }
}
