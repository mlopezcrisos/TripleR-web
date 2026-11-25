// Convierte el campo `imagen` de Firestore en una URL que el navegador pueda cargar.
// - Si ya es una URL (https://...), se usa tal cual.
// - Si es un nombre de archivo (p. ej. "playera_nsqk.png"), se busca en src/assets.
const assets = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
});

const byName = Object.fromEntries(
  Object.entries(assets).map(([path, url]) => [path.split('/').pop(), url])
);

export const assetNames = Object.keys(byName).sort();

export function resolveImage(value) {
  if (!value) return '';
  if (/^(https?:|data:|\/)/.test(value)) return value;
  return byName[value] || '';
}
