import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL, LEGAL_PAGES } from '../../data/legal';
import './LegalPage.css';

function LegalPage({ title, children }) {
  useEffect(() => {
    document.title = `${title} | Triple R`;
    window.scrollTo(0, 0);
    return () => { document.title = 'Triple R | Merch de tus artistas favoritos'; };
  }, [title]);

  return (
    <main className="legal-page">
      <header className="page-head legal-head">
        <p className="eyebrow">Ayuda · Actualizado el {LEGAL.actualizado}</p>
        <h1 className="page-title">{title}</h1>
      </header>
      <div className="legal-wrap">
        <article className="legal-body sticker-card">{children}</article>
        <nav className="legal-nav" aria-label="Políticas">
          {LEGAL_PAGES.filter(p => p.title !== title).map(p => (
            <Link key={p.path} to={p.path}>{p.title} <span aria-hidden="true">→</span></Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

export default LegalPage;
