// En: src/components/ProductCard.jsx

import './ProductCard.css';
import { Link } from 'react-router-dom';
import { totalStock } from '../data/catalogSeed';

function ProductCard(props) {
  // Handle both direct props and 'product' prop object
  const product = props.product || props;
  const { id, nombre, precio, imagen } = product;

  return (
    <Link to={`/product/${id}`} className="card-link">
      <div className="card">
        <img src={imagen} alt={nombre} loading="lazy" decoding="async" />
        <h3>{nombre}</h3>
        <p className="price">${precio}</p>
        {product.stock && totalStock(product) === 0 && <p className="sold-out-badge">Agotado</p>}
        {/* El botón ya no está aquí */}
      </div>
    </Link>
  );
}

export default ProductCard;