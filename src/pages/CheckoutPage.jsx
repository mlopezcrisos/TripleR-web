import { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { getCartTotal } from '../utils/cart';
import './CheckoutPage.css';

// Cuando exista el backend de pagos:
// 1. const stripePromise = loadStripe(<publishable key real>) desde '@stripe/stripe-js'.
// 2. Pedir el clientSecret al backend (create-payment-intent).
// 3. Envolver <CheckoutForm /> en <Elements stripe={stripePromise}
//    options={{ clientSecret, appearance: { theme: 'night' } }}>.

function CheckoutForm({ total }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        // This is where we would confirm the payment with the clientSecret
        // const { error } = await stripe.confirmPayment({
        //   elements,
        //   confirmParams: {
        //     return_url: "http://localhost:5173/success",
        //   },
        // });

        // For now, we simulate a delay
        setTimeout(() => {
            setIsLoading(false);
            setMessage("¡Pedido simulado con éxito! (Necesitamos backend para procesar el pago real)");
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <PaymentElement />
            <button
                disabled={isLoading || !stripe}
                id="submit"
                style={{
                    backgroundColor: 'var(--amarillo-acento)',
                    color: 'var(--negro-texto)',
                    padding: '1rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    opacity: isLoading ? 0.7 : 1
                }}
            >
                <span id="button-text">
                    {isLoading ? "Procesando..." : `Pagar $${total}`}
                </span>
            </button>
            {message && <div id="payment-message" style={{ color: 'var(--crema-fondo)', marginTop: '1rem', textAlign: 'center' }}>{message}</div>}
        </form>
    );
}

function CheckoutPage({ cart }) {
    const total = getCartTotal(cart);
    const navigate = useNavigate();

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    // We need a valid client secret to render PaymentElement. 
    // Since we don't have a backend yet, we'll show a placeholder message or 
    // we can't fully render the Stripe Element without a real intent.
    // So for this demo, I will render a "Address Form" and a placeholder for the card.

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
            <h1 style={{ textAlign: 'center', color: 'var(--amarillo-acento)', marginBottom: '2rem' }}>Finalizar Compra</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Shipping Address Section */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2rem', borderRadius: '16px' }}>
                    <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Dirección de Envío</h2>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" placeholder="Nombre completo" style={inputStyle} className="checkout-input" required />
                        <input type="text" placeholder="Calle y número" style={inputStyle} className="checkout-input" required />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" placeholder="Ciudad" style={inputStyle} className="checkout-input" required />
                            <input type="text" placeholder="Código Postal" style={inputStyle} className="checkout-input" required />
                        </div>
                        <input type="text" placeholder="Estado" style={inputStyle} className="checkout-input" required />
                        <input type="tel" placeholder="Teléfono" style={inputStyle} className="checkout-input" required />
                    </form>
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
                            <span>${total}</span>
                        </div>
                    </div>

                    {/* Placeholder for Stripe because we need backend for real Element */}
                    <div style={{
                        border: '1px dashed rgba(255,255,255,0.3)',
                        padding: '2rem',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#9ca3af'
                    }}>
                        <p>Aquí iría el formulario de tarjeta de Stripe.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>(Requiere backend para generar PaymentIntent)</p>
                    </div>

                    <button style={{
                        backgroundColor: 'var(--amarillo-acento)',
                        color: 'var(--negro-texto)',
                        padding: '1rem',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '1.5rem',
                        width: '100%'
                    }}>
                        Pagar ${total}
                    </button>
                </div>
            </div>
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
