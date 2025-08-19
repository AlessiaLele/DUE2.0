import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { v4 as uuidv4 } from "uuid"; // per generare ID casuali

export default function Lobby() {

    const [roomName, setRoomName] = useState("");

    const navigate = useNavigate();

    const createRoom = () => {

        // se l’utente non inserisce nome, genera un ID casuale

        const id = roomName.trim() !== "" ? roomName.trim() : uuidv4();

        // vai alla stanza

        navigate(`/room/${id}`);

    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Lobby</h2>
            <p>Puoi creare una stanza privata per giocare con un amico.</p>

            <input

                type="text"

                value={roomName}

                onChange={(e) => setRoomName(e.target.value)}

                placeholder="Nome stanza (opzionale)"

            />
            <button onClick={createRoom}>Crea stanza privata</button>
        </div>

    );

}

