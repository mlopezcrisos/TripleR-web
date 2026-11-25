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
      <h1>{title}</h1>
      <p className="legal-updated">Última actualización: {LEGAL.actualizado}</p>
      <div className="legal-body">{children}</div>
      <nav className="legal-nav" aria-label="Políticas">
        {LEGAL_PAGES.filter(p => p.title !== title).map(p => (
          <Link key={p.path} to={p.path}>{p.title}</Link>
        ))}
      </nav>
    </main>
  );
}

export default LegalPage;
