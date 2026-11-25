// Catálogo con los precios que el servidor usa para cobrar.
//
// IMPORTANTE: el precio NUNCA se toma del navegador (cualquiera podría
// cambiarlo en el carrito). La fuente principal es Firestore (products/{id});
// este archivo es solo un respaldo mientras el catálogo no esté importado.
// Precios en pesos mexicanos (MXN).

export const CURRENCY = 'mxn';

// Respaldo: solo se usa si el producto todavía no existe en Firestore
// (colección products, que se administra desde /admin).
export const PRODUCTS = {
  1: { nombre: 'Playera Nsqk', precio: 200 },
  2: { nombre: "Bolsa de manta Nsqk'", precio: 150 },
  3: { nombre: 'Siento que merezco más - Latin Mafia', precio: 250 },
  4: { nombre: 'Te odio y te extraño mucho - Latin Mafia', precio: 250 },
  5: { nombre: 'Rels B', precio: 250 },
  6: { nombre: 'Do you think about me - NSQK', precio: 250 },
  7: { nombre: '¿Has pensado en ese hombre? - NSQK', precio: 250 },
};

export const SIZES = ['CH', 'M', 'G', 'EG', 'UNICA'];

// Mismo ajuste que en ProductDetailPage.jsx (priceMod en pesos).
export const CUTS = {
  regular: { label: 'Regular', priceMod: 0 },
  oversize: { label: 'Oversize', priceMod: 0 },
  hoodie: { label: 'Hoodie', priceMod: 0 },
};

// Envío: gratis por ahora (así lo muestra el checkout).
export const SHIPPING_COST = 0;
