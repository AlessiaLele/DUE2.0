import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/style3.css";

const MenuPage = () => {
    const navigate = useNavigate();

    const startGame = () => {
        navigate("/lobby");
    };
    // 🔹 Funzione per richiedere un nuovo Access Token
    const refreshToken = async () => {
        try {
            const res = await fetch("http://localhost:3000/api/auth/refresh", {
                method: "POST",
                credentials: "include",
            });

            if (!res.ok) {
                console.warn("Refresh token non valido o scaduto");
                navigate("/"); // torna alla pagina iniziale se refresh fallisce
            }
        } catch (err) {
            console.error("Errore nel refresh token:", err);
            navigate("/");
        }
    };

    useEffect(() => {
        const checkAuthAndConsent = async () => {
            try {
                // 🔹 Controlla consenso cookie
                const consent = localStorage.getItem("cookie_consent");
                if (!consent) {
                    navigate("/"); // torna alla pagina iniziale se non ha accettato i cookie
                    return;
                }

                // 🔹 Controlla autenticazione
                const res = await fetch("http://localhost:3000/api/auth/profile", {
                    credentials: "include"
                });
                if (!res.ok) {
                    navigate("/"); // se non sei loggato, torna alla pagina inziale
                }
            } catch {
                navigate("/");
            }
        };
        checkAuthAndConsent();

        const refreshInterval = setInterval(refreshToken, 14 * 60 * 1000);

        return () => clearInterval(refreshInterval);

    }, [navigate]);

    const showInstructions = () => {
        navigate("/Instructions");
    };

    const exitGame = async () => {
        await fetch("http://localhost:3000/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });

        // 🔹 Reset consenso cookie al logout
        localStorage.removeItem("cookie_consent");

        alert("Grazie per aver giocato a Hack&Sink!");
        navigate("/");
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="menu-container">
            <h1 className="welcome-title"><strong> Hack & Sink</strong> </h1>
            <button className="menu-button" onClick={startGame}>▶️ Gioca</button>
            <button className="menu-button secondary" onClick={showInstructions}>❓ Istruzioni</button>
            <button className="menu-button danger" onClick={exitGame}>↩️ Log Out</button>
        </div>
        </div>
    );
};

export default MenuPage;