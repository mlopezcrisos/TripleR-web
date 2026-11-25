// Catálogo inicial de TRIPLE R.
// Es lo que antes estaba fijo en App.jsx. Se usa para:
//  1. Importarlo a Firestore desde /admin ("Importar catálogo inicial").
//  2. Mostrar algo mientras Firestore está vacío o no responde.
// Las imágenes se guardan como nombre de archivo de src/assets (o como URL https).

export const SIZES = ['CH', 'M', 'G', 'EG'];
export const ONE_SIZE = 'UNICA';

// SUPOSICIÓN: 10 piezas por talla. Hay que poner el stock real desde /admin.
const tallas = (n = 10) => Object.fromEntries(SIZES.map(s => [s, n]));

export const seedProducts = [
  { id: '1', nombre: 'Playera Nsqk', precio: 200, imagen: 'playera_nsqk.png', descripcion: 'Playera de algodón peinado', artist: 'nsqk', tipo: 'playera', stock: tallas(), activo: true, orden: 1 },
  { id: '2', nombre: "Bolsa de manta Nsqk'", precio: 150, imagen: 'bolsa_nsqk.png', descripcion: 'Tote bag de manta cruda 40x40', artist: 'nsqk', tipo: 'bolsa', stock: { [ONE_SIZE]: 10 }, activo: true, orden: 2 },
  { id: '3', nombre: 'Siento que merezco más - Latin Mafia', precio: 250, imagen: 'playera_latin_mafia_1.jpg', descripcion: 'Playera oficial Latin Mafia', artist: 'latin-mafia', tipo: 'playera', stock: tallas(), activo: true, orden: 3 },
  { id: '4', nombre: 'Te odio y te extraño mucho - Latin Mafia', precio: 250, imagen: 'playera_latin_mafia_2.jpg', descripcion: 'Playera oficial Latin Mafia', artist: 'latin-mafia', tipo: 'playera', stock: tallas(), activo: true, orden: 4 },
  { id: '5', nombre: 'Rels B', precio: 250, imagen: 'playera_rels_b.jpg', descripcion: 'Playera oficial Rels B', artist: 'rels-b', tipo: 'playera', stock: tallas(), activo: true, orden: 5 },
  { id: '6', nombre: 'Do you think about me - NSQK', precio: 250, imagen: 'playera_nsqk_dythm.jpg', descripcion: 'Playera oficial NSQK', artist: 'nsqk', tipo: 'playera', stock: tallas(), activo: true, orden: 6 },
  { id: '7', nombre: '¿Has pensado en ese hombre? - NSQK', precio: 250, imagen: 'playera_nsqk_hp.jpg', descripcion: 'Playera oficial NSQK', artist: 'nsqk', tipo: 'playera', stock: tallas(), activo: true, orden: 7 },
];

export const seedArtists = [
  { id: 'nsqk', name: 'NSQK', image: 'artist_nsqk.png', orden: 1 },
  { id: 'latin-mafia', name: 'Latin Mafia', image: 'artist_latin_mafia.jpg', orden: 2 },
  { id: 'rels-b', name: 'Rels B', image: 'artist_rels_b.png', orden: 3 },
  { id: 'ca7riel-paco', name: 'CA7RIEL & Paco Amoroso', image: 'artist_ca7riel_paco.png', orden: 4 },
  { id: 'ed-maverick', name: 'Ed Maverick', image: 'artist_ed_maverick.png', orden: 5 },
  { id: 'humbe', name: 'Humbe', image: 'artist_humbe.jpg', orden: 6 },
];

// Tallas que se venden para un producto (en el orden de SIZES).
export function sizesOf(product) {
  const keys = Object.keys(product?.stock || {});
  if (keys.includes(ONE_SIZE) || product?.tipo === 'bolsa') return [ONE_SIZE];
  return SIZES.filter(s => keys.includes(s));
}

export function stockOf(product, size) {
  return Math.max(0, Number(product?.stock?.[size]) || 0);
}

export function totalStock(product) {
  return Object.values(product?.stock || {}).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
}
