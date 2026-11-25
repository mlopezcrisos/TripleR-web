import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

// Página a la que Stripe regresa al cliente después de pagar.
// El pedido lo marca como pagado el webhook de Stripe (no esta página).
function CheckoutSuccessPage({ clearCart }) {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order');
    const { user } = useAuth();
    const [status, setStatus] = useState(null);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    // Si el usuario inició sesión puede leer su pedido y ver el estado en vivo.
    useEffect(() => {
        if (!user || !orderId) return;
        const unsubscribe = onSnapshot(
            doc(db, 'orders', orderId),
            (snap) => setStatus(snap.exists() ? snap.data().status : null),
            () => setStatus(null)
        );
        return () => unsubscribe();
    }, [user, orderId]);

    const message =
        ['pagado', 'enviado', 'entregado'].includes(status) ? 'Pago confirmado.' :
        status === 'pendiente' ? 'Confirmando tu pago...' :
        null;

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto', minHeight: '70vh', textAlign: 'center', color: 'white' }}>
            <h1 style={{ color: 'var(--amarillo-acento)', marginBottom: '1.5rem' }}>¡Gracias por tu compra!</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                Recibimos tu pedido y te enviaremos la confirmación por correo.
            </p>
            {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
            {orderId && (
                <p style={{ marginTop: '1rem', color: '#e5e7eb' }}>
                    Número de pedido: <strong>{orderId}</strong>
                </p>
            )}
            <Link
                to="/"
                style={{
                    display: 'inline-block',
                    marginTop: '2rem',
                    backgroundColor: 'var(--amarillo-acento)',
                    color: 'var(--negro-texto)',
                    padding: '0.9rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textDecoration: 'none'
                }}
            >
                Seguir comprando
            </Link>
        </div>
    );
}

export default CheckoutSuccessPage;
