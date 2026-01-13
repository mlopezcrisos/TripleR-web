import { useParams } from 'react-router-dom';
import { useState } from 'react';
import './ProductDetailPage.css';

function ProductDetailPage({ products, addToCart }) {
  const { productId } = useParams();
  const product = products.find(p => p.id == productId);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedCut, setSelectedCut] = useState('regular');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return <h2>Producto no encontrado</h2>;
  }

  // Hardcoded options
  const cutOptions = [
    { id: 'oversize', label: 'CORTE OVERSIZE', priceMod: 0 },
    { id: 'hoodie', label: 'HACER HOODIE', priceMod: 0 }
  ];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Por favor selecciona una talla');
      return;
    }

    const itemToAdd = {
      ...product,
      selectedSize,
      selectedCut,
      price: product.precio + (cutOptions.find(c => c.id === selectedCut)?.priceMod || 0)
    };

    // Add quantity times
    for (let i = 0; i < quantity; i++) {
      addToCart(itemToAdd);
    }
  };

  const incrementQuantity = () => setQuantity(q => q + 1);
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
          <div className="option-group">
            <label>Talla</label>
            <div className="size-selector">
              {['CH', 'M', 'G', 'EG'].map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

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

          <div className="actions-row">
            <div className="quantity-selector">
              <button onClick={decrementQuantity}>-</button>
              <span>{quantity}</span>
              <button onClick={incrementQuantity}>+</button>
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              AÑADIR AL CARRITO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;