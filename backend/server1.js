require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});


const games = {};


io.use(async (socket, next) => {
    const tokenS1 = socket.handshake.auth?.tokenS1;
    if (!tokenS1) return next(new Error("tokenS1 mancante"));

    if (!process.env.JWT_S1_SECRET) {
        console.error("JWT_S1_SECRET non definito in .env");
        return next(new Error("Configurazione server errata"));
    }

    try {
        const decoded = jwt.verify(tokenS1, process.env.JWT_S1_SECRET);
        socket.user = decoded; // { id, username }
        return next();
    } catch (err) {
        console.error("Verifica tokenS1 fallita:", err.message);
        return next(new Error("tokenS1 non valido"));
    }
});

io.on("connection", (socket) => {
    console.log("Utente connesso:", socket.user.id);

    socket.on("joinRoom", async (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.size >= 2) {
            socket.emit("roomFull", "La stanza è già piena (2 giocatori).");
            return;
        }

        socket.join(roomId);
        console.log(`Utente ${socket.user.id} è entrato in ${roomId}`);

        if (!games[roomId]) games[roomId] = { players: {}, order: [], turn: null };

        let username = socket.user.username;

        games[roomId].players[socket.id] = {
            userId: socket.user.id,
            username,
            ready: false,
            shipsList: [],
            shipCells: new Set(),
            hitsReceived: new Set(),
            moves: new Set(),
        };

        if (!games[roomId].order.includes(socket.id)) games[roomId].order.push(socket.id);

        socket.to(roomId).emit("message", `Un nuovo utente si è unito alla stanza ${roomId}`);

        const updatedRoom = io.sockets.adapter.rooms.get(roomId);
        if (updatedRoom && updatedRoom.size === 2) {
            io.to(roomId).emit("bothConnected", { roomId, players: Array.from(updatedRoom) });
        }
    });

    // Il client invia l'intera flotta di navi: ships = array di navi, ogni nave è array di celle {r,c}
    socket.on("placeFleet", ({ roomId, ships }) => {
        const game = games[roomId];
        if (!game || !game.players[socket.id]) return;

        const shipsList = ships.map(shipArr =>
            shipArr.map(({ r, c }) => `${r},${c}`)
        );
        const shipCells = new Set(shipsList.flat());

        game.players[socket.id].shipsList = shipsList;
        game.players[socket.id].shipCells = shipCells;
    });

    socket.on("ready", ({ roomId }) => {
        const game = games[roomId];
        if (!game || !game.players[socket.id]) return;
        game.players[socket.id].ready = true;


        const playerIds = Object.keys(game.players);
        if (playerIds.length === 2 && playerIds.every(pid => game.players[pid].ready)) {

            // Primo turno al primo entrato (order[0])
            game.turn = game.order[0];

            io.to(roomId).emit("gameStart", {
                roomId,
                firstTurnSocketId: game.turn,
                players: game.order,
            });
        }
    });

    // Attacco
    socket.on("attack", ({ roomId, x, y }) => {
        const game = games[roomId];
        if (!game) return;

        const attackerId = socket.id;
        const defenderId = game.order.find(id => id !== attackerId);
        if (!defenderId) return;

        // Verifica turno
        if (game.turn !== attackerId) {
            socket.emit("errorMessage", "Non è il tuo turno.");
            return;
        }

        const attacker = game.players[attackerId];
        const defender = game.players[defenderId];
        if (!attacker || !defender) return;

        const cell = `${y},${x}`;
        if (attacker.moves.has(cell)) {
            socket.emit("moveIgnored", { x, y });
            return;
        }attacker.moves.add(cell);


        const hit = defender.shipCells.has(cell);
        let sunk = false;
        let sunkSize = 0;

        if (hit) {
            defender.hitsReceived.add(cell);
            // Verifica se è stata affondata una specifica nave
            const shipHit = defender.shipsList.find(shipArr => shipArr.includes(cell));
            if (shipHit && shipHit.every(c => defender.hitsReceived.has(c))) {
                sunk = true;
                sunkSize = shipHit.length;
            }
        }
        // Notifico ATTACCANTE
        socket.emit("opponentMove", { x, y, hit, sunk, sunkSize });

        // Notifico DIFENSORE
        io.to(defenderId).emit("attackResult", { x, y, hit, sunk, sunkSize });

        // -----Vittoria------//
        if (defender.hitsReceived.size >= defender.shipCells.size && defender.shipCells.size > 0) {
            io.to(roomId).emit("gameOver", { winner: attacker.username });
            delete games[roomId];
            return;
        }


        game.turn = defenderId;
        io.to(roomId).emit("turnChanged", { turnSocketId: game.turn });
    });


    socket.on("disconnect", () => {
        console.log(`Utente ${socket.user.id} disconnesso`);
        for (const roomId in games) {
            const game = games[roomId];
            if (!game.players[socket.id]) continue;

            const otherId = game.order.find(id => id !== socket.id);
            delete game.players[socket.id];
            io.to(roomId).emit("message", `Un giocatore si è disconnesso`);

            // Vittoria per forfeit
            if (otherId && game.players[otherId]) {
                io.to(roomId).emit("gameOver", { winner: otherId, forfeit: true });
            }
            delete games[roomId];
        }
    });
});

const PORT = process.env.GAME_PORT || 5001;
server.listen(PORT, () => {
    console.log(`Game server avviato sulla porta ${PORT}`);
});
