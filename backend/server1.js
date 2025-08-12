require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const verifyToken = require('./utils/verifyToken');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In produzione mettere il dominio corretto
        methods: ["GET", "POST"]
    }
});

// Lista giocatori e stanze
let lobbyPlayers = [];
let gameRooms = {}; // { roomId: { players: [], boardStates: {} } }

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error("Token mancante"));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return next(new Error("Token non valido"));
    }
    socket.userId = decoded.id;
    next();
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    console.log("🔑 Token ricevuto:", token);
    if (!token) {
        console.warn("⚠️ Nessun token inviato");
        return next(new Error("Token mancante"));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        console.warn("⚠️ Token non valido");
        return next(new Error("Token non valido"));
    }
    socket.userId = decoded.id;
    next();
});

io.on('connection', (socket) => {
    console.log(`🔗 Utente connesso: ${socket.userId}`);

    // Aggiunge giocatore alla lobby
    lobbyPlayers.push({ userId: socket.userId, socketId: socket.id });
    io.emit('lobbyUpdate', lobbyPlayers.map(p => p.userId));

    // Creazione stanza
    socket.on('createRoom', () => {
        const roomId = `room_${Date.now()}`;
        gameRooms[roomId] = { players: [socket.userId], boardStates: {} };
        socket.join(roomId);

        // Invia sia path che link completo
        const invitePath = `/game-lobby/${roomId}`;
        const inviteLink = `http://localhost:3000${invitePath}`;

        socket.emit('roomCreated', { roomId, inviteLink, invitePath });
        io.emit('lobbyUpdate', lobbyPlayers.map(p => p.userId));
    });



    // Unirsi a stanza
    socket.on('joinRoom', (roomId) => {
        const room = gameRooms[roomId];
        if (room && room.players.length < 2) {
            room.players.push(socket.userId);
            socket.join(roomId);
            io.to(roomId).emit('gameStart', { players: room.players });
        } else {
            socket.emit('error', 'Stanza piena o inesistente');
        }
    });

    // Gestione mosse di gioco
    socket.on('makeMove', ({ roomId, move }) => {
        if (gameRooms[roomId]) {
            socket.to(roomId).emit('opponentMove', move);
        }
    });

    // Disconnessione
    socket.on('disconnect', () => {
        console.log(`❌ Utente disconnesso: ${socket.userId}`);
        lobbyPlayers = lobbyPlayers.filter(p => p.socketId !== socket.id);

        for (const [roomId, room] of Object.entries(gameRooms)) {
            room.players = room.players.filter(p => p !== socket.userId);
            if (room.players.length === 0) delete gameRooms[roomId];
        }

        io.emit('lobbyUpdate', lobbyPlayers.map(p => p.userId));
    });
});

const PORT = process.env.LOBBY_PORT || 3000;
server.listen(PORT, () => {
    console.log(`🎮 Server lobby avviato sulla porta ${PORT}`);
});
