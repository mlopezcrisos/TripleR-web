// En: src/components/ProductCard.jsx

import './ProductCard.css';
import { Link } from 'react-router-dom';

function ProductCard(props) {
  // Handle both direct props and 'product' prop object
  const product = props.product || props;
  const { id, nombre, precio, imagen } = product;

  return (
    <Link to={`/product/${id}`} className="card-link">
      <div className="card">
        <img src={imagen} alt={nombre} />
        <h3>{nombre}</h3>
        <p className="price">${precio}</p>
        {/* El botón ya no está aquí */}
      </div>
    </Link>
  );
}

export default ProductCard;