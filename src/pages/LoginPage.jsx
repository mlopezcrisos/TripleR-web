import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

function LoginPage({ products = [] }) {
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
        <AuthLayout
            eyebrow="Bienvenido de vuelta"
            title="Iniciar sesión"
            subtitle="Entra para ver tu carrito y pagar más rápido."
            products={products}
            footer={<>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></>}
        >
            <form onSubmit={handleSubmit} className="auth-form">
                {error && <p className="form-error" role="alert">{error}</p>}
                <label className="field">
                    <span className="field-label">Correo electrónico</span>
                    <input
                        type="email"
                        className="field-input"
                        placeholder="tu@correo.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label className="field">
                    <span className="field-label">Contraseña</span>
                    <input
                        type="password"
                        className="field-input"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit" className="btn btn-primary btn-block">
                    Entrar <span className="arrow" aria-hidden="true">→</span>
                </button>
            </form>

            <div className="auth-divider">o</div>

            <button type="button" onClick={handleGoogleLogin} className="btn btn-outline-dark btn-block auth-google">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" />
                Continuar con Google
            </button>
        </AuthLayout>
    );
}

export default LoginPage;
