// Convierte el campo `imagen` de Firestore en una URL que el navegador pueda cargar.
// - Si ya es una URL (https://...), se usa tal cual.
// - Si es un nombre de archivo (p. ej. "playera_nsqk.webp"), se busca en src/assets.
//   Las imágenes se guardan en WebP; un nombre viejo con .png o .jpg
//   (como los que ya están en Firestore) también encuentra su versión .webp.
const assets = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
});

const fileName = path => path.split('/').pop();
const stem = name => name.replace(/\.[a-z0-9]+$/i, '');

const byName = Object.fromEntries(
  Object.entries(assets).map(([path, url]) => [fileName(path), url])
);
const byStem = Object.fromEntries(
  Object.entries(assets).map(([path, url]) => [stem(fileName(path)), url])
);

export const assetNames = Object.keys(byName).sort();

export function resolveImage(value) {
  if (!value) return '';
  if (/^(https?:|data:|\/)/.test(value)) return value;
  return byName[value] || byStem[stem(value)] || '';
}
