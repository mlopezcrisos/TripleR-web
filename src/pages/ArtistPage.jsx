import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function ArtistPage({ products, artists = [], addToCart }) {
    const { artistId } = useParams();

    // Filter products by the artistId from the URL
    const artistProducts = products.filter(product => product.artist === artistId);

    const artistName = artists.find(a => a.id === artistId)?.name || 'Artista';

    return (
        <div className="artist-page">
            <h2 style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--crema-fondo)', fontSize: '2.5rem' }}>
                {artistName}
            </h2>

            {artistProducts.length > 0 ? (
                <main className="product-grid">
                    {artistProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            addToCart={addToCart}
                        />
                    ))}
                </main>
            ) : (
                <p style={{ textAlign: 'center', color: 'var(--crema-fondo)' }}>No hay productos disponibles para este artista.</p>
            )}
        </div>
    );
}

export default ArtistPage;
