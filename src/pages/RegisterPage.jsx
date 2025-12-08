import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }

        try {
            setError('');
            await signup(email, password);
            navigate('/');
        } catch (err) {
            setError('Error al registrarse: ' + err.message);
        }
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '3rem',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h2 style={{
                    color: 'var(--amarillo-acento)',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontSize: '2rem'
                }}>Crear Cuenta</h2>

                {error && <div style={{ color: 'var(--rojo-acento)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirmar Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '1rem'
                        }}
                        required
                    />
                    <button type="submit" style={{
                        backgroundColor: 'var(--amarillo-acento)',
                        color: 'var(--negro-texto)',
                        padding: '1rem',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}>
                        Registrarse
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--amarillo-acento)', textDecoration: 'none' }}>Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
