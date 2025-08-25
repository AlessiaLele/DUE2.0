import React from "react";
import "../assets/style7.css";
import { useNavigate } from "react-router-dom";

function Instructions() {
    const navigate = useNavigate();

    const goBack = () => {
        navigate("/menu-page");
    };

    return (
        <div className="instructions-container">
            <h1>⚓ Regole del Gioco - Hack & Sink</h1>

            <h2>🎯 Obiettivo del Gioco</h2>
            <p>
                Scoprire e compromettere per primo tutti i sistemi informatici dell’avversario:
                Datacenter, Firewall, Webserver, Database e Router.
            </p>

            <h2>🛠️ Preparazione</h2>
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

            <h2>💻 Svolgimento</h2>
            <ul>
                <li>I giocatori si alternano dichiarando una coordinata di attacco (es. C5).</li>
                <li>Se colpisci un sistema: <strong>COLPITO</strong>.</li>
                <li>Se tutte le celle di un sistema sono colpite: <strong>Sistema Compromesso</strong>.</li>
                <li>Se non colpisci nulla: <strong>MANCATO</strong>.</li>
            </ul>

            <h2>🕹️ Modalità di Gioco</h2>
            <ul>
                <li><strong>Contro il Bot</strong>: sfida un bot e metti alla prova la tua strategia.</li>
                <li><strong>Multiplayer</strong>: gioca contro un amico creando una <em>stanza privata</em>.</li>
                <li>Il giocatore che crea la stanza sceglie il <strong>nome della stanza</strong>, che dovrà poi essere condiviso per permettere all’amico di entrare.</li>
            </ul>

            <h2>🏆 Vittoria</h2>
            <p>
                Vince chi compromette per primo tutti i sistemi avversari, ovvero affonda l’intera
                infrastruttura nemica.
            </p>

            <button onClick={goBack}>🔙 Torna al Menu</button>
        </div>
    );
}

export default Instructions;
