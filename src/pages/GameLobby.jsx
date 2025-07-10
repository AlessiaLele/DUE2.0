import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Assicurati sia la porta giusta

const GameLobby = () => {
    const { lobbyName } = useParams();
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [link, setLink] = useState('');

    useEffect(() => {
        if (!lobbyName) return;

        const generatedLink = `${window.location.origin}/game-lobby/${lobbyName}`;
        setLink(generatedLink);

        const username = localStorage.getItem('username') || 'Giocatore';

        socket.emit('join-lobby', { lobbyName, username });

        socket.on('lobby-update', (data) => {
            setPlayers(data.players);
            if (data.players.length >= 4) {
                navigate('/multiplayer');
            }
        });

        socket.on('connect_error', (err) => {
            console.error('Errore di connessione socket:', err.message);
        });

        return () => {
            socket.off('lobby-update');
        };
    }, [lobbyName, navigate]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(link);
        alert("Link copiato!");
    };

    return (
        <main className="game-lobby">
            <h1>Lobby: {lobbyName}</h1>
            <h2>Giocatori connessi: {players.length}</h2>
            <ul>
                {players.map((p, index) => (
                    <li key={index}>{p}</li>
                ))}
            </ul>
            <p>Condividi questo link per invitare altri giocatori:</p>
            <p>{link}</p>
            <button onClick={handleCopyLink}>Copia link</button>
        </main>
    );
};

export default GameLobby;
