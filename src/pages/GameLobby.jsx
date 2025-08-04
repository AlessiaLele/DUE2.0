import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {io} from 'socket.io-client';

// Connessione a Socket.IO sul backend (porta 3000)
const socket = io('http://localhost:3000');
const GameLobby = () => {
    const { lobbyName } = useParams();
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [link, setLink] = useState('');


    useEffect(() => {
        if (!lobbyName) return;
        // Genera link per la condivisione
        const generatedLink = `${window.location.origin}/game-lobby/${lobbyName}`;
        setLink(generatedLink);

        // Nome utente salvato nel localStorage
        const username = localStorage.getItem('username') || 'Giocatore';
        // Entra nella lobby (server Socket.IO si aspetta { name, username })
        socket.emit('join-lobby', { name: lobbyName, username });
        // Ascolta aggiornamenti della lobby

        socket.on('lobby-update', (data) => {
            setPlayers(data.players);

            // Se almeno 4 giocatori, vai alla partita
            if (data.players.length >= 4) {
                navigate('/multiplayer');
            }
        });

        // Gestione errori di connessione
        socket.on('connect_error', (err) => {
            console.error('Errore di connessione socket:', err.message);
        });

        socket.on('lobby-full', ({ msg }) => {
            alert(msg || 'La lobby è piena.');
            navigate('/lobby');  // torna al menu, ad esempio
             });

        // Pulisci listener
        return () => {
            socket.off('lobby-update');
            socket.off('connect_error');
            socket.off('lobby-full');
            socket.disconnect();
        };
    }, [lobbyName, navigate]);

    // Copia link negli appunti
    const handleCopyLink = () => {
        navigator.clipboard.writeText(link);
        alert('Link copiato!');
    };

    return (
        <div>
            <h1>Lobby: {lobbyName}</h1>
            <h2>Giocatori connessi: {players.length}</h2>
            <ul>
                {players.map((p, index) => (
                    <li key={index}>{p}</li>
                ))}
            </ul>
            <div>
                <p>Condividi questo link per invitare altri giocatori:</p>
                <div>
                    <input
                        type="text"
                        readOnly
                        value={link}
                    />
                    <button
                        onClick={handleCopyLink}
                        className="bottone-link"
                    >
                        Copia link
                    </button>
                </div>
            </div>
        </div>

    );
};

export default GameLobby;

