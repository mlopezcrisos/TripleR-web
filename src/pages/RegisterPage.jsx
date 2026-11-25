import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';

function RegisterPage({ products = [] }) {
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
        <AuthLayout
            eyebrow="Únete a Triple R"
            title="Crear cuenta"
            subtitle="Tu carrito te sigue a cualquier dispositivo."
            products={products}
            footer={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
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
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <label className="field">
                    <span className="field-label">Confirmar contraseña</span>
                    <input
                        type="password"
                        className="field-input"
                        placeholder="Repite tu contraseña"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit" className="btn btn-primary btn-block">
                    Crear cuenta <span className="arrow" aria-hidden="true">→</span>
                </button>
            </form>
        </AuthLayout>
    );
}

export default RegisterPage;
