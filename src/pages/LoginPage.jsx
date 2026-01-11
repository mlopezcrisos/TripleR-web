import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loginWithGoogle } = useAuth();
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

    const handleGoogleLogin = async () => {
        try {
            setError('');
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Error al iniciar sesión con Google: ' + err.message);
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
                backgroundColor: 'rgba(255,255,255,0.2)',
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
                        className="login-input"
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid white',
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
                        className="login-input"
                        style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid white',
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

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.5)' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                        <span>O</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        style={{
                            backgroundColor: 'white',
                            color: '#333',
                            padding: '1rem',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
                        Iniciar sesión con Google
                    </button>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--amarillo-acento)', textDecoration: 'none' }}>Regístrate aquí</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
