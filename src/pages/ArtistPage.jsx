import { useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

function ArtistPage({ products }) {
    const { artistId } = useParams();

    // Filter products by the artistId from the URL
    const artistProducts = products.filter(product => product.artist === artistId);

    // Helper to get a display name from the ID
    const getArtistName = (id) => {
        switch (id) {
            case 'nsqk': return 'NSQK';
            case 'latin-mafia': return 'Latin Mafia';
            case 'rels-b': return 'Rels B';
            case 'ca7riel-paco': return 'CA7RIEL & Paco Amoroso';
            case 'ed-maverick': return 'Ed Maverick';
            case 'humbe': return 'Humbe';
            default: return 'Artista';
        }
    };

    return (
        <div className="artist-page">
            <h2 style={{ textAlign: 'center', margin: '2rem 0', color: 'var(--crema-fondo)', fontSize: '2.5rem' }}>
                {getArtistName(artistId)}
            </h2>

            {artistProducts.length > 0 ? (
                <main className="product-grid">
                    {artistProducts.map(product => (
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
                <p style={{ textAlign: 'center', color: 'var(--crema-fondo)' }}>No hay productos disponibles para este artista.</p>
            )}
        </div>
    );
}

export default ArtistPage;
