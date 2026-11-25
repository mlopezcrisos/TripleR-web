// En: src/components/ProductCard.jsx

import './ProductCard.css';
import { Link } from 'react-router-dom';
import { totalStock } from '../data/catalogSeed';

function ProductCard(props) {
  // Handle both direct props and 'product' prop object
  const product = props.product || props;
  const { id, nombre, precio, imagen } = product;
  const soldOut = Boolean(product.stock) && totalStock(product) === 0;
  const hasHoodie = (product.tipo || 'playera') === 'playera';

  return (
    <Link to={`/product/${id}`} className={`card-link ${soldOut ? 'is-sold-out' : ''}`}>
      <article className="card">
        <div className="card-media">
          <img src={imagen} alt={nombre} loading="lazy" decoding="async" />
          {soldOut && <span className="card-badge card-badge-sold">Agotado</span>}
          {!soldOut && hasHoodie && <span className="card-badge">También en hoodie</span>}
          <span className="card-view" aria-hidden="true">Ver producto →</span>
        </div>
        <div className="card-body">
          {props.artistName && <p className="eyebrow card-artist">{props.artistName}</p>}
          <h3 className="card-title">{nombre}</h3>
          <p className="price">${precio}<span className="price-currency"> MXN</span></p>
        </div>
      </article>
    </Link>
  );
}

export default ProductCard;
