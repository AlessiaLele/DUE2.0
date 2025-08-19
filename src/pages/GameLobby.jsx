import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const GameLobby = () => {
    const { lobbyName } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [socket, setSocket] = useState(null);
    const [opponentMove, setOpponentMove] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const s = io("http://localhost:3001", {
            auth: { token }
        });
        setSocket(s);

        s.emit("joinRoom", lobbyName);

        s.on("opponentMove", (move) => {
            setOpponentMove(move);
        });

        s.on("error", (msg) => {
            alert(msg);
            navigate("/multiplayer");
        });

        return () => {
            s.disconnect();
        };
    }, [token, lobbyName, navigate]);

    const makeMove = () => {
        const move = prompt("Inserisci coordinata mossa (es: B4):");
        if (move) {
            socket.emit("makeMove", { roomId: lobbyName, move });
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Stanza: {lobbyName}</h2>
            <button onClick={() => navigate("/multiplayer")}>Torna alla Lobby</button>
            <button onClick={makeMove}>Fai Mossa</button>
            {opponentMove && (
                <p>Mossa avversario: <b>{opponentMove}</b></p>
            )}
        </div>
    );
}
export default GameLobby;
