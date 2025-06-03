import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import '../assets/style8.css';

// Simulazione di lobby (in assenza di un backend)
const fakeLobbies = [
    { name: 'Alpha', players: 2 },
    { name: 'Bravo', players: 3 },
    { name: 'Charlie', players: 1 }
];

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
            // In caso reale: navigate(`/game/${found.name}`);
        } else {
            setMessage("Nessuna lobby trovata con quel nome.");
        }
    };

    const handleCreateLobby = () => {
        if (!lobbyName) {
            setMessage("Inserisci un nome per creare una lobby.");
            return;
        }

        const exists = fakeLobbies.some(lobby => lobby.name.toLowerCase() === lobbyName.toLowerCase());
        if (exists) {
            setMessage("Una lobby con questo nome esiste già.");
        } else {
            fakeLobbies.push({ name: lobbyName, players: 1 });
            setMessage(`Lobby "${lobbyName}" creata!`);
            // In caso reale: navigate(`/game/${lobbyName}`);
        }
    };

    const handleJoinByLink = () => {
        const linkLobby = "LinkLobby"; // simulazione
        setMessage(`Unito alla lobby tramite link: ${linkLobby}`);
        // In caso reale: navigate(`/game/${linkLobby}`);
    };

    const handleJoinRandom = () => {
        if (fakeLobbies.length === 0) {
            setMessage("Nessuna lobby disponibile.");
            return;
        }

        const random = fakeLobbies[Math.floor(Math.random() * fakeLobbies.length)];
        setMessage(`Unito alla lobby casuale: ${random.name}`);
        // In caso reale: navigate(`/game/${random.name}`);
    };

    return (
        <>
            <button id="back-button" onClick={goBack}>Torna indietro</button>

            <main className="lobby-container">
                <h1>Cerca o Crea una Lobby</h1>

                <form id="lobby-form" className="lobby-form" onSubmit={handleSearch}>
                    <label htmlFor="lobby-name">Nome della Lobby:</label>
                    <input
                        id="lobby-name"
                        type="text"
                        placeholder="Inserisci il nome..."
                        value={lobbyName}
                        onChange={(e) => setLobbyName(e.target.value)}
                        required
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
