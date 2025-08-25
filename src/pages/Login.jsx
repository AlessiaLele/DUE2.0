import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/style2.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const toggleForms = () => {
        setIsLogin(!isLogin);
        setOtpSent(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                alert(`Benvenuto, ${data.username}`);
                navigate('/menu-page');
            } else {
                alert(data.msg);
            }
        } catch {
            alert('Errore di rete');
        }
    };

    // Invia OTP alla mail
    const handleSendOtp = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target.form);
        const email = formData.get('email');

        try {
            const res = await fetch('http://localhost:3000/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                alert(data.msg);
            } else {
                alert(data.msg);
            }
        } catch {
            alert('Errore di rete');
        }
    };

    // Conferma registrazione con OTP
    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            otp: formData.get('otp')
        };

        try {
            const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.msg);
                setIsLogin(true);
                navigate('/menu-page');
            } else {
                alert(data.msg);
            }
        } catch {
            alert('Errore di rete');
        }
    };

    return (
        <div className="login">
            <h2 id="formTitle">{isLogin ? 'Accedi' : 'Registrati'}</h2>

            {/* FORM LOGIN */}
            <form
                id="loginForm"
                className={isLogin ? 'active' : ''}
                onSubmit={handleLogin}
            >
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Accedi</button>
            </form>

            {/* FORM REGISTRAZIONE */}
            <form
                id="registerForm"
                className={!isLogin ? 'active' : ''}
                onSubmit={handleRegister}
            >
                <input type="text" name="username" placeholder="Username" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />

                {otpSent && (
                    <input type="text" name="otp" placeholder="Inserisci OTP ricevuto" required />
                )}

                {!otpSent ? (
                    <button type="button" onClick={handleSendOtp}>Invia OTP</button>
                ) : (
                    <button type="submit">Registrati</button>
                )}
            </form>

            <div className="toggle-link" onClick={toggleForms}>
                {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </div>
        </div>
    );
}

export default Login;
