// En: src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import NosotrosPage from './pages/NosotrosPage'; // 1. Importa la nueva página

import imgPlayera from './assets/playera_nsqk.png';
import imgBolsa from './assets/bolsa_nsqk.png';
import imgLatinMafia1 from './assets/playera_latin_mafia_1.jpg';
import imgLatinMafia2 from './assets/playera_latin_mafia_2.jpg';
import imgRelsB from './assets/playera_rels_b.jpg';
import imgNsqkDythm from './assets/playera_nsqk_dythm.jpg';
import imgNsqkHp from './assets/playera_nsqk_hp.jpg';

// Artist Cover Images
import imgArtistLatinMafia from './assets/artist_latin_mafia.jpg';
import imgArtistNsqk from './assets/artist_nsqk.png';
import imgArtistRelsB from './assets/artist_rels_b.png';
import imgArtistCa7rielPaco from './assets/artist_ca7riel_paco.png';
import imgArtistEdMaverick from './assets/artist_ed_maverick.png';
import imgArtistHumbe from './assets/artist_humbe.jpg';

import Footer from './components/Footer';

import ArtistPage from './pages/ArtistPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import { useAuth } from './context/useAuth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';
import {
  CART_OWNER_KEY,
  CART_STORAGE_KEY,
  getCartItemId,
  getItemPrice,
  loadLocalCart,
  mergeCarts,
  normalizeCart,
  sameCart,
} from './utils/cart';

function App() {
  const products = [
    { id: 1, nombre: "Playera Nsqk", precio: 200, imagen: imgPlayera, descripcion: "Playera de algodón peinado", artist: "nsqk" },
    { id: 2, nombre: "Bolsa de manta Nsqk'", precio: 150, imagen: imgBolsa, descripcion: "Tote bag de manta cruda 40x40", artist: "nsqk" },
    { id: 3, nombre: "Siento que merezco más - Latin Mafia", precio: 250, imagen: imgLatinMafia1, descripcion: "Playera oficial Latin Mafia", artist: "latin-mafia" },
    { id: 4, nombre: "Te odio y te extraño mucho - Latin Mafia", precio: 250, imagen: imgLatinMafia2, descripcion: "Playera oficial Latin Mafia", artist: "latin-mafia" },
    { id: 5, nombre: "Rels B", precio: 250, imagen: imgRelsB, descripcion: "Playera oficial Rels B", artist: "rels-b" },
    { id: 6, nombre: "Do you think about me - NSQK", precio: 250, imagen: imgNsqkDythm, descripcion: "Playera oficial NSQK", artist: "nsqk" },
    { id: 7, nombre: "¿Has pensado en ese hombre? - NSQK", precio: 250, imagen: imgNsqkHp, descripcion: "Playera oficial NSQK", artist: "nsqk" }
  ];

  const artists = [
    { id: 'nsqk', name: 'NSQK', image: imgArtistNsqk },
    { id: 'latin-mafia', name: 'Latin Mafia', image: imgArtistLatinMafia },
    { id: 'rels-b', name: 'Rels B', image: imgArtistRelsB },
    { id: 'ca7riel-paco', name: 'CA7RIEL & Paco Amoroso', image: imgArtistCa7rielPaco },
    { id: 'ed-maverick', name: 'Ed Maverick', image: imgArtistEdMaverick },
    { id: 'humbe', name: 'Humbe', image: imgArtistHumbe }

  ];

  const { user } = useAuth();
  const [cart, setCart] = useState(loadLocalCart);
  // uid cuyo carrito de Firestore ya se fusionó con el local. Hasta entonces
  // no escribimos en Firestore, para no pisar el carrito guardado.
  const [syncedUid, setSyncedUid] = useState(null);

  // Al iniciar sesión: fusiona el carrito de invitado con el de Firestore y
  // escucha cambios hechos desde otros dispositivos.
  // Al cerrar sesión: vacía el carrito local para que no quede a la vista
  // del siguiente invitado ni se vuelva a sumar en el próximo login.
  useEffect(() => {
    if (!user) {
      setSyncedUid(null);
      if (localStorage.getItem(CART_OWNER_KEY)) {
        localStorage.removeItem(CART_OWNER_KEY);
        setCart([]);
      }
      return;
    }

    const docRef = doc(db, "carts", user.uid);
    let cancelled = false;
    let unsubscribe = () => {};

    (async () => {
      try {
        const snap = await getDoc(docRef);
        if (cancelled) return;

        const remote = snap.exists() ? normalizeCart(snap.data().items) : null;
        // Si el carrito local ya era de este usuario (p. ej. recargó la
        // página), Firestore es la fuente de verdad. Si era de invitado,
        // se suman ambos.
        const localIsTheirs = localStorage.getItem(CART_OWNER_KEY) === user.uid;
        setCart(local => {
          if (!remote) return local;
          return localIsTheirs ? remote : mergeCarts(remote, local);
        });
        localStorage.setItem(CART_OWNER_KEY, user.uid);
        setSyncedUid(user.uid);

        unsubscribe = onSnapshot(docRef, (docSnap) => {
          // Ignora el eco de nuestras propias escrituras.
          if (docSnap.metadata.hasPendingWrites || !docSnap.exists()) return;
          const items = normalizeCart(docSnap.data().items);
          setCart(prev => (sameCart(prev, items) ? prev : items));
        });
      } catch (error) {
        console.error("No se pudo sincronizar el carrito con Firestore:", error);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  // Guarda el carrito en localStorage (siempre) y en Firestore (si hay sesión
  // y ya se hizo la fusión).
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

    if (user && syncedUid === user.uid) {
      const docRef = doc(db, "carts", user.uid);
      setDoc(docRef, { items: cart }, { merge: true }).catch(error => {
        console.error("No se pudo guardar el carrito en Firestore:", error);
      });
    }
  }, [cart, user, syncedUid]);

  const addToCart = (product, quantity = 1) => {
    const cartItemId = getCartItemId(product);
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        return prevCart.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }

      return [...prevCart, { ...product, price: getItemPrice(product), cartItemId, quantity }];
    });
    alert(quantity > 1
      ? `¡${quantity} productos agregados al carrito!`
      : "¡Producto agregado al carrito!");
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) return;
    setCart(prevCart => prevCart.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  return (
    <div>
      <Navbar cart={cart} />
      <Routes>
        <Route path="/" element={<HomePage artists={artists} />} />
        <Route path="/product/:productId" element={<ProductDetailPage products={products} addToCart={addToCart} />} />
        <Route path="/artist/:artistId" element={<ArtistPage products={products} addToCart={addToCart} />} />
        <Route path="/search" element={<SearchPage products={products} addToCart={addToCart} />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;