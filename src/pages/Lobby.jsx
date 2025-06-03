import React from 'react'
import '../assets/style8.css';
import { useNavigate } from "react-router-dom";

const Lobby = () => {
    const navigate = useNavigate();

    const goBack = () => {
    navigate("/game-mode");
    };

    return (
        <>
            <button id="back-button" onClick={goBack}>Torna indietro</button>

            <main className="lobby-container">
                <h1>Cerca o Crea una Lobby</h1>

                <form id="lobby-form" className="lobby-form">
                    <label htmlFor="lobby-name">Nome della Lobby:</label>
                    <input
                        id="lobby-name"
                        type="text"
                        placeholder="Inserisci il nome..."
                        required
                    />
                    <button type="submit">Cerca Lobby</button>
                </form>

                <div className="button-group">
                    <button id="create-lobby">Crea una Lobby</button>
                    <button id="join-link">Unisciti tramite link</button>
                    <button id="random-lobby">Casuale</button>
                </div>

                <p className="player-info">Giocatori richiesti: 4</p>
            </main>
        </>
    )
};

export default Lobby;
