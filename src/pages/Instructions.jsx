import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styleIN.css";

function Instructions() {
    const navigate = useNavigate();

    const goBack = () => {
        navigate("/menu-page");
    };

    return (
        <div className="p-5 custom-shadow">
            <Card className="instructions-container" sx={{ padding: 10 }}>
                <h1 className="welcome-title">⚓ <strong>Regole del Gioco <span  style={{ color: "#ffd700" }}>Hack & Sink</span></strong></h1>

                <h2>Obiettivo del Gioco 🎯</h2>
                <p>
                    Scoprire e compromettere per primo tutti i sistemi informatici dell’avversario:
                    Datacenter, Firewall, Webserver, Database e Router.
                </p>

                <h2>Preparazione</h2>
                <ul>
                    <li>Ogni giocatore ha una griglia (10x10 o stabilita).</li>
                    <li>Si posizionano i 5 sistemi in verticale o orizzontale senza sovrapporli:</li>
                    <ul>
                        <li><strong>Datacenter</strong> (5 celle)</li>
                        <li><strong>Firewall</strong> (4 celle)</li>
                        <li><strong>Webserver</strong> (3 celle)</li>
                        <li><strong>Database</strong> (3 celle)</li>
                        <li><strong>Router</strong> (2 celle)</li>
                    </ul>
                </ul>

                <h2> Svolgimento 💻</h2>
                <ul>
                    <li>I giocatori si alternano dichiarando una coordinata di attacco (es. C5).</li>
                    <li>Se colpisci un sistema: <strong>COLPITO</strong>.</li>
                    <li>Se tutte le celle di un sistema sono colpite: <strong>Sistema Compromesso</strong>.</li>
                    <li>Se non colpisci nulla: <strong>MANCATO</strong>.</li>
                </ul>

                <h2>Modalità di Gioco 🕹️</h2>
                <ul>
                    <li><strong>Multiplayer</strong>: gioca contro un amico creando una <em>stanza privata</em>.</li>
                    <li>Il giocatore che crea la stanza può inserire un <strong>nome</strong> oppure lasciare il campo vuoto: sarà generato un ID automatico da condividere.</li>
                </ul>

                <h2>Vittoria 🏆</h2>
                <p>
                    Vince chi compromette per primo tutti i sistemi avversari, ovvero affonda l’intera
                    infrastruttura nemica.
                </p>

                <button onClick={goBack}>Torna al Menu 🔙</button>
            </Card>
        </div>
    );
}

export default Instructions;