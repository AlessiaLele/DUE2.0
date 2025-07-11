import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Assicurati che la porta sia corretta

socket.on('lobby-full', ({ msg }) => {
    alert(msg || 'La lobby è piena.');
});

function Lobby() {
    const [lobbyName, setLobbyName] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newLobbyName, setNewLobbyName] = useState('');
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/menu-page');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!lobbyName.trim()) {
            setMessage("Inserisci un nome di lobby.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/lobby/${lobbyName}`);
            const data = await res.json();

            if (res.ok && data.lobby) {
                navigate(`/game-lobby/${lobbyName}`);
            } else {
                setMessage("Lobby non trovata.");
            }
        } catch (err) {
            setMessage("Errore durante la ricerca della lobby.");
        }
    };

    const handleCreateLobby = async () => {
        const nome = prompt("Inserisci il nome della lobby:");
        if (!nome) return;

        const username = localStorage.getItem('username');
        const res = await fetch('http://localhost:3000/api/lobby/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome, username })
        });

        const data = await res.json();
        if (res.ok) {
            socket.emit('create-lobby', { name: nome, username });
            navigate(`/game-lobby/${nome}`);
        } else {
            alert(data.msg);
        }
    };


    const handleJoinByLink = () => {
        const link = prompt("Incolla il link della lobby:");
        if (link) {
            const parts = link.split('/');
            const name = parts[parts.length - 1];
            if (name) {
                setLobbyName(name);
                navigate(`/game-lobby/${name}`);
            } else {
                setMessage("Link non valido.");
            }
        }
    };

    const handleJoinRandom = () => {
        const randomName = 'lobby-' + Math.random().toString(36).substring(7);
        socket.emit('join-lobby', {
            lobbyName: randomName,
            username: localStorage.getItem('username') || 'Giocatore'
        });
        navigate(`/game-lobby/${randomName}`);
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

            {/* POPUP PER CREAZIONE LOBBY */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Nome della nuova Lobby</h2>
                        <input
                            type="text"
                            value={newLobbyName}
                            onChange={(e) => setNewLobbyName(e.target.value)}
                            placeholder="Es. Stanza123"
                        />
                        <div className="modal-buttons">
                            <button onClick={confirmCreateLobby}>Conferma</button>
                            <button onClick={() => setShowModal(false)}>Annulla</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Lobby;
