import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // per generare ID casuali

export default function Lobby() {
    const [roomName, setRoomName] = useState("");
    const [joinId, setJoinId] = useState("");
    const navigate = useNavigate();

    const createRoom = () => {
        const id = roomName.trim() !== "" ? roomName.trim() : uuidv4();
        navigate(`/room/${id}`);
    };

    const joinRoom = () => {
        if (joinId.trim() !== "") {
            navigate(`/room/${joinId.trim()}`);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Lobby</h2>
            <p>Puoi creare una stanza privata per giocare con un amico oppure unirti a una stanza esistente.</p>

            {/* Creazione stanza */}
            <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Nome stanza (opzionale)"
            />
            <button onClick={createRoom}>Crea stanza privata</button>

            <hr />

            {/* Join stanza esistente */}
            <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="ID stanza"
            />
            <button onClick={joinRoom}>Unisciti</button>
        </div>
    );
}
