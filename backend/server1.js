require('dotenv').config();

const http = require('http');

const express = require('express');

const cors = require('cors');

const { Server } = require('socket.io');

const jwt = require('jsonwebtoken');

const fetch = require('node-fetch'); // per contattare il server auth

const app = express();

const server = http.createServer(app);

app.use(cors());

app.use(express.json());

const io = new Server(server, {

    cors: {

        origin: "*", // in produzione limita al tuo dominio

        methods: ["GET", "POST"]

    }

});

// URL del tuo server Auth

const AUTH_URL = process.env.AUTH_URL || "http://localhost:3000/api/auth";

// Middleware di autenticazione via JWT

io.use(async (socket, next) => {

    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("Token mancante"));

    try {

        // Verifica del token localmente (più veloce)

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.user = decoded;

        return next();

    } catch (err) {

        return next(new Error("Token non valido"));

    }

});

// Gestione delle connessioni

io.on("connection", (socket) => {

    console.log("Utente connesso:", socket.user.id);

    // Un utente entra in una stanza

    socket.on("joinRoom", (roomId) => {

        socket.join(roomId);

        console.log(`Utente ${socket.user.id} entrato nella stanza ${roomId}`);

        // Notifica agli altri utenti

        socket.to(roomId).emit("message", `Un nuovo utente si è unito alla stanza ${roomId}`);

    });

    // Messaggi nella stanza

    socket.on("chatMessage", ({ roomId, message }) => {

        io.to(roomId).emit("chatMessage", {

            user: socket.user.id,

            message

        });

    });

    // Disconnessione

    socket.on("disconnect", () => {

        console.log(`Utente ${socket.user.id} disconnesso`);

    });

});

// Avvio server

const PORT = process.env.GAME_PORT || 5000;

server.listen(PORT, () => {

    console.log(`Game server avviato sulla porta ${PORT}`);

});

