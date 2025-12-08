import './Footer.css';
import logo from '../assets/logo-horizontal.png';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Brand Section */}
                <div className="footer-section brand">
                    <img src={logo} alt="Triple R Logo" className="footer-logo" />
                    <p className="footer-description">
                        Tu destino número uno para merch oficial de tus artistas favoritos.
                        Estilo, música y autenticidad en cada prenda.
                    </p>
                    <div className="social-icons">
                        <a href="https://www.instagram.com/tripleerremx/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        <a href="mailto:contacto@tripler.com" aria-label="Email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Links Section */}
                <div className="footer-section links">
                    <h3>Explorar</h3>
                    <ul>
                        <li><a href="/">Inicio</a></li>
                        <li><a href="/nosotros">Nosotros</a></li>
                        <li><a href="/search">Buscar</a></li>
                        <li><a href="/cart">Carrito</a></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div className="footer-section contact">
                    <h3>Contacto</h3>
                    <p>
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </span>
                        tripleerremx@gmail.com
                    </p>
                    <p>
                        <span className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </span>
                        @tripleerremx
                    </p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Triple R. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;
