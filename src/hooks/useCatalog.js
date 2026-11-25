import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { seedProducts, seedArtists } from '../data/catalogSeed';
import { resolveImage } from '../data/images';

const byOrder = (a, b) => (a.orden ?? 999) - (b.orden ?? 999) || String(a.id).localeCompare(String(b.id));

// En Firestore `imagen`/`image` es un nombre de archivo o URL; en la app se
// reemplaza por la URL lista para <img>, y el valor original queda en `*Ref`.
const withProductImage = p => ({ ...p, imagenRef: p.imagen, imagen: resolveImage(p.imagen) });
const withArtistImage = a => ({ ...a, imageRef: a.image, image: resolveImage(a.image) });

// Escucha `products` y `artists` en Firestore en tiempo real.
// Mientras una colección esté vacía o falle, usa el catálogo inicial del código
// para que la tienda nunca se vea vacía (por ejemplo, antes de importar el catálogo).
export function useCatalog() {
  const [products, setProducts] = useState(null);
  const [artists, setArtists] = useState(null);

  useEffect(() => {
    const listen = (name, seed, set) =>
      onSnapshot(
        collection(db, name),
        snap => {
          if (snap.empty) {
            console.warn(`Firestore: "${name}" está vacío, usando el catálogo del código.`);
            set(seed);
          } else {
            set(snap.docs.map(d => ({ ...d.data(), id: d.id })));
          }
        },
        err => {
          console.error(`Firestore: no se pudo leer "${name}", usando el catálogo del código.`, err);
          set(seed);
        }
      );

    const unsubProducts = listen('products', seedProducts, setProducts);
    const unsubArtists = listen('artists', seedArtists, setArtists);

    // Sin conexión, Firestore no responde ni da error: espera unos segundos
    // y muestra el catálogo del código. Si luego llega Firestore, lo reemplaza.
    const fallback = setTimeout(() => {
      setProducts(p => p ?? seedProducts);
      setArtists(a => a ?? seedArtists);
    }, 4000);

    return () => {
      clearTimeout(fallback);
      unsubProducts();
      unsubArtists();
    };
  }, []);

  return {
    loading: products === null || artists === null,
    // Solo productos activos para la tienda; /admin lee la colección completa.
    products: (products || []).filter(p => p.activo !== false).sort(byOrder).map(withProductImage),
    artists: (artists || []).filter(a => a.activo !== false).sort(byOrder).map(withArtistImage),
  };
}
