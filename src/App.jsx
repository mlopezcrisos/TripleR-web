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
import { useAuth } from './context/AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/config';

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
        <Route path="/" element={<HomePage artists={artists} />} />
        <Route path="/product/:productId" element={<ProductDetailPage products={products} addToCart={addToCart} />} />
        <Route path="/artist/:artistId" element={<ArtistPage products={products} addToCart={addToCart} />} />
        <Route path="/search" element={<SearchPage products={products} addToCart={addToCart} />} />
        <Route path="/nosotros" element={<NosotrosPage />} />
        <Route path="/cart" element={<CartPage cart={cart} removeFromCart={removeFromCart} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;