import { Link, useParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './ArtistPage.css';

function ArtistPage({ products, artists = [], addToCart }) {
    const { artistId } = useParams();

    // Filter products by the artistId from the URL
    const artistProducts = products.filter(product => product.artist === artistId);

    const artist = artists.find(a => a.id === artistId);
    const artistName = artist?.name || 'Artista';

    return (
        <div className="artist-page">
            <header className="artist-hero">
                {artist?.image && <img src={artist.image} alt="" className="artist-hero-bg" />}
                <div className="artist-hero-inner">
                    <Link to="/" className="artist-back">← Todos los artistas</Link>
                    <p className="eyebrow">Merch oficial</p>
                    <h1 className="artist-hero-title">{artistName}</h1>
                    <p className="artist-hero-meta">
                        {artistProducts.length} {artistProducts.length === 1 ? 'producto' : 'productos'}
                    </p>
                </div>
            </header>

            <section className="section artist-products">
                {artistProducts.length > 0 ? (
                    <main className="product-grid">
                        {artistProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                artistName={artistName}
                                addToCart={addToCart}
                            />
                        ))}
                    </main>
                ) : (
                    <p className="artist-empty">No hay productos disponibles para este artista.</p>
                )}
            </section>
        </div>
    );
}

export default ArtistPage;
