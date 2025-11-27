import { useParams } from 'react-router-dom';

function ProductDetailPage({ products, addToCart }) {
  const { productId } = useParams();
  const product = products.find(p => p.id == productId);

  if (!product) {
    return <h2>Producto no encontrado</h2>;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '110vh' }}>
      <h1>{product.nombre}</h1>
      <img src={product.imagen} alt={product.nombre} style={{ maxWidth: '400px', borderRadius: '8px' }} />
      <p style={{ fontSize: '1.2rem' }}>{product.descripcion}</p>
      <p style={{ fontSize: '2rem', color: 'var(--amarillo-acento)', fontWeight: 'bold' }}>
        ${product.precio}
      </p>
      <button style={{
        backgroundColor: 'var(--amarillo-acento)',
        color: 'var(--negro-texto)',
        border: 'none',
        padding: '1rem 2rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1.2rem',
        fontFamily: "'Lilita One', sans-serif",
        textTransform: 'uppercase'
      }}
        onClick={() => addToCart(product)}
      >
        Agregar al Carrito
      </button>
    </div>
  );
}

export default ProductDetailPage;