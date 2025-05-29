import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/style2.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const toggleForms = () => {
        setIsLogin(!isLogin);
    };
    const handleLogin = (e) => {
        e.preventDefault();
        // qui potresti validare il login con fetch / axios
        // per ora simula un successo:
        navigate('/MenuPage.jsx');
    };

    const handleRegister = (e) => {
        e.preventDefault();
        // anche qui potresti inviare i dati al server
        navigate('/MenuPage.jsx');
    };

    return (
        <div className="login">
            <h2 id="formTitle">{isLogin ? 'Accedi' : 'Registrati'}</h2>

            <form
                id="loginForm"
                className={isLogin ? 'active' : ''}
                onSubmit={handleLogin}
            >
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Accedi</button>
            </form>

            <form
                id="registerForm"
                className={!isLogin ? 'active' : ''}
                onSubmit={handleRegister}
            >
                <input type="text" name="username" placeholder="Username" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Registrati</button>
            </form>

            <div className="toggle-link" onClick={toggleForms}>
                {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </div>
        </div>
    );
}

export default Login;