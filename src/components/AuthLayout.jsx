import { Link } from 'react-router-dom';
import './AuthLayout.css';

// Pantalla dividida para iniciar sesión y crear cuenta: a un lado la marca
// con fotos de producto, al otro el formulario en una tarjeta crema.
function AuthLayout({ eyebrow, title, subtitle, products = [], children, footer }) {
    const shots = products.slice(0, 3);

    return (
        <div className="auth">
            <section className="auth-brand" aria-hidden="true">
                <p className="eyebrow">Triple R · Merch oficial</p>
                <p className="auth-brand-title">
                    Tu música,<br /><span>en tu ropa.</span>
                </p>
                <ul className="auth-perks">
                    <li>Guarda tu carrito en todos tus dispositivos</li>
                    <li>Paga más rápido en tu siguiente compra</li>
                    <li>Envío gratis desde $2,000</li>
                </ul>
                {shots.length > 0 && (
                    <div className="auth-shots">
                        {shots.map((p, i) => (
                            <img key={p.id} src={p.imagen} alt="" className={`auth-shot auth-shot-${i + 1}`} />
                        ))}
                    </div>
                )}
            </section>

            <section className="auth-panel">
                <div className="auth-card sticker-card">
                    <p className="eyebrow auth-eyebrow">{eyebrow}</p>
                    <h1 className="auth-title">{title}</h1>
                    {subtitle && <p className="auth-subtitle">{subtitle}</p>}
                    {children}
                    {footer && <p className="auth-footer">{footer}</p>}
                </div>
                <Link to="/" className="auth-back">← Volver a la tienda</Link>
            </section>
        </div>
    );
}

export default AuthLayout;
