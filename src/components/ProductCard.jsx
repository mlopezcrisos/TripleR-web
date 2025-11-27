// En: src/components/ProductCard.jsx

import './ProductCard.css';
import { Link } from 'react-router-dom';

function ProductCard(props) {
  return (
    <Link to={`/product/${props.id}`} className="card-link">
      <div className="card">
        <img src={props.imagen} alt={props.nombre} />
        <h3>{props.nombre}</h3>
        <p className="price">${props.precio}</p>
        {/* El botón ya no está aquí */}
      </div>
    </Link>
  );
}

export default ProductCard;