import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function Lobby() {
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [players, setPlayers] = useState([]);
    const [inviteLink, setInviteLink] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const s = io("http://localhost:4000", { auth: { token } });
        setSocket(s);

        s.on("lobbyUpdate", (list) => setPlayers(list));

        s.on("roomCreated", ({ roomId, inviteLink, invitePath }) => {
            setInviteLink(inviteLink);
            setInvitePath(invitePath); // salvo anche il path interno
        });


        s.on("gameStart", ({ players }) => {
            console.log("Partita iniziata", players);
        });

        s.on("error", (msg) => alert(msg));

        return () => {
            s.disconnect();
        };
    }, [token, navigate]);

    const createRoom = () => {
        if (!socket) return;
        socket.emit("createRoom");
    };

    const joinRoom = () => {
        const id = prompt("Inserisci l'ID stanza:");
        if (id) socket.emit("joinRoom", id);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        alert("Link copiato negli appunti!");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Lobby Multiplayer</h2>
            <button onClick={createRoom}>Crea Stanza</button>
            <button onClick={joinRoom}>Unisciti a Stanza</button>

            {inviteLink && (
                <div style={{ marginTop: 20 }}>
                    <p>Invita un amico con questo link:</p>
                    <input type="text" value={inviteLink} readOnly style={{ width: "100%" }} />
                    <button onClick={copyToClipboard}>📋 Copia link</button>
                    <button onClick={() => navigate(invitePath)}>
                        Entra nella stanza
                    </button>
                </div>
            )}


            <h3>Giocatori connessi:</h3>
            <ul>
                {players.map((p, i) => (
                    <li key={i}>{p}</li>
                ))}
            </ul>
        </div>
    );
}
