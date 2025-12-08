import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Error al iniciar sesión: ' + err.message);
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
                }}>Iniciar Sesión</h2>

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
                        Entrar
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--amarillo-acento)', textDecoration: 'none' }}>Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
