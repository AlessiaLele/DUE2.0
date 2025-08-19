import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { io } from "socket.io-client";

export default function Room() {

    const { roomId } = useParams();

    const [socket, setSocket] = useState(null);

    const [messages, setMessages] = useState([]);

    const [input, setInput] = useState("");

    useEffect(() => {

        const token = localStorage.getItem("token");

        const newSocket = io("http://localhost:5000", {

            auth: { token }

        });

        newSocket.emit("joinRoom", roomId);

        newSocket.on("chatMessage", (data) => {

            setMessages((prev) => [...prev, `${data.user}: ${data.message}`]);

        });

        setSocket(newSocket);

        return () => {

            newSocket.disconnect();

        };

    }, [roomId]);

    const sendMessage = () => {

        if (socket && input.trim() !== "") {

            socket.emit("chatMessage", { roomId, message: input });

            setInput("");

        }

    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Stanza privata: {roomId}</h2>
            <div

                style={{

                    border: "1px solid black",

                    padding: "10px",

                    height: "200px",

                    overflowY: "auto",

                    marginBottom: "10px"

                }}
            >

                {messages.map((msg, idx) => (
                    <div key={idx}>{msg}</div>

                ))}
            </div>

            <input

                type="text"

                value={input}

                onChange={(e) => setInput(e.target.value)}

                placeholder="Scrivi un messaggio..."

            />
            <button onClick={sendMessage}>Invia</button>

            <p>Condividi questo link con un amico per giocare insieme:</p>
            <code>{window.location.href}</code>
        </div>

    );

}

