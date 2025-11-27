import './Footer.css';
import logo from '../assets/logo-horizontal.png';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <img src={logo} alt="Logo de Triple R" className="footer-logo" />
                <p>&copy; {new Date().getFullYear()} Triple R. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

export default Footer;
