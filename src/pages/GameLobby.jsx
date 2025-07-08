import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";

const GameLobby = () => {
    const { lobbyName } = useParams();
    const navigate = useNavigate();
    const [players, setPlayers] = useState(1);
    const [link, setLink] = useState('');

    useEffect(() => {
        const generatedLink = `${window.location.origin}/game/${lobbyName}`;
        setLink(generatedLink);

        const fetchLobby = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/lobby/${lobbyName}`);
                if (!res.ok) {
                    console.error("Errore nel recupero lobby");
                    return;
                }
                const data = await res.json();
                setPlayers(data.lobby.players.length);

                if (data.lobby.players.length >= 4) {
                    navigate('/multiplayer');
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchLobby(); // iniziale

        const interval = setInterval(fetchLobby, 2000);

        return () => clearInterval(interval);
    }, [lobbyName, navigate]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(link);
        alert("Link copiato!");
    };

    return (
        <main className="game-lobby">
            <h1>Lobby: {lobbyName}</h1>
            <h2>Giocatori connessi: {players}</h2>
            <p>Condividi questo link per invitare altri giocatori:</p>
            <p>{link}</p>
            <button onClick={handleCopyLink}>Copia link</button>
        </main>
    );
};

export default GameLobby;
