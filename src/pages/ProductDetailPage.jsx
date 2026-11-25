import { useParams } from 'react-router-dom';
import { useState } from 'react';
import './ProductDetailPage.css';
import { sizesOf, stockOf, ONE_SIZE } from '../data/catalogSeed';

function ProductDetailPage({ products, loading, cart = [], addToCart }) {
  const { productId } = useParams();
  const product = products.find(p => p.id == productId);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedCut, setSelectedCut] = useState('regular');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <h2>{loading ? 'Cargando...' : 'Producto no encontrado'}</h2>;
  }

  const sizes = sizesOf(product);
  const isOneSize = sizes.length === 1 && sizes[0] === ONE_SIZE;
  const size = isOneSize ? ONE_SIZE : selectedSize;
  const isShirt = (product.tipo || 'playera') === 'playera';

  // Piezas de esta talla que ya están en el carrito (en cualquier corte).
  const inCart = s => cart
    .filter(item => item.id == product.id && (item.selectedSize || ONE_SIZE) === s)
    .reduce((sum, item) => sum + item.quantity, 0);
  const available = s => Math.max(0, stockOf(product, s) - inCart(s));
  const soldOut = sizes.every(s => stockOf(product, s) === 0);
  const maxQty = size ? available(size) : Infinity;

  // Hardcoded options
  const cutOptions = [
    { id: 'oversize', label: 'CORTE OVERSIZE', priceMod: 0 },
    { id: 'hoodie', label: 'HACER HOODIE', priceMod: 0 }
  ];

  const handleAddToCart = () => {
    if (!size) {
      alert('Por favor selecciona una talla');
      return;
    }
    if (quantity > available(size)) {
      alert(available(size) === 0
        ? 'Ya tienes en el carrito todas las piezas disponibles de esta talla.'
        : `Solo quedan ${available(size)} piezas de esta talla.`);
      return;
    }

    // El stock no viaja al carrito: se vuelve a validar al pagar.
    // eslint-disable-next-line no-unused-vars
    const { stock, ...productData } = product;
    const itemToAdd = {
      ...productData,
      selectedSize: size,
      selectedCut: isShirt ? selectedCut : 'regular',
      price: product.precio + (cutOptions.find(c => c.id === selectedCut)?.priceMod || 0)
    };

    // Add quantity times
    for (let i = 0; i < quantity; i++) {
      addToCart(itemToAdd);
    }
  };

  const incrementQuantity = () => setQuantity(q => (q < maxQty ? q + 1 : q));
  const decrementQuantity = () => setQuantity(q => (q > 1 ? q - 1 : 1));

  const currentPrice = product.precio + (cutOptions.find(c => c.id === selectedCut)?.priceMod || 0);

  return (
    <div className="product-detail-container">
      <div className="product-image-section">
        <img src={product.imagen} alt={product.nombre} />
      </div>

      <div className="product-info-section">
        <h1>{product.nombre}</h1>
        <p className="description">{product.descripcion}</p>
        <p className="price">${currentPrice.toFixed(2)}</p>

        <div className="options-container">
          {soldOut && <p className="stock-note sold-out">Agotado</p>}

          {!isOneSize && (
          <div className="option-group">
            <label>Talla</label>
            <div className="size-selector">
              {sizes.map(s => {
                const left = stockOf(product, s);
                return (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? 'active' : ''} ${left === 0 ? 'sold-out' : ''}`}
                    disabled={left === 0}
                    title={left === 0 ? 'Agotada' : undefined}
                    onClick={() => { setSelectedSize(s); setQuantity(1); }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {selectedSize && stockOf(product, selectedSize) > 0 && stockOf(product, selectedSize) <= 5 && (
              <p className="stock-note">¡Quedan {stockOf(product, selectedSize)}!</p>
            )}
          </div>
          )}

          {isShirt && (
          <div className="option-group">
            <label>Elige el ajuste de tu playera o hazla sudadera.</label>
            <div className="cut-selector">
              {cutOptions.map(cut => (
                <div
                  key={cut.id}
                  className={`cut-option ${selectedCut === cut.id ? 'active' : ''}`}
                  onClick={() => setSelectedCut(selectedCut === cut.id ? 'regular' : cut.id)}
                >
                  <span className="cut-label">{cut.label}</span>
                  {cut.priceMod > 0 && <span className="cut-price">+${cut.priceMod}</span>}
                </div>
              ))}
            </div>
          </div>
          )}

          <div className="actions-row">
            <div className="quantity-selector">
              <button onClick={decrementQuantity}>-</button>
              <span>{quantity}</span>
              <button onClick={incrementQuantity}>+</button>
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={soldOut}>
              {soldOut ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;