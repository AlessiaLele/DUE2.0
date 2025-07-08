import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../assets/style8.css';

const fakeLobbies = [];

const Lobby = () => {
    const navigate = useNavigate();
    const [lobbyName, setLobbyName] = useState('');
    const [message, setMessage] = useState('');

    const goBack = () => {
        navigate("/menu-page");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const found = fakeLobbies.find(lobby => lobby.name.toLowerCase() === lobbyName.toLowerCase());
        if (found) {
            setMessage(`Lobby trovata: ${found.name} con ${found.players} giocatori`);
        } else {
            setMessage("Nessuna lobby trovata con quel nome.");
        }
    };

    const handleCreateLobby = () => {
        const name = prompt("Inserisci il nome univoco della lobby:");
        if (!name) {
            setMessage("Nome non valido.");
            return;
        }
        const exists = fakeLobbies.some(lobby => lobby.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            setMessage("Una lobby con questo nome esiste già.");
        } else {
            fakeLobbies.push({ name: name, players: 1 });
            navigate(`/game/${name}`);
        }
    };

    const handleJoinByLink = () => {
        const userLink = prompt("Incolla qui il link della lobby:");
        if (!userLink) return;

        const name = userLink.split("/").pop();
        const found = fakeLobbies.find(lobby => lobby.name === name);
        if (found) {
            found.players += 1;
            navigate(`/game/${name}`);
        } else {
            setMessage("Nessuna lobby trovata con questo link.");
        }
    };

    const handleJoinRandom = () => {
        if (fakeLobbies.length === 0) {
            setMessage("Nessuna lobby disponibile.");
            return;
        }
        const random = fakeLobbies[Math.floor(Math.random() * fakeLobbies.length)];
        random.players += 1;
        navigate(`/game/${random.name}`);
    };

    return (
        <>
            <button id="back-button" onClick={goBack}>Torna indietro</button>
            <main className="lobby-container">
                <h1 id="lobby">Cerca o Crea una Lobby</h1>
                <form id="lobby-form" onSubmit={handleSearch}>
                    <label htmlFor="lobby-name">Nome della Lobby:</label>
                    <input
                        id="lobby-name"
                        type="text"
                        placeholder="Inserisci il nome..."
                        value={lobbyName}
                        onChange={(e) => setLobbyName(e.target.value)}
                    />
                    <button type="submit">Cerca Lobby</button>
                </form>

                <div className="button-group">
                    <button id="create-lobby" onClick={handleCreateLobby}>Crea una Lobby</button>
                    <button id="join-link" onClick={handleJoinByLink}>Unisciti tramite link</button>
                    <button id="random-lobby" onClick={handleJoinRandom}>Casuale</button>
                </div>

                <p className="player-info">Giocatori richiesti: 4</p>
                {message && <p style={{ marginTop: '1rem', color: 'lightgreen' }}>{message}</p>}
            </main>
        </>
    );
};

export default Lobby;
