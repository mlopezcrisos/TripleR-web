import { Link } from 'react-router-dom';
import './HomePage.css'; // We'll need to create this or add styles inline/global

function HomePage({ artists }) {
  return (
    <main className="artist-grid">
      {artists.map(artist => (
        <Link to={`/artist/${artist.id}`} key={artist.id} className="artist-card">
          <div className="artist-image-container">
            <img src={artist.image} alt={artist.name} className="artist-image" />
            <div className="artist-overlay">
              <h2 className="artist-name">{artist.name}</h2>
            </div>
          </div>
        </Link>
      ))}
    </main>
  );
}

export default HomePage;