import { Link, useNavigate } from 'react-router-dom';
import { getCartTotal, getItemPrice } from '../utils/cart';
import './CartPage.css';

// Mismo umbral que anuncia la barra superior de la tienda.
const FREE_SHIPPING_FROM = 2000;
const CUT_LABELS = { oversize: 'Oversize', hoodie: 'Hoodie' };
const SIZE_LABELS = { UNICA: 'Talla única' };

const money = n => `$${Number(n).toLocaleString('es-MX')}`;

function CartPage({ cart, updateQuantity, removeFromCart }) {
    const navigate = useNavigate();
    const total = getCartTotal(cart);
    const pieces = cart.reduce((sum, item) => sum + item.quantity, 0);
    const missing = Math.max(0, FREE_SHIPPING_FROM - total);
    const progress = Math.min(100, Math.round((total / FREE_SHIPPING_FROM) * 100));

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-empty sticker-card">
                    <p className="eyebrow cart-empty-eyebrow">Tu carrito</p>
                    <h1 className="cart-empty-title">Está vacío… por ahora.</h1>
                    <p className="cart-empty-text">Encuentra la merch de tus artistas favoritos y arma tu outfit.</p>
                    <Link to="/" className="btn btn-primary">
                        Ver merch <span className="arrow" aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <header className="page-head">
                <p className="eyebrow">Tu pedido</p>
                <h1 className="page-title">
                    Carrito <span className="count">({pieces})</span>
                </h1>
            </header>

            <div className="cart-layout">
                <ul className="cart-items">
                    {cart.map((item) => {
                        const unit = getItemPrice(item);
                        const cut = item.selectedCut && item.selectedCut !== 'regular'
                            ? CUT_LABELS[item.selectedCut] || item.selectedCut
                            : null;
                        return (
                            <li key={item.cartItemId} className="cart-item sticker-card">
                                <Link to={`/product/${item.id}`} className="cart-item-media">
                                    <img src={item.imagen} alt={item.nombre} loading="lazy" decoding="async" />
                                </Link>

                                <div className="cart-item-info">
                                    <Link to={`/product/${item.id}`} className="cart-item-name">{item.nombre}</Link>
                                    <div className="cart-item-tags">
                                        {item.selectedSize && (
                                            <span className="tag">{SIZE_LABELS[item.selectedSize] || `Talla ${item.selectedSize}`}</span>
                                        )}
                                        {cut && <span className="tag">{cut}</span>}
                                    </div>
                                    <p className="cart-item-unit">{money(unit)} c/u</p>
                                </div>

                                <div className="cart-item-side">
                                    <p className="cart-item-subtotal">{money(unit * item.quantity)}</p>
                                    <div className="stepper">
                                        <button
                                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            aria-label={`Quitar uno de ${item.nombre}`}
                                        >
                                            −
                                        </button>
                                        <span aria-live="polite">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                            aria-label={`Agregar uno de ${item.nombre}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        className="cart-item-remove"
                                        onClick={() => removeFromCart(item.cartItemId)}
                                        aria-label={`Eliminar ${item.nombre} del carrito`}
                                    >
                                        Quitar
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <aside className="cart-summary sticker-card" aria-label="Resumen del pedido">
                    <h2 className="cart-summary-title">Resumen</h2>

                    <div className="shipping-meter">
                        <p className="shipping-meter-text">
                            {missing > 0
                                ? <>Te faltan <strong>{money(missing)}</strong> para el envío gratis</>
                                : <><strong>¡Ya tienes envío gratis!</strong></>}
                        </p>
                        <div
                            className="shipping-meter-bar"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progress}
                            aria-label="Avance hacia el envío gratis"
                        >
                            <span style={{ width: `${progress}%` }} className={missing === 0 ? 'done' : ''} />
                        </div>
                    </div>

                    <dl className="cart-summary-rows">
                        <div>
                            <dt>Subtotal</dt>
                            <dd>{money(total)}</dd>
                        </div>
                        <div>
                            <dt>Envío</dt>
                            <dd>{missing === 0 ? 'Gratis' : 'Se calcula al pagar'}</dd>
                        </div>
                        <div className="cart-summary-total">
                            <dt>Total</dt>
                            <dd>{money(total)} <small>MXN</small></dd>
                        </div>
                    </dl>

                    <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
                        Proceder al pago <span className="arrow" aria-hidden="true">→</span>
                    </button>
                    <Link to="/" className="cart-summary-continue">Seguir comprando</Link>
                </aside>
            </div>
        </div>
    );
}

export default CartPage;
