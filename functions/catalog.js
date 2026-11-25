// Catálogo con los precios que el servidor usa para cobrar.
//
// IMPORTANTE: el precio NUNCA se toma del navegador (cualquiera podría
// cambiarlo en el carrito). Si cambias un precio o agregas un producto en
// src/App.jsx, actualízalo también aquí.
// Precios en pesos mexicanos (MXN).

export const CURRENCY = 'mxn';

export const PRODUCTS = {
  1: { nombre: 'Playera Nsqk', precio: 200 },
  2: { nombre: "Bolsa de manta Nsqk'", precio: 150 },
  3: { nombre: 'Siento que merezco más - Latin Mafia', precio: 250 },
  4: { nombre: 'Te odio y te extraño mucho - Latin Mafia', precio: 250 },
  5: { nombre: 'Rels B', precio: 250 },
  6: { nombre: 'Do you think about me - NSQK', precio: 250 },
  7: { nombre: '¿Has pensado en ese hombre? - NSQK', precio: 250 },
};

export const SIZES = ['CH', 'M', 'G', 'EG'];

// Mismo ajuste que en ProductDetailPage.jsx (priceMod en pesos).
export const CUTS = {
  regular: { label: 'Regular', priceMod: 0 },
  oversize: { label: 'Oversize', priceMod: 0 },
  hoodie: { label: 'Hoodie', priceMod: 0 },
};

// Envío: gratis por ahora (así lo muestra el checkout).
export const SHIPPING_COST = 0;
