// En: src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import NosotrosPage from './pages/NosotrosPage'; // 1. Importa la nueva página

import Footer from './components/Footer';

import ArtistPage from './pages/ArtistPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import { useCatalog } from './hooks/useCatalog';
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
  const { products, artists, loading: catalogLoading } = useCatalog();
  // En el inicio solo aparecen artistas con al menos un producto visible.
  const artistsWithProducts = artists.filter(a => products.some(p => p.artist === a.id));

  const { user } = useAuth();
  const [cart, setCart] = useState(loadLocalCart);
  // uid cuyo carrito de Firestore ya se fusionó con el local. Hasta entonces
  // no escribimos en Firestore, para no pisar el carrito guardado.
  const [syncedUid, setSyncedUid] = useState(null);
  // Aviso breve al agregar al carrito (reemplaza el alert del navegador).
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

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
    setToast({
      id: Date.now(),
      text: quantity > 1 ? `${quantity} piezas agregadas al carrito` : 'Agregado al carrito',
    });
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
        <Route path="/" element={<HomePage artists={artistsWithProducts} products={products} />} />
        <Route path="/product/:productId" element={<ProductDetailPage products={products} loading={catalogLoading} cart={cart} addToCart={addToCart} />} />
        <Route path="/artist/:artistId" element={<ArtistPage products={products} artists={artists} addToCart={addToCart} />} />
        <Route path="/search" element={<SearchPage products={products} addToCart={addToCart} />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
      </Routes>
      <Footer />
      {toast && (
        <div className="toast" role="status" key={toast.id}>
          <span className="toast-check" aria-hidden="true">✓</span>
          <p className="toast-text">{toast.text}</p>
          <Link to="/cart" className="toast-link" onClick={() => setToast(null)}>Ver carrito</Link>
        </div>
      )}
    </div>
  );
}

export default App;