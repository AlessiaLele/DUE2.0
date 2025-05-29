import React from "react";
import "../assets/style7.css";
import { useNavigate } from "react-router-dom";

function Instructions() {
    const navigate = useNavigate();

    const goBack = () => {
        navigate("/menu-page"); // Aggiorna il path in base alla tua route reale
    };

    return (
        <div className="container">
            <h1>Regole del Gioco - DUE</h1>

            <h2>🎯 Obiettivo del Gioco</h2>
            <p>L'obiettivo è essere il primo giocatore a rimanere senza carte in mano.</p>

            <h2>🃏 Regole di Base</h2>
            <ul>
                <li>Ogni giocatore inizia con ? carte.</li>
                <li>Si gioca in senso orario.</li>
                <li>Devi scartare una carta che combacia per colore o numero con quella sul mazzo centrale.</li>
                <li>Se non puoi giocare, pesca una carta dal mazzo.</li>
            </ul>

            <h2>✨ Carte Speciali</h2>
            <ul>
                <li><strong>+2</strong>: Il giocatore successivo pesca 2 carte e salta il turno.</li>
                <li><strong>Inverti</strong>: Cambia il senso di gioco.</li>
                <li><strong>Salta</strong>: Salta il turno del prossimo giocatore.</li>
                <li><strong>Cambia Colore</strong>: Puoi cambiare il colore corrente del gioco.</li>
                <li><strong>+4</strong>: Pesca 4 + cambio colore (usala solo se non hai altre carte giocabili).</li>
            </ul>

            <h2>🚨 DUE!</h2>
            <p>
                Quando resti con 2 carte in mano, devi dichiarare "DUE!" entro pochi secondi. Se non lo fai e vieni scoperto, dovrai pescare 2 carte come penalità.
            </p>

            <button onClick={goBack}>🔙 Torna al Menu</button>
        </div>
    );
}

export default Instructions;
