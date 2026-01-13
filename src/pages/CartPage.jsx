import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CartPage({ cart, removeFromCart }) {
    const navigate = useNavigate();
    const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
            <h1 style={{ textAlign: 'center', color: 'var(--amarillo-acento)', marginBottom: '2rem' }}>Tu Carrito</h1>

            {cart.length === 0 ? (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2rem' }}>Tu carrito está vacío.</p>
                    <Link to="/" style={{ color: 'var(--amarillo-acento)', textDecoration: 'none', fontSize: '1.2rem' }}>
                        Volver a la tienda
                    </Link>
                </div>
            ) : (
                <>
                    <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {cart.map((item) => (
                            <div key={item.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <img src={item.imagen} alt={item.nombre} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div>
                                        <h3 style={{ margin: '0', fontSize: '1rem' }}>{item.nombre}</h3>
                                        <p style={{ margin: '0', color: 'var(--amarillo-acento)' }}>${item.precio} x {item.quantity}</p>
                                        {item.selectedSize && (
                                            <p style={{ margin: '0', fontSize: '0.8rem', color: '#ccc' }}>Talla: {item.selectedSize}</p>
                                        )}
                                        {item.selectedCut && item.selectedCut !== 'regular' && (
                                            <p style={{ margin: '0', fontSize: '0.8rem', color: '#ccc' }}>Corte: {item.selectedCut}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.cartItemId || item.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--rojo-acento)',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'right', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
                        <h2 style={{ color: 'var(--amarillo-acento)' }}>Total: ${total}</h2>
                        <button
                            onClick={handleCheckout}
                            style={{
                                backgroundColor: 'var(--amarillo-acento)',
                                color: 'var(--negro-texto)',
                                border: 'none',
                                padding: '1rem 2rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                fontFamily: "'Lilita One', sans-serif",
                                textTransform: 'uppercase',
                                marginTop: '1rem'
                            }}>
                            Proceder al Pago
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default CartPage;
