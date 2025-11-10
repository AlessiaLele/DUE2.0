import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import "bootstrap/dist/css/bootstrap.min.css";
import '../assets/style2.css';

function Login() { //stati
    const [isLogin, setIsLogin] = useState(true);
    const [otpSent, setOtpSent] = useState(false);
    const navigate = useNavigate();

    const toggleForms = () => {
        setIsLogin(!isLogin);
        setOtpSent(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();// impedisce di ricaricare automaticamente la pagina
        const formData = new FormData(e.target);
        const body = {
            email: formData.get('email'),
            password: formData.get('password'),
            consent: true
        };

        const cookieConsent = localStorage.getItem("cookie_consent");
        if (!cookieConsent) {
            alert("Devi accettare i cookie prima di accedere.");
            return;
        }
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });

            const data = await res.json(); //converte la risposta del server in oggetto js
            if (res.ok) {
                if (data.tokenS1) localStorage.setItem("tokenS1", data.tokenS1);
                alert(`Benvenuto, ${data.username}`);
                navigate('/menu-page');
            } else {
                alert(data.msg || 'Errore durante il login');
            }
        } catch (err) {
            console.error(err);
            alert('Errore di rete');
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target.form);
        const email = formData.get('email');

        try {
            const res = await fetch('http://localhost:3000/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });

            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                alert(data.msg);
            } else {
                alert(data.msg || 'Errore nell\'invio OTP');
            }
        } catch (err) {
            console.error(err);
            alert('Errore di rete');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            otp: formData.get('otp'),
            consent: true
        };

        try {
            const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                credentials: 'include'
            });

            const data = await res.json();
            if (res.ok) {
                alert(data.msg);
                setIsLogin(true);
                navigate('/menu-page');
            } else {
                alert(data.msg || 'Errore nella registrazione');
            }
        } catch (err) {
            console.error(err);
            alert('Errore di rete');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Card className="p-4 shadow" style={{ maxWidth: 400, width: "100%" }}>
                <CardContent>
                    <Typography variant="h5" className="mb-3 text-center">
                        {isLogin ? <strong>Accedi 🔑</strong> : <strong>Registrati 🔐</strong>}
                    </Typography>

                    {/* FORM LOGIN */}
                    <form
                        id="loginForm"
                        className={isLogin ? 'active' : ''}
                        onSubmit={handleLogin}
                    >
                        <TextField
                            type="email"
                            name="email"
                            label="Email"
                            required
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            type="password"
                            name="password"
                            label="Password"
                            required
                            margin="normal"
                            fullWidth
                        />
                        <Button type="submit" variant="contained" fullWidth className="mt-3">
                            Accedi
                        </Button>
                    </form>

                    {/* FORM REGISTRAZIONE */}
                    <form
                        id="registerForm"
                        className={!isLogin ? 'active' : ''}
                        onSubmit={handleRegister}
                    >
                        <TextField
                            type="text"
                            name="username"
                            label="Username"
                            required
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            type="email"
                            name="email"
                            label="Email"
                            required
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            type="password"
                            name="password"
                            label="Password"
                            required
                            margin="normal"
                            fullWidth
                        />

                        {otpSent && (
                            <TextField
                                type="text"
                                name="otp"
                                label="Inserisci OTP ricevuto"
                                required
                                margin="normal"
                                fullWidth
                            />
                        )}

                        {!otpSent ? (
                            <Button type="button" onClick={handleSendOtp} variant="outlined" fullWidth className=" mt-3">
                                Invia OTP
                            </Button>
                        ) : (
                            <Button type="submit" variant="contained" fullWidth className="mt-3">
                                Registrati
                            </Button>
                        )}
                    </form>

                    <div className="toggle-link mt-3" onClick={toggleForms}>
                        {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Login;