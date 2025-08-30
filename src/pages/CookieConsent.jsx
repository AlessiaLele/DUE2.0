import { useState, useEffect } from "react";

export default function CookieConsent({ onAccept }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookie_consent", "true");
        setVisible(false);
        if (onAccept) onAccept();
    };

    return (
        <div
            style={{
                display: visible ? "flex" : "none",
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                background: "#222",
                color: "#fff",
                padding: "15px",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 1000
            }}
        >
            <span>Per continuare, devi accettare i cookie per l’autenticazione.</span>
            <button onClick={acceptCookies} style={{ marginLeft: "10px" }}>
                Accetta
            </button>
        </div>
    );
}