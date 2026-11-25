import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

function HomePage({ artists, products = [] }) {
  const featured = products[0];
  const minPrice = products.length ? Math.min(...products.map(p => Number(p.precio) || 0)) : null;
  const artistName = id => artists.find(a => a.id === id)?.name;
  const latest = products.slice(0, 4);
  // Se repite la lista para que la franja se vea continua al desplazarse.
  const marquee = artists.length ? [...artists, ...artists, ...artists, ...artists] : [];

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Merch oficial · Envíos a todo México</p>
          <h1 className="hero-title">
            Lleva a tus artistas <span className="hero-title-accent">puestos.</span>
          </h1>
          <p className="hero-sub">
            Playeras, hoodies y bolsas con diseños originales de la música que traes en repeat.
            Elige tu artista, tu talla y listo.
          </p>
          <div className="hero-actions">
            <a href="#artistas" className="btn btn-primary">
              Ver merch <span className="arrow" aria-hidden="true">→</span>
            </a>
            <Link to="/nosotros" className="btn btn-ghost">Nuestra historia</Link>
          </div>
          <ul className="hero-facts">
            <li><strong>{artists.length || '—'}</strong> artistas</li>
            <li><strong>{products.length || '—'}</strong> diseños</li>
            <li><strong>Envío gratis</strong> desde $2,000</li>
          </ul>
        </div>

        {featured && (
          <Link to={`/product/${featured.id}`} className="hero-visual" aria-label={`Ver ${featured.nombre}`}>
            <div className="hero-frame">
              <img src={featured.imagen} alt={featured.nombre} />
            </div>
            {minPrice !== null && (
              <span className="hero-sticker" aria-hidden="true">
                <small>Desde</small>${minPrice}
              </span>
            )}
            <span className="hero-caption">
              <span className="eyebrow">{artistName(featured.artist) || 'Nuevo'}</span>
              <span className="hero-caption-name">{featured.nombre}</span>
            </span>
          </Link>
        )}
      </section>

      {marquee.length > 0 && (
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {marquee.map((a, i) => (
              <span key={`${a.id}-${i}`} className="marquee-item">
                {a.name}
                <span className="marquee-star">✱</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="section" id="artistas">
        <div className="section-head">
          <div>
            <p className="eyebrow">Compra por artista</p>
            <h2 className="section-title">Artistas</h2>
          </div>
          <p className="section-meta">{artists.length} colecciones disponibles</p>
        </div>

        <div className="artist-grid">
          {artists.map(artist => {
            const count = products.filter(p => p.artist === artist.id).length;
            return (
              <Link to={`/artist/${artist.id}`} key={artist.id} className="artist-card">
                <div className="artist-image-container">
                  <img src={artist.image} alt={artist.name} className="artist-image" loading="lazy" decoding="async" />
                  <div className="artist-overlay">
                    <div>
                      <h3 className="artist-name">{artist.name}</h3>
                      <p className="artist-count">{count} {count === 1 ? 'producto' : 'productos'}</p>
                    </div>
                    <span className="artist-cta" aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {latest.length > 0 && (
        <section className="section section-latest">
          <div className="section-head">
            <div>
              <p className="eyebrow">Selección de la casa</p>
              <h2 className="section-title">Destacados</h2>
            </div>
          </div>
          <div className="product-grid">
            {latest.map(product => (
              <ProductCard key={product.id} product={product} artistName={artistName(product.artist)} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default HomePage;
