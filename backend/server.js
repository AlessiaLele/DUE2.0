// backend/server.js

require('dotenv').config();

const express  = require('express');

const http     = require('http');

const { Server } = require('socket.io');

const mongoose = require('mongoose');

const cors     = require('cors');

// Routes

const authRoutes  = require('./routes/auth');

const lobbyRoutes = require('./routes/lobby');

const app    = express();

const server = http.createServer(app);

const io     = new Server(server, {

    cors: { origin: '*' }

});

// Middlewares

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/lobby', lobbyRoutes);

// Connect to MongoDB

(async function connectDB() {

    try {

        await mongoose.connect(process.env.MONGO_URI, {

            useNewUrlParser: true,

            useUnifiedTopology: true

        });

        console.log('MongoDB connesso');

    } catch (err) {

        console.error('Errore connessione MongoDB:', err.message);

        process.exit(1);

    }

})();

// In-memory state

const lobbies = {};

io.on('connection', (socket) => {

    console.log('Client connesso:', socket.id);

    socket.on('create-lobby', async ({ name, username }) => {
        console.log(`🛠 create-lobby ricevuto da ${socket.id}:`, name, username);
        const Lobby = require('./models/Lobby');

        try {

            let lobby = await Lobby.findOne({ name });

            if (lobby) return socket.emit('error', { msg: 'Lobby già esistente' });

            // Save to DB

            lobby = new Lobby({ name, players: [username] });

            await lobby.save();

            // In-memory

            lobbies[name] = new Set([username]);

            socket.join(name);

            // Emit initial update

            const playersArray = Array.from(lobbies[name]);

            io.to(name).emit('lobby-update', { players: playersArray });

        } catch (err) {

            console.error(err);

            socket.emit('error', { msg: 'Errore creazione lobby' });

        }

    });

    socket.on('join-lobby', async ({ name, username }) => {
        console.log(`🚪 join-lobby ricevuto da ${socket.id}:`, name, username);
        const Lobby = require('./models/Lobby');

        try {

            const lobby = await Lobby.findOne({ name });

            if (!lobby) return socket.emit('error', { msg: 'Lobby non trovata' });

            // Update DB

            if (!lobby.players.includes(username)) {

                lobby.players.push(username);

                await lobby.save();

            }

            // In-memory

            if (!lobbies[name]) lobbies[name] = new Set();

            lobbies[name].add(username);

            socket.join(name);

            // Emit updated list

            const playersArray = Array.from(lobbies[name]);

            io.to(name).emit('lobby-update', { players: playersArray });

        } catch (err) {

            console.error(err);

            socket.emit('error', { msg: 'Errore join lobby' });

        }

    });

    socket.on('disconnect', () => {

        console.log('Client disconnesso:', socket.id);

    });

});

// Start server

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log(`Server avviato sulla porta ${PORT}`);

});


