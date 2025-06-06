import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/style2.css';
import axios from 'axios';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const toggleForms = () => {
        setIsLogin(!isLogin);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
            });
            console.log(response.data);
            navigate('/menu-page');
        } catch (err) {
            console.error('Errore nel login:', err);
            const msg = err.response?.data?.error || 'Errore imprevisto durante il login';
            alert('Errore nel login: ' + msg);
        }

    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const response = await axios.post('http://localhost:5000/api/register', {
                username,
                email,
                password,
            });
            console.log(response.data);
            navigate('/menu-page');
        } catch (err) {
            console.error('Errore nella registrazione:', err);
            const msg = err.response?.data?.error || 'Errore imprevisto durante la registrazione';
            alert('Errore nella registrazione: ' + msg);
        }


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