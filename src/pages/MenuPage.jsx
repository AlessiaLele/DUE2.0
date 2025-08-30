import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/style3.css";

const MenuPage = () => {
    const navigate = useNavigate();

    const startGame = () => {
        navigate("/game-mode");
    };

    useEffect(() => {
        const checkAuthAndConsent = async () => {
            try {
                // 🔹 Controlla consenso cookie
                const consent = localStorage.getItem("cookie_consent");
                if (!consent) {
                    navigate("/"); // torna al login se non ha accettato i cookie
                    return;
                }

                // 🔹 Controlla autenticazione
                const res = await fetch("http://localhost:3000/api/auth/profile", {
                    credentials: "include"
                });
                if (!res.ok) {
                    navigate("/"); // se non sei loggato, torna al login
                }
            } catch {
                navigate("/");
            }
        };
        checkAuthAndConsent();
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
        <div className="menu-container">
            <h1>Hack&Sink</h1>
            <button className="menu-button" onClick={startGame}>▶️ Gioca</button>
            <button className="menu-button secondary" onClick={showInstructions}>❓ Istruzioni</button>
            <button className="menu-button danger" onClick={exitGame}>↩️ Log Out</button>
        </div>
    );
};

export default MenuPage;