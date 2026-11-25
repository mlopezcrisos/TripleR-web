// Datos legales de la tienda que usan las páginas de Términos, Privacidad,
// Envíos y Devoluciones. Llena los que están en null antes de abrir al público:
// mientras estén en null, la página muestra un aviso amarillo de "PENDIENTE".

export const LEGAL = {
  nombreComercial: 'Triple R',
  // Nombre de la persona física o razón social de la empresa que vende.
  razonSocial: null,
  rfc: null,
  // Domicilio fiscal o para oír y recibir notificaciones (calle, número, colonia, CP, ciudad, estado).
  domicilio: null,
  correo: 'tripleerremx@gmail.com',
  telefono: null,
  sitio: 'https://triple-r-web.vercel.app',
  // Fecha de la última actualización de los textos legales.
  actualizado: '25 de noviembre de 2026',

  envio: {
    // Paqueterías con las que se envía (p. ej. "Estafeta, DHL o FedEx").
    paqueterias: null,
    // Días hábiles para preparar el pedido después del pago.
    diasPreparacion: null,
    // Días hábiles de tránsito estimados una vez entregado a la paquetería.
    diasEntrega: null,
    // Texto del costo, p. ej. "Gratis en compras mayores a $2,000; si no, $150".
    // OJO: el banner dice "gratis arriba de $2,000" y el checkout hoy cobra $0 siempre.
    costo: null,
    cobertura: 'Solo enviamos dentro de la República Mexicana.',
  },

  devoluciones: {
    // Días naturales desde que recibes el pedido para pedir cambio o devolución.
    diasParaSolicitar: null,
    // Quién paga la guía de regreso cuando no es un error de la tienda.
    pagaEnvioRegreso: null,
    // Días hábiles para reembolsar una vez recibido y revisado el producto.
    diasReembolso: null,
  },
};

// Páginas legales: rutas y títulos (se usan en el footer y al pie de cada página).
export const LEGAL_PAGES = [
  { path: '/terminos', title: 'Términos y condiciones' },
  { path: '/privacidad', title: 'Aviso de privacidad' },
  { path: '/envios', title: 'Política de envíos' },
  { path: '/devoluciones', title: 'Cambios y devoluciones' },
];
