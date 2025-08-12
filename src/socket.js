import { io } from "socket.io-client";

// Qui metti l'URL del server lobby
export const connectSocket = (token) => {
    return io("http://localhost:4000", {
        auth: { token }
    });
};
