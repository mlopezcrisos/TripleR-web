import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { functions } from '../firebase/config';
import './CheckoutPage.css';

const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');

const SHIPPING_STORAGE_KEY = 'shipping';

const emptyShipping = {
    nombre: '',
    calle: '',
    ciudad: '',
    codigoPostal: '',
    estado: '',
    telefono: '',
    email: '',
};

function loadSavedShipping() {
    try {
        return { ...emptyShipping, ...JSON.parse(localStorage.getItem(SHIPPING_STORAGE_KEY) || '{}') };
    } catch {
        return emptyShipping;
    }
}

function CheckoutPage({ cart }) {
    const total = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [shipping, setShipping] = useState(loadSavedShipping);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(
        searchParams.get('cancelado') ? 'El pago se canceló. Tu carrito sigue aquí, puedes intentarlo de nuevo.' : null
    );

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    // Rellena el correo con el de la cuenta si el usuario inició sesión.
    useEffect(() => {
        if (user?.email) {
            setShipping(s => (s.email ? s : { ...s, email: user.email }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShipping(s => ({ ...s, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shipping));
        } catch {
            // Sin almacenamiento local: no pasa nada, solo no se recuerda la dirección.
        }

        try {
            // Solo se manda id, talla, corte y cantidad: el precio lo pone el servidor.
            const items = cart.map(item => ({
                id: item.id,
                selectedSize: item.selectedSize ?? null,
                selectedCut: item.selectedCut ?? 'regular',
                quantity: item.quantity,
            }));
            const { data } = await createCheckoutSession({ items, shipping });
            window.location.assign(data.url);
        } catch (err) {
            console.error('Checkout error', err);
            setError(err.message || 'No se pudo iniciar el pago. Intenta de nuevo.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
            <h1 style={{ textAlign: 'center', color: 'var(--amarillo-acento)', marginBottom: '2rem' }}>Finalizar Compra</h1>

            <form onSubmit={handleSubmit} className="checkout-grid">
                {/* Shipping Address Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2rem', borderRadius: '16px' }}>
                    <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Dirección de Envío</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input name="nombre" value={shipping.nombre} onChange={handleChange} type="text" placeholder="Nombre completo" autoComplete="name" style={inputStyle} className="checkout-input" required />
                        <input name="email" value={shipping.email} onChange={handleChange} type="email" placeholder="Correo electrónico" autoComplete="email" style={inputStyle} className="checkout-input" required />
                        <input name="calle" value={shipping.calle} onChange={handleChange} type="text" placeholder="Calle, número y colonia" autoComplete="street-address" style={inputStyle} className="checkout-input" required />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input name="ciudad" value={shipping.ciudad} onChange={handleChange} type="text" placeholder="Ciudad" autoComplete="address-level2" style={inputStyle} className="checkout-input" required />
                            <input name="codigoPostal" value={shipping.codigoPostal} onChange={handleChange} type="text" inputMode="numeric" pattern="\d{5}" title="5 dígitos" maxLength={5} placeholder="Código Postal" autoComplete="postal-code" style={inputStyle} className="checkout-input" required />
                        </div>
                        <input name="estado" value={shipping.estado} onChange={handleChange} type="text" placeholder="Estado" autoComplete="address-level1" style={inputStyle} className="checkout-input" required />
                        <input name="telefono" value={shipping.telefono} onChange={handleChange} type="tel" placeholder="Teléfono" autoComplete="tel" minLength={8} style={inputStyle} className="checkout-input" required />
                    </div>
                </div>

                {/* Payment Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2rem', borderRadius: '16px' }}>
                    <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Pago</h2>
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            <span>Subtotal</span>
                            <span>${total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af' }}>
                            <span>Envío</span>
                            <span>Gratis</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--amarillo-acento)', fontWeight: 'bold', marginTop: '1rem', fontSize: '1.2rem' }}>
                            <span>Total</span>
                            <span>${total} MXN</span>
                        </div>
                    </div>

                    <p style={{ color: '#e5e7eb', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Al dar clic en pagar te llevaremos a la página segura de Stripe para ingresar tu tarjeta.
                    </p>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            backgroundColor: 'var(--amarillo-acento)',
                            color: 'var(--negro-texto)',
                            padding: '1rem',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: isLoading ? 'wait' : 'pointer',
                            marginTop: '1.5rem',
                            width: '100%',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Redirigiendo a Stripe...' : `Pagar $${total}`}
                    </button>

                    {error && (
                        <div role="alert" style={{ color: '#fecaca', marginTop: '1rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

const inputStyle = {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid white',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    width: '100%',
    boxSizing: 'border-box'
};

export default CheckoutPage;
