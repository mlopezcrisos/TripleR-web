// En: src/App.jsx

import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { useAuth } from './context/AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';

function App() {
  const { products, artists, loading: catalogLoading } = useCatalog();
  // En el inicio solo aparecen artistas con al menos un producto visible.
  const artistsWithProducts = artists.filter(a => products.some(p => p.artist === a.id));

  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync cart with Firestore when user logs in
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "carts", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setCart(docSnap.data().items || []);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Save cart to localStorage (always) and Firestore (if logged in)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));

    if (user) {
      const docRef = doc(db, "carts", user.uid);
      setDoc(docRef, { items: cart }, { merge: true });
    }
  }, [cart, user]);

  const addToCart = (product) => {
    setCart(prevCart => {
      // Create a unique ID for the cart item based on product ID and selected options
      const cartItemId = `${product.id}-${product.selectedSize || 'default'}-${product.selectedCut || 'default'}`;

      const existingItem = prevCart.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        return prevCart.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      // If it's a new item configuration, add it with the unique cartItemId
      // Note: We already receive 'price' calculated from the detail page, but we should ensure it persists
      return [...prevCart, { ...product, cartItemId, quantity: 1 }];
    });
    alert("¡Producto agregado al carrito!");
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  return (
    <div>
      <Navbar cart={cart} />
      <Routes>
        <Route path="/" element={<HomePage artists={artistsWithProducts} />} />
        <Route path="/product/:productId" element={<ProductDetailPage products={products} loading={catalogLoading} cart={cart} addToCart={addToCart} />} />
        <Route path="/artist/:artistId" element={<ArtistPage products={products} artists={artists} addToCart={addToCart} />} />
        <Route path="/search" element={<SearchPage products={products} addToCart={addToCart} />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;