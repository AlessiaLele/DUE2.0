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

const AUTH_URL = process.env.AUTH_URL || "http://localhost:3000/api/auth";


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

        // 👇 recupero lo username dal DB
        let username = socket.user.username;


        games[roomId].players[socket.id] = {
            userId: socket.user.id,
            username,            // 👈 salvo anche username
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

    // Il client invia l'intera flotta: ships = array di navi, ogni nave è array di celle {r,c}
    // Esempio: [ [ {r:0,c:0},{r:0,c:1},{r:0,c:2} ], [ {r:4,c:4},{r:5,c:4} ], ... ]
    socket.on("placeFleet", ({ roomId, ships }) => {
        const game = games[roomId];
        if (!game || !game.players[socket.id]) return;

        // Salvo sia la lista navi (come array di array) sia l'insieme piatto di celle per check rapidi
        const shipsList = ships.map(shipArr =>
            shipArr.map(({ r, c }) => `${r},${c}`)
        );
        const shipCells = new Set(shipsList.flat());

        game.players[socket.id].shipsList = shipsList;
        game.players[socket.id].shipCells = shipCells;
    });

    // Il client segnala che è pronto (ha finito di piazzare / scaduto timer)
    socket.on("ready", ({ roomId }) => {
        const game = games[roomId];
        if (!game || !game.players[socket.id]) return;
        game.players[socket.id].ready = true;

        // Se entrambi ready -> start
        const playerIds = Object.keys(game.players);
        if (playerIds.length === 2 && playerIds.every(pid => game.players[pid].ready)) {
            // Primo turno al primo entrato (order[0])
            game.turn = game.order[0];

            // Comunico avvio e chi inizia
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

        // Turno valido?
        if (game.turn !== attackerId) {
            socket.emit("errorMessage", "Non è il tuo turno.");
            return;
        }

        const attacker = game.players[attackerId];
        const defender = game.players[defenderId];
        if (!attacker || !defender) return;

        const cell = `${y},${x}`; // NB: manteniamo convenzione r=y, c=x
        if (attacker.moves.has(cell)) {
            socket.emit("moveIgnored", { x, y });
            return;
        }attacker.moves.add(cell);


        const hit = defender.shipCells.has(cell);
        let sunk = false;
        let sunkSize = 0;

        if (hit) {
            defender.hitsReceived.add(cell);
            // Verifico se ho affondato una specifica nave
            const shipHit = defender.shipsList.find(shipArr => shipArr.includes(cell));
            if (shipHit && shipHit.every(c => defender.hitsReceived.has(c))) {
                sunk = true;
                sunkSize = shipHit.length;
            }
        }
        // Notifico ATTACCANTE: risultato sul campo nemico (per "marcare" la sua griglia enemy)
        socket.emit("opponentMove", { x, y, hit, sunk, sunkSize });

        // Notifico DIFENSORE: il colpo sul suo campo
        io.to(defenderId).emit("attackResult", { x, y, hit, sunk, sunkSize });

        // Win check (tutte le celle nave colpite)
        if (defender.hitsReceived.size >= defender.shipCells.size && defender.shipCells.size > 0) {
            io.to(roomId).emit("gameOver", { winner: attacker.username });
            delete games[roomId];
            return;
        }

        // Alternanza turni: passa all’altro indipendentemente dall’esito
        game.turn = defenderId;
        io.to(roomId).emit("turnChanged", { turnSocketId: game.turn });
    });

    // Disconnessione
    socket.on("disconnect", () => {
        console.log(`Utente ${socket.user.id} disconnesso`);
        for (const roomId in games) {
            const game = games[roomId];
            if (!game.players[socket.id]) continue;

            const otherId = game.order.find(id => id !== socket.id);
            delete game.players[socket.id];
            io.to(roomId).emit("message", `Un giocatore si è disconnesso`);

            // Vittoria per forfeit se resta un giocatore
            if (otherId && game.players[otherId]) {
                io.to(roomId).emit("gameOver", { winner: game.players[otherId].userId, forfeit: true });
            }
            delete games[roomId];
        }
    });
});

const PORT = process.env.GAME_PORT || 5001;
server.listen(PORT, () => {
    console.log(`Game server avviato sulla porta ${PORT}`);
});
