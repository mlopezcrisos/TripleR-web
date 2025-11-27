import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function SearchPage({ products }) {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    // Filter products based on the query (case-insensitive)
    const filteredProducts = products.filter(product =>
        product.nombre.toLowerCase().includes(query.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(query.toLowerCase()) ||
        (product.artist && product.artist.toLowerCase().includes(query.toLowerCase()))
    );

    console.log('Search Query:', query);
    console.log('All Products:', products);
    console.log('Filtered Products:', filteredProducts);

    return (
        <div className="search-page">
            <h2 style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--crema-fondo)', fontSize: '2.5rem' }}>
                Resultados para: "{query}"
            </h2>

            {filteredProducts.length > 0 ? (
                <main className="product-grid">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            nombre={product.nombre}
                            precio={product.precio}
                            imagen={product.imagen}
                        />
                    ))}
                </main>
            ) : (
                <p style={{ textAlign: 'center', color: 'var(--crema-fondo)', fontSize: '1.2rem' }}>
                    No se encontraron productos que coincidan con tu búsqueda.
                </p>
            )}
        </div>
    );
}

export default SearchPage;
