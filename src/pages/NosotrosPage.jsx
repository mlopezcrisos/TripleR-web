import { Link } from 'react-router-dom';
import './NosotrosPage.css';

const VALUES = [
  { title: 'De fans para fans', text: 'Cada diseño nace de la energía del moshpit, el rugido de la multitud y la conexión entre el artista y su público.' },
  { title: 'Calidad que dura', text: 'Buscamos la mejor calidad para que la merch de tu banda favorita te dure tanto como los recuerdos.' },
  { title: 'Comunidad', text: 'No somos solo una tienda. Somos una comunidad que vive la música en vivo. Gracias por ser parte.' },
];

function NosotrosPage() {
  return (
    <div className="about">
      <header className="page-head about-head">
        <p className="eyebrow">Nosotros</p>
        <h1 className="page-title">Nuestra <span className="count">historia</span></h1>
      </header>

      <section className="about-story">
        <p className="about-lead">
          Triple R nació de la pasión por la música en vivo y la necesidad de llevar un recuerdo tangible de esas noches inolvidables.
        </p>
        <p className="about-body">
          No somos solo una tienda, somos fans creando para fans. Cada diseño está inspirado en la energía del moshpit,
          el rugido de la multitud y la conexión única entre el artista y su público.
        </p>
      </section>

      <section className="about-values">
        {VALUES.map((v, i) => (
          <article key={v.title} className="about-value sticker-card">
            <span className="about-value-num">0{i + 1}</span>
            <h2 className="about-value-title">{v.title}</h2>
            <p>{v.text}</p>
          </article>
        ))}
      </section>

      <div className="about-cta">
        <Link to="/" className="btn btn-primary">
          Ver la merch <span className="arrow" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

export default NosotrosPage;
